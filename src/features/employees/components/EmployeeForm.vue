<script setup>
import { ref, watch, computed } from 'vue';
import {
    UserIcon,
    BriefcaseIcon,
    PhoneIcon,
    CheckCircleIcon
} from '@heroicons/vue/24/outline';
import FormInput from '@/components/ui/form/FormInput.vue';
import FormCombobox from '@/components/ui/form/FormCombobox.vue';
import FormDatePicker from '@/components/ui/form/FormDatePicker.vue';
import Button from '@/components/ui/button/Button.vue';

const props = defineProps({
    modelValue: {
        type: Object,
        default: () => ({
            nip: '',
            nik: '',
            name: '',
            gender: '',
            birthPlace: '',
            birthDate: '',
            religion: '',
            address: '',
            education: '',
            type: '',
            position: '',
            classAssigned: '',
            phone: '',
            email: '',
            status: 'Aktif',
            joinDate: ''
        })
    },
    isEdit: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:modelValue', 'submit', 'cancel']);

const form = ref({ ...props.modelValue });
const currentTab = ref('personal');

watch(() => props.modelValue, (newValue) => {
    // Prevent recursive updates by checking if data actually changed
    // Simple verification to avoid infinite loop
    if (JSON.stringify(newValue) !== JSON.stringify(form.value)) {
        form.value = { ...newValue };
    }
}, { deep: true });

watch(form, (newValue) => {
    emit('update:modelValue', newValue);
}, { deep: true });

// Tabs Configuration
const tabs = [
    { id: 'personal', label: 'Informasi Pribadi', icon: UserIcon, color: 'text-blue-500' },
    { id: 'employment', label: 'Kepegawaian', icon: BriefcaseIcon, color: 'text-purple-500' },
    { id: 'contact', label: 'Kontak & Alamat', icon: PhoneIcon, color: 'text-green-500' }
];

// Check if tab is completed (Basic Validation)
const isTabCompleted = computed(() => {
    return {
        personal: form.value.name && form.value.nik,
        employment: form.value.nip && form.value.position && form.value.type,
        contact: form.value.email || form.value.phone
    };
});

const typeOptions = [
    { value: 'Guru', label: 'Guru' },
    { value: 'Pegawai', label: 'Pegawai' }
];

const positionOptions = [
    { value: 'Kepala Sekolah', label: 'Kepala Sekolah' },
    { value: 'Waka Kurikulum', label: 'Waka Kurikulum' },
    { value: 'Waka Kesiswaan', label: 'Waka Kesiswaan' },
    { value: 'Walikelas', label: 'Walikelas' },
    { value: 'Guru Mapel', label: 'Guru Mata Pelajaran' },
    { value: 'Staff Tata Usaha', label: 'Staff Tata Usaha' },
    { value: 'Satpam', label: 'Satpam' },
    { value: 'Kebersihan', label: 'Petugas Kebersihan' }
];

const classOptions = [
    { value: 'X-A', label: 'Kelas X-A' },
    { value: 'X-B', label: 'Kelas X-B' },
    { value: 'XI-A', label: 'Kelas XI-A' },
    { value: 'XI-B', label: 'Kelas XI-B' },
    { value: 'XII-A', label: 'Kelas XII-A' },
    { value: 'XII-B', label: 'Kelas XII-B' },
];

const statusOptions = [
    { value: 'Aktif', label: 'Aktif' },
    { value: 'Non-aktif', label: 'Non-aktif' },
    { value: 'Cuti', label: 'Cuti' }
];

const genderOptions = [
    { value: 'Laki-laki', label: 'Laki-laki' },
    { value: 'Perempuan', label: 'Perempuan' }
];



const handleSubmit = () => {
    emit('submit', form.value);
};

const handleCancel = () => {
    emit('cancel');
};
</script>

<template>
    <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Enhanced Tabs -->
        <div class="border-b border-border">
            <div class="flex space-x-1 overflow-x-auto">
                <button v-for="tab in tabs" :key="tab.id" @click="currentTab = tab.id" type="button"
                    class="flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all relative whitespace-nowrap"
                    :class="[
                        currentTab === tab.id
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    ]">
                    <component :is="tab.icon" class="w-4 h-4" :class="tab.color" />
                    <span class="hidden sm:inline">{{ tab.label }}</span>
                    <CheckCircleIcon v-if="isTabCompleted[tab.id]" class="w-4 h-4 text-green-500" />
                </button>
            </div>
        </div>

        <!-- Tab Content -->
        <div class="min-h-[300px]">
            <!-- Personal Information -->
            <div v-show="currentTab === 'personal'" class="space-y-6 animate-in fade-in duration-300">
                <div class="bg-card border border-border rounded-lg p-6 space-y-6">
                    <div class="flex items-center gap-3 pb-4 border-b border-border">
                        <div class="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                            <UserIcon class="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 class="font-semibold text-lg">Informasi Pribadi</h3>
                            <p class="text-sm text-muted-foreground">Data identitas pegawai</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput v-model="form.nik" label="NIK" placeholder="Nomor Induk Kependudukan" />
                        <FormInput v-model="form.name" label="Nama Lengkap" placeholder="Nama lengkap + gelar"
                            :required="true" />

                        <FormCombobox v-model="form.gender" label="Jenis Kelamin" :options="genderOptions"
                            placeholder="Pilih Gender" />
                        <FormCombobox v-model="form.religion" label="Agama" api-url="/references/religions"
                            placeholder="Pilih Agama (Server)" />

                        <FormInput v-model="form.birthPlace" label="Tempat Lahir" />
                        <FormDatePicker v-model="form.birthDate" label="Tanggal Lahir" placeholder="Pilih tanggal lahir"
                            :required="true" />

                        <div class="md:col-span-2">
                            <FormInput v-model="form.education" label="Pendidikan Terakhir"
                                placeholder="Contoh: S1 Pendidikan Matematika" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Employment Information -->
            <div v-show="currentTab === 'employment'" class="space-y-6 animate-in fade-in duration-300">
                <div class="bg-card border border-border rounded-lg p-6 space-y-6">
                    <div class="flex items-center gap-3 pb-4 border-b border-border">
                        <div class="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                            <BriefcaseIcon class="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h3 class="font-semibold text-lg">Kepegawaian</h3>
                            <p class="text-sm text-muted-foreground">Status dan jabatan pegawai</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput v-model="form.nip" label="NIP / NUPTK" placeholder="NIP / NUPTK" :required="true" />
                        <FormInput v-model="form.joinDate" label="Tanggal Mulai Tugas" type="date" />

                        <FormCombobox v-model="form.type" label="Tipe Kepegawaian" :options="typeOptions"
                            :required="true" />
                        <FormCombobox v-model="form.status" label="Status" :options="statusOptions" :required="true" />

                        <FormCombobox v-model="form.position" label="Jabatan" :options="positionOptions"
                            :required="true" />
                        <!-- Conditional Class Input for Walikelas -->
                        <FormCombobox v-if="form.position === 'Walikelas'" v-model="form.classAssigned"
                            label="Wali Kelas Untuk" :options="classOptions" placeholder="Pilih Kelas"
                            :required="true" />
                    </div>
                </div>
            </div>

            <!-- Contact Information -->
            <div v-show="currentTab === 'contact'" class="space-y-6 animate-in fade-in duration-300">
                <div class="bg-card border border-border rounded-lg p-6 space-y-6">
                    <div class="flex items-center gap-3 pb-4 border-b border-border">
                        <div class="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                            <PhoneIcon class="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <h3 class="font-semibold text-lg">Kontak & Alamat</h3>
                            <p class="text-sm text-muted-foreground">Informasi kontak yang dapat dihubungi</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput v-model="form.email" label="Email" type="email" placeholder="email@sekolah.sch.id" />
                        <FormInput v-model="form.phone" label="No. Handphone" placeholder="08..." />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alamat
                            Lengkap</label>
                        <textarea v-model="form.address" rows="3"
                            class="textarea textarea-bordered w-full bg-background" placeholder="Jl. ..."></textarea>
                    </div>
                </div>
            </div>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-between items-center pt-6 border-t border-border mt-6">
            <p class="text-sm text-muted-foreground">
                <span class="text-destructive">*</span> Field wajib diisi
            </p>
            <div class="flex gap-3">
                <Button type="button" variant="outline" @click="handleCancel">
                    Batal
                </Button>
                <Button type="submit">
                    {{ isEdit ? 'Simpan Perubahan' : 'Tambah Pegawai' }}
                </Button>
            </div>
        </div>
    </form>
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
