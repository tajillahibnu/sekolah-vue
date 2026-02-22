<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { refDebounced, useIntersectionObserver } from '@vueuse/core';
import {
    MagnifyingGlassIcon,
    CheckCircleIcon,
    ChevronDownIcon,
    ArrowPathIcon
} from '@heroicons/vue/24/outline';
import api from '@/services/api';

const props = defineProps({
    modelValue: {
        type: [String, Number],
        default: ''
    },
    placeholder: {
        type: String,
        default: 'Pilih...'
    },
    apiUrl: {
        type: String,
        required: true
    },
    queryParam: {
        type: String,
        default: 'q'
    },
    label: {
        type: String,
        default: ''
    },
    icon: {
        type: Object,
        default: null
    },
    allOption: {
        type: Object,
        default: () => ({ value: '', label: 'Semua' })
    }
});

const emit = defineEmits(['update:modelValue', 'change']);

const internalValue = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
});

const showDropdown = ref(false);
const search = ref('');
const debouncedSearch = refDebounced(search, 500);
const options = ref([]);
const page = ref(1);
const hasMore = ref(true);
const loading = ref(false);
const loadMoreTrigger = ref(null);

const fetchOptions = async (reset = false) => {
    if (reset) {
        page.value = 1;
        options.value = [];
        hasMore.value = true;
    }

    if (!hasMore.value || loading.value) return;

    loading.value = true;
    try {
        const response = await api.get(props.apiUrl, {
            params: {
                [props.queryParam]: debouncedSearch.value,
                page: page.value,
                limit: 10
            }
        });

        const newOptions = response.data.data.map(item => ({
            value: item.id,
            label: item.name
        }));

        options.value = [...options.value, ...newOptions];
        hasMore.value = response.data.meta.has_more;
        if (hasMore.value) {
            page.value++;
        }
    } catch (error) {
        console.error('Failed to fetch options', error);
    } finally {
        loading.value = false;
    }
};

useIntersectionObserver(loadMoreTrigger, ([{ isIntersecting }]) => {
    if (isIntersecting && hasMore.value && !loading.value) {
        fetchOptions();
    }
});

watch(debouncedSearch, () => {
    fetchOptions(true);
});

onMounted(() => {
    fetchOptions();
});

const selectedOption = computed(() => {
    if (internalValue.value === props.allOption.value) return props.allOption;
    return options.value.find(opt => opt.value === internalValue.value) || { value: internalValue.value, label: internalValue.value };
});

const handleSelect = (option) => {
    internalValue.value = option.value;
    showDropdown.value = false;
    emit('change', option.value);
};
</script>

<template>
    <div class="relative w-full">
        <label v-if="label"
            class="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 block px-1">
            {{ label }}
        </label>

        <div class="relative">
            <button @click="showDropdown = !showDropdown" type="button"
                class="w-full h-12 px-4 flex items-center justify-between bg-primary/5 hover:bg-primary/10 border-transparent rounded-2xl font-bold transition-all text-sm"
                :class="{ 'ring-2 ring-primary/20 bg-background shadow-lg shadow-primary/5': showDropdown }">
                <div class="flex items-center gap-2.5 truncate">
                    <component :is="icon" v-if="icon" class="w-4 h-4 text-primary shrink-0" />
                    <span class="truncate" :class="internalValue !== '' ? 'text-foreground' : 'text-muted-foreground'">
                        {{ selectedOption ? selectedOption.label : placeholder }}
                    </span>
                </div>
                <ChevronDownIcon class="w-4 h-4 text-muted-foreground transition-transform shrink-0"
                    :class="{ 'rotate-180': showDropdown }" />
            </button>

            <!-- Dropdown Content -->
            <div v-if="showDropdown"
                class="absolute top-full left-0 right-0 mt-2 z-[100] bg-card border border-primary/10 rounded-[28px] shadow-2xl p-1.5 animate-in fade-in slide-in-from-top-2 duration-200">

                <!-- Search Input -->
                <div class="p-1 mb-1.5 sticky top-0 bg-card z-10 border-b border-primary/5">
                    <div class="relative group">
                        <MagnifyingGlassIcon
                            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input v-model="search" type="text" :placeholder="`Cari ${label.toLowerCase()}...`"
                            class="w-full pl-9 pr-3 py-2.5 bg-primary/5 border-transparent rounded-xl text-xs font-bold focus:bg-background focus:ring-2 focus:ring-primary/10 transition-all border-0" />
                    </div>
                </div>

                <!-- Options List -->
                <div class="max-h-[250px] overflow-y-auto custom-scrollbar px-0.5 space-y-0.5">
                    <!-- All Option -->
                    <button @click="handleSelect(allOption)"
                        class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left"
                        :class="internalValue === allOption.value ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'hover:bg-primary/10 text-muted-foreground hover:text-foreground'">
                        <span>{{ allOption.label }}</span>
                        <CheckCircleIcon v-if="internalValue === allOption.value" class="w-4 h-4" />
                    </button>

                    <button v-for="option in options" :key="option.value" @click="handleSelect(option)"
                        class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left"
                        :class="internalValue === option.value ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'hover:bg-primary/10 text-muted-foreground hover:text-foreground'">
                        <span>{{ option.label }}</span>
                        <CheckCircleIcon v-if="internalValue === option.value" class="w-4 h-4" />
                    </button>

                    <!-- Load More / Loading State -->
                    <div ref="loadMoreTrigger" class="p-3 flex justify-center">
                        <div v-if="loading"
                            class="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            <ArrowPathIcon class="w-3.5 h-3.5 animate-spin" />
                            Memuat...
                        </div>
                        <div v-else-if="!hasMore && options.length > 0"
                            class="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] text-center pt-2 pb-1">
                            Akhir dari daftar
                        </div>
                        <div v-else-if="options.length === 0 && !loading"
                            class="text-xs font-bold text-muted-foreground text-center py-4">
                            Data tidak ditemukan
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Backdrop Backdrop overlay to close when clicking outside -->
        <div v-if="showDropdown" @click="showDropdown = false" class="fixed inset-0 z-[90]"></div>
    </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 5px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(var(--primary), 0.1);
    border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(var(--primary), 0.2);
}
</style>
