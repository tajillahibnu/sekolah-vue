<script setup>
import { computed } from 'vue'
import { RadioGroupRoot, RadioGroupItem, RadioGroupIndicator } from 'radix-vue'
import { cn } from '@/lib/utils'

const props = defineProps({
    modelValue: {
        type: String,
        default: undefined
    },
    defaultValue: {
        type: String,
        default: undefined
    },
    disabled: {
        type: Boolean,
        default: false
    },
    name: {
        type: String,
        default: undefined
    },
    required: {
        type: Boolean,
        default: false
    },
    orientation: {
        type: String,
        default: 'vertical'
    },
    class: {
        type: String,
        default: ''
    }
})

const emits = defineEmits(['update:modelValue'])

const delegatedProps = computed(() => {
    const { class: _, ...delegated } = props
    return delegated
})
</script>

<template>
    <RadioGroupRoot v-bind="delegatedProps" :class="cn('grid gap-2', props.class)"
        @update:model-value="emits('update:modelValue', $event)">
        <slot />
    </RadioGroupRoot>
</template>
