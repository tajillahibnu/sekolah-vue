<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { refDebounced } from '@vueuse/core';
import {
    MagnifyingGlassIcon,
    PlusIcon,
    TrashIcon,
    EyeIcon,
    PencilIcon,
    KeyIcon,
    ChevronDownIcon,
    CheckIcon,
    FunnelIcon,
    UserPlusIcon,
    UserIcon,
    ListBulletIcon
} from '@heroicons/vue/24/outline';
import api from '@/services/api';
import Modal from '@/components/common/Modal.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import StudentForm from '../components/StudentForm.vue'
import Skeleton from '@/components/ui/skeleton/Skeleton.vue';
import ServerSelect from '@/components/ui/form/ServerSelect.vue';

const router = useRouter();

const students = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const debouncedSearchQuery = refDebounced(searchQuery, 500);
const selectedLevel = ref('');

// Pagination state
const page = ref(1);
const total = ref(0);
const selectedLimit = ref(10);
const limitOptions = [10, 20, 50, 100];
const totalPages = computed(() => Math.ceil(total.value / selectedLimit.value));

const jumpToPage = ref(1);
const handleJumpToPage = () => {
    const p = parseInt(jumpToPage.value);
    if (!isNaN(p) && p >= 1 && p <= totalPages.value) {
        changePage(p);
    } else {
        jumpToPage.value = page.value;
    }
};

watch(page, (val) => {
    jumpToPage.value = val;
});

const visiblePages = computed(() => {
    const current = page.value;
    const last = totalPages.value;
    const delta = 2;
    const left = current - delta;
    const right = current + delta + 1;
    const pages = [];
    const pagesWithDot = [];
    let l;

    for (let i = 1; i <= last; i++) {
        if (i === 1 || i === last || (i >= left && i < right)) {
            pages.push(i);
        }
    }

    for (const i of pages) {
        if (l) {
            if (i - l === 2) {
                pagesWithDot.push(l + 1);
            } else if (i - l !== 1) {
                pagesWithDot.push('...');
            }
        }
        pagesWithDot.push(i);
        l = i;
    }

    return pagesWithDot;
});

const showLimitDropdown = ref(false);

const fetchStudents = async (reset = false) => {
    if (reset) page.value = 1;
    loading.value = true;

    try {
        const params = {
            page: page.value,
            limit: selectedLimit.value,
            q: debouncedSearchQuery.value,
            unclassed: 'true'
        };

        if (selectedLevel.value) {
            params.tingkat_id = selectedLevel.value;
        }

        const response = await api.get('/siswas', { params });
        const { data, meta } = response.data;

        students.value = data;
        total.value = meta.total;
    } catch (error) {
        console.error('Failed to fetch unclassed students', error);
    } finally {
        loading.value = false;
    }
};

const changePage = (newPage) => {
    if (newPage > 0 && newPage <= totalPages.value) {
        page.value = newPage;
        fetchStudents();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

watch([debouncedSearchQuery, selectedLevel, selectedLimit], () => {
    fetchStudents(true);
});

onMounted(() => {
    fetchStudents();
});

// Modal & Delete Logic (Simplified copy from Students.vue)
const showModal = ref(false);
const modalMode = ref('create');
const selectedStudent = ref(null);
const showDeleteConfirm = ref(false);
const studentToDelete = ref(null);
const showPasswordConfirm = ref(false);
const studentToReset = ref(null);

const handleEdit = (student) => {
    modalMode.value = 'edit';
    selectedStudent.value = { ...student };
    showModal.value = true;
};

const handleResetPassword = (student) => {
    studentToReset.value = student;
    showPasswordConfirm.value = true;
};

const confirmResetPassword = async () => {
    if (!studentToReset.value || !studentToReset.value.userId) return;
    try {
        await api.put(`/users/${studentToReset.value.userId}`, {
            password: 'password123', // Default password or logic from system
            name: studentToReset.value.name,
            email: studentToReset.value.email
        });
        showPasswordConfirm.value = false;
        // Could add toast here if available
    } catch (error) {
        console.error('Password reset failed', error);
    }
};

const handleDelete = (student) => {
    studentToDelete.value = student;
    showDeleteConfirm.value = true;
};

const confirmDelete = async () => {
    if (!studentToDelete.value) return;
    try {
        await api.delete(`/siswas/${studentToDelete.value.id}`);
        fetchStudents();
        showDeleteConfirm.value = false;
    } catch (error) {
        console.error('Delete failed', error);
    }
};

const handleFormSubmit = async (formData) => {
    try {
        if (modalMode.value === 'create') {
            await api.post('/siswas', formData);
        } else {
            await api.put(`/siswas/${selectedStudent.value.id}`, formData);
        }
        showModal.value = false;
        fetchStudents();
    } catch (error) {
        console.error('Save failed', error);
    }
};

// Helper to get initials (max 2 chars)
const getInitials = (name) => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};
</script>

<template>
    <div class="space-y-8 pb-12 text-foreground">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div class="space-y-1">
                <h1 class="text-3xl font-black tracking-tight flex items-center gap-3">
                    <UserPlusIcon class="w-8 h-8 text-primary" />
                    Siswa Belum Berkelas
                </h1>
                <p class="text-muted-foreground font-medium">Manajemen siswa baru (PPDB/Pindahan) yang belum masuk
                    rombel.</p>
            </div>
            <button @click="modalMode = 'create'; showModal = true"
                class="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2">
                <PlusIcon class="w-5 h-5" />
                Tambah Siswa Baru
            </button>
        </div>

        <!-- Filters -->
        <div
            class="relative z-50 bg-background/60 backdrop-blur-md border border-primary/10 rounded-3xl p-2 shadow-xl shadow-primary/5 flex flex-col lg:flex-row gap-2">
            <div class="relative flex-1 group">
                <MagnifyingGlassIcon
                    class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input v-model="searchQuery" type="text" placeholder="Cari nama atau NIS..."
                    class="block w-full pl-12 pr-4 py-4 bg-primary/5 border-transparent rounded-2xl text-sm font-medium focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all border-0 shadow-none outline-none" />
            </div>

            <div class="flex flex-col sm:flex-row gap-2">
                <!-- Level Filter -->
                <div class="w-full sm:w-56">
                    <ServerSelect v-model="selectedLevel" api-url="/levels" placeholder="Semua Tingkat" label=""
                        :icon="FunnelIcon" :all-option="{ value: '', label: 'Semua Tingkat' }"
                        @change="fetchStudents(true)" />
                </div>

                <!-- Limit Selector -->
                <div class="relative w-full sm:w-32">
                    <button @click="showLimitDropdown = !showLimitDropdown"
                        class="w-full h-full flex items-center justify-between px-5 py-4 bg-primary/5 border-transparent rounded-2xl text-sm font-bold text-foreground hover:bg-primary/10 transition-all text-left">
                        <div class="flex items-center gap-2.5 text-xs">
                            <ListBulletIcon class="w-4 h-4 text-primary" />
                            <span>{{ selectedLimit }} Item</span>
                        </div>
                        <ChevronDownIcon class="w-4 h-4 text-muted-foreground transition-transform"
                            :class="{ 'rotate-180': showLimitDropdown }" />
                    </button>

                    <div v-if="showLimitDropdown"
                        class="absolute top-full left-0 right-0 mt-2 z-[60] bg-card border border-primary/10 rounded-2xl shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-200">
                        <div class="space-y-1">
                            <button v-for="limit in limitOptions" :key="limit"
                                @click="selectedLimit = limit; showLimitDropdown = false"
                                class="w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all"
                                :class="selectedLimit === limit ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5 text-muted-foreground hover:text-foreground'">
                                <span>{{ limit }} Item</span>
                                <CheckIcon v-if="selectedLimit === limit" class="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Data List -->
        <div class="space-y-4">
            <div v-if="loading" v-for="i in 3" :key="i" class="bg-card rounded-3xl p-6 animate-pulse border-0">
                <div class="h-16 bg-primary/5 rounded-2xl"></div>
            </div>

            <div v-else-if="students.length === 0"
                class="text-center py-20 bg-primary/[0.01] border-2 border-dashed border-primary/10 rounded-[40px]">
                <UserIcon class="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 class="text-xl font-black tracking-tight">Semua siswa sudah masuk kelas</h3>
                <p class="text-muted-foreground mt-1 max-w-sm mx-auto">Tidak ada antrean siswa baru yang perlu diproses
                    saat ini.</p>
            </div>

            <div v-else v-for="student in students" :key="student.id"
                class="group bg-card border-0 rounded-3xl p-6 hover:shadow-xl transition-all relative overflow-hidden">
                <div class="flex flex-col md:flex-row md:items-center gap-6">
                    <div class="flex items-center gap-5 flex-1">
                        <div class="relative">
                            <div class="avatar" :class="{ 'placeholder': !student.avatar }">
                                <div class="rounded-2xl w-16 h-16 shadow-md group-hover:scale-105 transition-transform overflow-hidden"
                                    :class="student.avatar ? '' : 'bg-primary/10 text-primary flex items-center justify-center'">
                                    <img v-if="student.avatar" :src="student.avatar" :alt="student.name"
                                        class="w-full h-full object-cover" />
                                    <span v-else class="text-xl font-black">{{ getInitials(student.name) }}</span>
                                </div>
                            </div>
                            <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-500 rounded-full border-4 border-background"
                                title="Belum Berkelas"></div>
                        </div>
                        <div>
                            <h3 class="font-black text-xl group-hover:text-primary transition-colors">{{ student.name }}
                            </h3>
                            <div class="flex items-center gap-3 mt-1 text-sm text-muted-foreground font-medium">
                                <span>{{ student.nis }}</span>
                                <span class="w-1 h-1 bg-muted-foreground/30 rounded-full"></span>
                                <span>Daftar: {{ new Date(student.joinDate).toLocaleDateString('id-ID') }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="flex items-center justify-between md:justify-end gap-6 md:min-w-[300px]">
                        <div class="flex flex-col items-start md:items-end">
                            <span
                                class="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Target
                                Tingkat</span>
                            <span
                                class="inline-flex items-center px-4 py-2 bg-primary/5 text-primary rounded-2xl text-sm font-black border border-primary/10">
                                {{ student.level?.name || 'Unknown' }}
                            </span>
                        </div>

                        <div class="flex items-center gap-2 pl-4 border-l border-primary/5">
                            <button @click="router.push(`/admin/students/${student.id}`)"
                                class="p-2.5 bg-background border-2 border-primary/5 hover:border-primary/20 text-primary rounded-xl transition-all">
                                <EyeIcon class="w-5 h-5" />
                            </button>
                            <button @click="handleEdit(student)"
                                class="p-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all"
                                title="Edit Data">
                                <PencilIcon class="w-5 h-5" />
                            </button>
                            <button @click="handleResetPassword(student)"
                                class="p-2.5 bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white rounded-xl transition-all"
                                title="Reset Password">
                                <KeyIcon class="w-5 h-5" />
                            </button>
                            <button @click="handleDelete(student)"
                                class="p-2.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all"
                                title="Hapus">
                                <TrashIcon class="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                <div class="absolute top-0 right-0 p-4">
                    <span
                        class="px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-black uppercase rounded-lg border border-amber-100">Antrean
                        PPDB</span>
                </div>

                <!-- Watermark Background -->
                <div
                    class="absolute -bottom-4 -right-2 text-7xl font-black text-primary/[0.03] select-none pointer-events-none uppercase italic group-hover:text-primary/[0.07] transition-colors leading-none tracking-tighter">
                    {{ student.level?.name }}
                </div>
            </div>
        </div>

        <!-- Pagination Controls -->
        <div v-if="students.length > 0"
            class="flex flex-col sm:flex-row items-center justify-between gap-6 py-8 px-4 border-t border-primary/5">
            <div
                class="flex items-center gap-1.5 bg-background/50 backdrop-blur-sm border border-primary/10 p-1 rounded-2xl shadow-sm">
                <button @click="changePage(page - 1)" :disabled="page <= 1"
                    class="p-2 rounded-xl text-muted-foreground hover:bg-primary/5 hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd"
                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            clip-rule="evenodd" />
                    </svg>
                </button>

                <div class="flex items-center gap-1">
                    <template v-for="(p, idx) in visiblePages" :key="idx">
                        <span v-if="p === '...'"
                            class="px-2 text-muted-foreground/50 font-black tracking-widest text-[10px]">...</span>
                        <button v-else @click="changePage(p)"
                            class="w-9 h-9 flex items-center justify-center rounded-xl text-xs font-black transition-all"
                            :class="page === p ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-primary/5 hover:text-primary'">
                            {{ p }}
                        </button>
                    </template>
                </div>

                <button @click="changePage(page + 1)" :disabled="page >= totalPages"
                    class="p-2 rounded-xl text-muted-foreground hover:bg-primary/5 hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clip-rule="evenodd" />
                    </svg>
                </button>
            </div>

            <!-- Jump to Page Input -->
            <div class="hidden lg:flex items-center gap-2 pl-4 border-l border-primary/5">
                <span class="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Ke Hal.</span>
                <input v-model="jumpToPage" type="number" min="1" :max="totalPages" @keyup.enter="handleJumpToPage"
                    @blur="handleJumpToPage"
                    class="w-14 h-9 bg-primary/5 border-transparent rounded-xl text-xs font-black text-center focus:bg-background focus:ring-2 focus:ring-primary/10 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
            </div>
        </div>

        <Modal :show="showModal" :title="modalMode === 'create' ? 'Input Siswa Baru' : 'Edit Calon Siswa'" size="lg"
            @close="showModal = false">
            <StudentForm :mode="modalMode" :model-value="selectedStudent" @submit="handleFormSubmit"
                @cancel="showModal = false" />
        </Modal>

        <ConfirmDialog v-model:show="showDeleteConfirm" title="Hapus Calon Siswa"
            message="Apakah Anda yakin ingin membatalkan pendaftaran siswa ini?" type="error"
            @confirm="confirmDelete" />

        <ConfirmDialog v-model:show="showPasswordConfirm" title="Reset Password Siswa"
            :message="`Apakah Anda yakin ingin mereset password untuk ${studentToReset?.name}? Password akan dikembalikan ke default: password123`"
            type="warning" @confirm="confirmResetPassword" />
    </div>
</template>
