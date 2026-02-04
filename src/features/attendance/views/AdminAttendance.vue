<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAttendanceStore } from '../stores/attendanceStore';
import api from '@/services/api';
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowDownTrayIcon,
    EyeIcon,
    PencilSquareIcon,
    XMarkIcon,
    DocumentTextIcon,
    PaperClipIcon,
    Bars3Icon,
    Squares2X2Icon,
    ChevronDownIcon,
    CheckIcon,
    UserIcon,
    ClockIcon
} from '@heroicons/vue/24/outline';

const router = useRouter();
const attendanceStore = useAttendanceStore();

// View State
const viewMode = ref('table'); // 'table' or 'card'
const searchQuery = ref('');
const showClassDropdown = ref(false);

// Pagination
const page = ref(1);
const selectedLimit = ref(10);
const limitOptions = [10, 20, 50, 100];
const total = ref(0);

// Filters
const selectedClass = ref('');
const classOptions = [
    { value: '', label: 'Semua Kelas' },
    { value: 'XII IPA 1', label: 'XII IPA 1' },
    { value: 'XII IPA 2', label: 'XII IPA 2' },
    { value: 'XII IPS 1', label: 'XII IPS 1' }
];

const selectedClassLabel = computed(() => {
    const option = classOptions.find(opt => opt.value === selectedClass.value);
    return option ? option.label : 'Pilih Kelas';
});

const students = ref([]);
const loading = ref(true);

const fetchStudents = async () => {
    loading.value = true;
    try {
        const response = await api.get('/students', {
            params: {
                limit: 100 // Fetch all for client-side filtering logic for now
            }
        });
        students.value = response.data?.data || [];
        total.value = students.value.length;
    } catch (e) {
        console.error(e);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchStudents();
});

const filteredStudents = computed(() => {
    let result = students.value;

    if (selectedClass.value) {
        result = result.filter(s => s.class === selectedClass.value || s.className === selectedClass.value);
    }

    if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        result = result.filter(s => s.name.toLowerCase().includes(q) || s.nis.includes(q));
    }

    // Client-side pagination logic
    total.value = result.length;
    return result;
});

const paginatedStudents = computed(() => {
    const start = (page.value - 1) * selectedLimit.value;
    const end = start + selectedLimit.value;
    return filteredStudents.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(total.value / selectedLimit.value));

const changePage = (newPage) => {
    if (newPage > 0 && newPage <= totalPages.value) {
        page.value = newPage;
    }
};

// Helper to get status from store
const getStudentStatus = (studentId) => {
    const log = attendanceStore.todayStatusMap[studentId];
    if (!log) return null;
    return log;
};

// Quick Modal Logic (unchanged from previous)
const showQuickModal = ref(false);
const selectedStudent = ref(null);
const saving = ref(false);
const quickForm = ref({
    status: 'Hadir',
    timeIn: '',
    timeOut: '',
    notes: '',
    proofFile: null,
    proofUrl: ''
});

const openQuickModal = (student) => {
    selectedStudent.value = student;
    const existingLog = attendanceStore.todayStatusMap[student.id];

    if (existingLog) {
        // Edit existing
        quickForm.value = {
            status: existingLog.status,
            timeIn: existingLog.timeIn || '',
            timeOut: existingLog.timeOut || '',
            notes: existingLog.notes || '',
            proofUrl: existingLog.proofUrl || '',
            proofFile: null
        };
    } else {
        // Create new
        quickForm.value = {
            status: 'Hadir',
            timeIn: '',
            timeOut: '',
            notes: '',
            proofUrl: '',
            proofFile: null
        };
    }
    showQuickModal.value = true;
};

const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        quickForm.value.proofFile = file;
        quickForm.value.proofUrl = URL.createObjectURL(file);
    }
};

const saveQuickAttendance = async () => {
    saving.value = true;
    const existingLog = attendanceStore.todayStatusMap[selectedStudent.value.id];
    const today = new Date().toISOString().split('T')[0];

    try {
        if (existingLog) {
            await attendanceStore.updateLog(existingLog.id, {
                status: quickForm.value.status,
                timeIn: quickForm.value.timeIn,
                timeOut: quickForm.value.timeOut,
                notes: quickForm.value.notes,
                proofUrl: quickForm.value.proofUrl
            });
        } else {
            await attendanceStore.addLog({
                studentId: selectedStudent.value.id,
                studentName: selectedStudent.value.name,
                className: selectedStudent.value.class || selectedStudent.value.className,
                date: today,
                status: quickForm.value.status,
                timeIn: quickForm.value.timeIn,
                timeOut: quickForm.value.timeOut,
                notes: quickForm.value.notes,
                proofUrl: quickForm.value.proofUrl
            });
        }
        showQuickModal.value = false;
    } finally {
        saving.value = false;
    }
};
</script>

<template>
    <div class="space-y-8 pb-12">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div class="space-y-1">
                <h1 class="text-3xl font-black text-slate-800 tracking-tight">Absensi Harian</h1>
                <p class="text-slate-500 font-medium">Rekap kehadiran siswa hari ini, {{ new
                    Date().toLocaleDateString('id-ID', {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    }) }}</p>
            </div>
            <button
                class="bg-card border-0 text-foreground hover:bg-muted/50 px-6 py-3 rounded-2xl font-bold shadow-lg shadow-slate-200/50 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2">
                <ArrowDownTrayIcon class="w-5 h-5 text-muted-foreground" />
                Export Data
            </button>
        </div>

        <!-- Filters & View Toggle (Glassmorphism Style) -->
        <div class="relative z-40 bg-card/60 backdrop-blur-md border-0 rounded-3xl p-2 shadow-xl shadow-slate-200/50">
            <div class="flex flex-col lg:flex-row items-stretch lg:items-center gap-2">
                <!-- Search -->
                <div class="relative flex-1 group">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon
                            class="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                    <input v-model="searchQuery" type="text" placeholder="Cari nama atau NIS..."
                        class="block w-full pl-12 pr-4 py-4 bg-muted/50 border-transparent rounded-2xl text-sm font-medium focus:bg-card focus:ring-2 focus:ring-primary/20 focus:border-primary/20 transition-all placeholder:text-muted-foreground/50 text-foreground" />
                </div>

                <div class="flex flex-col sm:flex-row gap-2">
                    <!-- Custom Class Dropdown -->
                    <div class="relative w-full sm:w-56">
                        <button @click="showClassDropdown = !showClassDropdown"
                            class="w-full h-full flex items-center justify-between px-5 py-4 bg-muted/50 border-transparent rounded-2xl text-sm font-bold text-foreground hover:bg-muted transition-all text-left">
                            <div class="flex items-center gap-2.5">
                                <FunnelIcon class="w-4 h-4 text-primary" />
                                <span>{{ selectedClassLabel }}</span>
                            </div>
                            <ChevronDownIcon class="w-4 h-4 text-muted-foreground transition-transform duration-300"
                                :class="{ 'rotate-180': showClassDropdown }" />
                        </button>

                        <div v-if="showClassDropdown"
                            class="absolute top-full left-0 right-0 mt-2 z-[60] bg-card border-0 rounded-2xl shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-200">
                            <div class="space-y-1">
                                <button v-for="opt in classOptions" :key="opt.value"
                                    @click="selectedClass = opt.value; showClassDropdown = false"
                                    class="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all"
                                    :class="selectedClass === opt.value ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground hover:text-foreground'">
                                    <span>{{ opt.label }}</span>
                                    <CheckIcon v-if="selectedClass === opt.value" class="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Controls (Separate Row) -->
        <div class="flex justify-between items-center gap-3 px-1 mb-4">
            <!-- Page Info -->
            <div class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Menampilkan <span class="text-primary font-black">{{ paginatedStudents.length }}</span> dari
                <span class="text-primary font-black">{{ total }}</span> Siswa
            </div>

            <!-- View Toggle -->
            <div class="flex bg-card border-0 p-1 rounded-2xl gap-1 shadow-sm">
                <button @click="viewMode = 'table'"
                    class="px-4 py-2 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                    :class="viewMode === 'table' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-muted'">
                    <Bars3Icon class="w-5 h-5" />
                </button>
                <button @click="viewMode = 'card'"
                    class="px-4 py-2 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                    :class="viewMode === 'card' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-muted'">
                    <Squares2X2Icon class="w-5 h-5" />
                </button>
            </div>
        </div>

        <!-- List View (Horizontal Card Style) -->
        <div v-if="viewMode === 'table'" class="space-y-4">
            <template v-if="loading">
                <div v-for="i in 5" :key="i" class="bg-card border-0 rounded-3xl p-6 animate-pulse space-y-6">
                    <!-- Skeleton content -->
                </div>
            </template>
            <template v-else>
                <div v-for="student in paginatedStudents" :key="student.id"
                    class="group bg-card border-0 rounded-3xl p-6 hover:shadow-xl hover:shadow-primary/5 transition-all hover:-translate-y-1 relative overflow-hidden">

                    <!-- Card Header -->
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-0 pb-4 mb-5">
                        <div class="flex items-center gap-3">
                            <div class="p-2 bg-muted/50 rounded-xl group-hover:bg-primary/10 transition-colors">
                                <UserIcon class="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                            </div>
                            <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                <span
                                    class="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">{{
                                        student.nis }}</span>
                                <div class="hidden sm:block w-1.5 h-1.5 rounded-full bg-border"></div>
                                <span class="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{{
                                    student.class || student.className }}</span>
                            </div>
                        </div>

                        <div class="flex items-center gap-3">
                            <!-- Status Badge -->
                            <span v-if="getStudentStatus(student.id)" :class="[
                                'inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border-0 transition-colors',
                                getStudentStatus(student.id).status === 'Hadir' ? 'bg-emerald-50 text-emerald-600' :
                                    getStudentStatus(student.id).status === 'Izin' ? 'bg-blue-50 text-blue-600' :
                                        getStudentStatus(student.id).status === 'Sakit' ? 'bg-amber-50 text-amber-600' :
                                            'bg-red-50 text-red-600'
                            ]">
                                {{ getStudentStatus(student.id).status }}
                            </span>
                            <span v-else
                                class="inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border-0 bg-muted/50 text-muted-foreground/60">
                                Belum Absen
                            </span>
                        </div>
                    </div>

                    <!-- Card Body -->
                    <div class="flex flex-col md:flex-row md:items-center gap-6">
                        <div class="flex items-center gap-5 flex-1">
                            <div class="relative">
                                <img :src="student.photo || `https://ui-avatars.com/api/?name=${student.name}`"
                                    class="w-16 h-16 rounded-2xl object-cover shadow-md group-hover:scale-105 transition-transform" />
                            </div>
                            <div class="space-y-1">
                                <h3
                                    class="font-black text-xl text-foreground tracking-tight group-hover:text-primary transition-colors">
                                    {{ student.name }}
                                </h3>
                                <!-- Time Info -->
                                <div v-if="getStudentStatus(student.id)"
                                    class="flex items-center gap-3 text-xs font-mono">
                                    <span
                                        class="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                                        <ClockIcon class="w-3 h-3" /> {{ getStudentStatus(student.id).timeIn || '--:--'
                                        }}
                                    </span>
                                    <span class="flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">
                                        <ClockIcon class="w-3 h-3" /> {{ getStudentStatus(student.id).timeOut || '--:--'
                                        }}
                                    </span>
                                </div>
                                <div v-else class="text-xs text-muted-foreground/60 italic">
                                    Belum ada catatan waktu
                                </div>
                            </div>
                        </div>

                        <div class="flex items-center justify-between md:justify-end gap-6 md:min-w-[200px]">
                            <!-- Actions -->
                            <div class="hidden min-[1100px]:flex items-center gap-2 pl-6 border-0">
                                <button @click="router.push(`/admin/attendance/daily/${student.id}`)"
                                    class="px-4 py-2.5 bg-card border-0 hover:bg-primary/5 text-primary font-bold text-sm rounded-xl transition-all active:scale-95 flex items-center gap-2">
                                    <EyeIcon class="w-4 h-4" /> Detail
                                </button>
                                <button @click="openQuickModal(student)"
                                    class="px-4 py-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white font-bold text-sm rounded-xl transition-all active:scale-95 flex items-center gap-2">
                                    <PencilSquareIcon class="w-4 h-4" /> Absenkan
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Mobile Actions -->
                    <div class="mt-6 pt-5 border-0 flex min-[1100px]:hidden items-center justify-end gap-3">
                        <button @click="router.push(`/admin/attendance/daily/${student.id}`)"
                            class="flex-1 sm:flex-none text-blue-600 font-black text-sm hover:underline py-2">
                            Lihat Detail
                        </button>
                        <button @click="openQuickModal(student)"
                            class="px-6 py-2.5 bg-emerald-600 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 active:scale-95 transition-all">
                            Absenkan
                        </button>
                    </div>
                </div>
            </template>
        </div>

        <!-- Card View (Alternative Grid) -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div v-for="student in paginatedStudents" :key="student.id"
                class="group bg-card border-0 rounded-3xl p-6 hover:shadow-2xl hover:shadow-primary/5 transition-all hover:-translate-y-1 relative overflow-hidden">

                <!-- Avatar & Status -->
                <div class="flex items-start justify-between mb-5 relative">
                    <div class="relative">
                        <img :src="student.photo || `https://ui-avatars.com/api/?name=${student.name}`"
                            class="w-16 h-16 rounded-2xl object-cover shadow-md group-hover:scale-105 transition-transform" />
                    </div>
                    <span v-if="getStudentStatus(student.id)" :class="[
                        'inline-flex items-center px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider border-0',
                        getStudentStatus(student.id).status === 'Hadir' ? 'bg-emerald-50 text-emerald-600' : 'bg-muted/50 text-muted-foreground'
                    ]">
                        {{ getStudentStatus(student.id).status }}
                    </span>
                </div>

                <!-- Info -->
                <div class="space-y-4">
                    <div class="space-y-1">
                        <h3
                            class="font-black text-foreground text-lg tracking-tight truncate group-hover:text-primary transition-colors">
                            {{ student.name }}
                        </h3>
                        <p class="text-xs text-muted-foreground font-medium truncate">{{ student.nis }}</p>
                    </div>

                    <!-- Actions -->
                    <div class="pt-4 flex items-center gap-2 border-0">
                        <button @click="router.push(`/admin/attendance/daily/${student.id}`)"
                            class="flex-1 bg-muted/50 hover:bg-primary hover:text-primary-foreground text-muted-foreground py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2">
                            <EyeIcon class="w-4 h-4" /> Detail
                        </button>
                        <button @click="openQuickModal(student)"
                            class="p-2.5 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-600 rounded-xl transition-all">
                            <PencilSquareIcon class="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Pagination Controls -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-6 py-8 px-4 border-0">
            <!-- Limit Selector -->
            <div class="flex items-center gap-1 bg-card border-0 p-1 rounded-2xl shadow-sm order-2 sm:order-1">
                <button v-for="l in limitOptions" :key="l" @click="selectedLimit = l"
                    class="px-3 py-2 rounded-xl text-xs font-black transition-all min-w-[3rem]"
                    :class="selectedLimit === l ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-muted hover:text-foreground'">
                    {{ l }}
                </button>
            </div>

            <!-- Page Navigation -->
            <div class="flex items-center gap-2 order-1 sm:order-2">
                <button @click="changePage(page - 1)" :disabled="page <= 1"
                    class="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:hover:bg-transparent transition-all">
                    <span class="sr-only">Previous</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd"
                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            clip-rule="evenodd" />
                    </svg>
                </button>

                <div class="flex items-center gap-1">
                    <button v-for="p in totalPages" :key="p" @click="changePage(p)"
                        class="w-8 h-8 flex items-center justify-center rounded-xl text-xs font-black transition-all"
                        :class="page === p ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:bg-muted hover:text-foreground'">
                        {{ p }}
                    </button>
                </div>

                <button @click="changePage(page + 1)" :disabled="page >= totalPages"
                    class="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:hover:bg-transparent transition-all">
                    <span class="sr-only">Next</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>

        <!-- Quick Attendance Modal -->
        <div v-if="showQuickModal"
            class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div
                class="bg-card rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div class="px-6 py-4 border-0 flex items-center justify-between">
                    <h3 class="font-bold text-foreground">Absensi: {{ selectedStudent?.name }}</h3>
                    <button @click="showQuickModal = false"
                        class="p-1 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                        <XMarkIcon class="w-5 h-5" />
                    </button>
                </div>

                <div class="p-6 space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="col-span-2">
                            <div class="text-xs font-bold text-muted-foreground uppercase mb-2">Tanggal: {{ new
                                Date().toLocaleDateString('id-ID', {
                                    weekday: 'long', year: 'numeric', month: 'long',
                                    day:
                                        'numeric'
                                }) }}</div>
                        </div>

                        <div class="col-span-2">
                            <label class="block text-xs font-bold text-muted-foreground uppercase mb-2">Status
                                Kehadiran</label>
                            <div class="flex gap-2">
                                <button v-for="s in ['Hadir', 'Izin', 'Sakit', 'Alpha']" :key="s"
                                    @click="quickForm.status = s" type="button" :class="[
                                        'flex-1 py-2 rounded-xl text-sm font-semibold border-0 transition-all',
                                        quickForm.status === s
                                            ? (s === 'Hadir' ? 'bg-emerald-50 text-emerald-700' :
                                                s === 'Izin' ? 'bg-blue-50 text-blue-700' :
                                                    s === 'Sakit' ? 'bg-amber-50 text-amber-700' :
                                                        'bg-red-50 text-red-700')
                                            : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                                    ]">
                                    {{ s }}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label class="block text-xs font-bold text-muted-foreground uppercase mb-1">Jam
                                Masuk</label>
                            <input v-model="quickForm.timeIn" type="time"
                                class="w-full bg-muted/50 border-0 rounded-xl px-4 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none">
                        </div>

                        <div>
                            <label class="block text-xs font-bold text-muted-foreground uppercase mb-1">Jam
                                Pulang</label>
                            <input v-model="quickForm.timeOut" type="time"
                                class="w-full bg-muted/50 border-0 rounded-xl px-4 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none">
                        </div>

                        <div class="col-span-2">
                            <label class="block text-xs font-bold text-muted-foreground uppercase mb-1">Catatan</label>
                            <textarea v-model="quickForm.notes" rows="2"
                                class="w-full bg-muted/50 border-0 rounded-xl px-4 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-muted-foreground/50"
                                placeholder="Keterangan tambahan..."></textarea>
                        </div>

                        <!-- Proof Upload (Show only if Sakit or Izin) -->
                        <div v-if="['Sakit', 'Izin'].includes(quickForm.status)" class="col-span-2">
                            <label class="block text-xs font-bold text-muted-foreground uppercase mb-1">Bukti Surat
                                (Foto/Dokumen)</label>
                            <div
                                class="border-0 bg-muted/30 rounded-xl p-4 text-center hover:bg-muted/50 transition-colors relative cursor-pointer">
                                <input type="file" @change="handleFileChange"
                                    class="absolute inset-0 opacity-0 cursor-pointer" accept="image/*,.pdf">
                                <div v-if="quickForm.proofUrl"
                                    class="flex items-center justify-center gap-2 text-blue-600">
                                    <DocumentTextIcon class="w-5 h-5" />
                                    <span class="text-sm font-medium">File Terupload (Klik untuk ganti)</span>
                                </div>
                                <div v-else class="text-slate-400">
                                    <PaperClipIcon class="w-6 h-6 mx-auto mb-1" />
                                    <span class="text-xs">Klik untuk upload bukti</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="px-6 py-4 bg-muted/20 flex justify-end gap-3">
                    <button @click="showQuickModal = false"
                        class="px-4 py-2 text-sm font-bold text-muted-foreground hover:bg-muted rounded-xl transition-colors">Batal</button>
                    <button @click="saveQuickAttendance"
                        class="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        :disabled="saving">
                        Simpan Absensi
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
