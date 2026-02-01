<script setup>
import { ref, computed } from 'vue';
import { useScheduleStore } from '@/stores/scheduleStore';
import {
    PlusIcon,
    ChevronLeftIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    CalendarDaysIcon,
    BuildingOffice2Icon,
    ClockIcon,
    TrashIcon
} from '@heroicons/vue/24/outline';
import Button from '@/components/ui/button/Button.vue';
import Badge from '@/components/ui/badge/Badge.vue';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

const store = useScheduleStore();

// --- View State ---
const currentView = ref('list'); // 'list' | 'detail'
const selectedClass = ref(null);
const selectedVersionId = ref(store.activeVersions[0]?.id);
const showDialog = ref(false);
const isEditing = ref(false);

const form = ref({
    id: null,
    day: '',
    periodId: null,
    periodLabel: '',
    timeStart: '',
    timeEnd: '',
    subjectId: '',
    teacherId: '',
    // Context
    classId: '',
    versionId: ''
});

const selectedVersion = computed(() =>
    store.activeVersions.find(v => v.id === selectedVersionId.value)
);

const modalTitle = computed(() => isEditing.value ? 'Edit Jadwal' : 'Tambah Jadwal');
const modalDescription = computed(() => isEditing.value ? 'Ubah detail jadwal pelajaran.' : 'Tambahkan jadwal baru ke slot ini.');

// --- Version Logic ---
const showVersionDialog = ref(false);
const versionForm = ref({
    year: '2023/2024',
    semester: 'Ganjil',
    name: ''
});

const handleSaveVersion = () => {
    if (!versionForm.value.name) return alert('Nama versi wajib diisi');
    store.addVersion({ ...versionForm.value });
    versionForm.value.name = ''; // Reset
    showVersionDialog.value = false;
};

// --- List View State ---
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 8;

const filteredClasses = computed(() => {
    let result = store.classes;
    if (searchQuery.value) {
        result = result.filter(c => c.toLowerCase().includes(searchQuery.value.toLowerCase()));
    }
    return result;
});

const totalPages = computed(() => Math.ceil(filteredClasses.value.length / itemsPerPage));

const paginatedClasses = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredClasses.value.slice(start, end);
});

// Reset page on search
import { watch } from 'vue';
watch(searchQuery, () => {
    currentPage.value = 1;
});

// --- Detail View Logic ---
const scheduleGrid = computed(() => {
    if (!selectedClass.value || !selectedVersionId.value) return {};
    return store.getScheduleGrid(selectedClass.value, selectedVersionId.value);
});

const handleClassClick = (cls) => {
    selectedClass.value = cls;
    currentView.value = 'detail';
};

const backToList = () => {
    selectedClass.value = null;
    currentView.value = 'list';
};

// --- Actions ---
const handleSlotClick = (period, day) => {
    // Check if slot has data
    const cell = scheduleGrid.value[period.id][day];

    // Default form values
    const commonForm = {
        day: day,
        subjectId: cell?.subjectId || '',
        teacherId: cell?.teacherId || '',
        classId: selectedClass.value,
        versionId: selectedVersionId.value
    };

    if (cell && cell.subjectId) {
        // Edit Mode
        isEditing.value = true;
        form.value = {
            ...commonForm,
            id: cell.id,
            startPeriodId: period.id,
            endPeriodId: period.id, // Default to single slot for safety in edit
        };
    } else {
        // Add Mode
        isEditing.value = false;
        form.value = {
            ...commonForm,
            id: null,
            startPeriodId: period.id,
            endPeriodId: period.id
        };
    }
    showDialog.value = true;
};

const handleAddClick = () => {
    isEditing.value = false;
    form.value = {
        id: null,
        day: store.days[0], // Default to first day
        startPeriodId: store.periods[0].id,
        endPeriodId: store.periods[0].id,
        periodId: store.periods[0].id,
        periodLabel: '',
        timeStart: '',
        timeEnd: '',
        subjectId: '',
        teacherId: '',
        classId: selectedClass.value,
        versionId: selectedVersionId.value
    };
    showDialog.value = true;
};

const handleSave = () => {
    if (!form.value.subjectId || !form.value.teacherId) {
        alert('Mohon lengkapi mapel dan guru.');
        return;
    }

    // Find indexes
    const startIndex = store.periods.findIndex(p => p.id === form.value.startPeriodId);
    const endIndex = store.periods.findIndex(p => p.id === form.value.endPeriodId);

    if (startIndex > endIndex) {
        alert('Jam selesai tidak boleh sebelum jam mulai.');
        return;
    }

    // Get periods in range (only teaching periods)
    const targetPeriods = store.periods.slice(startIndex, endIndex + 1).filter(p => p.type === 'teaching');

    if (isEditing.value) {
        store.deleteSchedule(form.value.id);
    }

    // Create Entry for EACH period in range
    targetPeriods.forEach(p => {
        store.addSchedule({
            day: form.value.day,
            periodId: p.id,
            classId: form.value.classId,
            versionId: form.value.versionId,
            subjectId: form.value.subjectId,
            teacherId: form.value.teacherId
        });
    });

    showDialog.value = false;
};

const handleDelete = () => {
    if (confirm('Hapus jadwal ini?')) {
        store.deleteSchedule(form.value.id);
        showDialog.value = false;
    }
};

// --- Formatters ---
const getPeriodLabel = (period) => {
    if (period.type === 'break') return 'ISTIRAHAT';
    return `${period.time}`;
};
</script>

<template>
    <div class="space-y-6">

        <!-- --- VIEW: LIST (Select Class) --- -->
        <div v-if="currentView === 'list'" class="space-y-6">
            <!-- Header -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div class="space-y-1">
                    <h1 class="text-3xl font-black text-slate-800 tracking-tight">Master Jadwal</h1>
                    <p class="text-slate-500 font-medium">Pilih kelas untuk mengelola jadwal pelajaran.</p>
                </div>
            </div>

            <!-- Card Container -->
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <!-- Toolbar -->
                <div
                    class="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div class="relative group w-full sm:w-96">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon
                                class="w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                        </div>
                        <input v-model="searchQuery" type="text" placeholder="Cari Kelas..."
                            class="block w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm" />
                    </div>
                </div>

                <!-- Table -->
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-slate-50 border-b border-slate-200">
                                <th class="p-4 text-xs font-black uppercase text-slate-400 w-16 text-center">No</th>
                                <th class="p-4 text-xs font-black uppercase text-slate-400">Nama Kelas</th>
                                <th class="p-4 text-xs font-black uppercase text-slate-400">Wali Kelas</th>
                                <th class="p-4 text-xs font-black uppercase text-slate-400 text-center">Status</th>
                                <th class="p-4 text-xs font-black uppercase text-slate-400 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(cls, index) in paginatedClasses" :key="cls"
                                class="border-b border-slate-100 hover:bg-slate-50/80 transition-colors group">
                                <td class="p-4 text-sm font-bold text-slate-500 text-center">
                                    {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                                </td>
                                <td class="p-4">
                                    <div class="flex items-center gap-3">
                                        <div
                                            class="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-black text-sm">
                                            {{ cls.charAt(0) }}
                                        </div>
                                        <span class="text-base font-black text-slate-700">{{ cls }}</span>
                                    </div>
                                </td>
                                <td class="p-4 text-sm font-medium text-slate-600">
                                    Sutrisno, S.Pd
                                </td>
                                <td class="p-4 text-center">
                                    <Badge variant="outline" class="bg-emerald-50 text-emerald-600 border-emerald-100">
                                        Aktif</Badge>
                                </td>
                                <td class="p-4 text-right">
                                    <Button @click="handleClassClick(cls)" size="sm"
                                        class="bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200 shadow-sm">
                                        kelola Jadwal
                                    </Button>
                                </td>
                            </tr>
                            <tr v-if="paginatedClasses.length === 0">
                                <td colspan="5" class="p-8 text-center text-slate-400 font-medium">
                                    Tidak ada kelas ditemukan.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <div class="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <span class="text-xs font-bold text-slate-500">
                        Menampilkan {{ paginatedClasses.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0 }} -
                        {{ Math.min(currentPage * itemsPerPage, filteredClasses.length) }} dari {{
                        filteredClasses.length }} kelas
                    </span>
                    <div class="flex items-center gap-2">
                        <Button :disabled="currentPage === 1" @click="currentPage--" variant="outline" size="sm"
                            class="h-8 w-8 p-0">
                            <ChevronLeftIcon class="w-4 h-4" />
                        </Button>
                        <span class="text-sm font-bold text-slate-700 px-2">{{ currentPage }}</span>
                        <!-- Next Button (Need ChevronRightIcon or rotate Left) -->
                        <Button :disabled="currentPage >= totalPages" @click="currentPage++" variant="outline" size="sm"
                            class="h-8 w-8 p-0">
                            <ChevronLeftIcon class="w-4 h-4 rotate-180" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>

        <!-- --- VIEW: DETAIL (Schedule Grid) --- -->
        <div v-else class="space-y-6">
            <!-- Header -->
            <!-- Header -->
            <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div class="flex items-center gap-4">
                    <button @click="backToList"
                        class="p-2 rounded-xl border border-slate-200 hover:bg-white hover:shadow-sm transition-all text-slate-500 flex-shrink-0">
                        <ChevronLeftIcon class="w-6 h-6" />
                    </button>
                    <div>
                        <h1 class="text-2xl font-black text-slate-800 flex items-center gap-2">
                            <BuildingOffice2Icon class="w-6 h-6 text-slate-400 hidden sm:block" />
                            <span>Jadwal Kelas {{ selectedClass }}</span>
                        </h1>
                        <p class="text-slate-500 font-medium text-sm">Kelola jadwal mingguan untuk kelas ini.</p>
                    </div>
                </div>

                <div class="flex flex-col md:flex-row gap-3">
                    <!-- Version Control Group -->
                    <div
                        class="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-sm overflow-x-auto max-w-full">
                        <Select v-model="selectedVersionId">
                            <SelectTrigger
                                class="w-[200px] sm:w-[260px] border-0 h-10 bg-transparent focus:ring-0 text-slate-700 font-bold hover:bg-slate-50 rounded-lg px-3 mr-1">
                                <span class="text-xs text-slate-400 mr-2 font-medium">Versi:</span>
                                <SelectValue placeholder="Pilih Versi Jadwal" />
                            </SelectTrigger>
                            <SelectContent class="bg-white border-slate-100 shadow-xl">
                                <SelectItem v-for="v in store.activeVersions" :key="v.id" :value="v.id"
                                    class="font-medium text-slate-600 focus:bg-slate-50 focus:text-blue-600 cursor-pointer">
                                    {{ v.year }} {{ v.semester }} - {{ v.name }}
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <div class="w-px h-6 bg-slate-200 mx-1 flex-shrink-0"></div>

                        <button @click="showVersionDialog = true"
                            class="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold mr-1 flex-shrink-0">
                            <CalendarDaysIcon class="w-5 h-5" />
                            <span class="hidden sm:inline">Kelola</span>
                        </button>
                    </div>

                    <!-- Primary Action -->
                    <Button @click="handleAddClick"
                        class="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 h-12 px-6 rounded-xl w-full md:w-auto justify-center">
                        <PlusIcon class="w-5 h-5 mr-2" />
                        Tambah Jadwal
                    </Button>
                </div>
            </div>

            <!-- Schedule Table -->
            <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
                <table class="w-full border-collapse min-w-[1000px]">
                    <thead>
                        <tr>
                            <th
                                class="w-20 p-3 bg-slate-50 border-b border-r border-slate-200 text-xs font-black uppercase text-slate-400 text-center">
                                Jam Ke
                            </th>
                            <th v-for="day in store.days" :key="day"
                                class="p-3 bg-slate-50 border-b border-r border-slate-200 text-sm font-black text-slate-700 text-center min-w-[140px]">
                                {{ day }}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="period in store.periods" :key="period.id">
                            <!-- Time Slot Column -->
                            <td class="bg-slate-50 border-r border-b border-slate-200 p-2 text-center relative group">
                                <div v-if="period.type === 'break'"
                                    class="flex flex-col items-center justify-center h-full py-2">
                                    <div
                                        class="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide mb-1">
                                        Break</div>
                                    <span class="text-xs font-bold text-slate-600">{{ period.time }}</span>
                                </div>
                                <div v-else>
                                    <span
                                        class="block text-lg font-black text-slate-300 group-hover:text-blue-500 transition-colors">{{
                                            period.label }}</span>
                                    <span class="block text-[10px] font-bold text-slate-400 mt-1">{{ period.time
                                    }}</span>
                                </div>
                            </td>

                            <!-- Break Row (Spans all columns) -->
                            <template v-if="period.type === 'break'">
                                <td :colspan="store.days.length"
                                    class="bg-stripes-amber border-b border-slate-200 p-2 text-center text-amber-700/50 font-bold text-xs uppercase tracking-[0.2em]">
                                    {{ period.label }}
                                </td>
                            </template>

                            <!-- Teaching Row cells -->
                            <template v-else>
                                <template v-for="day in store.days" :key="day">
                                    <!-- Only render if NOT merged (isMerged is false) -->
                                    <td v-if="scheduleGrid[period.id] && scheduleGrid[period.id][day] && !scheduleGrid[period.id][day].isMerged"
                                        :rowspan="scheduleGrid[period.id][day].rowSpan"
                                        class="border-r border-b border-slate-100 p-1 align-top h-24 hover:bg-slate-50 transition-colors cursor-pointer relative"
                                        @click="handleSlotClick(period, day)">

                                        <!-- Active Schedule Item -->
                                        <div v-if="scheduleGrid[period.id][day].subjectId"
                                            class="h-full rounded-xl border p-2 flex flex-col justify-between shadow-sm transition-transform hover:scale-[1.02] hover:shadow-md"
                                            :class="scheduleGrid[period.id][day].subjectColor">

                                            <div>
                                                <div class="text-xs font-bold opacity-70 mb-0.5">{{
                                                    scheduleGrid[period.id][day].timeStart }}</div>
                                                <div class="font-[800] text-sm leading-tight">{{
                                                    scheduleGrid[period.id][day].subjectName }}</div>
                                            </div>
                                            <div
                                                class="flex items-center gap-1.5 mt-2 bg-white/40 p-1.5 rounded-lg backdrop-blur-sm">
                                                <div
                                                    class="w-5 h-5 rounded-full bg-white/50 flex items-center justify-center text-[10px] font-bold">
                                                    {{ scheduleGrid[period.id][day].teacherName.charAt(0) }}
                                                </div>
                                                <span class="text-xs font-bold truncate">{{
                                                    scheduleGrid[period.id][day].teacherName }}</span>
                                            </div>
                                        </div>

                                        <!-- Empty Slot -->
                                        <div v-else
                                            class="h-full rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/50 transition-all group-add">
                                            <PlusIcon
                                                class="w-6 h-6 opacity-0 group-add-hover:opacity-100 transition-opacity" />
                                            <span
                                                class="text-[10px] font-bold opacity-0 group-add-hover:opacity-100 mt-1">Isi
                                                Jadwal</span>
                                        </div>
                                    </td>
                                </template>
                            </template>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Add/Edit Dialog -->
        <Dialog :open="showDialog" @update:open="showDialog = $event">
            <DialogContent class="sm:max-w-[500px] border-0 shadow-2xl rounded-3xl p-6">
                <!-- Removed border, rounded-3xl -->
                <DialogHeader>
                    <DialogTitle class="text-xl font-black text-slate-800">{{ modalTitle }}</DialogTitle>
                    <DialogDescription class="text-slate-500 font-medium">
                        {{ modalDescription }}
                    </DialogDescription>
                </DialogHeader>

                <div class="grid gap-5 py-4"> <!-- Increased gap -->
                    <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-1.5">
                            <label class="text-xs font-bold text-slate-400 uppercase tracking-wide">Hari</label>
                            <Select v-model="form.day" :disabled="isEditing">
                                <SelectTrigger
                                    class="w-full border-0 border-b border-slate-200 rounded-none px-0 shadow-none focus:ring-0 font-bold text-slate-700">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem v-for="d in store.days" :key="d" :value="d">
                                        {{ d }}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-1.5">
                            <label class="text-xs font-bold text-slate-400 uppercase tracking-wide">Dari Jam</label>
                            <Select v-model="form.startPeriodId">
                                <SelectTrigger
                                    class="w-full border-0 border-b border-slate-200 rounded-none px-0 shadow-none focus:ring-0 font-bold text-slate-700">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem v-for="p in store.periods.filter(x => x.type === 'teaching')"
                                        :key="p.id" :value="p.id">
                                        Jam ke-{{ p.label }} ({{ p.time }})
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div class="space-y-1.5">
                            <label class="text-xs font-bold text-slate-400 uppercase tracking-wide">Sampai Jam</label>
                            <Select v-model="form.endPeriodId">
                                <SelectTrigger
                                    class="w-full border-0 border-b border-slate-200 rounded-none px-0 shadow-none focus:ring-0 font-bold text-slate-700">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem v-for="p in store.periods.filter(x => x.type === 'teaching')"
                                        :key="p.id" :value="p.id">
                                        Jam ke-{{ p.label }} ({{ p.time }})
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div class="space-y-1.5">
                        <label class="text-xs font-bold text-slate-400 uppercase tracking-wide">Mata Pelajaran</label>
                        <Select v-model="form.subjectId">
                            <SelectTrigger
                                class="w-full border-0 border-b border-slate-200 rounded-none px-0 shadow-none focus:ring-0 font-bold text-slate-700 h-10">
                                <SelectValue placeholder="Pilih Mapel" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem v-for="subj in store.subjects" :key="subj.id" :value="subj.id">
                                    {{ subj.name }}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div class="space-y-1.5">
                        <label class="text-xs font-bold text-slate-400 uppercase tracking-wide">Guru Pengampu</label>
                        <Select v-model="form.teacherId">
                            <SelectTrigger
                                class="w-full border-0 border-b border-slate-200 rounded-none px-0 shadow-none focus:ring-0 font-bold text-slate-700 h-10">
                                <SelectValue placeholder="Pilih Guru" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem v-for="t in store.teachers" :key="t.id" :value="t.id">
                                    {{ t.name }}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter class="flex items-center justify-between sm:justify-between gap-4 mt-2">
                    <button v-if="isEditing" @click="handleDelete"
                        class="text-rose-500 font-bold hover:text-rose-700 text-sm transition-colors flex items-center gap-2">
                        <TrashIcon class="w-4 h-4" />
                        Hapus Jadwal
                    </button>
                    <div v-else></div> <!-- Spacer -->

                    <div class="flex gap-3">
                        <Button variant="ghost" @click="showDialog = false"
                            class="text-slate-500 hover:text-slate-700 font-bold">Batal</Button>
                        <Button @click="handleSave"
                            class="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 rounded-xl px-6">Simpan</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>


        <!-- Version Dialog -->
        <Dialog :open="showVersionDialog" @update:open="showVersionDialog = $event">
            <DialogContent class="sm:max-w-[425px] border-0 shadow-2xl rounded-3xl p-6">
                <DialogHeader>
                    <DialogTitle class="text-xl font-black text-slate-800">Buat Versi Jadwal</DialogTitle>
                    <DialogDescription class="text-slate-500 font-medium">
                        Buat versi jadwal baru (misal: Revisi Januari).
                    </DialogDescription>
                </DialogHeader>

                <div class="grid gap-4 py-4">
                    <div class="space-y-1.5">
                        <label class="text-xs font-bold text-slate-400 uppercase tracking-wide">Tahun Ajaran</label>
                        <Select v-model="versionForm.year">
                            <SelectTrigger class="w-full border-0 border-b border-slate-200 font-bold text-slate-700">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="2023/2024">2023/2024</SelectItem>
                                <SelectItem value="2024/2025">2024/2025</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div class="space-y-1.5">
                        <label class="text-xs font-bold text-slate-400 uppercase tracking-wide">Semester</label>
                        <Select v-model="versionForm.semester">
                            <SelectTrigger class="w-full border-0 border-b border-slate-200 font-bold text-slate-700">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Ganjil">Ganjil</SelectItem>
                                <SelectItem value="Genap">Genap</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div class="space-y-1.5">
                        <label class="text-xs font-bold text-slate-400 uppercase tracking-wide">Nama Versi</label>
                        <input v-model="versionForm.name" placeholder="Contoh: Revisi Januari"
                            class="w-full border-0 border-b border-slate-200 py-2 font-bold text-slate-700 focus:outline-none focus:border-blue-500 placeholder:font-normal" />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" @click="showVersionDialog = false"
                        class="text-slate-500 hover:text-slate-700 font-bold">Batal</Button>
                    <Button @click="handleSaveVersion"
                        class="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/30">Simpan</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
</template>

<style scoped>
.bg-stripes-amber {
    background-color: #fffbeb;
    background-image: linear-gradient(135deg, #fef3c7 25%, transparent 25%, transparent 50%, #fef3c7 50%, #fef3c7 75%, transparent 75%, transparent);
    background-size: 20px 20px;
}
</style>
