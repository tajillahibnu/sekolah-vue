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
        validator: (value) => ['sm', 'md', 'lg', 'xl', '2xl'].includes(value)
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
    xl: 'max-w-6xl',
    '2xl': 'max-w-7xl'
};
</script>

<template>
    <Dialog :open="show" @update:open="handleOpenChange">
        <DialogContent
            :class="cn('w-full max-h-[95vh] overflow-y-auto border border-primary/10 shadow-2xl shadow-primary/20 bg-background/95 backdrop-blur-xl p-0', sizeClasses[size])">
            <div v-if="title || desc" class="px-10 pt-10 pb-6 border-b border-primary/5">
                <DialogTitle v-if="title" class="text-2xl font-black tracking-tight text-foreground">{{ title }}
                </DialogTitle>
                <DialogDescription v-if="desc"
                    class="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50 mt-2">{{ desc }}
                </DialogDescription>
            </div>

            <div class="p-10 pt-8">
                <slot></slot>
            </div>
        </DialogContent>
    </Dialog>
</template>
