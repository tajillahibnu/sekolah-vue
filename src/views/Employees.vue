<script setup>
import { ref, computed } from 'vue';
import { 
  MagnifyingGlassIcon, 
  Bars3Icon,
  Squares2X2Icon,
  PlusIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/vue/24/outline';
import api from '../services/api';

const users = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const selectedRole = ref('all');
const viewMode = ref('table'); // 'table' or 'card'

// Fetch employees (Guru & Staff)
const fetchEmployees = async () => {
  loading.value = true;
  try {
    const response = await api.get('/users');
    // Filter only Guru and Staff
    users.value = response.data.filter(user => 
      user.role.toLowerCase() === 'guru' || user.role.toLowerCase() === 'staff'
    );
  } catch (error) {
    console.error('Failed to fetch employees', error);
  } finally {
    loading.value = false;
  }
};

// Filtered users
const filteredUsers = computed(() => {
  let filtered = users.value;
  
  // Filter by search query
  if (searchQuery.value) {
    filtered = filtered.filter(user => 
      user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }
  
  // Filter by role
  if (selectedRole.value !== 'all') {
    filtered = filtered.filter(user => user.role.toLowerCase() === selectedRole.value.toLowerCase());
  }
  
  return filtered;
});

// Get role badge color
const getRoleBadgeClass = (role) => {
  const classes = {
    'Guru': 'badge-primary',
    'Staff': 'badge-accent'
  };
  return classes[role] || 'badge-ghost';
};

// Get status badge
const getStatusBadgeClass = (status) => {
  return status === 'active' ? 'badge-success' : 'badge-error';
};

// Initialize
fetchEmployees();
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-base-content">Data Pegawai</h1>
        <p class="text-sm text-base-content/60 mt-1">Kelola data guru dan staff</p>
      </div>
      <button class="btn btn-primary gap-2">
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
              <MagnifyingGlassIcon class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
              <input 
                v-model="searchQuery"
                type="text" 
                placeholder="Cari nama atau email..." 
                class="input input-bordered w-full pl-10"
              />
            </div>
          </div>

          <!-- Role Filter -->
          <select v-model="selectedRole" class="select select-bordered w-full lg:w-48">
            <option value="all">Semua</option>
            <option value="guru">Guru</option>
            <option value="staff">Staff</option>
          </select>

          <!-- View Toggle -->
          <div class="join">
            <button 
              @click="viewMode = 'table'"
              class="btn join-item"
              :class="viewMode === 'table' ? 'btn-active' : ''"
            >
              <Bars3Icon class="w-5 h-5" />
            </button>
            <button 
              @click="viewMode = 'card'"
              class="btn join-item"
              :class="viewMode === 'card' ? 'btn-active' : ''"
            >
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
              <th>Pegawai</th>
              <th>Jabatan</th>
              <th>Kontak</th>
              <th>Status</th>
              <th>Bergabung</th>
              <th class="text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
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
                <span class="badge" :class="getRoleBadgeClass(user.role)">{{ user.role }}</span>
                <div v-if="user.subject" class="text-xs text-base-content/60 mt-1">{{ user.subject }}</div>
                <div v-if="user.position" class="text-xs text-base-content/60 mt-1">{{ user.position }}</div>
              </td>
              <td>
                <div class="text-sm">{{ user.phone }}</div>
              </td>
              <td>
                <span class="badge badge-sm" :class="getStatusBadgeClass(user.status)">
                  {{ user.status === 'active' ? 'Aktif' : 'Nonaktif' }}
                </span>
              </td>
              <td>
                <div class="text-sm">{{ new Date(user.joinDate).toLocaleDateString('id-ID') }}</div>
              </td>
              <td>
                <div class="flex items-center justify-center gap-2">
                  <button class="btn btn-ghost btn-xs">
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button class="btn btn-ghost btn-xs text-error">
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Card View -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div 
        v-for="user in filteredUsers" 
        :key="user.id"
        class="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-shadow"
      >
        <div class="card-body p-4">
          <!-- Avatar & Status -->
          <div class="flex items-start justify-between mb-3">
            <div class="avatar">
              <div class="w-16 h-16 rounded-full">
                <img :src="user.avatar" :alt="user.name" />
              </div>
            </div>
            <span class="badge badge-sm" :class="getStatusBadgeClass(user.status)">
              {{ user.status === 'active' ? 'Aktif' : 'Nonaktif' }}
            </span>
          </div>

          <!-- User Info -->
          <div class="space-y-2">
            <h3 class="font-semibold text-base truncate">{{ user.name }}</h3>
            <p class="text-sm text-base-content/60 truncate">{{ user.email }}</p>
            
            <!-- Role Badge -->
            <div class="flex items-center gap-2">
              <span class="badge badge-sm" :class="getRoleBadgeClass(user.role)">{{ user.role }}</span>
            </div>

            <!-- Additional Info -->
            <div class="text-xs text-base-content/60 space-y-1">
              <div v-if="user.subject">📚 {{ user.subject }}</div>
              <div v-if="user.position">💼 {{ user.position }}</div>
              <div>📞 {{ user.phone }}</div>
              <div>📅 {{ new Date(user.joinDate).toLocaleDateString('id-ID') }}</div>
            </div>
          </div>

          <!-- Actions -->
          <div class="card-actions justify-end mt-4 pt-4 border-t border-base-200">
            <button class="btn btn-sm btn-ghost gap-1">
              <PencilIcon class="w-4 h-4" />
              Edit
            </button>
            <button class="btn btn-sm btn-ghost text-error gap-1">
              <TrashIcon class="w-4 h-4" />
              Hapus
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredUsers.length === 0" class="card bg-base-100 shadow-sm border border-base-200">
      <div class="card-body text-center py-12">
        <p class="text-base-content/60">Tidak ada data pegawai ditemukan</p>
      </div>
    </div>
  </div>
</template>
