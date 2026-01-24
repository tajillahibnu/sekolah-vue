<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useClassStore } from '@/stores/class';
import studentClassService from '@/services/studentClassService';
import api from '@/services/api';
import { useToast } from '@/composables/useToast';
import {
    ChevronLeftIcon,
    AcademicCapIcon,
    UserGroupIcon,
    UserIcon,
    ClockIcon,
    CalendarIcon,
    BuildingLibraryIcon,
    ArrowTrendingUpIcon
} from '@heroicons/vue/24/outline';
import {
    UserCircleIcon
} from '@heroicons/vue/24/solid';

const route = useRoute();
const router = useRouter();
const classStore = useClassStore();
const toast = useToast();

const classId = computed(() => parseInt(route.params.id));
const classDetail = ref(null);
const currentStudents = ref([]);
const studentHistory = ref([]);
const loading = ref(false);

const activeTab = ref('active-students'); // active-students, history

// Enhanced History View
const selectedYear = ref('');
const yearStats = ref(null);
const loadingStats = ref(false);

// Mock Teacher History
const teacherHistory = ref([
    { id: 1, name: 'Budi Santoso, S.Pd', academicYear: '2023/2024', status: 'Selesai' },
    { id: 2, name: 'Siti Aminah, M.Pd', academicYear: '2022/2023', status: 'Selesai' },
]);

onMounted(async () => {
    await loadData();
});

// Watch for route change to reload if ID changes (though unlikely component reuse this way)
watch(() => route.params.id, loadData);

async function loadData() {
    loading.value = true;
    try {
        if (!classId.value) return;

        // Fetch Class Detail
        // Try store first, then fetch
        let c = classStore.getClassById(classId.value);
        if (!c) {
            c = await classStore.fetchClassById(classId.value);
        }
        classDetail.value = c;

        // Fetch Current Students
        const studentsResp = await studentClassService.getClassStudents(classId.value);

        // Enrich student data with names (need API call or store usually, creating mock map for now if needed or assume service returns full obj)
        // Note: The service uses mock data which might store just IDs or objects. Assuming objects from previous file inspection.
        // Actually the mock data in service seems to reference `studentClassesData` which links studentId to classId.
        // We need student names. `studentClassService` returns raw assignments. We typically need to join with student list.
        // For this demo, let's fetch all students to map names (inefficient strictly but fine for demo).

        const allStudentsResp = await api.get('/students');
        const allStudents = allStudentsResp.data.data;

        currentStudents.value = studentsResp.data.map(assign => {
            const student = allStudents.find(s => s.id === assign.studentId);
            return {
                ...assign,
                studentName: student?.name || 'Unknown',
                studentNis: student?.nis || '-',
                studentGender: student?.gender || '-'
            };
        });

        // Fetch History
        const historyResp = await studentClassService.getClassHistory(classId.value);
        studentHistory.value = historyResp.data.map(assign => {
            const student = allStudents.find(s => s.id === assign.studentId);
            return {
                ...assign,
                studentName: student?.name || 'Unknown',
                academicYear: assign.academicYear
            };
        }).sort((a, b) => b.academicYear.localeCompare(a.academicYear));


    } catch (error) {
        console.error(error);
        toast.error('Gagal memuat data kelas');
    } finally {
        loading.value = false;
    }
}

const goBack = () => {
    router.back();
};

const capacityPercent = computed(() => {
    if (!classDetail.value) return 0;
    return Math.round((classDetail.value.currentStudents / classDetail.value.capacity) * 100);
});

// Group history by Academic Year
const historyByYear = computed(() => {
    const grouped = {};
    studentHistory.value.forEach(h => {
        if (!grouped[h.academicYear]) grouped[h.academicYear] = [];
        grouped[h.academicYear].push(h);
    });
    return grouped;
});

// Available years from history
const availableYears = computed(() => {
    const years = [...new Set(studentHistory.value.map(h => h.academicYear))];
    // Add current year if not in history
    if (classDetail.value && !years.includes(classDetail.value.academicYear)) {
        years.unshift(classDetail.value.academicYear);
    }
    return years.sort((a, b) => b.localeCompare(a)); // Descending order
});

// Fetch statistics for selected year
const fetchYearStats = async (year) => {
    if (!year || !classId.value) return;

    loadingStats.value = true;
    try {
        const response = await studentClassService.getClassStatsByYear(classId.value, year);
        yearStats.value = response.data;
    } catch (error) {
        console.error('Error fetching year stats:', error);
        toast.error('Gagal memuat statistik tahun ajaran');
    } finally {
        loadingStats.value = false;
    }
};

// Watch selectedYear to fetch stats
watch(selectedYear, (newYear) => {
    if (newYear) {
        fetchYearStats(newYear);
    }
});

// Watch availableYears to set default
watch(availableYears, (years) => {
    if (years.length > 0 && !selectedYear.value) {
        selectedYear.value = years[0]; // Default to most recent year
    }
}, { immediate: true });

</script>

<template>
    <div class="min-h-screen pb-20">
        <!-- Header / Nav -->
        <div class="mb-8">
            <button @click="goBack"
                class="flex items-center gap-2 text-muted-foreground hover:text-blue-600 transition-colors mb-4 font-medium text-sm group">
                <ChevronLeftIcon class="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Kembali ke Daftar Kelas
            </button>

            <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div class="space-y-2">
                    <span
                        class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[11px] font-black uppercase tracking-widest text-blue-600 border border-blue-100">
                        Detail Kelas
                    </span>
                    <h2 class="text-3xl font-black text-foreground tracking-tight" v-if="classDetail">
                        Kelas {{ classDetail.name }}
                    </h2>
                    <div v-else class="h-10 w-48 bg-slate-100 rounded-lg animate-pulse"></div>
                </div>
            </div>
        </div>

        <div v-if="!loading && classDetail" class="space-y-8">
            <!-- Info Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Main Info -->
                <div
                    class="md:col-span-2 bg-white rounded-[32px] p-6 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between relative overflow-hidden group">
                    <div
                        class="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-100/50 transition-colors duration-700">
                    </div>

                    <div class="relative z-10 flex items-start justify-between mb-6">
                        <div>
                            <p class="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Wali Kelas
                                Saat Ini</p>
                            <div class="flex items-center gap-4 mt-2">
                                <div
                                    class="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                                    <UserCircleIcon class="w-14 h-14" />
                                </div>
                                <div>
                                    <h3 class="text-xl font-black text-foreground">{{ classDetail.homeroomTeacher ||
                                        'Belum Ditentukan' }}</h3>
                                    <span class="text-sm font-medium text-muted-foreground">NIP. 19820312 200501 1
                                        002</span>
                                </div>
                            </div>
                        </div>
                        <div
                            class="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-black text-xs uppercase tracking-wide border border-emerald-100">
                            {{ classDetail.status === 'active' ? 'Aktif' : 'Tidak Aktif' }}
                        </div>
                    </div>

                    <div class="relative z-10 grid grid-cols-3 gap-4 border-t border-slate-100 pt-6">
                        <div>
                            <p class="text-xs text-muted-foreground font-bold uppercase mb-1">Tingkat</p>
                            <p class="text-lg font-black text-foreground">Grade {{ classDetail.grade }}</p>
                        </div>
                        <div>
                            <p class="text-xs text-muted-foreground font-bold uppercase mb-1">Tahun Ajar</p>
                            <p class="text-lg font-black text-foreground">{{ classDetail.academicYear }}</p>
                        </div>
                        <div>
                            <p class="text-xs text-muted-foreground font-bold uppercase mb-1">Jurusan</p>
                            <p class="text-lg font-black text-foreground">{{ classDetail.jurusan || '-' }}</p>
                        </div>
                    </div>
                </div>

                <!-- Stats / Capacity -->
                <div
                    class="bg-blue-600 rounded-[32px] p-6 text-white flex flex-col justify-between shadow-xl shadow-blue-600/20 relative overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700"></div>
                    <!-- Decorative circles -->
                    <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <div class="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-2xl -ml-10 -mb-10">
                    </div>

                    <div class="relative z-10">
                        <div class="flex items-center gap-2 mb-4 opacity-80">
                            <UserGroupIcon class="w-5 h-5" />
                            <span class="text-xs font-bold uppercase tracking-widest">Kapasitas Siswa</span>
                        </div>
                        <div class="flex items-end gap-2 mb-2">
                            <span class="text-5xl font-black">{{ classDetail.currentStudents }}</span>
                            <span class="text-lg font-medium opacity-70 mb-1.5">/ {{ classDetail.capacity }}</span>
                        </div>
                        <div class="w-full bg-black/20 rounded-full h-2 overflow-hidden mb-2">
                            <div class="bg-white h-full rounded-full transition-all duration-1000"
                                :style="{ width: `${capacityPercent}%` }"></div>
                        </div>
                        <p class="text-xs font-medium opacity-80">
                            {{ classDetail.capacity - classDetail.currentStudents }} kursi tersedia
                        </p>
                    </div>

                    <div class="relative z-10 mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
                        <div>
                            <p class="text-[10px] font-bold uppercase opacity-60">Rasio Pria/Wanita</p>
                            <p class="text-sm font-bold mt-0.5">12 L / 18 P</p> <!-- Mock Data -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- Content Tabs -->
            <div class="flex flex-col gap-6">
                <!-- Tab Switcher -->
                <div class="flex p-1 bg-slate-100 rounded-2xl w-fit">
                    <button @click="activeTab = 'active-students'"
                        class="px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300"
                        :class="activeTab === 'active-students' ? 'bg-white text-blue-600 shadow-sm' : 'text-muted-foreground hover:text-foreground'">
                        Siswa Aktif
                    </button>
                    <button @click="activeTab = 'history'"
                        class="px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300"
                        :class="activeTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-muted-foreground hover:text-foreground'">
                        Riwayat & Arsip
                    </button>
                </div>

                <!-- Active Students View -->
                <div v-if="activeTab === 'active-students'"
                    class="bg-white rounded-[32px] border border-slate-100 p-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead>
                                <tr class="border-b border-slate-100">
                                    <th
                                        class="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-muted-foreground">
                                        NIS</th>
                                    <th
                                        class="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-muted-foreground">
                                        Nama Siswa</th>
                                    <th
                                        class="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-muted-foreground">
                                        Jenis Kelamin</th>
                                    <th
                                        class="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-muted-foreground">
                                        Status</th>
                                    <th
                                        class="px-6 py-4 text-right text-xs font-black uppercase tracking-wider text-muted-foreground">
                                        Aksi</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-50">
                                <tr v-for="student in currentStudents" :key="student.id"
                                    class="group hover:bg-blue-50/50 transition-colors">
                                    <td
                                        class="px-6 py-4 whitespace-nowrap text-sm font-mono text-muted-foreground group-hover:text-blue-600 font-bold">
                                        {{ student.studentNis }}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="flex items-center gap-3">
                                            <div
                                                class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                {{ student.studentName.charAt(0) }}
                                            </div>
                                            <span class="text-sm font-bold text-foreground">{{ student.studentName
                                            }}</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-muted-foreground">
                                        {{ student.studentGender === 'L' ? 'Laki-laki' : 'Perempuan' }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span
                                            class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">Aktif</span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-right">
                                        <button
                                            class="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline">Detail</button>
                                    </td>
                                </tr>
                                <tr v-if="currentStudents.length === 0">
                                    <td colspan="5" class="px-6 py-12 text-center text-muted-foreground">
                                        Tidak ada siswa aktif di kelas ini.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- History View -->
                <div v-else class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    <!-- Year Selector -->
                    <div class="bg-white rounded-[32px] border border-slate-100 p-6">
                        <div class="flex items-center justify-between gap-4">
                            <div class="flex items-center gap-2">
                                <CalendarIcon class="w-5 h-5 text-blue-600" />
                                <h3 class="text-lg font-black text-foreground">Pilih Tahun Ajaran</h3>
                            </div>
                            <select v-model="selectedYear"
                                class="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                                <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
                            </select>
                        </div>
                    </div>

                    <!-- Loading State -->
                    <div v-if="loadingStats" class="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                        <div class="h-48 bg-slate-100 rounded-[32px]"></div>
                        <div class="h-48 bg-slate-100 rounded-[32px]"></div>
                        <div class="h-48 bg-slate-100 rounded-[32px]"></div>
                    </div>

                    <!-- Statistics Cards -->
                    <div v-else-if="yearStats" class="grid grid-cols-1 md:grid-cols-3 gap-6">

                        <!-- Homeroom Teacher Card -->
                        <div
                            class="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-[32px] border border-blue-200 p-6">
                            <div class="flex items-center gap-2 mb-4">
                                <UserIcon class="w-5 h-5 text-blue-600" />
                                <h4 class="text-sm font-black text-blue-900">Wali Kelas</h4>
                            </div>
                            <div class="flex items-center gap-4">
                                <div class="w-16 h-16 rounded-full bg-blue-200 flex items-center justify-center">
                                    <UserCircleIcon class="w-12 h-12 text-blue-600" />
                                </div>
                                <div class="flex-1">
                                    <p class="text-lg font-black text-blue-900">{{ yearStats.homeroomTeacher }}</p>
                                    <p class="text-xs text-blue-600 font-bold">{{ yearStats.academicYear }}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Attendance Card -->
                        <div
                            class="bg-gradient-to-br from-green-50 to-green-100/50 rounded-[32px] border border-green-200 p-6">
                            <div class="flex items-center gap-2 mb-4">
                                <ClockIcon class="w-5 h-5 text-green-600" />
                                <h4 class="text-sm font-black text-green-900">Statistik Absensi</h4>
                            </div>
                            <div class="space-y-2">
                                <div class="flex items-center justify-between">
                                    <span class="text-xs font-bold text-green-700">Hadir</span>
                                    <span class="text-sm font-black text-green-900">{{ yearStats.attendance.present
                                        }}</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-xs font-bold text-yellow-700">Sakit</span>
                                    <span class="text-sm font-black text-yellow-900">{{ yearStats.attendance.sick
                                        }}</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-xs font-bold text-blue-700">Izin</span>
                                    <span class="text-sm font-black text-blue-900">{{ yearStats.attendance.permission
                                        }}</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-xs font-bold text-red-700">Alpha</span>
                                    <span class="text-sm font-black text-red-900">{{ yearStats.attendance.alpha
                                        }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Grades Card -->
                        <div
                            class="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-[32px] border border-purple-200 p-6">
                            <div class="flex items-center gap-2 mb-4">
                                <ArrowTrendingUpIcon class="w-5 h-5 text-purple-600" />
                                <h4 class="text-sm font-black text-purple-900">Nilai Kelas</h4>
                            </div>
                            <div class="space-y-3">
                                <div class="text-center">
                                    <p class="text-3xl font-black text-purple-900">{{ yearStats.grades.average }}</p>
                                    <p class="text-xs text-purple-600 font-bold">Rata-rata</p>
                                </div>
                                <div class="flex items-center justify-between pt-3 border-t border-purple-200">
                                    <div class="text-center flex-1">
                                        <p class="text-lg font-black text-purple-700">{{ yearStats.grades.highest }}</p>
                                        <p class="text-[10px] text-purple-600 font-bold">Tertinggi</p>
                                    </div>
                                    <div class="w-px h-8 bg-purple-200"></div>
                                    <div class="text-center flex-1">
                                        <p class="text-lg font-black text-purple-700">{{ yearStats.grades.lowest }}</p>
                                        <p class="text-[10px] text-purple-600 font-bold">Terendah</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Detailed Attendance Table -->
                    <div v-if="yearStats && yearStats.students"
                        class="bg-white rounded-[32px] border border-slate-100 p-6">
                        <div class="flex items-center gap-2 mb-6">
                            <UserGroupIcon class="w-5 h-5 text-blue-600" />
                            <h3 class="text-lg font-black text-foreground">Detail Absensi Siswa</h3>
                        </div>

                        <div class="overflow-x-auto">
                            <table class="w-full">
                                <thead>
                                    <tr class="border-b border-slate-100">
                                        <th
                                            class="text-left py-3 px-4 text-xs font-black text-muted-foreground uppercase">
                                            Nama Siswa</th>
                                        <th
                                            class="text-center py-3 px-4 text-xs font-black text-muted-foreground uppercase">
                                            Hadir</th>
                                        <th
                                            class="text-center py-3 px-4 text-xs font-black text-muted-foreground uppercase">
                                            Sakit</th>
                                        <th
                                            class="text-center py-3 px-4 text-xs font-black text-muted-foreground uppercase">
                                            Izin</th>
                                        <th
                                            class="text-center py-3 px-4 text-xs font-black text-muted-foreground uppercase">
                                            Alpha</th>
                                        <th
                                            class="text-center py-3 px-4 text-xs font-black text-muted-foreground uppercase">
                                            Kehadiran</th>
                                        <th
                                            class="text-center py-3 px-4 text-xs font-black text-muted-foreground uppercase">
                                            Nilai</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="student in yearStats.students" :key="student.id"
                                        class="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                        <td class="py-3 px-4">
                                            <div class="flex items-center gap-3">
                                                <div
                                                    class="w-8 h-8 rounded-full bg-slate-200/50 flex items-center justify-center text-xs font-bold text-slate-500">
                                                    {{ student.name.charAt(0) }}
                                                </div>
                                                <span class="text-sm font-bold text-foreground">{{ student.name
                                                    }}</span>
                                            </div>
                                        </td>
                                        <td class="text-center py-3 px-4">
                                            <span class="text-sm font-bold text-green-600">{{ student.attendance.present
                                                }}</span>
                                        </td>
                                        <td class="text-center py-3 px-4">
                                            <span class="text-sm font-bold text-yellow-600">{{ student.attendance.sick
                                                }}</span>
                                        </td>
                                        <td class="text-center py-3 px-4">
                                            <span class="text-sm font-bold text-blue-600">{{
                                                student.attendance.permission }}</span>
                                        </td>
                                        <td class="text-center py-3 px-4">
                                            <span class="text-sm font-bold text-red-600">{{ student.attendance.alpha
                                                }}</span>
                                        </td>
                                        <td class="text-center py-3 px-4">
                                            <span class="px-2 py-1 rounded-lg text-xs font-black" :class="student.attendance.percentage >= 90 ? 'bg-green-100 text-green-700' :
                                                student.attendance.percentage >= 75 ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'">
                                                {{ student.attendance.percentage }}%
                                            </span>
                                        </td>
                                        <td class="text-center py-3 px-4">
                                            <div class="flex flex-col items-center">
                                                <span class="text-sm font-black text-purple-600">{{
                                                    student.grades.average }}</span>
                                                <span class="text-[10px] text-muted-foreground">Rank #{{
                                                    student.grades.rank }}</span>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Legacy History Section (Archived Students) -->
                    <div class="bg-white rounded-[32px] border border-slate-100 p-6">
                        <div class="flex items-center gap-2 mb-6">
                            <BuildingLibraryIcon class="w-5 h-5 text-slate-600" />
                            <h3 class="text-lg font-black text-foreground">Arsip Siswa Per Tahun Ajaran</h3>
                        </div>

                        <div v-if="Object.keys(historyByYear).length === 0"
                            class="text-center py-12 text-muted-foreground text-sm font-medium bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                            Belum ada riwayat siswa untuk kelas ini.
                        </div>

                        <div v-for="(students, year) in historyByYear" :key="year" class="mb-8 last:mb-0">
                            <div class="flex items-center gap-4 mb-4">
                                <span class="px-3 py-1 bg-slate-100 rounded-lg text-xs font-black text-slate-600">{{
                                    year }}</span>
                                <div class="h-px bg-slate-100 flex-1"></div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div v-for="student in students" :key="student.id"
                                    class="p-3 rounded-xl border border-slate-100 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                                    <div
                                        class="w-8 h-8 rounded-full bg-slate-200/50 flex items-center justify-center text-xs font-bold text-slate-500">
                                        {{ student.studentName.charAt(0) }}
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <p class="text-sm font-bold text-foreground truncate">{{ student.studentName }}
                                        </p>
                                        <p class="text-[11px] text-muted-foreground">{{ student.status }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Skeleton Loading -->
        <div v-else class="space-y-8 animate-pulse">
            <div class="h-64 bg-slate-100 rounded-[32px]"></div>
            <div class="h-96 bg-slate-100 rounded-[32px]"></div>
        </div>
    </div>
</template>
