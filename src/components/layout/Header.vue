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
    HomeIcon,
    CheckCircleIcon,
    InformationCircleIcon,
    ClipboardDocumentListIcon,
    Cog6ToothIcon
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

// --- Notification Logic ---
const activeTab = ref('system'); // system | logs
const selectedNotification = ref(null);

// Dummy Data
const systemNotifications = ref([
    {
        id: 1,
        title: 'Jadwal Pemeliharaan Sistem',
        summary: 'Sistem akan maintenance pada tanggal 25 Jan...',
        content: 'Sistem akan menjalani pemeliharaan terjadwal pada tanggal 25 Januari 2024 pukul 22:00 WIB hingga 26 Januari 2024 pukul 04:00 WIB. Selama periode ini, layanan tidak akan tersedia.',
        date: '23 Jan 2024',
        read: false,
        type: 'warning'
    },
    {
        id: 2,
        title: 'Update Versi 2.0',
        summary: 'Pembaruan fitur keamanan dan performa.',
        content: 'Kami telah merilis versi 2.0 dengan peningkatan keamanan dan optimasi database. Tidak ada tindakan yang diperlukan dari sisi pengguna.',
        date: '20 Jan 2024',
        read: true,
        type: 'info'
    }
]);

const logNotifications = ref([
    {
        id: 3,
        title: 'Perubahan Kurikulum',
        summary: 'Wakasek Kurikulum memperbarui data mapel.',
        content: 'Bpk. Ahmad (Wakasek Kurikulum) telah memperbarui struktur mata pelajaran untuk Kelas X. Silakan cek menu Manajemen Kurikulum untuk detail perubahan.',
        date: '2 jam yang lalu',
        read: false,
        type: 'log'
    },
    {
        id: 4,
        title: 'Input Nilai Rapor',
        summary: 'Guru Wali Kelas XII IPA 1 memfinalisasi nilai.',
        content: 'Bu Siti telah melakukan finalisasi nilai rapor semester ganjil untuk kelas XII IPA 1.',
        date: '5 jam yang lalu',
        read: true,
        type: 'log'
    },
    {
        id: 5,
        title: 'Mutasi Siswa',
        summary: 'Siswa baru ditambahkan ke Kelas XI IPS 2.',
        content: 'Siswa atas nama "Rudi Hartono" telah dimutasikan masuk ke Kelas XI IPS 2 oleh Admin TU.',
        date: 'Kemarin',
        read: true,
        type: 'log'
    }
]);

const notifications = computed(() => {
    return activeTab.value === 'system' ? systemNotifications.value : logNotifications.value;
});

const unreadCount = computed(() => {
    return systemNotifications.value.filter(n => !n.read).length + logNotifications.value.filter(n => !n.read).length;
});

const openNotification = (notif) => {
    selectedNotification.value = notif;
    if (!notif.read) {
        notif.read = true;
    }
    // Close dropdown is handled by DaisyUI structure usually, but we keep the modal separate
};

const markAllAsRead = () => {
    systemNotifications.value.forEach(n => n.read = true);
    logNotifications.value.forEach(n => n.read = true);
};

const closeDetail = () => {
    selectedNotification.value = null;
};
</script>

<template>
    <header
        class="bg-background/80 backdrop-blur-md shadow-sm shadow-primary/5 fixed top-0 w-full h-16 z-[60] px-6 flex items-center justify-between">
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
                    class="dropdown-content z-[100] menu p-2 shadow-xl bg-background border border-primary/10 rounded-2xl w-40 mt-2">
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
            <div class="dropdown dropdown-end">
                <button
                    class="p-2 hover:bg-primary/10 rounded-full text-muted-foreground hover:text-primary relative group transition-all duration-300">
                    <BellIcon class="h-6 w-6" />
                    <span v-if="unreadCount > 0"
                        class="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-background animate-pulse"></span>
                </button>

                <div tabindex="0"
                    class="dropdown-content z-[100] menu p-0 shadow-2xl bg-background/95 backdrop-blur-xl rounded-3xl w-[90vw] -right-[3.5rem] sm:right-0 fixed sm:absolute top-16 sm:top-auto sm:w-[26rem] mt-2 sm:mt-6 origin-top-right transition-all duration-200">

                    <!-- Header & Tabs -->
                    <div class="p-4">
                        <div class="flex items-center justify-between mb-4 px-1">
                            <h3 class="font-bold text-lg tracking-tight text-foreground">Notifications</h3>
                            <button v-if="unreadCount > 0"
                                class="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                                @click="markAllAsRead">
                                Mark all as read
                            </button>
                        </div>

                        <!-- Modern Segmented Tabs -->
                        <div class="flex bg-muted/50 p-1 rounded-xl relative">
                            <button
                                class="flex-1 py-1.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 z-10 flex items-center justify-center gap-2"
                                :class="activeTab === 'system' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground/80'"
                                @click="activeTab = 'system'">
                                <span>System</span>
                                <span v-if="systemNotifications.some(n => !n.read)"
                                    class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            </button>
                            <button
                                class="flex-1 py-1.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 z-10 flex items-center justify-center gap-2"
                                :class="activeTab === 'logs' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground/80'"
                                @click="activeTab = 'logs'">
                                <span>Logs & Updates</span>
                                <span v-if="logNotifications.some(n => !n.read)"
                                    class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                            </button>
                        </div>
                    </div>

                    <!-- Notification List -->
                    <ul
                        class="max-h-[22rem] overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent p-2">
                        <li v-if="notifications.length === 0"
                            class="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <div class="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                                <BellIcon class="w-6 h-6 opacity-30" />
                            </div>
                            <span class="text-sm font-medium">All caught up!</span>
                            <span class="text-xs opacity-60 mt-1">No new notifications at the moment.</span>
                        </li>

                        <li v-for="notif in notifications" :key="notif.id" class="mb-1 last:mb-0">
                            <a @click="openNotification(notif)"
                                class="flex flex-col p-3 rounded-2xl hover:bg-muted/50 transition-all gap-2 relative group cursor-pointer"
                                :class="{ 'bg-primary/5': !notif.read }">

                                <div class="flex justify-between items-start gap-3">
                                    <!-- Icon Container -->
                                    <div class="shrink-0 mt-0.5">
                                        <div class="w-8 h-8 rounded-full flex items-center justify-center" :class="{
                                            'bg-amber-100/80 text-amber-600': notif.type === 'warning',
                                            'bg-purple-100/80 text-purple-600': notif.type === 'log',
                                            'bg-blue-100/80 text-blue-600': notif.type === 'info' || notif.type === 'system'
                                        }">
                                            <component
                                                :is="notif.type === 'warning' ? ExclamationTriangleIcon : notif.type === 'log' ? ClipboardDocumentListIcon : InformationCircleIcon"
                                                class="w-4 h-4" />
                                        </div>
                                    </div>

                                    <!-- Content -->
                                    <div class="flex-1 min-w-0">
                                        <div class="flex items-start justify-between gap-2">
                                            <h4 class="text-sm font-semibold text-foreground leading-tight truncate pr-1"
                                                :class="{ 'font-bold': !notif.read }">
                                                {{ notif.title }}
                                            </h4>
                                            <span
                                                class="text-[10px] text-muted-foreground whitespace-nowrap pt-0.5 font-medium tracking-wide opacity-70">
                                                {{ notif.date }}
                                            </span>
                                        </div>
                                        <p
                                            class="text-xs text-muted-foreground/80 mt-1 line-clamp-2 leading-relaxed text-left">
                                            {{ notif.summary }}
                                        </p>
                                    </div>

                                    <!-- Unread Dot (Absolute) -->
                                    <div v-if="!notif.read"
                                        class="absolute top-[1.1rem] right-3 w-2 h-2 rounded-full bg-primary shadow-sm shadow-primary/30">
                                    </div>
                                </div>
                            </a>
                        </li>
                    </ul>

                    <!-- Footer -->
                    <div class="p-3 bg-muted/20 rounded-b-3xl">
                        <button
                            class="w-full py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1 group">
                            <span>View All Notifications</span>
                            <ChevronDownIcon class="w-3 h-3 group-hover:translate-y-0.5 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>

            <!-- Profile Section -->
            <div class="dropdown dropdown-end ml-1">
                <div tabindex="0" role="button"
                    class="flex items-center gap-2 p-1 pl-1 pr-2 hover:bg-primary/5 rounded-full transition-all border border-transparent hover:border-primary/10">
                    <div class="w-8 h-8 rounded-full overflow-hidden ring-2 ring-background">
                        <img :src="user?.avatar || 'https://ui-avatars.com/api/?name=' + user?.name" alt="Avatar" />
                    </div>
                </div>
                <ul tabindex="0"
                    class="dropdown-content z-[100] menu p-2 shadow-xl bg-background border border-primary/10 rounded-2xl w-60 mt-2">
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

        <!-- Notification Detail Modal -->
        <Teleport to="body">
            <dialog class="modal modal-bottom sm:modal-middle" :class="{ 'modal-open': selectedNotification }">
                <div class="modal-box">
                    <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                        @click="closeDetail">✕</button>
                    <template v-if="selectedNotification">
                        <div class="flex items-start gap-4 mb-4">
                            <div class="p-3 rounded-full bg-base-200 text-primary shrink-0">
                                <component
                                    :is="selectedNotification.type === 'warning' ? ExclamationTriangleIcon : selectedNotification.type === 'log' ? ClipboardDocumentListIcon : InformationCircleIcon"
                                    class="w-6 h-6"
                                    :class="selectedNotification.type === 'warning' ? 'text-amber-500' : selectedNotification.type === 'log' ? 'text-purple-500' : 'text-blue-500'" />
                            </div>
                            <div>
                                <h3 class="font-bold text-xl text-foreground">{{ selectedNotification.title }}</h3>
                                <p class="text-xs text-muted-foreground mt-1">{{ selectedNotification.date }} • {{
                                    selectedNotification.type === 'system' || selectedNotification.type === 'warning' ||
                                        selectedNotification.type === 'info' ? 'System Notification' : 'System Log' }}</p>
                            </div>
                        </div>
                        <div class="py-2 pl-1">
                            <p class="text-sm text-foreground/80 leading-7 whitespace-pre-line">{{
                                selectedNotification.content }}</p>
                        </div>
                        <div class="modal-action">
                            <button class="btn btn-primary" @click="closeDetail">Tutup</button>
                        </div>
                    </template>
                </div>
                <form method="dialog" class="modal-backdrop">
                    <button @click="closeDetail">close</button>
                </form>
            </dialog>
        </Teleport>
    </header>
</template>
