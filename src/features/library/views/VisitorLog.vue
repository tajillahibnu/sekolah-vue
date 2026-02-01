<script setup>
import { ref, computed, watch } from 'vue';
import {
    UserIcon,
    PlusIcon,
    ClockIcon,
    CalendarIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    EyeIcon,
    BookOpenIcon,
    XMarkIcon
} from '@heroicons/vue/24/outline';
import { useLibraryStore } from '@/features/library/stores/libraryStore';
import Badge from '@/components/ui/badge/Badge.vue';
import Button from '@/components/ui/button/Button.vue';
import Modal from '@/components/common/Modal.vue';

const store = useLibraryStore();

// --- State ---
const showAddForm = ref(false);
const showDetailModal = ref(false);
const selectedVisitor = ref(null);
const searchQuery = ref('');

const today = new Date();
const oneMonthAgo = new Date();
oneMonthAgo.setMonth(today.getMonth() - 1);

const dateFilter = ref({
    start: oneMonthAgo.toISOString().split('T')[0],
    end: today.toISOString().split('T')[0]
});

const currentPage = ref(1);
const itemsPerPage = 10;

const newVisitor = ref({
    name: '',
    class: '',
    purpose: 'Membaca'
});

const purposes = ['Membaca', 'Pinjam Buku', 'Kembalikan Buku', 'Kerja Kelompok', 'Internet', 'Lainnya'];

// --- Computed ---
const filteredVisitors = computed(() => {
    let result = store.visitors;

    // Search
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(v =>
            v.name.toLowerCase().includes(query) ||
            (v.class && v.class.toLowerCase().includes(query)) ||
            (v.purpose && v.purpose.toLowerCase().includes(query))
        );
    }

    // Date Filter
    if (dateFilter.value.start && dateFilter.value.end) {
        const start = new Date(dateFilter.value.start);
        const end = new Date(dateFilter.value.end);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        result = result.filter(v => {
            const vDate = new Date(v.date);
            vDate.setHours(12, 0, 0, 0);
            return vDate >= start && vDate <= end;
        });
    }

    return result.sort((a, b) => new Date(b.date) - new Date(a.date));
});

const paginatedVisitors = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredVisitors.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(filteredVisitors.value.length / itemsPerPage));

// Visitor Stats for Detail Modal
const visitorStats = computed(() => {
    if (!selectedVisitor.value) return { totalVisits: 0, distinctDays: 0, viewedBooks: [] };

    const name = selectedVisitor.value.name;
    const history = store.visitors.filter(v => v.name === name);

    // Mocking "Books Viewed" based on random assignment for demo purposes because we don't store it yet
    // In a real app, this would come from a `reading_history` table
    const viewedBooks = store.books
        .slice(0, Math.floor(Math.random() * 4) + 1) // Random 1-4 books
        .map(b => ({
            ...b,
            date: history[Math.floor(Math.random() * history.length)].date
        }));

    return {
        totalVisits: history.length,
        distinctDays: new Set(history.map(v => v.date)).size,
        history,
        viewedBooks
    };
});

// --- Actions ---
const handleAddVisitor = () => {
    if (newVisitor.value.name) {
        store.addVisitor({
            ...newVisitor.value,
            role: 'Siswa' // Defaulting to Siswa for manual entry
        });
        newVisitor.value = { name: '', class: '', purpose: 'Membaca' };
        showAddForm.value = false;
    }
};

const viewDetail = (visitor) => {
    selectedVisitor.value = visitor;
    showDetailModal.value = true;
};

watch([searchQuery, dateFilter], () => {
    currentPage.value = 1;
}, { deep: true });
</script>

<template>
    <div class="space-y-6 pb-12">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="space-y-1">
                <h1 class="text-3xl font-black text-slate-800 tracking-tight">Buku Tamu</h1>
                <p class="text-slate-500 font-medium">Kelola dan pantau riwayat kunjungan perpustakaan.</p>
            </div>
            <div class="flex gap-3">
                <Button @click="showAddForm = !showAddForm"
                    class="shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700">
                    <PlusIcon class="w-5 h-5 mr-2" />
                    Catat Pengunjung
                </Button>
            </div>
        </div>

        <!-- Add Visitor Form (Collapsible) -->
        <div v-if="showAddForm"
            class="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm animate-in slide-in-from-top-2">
            <div class="flex items-center justify-between mb-4">
                <h3 class="font-black text-emerald-800 text-lg">Form Pengunjung Baru</h3>
                <button @click="showAddForm = false" class="text-slate-400 hover:text-rose-500 transition-colors">
                    <XMarkIcon class="w-6 h-6" />
                </button>
            </div>
            <form @submit.prevent="handleAddVisitor" class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="space-y-1">
                    <label class="text-xs font-bold text-slate-500 uppercase ml-1">Nama Lengkap</label>
                    <input v-model="newVisitor.name" required placeholder="Nama Siswa/Guru..."
                        class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                </div>
                <div class="space-y-1">
                    <label class="text-xs font-bold text-slate-500 uppercase ml-1">Kelas / Jabatan</label>
                    <input v-model="newVisitor.class" placeholder="Contoh: XII RPA 1"
                        class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                </div>
                <div class="space-y-1">
                    <label class="text-xs font-bold text-slate-500 uppercase ml-1">Keperluan</label>
                    <select v-model="newVisitor.purpose"
                        class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer">
                        <option v-for="p in purposes" :key="p" :value="p">{{ p }}</option>
                    </select>
                </div>
                <div class="flex items-end">
                    <button type="submit"
                        class="w-full h-[42px] bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-500/10">
                        Simpan Data
                    </button>
                </div>
            </form>
        </div>

        <!-- Main Content Card -->
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
                    <input v-model="searchQuery" type="text" placeholder="Cari pengunjung, kelas, atau keperluan..."
                        class="block w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm" />
                </div>

                <!-- Filters -->
                <div
                    class="flex items-center gap-2 w-full lg:w-auto bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
                    <div
                        class="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100 relative group flex-1 lg:flex-none">
                        <CalendarIcon class="w-4 h-4 text-slate-400 group-focus-within:text-blue-600" />
                        <span class="text-[10px] font-bold text-slate-400 uppercase mr-1">Dari</span>
                        <input v-model="dateFilter.start" type="date"
                            class="bg-transparent border-none p-0 text-xs font-bold text-slate-700 focus:ring-0 cursor-pointer w-full lg:w-auto" />
                    </div>
                    <span class="text-slate-300">|</span>
                    <div
                        class="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100 relative group flex-1 lg:flex-none">
                        <CalendarIcon class="w-4 h-4 text-slate-400 group-focus-within:text-blue-600" />
                        <span class="text-[10px] font-bold text-slate-400 uppercase mr-1">Sampai</span>
                        <input v-model="dateFilter.end" type="date"
                            class="bg-transparent border-none p-0 text-xs font-bold text-slate-700 focus:ring-0 cursor-pointer w-full lg:w-auto" />
                    </div>
                </div>
            </div>

            <!-- Table -->
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-slate-50 text-xs font-black uppercase tracking-wider text-slate-400">
                            <th class="py-4 px-6 border-b border-slate-100">Nama Pengunjung</th>
                            <th class="py-4 px-6 border-b border-slate-100">Status</th>
                            <th class="py-4 px-6 border-b border-slate-100">Waktu Berkunjung</th>
                            <th class="py-4 px-6 border-b border-slate-100">Keperluan</th>
                            <th class="py-4 px-6 border-b border-slate-100 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="text-sm divide-y divide-slate-50">
                        <tr v-for="visitor in paginatedVisitors" :key="visitor.id"
                            class="hover:bg-slate-50/80 transition-colors group">
                            <td class="py-4 px-6">
                                <div class="flex items-center gap-3">
                                    <div
                                        class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 flex items-center justify-center font-bold text-sm border border-blue-100 shadow-sm">
                                        {{ visitor.name.charAt(0) }}
                                    </div>
                                    <div>
                                        <p class="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                                            {{ visitor.name }}</p>
                                        <p class="text-xs text-slate-500 font-medium">{{ visitor.role }}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="py-4 px-6">
                                <Badge variant="outline" class="font-bold">{{ visitor.class || '-' }}</Badge>
                            </td>
                            <td class="py-4 px-6">
                                <div class="flex flex-col">
                                    <span class="font-bold text-slate-700">
                                        {{ new Date(visitor.date).toLocaleDateString('id-ID', {
                                            day: 'numeric', month:
                                        'short', year: 'numeric' }) }}
                                    </span>
                                    <div class="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                                        <ClockIcon class="w-3.5 h-3.5" />
                                        <span>{{ visitor.timeIn }}</span>
                                        <span v-if="visitor.timeOut">- {{ visitor.timeOut }}</span>
                                        <Badge v-else variant="secondary"
                                            class="bg-emerald-50 text-emerald-600 text-[10px] px-1.5 py-0 h-5">Aktif
                                        </Badge>
                                    </div>
                                </div>
                            </td>
                            <td class="py-4 px-6">
                                <Badge variant="secondary" class="bg-blue-50 text-blue-700">{{ visitor.purpose }}
                                </Badge>
                            </td>
                            <td class="py-4 px-6 text-right">
                                <Button @click="viewDetail(visitor)" size="sm" variant="ghost"
                                    class="text-slate-500 hover:text-blue-600 hover:bg-blue-50">
                                    <EyeIcon class="w-4 h-4 mr-2" />
                                    Detail
                                </Button>
                            </td>
                        </tr>
                        <tr v-if="paginatedVisitors.length === 0">
                            <td colspan="5" class="py-12 text-center">
                                <div class="flex flex-col items-center justify-center">
                                    <div
                                        class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                        <MagnifyingGlassIcon class="w-8 h-8 text-slate-300" />
                                    </div>
                                    <h3 class="text-lg font-bold text-slate-700">Tidak ada data ditemukan</h3>
                                    <p class="text-slate-400 text-sm max-w-xs mx-auto mt-1">Coba sesuaikan kata kunci
                                        pencarian atau filter tanggal Anda.</p>
                                    <Button @click="searchQuery = ''; dateFilter.start = ''; dateFilter.end = ''"
                                        variant="link" class="mt-2 text-blue-600">
                                        Reset Filter
                                    </Button>
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
                        filteredVisitors.length) }}</span> dari <span class="font-bold text-slate-800">{{
                        filteredVisitors.length }}</span> data
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

        <!-- Detail Modal -->
        <Modal :show="showDetailModal" title="Detail Pengunjung" size="lg" @close="showDetailModal = false">
            <div v-if="selectedVisitor" class="space-y-8">
                <!-- User Profile Summary -->
                <div class="flex items-center gap-5 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div
                        class="w-20 h-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-3xl font-black shadow-inner">
                        {{ selectedVisitor.name.charAt(0) }}
                    </div>
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <h2 class="text-2xl font-black text-slate-800">{{ selectedVisitor.name }}</h2>
                            <Badge variant="outline" class="bg-white">{{ selectedVisitor.class }}</Badge>
                        </div>
                        <p class="text-slate-500 font-medium flex items-center gap-2">
                            <UserIcon class="w-4 h-4" /> {{ selectedVisitor.role }}
                        </p>
                    </div>
                </div>

                <!-- Stats Grid -->
                <div class="grid grid-cols-2 gap-4">
                    <div
                        class="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <p class="text-xs font-bold text-slate-400 uppercase mb-1">Total Kunjungan</p>
                        <h3 class="text-3xl font-black text-slate-800">{{ visitorStats.totalVisits }} <span
                                class="text-sm text-slate-400 font-medium">kali</span></h3>
                    </div>
                    <div
                        class="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <p class="text-xs font-bold text-slate-400 uppercase mb-1">Hari Berbeda</p>
                        <h3 class="text-3xl font-black text-slate-800">{{ visitorStats.distinctDays }} <span
                                class="text-sm text-slate-400 font-medium">hari</span></h3>
                    </div>
                </div>

                <!-- Activity / Books Viewed Analysis (Simulated) -->
                <div>
                    <h3 class="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                        <BookOpenIcon class="w-5 h-5 text-blue-500" />
                        Buku yang Dilihat / Dibaca
                    </h3>
                    <div class="space-y-3">
                        <div v-for="(book, idx) in visitorStats.viewedBooks" :key="idx"
                            class="flex gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                            <div class="w-12 h-16 bg-slate-200 rounded-lg overflow-hidden shrink-0 shadow-sm relative">
                                <img v-if="book.cover" :src="book.cover" class="w-full h-full object-cover" />
                                <div v-else
                                    class="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                                    <BookOpenIcon class="w-5 h-5" />
                                </div>
                            </div>
                            <div class="flex-1">
                                <p class="text-xs text-slate-400 font-bold mb-0.5">{{ book.category }}</p>
                                <h4 class="font-bold text-slate-800 leading-tight group-hover:text-blue-600">{{
                                    book.title }}</h4>
                                <p class="text-xs text-slate-500 mt-1">{{ book.author }}</p>
                            </div>
                            <div class="text-right text-xs font-bold text-slate-400 pt-1">
                                {{ new Date(book.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
                                }}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Recent Visits Log (Last 3) -->
                <div>
                    <h3 class="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                        <ClockIcon class="w-5 h-5 text-emerald-500" />
                        Aktivitas Terakhir
                    </h3>
                    <div class="relative pl-4 border-l-2 border-slate-100 space-y-6">
                        <div v-for="(visit, idx) in visitorStats.history.slice(0, 3)" :key="visit.id" class="relative">
                            <div class="absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm"
                                :class="idx === 0 ? 'bg-emerald-500' : 'bg-slate-300'"></div>
                            <div>
                                <p class="text-sm font-bold text-slate-800">
                                    {{ visit.purpose }}
                                </p>
                                <p class="text-xs text-slate-500 mt-1">
                                    {{ new Date(visit.date).toLocaleDateString('id-ID', {
                                        day: 'numeric', month: 'long',
                                    year: 'numeric' }) }} •
                                    {{ visit.timeIn }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    </div>
</template>
