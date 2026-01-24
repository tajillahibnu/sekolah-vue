<script setup>
import { ref, watch, computed } from 'vue';
import { useMenuStore } from '@/stores/menu';
import {
    Squares2X2Icon,
    FolderIcon,
    LinkIcon,
    Bars3Icon
} from '@heroicons/vue/24/outline';

const props = defineProps({
    mode: { type: String, default: 'create' },
    initialData: { type: Object, default: () => null }
});

const emit = defineEmits(['submit', 'cancel']);
const menuStore = useMenuStore();

const formData = ref({
    label: '',
    to: '',
    parentId: null,
    icon: 'Bars3Icon' // Default icon
});

const errors = ref({});

// Generate a flat list with indentation for the selector
const flattenedMenuOptions = computed(() => {
    const options = [];

    const traverse = (nodes, depth = 0) => {
        nodes.forEach(node => {
            // Prevent selecting self or children if editing (circular reference check)
            if (props.mode === 'edit' && props.initialData) {
                if (node.id === props.initialData.id) return;
                // Note: this simple check doesn't block children of self, 
                // but for a mock depth=1 or 2 it's okay. 
                // Ideally we'd filter out the entire subtree of self.
            }

            options.push({
                id: node.id,
                label: node.label,
                depth
            });

            if (node.children && node.children.length > 0) {
                traverse(node.children, depth + 1);
            }
        });
    };

    traverse(menuStore.menuTree);
    return options;
});

// Helper for indentation visual
const getIndent = (depth) => {
    return '\u00A0\u00A0\u00A0\u00A0'.repeat(depth); // 4 non-breaking spaces per depth
};

// Flattened menus for parent selection (excluding self if editing)
// const potentialParents = computed(() => {
//     let menus = menuStore.allMenus;
//     if (props.mode === 'edit' && props.initialData) {
//         // Prevent selecting self or children as parent (simplistic circular check)
//         menus = menus.filter(m => m.id !== props.initialData.id);
//     }
//     return menus;
// });

watch(() => props.initialData, (newVal) => {
    if (newVal) {
        formData.value = {
            label: newVal.label || '',
            to: newVal.to || '',
            parentId: newVal.parentId || null,
            icon: newVal.icon || 'Bars3Icon'
        };
    }
}, { immediate: true });

const validate = () => {
    errors.value = {};
    if (!formData.value.label.trim()) errors.value.label = 'Label is required';
    if (!formData.value.to && !formData.value.parentId) {
        // Root menus usually point somewhere, submenus might too
        // Can be optional for groupings, but let's encourage having a path or children
    }
    return Object.keys(errors.value).length === 0;
};

const handleSubmit = () => {
    if (!validate()) return;
    emit('submit', formData.value);
};
</script>

<template>
    <div class="space-y-6">
        <!-- Label -->
        <div class="space-y-2">
            <label class="text-xs font-bold uppercase tracking-widest text-muted-foreground">Menu Label</label>
            <input v-model="formData.label" type="text" placeholder="e.g. Dashboard"
                class="w-full px-4 py-3 bg-background border-2 border-border/40 rounded-xl font-bold text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                :class="{ 'border-rose-500': errors.label }" />
            <p v-if="errors.label" class="text-xs text-rose-500 font-medium">{{ errors.label }}</p>
        </div>

        <!-- Route Path -->
        <div class="space-y-2">
            <label class="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <LinkIcon class="w-4 h-4" /> Route Path
            </label>
            <input v-model="formData.to" type="text" placeholder="e.g. /admin/dashboard"
                class="w-full px-4 py-3 bg-background border-2 border-border/40 rounded-xl font-medium text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none" />
        </div>

        <!-- Parent Menu -->
        <div class="space-y-2">
            <label class="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <FolderIcon class="w-4 h-4" /> Parent Menu
            </label>
            <div class="relative">
                <select v-model="formData.parentId"
                    class="w-full pl-4 pr-10 py-3 bg-background border-2 border-border/40 rounded-xl font-medium text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none appearance-none">
                    <option :value="null">No Parent (Root Menu)</option>
                    <option v-for="menu in flattenedMenuOptions" :key="menu.id" :value="menu.id">
                        {{ getIndent(menu.depth) }} {{ menu.depth > 0 ? '↳ ' : '' }}{{ menu.label }}
                    </option>
                </select>
                <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                    <FolderIcon class="w-4 h-4" />
                </div>
            </div>
            <p class="text-[10px] text-muted-foreground">Select a parent to nest this menu item.</p>
        </div>

        <!-- Actions -->
        <div class="pt-4 flex justify-end gap-3">
            <button @click="$emit('cancel')"
                class="px-6 py-2.5 font-bold text-sm text-muted-foreground hover:text-foreground transition-colors">
                Cancel
            </button>
            <button @click="handleSubmit"
                class="px-8 py-2.5 bg-primary text-primary-foreground font-bold text-sm rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all">
                {{ mode === 'create' ? 'Create Menu' : 'Save Changes' }}
            </button>
        </div>
    </div>
</template>
