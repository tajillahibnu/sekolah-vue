<script setup>
import { computed } from 'vue'
import { AvatarRoot, AvatarImage, AvatarFallback } from 'radix-vue'
import { cn } from '@/lib/utils'

const props = defineProps({
    src: {
        type: String,
        default: undefined
    },
    alt: {
        type: String,
        default: undefined
    },
    fallback: {
        type: String,
        default: ''
    },
    class: {
        type: String,
        default: ''
    }
})
</script>

<template>
    <AvatarRoot :class="cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', props.class)">
        <AvatarImage v-if="src" :src="src" :alt="alt" class="aspect-square h-full w-full" />
        <AvatarFallback :class="cn(
            'flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-medium'
        )">
            {{ fallback }}
        </AvatarFallback>
    </AvatarRoot>
</template>
