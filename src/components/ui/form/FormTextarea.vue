<script setup>
import { ref, computed } from 'vue'
import Label from '../label/Label.vue'
import Textarea from '../textarea/Textarea.vue'
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
        default: ''
    },
    disabled: {
        type: Boolean,
        default: false
    },
    rows: {
        type: Number,
        default: 4
    },
    class: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['update:modelValue'])

const textareaId = computed(() => `textarea-${Math.random().toString(36).substr(2, 9)}`)

const handleInput = (event) => {
    emit('update:modelValue', event.target.value)
}
</script>

<template>
    <div :class="cn('space-y-2', props.class)">
        <Label :for="textareaId">
            {{ label }}
            <span v-if="required" class="text-destructive ml-1">*</span>
        </Label>
        <Textarea :id="textareaId" :value="modelValue" :placeholder="placeholder" :disabled="disabled" :rows="rows"
            :class="{ 'border-destructive': error }" @input="handleInput" />
        <p v-if="error" class="text-sm text-destructive">
            {{ error }}
        </p>
    </div>
</template>
