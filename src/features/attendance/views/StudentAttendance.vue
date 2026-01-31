<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAttendanceStore } from '../stores/attendanceStore';
import { useAuthStore } from '@/stores/auth';
import {
    ClockIcon,
    MapPinIcon,
    CalendarIcon,
    ArrowRightOnRectangleIcon,
    ArrowLeftOnRectangleIcon
} from '@heroicons/vue/24/outline';

const attendanceStore = useAttendanceStore();
const authStore = useAuthStore();

const currentTime = ref(new Date());

const todayStatus = computed(() => {
    // Basic lookup assuming user.id is what we use. 
    // In real app, might need to match by ID from authStore
    const userId = authStore.user?.id || 1;
    const statusFn = attendanceStore.getMyTodayStatus(userId);
    return statusFn.value;
});

const isCheckedIn = computed(() => !!todayStatus.value && !!todayStatus.value.timeIn);
const isCheckedOut = computed(() => !!todayStatus.value && !!todayStatus.value.timeOut);

const formatTime = (date) => {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (date) => {
    return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

const handleCheckIn = async () => {
    const user = authStore.user || { id: 1, name: 'Siswa Test', class: 'XII IPA 1' };
    await attendanceStore.checkIn(user);
};

const handleCheckOut = async () => {
    if (todayStatus.value) {
        await attendanceStore.checkOut(todayStatus.value.id);
    }
};

onMounted(() => {
    setInterval(() => {
        currentTime.value = new Date();
    }, 1000);
});

// Mock history
const history = computed(() => {
    const userId = authStore.user?.id || 1;
    return attendanceStore.getStudentHistory(userId);
});
</script>

<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-2xl font-bold text-slate-800">Absensi Saya</h2>
                <p class="text-slate-500">Kelola kehadiran harian sekolah</p>
            </div>
            <div class="text-right hidden md:block">
                <p class="text-3xl font-black text-slate-700 font-mono">{{ formatTime(currentTime) }}</p>
                <p class="text-slate-500 text-sm">{{ formatDate(currentTime) }}</p>
            </div>
        </div>

        <!-- Today's Status Card -->
        <div
            class="bg-white rounded-[32px] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden">
            <!-- Decorative BG -->
            <div
                class="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none">
            </div>

            <div class="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-between">
                <!-- Status Text -->
                <div class="flex-1 w-full">
                    <div class="bg-slate-50 inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4">
                        <CalendarIcon class="w-4 h-4 text-slate-500" />
                        <span class="text-sm font-medium text-slate-600">{{ formatDate(currentTime) }}</span>
                    </div>

                    <h3 class="text-lg font-semibold text-slate-600 mb-2">Status Hari Ini</h3>
                    <div v-if="!isCheckedIn" class="mb-6">
                        <p class="text-3xl font-bold text-slate-300">Belum Absen</p>
                        <p class="text-slate-500 mt-2">Silahkan melakukan Check In saat tiba di sekolah.</p>
                    </div>
                    <div v-else class="mb-6">
                        <div class="flex items-center gap-3">
                            <span class="text-3xl font-bold text-emerald-600">Hadir</span>
                            <span v-if="isCheckedOut"
                                class="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase">Sudah
                                Pulang</span>
                            <span v-else
                                class="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-xs font-bold uppercase animate-pulse">Sedang
                                di Sekolah</span>
                        </div>
                        <div class="grid grid-cols-2 gap-4 mt-6 max-w-sm">
                            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p class="text-xs text-slate-400 font-bold uppercase mb-1">Waktu Masuk</p>
                                <p class="text-xl font-bold text-slate-700">{{ todayStatus.timeIn }}</p>
                            </div>
                            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p class="text-xs text-slate-400 font-bold uppercase mb-1">Waktu Pulang</p>
                                <p class="text-xl font-bold text-slate-700">{{ todayStatus.timeOut || '--:--' }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="w-full md:w-auto flex flex-col gap-4">
                    <button @click="handleCheckIn" :disabled="isCheckedIn || attendanceStore.loading" :class="[
                        'w-full md:w-64 h-24 rounded-2xl flex items-center justify-center gap-4 text-xl font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98]',
                        isCheckedIn
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30'
                    ]">
                        <ArrowRightOnRectangleIcon class="w-8 h-8" />
                        Check In
                    </button>

                    <button @click="handleCheckOut" :disabled="!isCheckedIn || isCheckedOut || attendanceStore.loading"
                        :class="[
                            'w-full md:w-64 h-24 rounded-2xl flex items-center justify-center gap-4 text-xl font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98]',
                            (!isCheckedIn || isCheckedOut)
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-white border-2 border-orange-500 text-orange-600 shadow-lg shadow-orange-500/10'
                        ]">
                        <ArrowLeftOnRectangleIcon class="w-8 h-8" />
                        Check Out
                    </button>
                </div>
            </div>
        </div>

        <!-- History List -->
        <div>
            <h3 class="text-lg font-bold text-slate-800 mb-4">Riwayat Kehadiran</h3>
            <div class="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <table class="w-full text-left text-sm">
                    <thead class="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th class="px-6 py-4 font-semibold text-slate-500">Tanggal</th>
                            <th class="px-6 py-4 font-semibold text-slate-500">Status</th>
                            <th class="px-6 py-4 font-semibold text-slate-500">Masuk</th>
                            <th class="px-6 py-4 font-semibold text-slate-500">Pulang</th>
                            <th class="px-6 py-4 font-semibold text-slate-500">Keterangan</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-50">
                        <tr v-for="log in history" :key="log.id" class="hover:bg-slate-50/50 transition-colors">
                            <td class="px-6 py-4 font-medium text-slate-700">{{ log.date }}</td>
                            <td class="px-6 py-4">
                                <span :class="[
                                    'px-2.5 py-0.5 rounded-full text-xs font-bold uppercase',
                                    log.status === 'Hadir' ? 'bg-emerald-100 text-emerald-600' :
                                        log.status === 'Izin' ? 'bg-blue-100 text-blue-600' :
                                            log.status === 'Sakit' ? 'bg-amber-100 text-amber-600' :
                                                'bg-red-100 text-red-600'
                                ]">
                                    {{ log.status }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-slate-600">{{ log.timeIn || '-' }}</td>
                            <td class="px-6 py-4 text-slate-600">{{ log.timeOut || '-' }}</td>
                            <td class="px-6 py-4 text-slate-500 truncate max-w-[200px]">{{ log.notes || '-' }}</td>
                        </tr>
                        <tr v-if="history.length === 0">
                            <td colspan="5" class="px-6 py-12 text-center text-slate-400 italic">
                                Belum ada riwayat kehadiran
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>
