<script setup>
import { computed } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps({
    class: {
        type: String,
        default: ''
    },
    id: {
        type: String,
        default: undefined
    }
})

const delegatedProps = computed(() => {
    const { class: _, ...delegated } = props
    return delegated
})
</script>

<template>
    <label v-bind="delegatedProps" :class="cn(
        'text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        props.class
    )">
        <slot />
    </label>
</template>
