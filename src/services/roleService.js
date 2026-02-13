import api from './api';


export default {
    async getRoles() {
        return api.get('/roles');
    },

    async getRole(id) {
        return api.get(`/roles/${id}`);
    },

    async createRole(roleData) {
        return api.post('/roles', roleData);
    },

    async updateRole(id, roleData) {
        return api.put(`/roles/${id}`, roleData);
    },

    async deleteRole(id) {
        return api.delete(`/roles/${id}`);
    },

    async getPermissions() {
        return api.get('/permissions');
    },

    // Optional: Frontend might require specific permission management endpoints
    // If the backend doesn't support these (as RoleController manages permissions via Roles),
    // we might need to adjust the UI to only manage permissions per role, not independently.
    // However, for now, let's assuming these are not used or will fail if not implemented.
    // Based on the UI, it seems permissions are managed *within* the Role form.
    // If there is a separate Permission management UI, we need endpoints for it.
    // The previous mock had create/update/deletePermission. 
    // My backend RoleController has `permissions()` which returns all. 
    // It doesn't have CRUD for permissions themselves (usually managed by devs/seeders).
    // I will leave these commented out or return a rejected promise if they are called, 
    // or implement basic CRUD in backend if strictly needed. 
    // For now, I'll just map getPermissions.

    // For now, removing the standalone permission CRUD mock as standard apps usually 
    // don't let users create raw permissions dynamically (they are code-bound).
};
