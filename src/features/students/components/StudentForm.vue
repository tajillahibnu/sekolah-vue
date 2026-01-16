<script setup>
import { ref, computed, watch } from 'vue';
import {
    UserIcon,
    AcademicCapIcon,
    UsersIcon,
    TrophyIcon,
    XMarkIcon,
    PlusIcon,
    CheckCircleIcon
} from '@heroicons/vue/24/outline';
import Button from '@/components/ui/button/Button.vue';
import FormInput from '@/components/ui/form/FormInput.vue';
import FormSelect from '@/components/ui/form/FormSelect.vue';
import FormCombobox from '@/components/ui/form/FormCombobox.vue';
import FormTextarea from '@/components/ui/form/FormTextarea.vue';
import FormDatePicker from '@/components/ui/form/FormDatePicker.vue';

const props = defineProps({
    modelValue: {
        type: Object,
        default: null
    },
    mode: {
        type: String,
        default: 'create',
        validator: (value) => ['create', 'edit'].includes(value)
    }
});

const emit = defineEmits(['submit', 'cancel', 'update:modelValue']);

// Active tab
const activeTab = ref('personal');

// Form data
const formData = ref({
    nis: '',
    nisn: '',
    name: '',
    email: '',
    gender: 'L',
    birthPlace: '',
    birthDate: '',
    religion: 'Islam',
    address: '',
    phone: '',
    class: '10A',
    academicYear: '2024/2025',
    status: 'active',
    joinDate: new Date().toISOString().split('T')[0],
    parent: {
        father: {
            name: '',
            phone: '',
            occupation: ''
        },
        mother: {
            name: '',
            phone: '',
            occupation: ''
        }
    },
    academic: {
        previousSchool: '',
        entryScore: '',
        achievements: []
    }
});

// New achievement input
const newAchievement = ref('');

// Validation errors
const errors = ref({});

// Watch for modelValue changes (edit mode)
watch(() => props.modelValue, (newValue) => {
    if (newValue) {
        formData.value = { ...newValue };
    }
}, { immediate: true, deep: true });

// Validate form
const validateForm = () => {
    errors.value = {};

    // Personal data validation
    if (!formData.value.nis) errors.value.nis = 'NIS wajib diisi';
    if (!formData.value.nisn) errors.value.nisn = 'NISN wajib diisi';
    if (!formData.value.name) errors.value.name = 'Nama wajib diisi';
    if (!formData.value.email) {
        errors.value.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
        errors.value.email = 'Format email tidak valid';
    }
    if (!formData.value.birthPlace) errors.value.birthPlace = 'Tempat lahir wajib diisi';
    if (!formData.value.birthDate) errors.value.birthDate = 'Tanggal lahir wajib diisi';
    if (!formData.value.address) errors.value.address = 'Alamat wajib diisi';
    if (!formData.value.phone) {
        errors.value.phone = 'Telepon wajib diisi';
    } else if (!/^08\d{8,11}$/.test(formData.value.phone)) {
        errors.value.phone = 'Format telepon tidak valid (contoh: 081234567890)';
    }

    // Academic validation
    if (!formData.value.academic.previousSchool) {
        errors.value.previousSchool = 'Sekolah asal wajib diisi';
    }
    if (!formData.value.academic.entryScore) {
        errors.value.entryScore = 'Nilai masuk wajib diisi';
    } else if (formData.value.academic.entryScore < 0 || formData.value.academic.entryScore > 100) {
        errors.value.entryScore = 'Nilai harus antara 0-100';
    }

    // Parent validation
    if (!formData.value.parent.father.name) {
        errors.value.fatherName = 'Nama ayah wajib diisi';
    }
    if (!formData.value.parent.mother.name) {
        errors.value.motherName = 'Nama ibu wajib diisi';
    }

    return Object.keys(errors.value).length === 0;
};

// Add achievement
const addAchievement = () => {
    if (newAchievement.value.trim()) {
        formData.value.academic.achievements.push(newAchievement.value.trim());
        newAchievement.value = '';
    }
};

// Remove achievement
const removeAchievement = (index) => {
    formData.value.academic.achievements.splice(index, 1);
};

// Handle submit
const handleSubmit = () => {
    if (validateForm()) {
        const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.value.name)}&background=${getRandomColor()}&color=fff`;

        const submitData = {
            ...formData.value,
            avatar
        };

        emit('submit', submitData);
    } else {
        // Switch to tab with error
        if (errors.value.nis || errors.value.nisn || errors.value.name || errors.value.email ||
            errors.value.birthPlace || errors.value.birthDate || errors.value.address || errors.value.phone) {
            activeTab.value = 'personal';
        } else if (errors.value.previousSchool || errors.value.entryScore) {
            activeTab.value = 'academic';
        } else if (errors.value.fatherName || errors.value.motherName) {
            activeTab.value = 'parent';
        }
    }
};

// Handle cancel
const handleCancel = () => {
    emit('cancel');
};

// Get random color for avatar
const getRandomColor = () => {
    const colors = [
        '0D8ABC', '6366F1', '10B981', 'F59E0B', '8B5CF6',
        'EC4899', 'EF4444', '14B8A6', '3B82F6', 'A855F7'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
};

// Tab configuration
const tabs = [
    { id: 'personal', label: 'Data Pribadi', icon: UserIcon, color: 'text-blue-500' },
    { id: 'academic', label: 'Data Akademik', icon: AcademicCapIcon, color: 'text-green-500' },
    { id: 'parent', label: 'Data Orang Tua', icon: UsersIcon, color: 'text-purple-500' },
    { id: 'achievements', label: 'Prestasi', icon: TrophyIcon, color: 'text-yellow-500' }
];

// Options
const genderOptions = [
    { value: 'L', label: 'Laki-laki' },
    { value: 'P', label: 'Perempuan' }
];


const classOptions = ['10A', '10B', '11A', '11B', '12A', '12B'];

const statusOptions = [
    { value: 'active', label: 'Aktif' },
    { value: 'inactive', label: 'Nonaktif' },
    { value: 'graduated', label: 'Lulus' },
    { value: 'transferred', label: 'Pindah' }
];

// Check if tab is completed
const isTabCompleted = computed(() => {
    return {
        personal: formData.value.nis && formData.value.nisn && formData.value.name && formData.value.email,
        academic: formData.value.academic.previousSchool && formData.value.academic.entryScore,
        parent: formData.value.parent.father.name && formData.value.parent.mother.name,
        achievements: true
    };
});
</script>

<template>
    <div class="space-y-6">
        <!-- Enhanced Tabs -->
        <div class="border-b border-border">
            <div class="flex space-x-1 overflow-x-auto">
                <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
                    class="flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all relative whitespace-nowrap"
                    :class="[
                        activeTab === tab.id
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    ]">
                    <component :is="tab.icon" class="w-4 h-4" :class="tab.color" />
                    <span class="hidden sm:inline">{{ tab.label }}</span>
                    <CheckCircleIcon v-if="isTabCompleted[tab.id]" class="w-4 h-4 text-green-500" />
                </button>
            </div>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Personal Data Tab -->
            <div v-show="activeTab === 'personal'" class="space-y-6 animate-in fade-in duration-300">
                <div class="bg-card border border-border rounded-lg p-6 space-y-6">
                    <div class="flex items-center gap-3 pb-4 border-b border-border">
                        <div class="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                            <UserIcon class="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 class="font-semibold text-lg">Informasi Pribadi</h3>
                            <p class="text-sm text-muted-foreground">Data identitas siswa</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput v-model="formData.nis" label="NIS" placeholder="Nomor Induk Siswa" :required="true"
                            :error="errors.nis" />

                        <FormInput v-model="formData.nisn" label="NISN" placeholder="Nomor Induk Siswa Nasional"
                            :required="true" :error="errors.nisn" />

                        <div class="md:col-span-2">
                            <FormInput v-model="formData.name" label="Nama Lengkap" placeholder="Nama lengkap siswa"
                                :required="true" :error="errors.name" />
                        </div>

                        <div class="md:col-span-2">
                            <FormInput v-model="formData.email" label="Email" type="email"
                                placeholder="email@student.sekolah.id" :required="true" :error="errors.email" />
                        </div>

                        <FormSelect v-model="formData.gender" label="Jenis Kelamin" :options="genderOptions"
                            :required="true" />

                        <FormCombobox v-model="formData.religion" label="Agama" api-url="/references/religions"
                            :required="true" placeholder="Pilih Agama" search-placeholder="Cari agama..." />

                        <FormInput v-model="formData.birthPlace" label="Tempat Lahir" placeholder="Kota kelahiran"
                            :required="true" :error="errors.birthPlace" />

                        <FormDatePicker v-model="formData.birthDate" label="Tanggal Lahir"
                            placeholder="Pilih tanggal lahir" :required="true" :error="errors.birthDate" />

                        <FormInput v-model="formData.phone" label="Telepon" type="tel" placeholder="081234567890"
                            :required="true" :error="errors.phone" />

                        <div class="md:col-span-2">
                            <FormTextarea v-model="formData.address" label="Alamat" placeholder="Alamat lengkap"
                                :required="true" :rows="3" :error="errors.address" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Academic Data Tab -->
            <div v-show="activeTab === 'academic'" class="space-y-6 animate-in fade-in duration-300">
                <div class="bg-card border border-border rounded-lg p-6 space-y-6">
                    <div class="flex items-center gap-3 pb-4 border-b border-border">
                        <div class="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                            <AcademicCapIcon class="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <h3 class="font-semibold text-lg">Informasi Akademik</h3>
                            <p class="text-sm text-muted-foreground">Data pendidikan siswa</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormCombobox v-model="formData.class" label="Kelas"
                            :options="classOptions.map(c => ({ value: c, label: `Kelas ${c}` }))" :required="true"
                            placeholder="Pilih Kelas" search-placeholder="Cari kelas..." />

                        <FormInput v-model="formData.academicYear" label="Tahun Ajaran" placeholder="2024/2025"
                            :required="true" />

                        <FormSelect v-model="formData.status" label="Status" :options="statusOptions"
                            :required="true" />

                        <FormDatePicker v-model="formData.joinDate" label="Tanggal Masuk"
                            placeholder="Pilih tanggal masuk" :required="true" />

                        <div class="md:col-span-2">
                            <FormInput v-model="formData.academic.previousSchool" label="Sekolah Asal"
                                placeholder="Nama sekolah asal" :required="true" :error="errors.previousSchool" />
                        </div>

                        <FormInput v-model.number="formData.academic.entryScore" label="Nilai Masuk" type="number"
                            placeholder="0-100" :required="true" :error="errors.entryScore" />
                    </div>
                </div>
            </div>

            <!-- Parent Data Tab -->
            <div v-show="activeTab === 'parent'" class="space-y-6 animate-in fade-in duration-300">
                <!-- Father Data -->
                <div class="bg-card border border-border rounded-lg p-6 space-y-6">
                    <div class="flex items-center gap-3 pb-4 border-b border-border">
                        <div class="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                            <UsersIcon class="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h3 class="font-semibold text-lg">Data Ayah</h3>
                            <p class="text-sm text-muted-foreground">Informasi orang tua (Ayah)</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="md:col-span-2">
                            <FormInput v-model="formData.parent.father.name" label="Nama Ayah"
                                placeholder="Nama lengkap ayah" :required="true" :error="errors.fatherName" />
                        </div>

                        <FormInput v-model="formData.parent.father.phone" label="Telepon Ayah" type="tel"
                            placeholder="081234567890" />

                        <FormInput v-model="formData.parent.father.occupation" label="Pekerjaan Ayah"
                            placeholder="Pekerjaan" />
                    </div>
                </div>

                <!-- Mother Data -->
                <div class="bg-card border border-border rounded-lg p-6 space-y-6">
                    <div class="flex items-center gap-3 pb-4 border-b border-border">
                        <div class="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                            <UsersIcon class="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h3 class="font-semibold text-lg">Data Ibu</h3>
                            <p class="text-sm text-muted-foreground">Informasi orang tua (Ibu)</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="md:col-span-2">
                            <FormInput v-model="formData.parent.mother.name" label="Nama Ibu"
                                placeholder="Nama lengkap ibu" :required="true" :error="errors.motherName" />
                        </div>

                        <FormInput v-model="formData.parent.mother.phone" label="Telepon Ibu" type="tel"
                            placeholder="081234567890" />

                        <FormInput v-model="formData.parent.mother.occupation" label="Pekerjaan Ibu"
                            placeholder="Pekerjaan" />
                    </div>
                </div>
            </div>

            <!-- Achievements Tab -->
            <div v-show="activeTab === 'achievements'" class="space-y-6 animate-in fade-in duration-300">
                <div class="bg-card border border-border rounded-lg p-6 space-y-6">
                    <div class="flex items-center gap-3 pb-4 border-b border-border">
                        <div class="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                            <TrophyIcon class="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                            <h3 class="font-semibold text-lg">Prestasi Siswa</h3>
                            <p class="text-sm text-muted-foreground">Daftar prestasi dan penghargaan</p>
                        </div>
                    </div>

                    <div class="space-y-4">
                        <div class="flex gap-2">
                            <input v-model="newAchievement" type="text"
                                placeholder="Contoh: Juara 1 Olimpiade Matematika Tingkat Kota"
                                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                @keyup.enter="addAchievement" />
                            <Button type="button" @click="addAchievement" size="icon">
                                <PlusIcon class="w-5 h-5" />
                            </Button>
                        </div>

                        <!-- Achievements List -->
                        <div v-if="formData.academic.achievements.length > 0" class="space-y-3">
                            <div v-for="(achievement, index) in formData.academic.achievements" :key="index"
                                class="group flex items-start gap-3 p-4 bg-muted/50 hover:bg-muted rounded-lg transition-colors border border-border">
                                <div class="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex-shrink-0">
                                    <TrophyIcon class="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                                </div>
                                <p class="flex-1 text-sm pt-2">{{ achievement }}</p>
                                <Button type="button" variant="ghost" size="icon" @click="removeAchievement(index)"
                                    class="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <XMarkIcon class="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div v-else class="text-center py-12">
                            <div class="inline-flex p-4 bg-muted rounded-full mb-4">
                                <TrophyIcon class="w-12 h-12 text-muted-foreground/50" />
                            </div>
                            <p class="text-muted-foreground">Belum ada prestasi ditambahkan</p>
                            <p class="text-sm text-muted-foreground mt-1">Tambahkan prestasi siswa menggunakan form di
                                atas</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Form Actions -->
            <div class="flex justify-between items-center pt-6 border-t border-border">
                <p class="text-sm text-muted-foreground">
                    <span class="text-destructive">*</span> Field wajib diisi
                </p>
                <div class="flex gap-3">
                    <Button type="button" variant="outline" @click="handleCancel">
                        Batal
                    </Button>
                    <Button type="submit">
                        {{ mode === 'create' ? 'Tambah Siswa' : 'Simpan Perubahan' }}
                    </Button>
                </div>
            </div>
        </form>
    </div>
</template>

<style scoped>
@keyframes fade-in {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-in {
    animation: fade-in 0.3s ease-out;
}
</style>
