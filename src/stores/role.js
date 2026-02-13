import { defineStore } from 'pinia';
import roleService from '../services/roleService';
import { useLoadingStore } from './loading';

export const useRoleStore = defineStore('role', {
    state: () => ({
        roles: [],
        currentRole: null,
        availablePermissions: {}, // Grouped permissions
        isLoading: false,
        error: null
    }),

    getters: {
        getRoleById: (state) => (id) => state.roles.find(r => r.id === id),
    },

    actions: {
        async fetchRoles() {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await roleService.getRoles();
                // API returns { data: [...] }
                this.roles = response.data.data;
            } catch (err) {
                this.error = err.message || 'Failed to fetch roles';
                console.error(err);
            } finally {
                this.isLoading = false;
            }
        },

        async fetchPermissions() {
            try {
                const response = await roleService.getPermissions();
                // API returns { data: [...], grouped: {...} }
                // Store expects grouped object matching mock structure
                this.availablePermissions = response.data.grouped;
            } catch (err) {
                console.error('Failed to fetch permissions', err);
            }
        },

        async createPermission(permissionData) {
            // Not implemented on backend
            console.warn('createPermission not implemented on backend');
        },

        async updatePermission(oldId, permissionData) {
            // Not implemented on backend
            console.warn('updatePermission not implemented on backend');
        },

        async deletePermission(id) {
            // Not implemented on backend
            console.warn('deletePermission not implemented on backend');
        },

        async fetchRole(id) {
            this.isLoading = true;
            try {
                const response = await roleService.getRole(id);
                this.currentRole = response.data.data;
                return response.data.data;
            } catch (err) {
                this.error = err.message;
                throw err;
            } finally {
                this.isLoading = false;
            }
        },

        async createRole(roleData) {
            const loadingStore = useLoadingStore();
            loadingStore.show('Creating Role...');
            try {
                await roleService.createRole(roleData);
                await this.fetchRoles(); // Refresh list
                return true;
            } catch (err) {
                this.error = err.message;
                throw err;
            } finally {
                loadingStore.hide();
            }
        },

        async updateRole(id, roleData) {
            const loadingStore = useLoadingStore();
            loadingStore.show('Updating Role...');
            try {
                await roleService.updateRole(id, roleData);
                await this.fetchRoles();
                return true;
            } catch (err) {
                this.error = err.message;
                throw err;
            } finally {
                loadingStore.hide();
            }
        },

        async deleteRole(id) {
            const loadingStore = useLoadingStore();
            loadingStore.show('Deleting Role...');
            try {
                await roleService.deleteRole(id);
                await this.fetchRoles();
                return true;
            } catch (err) {
                this.error = err.message;
                throw err;
            } finally {
                loadingStore.hide();
            }
        }
    }
});
