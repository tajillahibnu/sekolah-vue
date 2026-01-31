<script setup>
import { ref, computed } from 'vue';
import { useAttendanceStore } from '../stores/attendanceStore';
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowDownTrayIcon,
    ChevronDownIcon,
    CheckIcon,
    UserIcon,
    ClockIcon,
    AcademicCapIcon
} from '@heroicons/vue/24/outline';

const attendanceStore = useAttendanceStore();
const searchQuery = ref('');
const selectedClass = ref('');
const showClassDropdown = ref(false);

const classOptions = [
    { value: '', label: 'Semua Kelas' },
    { value: 'XII IPA 1', label: 'XII IPA 1' },
    { value: 'XII IPA 2', label: 'XII IPA 2' },
    { value: 'XII IPS 1', label: 'XII IPS 1' }
];

const selectedClassLabel = computed(() => {
    const option = classOptions.find(opt => opt.value === selectedClass.value);
    return option ? option.label : 'Pilih Kelas';
});

const kbmLogs = computed(() => {
    let logs = attendanceStore.getAllKbm({ class: selectedClass.value });
    if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        logs = logs.filter(l => l.studentName.toLowerCase().includes(q) || l.subject.toLowerCase().includes(q));
    }
    return logs;
});
</script>

<template>
    <div class="space-y-8 pb-12">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div class="space-y-1">
                <h1 class="text-3xl font-black text-slate-800 tracking-tight">Monitoring Absensi KBM</h1>
                <p class="text-slate-500 font-medium">Pantau kehadiran siswa per mata pelajaran</p>
            </div>
            <button
                class="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-6 py-3 rounded-2xl font-bold shadow-lg shadow-slate-200/50 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2">
                <ArrowDownTrayIcon class="w-5 h-5 text-slate-500" />
                Export Data
            </button>
        </div>

        <!-- Filters (Glassmorphism Style) -->
        <div
            class="relative z-40 bg-white/60 backdrop-blur-md border border-slate-200 rounded-3xl p-2 shadow-xl shadow-slate-200/50">
            <div class="flex flex-col lg:flex-row items-stretch lg:items-center gap-2">
                <!-- Search -->
                <div class="relative flex-1 group">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon
                            class="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input v-model="searchQuery" type="text" placeholder="Cari siswa atau mapel..."
                        class="block w-full pl-12 pr-4 py-4 bg-slate-50 border-transparent rounded-2xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-100 transition-all placeholder:text-slate-400 text-slate-700" />
                </div>

                <div class="flex flex-col sm:flex-row gap-2">
                    <!-- Custom Class Dropdown -->
                    <div class="relative w-full sm:w-56">
                        <button @click="showClassDropdown = !showClassDropdown"
                            class="w-full h-full flex items-center justify-between px-5 py-4 bg-slate-50 border-transparent rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-100 transition-all text-left">
                            <div class="flex items-center gap-2.5">
                                <FunnelIcon class="w-4 h-4 text-blue-500" />
                                <span>{{ selectedClassLabel }}</span>
                            </div>
                            <ChevronDownIcon class="w-4 h-4 text-slate-400 transition-transform duration-300"
                                :class="{ 'rotate-180': showClassDropdown }" />
                        </button>

                        <div v-if="showClassDropdown"
                            class="absolute top-full left-0 right-0 mt-2 z-[60] bg-white border border-slate-100 rounded-2xl shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-200">
                            <div class="space-y-1">
                                <button v-for="opt in classOptions" :key="opt.value"
                                    @click="selectedClass = opt.value; showClassDropdown = false"
                                    class="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all"
                                    :class="selectedClass === opt.value ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-500 hover:text-slate-700'">
                                    <span>{{ opt.label }}</span>
                                    <CheckIcon v-if="selectedClass === opt.value" class="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Content: KBM List (Card Style) -->
        <div class="space-y-4">
            <template v-if="kbmLogs.length === 0">
                <div class="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-400 italic">
                    Tidak ada data absensi KBM
                </div>
            </template>
            <template v-else>
                <div v-for="log in kbmLogs" :key="log.id"
                    class="group bg-white border border-slate-100 rounded-3xl p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all hover:-translate-y-1 relative overflow-hidden">

                    <!-- Card Header -->
                    <div
                        class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-4 mb-5">
                        <div class="flex items-center gap-3">
                            <div class="p-2 bg-slate-50 rounded-xl group-hover:bg-blue-50 transition-colors">
                                <UserIcon class="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
                            </div>
                            <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                <span class="text-[11px] font-black uppercase tracking-widest text-slate-600">{{
                                    log.studentName }}</span>
                                <div class="hidden sm:block w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                                <span class="text-[11px] font-black uppercase tracking-widest text-slate-400">{{
                                    log.className }}</span>
                            </div>
                        </div>

                        <div class="flex items-center gap-3">
                            <span :class="[
                                'inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-colors',
                                log.status === 'Hadir' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                    log.status === 'Izin' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                        log.status === 'Sakit' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                            'bg-red-50 text-red-600 border-red-100'
                            ]">
                                {{ log.status }}
                            </span>
                        </div>
                    </div>

                    <!-- Card Body -->
                    <div class="flex flex-col md:flex-row md:items-center gap-6">
                        <div class="flex items-center gap-5 flex-1">
                            <!-- Subject Icon -->
                            <div
                                class="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
                                <AcademicCapIcon class="w-8 h-8" />
                            </div>

                            <div class="space-y-1">
                                <h3
                                    class="font-black text-xl text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">
                                    {{ log.subject }}
                                </h3>
                                <div class="flex items-center gap-4 text-xs font-medium text-slate-500">
                                    <span class="flex items-center gap-1">
                                        <UserIcon class="w-3 h-3" /> {{ log.teacher }}
                                    </span>
                                    <span class="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg">
                                        <ClockIcon class="w-3 h-3" /> {{ log.time }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>
