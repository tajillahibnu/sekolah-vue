<script setup>
import { DropdownMenuTrigger } from 'radix-vue'

const props = defineProps({
    disabled: { type: Boolean, required: false },
    asChild: { type: Boolean, required: false },
    as: { type: null, required: false },
})
</script>

<template>
    <DropdownMenuTrigger v-bind="props" class="outline-none">
        <slot />
    </DropdownMenuTrigger>
</template>
