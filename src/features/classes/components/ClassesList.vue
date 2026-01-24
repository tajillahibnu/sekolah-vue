<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router'; // Import useRouter
import { useClassStore } from '@/stores/class';
import {
    PlusIcon,
    MagnifyingGlassIcon,
    AcademicCapIcon,
    UserGroupIcon,
    BuildingLibraryIcon,
    EllipsisHorizontalIcon,
    EyeIcon
} from '@heroicons/vue/24/outline';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem
} from '@/components/ui/dropdown-menu';

const router = useRouter(); // Initialize router
const classStore = useClassStore();
const searchQuery = ref('');

onMounted(() => {
    classStore.fetchClasses();
});

const filteredClasses = computed(() => {
    if (!searchQuery.value) return classStore.classes;
    const query = searchQuery.value.toLowerCase();
    return classStore.classes.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.homeroomTeacher?.toLowerCase().includes(query)
    );
});

const getCapacityPercentage = (current, max) => {
    if (!max) return 0;
    return Math.round((current / max) * 100);
};

const navigateToDetail = (id) => {
    router.push({ name: 'academic-class-detail', params: { id } });
};

</script>

<template>
    <div class="space-y-6">
        <!-- Header Actions -->
        <div class="flex flex-col sm:flex-row justify-between gap-4">
            <div class="relative flex-1 max-w-md">
                <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input v-model="searchQuery" type="text" placeholder="Cari kelas atau wali kelas..."
                    class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all">
            </div>
            <button
                class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20">
                <PlusIcon class="w-5 h-5" />
                <span>Tambah Kelas</span>
            </button>
        </div>

        <!-- Class Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <div v-for="cls in filteredClasses" :key="cls.id"
                class="group bg-white rounded-[24px] border border-slate-100 p-5 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-600/5 transition-all duration-300 relative overflow-hidden">

                <!-- Card Header -->
                <div class="flex justify-between items-start mb-4 relative z-10">
                    <div class="flex items-center gap-3">
                        <div
                            class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-lg group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                            {{ cls.grade }}
                        </div>
                        <div>
                            <h3 class="font-black text-lg text-foreground leading-tight">{{ cls.name }}</h3>
                            <p class="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-0.5">{{
                                cls.academicYear }}</p>
                        </div>
                    </div>

                    <!-- Actions Menu -->
                    <DropdownMenu>
                        <DropdownMenuTrigger class="p-2 hover:bg-slate-50 rounded-lg transition-colors">
                            <EllipsisHorizontalIcon class="w-5 h-5 text-muted-foreground" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" class="w-48 rounded-xl">
                            <DropdownMenuItem @click="navigateToDetail(cls.id)" class="font-medium cursor-pointer">
                                <EyeIcon class="w-4 h-4 mr-2" />
                                Lihat Detail
                            </DropdownMenuItem>
                            <!-- Other actions can be added here -->
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <!-- Info Cards -->
                <div class="space-y-3 relative z-10">
                    <div class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <UserGroupIcon class="w-5 h-5 text-slate-400" />
                        <div class="flex-1">
                            <div class="flex justify-between text-xs font-bold mb-1.5">
                                <span class="text-muted-foreground">Kapasitas</span>
                                <span
                                    :class="cls.currentStudents >= cls.capacity ? 'text-rose-600' : 'text-emerald-600'">
                                    {{ cls.currentStudents }}/{{ cls.capacity }}
                                </span>
                            </div>
                            <div class="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                <div class="h-full rounded-full transition-all duration-500"
                                    :class="cls.currentStudents >= cls.capacity ? 'bg-rose-500' : 'bg-emerald-500'"
                                    :style="{ width: `${getCapacityPercentage(cls.currentStudents, cls.capacity)}%` }">
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <AcademicCapIcon class="w-5 h-5 text-slate-400" />
                        <div class="flex-1 min-w-0">
                            <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Wali
                                Kelas</p>
                            <p class="text-sm font-bold text-foreground truncate">{{ cls.homeroomTeacher || 'Belum
                                ditentukan' }}</p>
                        </div>
                    </div>
                </div>

                <!-- Quick Detail Button (Visible on hover/always convenient) -->
                <button @click="navigateToDetail(cls.id)"
                    class="mt-4 w-full py-2.5 rounded-xl border border-blue-100 text-blue-600 font-bold text-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600">
                    Lihat Detail Kelas
                    <BuildingLibraryIcon class="w-4 h-4" />
                </button>

            </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredClasses.length === 0" class="text-center py-12">
            <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <BuildingLibraryIcon class="w-8 h-8 text-slate-300" />
            </div>
            <h3 class="text-lg font-bold text-foreground">Tidak ada kelas ditemukan</h3>
            <p class="text-muted-foreground">Coba ubah kata kunci pencarian anda.</p>
        </div>
    </div>
</template>
