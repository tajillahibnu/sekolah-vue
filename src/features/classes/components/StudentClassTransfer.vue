<script setup>
import { ref, computed, onMounted } from 'vue';
import { useClassStore } from '@/stores/class';
import { studentClassService } from '@/services/studentClassService';
import api from '@/services/api';
import { useToast } from '@/composables/useToast';
import {
    ArrowPathIcon,
    UserIcon,
    ArrowRightIcon,
    ClockIcon
} from '@heroicons/vue/24/outline';
import FormSelect from '@/components/ui/form/FormSelect.vue';
import FormInput from '@/components/ui/form/FormInput.vue';

const classStore = useClassStore();
const toast = useToast();

const loading = ref(false);
const students = ref([]);
const studentSearch = ref('');
const selectedStudent = ref(null);
const targetClassId = ref('');
const transferReason = ref('');

// History
const transferHistory = ref([]);

// Fetch data
onMounted(async () => {
    await classStore.fetchClasses();
    await fetchStudents();
    await fetchHistory();
});

const fetchStudents = async () => {
    try {
        // In real app, fetch students who ARE assigned to a class
        const response = await api.get('/students');
        students.value = response.data.data || [];
    } catch (error) {
        console.error('Error fetching students:', error);
    }
};

const fetchHistory = async () => {
    try {
        const response = await studentClassService.getClassTransfers();
        transferHistory.value = response.data;
    } catch (error) {
        console.error('Error fetching history:', error);
    }
};

// Filtered students
const filteredStudents = computed(() => {
    if (!studentSearch.value) return students.value;
    const query = studentSearch.value.toLowerCase();
    return students.value.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.nis?.includes(query)
    );
});

// Target Class Options (exclude current class)
const targetClassOptions = computed(() => {
    if (!selectedStudent.value || !selectedStudent.value.classId) return classStore.activeClasses.map(c => ({
        value: c.id,
        label: `${c.name} (${c.currentStudents}/${c.capacity})`
    }));

    return classStore.activeClasses
        .filter(c => c.id !== selectedStudent.value.classId)
        .map(c => ({
            value: c.id,
            label: `${c.name} (${c.currentStudents}/${c.capacity})`
        }));
});

// Current Class Display
const currentClass = computed(() => {
    if (!selectedStudent.value || !selectedStudent.value.classId) return null;
    return classStore.getClassById(selectedStudent.value.classId);
});

// Submit Transfer
const handleTransfer = async () => {
    if (!selectedStudent.value || !targetClassId.value || !transferReason.value) {
        toast.error('Mohon lengkapi semua data');
        return;
    }

    loading.value = true;
    try {
        await studentClassService.transferStudent(
            selectedStudent.value.id,
            selectedStudent.value.classId,
            targetClassId.value,
            transferReason.value
        );

        toast.success('Siswa berhasil dipindahkan');

        // Reset form
        selectedStudent.value = null;
        targetClassId.value = '';
        transferReason.value = '';

        // Refresh data
        await classStore.fetchClasses();
        await fetchStudents();
        await fetchHistory();

    } catch (error) {
        toast.error(error.message || 'Gagal memindahkan siswa');
    } finally {
        loading.value = false;
    }
};

const getClassName = (id) => {
    const c = classStore.getClassById(id);
    return c ? c.name : `Class #${id}`;
};

const getStudentName = (id) => {
    const s = students.value.find(st => st.id === id);
    return s ? s.name : `Student #${id}`;
};
</script>

<template>
    <div class="space-y-6">
        <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                <ArrowPathIcon class="w-6 h-6" />
            </div>
            <div>
                <h2 class="text-2xl font-black text-foreground tracking-tight">Pindah Kelas</h2>
                <p class="text-sm text-muted-foreground">Proses pemindahan siswa antar kelas</p>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <!-- Transfer Form -->
            <div class="lg:col-span-2 space-y-6">
                <div class="bg-background border border-border rounded-3xl p-6 shadow-sm">

                    <!-- Step 1: Select Student -->
                    <div class="space-y-4 mb-8">
                        <label class="text-sm font-bold text-foreground block">1. Pilih Siswa</label>
                        <div class="relative">
                            <input v-model="studentSearch" type="text" placeholder="Cari nama siswa..."
                                class="w-full px-4 py-3 bg-secondary/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                        </div>

                        <div v-if="studentSearch && !selectedStudent"
                            class="max-h-48 overflow-y-auto border rounded-xl divide-y">
                            <div v-for="student in filteredStudents" :key="student.id"
                                @click="selectedStudent = student"
                                class="px-4 py-3 hover:bg-secondary/50 cursor-pointer flex justify-between items-center">
                                <div class="flex items-center gap-3">
                                    <div
                                        class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                        {{ student.name.charAt(0) }}
                                    </div>
                                    <div>
                                        <p class="text-sm font-bold">{{ student.name }}</p>
                                        <p class="text-xs text-muted-foreground">{{ student.nis }}</p>
                                    </div>
                                </div>
                                <span v-if="student.classId"
                                    class="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600">
                                    {{ getClassName(student.classId) }}
                                </span>
                                <span v-else class="text-xs px-2 py-1 bg-yellow-100 rounded text-yellow-600">
                                    Belum ada kelas
                                </span>
                            </div>
                        </div>

                        <!-- Selected Student Display -->
                        <div v-if="selectedStudent"
                            class="flex items-center justify-between p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                            <div class="flex items-center gap-3">
                                <div
                                    class="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                                    <UserIcon class="w-5 h-5" />
                                </div>
                                <div>
                                    <p class="font-bold text-indigo-900">{{ selectedStudent.name }}</p>
                                    <p class="text-xs text-indigo-600/80">{{ selectedStudent.nis }}</p>
                                </div>
                            </div>
                            <button @click="selectedStudent = null"
                                class="text-xs font-bold text-rose-500 hover:underline">
                                Ganti
                            </button>
                        </div>
                    </div>

                    <!-- Step 2: Transfer Details -->
                    <div v-if="selectedStudent"
                        class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">

                            <!-- Current Class -->
                            <div class="opacity-70 pointer-events-none">
                                <label class="text-xs font-bold text-muted-foreground uppercase mb-2 block">Kelas
                                    Asal</label>
                                <div class="p-4 bg-gray-50 border rounded-xl">
                                    <p class="font-black text-lg text-gray-700">{{ currentClass ? currentClass.name :
                                        'Belum Ada' }}</p>
                                    <p class="text-xs text-muted-foreground">
                                        {{ currentClass ? `Wali: ${currentClass.homeRoomTeacher}` : '-' }}
                                    </p>
                                </div>
                            </div>

                            <div class="flex justify-center md:pt-6">
                                <ArrowRightIcon class="w-6 h-6 text-muted-foreground" />
                            </div>

                            <!-- Target Class -->
                            <div>
                                <FormSelect v-model="targetClassId" label="Kelas Tujuan" :options="targetClassOptions"
                                    placeholder="Pilih kelas baru..." :required="true" />
                            </div>
                        </div>

                        <FormInput v-model="transferReason" label="Alasan Pindah"
                            placeholder="Contoh: Permintaan orang tua, pindah jurusan..." :required="true" />

                        <button @click="handleTransfer" :disabled="loading || !targetClassId || !transferReason"
                            class="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2">
                            <span v-if="loading" class="loading loading-spinner loading-sm"></span>
                            <span>Proses Perpindahan</span>
                        </button>
                    </div>

                </div>
            </div>

            <!-- Right: History -->
            <div class="space-y-4">
                <h3 class="font-bold text-lg flex items-center gap-2">
                    <ClockIcon class="w-5 h-5 text-muted-foreground" />
                    Riwayat Perpindahan
                </h3>

                <div
                    class="bg-background border border-border rounded-3xl p-4 shadow-sm h-[calc(100vh-200px)] overflow-y-auto">
                    <div v-if="transferHistory.length === 0" class="text-center py-10 text-muted-foreground text-sm">
                        Belum ada riwayat perpindahan
                    </div>

                    <div v-else class="space-y-4">
                        <div v-for="history in transferHistory" :key="history.id"
                            class="p-4 bg-secondary/20 rounded-2xl border border-transparent hover:border-indigo-100 transition-all">
                            <div class="flex justify-between items-start mb-2">
                                <span class="text-xs font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg">
                                    {{ new Date(history.transferDate).toLocaleDateString() }}
                                </span>
                                <span class="text-xs text-muted-foreground">{{ history.approvedBy }}</span>
                            </div>

                            <p class="font-bold text-sm mb-1">{{ getStudentName(history.studentId) }}</p>

                            <div class="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                <span>{{ getClassName(history.fromClassId) }}</span>
                                <ArrowRightIcon class="w-3 h-3" />
                                <span class="text-foreground font-bold">{{ getClassName(history.toClassId) }}</span>
                            </div>

                            <p class="text-xs italic text-muted-foreground line-clamp-2">"{{ history.reason }}"</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
