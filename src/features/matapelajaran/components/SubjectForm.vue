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
    code: '',
    name: '',
    category: '',
    description: '',
    status: 'active'
});

const errors = ref({});

// Computed for Switch (Boolean <-> String)
const isActive = computed({
    get: () => form.value.status === 'active',
    set: (val) => {
        form.value.status = val ? 'active' : 'inactive';
    }
});

const categories = [
    'Muatan Nasional',
    'Muatan Kewilayahan',
    'Muatan Peminatan Kejuruan',
    'Dasar Bidang Keahlian',
    'Dasar Program Keahlian',
    'Kompetensi Keahlian'
];

watch(() => props.modelValue, (val) => {
    if (val) {
        form.value = { ...val };
    } else {
        resetForm();
    }
}, { immediate: true });

const resetForm = () => {
    form.value = {
        code: '',
        name: '',
        category: '',
        description: '',
        status: 'active'
    };
    errors.value = {};
};

const isEdit = computed(() => props.mode === 'edit');

const validate = () => {
    errors.value = {};
    let isValid = true;

    if (!form.value.code) {
        errors.value.code = 'Kode mata pelajaran wajib diisi';
        isValid = false;
    }

    if (!form.value.name) {
        errors.value.name = 'Nama mata pelajaran wajib diisi';
        isValid = false;
    }

    if (!form.value.category) {
        errors.value.category = 'Kategori wajib dipilih';
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
                    <FormInput v-model="form.code" label="Kode Mapel" placeholder="e.g. MTK" :error="errors.code"
                        required />
                </div>
                <div class="sm:col-span-3">
                    <FormInput v-model="form.name" label="Nama Mata Pelajaran" placeholder="e.g. Matematika Wajib"
                        :error="errors.name" required />
                </div>
            </div>

            <!-- Category -->
            <FormSelect v-model="form.category" label="Kategori" placeholder="Pilih Kategori" :options="categories"
                :error="errors.category" required />

            <!-- Description -->
            <FormTextarea v-model="form.description" label="Deskripsi"
                placeholder="Keterangan singkat tentang mata pelajaran..." :rows="3" />

            <!-- Status -->
            <div>
                <FormSwitch v-model="isActive" label="Status Mata Pelajaran" />
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
