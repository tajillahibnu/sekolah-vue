<script setup>
import { ref, computed } from 'vue';
import { useAttendanceStore } from '../stores/attendanceStore';
import {
    MagnifyingGlassIcon,
    Squares2X2Icon,
    UserGroupIcon,
    UserIcon,
    AcademicCapIcon,
    XMarkIcon,
    CheckCircleIcon,
    XCircleIcon,
    MinusCircleIcon,
    DocumentTextIcon,
    ChevronRightIcon,
    CalendarDaysIcon
} from '@heroicons/vue/24/outline'; // Verified Icons

const attendanceStore = useAttendanceStore();

// State
const viewMode = ref('class'); // 'class' | 'student'
const searchQuery = ref('');

// Modal State
const selectedClass = ref(null); // String (className)
const selectedStudent = ref(null); // Object (student)
const showClassModal = ref(false);
const showStudentModal = ref(false);

// Data
const classes = computed(() => attendanceStore.getClasses());

// Filtered Lists
const filteredClasses = computed(() => {
    return classes.value.filter(c => c.toLowerCase().includes(searchQuery.value.toLowerCase()));
});

const filteredStudents = computed(() => {
    return attendanceStore.getAllStudents().filter(s =>
        s.studentName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        s.className.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});

// Class Modal Logic
const classStudents = computed(() => {
    if (!selectedClass.value) return [];
    return attendanceStore.getStudentsByClass(selectedClass.value);
});

// Student Modal Logic
const studentSchedule = computed(() => {
    if (!selectedStudent.value) return [];
    return attendanceStore.getKbmSchedule(selectedStudent.value.studentId);
});

// Actions
const openClassModal = (className) => {
    selectedClass.value = className;
    showClassModal.value = true;
};

const openStudentModal = (student) => {
    selectedStudent.value = student;
    showStudentModal.value = true;
    // Don't close Class Modal if it's open, just stack
};

const closeStudentModal = () => {
    showStudentModal.value = false;
    selectedStudent.value = null;
};

// UI Helpers
const getStatusColor = (status) => {
    switch (status) {
        case 'Hadir': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
        case 'Sakit': return 'text-amber-600 bg-amber-50 border-amber-100';
        case 'Izin': return 'text-blue-600 bg-blue-50 border-blue-100';
        case 'Alpha': return 'text-rose-600 bg-rose-50 border-rose-100';
        default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
};
</script>

<template>
    <div class="space-y-8 pb-32">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div class="space-y-1">
                <h1 class="text-3xl font-black text-slate-800 tracking-tight">Monitoring KBM</h1>
                <p class="text-slate-500 font-medium">Pantau kehadiran siswa di setiap jam pelajaran</p>
            </div>

            <div class="flex bg-slate-50 border border-slate-200 p-1.5 rounded-2xl gap-1 shadow-sm">
                <button @click="viewMode = 'class'"
                    class="px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                    :class="viewMode === 'class' ? 'bg-white text-blue-600 shadow-md shadow-blue-600/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'">
                    <Squares2X2Icon class="w-5 h-5" />
                    Per Kelas
                </button>
                <button @click="viewMode = 'student'"
                    class="px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                    :class="viewMode === 'student' ? 'bg-white text-blue-600 shadow-md shadow-blue-600/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'">
                    <UserGroupIcon class="w-5 h-5" />
                    Per Siswa
                </button>
            </div>
        </div>

        <!-- Filters (Glassmorphism) -->
        <div
            class="relative z-40 bg-white/60 backdrop-blur-md border border-slate-200 rounded-3xl p-2 shadow-xl shadow-slate-200/20">
            <div class="flex flex-col lg:flex-row items-stretch gap-2">
                <!-- Search -->
                <div class="relative flex-1 group">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon
                            class="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input v-model="searchQuery" type="text"
                        :placeholder="viewMode === 'class' ? 'Cari kelas (misal: XII IPA 1)...' : 'Cari nama siswa atau kelas...'"
                        class="block w-full pl-12 pr-4 py-4 bg-slate-50 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-100 transition-all placeholder:text-slate-400 text-slate-700" />
                </div>
            </div>
        </div>

        <!-- Class View (Grid) -->
        <div v-if="viewMode === 'class'"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div v-for="(cls, idx) in filteredClasses" :key="cls" @click="openClassModal(cls)"
                class="group bg-white border border-slate-100 rounded-[2rem] p-6 hover:shadow-2xl hover:shadow-blue-900/5 transition-all hover:-translate-y-1 relative overflow-hidden cursor-pointer"
                :style="{ animationDelay: `${idx * 50}ms` }">

                <!-- Decorative BG -->
                <div
                    class="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700">
                </div>

                <div class="relative z-10 flex flex-col h-full justify-between">
                    <div>
                        <div class="flex items-center justify-between mb-6">
                            <div
                                class="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                                <AcademicCapIcon class="w-7 h-7" />
                            </div>
                            <div
                                class="px-3 py-1 bg-slate-50 rounded-full border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                Aktif
                            </div>
                        </div>

                        <h3 class="text-2xl font-black text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
                            {{ cls }}</h3>
                        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Wali Kelas: Pak Guru</p>
                    </div>

                    <div class="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <div class="flex -space-x-2 overflow-hidden">
                                <img class="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                                    src="https://ui-avatars.com/api/?name=St+1&background=random" alt="" />
                                <img class="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                                    src="https://ui-avatars.com/api/?name=St+2&background=random" alt="" />
                                <div
                                    class="h-8 w-8 rounded-full bg-slate-100 ring-2 ring-white flex items-center justify-center text-[10px] font-bold text-slate-500">
                                    +{{ Math.max(0, attendanceStore.getStudentsByClass(cls).length - 2) }}</div>
                            </div>
                        </div>
                        <div
                            class="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <ChevronRightIcon class="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Student View (Card List) -->
        <div v-if="viewMode === 'student'"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div v-for="(student, idx) in filteredStudents" :key="student.id" @click="openStudentModal(student)"
                class="group bg-white border border-slate-100 rounded-[2rem] p-6 hover:shadow-2xl hover:shadow-blue-900/5 transition-all hover:-translate-y-1 relative overflow-hidden cursor-pointer"
                :style="{ animationDelay: `${idx * 50}ms` }">

                <div
                    class="absolute -bottom-8 -left-8 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700">
                </div>

                <div class="relative z-10 flex items-start gap-4">
                    <img :src="`https://ui-avatars.com/api/?name=${student.studentName}`"
                        class="w-16 h-16 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
                    <div>
                        <h4
                            class="font-black text-lg text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {{ student.studentName }}</h4>
                        <div class="flex flex-col gap-1 mt-1">
                            <span class="text-xs font-bold text-slate-400">{{ student.className }}</span>
                            <span
                                class="inline-flex max-w-min items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border"
                                :class="getStatusColor(student.status)">
                                {{ student.status }}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center relative z-10">
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tap untuk Jadwal</span>
                    <div
                        class="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <CalendarDaysIcon class="w-4 h-4" />
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Class Detail Modal (Full Screen Overlay Style) -->
    <div v-if="showClassModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div
            class="bg-white rounded-[2.5rem] w-full max-w-5xl h-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300">
            <!-- Modal Header -->
            <div class="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                <div class="flex items-center gap-4">
                    <div class="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                        <Squares2X2Icon class="w-8 h-8" />
                    </div>
                    <div>
                        <h2 class="text-2xl font-black text-slate-800">{{ selectedClass }}</h2>
                        <p class="text-slate-500 font-bold text-sm">Daftar {{ classStudents.length }} Siswa</p>
                    </div>
                </div>
                <button @click="showClassModal = false"
                    class="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-600 transition-colors">
                    <XMarkIcon class="w-6 h-6" />
                </button>
            </div>

            <!-- Modal Body (Grid List) -->
            <div class="p-8 overflow-y-auto bg-slate-50/50 custom-scrollbar h-full">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div v-for="student in classStudents" :key="student.id" @click="openStudentModal(student)"
                        class="bg-white border border-slate-100 rounded-3xl p-4 flex items-center gap-4 hover:shadow-lg hover:border-slate-200 cursor-pointer transition-all hover:-translate-y-1 group relative overflow-hidden">

                        <div class="absolute right-0 top-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRightIcon class="w-5 h-5 text-gray-300" />
                        </div>

                        <img :src="`https://ui-avatars.com/api/?name=${student.studentName}`"
                            class="w-14 h-14 rounded-2xl shadow-sm" />
                        <div>
                            <h4 class="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{{
                                student.studentName }}</h4>
                            <div class="mt-2">
                                <span class="text-[10px] font-black px-2 py-0.5 rounded border"
                                    :class="getStatusColor(student.status)">
                                    {{ student.status }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Student Schedule Modal (Side Panel Style) -->
    <div v-if="showStudentModal"
        class="fixed inset-0 z-[60] flex justify-end bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-300">
        <!-- Close Area -->
        <div class="flex-1" @click="closeStudentModal"></div>

        <div
            class="w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 relative">
            <div class="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-600 to-indigo-700"></div>

            <!-- Header -->
            <div class="relative z-10 px-8 pt-12 pb-6 text-white">
                <button @click="closeStudentModal"
                    class="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-sm transition-colors text-white">
                    <XMarkIcon class="w-5 h-5" />
                </button>
                <div class="flex items-center gap-5">
                    <img :src="`https://ui-avatars.com/api/?name=${selectedStudent.studentName}`"
                        class="w-20 h-20 rounded-3xl border-4 border-white/20 shadow-xl" />
                    <div>
                        <h3 class="font-black text-2xl leading-tight">{{ selectedStudent.studentName }}</h3>
                        <p class="font-medium text-blue-100 mt-1">{{ selectedStudent.className }}</p>
                    </div>
                </div>
            </div>

            <!-- Timeline Content -->
            <div
                class="flex-1 overflow-y-auto bg-slate-50 rounded-t-[2.5rem] -mt-6 relative z-20 px-8 py-8 custom-scrollbar">

                <div class="flex items-center justify-between mb-8">
                    <h4 class="font-black text-slate-800 text-lg">Jadwal Hari Ini</h4>
                    <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">{{ new
                        Date().toLocaleDateString('id-ID', { weekday: 'long' }) }}</span>
                </div>

                <div class="relative pl-8 pr-2 space-y-0">
                    <!-- Line -->
                    <div class="absolute left-[0.95rem] top-2 bottom-4 w-0.5 bg-slate-200"></div>

                    <div v-for="(slot, idx) in studentSchedule" :key="idx" class="relative pb-8 last:pb-0 group">
                        <!-- Custom Bullet -->
                        <div class="absolute left-0 top-0 w-8 h-8 flex items-center justify-center z-10">
                            <div class="w-3 h-3 rounded-full border-2 border-white ring-2 bg-white transition-all shadow-sm"
                                :class="slot.type === 'break' ? 'ring-amber-300 bg-amber-400' :
                                    (slot.status === 'Hadir' ? 'ring-emerald-300 bg-emerald-500' : 'ring-rose-300 bg-rose-500')">
                            </div>
                        </div>

                        <!-- Break Slot -->
                        <div v-if="slot.type === 'break'" class="ml-10">
                            <div
                                class="w-full bg-amber-50 border border-amber-100 rounded-2xl p-3 flex items-center justify-between">
                                <span class="text-xs font-black text-amber-600 uppercase tracking-widest">{{ slot.label
                                    }}</span>
                                <span class="text-xs font-bold text-amber-500 bg-white px-2 py-1 rounded-lg">{{
                                    slot.time }}</span>
                            </div>
                        </div>

                        <!-- Lesson Slot -->
                        <div v-else class="ml-10">
                            <div
                                class="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-lg transition-all hover:-translate-y-0.5 group-hover:border-blue-100">
                                <div class="flex justify-between items-start mb-3">
                                    <div>
                                        <div class="flex items-center gap-2 mb-1">
                                            <span
                                                class="text-[10px] font-black uppercase text-slate-400 tracking-wider">Jam
                                                Ke-{{ slot.jam }}</span>
                                            <span class="w-1 h-1 rounded-full bg-slate-300"></span>
                                            <span class="text-[10px] font-bold text-slate-400 font-mono">{{ slot.time
                                                }}</span>
                                        </div>
                                        <h4 class="font-black text-lg text-slate-800">{{ slot.subject }}</h4>
                                    </div>
                                    <span class="text-[9px] font-black uppercase px-2 py-1 rounded-lg border"
                                        :class="getStatusColor(slot.status)">
                                        {{ slot.status }}
                                    </span>
                                </div>

                                <div
                                    class="flex items-center gap-2 bg-slate-50 p-2 rounded-xl text-xs font-bold text-slate-500">
                                    <UserIcon class="w-4 h-4 text-blue-500" />
                                    {{ slot.teacher }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 20px;
}
</style>
