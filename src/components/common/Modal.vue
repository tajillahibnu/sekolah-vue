<script setup>
import { ref, watch } from 'vue';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

const props = defineProps({
    show: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        default: 'Modal'
    },
    desc: {
        type: String,
        default: ''
    },
    size: {
        type: String,
        default: 'lg', // sm, md, lg, xl
        validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
    }
});

const emit = defineEmits(['close', 'update:show']);

// Handle open change
const handleOpenChange = (value) => {
    emit('update:show', value);
    if (!value) emit('close');
};

// Size classes mapping
const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
};
</script>

<template>
    <Dialog :open="show" @update:open="handleOpenChange">
        <DialogContent :class="cn('w-full max-h-[90vh] overflow-y-auto', sizeClasses[size])">
            <DialogHeader>
                <DialogTitle>{{ title }}</DialogTitle>
                <DialogDescription v-if="desc">{{ desc }}</DialogDescription>
            </DialogHeader>

            <div class="py-4">
                <slot></slot>
            </div>
        </DialogContent>
    </Dialog>
</template>
