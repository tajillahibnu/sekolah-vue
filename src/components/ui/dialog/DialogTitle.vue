<script setup>
import { DialogTitle, useForwardProps } from 'radix-vue'
import { cn } from '@/lib/utils'

const props = defineProps({
    asChild: { type: Boolean, required: false },
    as: { type: null, required: false },
    class: { type: String, required: false },
})
const forwarded = useForwardProps(props)
</script>

<template>
    <DialogTitle v-bind="forwarded" :class="cn('text-lg font-semibold leading-none tracking-tight', props.class)">
        <slot />
    </DialogTitle>
</template>
