<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { refDebounced, useIntersectionObserver } from '@vueuse/core';
import {
    MagnifyingGlassIcon,
    Bars3Icon,
    Squares2X2Icon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    ChevronDownIcon,
    CheckIcon,
    FunnelIcon,
    UserIcon,
    BriefcaseIcon
} from '@heroicons/vue/24/outline';
import api from '@/services/api';
import Modal from '@/components/common/Modal.vue';
import ConfirmModal from '@/components/ui/ConfirmModal.vue';
import EmployeeForm from '../components/EmployeeForm.vue';
import { useToast } from '@/composables/useToast';

const router = useRouter();

// State
const employees = ref([]);
const loading = ref(false);
const loadingMore = ref(false);
const searchQuery = ref('');
const debouncedSearchQuery = refDebounced(searchQuery, 500);
const selectedPosition = ref('');
const viewMode = ref('table'); // 'table' (horizontal cards) or 'card' (grid)

// Pagination state
const page = ref(1);
const total = ref(0);
const totalPages = computed(() => Math.ceil(total.value / selectedLimit.value));

const positionOptions = [
    { value: '', label: 'Semua Jabatan' },
    { value: 'Kepala Sekolah', label: 'Kepala Sekolah' },
    { value: 'Guru', label: 'Guru' },
    { value: 'Staff', label: 'Staff' },
    { value: 'Walikelas', label: 'Walikelas' }
];

const limitOptions = [10, 20, 50, 100];
const selectedLimit = ref(10);
const showPositionDropdown = ref(false);

const selectedPositionLabel = computed(() => {
    const option = positionOptions.find(opt => opt.value === selectedPosition.value);
    return option ? option.label : 'Pilih Jabatan';
});


// Modal states
const showModal = ref(false);
const showDeleteModal = ref(false);
const isEdit = ref(false);
const selectedEmployee = ref(null);

// Initial form state
const defaultForm = {
    nip: '',
    nik: '',
    name: '',
    type: '',
    position: '',
    classAssigned: '',
    phone: '',
    email: '',
    status: 'Aktif',
    gender: '',
    birthPlace: '',
    birthDate: '',
    religion: '',
    address: '',
    education: '',
    joinDate: ''
};

const formData = ref({ ...defaultForm });

// Fetch employees
const fetchEmployees = async (reset = false) => {
    if (reset) {
        page.value = 1;
    }

    loading.value = true;

    try {
        const params = {
            page: page.value,
            limit: selectedLimit.value,
            q: debouncedSearchQuery.value,
            position: selectedPosition.value
        };

        // Artificial delay for skeleton demonstration
        await new Promise(resolve => setTimeout(resolve, 800));

        const response = await api.get('/employees', { params });
        const { data, meta } = response.data;

        employees.value = data; // Replace data
        total.value = meta?.total || employees.value.length;
    } catch (error) {
        console.error('Failed to fetch employees', error);
    } finally {
        loading.value = false;
    }
};

const changePage = (newPage) => {
    if (newPage > 0 && newPage <= totalPages.value) {
        page.value = newPage;
        fetchEmployees();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

const filteredEmployees = computed(() => employees.value);

// Watch for filter changes
watch([debouncedSearchQuery, selectedPosition, selectedLimit], () => {
    fetchEmployees(true);
});

// Modals
const openAddModal = () => {
    isEdit.value = false;
    formData.value = { ...defaultForm };
    showModal.value = true;
};

const openEditModal = (employee) => {
    isEdit.value = true;
    selectedEmployee.value = employee;
    formData.value = { ...employee };
    showModal.value = true;
};

const openDeleteModal = (employee) => {
    selectedEmployee.value = employee;
    showDeleteModal.value = true;
};

const handleSubmit = async () => {
    if (!formData.value.name || !formData.value.nip) {
        const toast = useToast();
        if (!formData.value.name) return toast.error('Nama wajib diisi');
        // Let API handle other validations
    }

    try {
        if (isEdit.value) {
            await api.put(`/employees/${selectedEmployee.value.id}`, formData.value);
        } else {
            await api.post('/employees', formData.value);
        }
        showModal.value = false;
        fetchEmployees(true);
    } catch (error) {
        // Handled globally
    }
};

const handleDelete = async () => {
    try {
        await api.delete(`/employees/${selectedEmployee.value.id}`);
        showDeleteModal.value = false;
        fetchEmployees(true);
    } catch (error) {
        // Handled globally
    }
};

// Status helpers
const getStatusBadgeClass = (status) => {
    const statusMap = {
        'Aktif': 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
        'Nonaktif': 'bg-rose-50 text-rose-700 border-rose-200/50',
        'Cuti': 'bg-amber-50 text-amber-700 border-amber-200/50'
    };
    return statusMap[status] || 'bg-gray-50 text-gray-600 border-gray-200/50';
};

const getPositionBadgeClass = (position) => {
    if (position === 'Kepala Sekolah') return 'bg-purple-50 text-purple-700 ring-purple-200/50';
    if (position === 'Guuu') return 'bg-blue-50 text-blue-700 ring-blue-200/50';
    if (position === 'Staff') return 'bg-orange-50 text-orange-700 ring-orange-200/50';
    return 'bg-slate-50 text-slate-700 ring-slate-200/50';
};

// Helper to get initials (max 2 chars)
const getInitials = (name) => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

onMounted(() => {
    fetchEmployees();
});
</script>

<template>
    <div class="space-y-8 pb-12">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div class="space-y-1">
                <h1 class="text-3xl font-black text-foreground tracking-tight">Data Pegawai</h1>
                <p class="text-muted-foreground font-medium">Manajemen data guru dan staff sekolah.</p>
            </div>
            <button @click="openAddModal"
                class="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2">
                <div class="bg-white/20 p-1 rounded-lg">
                    <PlusIcon class="w-5 h-5 text-white" />
                </div>
                Tambah Pegawai
            </button>
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
                    <input v-model="searchQuery" type="text" placeholder="Cari nama, NIP, atau jabatan..."
                        class="block w-full pl-12 pr-4 py-4 bg-primary/5 border-transparent rounded-2xl text-sm font-medium focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary/20 transition-all" />
                </div>

                <div class="flex flex-col sm:flex-row gap-2">
                    <!-- Custom Position Dropdown -->
                    <div class="relative w-full sm:w-56">
                        <button @click="showPositionDropdown = !showPositionDropdown"
                            class="w-full h-full flex items-center justify-between px-5 py-4 bg-primary/5 border-transparent rounded-2xl text-sm font-bold text-foreground hover:bg-primary/10 transition-all text-left">
                            <div class="flex items-center gap-2.5">
                                <FunnelIcon class="w-4 h-4 text-primary" />
                                <span>{{ selectedPositionLabel }}</span>
                            </div>
                            <ChevronDownIcon class="w-4 h-4 text-muted-foreground transition-transform duration-300"
                                :class="{ 'rotate-180': showPositionDropdown }" />
                        </button>

                        <div v-if="showPositionDropdown"
                            class="absolute top-full left-0 right-0 mt-2 z-[60] bg-background border border-primary/10 rounded-2xl shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-200">
                            <div class="space-y-1">
                                <button v-for="opt in positionOptions" :key="opt.value"
                                    @click="selectedPosition = opt.value; showPositionDropdown = false"
                                    class="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all"
                                    :class="selectedPosition === opt.value ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5 text-muted-foreground hover:text-foreground'">
                                    <span>{{ opt.label }}</span>
                                    <CheckIcon v-if="selectedPosition === opt.value" class="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Controls (Separate Row) -->
        <div class="flex justify-between items-center gap-3 px-1 mb-4">
            <!-- Page Info (Left) -->
            <div class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Halaman <span class="text-primary font-black">{{ page }}/{{ totalPages }}</span>
                (<span class="text-primary font-black">{{ Math.min(page * selectedLimit, total) }}</span>/<span
                    class="text-primary font-black">{{ total }}</span>)
            </div>

            <!-- View Toggle (Right) -->
            <div
                class="flex bg-background/50 backdrop-blur-sm border border-primary/10 p-1 rounded-2xl gap-1 shadow-sm">
                <button @click="viewMode = 'table'"
                    class="px-4 py-2 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                    :class="viewMode === 'table' ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-primary/5'">
                    <Bars3Icon class="w-5 h-5" />
                </button>
                <button @click="viewMode = 'card'"
                    class="px-4 py-2 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                    :class="viewMode === 'card' ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-primary/5'">
                    <Squares2X2Icon class="w-5 h-5" />
                </button>
            </div>
        </div>

        <!-- List View (Horizontal Card Style) -->
        <div v-if="viewMode === 'table'" class="space-y-4">
            <!-- Skeleton Rows -->
            <template v-if="loading">
                <div v-for="i in 5" :key="i"
                    class="bg-background border border-primary/10 rounded-3xl p-6 animate-pulse space-y-6">
                    <div class="flex items-center justify-between border-b border-primary/5 pb-4">
                        <div class="flex items-center gap-3">
                            <div class="h-8 w-8 bg-primary/10 rounded-xl"></div>
                            <div class="h-4 w-32 bg-primary/10 rounded-lg"></div>
                        </div>
                        <div class="h-6 w-20 bg-primary/10 rounded-xl"></div>
                    </div>
                    <div class="flex items-center gap-4">
                        <div class="h-16 w-16 bg-primary/10 rounded-2xl"></div>
                        <div class="space-y-2 flex-1">
                            <div class="h-5 w-1/3 bg-primary/10 rounded-lg"></div>
                            <div class="h-4 w-1/4 bg-primary/5 rounded-lg"></div>
                        </div>
                        <div class="h-8 w-24 bg-primary/5 rounded-xl"></div>
                    </div>
                </div>
            </template>

            <!-- Actual Data -->
            <template v-else>
                <div v-for="emp in filteredEmployees" :key="emp.id"
                    class="group bg-background border border-primary/10 rounded-3xl p-6 hover:shadow-xl hover:shadow-primary/5 transition-all hover:-translate-y-1 relative overflow-hidden">

                    <!-- Card Header (Icon, Metadata, Status) -->
                    <div
                        class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-primary/5 pb-4 mb-5">
                        <div class="flex items-center gap-3">
                            <div class="p-2 bg-primary/5 rounded-xl group-hover:bg-primary/10 transition-colors">
                                <BriefcaseIcon class="w-5 h-5 text-primary" />
                            </div>
                            <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                <span class="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                                    NIP: <span class="text-foreground">{{ emp.nip || '-' }}</span>
                                </span>
                                <div class="hidden sm:block w-1.5 h-1.5 rounded-full bg-primary/20"></div>
                                <span class="text-[11px] font-black uppercase tracking-widest text-primary">
                                    {{ emp.type }}
                                </span>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <span
                                class="inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border"
                                :class="getStatusBadgeClass(emp.status)">
                                {{ emp.status }}
                            </span>
                        </div>
                    </div>


                    <!-- Card Body -->
                    <div class="flex flex-col md:flex-row md:items-center gap-6">
                        <div class="flex items-center gap-5 flex-1">
                            <div class="relative">
                                <div class="avatar" :class="{'placeholder': !emp.photo}">
                                    <div class="rounded-2xl w-16 h-16 shadow-md group-hover:scale-105 transition-transform overflow-hidden" 
                                         :class="emp.photo ? '' : 'bg-primary/10 text-primary flex items-center justify-center'">
                                        <img v-if="emp.photo" :src="emp.photo" :alt="emp.name" />
                                        <span v-else class="text-xl font-black">{{ getInitials(emp.name) }}</span>
                                    </div>
                                </div>
                                <div v-if="emp.status === 'Aktif'"
                                    class="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-background">
                                </div>
                            </div>
                            <div class="space-y-1">
                                <h3
                                    class="font-black text-xl text-foreground tracking-tight group-hover:text-primary transition-colors">
                                    {{ emp.name }}
                                </h3>
                                <p class="text-sm font-medium text-muted-foreground">{{ emp.email }}</p>
                            </div>
                        </div>

                        <div class="flex items-center justify-between md:justify-end gap-6 md:min-w-[200px]">
                            <div class="flex flex-col items-start md:items-end">
                                <span
                                    class="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">
                                    Jabatan
                                </span>
                                <span
                                    class="inline-flex items-center px-4 py-2 rounded-2xl text-sm font-black ring-1 shadow-sm"
                                    :class="getPositionBadgeClass(emp.position)">
                                    {{ emp.position }}
                                </span>
                            </div>

                            <!-- Action Buttons (Responsive) -->
                            <div class="hidden min-[1100px]:flex items-center gap-2 pl-6 border-l border-primary/5">
                                <button @click="router.push(`/admin/employees/${emp.id}`)"
                                    class="px-4 py-2.5 bg-background border-2 border-primary/5 hover:border-primary/20 hover:bg-primary/5 text-primary font-bold text-sm rounded-xl transition-all active:scale-95">
                                    Detail
                                </button>
                                <button @click="openEditModal(emp)"
                                    class="px-4 py-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white font-bold text-sm rounded-xl transition-all active:scale-95">
                                    Edit
                                </button>
                                <button @click="openDeleteModal(emp)"
                                    class="p-2.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all active:scale-95">
                                    <TrashIcon class="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Mobile/Compact Actions -->
                    <div
                        class="mt-6 pt-5 border-t border-primary/5 flex min-[1100px]:hidden items-center justify-end gap-3">
                        <button @click="router.push(`/employees/${emp.id}`)"
                            class="flex-1 sm:flex-none text-primary font-black text-sm hover:underline py-2">
                            Lihat Detail
                        </button>
                        <div class="flex gap-2">
                            <button @click="openEditModal(emp)"
                                class="px-6 py-2.5 bg-primary text-primary-foreground font-black text-sm rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all">
                                Ubah Orkil
                            </button>
                            <button @click="openDeleteModal(emp)"
                                class="p-2.5 bg-background border border-primary/10 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-colors">
                                <TrashIcon class="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </template>
        </div>

        <!-- Grid View (Premium Selection) -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <!-- Skeleton Cards -->
            <template v-if="loading">
                <div v-for="i in 8" :key="i"
                    class="bg-background border border-primary/10 rounded-3xl p-6 h-64 animate-pulse">
                    <div class="flex items-start justify-between mb-4">
                        <div class="h-16 w-16 bg-primary/10 rounded-2xl"></div>
                        <div class="h-6 w-20 bg-primary/10 rounded-xl"></div>
                    </div>
                    <div class="space-y-3">
                        <div class="h-5 w-3/4 bg-primary/10 rounded-lg"></div>
                        <div class="h-4 w-1/2 bg-primary/5 rounded-lg"></div>
                        <div class="h-6 w-1/3 bg-primary/10 rounded-xl"></div>
                    </div>
                </div>
            </template>

            <!-- Actual Data -->
            <template v-else>
                <div v-for="emp in filteredEmployees" :key="emp.id"
                    class="group bg-background border border-primary/10 rounded-3xl p-6 hover:shadow-2xl hover:shadow-primary/10 transition-all hover:-translate-y-1 relative overflow-hidden">
                    <!-- Background Accent -->
                    <div
                        class="absolute -top-12 -right-12 w-24 h-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all">
                    </div>

                    <!-- Avatar & Status -->
                    <div class="flex items-start justify-between mb-5 relative">
                        <div class="relative">
                            <div class="avatar" :class="{'placeholder': !emp.photo}">
                                <div class="rounded-2xl w-16 h-16 shadow-md group-hover:scale-105 transition-transform overflow-hidden" 
                                     :class="emp.photo ? '' : 'bg-primary/10 text-primary flex items-center justify-center'">
                                    <img v-if="emp.photo" :src="emp.photo" :alt="emp.name" />
                                    <span v-else class="text-xl font-black">{{ getInitials(emp.name) }}</span>
                                </div>
                            </div>
                            <div v-if="emp.status === 'Aktif'"
                                class="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-background">
                            </div>
                        </div>
                        <span
                            class="inline-flex items-center px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider border bg-background"
                            :class="getStatusBadgeClass(emp.status)">
                            {{ emp.status }}
                        </span>
                    </div>

                    <!-- Employee Info -->
                    <div class="space-y-4 relative">
                        <div class="space-y-1">
                            <h3
                                class="font-black text-foreground text-lg tracking-tight truncate group-hover:text-primary transition-colors">
                                {{ emp.name }}
                            </h3>
                            <p class="text-xs text-muted-foreground font-medium truncate">{{ emp.email }}</p>
                        </div>

                        <div class="flex flex-wrap items-center gap-2">
                            <span
                                class="inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ring-1 shadow-sm"
                                :class="getPositionBadgeClass(emp.position)">
                                {{ emp.position }}
                            </span>
                        </div>

                        <!-- Contacts Info -->
                        <div class="pt-2 border-t border-primary/5 flex items-center justify-between">
                            <div class="flex flex-col">
                                <span
                                    class="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">NIP</span>
                                <span class="text-xs font-bold text-foreground">{{ emp.nip }}</span>
                            </div>
                            <div class="flex flex-col items-end">
                                <span
                                    class="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Kontak</span>
                                <span class="text-xs font-bold text-foreground">{{ emp.phone }}</span>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div
                            class="pt-4 flex items-center gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                            <button @click="router.push(`/employees/${emp.id}`)"
                                class="flex-1 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2">
                                <EyeIcon class="w-4 h-4" />
                                Detail
                            </button>
                            <div class="flex gap-2">
                                <button @click="openEditModal(emp)"
                                    class="p-2.5 bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white rounded-xl transition-all">
                                    <PencilIcon class="w-4 h-4" />
                                </button>
                                <button @click="openDeleteModal(emp)"
                                    class="p-2.5 bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white rounded-xl transition-all">
                                    <TrashIcon class="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </div>

        <!-- Pagination Controls -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-6 py-8 px-4 border-t border-primary/5">

            <!-- Limit Selector (Left) -->
            <div
                class="flex items-center gap-1 bg-background/50 backdrop-blur-sm border border-primary/10 p-1 rounded-2xl shadow-sm order-2 sm:order-1">
                <button v-for="l in limitOptions" :key="l" @click="selectedLimit = l"
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

        <!-- Empty State -->
        <div v-if="!loading && filteredEmployees.length === 0"
            class="card bg-base-100 shadow-sm border border-base-200">
            <div class="card-body text-center py-12">
                <p class="text-base-content/60">Tidak ada data pegawai ditemukan</p>
            </div>
        </div>

        <!-- Forms Modal -->
        <Modal :show="showModal" :title="isEdit ? 'Edit Pegawai' : 'Tambah Pegawai'" size="lg"
            @close="showModal = false">
            <EmployeeForm v-model="formData" :is-edit="isEdit" @submit="handleSubmit" @cancel="showModal = false" />
        </Modal>

        <!-- Delete Confirmation -->
        <ConfirmModal :show="showDeleteModal" title="Hapus Pegawai"
            :message="`Apakah Anda yakin ingin menghapus data pegawai ${selectedEmployee?.name}?`" confirm-text="Hapus"
            cancel-text="Batal" type="error" @confirm="handleDelete" @close="showDeleteModal = false" />
    </div>
</template>