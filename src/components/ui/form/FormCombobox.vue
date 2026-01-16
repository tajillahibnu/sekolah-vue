<script setup>
import { computed } from 'vue'
import Label from '../label/Label.vue'
import Combobox from '@/components/ui/combobox/Combobox.vue'
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
        default: () => [] // Make optional if apiUrl is used
    },
    apiUrl: {
        type: String,
        default: ''
    },
    valueKey: {
        type: String,
        default: 'value'
    },
    labelKey: {
        type: String,
        default: 'label'
    },
    defaultLimit: {
        type: Number,
        default: 15
    },
    error: {
        type: String,
        default: ''
    },
    required: {
        type: Boolean,
        default: false
    },
    placeholder: {
        type: String,
        default: 'Select option...'
    },
    searchPlaceholder: {
        type: String,
        default: 'Search...'
    },
    emptyText: {
        type: String,
        default: 'No results found.'
    },
    disabled: {
        type: Boolean,
        default: false
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
</script>

<template>
    <div :class="cn('space-y-2', props.class)">
        <Label>
            {{ label }}
            <span v-if="required" class="text-destructive ml-1">*</span>
        </Label>

        <Combobox :model-value="modelValue" :options="normalizedOptions" :api-url="apiUrl" :value-key="valueKey"
            :label-key="labelKey" :default-limit="Number(defaultLimit)" :placeholder="placeholder"
            :search-placeholder="searchPlaceholder" :empty-text="emptyText" :disabled="disabled"
            :class="{ 'border-destructive': error }" @update:model-value="emit('update:modelValue', $event)" />

        <p v-if="error" class="text-sm text-destructive">
            {{ error }}
        </p>
    </div>
</template>
