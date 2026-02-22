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
    UserIcon,
    CameraIcon,
    XMarkIcon,
    CheckIcon
} from '@heroicons/vue/24/outline';
import Skeleton from '@/components/ui/skeleton/Skeleton.vue';
import api from '@/services/api';
import { Cropper } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';

const route = useRoute();
const router = useRouter();
const employee = ref(null);
const loading = ref(true);

// --- Cropper State & Logic ---
const isCropperModalOpen = ref(false);
const rawImage = ref(null);
const cropper = ref(null);
const previewImage = ref(null);
const applyingCrop = ref(false);
const fileInput = ref(null);

const triggerFileInput = () => {
    if (fileInput.value) {
        fileInput.value.click();
    }
};

const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        if (rawImage.value) URL.revokeObjectURL(rawImage.value);
        rawImage.value = URL.createObjectURL(file);
        isCropperModalOpen.value = true;
    }
    event.target.value = '';
};

const cancelCrop = () => {
    isCropperModalOpen.value = false;
    if (rawImage.value) {
        URL.revokeObjectURL(rawImage.value);
        rawImage.value = null;
    }
};

const applyCrop = async () => {
    if (cropper.value) {
        const { canvas } = cropper.value.getResult();
        if (canvas) {
            applyingCrop.value = true;
            try {
                // Konversi canvas cropper ke file Blob
                const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));

                // Gunakan FormData untuk HTTP Request
                const formData = new FormData();
                formData.append('photo', blob, 'profile.jpg');

                const response = await api.post(`/pegawai/${employee.value.id}/photo`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (response.data.success) {
                    previewImage.value = response.data.data.photo_url;
                }

                cancelCrop();
            } catch (error) {
                console.error("Gagal mengunggah foto profil", error);
                alert(error.response?.data?.message || 'Gagal menyimpan foto. Pastikan Pegawai telah terintegrasi dengan akun User.');
            } finally {
                applyingCrop.value = false;
            }
        }
    }
};

const fetchEmployee = async () => {
    loading.value = true;
    try {
        const id = route.params.id;
        const response = await api.get(`/pegawai/${id}`);
        // Endpoint show mengembalikan { success: true, message: ..., data: {...} }
        employee.value = response.data.data;

        if (employee.value?.user?.avatar) {
            // avatar is now a base64 Data URL string from DB
            previewImage.value = employee.value.user.avatar;
        } else {
            previewImage.value = null;
        }
    } catch (error) {
        console.error('Failed to fetch employee', error);
        employee.value = null;
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchEmployee();
});
</script>

<template>
    <div>
        <div v-if="loading" class="space-y-6">
            <!-- Skeleton Header -->
            <div class="flex items-center gap-4">
                <Skeleton class="h-10 w-10 rounded-lg" />
                <div class="flex-1 space-y-2">
                    <Skeleton class="h-8 w-64" />
                    <Skeleton class="h-4 w-32" />
                </div>
                <Skeleton class="h-10 w-32 rounded-lg" />
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div class="lg:col-span-4 bg-white/60 dark:bg-slate-900/60 rounded-xl p-8 border border-border/50">
                    <Skeleton class="w-32 h-32 md:w-40 md:h-40 rounded-xl mx-auto" />
                    <Skeleton class="h-6 w-48 mt-4 mx-auto" />
                    <Skeleton class="h-4 w-32 mt-2 mx-auto" />
                </div>
                <div class="lg:col-span-8 bg-white/60 dark:bg-slate-900/60 rounded-xl p-8 border border-border/50 h-64">
                    <div class="space-y-4">
                        <Skeleton class="h-6 w-48" />
                        <Skeleton class="h-4 w-full" />
                        <Skeleton class="h-4 w-3/4" />
                    </div>
                </div>
            </div>
        </div>

        <div v-else-if="!employee"
            class="text-center py-20 bg-primary/[0.01] border-2 border-dashed border-primary/10 rounded-xl animate-fade-in mt-6">
            <UserIcon class="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 class="text-xl font-black text-foreground tracking-tight mb-1">Pegawai tidak ditemukan</h3>
            <p class="text-muted-foreground text-sm font-medium mt-1 max-w-sm mx-auto">
                Data pegawai yang Anda cari mungkin telah dihapus atau ID tidak valid.
            </p>
            <button @click="router.push('/admin/employees')"
                class="mt-6 px-6 py-2.5 rounded-lg border-2 border-primary/10 hover:border-primary/30 hover:bg-primary/5 text-primary font-bold transition-all active:scale-95 inline-flex items-center gap-2">
                <ArrowLeftIcon class="w-4 h-4" /> Kembali
            </button>
        </div>

        <div v-else class="space-y-6 animate-in fade-in duration-500">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="flex items-center gap-4">
                    <button @click="router.push('/admin/employees')"
                        class="p-2.5 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-border/50 rounded-lg transition-all shadow-sm">
                        <ArrowLeftIcon class="w-5 h-5 text-foreground" />
                    </button>
                    <div>
                        <h1 class="text-2xl sm:text-3xl font-black text-foreground tracking-tight">{{ employee.name }}
                        </h1>
                        <div class="flex items-center gap-2 mt-1 w-full overflow-x-auto pb-1">
                            <span
                                class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-border">NIP:
                                {{ employee.nip || '-' }}</span>
                            <span
                                class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-border">NIK:
                                {{ employee.nik || '-' }}</span>
                        </div>
                    </div>
                </div>
                <button
                    class="px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 whitespace-nowrap">
                    <PencilSquareIcon class="w-5 h-5" />
                    Edit Profil
                </button>
            </div>

            <!-- Modern Minimalist Content -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <!-- Left Column: ID Card / Profile Summary (lg:col-span-4) -->
                <div
                    class="lg:col-span-4 bg-white dark:bg-slate-900 border border-border/60 rounded-xl p-8 shadow-sm flex flex-col items-center text-center relative hover:shadow-md transition-all">


                    <!-- Editable Photo (Cropper) -->
                    <div class="relative w-32 h-32 md:w-40 md:h-40 mb-5 group">
                        <div
                            class="w-full h-full rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex items-center justify-center relative">
                            <img v-if="previewImage" :src="previewImage" class="w-full h-full object-cover"
                                alt="Profile" />
                            <UserIcon v-else class="w-16 h-16 text-slate-400 dark:text-slate-500" />

                            <!-- Overlay edit -->
                            <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm cursor-pointer"
                                @click="triggerFileInput">
                                <div class="flex flex-col items-center text-white">
                                    <CameraIcon class="w-8 h-8 mb-1" />
                                    <span class="text-[10px] uppercase tracking-widest font-bold">Ubah Foto</span>
                                </div>
                            </div>
                        </div>
                        <!-- Hidden input file -->
                        <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="handleFileChange" />
                    </div>

                    <h2 class="text-xl font-black text-foreground tracking-tight mb-1">{{ employee.name }}</h2>
                    <div class="flex items-center gap-2 mb-4 justify-center">
                        <p class="text-primary font-bold text-sm">{{ employee.position }}</p>
                        <span class="w-1 h-1 rounded-full bg-border/80"></span>
                        <span
                            class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider"
                            :class="employee.status === 'Aktif' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' : 'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800'">
                            <span class="w-1.5 h-1.5 rounded-sm"
                                :class="employee.status === 'Aktif' ? 'bg-emerald-500' : 'bg-rose-500'"></span>
                            {{ employee.status }}
                        </span>
                    </div>

                    <div class="w-full h-px bg-border/60 my-4"></div>

                    <div class="w-full space-y-3 text-left">
                        <div class="flex items-center justify-between">
                            <span class="text-muted-foreground text-xs uppercase font-bold tracking-wider">Tipe</span>
                            <span class="text-sm font-semibold text-foreground">{{ employee.type }}</span>
                        </div>
                        <div class="flex items-center justify-between" v-if="employee.classAssigned">
                            <span class="text-muted-foreground text-xs uppercase font-bold tracking-wider">Wali
                                Kelas</span>
                            <span class="text-sm font-semibold text-foreground">{{ employee.classAssigned }}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span
                                class="text-muted-foreground text-xs uppercase font-bold tracking-wider">Bergabung</span>
                            <span class="text-sm font-semibold text-foreground">{{ employee.join_date ? new
                                Date(employee.join_date).getFullYear() : '-' }}</span>
                        </div>
                    </div>
                </div>

                <!-- Right Column: Detail Information (lg:col-span-8) -->
                <div class="lg:col-span-8 space-y-6">
                    <!-- Personal Info -->
                    <div
                        class="bg-white dark:bg-slate-900 border border-border/60 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
                        <div class="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
                            <div class="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-foreground">
                                <UserIcon class="w-5 h-5" />
                            </div>
                            <h3 class="text-lg font-black text-foreground">Informasi Pribadi</h3>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                            <div class="space-y-1">
                                <div class="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                                    Tempat,
                                    Tanggal Lahir</div>
                                <div class="font-medium text-foreground text-sm flex items-center gap-2">
                                    {{ employee.birth_place }}, {{ employee.birth_date ? new
                                        Date(employee.birth_date).toLocaleDateString('id-ID', {
                                            year: 'numeric', month: 'long',
                                            day: 'numeric'
                                        }) : '-' }}
                                </div>
                            </div>
                            <div class="space-y-1">
                                <div class="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Jenis
                                    Kelamin
                                </div>
                                <div class="font-medium text-foreground text-sm">{{ employee.gender || '-' }}</div>
                            </div>
                            <div class="space-y-1">
                                <div class="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Agama
                                </div>
                                <div class="font-medium text-foreground text-sm">{{ employee.religion || '-' }}</div>
                            </div>
                            <div class="space-y-1">
                                <div class="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                                    Pendidikan
                                    Terakhir</div>
                                <div class="font-medium text-foreground text-sm">{{ employee.education || '-' }}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Contact Info -->
                    <div
                        class="bg-white dark:bg-slate-900 border border-border/60 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
                        <div class="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
                            <div class="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-foreground">
                                <PhoneIcon class="w-5 h-5" />
                            </div>
                            <h3 class="text-lg font-black text-foreground">Kontak & Alamat</h3>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                            <div class="space-y-1 md:col-span-2">
                                <div class="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                                    Alamat
                                    Lengkap
                                    Asal</div>
                                <div class="font-medium text-foreground text-sm leading-relaxed">{{ employee.address ||
                                    '-'
                                    }}</div>
                            </div>
                            <div class="space-y-1">
                                <div
                                    class="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-1.5">
                                    <EnvelopeIcon class="w-3.5 h-3.5" /> Email
                                </div>
                                <div class="font-medium text-foreground text-sm">{{ employee.email || '-' }}</div>
                            </div>
                            <div class="space-y-1">
                                <div
                                    class="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-1.5">
                                    <PhoneIcon class="w-3.5 h-3.5" /> Phone / WA
                                </div>
                                <div class="font-medium text-foreground text-sm">{{ employee.phone || '-' }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Cropper Modal Component -->
        <div v-if="isCropperModalOpen"
            class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div class="bg-card w-full max-w-2xl rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
                <div class="px-6 py-4 border-b border-border/50 flex items-center justify-between">
                    <h3 class="text-lg font-black text-foreground">Sesuaikan Foto Profil</h3>
                    <button @click="cancelCrop"
                        class="p-1.5 text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground rounded-lg transition-colors">
                        <XMarkIcon class="w-5 h-5" />
                    </button>
                </div>

                <div class="flex-1 bg-slate-900 overflow-hidden relative" style="min-height: 300px; max-height: 60vh;">
                    <Cropper ref="cropper" :src="rawImage" :stencil-props="{ aspectRatio: 1 }"
                        image-restriction="stencil" class="h-full w-full" />
                </div>

                <div class="px-6 py-4 bg-muted/30 border-t border-border/50 flex items-center justify-end gap-3">
                    <button @click="cancelCrop" :disabled="applyingCrop"
                        class="px-5 py-2 text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50">
                        Batal
                    </button>
                    <button @click="applyCrop" :disabled="applyingCrop"
                        class="px-5 py-2 text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-50">
                        <span v-if="applyingCrop"
                            class="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin"></span>
                        <CheckIcon v-else class="w-4 h-4" />
                        {{ applyingCrop ? 'Menyimpan...' : 'Simpan Foto' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
