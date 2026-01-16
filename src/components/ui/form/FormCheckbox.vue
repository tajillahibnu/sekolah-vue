<script setup>
import { ref, computed } from 'vue'
import Label from '../label/Label.vue'
import Checkbox from '../checkbox/Checkbox.vue'
import { cn } from '@/lib/utils'

const props = defineProps({
    label: {
        type: String,
        required: true
    },
    modelValue: {
        type: Boolean,
        default: false
    },
    error: {
        type: String,
        default: ''
    },
    disabled: {
        type: Boolean,
        default: false
    },
    description: {
        type: String,
        default: ''
    },
    class: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['update:modelValue'])

const checkboxId = computed(() => `checkbox-${Math.random().toString(36).substr(2, 9)}`)

const handleCheckedChange = (checked) => {
    emit('update:modelValue', checked)
}
</script>

<template>
    <div :class="cn('space-y-2', props.class)">
        <div class="flex items-center space-x-2">
            <Checkbox :id="checkboxId" :checked="modelValue" :disabled="disabled"
                @update:checked="handleCheckedChange" />
            <div class="grid gap-1.5 leading-none">
                <Label :for="checkboxId"
                    class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {{ label }}
                </Label>
                <p v-if="description" class="text-sm text-muted-foreground">
                    {{ description }}
                </p>
            </div>
        </div>
        <p v-if="error" class="text-sm text-destructive">
            {{ error }}
        </p>
    </div>
</template>
