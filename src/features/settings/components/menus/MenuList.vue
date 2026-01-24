<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useMenuStore } from '@/stores/menu';
import { useRoleStore } from '@/stores/role';
import {
    PlusIcon,
    KeyIcon,
    SparklesIcon,
    MagnifyingGlassIcon
} from '@heroicons/vue/24/outline';
import Modal from '@/components/common/Modal.vue';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';
import MenuForm from './MenuForm.vue';
import PermissionForm from '../permissions/PermissionForm.vue';
import MenuCard from './MenuCard.vue'; // The new recursive card component

const menuStore = useMenuStore();
const roleStore = useRoleStore();

// State
const showModal = ref(false);
const showPermissionModal = ref(false);
const showConfirm = ref(false);
const showPermissionDeleteConfirm = ref(false);

const selectedMenu = ref(null);
const selectedPermission = ref(null);
const modalMode = ref('create');
const searchQuery = ref('');

onMounted(() => {
    menuStore.fetchMenus();
    roleStore.fetchPermissions();
});

// --- Search Filter ---
const filteredTree = computed(() => {
    if (!searchQuery.value.trim()) return menuStore.menuTree;

    const query = searchQuery.value.toLowerCase();

    // Recursive filter function
    const filterNode = (node) => {
        const matches = node.label.toLowerCase().includes(query);
        let childMatches = [];

        if (node.children && node.children.length > 0) {
            childMatches = node.children
                .map(filterNode)
                .filter(n => n !== null);
        }

        if (matches || childMatches.length > 0) {
            return {
                ...node,
                children: childMatches // Return structure with matched children
            };
        }
        return null;
    };

    return menuStore.menuTree.map(filterNode).filter(n => n !== null);
});


// --- Menu Events Handlers (from Card) ---

const handleCreateMenu = () => {
    modalMode.value = 'create';
    selectedMenu.value = null;
    showModal.value = true;
};

const handleEditMenu = (menu) => {
    modalMode.value = 'edit';
    selectedMenu.value = { ...menu };
    showModal.value = true;
};

const handleAddSubmenu = (parentMenu) => {
    modalMode.value = 'create';
    selectedMenu.value = { parentId: parentMenu.id }; // Pre-select parent
    showModal.value = true;
}

const handleDeleteMenu = (menu) => {
    selectedMenu.value = menu;
    showConfirm.value = true;
};

const confirmDeleteMenu = async () => {
    if (selectedMenu.value) {
        await menuStore.deleteMenu(selectedMenu.value.id);
        showConfirm.value = false;
        selectedMenu.value = null;
    }
};

const handleSubmitMenu = async (formData) => {
    if (modalMode.value === 'create') {
        await menuStore.createMenu(formData);
    } else {
        await menuStore.updateMenu(selectedMenu.value.id, formData);
    }
    showModal.value = false;
};

// --- Permission Events Handlers (from Card) ---

const handleCreateGlobalPermission = () => {
    modalMode.value = 'create';
    selectedPermission.value = null;
    showPermissionModal.value = true;
};

const handleAddPermission = (menu) => {
    modalMode.value = 'create';
    selectedPermission.value = { category: menu.label, menu: menu.label };
    showPermissionModal.value = true;
};

const handleEditPermission = (permission, menu) => {
    modalMode.value = 'edit';
    selectedPermission.value = { ...permission, category: menu.label, oldCategory: menu.label };
    showPermissionModal.value = true;
};

const handleDeletePermission = (permission) => {
    selectedPermission.value = permission;
    showPermissionDeleteConfirm.value = true;
};

const confirmDeletePermission = async () => {
    if (selectedPermission.value) {
        await roleStore.deletePermission(selectedPermission.value.id);
        showPermissionDeleteConfirm.value = false;
        selectedPermission.value = null;
    }
};

const handleSubmitPermission = async (formData) => {
    if (modalMode.value === 'create') {
        await roleStore.createPermission(formData);
    } else {
        await roleStore.updatePermission(selectedPermission.value.id, formData);
    }
    showPermissionModal.value = false;
};

</script>

<template>
    <div class="max-w-7xl mx-auto space-y-6">
        <!-- Header Section -->
        <div class="flex flex-col gap-6 pb-6 border-b border-border/10">
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 class="text-4xl font-black tracking-tight text-foreground flex items-center gap-3">
                        <span class="bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-500">
                            Menu Architecture
                        </span>
                        <SparklesIcon class="w-6 h-6 text-yellow-400" />
                    </h1>
                    <p class="mt-2 text-base text-muted-foreground font-light max-w-2xl">
                        Manage your application's structure and access controls using the interactive card system.
                    </p>
                </div>

                <div class="flex items-center gap-3">
                    <button @click="handleCreateGlobalPermission"
                        class="group relative px-5 py-2.5 bg-white dark:bg-zinc-800 text-foreground font-semibold rounded-2xl text-sm hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm flex items-center gap-2 border border-border/50 hover:border-indigo-200">
                        <KeyIcon class="w-4 h-4 text-muted-foreground group-hover:text-indigo-500 transition-colors" />
                        <span>Global Permission</span>
                    </button>
                    <button @click="handleCreateMenu"
                        class="px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-2xl text-sm hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all flex items-center gap-2">
                        <PlusIcon class="w-5 h-5" />
                        <span>New Module</span>
                    </button>
                </div>
            </div>

            <!-- Search Bar -->
            <div class="relative max-w-md">
                <MagnifyingGlassIcon class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input v-model="searchQuery" type="text" placeholder="Search modules..."
                    class="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-zinc-900 border border-border/50 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all outline-none shadow-sm" />
            </div>
        </div>

        <!-- Grid Container -->
        <div v-if="menuStore.isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="i in 6" :key="i" class="h-48 bg-muted/10 rounded-3xl animate-pulse border border-border/30">
            </div>
        </div>

        <div v-else class="min-h-[500px]">

            <div v-if="filteredTree.length === 0"
                class="p-12 text-center text-muted-foreground bg-muted/5 rounded-3xl border border-dashed border-border/50">
                <MagnifyingGlassIcon class="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                <p>No modules found matching "{{ searchQuery }}"</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 align-start">
                <MenuCard v-for="menu in filteredTree" :key="menu.id" :menu="menu" @add-permission="handleAddPermission"
                    @edit-permission="handleEditPermission" @delete-permission="handleDeletePermission"
                    @add-submenu="handleAddSubmenu" @edit-menu="handleEditMenu" @delete-menu="handleDeleteMenu" />
            </div>

        </div>

        <!-- Modals -->
        <Modal :show="showModal" :title="modalMode === 'create' ? 'Add Menu' : 'Edit Menu'" @close="showModal = false">
            <MenuForm :mode="modalMode" :initial-data="selectedMenu" @submit="handleSubmitMenu"
                @cancel="showModal = false" />
        </Modal>

        <Modal :show="showPermissionModal" :title="modalMode === 'create' ? 'Manage Permission' : 'Edit Permission'"
            @close="showPermissionModal = false">
            <PermissionForm :mode="modalMode" :initial-data="selectedPermission" :menus="menuStore.allMenus"
                @submit="handleSubmitPermission" @cancel="showPermissionModal = false" />
        </Modal>

        <ConfirmDialog v-model:show="showConfirm" title="Delete Menu"
            message="Are you sure? This will delete the menu and all its sub-menus." type="error"
            @confirm="confirmDeleteMenu" />

        <ConfirmDialog v-model:show="showPermissionDeleteConfirm" title="Delete Permission"
            message="Are you sure? This will delete the permission permanently." type="error"
            @confirm="confirmDeletePermission" />
    </div>
</template>
