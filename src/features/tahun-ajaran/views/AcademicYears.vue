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
    CalendarIcon,
    CheckCircleIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    AdjustmentsHorizontalIcon
} from '@heroicons/vue/24/outline';
import api from '@/services/api';
import Modal from '@/components/common/Modal.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import AcademicYearForm from '../components/AcademicYearForm.vue'
import AcademicTermList from '../components/AcademicTermList.vue'

const router = useRouter();
const academicYears = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const debouncedSearchQuery = refDebounced(searchQuery, 500);
const viewMode = ref('table');

// Pagination state
const page = ref(1);
const total = ref(0);
const selectedLimit = ref(10);
const limitOptions = [10, 20, 50, 100];

const totalPages = computed(() => Math.ceil(total.value / selectedLimit.value));

// Modals
const showModal = ref(false);
const modalMode = ref('create');
const selectedYear = ref(null);

const showTermModal = ref(false);
const selectedYearForTerm = ref(null);

// Delete confirmation
const showDeleteConfirm = ref(false);
const yearToDelete = ref(null);

// Fetch academic years
const fetchAcademicYears = async (reset = false) => {
    if (reset) page.value = 1;
    loading.value = true;
    try {
        const params = {
            page: page.value,
            limit: selectedLimit.value,
            q: debouncedSearchQuery.value
        };

        const response = await api.get('/academic-years', { params });
        const { data, pagination, total: totalMeta } = response.data.meta || response.data;

        academicYears.value = response.data.data;
        total.value = pagination?.total || totalMeta || response.data.data.length;

        // Menerapkan pembaharuan reaktif langsung ke list sesi jika modal terbuka
        if (showTermModal.value && selectedYearForTerm.value) {
            const updated = academicYears.value.find(y => y.id === selectedYearForTerm.value.id);
            if (updated) {
                selectedYearForTerm.value = updated;
            }
        }
    } catch (error) {
        console.error('Gagal mengambil data tahun pelajaran', error);
    } finally {
        loading.value = false;
    }
};

const changePage = (newPage) => {
    if (newPage > 0 && newPage <= totalPages.value) {
        page.value = newPage;
        fetchAcademicYears();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

watch([debouncedSearchQuery, selectedLimit], () => {
    fetchAcademicYears(true);
});

// Helpers
const getActiveTerm = (terms) => {
    if (!terms) return null;
    return terms.find(t => t.is_active);
};

// Actions
const handleAdd = () => {
    modalMode.value = 'create';
    selectedYear.value = null;
    showModal.value = true;
};

const handleEdit = (year) => {
    selectedYear.value = { ...year };
    modalMode.value = 'edit';
    showModal.value = true;
};

const handleDelete = (year) => {
    yearToDelete.value = year;
    showDeleteConfirm.value = true;
};

const handleManageTerms = (year) => {
    selectedYearForTerm.value = year;
    showTermModal.value = true;
};

const confirmDelete = async () => {
    if (!yearToDelete.value) return;
    try {
        await api.delete(`/academic-years/${yearToDelete.value.id}`);
        await fetchAcademicYears();
        yearToDelete.value = null;
    } catch (error) {
        console.error('Gagal menghapus tahun pelajaran', error);
    }
};

const handleFormSubmit = async (formData) => {
    try {
        if (modalMode.value === 'create') {
            await api.post('/academic-years', formData);
        } else {
            await api.put(`/academic-years/${selectedYear.value.id}`, formData);
        }
        showModal.value = false;
        selectedYear.value = null;
        await fetchAcademicYears();
    } catch (error) {
        console.error('Gagal menyimpan data', error);
    }
};

fetchAcademicYears();
</script>

<template>
    <div class="space-y-8 pb-12">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div class="space-y-1">
                <h1 class="text-3xl font-black text-foreground tracking-tight">Master Tahun Pelajaran</h1>
                <p class="text-muted-foreground font-medium">Manajemen tahun ajaran dan konfigurasi sesi (semester).</p>
            </div>
            <button @click="handleAdd"
                class="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2">
                <div class="bg-white/20 p-1 rounded-lg">
                    <PlusIcon class="w-5 h-5 text-white" />
                </div>
                Tambah Tahun
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
                    <input v-model="searchQuery" type="text" placeholder="Cari nama tahun (e.g. 2025/2026)..."
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
                <!-- Table View -->
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
                                        class="p-6 text-[10px] font-black uppercase text-muted-foreground tracking-widest min-w-[150px]">
                                        Tahun Pelajaran</th>
                                    <th
                                        class="p-6 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-center">
                                        Jumlah Sesi</th>
                                    <th
                                        class="p-6 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-center">
                                        Sesi Aktif</th>
                                    <th
                                        class="p-6 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-right">
                                        Aksi</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-primary/5">
                                <tr v-for="(year, index) in academicYears" :key="year.id"
                                    class="hover:bg-primary/[0.01] transition-colors group">
                                    <td class="p-6 text-center text-xs font-black text-muted-foreground/40">{{ (page -
                                        1) * selectedLimit + index + 1 }}</td>

                                    <td class="p-6">
                                        <div class="flex items-center gap-3">
                                            <div class="p-2 bg-primary/5 rounded-lg border border-primary/10">
                                                <CalendarIcon class="w-5 h-5 text-primary" />
                                            </div>
                                            <span class="font-black text-foreground tracking-tight text-base">{{
                                                year.name }}</span>
                                        </div>
                                    </td>

                                    <td class="p-6 text-center">
                                        <span
                                            class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs ring-1 ring-slate-200">
                                            {{ year.terms?.length || 0 }}
                                        </span>
                                    </td>

                                    <td class="p-6 text-center">
                                        <div v-if="getActiveTerm(year.terms)"
                                            class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200/50 shadow-sm">
                                            <CheckCircleIcon class="w-4 h-4" />
                                            <span class="text-[10px] font-black uppercase tracking-widest">{{
                                                getActiveTerm(year.terms).semester }}</span>
                                        </div>
                                        <span v-else class="text-[10px] text-muted-foreground font-bold italic">-</span>
                                    </td>

                                    <td class="p-6 text-right">
                                        <div class="flex items-center justify-end gap-2 pr-2">
                                            <button @click="handleManageTerms(year)"
                                                class="px-3 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white flex items-center gap-2 rounded-xl transition-all active:scale-95 shadow-sm text-xs font-bold tracking-wide"
                                                title="Kelola Sesi Akademik">
                                                <AdjustmentsHorizontalIcon class="w-4 h-4" />
                                                Sesi
                                            </button>
                                            <button @click="handleEdit(year)"
                                                class="p-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all active:scale-95 shadow-sm"
                                                title="Edit Master Tahun">
                                                <PencilIcon class="w-4 h-4" />
                                            </button>
                                            <button @click="handleDelete(year)"
                                                class="p-2.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all active:scale-95 shadow-sm"
                                                title="Hapus Tahun">
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
                <div v-if="viewMode === 'card'"
                    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
                    <div v-for="year in academicYears" :key="year.id"
                        class="group bg-card border border-primary/5 rounded-[8px] p-6 hover:shadow-2xl hover:shadow-primary/10 transition-all hover:-translate-y-1 relative flex flex-col justify-between h-full">
                        <div class="flex justify-between items-start mb-6">
                            <div class="p-3 bg-primary/5 rounded-2xl border border-primary/10">
                                <CalendarIcon class="w-6 h-6 text-primary" />
                            </div>
                            <div v-if="getActiveTerm(year.terms)"
                                class="inline-flex py-1 px-2.5 bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-widest rounded-lg border border-emerald-100 flex items-center gap-1 shadow-sm">
                                <CheckCircleIcon class="w-3 h-3" />
                                {{ getActiveTerm(year.terms).semester }} Aktif
                            </div>
                        </div>

                        <div class="mb-6 flex-1">
                            <h3
                                class="font-black text-2xl tracking-tight text-foreground mb-1 group-hover:text-primary transition-colors">
                                {{ year.name }}</h3>
                            <p class="text-[10px] text-muted-foreground/80 font-bold uppercase tracking-widest">{{
                                year.terms?.length || 0 }} Sesi Terdaftar</p>
                        </div>

                        <div class="flex flex-col gap-2 pt-4 border-t border-primary/5">
                            <button @click="handleManageTerms(year)"
                                class="w-full py-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all active:scale-95 flex justify-center items-center gap-1">
                                <AdjustmentsHorizontalIcon class="w-4 h-4" /> Kelola Sesi
                            </button>
                            <div class="flex gap-2">
                                <button @click="handleEdit(year)"
                                    class="flex-1 py-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white font-black text-[10px] border border-transparent hover:border-emerald-600 uppercase tracking-widest rounded-xl transition-all active:scale-95">Edit</button>
                                <button @click="handleDelete(year)"
                                    class="w-11 flex justify-center items-center bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all active:scale-95">
                                    <TrashIcon class="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Fallback Mobile (For Table Mode) -->
                <div v-if="viewMode === 'table'" class="md:hidden space-y-4 animate-fade-in">
                    <div v-for="year in academicYears" :key="year.id"
                        class="bg-card border border-primary/5 rounded-[8px] p-5 shadow-sm active:scale-[0.98] transition-all">
                        <div class="flex items-center justify-between gap-4 mb-4">
                            <div class="flex items-center gap-3">
                                <div
                                    class="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                                    <CalendarIcon class="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 class="font-black text-lg text-foreground truncate tracking-tight">{{ year.name
                                        }}</h4>
                                    <p class="text-[10px] font-bold text-muted-foreground tracking-widest">{{
                                        year.terms?.length || 0 }} SESI</p>
                                </div>
                            </div>
                            <div v-if="getActiveTerm(year.terms)"
                                class="inline-flex p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
                                <CheckCircleIcon class="w-4 h-4" />
                            </div>
                        </div>

                        <div class="flex items-center gap-2 pt-4 border-t border-primary/5">
                            <button @click="handleManageTerms(year)"
                                class="flex-1 py-3 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center gap-1.5 font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all">
                                <AdjustmentsHorizontalIcon class="w-4 h-4" /> Sesi
                            </button>
                            <button @click="handleEdit(year)"
                                class="w-12 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center active:scale-95 transition-all">
                                <PencilIcon class="w-4 h-4" />
                            </button>
                            <button @click="handleDelete(year)"
                                class="w-12 h-11 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center active:scale-95 transition-all">
                                <TrashIcon class="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </template>

            <!-- Empty State -->
            <div v-if="!loading && academicYears.length === 0"
                class="text-center py-20 bg-primary/[0.01] border-2 border-dashed border-primary/10 rounded-[40px] animate-fade-in">
                <CalendarIcon class="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 class="text-xl font-black text-foreground tracking-tight">Data Tidak Ditemukan</h3>
                <p class="text-muted-foreground text-sm font-medium mt-1">Belum ada tahun pelajaran dalam daftar ini.
                </p>
                <button @click="handleAdd"
                    class="mt-6 inline-flex items-center gap-2 text-primary font-black text-sm hover:underline px-4 py-2 bg-primary/5 rounded-xl transition-all">
                    <PlusIcon class="w-4 h-4" /> Tambah Tahun
                </button>
            </div>
        </div>

        <!-- Modals -->
        <Modal :show="showModal" :title="modalMode === 'create' ? 'Tambah Tahun Pelajaran' : 'Edit Tahun Pelajaran'"
            size="md" @close="showModal = false">
            <AcademicYearForm :mode="modalMode" :model-value="selectedYear" @submit="handleFormSubmit"
                @cancel="showModal = false" />
        </Modal>

        <Modal :show="showTermModal" :title="`Sesi Semester (Tahun ${selectedYearForTerm?.name})`"
            @close="showTermModal = false">
            <AcademicTermList :academic-year="selectedYearForTerm" @refresh="fetchAcademicYears"
                @close="showTermModal = false" />
        </Modal>

        <ConfirmDialog v-model:show="showDeleteConfirm" title="Hapus Tahun Pelajaran"
            :message="`Menghapus tahun ajaran ${yearToDelete?.name} akan menghapus SELURUH SESI semester di dalamnya. Lanjutkan?`"
            confirm-text="Hapus" cancel-text="Batal" type="error" @confirm="confirmDelete" />

        <!-- Pagination -->
        <div class="flex flex-col md:flex-row items-center justify-between gap-6 py-8 mt-4">
            <div class="flex flex-col sm:flex-row items-center gap-6">
                <!-- Data Info -->
                <div class="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest whitespace-nowrap">
                    Menampilkan <span class="text-foreground font-black">{{ total > 0 ? (page - 1) * selectedLimit + 1 :
                        0
                        }}</span> - <span class="text-foreground font-black">{{ Math.min(page * selectedLimit, total)
                        }}</span>
                    dari <span class="text-foreground font-black">{{ total }}</span> Data
                </div>
            </div>

            <!-- Page Navigation -->
            <div class="flex items-center gap-3">
                <button @click="changePage(page - 1)" :disabled="page <= 1"
                    class="w-10 h-10 flex items-center justify-center rounded-xl bg-background border border-primary/10 text-muted-foreground hover:bg-primary hover:text-white hover:border-primary disabled:opacity-30 transition-all shadow-sm">
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
                    class="w-10 h-10 flex items-center justify-center rounded-xl bg-background border border-primary/10 text-muted-foreground hover:bg-primary hover:text-white hover:border-primary disabled:opacity-30 transition-all shadow-sm">
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
