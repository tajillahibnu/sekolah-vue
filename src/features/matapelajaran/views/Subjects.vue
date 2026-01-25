<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { refDebounced } from '@vueuse/core';
import {
    MagnifyingGlassIcon,
    Bars3Icon,
    Squares2X2Icon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    BookOpenIcon,
    CheckIcon,
    XMarkIcon
} from '@heroicons/vue/24/outline';
import api from '@/services/api';
import Modal from '@/components/common/Modal.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import SubjectForm from '../components/SubjectForm.vue'

const router = useRouter();
const subjects = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const debouncedSearchQuery = refDebounced(searchQuery, 500);
const viewMode = ref('table'); // 'table' or 'card'

// Pagination state
const page = ref(1);
const total = ref(0);
const selectedLimit = ref(10);
const limitOptions = [10, 20, 50, 100];

const totalPages = computed(() => Math.ceil(total.value / selectedLimit.value));

// Modal states
const showModal = ref(false);
const modalMode = ref('create'); // 'create' or 'edit'
const selectedSubject = ref(null);

// Delete confirmation
const showDeleteConfirm = ref(false);
const subjectToDelete = ref(null);

// Fetch subjects
const fetchSubjects = async (reset = false) => {
    if (reset) {
        page.value = 1;
    }

    loading.value = true;

    try {
        const params = {
            page: page.value,
            limit: selectedLimit.value,
            q: debouncedSearchQuery.value
        };

        // Artificial delay for smooth UI feeling
        await new Promise(resolve => setTimeout(resolve, 500));

        const response = await api.get('/subjects', { params });
        const { data, meta } = response.data;

        subjects.value = data;
        total.value = meta.total;
    } catch (error) {
        console.error('Failed to fetch subjects', error);
    } finally {
        loading.value = false;
    }
};

const changePage = (newPage) => {
    if (newPage > 0 && newPage <= totalPages.value) {
        page.value = newPage;
        fetchSubjects();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

// Watch for filter changes
watch([debouncedSearchQuery, selectedLimit], () => {
    fetchSubjects(true);
});

// Helper for status badge
const getStatusBadgeClass = (status) => {
    return status === 'active'
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50'
        : 'bg-gray-50 text-gray-600 border-gray-200/50';
};

const getStatusLabel = (status) => {
    return status === 'active' ? 'Aktif' : 'Nonaktif';
};

// Handle actions
const handleAdd = () => {
    modalMode.value = 'create';
    selectedSubject.value = null;
    showModal.value = true;
};

const handleEdit = (subject) => {
    modalMode.value = 'edit';
    selectedSubject.value = { ...subject };
    showModal.value = true;
};

const handleDelete = (subject) => {
    subjectToDelete.value = subject;
    showDeleteConfirm.value = true;
};

const confirmDelete = async () => {
    if (!subjectToDelete.value) return;

    try {
        await api.delete(`/subjects/${subjectToDelete.value.id}`);
        await fetchSubjects(); // Refresh list
        subjectToDelete.value = null;
    } catch (error) {
        console.error('Failed to delete subject', error);
    }
};

const handleFormSubmit = async (formData) => {
    try {
        if (modalMode.value === 'create') {
            await api.post('/subjects', formData);
        } else {
            await api.put(`/subjects/${selectedSubject.value.id}`, formData);
        }

        showModal.value = false;
        selectedSubject.value = null;
        await fetchSubjects();
    } catch (error) {
        console.error('Failed to save subject', error);
    }
};

fetchSubjects();
</script>

<template>
    <div class="space-y-8 pb-12">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div class="space-y-1">
                <h1 class="text-3xl font-black text-foreground tracking-tight">Master Mata Pelajaran</h1>
                <p class="text-muted-foreground font-medium">Manajemen data mata pelajaran dan kategori.</p>
            </div>
            <button @click="handleAdd"
                class="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2">
                <div class="bg-white/20 p-1 rounded-lg">
                    <PlusIcon class="w-5 h-5 text-white" />
                </div>
                Tambah Mapel
            </button>
        </div>

        <!-- Filters & View Toggle -->
        <div
            class="relative z-40 bg-background/60 backdrop-blur-md border border-primary/10 rounded-3xl p-2 shadow-xl shadow-primary/5">
            <div class="flex flex-col lg:flex-row items-stretch lg:items-center gap-2">
                <!-- Search -->
                <div class="relative flex-1 group">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon
                            class="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                    <input v-model="searchQuery" type="text" placeholder="Cari kode atau nama mapel..."
                        class="block w-full pl-12 pr-4 py-4 bg-primary/5 border-transparent rounded-2xl text-sm font-medium focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary/20 transition-all" />
                </div>
            </div>
        </div>

        <!-- Controls (Pagination & View Limit) -->
        <div class="flex justify-between items-center gap-3 px-1 mb-4">
            <div class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Halaman <span class="text-primary font-black">{{ page }}/{{ totalPages || 1 }}</span>
                (<span class="text-primary font-black">{{ Math.min((page - 1) * selectedLimit + 1, total) }}</span> -
                <span class="text-primary font-black">{{ Math.min(page * selectedLimit, total) }}</span> dari
                <span class="text-primary font-black">{{ total }}</span>)
            </div>

            <!-- View Toggle -->
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

        <!-- List View (Table-like Horizontal Cards) -->
        <div v-if="viewMode === 'table'" class="space-y-4">
            <template v-if="loading">
                <div v-for="i in 5" :key="i"
                    class="bg-background border border-primary/10 rounded-3xl p-6 animate-pulse space-y-4">
                    <div class="h-6 w-1/3 bg-primary/10 rounded-lg"></div>
                    <div class="h-4 w-1/2 bg-primary/5 rounded-lg"></div>
                </div>
            </template>
            <template v-else>
                <div v-for="subject in subjects" :key="subject.id"
                    class="group bg-background border border-primary/10 rounded-3xl p-6 hover:shadow-xl hover:shadow-primary/5 transition-all hover:-translate-y-1 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">

                    <!-- Subject Info -->
                    <div class="flex items-start gap-4">
                         <div class="p-4 bg-primary/5 rounded-2xl text-primary font-bold text-center min-w-[4rem]">
                            <span class="text-xs uppercase tracking-wider block opacity-70">Kode</span>
                            <span class="text-lg">{{ subject.code }}</span>
                        </div>
                        <div class="space-y-1">
                            <h3
                                class="font-black text-xl text-foreground tracking-tight group-hover:text-primary transition-colors">
                                {{ subject.name }}
                            </h3>
                            <div class="flex flex-wrap items-center gap-2">
                                <span
                                    class="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl text-[10px] font-black uppercase tracking-widest ring-1 ring-indigo-200/50">
                                    {{ subject.category }}
                                </span>
                            </div>
                            <p v-if="subject.description" class="text-sm text-muted-foreground pt-1">{{ subject.description }}</p>
                        </div>
                    </div>

                    <!-- Status & Actions -->
                    <div class="flex items-center gap-4 sm:border-l sm:border-primary/5 sm:pl-6">
                         <span class="inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border"
                            :class="getStatusBadgeClass(subject.status)">
                            {{ getStatusLabel(subject.status) }}
                        </span>
                        
                        <div class="flex items-center gap-2">
                             <button @click="handleEdit(subject)"
                                class="p-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all active:scale-95"
                                title="Edit Mata Pelajaran">
                                <PencilIcon class="w-5 h-5" />
                            </button>
                            <button @click="handleDelete(subject)"
                                class="p-2.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all active:scale-95"
                                title="Hapus Mata Pelajaran">
                                <TrashIcon class="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </template>
        </div>

        <!-- Card View -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             <template v-if="loading">
                <div v-for="i in 6" :key="i" class="bg-background border border-primary/10 rounded-3xl p-6 h-48 animate-pulse"></div>
            </template>
            <template v-else>
                 <div v-for="subject in subjects" :key="subject.id"
                    class="group bg-background border border-primary/10 rounded-3xl p-6 hover:shadow-2xl hover:shadow-primary/10 transition-all hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between h-full">
                    
                    <div class="flex justify-between items-start mb-4">
                         <span class="inline-block px-3 py-1 bg-primary/10 text-primary rounded-lg font-bold text-xs">
                             {{ subject.code }}
                         </span>
                          <span class="inline-flex items-center px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border"
                            :class="getStatusBadgeClass(subject.status)">
                            {{ getStatusLabel(subject.status) }}
                        </span>
                    </div>

                    <div class="mb-6 flex-1">
                        <h3 class="font-black text-lg text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-2">
                             {{ subject.name }}
                        </h3>
                        <p class="text-xs text-muted-foreground font-bold uppercase tracking-wider">{{ subject.category }}</p>
                    </div>

                     <!-- Actions -->
                    <div class="flex items-center gap-2 pt-4 border-t border-primary/5">
                        <button @click="handleEdit(subject)"
                            class="flex-1 px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white font-bold text-xs rounded-xl transition-all">
                            Edit
                        </button>
                        <button @click="handleDelete(subject)"
                            class="p-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all">
                            <TrashIcon class="w-4 h-4" />
                        </button>
                    </div>
                 </div>
            </template>
        </div>

         <!-- Empty State -->
        <div v-if="!loading && subjects.length === 0" class="text-center py-12 border-2 border-dashed border-primary/10 rounded-3xl">
             <BookOpenIcon class="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50"/>
            <p class="text-muted-foreground font-medium">Tidak ada mata pelajaran ditemukan</p>
            <button @click="handleAdd" class="mt-4 text-primary font-bold hover:underline">Tambah mata pelajaran baru</button>
        </div>

         <!-- Modal & Confirm -->
        <Modal :show="showModal" :title="modalMode === 'create' ? 'Tambah Mata Pelajaran' : 'Edit Mata Pelajaran'" size="lg"
            @close="showModal = false">
            <SubjectForm :mode="modalMode" :model-value="selectedSubject" @submit="handleFormSubmit"
                @cancel="showModal = false" />
        </Modal>

        <ConfirmDialog v-model:show="showDeleteConfirm" title="Hapus Mata Pelajaran"
            :message="`Apakah Anda yakin ingin menghapus mata pelajaran ${subjectToDelete?.name}?`"
            confirm-text="Hapus" cancel-text="Batal" type="error" @confirm="confirmDelete" />

        <!-- Pagination Footer -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-6 py-8 px-4 border-t border-primary/5 mt-4">
             <div class="flex items-center gap-1 bg-background/50 backdrop-blur-sm border border-primary/10 p-1 rounded-2xl shadow-sm">
                <button v-for="l in limitOptions" :key="l" @click="selectedLimit = l"
                    class="px-3 py-2 rounded-xl text-xs font-black transition-all min-w-[3rem]"
                    :class="selectedLimit === l ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'text-muted-foreground hover:bg-primary/5 hover:text-primary'">
                    {{ l }}
                </button>
            </div>
             <div class="flex items-center gap-2">
                 <button @click="changePage(page - 1)" :disabled="page <= 1"
                    class="p-2 rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary disabled:opacity-50 disabled:hover:bg-transparent transition-all">
                   &larr;
                </button>
                <span class="text-sm font-bold text-muted-foreground">Halaman {{ page }}</span>
                 <button @click="changePage(page + 1)" :disabled="page >= totalPages"
                    class="p-2 rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary disabled:opacity-50 disabled:hover:bg-transparent transition-all">
                   &rarr;
                </button>
            </div>
        </div>
    </div>
</template>
