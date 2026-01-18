<script setup>
import { computed, ref, watch } from 'vue';
import { DatePicker } from 'v-calendar';
import 'v-calendar/style.css';
import { format, parse, isValid } from 'date-fns';
import { id } from 'date-fns/locale';
import { CalendarIcon } from '@heroicons/vue/24/outline';
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
    placeholder: {
        type: String,
        default: 'DD/MM/YYYY'
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
const inputValue = ref('');
const inputRef = ref(null);

// Initialize input value from modelValue
watch(() => props.modelValue, (newVal) => {
    if (newVal) {
        const date = new Date(newVal);
        if (isValid(date)) {
            inputValue.value = format(date, 'dd/MM/yyyy');
        }
    } else {
        inputValue.value = '';
    }
}, { immediate: true });

// Date state for v-calendar
const dateState = computed({
    get: () => {
        if (!props.modelValue) return null;
        return new Date(props.modelValue);
    },
    set: (val) => {
        if (val) {
            emit('update:modelValue', val);
            inputValue.value = format(val, 'dd/MM/yyyy');
            isOpen.value = false;
        }
    }
});

// Handle manual input
const handleInput = (event) => {
    const value = event.target.value;
    inputValue.value = value;

    // Try to parse the input
    // Support formats: DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
    const cleanValue = value.replace(/[.\-]/g, '/');

    if (cleanValue.length === 10) {
        try {
            const parsedDate = parse(cleanValue, 'dd/MM/yyyy', new Date());
            if (isValid(parsedDate)) {
                emit('update:modelValue', parsedDate);
            }
        } catch (e) {
            // Invalid date, don't emit
        }
    }
};

// Handle blur to validate and format
const handleBlur = () => {
    if (!inputValue.value) {
        emit('update:modelValue', null);
        return;
    }

    const cleanValue = inputValue.value.replace(/[.\-]/g, '/');

    try {
        const parsedDate = parse(cleanValue, 'dd/MM/yyyy', new Date());
        if (isValid(parsedDate)) {
            emit('update:modelValue', parsedDate);
            inputValue.value = format(parsedDate, 'dd/MM/yyyy');
        } else {
            // Reset to previous valid value or empty
            if (props.modelValue) {
                inputValue.value = format(new Date(props.modelValue), 'dd/MM/yyyy');
            } else {
                inputValue.value = '';
            }
        }
    } catch (e) {
        // Reset on error
        if (props.modelValue) {
            inputValue.value = format(new Date(props.modelValue), 'dd/MM/yyyy');
        } else {
            inputValue.value = '';
        }
    }
};

// V-Calendar Attributes
const attributes = computed(() => ([
    {
        key: 'today',
        highlight: {
            color: 'blue',
            fillMode: 'light'
        },
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

        <div class="relative">
            <input ref="inputRef" type="text" v-model="inputValue" @input="handleInput" @blur="handleBlur"
                :disabled="disabled" :placeholder="placeholder"
                class="flex h-12 w-full rounded-2xl border border-primary/5 bg-primary/[0.03] px-5 py-2 pr-12 text-sm font-medium ring-offset-background placeholder:text-muted-foreground/50 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 focus:bg-background transition-all disabled:cursor-not-allowed disabled:opacity-50 shadow-sm shadow-primary/5"
                :class="{ 'border-destructive': error }" />

            <PopoverRoot v-model:open="isOpen">
                <PopoverTrigger type="button" :disabled="disabled"
                    class="absolute right-1 top-1/2 -translate-y-1/2 p-2.5 hover:bg-primary/10 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    <CalendarIcon class="h-5 w-5 text-primary" />
                </PopoverTrigger>
                <PopoverPortal>
                    <PopoverContent
                        class="z-[100] w-auto p-0 bg-background border border-primary/10 rounded-2xl shadow-2xl shadow-primary/10"
                        align="end" :side-offset="8">
                        <DatePicker v-model="dateState" :attributes="attributes" mode="date" borderless transparent />
                    </PopoverContent>
                </PopoverPortal>
            </PopoverRoot>
        </div>

        <p v-if="error" class="text-sm text-destructive">
            {{ error }}
        </p>
        <p v-else class="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
            Format: DD/MM/YYYY (contoh: 15/08/2005)
        </p>
    </div>
</template>

<style scoped>
:deep(.vc-container) {
    border: none;
    font-family: inherit;
    --vc-font-family: inherit;
    --vc-rounded-full: 1rem;
    background-color: transparent;
}

:deep(.vc-pane-layout) {
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
    padding: 1.25rem;
}

:deep(.vc-header) {
    padding: 0 0 1.25rem 0;
    margin-bottom: 0.5rem;
}

:deep(.vc-title) {
    font-weight: 900;
    font-size: 0.8125rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: hsl(var(--foreground));
}

:deep(.vc-arrow) {
    border-radius: 0.875rem;
    padding: 0.5rem;
    transition: all 0.2s;
}

:deep(.vc-arrow:hover) {
    background-color: hsl(var(--primary) / 0.08);
}

:deep(.vc-arrow svg) {
    width: 1rem;
    height: 1rem;
    color: hsl(var(--primary));
}

:deep(.vc-weeks) {
    padding: 0;
    margin-top: 0.5rem;
}

:deep(.vc-weekday) {
    color: hsl(var(--muted-foreground) / 0.6);
    font-size: 0.6875rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 0.5rem 0;
}

:deep(.vc-day) {
    margin: 1px;
}

:deep(.vc-day-content) {
    border-radius: 0.875rem;
    font-weight: 700;
    font-size: 0.8125rem;
    width: 2.5rem;
    height: 2.5rem;
    transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
}

:deep(.vc-day-content:hover) {
    background-color: hsl(var(--primary) / 0.08);
    transform: scale(1.05);
}

:deep(.vc-day-content:focus) {
    background-color: hsl(var(--primary) / 0.12);
    outline: none;
}

:deep(.vc-highlight-content-solid) {
    background-color: hsl(var(--primary));
    color: hsl(var(--primary-foreground));
    font-weight: 900;
    box-shadow: 0 2px 8px hsl(var(--primary) / 0.25);
}

:deep(.vc-highlight-content-light) {
    background-color: hsl(var(--primary) / 0.12);
    color: hsl(var(--primary));
    font-weight: 800;
    border: 1.5px solid hsl(var(--primary) / 0.2);
}

:deep(.vc-day-content.is-disabled) {
    opacity: 0.25;
    cursor: not-allowed;
}

:deep(.vc-day-content.is-disabled:hover) {
    background-color: transparent;
    transform: none;
}

/* Today indicator - subtle ring */
:deep(.vc-day.is-today .vc-day-content:not(.vc-highlight-content-solid)) {
    position: relative;
}

:deep(.vc-day.is-today .vc-day-content:not(.vc-highlight-content-solid)::after) {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 0.875rem;
    border: 2px solid hsl(var(--primary) / 0.3);
    pointer-events: none;
}
</style>
