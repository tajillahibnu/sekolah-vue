<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAttendanceStore } from '../stores/attendanceStore';
import {
    CalendarDaysIcon,
    ClockIcon,
    ArrowLeftIcon,
    CheckCircleIcon,
    XCircleIcon,
    MinusCircleIcon,
    PencilSquareIcon,
    XMarkIcon,
    DocumentTextIcon,
    PaperClipIcon,
    ChevronDownIcon,
    PlusIcon,
    ListBulletIcon,
    UserIcon,
    ChartPieIcon,
    ArrowTrendingUpIcon
} from '@heroicons/vue/24/outline';

const route = useRoute();
const router = useRouter();
const attendanceStore = useAttendanceStore();
const studentId = route.params.id;

// View Mode
const viewMode = ref('calendar'); // 'calendar' | 'table'

// State for filters
const selectedYear = ref('2023/2024');
const selectedMonth = ref(new Date().getMonth()); // 0-11
const showYearDropdown = ref(false);

const academicYears = ['2023/2024', '2022/2023'];
const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

// Fetch data
onMounted(() => {
    // In real app, fetch data here
});

const student = computed(() => {
    const log = attendanceStore.dailyAttendance.find(l => l.studentId == studentId);
    return log || { name: 'Siswa Test', className: 'XII IPA 1', photo: null, nis: '12345' };
});

const history = computed(() => {
    const allLogs = attendanceStore.getStudentHistory(parseInt(studentId));
    return allLogs.filter(log => {
        const d = new Date(log.date);
        return d.getMonth() === selectedMonth.value;
    });
});

// Analytics
const stats = computed(() => {
    const s = {
        Hadir: 0,
        Sakit: 0,
        Izin: 0,
        Alpha: 0,
        Late: 0,
        OnTime: 0
    };

    history.value.forEach(log => {
        if (s[log.status] !== undefined) s[log.status]++;

        // Punctuality Logic (Threshold 07:00)
        if (log.status === 'Hadir' && log.timeIn) {
            const [hours, mins] = log.timeIn.split(':').map(Number);
            if (hours > 7 || (hours === 7 && mins > 0)) {
                s.Late++;
            } else {
                s.OnTime++;
            }
        }
    });
    return s;
});

const attendanceRate = computed(() => {
    if (history.value.length === 0) return 0;
    return Math.round((stats.value.Hadir / history.value.length) * 100);
});

const punctualityRate = computed(() => {
    const totalPresent = stats.value.Hadir;
    if (totalPresent === 0) return 0;
    return Math.round((stats.value.OnTime / totalPresent) * 100);
});

// Calendar Logic
const calendarDays = computed(() => {
    const year = parseInt(selectedYear.value.split('/')[0]) + (selectedMonth.value < 6 ? 0 : 1); // Mock year logic
    const targetYear = new Date().getFullYear(); // Using current year for simplicity in mock

    const daysInMonth = new Date(targetYear, selectedMonth.value + 1, 0).getDate();
    const firstDay = new Date(targetYear, selectedMonth.value, 1).getDay(); // 0 = Sunday

    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);

    for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${targetYear}-${String(selectedMonth.value + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const log = history.value.find(l => l.date === dateStr);
        days.push({ day: i, date: dateStr, log: log || null });
    }
    return days;
});
const weekDays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

// Modal Logic
const showEditModal = ref(false);
const isCreating = ref(false);
const editingLog = ref({});
const saving = ref(false);
const editForm = ref({ date: '', status: 'Hadir', timeIn: '', timeOut: '', notes: '', proofUrl: '' });

const openCreateModal = (datePrefill = null) => {
    isCreating.value = true;
    editingLog.value = {};
    editForm.value = {
        date: datePrefill || new Date().toISOString().split('T')[0],
        status: 'Hadir',
        timeIn: '', timeOut: '', notes: '', proofUrl: ''
    };
    showEditModal.value = true;
};

const openEditModal = (log) => {
    isCreating.value = false;
    editingLog.value = log;
    editForm.value = { ...log };
    showEditModal.value = true;
};

const handleCalendarClick = (day) => {
    if (!day) return;
    day.log ? openEditModal(day.log) : openCreateModal(day.date);
};

const saveChanges = async () => {
    saving.value = true;
    // Mock save delay
    await new Promise(r => setTimeout(r, 500));

    if (isCreating.value) {
        await attendanceStore.addLog({
            studentId: parseInt(studentId),
            studentName: student.value.name,
            className: student.value.className,
            ...editForm.value
        });
    } else {
        await attendanceStore.updateLog(editingLog.value.id, editForm.value);
    }
    saving.value = false;
    showEditModal.value = false;
};

// Helpers
const getStatusColor = (status) => {
    switch (status) {
        case 'Hadir': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
        case 'Sakit': return 'text-amber-600 bg-amber-50 border-amber-100';
        case 'Izin': return 'text-blue-600 bg-blue-50 border-blue-100';
        case 'Alpha': return 'text-rose-600 bg-rose-50 border-rose-100';
        default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
};

const getStatusBg = (status) => {
    switch (status) {
        case 'Hadir': return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200';
        case 'Sakit': return 'bg-amber-100 text-amber-700 hover:bg-amber-200';
        case 'Izin': return 'bg-blue-100 text-blue-700 hover:bg-blue-200';
        case 'Alpha': return 'bg-rose-100 text-rose-700 hover:bg-rose-200';
        default: return 'bg-slate-100 text-slate-400';
    }
};

const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};
</script>

<template>
    <div class="min-h-screen bg-slate-50/50 pb-20 font-sans">
        <!-- Header Section -->
        <header class="bg-white border-b border-slate-200 sticky top-0 z-40">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex flex-col md:flex-row md:items-center justify-between py-4 gap-4">
                    <div class="flex items-center gap-4">
                        <button @click="router.back()"
                            class="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors">
                            <ArrowLeftIcon class="w-5 h-5" />
                        </button>
                        <div class="flex items-center gap-4">
                            <div class="relative">
                                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5">
                                    <img :src="student.photo || `https://ui-avatars.com/api/?name=${student.name}`"
                                        class="w-full h-full object-cover rounded-[10px] bg-white" />
                                </div>
                                <div
                                    class="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full">
                                </div>
                            </div>
                            <div>
                                <h1 class="text-xl font-black text-slate-800 tracking-tight leading-none">{{
                                    student.name }}</h1>
                                <div class="flex items-center gap-2 mt-1.5 text-xs font-medium text-slate-500">
                                    <span class="px-2 py-0.5 bg-slate-100 rounded text-slate-600">{{ student.className
                                        }}</span>
                                    <span>•</span>
                                    <span>NIS: {{ student.nis }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="flex items-center gap-3">
                        <div class="hidden md:flex items-center bg-slate-100 rounded-lg p-1">
                            <button v-for="mode in ['calendar', 'table']" :key="mode" @click="viewMode = mode"
                                class="px-3 py-1.5 rounded-md text-sm font-bold transition-all flex items-center gap-2"
                                :class="viewMode === mode ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'">
                                <component :is="mode === 'calendar' ? CalendarDaysIcon : ListBulletIcon"
                                    class="w-4 h-4" />
                                <span class="capitalize">{{ mode === 'calendar' ? 'Kalender' : 'Tabel' }}</span>
                            </button>
                        </div>
                        <button @click="openCreateModal()"
                            class="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold text-sm shadow-lg shadow-slate-900/20 transition-all flex items-center gap-2">
                            <PlusIcon class="w-5 h-5" />
                            <span class="hidden sm:inline">Catat Absensi</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>

        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <!-- Analytics Dashboard -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Attendance Rate -->
                <div
                    class="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                    <div class="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                        <ChartPieIcon class="w-32 h-32 text-blue-600" />
                    </div>
                    <h3 class="text-slate-500 font-bold text-sm uppercase tracking-wider mb-4">Total Kehadiran</h3>
                    <div class="flex items-end gap-2">
                        <span class="text-5xl font-black text-slate-800">{{ attendanceRate }}<span
                                class="text-2xl text-slate-400">%</span></span>
                    </div>
                    <div class="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
                        <div class="bg-blue-500 h-full rounded-full transition-all duration-1000"
                            :style="{ width: `${attendanceRate}%` }"></div>
                    </div>
                    <p class="text-xs text-slate-400 mt-2 font-medium">{{ stats.Hadir }} hari hadir dari {{
                        history.length }} hari efektif</p>
                </div>

                <!-- Punctuality -->
                <div
                    class="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                    <div class="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                        <ClockIcon class="w-32 h-32 text-emerald-600" />
                    </div>
                    <h3 class="text-slate-500 font-bold text-sm uppercase tracking-wider mb-4">Ketepatan Waktu</h3>
                    <div class="flex items-end gap-2">
                        <span class="text-5xl font-black text-slate-800">{{ punctualityRate }}<span
                                class="text-2xl text-slate-400">%</span></span>
                    </div>
                    <div class="flex gap-1 mt-4">
                        <div class="bg-emerald-500 h-2 rounded-full transition-all duration-1000"
                            :style="{ width: `${punctualityRate}%` }"></div>
                        <div class="bg-rose-400 h-2 rounded-full transition-all duration-1000 flex-1"></div>
                    </div>
                    <div class="flex justify-between mt-2 text-xs font-bold">
                        <span class="text-emerald-600">{{ stats.OnTime }} Tepat Waktu</span>
                        <span class="text-rose-500">{{ stats.Late }} Terlambat</span>
                    </div>
                </div>

                <!-- Status Breakdown -->
                <div
                    class="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between">
                    <h3 class="text-slate-500 font-bold text-sm uppercase tracking-wider mb-2">Detail Status</h3>
                    <div class="grid grid-cols-2 gap-3 mt-auto">
                        <div class="bg-amber-50 rounded-2xl p-3 flex flex-col border border-amber-100">
                            <span class="text-2xl font-black text-amber-700">{{ stats.Sakit }}</span>
                            <span class="text-[10px] font-bold text-amber-500 uppercase">Sakit</span>
                        </div>
                        <div class="bg-blue-50 rounded-2xl p-3 flex flex-col border border-blue-100">
                            <span class="text-2xl font-black text-blue-700">{{ stats.Izin }}</span>
                            <span class="text-[10px] font-bold text-blue-500 uppercase">Izin</span>
                        </div>
                        <div
                            class="bg-rose-50 rounded-2xl p-3 flex flex-col border border-rose-100 col-span-2 flex-row items-center justify-between px-5">
                            <div class="flex flex-col">
                                <span class="text-2xl font-black text-rose-700">{{ stats.Alpha }}</span>
                                <span class="text-[10px] font-bold text-rose-500 uppercase">Alpha (Tanpa Ket)</span>
                            </div>
                            <XCircleIcon class="w-8 h-8 text-rose-300" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Content Area -->
            <div class="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/20">
                <!-- Filters -->
                <div class="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h2 class="text-2xl font-black text-slate-800">Riwayat Absensi</h2>
                        <p class="text-slate-500 font-medium text-sm">Pilih periode untuk melihat data</p>
                    </div>
                    <div class="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                        <div class="relative">
                            <button @click="showYearDropdown = !showYearDropdown"
                                class="px-4 py-2 text-sm font-bold text-slate-700 hover:bg-white rounded-xl transition-all flex items-center gap-2">
                                {{ selectedYear }}
                                <ChevronDownIcon class="w-4 h-4 text-slate-400" />
                            </button>
                            <div v-if="showYearDropdown"
                                class="absolute top-full right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-xl w-32 py-1 z-20">
                                <button v-for="y in academicYears" :key="y"
                                    @click="selectedYear = y; showYearDropdown = false"
                                    class="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 font-medium">
                                    {{ y }}
                                </button>
                            </div>
                        </div>
                        <div class="w-px bg-slate-200 mx-1"></div>
                        <select v-model="selectedMonth"
                            class="px-4 py-2 bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer hover:bg-white rounded-xl transition-all appearance-none">
                            <option v-for="(m, i) in months" :key="m" :value="i">{{ m }}</option>
                        </select>
                    </div>
                </div>

                <!-- Calendar View -->
                <div v-if="viewMode === 'calendar'" class="animate-in fade-in duration-300">
                    <div class="grid grid-cols-7 gap-4 mb-4">
                        <div v-for="day in weekDays" :key="day"
                            class="text-center text-xs font-extrabold text-slate-400 uppercase tracking-widest">
                            {{ day }}
                        </div>
                    </div>
                    <div class="grid grid-cols-7 gap-2 sm:gap-4">
                        <div v-for="(day, idx) in calendarDays" :key="idx"
                            class="aspect-square rounded-2xl transition-all relative group flex flex-col items-center justify-center p-1 sm:p-2"
                            :class="[
                                !day ? 'bg-transparent' :
                                    day.log ? getStatusBg(day.log.status) + ' cursor-pointer shadow-sm hover:shadow-md transform hover:-translate-y-1'
                                        : 'bg-slate-50 text-slate-300 cursor-pointer hover:bg-slate-100 hover:text-slate-500 border-2 border-dashed border-slate-200'
                            ]" @click="handleCalendarClick(day)">

                            <template v-if="day">
                                <span class="text-sm sm:text-lg font-black">{{ day.day }}</span>
                                <div v-if="day.log" class="mt-1 flex flex-col items-center">
                                    <span class="text-[10px] uppercase font-bold opacity-75 hidden sm:block">{{
                                        day.log.status }}</span>
                                    <div v-if="day.log.status === 'Hadir' && day.log.timeIn"
                                        class="mt-1 px-1.5 py-0.5 bg-white/30 rounded text-[10px] font-mono font-bold hidden sm:block">
                                        {{ day.log.timeIn }}
                                    </div>
                                </div>
                                <div v-else
                                    class="opacity-0 group-hover:opacity-100 absolute inset-0 flex items-center justify-center bg-slate-100/50 backdrop-blur-[1px] rounded-2xl transition-opacity">
                                    <PlusIcon class="w-6 h-6 text-slate-400" />
                                </div>
                            </template>
                        </div>
                    </div>
                </div>

                <!-- Table View -->
                <div v-else class="animate-in fade-in duration-300">
                    <div v-if="history.length === 0"
                        class="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                        <p class="text-slate-500 font-bold">Tidak ada data untuk periode ini.</p>
                    </div>
                    <div v-else class="overflow-hidden rounded-2xl border border-slate-200">
                        <table class="w-full text-left border-collapse">
                            <thead class="bg-slate-50">
                                <tr>
                                    <th
                                        class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                                        Tanggal</th>
                                    <th
                                        class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                                        Status</th>
                                    <th
                                        class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                                        Waktu</th>
                                    <th
                                        class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                                        Catatan</th>
                                    <th
                                        class="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                                        Aksi</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 bg-white">
                                <tr v-for="log in history" :key="log.id"
                                    class="hover:bg-slate-50 transition-colors group">
                                    <td class="px-6 py-4 font-bold text-slate-700">{{ formatDate(log.date) }}</td>
                                    <td class="px-6 py-4">
                                        <span
                                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border"
                                            :class="getStatusColor(log.status)">
                                            {{ log.status }}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-3 text-sm font-mono text-slate-600">
                                            <span class="flex items-center gap-1.5">
                                                <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>{{ log.timeIn
                                                || '--:--' }}
                                            </span>
                                            <span class="text-slate-300">/</span>
                                            <span class="flex items-center gap-1.5">
                                                <div class="w-1.5 h-1.5 rounded-full bg-rose-500"></div>{{ log.timeOut
                                                || '--:--' }}
                                            </span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 text-sm text-slate-500 italic">{{ log.notes || '-' }}</td>
                                    <td class="px-6 py-4 text-center">
                                        <button @click="openEditModal(log)"
                                            class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                            <PencilSquareIcon class="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- Edit Modal (Simplified for brevity but functional) -->
    <div v-if="showEditModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <div class="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 class="font-black text-lg text-slate-800">{{ isCreating ? 'Catat Absensi' : 'Edit Data' }} <span
                        class="font-normal text-slate-500 text-sm ml-2">{{ editForm.date }}</span></h3>
                <button @click="showEditModal = false">
                    <XMarkIcon class="w-6 h-6 text-slate-400 hover:text-slate-600" />
                </button>
            </div>
            <div class="p-6 space-y-4">
                <div class="grid grid-cols-4 gap-2">
                    <button v-for="s in ['Hadir', 'Sakit', 'Izin', 'Alpha']" :key="s" @click="editForm.status = s"
                        class="py-2 rounded-xl text-xs font-bold border transition-all"
                        :class="editForm.status === s ? getStatusColor(s) + ' ring-2 ring-offset-1 ring-slate-200' : 'border-slate-200 text-slate-500 hover:bg-slate-50'">
                        {{ s }}
                    </button>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="text-xs font-bold text-slate-500 uppercase mb-1 block">Masuk</label>
                        <input v-model="editForm.timeIn" type="time"
                            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-blue-500">
                    </div>
                    <div>
                        <label class="text-xs font-bold text-slate-500 uppercase mb-1 block">Pulang</label>
                        <input v-model="editForm.timeOut" type="time"
                            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-blue-500">
                    </div>
                </div>
                <div>
                    <label class="text-xs font-bold text-slate-500 uppercase mb-1 block">Catatan</label>
                    <textarea v-model="editForm.notes" rows="2"
                        class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium outline-none focus:border-blue-500 resize-none"></textarea>
                </div>
            </div>
            <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                <button @click="showEditModal = false"
                    class="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700">Batal</button>
                <button @click="saveChanges"
                    class="px-6 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-900/10">Simpan</button>
            </div>
        </div>
    </div>
</template>
<style scoped>
/* Scoped styles if needed */
</style>
