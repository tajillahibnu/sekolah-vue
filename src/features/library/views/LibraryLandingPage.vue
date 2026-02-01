<script setup>
import { ref, computed } from 'vue';
import {
    MagnifyingGlassIcon,
    BookOpenIcon,
    XMarkIcon,
    DocumentTextIcon,
    StarIcon,
    UserGroupIcon,
    ComputerDesktopIcon,
    ArrowRightIcon,
    SparklesIcon,
    EyeIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    UserIcon,
    AcademicCapIcon,
    ChatBubbleLeftRightIcon
} from '@heroicons/vue/24/outline';
import { useLibraryStore } from '@/features/library/stores/libraryStore';
import Modal from '@/components/common/Modal.vue';
import Badge from '@/components/ui/badge/Badge.vue';
import Button from '@/components/ui/button/Button.vue';

const store = useLibraryStore();
const searchQuery = ref('');
const selectedCategory = ref('Semua');
const showDetailModal = ref(false);
const detailBook = ref(null);

// Guest Book State
const isGuestBookSubmitted = ref(localStorage.getItem('lib_guest_session') === 'true');
const guestForm = ref({
    name: '',
    class: '',
    purpose: ''
});
const isSubmittingGuest = ref(false);

const submitGuestBook = () => {
    if (!guestForm.value.name || !guestForm.value.class || !guestForm.value.purpose) return;

    isSubmittingGuest.value = true;

    // Simulate delay
    setTimeout(() => {
        store.addVisitor({
            name: guestForm.value.name,
            role: 'Siswa', // Default to Siswa for public landing
            class: guestForm.value.class,
            purpose: guestForm.value.purpose
        });

        isGuestBookSubmitted.value = true;
        localStorage.setItem('lib_guest_session', 'true');
        isSubmittingGuest.value = false;
    }, 800);
};

// Pagination State
const currentPage = ref(1);
const itemsPerPage = 10;

const categories = ['Semua', 'Novel', 'Sastra', 'Komputer', 'Sejarah', 'Pengembangan Diri', 'Sains', 'Agama'];

const filteredBooks = computed(() => {
    let result = store.books;

    // Filter by Category
    if (selectedCategory.value !== 'Semua') {
        result = result.filter(b => b.category === selectedCategory.value);
    }

    // Filter by Search
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(b =>
            b.title.toLowerCase().includes(query) ||
            b.author.toLowerCase().includes(query) ||
            b.isbn.includes(query)
        );
    }

    return result;
});

const totalPages = computed(() => Math.ceil(filteredBooks.value.length / itemsPerPage));

const paginatedBooks = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredBooks.value.slice(start, end);
});

// Watch filters to reset pagination
import { watch } from 'vue';
watch([searchQuery, selectedCategory], () => {
    currentPage.value = 1;
});

// Mock Featured Books (Take first 3 for now, realistically would be a backend flag)
const featuredBooks = computed(() => store.books.slice(0, 3));

const stats = [
    { label: 'Koleksi Buku', value: '1,500+', icon: BookOpenIcon, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Akses Digital', value: '24/7', icon: ComputerDesktopIcon, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { label: 'Pengunjung', value: '500+', icon: UserGroupIcon, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Rating', value: '4.9', icon: StarIcon, color: 'text-amber-500', bg: 'bg-amber-50' },
];

const featuredScrollContainer = ref(null);

const scrollFeatured = (direction) => {
    if (featuredScrollContainer.value) {
        const scrollAmount = direction === 'left' ? -400 : 400;
        featuredScrollContainer.value.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
};

const handleImageError = (e) => {
    e.target.src = '/placeholder-book.png';
};

const openDetail = (book) => {
    detailBook.value = book;
    showDetailModal.value = true;
};
</script>

<template>
    <div class="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
        <!-- Guest Book Overlay (Blocking) -->
        <div v-if="!isGuestBookSubmitted" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <!-- Backdrop -->
            <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-xl transition-all duration-700"></div>

            <!-- Modal Card -->
            <div
                class="relative w-full max-w-md bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/50 transition-all duration-500 hover:shadow-blue-900/20">
                <!-- Header Decorative -->
                <div
                    class="h-32 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden flex items-center justify-center">
                    <div class="absolute inset-0 opacity-20"
                        style="background-image: url('/library-pattern.png'); background-size: 200px;"></div>
                    <div class="relative text-center text-white p-6">
                        <div
                            class="w-12 h-12 mx-auto bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-3 shadow-inner border border-white/20">
                            <BookOpenIcon class="w-6 h-6 text-white" />
                        </div>
                        <h2 class="text-2xl font-black tracking-tight">Buku Tamu</h2>
                        <p class="text-blue-100 text-sm font-medium">Silakan isi data kunjungan Anda</p>
                    </div>
                </div>

                <!-- Form -->
                <div class="p-8 space-y-5">
                    <div class="space-y-1.5">
                        <label class="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nama
                            Lengkap</label>
                        <div class="relative group">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <UserIcon
                                    class="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                            </div>
                            <input v-model="guestForm.name" type="text"
                                class="block w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                placeholder="Masukkan nama Anda..." />
                        </div>
                    </div>

                    <div class="space-y-1.5">
                        <label class="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Kelas /
                            Jabatan</label>
                        <div class="relative group">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <AcademicCapIcon
                                    class="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                            </div>
                            <input v-model="guestForm.class" type="text"
                                class="block w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                placeholder="Contoh: XII RPA 1" />
                        </div>
                    </div>

                    <div class="space-y-1.5">
                        <label class="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Tujuan
                            Kunjungan</label>
                        <div class="relative group">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <ChatBubbleLeftRightIcon
                                    class="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                            </div>
                            <select v-model="guestForm.purpose"
                                class="block w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none cursor-pointer">
                                <option value="" disabled selected>Pilih Tujuan</option>
                                <option>Membaca Buku</option>
                                <option>Mengerjakan Tugas</option>
                                <option>Meminjam Buku</option>
                                <option>Mencari Referensi</option>
                                <option>Lainnya</option>
                            </select>
                            <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <ChevronRightIcon class="h-4 w-4 text-slate-400 rotate-90" />
                            </div>
                        </div>
                    </div>

                    <Button @click="submitGuestBook"
                        :disabled="isSubmittingGuest || !guestForm.name || !guestForm.class || !guestForm.purpose"
                        class="w-full h-12 text-base shadow-xl shadow-blue-500/20">
                        <span v-if="!isSubmittingGuest">Masuk Perpustakaan</span>
                        <span v-else class="flex items-center gap-2">
                            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                                viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                </path>
                            </svg>
                            Memproses...
                        </span>
                    </Button>
                </div>
            </div>
        </div>

        <!-- Hero Section -->
        <div class="relative bg-white overflow-hidden border-b border-slate-200">
            <div class="absolute inset-0 bg-blue-50/50"></div>
            <!-- Pattern Background -->
            <div class="absolute inset-0 opacity-40 mix-blend-multiply"
                style="background-image: url('/library-pattern.png'); background-size: 400px;"></div>

            <!-- Decor Balls -->
            <div
                class="absolute -top-24 -right-24 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50 pointer-events-none">
            </div>
            <div
                class="absolute top-1/2 -left-24 w-64 h-64 bg-indigo-100 rounded-full blur-3xl opacity-50 pointer-events-none">
            </div>

            <div class="relative max-w-7xl mx-auto px-6 pt-20 pb-24 lg:pt-32 lg:pb-32 text-center">
                <Badge variant="outline"
                    class="mb-6 bg-white/80 backdrop-blur-sm border-blue-200 text-blue-700 shadow-sm animate-pulse">
                    <SparklesIcon class="w-3.5 h-3.5 mr-1" />
                    Pusat Literasi & Pengetahuan
                </Badge>

                <h1 class="text-5xl lg:text-7xl font-black text-slate-900 tracking-tight mb-6 leading-[1.1]">
                    Jelajahi Dunia <span
                        class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Tanpa
                        Batas</span>
                </h1>

                <p class="text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed mb-10">
                    Akses ribuan koleksi buku fisik dan digital untuk menunjang pembelajaran dan wawasan Anda.
                    Baca di mana saja, kapan saja.
                </p>
            </div>
        </div>

        <!-- Featured Books Section (Carousel) -->
        <div class="bg-white py-16 border-b border-slate-100 overflow-hidden">
            <div class="max-w-7xl mx-auto px-6">
                <div class="flex items-end justify-between mb-8">
                    <div>
                        <h2 class="text-3xl font-black text-slate-900 tracking-tight mb-2">Pilihan Editor</h2>
                        <p class="text-slate-500 font-medium">Rekomendasi bacaan terbaik bulan ini.</p>
                    </div>

                    <!-- Carousel Controls -->
                    <div class="flex gap-3">
                        <button @click="scrollFeatured('left')"
                            class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-white hover:border-blue-200 hover:text-blue-600 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50">
                            <ArrowRightIcon class="w-5 h-5 rotate-180" />
                        </button>
                        <button @click="scrollFeatured('right')"
                            class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-white hover:border-blue-200 hover:text-blue-600 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50">
                            <ArrowRightIcon class="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div ref="featuredScrollContainer"
                    class="flex gap-6 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-10 -mx-6 px-6">
                    <div v-for="book in featuredBooks" :key="book.id"
                        class="min-w-[300px] md:min-w-[350px] snap-center group relative bg-slate-50 rounded-3xl p-6 border border-slate-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-500 cursor-pointer"
                        @click="openDetail(book)">
                        <div class="flex gap-6">
                            <div
                                class="w-28 shrink-0 aspect-[2/3] bg-white rounded-xl shadow-md overflow-hidden relative">
                                <img :src="book.cover || '/placeholder-book.png'" @error="handleImageError"
                                    class="w-full h-full object-cover" />
                            </div>
                            <div class="min-w-0 flex-1 flex flex-col justify-center space-y-2 py-1">
                                <Badge variant="secondary"
                                    class="bg-white w-fit text-slate-600 text-[10px] px-2 py-0.5 border-slate-200 shadow-sm">
                                    {{ book.category }}</Badge>
                                <h3
                                    class="font-bold text-lg text-slate-900 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                                    {{ book.title }}</h3>
                                <p class="text-sm font-medium text-slate-500">{{ book.author }}</p>
                                <div class="pt-2 flex items-center gap-1 text-amber-500">
                                    <StarIcon class="w-3.5 h-3.5 fill-current" />
                                    <span class="text-xs font-bold text-slate-700">4.8</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="max-w-7xl mx-auto px-6 py-20">
            <!-- Filters & Search (Sticky) -->
            <div
                class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 sticky top-4 z-30 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
                <!-- Categories -->
                <div class="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0 font-sans flex-1">
                    <button v-for="cat in categories" :key="cat" @click="selectedCategory = cat"
                        class="px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap border"
                        :class="selectedCategory === cat
                            ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-blue-200 hover:text-blue-600'">
                        {{ cat }}
                    </button>
                </div>

                <!-- Search Input (Moved here) -->
                <div class="relative group w-full md:w-80 shrink-0">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon
                            class="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    </div>
                    <input v-model="searchQuery" type="text"
                        class="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                        placeholder="Cari buku..." />
                </div>
            </div>

            <!-- Book Grid -->
            <div v-if="filteredBooks.length > 0">
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-8 mb-12">
                    <div v-for="book in paginatedBooks" :key="book.id" class="group flex flex-col cursor-pointer"
                        @click="openDetail(book)">

                        <!-- Cover -->
                        <div
                            class="aspect-[2/3] bg-white rounded-2xl mb-4 overflow-hidden relative shadow-sm border border-slate-100 group-hover:shadow-xl group-hover:shadow-blue-900/10 group-hover:-translate-y-2 transition-all duration-500">
                            <img :src="book.cover || '/placeholder-book.png'" @error="handleImageError"
                                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                loading="lazy" />

                            <!-- Tags -->
                            <div
                                class="absolute top-3 left-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div v-if="book.fileUrl"
                                    class="px-2 py-1 bg-white/90 backdrop-blur-md rounded-lg text-rose-600 text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                                    <DocumentTextIcon class="w-3 h-3" /> PDF
                                </div>
                            </div>

                            <!-- View Count -->
                            <div
                                class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div
                                    class="px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-white text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                                    <EyeIcon class="w-3 h-3" />
                                    {{ book.viewCount?.toLocaleString() || 0 }}
                                </div>
                            </div>
                        </div>

                        <!-- Info -->
                        <div class="space-y-1">
                            <h3
                                class="font-bold text-slate-800 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                                {{ book.title }}
                            </h3>
                            <p class="text-xs font-medium text-slate-500">{{ book.author }}</p>
                        </div>
                    </div>
                </div>

                <!-- Pagination Controls -->
                <div v-if="totalPages > 1"
                    class="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 pt-8">
                    <p class="text-sm text-slate-500 font-medium">
                        Menampilkan <span class="font-bold text-slate-900">{{ (currentPage - 1) * itemsPerPage + 1
                        }}</span> - <span class="font-bold text-slate-900">{{ Math.min(currentPage * itemsPerPage,
                                filteredBooks.length) }}</span> dari <span class="font-bold text-slate-900">{{
                                filteredBooks.length }}</span> hasil
                    </p>

                    <div class="flex items-center gap-2">
                        <Button variant="outline" size="icon" :disabled="currentPage === 1" @click="currentPage--"
                            class="rounded-xl w-10 h-10 border-slate-200">
                            <ChevronLeftIcon class="w-5 h-5" />
                        </Button>

                        <div class="flex items-center gap-1">
                            <button v-for="page in totalPages" :key="page" @click="currentPage = page"
                                class="w-10 h-10 rounded-xl text-sm font-bold transition-all"
                                :class="currentPage === page ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'text-slate-600 hover:bg-slate-100'">
                                {{ page }}
                            </button>
                        </div>

                        <Button variant="outline" size="icon" :disabled="currentPage === totalPages"
                            @click="currentPage++" class="rounded-xl w-10 h-10 border-slate-200">
                            <ChevronRightIcon class="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div v-else class="text-center py-24 bg-white rounded-[2rem] border border-dashed border-slate-200">
                <div
                    class="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-400 mb-6 animate-pulse">
                    <MagnifyingGlassIcon class="w-10 h-10" />
                </div>
                <h3 class="text-2xl font-black text-slate-800 mb-2">Buku tidak ditemukan</h3>
                <p class="text-slate-500 max-w-md mx-auto mb-8">
                    Maaf, kami tidak dapat menemukan buku dengan kata kunci "{{ searchQuery }}" di kategori "{{
                        selectedCategory }}".
                </p>
                <Button @click="selectedCategory = 'Semua'; searchQuery = ''" variant="outline"
                    class="border-2 font-bold">
                    Bersihkan Filter
                </Button>
            </div>
        </div>

        <!-- Detail Modal -->
        <Modal :show="showDetailModal" title="Detail Buku" size="2xl" @close="showDetailModal = false">
            <div v-if="detailBook" class="space-y-8">
                <!-- Header Info -->
                <div class="flex flex-col sm:flex-row gap-8">
                    <div
                        class="w-full sm:w-1/3 aspect-[2/3] bg-white rounded-2xl overflow-hidden shadow-xl shadow-slate-200 border border-slate-100 shrink-0 relative rotate-1 hover:rotate-0 transition-transform duration-500">
                        <img :src="detailBook.cover || '/placeholder-book.png'" @error="handleImageError"
                            class="w-full h-full object-cover" />
                    </div>

                    <div class="flex-1 space-y-6">
                        <div>
                            <div class="flex flex-wrap gap-2 mb-3">
                                <Badge variant="secondary"
                                    class="bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">{{
                                        detailBook.category }}</Badge>
                                <Badge :variant="detailBook.stock > 0 ? 'success' : 'destructive'"
                                    :class="detailBook.stock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'">
                                    {{ detailBook.stock > 0 ? 'Tersedia' : 'Stok Habis' }}
                                </Badge>
                            </div>
                            <h2 class="text-3xl font-black text-slate-900 leading-[1.1] mb-2">{{ detailBook.title }}
                            </h2>
                            <p class="text-lg font-medium text-slate-500">{{ detailBook.author }}</p>
                        </div>

                        <div class="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div>
                                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">ISBN</p>
                                <p class="text-sm font-bold text-slate-700 font-mono">{{ detailBook.isbn }}</p>
                            </div>
                            <div>
                                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Lokasi
                                </p>
                                <p class="text-sm font-bold text-slate-700 flex items-center gap-1">
                                    <GlobeAltIcon class="w-3.5 h-3.5 text-blue-500" />
                                    {{ detailBook.location }}
                                </p>
                            </div>
                        </div>

                        <div>
                            <p class="text-sm font-bold text-slate-900 mb-2">Sinopsis</p>
                            <p class="text-sm leading-relaxed text-slate-600">
                                {{ detailBook.description || 'Tidak ada deskripsi tersedia untuk buku ini.' }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- PDF Preview -->
                <div v-if="detailBook.fileUrl" class="border-t border-dashed border-slate-200 pt-8">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-black text-slate-900 flex items-center gap-2">
                            <span class="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                                <DocumentTextIcon class="w-5 h-5" />
                            </span>
                            Baca Digital (E-Book)
                        </h3>
                        <Button size="sm" variant="outline" class="text-xs">
                            Buka Layar Penuh
                        </Button>
                    </div>

                    <div
                        class="w-full h-[600px] bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden shadow-inner">
                        <iframe :src="detailBook.fileUrl" class="w-full h-full"></iframe>
                    </div>
                </div>

                <div v-else class="bg-amber-50 rounded-xl p-4 border border-amber-100 flex items-start gap-3">
                    <StarIcon class="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                    <div>
                        <h4 class="font-bold text-amber-800 text-sm">E-Book Tidak Tersedia</h4>
                        <p class="text-xs text-amber-700/80 mt-1">Buku ini hanya tersedia dalam bentuk fisik. Silakan
                            kunjungi perpustakaan untuk meminjamnya.</p>
                    </div>
                </div>
            </div>
        </Modal>
    </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
    display: none;
}

.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
