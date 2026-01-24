import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import menuService from '@/services/menuService';

export const useMenuStore = defineStore('menu', () => {
    const menus = ref([]);
    const isLoading = ref(false);
    const error = ref(null);

    // Get menus as a flat list
    const allMenus = computed(() => menus.value);

    // Get menus as a hierarchy (tree)
    const menuTree = computed(() => {
        const buildTree = (parentId = null) => {
            return menus.value
                .filter(m => m.parentId === parentId)
                .map(m => ({
                    ...m,
                    children: buildTree(m.id)
                }))
                .sort((a, b) => a.order - b.order);
        };
        return buildTree(null);
    });

    // Actions
    const fetchMenus = async () => {
        isLoading.value = true;
        error.value = null;
        try {
            const response = await menuService.getMenus();
            menus.value = response.data;
        } catch (err) {
            error.value = err.message || 'Failed to fetch menus';
            console.error(err);
        } finally {
            isLoading.value = false;
        }
    };

    const createMenu = async (data) => {
        isLoading.value = true;
        try {
            const response = await menuService.createMenu(data);
            menus.value.push(response.data);
            return response.data;
        } catch (err) {
            error.value = err.message || 'Failed to create menu';
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const updateMenu = async (id, data) => {
        isLoading.value = true;
        try {
            const response = await menuService.updateMenu(id, data);
            const index = menus.value.findIndex(m => m.id === id);
            if (index !== -1) {
                menus.value[index] = response.data;
            }
            return response.data;
        } catch (err) {
            error.value = err.message || 'Failed to update menu';
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const deleteMenu = async (id) => {
        isLoading.value = true;
        try {
            await menuService.deleteMenu(id);
            // Remove from local state (including children for this mock)
            // In real app, backend handles cascade, store just refreshes or removes carefully
            const removeRecursive = (targetId) => {
                const toRemove = menus.value.filter(m => m.id === targetId || m.parentId === targetId);
                toRemove.forEach(m => {
                    const idx = menus.value.findIndex(x => x.id === m.id);
                    if (idx !== -1) menus.value.splice(idx, 1);
                    // If it had children, they are also removed by next logic or recursively?
                    // Flat list approach: find all with parentId = targetID
                    const children = menus.value.filter(child => child.parentId === m.id);
                    children.forEach(c => removeRecursive(c.id));
                });
            };
            // Simplistic remove for flat list
            const initialLength = menus.value.length;
            menus.value = menus.value.filter(m => m.id !== id && m.parentId !== id);
        } catch (err) {
            error.value = err.message || 'Failed to delete menu';
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    return {
        menus,
        allMenus,
        menuTree,
        isLoading,
        error,
        fetchMenus,
        createMenu,
        updateMenu,
        deleteMenu
    };
});
