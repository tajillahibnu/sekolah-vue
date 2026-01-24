<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useClassStore } from '@/stores/class';
import {
    AcademicCapIcon,
    UserGroupIcon,
    CalendarDaysIcon,
    XMarkIcon,
    CheckCircleIcon,
    BriefcaseIcon
} from '@heroicons/vue/24/outline';
import FormInput from '@/components/ui/form/FormInput.vue';
import FormSelect from '@/components/ui/form/FormSelect.vue';
import FormCombobox from '@/components/ui/form/FormCombobox.vue';

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

const emit = defineEmits(['submit', 'cancel']);

const classStore = useClassStore();

// Check if school is SMK
const isSMK = computed(() => import.meta.env.VITE_APP_TINGKAT === 'SMK');

// Form data
const formData = ref({
    name: '',
    grade: 10,
    jurusan: '',
    academicYear: '2024/2025',
    capacity: 36,
    homeRoomTeacher: '',
    status: 'active'
});

// Validation errors
const errors = ref({});

// Watch for modelValue changes (edit mode)
watch(() => props.modelValue, (newValue) => {
    if (newValue) {
        formData.value = { ...newValue };
    }
}, { immediate: true, deep: true });

// Fetch jurusan list for SMK
onMounted(async () => {
    if (isSMK.value) {
        await classStore.fetchJurusanList();
    }
});

// Options
const gradeOptions = [
    { value: 10, label: 'Kelas 10 (X)' },
    { value: 11, label: 'Kelas 11 (XI)' },
    { value: 12, label: 'Kelas 12 (XII)' }
];

const statusOptions = [
    { value: 'active', label: 'Aktif' },
    { value: 'inactive', label: 'Nonaktif' }
];

// Jurusan options from store
const jurusanOptions = computed(() => {
    return classStore.jurusanList.map(j => ({ value: j, label: j }));
});

// Validate form
const validateForm = () => {
    errors.value = {};

    if (!formData.value.name) {
        errors.value.name = 'Nama kelas wajib diisi';
    }

    if (!formData.value.grade) {
        errors.value.grade = 'Tingkat kelas wajib dipilih';
    }

    if (isSMK.value && !formData.value.jurusan) {
        errors.value.jurusan = 'Jurusan wajib dipilih untuk SMK';
    }

    if (!formData.value.academicYear) {
        errors.value.academicYear = 'Tahun ajaran wajib diisi';
    }

    if (!formData.value.capacity || formData.value.capacity < 1) {
        errors.value.capacity = 'Kapasitas minimal 1 siswa';
    }

    if (formData.value.capacity > 50) {
        errors.value.capacity = 'Kapasitas maksimal 50 siswa';
    }

    if (!formData.value.homeRoomTeacher) {
        errors.value.homeRoomTeacher = 'Wali kelas wajib diisi';
    }

    return Object.keys(errors.value).length === 0;
};

// Handle submit
const handleSubmit = () => {
    if (validateForm()) {
        const submitData = { ...formData.value };

        // Remove jurusan if not SMK
        if (!isSMK.value) {
            delete submitData.jurusan;
        }

        emit('submit', submitData);
    }
};

// Handle cancel
const handleCancel = () => {
    emit('cancel');
};
</script>

<template>
    <div class="space-y-8">
        <!-- Header removed to use Modal title -->

        <form @submit.prevent="handleSubmit" class="space-y-10">
            <!-- Basic Information -->
            <div class="space-y-6">
                <div class="flex items-center gap-3">
                    <AcademicCapIcon class="w-4 h-4 text-primary" />
                    <span class="text-[11px] font-black uppercase tracking-tight text-muted-foreground/60">
                        Informasi Dasar
                    </span>
                    <div class="flex-1 h-px bg-gradient-to-r from-primary/10 to-transparent"></div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput v-model="formData.name" label="Nama Kelas" placeholder="Contoh: X TKJ 1, 10A"
                        :required="true" :error="errors.name" />

                    <FormSelect v-model="formData.grade" label="Tingkat Kelas" :options="gradeOptions" :required="true"
                        :error="errors.grade" />
                </div>

                <!-- Conditional Jurusan Field for SMK -->
                <div v-if="isSMK" class="relative">
                    <div
                        class="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/50 to-primary/10 rounded-full">
                    </div>
                    <div class="pl-4">
                        <FormCombobox v-model="formData.jurusan" label="Jurusan" :options="jurusanOptions"
                            :required="true" placeholder="Pilih Jurusan" :error="errors.jurusan" />
                        <p class="mt-2 text-xs text-muted-foreground flex items-center gap-2">
                            <BriefcaseIcon class="w-3 h-3" />
                            Field ini hanya muncul untuk sekolah tingkat SMK
                        </p>
                    </div>
                </div>
            </div>

            <!-- Academic Period -->
            <div class="space-y-6 pt-4 border-t border-primary/5">
                <div class="flex items-center gap-3">
                    <CalendarDaysIcon class="w-4 h-4 text-emerald-500" />
                    <span class="text-[11px] font-black uppercase tracking-tight text-muted-foreground/60">
                        Periode Akademik
                    </span>
                    <div class="flex-1 h-px bg-gradient-to-r from-emerald-100 to-transparent"></div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput v-model="formData.academicYear" label="Tahun Ajaran" placeholder="2024/2025"
                        :required="true" :error="errors.academicYear" />

                    <FormSelect v-model="formData.status" label="Status Kelas" :options="statusOptions"
                        :required="true" />
                </div>
            </div>

            <!-- Capacity & Teacher -->
            <div class="space-y-6 pt-4 border-t border-primary/5">
                <div class="flex items-center gap-3">
                    <UserGroupIcon class="w-4 h-4 text-blue-500" />
                    <span class="text-[11px] font-black uppercase tracking-tight text-muted-foreground/60">
                        Kapasitas & Wali Kelas
                    </span>
                    <div class="flex-1 h-px bg-gradient-to-r from-blue-100 to-transparent"></div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput v-model.number="formData.capacity" label="Kapasitas Maksimal" type="number"
                        placeholder="36" :required="true" :error="errors.capacity" />

                    <FormInput v-model="formData.homeRoomTeacher" label="Wali Kelas" placeholder="Nama Guru Wali Kelas"
                        :required="true" :error="errors.homeRoomTeacher" />
                </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-4 pt-6">
                <button type="button" @click="handleCancel"
                    class="px-8 py-4 text-xs font-black text-muted-foreground hover:text-foreground transition-all">
                    Batal
                </button>
                <button type="submit"
                    class="px-12 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-sm rounded-3xl shadow-2xl shadow-primary/30 active:scale-95 transition-all flex items-center gap-3">
                    <CheckCircleIcon class="w-5 h-5" />
                    {{ mode === 'create' ? 'Simpan Kelas' : 'Update Kelas' }}
                </button>
            </div>
        </form>
    </div>
</template>
