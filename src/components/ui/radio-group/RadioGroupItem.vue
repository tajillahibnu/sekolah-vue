<script setup>
import { computed } from 'vue'
import { RadioGroupItem, RadioGroupIndicator } from 'radix-vue'
import { Circle } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const props = defineProps({
    value: {
        type: String,
        required: true
    },
    disabled: {
        type: Boolean,
        default: false
    },
    id: {
        type: String,
        default: undefined
    },
    class: {
        type: String,
        default: ''
    }
})

const delegatedProps = computed(() => {
    const { class: _, ...delegated } = props
    return delegated
})
</script>

<template>
    <RadioGroupItem v-bind="delegatedProps" :class="cn(
        'aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        props.class
    )">
        <RadioGroupIndicator class="flex items-center justify-center">
            <Circle class="h-2.5 w-2.5 fill-current text-current" />
        </RadioGroupIndicator>
    </RadioGroupItem>
</template>
