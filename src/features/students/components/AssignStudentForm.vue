<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { refDebounced, useIntersectionObserver } from '@vueuse/core';
import {
    UserPlusIcon,
    MagnifyingGlassIcon,
    CheckCircleIcon,
    XMarkIcon,
    ChevronDownIcon,
    AcademicCapIcon,
    ArrowPathIcon
} from '@heroicons/vue/24/outline';
import api from '@/services/api';
import ServerSelect from '@/components/ui/form/ServerSelect.vue';

const props = defineProps({
    modelValue: {
        type: Object,
        default: null
    }
});

const emit = defineEmits(['submit', 'cancel']);

const loading = ref(false);
const students = ref([]);
const searchQuery = ref('');
const selectedStudentIds = ref([]);
const selectedRombelId = ref('');

const fetchUnclassedStudents = async () => {
    loading.value = true;
    try {
        const response = await api.get('/siswas', {
            params: { unclassed: 'true', limit: 100 }
        });
        students.value = response.data.data;
    } catch (error) {
        console.error('Failed to fetch unclassed students', error);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchUnclassedStudents();
});

const filteredStudents = computed(() => {
    if (!searchQuery.value) return students.value;
    const q = searchQuery.value.toLowerCase();
    return students.value.filter(s =>
        s.name.toLowerCase().includes(q) ||
        (s.nis && s.nis.toLowerCase().includes(q))
    );
});

const toggleStudent = (id) => {
    const index = selectedStudentIds.value.indexOf(id);
    if (index === -1) {
        selectedStudentIds.value.push(id);
    } else {
        selectedStudentIds.value.splice(index, 1);
    }
};

const handleSubmit = async () => {
    if (selectedStudentIds.value.length === 0 || !selectedRombelId.value) return;

    loading.value = true;
    try {
        await api.post(`/rombels/${selectedRombelId.value}/assign-students`, {
            student_ids: selectedStudentIds.value
        });
        emit('submit');
    } catch (error) {
        console.error('Failed to assign students', error);
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div class="space-y-6">
        <!-- Step 1: Select Rombel (Using ServerSelect) -->
        <div class="space-y-3">
            <ServerSelect v-model="selectedRombelId" api-url="/rombels" placeholder="Pilih Rombel / Kelas..."
                label="Pilih Kelas Tujuan" :icon="AcademicCapIcon" :all-option="null" />
        </div>

        <!-- Step 2: Select Students -->
        <div class="space-y-4">
            <div class="flex items-center justify-between">
                <label class="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                    <UserPlusIcon class="w-4 h-4 text-primary" />
                    Pilih Siswa ({{ selectedStudentIds.length }})
                </label>

                <!-- Mini Search -->
                <div class="relative w-48 group">
                    <MagnifyingGlassIcon
                        class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input v-model="searchQuery" type="text" placeholder="Cari..."
                        class="w-full pl-9 pr-3 py-2 bg-primary/5 border-transparent rounded-xl text-xs font-bold focus:bg-background focus:ring-2 focus:ring-primary/10 transition-all" />
                </div>
            </div>

            <!-- Student List Selection -->
            <div class="bg-primary/5 rounded-[32px] p-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                <div v-if="loading && students.length === 0" class="p-8 text-center space-y-3">
                    <div class="loading loading-spinner loading-md text-primary mx-auto"></div>
                    <p class="text-xs font-bold text-muted-foreground">Memuat data siswa...</p>
                </div>

                <div v-else-if="filteredStudents.length === 0" class="p-12 text-center">
                    <p class="text-sm font-bold text-muted-foreground">Tidak ada siswa ditemukan.</p>
                </div>

                <div v-else class="grid grid-cols-1 gap-1">
                    <button v-for="student in filteredStudents" :key="student.id" @click="toggleStudent(student.id)"
                        class="flex items-center gap-4 p-3 rounded-2xl transition-all group relative overflow-hidden"
                        :class="selectedStudentIds.includes(student.id) ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'hover:bg-primary/10'">

                        <div class="w-10 h-10 rounded-xl overflow-hidden shrink-0 border-2"
                            :class="selectedStudentIds.includes(student.id) ? 'border-primary-foreground/20' : 'border-primary/10'">
                            <img :src="student.avatar || `https://ui-avatars.com/api/?name=${student.name}`"
                                class="w-full h-full object-cover" />
                        </div>

                        <div class="flex-1 text-left">
                            <h4 class="text-sm font-black truncate"
                                :class="selectedStudentIds.includes(student.id) ? 'text-primary-foreground' : 'text-foreground'">
                                {{ student.name }}
                            </h4>
                            <p class="text-[10px] font-bold"
                                :class="selectedStudentIds.includes(student.id) ? 'text-primary-foreground/70' : 'text-muted-foreground'">
                                {{ student.nis || 'Belum ada NIS' }} • {{ student.email }}
                            </p>
                        </div>

                        <div v-if="selectedStudentIds.includes(student.id)" class="mr-2">
                            <CheckCircleIcon class="w-6 h-6 text-primary-foreground" />
                        </div>
                    </button>
                </div>
            </div>
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center gap-3 pt-4 border-t border-primary/5">
            <button @click="emit('cancel')"
                class="flex-1 px-6 py-4 bg-muted/50 hover:bg-muted text-muted-foreground font-black rounded-2xl transition-all active:scale-95">
                Batal
            </button>
            <button @click="handleSubmit" :disabled="loading || selectedStudentIds.length === 0 || !selectedRombelId"
                class="flex-[2] bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-4 rounded-2xl font-black shadow-xl shadow-primary/20 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none flex items-center justify-center gap-3">
                <UserPlusIcon v-if="!loading" class="w-5 h-5" />
                <span v-else class="loading loading-spinner loading-sm"></span>
                {{ loading ? 'Memproses...' : `Tempatkan ${selectedStudentIds.length} Siswa` }}
            </button>
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
    background: rgba(var(--primary), 0.1);
    border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(var(--primary), 0.2);
}
</style>
