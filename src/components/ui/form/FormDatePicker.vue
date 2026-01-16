<script setup>
import { computed, ref } from 'vue';
import { DatePicker } from 'v-calendar';
import 'v-calendar/style.css';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { CalendarIcon, ClockIcon } from '@heroicons/vue/24/outline';
import Label from '../label/Label.vue';
import { cn } from '@/lib/utils';
import { PopoverRoot, PopoverTrigger, PopoverContent, PopoverPortal } from 'radix-vue';

const props = defineProps({
    modelValue: {
        type: [Date, Object, String],
        default: null
    },
    label: {
        type: String,
        default: ''
    },
    mode: {
        type: String,
        default: 'date' // date, time, dateTime
    },
    isRange: {
        type: Boolean,
        default: false
    },
    placeholder: {
        type: String,
        default: 'Pilih tanggal'
    },
    error: {
        type: String,
        default: ''
    },
    required: {
        type: Boolean,
        default: false
    },
    disabled: {
        type: Boolean,
        default: false
    },
    class: {
        type: String,
        default: ''
    }
});

const emit = defineEmits(['update:modelValue']);

// Popover state
const isOpen = ref(false);

const dateState = computed({
    get: () => {
        if (!props.modelValue) return null;
        // If string, try to parse? V-Calendar handles dates well. 
        // If ISO string "2024-01-01", it works.
        return props.modelValue;
    },
    set: (val) => {
        emit('update:modelValue', val);
        if (!props.isRange && props.mode !== 'dateTime' && props.mode !== 'time') {
            isOpen.value = false;
        }
    }
});

const formattedValue = computed(() => {
    if (!props.modelValue) return '';

    const locale = { locale: id };

    if (props.isRange && typeof props.modelValue === 'object') {
        const start = props.modelValue.start ? format(new Date(props.modelValue.start), 'dd MMM yyyy', locale) : '?';
        const end = props.modelValue.end ? format(new Date(props.modelValue.end), 'dd MMM yyyy', locale) : '?';
        return `${start} - ${end}`;
    }

    const date = new Date(props.modelValue);
    if (isNaN(date.getTime())) return '';

    if (props.mode === 'time') return format(date, 'HH:mm', locale);
    if (props.mode === 'dateTime') return format(date, 'dd MMM yyyy HH:mm', locale);
    return format(date, 'dd MMMM yyyy', locale);
});

const inputIcon = computed(() => {
    return props.mode === 'time' ? ClockIcon : CalendarIcon;
});

// V-Calendar Attributes
const attributes = computed(() => ([
    {
        key: 'today',
        highlight: true,
        dates: new Date(),
    },
]));
</script>

<template>
    <div :class="cn('space-y-2', props.class)">
        <Label v-if="label">
            {{ label }}
            <span v-if="required" class="text-destructive ml-1">*</span>
        </Label>

        <PopoverRoot v-model:open="isOpen">
            <PopoverTrigger as-child>
                <button type="button" :disabled="disabled"
                    class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    :class="{ 'border-destructive': error, 'text-muted-foreground': !formattedValue }">
                    <span class="truncate">{{ formattedValue || placeholder }}</span>
                    <component :is="inputIcon" class="ml-2 h-4 w-4 opacity-50" />
                </button>
            </PopoverTrigger>
            <PopoverPortal>
                <PopoverContent class="z-50 w-auto p-0 bg-background border rounded-lg shadow-lg" align="start">
                    <DatePicker v-model="dateState" :mode="mode" :is-range="isRange" :attributes="attributes"
                        is-required borderless transparent />
                </PopoverContent>
            </PopoverPortal>
        </PopoverRoot>

        <p v-if="error" class="text-sm text-destructive">
            {{ error }}
        </p>
    </div>
</template>

<style scoped>
:deep(.vc-container) {
    border: none;
    font-family: inherit;
    --vc-font-family: inherit;
    --vc-rounded-full: 0.5rem;
    background-color: transparent;
}

:deep(.vc-pane-layout) {
    background-color: hsl(var(--popover));
    color: hsl(var(--popover-foreground));
}

:deep(.vc-header) {
    padding-top: 10px;
}

:deep(.vc-day-content:hover) {
    background-color: hsl(var(--muted));
}

:deep(.vc-highlight-content-solid) {
    background-color: hsl(var(--primary));
    color: hsl(var(--primary-foreground));
}

:deep(.vc-highlight-content-light) {
    background-color: hsl(var(--primary) / 0.2);
    color: hsl(var(--primary));
}

/* Dark mode adaptation if needed, relying on CSS vars */
</style>
