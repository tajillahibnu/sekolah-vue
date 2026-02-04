<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
    ArrowLeftIcon,
    PencilSquareIcon,
    PhoneIcon,
    EnvelopeIcon,
    MapPinIcon,
    AcademicCapIcon,
    BriefcaseIcon,
    UserIcon
} from '@heroicons/vue/24/outline';
import Skeleton from '@/components/ui/skeleton/Skeleton.vue';
import api from '@/services/api';

const route = useRoute();
const router = useRouter();
const employee = ref(null);
const loading = ref(true);

const fetchEmployee = async () => {
    loading.value = true;
    try {
        // Artificial delay for demo
        await new Promise(resolve => setTimeout(resolve, 800));
        const response = await api.get(`/employees`);
        // Mock API returns list, we find by ID locally for now or if API supported /id
        // My mock handler supports /employees/:id ? No, let's check mock handler.
        // My mock handler supports PUT /employees/:id, DELETE /employees/:id.
        // Does it support GET /employees/:id?
        // Let's check employees.js.
        // It supports GET /employees (list). 
        // It DOES NOT explicitely support GET /employees/:id in the code I wrote (I only wrote GET /employees).
        // I should update handler to support GET /employees/:id or just filter client side.
        // efficient: Update handler. But for now filter client side is faster to implement without touching handler again.
        // Wait, I am in code mode. I can touch handler.
        // Actually, viewing detail usually fetches singular.

        // I will implement client-side find for now to save a tool call or update handler if I can.
        // I'll update handler to be robust. 
        // But let's look at `students.js`?

        const all = response.data;
        const id = parseInt(route.params.id);
        employee.value = all.find(e => e.id === id);
    } catch (error) {
        console.error('Failed to fetch employee', error);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchEmployee();
});
</script>

<template>
    <div v-if="loading" class="space-y-6">
        <!-- Skeleton Header -->
        <div class="flex items-center gap-4">
            <Skeleton class="h-12 w-12 rounded-full" />
            <div class="flex-1 space-y-2">
                <Skeleton class="h-8 w-64" />
                <Skeleton class="h-4 w-32" />
            </div>
            <Skeleton class="h-12 w-24" />
        </div>

        <!-- Skeleton Main Card -->
        <div class="bg-card text-card-foreground rounded-xl border-0 shadow-sm">
            <div class="p-6">
                <div class="flex flex-col md:flex-row gap-6">
                    <Skeleton class="w-32 h-32 rounded-full" />
                    <div class="flex-1 space-y-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div v-for="i in 4" :key="i" class="space-y-2">
                                <Skeleton class="h-3 w-20" />
                                <Skeleton class="h-6 w-40" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Skeleton Sections -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div v-for="i in 2" :key="i" class="bg-card text-card-foreground rounded-xl border-0 shadow-sm">
                <div class="p-6">
                    <Skeleton class="h-6 w-40 mb-4" />
                    <div class="space-y-4">
                        <div v-for="j in 4" :key="j" class="flex justify-between">
                            <Skeleton class="h-4 w-24" />
                            <Skeleton class="h-4 w-32" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div v-else-if="!employee" class="text-center py-12">
        <h2 class="text-xl font-semibold">Pegawai tidak ditemukan</h2>
        <button @click="router.back()"
            class="mt-4 px-4 py-2 hover:bg-accent hover:text-accent-foreground rounded-lg font-medium transition-colors">Kembali</button>
    </div>

    <div v-else class="space-y-6">
        <!-- Header -->
        <div class="flex items-center gap-4">
            <button @click="router.back()"
                class="p-2 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors">
                <ArrowLeftIcon class="w-6 h-6" />
            </button>
            <div class="flex-1">
                <h1 class="text-2xl font-bold">{{ employee.name }}</h1>
                <p class="text-muted-foreground">{{ employee.nip || '-' }}</p>
            </div>
            <button
                class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2 font-medium transition-colors shadow-sm">
                <PencilSquareIcon class="w-5 h-5" />
                Edit
            </button>
        </div>

        <!-- Main Info Card -->
        <div class="bg-card text-card-foreground rounded-xl border-0 shadow-sm">
            <div class="p-6">
                <div class="flex flex-col md:flex-row gap-6">
                    <!-- Photo -->
                    <div class="w-32 h-32 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <UserIcon class="w-16 h-16 text-muted-foreground/30" />
                    </div>

                    <!-- Basic Info -->
                    <div class="flex-1 space-y-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <div>
                                <label class="text-xs text-muted-foreground uppercase font-bold">Jabatan</label>
                                <div class="font-medium flex items-center gap-2">
                                    <BriefcaseIcon class="w-4 h-4 text-primary" />
                                    {{ employee.position }}
                                    <span v-if="employee.classAssigned"
                                        class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                        {{ employee.classAssigned }}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label class="text-xs text-muted-foreground uppercase font-bold">Tipe
                                    Kepegawaian</label>
                                <div class="font-medium">{{ employee.type }}</div>
                            </div>
                            <div>
                                <label class="text-xs text-muted-foreground uppercase font-bold">Status</label>
                                <div class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    :class="employee.status === 'Aktif' ? 'border-transparent bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'border-transparent bg-rose-100 text-rose-700 hover:bg-rose-200'">
                                    {{ employee.status }}
                                </div>
                            </div>
                            <div>
                                <label class="text-xs text-muted-foreground uppercase font-bold">Bergabung Sejak</label>
                                <div class="font-medium">{{ employee.joinDate || '-' }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Detail Tabs / Sections -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Personal Info -->
            <div class="bg-card text-card-foreground rounded-xl border-0 shadow-sm">
                <div class="p-6">
                    <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
                        <UserIcon class="w-5 h-5 text-primary" />
                        Informasi Pribadi
                    </h3>
                    <div class="space-y-3">
                        <div class="grid grid-cols-2">
                            <span class="text-muted-foreground text-sm">NIK</span>
                            <span class="font-medium">{{ employee.nik || '-' }}</span>
                        </div>
                        <div class="grid grid-cols-2">
                            <span class="text-muted-foreground text-sm">Jenis Kelamin</span>
                            <span class="font-medium">{{ employee.gender || '-' }}</span>
                        </div>
                        <div class="grid grid-cols-2">
                            <span class="text-muted-foreground text-sm">Tempat, Tgl Lahir</span>
                            <span class="font-medium">
                                {{ employee.birthPlace }}, {{ employee.birthDate }}
                            </span>
                        </div>
                        <div class="grid grid-cols-2">
                            <span class="text-muted-foreground text-sm">Agama</span>
                            <span class="font-medium">{{ employee.religion || '-' }}</span>
                        </div>
                        <div class="grid grid-cols-2">
                            <span class="text-muted-foreground text-sm">Pendidikan</span>
                            <span class="font-medium flex items-center gap-2">
                                <AcademicCapIcon class="w-4 h-4 text-muted-foreground/40" />
                                {{ employee.education || '-' }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Contact & Address -->
            <div class="bg-card text-card-foreground rounded-xl border-0 shadow-sm">
                <div class="p-6">
                    <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
                        <MapPinIcon class="w-5 h-5 text-primary" />
                        Kontak & Alamat
                    </h3>
                    <div class="space-y-4">
                        <div class="flex items-start gap-3">
                            <EnvelopeIcon class="w-5 h-5 text-muted-foreground/40 mt-0.5" />
                            <div>
                                <div class="text-xs text-muted-foreground">Email</div>
                                <div class="font-medium">{{ employee.email }}</div>
                            </div>
                        </div>
                        <div class="flex items-start gap-3">
                            <PhoneIcon class="w-5 h-5 text-muted-foreground/40 mt-0.5" />
                            <div>
                                <div class="text-xs text-muted-foreground">Telepon</div>
                                <div class="font-medium">{{ employee.phone }}</div>
                            </div>
                        </div>
                        <div class="h-px w-full bg-border/50 my-2"></div>
                        <div class="flex items-start gap-3">
                            <MapPinIcon class="w-5 h-5 text-muted-foreground/40 mt-0.5" />
                            <div>
                                <div class="text-xs text-muted-foreground">Alamat</div>
                                <div class="font-medium">{{ employee.address || '-' }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
