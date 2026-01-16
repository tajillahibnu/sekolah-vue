<script setup>
import { SelectTrigger, SelectIcon, useForwardProps } from 'radix-vue'
import { ChevronDownIcon } from '@heroicons/vue/24/outline'
import { cn } from '@/lib/utils'

const props = defineProps({
    disabled: { type: Boolean, required: false },
    asChild: { type: Boolean, required: false },
    as: { type: null, required: false },
    class: { type: String, required: false },
})

const forwarded = useForwardProps(props)
</script>

<template>
    <SelectTrigger v-bind="forwarded" :class="cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        props.class
    )">
        <slot />
        <SelectIcon as-child>
            <ChevronDownIcon class="h-4 w-4 opacity-50" />
        </SelectIcon>
    </SelectTrigger>
</template>
