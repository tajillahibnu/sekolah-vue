<script setup>
import { computed } from 'vue'
import { CheckboxRoot, CheckboxIndicator } from 'radix-vue'
import { Check } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const props = defineProps({
    defaultChecked: {
        type: Boolean,
        default: false
    },
    checked: {
        type: Boolean,
        default: undefined
    },
    disabled: {
        type: Boolean,
        default: false
    },
    required: {
        type: Boolean,
        default: false
    },
    name: {
        type: String,
        default: undefined
    },
    value: {
        type: String,
        default: 'on'
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

const emits = defineEmits(['update:checked'])

const delegatedProps = computed(() => {
    const { class: _, ...delegated } = props
    return delegated
})
</script>

<template>
    <CheckboxRoot v-bind="delegatedProps" :class="cn(
        'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
        props.class
    )" @update:checked="emits('update:checked', $event)">
        <CheckboxIndicator class="flex items-center justify-center text-current">
            <Check class="h-4 w-4" />
        </CheckboxIndicator>
    </CheckboxRoot>
</template>
