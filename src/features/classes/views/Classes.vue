<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useClassStore } from '@/stores/class';
import { useToast } from '@/composables/useToast';
import {
    PlusIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    Squares2X2Icon,
    ListBulletIcon,
    AcademicCapIcon,
    TrashIcon,
    Bars3Icon,
    XMarkIcon
} from '@heroicons/vue/24/outline';
import ClassCard from '../components/ClassCard.vue';
import ClassForm from '../components/ClassForm.vue';
import Modal from '@/components/common/Modal.vue';

const router = useRouter();
const classStore = useClassStore();
const toast = useToast();

// View mode
const viewMode = ref('grid'); // 'grid' or 'list'

// Filters
const searchQuery = ref('');
const selectedGrade = ref('');
const selectedStatus = ref('');
const selectedJurusan = ref('');

// Modal states
const showModal = ref(false);
const modalMode = ref('create'); // 'create' or 'edit'
const selectedClass = ref(null);

// Delete confirmation
const showDeleteConfirm = ref(false);
const classToDelete = ref(null);

// Check if SMK
const isSMK = computed(() => import.meta.env.VITE_APP_TINGKAT === 'SMK');

// Filter options
const gradeOptions = [
    { value: '', label: 'Semua Tingkat' },
    { value: '10', label: 'Kelas 10 (X)' },
    { value: '11', label: 'Kelas 11 (XI)' },
    { value: '12', label: 'Kelas 12 (XII)' }
];

const statusOptions = [
    { value: '', label: 'Semua Status' },
    { value: 'active', label: 'Aktif' },
    { value: 'inactive', label: 'Nonaktif' }
];

// Jurusan options (from store)
const jurusanOptions = computed(() => {
    const uniqueJurusan = [...new Set(classStore.classes.map(c => c.jurusan).filter(Boolean))];
    return [
        { value: '', label: 'Semua Jurusan' },
        ...uniqueJurusan.map(j => ({ value: j, label: j }))
    ];
});

// Pagination state
const page = ref(1);
const selectedLimit = ref(12); // Default to 12 for grid view (3x4)
const limitOptions = [12, 24, 48, 96];

// Watch for filter changes to reset page
watch([searchQuery, selectedGrade, selectedStatus, selectedJurusan, selectedLimit], () => {
    page.value = 1;
});

// Base filtered classes (without pagination)
const baseFilteredClasses = computed(() => {
    let classes = [...classStore.classes];

    // Search filter
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        classes = classes.filter(c =>
            c.name.toLowerCase().includes(query) ||
            (c.jurusan && c.jurusan.toLowerCase().includes(query)) ||
            (c.homeRoomTeacher && c.homeRoomTeacher.toLowerCase().includes(query))
        );
    }

    // Grade filter
    if (selectedGrade.value) {
        classes = classes.filter(c => c.grade === parseInt(selectedGrade.value));
    }

    // Status filter
    if (selectedStatus.value) {
        classes = classes.filter(c => c.status === selectedStatus.value);
    }

    // Jurusan filter (SMK only)
    if (isSMK.value && selectedJurusan.value) {
        classes = classes.filter(c => c.jurusan === selectedJurusan.value);
    }

    return classes;
});

// Pagination computed properties
const totalClasses = computed(() => baseFilteredClasses.value.length);
const totalPages = computed(() => Math.ceil(totalClasses.value / selectedLimit.value));

// Final paginated classes
const paginatedClasses = computed(() => {
    const start = (page.value - 1) * selectedLimit.value;
    const end = start + selectedLimit.value;
    return baseFilteredClasses.value.slice(start, end);
});

// Change page
const changePage = (newPage) => {
    if (newPage > 0 && newPage <= totalPages.value) {
        page.value = newPage;
        // Scroll to top of list
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

// Statistics
const stats = computed(() => {
    const total = classStore.classes.length;
    const active = classStore.classes.filter(c => c.status === 'active').length;
    const totalStudents = classStore.classes.reduce((sum, c) => sum + c.currentStudents, 0);
    const totalCapacity = classStore.classes.reduce((sum, c) => sum + c.capacity, 0);

    return {
        total,
        active,
        totalStudents,
        totalCapacity,
        averageOccupancy: totalCapacity > 0 ? Math.round((totalStudents / totalCapacity) * 100) : 0
    };

});

// Empty State Message
const emptyStateMessage = computed(() => {
    return searchQuery.value || selectedGrade.value || selectedJurusan.value || selectedStatus.value
        ? 'Tidak ada kelas yang sesuai filter'
        : 'Belum ada data kelas';
});

// Fetch classes on mount
onMounted(async () => {
    await classStore.fetchClasses();
    if (isSMK.value) {
        await classStore.fetchJurusanList();
    }
});

// Handle add class
const handleAdd = () => {
    modalMode.value = 'create';
    selectedClass.value = null;
    showModal.value = true;
};

// Handle edit class
const handleEdit = (classData) => {
    modalMode.value = 'edit';
    selectedClass.value = { ...classData };
    showModal.value = true;
};

// Handle delete class
const handleDelete = (classData) => {
    classToDelete.value = classData;
    showDeleteConfirm.value = true;
};

// Confirm delete
const confirmDelete = async () => {
    try {
        await classStore.deleteClass(classToDelete.value.id);
        toast.success('Kelas berhasil dihapus');
        showDeleteConfirm.value = false;
        classToDelete.value = null;
    } catch (error) {
        toast.error(error.message || 'Gagal menghapus kelas');
    }
};

// Handle form submit
const handleFormSubmit = async (formData) => {
    try {
        if (modalMode.value === 'create') {
            await classStore.createClass(formData);
            toast.success('Kelas berhasil ditambahkan');
        } else {
            await classStore.updateClass(selectedClass.value.id, formData);
            toast.success('Kelas berhasil diupdate');
        }
        showModal.value = false;
        selectedClass.value = null;
    } catch (error) {
        toast.error(error.message || 'Gagal menyimpan kelas');
    }
};

// Handle modal close
const handleModalClose = () => {
    showModal.value = false;
    selectedClass.value = null;
};

// Navigation
const navigateToDetail = (id) => {
    router.push({ name: 'academic-class-detail', params: { id } });
};
</script>

<template>
    <div class="space-y-8 pb-12">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div class="space-y-1">
                <h1 class="text-3xl font-black text-foreground tracking-tight">Master Data Kelas</h1>
                <p class="text-sm text-muted-foreground font-bold">
                    Kelola data kelas {{ isSMK ? 'dan jurusan' : '' }} sekolah
                </p>
            </div>
            <button @click="handleAdd"
                class="px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-sm rounded-3xl shadow-2xl shadow-primary/30 active:scale-95 transition-all flex items-center gap-3 w-full sm:w-auto justify-center">
                <div class="bg-white/20 p-1 rounded-lg">
                    <PlusIcon class="w-5 h-5 text-white" />
                </div>
                Tambah Kelas
            </button>
        </div>

        <!-- Statistics -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-3xl p-6 border border-blue-200/50">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-black uppercase tracking-wider text-blue-600">Total Kelas</span>
                    <AcademicCapIcon class="w-5 h-5 text-blue-500" />
                </div>
                <p class="text-3xl font-black text-blue-900">{{ stats.total }}</p>
            </div>

            <div
                class="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-3xl p-6 border border-emerald-200/50">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-black uppercase tracking-wider text-emerald-600">Kelas Aktif</span>
                    <AcademicCapIcon class="w-5 h-5 text-emerald-500" />
                </div>
                <p class="text-3xl font-black text-emerald-900">{{ stats.active }}</p>
            </div>

            <div class="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-3xl p-6 border border-purple-200/50">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-black uppercase tracking-wider text-purple-600">Total Siswa</span>
                    <AcademicCapIcon class="w-5 h-5 text-purple-500" />
                </div>
                <p class="text-3xl font-black text-purple-900">{{ stats.totalStudents }}</p>
            </div>

            <div class="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-3xl p-6 border border-amber-200/50">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-black uppercase tracking-wider text-amber-600">Okupansi</span>
                    <AcademicCapIcon class="w-5 h-5 text-amber-500" />
                </div>
                <p class="text-3xl font-black text-amber-900">{{ stats.averageOccupancy }}%</p>
            </div>
        </div>

        <!-- Filters & View Toggle -->
        <!-- Filters (Wrapped) -->
        <div
            class="bg-background/60 backdrop-blur-md border border-primary/10 rounded-3xl p-2 shadow-xl shadow-primary/5">
            <div class="flex flex-col lg:flex-row items-stretch lg:items-center gap-2">
                <!-- Search -->
                <div class="relative flex-1 group">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon
                            class="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                    <input v-model="searchQuery" type="text" placeholder="Cari kelas, jurusan, atau wali kelas..."
                        class="block w-full pl-12 pr-4 py-4 bg-primary/5 border-transparent rounded-2xl text-sm font-medium focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary/20 transition-all" />
                </div>

                <!-- Filters -->
                <div class="flex flex-col sm:flex-row gap-2">
                    <select v-model="selectedGrade"
                        class="px-4 py-4 bg-primary/5 border-transparent rounded-2xl text-sm font-bold focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all">
                        <option v-for="opt in gradeOptions" :key="opt.value" :value="opt.value">
                            {{ opt.label }}
                        </option>
                    </select>

                    <select v-if="isSMK" v-model="selectedJurusan"
                        class="px-4 py-4 bg-primary/5 border-transparent rounded-2xl text-sm font-bold focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all">
                        <option v-for="opt in jurusanOptions" :key="opt.value" :value="opt.value">
                            {{ opt.label }}
                        </option>
                    </select>

                    <select v-model="selectedStatus"
                        class="px-4 py-4 bg-primary/5 border-transparent rounded-2xl text-sm font-bold focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all">
                        <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                            {{ opt.label }}
                        </option>
                    </select>
                </div>
            </div>
        </div>

        <!-- Controls Row (Page Info & View Toggle) -->
        <div class="flex justify-between items-center gap-3 px-1">
            <!-- Page Info (Left) -->
            <div class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Halaman <span class="text-primary font-black">{{ page }}/{{ totalPages || 1 }}</span>
                (<span class="text-primary font-black">{{ Math.min((page - 1) * selectedLimit + 1, totalClasses)
                    }}</span>-
                <span class="text-primary font-black">{{ Math.min(page * selectedLimit, totalClasses) }}</span>
                dari <span class="text-primary font-black">{{ totalClasses }}</span> data)
            </div>

            <!-- View Toggle (Right) -->
            <div
                class="flex bg-background/50 backdrop-blur-sm border border-primary/10 p-1 rounded-2xl gap-1 shadow-sm">
                <button @click="viewMode = 'list'"
                    class="px-4 py-2 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                    :class="viewMode === 'list' ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-primary/5'">
                    <Bars3Icon class="w-5 h-5" />
                </button>
                <button @click="viewMode = 'grid'"
                    class="px-4 py-2 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                    :class="viewMode === 'grid' ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-primary/5'">
                    <Squares2X2Icon class="w-5 h-5" />
                </button>
            </div>
        </div>

        <!-- Classes Grid/List -->
        <div v-if="paginatedClasses.length > 0" :class="viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'">
            <ClassCard v-for="classData in paginatedClasses" :key="classData.id" :class-data="classData"
                :mode="viewMode" @edit="handleEdit" @delete="handleDelete" @view="navigateToDetail" />
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-20 bg-primary/[0.02] rounded-[40px] border-2 border-dashed border-primary/5">
            <div class="inline-flex p-6 bg-white rounded-3xl mb-4 shadow-xl shadow-primary/5">
                <AcademicCapIcon class="w-10 h-10 text-primary/20" />
            </div>
            <p class="text-xs font-black text-muted-foreground/40 uppercase tracking-widest">
                {{ emptyStateMessage }}
            </p>
        </div>

        <!-- Pagination Controls -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-6 py-8 px-4 border-t border-primary/5">
            <!-- Limit Selector -->
            <div
                class="flex items-center gap-1 bg-background/50 backdrop-blur-sm border border-primary/10 p-1 rounded-2xl shadow-sm order-2 sm:order-1">
                <button v-for="l in limitOptions" :key="l" @click="selectedLimit = l"
                    class="px-3 py-2 rounded-xl text-xs font-black transition-all min-w-[3rem]"
                    :class="selectedLimit === l ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'text-muted-foreground hover:bg-primary/5 hover:text-primary'">
                    {{ l }}
                </button>
            </div>

            <!-- Page Navigation -->
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

        <!-- Modal for Add/Edit Class -->
        <Modal :show="showModal" :title="modalMode === 'create' ? 'Tambah Kelas Baru' : 'Edit Data Kelas'" size="lg"
            @close="handleModalClose">
            <ClassForm :model-value="selectedClass" :mode="modalMode" @submit="handleFormSubmit"
                @cancel="handleModalClose" />
        </Modal>

        <!-- Delete Confirmation Modal -->
        <Teleport to="body">
            <div v-if="showDeleteConfirm"
                class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div
                    class="w-full max-w-md bg-background rounded-[40px] shadow-2xl p-8 animate-in zoom-in-95 duration-300">
                    <div class="text-center space-y-6">
                        <div class="inline-flex p-4 bg-rose-50 rounded-3xl">
                            <TrashIcon class="w-8 h-8 text-rose-500" />
                        </div>
                        <div>
                            <h3 class="text-xl font-black text-foreground mb-2">Hapus Kelas?</h3>
                            <p class="text-sm text-muted-foreground">
                                Apakah Anda yakin ingin menghapus kelas <strong>{{ classToDelete?.name }}</strong>?
                                Tindakan ini tidak dapat dibatalkan.
                            </p>
                        </div>
                        <div class="flex gap-4">
                            <button @click="showDeleteConfirm = false"
                                class="flex-1 px-6 py-3 bg-primary/5 hover:bg-primary/10 text-foreground rounded-2xl font-black text-sm transition-all">
                                Batal
                            </button>
                            <button @click="confirmDelete"
                                class="flex-1 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-black text-sm transition-all">
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<style scoped>
@keyframes fade-in {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes zoom-in-95 {
    from {
        opacity: 0;
        transform: scale(0.95);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

.animate-in {
    animation-fill-mode: both;
}

.fade-in {
    animation-name: fade-in;
}

.zoom-in-95 {
    animation-name: zoom-in-95;
}

.duration-200 {
    animation-duration: 200ms;
}

.duration-300 {
    animation-duration: 300ms;
}
</style>