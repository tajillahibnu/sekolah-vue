<script setup>
import { ref, onMounted, computed } from 'vue';
import {
    PlusIcon,
    MagnifyingGlassIcon,
    PencilSquareIcon,
    TrashIcon,
    EllipsisVerticalIcon,
    EyeIcon,
    Bars3Icon,
    Squares2X2Icon
} from '@heroicons/vue/24/outline';
import api from '@/services/api';
import { useRouter } from 'vue-router';
import Modal from '@/components/common/Modal.vue';
import ConfirmModal from '@/components/ui/ConfirmModal.vue';
import EmployeeForm from '../components/EmployeeForm.vue';
import { useToastStore } from '@/stores/toast';

import { watch } from 'vue';
import { refDebounced } from '@vueuse/core';
import Skeleton from '@/components/ui/skeleton/Skeleton.vue';

const router = useRouter();

const employees = ref([]);
const loading = ref(false);
const loadingMore = ref(false);
const searchQuery = ref('');
const debouncedSearchQuery = refDebounced(searchQuery, 500);
const viewMode = ref('table'); // 'table' or 'card'
const showModal = ref(false);
const showDeleteModal = ref(false);
const isEdit = ref(false);
const selectedEmployee = ref(null);

// Pagination state
const page = ref(1);
const limit = 10;
const total = ref(0);
const hasMore = computed(() => employees.value.length < total.value);

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
        employees.value = [];
    }

    if (page.value === 1) {
        loading.value = true;
    } else {
        loadingMore.value = true;
    }

    try {
        const params = {
            page: page.value,
            limit: limit,
            q: debouncedSearchQuery.value
        };

        // Artificial delay for skeleton demonstration
        await new Promise(resolve => setTimeout(resolve, 800));

        const response = await api.get('/employees', { params });
        const { data, meta } = response.data;

        if (page.value === 1) {
            employees.value = data;
        } else {
            employees.value = [...employees.value, ...data];
        }

        total.value = meta?.total || employees.value.length;
    } catch (error) {
        console.error('Failed to fetch employees', error);
    } finally {
        loading.value = false;
        loadingMore.value = false;
    }
};

const handleLoadMore = () => {
    if (hasMore.value && !loadingMore.value) {
        page.value++;
        fetchEmployees();
    }
};

const filteredEmployees = computed(() => employees.value);

// Watch for search changes
watch(debouncedSearchQuery, () => {
    fetchEmployees(true);
});

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
        const toast = useToastStore();
        if (!formData.value.name) return toast.add('Nama wajib diisi', 'error');
        // Let API handle other validations or toast
    }

    try {
        if (isEdit.value) {
            await api.put(`/employees/${selectedEmployee.value.id}`, formData.value);
        } else {
            await api.post('/employees', formData.value);
        }
        showModal.value = false;
        fetchEmployees();
    } catch (error) {
        // Handled globally
    }
};

const handleDelete = async () => {
    try {
        await api.delete(`/employees/${selectedEmployee.value.id}`);
        showDeleteModal.value = false;
        fetchEmployees();
    } catch (error) {
        // Handled globally
    }
};

onMounted(() => {
    fetchEmployees();
});
</script>

<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 class="text-2xl font-bold text-base-content">Data Pegawai</h1>
                <p class="text-sm text-base-content/60 mt-1">Kelola data guru dan staff sekolah</p>
            </div>
            <button @click="openAddModal" class="btn btn-primary gap-2">
                <PlusIcon class="w-5 h-5" />
                Tambah Pegawai
            </button>
        </div>

        <!-- Filters & View Toggle -->
        <div class="card bg-base-100 shadow-sm border border-base-200">
            <div class="card-body p-4">
                <div class="flex flex-col lg:flex-row gap-4">
                    <!-- Search -->
                    <div class="flex-1">
                        <div class="relative">
                            <MagnifyingGlassIcon
                                class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                            <input v-model="searchQuery" type="text" placeholder="Cari nama, NIP, atau jabatan..."
                                class="input input-bordered w-full pl-10" />
                        </div>
                    </div>

                    <!-- View Toggle -->
                    <div class="join">
                        <button @click="viewMode = 'table'" class="btn join-item"
                            :class="viewMode === 'table' ? 'btn-active' : ''">
                            <Bars3Icon class="w-5 h-5" />
                        </button>
                        <button @click="viewMode = 'card'" class="btn join-item"
                            :class="viewMode === 'card' ? 'btn-active' : ''">
                            <Squares2X2Icon class="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Table View -->
        <div v-if="viewMode === 'table'" class="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="table table-zebra w-full">
                    <thead>
                        <tr>
                            <th class="font-semibold">Nama Lengkap</th>
                            <th class="font-semibold">NIP / NUPTK</th>
                            <th class="font-semibold">Jabatan</th>
                            <th class="font-semibold">Tipe</th>
                            <th class="font-semibold">Kontak</th>
                            <th class="font-semibold">Status</th>
                            <th class="font-semibold text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Skeleton Rows -->
                        <template v-if="loading">
                            <tr v-for="i in 5" :key="i">
                                <td>
                                    <div class="space-y-2">
                                        <Skeleton class="h-4 w-32" />
                                        <Skeleton class="h-3 w-24" />
                                    </div>
                                </td>
                                <td>
                                    <Skeleton class="h-4 w-24" />
                                </td>
                                <td>
                                    <Skeleton class="h-5 w-20 rounded-full" />
                                </td>
                                <td>
                                    <Skeleton class="h-4 w-16" />
                                </td>
                                <td>
                                    <Skeleton class="h-3 w-28" />
                                </td>
                                <td>
                                    <Skeleton class="h-4 w-12 rounded-full" />
                                </td>
                                <td>
                                    <div class="flex justify-center gap-2">
                                        <Skeleton class="h-6 w-6" />
                                        <Skeleton class="h-6 w-6" />
                                        <Skeleton class="h-6 w-6" />
                                    </div>
                                </td>
                            </tr>
                        </template>

                        <!-- Actual Data -->
                        <template v-else>
                            <tr v-if="filteredEmployees.length === 0" class="border-none">
                                <td colspan="7" class="text-center py-8 text-base-content/60">Tidak ada data pegawai.
                                </td>
                            </tr>
                            <tr v-for="emp in filteredEmployees" :key="emp.id">
                                <td>
                                    <div class="font-medium text-base-content">{{ emp.name }}</div>
                                    <div class="text-xs text-base-content/60">{{ emp.email }}</div>
                                </td>
                                <td class="font-mono text-sm">{{ emp.nip }}</td>
                                <td>
                                    <span class="badge badge-sm" :class="{
                                        'badge-primary': emp.position === 'Kepala Sekolah',
                                        'badge-secondary': emp.position.includes('Waka'),
                                        'badge-accent': emp.position === 'Walikelas',
                                        'badge-ghost': !['Kepala Sekolah', 'Walikelas'].includes(emp.position) && !emp.position.includes('Waka')
                                    }">
                                        {{ emp.position }}
                                    </span>
                                    <span v-if="emp.classAssigned" class="ml-1 badge badge-xs badge-outline">{{
                                        emp.classAssigned }}</span>
                                </td>
                                <td>{{ emp.type }}</td>
                                <td>
                                    <div class="text-xs">{{ emp.phone }}</div>
                                </td>
                                <td>
                                    <div class="badge badge-xs"
                                        :class="emp.status === 'Aktif' ? 'badge-success' : 'badge-error'">
                                        {{ emp.status }}
                                    </div>
                                </td>
                                <td>
                                    <div class="flex justify-center gap-2">
                                        <button @click="router.push(`/employees/${emp.id}`)"
                                            class="btn btn-square btn-ghost btn-sm text-base-content/60" title="Detail">
                                            <EyeIcon class="w-4 h-4" />
                                        </button>
                                        <button @click="openEditModal(emp)"
                                            class="btn btn-square btn-ghost btn-sm text-blue-500">
                                            <PencilSquareIcon class="w-4 h-4" />
                                        </button>
                                        <button @click="openDeleteModal(emp)"
                                            class="btn btn-square btn-ghost btn-sm text-red-500">
                                            <TrashIcon class="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Card View -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <!-- Skeleton Cards -->
            <template v-if="loading">
                <div v-for="i in 8" :key="i" class="card bg-base-100 shadow-sm border border-base-200">
                    <div class="card-body p-4">
                        <div class="flex items-start justify-between mb-3">
                            <Skeleton class="h-12 w-12 rounded-full" />
                            <Skeleton class="h-5 w-12 rounded-full" />
                        </div>
                        <div class="space-y-3">
                            <Skeleton class="h-5 w-3/4" />
                            <Skeleton class="h-4 w-1/2" />
                            <div class="flex gap-2">
                                <Skeleton class="h-5 w-20 rounded-full" />
                                <Skeleton class="h-5 w-16 rounded-full" />
                            </div>
                            <div class="space-y-2 pt-2">
                                <Skeleton class="h-3 w-2/3" />
                                <Skeleton class="h-3 w-1/2" />
                            </div>
                        </div>
                    </div>
                </div>
            </template>

            <!-- Actual Data -->
            <template v-else>
                <div v-for="emp in filteredEmployees" :key="emp.id"
                    class="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-shadow">
                    <div class="card-body p-4">
                        <!-- Avatar & Status -->
                        <div class="flex items-start justify-between mb-3">
                            <div class="avatar placeholder">
                                <div class="bg-neutral text-neutral-content rounded-full w-12">
                                    <span class="text-xl">{{ emp.name.charAt(0) }}</span>
                                </div>
                            </div>
                            <span class="badge badge-sm"
                                :class="emp.status === 'Aktif' ? 'badge-success' : 'badge-error'">
                                {{ emp.status }}
                            </span>
                        </div>

                        <!-- User Info -->
                        <div class="space-y-2">
                            <h3 class="font-semibold text-base truncate" :title="emp.name">{{ emp.name }}</h3>
                            <p class="text-sm text-base-content/60 truncate">{{ emp.nip }}</p>

                            <!-- Position Badge -->
                            <div class="flex flex-wrap gap-1">
                                <span class="badge badge-sm" :class="{
                                    'badge-primary': emp.position === 'Kepala Sekolah',
                                    'badge-secondary': emp.position.includes('Waka'),
                                    'badge-accent': emp.position === 'Walikelas',
                                    'badge-ghost': !['Kepala Sekolah', 'Walikelas'].includes(emp.position) && !emp.position.includes('Waka')
                                }">
                                    {{ emp.position }}
                                </span>
                                <span v-if="emp.classAssigned" class="badge badge-sm badge-outline">{{ emp.classAssigned
                                }}</span>
                            </div>

                            <!-- Additional Info -->
                            <div class="text-xs text-base-content/60 space-y-1">
                                <div>📞 {{ emp.phone }}</div>
                                <div class="truncate">✉️ {{ emp.email }}</div>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="card-actions justify-end mt-4 pt-4 border-t border-base-200">
                            <button @click="router.push(`/employees/${emp.id}`)" class="btn btn-sm btn-ghost gap-1">
                                <EyeIcon class="w-4 h-4" />
                                Detail
                            </button>
                            <button @click="openEditModal(emp)" class="btn btn-sm btn-ghost gap-1 text-blue-600">
                                <PencilSquareIcon class="w-4 h-4" />
                                Edit
                            </button>
                        </div>
                    </div>
                </div>
            </template>
        </div>

        <!-- Pagination / Load More -->
        <div v-if="hasMore && !loading" class="flex justify-center py-4">
            <button @click="handleLoadMore" class="btn btn-outline gap-2" :disabled="loadingMore">
                <span v-if="loadingMore" class="loading loading-spinner loading-xs"></span>
                {{ loadingMore ? 'Memuat...' : 'Muat Lebih Banyak' }}
            </button>
        </div>

        <!-- Empty State -->
        <div v-if="filteredEmployees.length === 0 && !loading"
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