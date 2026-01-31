<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
    ArrowLeftIcon,
    CalendarIcon,
    ClockIcon,
    DocumentTextIcon,
    FunnelIcon,
    CheckIcon,
    ChevronDownIcon,
    MagnifyingGlassIcon,
    EyeIcon,
    CheckBadgeIcon,
    XMarkIcon,
    UsersIcon,
    UserMinusIcon,
    BellIcon,
    KeyIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon,
    Cog6ToothIcon
} from '@heroicons/vue/24/outline';
import Button from '@/components/ui/button/Button.vue';
import { useToast } from '@/composables/useToast';
import Modal from '@/components/common/Modal.vue';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const id = route.params.id;

// Tabs
const activeTab = ref('results'); // 'overview', 'results', 'not_submitted', 'questions'

// Mock Data TKA
const tkaData = ref({
    id: id,
    title: id == 1 ? 'Tes Kemampuan Daswar Tahap 1' : 'Evaluasi Semester Ganjil Matematika',
    description: id == 1 ? 'Tes untuk seleksi awal masuk kelas unggulan.' : 'Ujian akhir semester.',
    duration: 90,
    questionCount: 50,
    totalPoints: 100,
    status: 'active',
    createdAt: '2024-03-10',
    author: 'Admin Sekolah',
    passing_grade: 75
});

// Mock Questions (Overview)
const questions = ref([
    { id: 1, text: 'Apa ibukota Indonesia?', type: 'Pilihan Ganda', point: 10, answer: 'Jakarta' },
    { id: 2, text: 'Jelaskan pengertian TKA!', type: 'Esai', point: 20, answer: '-' },
    { id: 3, text: '2 + 2 = ?', type: 'Pilihan Ganda', point: 10, answer: '4' },
]);

// Filters
const filterLevel = ref('');
const filterClass = ref('');
const filterMajor = ref('');
const searchQuery = ref('');

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

const majorOptions = [
    { value: '', label: 'Semua Jurusan' },
    { value: 'IPA', label: 'MIPA' },
    { value: 'IPS', label: 'IPS' }
];

// Dropdown States
const showLevelDropdown = ref(false);
const showClassDropdown = ref(false);
const showMajorDropdown = ref(false);

// Mock Student Results with Tokens
const results = ref([
    { id: 101, name: 'Budi Santoso', nis: '12345', class: '10 MIPA A', level: '10', major: 'IPA', score: 85, status: 'Lulus', submittedAt: '2024-03-10 10:30', token: 'BD123' },
    { id: 102, name: 'Siti Aminah', nis: '12346', class: '10 MIPA A', level: '10', major: 'IPA', score: 60, status: 'Tidak Lulus', submittedAt: '2024-03-10 10:35', token: 'ST456' },
    { id: 103, name: 'Rudi Hermawan', nis: '12347', class: '10 IPS B', level: '10', major: 'IPS', score: 90, status: 'Lulus', submittedAt: '2024-03-10 10:40', token: 'RD789' },
    { id: 104, name: 'Dewi Lestari', nis: '12348', class: '11 MIPA A', level: '11', major: 'IPA', score: null, status: 'Menunggu Koreksi', submittedAt: '2024-03-10 11:00', token: 'DW012' },
    { id: 105, name: 'Andi Wijaya', nis: '12349', class: '12 IPS A', level: '12', major: 'IPS', score: 45, status: 'Tidak Lulus', submittedAt: '2024-03-10 11:15', token: 'AN345' },
]);

// Mock Not Submitted Students
const notSubmittedStudents = ref([
    { id: 201, name: 'Eko Prasetyo', nis: '12350', class: '10 MIPA A', level: '10', major: 'IPA', token: 'EK678' },
    { id: 202, name: 'Fani Rahmawati', nis: '12351', class: '10 MIPA A', level: '10', major: 'IPA', token: 'FN901' },
    { id: 203, name: 'Gilang Ramadhan', nis: '12352', class: '10 IPS B', level: '10', major: 'IPS', token: 'GL234' },
]);

// Stats Computed
const totalSubmitted = computed(() => results.value.length);
const totalNotSubmitted = computed(() => notSubmittedStudents.value.length);

// Helper for labels
const getFilterLabel = (val, options, defaultLabel) => {
    const opt = options.find(o => o.value === val);
    return opt ? opt.label : defaultLabel;
};

// Filtered Results
const filteredResults = computed(() => {
    return results.value.filter(item => {
        const matchSearch = item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            item.nis.includes(searchQuery.value);
        const matchLevel = !filterLevel.value || item.level === filterLevel.value;
        const matchClass = !filterClass.value || item.class.includes(filterClass.value); // Simple check
        const matchMajor = !filterMajor.value || item.major === filterMajor.value;

        return matchSearch && matchLevel && matchClass && matchMajor;
    });
});

// Filtered Not Submitted
const filteredNotSubmitted = computed(() => {
    return notSubmittedStudents.value.filter(item => {
        const matchSearch = item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            item.nis.includes(searchQuery.value);
        const matchLevel = !filterLevel.value || item.level === filterLevel.value;
        const matchClass = !filterClass.value || item.class.includes(filterClass.value);
        const matchMajor = !filterMajor.value || item.major === filterMajor.value;

        return matchSearch && matchLevel && matchClass && matchMajor;
    });
});


// Pagination Logic (Reusable)
const usePagination = (dataRef, itemsPerPage = 10) => {
    const page = ref(1);
    const limit = ref(itemsPerPage);
    const limitOptions = [10, 20, 50, 100];

    const totalItems = computed(() => dataRef.value.length);
    const totalPages = computed(() => Math.ceil(totalItems.value / limit.value));

    const paginatedData = computed(() => {
        const start = (page.value - 1) * limit.value;
        return dataRef.value.slice(start, start + limit.value);
    });

    const changePage = (newPage) => {
        if (newPage > 0 && newPage <= totalPages.value) {
            page.value = newPage;
        }
    };

    return { page, limit, limitOptions, totalItems, totalPages, paginatedData, changePage };
};

const resultsPagination = usePagination(filteredResults);
const notSubmittedPagination = usePagination(filteredNotSubmitted);

// Grading Modal
const showGradingModal = ref(false);
const selectedStudent = ref(null);
const studentAnswers = ref([]);

const openGrading = (student) => {
    selectedStudent.value = student;
    studentAnswers.value = [
        { qId: 1, question: 'Apa ibukota Indonesia?', type: 'Pilihan Ganda', answer: 'Jakarta', key: 'Jakarta', isCorrect: true, maxPoint: 10, point: 10 },
        { qId: 2, question: 'Jelaskan pengertian TKA!', type: 'Esai', answer: 'TKA adalah Tes Kemampuan Akademik.', key: '-', isCorrect: null, maxPoint: 20, point: 0, comment: '' },
        { qId: 3, question: '2 + 2 = ?', type: 'Pilihan Ganda', answer: '5', key: '4', isCorrect: false, maxPoint: 10, point: 0 },
    ];
    showGradingModal.value = true;
};

const saveGrading = () => {
    const totalScore = studentAnswers.value.reduce((sum, a) => sum + (parseInt(a.point) || 0), 0);
    const maxScore = studentAnswers.value.reduce((sum, a) => sum + a.maxPoint, 0);
    const finalScore = Math.round((totalScore / maxScore) * 100);

    const index = results.value.findIndex(s => s.id === selectedStudent.value.id);
    if (index !== -1) {
        results.value[index].score = finalScore;
        results.value[index].status = finalScore >= tkaData.value.passing_grade ? 'Lulus' : 'Tidak Lulus';
    }

    toast.success(`Nilai untuk ${selectedStudent.value.name} berhasil disimpan.`);
    showGradingModal.value = false;
};

const sendReminder = (student) => {
    toast.success(`Pengingat berhasil dikirim ke ${student.name}`);
};

// Token Modal
const showTokenModal = ref(false);
const selectedStudentForToken = ref(null);
const tokenDetails = ref({
    type: 'Dynamic',
    expiry: '2 Jam',
    customExpiry: '',
    generatedAt: null
});

const tokenTypeOptions = ['Static', 'Dynamic'];
const tokenExpiryOptions = ['30 Menit', '1 Jam', '2 Jam', '4 Jam', '1 Hari'];

const openTokenModal = (student) => {
    selectedStudentForToken.value = student;
    tokenDetails.value = {
        type: 'Dynamic',
        expiry: '2 Jam',
        generatedAt: new Date().toLocaleString()
    };
    showTokenModal.value = true;
};

const regenerateStudentToken = () => {
    if (!selectedStudentForToken.value) return;

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let newToken = '';
    for (let i = 0; i < 6; i++) {
        newToken += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const target = results.value.find(s => s.id === selectedStudentForToken.value.id) ||
        notSubmittedStudents.value.find(s => s.id === selectedStudentForToken.value.id);

    if (target) {
        target.token = newToken;
        selectedStudentForToken.value.token = newToken;
    }

    toast.success(`Token (${tokenDetails.value.type}, ${tokenDetails.value.expiry}) berhasil digenerate: ${newToken}`);
    tokenDetails.value.generatedAt = new Date().toLocaleString();
};

const resetStudentExam = (student) => {
    if (confirm(`Apakah Anda yakin ingin mereset ujian untuk ${student.name}? Semua jawaban akan dihapus.`)) {
        results.value = results.value.filter(s => s.id !== student.id);

        const resetData = {
            id: student.id,
            name: student.name,
            nis: student.nis,
            class: student.class,
            level: student.level,
            major: student.major,
            token: student.token
        };

        if (!notSubmittedStudents.value.find(s => s.id === student.id)) {
            notSubmittedStudents.value.push(resetData);
        }

        toast.success(`Ujian ${student.name} berhasil direset. Siswa dapat mengerjakan ulang.`);
    }
};

const getStatusClass = (status) => {
    if (status === 'Lulus') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (status === 'Tidak Lulus') return 'bg-rose-50 text-rose-700 border-rose-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
};
</script>

<template>
    <div class="space-y-6 pb-12 p-6 max-w-7xl mx-auto">
        <!-- Back Button -->
        <button @click="router.back()"
            class="flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-4">
            <ArrowLeftIcon class="w-4 h-4 mr-1" />
            Kembali ke Daftar TKA
        </button>

        <!-- Header -->
        <div
            class="bg-background border border-primary/10 rounded-3xl p-8 shadow-xl shadow-primary/5 relative overflow-hidden">
            <div
                class="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2">
            </div>

            <div class="relative z-10 flex flex-col md:flex-row justify-between gap-6">
                <div>
                    <h1 class="text-3xl font-black text-foreground tracking-tight mb-2">{{ tkaData.title }}</h1>
                    <p class="text-muted-foreground max-w-2xl">{{ tkaData.description }}</p>

                    <div class="flex flex-wrap gap-4 mt-6">
                        <div
                            class="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-xl border border-primary/10">
                            <ClockIcon class="w-4 h-4 text-primary" />
                            <span class="text-sm font-bold text-gray-700">{{ tkaData.duration }} Menit</span>
                        </div>
                        <div
                            class="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-xl border border-primary/10">
                            <DocumentTextIcon class="w-4 h-4 text-primary" />
                            <span class="text-sm font-bold text-gray-700">{{ tkaData.questionCount }} Soal</span>
                        </div>
                        <div
                            class="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-xl border border-primary/10">
                            <CheckBadgeIcon class="w-4 h-4 text-primary" />
                            <span class="text-sm font-bold text-gray-700">KKM: {{ tkaData.passing_grade }}</span>
                        </div>
                    </div>
                </div>
                <div class="flex flex-col items-end justify-center">
                    <div class="text-right">
                        <p class="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Dibuat Oleh
                        </p>
                        <p class="font-bold text-foreground">{{ tkaData.author }}</p>
                        <p class="text-xs text-muted-foreground mt-1">{{ tkaData.createdAt }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Stats Widgets -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
                class="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm flex items-center justify-between relative overflow-hidden group">
                <div
                    class="absolute right-0 top-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl translate-x-1/3 -translate-y-1/2 transition-transform group-hover:scale-110">
                </div>
                <div class="relative z-10">
                    <p class="text-xs font-black uppercase tracking-widest text-emerald-600/70 mb-1">Sudah Mengerjakan
                    </p>
                    <p class="text-4xl font-black text-emerald-700">{{ totalSubmitted }} <span
                            class="text-base font-medium text-emerald-600/70">Siswa</span></p>
                </div>
                <div class="p-4 bg-emerald-100/50 rounded-2xl relative z-10">
                    <UsersIcon class="w-8 h-8 text-emerald-600" />
                </div>
            </div>

            <div
                class="bg-white border border-rose-100 rounded-3xl p-6 shadow-sm flex items-center justify-between relative overflow-hidden group">
                <div
                    class="absolute right-0 top-0 w-32 h-32 bg-rose-50 rounded-full blur-2xl translate-x-1/3 -translate-y-1/2 transition-transform group-hover:scale-110">
                </div>
                <div class="relative z-10">
                    <p class="text-xs font-black uppercase tracking-widest text-rose-600/70 mb-1">Belum Mengerjakan</p>
                    <p class="text-4xl font-black text-rose-700">{{ totalNotSubmitted }} <span
                            class="text-base font-medium text-rose-600/70">Siswa</span></p>
                </div>
                <div class="p-4 bg-rose-100/50 rounded-2xl relative z-10">
                    <UserMinusIcon class="w-8 h-8 text-rose-600" />
                </div>
            </div>
        </div>

        <!-- Tabs -->
        <div class="flex gap-2 border-b border-gray-200 mb-6 overflow-x-auto pb-1">
            <button @click="activeTab = 'results'"
                class="px-6 py-3 font-bold text-sm border-b-2 transition-colors duration-200 whitespace-nowrap"
                :class="activeTab === 'results' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'">
                Hasil Siswa
            </button>
            <button @click="activeTab = 'not_submitted'"
                class="px-6 py-3 font-bold text-sm border-b-2 transition-colors duration-200 whitespace-nowrap"
                :class="activeTab === 'not_submitted' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'">
                Belum Mengerjakan
            </button>
            <button @click="activeTab = 'questions'"
                class="px-6 py-3 font-bold text-sm border-b-2 transition-colors duration-200 whitespace-nowrap"
                :class="activeTab === 'questions' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'">
                Ringkasan Soal
            </button>
        </div>

        <!-- Filter Bar (Shared) -->
        <div v-if="activeTab !== 'questions'"
            class="bg-background/60 backdrop-blur-md border border-primary/10 rounded-3xl p-2 shadow-sm flex flex-col xl:flex-row gap-2 mb-6">
            <!-- Search -->
            <div class="relative flex-1 group min-w-[300px]">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon
                        class="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <input v-model="searchQuery" type="text" placeholder="Cari nama atau NIS..."
                    class="block w-full pl-12 pr-4 py-3 bg-primary/5 border-transparent rounded-2xl text-sm font-medium focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary/20 transition-all" />
            </div>

            <!-- Filters -->
            <div class="flex flex-wrap gap-2 flex-1">
                <!-- Level Filter -->
                <div class="relative flex-1 min-w-[140px]">
                    <button @click="showLevelDropdown = !showLevelDropdown"
                        class="w-full flex items-center justify-between px-4 py-3 bg-primary/5 rounded-2xl text-sm font-bold text-foreground hover:bg-primary/10 transition-all text-left">
                        <span>{{ getFilterLabel(filterLevel, levelOptions, 'Tingkat') }}</span>
                        <ChevronDownIcon class="w-4 h-4 text-muted-foreground" />
                    </button>
                    <div v-if="showLevelDropdown"
                        class="absolute top-full z-50 w-full mt-2 bg-background border border-primary/10 rounded-xl shadow-lg p-1">
                        <button v-for="opt in levelOptions" :key="opt.value"
                            @click="filterLevel = opt.value; showLevelDropdown = false"
                            class="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-primary/5">
                            {{ opt.label }}
                        </button>
                    </div>
                </div>

                <!-- Class Filter -->
                <div class="relative flex-1 min-w-[140px]">
                    <button @click="showClassDropdown = !showClassDropdown"
                        class="w-full flex items-center justify-between px-4 py-3 bg-primary/5 rounded-2xl text-sm font-bold text-foreground hover:bg-primary/10 transition-all text-left">
                        <span>{{ getFilterLabel(filterClass, classOptions, 'Kelas') }}</span>
                        <ChevronDownIcon class="w-4 h-4 text-muted-foreground" />
                    </button>
                    <div v-if="showClassDropdown"
                        class="absolute top-full z-50 w-full mt-2 bg-background border border-primary/10 rounded-xl shadow-lg p-1">
                        <button v-for="opt in classOptions" :key="opt.value"
                            @click="filterClass = opt.value; showClassDropdown = false"
                            class="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-primary/5">
                            {{ opt.label }}
                        </button>
                    </div>
                </div>

                <!-- Major Filter -->
                <div class="relative flex-1 min-w-[140px]">
                    <button @click="showMajorDropdown = !showMajorDropdown"
                        class="w-full flex items-center justify-between px-4 py-3 bg-primary/5 rounded-2xl text-sm font-bold text-foreground hover:bg-primary/10 transition-all text-left">
                        <span>{{ getFilterLabel(filterMajor, majorOptions, 'Jurusan') }}</span>
                        <ChevronDownIcon class="w-4 h-4 text-muted-foreground" />
                    </button>
                    <div v-if="showMajorDropdown"
                        class="absolute top-full z-50 w-full mt-2 bg-background border border-primary/10 rounded-xl shadow-lg p-1">
                        <button v-for="opt in majorOptions" :key="opt.value"
                            @click="filterMajor = opt.value; showMajorDropdown = false"
                            class="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-primary/5">
                            {{ opt.label }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tab Content: Results -->
        <div v-if="activeTab === 'results'">
            <!-- Table -->
            <div class="bg-background border border-primary/10 rounded-3xl overflow-hidden shadow-sm">
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm">
                        <thead
                            class="bg-primary/5 border-b border-primary/5 text-muted-foreground font-black uppercase tracking-wider text-[10px]">
                            <tr>
                                <th class="p-4">Nama Siswa</th>
                                <th class="p-4">Kelas</th>
                                <th class="p-4">Waktu Submit</th>
                                <th class="p-4">Token</th>
                                <th class="p-4 text-center">Nilai</th>
                                <th class="p-4 text-center">Status</th>
                                <th class="p-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-primary/5">
                            <tr v-for="student in resultsPagination.paginatedData.value" :key="student.id"
                                class="hover:bg-primary/5 transition-colors">
                                <td class="p-4">
                                    <div class="font-bold text-foreground">{{ student.name }}</div>
                                    <div class="text-xs text-muted-foreground">{{ student.nis }}</div>
                                </td>
                                <td class="p-4">
                                    <span
                                        class="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg text-xs font-bold">{{
                                            student.class }}</span>
                                </td>
                                <td class="p-4 text-muted-foreground">{{ student.submittedAt }}</td>
                                <td class="p-4">
                                    <div
                                        class="flex items-center gap-2 group-hover:bg-white rounded-lg px-2 py-1 w-fit transition-colors">
                                        <span class="font-mono font-bold text-gray-700">{{ student.token }}</span>
                                    </div>
                                </td>
                                <td class="p-4 text-center">
                                    <span v-if="student.score !== null" class="font-black text-lg">{{ student.score
                                    }}</span>
                                    <span v-else class="text-muted-foreground italic">-</span>
                                </td>
                                <td class="p-4 text-center">
                                    <span
                                        class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide border"
                                        :class="getStatusClass(student.status)">
                                        {{ student.status }}
                                    </span>
                                </td>
                                <td class="p-4 text-right">
                                    <div class="flex items-center justify-end gap-2">
                                        <button @click="openGrading(student)"
                                            class="bg-background border-2 border-primary/10 hover:border-primary text-primary px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm">
                                            {{ student.score === null ? 'Koreksi' : 'Detail' }}
                                        </button>

                                        <!-- Gear Menu -->
                                        <DropdownMenu>
                                            <DropdownMenuTrigger as-child>
                                                <button
                                                    class="p-2 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100 transition-all text-gray-500 hover:text-gray-700"
                                                    title="Aksi Siswa">
                                                    <Cog6ToothIcon class="w-4 h-4" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end"
                                                class="w-48 z-50 bg-white border border-gray-100 shadow-xl rounded-xl p-1">
                                                <DropdownMenuLabel
                                                    class="text-xs font-black uppercase text-gray-400 px-2 py-1.5">Aksi
                                                    Siswa</DropdownMenuLabel>
                                                <DropdownMenuSeparator class="bg-gray-100 my-1" />
                                                <DropdownMenuItem @click="openTokenModal(student)"
                                                    class="flex items-center gap-2 px-2 py-2 text-sm font-medium text-gray-700 hover:bg-primary/5 hover:text-primary rounded-lg cursor-pointer outline-none">
                                                    <ArrowPathIcon class="w-4 h-4" />
                                                    <span>Generate Token</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator class="bg-gray-100 my-1" />
                                                <DropdownMenuItem @click="resetStudentExam(student)"
                                                    class="flex items-center gap-2 px-2 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-lg cursor-pointer outline-none">
                                                    <ExclamationTriangleIcon class="w-4 h-4" />
                                                    <span>Reset Ujian</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </td>
                            </tr>
                            <tr v-if="resultsPagination.paginatedData.value.length === 0">
                                <td colspan="7" class="p-8 text-center text-muted-foreground font-medium">
                                    Tidak ada data yang cocok dengan filter.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Pagination Footer -->
                <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-primary/5 border-t border-primary/5"
                    v-if="resultsPagination.totalItems.value > 0">

                    <!-- Limit Selector & Info -->
                    <div class="flex items-center gap-4">
                        <div
                            class="flex items-center gap-1 bg-background border border-primary/10 p-1 rounded-xl shadow-sm">
                            <button v-for="l in resultsPagination.limitOptions" :key="l"
                                @click="resultsPagination.limit.value = l; resultsPagination.page.value = 1"
                                class="px-3 py-1.5 rounded-lg text-[10px] font-black transition-all"
                                :class="resultsPagination.limit.value === l ? 'bg-primary text-white shadow-md' : 'text-muted-foreground hover:bg-primary/5'">
                                {{ l }}
                            </button>
                        </div>
                        <div class="text-[10px] font-bold text-muted-foreground">
                            {{ (resultsPagination.page.value - 1) * resultsPagination.limit.value + 1 }}-{{
                                Math.min(resultsPagination.page.value * resultsPagination.limit.value,
                                    resultsPagination.totalItems.value) }} dari {{ resultsPagination.totalItems.value }}
                        </div>
                    </div>

                    <!-- Page Navigation -->
                    <div class="flex items-center gap-2">
                        <button @click="resultsPagination.changePage(resultsPagination.page.value - 1)"
                            :disabled="resultsPagination.page.value <= 1"
                            class="p-2 rounded-lg bg-background border border-primary/10 text-muted-foreground hover:text-primary disabled:opacity-50 disabled:hover:text-muted-foreground transition-all">
                            <span class="sr-only">Prev</span>
                            <ChevronDownIcon class="h-4 w-4 rotate-90" />
                        </button>
                        <div class="flex items-center gap-1">
                            <button v-for="p in resultsPagination.totalPages.value" :key="p"
                                @click="resultsPagination.changePage(p)"
                                class="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all"
                                :class="resultsPagination.page.value === p ? 'bg-primary text-white shadow-md' : 'text-muted-foreground hover:bg-primary/5'">
                                {{ p }}
                            </button>
                        </div>
                        <button @click="resultsPagination.changePage(resultsPagination.page.value + 1)"
                            :disabled="resultsPagination.page.value >= resultsPagination.totalPages.value"
                            class="p-2 rounded-lg bg-background border border-primary/10 text-muted-foreground hover:text-primary disabled:opacity-50 disabled:hover:text-muted-foreground transition-all">
                            <span class="sr-only">Next</span>
                            <ChevronDownIcon class="h-4 w-4 -rotate-90" />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tab Content: Not Submitted -->
        <div v-if="activeTab === 'not_submitted'">
            <div class="bg-background border border-primary/10 rounded-3xl overflow-hidden shadow-sm">
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm">
                        <thead
                            class="bg-primary/5 border-b border-primary/5 text-muted-foreground font-black uppercase tracking-wider text-[10px]">
                            <tr>
                                <th class="p-4">Nama Siswa</th>
                                <th class="p-4">Kelas</th>
                                <th class="p-4">Tingkat</th>
                                <th class="p-4">Token</th>
                                <th class="p-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-primary/5">
                            <tr v-for="student in notSubmittedPagination.paginatedData.value" :key="student.id"
                                class="hover:bg-primary/5 transition-colors">
                                <td class="p-4">
                                    <div class="font-bold text-foreground">{{ student.name }}</div>
                                    <div class="text-xs text-muted-foreground">{{ student.nis }}</div>
                                </td>
                                <td class="p-4">
                                    <span class="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg text-xs font-bold">{{
                                        student.class }}</span>
                                </td>
                                <td class="p-4 text-sm">{{ student.level }}</td>
                                <td class="p-4">
                                    <div
                                        class="flex items-center gap-2 group-hover:bg-white rounded-lg px-2 py-1 w-fit transition-colors">
                                        <span class="font-mono font-bold text-gray-700">{{ student.token }}</span>
                                    </div>
                                </td>
                                <td class="p-4 text-right">
                                    <div class="flex items-center justify-end gap-2">
                                        <button @click="sendReminder(student)"
                                            class="bg-background border-2 border-primary/10 hover:border-primary text-primary px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm flex items-center gap-1">
                                            <BellIcon class="w-3.5 h-3.5" />
                                            Kirim Pengingat
                                        </button>

                                        <!-- Gear Menu for Not Submitted -->
                                        <DropdownMenu>
                                            <DropdownMenuTrigger as-child>
                                                <button
                                                    class="p-2 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100 transition-all text-gray-500 hover:text-gray-700"
                                                    title="Aksi Siswa">
                                                    <Cog6ToothIcon class="w-4 h-4" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end"
                                                class="w-48 z-50 bg-white border border-gray-100 shadow-xl rounded-xl p-1">
                                                <DropdownMenuLabel
                                                    class="text-xs font-black uppercase text-gray-400 px-2 py-1.5">Aksi
                                                    Siswa</DropdownMenuLabel>
                                                <DropdownMenuSeparator class="bg-gray-100 my-1" />
                                                <DropdownMenuItem @click="openTokenModal(student)"
                                                    class="flex items-center gap-2 px-2 py-2 text-sm font-medium text-gray-700 hover:bg-primary/5 hover:text-primary rounded-lg cursor-pointer outline-none">
                                                    <ArrowPathIcon class="w-4 h-4" />
                                                    <span>Generate Token</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </td>
                            </tr>
                            <tr v-if="notSubmittedPagination.paginatedData.value.length === 0">
                                <td colspan="5" class="p-8 text-center text-muted-foreground font-medium">
                                    Tidak ada data yang cocok dengan filter.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Pagination Footer (Reusing logic for Not Submitted) -->
                <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-primary/5 border-t border-primary/5"
                    v-if="notSubmittedPagination.totalItems.value > 0">

                    <!-- Limit Selector & Info -->
                    <div class="flex items-center gap-4">
                        <div
                            class="flex items-center gap-1 bg-background border border-primary/10 p-1 rounded-xl shadow-sm">
                            <button v-for="l in notSubmittedPagination.limitOptions" :key="l"
                                @click="notSubmittedPagination.limit.value = l; notSubmittedPagination.page.value = 1"
                                class="px-3 py-1.5 rounded-lg text-[10px] font-black transition-all"
                                :class="notSubmittedPagination.limit.value === l ? 'bg-primary text-white shadow-md' : 'text-muted-foreground hover:bg-primary/5'">
                                {{ l }}
                            </button>
                        </div>
                        <div class="text-[10px] font-bold text-muted-foreground">
                            {{ (notSubmittedPagination.page.value - 1) * notSubmittedPagination.limit.value + 1 }}-{{
                                Math.min(notSubmittedPagination.page.value * notSubmittedPagination.limit.value,
                                    notSubmittedPagination.totalItems.value) }} dari {{ notSubmittedPagination.totalItems.value
                            }}
                        </div>
                    </div>

                    <!-- Page Navigation -->
                    <div class="flex items-center gap-2">
                        <button @click="notSubmittedPagination.changePage(notSubmittedPagination.page.value - 1)"
                            :disabled="notSubmittedPagination.page.value <= 1"
                            class="p-2 rounded-lg bg-background border border-primary/10 text-muted-foreground hover:text-primary disabled:opacity-50 disabled:hover:text-muted-foreground transition-all">
                            <span class="sr-only">Prev</span>
                            <ChevronDownIcon class="h-4 w-4 rotate-90" />
                        </button>
                        <div class="flex items-center gap-1">
                            <button v-for="p in notSubmittedPagination.totalPages.value" :key="p"
                                @click="notSubmittedPagination.changePage(p)"
                                class="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all"
                                :class="notSubmittedPagination.page.value === p ? 'bg-primary text-white shadow-md' : 'text-muted-foreground hover:bg-primary/5'">
                                {{ p }}
                            </button>
                        </div>
                        <button @click="notSubmittedPagination.changePage(notSubmittedPagination.page.value + 1)"
                            :disabled="notSubmittedPagination.page.value >= notSubmittedPagination.totalPages.value"
                            class="p-2 rounded-lg bg-background border border-primary/10 text-muted-foreground hover:text-primary disabled:opacity-50 disabled:hover:text-muted-foreground transition-all">
                            <span class="sr-only">Next</span>
                            <ChevronDownIcon class="h-4 w-4 -rotate-90" />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Questions Overview (Bottom) -->
        <div v-if="activeTab === 'questions'" class="space-y-4">
            <!-- Overview Content Placeholder -->
            <div class="bg-background border border-primary/10 rounded-3xl p-6">
                <h3 class="font-bold text-lg mb-4">Daftar Soal</h3>
                <div class="space-y-3">
                    <div v-for="q in questions" :key="q.id"
                        class="p-4 rounded-xl border border-gray-100 hover:border-primary/20 transition-colors bg-gray-50/50">
                        <div class="flex justify-between items-start mb-2">
                            <span
                                class="bg-white px-2 py-1 rounded-lg shadow-sm text-xs font-bold text-primary border border-gray-100">{{
                                    q.type }}</span>
                            <span class="text-xs font-bold text-gray-500">{{ q.point }} Poin</span>
                        </div>
                        <p class="font-medium text-gray-800">{{ q.text }}</p>
                        <p class="text-xs text-gray-500 mt-2">Kunci: <span
                                class="font-mono text-gray-700 bg-gray-200 px-1 rounded">{{ q.answer }}</span></p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Grading Modal -->
    <Modal :show="showGradingModal" :title="`Koreksi Jawaban - ${selectedStudent?.name}`" size="xl"
        @close="showGradingModal = false">
        <div class="space-y-6 max-h-[70vh] overflow-y-auto px-1">
            <div v-for="(answer, index) in studentAnswers" :key="answer.qId" class="p-4 rounded-2xl border"
                :class="answer.isCorrect === true ? 'bg-emerald-50/50 border-emerald-100' : answer.isCorrect === false ? 'bg-rose-50/50 border-rose-100' : 'bg-gray-50 border-gray-100'">

                <div class="flex justify-between gap-4 mb-2">
                    <span class="text-xs font-black uppercase tracking-wider px-2 py-1 rounded bg-white shadow-sm">Soal
                        {{ index + 1 }} - {{ answer.type }}</span>
                    <span class="text-xs font-bold">Max: {{ answer.maxPoint }} Poin</span>
                </div>

                <p class="font-medium text-gray-900 mb-3">{{ answer.question }}</p>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                    <div class="bg-white p-3 rounded-xl border border-gray-100">
                        <span class="text-[10px] font-bold text-gray-400 uppercase block mb-1">Jawaban Siswa</span>
                        <p class="font-medium"
                            :class="{ 'text-emerald-700': answer.isCorrect, 'text-rose-700': answer.isCorrect === false }">
                            {{ answer.answer || '(Kosong)' }}
                        </p>
                    </div>
                    <div class="bg-white p-3 rounded-xl border border-gray-100">
                        <span class="text-[10px] font-bold text-gray-400 uppercase block mb-1">Kunci Jawaban</span>
                        <p class="font-mono text-gray-700">{{ answer.key }}</p>
                    </div>
                </div>

                <!-- Grading Controls -->
                <div
                    class="flex flex-col sm:flex-row gap-3 items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                    <div class="flex-1 w-full">
                        <!-- Auto Grading Status for Multiple Choice -->
                        <div v-if="answer.type === 'Pilihan Ganda'" class="flex items-center gap-2">
                            <span v-if="answer.isCorrect"
                                class="text-emerald-600 font-bold text-sm flex items-center gap-1">
                                <CheckBadgeIcon class="w-5 h-5" /> Benar (+{{ answer.maxPoint }})
                            </span>
                            <span v-else class="text-rose-600 font-bold text-sm flex items-center gap-1">
                                <XMarkIcon class="w-5 h-5" /> Salah (0)
                            </span>
                        </div>

                        <!-- Manual Grading for Essay -->
                        <div v-else>
                            <label class="text-xs font-bold text-gray-500 mb-1 block">Berikan Nilai (0 - {{
                                answer.maxPoint }})</label>
                            <input type="number" v-model.number="answer.point" :max="answer.maxPoint" min="0"
                                class="w-24 px-3 py-1.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 font-bold text-center">
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button @click="showGradingModal = false"
                class="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all">Batal</button>
            <button @click="saveGrading"
                class="px-5 py-2.5 rounded-xl font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all">
                Simpan Penilaian
            </button>
        </div>
    </Modal>

    <!-- Token Modal -->
    <Modal :show="showTokenModal" :title="`Token Ujian - ${selectedStudentForToken?.name}`" size="md"
        @close="showTokenModal = false">
        <div class="space-y-6 text-center py-4">
            <div class="space-y-2">
                <p class="text-sm font-medium text-muted-foreground">Token saat ini untuk siswa:</p>
                <div
                    class="py-6 px-4 bg-slate-50 border-2 border-slate-200 border-dashed rounded-3xl relative overflow-hidden group hover:border-primary/30 transition-colors">
                    <span class="font-mono text-5xl font-black text-slate-800 tracking-[0.2em] relative z-10">{{
                        selectedStudentForToken?.token }}</span>
                    <div class="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity">
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div class="p-3 bg-blue-50/50 rounded-2xl border border-blue-100 flex flex-col items-start gap-1">
                    <label class="text-[10px] uppercase font-black text-blue-400 tracking-wider block">Tipe
                        Token</label>
                    <select v-model="tokenDetails.type"
                        class="w-full bg-blue-50/50 border-none text-sm font-bold text-blue-700 focus:ring-0 p-0 cursor-pointer">
                        <option v-for="opt in tokenTypeOptions" :key="opt" :value="opt">{{ opt }}</option>
                    </select>
                </div>
                <div class="p-3 bg-amber-50/50 rounded-2xl border border-amber-100 flex flex-col items-start gap-1">
                    <label class="text-[10px] uppercase font-black text-amber-400 tracking-wider block">Masa
                        Berlaku</label>
                    <div class="flex items-center gap-1 w-full">
                        <ClockIcon class="w-4 h-4 text-amber-700" />
                        <select v-model="tokenDetails.expiry"
                            class="w-full bg-amber-50/50 border-none text-sm font-bold text-amber-700 focus:ring-0 p-0 cursor-pointer">
                            <option v-for="opt in tokenExpiryOptions" :key="opt" :value="opt">{{ opt }}</option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <span>Digenerate pada:</span>
                <span class="font-mono font-bold">{{ tokenDetails.generatedAt }}</span>
            </div>

            <div class="flex flex-col gap-3 pt-4 border-t border-slate-100">
                <button @click="regenerateStudentToken"
                    class="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2">
                    <ArrowPathIcon class="w-5 h-5" />
                    Generate Token Baru
                </button>
                <button @click="showTokenModal = false"
                    class="w-full py-3 bg-transparent hover:bg-gray-50 text-gray-500 rounded-xl font-bold transition-all">
                    Tutup
                </button>
            </div>
        </div>
    </Modal>
</template>
