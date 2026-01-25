<script setup>
import { ref, watch, computed } from 'vue';
import FormInput from '@/components/ui/form/FormInput.vue'
import FormSelect from '@/components/ui/form/FormSelect.vue'
import FormSwitch from '@/components/ui/form/FormSwitch.vue'
import FormDatePicker from '@/components/ui/form/FormDatePicker.vue' // Assuming this exists or falls back to text
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
    name: '',
    semester: '',
    startDate: '',
    endDate: '',
    status: 'inactive'
});

const errors = ref({});

const isActive = computed({
    get: () => form.value.status === 'active',
    set: (val) => {
        form.value.status = val ? 'active' : 'inactive';
    }
});

watch(() => props.modelValue, (val) => {
    if (val) {
        form.value = { ...val };
    } else {
        resetForm();
    }
}, { immediate: true });

const resetForm = () => {
    form.value = {
        name: '',
        semester: '',
        startDate: '',
        endDate: '',
        status: 'inactive'
    };
    errors.value = {};
};

const isEdit = computed(() => props.mode === 'edit');

const validate = () => {
    errors.value = {};
    let isValid = true;

    if (!form.value.name) {
        errors.value.name = 'Tahun pelajaran wajib diisi';
        isValid = false;
    }

    if (!form.value.semester) {
        errors.value.semester = 'Semester wajib dipilih';
        isValid = false;
    }

    // Optional: Add date validation

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
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput v-model="form.name" label="Tahun Pelajaran" placeholder="e.g. 2024/2025" :error="errors.name"
                    required />

                <FormSelect v-model="form.semester" label="Semester" placeholder="Pilih Semester"
                    :options="['Ganjil', 'Genap']" :error="errors.semester" required />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput v-model="form.startDate" type="date" label="Tanggal Mulai" :error="errors.startDate" />
                <FormInput v-model="form.endDate" type="date" label="Tanggal Selesai" :error="errors.endDate" />
            </div>

            <!-- Status -->
            <div>
                <FormSwitch v-model="isActive" label="Status Aktif" />
            </div>
        </div>

        <div class="flex items-center justify-end gap-3">
            <Button type="button" variant="ghost" @click="$emit('cancel')">
                Batal
            </Button>
            <Button type="submit">
                {{ isEdit ? 'Simpan Perubahan' : 'Tambah Tahun Ajaran' }}
            </Button>
        </div>
    </form>
</template>
