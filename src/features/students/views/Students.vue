<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
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
  ListBulletIcon,
  UserIcon
} from '@heroicons/vue/24/outline';
import api from '@/services/api';
import Modal from '@/components/common/Modal.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import StudentForm from '../components/StudentForm.vue'
import Skeleton from '@/components/ui/skeleton/Skeleton.vue';

import { useAttendanceStore } from '@/features/attendance/stores/attendanceStore'; // Import Store

const route = useRoute();
const router = useRouter();
const attendanceStore = useAttendanceStore(); // Init Store

const users = ref([]);
const loading = ref(false);
const loadingMore = ref(false);
const searchQuery = ref('');
const debouncedSearchQuery = refDebounced(searchQuery, 500);
const selectedClass = ref('');
const viewMode = ref('table'); // 'table' or 'card'

// ... existing code ...

// Helper: Get Daily Status from Store (Mock match by Name or random for demo)
const getDailyStatus = (student) => {
  // Attempt to find matching student in attendance store
  // Since IDs might different between "Students API" and "Attendance Store", we match by name or fallback to random for demo
  const attLog = attendanceStore.dailyAttendance.find(l => l.studentName === student.name);
  return attLog || null;
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Hadir': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    case 'Sakit': return 'text-amber-600 bg-amber-50 border-amber-100';
    case 'Izin': return 'text-blue-600 bg-blue-50 border-blue-100';
    case 'Alpha': return 'text-rose-600 bg-rose-50 border-rose-100';
    default: return 'text-slate-600 bg-slate-50 border-slate-100';
  }
};

const getKbmSummary = (student) => {
  // Generate or fetch KBM summary
  // Returns { present: 8, total: 8, percent: 100 }
  // Using store's getKbmSchedule logic to calculate
  // We need a student ID for the store logic. We'll use a hash or just random if not found.
  const mockId = student.id; // API User ID
  const schedule = attendanceStore.getKbmSchedule(mockId);
  if (!schedule || schedule.length === 0) return null;

  const lessons = schedule.filter(s => s.type === 'lesson');
  const presentCount = lessons.filter(s => s.status === 'Hadir').length;

  return {
    present: presentCount,
    total: lessons.length,
    percent: (presentCount / lessons.length) * 100
  };
};

// ... existing code ...

// Pagination state
const page = ref(1);
const total = ref(0);
const totalPages = computed(() => Math.ceil(total.value / selectedLimit.value));

const classOptions = [
  { value: '', label: 'Semua Kelas' },
  { value: '10A', label: '10A' },
  { value: '10B', label: '10B' },
  { value: '11A', label: '11A' },
  { value: '11B', label: '11B' },
  { value: '12A', label: '12A' },
  { value: '12B', label: '12B' }
];

const limitOptions = [10, 20, 50, 100];
const selectedLimit = ref(10);
const showClassDropdown = ref(false);
const showLimitDropdown = ref(false);

const selectedClassLabel = computed(() => {
  const option = classOptions.find(opt => opt.value === selectedClass.value);
  return option ? option.label : 'Pilih Kelas';
});

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
  }

  loading.value = true;

  try {
    const params = {
      page: page.value,
      limit: selectedLimit.value,
      q: debouncedSearchQuery.value, // Use debounced value for API call
      class: selectedClass.value
    };

    // Add artificial delay for skeleton demo
    await new Promise(resolve => setTimeout(resolve, 800));

    const response = await api.get('/students', { params });
    const { data, meta } = response.data;

    users.value = data; // Replace data
    total.value = meta.total;
  } catch (error) {
    console.error('Failed to fetch students', error);
  } finally {
    loading.value = false;
  }
};

const changePage = (newPage) => {
  if (newPage > 0 && newPage <= totalPages.value) {
    page.value = newPage;
    fetchUsers();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// Filtered users - now mostly handled by server, but we keep the computed name for compatibility if needed
const filteredUsers = computed(() => users.value);

// Watch for filter changes
watch([debouncedSearchQuery, selectedClass, selectedLimit], () => {
  fetchUsers(true);
});

// Get status badge
const getStatusBadgeClass = (status) => {
  const statusMap = {
    'active': 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
    'inactive': 'bg-rose-50 text-rose-700 border-rose-200/50',
    'graduated': 'bg-sky-50 text-sky-700 border-sky-200/50',
    'transferred': 'bg-amber-50 text-amber-700 border-amber-200/50'
  };
  return statusMap[status] || 'bg-gray-50 text-gray-600 border-gray-200/50';
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
  <div class="space-y-8 pb-12">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
      <div class="space-y-1">
        <h1 class="text-3xl font-black text-foreground tracking-tight">Data Siswa</h1>
        <p class="text-muted-foreground font-medium">Manajemen data profil dan akademik seluruh siswa.</p>
      </div>
      <button @click="handleAdd"
        class="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2">
        <div class="bg-white/20 p-1 rounded-lg">
          <PlusIcon class="w-5 h-5 text-white" />
        </div>
        Tambah Siswa
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
          <input v-model="searchQuery" type="text" placeholder="Cari nama, NIS, atau email..."
            class="block w-full pl-12 pr-4 py-4 bg-primary/5 border-transparent rounded-2xl text-sm font-medium focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary/20 transition-all" />
        </div>

        <div class="flex flex-col sm:flex-row gap-2">
          <!-- Custom Class Dropdown -->
          <div class="relative w-full sm:w-56">
            <button @click="showClassDropdown = !showClassDropdown"
              class="w-full h-full flex items-center justify-between px-5 py-4 bg-primary/5 border-transparent rounded-2xl text-sm font-bold text-foreground hover:bg-primary/10 transition-all text-left">
              <div class="flex items-center gap-2.5">
                <FunnelIcon class="w-4 h-4 text-primary" />
                <span>{{ selectedClassLabel }}</span>
              </div>
              <ChevronDownIcon class="w-4 h-4 text-muted-foreground transition-transform duration-300"
                :class="{ 'rotate-180': showClassDropdown }" />
            </button>

            <div v-if="showClassDropdown"
              class="absolute top-full left-0 right-0 mt-2 z-[60] bg-background border border-primary/10 rounded-2xl shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-200">
              <div class="space-y-1">
                <button v-for="opt in classOptions" :key="opt.value"
                  @click="selectedClass = opt.value; showClassDropdown = false"
                  class="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all"
                  :class="selectedClass === opt.value ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5 text-muted-foreground hover:text-foreground'">
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
      <!-- Page Info (Left) -->
      <div class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
        Halaman <span class="text-primary font-black">{{ page }}/{{ totalPages }}</span>
        (<span class="text-primary font-black">{{ Math.min(page * selectedLimit, total) }}</span>/<span
          class="text-primary font-black">{{ total }}</span>)
      </div>

      <!-- View Toggle (Right) -->
      <div class="flex bg-background/50 backdrop-blur-sm border border-primary/10 p-1 rounded-2xl gap-1 shadow-sm">
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

    <!-- Table View (Redesigned as Horizontal Card List) -->
    <div v-if="viewMode === 'table'" class="space-y-4">
      <!-- Skeleton Rows (Horizontal Card Style) -->
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

      <!-- Actual Data (Horizontal Card Style) -->
      <template v-else>
        <div v-for="student in filteredUsers" :key="student.id"
          class="group bg-background border border-primary/10 rounded-3xl p-6 hover:shadow-xl hover:shadow-primary/5 transition-all hover:-translate-y-1 relative overflow-hidden">

          <!-- Card Header (Icon, Metadata, Status) -->
          <div
            class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-primary/5 pb-4 mb-5">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-primary/5 rounded-xl group-hover:bg-primary/10 transition-colors">
                <UserIcon class="w-5 h-5 text-primary" />
              </div>
              <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span class="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{{ new
                  Date(student.joinDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                  }}</span>
                <div class="hidden sm:block w-1.5 h-1.5 rounded-full bg-primary/20"></div>
                <span class="text-[11px] font-black uppercase tracking-widest text-primary">{{ student.nis }}</span>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <!-- Daily Status Badge -->
              <span v-if="getDailyStatus(student)"
                class="hidden sm:inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border"
                :class="getStatusColor(getDailyStatus(student)?.status)">
                Harian: {{ getDailyStatus(student)?.status }}
              </span>
              <!-- KBM Badge -->
              <div v-if="getKbmSummary(student)"
                class="hidden sm:flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg text-[10px] font-bold border border-slate-100">
                <span class="text-slate-500">KBM:</span>
                <span :class="getKbmSummary(student).percent >= 100 ? 'text-emerald-600' : 'text-blue-600'">
                  {{ getKbmSummary(student).present }}/{{ getKbmSummary(student).total }}
                </span>
              </div>

              <span
                class="inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border"
                :class="getStatusBadgeClass(student.status)">
                {{ getStatusLabel(student.status) }}
              </span>
            </div>
          </div>

          <!-- Card Body (Avatar, Info, Class) -->
          <div class="flex flex-col md:flex-row md:items-center gap-6">
            <div class="flex items-center gap-5 flex-1">
              <div class="relative">
                <img :src="student.avatar || `https://ui-avatars.com/api/?name=${student.name}`"
                  class="w-16 h-16 rounded-2xl object-cover shadow-md group-hover:scale-105 transition-transform" />
                <div v-if="student.status === 'active'"
                  class="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-background">
                </div>
              </div>
              <div class="space-y-1">
                <h3
                  class="font-black text-xl text-foreground tracking-tight group-hover:text-primary transition-colors">
                  {{ student.name }}</h3>
                <p class="text-sm font-medium text-muted-foreground">{{ student.email }}</p>
              </div>
            </div>

            <div class="flex items-center justify-between md:justify-end gap-6 md:min-w-[200px]">
              <div class="flex flex-col items-start md:items-end">
                <span
                  class="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Kelas
                  Aktif</span>
                <span
                  class="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-2xl text-sm font-black ring-1 ring-indigo-200/50 shadow-sm shadow-indigo-100">
                  Kelas {{ student.class }}
                </span>
              </div>

              <!-- Action Buttons (Responsive) -->
              <div class="hidden min-[1100px]:flex items-center gap-2 pl-6 border-l border-primary/5">
                <button @click="router.push(`/admin/students/${student.id}`)"
                  class="px-4 py-2.5 bg-background border-2 border-primary/5 hover:border-primary/20 hover:bg-primary/5 text-primary font-bold text-sm rounded-xl transition-all active:scale-95">
                  Detail
                </button>
                <button @click="handleEdit(student)"
                  class="px-4 py-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white font-bold text-sm rounded-xl transition-all active:scale-95">
                  Edit
                </button>
                <button @click="handleDelete(student)"
                  class="p-2.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all active:scale-95">
                  <TrashIcon class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <!-- Mobile/Compact Actions -->
          <div class="mt-6 pt-5 border-t border-primary/5 flex min-[1100px]:hidden items-center justify-end gap-3">
            <button @click="router.push(`/students/${student.id}`)"
              class="flex-1 sm:flex-none text-primary font-black text-sm hover:underline py-2">
              Lihat Detail Transaksi
            </button>
            <div class="flex gap-2">
              <button @click="handleEdit(student)"
                class="px-6 py-2.5 bg-primary text-primary-foreground font-black text-sm rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all">
                Ubah Data
              </button>
              <button @click="handleDelete(student)"
                class="p-2.5 bg-background border border-primary/10 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-colors">
                <TrashIcon class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Card View (Premium Selection) -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <!-- Skeleton Cards -->
      <template v-if="loading">
        <div v-for="i in 8" :key="i" class="bg-background border border-primary/10 rounded-3xl p-6 h-64 animate-pulse">
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
        <div v-for="student in filteredUsers" :key="student.id"
          class="group bg-background border border-primary/10 rounded-3xl p-6 hover:shadow-2xl hover:shadow-primary/10 transition-all hover:-translate-y-1 relative overflow-hidden">

          <!-- Attendance Status Badge (Top Right) -->
          <div class="absolute top-0 right-0 p-4 z-20 flex flex-col items-end gap-1">
            <!-- Daily Status -->
            <span v-if="getDailyStatus(student)"
              class="px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border bg-white/80 backdrop-blur-sm shadow-sm"
              :class="getStatusColor(getDailyStatus(student)?.status)">
              {{ getDailyStatus(student)?.status === 'Hadir' ? `Hadir ${getDailyStatus(student)?.timeIn}` :
                getDailyStatus(student)?.status }}
            </span>
            <span v-else
              class="px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-400">
              Belum Absen
            </span>

            <!-- KBM Status Summary -->
            <div v-if="getKbmSummary(student)"
              class="flex items-center gap-1 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold border border-slate-100 shadow-sm">
              <div class="w-1.5 h-1.5 rounded-full"
                :class="getKbmSummary(student).percent >= 100 ? 'bg-emerald-500' : 'bg-blue-500'"></div>
              <span class="text-slate-600">KBM {{ getKbmSummary(student).present }}/{{ getKbmSummary(student).total
              }}</span>
            </div>
          </div>

          <!-- Background Accent -->
          <div
            class="absolute -top-12 -right-12 w-24 h-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all">
          </div>

          <!-- Avatar & Status -->
          <div class="flex items-start justify-between mb-5 relative">
            <div class="relative">
              <img :src="student.avatar || `https://ui-avatars.com/api/?name=${student.name}`"
                class="w-16 h-16 rounded-2xl object-cover shadow-md group-hover:scale-105 transition-transform" />
              <div v-if="student.status === 'active'"
                class="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-background">
              </div>
            </div>
          </div>

          <!-- Student Info -->
          <div class="space-y-4 relative">
            <div class="space-y-1">
              <h3
                class="font-black text-foreground text-lg tracking-tight truncate group-hover:text-primary transition-colors">
                {{ student.name }}</h3>
              <p class="text-xs text-muted-foreground font-medium truncate">{{ student.email }}</p>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <span
                class="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest ring-1 ring-indigo-200/50">
                Kelas {{ student.class }}
              </span>
            </div>

            <!-- Contacts Info -->
            <div class="pt-2 border-t border-primary/5 flex items-center justify-between">
              <div class="flex flex-col">
                <span class="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Kontak</span>
                <span class="text-xs font-bold text-foreground">{{ student.phone }}</span>
              </div>
              <div class="flex flex-col items-end">
                <span class="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Tgl Daftar</span>
                <span class="text-xs font-bold text-foreground">{{ new
                  Date(student.joinDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) }}</span>
              </div>
            </div>

            <!-- Actions -->
            <div
              class="pt-4 flex items-center gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
              <button @click="router.push(`/admin/students/${student.id}`)"
                class="flex-1 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2">
                <EyeIcon class="w-4 h-4" />
                Detail
              </button>
              <div class="flex gap-2">
                <button @click="handleEdit(student)"
                  class="p-2.5 bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white rounded-xl transition-all">
                  <PencilIcon class="w-4 h-4" />
                </button>
                <button @click="handleDelete(student)"
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
    <div v-if="!loading && filteredUsers.length === 0" class="card bg-base-100 shadow-sm border border-base-200">
      <div class="card-body text-center py-12">
        <p class="text-base-content/60">Tidak ada data siswa ditemukan</p>
      </div>
    </div>

    <!-- Student Modal -->
    <Modal :show="showModal" :title="modalMode === 'create' ? 'Tambah Siswa Baru' : 'Edit Data Siswa'" size="lg"
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
