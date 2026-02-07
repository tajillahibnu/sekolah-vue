<script setup>
import { ref, watch, computed } from 'vue';
import FormInput from '@/components/ui/form/FormInput.vue'
import FormSelect from '@/components/ui/form/FormSelect.vue'
import FormTextarea from '@/components/ui/form/FormTextarea.vue'
import FormSwitch from '@/components/ui/form/FormSwitch.vue'
import { Button } from '@/components/ui/button'

const props = defineProps({
    modelValue: {
        type: Object,
        default: () => ({})
    },
    mode: {
        type: String,
        default: 'create'
    }
});

const emit = defineEmits(['update:modelValue', 'submit', 'cancel']);

const form = ref({
    kode: '',
    nama: '',
    kategori: '',
    deskripsi: '',
    tipe: 'Teori',
    is_aktif: true
});

const errors = ref({});

const types = ['Teori', 'Praktik', 'Campuran'];

const categories = [
    'Umum',
    'Muatan Nasional',
    'Muatan Kewilayahan',
    'Muatan Peminatan Kejuruan',
    'Dasar Bidang Keahlian',
    'Dasar Program Keahlian',
    'Kompetensi Keahlian'
];

const resetForm = () => {
    form.value = {
        kode: '',
        nama: '',
        kategori: '',
        deskripsi: '',
        tipe: 'Teori',
        is_aktif: true
    };
    errors.value = {};
};

watch(() => props.modelValue, (val) => {
    if (val) {
        form.value = {
            ...val,
            is_aktif: val.is_aktif === 1 || val.is_aktif === true
        };
    } else {
        resetForm();
    }
}, { immediate: true });

const isEdit = computed(() => props.mode === 'edit');

const validate = () => {
    errors.value = {};
    let isValid = true;

    if (!form.value.kode) {
        errors.value.kode = 'Kode mata pelajaran wajib diisi';
        isValid = false;
    }

    if (!form.value.nama) {
        errors.value.nama = 'Nama mata pelajaran wajib diisi';
        isValid = false;
    }

    if (!form.value.kategori) {
        errors.value.kategori = 'Kategori wajib dipilih';
        isValid = false;
    }

    if (!form.value.tipe) {
        errors.value.tipe = 'Tipe mata pelajaran wajib dipilih';
        isValid = false;
    }

    return isValid;
};

const handleSubmit = () => {
    if (validate()) {
        emit('submit', form.value);
    }
};
</script>

<template>
    <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="space-y-4">
            <!-- Code & Name -->
            <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div class="sm:col-span-1">
                    <FormInput v-model="form.kode" label="Kode Mapel" placeholder="e.g. MTK" :error="errors.kode"
                        required />
                </div>
                <div class="sm:col-span-3">
                    <FormInput v-model="form.nama" label="Nama Mata Pelajaran" placeholder="e.g. Matematika Wajib"
                        :error="errors.nama" required />
                </div>
            </div>

            <!-- Category & Type -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormSelect v-model="form.kategori" label="Kategori" placeholder="Pilih Kategori" :options="categories"
                    :error="errors.kategori" required />
                <FormSelect v-model="form.tipe" label="Tipe Mapel" placeholder="Pilih Tipe" :options="types"
                    :error="errors.tipe" required />
            </div>

            <!-- Description -->
            <FormTextarea v-model="form.deskripsi" label="Deskripsi"
                placeholder="Keterangan singkat tentang mata pelajaran..." :rows="3" />

            <!-- Status -->
            <div>
                <FormSwitch v-model="form.is_aktif" label="Status Mata Pelajaran" />
            </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3">
            <Button type="button" variant="ghost" @click="$emit('cancel')">
                Batal
            </Button>
            <Button type="submit">
                {{ isEdit ? 'Simpan Perubahan' : 'Tambah Mapel' }}
            </Button>
        </div>
    </form>
</template>
