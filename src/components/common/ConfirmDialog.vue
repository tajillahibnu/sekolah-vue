<script setup>
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog'
import {
    ExclamationTriangleIcon,
    InformationCircleIcon,
    ShieldExclamationIcon
} from '@heroicons/vue/24/outline';
import { cn } from '@/lib/utils'

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
        default: 'Apakah Anda yakin ingin melakukan tindakan ini?'
    },
    confirmText: {
        type: String,
        default: 'Ya, Lanjutkan'
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

const handleOpenChange = (value) => {
    emit('update:show', value);
    if (!value) emit('cancel');
};

const handleConfirm = () => {
    emit('confirm');
    emit('update:show', false);
};

const handleCancel = () => {
    emit('cancel');
    emit('update:show', false);
};

// UI Config based on type
const typeConfig = {
    warning: {
        icon: ExclamationTriangleIcon,
        bgColor: 'bg-amber-50',
        iconColor: 'text-amber-600',
        btnColor: 'bg-amber-600 hover:bg-amber-700 shadow-amber-200'
    },
    error: {
        icon: ShieldExclamationIcon,
        bgColor: 'bg-rose-50',
        iconColor: 'text-rose-600',
        btnColor: 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
    },
    info: {
        icon: InformationCircleIcon,
        bgColor: 'bg-blue-50',
        iconColor: 'text-blue-600',
        btnColor: 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
    }
};
</script>

<template>
    <Dialog :open="show" @update:open="handleOpenChange">
        <DialogContent
            class="sm:max-w-[420px] p-0 overflow-hidden border border-primary/10 shadow-2xl shadow-primary/20 bg-background/95 backdrop-blur-xl rounded-[32px]">
            <div class="p-10 text-center space-y-6">
                <!-- Visual Cue (Icon) -->
                <div class="flex justify-center">
                    <div
                        :class="cn('p-5 rounded-[24px] transition-all duration-500 scale-110 shadow-sm', typeConfig[type].bgColor)">
                        <component :is="typeConfig[type].icon" :class="cn('w-10 h-10', typeConfig[type].iconColor)" />
                    </div>
                </div>

                <!-- Text Content -->
                <div class="space-y-2">
                    <DialogTitle class="text-2xl font-black tracking-tight text-foreground leading-tight">
                        {{ title }}
                    </DialogTitle>
                    <DialogDescription class="text-[13px] font-bold text-muted-foreground/60 leading-relaxed px-4">
                        {{ message }}
                    </DialogDescription>
                </div>

                <!-- Actions -->
                <div class="flex flex-col gap-3 pt-4">
                    <button @click="handleConfirm" :class="cn(
                        'w-full py-4 px-6 text-white font-black text-sm rounded-2xl shadow-xl transition-all active:scale-95 duration-200',
                        typeConfig[type].btnColor
                    )">
                        {{ confirmText }}
                    </button>
                    <button @click="handleCancel"
                        class="w-full py-3 px-6 text-muted-foreground font-black text-[11px] uppercase tracking-widest hover:text-foreground transition-all duration-200">
                        {{ cancelText }}
                    </button>
                </div>
            </div>

            <!-- Bottom decorative bar (Subtle) -->
            <div
                :class="cn('h-1.5 w-full bg-gradient-to-r from-transparent via-current to-transparent opacity-10', typeConfig[type].iconColor)">
            </div>
        </DialogContent>
    </Dialog>
</template>
