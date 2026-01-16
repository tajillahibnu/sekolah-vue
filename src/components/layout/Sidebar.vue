<script setup>
import { ref, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useLayoutStore } from '../../stores/layout';
import api from '../../services/api';
import ConfirmModal from '../ui/ConfirmModal.vue';
import * as HeroIcons from '@heroicons/vue/24/outline';

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
        menuItems.value = roleMenu ? roleMenu.items : [];
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
</script>

<template>
    <!-- Mobile Backdrop -->
    <div v-if="layoutStore.isSidebarOpen"
        class="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden transition-opacity"
        @click="layoutStore.closeSidebar()"></div>

    <!-- Sidebar Container -->
    <aside
        class="bg-base-100 flex flex-col fixed left-0 top-16 bottom-0 transition-all duration-300 z-40 border-r border-base-200 overflow-visible shadow-lg"
        :class="[
            layoutStore.isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
            layoutStore.isSidebarCollapsed ? 'w-20' : 'w-64'
        ]">
        <!-- User Profile Section -->
        <div class="px-6 py-6 flex items-center gap-3 border-b border-base-200"
            :class="{ 'justify-center px-4': layoutStore.isSidebarCollapsed }">
            <div class="relative">
                <div
                    class="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                    {{ user?.name?.charAt(0) || 'U' }}
                </div>
                <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-base-100">
                </div>
            </div>
            <div class="flex-1 min-w-0" :class="{ 'hidden': layoutStore.isSidebarCollapsed }">
                <p class="text-sm font-semibold text-base-content truncate">{{ user?.name }}</p>
                <p class="text-xs text-base-content/60 truncate">{{ activeRole?.name }}</p>
            </div>
        </div>

        <!-- Balance/Wallet Section (for Students & Teachers) -->
        <div v-if="!layoutStore.isSidebarCollapsed && (activeRole?.id === 'guru' || activeRole?.id === 'siswa')"
            class="px-4 py-4 border-b border-base-200">
            <div class="bg-primary/5 rounded-xl p-4 space-y-3 border border-primary/10">
                <!-- Balance Info -->
                <div class="space-y-2">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-medium text-base-content/70">
                            {{ activeRole?.id === 'siswa' ? 'Tabungan Siswa' : 'Saldo' }}
                        </span>
                        <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div class="flex items-baseline gap-1">
                        <span class="text-xs text-base-content/60">Rp</span>
                        <span class="text-xl font-bold text-base-content">
                            {{ activeRole?.id === 'siswa' ? '125.500' : '2.450.000' }}
                        </span>
                    </div>
                </div>

                <!-- Quick Action Button -->
                <button
                    class="w-full bg-base-200 hover:bg-base-300 text-primary font-medium text-xs py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    {{ activeRole?.id === 'siswa' ? 'Setor Tabungan' : 'Top Up' }}
                </button>
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
                            class="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-base-content/70 hover:bg-base-200 hover:text-base-content transition-all duration-200"
                            :class="{ 'justify-center': layoutStore.isSidebarCollapsed }"
                            active-class="bg-primary/10 text-primary font-medium" :title="item.label">
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
                                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base-content/70 hover:bg-base-200 hover:text-base-content cursor-pointer list-none transition-all duration-200">
                                <component :is="IconComponent(item.icon)" class="w-5 h-5 shrink-0" />
                                <span class="text-sm font-medium flex-1 truncate">{{ item.label }}</span>
                                <svg class="w-4 h-4 transition-transform group-open:rotate-180" fill="none"
                                    stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M19 9l-7 7-7-7" />
                                </svg>
                            </summary>
                            <ul class="mt-1 ml-8 space-y-1">
                                <li v-for="(child, cIndex) in item.children" :key="cIndex">
                                    <router-link :to="child.to"
                                        class="block px-3 py-2 text-sm text-base-content/60 hover:text-base-content rounded-md hover:bg-base-200 transition-colors"
                                        active-class="text-primary font-medium bg-primary/5" :title="child.label">
                                        {{ child.label }}
                                    </router-link>
                                </li>
                            </ul>
                        </details>

                        <!-- Collapsed Sidebar - Icon Only -->
                        <button v-else
                            class="w-full flex items-center justify-center px-3 py-2.5 rounded-lg text-base-content/70 hover:bg-base-200 hover:text-base-content transition-all duration-200"
                            :class="{ 'bg-base-200': hoveredItem === item }">
                            <component :is="IconComponent(item.icon)" class="w-5 h-5" />
                        </button>
                    </template>
                </li>
            </ul>
        </nav>

        <!-- Footer Actions -->
        <div class="border-t border-base-200 p-3 flex"
            :class="layoutStore.isSidebarCollapsed ? 'flex-col space-y-2' : 'flex-row gap-2'">
            <!-- Collapse Toggle -->
            <button @click="layoutStore.toggleCollapse()"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base-content/60 hover:bg-base-200 hover:text-base-content transition-all duration-200 group"
                :class="layoutStore.isSidebarCollapsed ? 'justify-center' : 'flex-1'"
                :title="layoutStore.isSidebarCollapsed ? 'Expand' : 'Collapse'">
                <component
                    :is="IconComponent(layoutStore.isSidebarCollapsed ? 'ChevronDoubleRightIcon' : 'ChevronDoubleLeftIcon')"
                    class="w-5 h-5 shrink-0" />
                <span class="text-sm" :class="{ 'hidden': layoutStore.isSidebarCollapsed }">Collapse</span>
            </button>

            <!-- Logout -->
            <button @click="showLogoutConfirm = true"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-error hover:bg-error/10 transition-all duration-200"
                :class="layoutStore.isSidebarCollapsed ? 'justify-center' : 'flex-1'" :title="'Logout'">
                <component :is="IconComponent('ArrowRightOnRectangleIcon')" class="w-5 h-5 shrink-0" />
                <span class="text-sm font-medium" :class="{ 'hidden': layoutStore.isSidebarCollapsed }">Logout</span>
            </button>
        </div>

        <!-- Teleported Flyout Menu for Collapsed Sidebar -->
        <Teleport to="body">
            <div v-if="hoveredItem && layoutStore.isSidebarCollapsed"
                class="fixed z-[60] bg-base-100 shadow-xl border border-base-200 rounded-xl p-2 w-56"
                :style="{ top: flyoutPosition.top + 'px', left: flyoutPosition.left + 8 + 'px' }"
                @mouseenter="handleFlyoutEnter" @mouseleave="handleFlyoutLeave">
                <div
                    class="px-3 py-2 text-xs font-semibold text-base-content/50 uppercase tracking-wider border-b border-base-200 mb-1">
                    {{ hoveredItem.label }}
                </div>
                <router-link v-for="(child, idx) in hoveredItem.children" :key="idx" :to="child.to"
                    class="block px-3 py-2 text-sm text-base-content/70 hover:bg-base-200 hover:text-base-content rounded-lg transition-colors"
                    active-class="bg-primary/10 text-primary font-medium" @click="hoveredItem = null">
                    {{ child.label }}
                </router-link>
            </div>
        </Teleport>

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
