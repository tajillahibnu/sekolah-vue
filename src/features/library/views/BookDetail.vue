<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLibraryStore } from '@/features/library/stores/libraryStore';
import {
    ArrowLeftIcon,
    BookOpenIcon,
    PencilIcon,
    TrashIcon,
    DocumentTextIcon,
    ExclamationTriangleIcon
} from '@heroicons/vue/24/outline';
import Modal from '@/components/common/Modal.vue';

const route = useRoute();
const router = useRouter();
const store = useLibraryStore();

const bookId = computed(() => Number(route.params.id));
const book = computed(() => store.books.find(b => b.id === bookId.value));

const showEditModal = ref(false);
const editFormData = ref(null);
const modalMode = ref('edit'); // Only for edit here

// Back navigation
const goBack = () => router.push({ name: 'library-books' });

// Edit Handler
const openEditModal = () => {
    editFormData.value = { ...book.value };
    showEditModal.value = true;
};

const handleUpdate = () => {
    store.updateBook(editFormData.value);
    showEditModal.value = false;
};

// Delete Handler
const handleDelete = () => {
    if (confirm('Apakah Anda yakin ingin menghapus buku ini? Tindakan ini tidak dapat dibatalkan.')) {
        store.deleteBook(bookId.value);
        router.push({ name: 'library-books' });
    }
};

// Categories for dropdown (duplicated from list, ideally shared const)
const categories = ['Novel', 'Sastra', 'Komputer', 'Sejarah', 'Pengembangan Diri', 'Sains', 'Agama', 'Lainnya'];
</script>

<template>
    <div v-if="book" class="space-y-8 pb-12 max-w-6xl mx-auto">
        <!-- Navigation & Header -->
        <div class="flex items-center gap-4">
            <button @click="goBack" class="p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
                <ArrowLeftIcon class="w-6 h-6" />
            </button>
            <div>
                <h1 class="text-2xl font-black text-slate-800 tracking-tight">Detail Buku</h1>
                <p class="text-slate-500 font-medium text-sm">Informasi lengkap dan preview digital.</p>
            </div>
            <div class="ml-auto flex gap-2">
                <button @click="openEditModal"
                    class="px-4 py-2 bg-blue-50 text-blue-600 font-bold rounded-xl text-sm hover:bg-blue-100 transition-colors flex items-center gap-2">
                    <PencilIcon class="w-4 h-4" />
                    Edit Data
                </button>
                <button @click="handleDelete"
                    class="px-4 py-2 bg-rose-50 text-rose-600 font-bold rounded-xl text-sm hover:bg-rose-100 transition-colors flex items-center gap-2">
                    <TrashIcon class="w-4 h-4" />
                    Hapus
                </button>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Left Column: Cover & Key Status -->
            <div class="space-y-6">
                <div
                    class="aspect-[2/3] bg-slate-200 rounded-3xl overflow-hidden shadow-lg relative border border-slate-100">
                    <img v-if="book.cover" :src="book.cover" class="w-full h-full object-cover" />
                    <div v-else
                        class="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 gap-4">
                        <div class="p-4 bg-white/50 backdrop-blur-sm rounded-full shadow-sm">
                            <BookOpenIcon class="w-12 h-12 text-slate-400" />
                        </div>
                        <span class="text-xs font-black uppercase tracking-widest text-slate-500/50">No Cover
                            Available</span>
                    </div>

                    <!-- Status Badge -->
                    <div class="absolute top-4 left-4">
                        <span v-if="book.stock > 0"
                            class="px-3 py-1.5 rounded-xl bg-emerald-500/90 backdrop-blur-md text-white text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5 border border-white/10">
                            Available
                        </span>
                        <span v-else
                            class="px-3 py-1.5 rounded-xl bg-rose-500/90 backdrop-blur-md text-white text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5 border border-white/10">
                            Out of Stock
                        </span>
                    </div>
                </div>

                <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                    <h3 class="font-black text-slate-800 mb-4">Informasi Rak</h3>
                    <div class="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div>
                            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Lokasi</p>
                            <p class="text-lg font-black text-slate-800">{{ book.location }}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Sisa Stok</p>
                            <p class="text-lg font-black text-blue-600">{{ book.stock }} Expl</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Column: Details & Preview -->
            <div class="lg:col-span-2 space-y-8">
                <!-- Meta Info -->
                <div class="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm relative overflow-hidden">
                    <div class="absolute top-0 right-0 p-6 opacity-5">
                        <BookOpenIcon class="w-64 h-64" />
                    </div>

                    <div class="relative z-10 space-y-6">
                        <div>
                            <span
                                class="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-wide mb-3 inline-block">
                                {{ book.category }}
                            </span>
                            <h2 class="text-4xl font-black text-slate-800 leading-tight mb-2">{{ book.title }}</h2>
                            <p class="text-xl font-medium text-slate-500">{{ book.author }}</p>
                        </div>

                        <div class="py-6 border-y border-slate-100">
                            <h4 class="text-sm font-black text-slate-800 uppercase tracking-wider mb-2">Deskripsi Buku
                            </h4>
                            <p class="text-slate-600 leading-relaxed text-lg">
                                {{ book.description || 'Tidak ada deskripsi tersedia untuk buku ini.' }}
                            </p>
                        </div>

                        <div class="flex gap-8">
                            <div>
                                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">ISBN</p>
                                <p class="text-base font-bold text-slate-700 font-mono mt-0.5">{{ book.isbn }}</p>
                            </div>
                            <!-- More meta fields if needed -->
                        </div>
                    </div>
                </div>

                <!-- PDF Preview Section -->
                <div class="bg-white border border-slate-100 rounded-3xl p-1 shadow-sm overflow-hidden">
                    <div class="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                        <h3 class="font-black text-slate-700 flex items-center gap-2">
                            <DocumentTextIcon class="w-5 h-5 text-rose-500" />
                            Digital Preview
                        </h3>
                        <span v-if="book.fileUrl"
                            class="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">PDF
                            Available</span>
                    </div>

                    <div v-if="book.fileUrl" class="w-full h-[600px] bg-slate-100 relative">
                        <iframe :src="book.fileUrl" class="w-full h-full" loading="lazy"></iframe>
                    </div>

                    <div v-else class="h-64 flex flex-col items-center justify-center text-slate-400 gap-3">
                        <div class="p-4 bg-slate-50 rounded-full">
                            <ExclamationTriangleIcon class="w-8 h-8" />
                        </div>
                        <p class="font-bold">File digital (PDF) tidak tersedia.</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Edit Modal (Reused) -->
        <Modal :show="showEditModal" title="Edit Data Buku" @close="showEditModal = false">
            <form @submit.prevent="handleUpdate" class="space-y-4">
                <!-- Identical Form Structure to BookList -->
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                        <label class="block text-xs font-bold text-slate-500 uppercase">Judul Buku</label>
                        <input v-model="editFormData.title" required
                            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                    <div class="space-y-1">
                        <label class="block text-xs font-bold text-slate-500 uppercase">Penulis</label>
                        <input v-model="editFormData.author" required
                            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                        <label class="block text-xs font-bold text-slate-500 uppercase">Kategori</label>
                        <div class="relative">
                            <select v-model="editFormData.category"
                                class="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                            </select>
                        </div>
                    </div>
                    <div class="space-y-1">
                        <label class="block text-xs font-bold text-slate-500 uppercase">Lokasi Rak</label>
                        <input v-model="editFormData.location"
                            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                        <label class="block text-xs font-bold text-slate-500 uppercase">ISBN</label>
                        <input v-model="editFormData.isbn"
                            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                    <div class="space-y-1">
                        <label class="block text-xs font-bold text-slate-500 uppercase">Stok</label>
                        <input v-model.number="editFormData.stock" type="number" min="0"
                            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                </div>

                <div class="space-y-1">
                    <label class="block text-xs font-bold text-slate-500 uppercase">Deskripsi Singkat</label>
                    <textarea v-model="editFormData.description" rows="3"
                        class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"></textarea>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="space-y-1">
                        <label class="block text-xs font-bold text-slate-500 uppercase">URL Cover</label>
                        <input v-model="editFormData.cover"
                            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                    <div class="space-y-1">
                        <label class="block text-xs font-bold text-slate-500 uppercase">URL PDF</label>
                        <input v-model="editFormData.fileUrl"
                            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                </div>

                <div class="pt-4 flex gap-3">
                    <button type="button" @click="showEditModal = false"
                        class="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-colors">Batal</button>
                    <button type="submit"
                        class="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">Simpan
                        Perubahan</button>
                </div>
            </form>
        </Modal>
    </div>

    <!-- 404/Loading State if book not found -->
    <div v-else class="text-center py-20">
        <p class="text-slate-400 font-bold">Buku tidak ditemukan...</p>
        <button @click="goBack" class="mt-4 text-blue-600 hover:underline">Kembali ke Daftar</button>
    </div>
</template>
