<script setup>
import { ref, computed } from 'vue';
import {
    MagnifyingGlassIcon,
    ClockIcon,
    CalendarIcon,
    CheckCircleIcon,
    PlayCircleIcon,
    DocumentTextIcon,
    FunnelIcon,
    ChevronRightIcon
} from '@heroicons/vue/24/outline';
import { useRouter } from 'vue-router';
import Button from '@/components/ui/button/Button.vue';
import Input from '@/components/ui/input/Input.vue';

const router = useRouter(); // Initialize router

// Mock Data
const activeTab = ref('active'); // 'active' | 'history'
const searchQuery = ref('');

const tkaList = ref([
    {
        id: 1,
        title: 'Ujian Akhir Semester Matematika',
        subject: 'Matematika Wajib',
        teacher: 'Budi Santoso, S.Pd',
        duration: 90, // minutes
        questionCount: 40,
        deadline: '2025-06-20T10:00:00',
        status: 'available', // available, in_progress
        progress: 0,
    },
    {
        id: 2,
        title: 'Kuis Fisika Bab Dinamika',
        subject: 'Fisika',
        teacher: 'Siti Aminah, M.Si',
        duration: 45,
        questionCount: 15,
        deadline: '2025-06-22T23:59:00',
        status: 'available',
        progress: 0,
    },
    {
        id: 3,
        title: 'Ujian Tengah Semester Bahasa Inggris',
        subject: 'Bahasa Inggris',
        teacher: 'John Doe, B.Ed',
        duration: 60,
        questionCount: 50,
        deadline: '2025-06-18T12:00:00',
        status: 'in_progress',
        progress: 30, // Percentage
    }
]);

const historyList = ref([
    {
        id: 101,
        title: 'Ulangan Harian Biologi',
        subject: 'Biologi',
        teacher: 'Dewi Lestari, S.Si',
        date: '2025-05-15',
        score: 85,
        status: 'completed'
    },
    {
        id: 102,
        title: 'Kuis Sejarah Indonesia',
        subject: 'Sejarah',
        teacher: 'Agus Salim, S.Pd',
        date: '2025-05-10',
        score: 92,
        status: 'completed'
    },
    {
        id: 103,
        title: 'Ujian Harian Kimia Dasar',
        subject: 'Kimia',
        teacher: 'Rina Wati, S.Si',
        date: '2025-05-08',
        score: 45, // Failed
        status: 'completed'
    }
]);

const filteredList = computed(() => {
    const list = activeTab.value === 'active' ? tkaList.value : historyList.value;
    if (!searchQuery.value) return list;

    return list.filter(item =>
        item.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        item.subject.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const getStatusColor = (status) => {
    switch (status) {
        case 'available': return 'bg-blue-50 text-blue-600 border-blue-200';
        case 'in_progress': return 'bg-amber-50 text-amber-600 border-amber-200';
        case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
        default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
};

const getStatusLabel = (status) => {
    switch (status) {
        case 'available': return 'Tersedia';
        case 'in_progress': return 'Sedang Dikerjakan';
        case 'completed': return 'Selesai';
        default: return status;
    }
};

</script>

<template>
    <div class="space-y-6">
        <!-- Header -->
        <div
            class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/50 backdrop-blur-lg p-6 rounded-3xl border border-white/20 shadow-xl shadow-indigo-500/5">
            <div>
                <h1 class="text-2xl font-black text-slate-800 tracking-tight">Ujian Online</h1>
                <p class="text-slate-500 text-sm mt-1">Daftar ujian dan tes akademik yang tersedia untuk Anda.</p>
            </div>

            <!-- Tab Switcher -->
            <div class="flex p-1 bg-slate-100/80 rounded-2xl border border-slate-200/50">
                <button @click="activeTab = 'active'"
                    class="px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300" :class="activeTab === 'active'
                        ? 'bg-white text-primary shadow-sm ring-1 ring-black/5'
                        : 'text-slate-500 hover:text-slate-700'">
                    Tersedia
                </button>
                <button @click="activeTab = 'history'"
                    class="px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300" :class="activeTab === 'history'
                        ? 'bg-white text-primary shadow-sm ring-1 ring-black/5'
                        : 'text-slate-500 hover:text-slate-700'">
                    Riwayat
                </button>
            </div>
        </div>

        <!-- Filter & Content -->
        <div class="space-y-4">
            <!-- Search Bar -->
            <div class="relative max-w-md">
                <MagnifyingGlassIcon class="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                <input v-model="searchQuery" type="text" placeholder="Cari ujian atau mata pelajaran..."
                    class="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 text-sm font-medium transition-all shadow-sm placeholder:text-slate-400" />
            </div>

            <!-- Empty State -->
            <div v-if="filteredList.length === 0"
                class="text-center py-20 bg-white/40 rounded-3xl border border-dashed border-slate-200">
                <div
                    class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                    <DocumentTextIcon class="w-10 h-10 text-slate-300" />
                </div>
                <h3 class="text-lg font-bold text-slate-700">Tidak ada data</h3>
                <p class="text-slate-500 text-sm">Belum ada ujian yang sesuai dengan kriteria.</p>
            </div>

            <!-- List Grid -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                <div v-for="item in filteredList" :key="item.id"
                    class="group relative bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                    <!-- Decorative Background Gradient -->
                    <div
                        class="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity group-hover:opacity-100 opacity-50">
                    </div>

                    <!-- Card Header -->
                    <div class="relative flex justify-between items-start mb-4">
                        <div
                            class="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                            <DocumentTextIcon class="w-6 h-6" />
                        </div>
                        <span class="px-3 py-1 rounded-full text-xs font-bold border capitalize"
                            :class="getStatusColor(item.status)">
                            {{ getStatusLabel(item.status) }}
                        </span>
                    </div>

                    <!-- Content -->
                    <div class="relative space-y-2 mb-6">
                        <h3
                            class="text-lg font-bold text-slate-800 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                            {{ item.title }}
                        </h3>
                        <div class="flex items-center gap-2 text-xs font-medium text-slate-500">
                            <span class="bg-slate-100 px-2 py-1 rounded-lg">{{ item.subject }}</span>
                            <span>•</span>
                            <span>{{ item.teacher }}</span>
                        </div>
                    </div>

                    <!-- Meta Info -->
                    <div
                        class="relative grid grid-cols-2 gap-3 mb-6 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                        <div class="flex items-center gap-2 text-slate-600">
                            <ClockIcon class="w-4 h-4 text-slate-400" />
                            <span class="text-xs font-semibold">{{ activeTab === 'active' ? item.duration + ' Menit' :
                                formatDate(item.date) }}</span>
                        </div>
                        <div v-if="activeTab === 'active'" class="flex items-center gap-2 text-slate-600">
                            <DocumentTextIcon class="w-4 h-4 text-slate-400" />
                            <span class="text-xs font-semibold">{{ item.questionCount }} Soal</span>
                        </div>
                        <div v-else class="flex items-center gap-2 text-slate-600">
                            <!-- Dynamic Icon & Color -->
                            <component :is="item.score >= 75 ? CheckCircleIcon : 'div'" class="w-4 h-4"
                                :class="item.score >= 75 ? 'text-emerald-500' : 'text-rose-500'">
                                <span v-if="item.score < 75" class="font-bold text-xs">!</span>
                            </component>
                            <span class="text-xs font-bold"
                                :class="item.score >= 75 ? 'text-emerald-600' : 'text-rose-600'">
                                Nilai: {{ item.score }} ({{ item.score >= 75 ? 'Lulus' : 'Tidak Lulus' }})
                            </span>
                        </div>
                    </div>

                    <!-- Action Button -->
                    <div class="relative">
                        <button v-if="activeTab === 'active'"
                            @click="router.push(`/admin/tka/student/intro/${item.id}`)"
                            class="w-full py-3 px-4 bg-slate-900 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary transition-colors duration-300 shadow-lg shadow-slate-200 group-hover:shadow-primary/20">
                            <PlayCircleIcon class="w-5 h-5" />
                            <span>{{ item.status === 'in_progress' ? 'Lanjutkan Ujian' : 'Mulai Kerjakan' }}</span>
                        </button>
                        <button v-else @click="router.push(`/admin/tka/student/result/${item.id}`)"
                            class="w-full py-3 px-4 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors duration-300">
                            <span>Lihat Hasil</span>
                            <ChevronRightIcon class="w-4 h-4" />
                        </button>
                    </div>

                    <!-- Deadline Badge (If Active) -->
                    <div v-if="activeTab === 'active' && item.status !== 'in_progress'"
                        class="absolute bottom-4 right-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <div
                            class="bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm whitespace-nowrap">
                            Batas: {{ formatDate(item.deadline) }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
