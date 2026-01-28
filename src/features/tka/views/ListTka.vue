<script setup>
import { ref, computed } from 'vue';
import {
    PlusIcon,
    PencilSquareIcon,
    TrashIcon,
    ClockIcon,
    DocumentTextIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    EllipsisHorizontalIcon,
    CheckIcon,
    ChevronDownIcon,
    PencilIcon,
    Squares2X2Icon,
    Bars3Icon,
    ClipboardDocumentListIcon,
    KeyIcon,
    Cog6ToothIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon
} from '@heroicons/vue/24/outline';
import Button from '@/components/ui/button/Button.vue';
import { useToast } from '@/composables/useToast';
import Modal from '@/components/common/Modal.vue';

const toast = useToast();

const searchQuery = ref('');
const statusFilter = ref('all'); // all, active, draft
const viewMode = ref('table');
const showStatusDropdown = ref(false);

// Pagination State
const page = ref(1);
const selectedLimit = ref(10);
const limitOptions = [10, 20, 50, 100];

// Exam Controls State
const showExamSettingsModal = ref(false);
const selectedTkaForConfigs = ref(null);
const currentTkaConfigs = ref({
    token: '',
    time_mode: 'global', // global, per_question
    random_questions: true,
    random_answers: false,
    random_all: false
});

// Remedial Filters
const remedialFilterLevel = ref('');
const remedialFilterClass = ref('');

// Options for Remedial Filters (Mock)
const levelOptions = [
    { value: '', label: 'Semua Tingkat' },
    { value: '10', label: 'Kelas 10' },
    { value: '11', label: 'Kelas 11' },
    { value: '12', label: 'Kelas 12' }
];

const classOptions = [
    { value: '', label: 'Semua Kelas' },
    { value: 'A', label: 'Kelas A' },
    { value: 'B', label: 'Kelas B' },
    { value: 'C', label: 'Kelas C' }
];

// Mock Data
const tkaList = ref([
    {
        id: 1,
        title: 'Tes Kemampuan Daswar Tahap 1',
        description: 'Tes untuk seleksi awal masuk kelas unggulan.',
        duration: 90,
        questionCount: 50,
        totalPoints: 100,
        status: 'active',
        createdAt: '2024-03-10',
        author: 'Admin Sekolah',
        token: 'X7K9L2',
        config: { time_mode: 'global', random_q: true, random_a: false, random_all: false }
    },
    {
        id: 2,
        title: 'Evaluasi Semester Ganjil Matematika',
        description: 'Ujian akhir semester untuk mata pelajaran matematika kelas 10.',
        duration: 120,
        questionCount: 40,
        totalPoints: 100,
        status: 'draft',
        createdAt: '2024-03-15',
        author: 'Admin Sekolah',
        token: 'M4T3M',
        config: { time_mode: 'per_question', random_q: true, random_a: true, random_all: true }
    },
    {
        id: 3,
        title: 'Kuis Fisika Bab 1',
        description: 'Kuis harian untuk materi besaran dan satuan.',
        duration: 45,
        questionCount: 15,
        totalPoints: 100,
        status: 'active',
        createdAt: '2024-03-18',
        author: 'Guru Fisika',
        token: 'F1S1K',
        config: { time_mode: 'global', random_q: false, random_a: false, random_all: false }
    },
    // Adding more mock data to demonstrate pagination
    { id: 4, token: 'B10S3', title: 'Ujian Biologi Sel', description: 'Materi sel dan fungsinya.', duration: 60, questionCount: 25, totalPoints: 100, status: 'active', createdAt: '2024-03-20', author: 'Guru Biologi' },
    { id: 5, token: 'K1M1A', title: 'Kuis Kimia Stoikiometri', description: 'Perhitungan kimia dasar.', duration: 45, questionCount: 10, totalPoints: 50, status: 'draft', createdAt: '2024-03-21', author: 'Guru Kimia' },
    { id: 6, token: 'S3J4R', title: 'Sejarah Indonesia Merdeka', description: 'Perjuangan kemerdekaan.', duration: 90, questionCount: 50, totalPoints: 100, status: 'active', createdAt: '2024-03-22', author: 'Guru Sejarah' },
    { id: 7, token: 'G30GR', title: 'Geografi Batuan', description: 'Jenis-jenis batuan.', duration: 60, questionCount: 30, totalPoints: 100, status: 'active', createdAt: '2024-03-23', author: 'Guru Geografi' },
    { id: 8, token: '3NGL1', title: 'Bahasa Inggris Tenses', description: 'Simple Past and Present Perfect.', duration: 60, questionCount: 40, totalPoints: 100, status: 'draft', createdAt: '2024-03-24', author: 'Guru Bahasa Inggris' },
    { id: 9, token: 'K1N3M', title: 'Fisika Kinematika', description: 'Gerak lurus beraturan.', duration: 90, questionCount: 35, totalPoints: 100, status: 'active', createdAt: '2024-03-25', author: 'Guru Fisika' },
    { id: 10, token: 'ALJ4B', title: 'Matematika Aljabar', description: 'Operasi aljabar dasar.', duration: 60, questionCount: 20, totalPoints: 100, status: 'active', createdAt: '2024-03-26', author: 'Guru Matematika' },
    { id: 11, token: 'H4K4S', title: 'PKN Hak Asasi', description: 'Hak Asasi Manusia.', duration: 45, questionCount: 25, totalPoints: 100, status: 'draft', createdAt: '2024-03-27', author: 'Guru PKN' },
    { id: 12, token: 'S3N1B', title: 'Seni Budaya Lukis', description: 'Aliran seni lukis.', duration: 45, questionCount: 20, totalPoints: 100, status: 'active', createdAt: '2024-03-28', author: 'Guru Seni' },
]);

const statusOptions = [
    { value: 'all', label: 'Semua Status' },
    { value: 'active', label: 'Aktif' },
    { value: 'draft', label: 'Draft' }
];

const selectedStatusLabel = computed(() => {
    const option = statusOptions.find(opt => opt.value === statusFilter.value);
    return option ? option.label : 'Pilih Status';
});

const filteredTka = computed(() => {
    let result = tkaList.value;

    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(item =>
            item.title.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query)
        );
    }

    if (statusFilter.value !== 'all') {
        result = result.filter(item => item.status === statusFilter.value);
    }

    return result;
});

// Pagination Logic
const totalItems = computed(() => filteredTka.value.length);
const totalPages = computed(() => Math.ceil(totalItems.value / selectedLimit.value));

const paginatedTka = computed(() => {
    const start = (page.value - 1) * selectedLimit.value;
    const end = start + selectedLimit.value;
    return filteredTka.value.slice(start, end);
});

const changePage = (newPage) => {
    if (newPage > 0 && newPage <= totalPages.value) {
        page.value = newPage;
    }
};

// Exam Controls Logic
const openExamSettings = (tka) => {
    selectedTkaForConfigs.value = tka;
    // Load existing config or defaults
    const config = tka.config || { time_mode: 'global', random_q: true, random_a: false, random_all: false };

    currentTkaConfigs.value = {
        token: tka.token || generateToken(), // Show current or generate
        time_mode: config.time_mode,
        random_questions: config.random_q,
        random_answers: config.random_a,
        random_all: config.random_all
    };
    // Reset filters
    remedialFilterLevel.value = '';
    remedialFilterClass.value = '';

    showExamSettingsModal.value = true;
};

const generateToken = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let token = '';
    for (let i = 0; i < 6; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
};

const updateToken = () => {
    currentTkaConfigs.value.token = generateToken();
};

const saveExamSettings = () => {
    if (!selectedTkaForConfigs.value) return;

    // Simulate Config Saving to Backend
    // In real app, call API

    // Update local mock
    const index = tkaList.value.findIndex(t => t.id === selectedTkaForConfigs.value.id);
    if (index !== -1) {
        tkaList.value[index].token = currentTkaConfigs.value.token;
        tkaList.value[index].config = {
            time_mode: currentTkaConfigs.value.time_mode,
            random_q: currentTkaConfigs.value.random_questions,
            random_a: currentTkaConfigs.value.random_answers,
            random_all: currentTkaConfigs.value.random_all
        };
    }

    toast.success('Pengaturan ujian berhasil disimpan.');
    showExamSettingsModal.value = false;
};

const resetRemedial = () => {
    let msg = 'Apakah Anda yakin ingin mereset hasil ujian?';
    if (remedialFilterLevel.value || remedialFilterClass.value) {
        const levelText = remedialFilterLevel.value ? `Tingkat ${remedialFilterLevel.value}` : '';
        const classText = remedialFilterClass.value ? `Kelas ${remedialFilterClass.value}` : '';
        const join = (levelText && classText) ? ' dan ' : '';
        msg = `Apakah Anda yakin ingin mereset hasil ujian untuk siswa ${levelText}${join}${classText}?`;
    } else {
        msg += ' Ini akan mereset SEMUA siswa (Global Reset).';
    }

    if (confirm(msg)) {
        toast.success('Ujian berhasil direset sesuai filter.');
        // Logic to clear answers would go here
    }
};

const handleDelete = (id) => {
    // For now using simple confirm, could be upgraded to ConfirmDialog later
    if (confirm('Apakah Anda yakin ingin menghapus TKA ini?')) {
        tkaList.value = tkaList.value.filter(item => item.id !== id);
        toast.success('TKA berhasil dihapus');
    }
};

const getStatusBadgeClass = (status) => {
    switch (status) {
        case 'active':
            return 'bg-emerald-50 text-emerald-700 border-emerald-200/50';
        case 'draft':
            return 'bg-gray-50 text-gray-700 border-gray-200/50';
        default:
            return 'bg-gray-100 text-gray-700';
    }
};

const getStatusLabel = (status) => {
    switch (status) {
        case 'active': return 'Aktif';
        case 'draft': return 'Draft';
        default: return status;
    }
};
</script>

<template>
    <div class="space-y-8 pb-12 p-6 max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div class="space-y-1">
                <h1 class="text-3xl font-black text-foreground tracking-tight">Daftar TKA</h1>
                <p class="text-muted-foreground font-medium">Kelola Tes Kemampuan Akademik yang tersedia.</p>
            </div>
            <router-link to="/admin/tka/create">
                <button
                    class="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2">
                    <div class="bg-white/20 p-1 rounded-lg">
                        <PlusIcon class="w-5 h-5 text-white" />
                    </div>
                    Buat TKA Baru
                </button>
            </router-link>
        </div>

        <!-- Filters & View Toggle (Premium Glassmorphism Style) -->
        <div
            class="relative z-40 bg-background/60 backdrop-blur-md border border-primary/10 rounded-3xl p-2 shadow-xl shadow-primary/5">
            <div class="flex flex-col lg:flex-row items-stretch lg:items-center gap-2">
                <!-- Search -->
                <div class="relative flex-1 group">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon
                            class="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                    <input v-model="searchQuery" type="text" placeholder="Cari judul atau deskripsi..."
                        class="block w-full pl-12 pr-4 py-4 bg-primary/5 border-transparent rounded-2xl text-sm font-medium focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary/20 transition-all" />
                </div>

                <div class="flex flex-col sm:flex-row gap-2">
                    <!-- Status Dropdown -->
                    <div class="relative w-full sm:w-56">
                        <button @click="showStatusDropdown = !showStatusDropdown"
                            class="w-full h-full flex items-center justify-between px-5 py-4 bg-primary/5 border-transparent rounded-2xl text-sm font-bold text-foreground hover:bg-primary/10 transition-all text-left">
                            <div class="flex items-center gap-2.5">
                                <FunnelIcon class="w-4 h-4 text-primary" />
                                <span>{{ selectedStatusLabel }}</span>
                            </div>
                            <ChevronDownIcon class="w-4 h-4 text-muted-foreground transition-transform duration-300"
                                :class="{ 'rotate-180': showStatusDropdown }" />
                        </button>

                        <div v-if="showStatusDropdown"
                            class="absolute top-full left-0 right-0 mt-2 z-[60] bg-background border border-primary/10 rounded-2xl shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-200">
                            <div class="space-y-1">
                                <button v-for="opt in statusOptions" :key="opt.value"
                                    @click="statusFilter = opt.value; showStatusDropdown = false"
                                    class="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all"
                                    :class="statusFilter === opt.value ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5 text-muted-foreground hover:text-foreground'">
                                    <span>{{ opt.label }}</span>
                                    <CheckIcon v-if="statusFilter === opt.value" class="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Controls & Info -->
        <div class="flex justify-between items-center gap-3 px-1 mb-4" v-if="totalItems > 0">
            <!-- Page Info (Left) -->
            <div class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Halaman <span class="text-primary font-black">{{ page }}/{{ totalPages }}</span>
                (<span class="text-primary font-black">{{ (page - 1) * selectedLimit + 1 }}-{{ Math.min(page *
                    selectedLimit, totalItems) }}</span>/<span class="text-primary font-black">{{ totalItems }}</span>)
            </div>
        </div>


        <!-- List -->
        <div class="space-y-4">
            <template v-if="paginatedTka.length > 0">
                <div v-for="tka in paginatedTka" :key="tka.id"
                    class="group bg-background border border-primary/10 rounded-3xl p-6 hover:shadow-xl hover:shadow-primary/5 transition-all hover:-translate-y-1 relative overflow-hidden">

                    <!-- Card Header -->
                    <div
                        class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-primary/5 pb-4 mb-5">
                        <div class="flex items-center gap-3">
                            <div class="p-2 bg-primary/5 rounded-xl group-hover:bg-primary/10 transition-colors">
                                <ClipboardDocumentListIcon class="w-5 h-5 text-primary" />
                            </div>
                            <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                <span class="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{{
                                    tka.createdAt }}</span>
                                <div class="hidden sm:block w-1.5 h-1.5 rounded-full bg-primary/20"></div>
                                <span class="text-[11px] font-black uppercase tracking-widest text-primary">{{
                                    tka.author }}</span>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <!-- Token Badge -->
                            <div class="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-lg border border-gray-200 select-all cursor-pointer hover:bg-gray-200 transition-colors"
                                title="Klik untuk menyalin">
                                <KeyIcon class="w-3 h-3 text-gray-500" />
                                <span class="text-[10px] font-mono font-bold text-gray-700 tracking-wider">{{ tka.token
                                    || '------' }}</span>
                            </div>

                            <span
                                class="inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border"
                                :class="getStatusBadgeClass(tka.status)">
                                {{ getStatusLabel(tka.status) }}
                            </span>
                        </div>
                    </div>

                    <!-- Card Body -->
                    <div class="flex flex-col md:flex-row md:items-center gap-6">
                        <div class="flex-1 space-y-2">
                            <h3
                                class="font-black text-xl text-foreground tracking-tight group-hover:text-primary transition-colors">
                                {{ tka.title }}
                            </h3>
                            <p class="text-sm font-medium text-muted-foreground line-clamp-2">
                                {{ tka.description }}
                            </p>

                            <!-- Badges -->
                            <div class="flex flex-wrap gap-3 pt-2">
                                <div
                                    class="flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                                    <DocumentTextIcon class="w-4 h-4 text-primary" />
                                    <span>{{ tka.questionCount }} Soal</span>
                                </div>
                                <div
                                    class="flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                                    <ClockIcon class="w-4 h-4 text-primary" />
                                    <span>{{ tka.duration }} Menit</span>
                                </div>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="flex items-center gap-2 pl-0 md:pl-6 md:border-l border-primary/5 pt-4 md:pt-0">
                            <!-- Settings Button -->
                            <button @click="openExamSettings(tka)"
                                class="p-2.5 bg-gray-50 text-gray-600 hover:bg-gray-600 hover:text-white font-bold text-sm rounded-xl transition-all active:scale-95 flex items-center gap-2"
                                title="Pengaturan Ujian">
                                <Cog6ToothIcon class="w-4 h-4" />
                            </button>

                            <button @click="$router.push(`/admin/tka/detail/${tka.id}`)"
                                class="px-4 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white font-bold text-sm rounded-xl transition-all active:scale-95 flex items-center gap-2">
                                <DocumentTextIcon class="w-4 h-4" />
                                Hasil
                            </button>
                            <button @click="$router.push(`/admin/tka/edit/${tka.id}`)"
                                class="px-4 py-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white font-bold text-sm rounded-xl transition-all active:scale-95 flex items-center gap-2">
                                <PencilIcon class="w-4 h-4" />
                                Edit
                            </button>
                            <button @click="handleDelete(tka.id)"
                                class="px-4 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white font-bold text-sm rounded-xl transition-all active:scale-95 flex items-center gap-2">
                                <TrashIcon class="w-4 h-4" />
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            </template>
            <div v-else class="text-center py-12 bg-background border border-primary/10 rounded-3xl">
                <p class="text-muted-foreground font-medium">Tidak ada data TKA yang ditemukan.</p>
            </div>
        </div>

        <!-- Pagination Controls -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-6 py-8 px-4 border-t border-primary/5"
            v-if="totalItems > 0">

            <!-- Limit Selector (Left) -->
            <div
                class="flex items-center gap-1 bg-background/50 backdrop-blur-sm border border-primary/10 p-1 rounded-2xl shadow-sm order-2 sm:order-1">
                <button v-for="l in limitOptions" :key="l" @click="selectedLimit = l; page = 1"
                    class="px-3 py-2 rounded-xl text-xs font-black transition-all min-w-[3rem]"
                    :class="selectedLimit === l ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'text-muted-foreground hover:bg-primary/5 hover:text-primary'">
                    {{ l }}
                </button>
            </div>

            <!-- Page Navigation (Right) -->
            <div class="flex items-center gap-2 order-1 sm:order-2">
                <button @click="changePage(page - 1)" :disabled="page <= 1"
                    class="p-2 rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary disabled:opacity-50 disabled:hover:bg-transparent transition-all">
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
                        :class="page === p ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-primary/5 hover:text-primary'">
                        {{ p }}
                    </button>
                </div>

                <button @click="changePage(page + 1)" :disabled="page >= totalPages"
                    class="p-2 rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary disabled:opacity-50 disabled:hover:bg-transparent transition-all">
                    <span class="sr-only">Next</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>
    </div>

    <!-- Exam Settings Modal -->
    <Modal :show="showExamSettingsModal" :title="`Pengaturan Ujian - ${selectedTkaForConfigs?.title}`" size="lg"
        @close="showExamSettingsModal = false">
        <div class="space-y-8">

            <!-- Token Section -->
            <div class="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                <h3 class="text-sm font-black uppercase tracking-wider text-slate-500 mb-4">Token Ujian</h3>
                <div class="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div
                        class="flex-1 bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-center sm:text-left">
                        <span class="font-mono text-3xl font-black text-slate-800 tracking-[0.5em]">{{
                            currentTkaConfigs.token }}</span>
                    </div>
                    <button @click="updateToken"
                        class="px-6 py-4 bg-white border border-slate-200 hover:border-primary/50 text-slate-600 hover:text-primary rounded-xl font-bold transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 h-full">
                        <ArrowPathIcon class="w-5 h-5" />
                        Generate Token
                    </button>
                </div>
            </div>

            <!-- Configuration Section -->
            <div class="space-y-6">
                <h3 class="text-sm font-black uppercase tracking-wider text-slate-500">Konfigurasi Soal</h3>

                <!-- Time Mode -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <label class="text-sm font-bold text-foreground">Mode Waktu</label>
                        <div class="flex bg-slate-100 p-1 rounded-xl">
                            <button @click="currentTkaConfigs.time_mode = 'global'"
                                class="flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all"
                                :class="currentTkaConfigs.time_mode === 'global' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'">
                                Total Waktu
                            </button>
                            <button @click="currentTkaConfigs.time_mode = 'per_question'"
                                class="flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all"
                                :class="currentTkaConfigs.time_mode === 'per_question' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'">
                                Per Soal
                            </button>
                        </div>
                        <p class="text-[10px] text-muted-foreground leading-relaxed"
                            v-if="currentTkaConfigs.time_mode === 'global'">
                            Siswa memiliki waktu total untuk mengerjakan seluruh soal sesuai durasi ujian.
                        </p>
                        <p class="text-[10px] text-muted-foreground leading-relaxed" v-else>
                            Waktu akan dibagi rata atau diatur per soal. Siswa tidak bisa kembali ke soal sebelumnya
                            jika
                            waktu habis.
                        </p>
                    </div>

                    <!-- Randomization -->
                    <div class="space-y-3">
                        <label class="text-sm font-bold text-foreground">Pengacakan</label>
                        <label
                            class="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                            <input type="checkbox" v-model="currentTkaConfigs.random_questions"
                                class="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20">
                            <span class="text-sm font-medium">Acak Urutan Soal</span>
                        </label>
                        <label
                            class="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                            <input type="checkbox" v-model="currentTkaConfigs.random_answers"
                                class="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20">
                            <span class="text-sm font-medium">Acak Urutan Jawaban</span>
                        </label>
                    </div>
                </div>

                <label
                    class="flex items-center gap-3 p-3 border border-indigo-100 bg-indigo-50/50 rounded-xl cursor-pointer hover:bg-indigo-50 transition-colors">
                    <input type="checkbox" v-model="currentTkaConfigs.random_all"
                        class="w-4 h-4 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500/20">
                    <span class="text-sm font-bold text-indigo-700">Acak Total (Soal & Jawaban)</span>
                </label>
            </div>

            <!-- Remedial Section (Restored & Enhanced) -->
            <div class="p-6 bg-rose-50 rounded-2xl border border-rose-200 mt-8">
                <div class="flex items-start gap-4">
                    <div class="p-3 bg-white rounded-xl shadow-sm">
                        <ExclamationTriangleIcon class="w-6 h-6 text-rose-600" />
                    </div>
                    <div class="flex-1">
                        <h3 class="text-lg font-black text-rose-800 tracking-tight mb-2">Reset & Remedial Massal</h3>
                        <!-- Filters for Bulk Reset -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                            <select v-model="remedialFilterLevel"
                                class="bg-white border border-rose-200 text-rose-900 text-sm rounded-xl focus:ring-rose-500 focus:border-rose-500 block w-full p-2.5">
                                <option value="">Semua Tingkat</option>
                                <option v-for="l in levelOptions" :key="l.value" :value="l.value">{{ l.value ? l.label :
                                    'Semua Tingkat' }}</option>
                            </select>
                            <select v-model="remedialFilterClass"
                                class="bg-white border border-rose-200 text-rose-900 text-sm rounded-xl focus:ring-rose-500 focus:border-rose-500 block w-full p-2.5">
                                <option value="">Semua Kelas</option>
                                <option v-for="c in classOptions" :key="c.value" :value="c.value">{{ c.value ? c.label :
                                    'Semua Kelas' }}</option>
                            </select>
                        </div>

                        <p class="text-xs font-medium text-rose-600/80 mb-4 leading-relaxed">
                            Aksi ini akan mereset ujian siswa berdasarkan filter di atas. Jika filter kosong, akan
                            mereset
                            <strong>SEMUA SISWA</strong>.
                        </p>
                        <button @click="resetRemedial"
                            class="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-rose-600/20 active:scale-95 transition-all w-full sm:w-auto">
                            Reset Ujian (Sesuai Filter)
                        </button>
                    </div>
                </div>
            </div>

            <!-- Footer Actions -->
            <div class="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button @click="showExamSettingsModal = false"
                    class="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all">Batal</button>
                <button @click="saveExamSettings"
                    class="px-5 py-2.5 rounded-xl font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all">
                    Simpan Pengaturan
                </button>
            </div>
        </div>
    </Modal>
</template>
