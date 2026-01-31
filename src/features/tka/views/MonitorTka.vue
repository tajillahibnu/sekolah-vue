<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowPathIcon,
    BellAlertIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    ClockIcon,
    UsersIcon,
    PencilSquareIcon,
    AcademicCapIcon
} from '@heroicons/vue/24/outline';
import Button from '@/components/ui/button/Button.vue';

const router = useRouter();

// --- State ---
const activeTab = ref('teacher'); // 'teacher' | 'student'
const searchQuery = ref('');
const filterStatus = ref('all'); // 'all', 'pending', 'progress', 'completed'

// --- Mock Data ---
const teacherTasks = [
    { id: 1, name: 'Budi Santoso', taskType: 'create', target: 'X IPA 1', subject: 'Matematika', deadline: '2024-03-20 15:00', status: 'pending' },
    { id: 2, name: 'Siti Aminah', taskType: 'review', target: 'Kuis Fisika', subject: 'Fisika', deadline: '2024-03-19 12:00', status: 'completed' },
    { id: 3, name: 'Dewi Lestari', taskType: 'create', target: 'XI IPS 2', subject: 'Biologi', deadline: '2024-03-21 08:00', status: 'progress' },
    { id: 4, name: 'Joko Anwar', taskType: 'create', target: 'XII IPA 1', subject: 'Kimia', deadline: '2024-03-22 14:00', status: 'pending' },
    { id: 5, name: 'Rina Wati', taskType: 'review', target: 'UTS Bahasa Inggris', subject: 'Inggris', deadline: '2024-03-18 10:00', status: 'completed' },
];

const studentExams = [
    { id: 1, name: 'Ahmad Dani', class: 'X IPA 1', exam: 'UAS Matematika', startTime: '08:00', status: 'working', score: null },
    { id: 2, name: 'Bella Saphira', class: 'X IPA 1', exam: 'UAS Matematika', startTime: '08:00', status: 'finished', score: 85 },
    { id: 3, name: 'Citra Kirana', class: 'X IPA 1', exam: 'UAS Matematika', startTime: '-', status: 'not_started', score: null },
    { id: 4, name: 'Doni Tata', class: 'XI IPS 2', exam: 'Kuis Sejarah', startTime: '09:15', status: 'working', score: null },
    { id: 5, name: 'Eka Saputra', class: 'XI IPS 2', exam: 'Kuis Sejarah', startTime: '09:10', status: 'finished', score: 90 },
    { id: 6, name: 'Fani Rose', class: 'XI IPS 2', exam: 'Kuis Sejarah', startTime: '-', status: 'not_started', score: null },
];

// --- Computed Stats ---
const stats = computed(() => {
    return {
        activeTeachers: teacherTasks.filter(t => t.status !== 'completed').length,
        activeStudents: studentExams.filter(s => s.status === 'working').length,
        teacherCompletion: Math.round((teacherTasks.filter(t => t.status === 'completed').length / teacherTasks.length) * 100),
        studentFinished: studentExams.filter(s => s.status === 'finished').length
    };
});

// --- Filters ---
const filteredTeacherTasks = computed(() => {
    return teacherTasks.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            item.subject.toLowerCase().includes(searchQuery.value.toLowerCase());
        const matchesFilter = filterStatus.value === 'all' || item.status === filterStatus.value;
        return matchesSearch && matchesFilter;
    });
});

const filteredStudentExams = computed(() => {
    return studentExams.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            item.class.toLowerCase().includes(searchQuery.value.toLowerCase());

        let matchesFilter = true;
        if (filterStatus.value === 'working') matchesFilter = item.status === 'working';
        if (filterStatus.value === 'completed') matchesFilter = item.status === 'finished'; // Map 'completed' filter to 'finished' status
        if (filterStatus.value === 'pending') matchesFilter = item.status === 'not_started'; // Map 'pending' filter to 'not_started' status

        return matchesSearch && matchesFilter;
    });
});

// --- Colors & Labels ---
const getStatusColor = (status) => {
    const map = {
        'pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
        'not_started': 'bg-slate-100 text-slate-700 border-slate-200',
        'progress': 'bg-blue-100 text-blue-700 border-blue-200',
        'working': 'bg-green-100 text-green-700 border-green-200 animate-pulse', // Pulse for working students
        'completed': 'bg-emerald-100 text-emerald-700 border-emerald-200',
        'finished': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    };
    return map[status] || 'bg-gray-100 text-gray-700';
};

const getStatusLabel = (status) => {
    const map = {
        'pending': 'Menunggu',
        'not_started': 'Belum Mulai',
        'progress': 'Sedang Dibuat',
        'working': 'Mengerjakan',
        'completed': 'Selesai',
        'finished': 'Selesai',
    };
    return map[status] || status;
};

</script>

<template>
    <div class="p-6 max-w-7xl mx-auto space-y-6">

        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 class="text-2xl font-bold text-slate-900">Monitoring TKA</h1>
                <p class="text-slate-500">Pantau progres penugasan guru dan pelaksanaan ujian siswa.</p>
            </div>

            <div class="flex gap-2">
                <Button variant="outline" class="gap-2">
                    <ArrowPathIcon class="w-4 h-4" /> Refresh
                </Button>
            </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Active Teachers -->
            <div class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div class="w-12 h-12 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center">
                    <PencilSquareIcon class="w-6 h-6" />
                </div>
                <div>
                    <div class="text-2xl font-bold text-slate-800">{{ stats.activeTeachers }}</div>
                    <div class="text-xs text-slate-500">Guru Sedang Bertugas</div>
                </div>
            </div>

            <!-- Active Students -->
            <div class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div class="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                    <ClockIcon class="w-6 h-6" />
                </div>
                <div>
                    <div class="text-2xl font-bold text-slate-800">{{ stats.activeStudents }}</div>
                    <div class="text-xs text-slate-500">Siswa Sedang Ujian</div>
                </div>
            </div>

            <!-- Teacher Completion -->
            <div class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div class="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <CheckCircleIcon class="w-6 h-6" />
                </div>
                <div>
                    <div class="text-2xl font-bold text-slate-800">{{ stats.teacherCompletion }}%</div>
                    <div class="text-xs text-slate-500">Tugas Guru Selesai</div>
                </div>
            </div>

            <!-- Student Finished -->
            <div class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div class="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <AcademicCapIcon class="w-6 h-6" />
                </div>
                <div>
                    <div class="text-2xl font-bold text-slate-800">{{ stats.studentFinished }}</div>
                    <div class="text-xs text-slate-500">Siswa Selesai Ujian</div>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden min-h-[500px]">

            <!-- Tabs -->
            <div class="flex border-b border-slate-100">
                <button @click="activeTab = 'teacher'"
                    class="px-6 py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2"
                    :class="activeTab === 'teacher' ? 'border-violet-600 text-violet-600 bg-violet-50/20' : 'border-transparent text-slate-500 hover:text-slate-700'">
                    <PencilSquareIcon class="w-4 h-4" /> Monitoring Guru
                </button>
                <button @click="activeTab = 'student'"
                    class="px-6 py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2"
                    :class="activeTab === 'student' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/20' : 'border-transparent text-slate-500 hover:text-slate-700'">
                    <UsersIcon class="w-4 h-4" /> Monitoring Siswa
                </button>
            </div>

            <!-- Toolbar -->
            <div class="p-4 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
                <div class="relative w-full sm:max-w-xs">
                    <MagnifyingGlassIcon class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" v-model="searchQuery" placeholder="Cari nama..."
                        class="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-200 outline-none" />
                </div>

                <div class="flex items-center gap-2">
                    <FunnelIcon class="w-5 h-5 text-slate-400" />
                    <select v-model="filterStatus"
                        class="bg-white border border-slate-200 rounded-lg text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200">
                        <option value="all">Semua Status</option>
                        <option value="pending">Belum Mulai / Pending</option>
                        <option value="working">Sedang Berjalan</option>
                        <option value="completed">Selesai</option>
                    </select>
                </div>
            </div>

            <!-- Teacher Table -->
            <div v-if="activeTab === 'teacher'" class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                    <thead class="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                        <tr>
                            <th class="px-6 py-4">Guru</th>
                            <th class="px-6 py-4">Jenis Tugas</th>
                            <th class="px-6 py-4">Target</th>
                            <th class="px-6 py-4">Tenggat Waktu</th>
                            <th class="px-6 py-4">Status</th>
                            <th class="px-6 py-4">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <tr v-if="filteredTeacherTasks.length === 0">
                            <td colspan="6" class="px-6 py-8 text-center text-slate-400">Tidak ada data ditemukan.</td>
                        </tr>
                        <tr v-for="task in filteredTeacherTasks" :key="task.id"
                            class="hover:bg-slate-50 transition-colors">
                            <td class="px-6 py-4">
                                <div class="font-bold text-slate-800">{{ task.name }}</div>
                                <div class="text-xs text-slate-500">{{ task.subject }}</div>
                            </td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 rounded text-xs font-bold capitalize"
                                    :class="task.taskType === 'create' ? 'bg-orange-100 text-orange-700' : 'bg-purple-100 text-purple-700'">
                                    {{ task.taskType === 'create' ? 'Buat Soal' : 'Review' }}
                                </span>
                            </td>
                            <td class="px-6 py-4 font-medium text-slate-700">{{ task.target }}</td>
                            <td class="px-6 py-4 text-slate-500">{{ task.deadline }}</td>
                            <td class="px-6 py-4">
                                <span class="px-3 py-1 rounded-full text-xs font-bold border"
                                    :class="getStatusColor(task.status)">
                                    {{ getStatusLabel(task.status) }}
                                </span>
                            </td>
                            <td class="px-6 py-4">
                                <button
                                    class="text-xs font-bold text-violet-600 hover:text-violet-800 hover:underline flex items-center gap-1">
                                    <BellAlertIcon class="w-4 h-4" /> Ingatkan
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Student Table -->
            <div v-else class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                    <thead class="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                        <tr>
                            <th class="px-6 py-4">Siswa</th>
                            <th class="px-6 py-4">Ujian (TKA)</th>
                            <th class="px-6 py-4">Waktu Mulai</th>
                            <th class="px-6 py-4">Status</th>
                            <th class="px-6 py-4">Nilai</th>
                            <th class="px-6 py-4">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <tr v-if="filteredStudentExams.length === 0">
                            <td colspan="6" class="px-6 py-8 text-center text-slate-400">Tidak ada data ditemukan.</td>
                        </tr>
                        <tr v-for="exam in filteredStudentExams" :key="exam.id"
                            class="hover:bg-slate-50 transition-colors">
                            <td class="px-6 py-4">
                                <div class="font-bold text-slate-800">{{ exam.name }}</div>
                                <div class="text-xs text-slate-500">{{ exam.class }}</div>
                            </td>
                            <td class="px-6 py-4 font-medium text-slate-700">{{ exam.exam }}</td>
                            <td class="px-6 py-4 text-slate-500">{{ exam.startTime }}</td>
                            <td class="px-6 py-4">
                                <span
                                    class="px-3 py-1 rounded-full text-xs font-bold border flex w-fit items-center gap-1"
                                    :class="getStatusColor(exam.status)">
                                    <span v-if="exam.status === 'working'"
                                        class="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                                    {{ getStatusLabel(exam.status) }}
                                </span>
                            </td>
                            <td class="px-6 py-4 font-bold">
                                <span v-if="exam.score !== null" class="text-slate-800">{{ exam.score }}</span>
                                <span v-else class="text-slate-300">-</span>
                            </td>
                            <td class="px-6 py-4">
                                <button v-if="exam.status === 'finished'"
                                    @click="router.push(`/admin/tka/detail/${exam.id}`)"
                                    class="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline">
                                    Lihat Detail
                                </button>
                                <button v-if="exam.status === 'working'"
                                    class="text-xs font-bold text-red-600 hover:text-red-800 hover:underline">
                                    Force Stop
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>
    </div>
</template>
