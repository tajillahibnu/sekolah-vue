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
    XMarkIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from '@heroicons/vue/24/outline';
import api from '@/services/api';
import Modal from '@/components/common/Modal.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import MataPelajaranForm from '../components/MataPelajaranForm.vue'

const router = useRouter();
const mataPelajaranList = ref([]);
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
const selectedMataPelajaran = ref(null);

// Delete confirmation
const showDeleteConfirm = ref(false);
const mataPelajaranToDelete = ref(null);

// Fetch mata pelajaran
const fetchMataPelajaran = async (reset = false) => {
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

        const response = await api.get('/mata-pelajaran', { params });
        const { data, meta } = response.data;

        mataPelajaranList.value = data;
        total.value = meta?.pagination?.total || meta?.total || data.length;
    } catch (error) {
        console.error('Gagal mengambil data mata pelajaran', error);
    } finally {
        loading.value = false;
    }
};

const changePage = (newPage) => {
    if (newPage > 0 && newPage <= totalPages.value) {
        page.value = newPage;
        fetchMataPelajaran();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

// Watch for filter changes
watch([debouncedSearchQuery, selectedLimit], () => {
    fetchMataPelajaran(true);
});

// Helper for status badge
const getStatusBadgeClass = (isAktif) => {
    return isAktif === 1 || isAktif === true
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50'
        : 'bg-gray-50 text-gray-600 border-gray-200/50';
};

const getStatusLabel = (isAktif) => {
    return isAktif === 1 || isAktif === true ? 'Aktif' : 'Nonaktif';
};

// Handle actions
const handleAdd = () => {
    modalMode.value = 'create';
    selectedMataPelajaran.value = null;
    showModal.value = true;
};

const handleEdit = async (mp) => {
    loading.value = true;
    try {
        const response = await api.get(`/mata-pelajaran/${mp.id}`);
        selectedMataPelajaran.value = response.data.data;
        modalMode.value = 'edit';
        showModal.value = true;
    } catch (error) {
        console.error('Gagal mengambil detail mata pelajaran', error);
    } finally {
        loading.value = false;
    }
};

const handleDelete = (mp) => {
    mataPelajaranToDelete.value = mp;
    showDeleteConfirm.value = true;
};

const confirmDelete = async () => {
    if (!mataPelajaranToDelete.value) return;

    try {
        await api.delete(`/mata-pelajaran/${mataPelajaranToDelete.value.id}`);
        await fetchMataPelajaran(); // Refresh list
        mataPelajaranToDelete.value = null;
    } catch (error) {
        console.error('Gagal menghapus mata pelajaran', error);
    }
};

const handleFormSubmit = async (formData) => {
    try {
        if (modalMode.value === 'create') {
            await api.post('/mata-pelajaran', formData);
        } else {
            await api.put(`/mata-pelajaran/${selectedMataPelajaran.value.id}`, formData);
        }

        showModal.value = false;
        selectedMataPelajaran.value = null;
        await fetchMataPelajaran();
    } catch (error) {
        console.error('Gagal menyimpan data mata pelajaran', error);
    }
};

fetchMataPelajaran();
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

        <!-- Controls (View Toggle & Limit) -->
        <div class="flex justify-between items-center gap-3 px-1 mb-4">
            <div class="flex items-center gap-1.5 bg-primary/5 p-1 rounded-2xl">
                <button v-for="l in limitOptions" :key="l" @click="selectedLimit = l"
                    class="px-3 py-1.5 rounded-xl text-[10px] font-black transition-all min-w-[2.5rem]"
                    :class="selectedLimit === l ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'">
                    {{ l }}
                </button>
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

        <!-- Data Display Section -->
        <div class="relative min-h-[400px]">
            <!-- Loading State -->
            <div v-if="loading" class="space-y-4">
                <div v-for="i in 5" :key="i" class="bg-card border border-primary/5 rounded-3xl p-6 animate-pulse">
                    <div class="flex items-center gap-4">
                        <div class="h-12 w-12 bg-primary/5 rounded-2xl"></div>
                        <div class="space-y-2 flex-1">
                            <div class="h-4 bg-primary/10 rounded w-1/4"></div>
                            <div class="h-3 bg-primary/5 rounded w-1/2"></div>
                        </div>
                    </div>
                </div>
            </div>

            <template v-else>
                <!-- Desktop Table View (Only shown if viewMode is table) -->
                <div v-if="viewMode === 'table'"
                    class="hidden md:block bg-card rounded-[8px] border border-primary/5 shadow-sm overflow-hidden animate-fade-in">
                    <div class="overflow-x-auto text-sm">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-primary/[0.02] border-b border-primary/5">
                                    <th
                                        class="p-6 text-[10px] font-black uppercase text-muted-foreground tracking-widest w-12 text-center">
                                        No</th>
                                    <th
                                        class="p-6 text-[10px] font-black uppercase text-muted-foreground tracking-widest w-24">
                                        Kode</th>
                                    <th
                                        class="p-6 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                                        Mata Pelajaran</th>
                                    <th
                                        class="p-6 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                                        Kategori</th>
                                    <th
                                        class="p-6 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-center">
                                        Tipe</th>
                                    <th
                                        class="p-6 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-center">
                                        Status</th>
                                    <th
                                        class="p-6 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-right">
                                        Aksi</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-primary/5">
                                <tr v-for="(mp, index) in mataPelajaranList" :key="mp.id"
                                    class="hover:bg-primary/[0.01] transition-colors group">
                                    <td class="p-6 text-center">
                                        <span class="text-xs font-black text-muted-foreground/40">{{ (page - 1) *
                                            selectedLimit + index + 1 }}</span>
                                    </td>
                                    <td class="p-6">
                                        <span
                                            class="inline-flex items-center px-2.5 py-1.5 bg-primary/5 text-primary text-[10px] font-black rounded-lg">
                                            {{ mp.kode }}
                                        </span>
                                    </td>
                                    <td class="p-6">
                                        <div class="space-y-1">
                                            <p
                                                class="font-black text-foreground group-hover:text-primary transition-colors">
                                                {{ mp.nama }}</p>
                                            <p v-if="mp.deskripsi"
                                                class="text-xs text-muted-foreground/60 line-clamp-1 italic">{{
                                                    mp.deskripsi }}</p>
                                        </div>
                                    </td>
                                    <td class="p-6 whitespace-nowrap">
                                        <span
                                            class="text-xs font-bold text-muted-foreground/80 uppercase tracking-tight">{{
                                                mp.kategori }}</span>
                                    </td>
                                    <td class="p-6 text-center">
                                        <span
                                            class="inline-flex items-center px-3 py-1 bg-indigo-50/50 text-indigo-700 rounded-xl text-[9px] font-black uppercase tracking-widest ring-1 ring-indigo-200/30">
                                            {{ mp.tipe }}
                                        </span>
                                    </td>
                                    <td class="p-6 text-center">
                                        <span
                                            class="inline-flex items-center px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all"
                                            :class="getStatusBadgeClass(mp.is_aktif)">
                                            {{ getStatusLabel(mp.is_aktif) }}
                                        </span>
                                    </td>
                                    <td class="p-6 text-right">
                                        <div class="flex items-center justify-end gap-2 pr-2">
                                            <button @click="handleEdit(mp)"
                                                class="p-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all active:scale-95 shadow-sm"
                                                title="Edit">
                                                <PencilIcon class="w-4 h-4" />
                                            </button>
                                            <button @click="handleDelete(mp)"
                                                class="p-2.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all active:scale-95 shadow-sm"
                                                title="Hapus">
                                                <TrashIcon class="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Card View (Only shown if viewMode is card) -->
                <div v-if="viewMode === 'card'"
                    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
                    <div v-for="mp in mataPelajaranList" :key="mp.id"
                        class="group bg-card border border-primary/5 rounded-[8px] p-6 hover:shadow-2xl hover:shadow-primary/10 transition-all hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between h-full">
                        <div class="flex justify-between items-start mb-4">
                            <span
                                class="inline-block px-3 py-1.5 bg-primary/10 text-primary rounded-xl font-black text-[10px]">
                                {{ mp.kode }}
                            </span>
                            <span
                                class="inline-flex items-center px-2 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider border"
                                :class="getStatusBadgeClass(mp.is_aktif)">
                                {{ getStatusLabel(mp.is_aktif) }}
                            </span>
                        </div>

                        <div class="mb-6 flex-1">
                            <h3
                                class="font-black text-lg text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-2">
                                {{ mp.nama }}
                            </h3>
                            <p class="text-[10px] text-muted-foreground/60 font-black uppercase tracking-widest">{{
                                mp.kategori }}</p>
                        </div>

                        <div class="flex items-center gap-2 pt-4 border-t border-primary/5">
                            <button @click="handleEdit(mp)"
                                class="flex-1 py-3 px-4 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all active:scale-95">
                                Edit
                            </button>
                            <button @click="handleDelete(mp)"
                                class="p-3 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-2xl transition-all active:scale-95">
                                <TrashIcon class="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Fallback/Mobile List View (If in table mode but screen is mobile) -->
                <div v-if="viewMode === 'table'" class="md:hidden space-y-4 animate-fade-in">
                    <div v-for="mp in mataPelajaranList" :key="mp.id"
                        class="bg-card border border-primary/5 rounded-[8px] p-5 shadow-sm active:scale-[0.98] transition-all">
                        <div class="flex items-center gap-4 mb-4">
                            <div
                                class="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary font-black text-xs shrink-0">
                                {{ mp.kode }}
                            </div>
                            <div class="flex-1 min-w-0">
                                <h4 class="font-black text-foreground truncate">{{ mp.nama }}</h4>
                                <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">{{
                                    mp.kategori }}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-3 pt-4 border-t border-primary/5">
                            <button @click="handleEdit(mp)"
                                class="flex-1 py-3 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all">
                                <PencilIcon class="w-4 h-4" />
                                Edit
                            </button>
                            <button @click="handleDelete(mp)"
                                class="w-12 h-11 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center active:scale-95 transition-all">
                                <TrashIcon class="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </template>

            <!-- Empty State -->
            <div v-if="!loading && mataPelajaranList.length === 0"
                class="text-center py-20 bg-primary/[0.01] border-2 border-dashed border-primary/10 rounded-[40px] animate-fade-in">
                <BookOpenIcon class="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 class="text-xl font-black text-foreground tracking-tight">Data Tidak Ditemukan</h3>
                <p class="text-muted-foreground text-sm font-medium mt-1">Belum ada mata pelajaran dalam daftar ini.</p>
                <button @click="handleAdd"
                    class="mt-6 inline-flex items-center gap-2 text-primary font-black text-sm hover:underline px-4 py-2 bg-primary/5 rounded-xl transition-all">
                    <PlusIcon class="w-4 h-4" />
                    Tambah Mata Pelajaran
                </button>
            </div>
        </div>

        <!-- Modal & Confirm -->
        <Modal :show="showModal" :title="modalMode === 'create' ? 'Tambah Mata Pelajaran' : 'Edit Mata Pelajaran'"
            size="lg" @close="showModal = false">
            <MataPelajaranForm :mode="modalMode" :model-value="selectedMataPelajaran" @submit="handleFormSubmit"
                @cancel="showModal = false" />
        </Modal>

        <ConfirmDialog v-model:show="showDeleteConfirm" title="Hapus Mata Pelajaran"
            :message="`Apakah Anda yakin ingin menghapus mata pelajaran ${mataPelajaranToDelete?.nama}?`"
            confirm-text="Hapus" cancel-text="Batal" type="error" @confirm="confirmDelete" />

        <!-- Pagination Footer -->
        <div class="flex flex-col md:flex-row items-center justify-between gap-6 py-8 mt-4">
            <div class="flex flex-col sm:flex-row items-center gap-6">
                <!-- Data Info -->
                <div class="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest whitespace-nowrap">
                    Menampilkan
                    <span class="text-foreground font-black">{{ total > 0 ? (page - 1) * selectedLimit + 1 : 0 }}</span>
                    -
                    <span class="text-foreground font-black">{{ Math.min(page * selectedLimit, total) }}</span>
                    dari <span class="text-foreground font-black">{{ total }}</span> Data
                </div>
            </div>

            <!-- Page Navigation -->
            <div class="flex items-center gap-3">
                <button @click="changePage(page - 1)" :disabled="page <= 1"
                    class="w-10 h-10 flex items-center justify-center rounded-xl bg-background border border-primary/10 text-muted-foreground hover:bg-primary hover:text-white hover:border-primary disabled:opacity-30 disabled:hover:bg-background disabled:hover:text-muted-foreground disabled:hover:border-primary/10 transition-all shadow-sm">
                    <ChevronLeftIcon class="w-5 h-5" />
                </button>

                <div class="flex items-center gap-2">
                    <button v-for="p in totalPages" :key="p" @click="changePage(p)"
                        class="w-10 h-10 flex items-center justify-center rounded-xl text-xs font-black transition-all"
                        :class="p === page ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'bg-background border border-primary/10 text-muted-foreground hover:border-primary/30'">
                        {{ p }}
                    </button>
                </div>

                <button @click="changePage(page + 1)" :disabled="page >= totalPages"
                    class="w-10 h-10 flex items-center justify-center rounded-xl bg-background border border-primary/10 text-muted-foreground hover:bg-primary hover:text-white hover:border-primary disabled:opacity-30 disabled:hover:bg-background disabled:hover:text-muted-foreground disabled:hover:border-primary/10 transition-all shadow-sm">
                    <ChevronRightIcon class="w-5 h-5" />
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.animate-fade-in {
    animation: fadeIn 0.4s ease-out forwards;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
