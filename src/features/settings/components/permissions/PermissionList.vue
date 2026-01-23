<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoleStore } from '@/stores/role';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    MagnifyingGlassIcon,
    KeyIcon,
    ShieldCheckIcon,
    FunnelIcon,
    CheckCircleIcon
} from '@heroicons/vue/24/outline';
import Modal from '@/components/common/Modal.vue';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';
import PermissionForm from './PermissionForm.vue';

const roleStore = useRoleStore();

const searchQuery = ref('');
const showModal = ref(false);
const modalMode = ref('create');
const selectedPermission = ref(null);
const showDeleteConfirm = ref(false);
const permissionToDelete = ref(null);
const selectedCategory = ref('all');
const showSidebar = ref(true);

onMounted(() => {
    roleStore.fetchPermissions();
});

const categories = computed(() => ['all', ...Object.keys(roleStore.availablePermissions)]);

const filteredPermissions = computed(() => {
    const query = searchQuery.value.toLowerCase();
    let perms = [];

    for (const [category, permissions] of Object.entries(roleStore.availablePermissions)) {
        if (selectedCategory.value === 'all' || selectedCategory.value === category) {
            perms.push(...permissions.map(p => ({ ...p, category })));
        }
    }

    if (query) {
        perms = perms.filter(p =>
            p.label.toLowerCase().includes(query) ||
            p.id.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query)
        );
    }

    return perms;
});

const totalPermissions = computed(() => {
    return Object.values(roleStore.availablePermissions).reduce((acc, curr) => acc + curr.length, 0);
});

const categoryStats = computed(() => {
    const stats = {};
    for (const [category, perms] of Object.entries(roleStore.availablePermissions)) {
        stats[category] = perms.length;
    }
    return stats;
});

const handleCreate = () => {
    modalMode.value = 'create';
    selectedPermission.value = null;
    showModal.value = true;
};

const handleEdit = (permission) => {
    modalMode.value = 'edit';
    selectedPermission.value = { ...permission, oldCategory: permission.category };
    showModal.value = true;
};

const handleDelete = (permission) => {
    permissionToDelete.value = permission;
    showDeleteConfirm.value = true;
};

const confirmDelete = async () => {
    if (permissionToDelete.value) {
        await roleStore.deletePermission(permissionToDelete.value.id);
        permissionToDelete.value = null;
    }
};

const handleSubmit = async (formData) => {
    if (modalMode.value === 'create') {
        await roleStore.createPermission(formData);
    } else {
        await roleStore.updatePermission(selectedPermission.value.id, formData);
    }
    showModal.value = false;
};

const getCategoryColor = (category) => {
    const colors = {
        'User Management': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        'Student Management': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        'Academics': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        'Settings': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    };
    return colors[category] || 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
};
</script>

<template>
    <div class="h-[calc(100vh-120px)] flex flex-col">
        <!-- Compact Header -->
        <div class="flex items-center justify-between mb-6">
            <div>
                <div class="flex items-center gap-2 text-primary mb-1">
                    <ShieldCheckIcon class="w-5 h-5" />
                    <span class="text-xs font-bold uppercase tracking-widest">Access Control</span>
                </div>
                <h1 class="text-2xl font-black text-foreground">Master Permissions</h1>
            </div>

            <div class="flex items-center gap-3">
                <button @click="showSidebar = !showSidebar"
                    class="p-2.5 bg-muted/50 hover:bg-muted rounded-2xl transition-all lg:hidden shadow-sm">
                    <FunnelIcon class="w-5 h-5" />
                </button>
                <button @click="handleCreate"
                    class="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-2xl shadow-xl shadow-primary/20 hover:shadow-2xl hover:-translate-y-0.5 transition-all">
                    <PlusIcon class="w-4 h-4" />
                    <span class="hidden sm:inline">New Permission</span>
                </button>
            </div>
        </div>

        <!-- Main Content Area -->
        <div class="flex-1 flex gap-6 min-h-0">
            <!-- Sidebar Filter -->
            <div v-show="showSidebar" class="w-full lg:w-64 flex-shrink-0 space-y-4 overflow-y-auto">

                <!-- Search -->
                <div class="relative group">
                    <MagnifyingGlassIcon
                        class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input v-model="searchQuery" type="text" placeholder="Search permissions..."
                        class="w-full pl-11 pr-4 py-3 bg-gradient-to-br from-muted/50 to-muted/30 rounded-2xl text-sm font-medium focus:from-background focus:to-background focus:shadow-lg focus:shadow-primary/5 transition-all outline-none" />
                </div>

                <!-- Stats Card -->
                <div
                    class="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 rounded-3xl shadow-lg shadow-primary/5">
                    <div class="flex items-center gap-2 mb-3">
                        <div class="p-2 bg-primary/10 rounded-xl">
                            <ShieldCheckIcon class="w-5 h-5 text-primary" />
                        </div>
                        <div class="text-xs font-black uppercase tracking-widest text-primary">Total</div>
                    </div>
                    <div class="text-4xl font-black text-foreground mb-1">{{ totalPermissions }}</div>
                    <div class="text-xs text-muted-foreground">Active Permissions</div>
                </div>

                <!-- Category Filter -->
                <div class="bg-gradient-to-br from-background to-muted/20 rounded-3xl p-5 shadow-lg">
                    <div
                        class="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                        <FunnelIcon class="w-4 h-4" />
                        Filter by Category
                    </div>
                    <div class="space-y-2">
                        <button @click="selectedCategory = 'all'"
                            class="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all shadow-sm"
                            :class="selectedCategory === 'all' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-muted/50 hover:bg-muted hover:shadow-md'">
                            <span>All Categories</span>
                            <span class="px-2 py-0.5 rounded-lg text-xs"
                                :class="selectedCategory === 'all' ? 'bg-white/20' : 'bg-background'">{{
                                totalPermissions }}</span>
                        </button>

                        <button v-for="category in Object.keys(roleStore.availablePermissions)" :key="category"
                            @click="selectedCategory = category"
                            class="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all shadow-sm"
                            :class="selectedCategory === category ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-muted/50 hover:bg-muted hover:shadow-md'">
                            <span>{{ category }}</span>
                            <span class="px-2 py-0.5 rounded-lg text-xs"
                                :class="selectedCategory === category ? 'bg-white/20' : 'bg-background'">{{
                                categoryStats[category] }}</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Table View -->
            <div
                class="flex-1 bg-gradient-to-br from-background to-muted/10 rounded-3xl shadow-xl overflow-hidden flex flex-col">
                <!-- Table Header -->
                <div class="bg-gradient-to-r from-muted/40 to-muted/20 backdrop-blur-sm px-6 py-5">
                    <div class="flex items-center justify-between">
                        <div class="text-sm font-bold text-foreground">
                            Showing <span class="text-primary font-black">{{ filteredPermissions.length }}</span> of {{
                            totalPermissions }} permissions
                            <span v-if="selectedCategory !== 'all'" class="text-primary font-black">in {{
                                selectedCategory }}</span>
                        </div>
                    </div>
                </div>

                <!-- Table Content -->
                <div class="flex-1 overflow-y-auto">
                    <table class="w-full">
                        <thead
                            class="sticky top-0 bg-gradient-to-b from-muted/60 to-muted/40 backdrop-blur-xl z-10 shadow-sm">
                            <tr class="text-left text-xs font-black uppercase tracking-widest text-muted-foreground">
                                <th class="px-6 py-4 w-12">#</th>
                                <th class="px-6 py-4">Permission Name</th>
                                <th class="px-6 py-4">Permission ID</th>
                                <th class="px-6 py-4">Category</th>
                                <th class="px-6 py-4">Status</th>
                                <th class="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(permission, index) in filteredPermissions" :key="permission.id"
                                class="group hover:bg-gradient-to-r hover:from-primary/[0.04] hover:to-transparent transition-all">
                                <td class="px-6 py-5">
                                    <div
                                        class="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-xs font-black text-primary shadow-sm">
                                        {{ index + 1 }}
                                    </div>
                                </td>
                                <td class="px-6 py-5">
                                    <div class="flex items-center gap-3">
                                        <div
                                            class="p-2.5 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl text-primary shadow-sm">
                                            <KeyIcon class="w-4 h-4" />
                                        </div>
                                        <span class="font-bold text-sm text-foreground">{{ permission.label }}</span>
                                    </div>
                                </td>
                                <td class="px-6 py-5">
                                    <code
                                        class="px-3 py-1.5 rounded-xl bg-muted/70 text-xs font-mono font-medium text-muted-foreground shadow-sm">
                                        {{ permission.id }}
                                    </code>
                                </td>
                                <td class="px-6 py-5">
                                    <span class="px-3 py-1.5 rounded-full text-xs font-bold shadow-sm"
                                        :class="getCategoryColor(permission.category)">
                                        {{ permission.category }}
                                    </span>
                                </td>
                                <td class="px-6 py-5">
                                    <div class="flex items-center gap-2">
                                        <div class="p-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                                            <CheckCircleIcon class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <span
                                            class="text-xs font-bold text-emerald-600 dark:text-emerald-400">Active</span>
                                    </div>
                                </td>
                                <td class="px-6 py-5">
                                    <div
                                        class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button @click="handleEdit(permission)"
                                            class="p-2 text-primary bg-primary/10 hover:bg-primary hover:text-white rounded-xl transition-all shadow-sm hover:shadow-md"
                                            title="Edit">
                                            <PencilIcon class="w-4 h-4" />
                                        </button>
                                        <button @click="handleDelete(permission)"
                                            class="p-2 text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-xl transition-all shadow-sm hover:shadow-md"
                                            title="Delete">
                                            <TrashIcon class="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- Empty State -->
                    <div v-if="filteredPermissions.length === 0"
                        class="flex flex-col items-center justify-center py-16 text-center">
                        <div
                            class="w-24 h-24 bg-gradient-to-br from-muted/50 to-muted/30 rounded-3xl flex items-center justify-center mb-4 shadow-lg">
                            <MagnifyingGlassIcon class="w-12 h-12 text-muted-foreground/50" />
                        </div>
                        <h3 class="text-lg font-black text-foreground mb-1">No permissions found</h3>
                        <p class="text-sm text-muted-foreground mb-6">
                            Try adjusting your search or filter criteria
                        </p>
                        <button @click="searchQuery = ''; selectedCategory = 'all'"
                            class="px-6 py-2.5 bg-gradient-to-r from-muted to-muted/80 hover:from-muted/80 hover:to-muted text-foreground font-bold rounded-xl transition-all text-sm shadow-lg">
                            Reset Filters
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modals -->
        <Modal :show="showModal" :title="modalMode === 'create' ? 'Create New Permission' : 'Edit Permission'"
            @close="showModal = false">
            <PermissionForm :mode="modalMode" :initial-data="selectedPermission"
                :categories="categories.filter(c => c !== 'all')" @submit="handleSubmit" @cancel="showModal = false" />
        </Modal>

        <ConfirmDialog v-model:show="showDeleteConfirm" title="Delete Permission"
            message="Are you sure you want to delete this permission? This action cannot be undone."
            confirm-text="Delete" type="error" @confirm="confirmDelete" />
    </div>
</template>
