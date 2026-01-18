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
        'flex h-12 w-full items-center justify-between rounded-2xl border border-primary/5 bg-primary/[0.03] px-5 py-2 text-sm font-medium ring-offset-background placeholder:text-muted-foreground/50 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 focus:bg-background transition-all disabled:cursor-not-allowed disabled:opacity-50 shadow-sm shadow-primary/5',
        props.class
    )">
        <slot />
        <SelectIcon as-child>
            <ChevronDownIcon
                class="h-4 w-4 opacity-50 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </SelectIcon>
    </SelectTrigger>
</template>
