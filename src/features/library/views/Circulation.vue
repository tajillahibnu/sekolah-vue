<script setup>
import { ref, computed, watch } from 'vue';
import {
    BookOpenIcon,
    UserIcon,
    CalendarIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    PlusIcon,
    ArrowPathIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    BanknotesIcon,
    ClipboardDocumentCheckIcon
} from '@heroicons/vue/24/outline';
import { useLibraryStore } from '@/features/library/stores/libraryStore';
import Badge from '@/components/ui/badge/Badge.vue';
import Button from '@/components/ui/button/Button.vue';
import Modal from '@/components/common/Modal.vue';

const store = useLibraryStore();

// --- State ---
const searchQuery = ref('');
const statusFilter = ref('active'); // active, overdue, returned, all
const currentPage = ref(1);
const itemsPerPage = 10;
const showBorrowModal = ref(false);
const feedback = ref({ show: false, type: 'success', message: '' });

// Book Selection State
const bookSearchQuery = ref('');
const showBookDropdown = ref(false);

const newLoan = ref({
    studentName: '',
    bookId: '',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
});

// --- Return Modal State ---
const showReturnModal = ref(false);
const returnForm = ref({
    transactionId: null,
    bookTitle: '',
    studentName: '',
    condition: 'good', // good, damaged, lost
    fine: 0,
    notes: ''
});

// --- Computed ---
const todaysReturnCount = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return store.transactions.filter(t => t.status === 'returned' && t.returnDate === today).length;
});

const stats = computed(() => [
    {
        label: 'Sedang Dipinjam',
        value: store.activeBorrows,
        icon: BookOpenIcon,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-100'
    },
    {
        label: 'Terlambat',
        value: store.overdueCount,
        icon: ExclamationCircleIcon,
        color: 'text-rose-600',
        bg: 'bg-rose-50',
        border: 'border-rose-100'
    },
    {
        label: 'Dikembalikan Hari Ini',
        value: todaysReturnCount.value,
        icon: CheckCircleIcon,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-100'
    },
]);

const availableBooks = computed(() => {
    return store.books.filter(b => b.stock > 0).sort((a, b) => a.title.localeCompare(b.title));
});

const bookOptions = computed(() => {
    if (!bookSearchQuery.value) return availableBooks.value;
    const query = bookSearchQuery.value.toLowerCase();
    return availableBooks.value.filter(b =>
        b.title.toLowerCase().includes(query) ||
        b.isbn.toLowerCase().includes(query)
    );
});

const filteredTransactions = computed(() => {
    let result = store.transactions;

    // Filter by Status
    if (statusFilter.value === 'active') {
        result = result.filter(t => t.status === 'borrowed' || t.status === 'overdue');
    } else if (statusFilter.value === 'overdue') {
        result = result.filter(t => t.status === 'overdue');
    } else if (statusFilter.value === 'returned') {
        result = result.filter(t => t.status === 'returned');
    }

    // Filter by Search
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(t =>
            t.studentName.toLowerCase().includes(query) ||
            t.bookTitle.toLowerCase().includes(query)
        );
    }

    // Sort: Overdue first, then by Date (Newest first)
    return result.sort((a, b) => {
        // If viewing active, prioritize overdue
        if (statusFilter.value === 'active') {
            if (a.status === 'overdue' && b.status !== 'overdue') return -1;
            if (a.status !== 'overdue' && b.status === 'overdue') return 1;
        }
        return new Date(b.borrowDate) - new Date(a.borrowDate);
    });
});

const paginatedTransactions = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredTransactions.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(filteredTransactions.value.length / itemsPerPage));

// --- Watchers ---
watch([searchQuery, statusFilter], () => {
    currentPage.value = 1;
});

// --- Actions ---
const selectBook = (book) => {
    newLoan.value.bookId = book.id;
    bookSearchQuery.value = book.title;
    showBookDropdown.value = false;
};

const handleBorrow = () => {
    if (!newLoan.value.studentName || !newLoan.value.bookId || !newLoan.value.dueDate) return;

    const success = store.borrowBook(
        newLoan.value.studentName,
        newLoan.value.bookId,
        newLoan.value.dueDate
    );

    if (success) {
        showFeedback('success', 'Peminjaman berhasil dicatat');
        newLoan.value = {
            studentName: '',
            bookId: '',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };
        bookSearchQuery.value = '';
        showBorrowModal.value = false;
        // Optionally switch filter to 'active' to see it
        statusFilter.value = 'active';
    } else {
        showFeedback('error', 'Gagal meminjam buku. Stok mungkin habis.');
    }
};

const handleReturnClick = (trx) => {
    returnForm.value = {
        transactionId: trx.id,
        bookTitle: trx.bookTitle,
        studentName: trx.studentName,
        condition: 'good',
        fine: 0,
        notes: ''
    };
    showReturnModal.value = true;
};

const submitReturn = () => {
    store.returnBook(
        returnForm.value.transactionId,
        returnForm.value.condition,
        returnForm.value.fine,
        returnForm.value.notes
    );
    showFeedback('success', `Buku berhasil dikembalikan (${returnForm.value.condition === 'good' ? 'Baik' : 'Denda Rp ' + returnForm.value.fine})`);
    showReturnModal.value = false;
};

const showFeedback = (type, message) => {
    feedback.value = { show: true, type, message };
    setTimeout(() => {
        feedback.value.show = false;
    }, 3000);
};

const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

const getStatusBadgeVariant = (status) => {
    switch (status) {
        case 'borrowed': return 'secondary'; // Blue/Default
        case 'overdue': return 'destructive'; // Red
        case 'returned': return 'success'; // Green
        default: return 'outline';
    }
};

const getStatusLabel = (status) => {
    switch (status) {
        case 'borrowed': return 'Dipinjam';
        case 'overdue': return 'Terlambat';
        case 'returned': return 'Dikembalikan';
        default: return status;
    }
};
</script>

<template>
    <div class="space-y-6 pb-12 relative">

        <!-- Feedback Toast -->
        <Transition enter-active-class="transform ease-out duration-300 transition"
            enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
            leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100"
            leave-to-class="opacity-0">
            <div v-if="feedback.show"
                class="fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-bold"
                :class="feedback.type === 'success' ? 'bg-white text-emerald-600 border-emerald-100' : 'bg-white text-rose-600 border-rose-100'">
                <CheckCircleIcon v-if="feedback.type === 'success'" class="w-5 h-5" />
                <ExclamationCircleIcon v-else class="w-5 h-5" />
                {{ feedback.message }}
            </div>
        </Transition>

        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="space-y-1">
                <h1 class="text-3xl font-black text-slate-800 tracking-tight">Sirkulasi & Peminjaman</h1>
                <p class="text-slate-500 font-medium">Kelola transaksi peminjaman dan pengembalian buku.</p>
            </div>
            <div class="flex gap-3">
                <Button @click="showBorrowModal = true"
                    class="shadow-lg shadow-blue-500/20 bg-blue-600 hover:bg-blue-700">
                    <PlusIcon class="w-5 h-5 mr-2" />
                    Catat Peminjaman
                </Button>
            </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div v-for="(stat, idx) in stats" :key="idx"
                class="bg-white p-5 rounded-2xl border shadow-sm flex items-center gap-4 transition-all hover:shadow-md"
                :class="stat.border">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    :class="[stat.bg, stat.color]">
                    <component :is="stat.icon" class="w-6 h-6" />
                </div>
                <div>
                    <h3 class="text-2xl font-black text-slate-800">{{ stat.value }}</h3>
                    <p class="text-xs font-bold text-slate-500 uppercase">{{ stat.label }}</p>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
            <!-- Toolbar -->
            <div
                class="p-5 border-b border-slate-100 flex flex-col lg:flex-row gap-4 justify-between items-center bg-slate-50/50">
                <!-- Search -->
                <div class="relative group w-full lg:w-96">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon
                            class="w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    </div>
                    <input v-model="searchQuery" type="text" placeholder="Cari nama siswa atau judul buku..."
                        class="block w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm" />
                </div>

                <!-- Filters -->
                <div class="flex items-center gap-3 w-full lg:w-auto">
                    <div class="relative">
                        <select v-model="statusFilter"
                            class="appearance-none pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 cursor-pointer shadow-sm">
                            <option value="active">Status: Aktif</option>
                            <option value="overdue">Status: Terlambat</option>
                            <option value="returned">Status: Dikembalikan</option>
                            <option value="all">Semua Data</option>
                        </select>
                        <FunnelIcon
                            class="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>
            </div>

            <!-- Table -->
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-slate-50 text-xs font-black uppercase tracking-wider text-slate-400">
                            <th class="py-4 px-6 border-b border-slate-100">Peminjam</th>
                            <th class="py-4 px-6 border-b border-slate-100">Buku</th>
                            <th class="py-4 px-6 border-b border-slate-100">Waktu</th>
                            <th class="py-4 px-6 border-b border-slate-100">Status</th>
                            <th class="py-4 px-6 border-b border-slate-100 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="text-sm divide-y divide-slate-50">
                        <tr v-for="trx in paginatedTransactions" :key="trx.id"
                            class="hover:bg-slate-50/80 transition-colors group">
                            <td class="py-4 px-6">
                                <div class="flex items-center gap-3">
                                    <div
                                        class="w-9 h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs">
                                        {{ trx.studentName.charAt(0) }}
                                    </div>
                                    <span class="font-bold text-slate-700">{{ trx.studentName }}</span>
                                </div>
                            </td>
                            <td class="py-4 px-6 font-bold text-slate-800">
                                {{ trx.bookTitle }}
                            </td>
                            <td class="py-4 px-6">
                                <div class="flex flex-col text-xs">
                                    <span class="text-slate-500">Pinjam: <span class="font-bold text-slate-700">{{
                                        formatDate(trx.borrowDate) }}</span></span>
                                    <span
                                        :class="trx.status === 'overdue' ? 'text-rose-600 font-bold' : 'text-slate-500'">
                                        Tempo: {{ formatDate(trx.dueDate) }}
                                    </span>
                                </div>
                            </td>
                            <td class="py-4 px-6">
                                <Badge :variant="getStatusBadgeVariant(trx.status)">
                                    {{ getStatusLabel(trx.status) }}
                                </Badge>
                            </td>
                            <td class="py-4 px-6 text-right">
                                <div v-if="trx.status === 'returned' && trx.fine > 0"
                                    class="mb-1 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md inline-block">
                                    Denda: Rp {{ trx.fine.toLocaleString('id-ID') }}
                                </div>
                                <Button v-if="trx.status !== 'returned'" @click="handleReturnClick(trx)" size="sm"
                                    variant="outline"
                                    class="text-slate-600 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50">
                                    <ArrowPathIcon class="w-4 h-4 mr-2" />
                                    Kembalikan
                                </Button>
                                <span v-else
                                    class="text-xs font-bold text-slate-400 flex items-center justify-end gap-1">
                                    <CheckCircleIcon class="w-4 h-4" /> Selesai
                                </span>
                            </td>
                        </tr>
                        <tr v-if="paginatedTransactions.length === 0">
                            <td colspan="5" class="py-12 text-center">
                                <div class="flex flex-col items-center justify-center">
                                    <div
                                        class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                        <MagnifyingGlassIcon class="w-8 h-8 text-slate-300" />
                                    </div>
                                    <h3 class="text-lg font-bold text-slate-700">Tidak ada transaksi ditemukan</h3>
                                    <p class="text-slate-400 text-sm max-w-xs mx-auto mt-1">Coba sesuaikan kata kunci
                                        pencarian atau filter status Anda.</p>
                                    <button @click="statusFilter = 'active'; searchQuery = ''"
                                        class="mt-4 text-sm font-bold text-blue-600 hover:underline">
                                        Reset Filter
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1"
                class="px-6 py-4 border-t border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span class="text-sm text-slate-500 font-medium">
                    Menampilkan <span class="font-bold text-slate-800">{{ (currentPage - 1) * itemsPerPage + 1 }}</span>
                    - <span class="font-bold text-slate-800">{{ Math.min(currentPage * itemsPerPage,
                        filteredTransactions.length) }}</span> dari <span class="font-bold text-slate-800">{{
                            filteredTransactions.length }}</span> data
                </span>
                <div class="flex gap-2">
                    <button @click="currentPage--" :disabled="currentPage === 1"
                        class="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-white hover:text-blue-600 hover:border-blue-200 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                        <ChevronLeftIcon class="w-5 h-5" />
                    </button>
                    <div class="flex items-center gap-1">
                        <button v-for="page in Math.min(totalPages, 5)" :key="page" @click="currentPage = page"
                            class="w-9 h-9 rounded-xl text-xs font-bold transition-all"
                            :class="currentPage === page ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-white hover:shadow-sm'">
                            {{ page }}
                        </button>
                    </div>
                    <button @click="currentPage++" :disabled="currentPage === totalPages"
                        class="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-white hover:text-blue-600 hover:border-blue-200 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                        <ChevronRightIcon class="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>

        <!-- Return Modal -->
        <Modal :show="showReturnModal" title="Pengembalian Buku" @close="showReturnModal = false">
            <form @submit.prevent="submitReturn" class="space-y-4">
                <div class="bg-slate-50 p-3 rounded-xl border border-slate-200 mb-4">
                    <div class="text-xs text-slate-500 font-bold uppercase">Detail Transaksi</div>
                    <div class="font-bold text-slate-800">{{ returnForm.bookTitle }}</div>
                    <div class="text-sm text-slate-600">Peminjam: {{ returnForm.studentName }}</div>
                </div>

                <div class="space-y-1">
                    <label class="text-xs font-bold text-slate-500 uppercase ml-1">Kondisi Buku</label>
                    <div class="relative">
                        <select v-model="returnForm.condition"
                            class="w-full appearance-none pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                            <option value="good">Baik / Normal</option>
                            <option value="damaged">Rusak (Denda)</option>
                            <option value="lost">Hilang (Denda & Stok Tetap)</option>
                        </select>
                        <ClipboardDocumentCheckIcon
                            class="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>

                <div v-if="returnForm.condition !== 'good'" class="space-y-1">
                    <label class="text-xs font-bold text-slate-500 uppercase ml-1">Nominal Denda (Rp)</label>
                    <div class="relative">
                        <input v-model.number="returnForm.fine" type="number" min="0" placeholder="0"
                            class="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-rose-600" />
                        <BanknotesIcon
                            class="w-5 h-5 text-rose-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    <p class="text-xs text-rose-500 font-bold ml-1">* Wajib diisi untuk kondisi Rusak/Hilang</p>
                </div>

                <div class="space-y-1">
                    <label class="text-xs font-bold text-slate-500 uppercase ml-1">Catatan (Opsional)</label>
                    <textarea v-model="returnForm.notes" rows="2" placeholder="Keterangan kerusakan atau lainnya..."
                        class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"></textarea>
                </div>

                <div class="pt-4">
                    <button type="submit"
                        class="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-95">
                        Konfirmasi Pengembalian
                    </button>
                </div>
            </form>
        </Modal>

        <!-- Borrow Modal -->
        <Modal :show="showBorrowModal" title="Catat Peminjaman" @close="showBorrowModal = false">
            <form @submit.prevent="handleBorrow" class="space-y-4">
                <div class="space-y-1">
                    <label class="text-xs font-bold text-slate-500 uppercase ml-1">Nama Siswa</label>
                    <div class="relative">
                        <input v-model="newLoan.studentName" required placeholder="Masukkan nama peminjam..."
                            class="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                        <UserIcon class="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                </div>

                <div class="space-y-1 relative">
                    <label class="text-xs font-bold text-slate-500 uppercase ml-1">Pilih Buku</label>
                    <div class="relative">
                        <input v-model="bookSearchQuery" @focus="showBookDropdown = true" type="text"
                            placeholder="Cari judul buku atau ISBN..."
                            class="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-text" />
                        <BookOpenIcon
                            class="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />

                        <!-- Dropdown Results -->
                        <div v-if="showBookDropdown"
                            class="absolute z-10 mt-2 w-full bg-white border border-slate-100 rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y divide-slate-50">
                            <div v-if="bookOptions.length === 0"
                                class="p-4 text-center text-xs font-bold text-slate-400">
                                Buku tidak ditemukan
                            </div>
                            <button v-for="book in bookOptions" :key="book.id" type="button" @click="selectBook(book)"
                                class="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex flex-col gap-0.5">
                                <span class="text-sm font-bold text-slate-700"
                                    :class="{ 'text-blue-600': newLoan.bookId === book.id }">
                                    {{ book.title }}
                                </span>
                                <div class="flex justify-between items-center text-xs">
                                    <span class="text-slate-400 font-medium font-mono tracking-wide">ISBN: {{ book.isbn
                                    }}</span>
                                    <Badge size="sm" :variant="book.stock > 0 ? 'outline' : 'destructive'"
                                        class="text-[10px] px-1.5 h-5">
                                        Stok: {{ book.stock }}
                                    </Badge>
                                </div>
                            </button>
                        </div>
                    </div>
                    <!-- Hidden overlay to close dropdown on outside click -->
                    <div v-if="showBookDropdown" @click="showBookDropdown = false"
                        class="fixed inset-0 z-0 cursor-default"></div>
                </div>

                <div class="space-y-1">
                    <label class="text-xs font-bold text-slate-500 uppercase ml-1">Tanggal Kembali</label>
                    <div class="relative">
                        <input v-model="newLoan.dueDate" required type="date"
                            :min="new Date().toISOString().split('T')[0]"
                            class="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                        <CalendarIcon
                            class="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>

                <div class="pt-4">
                    <button type="submit"
                        class="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-95">
                        Konfirmasi Peminjaman
                    </button>
                </div>
            </form>
        </Modal>
    </div>
</template>
