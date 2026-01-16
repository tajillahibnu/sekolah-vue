<script setup>
import { computed, ref } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useLayoutStore } from '../../stores/layout'; // Import layout store
import { useRouter } from 'vue-router'; // Import useRouter
import { useTheme } from '../../composables/useTheme';
import { useSessionStore } from '../../stores/session';
import AcademicSessionModal from './AcademicSessionModal.vue';
import ConfirmModal from '../ui/ConfirmModal.vue';
import {
    Bars3Icon,
    BellIcon,
    UserCircleIcon,
    ExclamationTriangleIcon,
    ChevronDownIcon, // Replaced Bars3BottomLeftIcon
    AcademicCapIcon,
    CalendarIcon,
    ComputerDesktopIcon,
    SunIcon,
    MoonIcon,
    GlobeAltIcon,
    ArrowRightOnRectangleIcon,
    UserIcon,
    ShieldCheckIcon,
    UserGroupIcon,
    RectangleGroupIcon,
    HomeIcon
} from '@heroicons/vue/24/outline';

const authStore = useAuthStore();
const layoutStore = useLayoutStore();
const sessionStore = useSessionStore();
const router = useRouter();
const themeProps = useTheme();
const { theme, setTheme } = themeProps;

const showLogoutConfirm = ref(false);
const showSessionModal = ref(false);

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

// Role Color & Icon Mapping
const getRoleConfig = (roleId) => {
    const configs = {
        admin: { color: 'rose', icon: ShieldCheckIcon, desc: 'Akses penuh sistem' },
        guru: { color: 'emerald', icon: AcademicCapIcon, desc: 'Manajemen kelas & nilai' },
        siswa: { color: 'sky', icon: UserIcon, desc: 'Akses portal belajar' },
        kesiswaan: { color: 'amber', icon: UserGroupIcon, desc: 'Manajemen kesiswaan' },
        kurikulum: { color: 'indigo', icon: RectangleGroupIcon, desc: 'Manajemen kurikulum' },
        walikelas: { color: 'purple', icon: HomeIcon, desc: 'Manajemen wali kelas' }
    };
    return configs[roleId] || { color: 'slate', icon: UserIcon, desc: 'Akses dashboard' };
};

const handleRoleChange = (roleId) => {
    if (roleId === activeRole.value?.id) return;
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
        class="bg-background/80 backdrop-blur-md shadow-sm shadow-primary/5 fixed top-0 w-full h-16 z-50 px-6 flex items-center justify-between">
        <!-- Left: Logo & Toggle -->
        <div class="flex items-center gap-2 sm:gap-4 shrink-0">
            <!-- Mobile Toggle -->
            <button
                class="p-2 hover:bg-primary/5 hover:text-primary rounded-xl lg:hidden text-foreground transition-all"
                @click="layoutStore.toggleSidebar">
                <Bars3Icon class="w-6 h-6" />
            </button>

            <!-- Logo (Hidden on Mobile) -->
            <div class="hidden sm:flex items-center gap-2 text-primary font-bold text-lg tracking-tight">
                <div class="bg-indigo-50 p-2 rounded-xl shadow-sm border border-indigo-100/50">
                    <AcademicCapIcon class="w-6 h-6 text-indigo-600" />
                </div>
                <span>SKUL Dashboard</span>
            </div>

            <div class="w-px h-6 bg-primary/10 ml-1 hidden sm:block"></div>

            <!-- Academic Info Chip (Modern Minimalist & Responsive - Interactive) -->
            <button @click="showSessionModal = true"
                class="flex items-center gap-2 sm:gap-4 ml-2 sm:ml-6 px-3 sm:px-4 py-1.5 bg-primary/5 rounded-2xl border border-primary/10 transition-all hover:bg-primary/10 hover:border-primary/20 hover:shadow-sm active:scale-95 group">
                <div class="flex items-center gap-2">
                    <div class="p-1 sm:p-1.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <AcademicCapIcon class="w-3 sm:w-3.5 h-3 sm:h-3.5 text-primary" />
                    </div>
                    <div class="flex flex-col leading-none text-left">
                        <span
                            class="hidden sm:block text-[8px] font-bold text-muted-foreground uppercase tracking-wider">Tahun
                            Pelajaran</span>
                        <span class="text-[10px] sm:text-[11px] font-bold text-foreground">{{ sessionStore.academicYear
                            }}</span>
                    </div>
                </div>
                <div class="w-px h-4 sm:h-6 bg-primary/10"></div>
                <div class="flex items-center gap-2">
                    <div class="p-1 sm:p-1.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <CalendarIcon class="w-3 sm:w-3.5 h-3 sm:h-3.5 text-primary" />
                    </div>
                    <div class="flex flex-col leading-none text-left">
                        <span
                            class="hidden sm:block text-[8px] font-bold text-muted-foreground uppercase tracking-wider">Semester</span>
                        <span class="text-[10px] sm:text-[11px] font-bold text-foreground">{{ sessionStore.semester
                            }}</span>
                    </div>
                </div>
            </button>
        </div>

        <!-- Right: Actions -->
        <div class="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <!-- Back to Landing Page -->
            <router-link to="/"
                class="p-2 hover:bg-primary/5 rounded-xl text-muted-foreground hover:text-primary transition-all"
                title="Lihat Situs Publik">
                <GlobeAltIcon class="h-5 w-5" />
            </router-link>

            <div class="h-6 w-px bg-primary/10 mx-1 hidden sm:block"></div>

            <!-- Theme Switcher -->
            <div class="dropdown dropdown-end">
                <div tabindex="0" role="button"
                    class="p-2 hover:bg-primary/5 rounded-xl text-muted-foreground hover:text-primary transition-all">
                    <SunIcon v-if="theme === 'light'" class="h-5 w-5" />
                    <MoonIcon v-else-if="theme === 'dark'" class="h-5 w-5" />
                    <ComputerDesktopIcon v-else class="h-5 w-5" />
                </div>
                <ul tabindex="0"
                    class="dropdown-content z-[1] menu p-2 shadow-xl bg-background border border-primary/10 rounded-2xl w-40 mt-2">
                    <li><a @click="setTheme('light')"
                            class="rounded-lg px-4 py-2 hover:bg-primary/5 hover:text-primary text-sm font-medium transition-all"
                            :class="{ 'text-primary bg-primary/10': theme === 'light' }">
                            <SunIcon class="h-4 w-4" /> Light
                        </a></li>
                    <li><a @click="setTheme('dark')"
                            class="rounded-lg px-4 py-2 hover:bg-primary/5 hover:text-primary text-sm font-medium transition-all"
                            :class="{ 'text-primary bg-primary/10': theme === 'dark' }">
                            <MoonIcon class="h-4 w-4" /> Dark
                        </a></li>
                    <li><a @click="setTheme('system')"
                            class="rounded-lg px-4 py-2 hover:bg-primary/5 hover:text-primary text-sm font-medium transition-all"
                            :class="{ 'text-primary bg-primary/10': theme === 'system' }">
                            <ComputerDesktopIcon class="h-4 w-4" /> System
                        </a></li>
                </ul>
            </div>

            <!-- Notifications -->
            <button
                class="p-2 hover:bg-primary/5 rounded-xl text-muted-foreground hover:text-primary relative group transition-all">
                <BellIcon class="h-5 w-5" />
                <span
                    class="absolute top-2.5 right-2.5 w-2 h-2 bg-destructive rounded-full border-2 border-background"></span>
            </button>

            <!-- Profile Section -->
            <div class="dropdown dropdown-end ml-1">
                <div tabindex="0" role="button"
                    class="flex items-center gap-2 p-1 pl-1 pr-2 hover:bg-primary/5 rounded-full transition-all border border-transparent hover:border-primary/10">
                    <div class="w-8 h-8 rounded-full overflow-hidden ring-2 ring-background">
                        <img :src="user?.avatar || 'https://ui-avatars.com/api/?name=' + user?.name" alt="Avatar" />
                    </div>
                </div>
                <ul tabindex="0"
                    class="dropdown-content z-[1] menu p-2 shadow-xl bg-background border border-primary/10 rounded-2xl w-60 mt-2">
                    <li class="px-4 py-4 border-b border-primary/5 mb-1">
                        <div class="flex flex-col gap-0.5 p-0">
                            <span class="font-bold text-sm text-foreground truncate w-full">{{ user?.name }}</span>
                            <span class="text-xs text-muted-foreground truncate w-full">{{ user?.email }}</span>
                        </div>
                    </li>
                    <li class="mt-1">
                        <router-link to="/admin/profile"
                            class="rounded-lg px-4 py-2.5 hover:bg-primary/5 hover:text-primary text-sm font-medium transition-all">Profile
                            Settings</router-link>
                    </li>
                    <li><a
                            class="rounded-lg px-4 py-2.5 hover:bg-primary/5 hover:text-primary text-sm font-medium transition-all">Activity
                            Log</a></li>
                    <div class="divider h-px bg-primary/10 my-1"></div>
                    <li>
                        <a @click="showLogoutConfirm = true"
                            class="rounded-lg px-4 py-2.5 hover:bg-destructive/10 text-destructive text-sm font-bold transition-all">
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

        <!-- Academic Session Selection Modal -->
        <AcademicSessionModal :show="showSessionModal" @close="showSessionModal = false" />
    </header>
</template>
