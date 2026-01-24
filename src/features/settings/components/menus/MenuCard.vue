<script setup>
import { ref, computed } from 'vue';
import {
    FolderIcon,
    Bars3Icon,
    KeyIcon,
    PencilIcon,
    TrashIcon,
    ChevronDownIcon,
    PlusIcon,
    ShieldCheckIcon
} from '@heroicons/vue/24/outline';
import { useRoleStore } from '@/stores/role';

const props = defineProps({
    menu: {
        type: Object,
        required: true
    },
    depth: {
        type: Number,
        default: 0
    }
});

const emit = defineEmits([
    'add-permission',
    'edit-permission',
    'delete-permission',
    'add-submenu',
    'edit-menu',
    'delete-menu'
]);

const roleStore = useRoleStore();
const isOpen = ref(false);

const toggle = () => isOpen.value = !isOpen.value;

// Get permissions for key/label
const permissions = computed(() => {
    return roleStore.availablePermissions[props.menu.label] || [];
});

const hasChildren = computed(() => {
    return (props.menu.children && props.menu.children.length > 0);
});

const hasPermissions = computed(() => permissions.value.length > 0);

// Dynamic coloring based on depth
const cardColors = [
    'bg-white dark:bg-zinc-900', // Root
    'bg-muted/30', // Depth 1
    'bg-muted/50'  // Depth 2+
];

const bgClass = computed(() => {
    return cardColors[Math.min(props.depth, 2)];
});

</script>

<template>
    <div class="rounded-2xl transition-all duration-300 group shadow-sm hover:shadow-md"
        :class="[bgClass, isOpen ? 'shadow-lg ring-1 ring-black/5 dark:ring-white/5' : '']">

        <!-- Card Header (Clickable) -->
        <div class="px-5 py-4 flex items-center gap-4 cursor-pointer select-none" @click="toggle">

            <!-- Icon Box -->
            <div class="w-10 h-10 rounded-xl flex items-center justify-center transition-colors" :class="[
                hasChildren || hasPermissions ? 'bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10' : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800',
                isOpen ? 'bg-primary text-primary-foreground' : ''
            ]">
                <component :is="hasChildren ? FolderIcon : Bars3Icon" class="w-5 h-5" />
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                    <h3 class="font-bold text-base text-foreground truncate">{{ menu.label }}</h3>
                    <span v-if="permissions.length"
                        class="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        {{ permissions.length }} Perms
                    </span>
                </div>
                <p v-if="menu.to" class="text-xs font-mono text-muted-foreground truncate">{{ menu.to }}</p>
                <p v-else class="text-xs text-muted-foreground italic">Group</p>
            </div>

            <!-- Expander / Quick Actions -->
            <div class="flex items-center gap-2">
                <div
                    class="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button @click.stop="$emit('edit-menu', menu)"
                        class="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-muted-foreground hover:text-foreground transition-colors">
                        <PencilIcon class="w-4 h-4" />
                    </button>
                    <button @click.stop="$emit('delete-menu', menu)"
                        class="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-muted-foreground hover:text-rose-500 transition-colors">
                        <TrashIcon class="w-4 h-4" />
                    </button>
                </div>

                <ChevronDownIcon class="w-5 h-5 text-muted-foreground transition-transform duration-300"
                    :class="{ 'rotate-180': isOpen }" />
            </div>
        </div>

        <!-- Expanded Body -->
        <div v-show="isOpen" class="px-5 pb-5 pt-0 space-y-6">
            <div class="h-px w-full bg-gradient-to-r from-transparent via-border/50 to-transparent mb-4"></div>

            <!-- Permissions Section -->
            <div class="space-y-3">
                <div class="flex items-center justify-between">
                    <h4
                        class="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <ShieldCheckIcon class="w-3.5 h-3.5" /> Permissions
                    </h4>
                    <button @click.stop="$emit('add-permission', menu)"
                        class="text-[10px] font-bold flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-foreground hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                        <PlusIcon class="w-3 h-3" /> Add Access
                    </button>
                </div>

                <div v-if="permissions.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div v-for="perm in permissions" :key="perm.id"
                        class="group/perm p-2 rounded-xl bg-background shadow-sm flex items-center justify-between hover:shadow-md transition-all">
                        <div class="flex items-center gap-2 min-w-0">
                            <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></div>
                            <span class="text-xs font-medium truncate text-foreground">{{ perm.label }}</span>
                        </div>
                        <div class="flex opacity-0 group-hover/perm:opacity-100 transition-opacity gap-1">
                            <button @click.stop="$emit('edit-permission', perm, menu)" class="p-1 hover:text-primary">
                                <PencilIcon class="w-3 h-3" />
                            </button>
                            <button @click.stop="$emit('delete-permission', perm)" class="p-1 hover:text-rose-500">
                                <TrashIcon class="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>
                <div v-else class="text-xs text-muted-foreground italic pl-1">
                    No explicit permissions assigned.
                </div>
            </div>

            <!-- Submenus Section -->
            <div class="space-y-3">
                <div class="flex items-center justify-between">
                    <h4
                        class="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <FolderIcon class="w-3.5 h-3.5" /> Sub Menus
                    </h4>
                    <button @click.stop="$emit('add-submenu', menu)"
                        class="text-[10px] font-bold flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                        <PlusIcon class="w-3 h-3" /> Add Sub-menu
                    </button>
                </div>

                <div v-if="menu.children && menu.children.length > 0" class="space-y-3">
                    <!-- Recursion -->
                    <MenuCard v-for="child in menu.children" :key="child.id" :menu="child" :depth="depth + 1"
                        @add-permission="$emit('add-permission', $event)"
                        @edit-permission="(p, m) => $emit('edit-permission', p, m)"
                        @delete-permission="$emit('delete-permission', $event)"
                        @add-submenu="$emit('add-submenu', $event)" @edit-menu="$emit('edit-menu', $event)"
                        @delete-menu="$emit('delete-menu', $event)" />
                </div>
                <div v-else class="text-xs text-muted-foreground italic pl-1">
                    No sub-menus.
                </div>
            </div>
        </div>
    </div>
</template>
