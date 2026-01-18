<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import {
    ComboboxRoot,
    ComboboxInput,
    ComboboxTrigger,
    ComboboxContent,
    ComboboxViewport,
    ComboboxItem,
    ComboboxItemIndicator,
    ComboboxEmpty,
    ComboboxGroup,
    ComboboxLabel,
    ComboboxAnchor,
    ComboboxPortal
} from 'radix-vue'
import { CheckIcon, ChevronUpDownIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import { cn } from '@/lib/utils'
import api from '@/services/api';

const props = defineProps({
    modelValue: { type: [String, Object], required: false },
    options: { type: Array, default: () => [] }, // Static options: Array of { value, label }
    apiUrl: { type: String, default: '' }, // Server mode: Endpoint URL
    queryKey: { type: String, default: 'q' }, // Server mode: Query param name
    valueKey: { type: String, default: 'value' }, // Custom value field name
    labelKey: { type: String, default: 'label' }, // Custom label field name
    defaultLimit: { type: Number, default: 15 }, // Default limit for server options
    placeholder: { type: String, default: 'Select option...' },
    searchPlaceholder: { type: String, default: 'Search...' },
    emptyText: { type: String, default: 'No results found.' },
    disabled: { type: Boolean, default: false },
    class: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'update:open'])

const open = ref(false)
const searchTerm = ref('')
const serverOptions = ref([])
const isLoading = ref(false)

// Unified options processing
const unifiedOptions = computed(() => {
    if (props.apiUrl) return serverOptions.value; // Already normalized in fetchOptions

    return props.options.map(opt => {
        // Handle if option is just a string (fallback safety)
        if (typeof opt === 'string') return { value: opt, label: opt };

        return {
            value: opt[props.valueKey] || opt.value,
            label: opt[props.labelKey] || opt.label,
            original: opt
        }
    });
})

const modelValueProxy = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
})

// Handle selection display
const selectedLabel = computed(() => {
    const selected = unifiedOptions.value.find(opt => opt.value === props.modelValue)
    return selected ? selected.label : (props.modelValue || props.placeholder)
})

// Filter logic
const filteredOptions = computed(() => {
    const options = unifiedOptions.value;
    // If server mode, respect server results directly (don't double filter)
    if (props.apiUrl) return options;

    if (!searchTerm.value) return options;

    return options.filter(option =>
        String(option.label).toLowerCase().includes(searchTerm.value.toLowerCase())
    );
})

// Fetch data from server
const fetchOptions = async (query = '') => {
    if (!props.apiUrl) return;

    isLoading.value = true;
    try {
        const params = {
            limit: props.defaultLimit
        };
        if (query) params[props.queryKey] = query;

        const response = await api.get(props.apiUrl, { params });
        // Assume response.data is an array of object. If wrapped, adjust here.
        // Normalize based on custom keys
        serverOptions.value = response.data.map(item => ({
            value: item[props.valueKey] !== undefined ? item[props.valueKey] : (item.value || item.id),
            label: item[props.labelKey] !== undefined ? item[props.labelKey] : (item.label || item.name)
        }));
    } catch (error) {
        console.error('Combobox fetch error:', error);
    } finally {
        isLoading.value = false;
    }
}

const filterFunction = (list) => {
    return list;
}

// Debounce helper
let debounceTimer = null;
const debouncedFetch = (query) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        fetchOptions(query);
    }, 300);
};

// Watch open state to ensure data is fetched if not present (retry mechanism)
watch(open, (isOpen) => {
    if (isOpen && props.apiUrl && serverOptions.value.length === 0 && !isLoading.value) {
        fetchOptions();
    }
})

// Initial Fetch if Server Mode
onMounted(() => {
    if (props.apiUrl) {
        fetchOptions();
    }
})

// Watch search term for Server Mode
watch(searchTerm, (newTerm) => {
    if (props.apiUrl) {
        debouncedFetch(newTerm);
    }
})
</script>

<template>
    <ComboboxRoot v-model="modelValueProxy" v-model:open="open" v-model:searchTerm="searchTerm" class="relative"
        :filter-function="filterFunction" @update:model-value="emit('update:modelValue', $event)">
        <ComboboxAnchor class="relative w-full">
            <div class="flex h-12 w-full items-center justify-between rounded-2xl border border-primary/5 bg-primary/[0.03] px-5 py-2 text-sm font-medium ring-offset-background placeholder:text-muted-foreground/50 focus-within:ring-4 focus-within:ring-primary/5 focus-within:border-primary/20 focus-within:bg-background transition-all shadow-sm shadow-primary/5 lg:w-full"
                :class="[disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text']"
                @click="!disabled && (open = true)">
                <span v-if="!open" class="truncate opacity-50">{{ selectedLabel }}</span>
                <ComboboxInput v-else
                    class="flex h-full w-full bg-transparent outline-none placeholder:text-muted-foreground"
                    :placeholder="searchPlaceholder" />
                <ComboboxTrigger class="ml-2">
                    <ChevronUpDownIcon class="h-4 w-4 opacity-50" />
                </ComboboxTrigger>
            </div>
        </ComboboxAnchor>

        <ComboboxContent
            class="absolute z-50 mt-1 max-h-60 w-full min-w-[var(--radix-combobox-trigger-width)] overflow-hidden rounded-2xl border border-primary/10 bg-background shadow-2xl shadow-primary/10">
            <ComboboxViewport class="p-1">
                <div v-if="isLoading" class="py-2 text-center text-sm text-muted-foreground">
                    Loading...
                </div>
                <div v-if="filteredOptions.length === 0 && !isLoading"
                    class="py-2 text-center text-sm text-muted-foreground">
                    {{ emptyText }}
                </div>

                <ComboboxItem v-for="option in filteredOptions" :key="option.value" :value="option.value"
                    class="relative flex cursor-default select-none items-center rounded-xl py-2.5 pl-8 pr-2 text-sm font-medium outline-none data-[highlighted]:bg-primary/5 data-[highlighted]:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors">
                    <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                        <ComboboxItemIndicator>
                            <CheckIcon class="h-4 w-4" />
                        </ComboboxItemIndicator>
                    </span>
                    <span>{{ option.label }}</span>
                </ComboboxItem>
            </ComboboxViewport>
        </ComboboxContent>
    </ComboboxRoot>
</template>
