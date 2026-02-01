<script setup>
import { computed } from 'vue';
import {
    BookOpenIcon,
    UserGroupIcon,
    ArrowPathIcon,
    ExclamationCircleIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    ClockIcon,
    CheckCircleIcon,
    ArrowRightIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    CalendarIcon,
    MagnifyingGlassIcon
} from '@heroicons/vue/24/outline';
import { useLibraryStore } from '@/features/library/stores/libraryStore';
import Badge from '@/components/ui/badge/Badge.vue';
import { ref, watch } from 'vue';

const store = useLibraryStore();

// --- Visitor Log Logic ---
const today = new Date();
const oneMonthAgo = new Date();
oneMonthAgo.setMonth(today.getMonth() - 1);

const visitorFilters = ref({
    startDate: oneMonthAgo.toISOString().split('T')[0],
    endDate: today.toISOString().split('T')[0]
});
const visitorSearch = ref('');

const currentPage = ref(1);
const itemsPerPage = 5; // Display 5 per page in dashboard to save space

const filteredVisitors = computed(() => {
    let result = store.visitors;

    // Filter by Search
    if (visitorSearch.value) {
        const query = visitorSearch.value.toLowerCase();
        result = result.filter(v =>
            v.name.toLowerCase().includes(query) ||
            (v.class && v.class.toLowerCase().includes(query)) ||
            (v.purpose && v.purpose.toLowerCase().includes(query))
        );
    }

    // Filter by Date
    result = result.filter(v => {
        const vDate = new Date(v.date);
        const start = new Date(visitorFilters.value.startDate);
        const end = new Date(visitorFilters.value.endDate);

        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        vDate.setHours(12, 0, 0, 0);

        return vDate >= start && vDate <= end;
    });

    return result;
});

const totalPages = computed(() => Math.ceil(filteredVisitors.value.length / itemsPerPage));

const paginatedVisitors = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredVisitors.value.slice(start, end);
});

watch([visitorFilters, visitorSearch], () => {
    currentPage.value = 1;
}, { deep: true });

const stats = computed(() => [
    {
        title: 'Total Koleksi',
        value: store.totalBooks,
        icon: BookOpenIcon,
        trend: '+12%',
        trendUp: true,
        color: 'text-blue-600',
        bg: 'bg-blue-50'
    },
    {
        title: 'Sedang Dipinjam',
        value: store.activeBorrows,
        icon: ArrowPathIcon,
        trend: '+5%',
        trendUp: true,
        color: 'text-amber-600',
        bg: 'bg-amber-50'
    },
    {
        title: 'Pengunjung Hari Ini',
        value: store.todayVisitors,
        icon: UserGroupIcon,
        trend: '-2%',
        trendUp: false,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50'
    },
    {
        title: 'Jatuh Tempo',
        value: store.overdueCount,
        icon: ExclamationCircleIcon,
        trend: 'Perlu Penanganan',
        trendUp: false,
        color: 'text-rose-600',
        bg: 'bg-rose-50'
    }
]);
</script>

<template>
    <div class="space-y-8 pb-12">
        <!-- Header -->
        <div class="space-y-1">
            <h1 class="text-3xl font-black text-slate-800 tracking-tight">Dashboard Perpustakaan</h1>
            <p class="text-slate-500 font-medium">Ringkasan aktivitas dan statistik perpustakaan.</p>
        </div>

        <!-- Quick Actions / Shortcuts -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <router-link to="/library"
                class="group relative block overflow-hidden rounded-2xl bg-white border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all hover:border-blue-100">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <div class="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                            <BookOpenIcon class="w-6 h-6" />
                        </div>
                        <div>
                            <h3 class="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                                Perpustakaan Digital</h3>
                            <p class="text-sm text-slate-500">Akses halaman publik untuk pengunjung.</p>
                        </div>
                    </div>
                    <ArrowRightIcon
                        class="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
            </router-link>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div v-for="(stat, idx) in stats" :key="idx"
                class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                <div class="flex items-start justify-between mb-4">
                    <div class="p-3 rounded-2xl transition-colors" :class="stat.bg">
                        <component :is="stat.icon" class="w-6 h-6" :class="stat.color" />
                    </div>
                    <div class="flex items-center gap-1 text-xs font-bold"
                        :class="stat.trendUp ? 'text-emerald-600' : 'text-rose-600'">
                        <ArrowUpIcon v-if="stat.trendUp" class="w-3 h-3" />
                        <ArrowDownIcon v-else class="w-3 h-3" />
                        {{ stat.trend }}
                    </div>
                </div>
                <div>
                    <h3 class="text-3xl font-black text-slate-800 tracking-tight">{{ stat.value }}</h3>
                    <p class="text-sm font-bold text-slate-400 mt-1">{{ stat.title }}</p>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Left Column: Recent Activity -->
            <div class="lg:col-span-2 space-y-6">
                <div class="flex items-center justify-between">
                    <h2 class="text-xl font-black text-slate-800">Aktivitas Terkini</h2>
                    <button class="text-sm font-bold text-blue-600 hover:text-blue-700">Lihat Semua</button>
                </div>

                <div class="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                    <div v-for="(activity, idx) in store.recentActivities" :key="idx"
                        class="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                        <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                            :class="activity.type === 'borrow' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'">
                            <ArrowPathIcon v-if="activity.type === 'borrow'" class="w-6 h-6" />
                            <CheckCircleIcon v-else class="w-6 h-6" />
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-bold text-slate-800 truncate">
                                {{ activity.studentName }}
                                <span class="font-normal text-slate-500">{{ activity.type === 'borrow' ? 'meminjam'
                                    :
                                    'mengembalikan' }}</span>
                                {{ activity.bookTitle }}
                            </p>
                            <p class="text-xs font-medium text-slate-400 mt-0.5 flex items-center gap-1">
                                <ClockIcon class="w-3 h-3" />
                                {{ new Date(activity.date).toLocaleDateString('id-ID', {
                                    day: 'numeric', month: 'long',
                                    year: 'numeric'
                                }) }}
                            </p>
                        </div>
                        <div class="text-right">
                            <span
                                class="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider"
                                :class="activity.status === 'overdue' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'">
                                {{ activity.status }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Column: Popular Books -->
            <div class="space-y-6">
                <h2 class="text-xl font-black text-slate-800">Buku Populer</h2>
                <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                    <div v-for="(book, idx) in store.popularBooks" :key="book.id" class="flex gap-4 group">
                        <div class="w-16 h-24 bg-slate-200 rounded-lg overflow-hidden shrink-0 shadow-sm relative">
                            <img v-if="book.cover" :src="book.cover" class="w-full h-full object-cover" />
                            <div v-else
                                class="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                                <BookOpenIcon class="w-6 h-6" />
                            </div>
                            <div
                                class="absolute top-1 left-1 w-6 h-6 bg-yellow-400 text-white rounded-full flex items-center justify-center text-xs font-black shadow-sm">
                                #{{ idx + 1 }}
                            </div>
                        </div>
                        <div class="flex-1 min-w-0 py-1">
                            <h4
                                class="font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                                {{ book.title }}</h4>
                            <p class="text-xs font-medium text-slate-500 mt-1">{{ book.author }}</p>
                            <div class="mt-3 flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                <span class="bg-slate-100 px-2 py-0.5 rounded-md">{{ book.category }}</span>
                                <span>{{ book.borrowCount }}x Dipinjam</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Visitor Log Section -->
        <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 class="text-xl font-black text-slate-800">Daftar Buku Tamu</h2>
                    <p class="text-sm text-slate-500 font-medium">Riwayat kunjungan perpustakaan.</p>
                </div>

                <div class="flex flex-col sm:flex-row gap-3">
                    <!-- Search Filter -->
                    <div class="relative group">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon
                                class="h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                        </div>
                        <input v-model="visitorSearch" type="text"
                            class="block w-full sm:w-64 pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                            placeholder="Cari pengunjung..." />
                    </div>

                    <!-- Date Filter -->
                    <div class="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                        <div
                            class="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-sm relative group">
                            <CalendarIcon class="w-4 h-4 text-slate-400 group-focus-within:text-blue-600" />
                            <input v-model="visitorFilters.startDate" type="date"
                                class="bg-transparent border-none p-0 text-xs font-bold text-slate-700 focus:ring-0 cursor-pointer" />
                        </div>
                        <span class="text-slate-400 text-xs font-bold">-</span>
                        <div
                            class="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-sm relative group">
                            <CalendarIcon class="w-4 h-4 text-slate-400 group-focus-within:text-blue-600" />
                            <input v-model="visitorFilters.endDate" type="date"
                                class="bg-transparent border-none p-0 text-xs font-bold text-slate-700 focus:ring-0 cursor-pointer" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Table -->
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr
                            class="border-b border-slate-100 text-xs font-black uppercase tracking-wider text-slate-400">
                            <th class="py-3 px-4">Nama Pengunjung</th>
                            <th class="py-3 px-4">Kelas / Jabatan</th>
                            <th class="py-3 px-4">Tanggal</th>
                            <th class="py-3 px-4">Waktu</th>
                            <th class="py-3 px-4">Keperluan</th>
                        </tr>
                    </thead>
                    <tbody class="text-sm">
                        <tr v-for="visitor in paginatedVisitors" :key="visitor.id"
                            class="border-b border-slate-50 hover:bg-slate-50 transition-colors last:border-0">
                            <td class="py-3 px-4 font-bold text-slate-700">
                                <div class="flex items-center gap-3">
                                    <div
                                        class="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                                        {{ visitor.name.charAt(0) }}
                                    </div>
                                    {{ visitor.name }}
                                </div>
                            </td>
                            <td class="py-3 px-4 font-medium text-slate-500">
                                <Badge variant="outline" class="text-xs">{{ visitor.class || visitor.role }}</Badge>
                            </td>
                            <td class="py-3 px-4 font-medium text-slate-600">
                                {{ new Date(visitor.date).toLocaleDateString('id-ID', {
                                    day: 'numeric', month: 'long',
                                    year: 'numeric'
                                }) }}
                            </td>
                            <td class="py-3 px-4 font-medium text-slate-600">
                                <div class="flex items-center gap-1.5">
                                    <ClockIcon class="w-3.5 h-3.5 text-slate-400" />
                                    <span>{{ visitor.timeIn }}</span>
                                    <span v-if="visitor.timeOut" class="text-slate-400">- {{ visitor.timeOut }}</span>
                                    <Badge v-else variant="secondary"
                                        class="bg-emerald-50 text-emerald-600 text-[10px] px-1.5 py-0">Aktif</Badge>
                                </div>
                            </td>
                            <td class="py-3 px-4 font-medium text-slate-600">{{ visitor.purpose }}</td>
                        </tr>
                        <tr v-if="paginatedVisitors.length === 0">
                            <td colspan="5" class="py-8 text-center text-slate-400 font-medium">
                                Tidak ada data kunjungan yang cocok.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
                <p class="text-xs text-slate-500 font-medium">
                    Menampilkan <span class="font-bold text-slate-800">{{ (currentPage - 1) * itemsPerPage + 1 }}</span>
                    - <span class="font-bold text-slate-800">{{ Math.min(currentPage * itemsPerPage,
                        filteredVisitors.length) }}</span> dari <span class="font-bold text-slate-800">{{
                            filteredVisitors.length }}</span> data
                </p>
                <div class="flex gap-2">
                    <button @click="currentPage--" :disabled="currentPage === 1"
                        class="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        <ChevronLeftIcon class="w-4 h-4" />
                    </button>
                    <button @click="currentPage++" :disabled="currentPage === totalPages"
                        class="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        <ChevronRightIcon class="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
