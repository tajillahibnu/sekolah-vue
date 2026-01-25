<script setup>
import { ref, computed, watch } from 'vue';
import { refDebounced } from '@vueuse/core';
import {
    MagnifyingGlassIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    CalendarIcon,
    CheckCircleIcon
} from '@heroicons/vue/24/outline';
import api from '@/services/api';
import Modal from '@/components/common/Modal.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import AcademicYearForm from '../components/AcademicYearForm.vue'

const items = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const debouncedSearchQuery = refDebounced(searchQuery, 500);

// Pagination
const page = ref(1);
const total = ref(0);
const selectedLimit = ref(10);
const limitOptions = [10, 20, 50];

const totalPages = computed(() => Math.ceil(total.value / selectedLimit.value));

// Modal
const showModal = ref(false);
const modalMode = ref('create');
const selectedItem = ref(null);

// Delete
const showDeleteConfirm = ref(false);
const itemToDelete = ref(null);

const fetchItems = async (reset = false) => {
    if (reset) page.value = 1;
    loading.value = true;
    try {
        const params = {
            page: page.value,
            limit: selectedLimit.value,
            q: debouncedSearchQuery.value
        };
        // Artificial delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const response = await api.get('/academic-years', { params });
        const { data, meta } = response.data;
        items.value = data;
        total.value = meta.total;
    } catch (error) {
        console.error('Failed to fetch academic years', error);
    } finally {
        loading.value = false;
    }
};

const changePage = (newPage) => {
    if (newPage > 0 && newPage <= totalPages.value) {
        page.value = newPage;
        fetchItems();
    }
};

watch([debouncedSearchQuery, selectedLimit], () => fetchItems(true));

const handleAdd = () => {
    modalMode.value = 'create';
    selectedItem.value = null;
    showModal.value = true;
};

const handleEdit = (item) => {
    modalMode.value = 'edit';
    selectedItem.value = { ...item };
    showModal.value = true;
};

const handleDelete = (item) => {
    itemToDelete.value = item;
    showDeleteConfirm.value = true;
};

const confirmDelete = async () => {
    if (!itemToDelete.value) return;
    try {
        await api.delete(`/academic-years/${itemToDelete.value.id}`);
        await fetchItems();
        itemToDelete.value = null;
    } catch (error) {
        console.error('Failed to delete', error);
    }
};

const handleFormSubmit = async (formData) => {
    try {
        if (modalMode.value === 'create') {
            await api.post('/academic-years', formData);
        } else {
            await api.put(`/academic-years/${selectedItem.value.id}`, formData);
        }
        showModal.value = false;
        selectedItem.value = null;
        await fetchItems();
    } catch (error) {
        console.error('Failed to save', error);
    }
};

fetchItems();
</script>

<template>
    <div class="space-y-8 pb-12">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div class="space-y-1">
                <h1 class="text-3xl font-black text-foreground tracking-tight">Tahun Pelajaran</h1>
                <p class="text-muted-foreground font-medium">Manajemen tahun ajaran dan semester aktif.</p>
            </div>
            <button @click="handleAdd"
                class="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2">
                <div class="bg-white/20 p-1 rounded-lg">
                    <PlusIcon class="w-5 h-5 text-white" />
                </div>
                Tambah Tahun Ajaran
            </button>
        </div>

        <!-- Filters -->
        <div
            class="relative z-40 bg-background/60 backdrop-blur-md border border-primary/10 rounded-3xl p-2 shadow-xl shadow-primary/5">
            <div class="flex flex-col lg:flex-row items-stretch lg:items-center gap-2">
                <div class="relative flex-1 group">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon
                            class="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                    <input v-model="searchQuery" type="text" placeholder="Cari tahun ajaran (e.g. 2024)..."
                        class="block w-full pl-12 pr-4 py-4 bg-primary/5 border-transparent rounded-2xl text-sm font-medium focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary/20 transition-all" />
                </div>
            </div>
        </div>

        <!-- List -->
        <div class="space-y-4">
            <template v-if="loading">
                <div v-for="i in 3" :key="i"
                    class="bg-background border border-primary/10 rounded-3xl p-6 h-24 animate-pulse"></div>
            </template>
            <template v-else>
                <div v-for="item in items" :key="item.id"
                    class="group bg-background border border-primary/10 rounded-3xl p-6 hover:shadow-xl hover:shadow-primary/5 transition-all hover:-translate-y-1 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                    :class="{ 'ring-2 ring-primary/20 bg-primary/5': item.status === 'active' }">
                    <div class="flex items-center gap-4">
                        <div class="p-3 bg-background rounded-2xl border border-border shadow-sm">
                            <CalendarIcon class="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h3 class="font-black text-xl text-foreground tracking-tight">{{ item.name }}</h3>
                            <p class="text-sm font-medium text-muted-foreground">Semester {{ item.semester }}</p>
                            <div class="mt-1 flex gap-2 text-xs text-muted-foreground">
                                <span>{{ item.startDate }}</span> - <span>{{ item.endDate }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="flex items-center gap-4">
                        <div v-if="item.status === 'active'"
                            class="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                            <CheckCircleIcon class="w-5 h-5" />
                            <span class="text-xs uppercase tracking-wider">Aktif</span>
                        </div>

                        <div class="flex items-center gap-2 pl-4 border-l border-primary/10">
                            <button @click="handleEdit(item)"
                                class="p-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all active:scale-95">
                                <PencilIcon class="w-5 h-5" />
                            </button>
                            <button @click="handleDelete(item)"
                                class="p-2.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all active:scale-95">
                                <TrashIcon class="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </template>

            <!-- Empty State -->
            <div v-if="!loading && items.length === 0"
                class="text-center py-12 border-2 border-dashed border-primary/10 rounded-3xl">
                <p class="text-muted-foreground font-medium">Tidak ada data tahun ajaran ditemukan</p>
            </div>
        </div>

        <Modal :show="showModal" :title="modalMode === 'create' ? 'Tambah Tahun Ajaran' : 'Edit Tahun Ajaran'" size="lg"
            @close="showModal = false">
            <AcademicYearForm :mode="modalMode" :model-value="selectedItem" @submit="handleFormSubmit"
                @cancel="showModal = false" />
        </Modal>

        <ConfirmDialog v-model:show="showDeleteConfirm" title="Hapus Tahun Ajaran"
            :message="`Apakah Anda yakin ingin menghapus tahun ajaran ${itemToDelete?.name}?`" confirm-text="Hapus"
            cancel-text="Batal" type="error" @confirm="confirmDelete" />

    </div>
</template>
