<script setup>
import { ref, watch, computed } from 'vue';
import {
    TagIcon,
    IdentificationIcon,
    CursorArrowRaysIcon,
    ExclamationTriangleIcon,
    FolderIcon,
    ChevronDownIcon,
    Bars3Icon
} from '@heroicons/vue/24/outline';
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/vue';

const props = defineProps({
    mode: {
        type: String,
        default: 'create'
    },
    initialData: {
        type: Object,
        default: () => null
    },
    menus: {
        type: Array, // Now receiving actual menu objects
        default: () => []
    }
});

const emit = defineEmits(['submit', 'cancel']);

const formData = ref({
    category: '', // Will store menu Label or ID. Storing Label for compat with existing data.
    id: '',
    label: '',
    idModified: false,
    selectedMenu: null // Store selected menu object
});

const errors = ref({});

// Flatten menus for select (handling only 1 level deep for simplicity in dropdown display for now, or just flat list)
// Ideally, we show hierarchy.
// props.menus is expected to be a flat list of all menus from menuStore.
const availableMenus = computed(() => {
    return props.menus.sort((a, b) => (a.label || '').localeCompare(b.label || ''));
});

watch(() => props.initialData, (newVal) => {
    if (newVal) {
        // If editing, find the menu that matches the "category"
        // category in permission data corresponds to menu label currently
        const matchingMenu = availableMenus.value.find(m => m.label === newVal.category || m.label === newVal.menu);

        formData.value = {
            ...newVal,
            idModified: true,
            selectedMenu: matchingMenu || null,
            category: newVal.category || (matchingMenu ? matchingMenu.label : '')
        };
    } else {
        formData.value = { category: '', id: '', label: '', idModified: false, selectedMenu: null };
    }
}, { immediate: true });

// Sync selectedMenu to category field
watch(() => formData.value.selectedMenu, (newMenu) => {
    if (newMenu) {
        formData.value.category = newMenu.label;
    }
});

// Auto-generate ID logic (Enhanced)
watch(() => formData.value.label, (newLabel) => {
    if (props.mode === 'create' && newLabel && !formData.value.idModified) {
        // Advanced slugify
        formData.value.id = newLabel
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '') // remove special chars
            .trim()
            .replace(/\s+/g, '.'); // spaces to dots

        // Prefix with menu name if available for standard naming
        if (formData.value.selectedMenu) {
            const prefix = formData.value.selectedMenu.label.toLowerCase().replace(/[^a-z0-9]/g, '');
            // formData.value.id = `${prefix}.${formData.value.id}`; // Optional: Enforce naming convention
        }
    }
});

const onIdChange = () => {
    formData.value.idModified = true;
};

const validate = () => {
    errors.value = {};
    if (!formData.value.selectedMenu && !formData.value.category) errors.value.category = 'Required';
    if (!formData.value.id) errors.value.id = 'Required';
    if (!formData.value.label) errors.value.label = 'Required';
    if (formData.value.id && !/^[a-z0-9.]+$/.test(formData.value.id)) {
        errors.value.id = 'Format: lowercase.dots';
    }
    return Object.keys(errors.value).length === 0;
};

const handleSubmit = () => {
    if (!validate()) return;
    // Map selected menu back to category string for compatibility
    // In future this would be { menuId: selectedMenu.id }
    const submitData = {
        ...formData.value,
        category: formData.value.selectedMenu ? formData.value.selectedMenu.label : formData.value.category
    };
    emit('submit', submitData);
};
</script>

<template>
    <div class="space-y-8">
        <!-- Visual Hint -->
        <div class="bg-primary/[0.03] border border-primary/5 rounded-2xl p-4 flex items-start gap-4">
            <div class="p-2 bg-primary/10 rounded-xl text-primary shrink-0">
                <IdentificationIcon class="w-5 h-5" />
            </div>
            <div>
                <h4 class="text-sm font-bold text-foreground">Permission Definition</h4>
                <p class="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Link this permission to a specific Application Menu. This ensures it appears correctly in the
                    menu-based access control list.
                </p>
            </div>
        </div>

        <div class="space-y-6">
            <!-- Menu Selection (Replacing Category Text Input) -->
            <div class="space-y-2 group z-50 relative">
                <label
                    class="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 group-focus-within:text-primary transition-colors">
                    <FolderIcon class="w-4 h-4" /> Linked Menu
                </label>

                <Listbox v-model="formData.selectedMenu">
                    <div class="relative mt-1">
                        <ListboxButton
                            class="relative w-full cursor-default rounded-xl bg-background py-3.5 pl-4 pr-10 text-left border-2 border-muted/20 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 sm:text-sm shadow-sm transition-all"
                            :class="{ 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/10': errors.category }">
                            <span class="block truncate font-bold text-foreground" v-if="formData.selectedMenu">{{
                                formData.selectedMenu.label }}</span>
                            <span class="block truncate text-muted-foreground font-normal" v-else>Select a
                                menu...</span>
                            <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                <ChevronDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </span>
                        </ListboxButton>

                        <transition leave-active-class="transition duration-100 ease-in" leave-from-class="opacity-100"
                            leave-to-class="opacity-0">
                            <ListboxOptions
                                class="absolute mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
                                <ListboxOption v-for="menu in availableMenus" :key="menu.id" :value="menu" as="template"
                                    v-slot="{ active, selected }">
                                    <li :class="[
                                        active ? 'bg-primary/10 text-primary' : 'text-foreground',
                                        'relative cursor-default select-none py-2.5 pl-10 pr-4'
                                    ]">
                                        <span :class="[selected ? 'font-bold' : 'font-normal', 'block truncate']">
                                            {{ menu.label }}
                                        </span>
                                        <span v-if="selected"
                                            class="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                                            <Bars3Icon class="h-5 w-5" aria-hidden="true" />
                                        </span>
                                        <span v-else
                                            class="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground/30">
                                            <FolderIcon class="h-4 w-4" />
                                        </span>
                                        <!-- Show path if available for context -->
                                        <span v-if="menu.to"
                                            class="ml-2 truncate text-xs text-muted-foreground font-mono opacity-60">
                                            {{ menu.to }}
                                        </span>
                                    </li>
                                </ListboxOption>
                            </ListboxOptions>
                        </transition>
                    </div>
                </Listbox>

                <span v-if="errors.category" class="text-xs font-bold text-rose-500 flex items-center gap-1 mt-1">
                    <ExclamationTriangleIcon class="w-4 h-4" /> {{ errors.category }}
                </span>
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
