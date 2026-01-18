<script setup>
import { SelectContent, SelectViewport, SelectPortal, useForwardPropsEmits } from 'radix-vue'
import { cn } from '@/lib/utils'

const props = defineProps({
    class: { type: String, required: false },
    position: { type: String, default: 'popper' },
    side: { type: String, required: false },
    sideOffset: { type: Number, default: 4 },
    align: { type: String, required: false },
    alignOffset: { type: Number, required: false },
    avoidCollisions: { type: Boolean, required: false },
    collisionBoundary: { type: null, required: false },
    collisionPadding: { type: [Number, Object], required: false },
    arrowPadding: { type: Number, required: false },
    sticky: { type: String, required: false },
    hideWhenDetached: { type: Boolean, required: false },
})
const emits = defineEmits(['closeAutoFocus', 'escapeKeyDown', 'pointerDownOutside'])

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
    <SelectPortal>
        <SelectContent v-bind="forwarded" :class="cn(
            'relative z-[110] min-w-[8rem] overflow-hidden rounded-2xl border border-primary/10 bg-background shadow-2xl shadow-primary/10 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
            position === 'popper' &&
            'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
            props.class
        )">
            <SelectViewport
                :class="cn('p-1', position === 'popper' && 'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]')">
                <slot />
            </SelectViewport>
        </SelectContent>
    </SelectPortal>
</template>
