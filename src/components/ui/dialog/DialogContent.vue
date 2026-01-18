<script setup>
import { DialogPortal, DialogOverlay, DialogContent, DialogClose, useForwardPropsEmits } from 'radix-vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { cn } from '@/lib/utils'

const props = defineProps({
    forceMount: { type: Boolean, required: false },
    class: { type: String, required: false },
})
const emits = defineEmits(['escapeKeyDown', 'pointerDownOutside', 'focusOutside', 'interactOutside', 'openAutoFocus', 'closeAutoFocus'])

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
    <DialogPortal>
        <DialogOverlay
            class="fixed inset-0 z-[100] bg-slate-950/20 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogContent v-bind="forwarded" :class="cn(
            'fixed left-[50%] top-[50%] z-[100] grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg',
            props.class
        )">
            <slot />

            <DialogClose
                class="absolute right-6 top-6 p-2.5 rounded-xl bg-primary/5 hover:bg-primary/10 text-muted-foreground hover:text-foreground transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/10 disabled:pointer-events-none group">
                <XMarkIcon class="h-5 w-5 transition-transform group-hover:rotate-90 duration-200" />
                <span class="sr-only">Close</span>
            </DialogClose>
        </DialogContent>
    </DialogPortal>
</template>
