<script setup>
import { ref, computed } from 'vue';
import { useScheduleStore } from '@/stores/scheduleStore';
import {
    BuildingOffice2Icon,
    ClockIcon
} from '@heroicons/vue/24/outline';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const store = useScheduleStore();

// State
const selectedClass = ref(store.classes[0]); // Default to first class
const selectedVersionId = ref(store.activeVersions[0]?.id);

// Computed
const scheduleGrid = computed(() => {
    if (!selectedClass.value || !selectedVersionId.value) return {};
    return store.getScheduleGrid(selectedClass.value, selectedVersionId.value);
});

const getPeriodLabel = (period) => {
    if (period.type === 'break') return 'ISTIRAHAT';
    return `${period.time}`;
};
</script>

<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div class="flex items-center gap-4">
                <div>
                    <h1 class="text-2xl font-black text-slate-800 flex items-center gap-2">
                        <BuildingOffice2Icon class="w-8 h-8 text-blue-600" />
                        <span>Jadwal Pelajaran</span>
                    </h1>
                    <p class="text-slate-500 font-medium text-sm">Lihat jadwal pelajaran mingguan.</p>
                </div>
            </div>

            <div class="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
                <!-- Class Selector -->
                <div class="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                    <Select v-model="selectedClass">
                        <SelectTrigger
                            class="w-[200px] border-0 h-10 bg-transparent focus:ring-0 text-slate-700 font-bold px-3">
                            <span class="text-xs text-slate-400 mr-2 font-medium">Kelas:</span>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem v-for="c in store.classes" :key="c" :value="c">
                                {{ c }}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <!-- Version Selector -->
                <div class="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                    <Select v-model="selectedVersionId">
                        <SelectTrigger
                            class="w-[240px] border-0 h-10 bg-transparent focus:ring-0 text-slate-700 font-bold px-3">
                            <span class="text-xs text-slate-400 mr-2 font-medium">Versi:</span>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem v-for="v in store.activeVersions" :key="v.id" :value="v.id">
                                {{ v.year }} {{ v.semester }} - {{ v.name }}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>

        <!-- Schedule Table -->
        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
            <table class="w-full border-collapse min-w-[1000px]">
                <thead>
                    <tr>
                        <th
                            class="w-20 p-3 bg-slate-50 border-b border-r border-slate-200 text-xs font-black uppercase text-slate-400 text-center">
                            Jam Ke
                        </th>
                        <th v-for="day in store.days" :key="day"
                            class="p-3 bg-slate-50 border-b border-r border-slate-200 text-sm font-black text-slate-700 text-center min-w-[140px]">
                            {{ day }}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="period in store.periods" :key="period.id">
                        <!-- Time Slot -->
                        <td class="bg-slate-50 border-r border-b border-slate-200 p-2 text-center relative group">
                            <div v-if="period.type === 'break'"
                                class="flex flex-col items-center justify-center h-full py-2">
                                <div
                                    class="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide mb-1">
                                    Break</div>
                                <span class="text-xs font-bold text-slate-600">{{ period.time }}</span>
                            </div>
                            <div v-else class="flex flex-col items-center justify-center h-full">
                                <span
                                    class="text-xl font-black text-slate-300 group-hover:text-blue-500 transition-colors">{{
                                    period.label }}</span>
                                <span class="text-[10px] font-bold text-slate-400 mt-1">{{ period.time }}</span>
                            </div>
                        </td>

                        <!-- Cells -->
                        <template v-for="day in store.days" :key="day">
                            <td v-if="period.type === 'break'"
                                class="bg-slate-50/50 border-r border-b border-slate-200"></td>

                            <template v-else>
                                <td v-if="scheduleGrid[period.id] && scheduleGrid[period.id][day] && !scheduleGrid[period.id][day].isMerged"
                                    :rowspan="scheduleGrid[period.id][day].rowSpan"
                                    class="border-r border-b border-slate-200 p-1 align-top h-24 hover:bg-slate-50 transition-colors">

                                    <div class="h-full w-full rounded-lg p-2 flex flex-col gap-1 border border-l-4 shadow-sm"
                                        :class="[scheduleGrid[period.id][day].subjectColor, 'border-l-' + scheduleGrid[period.id][day].subjectColor.split(' ')[2].replace('text-', '')]">

                                        <div class="flex justify-between items-start">
                                            <span class="text-xs font-black uppercase tracking-wider opacity-70">
                                                {{ scheduleGrid[period.id][day].subjectId }}
                                            </span>
                                            <span class="text-[10px] font-bold opacity-60 flex items-center gap-1">
                                                <ClockIcon class="w-3 h-3" />
                                                {{ period.time.split(' - ')[0] }}
                                            </span>
                                        </div>

                                        <div class="font-bold text-sm leading-tight line-clamp-2">
                                            {{ scheduleGrid[period.id][day].subjectName }}
                                        </div>

                                        <div
                                            class="mt-auto pt-2 border-t border-black/5 flex items-center justify-between">
                                            <span class="text-[10px] font-bold opacity-80 truncate max-w-[100px]">
                                                {{ scheduleGrid[period.id][day].teacherName }}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td v-else-if="!scheduleGrid[period.id][day]"
                                    class="border-r border-b border-slate-200 p-1 h-24">
                                </td>
                            </template>
                        </template>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>
