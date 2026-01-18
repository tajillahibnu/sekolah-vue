<script setup>
import { SelectItem, SelectItemIndicator, SelectItemText, useForwardProps } from 'radix-vue'
import { CheckIcon } from '@heroicons/vue/24/outline'
import { cn } from '@/lib/utils'

const props = defineProps({
    value: { type: String, required: true },
    disabled: { type: Boolean, required: false },
    textValue: { type: String, required: false },
    asChild: { type: Boolean, required: false },
    as: { type: null, required: false },
    class: { type: String, required: false },
})

const forwarded = useForwardProps(props)
</script>

<template>
    <SelectItem v-bind="forwarded" :class="cn(
        'relative flex w-full cursor-default select-none items-center rounded-xl py-2.5 pl-8 pr-2 text-sm font-medium outline-none focus:bg-primary/5 focus:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors',
        props.class
    )">
        <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
            <SelectItemIndicator>
                <CheckIcon class="h-4 w-4" />
            </SelectItemIndicator>
        </span>

        <SelectItemText>
            <slot />
        </SelectItemText>
    </SelectItem>
</template>
