<script setup>
import { ref, watch, computed } from 'vue';
import Button from '@/components/ui/button/Button.vue';
import {
    TagIcon,
    IdentificationIcon,
    CursorArrowRaysIcon,
    ExclamationTriangleIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
    mode: {
        type: String,
        default: 'create'
    },
    initialData: {
        type: Object,
        default: () => null
    },
    categories: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['submit', 'cancel']);

const formData = ref({
    category: '',
    id: '',
    label: '',
    idModified: false
});

const errors = ref({});

watch(() => props.initialData, (newVal) => {
    if (newVal) {
        formData.value = { ...newVal, idModified: true };
    } else {
        formData.value = { category: '', id: '', label: '', idModified: false };
    }
}, { immediate: true });

// Auto-generate ID logic (Enhanced)
watch(() => formData.value.label, (newLabel) => {
    if (props.mode === 'create' && newLabel && !formData.value.idModified) {
        // Advanced slugify
        formData.value.id = newLabel
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '') // remove special chars
            .trim()
            .replace(/\s+/g, '.'); // spaces to dots
    }
});

const onIdChange = () => {
    formData.value.idModified = true;
};

const validate = () => {
    errors.value = {};
    if (!formData.value.category) errors.value.category = 'Required';
    if (!formData.value.id) errors.value.id = 'Required';
    if (!formData.value.label) errors.value.label = 'Required';
    if (formData.value.id && !/^[a-z0-9.]+$/.test(formData.value.id)) {
        errors.value.id = 'Format: lowercase.dots';
    }
    return Object.keys(errors.value).length === 0;
};

const handleSubmit = () => {
    if (!validate()) return;
    emit('submit', formData.value);
};

// Filter categories for autocomplete
const filteredCategories = computed(() => {
    return props.categories.filter(c => !formData.value.category || c.toLowerCase().includes(formData.value.category.toLowerCase()));
});
</script>

<template>
    <div class="space-y-8">
        <!-- Visual Hint -->
        <div class="bg-primary/[0.03] border border-primary/5 rounded-2xl p-4 flex items-start gap-4">
            <div class="p-2 bg-primary/10 rounded-xl text-primary shrink-0">
                <IdentificationIcon class="w-5 h-5" />
            </div>
            <div>
                <h4 class="text-sm font-bold text-foreground">Definition Guidelines</h4>
                <p class="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Permissions define what users can do. Group them by category (e.g., "Finance") and use a
                    standardized ID format (e.g., "finance.view").
                </p>
            </div>
        </div>

        <div class="space-y-6">
            <!-- Category Input -->
            <div class="space-y-2 group">
                <label
                    class="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 group-focus-within:text-primary transition-colors">
                    <TagIcon class="w-4 h-4" /> Category
                </label>
                <div class="relative">
                    <input v-model="formData.category" list="categories-options" type="text"
                        placeholder="Select or type new category..."
                        class="w-full px-4 py-3.5 bg-background border-2 border-muted/20 rounded-xl text-sm font-bold focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:font-normal"
                        :class="{ 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/10': errors.category }" />
                    <datalist id="categories-options">
                        <option v-for="cat in categories" :key="cat" :value="cat" />
                    </datalist>

                    <span v-if="errors.category"
                        class="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-rose-500 flex items-center gap-1">
                        <ExclamationTriangleIcon class="w-4 h-4" /> {{ errors.category }}
                    </span>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Label Input -->
                <div class="space-y-2 group">
                    <label
                        class="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 group-focus-within:text-primary transition-colors">
                        <CursorArrowRaysIcon class="w-4 h-4" /> Label Name
                    </label>
                    <div class="relative">
                        <input v-model="formData.label" type="text" placeholder="e.g. View Reports"
                            class="w-full px-4 py-3.5 bg-background border-2 border-muted/20 rounded-xl text-sm font-bold focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:font-normal"
                            :class="{ 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/10': errors.label }" />
                        <span v-if="errors.label"
                            class="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-rose-500 flex items-center gap-1">
                            <ExclamationTriangleIcon class="w-4 h-4" /> {{ errors.label }}
                        </span>
                    </div>
                </div>

                <!-- ID Input -->
                <div class="space-y-2 group">
                    <label
                        class="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 group-focus-within:text-primary transition-colors">
                        <IdentificationIcon class="w-4 h-4" /> System ID
                    </label>
                    <div class="relative">
                        <input v-model="formData.id" @input="onIdChange" type="text" placeholder="e.g. reports.view"
                            class="w-full px-4 py-3.5 bg-muted/30 border-2 border-muted/20 rounded-xl text-sm font-mono font-medium focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:font-normal"
                            :class="{ 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/10': errors.id }" />
                        <span v-if="errors.id"
                            class="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-rose-500 flex items-center gap-1">
                            <ExclamationTriangleIcon class="w-4 h-4" /> {{ errors.id }}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex justify-between items-center pt-6 border-t border-primary/5">
            <button type="button" @click="$emit('cancel')"
                class="px-6 py-3 font-bold text-sm text-muted-foreground hover:text-foreground transition-colors">
                Cancel
            </button>
            <button type="button" @click="handleSubmit"
                class="px-8 py-3 bg-primary text-primary-foreground font-bold text-sm rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all">
                {{ mode === 'create' ? 'Create Permission' : 'Save Changes' }}
            </button>
        </div>
    </div>
</template>
