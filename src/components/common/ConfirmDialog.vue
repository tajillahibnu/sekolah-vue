<script setup>
import { ref, watch } from 'vue';
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline';

const props = defineProps({
    show: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        default: 'Konfirmasi'
    },
    message: {
        type: String,
        default: 'Apakah Anda yakin?'
    },
    confirmText: {
        type: String,
        default: 'Ya'
    },
    cancelText: {
        type: String,
        default: 'Batal'
    },
    type: {
        type: String,
        default: 'warning', // warning, error, info
        validator: (value) => ['warning', 'error', 'info'].includes(value)
    }
});

const emit = defineEmits(['confirm', 'cancel', 'update:show']);

const dialogRef = ref(null);

// Watch show prop to control dialog
watch(() => props.show, (newValue) => {
    if (newValue && dialogRef.value) {
        dialogRef.value.showModal();
    } else if (!newValue && dialogRef.value) {
        dialogRef.value.close();
    }
});

// Handle confirm
const handleConfirm = () => {
    emit('confirm');
    emit('update:show', false);
};

// Handle cancel
const handleCancel = () => {
    emit('cancel');
    emit('update:show', false);
};

// Type colors
const typeColors = {
    warning: 'text-warning',
    error: 'text-error',
    info: 'text-info'
};
</script>

<template>
    <dialog ref="dialogRef" class="modal">
        <div class="modal-box">
            <!-- Icon -->
            <div class="flex justify-center mb-4">
                <div class="rounded-full p-3 bg-base-200">
                    <ExclamationTriangleIcon class="w-12 h-12" :class="typeColors[type]" />
                </div>
            </div>

            <!-- Title -->
            <h3 class="font-bold text-lg text-center mb-2">{{ title }}</h3>

            <!-- Message -->
            <p class="text-center text-base-content/70 mb-6">{{ message }}</p>

            <!-- Actions -->
            <div class="flex gap-2 justify-center">
                <button @click="handleCancel" class="btn btn-ghost">
                    {{ cancelText }}
                </button>
                <button @click="handleConfirm" class="btn" :class="{
                    'btn-warning': type === 'warning',
                    'btn-error': type === 'error',
                    'btn-info': type === 'info'
                }">
                    {{ confirmText }}
                </button>
            </div>
        </div>
        <form method="dialog" class="modal-backdrop" @click="handleCancel">
            <button>close</button>
        </form>
    </dialog>
</template>
