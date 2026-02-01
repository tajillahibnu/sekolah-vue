<script setup>
import { ref, computed } from 'vue';
import {
    MagnifyingGlassIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    BookOpenIcon,
    ListBulletIcon,
    Squares2X2Icon,
    EyeIcon,
    DocumentTextIcon,
    XMarkIcon
} from '@heroicons/vue/24/outline';
import { useRouter } from 'vue-router';
import { useLibraryStore } from '@/features/library/stores/libraryStore';
import Modal from '@/components/common/Modal.vue';

const router = useRouter();
const store = useLibraryStore();
const searchQuery = ref('');
const viewMode = ref('card'); // 'card' | 'list'
const showModal = ref(false);
const modalMode = ref('create'); // 'create' | 'edit'

const selectedBook = ref({
    title: '',
    author: '',
    isbn: '',
    category: '',
    stock: 1,
    location: '',
    cover: '',
    description: '',
    fileUrl: ''
});

// Categories for dropdown
const categories = ['Novel', 'Sastra', 'Komputer', 'Sejarah', 'Pengembangan Diri', 'Sains', 'Agama', 'Lainnya'];

const filteredBooks = computed(() => {
    if (!searchQuery.value) return store.books;
    const query = searchQuery.value.toLowerCase();
    return store.books.filter(b =>
        b.title.toLowerCase().includes(query) ||
        b.author.toLowerCase().includes(query) ||
        b.isbn.includes(query)
    );
});

const openCreateModal = () => {
    modalMode.value = 'create';
    selectedBook.value = { title: '', author: '', isbn: '', category: '', stock: 1, location: '', cover: '', description: '', fileUrl: '' };
    showModal.value = true;
};

const openEditModal = (book) => {
    modalMode.value = 'edit';
    selectedBook.value = { ...book };
    showModal.value = true;
};

const openDetail = (book) => {
    router.push({ name: 'library-book-detail', params: { id: book.id } });
};

const handleSubmit = () => {
    if (modalMode.value === 'create') {
        store.addBook(selectedBook.value);
    } else {
        store.updateBook(selectedBook.value);
    }
    showModal.value = false;
};

const handleDelete = (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus buku ini?')) {
        store.deleteBook(id);
    }
};
</script>

<template>
    <div class="space-y-8 pb-12">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div class="space-y-1">
                <h1 class="text-3xl font-black text-slate-800 tracking-tight">Koleksi Buku</h1>
                <p class="text-slate-500 font-medium">Manajemen data buku perpustakaan.</p>
            </div>
            <button @click="openCreateModal"
                class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold transition-all hover:shadow-lg hover:shadow-blue-600/30 flex items-center gap-2">
                <PlusIcon class="w-5 h-5" />
                Tambah Buku
            </button>
        </div>

        <!-- Controls Bar -->
        <div class="flex flex-col sm:flex-row gap-4">
            <!-- Filter Bar -->
            <div class="flex-1 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2">
                <div class="bg-slate-50 p-2.5 rounded-xl text-slate-400">
                    <MagnifyingGlassIcon class="w-5 h-5" />
                </div>
                <input v-model="searchQuery" type="text" placeholder="Cari judul, penulis, atau ISBN..."
                    class="flex-1 bg-transparent text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none" />
            </div>

            <!-- View Toggle -->
            <div class="bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-1 shrink-0">
                <button @click="viewMode = 'card'"
                    class="p-3 rounded-xl transition-all flex items-center justify-center gap-2"
                    :class="viewMode === 'card' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'">
                    <Squares2X2Icon class="w-5 h-5" />
                </button>
                <button @click="viewMode = 'list'"
                    class="p-3 rounded-xl transition-all flex items-center justify-center gap-2"
                    :class="viewMode === 'list' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'">
                    <ListBulletIcon class="w-5 h-5" />
                </button>
            </div>
        </div>

        <!-- VIEW: GRID (CARD) -->
        <div v-if="viewMode === 'card'"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div v-for="book in filteredBooks" :key="book.id"
                class="group bg-white border border-slate-100 rounded-3xl p-4 hover:shadow-xl transition-all hover:-translate-y-1 relative h-full flex flex-col">

                <!-- Card Header/Cover -->
                <div class="aspect-[2/3] bg-slate-200 rounded-2xl mb-4 overflow-hidden relative shadow-sm shrink-0 group-hover:shadow-md transition-shadow cursor-pointer"
                    @click="openDetail(book)">
                    <img v-if="book.cover" :src="book.cover"
                        class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy" />

                    <!-- Placeholder Cover -->
                    <div v-else
                        class="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 gap-3 p-4 text-center">
                        <div class="p-3 bg-white/50 backdrop-blur-sm rounded-full shadow-sm">
                            <BookOpenIcon class="w-8 h-8 text-slate-400" />
                        </div>
                        <span class="text-[10px] font-black uppercase tracking-widest text-slate-500/50">No Cover
                            Available</span>
                    </div>

                    <!-- PDF Indicator -->
                    <div v-if="book.fileUrl"
                        class="absolute top-3 left-3 px-2 py-1 bg-rose-600/90 backdrop-blur-md rounded-lg text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg z-10">
                        <DocumentTextIcon class="w-3 h-3" />
                        PDF
                    </div>

                    <!-- Stock Badge -->
                    <div
                        class="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-white text-[10px] font-black uppercase tracking-wider border border-white/10 z-10">
                        Stok: {{ book.stock }}
                    </div>
                </div>

                <!-- Info -->
                <div class="space-y-2 flex-1 flex flex-col">
                    <div class="flex items-center gap-2">
                        <span
                            class="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wide">{{
                                book.category }}</span>
                        <span class="text-[10px] font-bold text-slate-400">{{ book.location }}</span>
                    </div>
                    <h3 class="font-black text-lg text-slate-800 leading-tight line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
                        @click="openDetail(book)">{{ book.title }}</h3>
                    <p class="text-xs font-bold text-slate-500">{{ book.author }}</p>
                    <p class="text-[10px] text-slate-400 font-mono flex-1">{{ book.isbn }}</p>

                    <!-- Actions -->
                    <div class="pt-4 flex items-center gap-2 border-t border-slate-50 mt-auto">
                        <button @click="openDetail(book)"
                            class="flex-1 py-2 rounded-xl bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-600 hover:text-white transition-colors">
                            Detail
                        </button>
                        <button @click="openEditModal(book)"
                            class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                            <PencilIcon class="w-4 h-4" />
                        </button>
                        <button @click="handleDelete(book.id)"
                            class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors">
                            <TrashIcon class="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- VIEW: LIST (TABLE) -->
        <div v-else
            class="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-slate-50/50 border-b border-slate-100">
                        <tr>
                            <th class="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">
                                Buku</th>
                            <th class="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">
                                Kategori</th>
                            <th class="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">
                                Lokasi / Stok</th>
                            <th
                                class="px-6 py-4 text-center text-xs font-black uppercase tracking-wider text-slate-500 w-24">
                                File</th>
                            <th class="px-6 py-4 text-right text-xs font-black uppercase tracking-wider text-slate-500">
                                Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <tr v-for="book in filteredBooks" :key="book.id"
                            class="group hover:bg-slate-50/50 transition-colors">
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-4">
                                    <div class="w-12 h-16 bg-slate-200 rounded-lg overflow-hidden shrink-0 relative cursor-pointer shadow-sm border border-slate-100"
                                        @click="openDetail(book)">
                                        <img v-if="book.cover" :src="book.cover" class="w-full h-full object-cover" />
                                        <div v-else
                                            class="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-300">
                                            <BookOpenIcon class="w-5 h-5" />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 class="font-bold text-slate-800 group-hover:text-blue-600 transition-colors cursor-pointer"
                                            @click="openDetail(book)">{{ book.title }}</h4>
                                        <p class="text-xs text-slate-500 font-medium">{{ book.author }}</p>
                                        <p class="text-[10px] text-slate-400 font-mono mt-0.5">{{ book.isbn }}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <span
                                    class="px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-600 uppercase">{{
                                        book.category }}</span>
                            </td>
                            <td class="px-6 py-4">
                                <div class="space-y-1">
                                    <p class="text-xs font-bold text-slate-700">{{ book.location }}</p>
                                    <p class="text-[10px] font-medium text-slate-500">Stok: {{ book.stock }}</p>
                                </div>
                            </td>
                            <td class="px-6 py-4 text-center">
                                <div v-if="book.fileUrl"
                                    class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-rose-50 text-rose-600"
                                    title="PDF Tersedia">
                                    <DocumentTextIcon class="w-4 h-4" />
                                </div>
                                <span v-else class="text-slate-300">-</span>
                            </td>
                            <td class="px-6 py-4">
                                <div class="flex justify-end items-center gap-2">
                                    <button @click="openDetail(book)"
                                        class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                        title="Lihat Detail">
                                        <EyeIcon class="w-4 h-4" />
                                    </button>
                                    <button @click="openEditModal(book)"
                                        class="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                                        title="Edit">
                                        <PencilIcon class="w-4 h-4" />
                                    </button>
                                    <button @click="handleDelete(book.id)"
                                        class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
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

        <!-- Empty State -->
        <div v-if="filteredBooks.length === 0" class="text-center py-20">
            <div
                class="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                <BookOpenIcon class="w-8 h-8" />
            </div>
            <p class="text-slate-500 font-bold">Tidak ada buku ditemukan</p>
        </div>



        <!-- Add/Edit Modal -->
        <Modal :show="showModal" :title="modalMode === 'create' ? 'Tambah Buku Baru' : 'Edit Data Buku'"
            @close="showModal = false">
            <form @submit.prevent="handleSubmit" class="space-y-4">
                <!-- Inputs: Title, Author -->
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                        <label class="block text-xs font-bold text-slate-500 uppercase">Judul Buku</label>
                        <input v-model="selectedBook.title" required
                            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                    <div class="space-y-1">
                        <label class="block text-xs font-bold text-slate-500 uppercase">Penulis</label>
                        <input v-model="selectedBook.author" required
                            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                </div>

                <!-- Inputs: Category, Location -->
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                        <label class="block text-xs font-bold text-slate-500 uppercase">Kategori</label>
                        <div class="relative">
                            <select v-model="selectedBook.category"
                                class="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                            </select>
                        </div>
                    </div>
                    <div class="space-y-1">
                        <label class="block text-xs font-bold text-slate-500 uppercase">Lokasi Rak</label>
                        <input v-model="selectedBook.location"
                            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            placeholder="Contoh: Rak A-1" />
                    </div>
                </div>

                <!-- Inputs: ISBN, Stock -->
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                        <label class="block text-xs font-bold text-slate-500 uppercase">ISBN</label>
                        <input v-model="selectedBook.isbn"
                            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                    <div class="space-y-1">
                        <label class="block text-xs font-bold text-slate-500 uppercase">Stok</label>
                        <input v-model.number="selectedBook.stock" type="number" min="0"
                            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                </div>

                <!-- Input: Description -->
                <div class="space-y-1">
                    <label class="block text-xs font-bold text-slate-500 uppercase">Deskripsi Singkat</label>
                    <textarea v-model="selectedBook.description" rows="3"
                        class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"></textarea>
                </div>

                <!-- Inputs: Links -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="space-y-1">
                        <label class="block text-xs font-bold text-slate-500 uppercase">URL Cover Image</label>
                        <input v-model="selectedBook.cover" placeholder="https://..."
                            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                    <div class="space-y-1">
                        <label class="block text-xs font-bold text-slate-500 uppercase">URL PDF / E-Book</label>
                        <input v-model="selectedBook.fileUrl" placeholder="https://...pdf"
                            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                </div>

                <div class="pt-4 flex gap-3">
                    <button type="button" @click="showModal = false"
                        class="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-colors">Batal</button>
                    <button type="submit"
                        class="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">Simpan</button>
                </div>
            </form>
        </Modal>
    </div>
</template>
