<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useRoleStore } from '@/stores/role';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    MagnifyingGlassIcon,
    UserGroupIcon,
    ShieldCheckIcon
} from '@heroicons/vue/24/outline';
import Button from '@/components/ui/button/Button.vue';
import Card from '@/components/ui/card/Card.vue';
import FormInput from '@/components/ui/form/FormInput.vue';
import Skeleton from '@/components/ui/skeleton/Skeleton.vue';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';
import Modal from '@/components/common/Modal.vue';
import RoleForm from './RoleForm.vue';

const router = useRouter();
const roleStore = useRoleStore();

// State
const searchQuery = ref('');
const showModal = ref(false);
const modalMode = ref('create');
const selectedRole = ref(null);
const showConfirmDialog = ref(false);
const roleToDelete = ref(null);

// Fetch Roles
onMounted(async () => {
    await roleStore.fetchRoles();
    // Ensure permissions are loaded for counts etc
    if (Object.keys(roleStore.availablePermissions).length === 0) {
        await roleStore.fetchPermissions();
    }
});

// Computed
const filteredRoles = computed(() => {
    if (!searchQuery.value) return roleStore.roles;
    const query = searchQuery.value.toLowerCase();
    return roleStore.roles.filter(role =>
        role.name.toLowerCase().includes(query) ||
        role.description.toLowerCase().includes(query)
    );
});

// Handlers
const handleAddRole = () => {
    modalMode.value = 'create';
    selectedRole.value = { name: '', description: '', permissions: [] };
    showModal.value = true;
};

const handleEditRole = (role) => {
    modalMode.value = 'edit';
    selectedRole.value = { ...role }; // Clone to avoid direct mutation
    showModal.value = true;
};

const handleDeleteRole = (role) => {
    roleToDelete.value = role;
    showConfirmDialog.value = true;
};

const confirmDelete = async () => {
    try {
        await roleStore.deleteRole(roleToDelete.value.id);
        showConfirmDialog.value = false;
        roleToDelete.value = null;
    } catch (error) {
        console.error('Failed to delete role:', error);
    }
};

const handleFormSubmit = async (formData) => {
    try {
        if (modalMode.value === 'create') {
            await roleStore.createRole(formData);
        } else {
            await roleStore.updateRole(selectedRole.value.id, formData);
        }
        showModal.value = false;
    } catch (error) {
        console.error('Failed to save role:', error);
    }
};
</script>

<template>
    <div class="space-y-8 pb-12">
        <!-- Modern Header -->
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div class="space-y-2">
                <div class="flex items-center gap-2 text-primary font-bold tracking-tight">
                    <UserGroupIcon class="w-6 h-6" />
                    <span class="text-xs uppercase tracking-widest">Team Management</span>
                </div>
                <h1 class="text-3xl font-black text-foreground tracking-tight">System Roles</h1>
                <p class="text-muted-foreground font-medium max-w-xl">
                    Manage user roles and assign precise access permissions to secure your application.
                </p>
            </div>
            <button @click="handleAddRole"
                class="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-bold rounded-2xl shadow-xl shadow-primary/20 hover:translate-y-[-2px] hover:shadow-2xl transition-all active:scale-95 overflow-hidden">
                <div
                    class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                </div>
                <PlusIcon class="w-5 h-5 relative z-10" />
                <span class="relative z-10">Create Role</span>
            </button>
        </div>

        <!-- Controls & Search -->
        <div class="sticky top-20 z-30">
            <div
                class="bg-background/80 backdrop-blur-xl border border-primary/5 p-2 rounded-3xl shadow-lg shadow-primary/5">
                <div class="relative group">
                    <MagnifyingGlassIcon
                        class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input v-model="searchQuery" type="search" placeholder="Find roles by name or description..."
                        class="w-full pl-12 pr-4 py-3 bg-primary/5 border-transparent rounded-2xl text-sm font-medium focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary/20 transition-all outline-none" />
                </div>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="roleStore.isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="i in 3" :key="i"
                class="h-48 rounded-[32px] border border-primary/5 bg-background p-6 space-y-4">
                <Skeleton class="h-8 w-1/2 rounded-lg" />
                <Skeleton class="h-4 w-3/4 rounded-lg" />
                <div class="pt-8 flex gap-2">
                    <Skeleton class="h-10 w-24 rounded-lg" />
                </div>
            </div>
        </div>

        <!-- Roles Grid -->
        <div v-else-if="filteredRoles.length > 0"
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div v-for="role in filteredRoles" :key="role.id"
                class="group relative bg-background border border-primary/5 rounded-[32px] overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 flex flex-col h-full">

                <!-- Role Header -->
                <div class="p-8 pb-4 flex-1">
                    <div class="flex justify-between items-start mb-4">
                        <div
                            class="p-3 bg-primary/10 text-primary rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                            <ShieldCheckIcon class="w-8 h-8" />
                        </div>
                        <!-- Wildcard Badge -->
                        <span v-if="role.permissions.includes('*')"
                            class="px-3 py-1 bg-amber-50 text-amber-600 border border-amber-100/50 text-[10px] font-black uppercase tracking-widest rounded-full">
                            Super Admin
                        </span>
                    </div>

                    <h3 class="text-xl font-black text-foreground mb-2">{{ role.name }}</h3>
                    <p class="text-sm text-muted-foreground leading-relaxed">{{ role.description }}</p>
                </div>

                <!-- Stats/Info -->
                <div class="px-8 py-4 border-t border-dashed border-primary/5 bg-primary/[0.01]">
                    <div class="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>
                            {{ role.permissions.includes('*') ? 'Unlimited Access' : `${role.permissions.length}
                            Permissions` }}
                        </span>
                    </div>
                </div>

                <!-- Actions -->
                <div
                    class="p-4 bg-muted/30 border-t border-primary/5 flex items-center justify-end gap-2 opacity-1 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 md:translate-y-2 md:group-hover:translate-y-0">
                    <button @click="handleEditRole(role)"
                        class="flex-1 py-2.5 text-xs font-bold bg-white border shadow-sm rounded-xl hover:bg-primary/5 hover:border-primary/20 hover:text-primary transition-all flex items-center justify-center gap-2">
                        <PencilIcon class="w-4 h-4" /> Edit
                    </button>
                    <button @click="handleDeleteRole(role)"
                        class="p-2.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors">
                        <TrashIcon class="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>

        <!-- Empty State -->
        <div v-else class="flex flex-col items-center justify-center py-24 text-center">
            <div class="w-24 h-24 bg-primary/5 rounded-[32px] flex items-center justify-center mb-6 animate-pulse">
                <MagnifyingGlassIcon class="w-10 h-10 text-primary/20" />
            </div>
            <h3 class="text-xl font-black text-foreground mb-2">No roles found</h3>
            <p class="text-muted-foreground max-w-sm mx-auto mb-8">
                Adjust your search or create a new system role to get started.
            </p>
            <button @click="searchQuery = ''" class="text-primary font-bold hover:underline">
                Clear Search
            </button>
        </div>

        <!-- Modals -->
        <Modal :show="showModal" :title="modalMode === 'create' ? 'Create New Role' : 'Edit Role'"
            @close="showModal = false" maxWidth="4xl">
            <RoleForm :mode="modalMode" :initial-data="selectedRole" @submit="handleFormSubmit"
                @cancel="showModal = false" />
        </Modal>

        <ConfirmDialog :show="showConfirmDialog" title="Delete Role"
            :message="`Are you sure you want to delete ${roleToDelete?.name}? Users assigned to this role might lose access.`"
            confirm-text="Delete Role" type="error" @confirm="confirmDelete" @cancel="showConfirmDialog = false" />
    </div>
</template>
