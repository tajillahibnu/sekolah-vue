<script setup>
import { ref, computed } from 'vue'
import Label from '../label/Label.vue'
import Switch from '../switch/Switch.vue'
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

const switchId = computed(() => `switch-${Math.random().toString(36).substr(2, 9)}`)

const handleCheckedChange = (checked) => {
    emit('update:modelValue', checked)
}
</script>

<template>
    <div :class="cn('space-y-2', props.class)">
        <div class="flex items-center justify-between space-x-2">
            <div class="space-y-0.5">
                <Label :for="switchId" class="text-sm font-medium">
                    {{ label }}
                </Label>
                <p v-if="description" class="text-sm text-muted-foreground">
                    {{ description }}
                </p>
            </div>
            <Switch :id="switchId" :checked="modelValue" :disabled="disabled" @update:checked="handleCheckedChange" />
        </div>
        <p v-if="error" class="text-sm text-destructive">
            {{ error }}
        </p>
    </div>
</template>
