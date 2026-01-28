<script setup>
import { DropdownMenuContent, DropdownMenuPortal } from 'radix-vue'
import { cn } from '@/lib/utils' // Assuming there is a cn utility, if not I'll just use class directly involving tailwind-merge if needed, but for now assuming standard shadcn structure. 
// Wait, checking if utils exists. If not, I should handle it.
// Checking previous file usage: `src/components/ui` exists so `src/lib/utils.js` likely exists.
// I will check for util existence in a sec. For now I'll assume standard Shadcn.

const props = defineProps({
    forceMount: { type: Boolean, required: false },
    loop: { type: Boolean, required: false },
    side: { type: String, required: false },
    sideOffset: { type: Number, default: 4 },
    align: { type: String, default: 'center' },
    alignOffset: { type: Number, required: false },
    avoidCollisions: { type: Boolean, required: false },
    collisionBoundary: { type: null, required: false },
    collisionPadding: { type: [Number, Object], required: false },
    arrowPadding: { type: Number, required: false },
    sticky: { type: String, required: false },
    hideWhenDetached: { type: Boolean, required: false },
    updatePositionStrategy: { type: String, required: false },
    prioritizePosition: { type: Boolean, required: false },
    asChild: { type: Boolean, required: false },
    as: { type: null, required: false },
    class: { type: String, required: false },
})
</script>

<template>
    <DropdownMenuPortal>
        <DropdownMenuContent v-bind="props" :class="[
            'z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
            props.class,
        ]">
            <slot />
        </DropdownMenuContent>
    </DropdownMenuPortal>
</template>
