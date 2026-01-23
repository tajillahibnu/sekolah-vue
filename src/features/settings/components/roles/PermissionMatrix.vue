<script setup>
import { computed, ref } from 'vue';
import { ChevronDownIcon, CheckIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline'; // Using heroes for checks if needed, or pure CSS

const props = defineProps({
    modelValue: {
        type: Array,
        default: () => []
    },
    permissions: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['update:modelValue']);
const searchQuery = ref('');

// Computed filtered permissions for search within the matrix
const filteredGroupedPermissions = computed(() => {
    if (!searchQuery.value) return props.permissions;
    const query = searchQuery.value.toLowerCase();
    const result = {};

    for (const [groupName, perms] of Object.entries(props.permissions)) {
        const matches = perms.filter(p =>
            p.label.toLowerCase().includes(query) ||
            p.id.toLowerCase().includes(query) ||
            groupName.toLowerCase().includes(query)
        );

        if (matches.length > 0) {
            result[groupName] = matches;
        }
    }
    return result;
});

// Helpers
const isGroupSelected = (groupPermissions) => {
    return groupPermissions.length > 0 && groupPermissions.every(p => props.modelValue.includes(p.id));
};

const isGroupIndeterminate = (groupPermissions) => {
    const selectedCount = groupPermissions.filter(p => props.modelValue.includes(p.id)).length;
    return selectedCount > 0 && selectedCount < groupPermissions.length;
};

const toggleGroup = (groupPermissions) => {
    let newPermissions = [...props.modelValue];
    const allIds = groupPermissions.map(p => p.id);

    if (isGroupSelected(groupPermissions)) {
        // Deselect all
        newPermissions = newPermissions.filter(id => !allIds.includes(id));
    } else {
        // Select all (add missing ones)
        allIds.forEach(id => {
            if (!newPermissions.includes(id)) {
                newPermissions.push(id);
            }
        });
    }
    emit('update:modelValue', newPermissions);
};

const togglePermission = (id) => {
    let newPermissions = [...props.modelValue];
    if (newPermissions.includes(id)) {
        newPermissions = newPermissions.filter(p => p !== id);
    } else {
        newPermissions.push(id);
    }
    emit('update:modelValue', newPermissions);
};
</script>

<template>
    <div class="space-y-6">
        <!-- Matrix Search -->
        <div class="sticky top-0 z-10 pb-4 bg-background">
            <div class="relative">
                <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input v-model="searchQuery" type="text" placeholder="Filter permissions..."
                    class="w-full pl-9 pr-4 py-2 bg-muted/30 border border-transparent rounded-xl text-sm font-medium focus:bg-background focus:border-primary/20 focus:ring-2 focus:ring-primary/10 outline-none transition-all" />
            </div>
        </div>

        <div v-for="(groupPermissions, groupName) in filteredGroupedPermissions" :key="groupName"
            class="bg-background border border-primary/5 rounded-2xl overflow-hidden shadow-sm transition-all hover:shadow-md">

            <!-- Group Header -->
            <div class="bg-muted/30 border-b border-primary/5 px-5 py-3 flex items-center justify-between cursor-pointer group"
                @click="toggleGroup(groupPermissions)">
                <div class="flex items-center gap-3">
                    <div class="relative flex items-center justify-center w-5 h-5">
                        <input type="checkbox"
                            class="appearance-none peer w-5 h-5 border-2 border-muted-foreground/30 rounded-md checked:bg-primary checked:border-primary transition-colors cursor-pointer"
                            :checked="isGroupSelected(groupPermissions)"
                            :indeterminate="isGroupIndeterminate(groupPermissions)"
                            @change.stop="toggleGroup(groupPermissions)" />
                        <CheckIcon
                            class="w-3.5 h-3.5 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity font-bold" />
                        <!-- Indeterminate Line -->
                        <div v-if="isGroupIndeterminate(groupPermissions)"
                            class="absolute w-2.5 h-0.5 bg-primary pointer-events-none"></div>
                    </div>
                    <h4 class="font-bold text-sm text-foreground tracking-tight">{{ groupName }}</h4>
                </div>
                <div class="text-xs font-bold text-muted-foreground/50 group-hover:text-primary transition-colors">
                    {{groupPermissions.filter(p => modelValue.includes(p.id)).length}} / {{ groupPermissions.length }}
                </div>
            </div>

            <!-- Permissions Grid -->
            <div class="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div v-for="permission in groupPermissions" :key="permission.id"
                    @click="togglePermission(permission.id)"
                    class="group/perm flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-primary/5 hover:bg-primary/[0.02] cursor-pointer transition-all active:scale-[0.98]">

                    <div class="relative flex items-center justify-center shrink-0">
                        <div class="w-5 h-5 rounded-full border-2 border-muted-foreground/20 transition-all duration-300"
                            :class="modelValue.includes(permission.id) ? 'bg-primary border-primary scale-110' : 'bg-transparent group-hover/perm:border-primary/50'">
                        </div>
                        <CheckIcon v-if="modelValue.includes(permission.id)"
                            class="w-3 h-3 text-white absolute animate-in zoom-in duration-200" />
                    </div>

                    <div class="flex-1 min-w-0">
                        <p
                            class="font-bold text-sm text-foreground group-hover/perm:text-primary transition-colors truncate">
                            {{ permission.label }}
                        </p>
                        <p class="text-[10px] font-mono text-muted-foreground truncate opacity-70">
                            {{ permission.id }}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="Object.keys(filteredGroupedPermissions).length === 0"
            class="text-center py-8 text-muted-foreground italic text-sm">
            No permissions found matching "{{ searchQuery }}".
        </div>
    </div>
</template>
