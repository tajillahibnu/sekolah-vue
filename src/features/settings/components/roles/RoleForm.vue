<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRoleStore } from '@/stores/role';
import { IdentificationIcon, DocumentTextIcon } from '@heroicons/vue/24/outline';
import PermissionMatrix from './PermissionMatrix.vue';

const props = defineProps({
    mode: {
        type: String,
        default: 'create'
    },
    initialData: {
        type: Object,
        default: () => null
    }
});

const emit = defineEmits(['submit', 'cancel']);

const roleStore = useRoleStore();

const formData = ref({
    name: '',
    description: '',
    permissions: []
});

const errors = ref({});

onMounted(async () => {
    // Ensure permissions are loaded
    if (Object.keys(roleStore.availablePermissions).length === 0) {
        await roleStore.fetchPermissions();
    }
});

watch(() => props.initialData, (newVal) => {
    if (newVal) {
        formData.value = {
            name: newVal.name || '',
            description: newVal.description || '',
            permissions: [...(newVal.permissions || [])]
        };
    }
}, { immediate: true });

const validate = () => {
    errors.value = {};
    if (!formData.value.name.trim()) {
        errors.value.name = 'Role name is required';
        return false;
    }
    return true;
};

const handleSubmit = () => {
    if (!validate()) return;
    emit('submit', formData.value);
};
</script>

<template>
    <div class="flex flex-col h-full max-h-[85vh]">
        <!-- Main Content Area -->
        <div class="flex-1 min-h-0 flex flex-col md:flex-row gap-0 md:gap-8 overflow-hidden">
            <!-- Sidebar / Details Column -->
            <div class="w-full md:w-1/3 flex flex-col gap-6 overflow-y-auto pr-2 pb-6 md:pb-0">
                <div>
                    <h3 class="text-xl font-black text-foreground mb-1">Role Details</h3>
                    <p class="text-sm text-muted-foreground">Define the identity of this system role.</p>
                </div>

                <!-- Name Input -->
                <div class="space-y-2 group">
                    <label
                        class="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 group-focus-within:text-primary transition-colors">
                        <IdentificationIcon class="w-4 h-4" /> Role Name <span class="text-destructive">*</span>
                    </label>
                    <div class="relative">
                        <input v-model="formData.name" type="text" placeholder="e.g. Finance Manager"
                            class="w-full px-4 py-3 bg-background border-2 border-muted/20 rounded-xl text-sm font-bold focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:font-normal"
                            :class="{ 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/10': errors.name }" />
                        <p v-if="errors.name" class="text-xs font-bold text-rose-500 mt-1">{{ errors.name }}</p>
                    </div>
                </div>

                <!-- Description Input -->
                <div class="space-y-2 group flex-1">
                    <label
                        class="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 group-focus-within:text-primary transition-colors">
                        <DocumentTextIcon class="w-4 h-4" /> Description
                    </label>
                    <div class="relative h-full">
                        <textarea v-model="formData.description"
                            placeholder="Briefly describe the purpose of this role..."
                            class="w-full h-full min-h-[120px] px-4 py-3 bg-background border-2 border-muted/20 rounded-xl text-sm font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:font-normal resize-none"></textarea>
                    </div>
                </div>

                <!-- Quick Stats -->
                <div class="hidden md:block p-4 bg-primary/5 rounded-2xl border border-primary/5">
                    <div class="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Total
                        Permissions
                    </div>
                    <div class="text-2xl font-black text-primary">{{ formData.permissions.length }}</div>
                </div>
            </div>

            <!-- Divider -->
            <div class="hidden md:block w-px bg-border my-2"></div>

            <!-- Permissions Column -->
            <div class="flex-1 flex flex-col min-h-0 overflow-hidden">
                <!-- Matrix Header -->
                <div class="pb-4 flex items-center justify-between shrink-0">
                    <div>
                        <h3 class="text-lg font-black text-foreground">Access Permissions</h3>
                        <p class="text-sm text-muted-foreground">Select system capabilities.</p>
                    </div>
                    <div
                        class="md:hidden px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg border border-primary/10">
                        {{ formData.permissions.length }} Selected
                    </div>
                </div>

                <!-- Scrollable Matrix -->
                <div class="flex-1 overflow-y-auto pr-2 -mr-2">
                    <PermissionMatrix v-model="formData.permissions" :permissions="roleStore.availablePermissions" />
                </div>
            </div>
        </div>

        <!-- Footer Actions -->
        <div
            class="pt-6 mt-6 border-t border-primary/5 flex justify-end gap-3 bg-background/95 backdrop-blur z-10 shrink-0">
            <button type="button" @click="$emit('cancel')"
                class="px-6 py-3 font-bold text-sm text-muted-foreground hover:text-foreground transition-colors">
                Cancel
            </button>
            <button type="button" @click="handleSubmit"
                class="px-8 py-3 bg-primary text-primary-foreground font-bold text-sm rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all">
                {{ mode === 'create' ? 'Create Role' : 'Save Changes' }}
            </button>
        </div>
    </div>
</template>
