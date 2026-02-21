<script setup>
import { ref, watch, onMounted } from 'vue';
import { useSessionStore } from '../../stores/session';
import { XMarkIcon, CheckCircleIcon, AcademicCapIcon, CalendarIcon } from '@heroicons/vue/24/outline';
import api from '../../services/api'; // Axios instance

const props = defineProps({
    show: Boolean
});

const emit = defineEmits(['close']);
const sessionStore = useSessionStore();

// UI States
const isLoading = ref(false);
const isSaving = ref(false);

// Backend Options
const academicOptions = ref([]);

// User Selection Local State (By ID / Object)
const tempSelectedId = ref(null);

const fetchAcademicYears = async () => {
    isLoading.value = true;
    try {
        const response = await api.get('/academic-years', { params: { per_page: 50 } });
        if (response.data && response.data.data) {
            academicOptions.value = response.data.data.data || response.data.data; // Handle paginate
        }
    } catch (error) {
        console.error('Gagal memuat daftar Tahun Akademik', error);
    } finally {
        isLoading.value = false;
    }
};

watch(() => props.show, (newVal) => {
    if (newVal) {
        // Init default selection based on Pinia Store
        tempSelectedId.value = sessionStore.id;
        if (academicOptions.value.length === 0) {
            fetchAcademicYears();
        }
    }
});

const handleSave = async () => {
    if (!tempSelectedId.value) return;

    isSaving.value = true;
    try {
        // Karena ini cuma filter lokal user, kita stop tembak API backend
        // dan hanya temukan detail objektnya dari opsi yang diload untuk Pinia
        let selectedObj = null;
        for (const year of academicOptions.value) {
            const foundTerm = year.terms.find(t => t.id === tempSelectedId.value);
            if (foundTerm) {
                selectedObj = {
                    id: foundTerm.id,
                    name: year.name,
                    semester: foundTerm.semester
                };
                break;
            }
        }

        if (selectedObj) {
            sessionStore.updateSession(selectedObj.id, selectedObj.name, selectedObj.semester);
        }

        emit('close');

        // Refresh global data based on new session
        setTimeout(() => {
            window.location.reload();
        }, 150);

    } catch (error) {
        console.error('Gagal mengatur filter sesi akademik lokal', error);
        alert('Terjadi kesalahan sistem di perangkat Anda');
    } finally {
        isSaving.value = false;
    }
};

const handleReset = async () => {
    isSaving.value = true;
    try {
        await sessionStore.resetToGlobalActive();
        emit('close');
        setTimeout(() => {
            window.location.reload();
        }, 150);
    } catch (error) {
        console.error('Gagal mereset filter sesi', error);
    } finally {
        isSaving.value = false;
    }
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
                <div class="p-6 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar relative min-h-[150px]">
                    <!-- Loading Mask -->
                    <div v-if="isLoading"
                        class="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-3xl">
                        <span class="loading loading-spinner text-primary w-8 h-8"></span>
                    </div>

                    <!-- Nested Selection (Tahun > Semester) -->
                    <div class="space-y-6">
                        <div v-for="yearGroup in academicOptions" :key="yearGroup.id" class="space-y-3">
                            <!-- Label Tahun Pelajaran -->
                            <div class="flex items-center gap-2 mb-1">
                                <CalendarIcon class="w-4 h-4 text-muted-foreground" />
                                <h4 class="font-bold text-sm text-foreground">Tahun Pelajaran {{ yearGroup.name }}</h4>
                            </div>

                            <!-- Daftar Semester di dalam tahun ini -->
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-2 sm:pl-0">
                                <button v-for="term in yearGroup.terms" :key="term.id" @click="tempSelectedId = term.id"
                                    class="flex flex-col items-start p-4 rounded-2xl border-2 transition-all group relative"
                                    :class="tempSelectedId === term.id ? 'border-primary bg-primary/5 shadow-md shadow-primary/10 scale-[1.02]' : 'border-primary/5 hover:border-primary/20 hover:bg-primary/5'">

                                    <div class="flex items-center justify-between w-full mb-1">
                                        <span class="font-black text-sm uppercase"
                                            :class="tempSelectedId === term.id ? 'text-primary' : 'text-foreground/80'">
                                            {{ term.semester }}
                                        </span>
                                        <div v-if="tempSelectedId === term.id"
                                            class="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                                            <CheckCircleIcon class="w-4 h-4 text-primary shrink-0" />
                                        </div>
                                    </div>

                                    <span class="text-[10px] font-medium text-muted-foreground mt-1 tracking-wide">
                                        {{ term.start_date ? term.start_date.substring(0, 4) : '...' }} - {{
                                            term.end_date ? term.end_date.substring(0, 4) : '...' }}
                                    </span>

                                    <!-- Indikator Aktif Saat ini -->
                                    <span v-if="term.is_active && tempSelectedId !== term.id"
                                        class="absolute top-0 right-0 -mt-2.5 -mr-1 text-[9px] bg-emerald-100/90 text-emerald-700 px-2 py-0.5 font-bold uppercase tracking-widest rounded-full shadow-sm">
                                        Active
                                    </span>
                                </button>

                                <div v-if="!yearGroup.terms || yearGroup.terms.length === 0"
                                    class="col-span-full p-4 border border-dashed border-border/50 rounded-2xl">
                                    <p class="text-xs text-muted-foreground italic">Belum ada sesi/semester yang
                                        ditambahkan.</p>
                                </div>
                            </div>
                        </div>

                        <div v-if="academicOptions.length === 0 && !isLoading"
                            class="p-6 text-center border-2 border-dashed border-border/60 rounded-3xl">
                            <p class="text-muted-foreground text-sm">Data Tahun Pelajaran belum tersedia di server.</p>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="p-6 pt-0 flex gap-3">
                    <button @click="handleReset" :disabled="isSaving"
                        class="px-5 flex items-center justify-center bg-slate-100 text-slate-700 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-all border border-slate-200"
                        :class="(isSaving) ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.98]'">
                        Reset
                    </button>
                    <button @click="handleSave" :disabled="!tempSelectedId || isSaving"
                        class="flex-1 relative flex items-center justify-center bg-primary text-primary-foreground font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 transition-all"
                        :class="(!tempSelectedId || isSaving) ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 active:scale-[0.98]'">
                        <span v-if="!isSaving">Terapkan Filter</span>
                        <span v-else class="loading loading-dots loading-sm"></span>
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
