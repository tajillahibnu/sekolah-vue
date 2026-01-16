<script setup>
import { ref, computed } from 'vue'
import Label from '../label/Label.vue'
import RadioGroup from '../radio-group/RadioGroup.vue'
import RadioGroupItem from '../radio-group/RadioGroupItem.vue'
import { cn } from '@/lib/utils'

const props = defineProps({
    label: {
        type: String,
        required: true
    },
    modelValue: {
        type: String,
        default: ''
    },
    options: {
        type: Array,
        required: true
        // Array of { value, label } or simple array of strings
    },
    error: {
        type: String,
        default: ''
    },
    disabled: {
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

const emit = defineEmits(['update:modelValue'])

const normalizedOptions = computed(() => {
    return props.options.map(option => {
        if (typeof option === 'string') {
            return { value: option, label: option }
        }
        return option
    })
})

const handleValueChange = (value) => {
    emit('update:modelValue', value)
}
</script>

<template>
    <div :class="cn('space-y-3', props.class)">
        <Label class="text-sm font-medium">{{ label }}</Label>
        <RadioGroup :model-value="modelValue" :disabled="disabled" :orientation="orientation"
            @update:model-value="handleValueChange">
            <div v-for="option in normalizedOptions" :key="option.value" class="flex items-center space-x-2">
                <RadioGroupItem :value="option.value" :id="`radio-${option.value}`" />
                <Label :for="`radio-${option.value}`" class="text-sm font-normal cursor-pointer">
                    {{ option.label }}
                </Label>
            </div>
        </RadioGroup>
        <p v-if="error" class="text-sm text-destructive">
            {{ error }}
        </p>
    </div>
</template>
