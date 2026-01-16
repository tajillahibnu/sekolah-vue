<script setup>
import { computed } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps({
    class: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        default: 'text'
    },
    disabled: {
        type: Boolean,
        default: false
    }
})

const delegatedProps = computed(() => {
    const { class: _, ...delegated } = props
    return delegated
})
</script>

<template>
    <input v-bind="delegatedProps" :class="cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        props.class
    )">
</template>
