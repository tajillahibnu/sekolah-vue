<script setup>
import { computed, ref } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useLayoutStore } from '../../stores/layout'; // Import layout store
import { useRouter } from 'vue-router'; // Import useRouter
import { useTheme } from '../../composables/useTheme';
import ConfirmModal from '../ui/ConfirmModal.vue';
import {
    Bars3Icon,
    BellIcon,
    UserCircleIcon,
    ExclamationTriangleIcon,
    Bars3BottomLeftIcon,
    AcademicCapIcon,
    ComputerDesktopIcon,
    SunIcon,
    MoonIcon,
    GlobeAltIcon,
    ArrowRightOnRectangleIcon
} from '@heroicons/vue/24/outline';

const authStore = useAuthStore();
const layoutStore = useLayoutStore();
const router = useRouter(); // Initialize router
const { theme, setTheme } = useTheme();

const showLogoutConfirm = ref(false); // State for logout modal

const confirmLogout = () => {
    authStore.logout();
    showLogoutConfirm.value = false;
    router.push('/login');
};

const user = computed(() => authStore.user);
const activeRole = computed(() => authStore.activeRole);
const availableRoles = computed(() => authStore.user?.roles || []);

const showConfirmModal = ref(false);
const pendingRoleId = ref(null);

const handleRoleChange = (roleId) => {
    if (roleId === activeRole.value?.id) return; // No change
    pendingRoleId.value = roleId;
    showConfirmModal.value = true;
};

const confirmRoleSwitch = async () => {
    if (pendingRoleId.value) {
        showConfirmModal.value = false;
        // Auth store handles the loading splash
        await authStore.switchRole(pendingRoleId.value);
        pendingRoleId.value = null;
    }
};

const cancelRoleSwitch = () => {
    pendingRoleId.value = null;
    showConfirmModal.value = false;
};
</script>

<template>
    <header
        class="navbar bg-base-100 border-b border-base-200 shadow-sm fixed top-0 w-full h-16 z-50 px-4 justify-between">
        <!-- Left: Logo & Toggle -->
        <div class="flex items-center gap-4">
            <!-- Mobile Toggle -->
            <button class="btn btn-square btn-ghost lg:hidden" @click="layoutStore.toggleSidebar">
                <Bars3Icon class="w-6 h-6" />
            </button>

            <!-- Logo -->
            <div class="flex items-center gap-2 text-primary font-bold text-xl tracking-wider">
                <AcademicCapIcon class="w-8 h-8" />
                <span>SEKOLAH APP</span>
            </div>
        </div>

        <!-- Right: Actions -->
        <div class="flex items-center gap-2">
            <!-- Back to Landing Page -->
            <router-link to="/" class="btn btn-ghost btn-circle btn-sm sm:btn-md tip" title="Lihat Situs Publik">
                <GlobeAltIcon class="h-5 w-5" />
            </router-link>

            <div class="divider divider-horizontal mx-0 hidden sm:flex"></div>

            <!-- Role Switcher -->
            <div v-if="activeRole" class="dropdown dropdown-end hidden sm:flex">
                <div tabindex="0" role="button"
                    class="btn btn-ghost h-auto py-1.5 px-3 flex flex-col items-end gap-0.5 normal-case hover:bg-base-200">
                    <span class="text-[10px] font-bold uppercase tracking-wider opacity-50">Current Role</span>
                    <div class="flex items-center gap-1.5">
                        <span class="text-sm font-semibold">{{ activeRole.name }}</span>
                        <!-- ChevronDownIcon imported or use standard -->
                    </div>
                </div>
                <ul tabindex="0"
                    class="dropdown-content z-[1] menu p-2 shadow-xl bg-base-100 rounded-box w-52 mt-2 border border-base-200">
                    <li class="menu-title text-[10px] uppercase font-bold opacity-50 px-4 py-2">Switch Role</li>
                    <li v-for="role in availableRoles" :key="role.id">
                        <button @click="handleRoleChange(role.id)" class="flex justify-between items-center"
                            :class="{ 'active': role.id === activeRole.id }">
                            {{ role.name }}
                            <span v-if="role.id === activeRole.id" class="badge badge-xs badge-primary"></span>
                        </button>
                    </li>
                </ul>
            </div>

            <div class="divider divider-horizontal mx-0 hidden sm:flex"></div>

            <!-- Theme Switcher -->
            <div class="dropdown dropdown-end">
                <div tabindex="0" role="button" class="btn btn-ghost btn-circle btn-sm sm:btn-md">
                    <SunIcon v-if="theme === 'light'" class="h-5 w-5" />
                    <MoonIcon v-else-if="theme === 'dark'" class="h-5 w-5" />
                    <ComputerDesktopIcon v-else class="h-5 w-5" />
                </div>
                <ul tabindex="0"
                    class="dropdown-content z-[1] menu p-2 shadow-xl bg-base-100 rounded-box w-32 mt-2 border border-base-200">
                    <li><a @click="setTheme('light')" :class="{ 'active': theme === 'light' }">
                            <SunIcon class="h-4 w-4" /> Light
                        </a></li>
                    <li><a @click="setTheme('dark')" :class="{ 'active': theme === 'dark' }">
                            <MoonIcon class="h-4 w-4" /> Dark
                        </a></li>
                    <li><a @click="setTheme('system')" :class="{ 'active': theme === 'system' }">
                            <ComputerDesktopIcon class="h-4 w-4" /> System
                        </a></li>
                </ul>
            </div>

            <!-- Notifications -->
            <button class="btn btn-ghost btn-circle btn-sm sm:btn-md">
                <div class="indicator">
                    <BellIcon class="h-5 w-5" />
                    <span class="badge badge-xs badge-error indicator-item"></span>
                </div>
            </button>

            <!-- Profile Section -->
            <div class="dropdown dropdown-end">
                <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar border border-base-200">
                    <div class="w-8 sm:w-10 rounded-full">
                        <img :src="user?.avatar || 'https://ui-avatars.com/api/?name=' + user?.name" alt="Avatar" />
                    </div>
                </div>
                <ul tabindex="0"
                    class="dropdown-content z-[1] menu p-2 shadow-xl bg-base-100 rounded-box w-60 mt-2 border border-base-200">
                    <li class="px-4 py-3 border-b border-base-100 mb-1">
                        <div class="flex flex-col gap-0.5 p-0">
                            <span class="font-bold text-sm truncate w-full">{{ user?.name }}</span>
                            <span class="text-xs opacity-60 truncate w-full">{{ user?.email }}</span>
                        </div>
                    </li>
                    <li>
                        <router-link to="/admin/profile" class="py-2.5">Profile Settings</router-link>
                    </li>
                    <li><a class="py-2.5">Activity Log</a></li>
                    <div class="divider my-1"></div>
                    <li>
                        <a @click="showLogoutConfirm = true" class="text-error py-2.5 font-medium">
                            Logout
                        </a>
                    </li>
                </ul>
            </div>
        </div>

        <!-- Role Switch Confirmation Modal -->
        <Teleport to="body">
            <dialog class="modal modal-bottom sm:modal-middle" :class="{ 'modal-open': showConfirmModal }">
                <div class="modal-box">
                    <h3 class="font-bold text-lg">Konfirmasi Ganti Role</h3>
                    <p class="py-4">Apakah Anda yakin ingin mengganti role? Halaman akan dimuat ulang.</p>
                    <div class="modal-action">
                        <button class="btn" @click="showConfirmModal = false">Batal</button>
                        <button class="btn btn-primary" @click="confirmRoleSwitch">Ya, Ganti Role</button>
                    </div>
                </div>
                <form method="dialog" class="modal-backdrop">
                    <button @click="showConfirmModal = false">close</button>
                </form>
            </dialog>
        </Teleport>

        <!-- Logout Confirmation Modal -->
        <ConfirmModal :show="showLogoutConfirm" title="Confirm Logout" message="Are you sure you want to logout?"
            confirm-text="Logout" cancel-text="Cancel" type="error" @confirm="confirmLogout"
            @close="showLogoutConfirm = false" />
    </header>
</template>
