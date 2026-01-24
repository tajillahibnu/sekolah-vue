<script setup>
import { computed } from 'vue';
import {
    AcademicCapIcon,
    UserGroupIcon,
    PencilIcon,
    TrashIcon,
    BriefcaseIcon,
    UserIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
    classData: {
        type: Object,
        required: true
    },
    mode: {
        type: String,
        default: 'grid'
    }
});

const emit = defineEmits(['edit', 'delete', 'view']);

// Check if school is SMK
const isSMK = computed(() => import.meta.env.VITE_APP_TINGKAT === 'SMK');

// Calculate capacity percentage
const capacityPercentage = computed(() => {
    if (!props.classData.capacity) return 0;
    return Math.round((props.classData.currentStudents / props.classData.capacity) * 100);
});

// Get capacity color
const capacityColor = computed(() => {
    const percentage = capacityPercentage.value;
    if (percentage >= 90) return 'text-rose-500 bg-rose-50';
    if (percentage >= 75) return 'text-amber-500 bg-amber-50';
    return 'text-emerald-500 bg-emerald-50';
});

// Get capacity bar color
const capacityBarColor = computed(() => {
    const percentage = capacityPercentage.value;
    if (percentage >= 90) return 'bg-rose-500';
    if (percentage >= 75) return 'bg-amber-500';
    return 'bg-emerald-500';
});

// Get status badge
const statusBadge = computed(() => {
    if (props.classData.status === 'active') {
        return {
            label: 'Aktif',
            class: 'bg-emerald-50 text-emerald-600 border-emerald-100'
        };
    }
    return {
        label: 'Nonaktif',
        class: 'bg-zinc-100 text-zinc-500 border-zinc-200'
    };
});
</script>

<template>
    <div class="group relative bg-background/60 backdrop-blur-sm border border-primary/10 rounded-3xl hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/20 transition-all duration-300 hover:-translate-y-1"
        :class="mode === 'grid' ? 'p-6' : 'p-4'">

        <!-- Grid View Layout -->
        <template v-if="mode === 'grid'">
            <!-- Status Badge -->
            <div class="absolute top-4 right-4">
                <span :class="statusBadge.class"
                    class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border">
                    {{ statusBadge.label }}
                </span>
            </div>

            <!-- Class Header -->
            <div class="space-y-4 mb-6">
                <div class="flex items-start gap-4">
                    <div class="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                        <AcademicCapIcon class="w-6 h-6 text-primary" />
                    </div>
                    <div class="flex-1 min-w-0">
                        <h3 class="font-black text-xl text-foreground tracking-tight truncate">
                            {{ classData.name }}
                        </h3>
                        <p class="text-xs text-muted-foreground font-bold">
                            Kelas {{ classData.grade }} • {{ classData.academicYear }}
                        </p>
                    </div>
                </div>

                <!-- Jurusan (SMK Only) -->
                <div v-if="isSMK && classData.jurusan"
                    class="flex items-center gap-2 px-3 py-2 bg-indigo-50 rounded-xl">
                    <BriefcaseIcon class="w-4 h-4 text-indigo-600 shrink-0" />
                    <span class="text-xs font-bold text-indigo-900 truncate">
                        {{ classData.jurusan }}
                    </span>
                </div>
            </div>

            <!-- Capacity Info -->
            <div class="space-y-3 mb-6">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <UserGroupIcon class="w-4 h-4 text-muted-foreground" />
                        <span class="text-xs font-bold text-muted-foreground">Kapasitas</span>
                    </div>
                    <div :class="capacityColor" class="px-2.5 py-1 rounded-lg">
                        <span class="text-xs font-black">
                            {{ classData.currentStudents }}/{{ classData.capacity }}
                        </span>
                    </div>
                </div>

                <!-- Capacity Bar -->
                <div class="relative h-2 bg-primary/5 rounded-full overflow-hidden">
                    <div :class="capacityBarColor" :style="{ width: `${capacityPercentage}%` }"
                        class="absolute inset-y-0 left-0 rounded-full transition-all duration-500"></div>
                </div>

                <div class="text-right">
                    <span class="text-[10px] font-bold text-muted-foreground">
                        {{ capacityPercentage }}% Terisi
                    </span>
                </div>
            </div>

            <!-- Homeroom Teacher -->
            <div class="flex items-center gap-2 px-3 py-2.5 bg-primary/5 rounded-xl mb-6">
                <UserIcon class="w-4 h-4 text-primary shrink-0" />
                <div class="flex-1 min-w-0">
                    <p class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Wali Kelas</p>
                    <p class="text-xs font-black text-foreground truncate">{{ classData.homeRoomTeacher }}</p>
                </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-col gap-3 pt-4 border-t border-primary/5">
                <!-- Detail Button -->
                <button @click="emit('view', classData.id)"
                    class="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95 group/btn">
                    <span>Lihat Detail Kelas</span>
                    <BriefcaseIcon class="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>

                <div class="flex gap-2">
                    <button @click="emit('edit', classData)"
                        class="flex-1 px-4 py-2.5 bg-primary/5 hover:bg-primary/10 text-primary rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 group/btn">
                        <PencilIcon class="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                        Edit
                    </button>
                    <button @click="emit('delete', classData)"
                        class="flex-1 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 group/btn">
                        <TrashIcon class="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                        Hapus
                    </button>
                </div>
            </div>
        </template>

        <!-- List/Table View Layout -->
        <template v-else>
            <div class="flex flex-col sm:flex-row sm:items-center gap-4">
                <!-- Icon & Identity -->
                <div class="flex items-center gap-3 min-w-[200px] flex-1">
                    <div class="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                        <AcademicCapIcon class="w-5 h-5 text-primary" />
                    </div>
                    <div class="min-w-0">
                        <div class="flex items-center gap-2">
                            <h3 class="font-black text-base text-foreground tracking-tight truncate">
                                {{ classData.name }}
                            </h3>
                            <span :class="statusBadge.class"
                                class="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border">
                                {{ statusBadge.label }}
                            </span>
                        </div>
                        <p class="text-[10px] text-muted-foreground font-bold truncate">
                            Kelas {{ classData.grade }} • {{ classData.academicYear }}
                        </p>
                    </div>
                </div>

                <!-- Info Columns (Jurusan & Walikelas) -->
                <div class="flex items-center gap-4 flex-1">
                    <div v-if="isSMK && classData.jurusan"
                        class="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 rounded-lg shrink-0">
                        <BriefcaseIcon class="w-3.5 h-3.5 text-indigo-600" />
                        <span class="text-[10px] font-bold text-indigo-900 truncate max-w-[100px]">
                            {{ classData.jurusan }}
                        </span>
                    </div>

                    <div class="flex items-center gap-2 text-muted-foreground">
                        <UserIcon class="w-3.5 h-3.5" />
                        <span class="text-xs font-medium truncate max-w-[150px]">{{ classData.homeRoomTeacher }}</span>
                    </div>
                </div>

                <!-- Capacity Stats -->
                <div class="flex items-center gap-3 w-[180px] shrink-0 border-l border-primary/5 pl-4 hidden sm:flex">
                    <div class="flex-1 space-y-1">
                        <div class="flex justify-between text-[10px]">
                            <span class="font-bold text-muted-foreground">Kapasitas</span>
                            <span class="font-black"
                                :class="capacityPercentage >= 90 ? 'text-rose-600' : 'text-foreground'">{{
                                    classData.currentStudents }}/{{ classData.capacity }}</span>
                        </div>
                        <div class="w-full h-1.5 bg-primary/5 rounded-full overflow-hidden">
                            <div :class="capacityBarColor" :style="{ width: `${capacityPercentage}%` }"
                                class="h-full rounded-full transition-all duration-500"></div>
                        </div>
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-2 pl-4 sm:border-l border-primary/5">
                    <button @click="emit('view', classData.id)"
                        class="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-all group/btn"
                        title="Lihat Detail">
                        <BriefcaseIcon class="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                    </button>
                    <button @click="emit('edit', classData)"
                        class="p-2 bg-primary/5 hover:bg-primary/10 text-primary rounded-lg transition-all group/btn"
                        title="Edit Kelas">
                        <PencilIcon class="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                    </button>
                    <button @click="emit('delete', classData)"
                        class="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-all group/btn"
                        title="Hapus Kelas">
                        <TrashIcon class="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                    </button>
                </div>
            </div>
        </template>
    </div>
</template>
