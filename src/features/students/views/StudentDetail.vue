<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
    UserIcon,
    AcademicCapIcon,
    UsersIcon,
    TrophyIcon,
    ArrowLeftIcon,
    PencilIcon,
    EnvelopeIcon,
    PhoneIcon,
    MapPinIcon,
    CalendarIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon as XCircleOutline,
    ExclamationCircleIcon,
    FunnelIcon,
    DocumentTextIcon,
    ChevronDownIcon,
    CheckIcon
} from '@heroicons/vue/24/outline'
import Button from '@/components/ui/button/Button.vue'
import Skeleton from '@/components/ui/skeleton/Skeleton.vue'
import api from '@/services/api'
import { useAttendanceStore } from '@/features/attendance/stores/attendanceStore';

const route = useRoute()
const router = useRouter()
const attendanceStore = useAttendanceStore();

const student = ref(null)
const loading = ref(true)
const activeTab = ref('profile'); // 'profile', 'daily', 'kbm'

// Filter States
const selectedYear = ref('2024/2025');
const yearOptions = ['2024/2025', '2023/2024', '2022/2023'];
const showYearDropdown = ref(false);

const fetchStudent = async () => {
    loading.value = true
    try {
        const id = route.params.id
        // Artificial delay for demo
        await new Promise(resolve => setTimeout(resolve, 800))
        const response = await api.get('/students')
        const data = response.data.data || response.data
        student.value = data.find(s => s.id == id)
    } catch (error) {
        console.error('Failed to fetch student', error)
    } finally {
        loading.value = false
    }
}

const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric'
    })
}

const calculateAge = (birthDate) => {
    if (!birthDate) return '-'
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--
    }
    return `${age} tahun`
}

// --- Mock Data for History ---

// Mock Daily Stats based on Year
const dailyStats = computed(() => {
    // Randomize based on year for demo effect
    const seed = selectedYear.value === '2024/2025' ? 1 : 0.8;
    return {
        present: Math.floor(140 * seed),
        sick: Math.floor(3 * seed),
        permission: Math.floor(2 * seed),
        alpha: Math.floor(1 * seed),
        attendanceRate: 98
    };
});

// Mock Monthly History
const historyMonths = computed(() => {
    const months = ['Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni'];
    return months.map((m, idx) => ({
        name: m,
        present: Math.floor(20 + Math.random() * 2),
        sick: Math.random() > 0.8 ? 1 : 0,
        permission: Math.random() > 0.9 ? 1 : 0,
        alpha: 0
    }));
});

// Mock KBM Data
const kbmSubjects = computed(() => {
    const subjects = ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'B. Indonesia', 'B. Inggris', 'PKN', 'Sejarah'];
    return subjects.map(sub => {
        const total = 32;
        const present = Math.floor(total - (Math.random() * 3));
        return {
            name: sub,
            total,
            present,
            percent: Math.round((present / total) * 100)
        }
    });
});

// Expanded Month State for Accordion
const expandedMonth = ref(null);

// Generate Mock Daily Logs for a specific month
const getDailyLogsForMonth = (monthName) => {
    // Determine month index (0-11)
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const monthIndex = months.indexOf(monthName);

    // Generate ~20 school days
    const logs = [];
    const days = 22;

    for (let i = 1; i <= days; i++) {
        // Random Status
        const rand = Math.random();
        let status = 'Hadir';
        let timeIn = `06:${45 + Math.floor(Math.random() * 15)}`;
        let timeOut = `14:${Math.floor(Math.random() * 30)}`;
        let note = '-';
        let proof = null;

        if (rand > 0.9) {
            status = 'Sakit';
            timeIn = '-';
            timeOut = '-';
            note = 'Demam tinggi';
            proof = 'https://via.placeholder.com/400x600?text=Surat+Sakit';
        } else if (rand > 0.85) {
            status = 'Izin';
            timeIn = '-';
            timeOut = '-';
            note = 'Acara Keluarga';
            proof = 'https://via.placeholder.com/400x600?text=Surat+Izin';
        } else if (rand > 0.83) {
            status = 'Alpha';
            timeIn = '-';
            timeOut = '-';
        }

        logs.push({
            date: `2024-${(monthIndex + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`,
            displayDate: `${i} ${monthName} 2024`,
            status,
            timeIn,
            timeOut,
            note,
            proof
        });
    }

    // Sort descending by date
    return logs.reverse();
};

const toggleMonth = (monthName) => {
    if (expandedMonth.value === monthName) {
        expandedMonth.value = null;
    } else {
        expandedMonth.value = monthName;
    }
};

const showProofModal = ref(false);
const selectedProofUrl = ref('');

const openProof = (url) => {
    selectedProofUrl.value = url;
    showProofModal.value = true;
};

const kbmViewMode = ref('subject'); // 'subject' | 'day'
const selectedSubject = ref(null); // For modal

const openSubjectDetail = (subject) => {
    selectedSubject.value = subject;
};

// Helpers for Style
const getStatusColorClass = (percent) => {
    if (percent >= 90) return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    if (percent >= 75) return 'bg-blue-50 text-blue-700 border-blue-100';
    return 'bg-rose-50 text-rose-700 border-rose-100';
};

const getProgressColor = (percent) => {
    if (percent >= 90) return 'bg-emerald-500';
    if (percent >= 75) return 'bg-blue-500';
    return 'bg-rose-500';
};

const getTimelineStatusColor = (status) => {
    switch (status) {
        case 'Hadir': return 'bg-emerald-500';
        case 'Telat': return 'bg-amber-500';
        case 'Alpha': return 'bg-rose-500';
        case 'Sakit': return 'bg-purple-500';
        case 'Izin': return 'bg-blue-500';
        default: return 'bg-slate-300';
    }
};

const getTimelineBadgeColor = (status) => {
    switch (status) {
        case 'Hadir': return 'bg-emerald-50 text-emerald-700';
        case 'Telat': return 'bg-amber-50 text-amber-700';
        case 'Alpha': return 'bg-rose-50 text-rose-700';
        case 'Sakit': return 'bg-purple-50 text-purple-700';
        case 'Izin': return 'bg-blue-50 text-blue-700';
        default: return 'bg-slate-50 text-slate-500';
    }
};

// Mock Data Generators using Loop for realistic feel
const getSubjectHistory = (subjectName) => {
    // Generate ~15 meetings
    const history = [];
    const topics = [
        'Pengantar Bab 1', 'Latihan Soal', 'Quiz 1',
        'Pembahasan Quiz', 'Materi Bab 2', 'Praktikum',
        'Ujian Tengah Semester', 'Remedial', 'Project Group',
        'Presentasi', 'Review Materi', 'Final Project'
    ];

    for (let i = 0; i < 12; i++) {
        const rand = Math.random();
        let status = 'Hadir';
        if (rand > 0.9) status = 'Sakit';
        else if (rand > 0.85) status = 'Alpha';

        history.push({
            day: (i * 2 + 1).toString(),
            month: 'OKT',
            date: `2024-10-${(i * 2 + 1)}`,
            time: '08:00 - 09:30',
            topic: topics[i] || `Materi pertemuan ke-${i + 1}`,
            status
        });
    }
    return history.reverse(); // Newest first
};

const getDaySchedule = () => {
    // Fixed schedule for "Today"
    return [
        { timeStart: '07:00', timeEnd: '08:30', subject: 'Matematika Wajib', teacher: 'Budi Santoso, S.Pd', status: 'Hadir', topic: 'Persamaan Linear' },
        { timeStart: '08:30', timeEnd: '10:00', subject: 'Bahasa Indonesia', teacher: 'Siti Aminah, M.Pd', status: 'Hadir', topic: 'Teks Eksposisi' },
        { timeStart: '10:15', timeEnd: '11:45', subject: 'Fisika', teacher: 'Dr. Rahmat Hidayat', status: 'Telat', topic: 'Hukum Newton' },
        { timeStart: '12:30', timeEnd: '14:00', subject: 'Kimia', teacher: 'Ratna Sari, S.Si', status: 'Hadir', topic: 'Ikatan Kimia' },
    ];
};

onMounted(() => {
    fetchStudent()
})
</script>

<template>
    <div class="space-y-8 pb-32">
        <!-- Main Header -->
        <div class="flex items-center gap-4">
            <button @click="router.back()"
                class="p-3 hover:bg-primary/5 rounded-2xl text-muted-foreground hover:text-primary transition-all active:scale-95 group">
                <ArrowLeftIcon class="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div class="space-y-1 flex-1">
                <h1 class="text-3xl font-black text-foreground tracking-tight">Detail Siswa</h1>
                <p class="text-sm font-bold uppercase tracking-widest text-muted-foreground/50">Profil Lengkap & Data
                    Akademik</p>
            </div>

            <!-- Quick Actions (Only on Profile) -->
            <div v-if="student && activeTab === 'profile'" class="hidden sm:block">
                <button @click="router.push(`/students`)"
                    class="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-2xl font-bold transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-primary/30">
                    <PencilIcon class="w-4 h-4" />
                    Edit Profil
                </button>
            </div>
        </div>

        <!-- Custom Tab Navigation -->
        <div
            class="bg-white border border-slate-100 p-1.5 rounded-2xl inline-flex gap-1 shadow-sm overflow-x-auto max-w-full">
            <button @click="activeTab = 'profile'"
                class="px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 whitespace-nowrap"
                :class="activeTab === 'profile' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'">
                <UserIcon class="w-4 h-4" />
                Profil Siswa
            </button>
            <button @click="activeTab = 'daily'"
                class="px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 whitespace-nowrap"
                :class="activeTab === 'daily' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'">
                <CalendarIcon class="w-4 h-4" />
                Absensi Harian
            </button>
            <button @click="activeTab = 'kbm'"
                class="px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 whitespace-nowrap"
                :class="activeTab === 'kbm' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'">
                <AcademicCapIcon class="w-4 h-4" />
                Absensi KBM
            </button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Skeleton class="h-64 rounded-[2rem]" />
            <div class="lg:col-span-2 space-y-6">
                <Skeleton class="h-40 rounded-[2rem]" />
                <Skeleton class="h-40 rounded-[2rem]" />
            </div>
        </div>

        <!-- TAB CONTENT: PROFILE -->
        <div v-if="!loading && activeTab === 'profile' && student"
            class="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <!-- Left Column: Profile Card -->
            <div
                class="lg:col-span-1 h-fit bg-background border border-primary/10 rounded-3xl shadow-xl shadow-primary/5 overflow-hidden sticky top-8">
                <!-- Header with gradient -->
                <div class="h-32 bg-gradient-to-br from-slate-100 via-slate-50 to-transparent relative">
                    <div
                        class="absolute -bottom-16 left-1/2 -translate-x-1/2 p-2 bg-background rounded-[2.5rem] shadow-xl shadow-primary/10">
                        <img :src="student.avatar || `https://ui-avatars.com/api/?name=${student.name}&background=random`"
                            class="w-32 h-32 rounded-[2rem] object-cover border-4 border-background" />
                    </div>
                </div>

                <!-- Profile Info -->
                <div class="pt-20 pb-8 px-6 flex flex-col items-center text-center">
                    <h2 class="text-2xl font-black text-foreground tracking-tight">{{ student.name }}</h2>
                    <p class="text-xs font-bold text-muted-foreground tracking-widest uppercase mt-1">
                        NIS: {{ student.nis }} • NISN: {{ student.nisn }}
                    </p>

                    <!-- Status Badge -->
                    <div class="mt-4">
                        <span
                            class="inline-flex items-center px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-wider border-2"
                            :class="student.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-50 text-slate-700 border-slate-200'">
                            {{ student.status === 'active' ? '● Aktif' : student.status }}
                        </span>
                    </div>

                    <!-- Quick Actions -->
                    <div class="w-full mt-6 grid grid-cols-2 gap-3">
                        <a :href="`mailto:${student.email}`"
                            class="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-2xl font-bold text-xs transition-all active:scale-95">
                            <EnvelopeIcon class="w-4 h-4" />
                            Email
                        </a>
                        <a :href="`tel:${student.phone}`"
                            class="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-2xl font-bold text-xs transition-all active:scale-95">
                            <PhoneIcon class="w-4 h-4" />
                            Telepon
                        </a>
                    </div>
                    <!-- Info Grid -->
                    <div class="w-full space-y-5 text-sm mt-8">
                        <div class="flex justify-between items-center p-3 bg-slate-50 rounded-2xl">
                            <span
                                class="text-muted-foreground font-bold text-[10px] uppercase tracking-widest">Kelas</span>
                            <span
                                class="font-black text-slate-700 bg-white border border-slate-100 px-3 py-1 rounded-xl shadow-sm">{{
                                    student.class }}</span>
                        </div>
                        <div class="flex justify-between items-center p-3 bg-slate-50 rounded-2xl">
                            <span
                                class="text-muted-foreground font-bold text-[10px] uppercase tracking-widest">Usia</span>
                            <span class="font-bold text-slate-700">{{ calculateAge(student.birthDate) }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Column: Details Sections -->
            <div class="lg:col-span-2 space-y-8">
                <!-- Personal Info -->
                <div
                    class="bg-background border border-primary/10 rounded-3xl shadow-xl shadow-primary/5 p-8 relative overflow-hidden">
                    <div class="flex items-center gap-4 mb-8 relative">
                        <div class="p-3 bg-blue-50 rounded-2xl shadow-sm">
                            <UserIcon class="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 class="text-xl font-black text-foreground tracking-tight">Informasi Pribadi</h3>
                            <p class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Data
                                Identitas Lengkap</p>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                        <div class="space-y-2 p-4 bg-slate-50/50 rounded-2xl">
                            <p class="text-[10px] font-black uppercase text-slate-400 tracking-wider">TTL</p>
                            <p class="font-bold">{{ student.birthPlace }}, {{ formatDate(student.birthDate) }}</p>
                        </div>
                        <div class="space-y-2 p-4 bg-slate-50/50 rounded-2xl">
                            <p class="text-[10px] font-black uppercase text-slate-400 tracking-wider">Email</p>
                            <p class="font-bold">{{ student.email }}</p>
                        </div>
                        <div class="md:col-span-2 space-y-2 p-4 bg-slate-50/50 rounded-2xl">
                            <p class="text-[10px] font-black uppercase text-slate-400 tracking-wider">Alamat</p>
                            <p class="font-bold">{{ student.address }}</p>
                        </div>
                    </div>
                </div>

                <!-- Academic & Parents (Simplified for brevity in this update) -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="bg-background border border-primary/10 rounded-3xl shadow-xl shadow-primary/5 p-8">
                        <div class="flex items-center gap-4 mb-6">
                            <div class="p-3 bg-emerald-50 rounded-2xl">
                                <AcademicCapIcon class="w-6 h-6 text-emerald-600" />
                            </div>
                            <h3 class="font-black text-lg">Akademik</h3>
                        </div>
                        <div class="space-y-4">
                            <div>
                                <p class="text-[10px] font-bold uppercase text-slate-400">Sekolah Asal</p>
                                <p class="font-bold">{{ student.academic?.previousSchool || '-' }}</p>
                            </div>
                            <div>
                                <p class="text-[10px] font-bold uppercase text-slate-400">Tgl Masuk</p>
                                <p class="font-bold">{{ formatDate(student.joinDate) }}</p>
                            </div>
                        </div>
                    </div>
                    <div class="bg-background border border-primary/10 rounded-3xl shadow-xl shadow-primary/5 p-8">
                        <div class="flex items-center gap-4 mb-6">
                            <div class="p-3 bg-purple-50 rounded-2xl">
                                <UsersIcon class="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 class="font-black text-lg">Orang Tua</h3>
                        </div>
                        <div class="space-y-4">
                            <div>
                                <p class="text-[10px] font-bold uppercase text-slate-400">Ayah</p>
                                <p class="font-bold">{{ student.parent?.father?.name || '-' }}</p>
                            </div>
                            <div>
                                <p class="text-[10px] font-bold uppercase text-slate-400">Ibu</p>
                                <p class="font-bold">{{ student.parent?.mother?.name || '-' }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- TAB CONTENT: DAILY ATTENDANCE -->
        <div v-if="!loading && activeTab === 'daily'"
            class="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">

            <!-- Filter Bar -->
            <div
                class="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-slate-100 rounded-3xl p-3 shadow-md">
                <div class="px-3 flex items-center gap-3">
                    <div class="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                        <CalendarIcon class="w-5 h-5" />
                    </div>
                    <div>
                        <h3 class="font-black text-slate-800">Riwayat Kehadiran</h3>
                        <p class="text-xs font-medium text-slate-400">Rekapitulasi absensi per tahun ajaran</p>
                    </div>
                </div>

                <div class="relative min-w-[200px]">
                    <button @click="showYearDropdown = !showYearDropdown"
                        class="w-full flex items-center justify-between px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-100 transition-all">
                        <span>Tahun: {{ selectedYear }}</span>
                        <ChevronDownIcon class="w-4 h-4 text-slate-400 transition-transform"
                            :class="{ 'rotate-180': showYearDropdown }" />
                    </button>
                    <div v-if="showYearDropdown"
                        class="absolute top-full right-0 mt-2 z-10 bg-white border border-slate-100 rounded-2xl shadow-xl p-2 w-full animate-in fade-in zoom-in-95">
                        <button v-for="yr in yearOptions" :key="yr" @click="selectedYear = yr; showYearDropdown = false"
                            class="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all hover:bg-slate-50"
                            :class="selectedYear === yr ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500'">
                            {{ yr }}
                            <CheckIcon v-if="selectedYear === yr" class="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <!-- Stats Overview -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                    class="bg-emerald-500 rounded-[2rem] p-6 text-white shadow-lg shadow-emerald-200 relative overflow-hidden">
                    <div class="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full blur-2xl"></div>
                    <p class="text-emerald-100 text-xs font-black uppercase tracking-widest mb-1">Total Hadir</p>
                    <h3 class="text-4xl font-black">{{ dailyStats.present }}</h3>
                    <p class="text-emerald-100 text-sm mt-2 font-medium">Hari efektif</p>
                </div>
                <div class="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm">
                    <p class="text-amber-500 text-xs font-black uppercase tracking-widest mb-1">Sakit</p>
                    <h3 class="text-3xl font-black text-slate-800">{{ dailyStats.sick }}</h3>
                    <p class="text-slate-400 text-xs mt-1">Hari dengan surat</p>
                </div>
                <div class="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm">
                    <p class="text-blue-500 text-xs font-black uppercase tracking-widest mb-1">Izin</p>
                    <h3 class="text-3xl font-black text-slate-800">{{ dailyStats.permission }}</h3>
                    <p class="text-slate-400 text-xs mt-1">Kepentingan lain</p>
                </div>
                <div class="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm">
                    <p class="text-rose-500 text-xs font-black uppercase tracking-widest mb-1">Alpha</p>
                    <h3 class="text-3xl font-black text-slate-800">{{ dailyStats.alpha }}</h3>
                    <p class="text-slate-400 text-xs mt-1">Tanpa keterangan</p>
                </div>
            </div>

            <!-- Monthly Breakdown List -->
            <div class="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50">
                <h3 class="font-black text-xl text-slate-800 mb-6">Rincian Bulanan</h3>
                <div class="space-y-4">
                    <div v-for="month in historyMonths" :key="month.name"
                        class="overflow-hidden rounded-2xl border transition-all"
                        :class="expandedMonth === month.name ? 'border-primary/20 bg-primary/[0.02]' : 'border-slate-100 bg-white hover:bg-slate-50'">

                        <!-- Header Row (Clickable) -->
                        <div @click="toggleMonth(month.name)"
                            class="flex items-center justify-between p-4 cursor-pointer select-none">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 rounded-xl flex items-center justify-center font-black transition-all"
                                    :class="expandedMonth === month.name ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' : 'bg-slate-100 text-slate-400 group-hover:bg-white'">
                                    {{ month.name.substring(0, 3) }}
                                </div>
                                <div>
                                    <span class="block font-bold text-slate-700 text-lg">{{ month.name }}</span>
                                    <span v-if="expandedMonth === month.name"
                                        class="text-xs font-medium text-emerald-600 animate-in fade-in">Menampilkan
                                        detail harian</span>
                                </div>
                            </div>
                            <div class="flex items-center gap-6">
                                <div class="text-center hidden sm:block">
                                    <span
                                        class="block text-[10px] font-black uppercase text-slate-400 tracking-wider">Hadir</span>
                                    <span class="font-black text-emerald-600">{{ month.present }}</span>
                                </div>
                                <div class="text-center hidden sm:block">
                                    <span
                                        class="block text-[10px] font-black uppercase text-slate-400 tracking-wider">S/I/A</span>
                                    <span class="font-bold text-slate-600">{{ month.sick + month.permission +
                                        month.alpha }}</span>
                                </div>
                                <ChevronDownIcon class="w-5 h-5 text-slate-400 transition-transform duration-300"
                                    :class="{ 'rotate-180': expandedMonth === month.name }" />
                            </div>
                        </div>

                        <!-- Daily Details (Collapsible) -->
                        <div v-if="expandedMonth === month.name"
                            class="border-t border-slate-200/60 animate-in slide-in-from-top-2 duration-200">
                            <div class="p-4 space-y-3">
                                <div v-for="(log, idx) in getDailyLogsForMonth(month.name)" :key="idx"
                                    class="flex flex-col sm:flex-row sm:items-center gap-4 p-3 rounded-xl bg-white border border-slate-100 hover:shadow-sm transition-all">

                                    <!-- Date & Status -->
                                    <div class="flex items-center justify-between sm:w-48 shrink-0">
                                        <div class="flex flex-col">
                                            <span class="font-bold text-slate-700 text-sm">{{ log.displayDate }}</span>
                                            <span
                                                class="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{{
                                                    new Date(log.date).toLocaleDateString('id-ID', { weekday: 'long' })
                                                }}</span>
                                        </div>
                                        <span
                                            class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ml-2"
                                            :class="{
                                                'bg-emerald-50 text-emerald-600 border-emerald-100': log.status === 'Hadir',
                                                'bg-amber-50 text-amber-600 border-amber-100': log.status === 'Sakit',
                                                'bg-blue-50 text-blue-600 border-blue-100': log.status === 'Izin',
                                                'bg-rose-50 text-rose-600 border-rose-100': log.status === 'Alpha'
                                            }">
                                            {{ log.status }}
                                        </span>
                                    </div>

                                    <!-- Time -->
                                    <div
                                        class="flex items-center gap-4 shrink-0 sm:border-l sm:border-r border-slate-100 sm:px-4">
                                        <div class="flex flex-col items-center w-16">
                                            <span class="text-[9px] font-black text-slate-400 uppercase">Masuk</span>
                                            <span class="font-bold text-slate-700 text-xs">{{ log.timeIn }}</span>
                                        </div>
                                        <div class="flex flex-col items-center w-16">
                                            <span class="text-[9px] font-black text-slate-400 uppercase">Pulang</span>
                                            <span class="font-bold text-slate-700 text-xs">{{ log.timeOut }}</span>
                                        </div>
                                    </div>

                                    <!-- Notes & Proof -->
                                    <div class="flex-1 flex items-center justify-between gap-4">
                                        <p class="text-xs font-medium text-slate-500 line-clamp-1 italic">
                                            <span v-if="log.note !== '-'">"{{ log.note }}"</span>
                                            <span v-else class="text-slate-300">-</span>
                                        </p>

                                        <button v-if="log.proof" @click.stop="openProof(log.proof)"
                                            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-[10px] font-bold border border-blue-100 shrink-0">
                                            <DocumentTextIcon class="w-3.5 h-3.5" />
                                            Lihat Bukti
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- TAB CONTENT: KBM ATTENDANCE -->
        <div v-if="!loading && activeTab === 'kbm'"
            class="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">

            <!-- KBM Header & Controls -->
            <div class="bg-white border border-slate-100 rounded-3xl p-4 shadow-md space-y-4">
                <div class="flex flex-col md:flex-row items-center justify-between gap-4">
                    <!-- Title -->
                    <div class="flex items-center gap-3 w-full md:w-auto">
                        <div class="p-2 bg-blue-50 rounded-xl text-blue-600">
                            <AcademicCapIcon class="w-5 h-5" />
                        </div>
                        <div>
                            <h3 class="font-black text-slate-800">Partisipasi KBM</h3>
                            <p class="text-xs font-medium text-slate-400">Monitoring Kegiatan Belajar</p>
                        </div>
                    </div>

                    <!-- View Toggle -->
                    <div class="bg-slate-100 p-1 rounded-xl flex items-center w-full md:w-auto">
                        <button @click="kbmViewMode = 'subject'"
                            class="flex-1 md:flex-none px-6 py-2 rounded-lg text-xs font-black transition-all"
                            :class="kbmViewMode === 'subject' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'">
                            Per Mapel
                        </button>
                        <button @click="kbmViewMode = 'day'"
                            class="flex-1 md:flex-none px-6 py-2 rounded-lg text-xs font-black transition-all"
                            :class="kbmViewMode === 'day' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'">
                            Per Hari
                        </button>
                    </div>
                </div>

                <!-- Filters Area -->
                <div class="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-4">
                    <!-- Academic Year (Common) -->
                    <div class="md:col-span-3">
                        <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Tahun
                            Ajaran</label>
                        <div class="relative">
                            <select v-model="selectedYear"
                                class="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                                <option v-for="yr in yearOptions" :key="yr" :value="yr">{{ yr }}</option>
                            </select>
                            <ChevronDownIcon
                                class="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>

                    <!-- Filters for 'Per Mapel' (Date Range) -->
                    <template v-if="kbmViewMode === 'subject'">
                        <div class="md:col-span-4">
                            <label
                                class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Dari
                                Tanggal</label>
                            <input type="date"
                                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                        </div>
                        <div class="md:col-span-4">
                            <label
                                class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Sampai
                                Tanggal</label>
                            <input type="date"
                                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                        </div>
                        <div class="md:col-span-1 flex items-end">
                            <button
                                class="w-full bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl transition-colors flex items-center justify-center">
                                <FunnelIcon class="w-5 h-5" />
                            </button>
                        </div>
                    </template>

                    <!-- Filters for 'Per Hari' (Single Date) -->
                    <template v-if="kbmViewMode === 'day'">
                        <div class="md:col-span-4">
                            <label
                                class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Tanggal</label>
                            <input type="date" value="2024-10-24"
                                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                        </div>
                        <div class="md:col-span-5 flex items-end">
                            <!-- Spacer or additional actions -->
                            <p class="text-xs text-slate-400 italic pb-3">Menampilkan jadwal untuk tanggal yang dipilih
                            </p>
                        </div>
                    </template>
                </div>
            </div>

            <!-- VIEW 1: BY SUBJECT (GRID) -->
            <div v-if="kbmViewMode === 'subject'" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Subject Cards -->
                <div v-for="subj in kbmSubjects" :key="subj.name" @click="openSubjectDetail(subj)"
                    class="bg-white border border-slate-100 rounded-[2rem] p-6 hover:shadow-lg transition-all relative overflow-hidden group cursor-pointer active:scale-[0.98]">

                    <div class="flex justify-between items-start mb-4">
                        <div class="flex items-center gap-3">
                            <div
                                class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                {{ subj.name.substring(0, 2) }}
                            </div>
                            <h4 class="font-black text-lg text-slate-800 group-hover:text-blue-600 transition-colors">{{
                                subj.name }}</h4>
                        </div>
                        <span class="px-3 py-1 rounded-lg text-xs font-black border transition-colors"
                            :class="getStatusColorClass(subj.percent)">
                            {{ subj.percent }}%
                        </span>
                    </div>

                    <!-- Progress Bar -->
                    <div class="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
                        <div class="h-full rounded-full transition-all duration-1000"
                            :class="getProgressColor(subj.percent)" :style="{ width: `${subj.percent}%` }"></div>
                    </div>

                    <div class="flex items-center justify-between text-xs font-bold text-slate-500">
                        <span class="flex items-center gap-1">
                            <CheckCircleIcon class="w-3.5 h-3.5 text-emerald-500" />
                            {{ subj.present }} Hadir
                        </span>
                        <span class="flex items-center gap-1">
                            <ExclamationCircleIcon class="w-3.5 h-3.5 text-rose-500" />
                            {{ subj.total - subj.present }} Alpha/Izin
                        </span>
                    </div>
                </div>
            </div>

            <!-- VIEW 2: BY DAY (TIMELINE) -->
            <div v-else class="space-y-6">


                <!-- Timeline Container -->
                <div
                    class="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-lg shadow-slate-200/50 relative overflow-hidden">
                    <!-- Decorative Line -->
                    <div class="absolute top-8 bottom-8 left-[3.25rem] w-0.5 bg-slate-100"></div>

                    <div class="space-y-8 relative">
                        <div v-for="(item, idx) in getDaySchedule()" :key="idx" class="flex gap-6 group">
                            <!-- Time Column -->
                            <div class="w-20 pt-1 flex flex-col items-end shrink-0 z-10">
                                <span class="font-black text-xs text-slate-800">{{ item.timeStart }}</span>
                                <span class="text-[10px] font-bold text-slate-400">{{ item.timeEnd }}</span>
                            </div>

                            <!-- Status Dot -->
                            <div class="relative pt-1.5 z-10">
                                <div class="w-4 h-4 rounded-full border-2 border-white shadow-sm transition-all group-hover:scale-125"
                                    :class="getTimelineStatusColor(item.status)"></div>
                            </div>

                            <!-- Card -->
                            <div
                                class="flex-1 bg-slate-50 border border-slate-100 rounded-2xl p-4 hover:shadow-md hover:bg-white hover:border-blue-100 transition-all">
                                <div class="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 class="font-black text-slate-800 text-sm mb-0.5">{{ item.subject }}</h4>
                                        <p class="text-xs font-medium text-slate-500 flex items-center gap-1">
                                            <UserIcon class="w-3 h-3" /> {{ item.teacher }}
                                        </p>
                                    </div>
                                    <span class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider"
                                        :class="getTimelineBadgeColor(item.status)">
                                        {{ item.status }}
                                    </span>
                                </div>

                                <!-- Topic / Note -->
                                <div v-if="item.topic" class="mt-3 pt-3 border-t border-slate-100/50">
                                    <p class="text-xs text-slate-600 block italic">"{{ item.topic }}"</p>
                                </div>
                            </div>
                        </div>

                        <!-- Break Item -->
                        <div class="flex gap-6 opacity-60">
                            <div class="w-20 flex flex-col items-end shrink-0"><span
                                    class="font-black text-xs text-slate-400">10:00</span></div>
                            <div class="relative pt-1.5 z-10">
                                <div class="w-4 h-4 rounded-full bg-slate-200 border-2 border-white"></div>
                            </div>
                            <div class="flex-1 py-1"><span
                                    class="text-xs font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-3 py-1 rounded-full">Istirahat</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>

    <!-- Subject Details Modal -->
    <div v-if="selectedSubject"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div
            class="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-8 zoom-in-95 duration-300">
            <!-- Modal Header -->
            <div
                class="p-6 pb-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center sticky top-0 z-10">
                <div class="flex items-center gap-4">
                    <div
                        class="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-black text-lg">
                        {{ selectedSubject.name.substring(0, 2) }}
                    </div>
                    <div>
                        <h3 class="font-black text-xl text-slate-800">{{ selectedSubject.name }}</h3>
                        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Detail Pertemuan</p>
                    </div>
                </div>
                <button @click="selectedSubject = null"
                    class="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                    <XCircleOutline class="w-6 h-6" />
                </button>
            </div>

            <!-- Modal Content (Scrollable) -->
            <div class="p-6 overflow-y-auto space-y-6">
                <!-- Stats Summary -->
                <div class="grid grid-cols-3 gap-4">
                    <div class="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
                        <h4 class="text-2xl font-black text-blue-700">{{ selectedSubject.total }}</h4>
                        <p class="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Total Sesi</p>
                    </div>
                    <div class="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
                        <h4 class="text-2xl font-black text-emerald-700">{{ selectedSubject.present }}</h4>
                        <p class="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Hadir</p>
                    </div>
                    <div class="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                        <h4 class="text-2xl font-black text-slate-700">{{ selectedSubject.percent }}%</h4>
                        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kehadiran</p>
                    </div>
                </div>

                <!-- Meeting History Table -->
                <div>
                    <h4 class="font-black text-sm text-slate-800 mb-4 px-1">Riwayat Pertemuan</h4>
                    <div class="space-y-3">
                        <div v-for="(meet, idx) in getSubjectHistory(selectedSubject.name)" :key="idx"
                            class="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all group">
                            <!-- Date Box -->
                            <div
                                class="w-14 items-center flex flex-col justify-center px-1 py-2 bg-slate-100 rounded-xl text-slate-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                                <span class="text-[10px] uppercase font-black">{{ meet.month }}</span>
                                <span class="text-lg font-black leading-none">{{ meet.day }}</span>
                            </div>

                            <div class="flex-1">
                                <p class="text-xs font-black text-slate-800 mb-0.5 line-clamp-1">Topik: {{ meet.topic }}
                                </p>
                                <p class="text-[10px] font-medium text-slate-400 flex items-center gap-2">
                                    <ClockIcon class="w-3 h-3" /> {{ meet.time }}
                                </p>
                            </div>

                            <span class="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider"
                                :class="getTimelineBadgeColor(meet.status)">
                                {{ meet.status }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
