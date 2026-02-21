<script setup>
import { ref, watch, computed } from 'vue';
import FormInput from '@/components/ui/form/FormInput.vue'
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
    name: ''
});

const errors = ref({});

const resetForm = () => {
    form.value = {
        name: ''
    };
    errors.value = {};
};

watch(() => props.modelValue, (val) => {
    if (val) {
        form.value = { ...val };
    } else {
        resetForm();
    }
}, { immediate: true });

const isEdit = computed(() => props.mode === 'edit');

const validate = () => {
    errors.value = {};
    let isValid = true;

    if (!form.value.name) {
        errors.value.name = 'Tahun pelajaran wajib diisi';
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
            <FormInput v-model="form.name" label="Tahun Pelajaran" placeholder="e.g. 2025/2026" :error="errors.name"
                required />
            <p class="text-xs text-muted-foreground italic">Anda dapat mengonfigurasi jadwal Sesi/Semester (Ganjil &
                Genap) melalui menu Kelola Sesi setelah Tahun Pelajaran ini dibuat.</p>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3">
            <Button type="button" variant="ghost" @click="$emit('cancel')">
                Batal
            </Button>
            <Button type="submit">
                {{ isEdit ? 'Simpan Perubahan' : 'Tambah Tahun' }}
            </Button>
        </div>
    </form>
</template>
