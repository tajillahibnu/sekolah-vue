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
    'Guru': 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
    'Staff': 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80'
  };
  return classes[role] || 'border-transparent bg-muted text-muted-foreground hover:bg-muted/80';
};

// Get status badge
const getStatusBadgeClass = (status) => {
  return status === 'active'
    ? 'border-transparent bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
    : 'border-transparent bg-rose-100 text-rose-700 hover:bg-rose-200';
};

// Initialize
fetchEmployees();
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Data Pegawai</h1>
        <p class="text-sm text-muted-foreground mt-1">Kelola data guru dan staff</p>
      </div>
      <button
        class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2 font-medium transition-colors shadow-sm">
        <PlusIcon class="w-5 h-5" />
        Tambah Pegawai
      </button>
    </div>

    <!-- Filters & View Toggle -->
    <div class="bg-card text-card-foreground rounded-xl border-0 shadow-sm">
      <div class="p-4">
        <div class="flex flex-col lg:flex-row gap-4">
          <!-- Search -->
          <div class="flex-1">
            <div class="relative">
              <MagnifyingGlassIcon class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input v-model="searchQuery" type="text" placeholder="Cari nama atau email..."
                class="flex h-10 w-full rounded-md border-transparent bg-muted/50 pl-10 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus:bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
            </div>
          </div>

          <!-- Role Filter -->
          <div class="relative">
            <select v-model="selectedRole"
              class="flex h-10 w-full items-center justify-between rounded-md border-transparent bg-muted/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:bg-background focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 lg:w-48 appearance-none">
              <option value="all">Semua</option>
              <option value="guru">Guru</option>
              <option value="staff">Staff</option>
            </select>
          </div>

          <!-- View Toggle -->
          <div class="flex items-center gap-1 border-0 bg-muted/50 rounded-lg p-1">
            <button @click="viewMode = 'table'" class="p-2 rounded-md transition-colors"
              :class="viewMode === 'table' ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted text-muted-foreground'">
              <Bars3Icon class="w-5 h-5" />
            </button>
            <button @click="viewMode = 'card'" class="p-2 rounded-md transition-colors"
              :class="viewMode === 'card' ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted text-muted-foreground'">
              <Squares2X2Icon class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Table View -->
    <div v-if="viewMode === 'table'" class="bg-card text-card-foreground rounded-xl border-0 shadow-sm overflow-hidden">
      <div class="relative w-full overflow-auto">
        <table class="w-full caption-bottom text-sm">
          <thead class="[&_tr]:border-b-0">
            <tr class="border-b-0 transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Pegawai</th>
              <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Jabatan</th>
              <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Kontak</th>
              <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
              <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Bergabung</th>
              <th class="h-12 px-4 text-center align-middle font-medium text-muted-foreground">Aksi</th>
            </tr>
          </thead>
          <tbody class="[&_tr:last-child]:border-0">
            <tr v-for="user in filteredUsers" :key="user.id"
              class="border-b border-border/50 transition-colors hover:bg-muted/50">
              <td class="p-4 align-middle">
                <div class="flex items-center gap-3">
                  <div class="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
                    <div class="h-full w-full bg-muted">
                      <img :src="user.avatar" :alt="user.name" class="h-full w-full object-cover" />
                    </div>
                  </div>
                  <div>
                    <div class="font-semibold">{{ user.name }}</div>
                    <div class="text-sm text-muted-foreground">{{ user.email }}</div>
                  </div>
                </div>
              </td>
              <td class="p-4 align-middle">
                <span
                  class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  :class="getRoleBadgeClass(user.role)">{{ user.role }}</span>
                <div v-if="user.subject" class="text-xs text-muted-foreground mt-1">{{ user.subject }}</div>
                <div v-if="user.position" class="text-xs text-muted-foreground mt-1">{{ user.position }}</div>
              </td>
              <td class="p-4 align-middle">
                <div class="text-sm">{{ user.phone }}</div>
              </td>
              <td class="p-4 align-middle">
                <span
                  class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  :class="getStatusBadgeClass(user.status)">
                  {{ user.status === 'active' ? 'Aktif' : 'Nonaktif' }}
                </span>
              </td>
              <td class="p-4 align-middle">
                <div class="text-sm">{{ new Date(user.joinDate).toLocaleDateString('id-ID') }}</div>
              </td>
              <td class="p-4 align-middle">
                <div class="flex items-center justify-center gap-2">
                  <button
                    class="items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9 flex">
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    class="items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9 flex text-destructive">
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
      <div v-for="user in filteredUsers" :key="user.id"
        class="bg-card text-card-foreground rounded-xl border-0 shadow-sm hover:shadow-md transition-shadow">
        <div class="p-6">
          <!-- Avatar & Status -->
          <div class="flex items-start justify-between mb-3">
            <div class="relative flex h-16 w-16 shrink-0 overflow-hidden rounded-full">
              <div class="h-full w-full bg-muted">
                <img :src="user.avatar" :alt="user.name" class="h-full w-full object-cover" />
              </div>
            </div>
            <span
              class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              :class="getStatusBadgeClass(user.status)">
              {{ user.status === 'active' ? 'Aktif' : 'Nonaktif' }}
            </span>
          </div>

          <!-- User Info -->
          <div class="space-y-2">
            <h3 class="font-semibold text-base truncate">{{ user.name }}</h3>
            <p class="text-sm text-muted-foreground truncate">{{ user.email }}</p>

            <!-- Role Badge -->
            <div class="flex items-center gap-2">
              <span
                class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                :class="getRoleBadgeClass(user.role)">{{ user.role }}</span>
            </div>

            <!-- Additional Info -->
            <div class="text-xs text-muted-foreground space-y-1">
              <div v-if="user.subject">📚 {{ user.subject }}</div>
              <div v-if="user.position">💼 {{ user.position }}</div>
              <div>📞 {{ user.phone }}</div>
              <div>📅 {{ new Date(user.joinDate).toLocaleDateString('id-ID') }}</div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-border/50">
            <button
              class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-3 gap-1">
              <PencilIcon class="w-4 h-4" />
              Edit
            </button>
            <button
              class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-3 text-destructive gap-1">
              <TrashIcon class="w-4 h-4" />
              Hapus
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredUsers.length === 0" class="bg-card text-card-foreground rounded-xl border-0 shadow-sm">
      <div class="p-12 text-center">
        <p class="text-muted-foreground">Tidak ada data pegawai ditemukan</p>
      </div>
    </div>
  </div>
</template>
