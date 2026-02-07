<script setup>
import { ref, computed } from 'vue'
import Label from '../label/Label.vue'
import Input from '../input/Input.vue'
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
    error: {
        type: String,
        default: ''
    },
    required: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        default: 'text'
    },
    placeholder: {
        type: String,
        default: ''
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

const inputId = `input-${Math.random().toString(36).substr(2, 9)}`

const modelValue = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
})
</script>

<template>
    <div :class="cn('space-y-2', props.class)">
        <Label :for="inputId">
            {{ label }}
            <span v-if="required" class="text-destructive ml-1">*</span>
        </Label>
        <Input :id="inputId" :type="type" v-model="modelValue" :placeholder="placeholder" :disabled="disabled"
            :class="{ 'border-destructive': error }" />
        <p v-if="error" class="text-sm text-destructive">
            {{ error }}
        </p>
    </div>
</template>
