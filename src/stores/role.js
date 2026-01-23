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
                this.roles = response.data;
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
                this.availablePermissions = response.data;
            } catch (err) {
                console.error('Failed to fetch permissions', err);
            }
        },

        async createPermission(permissionData) {
            const loadingStore = useLoadingStore();
            loadingStore.show('Creating Permission...');
            try {
                await roleService.createPermission(permissionData);
                await this.fetchPermissions();
                return true;
            } catch (err) {
                this.error = err.message;
                throw err;
            } finally {
                loadingStore.hide();
            }
        },

        async updatePermission(oldId, permissionData) {
            const loadingStore = useLoadingStore();
            loadingStore.show('Updating Permission...');
            try {
                await roleService.updatePermission(oldId, permissionData);
                await this.fetchPermissions();
                return true;
            } catch (err) {
                this.error = err.message;
                throw err;
            } finally {
                loadingStore.hide();
            }
        },

        async deletePermission(id) {
            const loadingStore = useLoadingStore();
            loadingStore.show('Deleting Permission...');
            try {
                await roleService.deletePermission(id);
                await this.fetchPermissions();
                return true;
            } catch (err) {
                this.error = err.message;
                throw err;
            } finally {
                loadingStore.hide();
            }
        },

        async fetchRole(id) {
            this.isLoading = true;
            try {
                const response = await roleService.getRole(id);
                this.currentRole = response.data;
                return response.data;
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
