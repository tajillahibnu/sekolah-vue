<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { refDebounced } from '@vueuse/core';
import {
  MagnifyingGlassIcon,
  Bars3Icon,
  Squares2X2Icon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/vue/24/outline';
import api from '@/services/api';
import Modal from '@/components/common/Modal.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import StudentForm from '../components/StudentForm.vue'
import Skeleton from '@/components/ui/skeleton/Skeleton.vue';

const route = useRoute();
const router = useRouter();
const users = ref([]);
const loading = ref(false);
const loadingMore = ref(false);
const searchQuery = ref('');
const debouncedSearchQuery = refDebounced(searchQuery, 500);
const selectedClass = ref('');
const viewMode = ref('table'); // 'table' or 'card'

// Pagination state
const page = ref(1);
const limit = 10;
const total = ref(0);
const hasMore = computed(() => users.value.length < total.value);

const classOptions = [
  { value: '', label: 'Semua Kelas' },
  { value: '10A', label: '10A' },
  { value: '10B', label: '10B' },
  { value: '11A', label: '11A' },
  { value: '11B', label: '11B' },
  { value: '12A', label: '12A' },
  { value: '12B', label: '12B' }
];

// Modal states
const showModal = ref(false);
const modalMode = ref('create'); // 'create' or 'edit'
const selectedStudent = ref(null);

// Delete confirmation
const showDeleteConfirm = ref(false);
const studentToDelete = ref(null);

// Fetch students
const fetchUsers = async (reset = false) => {
  if (reset) {
    page.value = 1;
    users.value = [];
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
      q: debouncedSearchQuery.value, // Use debounced value for API call
      class: selectedClass.value
    };

    // Add artificial delay for skeleton demo
    await new Promise(resolve => setTimeout(resolve, 800));

    const response = await api.get('/students', { params });
    const { data, meta } = response.data;

    if (page.value === 1) {
      users.value = data;
    } else {
      users.value = [...users.value, ...data];
    }

    total.value = meta.total;
  } catch (error) {
    console.error('Failed to fetch students', error);
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

const handleLoadMore = () => {
  if (hasMore.value && !loadingMore.value) {
    page.value++;
    fetchUsers();
  }
};

// Filtered users - now mostly handled by server, but we keep the computed name for compatibility if needed
const filteredUsers = computed(() => users.value);

// Watch for filter changes
watch([debouncedSearchQuery, selectedClass], () => {
  fetchUsers(true);
});

// Get status badge
const getStatusBadgeClass = (status) => {
  const statusMap = {
    'active': 'badge-success',
    'inactive': 'badge-error',
    'graduated': 'badge-info',
    'transferred': 'badge-warning'
  };
  return statusMap[status] || 'badge-ghost';
};

const getStatusLabel = (status) => {
  const labelMap = {
    'active': 'Aktif',
    'inactive': 'Nonaktif',
    'graduated': 'Lulus',
    'transferred': 'Pindah'
  };
  return labelMap[status] || status;
};

// Handle add student
const handleAdd = () => {
  modalMode.value = 'create';
  selectedStudent.value = null;
  showModal.value = true;
};

// Handle edit student
const handleEdit = (student) => {
  modalMode.value = 'edit';
  selectedStudent.value = { ...student };
  showModal.value = true;
};

// Handle delete student
const handleDelete = (student) => {
  studentToDelete.value = student;
  showDeleteConfirm.value = true;
};

// Confirm delete
const confirmDelete = async () => {
  if (!studentToDelete.value) return;

  try {
    await api.delete(`/students/${studentToDelete.value.id}`);
    await fetchUsers();
    studentToDelete.value = null;
  } catch (error) {
    console.error('Failed to delete student', error);
  }
};

// Handle form submit
const handleFormSubmit = async (formData) => {
  try {
    if (modalMode.value === 'create') {
      await api.post('/students', formData);
    } else {
      await api.put(`/students/${selectedStudent.value.id}`, formData);
    }

    showModal.value = false;
    selectedStudent.value = null;
    await fetchUsers();
  } catch (error) {
    console.error('Failed to save student', error);
  }
};

// Handle modal close
const handleModalClose = () => {
  showModal.value = false;
  selectedStudent.value = null;
};

// Initialize
fetchUsers();
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-base-content">Data Siswa</h1>
        <p class="text-sm text-base-content/60 mt-1">Kelola data siswa</p>
      </div>
      <button @click="handleAdd" class="btn btn-primary gap-2">
        <PlusIcon class="w-5 h-5" />
        Tambah Siswa
      </button>
    </div>

    <!-- Filters & View Toggle -->
    <div class="card bg-base-100 shadow-sm border border-base-200">
      <div class="card-body p-4">
        <div class="flex flex-col lg:flex-row gap-4">
          <!-- Search & Filter -->
          <div class="flex-1 flex flex-col md:flex-row gap-4">
            <div class="relative flex-1">
              <MagnifyingGlassIcon class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
              <input v-model="searchQuery" type="text" placeholder="Cari nama, email, atau NIS..."
                class="input input-bordered w-full pl-10" />
            </div>
            <select v-model="selectedClass" class="select select-bordered w-full md:w-48">
              <option v-for="opt in classOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>

          <!-- View Toggle -->
          <div class="join">
            <button @click="viewMode = 'table'" class="btn join-item" :class="viewMode === 'table' ? 'btn-active' : ''">
              <Bars3Icon class="w-5 h-5" />
            </button>
            <button @click="viewMode = 'card'" class="btn join-item" :class="viewMode === 'card' ? 'btn-active' : ''">
              <Squares2X2Icon class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Table View -->
    <div v-if="viewMode === 'table'" class="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="table table-zebra">
          <thead>
            <tr>
              <th>Siswa</th>
              <th>Kelas</th>
              <th>Kontak</th>
              <th>Status</th>
              <th>Bergabung</th>
              <th class="text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <!-- Skeleton Rows -->
            <template v-if="loading">
              <tr v-for="i in 5" :key="i">
                <td>
                  <div class="flex items-center gap-3">
                    <Skeleton class="h-10 w-10 rounded-full" />
                    <div class="space-y-2">
                      <Skeleton class="h-4 w-32" />
                      <Skeleton class="h-3 w-24" />
                    </div>
                  </div>
                </td>
                <td>
                  <Skeleton class="h-6 w-16 rounded-full" />
                </td>
                <td>
                  <Skeleton class="h-4 w-24" />
                </td>
                <td>
                  <Skeleton class="h-5 w-16 rounded-full" />
                </td>
                <td>
                  <Skeleton class="h-4 w-20" />
                </td>
                <td>
                  <div class="flex justify-center gap-2">
                    <Skeleton class="h-6 w-6" />
                    <Skeleton class="h-6 w-6" />
                  </div>
                </td>
              </tr>
            </template>

            <!-- Actual Data -->
            <template v-else>
              <tr v-for="user in filteredUsers" :key="user.id">
                <td>
                  <div class="flex items-center gap-3">
                    <div class="avatar">
                      <div class="w-10 h-10 rounded-full">
                        <img :src="user.avatar" :alt="user.name" />
                      </div>
                    </div>
                    <div>
                      <div class="font-semibold">{{ user.name }}</div>
                      <div class="text-sm text-base-content/60">{{ user.email }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="badge badge-secondary">Kelas {{ user.class }}</span>
                </td>
                <td>
                  <div class="text-sm">{{ user.phone }}</div>
                </td>
                <td>
                  <span class="badge badge-sm" :class="getStatusBadgeClass(user.status)">
                    {{ getStatusLabel(user.status) }}
                  </span>
                </td>
                <td>
                  <div class="text-sm">{{ new Date(user.joinDate).toLocaleDateString('id-ID') }}</div>
                </td>
                <td>
                  <div class="flex items-center justify-center gap-2">
                    <button @click="router.push(`/students/${user.id}`)" class="btn btn-ghost btn-xs"
                      title="Lihat Detail">
                      <EyeIcon class="w-4 h-4" />
                    </button>
                    <button @click="handleEdit(user)" class="btn btn-ghost btn-xs" title="Edit">
                      <PencilIcon class="w-4 h-4" />
                    </button>
                    <button @click="handleDelete(user)" class="btn btn-ghost btn-xs text-error" title="Hapus">
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
              <Skeleton class="h-16 w-16 rounded-full" />
              <Skeleton class="h-5 w-16 rounded-full" />
            </div>
            <div class="space-y-3">
              <Skeleton class="h-5 w-3/4" />
              <Skeleton class="h-4 w-1/2" />
              <Skeleton class="h-6 w-1/3 rounded-full" />
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
        <div v-for="user in filteredUsers" :key="user.id"
          class="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-shadow">
          <div class="card-body p-4">
            <!-- Avatar & Status -->
            <div class="flex items-start justify-between mb-3">
              <div class="avatar">
                <div class="w-16 h-16 rounded-full">
                  <img :src="user.avatar" :alt="user.name" />
                </div>
              </div>
              <span class="badge badge-sm" :class="getStatusBadgeClass(user.status)">
                {{ getStatusLabel(user.status) }}
              </span>
            </div>

            <!-- User Info -->
            <div class="space-y-2">
              <h3 class="font-semibold text-base truncate">{{ user.name }}</h3>
              <p class="text-sm text-base-content/60 truncate">{{ user.email }}</p>

              <!-- Class Badge -->
              <div class="flex items-center gap-2">
                <span class="badge badge-sm badge-secondary">Kelas {{ user.class }}</span>
              </div>

              <!-- Additional Info -->
              <div class="text-xs text-base-content/60 space-y-1">
                <div>📞 {{ user.phone }}</div>
                <div>📅 {{ new Date(user.joinDate).toLocaleDateString('id-ID') }}</div>
              </div>
            </div>

            <!-- Actions -->
            <div class="card-actions justify-end mt-4 pt-4 border-t border-base-200">
              <button @click="handleEdit(user)" class="btn btn-sm btn-ghost gap-1">
                <PencilIcon class="w-4 h-4" />
                Edit
              </button>
              <button @click="handleDelete(user)" class="btn btn-sm btn-ghost text-error gap-1">
                <TrashIcon class="w-4 h-4" />
                Hapus
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
    <div v-if="!loading && filteredUsers.length === 0" class="card bg-base-100 shadow-sm border border-base-200">
      <div class="card-body text-center py-12">
        <p class="text-base-content/60">Tidak ada data siswa ditemukan</p>
      </div>
    </div>

    <!-- Student Modal -->
    <Modal :show="showModal" :title="modalMode === 'create' ? 'Tambah Siswa Baru' : 'Edit Data Siswa'" size="xl"
      @close="showModal = false">
      <StudentForm :mode="modalMode" :model-value="selectedStudent" @submit="handleFormSubmit"
        @cancel="showModal = false" />
    </Modal>

    <!-- Delete Confirmation -->
    <ConfirmDialog v-model:show="showDeleteConfirm" title="Hapus Siswa"
      :message="`Apakah Anda yakin ingin menghapus siswa ${studentToDelete?.name}? Tindakan ini tidak dapat dibatalkan.`"
      confirm-text="Hapus" cancel-text="Batal" type="error" @confirm="confirmDelete" />
  </div>
</template>
