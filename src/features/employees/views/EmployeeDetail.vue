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
        <div class="card bg-base-100 shadow-sm border border-base-200">
            <div class="card-body">
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
            <div v-for="i in 2" :key="i" class="card bg-base-100 shadow-sm border border-base-200">
                <div class="card-body">
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
        <button @click="router.back()" class="btn btn-ghost mt-4">Kembali</button>
    </div>

    <div v-else class="space-y-6">
        <!-- Header -->
        <div class="flex items-center gap-4">
            <button @click="router.back()" class="btn btn-circle btn-ghost">
                <ArrowLeftIcon class="w-6 h-6" />
            </button>
            <div class="flex-1">
                <h1 class="text-2xl font-bold">{{ employee.name }}</h1>
                <p class="text-base-content/60">{{ employee.nip || '-' }}</p>
            </div>
            <button class="btn btn-primary gap-2">
                <PencilSquareIcon class="w-5 h-5" />
                Edit
            </button>
        </div>

        <!-- Main Info Card -->
        <div class="card bg-base-100 shadow-sm border border-base-200">
            <div class="card-body">
                <div class="flex flex-col md:flex-row gap-6">
                    <!-- Photo -->
                    <div class="w-32 h-32 rounded-full bg-base-200 flex items-center justify-center shrink-0">
                        <UserIcon class="w-16 h-16 text-base-content/30" />
                    </div>

                    <!-- Basic Info -->
                    <div class="flex-1 space-y-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <div>
                                <label class="text-xs text-base-content/50 uppercase font-bold">Jabatan</label>
                                <div class="font-medium flex items-center gap-2">
                                    <BriefcaseIcon class="w-4 h-4 text-primary" />
                                    {{ employee.position }}
                                    <span v-if="employee.classAssigned" class="badge badge-sm badge-secondary">
                                        {{ employee.classAssigned }}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label class="text-xs text-base-content/50 uppercase font-bold">Tipe Kepegawaian</label>
                                <div class="font-medium">{{ employee.type }}</div>
                            </div>
                            <div>
                                <label class="text-xs text-base-content/50 uppercase font-bold">Status</label>
                                <div class="badge"
                                    :class="employee.status === 'Aktif' ? 'badge-success' : 'badge-error'">
                                    {{ employee.status }}
                                </div>
                            </div>
                            <div>
                                <label class="text-xs text-base-content/50 uppercase font-bold">Bergabung Sejak</label>
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
            <div class="card bg-base-100 shadow-sm border border-base-200">
                <div class="card-body">
                    <h3 class="card-title text-lg mb-4 flex items-center gap-2">
                        <UserIcon class="w-5 h-5 text-primary" />
                        Informasi Pribadi
                    </h3>
                    <div class="space-y-3">
                        <div class="grid grid-cols-2">
                            <span class="text-base-content/60 text-sm">NIK</span>
                            <span class="font-medium">{{ employee.nik || '-' }}</span>
                        </div>
                        <div class="grid grid-cols-2">
                            <span class="text-base-content/60 text-sm">Jenis Kelamin</span>
                            <span class="font-medium">{{ employee.gender || '-' }}</span>
                        </div>
                        <div class="grid grid-cols-2">
                            <span class="text-base-content/60 text-sm">Tempat, Tgl Lahir</span>
                            <span class="font-medium">
                                {{ employee.birthPlace }}, {{ employee.birthDate }}
                            </span>
                        </div>
                        <div class="grid grid-cols-2">
                            <span class="text-base-content/60 text-sm">Agama</span>
                            <span class="font-medium">{{ employee.religion || '-' }}</span>
                        </div>
                        <div class="grid grid-cols-2">
                            <span class="text-base-content/60 text-sm">Pendidikan</span>
                            <span class="font-medium flex items-center gap-2">
                                <AcademicCapIcon class="w-4 h-4 text-base-content/40" />
                                {{ employee.education || '-' }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Contact & Address -->
            <div class="card bg-base-100 shadow-sm border border-base-200">
                <div class="card-body">
                    <h3 class="card-title text-lg mb-4 flex items-center gap-2">
                        <MapPinIcon class="w-5 h-5 text-primary" />
                        Kontak & Alamat
                    </h3>
                    <div class="space-y-4">
                        <div class="flex items-start gap-3">
                            <EnvelopeIcon class="w-5 h-5 text-base-content/40 mt-0.5" />
                            <div>
                                <div class="text-xs text-base-content/50">Email</div>
                                <div class="font-medium">{{ employee.email }}</div>
                            </div>
                        </div>
                        <div class="flex items-start gap-3">
                            <PhoneIcon class="w-5 h-5 text-base-content/40 mt-0.5" />
                            <div>
                                <div class="text-xs text-base-content/50">Telepon</div>
                                <div class="font-medium">{{ employee.phone }}</div>
                            </div>
                        </div>
                        <div class="divider my-2"></div>
                        <div class="flex items-start gap-3">
                            <MapPinIcon class="w-5 h-5 text-base-content/40 mt-0.5" />
                            <div>
                                <div class="text-xs text-base-content/50">Alamat</div>
                                <div class="font-medium">{{ employee.address || '-' }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
