<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useClassStore } from '@/stores/class';
import studentClassService from '@/services/studentClassService';
import api from '@/services/api';
import { useToast } from '@/composables/useToast';
import {
    UserGroupIcon,
    UserPlusIcon,
    MagnifyingGlassIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    AcademicCapIcon,
    FunnelIcon,
    ArrowPathIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    XMarkIcon
} from '@heroicons/vue/24/outline';
import FormSelect from '@/components/ui/form/FormSelect.vue';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const classStore = useClassStore();
const toast = useToast();

const showConfirmModal = ref(false);

// Mode: 'bulk' (PPDB) or 'single' (Transfer)
const mode = ref('bulk');

// Data
const students = ref([]);
const selectedStudents = ref([]); // For bulk
const selectedStudent = ref(null); // For single
const selectedClassId = ref('');
const assignmentType = ref('ppdb'); // ppdb, transfer_in, promotion
const loading = ref(false);

// Filter
const studentSearch = ref('');

// Options
const assignmentTypeOptions = [
    { value: 'ppdb', label: 'PPDB (Siswa Baru)' },
    { value: 'transfer_in', label: 'Pindahan Masuk' },
    { value: 'promotion', label: 'Kenaikan Kelas' }
];

// Fetch initial data
onMounted(async () => {
    await classStore.fetchClasses();
    await fetchStudents();
});

// Fetch students (mock)
const fetchStudents = async () => {
    try {
        const response = await api.get('/students');
        students.value = response.data.data || [];
    } catch (error) {
        console.error('Error fetching students:', error);
        toast.error('Gagal mengambil data siswa');
    }
};

// Pagination
const currentPage = ref(1);
const itemsPerPage = 10;

// Filtered students (Search only)
const searchResultStudents = computed(() => {
    if (!studentSearch.value) return students.value;
    const query = studentSearch.value.toLowerCase();
    return students.value.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.nis?.includes(query)
    );
});

// Paginated Students
const paginatedStudents = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return searchResultStudents.value.slice(start, end);
});

// Total Pages
const totalPages = computed(() => Math.ceil(searchResultStudents.value.length / itemsPerPage));

// Reset page on search
watch(studentSearch, () => {
    currentPage.value = 1;
});

// Helpers
const nextPage = () => {
    if (currentPage.value < totalPages.value) currentPage.value++;
};

const prevPage = () => {
    if (currentPage.value > 1) currentPage.value--;
};

// Destination Class options (mapped from store)
const classOptions = computed(() => {
    return classStore.activeClasses.map(c => ({
        value: c.id,
        label: `${c.name} (${c.currentStudents}/${c.capacity})`
    }));
});

// Selected Class Data
const selectedClass = computed(() => {
    return classStore.getClassById(selectedClassId.value);
});

// Validation: Check capacity
const isCapacityValid = computed(() => {
    if (!selectedClass.value) return true;

    const countToAdd = mode.value === 'bulk' ? selectedStudents.value.length : 1;
    const remainingParams = selectedClass.value.capacity - selectedClass.value.currentStudents;

    // Check if remaining capacity is enough
    return remainingParams >= countToAdd;
});

// Handle Bulk Checkbox
const toggleStudentSelection = (student) => {
    const index = selectedStudents.value.findIndex(s => s.id === student.id);
    if (index === -1) {
        selectedStudents.value.push(student);
    } else {
        selectedStudents.value.splice(index, 1);
    }
};

// Handle Select All (filtered only)
const toggleSelectAll = () => {
    const allIds = searchResultStudents.value.map(s => s.id);
    const allSelected = allIds.every(id => selectedStudents.value.some(s => s.id === id));

    if (allSelected) {
        // Deselect all visible
        selectedStudents.value = selectedStudents.value.filter(s => !allIds.includes(s.id));
    } else {
        // Select all visible (that aren't already selected)
        const toAdd = searchResultStudents.value.filter(s => !selectedStudents.value.some(sel => sel.id === s.id));
        selectedStudents.value = [...selectedStudents.value, ...toAdd];
    }
};

const openConfirmModal = () => {
    if (mode.value === 'bulk' && selectedStudents.value.length === 0) {
        toast.error('Pilih minimal satu siswa');
        return;
    }
    if (mode.value === 'single' && !selectedStudent.value) {
        toast.error('Pilih siswa terlebih dahulu');
        return;
    }
    showConfirmModal.value = true;
};

// Submit Assignment
const handleSubmit = async () => {
    if (!selectedClassId.value) {
        toast.error('Silakan pilih kelas tujuan');
        return;
    }

    if (!isCapacityValid.value) {
        toast.error('Kapasitas kelas tidak mencukupi');
        return;
    }

    loading.value = true;
    try {
        if (mode.value === 'bulk') {
            await studentClassService.bulkAssignStudents(
                selectedStudents.value.map(s => s.id),
                selectedClassId.value,
                selectedClass.value.academicYear
            );
            toast.success(`${selectedStudents.value.length} siswa berhasil ditugaskan`);
            selectedStudents.value = [];
        } else {
            await studentClassService.assignStudentToClass(
                selectedStudent.value.id,
                selectedClassId.value,
                selectedClass.value.academicYear,
                assignmentType.value
            );
            toast.success(`Siswa berhasil ditugaskan`);
            selectedStudent.value = null;
        }

        await classStore.fetchClasses();
        showConfirmModal.value = false;
        selectedClassId.value = ''; // Reset selection
    } catch (error) {
        console.error('Assignment error:', error);
        toast.error(error.message || 'Gagal menugaskan siswa');
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div class="min-h-screen pb-20">
        <!-- Main Header -->
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 group">
            <div class="space-y-2">
                <span
                    class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[11px] font-black uppercase tracking-widest text-blue-600 border border-blue-100">
                    <span class="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                    Akademik
                </span>
                <h2 class="text-4xl font-black text-foreground tracking-tight">Penugasan Siswa</h2>
                <p class="text-base text-muted-foreground font-medium max-w-lg leading-relaxed">
                    Kelola penempatan siswa baru maupun pindahan ke dalam kelas dengan mudah dan efisien.
                </p>
            </div>

            <!-- Mode Switcher -->
            <div class="bg-slate-100 p-1.5 rounded-2xl flex relative overflow-hidden">
                <div class="absolute inset-y-1.5 w-[50%] bg-white shadow-lg shadow-black/5 rounded-xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
                    :class="mode === 'bulk' ? 'left-1.5 translate-x-0' : 'left-0 translate-x-[96%]'"></div>

                <button @click="mode = 'bulk'"
                    class="relative z-10 px-6 py-2.5 rounded-xl text-sm font-black transition-colors duration-300 w-36"
                    :class="mode === 'bulk' ? 'text-blue-600' : 'text-muted-foreground hover:text-foreground'">
                    Massal
                </button>
                <button @click="mode = 'single'"
                    class="relative z-10 px-6 py-2.5 rounded-xl text-sm font-black transition-colors duration-300 w-36"
                    :class="mode === 'single' ? 'text-blue-600' : 'text-muted-foreground hover:text-foreground'">
                    Satuan
                </button>
            </div>
        </div>

        <div class="flex flex-col gap-8 pb-32">

            <!-- Main Content Area -->
            <div class="flex flex-col gap-6">

                <!-- Filter Bar & Selection Stats -->
                <div
                    class="sticky top-[88px] z-20 flex flex-col md:flex-row gap-4 md:items-center justify-between bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl shadow-blue-600/5 rounded-[32px] p-2 pr-4 transition-all duration-300">
                    <!-- Search -->
                    <div class="flex-1 flex items-center gap-2 pl-4">
                        <MagnifyingGlassIcon class="w-6 h-6 text-blue-600" />
                        <input v-model="studentSearch" type="text"
                            class="flex-1 bg-transparent border-none text-base font-medium placeholder:text-muted-foreground/50 focus:ring-0 py-3"
                            placeholder="Cari siswa berdasarkan nama atau NIS..." />
                    </div>

                    <!-- Actions -->
                    <div
                        class="flex items-center gap-3 pl-2 md:pl-0 border-t md:border-t-0 border-blue-50 pt-2 md:pt-0">
                        <div v-if="mode === 'bulk'" class="flex items-center gap-3 px-3">
                            <span class="text-xs font-bold text-muted-foreground mr-2">
                                {{ selectedStudents.length }} dari {{ searchResultStudents.length }}
                            </span>
                            <button @click="toggleSelectAll"
                                class="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-blue-50 transition-all text-xs font-black text-blue-600 border border-blue-100 bg-white">
                                <div class="w-4 h-4 rounded border flex items-center justify-center transition-colors"
                                    :class="selectedStudents.length >= searchResultStudents.length && searchResultStudents.length > 0 ? 'bg-blue-600 border-blue-600' : 'border-blue-200 bg-white'">
                                    <CheckCircleIcon
                                        v-if="selectedStudents.length >= searchResultStudents.length && searchResultStudents.length > 0"
                                        class="w-3 h-3 text-white" />
                                </div>
                                Pilih Semua
                            </button>
                        </div>

                        <div class="h-8 w-px bg-blue-100 mx-1 hidden md:block"></div>

                        <button
                            class="p-3 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-all">
                            <FunnelIcon class="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <!-- Student Grid -->
                <div class="bg-white/40 backdrop-blur-md rounded-[40px] border border-white/40 p-4 min-h-[500px]">
                    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        <div v-for="student in paginatedStudents" :key="student.id"
                            @click="mode === 'bulk' ? toggleStudentSelection(student) : (selectedStudent = student)"
                            class="group relative bg-white hover:bg-white border text-left border-transparent hover:border-blue-100 rounded-[24px] p-4 transition-all duration-300 ease-out cursor-pointer shadow-sm hover:shadow-md hover:shadow-blue-600/5 ring-1 ring-slate-100"
                            :class="{
                                '!ring-2 !ring-blue-600 !bg-blue-50/10': (mode === 'bulk' ? selectedStudents.some(s => s.id === student.id) : selectedStudent?.id === student.id)
                            }">

                            <div class="flex items-center gap-4">
                                <!-- Avatar -->
                                <div class="relative w-12 h-12 shrink-0">
                                    <div
                                        class="w-full h-full rounded-2xl overflow-hidden shadow-inner bg-blue-50 flex items-center justify-center text-lg font-black text-blue-600 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-3">
                                        {{ student.name.charAt(0) }}
                                    </div>

                                    <!-- Selection Badge -->
                                    <div class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-600 rounded-full text-white flex items-center justify-center shadow-lg shadow-blue-600/30 transition-all duration-300"
                                        :class="(mode === 'bulk' ? selectedStudents.some(s => s.id === student.id) : selectedStudent?.id === student.id) ? 'opacity-100 scale-100' : 'opacity-0 scale-50'">
                                        <CheckCircleIcon class="w-3.5 h-3.5" />
                                    </div>
                                </div>

                                <div class="flex-1 min-w-0">
                                    <h4 class="font-bold text-base text-foreground truncate transition-colors"
                                        :class="(mode === 'bulk' ? selectedStudents.some(s => s.id === student.id) : selectedStudent?.id === student.id) ? 'text-blue-600' : ''">
                                        {{ student.name }}
                                    </h4>
                                    <div class="flex items-center gap-2 mt-1 text-xs text-muted-foreground font-medium">
                                        <span
                                            class="font-mono bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[10px]">
                                            {{ student.nis }}
                                        </span>
                                        <span class="w-1 h-1 rounded-full bg-slate-300"></span>
                                        <span class="capitalize">{{ student.gender === 'L' ? 'Laki-laki' : 'Perempuan'
                                            }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Empty State -->
                    <div v-if="paginatedStudents.length === 0"
                        class="flex flex-col items-center justify-center py-20 text-center">
                        <div class="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                            <UserGroupIcon class="w-10 h-10 text-blue-300" />
                        </div>
                        <h3 class="text-lg font-bold text-foreground">Tidak ada siswa ditemukan</h3>
                        <p class="text-muted-foreground text-sm max-w-xs mx-auto mt-2">
                            Coba ubah kata kunci pencarian atau filter anda.
                        </p>
                    </div>

                    <!-- Pagination Controls -->
                    <div v-if="totalPages > 1"
                        class="px-4 py-6 border-t border-blue-50 flex items-center justify-between mt-8">
                        <button @click="prevPage" :disabled="currentPage === 1"
                            class="p-2 rounded-xl hover:bg-blue-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                            <ChevronLeftIcon class="w-5 h-5 text-foreground" />
                        </button>
                        <span class="text-xs font-bold text-muted-foreground">
                            Halaman {{ currentPage }} dari {{ totalPages }}
                        </span>
                        <button @click="nextPage" :disabled="currentPage === totalPages"
                            class="p-2 rounded-xl hover:bg-blue-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                            <ChevronRightIcon class="w-5 h-5 text-foreground" />
                        </button>
                    </div>
                </div>

            </div>

        </div>

        <!-- Floating Action Button (Clean Look) -->
        <div class="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 transition-all duration-500"
            :class="(mode === 'bulk' ? selectedStudents.length > 0 : selectedStudent) ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'">
            <button @click="openConfirmModal"
                class="bg-blue-600 hover:bg-blue-700 text-white pl-6 pr-8 py-3 rounded-full shadow-2xl shadow-blue-600/30 flex items-center gap-3 transition-all hover:scale-105 active:scale-95 group">
                <div class="bg-white/20 p-1.5 rounded-full">
                    <UserPlusIcon class="w-5 h-5" />
                </div>
                <div class="flex flex-col items-start px-0.5">
                    <span
                        class="text-[10px] font-medium opacity-80 uppercase tracking-wider leading-none mb-0.5">Lanjutkan</span>
                    <span class="text-sm font-black leading-none">
                        {{ mode === 'bulk' ? `${selectedStudents.length} Siswa Terpilih` : 'Proses Siswa' }}
                    </span>
                </div>
                <ArrowPathIcon class="w-5 h-5 ml-2 group-hover:rotate-180 transition-transform duration-500" />
            </button>
        </div>

        <!-- Confirmation Modal -->
        <Dialog :open="showConfirmModal" @update:open="showConfirmModal = $event">
            <DialogContent class="sm:max-w-md rounded-[32px] p-0 overflow-hidden border-none shadow-2xl">
                <div class="bg-blue-600 p-6 text-white relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <DialogHeader>
                        <DialogTitle class="text-2xl font-black text-white flex items-center gap-2 relative z-10">
                            <AcademicCapIcon class="w-7 h-7" />
                            Pilih Kelas Tujuan
                        </DialogTitle>
                        <DialogDescription class="text-blue-100 relative z-10">
                            Tentukan kelas target untuk {{ mode === 'bulk' ? `${selectedStudents.length} siswa terpilih`
                            : selectedStudent?.name }}.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div class="p-6 space-y-6">
                    <div class="space-y-4">
                        <div class="space-y-2">
                            <label class="text-sm font-bold text-muted-foreground">Kelas Tujuan</label>
                            <FormSelect v-model="selectedClassId" :options="classOptions"
                                class="bg-slate-50 border-slate-200 focus:border-blue-600 rounded-xl"
                                placeholder="Pilih Kelas..." />
                        </div>

                        <div v-if="mode === 'single'" class="space-y-2 animate-in fade-in zoom-in">
                            <label class="text-sm font-bold text-muted-foreground">Jenis Penugasan</label>
                            <FormSelect v-model="assignmentType" :options="assignmentTypeOptions"
                                class="bg-slate-50 border-slate-200 focus:border-blue-600 rounded-xl" />
                        </div>

                        <!-- Capacity Check -->
                        <div v-if="selectedClass" class="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                            <div class="flex justify-between items-center mb-2">
                                <span class="text-xs font-bold text-muted-foreground uppercase tracking-wider">Kapasitas
                                    Kelas</span>
                                <span class="text-xs font-black"
                                    :class="isCapacityValid ? 'text-emerald-600' : 'text-rose-600'">
                                    {{ isCapacityValid ? 'Tersedia' : 'Penuh' }}
                                </span>
                            </div>

                            <div class="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-2">
                                <div class="h-full rounded-full transition-all duration-500"
                                    :class="isCapacityValid ? 'bg-blue-600' : 'bg-rose-500'"
                                    :style="{ width: `${(selectedClass.currentStudents / selectedClass.capacity) * 100}%` }">
                                </div>
                            </div>
                            <p class="text-[11px] text-muted-foreground">
                                Terisi <strong class="text-foreground">{{ selectedClass.currentStudents }}</strong> dari
                                {{ selectedClass.capacity }} siswa.
                                (Sisa: {{ selectedClass.capacity - selectedClass.currentStudents }})
                            </p>
                        </div>
                    </div>

                    <div v-if="!isCapacityValid && selectedClass"
                        class="flex items-start gap-3 p-4 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
                        <ExclamationTriangleIcon class="w-5 h-5 shrink-0" />
                        <p class="text-sm font-medium leading-tight">
                            Kapasitas kelas tidak mencukupi untuk menampung jumlah siswa yang dipilih.
                        </p>
                    </div>
                </div>

                <DialogFooter class="p-6 pt-0 sm:justify-between gap-4">
                    <button @click="showConfirmModal = false" type="button"
                        class="flex-1 px-4 py-3 rounded-xl font-bold text-muted-foreground hover:bg-slate-100 transition-colors">
                        Batal
                    </button>
                    <button @click="handleSubmit" :disabled="loading || !selectedClassId || !isCapacityValid"
                        class="flex-[2] bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold py-3 shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2">
                        <span v-if="loading" class="loading loading-spinner text-white loading-sm"></span>
                        {{ loading ? 'Memproses...' : 'Konfirmasi Penugasan' }}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
</template>
