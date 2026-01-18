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
        'flex h-12 w-full rounded-2xl border border-primary/5 bg-primary/[0.03] px-5 py-2 text-sm font-medium ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/5 focus-visible:border-primary/20 focus-visible:bg-background transition-all disabled:cursor-not-allowed disabled:opacity-50 shadow-sm shadow-primary/5',
        props.class
    )">
</template>
