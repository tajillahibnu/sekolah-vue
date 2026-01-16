<script setup>
import { computed } from 'vue'
import Label from '../label/Label.vue'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const props = defineProps({
    label: {
        type: String,
        required: true
    },
    modelValue: {
        type: [String, Number],
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
    required: {
        type: Boolean,
        default: false
    },
    placeholder: {
        type: String,
        default: 'Select an option'
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

const handleUpdate = (value) => {
    emit('update:modelValue', value)
}
</script>

<template>
    <div :class="cn('space-y-2', props.class)">
        <Label>
            {{ label }}
            <span v-if="required" class="text-destructive ml-1">*</span>
        </Label>

        <Select :model-value="modelValue" @update:model-value="handleUpdate" :disabled="disabled">
            <SelectTrigger :class="{ 'border-destructive': error }">
                <SelectValue :placeholder="placeholder" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectItem v-for="option in normalizedOptions" :key="option.value" :value="String(option.value)">
                        {{ option.label }}
                    </SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>

        <p v-if="error" class="text-sm text-destructive">
            {{ error }}
        </p>
    </div>
</template>
