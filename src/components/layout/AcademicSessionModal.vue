<script setup>
import { ref, watch } from 'vue';
import { useSessionStore } from '../../stores/session';
import { XMarkIcon, CheckCircleIcon, AcademicCapIcon, CalendarIcon } from '@heroicons/vue/24/outline';

const props = defineProps({
    show: Boolean
});

const emit = defineEmits(['close']);
const sessionStore = useSessionStore();

const tempYear = ref(sessionStore.academicYear);
const tempSemester = ref(sessionStore.semester);

// Generate years from 2019/2020 up to 2026/2027 (8 years total)
const years = Array.from({ length: 8 }, (_, i) => {
    const startYear = 2019 + i;
    return `${startYear}/${startYear + 1}`;
});

const semesters = ['Ganjil', 'Genap'];

watch(() => props.show, (newVal) => {
    if (newVal) {
        tempYear.value = sessionStore.academicYear;
        tempSemester.value = sessionStore.semester;
    }
});

const handleSave = () => {
    sessionStore.updateSession(tempYear.value, tempSemester.value);
    emit('close');
};
</script>

<template>
    <Teleport to="body">
        <div v-if="show"
            class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 overflow-y-auto"
            @click="$emit('close')">
            <div class="bg-background border border-primary/10 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200"
                @click.stop>
                <!-- Header -->
                <div class="px-6 py-4 border-b border-primary/5 flex items-center justify-between bg-primary/5">
                    <div class="flex items-center gap-3">
                        <div class="p-2 bg-primary/10 rounded-xl">
                            <AcademicCapIcon class="w-5 h-5 text-primary" />
                        </div>
                        <h3 class="font-bold text-lg text-foreground">Pilih Sesi Akademik</h3>
                    </div>
                    <button @click="$emit('close')" class="p-2 hover:bg-primary/10 rounded-full transition-colors">
                        <XMarkIcon class="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>

                <!-- Content -->
                <div class="p-6 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
                    <!-- Year Selection -->
                    <div class="space-y-3">
                        <label class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Tahun
                            Pelajaran</label>
                        <div class="grid grid-cols-2 gap-2">
                            <button v-for="year in years" :key="year" @click="tempYear = year"
                                class="flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all group"
                                :class="tempYear === year ? 'border-primary bg-primary/5' : 'border-primary/5 hover:border-primary/20 hover:bg-primary/5'">
                                <span class="font-bold text-xs sm:text-sm"
                                    :class="tempYear === year ? 'text-primary' : 'text-foreground'">{{ year }}</span>
                                <CheckCircleIcon v-if="tempYear === year" class="w-4 h-4 text-primary shrink-0" />
                            </button>
                        </div>
                    </div>

                    <!-- Semester Selection -->
                    <div class="space-y-3">
                        <label
                            class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Semester</label>
                        <div class="grid grid-cols-2 gap-3">
                            <button v-for="sem in semesters" :key="sem" @click="tempSemester = sem"
                                class="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all group"
                                :class="tempSemester === sem ? 'border-primary bg-primary/5' : 'border-primary/5 hover:border-primary/20 hover:bg-primary/5'">
                                <CalendarIcon class="w-6 h-6"
                                    :class="tempSemester === sem ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'" />
                                <span class="font-bold"
                                    :class="tempSemester === sem ? 'text-primary' : 'text-foreground'">{{ sem }}</span>
                                <div v-if="tempSemester === sem" class="w-1.5 h-1.5 rounded-full bg-primary mt-1"></div>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="p-6 pt-0">
                    <button @click="handleSave"
                        class="w-full bg-primary text-primary-foreground font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all">
                        Simpan Perubahan
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 5px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: hsl(var(--p) / 0.1);
    border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: hsl(var(--p) / 0.2);
}
</style>
