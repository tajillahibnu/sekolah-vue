<script setup>
import { ref, computed, watch } from 'vue';
import {
    UserIcon,
    AcademicCapIcon,
    UsersIcon,
    TrophyIcon,
    XMarkIcon,
    PlusIcon,
    CheckCircleIcon,
    IdentificationIcon,
    MapPinIcon,
    BriefcaseIcon,
    PhoneIcon,
    EnvelopeIcon,
    GlobeAltIcon,
    CalendarDaysIcon,
    HeartIcon,
    ArrowRightIcon,
    ArrowLeftIcon,
    HomeIcon,
    SparklesIcon,
    BookmarkIcon,
    GlobeAsiaAustraliaIcon
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
    { id: 'personal', label: 'Identitas', icon: UserIcon, color: 'text-blue-500', step: 1, subtitle: 'Data Diri Siswa' },
    { id: 'academic', label: 'Akademik', icon: AcademicCapIcon, color: 'text-emerald-500', step: 2, subtitle: 'Sekolah & Status' },
    { id: 'parent', label: 'Keluarga', icon: UsersIcon, color: 'text-purple-500', step: 3, subtitle: 'Data Orang Tua' },
    { id: 'achievements', label: 'Prestasi', icon: TrophyIcon, color: 'text-amber-500', step: 4, subtitle: 'Catatan Khusus' }
];

const nextTab = () => {
    const currentIndex = tabs.findIndex(t => t.id === activeTab.value);
    if (currentIndex < tabs.length - 1) {
        activeTab.value = tabs[currentIndex + 1].id;
    }
};

const prevTab = () => {
    const currentIndex = tabs.findIndex(t => t.id === activeTab.value);
    if (currentIndex > 0) {
        activeTab.value = tabs[currentIndex - 1].id;
    }
};

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
    <div class="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-12">
        <!-- Vertical Stepper Sidebar -->
        <div class="space-y-10 py-6 px-6 md:pr-8 bg-primary/[0.015] rounded-3xl border border-primary/5">
            <div class="flex flex-col gap-6">
                <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
                    class="flex items-center gap-4 transition-all duration-300 group text-left relative"
                    :class="[activeTab === tab.id ? 'translate-x-2' : 'opacity-60 hover:opacity-100']">

                    <!-- Vertical Line Connector (between steps) -->
                    <div v-if="tab.step < tabs.length"
                        class="absolute left-6 top-10 w-0.5 h-8 bg-primary/5 -translate-x-1/2"></div>

                    <!-- Step Indicator -->
                    <div class="flex items-center justify-center w-12 h-12 rounded-2xl border-2 transition-all shrink-0"
                        :class="activeTab === tab.id
                            ? 'bg-primary border-primary shadow-2xl shadow-primary/40'
                            : isTabCompleted[tab.id]
                                ? 'bg-emerald-50 border-emerald-500/30'
                                : 'bg-background border-primary/10'">
                        <CheckCircleIcon v-if="isTabCompleted[tab.id] && activeTab !== tab.id"
                            class="w-6 h-6 text-emerald-500" />
                        <span v-else class="text-sm font-black"
                            :class="activeTab === tab.id ? 'text-white' : 'text-primary'">{{ tab.step }}</span>
                    </div>

                    <div class="flex flex-col">
                        <span class="text-xs font-black tracking-tight"
                            :class="activeTab === tab.id ? 'text-primary' : 'text-foreground/70'">{{ tab.label
                            }}</span>
                        <span class="text-[9px] font-bold uppercase tracking-widest"
                            :class="activeTab === tab.id ? 'text-muted-foreground/40' : 'text-muted-foreground/30'">{{
                                tab.subtitle }}</span>
                    </div>
                </button>
            </div>

            <!-- Form Actions (Mobile-like sticky or bottom sidebar) -->
            <div class="pt-8 space-y-4 hidden md:block">
                <p class="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest leading-relaxed">
                    Pastikan seluruh data<br />wajib <span class="text-rose-500 font-black">*</span> telah terisi
                </p>
            </div>
        </div>

        <!-- Form Content Area -->
        <form @submit.prevent="handleSubmit" class="space-y-12">
            <!-- Personal Data Section -->
            <div v-show="activeTab === 'personal'" class="space-y-12 animate-in slide-in-from-right-4 duration-500">
                <!-- Section Header -->
                <div class="flex items-center gap-5">
                    <div
                        class="w-14 h-14 bg-blue-600 rounded-2xl text-white flex items-center justify-center shadow-lg shadow-blue-200">
                        <UserIcon class="w-7 h-7" />
                    </div>
                    <div>
                        <h3 class="font-black text-2xl tracking-tight text-foreground">Informasi Pribadi</h3>
                        <p class="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/45">Data
                            identitas utama siswa sesuai dokumen resmi</p>
                    </div>
                </div>

                <div class="space-y-12">
                    <!-- Identity Sub-section -->
                    <div class="space-y-6">
                        <div class="flex items-center gap-3">
                            <IdentificationIcon class="w-4 h-4 text-blue-500" />
                            <span class="text-[11px] font-black uppercase tracking-tight text-muted-foreground/60">Data
                                Identitas</span>
                            <div class="flex-1 h-px bg-gradient-to-r from-blue-100 to-transparent"></div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div class="grid grid-cols-2 gap-6 md:col-span-2">
                                <FormInput v-model="formData.nis" label="Nomor Induk Siswa (NIS)" placeholder="2023001"
                                    :required="true" :error="errors.nis" />
                                <FormInput v-model="formData.nisn" label="NISN (Nasional)" placeholder="0012345678"
                                    :required="true" :error="errors.nisn" />
                            </div>
                            <div class="md:col-span-2">
                                <FormInput v-model="formData.name" label="Nama Lengkap"
                                    placeholder="Nama sesuai ijazah terakhir" :required="true" :error="errors.name" />
                            </div>
                        </div>
                    </div>

                    <!-- Contact & Birth Sub-section -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-12 pt-4 border-t border-primary/5">
                        <div class="space-y-6">
                            <div class="flex items-center gap-3">
                                <EnvelopeIcon class="w-4 h-4 text-indigo-500" />
                                <span
                                    class="text-[11px] font-black uppercase tracking-tight text-muted-foreground/60">Kontak
                                    & Gender</span>
                                <div class="flex-1 h-px bg-gradient-to-r from-indigo-100 to-transparent"></div>
                            </div>
                            <div class="space-y-6">
                                <FormInput v-model="formData.email" label="Alamat Email" type="email"
                                    placeholder="student@school.id" :required="true" :error="errors.email" />
                                <FormInput v-model="formData.phone" label="Nomor WhatsApp" type="tel"
                                    placeholder="08xxxxxxxxxx" :required="true" :error="errors.phone" />
                                <FormSelect v-model="formData.gender" label="Jenis Kelamin" :options="genderOptions"
                                    :required="true" />
                            </div>
                        </div>

                        <div class="space-y-6">
                            <div class="flex items-center gap-3">
                                <CalendarDaysIcon class="w-4 h-4 text-emerald-500" />
                                <span
                                    class="text-[11px] font-black uppercase tracking-tight text-muted-foreground/60">Lahir
                                    & Agama</span>
                                <div class="flex-1 h-px bg-gradient-to-r from-emerald-100 to-transparent"></div>
                            </div>
                            <div class="space-y-6">
                                <FormCombobox v-model="formData.religion" label="Agama" api-url="/references/religions"
                                    :required="true" placeholder="Pilih Agama" />
                                <FormInput v-model="formData.birthPlace" label="Tempat Lahir"
                                    placeholder="Contoh: Jakarta" :required="true" :error="errors.birthPlace" />
                                <FormDatePicker v-model="formData.birthDate" label="Tanggal Lahir" :required="true"
                                    :error="errors.birthDate" />
                            </div>
                        </div>
                    </div>

                    <!-- Address Sub-section -->
                    <div class="space-y-6 pt-4 border-t border-primary/5">
                        <div class="flex items-center gap-3">
                            <MapPinIcon class="w-4 h-4 text-rose-500" />
                            <span
                                class="text-[11px] font-black uppercase tracking-tight text-muted-foreground/60">Alamat
                                Tempat Tinggal</span>
                            <div class="flex-1 h-px bg-gradient-to-r from-rose-100 to-transparent"></div>
                        </div>
                        <FormTextarea v-model="formData.address" label="Alamat Sesuai KTP/KK"
                            placeholder="Tuliskan alamat lengkap secara detail..." :required="true" :rows="3"
                            :error="errors.address" />
                    </div>
                </div>

                <!-- Navigation -->
                <div class="flex justify-end pt-10">
                    <button type="button" @click="nextTab"
                        class="px-10 py-5 bg-blue-600 text-white font-black text-xs rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-3">
                        Lanjut ke Akademik
                        <div class="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                            <ArrowRightIcon class="w-3 h-3" />
                        </div>
                    </button>
                </div>
            </div>

            <!-- Academic Data Section -->
            <div v-show="activeTab === 'academic'" class="space-y-12 animate-in slide-in-from-right-4 duration-500">
                <!-- Section Header -->
                <div class="flex items-center gap-5">
                    <div
                        class="w-14 h-14 bg-emerald-600 rounded-2xl text-white flex items-center justify-center shadow-lg shadow-emerald-200">
                        <AcademicCapIcon class="w-7 h-7" />
                    </div>
                    <div>
                        <h3 class="font-black text-2xl tracking-tight text-foreground">Informasi Akademik</h3>
                        <p class="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/45">Status
                            pendaftaran dan riwayat pendidikan sebelumnya</p>
                    </div>
                </div>

                <div class="space-y-12">
                    <!-- School Status Sub-section -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-12">
                        <div class="space-y-6">
                            <div class="flex items-center gap-3">
                                <HomeIcon class="w-4 h-4 text-emerald-500" />
                                <span
                                    class="text-[11px] font-black uppercase tracking-tight text-muted-foreground/60">Status
                                    Sekolah</span>
                                <div class="flex-1 h-px bg-gradient-to-r from-emerald-100 to-transparent"></div>
                            </div>
                            <div class="space-y-6">
                                <FormCombobox v-model="formData.class" label="Pilih Kelas"
                                    :options="classOptions.map(c => ({ value: c, label: `Kelas ${c}` }))"
                                    :required="true" />
                                <FormSelect v-model="formData.status" label="Status Siswa" :options="statusOptions"
                                    :required="true" />
                            </div>
                        </div>

                        <div class="space-y-6">
                            <div class="flex items-center gap-3">
                                <GlobeAsiaAustraliaIcon class="w-4 h-4 text-sky-500" />
                                <span
                                    class="text-[11px] font-black uppercase tracking-tight text-muted-foreground/60">Periode
                                    Akademik</span>
                                <div class="flex-1 h-px bg-gradient-to-r from-sky-100 to-transparent"></div>
                            </div>
                            <div class="space-y-6">
                                <FormInput v-model="formData.academicYear" label="Tahun Ajaran" placeholder="2024/2025"
                                    :required="true" />
                                <FormDatePicker v-model="formData.joinDate" label="Tanggal Bergabung"
                                    :required="true" />
                            </div>
                        </div>
                    </div>

                    <!-- Previous School Sub-section -->
                    <div class="space-y-6 pt-4 border-t border-primary/5">
                        <div class="flex items-center gap-3">
                            <BookmarkIcon class="w-4 h-4 text-amber-500" />
                            <span class="text-[11px] font-black uppercase tracking-tight text-muted-foreground/60">Asal
                                Sekolah & Seleksi</span>
                            <div class="flex-1 h-px bg-gradient-to-r from-amber-100 to-transparent"></div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8">
                            <FormInput v-model="formData.academic.previousSchool" label="Sekolah Asal (SMP/MTS/Lainnya)"
                                placeholder="Tuliskan nama sekolah sebelumnya" :required="true"
                                :error="errors.previousSchool" />
                            <FormInput v-model.number="formData.academic.entryScore" label="Skor Seleksi" type="number"
                                placeholder="0-100" :required="true" :error="errors.entryScore" />
                        </div>
                    </div>
                </div>

                <!-- Navigation -->
                <div class="flex justify-between items-center pt-10">
                    <button type="button" @click="prevTab"
                        class="px-8 py-4 text-xs font-black text-muted-foreground hover:bg-primary/5 hover:text-primary rounded-2xl transition-all flex items-center gap-2">
                        <ArrowLeftIcon class="w-4 h-4" />
                        Kembali
                    </button>
                    <button type="button" @click="nextTab"
                        class="px-10 py-5 bg-emerald-600 text-white font-black text-xs rounded-2xl shadow-xl shadow-emerald-200 hover:bg-emerald-700 active:scale-95 transition-all flex items-center gap-3">
                        Lanjut ke Keluarga
                        <div class="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                            <ArrowRightIcon class="w-3 h-3" />
                        </div>
                    </button>
                </div>
            </div>

            <!-- Parent Data Section -->
            <div v-show="activeTab === 'parent'" class="space-y-12 animate-in slide-in-from-right-4 duration-500">
                <!-- Section Header -->
                <div class="flex items-center gap-5">
                    <div
                        class="w-14 h-14 bg-purple-600 rounded-2xl text-white flex items-center justify-center shadow-lg shadow-purple-200">
                        <UsersIcon class="w-7 h-7" />
                    </div>
                    <div>
                        <h3 class="font-black text-2xl tracking-tight text-foreground">Data Keluarga</h3>
                        <p class="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/45">Informasi
                            orang tua atau wali murid</p>
                    </div>
                </div>

                <div class="space-y-16">
                    <!-- Father -->
                    <div class="space-y-8">
                        <div class="flex items-center gap-3">
                            <div
                                class="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black text-xs">
                                A</div>
                            <span class="text-[11px] font-black uppercase tracking-tight text-muted-foreground/60">Data
                                Ayah Kandung</span>
                            <div class="flex-1 h-px bg-gradient-to-r from-blue-100 to-transparent"></div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
                            <div class="md:col-span-2">
                                <FormInput v-model="formData.parent.father.name" label="Nama Lengkap Ayah"
                                    placeholder="Masukkan nama sesuai KTP" :required="true"
                                    :error="errors.fatherName" />
                            </div>
                            <div class="space-y-6">
                                <FormInput v-model="formData.parent.father.phone" label="Nomor Telepon/WA" type="tel"
                                    placeholder="08xxxxxxxxxx" />
                            </div>
                            <div class="space-y-6">
                                <FormInput v-model="formData.parent.father.occupation" label="Pekerjaan"
                                    placeholder="Contoh: Karyawan Swasta, PNS" />
                            </div>
                        </div>
                    </div>

                    <!-- Mother -->
                    <div class="space-y-8 pt-4 border-t border-primary/5">
                        <div class="flex items-center gap-3">
                            <div
                                class="w-8 h-8 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center font-black text-xs">
                                M</div>
                            <span class="text-[11px] font-black uppercase tracking-tight text-muted-foreground/60">Data
                                Ibu Kandung</span>
                            <div class="flex-1 h-px bg-gradient-to-r from-pink-100 to-transparent"></div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
                            <div class="md:col-span-2">
                                <FormInput v-model="formData.parent.mother.name" label="Nama Lengkap Ibu"
                                    placeholder="Masukkan nama sesuai KTP" :required="true"
                                    :error="errors.motherName" />
                            </div>
                            <div class="space-y-6">
                                <FormInput v-model="formData.parent.mother.phone" label="Nomor Telepon/WA" type="tel"
                                    placeholder="08xxxxxxxxxx" />
                            </div>
                            <div class="space-y-6">
                                <FormInput v-model="formData.parent.mother.occupation" label="Pekerjaan"
                                    placeholder="Contoh: Ibu Rumah Tangga, Guru" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Navigation -->
                <div class="flex justify-between items-center pt-10">
                    <button type="button" @click="prevTab"
                        class="px-8 py-4 text-xs font-black text-muted-foreground hover:bg-primary/5 hover:text-primary rounded-2xl transition-all flex items-center gap-2">
                        <ArrowLeftIcon class="w-4 h-4" />
                        Kembali
                    </button>
                    <button type="button" @click="nextTab"
                        class="px-10 py-5 bg-purple-600 text-white font-black text-xs rounded-2xl shadow-xl shadow-purple-200 hover:bg-purple-700 active:scale-95 transition-all flex items-center gap-3">
                        Lanjut ke Prestasi
                        <div class="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                            <ArrowRightIcon class="w-3 h-3" />
                        </div>
                    </button>
                </div>
            </div>

            <!-- Achievements Section -->
            <div v-show="activeTab === 'achievements'" class="space-y-12 animate-in slide-in-from-right-4 duration-500">
                <!-- Section Header -->
                <div class="flex items-center gap-5">
                    <div
                        class="w-14 h-14 bg-amber-500 rounded-2xl text-white flex items-center justify-center shadow-lg shadow-amber-200">
                        <TrophyIcon class="w-7 h-7" />
                    </div>
                    <div>
                        <h3 class="font-black text-2xl tracking-tight text-foreground">Prestasi Siswa</h3>
                        <p class="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/45">Penghargaan
                            dan sertifikasi yang pernah diraih</p>
                    </div>
                </div>

                <div class="space-y-10">
                    <div class="p-8 bg-amber-50/50 rounded-[32px] border border-amber-200/30 space-y-6">
                        <div class="flex items-center gap-3">
                            <SparklesIcon class="w-5 h-5 text-amber-500" />
                            <span class="text-[12px] font-black text-amber-900/70 tracking-tight">Tambah Pencapaian
                                Baru</span>
                        </div>
                        <div class="flex gap-4">
                            <div class="flex-1">
                                <FormInput v-model="newAchievement"
                                    placeholder="Contoh: Juara 1 Olimpiade Matematika Nasional"
                                    @keyup.enter="addAchievement" class="!space-y-0" />
                            </div>
                            <button type="button" @click="addAchievement"
                                class="h-12 px-6 bg-amber-600 text-white font-black text-xs rounded-2xl shadow-lg shadow-amber-200 hover:bg-amber-700 active:scale-95 transition-all">
                                Tambah
                            </button>
                        </div>
                    </div>

                    <div v-if="formData.academic.achievements.length > 0" class="grid grid-cols-1 gap-4">
                        <div v-for="(achievement, index) in formData.academic.achievements" :key="index"
                            class="group flex items-center gap-4 p-5 bg-primary/[0.02] hover:bg-white rounded-3xl transition-all border border-transparent shadow-sm">
                            <div class="p-2.5 bg-amber-100/50 rounded-xl">
                                <TrophyIcon class="w-4 h-4 text-amber-600" />
                            </div>
                            <span class="flex-1 text-sm font-bold text-foreground/80">{{ achievement }}</span>
                            <button type="button" @click="removeAchievement(index)"
                                class="p-2 text-muted-foreground hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                                <XMarkIcon class="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div v-else
                        class="text-center py-20 bg-primary/[0.02] rounded-[40px] border-2 border-dashed border-primary/5">
                        <div class="inline-flex p-6 bg-white rounded-3xl mb-4 shadow-xl shadow-primary/5">
                            <TrophyIcon class="w-10 h-10 text-primary/20" />
                        </div>
                        <p class="text-xs font-black text-muted-foreground/40 uppercase tracking-widest">Belum ada
                            prestasi tercatat</p>
                    </div>
                </div>

                <!-- Final Actions -->
                <div class="flex justify-between items-center pt-10">
                    <button type="button" @click="prevTab"
                        class="text-xs font-black text-muted-foreground hover:text-primary transition-all flex items-center gap-2">
                        &larr; Kembali
                    </button>
                    <div class="flex gap-4">
                        <button type="button" @click="handleCancel"
                            class="px-8 py-4 text-xs font-black text-muted-foreground hover:text-foreground transition-all">
                            Batal
                        </button>
                        <button type="submit"
                            class="px-12 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-sm rounded-3xl shadow-2xl shadow-primary/30 active:scale-95 transition-all">
                            {{ mode === 'create' ? 'Daftarkan Siswa' : 'Simpan Perubahan' }}
                        </button>
                    </div>
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
