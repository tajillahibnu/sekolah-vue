<script setup>
import { ref, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useLayoutStore } from '../../stores/layout';
import api from '../../services/api';
import ConfirmModal from '../ui/ConfirmModal.vue';
import * as HeroIcons from '@heroicons/vue/24/outline'; // Import all to dynamic lookup or specific ones
import { CommandLineIcon, UsersIcon, KeyIcon } from '@heroicons/vue/24/outline'; // Fallback import approach for specific use

const IconComponent = (name) => {
    return HeroIcons[name] || HeroIcons['QuestionMarkCircleIcon'];
};

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const layoutStore = useLayoutStore();
const menuItems = ref([]);
const loading = ref(false);
const showLogoutConfirm = ref(false);

const user = computed(() => authStore.user);
const activeRole = computed(() => authStore.activeRole);

// Flyout State
const hoveredItem = ref(null);
const flyoutPosition = ref({ top: 0, left: 0 });
let hoverTimeout = null;

const handleMouseEnter = (event, item) => {
    if (!layoutStore.isSidebarCollapsed || !item.children) return;

    if (hoverTimeout) clearTimeout(hoverTimeout);
    m
    const rect = event.currentTarget.getBoundingClientRect();
    flyoutPosition.value = {
        top: rect.top,
        left: rect.right
    };
    hoveredItem.value = item;
};

const handleMouseLeave = () => {
    hoverTimeout = setTimeout(() => {
        hoveredItem.value = null;
    }, 200);
};

const handleFlyoutEnter = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
};

const handleFlyoutLeave = () => {
    handleMouseLeave();
};

const fetchMenu = async () => {
    loading.value = true;
    try {
        const response = await api.get('/menus');
        const roleMenu = response.data.find(m => m.role === authStore.activeRole?.id);
        const fetchedItems = roleMenu ? roleMenu.items : [];

        // Manual Injection of Application Management
        // Only if user has permissions to see it
        const appManagementDetails = {
            label: 'App Management',
            icon: 'CommandLineIcon',
            children: []
        };

        if (authStore.hasPermission('roles.manage') || authStore.activeRole?.id === 'admin') {
            appManagementDetails.children.push({
                label: 'Roles & Permissions',
                icon: 'UsersIcon',
                to: '/admin/app/roles'
            });
            appManagementDetails.children.push({
                label: 'Menu Management',
                icon: 'Bars3Icon',
                to: '/admin/app/menus'
            });
        }

        // Bulletin Menu Access (Available for almost all roles)
        menuItems.value = [...fetchedItems];
        
        const bulletinMenu = {
            label: 'Buletin Sekolah',
            icon: 'BookOpenIcon',
            children: [
                { label: 'Jelajah Buletin', to: '/admin/bulletins' },
                { label: 'Kontribusi Saya', to: '/admin/bulletins/my-bulletins' }
            ]
        };

        if (authStore.activeRole?.id === 'admin' || authStore.hasPermission('bulletin.verify')) {
            bulletinMenu.children.push({
                label: 'Verifikasi Konten',
                to: '/admin/bulletins/verify'
            });
        }

        menuItems.value.push(bulletinMenu);

        // Add more dynamic apps here if needed

        if (appManagementDetails.children.length > 0) {
            menuItems.value = [...menuItems.value, appManagementDetails];
        } else {
            // menuItems.value is already set
        }

    } catch (error) {
        console.error('Failed to fetch menus', error);
        menuItems.value = [];
    } finally {
        loading.value = false;
    }
};

// Check if menu item has an active child
const hasActiveChild = (item) => {
    if (!item.children) return false;
    return item.children.some(child => route.path === child.to);
};

watch(() => authStore.activeRole, () => fetchMenu(), { immediate: true });
watch(() => route.path, () => layoutStore.closeSidebar());

const confirmLogout = () => {
    authStore.logout();
    showLogoutConfirm.value = false;
    router.push('/login');
};

// Role Color & Icon Mapping
const getRoleConfig = (roleId) => {
    const configs = {
        admin: { color: 'rose', icon: 'ShieldCheckIcon', desc: 'Akses penuh sistem' },
        guru: { color: 'emerald', icon: 'AcademicCapIcon', desc: 'Manajemen kelas & nilai' },
        siswa: { color: 'sky', icon: 'UserIcon', desc: 'Akses portal belajar' },
        kesiswaan: { color: 'amber', icon: 'UserGroupIcon', desc: 'Manajemen kesiswaan' },
        kurikulum: { color: 'indigo', icon: 'RectangleGroupIcon', desc: 'Manajemen kurikulum' },
        walikelas: { color: 'purple', icon: 'HomeIcon', desc: 'Manajemen wali kelas' }
    };
    return configs[roleId] || { color: 'slate', icon: 'UserIcon', desc: 'Akses dashboard' };
};

// Role Switching Logic
const showRoleModal = ref(false);
const pendingRoleId = ref(null);
const isRoleSwitcherExpanded = ref(false);

const handleRoleChange = (roleId) => {
    if (roleId === activeRole.value?.id) return;
    pendingRoleId.value = roleId;
    showRoleModal.value = true;
};

const confirmRoleSwitch = async () => {
    if (pendingRoleId.value) {
        showRoleModal.value = false;
        await authStore.switchRole(pendingRoleId.value);
        pendingRoleId.value = null;
    }
};
</script>

<template>
    <!-- Mobile Backdrop -->
    <div v-if="layoutStore.isSidebarOpen"
        class="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden transition-opacity"
        @click="layoutStore.closeSidebar()"></div>

    <!-- Sidebar Container -->
    <aside
        class="bg-background/80 backdrop-blur-md flex flex-col fixed left-0 top-16 bottom-0 transition-all duration-300 z-40 shadow-xl shadow-primary/5 overflow-visible"
        :class="[
            layoutStore.isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
            layoutStore.isSidebarCollapsed ? 'w-20' : 'w-64'
        ]">
        <!-- User Profile Section -->
        <div class="px-6 py-6 flex items-center gap-3"
            :class="{ 'justify-center px-4': layoutStore.isSidebarCollapsed }">
            <div class="relative">
                <div
                    class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm shadow-sm">
                    {{ user?.name?.charAt(0) || 'U' }}
                </div>
                <div
                    class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background">
                </div>
            </div>
            <div class="flex-1 min-w-0" :class="{ 'hidden': layoutStore.isSidebarCollapsed }">
                <p class="text-sm font-semibold text-foreground truncate">{{ user?.name }}</p>
                <p class="text-xs text-muted-foreground truncate">{{ activeRole?.name }}</p>
            </div>
        </div>

        <!-- Balance Info (Guru/Siswa Only - Minimalist) -->
        <div v-if="!layoutStore.isSidebarCollapsed && (activeRole?.id === 'guru' || activeRole?.id === 'siswa')"
            class="px-4 py-2">
            <div class="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100/50">
                <div class="flex items-center justify-between mb-1">
                    <span class="text-[9px] font-bold uppercase tracking-widest text-indigo-600/70">
                        {{ activeRole?.id === 'siswa' ? 'Tabungan Siswa' : 'Saldo Pegawai' }}
                    </span>
                    <component :is="IconComponent('WalletIcon')" class="w-3.5 h-3.5 text-indigo-500" />
                </div>
                <div class="flex items-baseline gap-1">
                    <span class="text-xs font-bold text-indigo-600">Rp</span>
                    <span class="text-xl font-black text-indigo-900 tracking-tight">
                        {{ activeRole?.id === 'siswa' ? '125.500' : '2.450.000' }}
                    </span>
                </div>
            </div>
        </div>

        <!-- Navigation Menu -->
        <nav class="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3">
            <ul class="space-y-1">
                <li v-for="(item, index) in menuItems" :key="index" @mouseenter="(e) => handleMouseEnter(e, item)"
                    @mouseleave="handleMouseLeave">
                    <!-- Single Item -->
                    <template v-if="!item.children">
                        <router-link :to="item.to"
                            class="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all duration-200"
                            :class="{ 'justify-center': layoutStore.isSidebarCollapsed }"
                            active-class="bg-primary/10 text-primary font-semibold" :title="item.label">
                            <component :is="IconComponent(item.icon)" class="w-5 h-5 shrink-0" />
                            <span class="text-sm truncate" :class="{ 'hidden': layoutStore.isSidebarCollapsed }">
                                {{ item.label }}
                            </span>
                        </router-link>
                    </template>

                    <!-- Parent Item with Children -->
                    <template v-else>
                        <!-- Expanded Sidebar -->
                        <details :open="hasActiveChild(item)" v-if="!layoutStore.isSidebarCollapsed" class="group">
                            <summary
                                class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-primary/5 hover:text-primary cursor-pointer list-none transition-all duration-200">
                                <component :is="IconComponent(item.icon)" class="w-5 h-5 shrink-0" />
                                <span class="text-sm font-semibold flex-1 truncate">{{ item.label }}</span>
                                <component :is="IconComponent('ChevronDownIcon')"
                                    class="w-4 h-4 transition-transform group-open:rotate-180" />
                            </summary>
                            <ul class="mt-1 ml-4 border-l border-primary/10 pl-4 space-y-1">
                                <li v-for="(child, cIndex) in item.children" :key="cIndex">
                                    <router-link :to="child.to"
                                        class="block px-3 py-2 text-sm text-muted-foreground hover:text-primary rounded-lg hover:bg-primary/5 transition-colors"
                                        active-class="text-primary font-semibold bg-primary/5" :title="child.label">
                                        {{ child.label }}
                                    </router-link>
                                </li>
                            </ul>
                        </details>

                        <!-- Collapsed Sidebar - Icon Only -->
                        <button v-else
                            class="w-full flex items-center justify-center px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all duration-200"
                            :class="{ 'bg-primary/5 text-primary': hoveredItem === item }">
                            <component :is="IconComponent(item.icon)" class="w-5 h-5" />
                        </button>
                    </template>
                </li>
            </ul>
        </nav>

        <!-- Role Switcher (Bottom Section - Expandable) -->
        <div v-if="!layoutStore.isSidebarCollapsed && user?.roles?.length > 1" class="px-3 pb-2">
            <div class="bg-primary/5 rounded-2xl p-1.5 border border-primary/10 transition-all duration-300">
                <!-- Trigger: Current Active Role -->
                <button @click="isRoleSwitcherExpanded = !isRoleSwitcherExpanded"
                    class="w-full flex items-center justify-between p-2 rounded-xl hover:bg-primary/5 transition-all group">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm transition-all duration-300 ring-4 ring-background"
                            :class="`bg-${getRoleConfig(activeRole?.id).color}-50 text-${getRoleConfig(activeRole?.id).color}-600`">
                            <component :is="IconComponent(getRoleConfig(activeRole?.id).icon)" class="w-4 h-4" />
                        </div>
                        <div class="flex flex-col items-start min-w-0">
                            <span
                                class="text-[9px] font-bold uppercase tracking-wider text-muted-foreground leading-none">Aktif</span>
                            <span class="text-sm font-bold text-foreground truncate w-full">{{ activeRole?.name
                            }}</span>
                        </div>
                    </div>
                    <component :is="IconComponent('ChevronRightIcon')"
                        class="w-4 h-4 text-muted-foreground transition-transform duration-300"
                        :class="{ 'rotate-90 text-primary': isRoleSwitcherExpanded }" />
                </button>

                <!-- Expanded List: Other Roles -->
                <div v-if="isRoleSwitcherExpanded"
                    class="px-1 pt-1 pb-1 space-y-1 animate-in slide-in-from-top-2 duration-300">
                    <div class="h-px bg-primary/10 mx-2 my-2"></div>
                    <button v-for="role in user.roles.filter(r => r.id !== activeRole?.id)" :key="role.id"
                        @click="handleRoleChange(role.id)"
                        class="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-primary/5 group transition-all">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors shadow-sm"
                            :class="`bg-${getRoleConfig(role.id).color}-50 text-${getRoleConfig(role.id).color}-600`">
                            <component :is="IconComponent(getRoleConfig(role.id).icon)" class="w-4 h-4" />
                        </div>
                        <div class="flex flex-col items-start text-left min-w-0">
                            <span
                                class="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{{
                                    role.name }}</span>
                            <span class="text-[9px] text-muted-foreground truncate w-full">{{
                                getRoleConfig(role.id).desc
                            }}</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>

        <!-- Footer Actions -->
        <div class="p-3 flex" :class="layoutStore.isSidebarCollapsed ? 'flex-col space-y-2' : 'flex-row gap-2'">
            <!-- Collapse Toggle -->
            <button @click="layoutStore.toggleCollapse()"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all duration-200 group"
                :class="layoutStore.isSidebarCollapsed ? 'justify-center' : 'flex-1'"
                :title="layoutStore.isSidebarCollapsed ? 'Expand' : 'Collapse'">
                <component
                    :is="IconComponent(layoutStore.isSidebarCollapsed ? 'ChevronDoubleRightIcon' : 'ChevronDoubleLeftIcon')"
                    class="w-5 h-5 shrink-0" />
                <span class="text-sm" :class="{ 'hidden': layoutStore.isSidebarCollapsed }">Collapse</span>
            </button>

            <!-- Logout -->
            <button @click="showLogoutConfirm = true"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-destructive hover:bg-destructive/10 transition-all duration-200"
                :class="layoutStore.isSidebarCollapsed ? 'justify-center' : 'flex-1'" :title="'Logout'">
                <component :is="IconComponent('ArrowRightOnRectangleIcon')" class="w-5 h-5 shrink-0" />
                <span class="text-sm font-medium" :class="{ 'hidden': layoutStore.isSidebarCollapsed }">Logout</span>
            </button>
        </div>

        <!-- Teleported Flyout Menu for Collapsed Sidebar -->
        <Teleport to="body">
            <div v-if="hoveredItem && layoutStore.isSidebarCollapsed"
                class="fixed z-[60] bg-background shadow-xl border border-border rounded-2xl p-2 w-56"
                :style="{ top: flyoutPosition.top + 'px', left: flyoutPosition.left + 8 + 'px' }"
                @mouseenter="handleFlyoutEnter" @mouseleave="handleFlyoutLeave">
                <div
                    class="px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border mb-1">
                    {{ hoveredItem.label }}
                </div>
                <router-link v-for="(child, idx) in hoveredItem.children" :key="idx" :to="child.to"
                    class="block px-3 py-2 text-sm text-muted-foreground hover:bg-primary/5 hover:text-primary rounded-lg transition-colors"
                    active-class="bg-primary/10 text-primary font-semibold" @click="hoveredItem = null">
                    {{ child.label }}
                </router-link>
            </div>
        </Teleport>

        <!-- Role Switch Confirmation Modal -->
        <ConfirmModal :show="showRoleModal" title="Konfirmasi Ganti Role"
            message="Apakah Anda yakin ingin mengganti role? Halaman akan dimuat ulang untuk menyesuaikan akses Anda."
            confirm-text="Ya, Ganti Role" cancel-text="Batal" type="primary" @confirm="confirmRoleSwitch"
            @close="showRoleModal = false" />

        <!-- Logout Confirmation Modal -->
        <ConfirmModal :show="showLogoutConfirm" title="Confirm Logout" message="Are you sure you want to logout?"
            confirm-text="Logout" cancel-text="Cancel" type="error" @confirm="confirmLogout"
            @close="showLogoutConfirm = false" />
    </aside>
</template>

<style scoped>
/* Custom scrollbar for minimalist design */
.overflow-y-auto::-webkit-scrollbar {
    width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
    background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
    background: hsl(var(--bc) / 0.1);
    border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: hsl(var(--bc) / 0.2);
}
</style>
