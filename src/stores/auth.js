import { defineStore } from 'pinia';
import api from '../services/api';
import { useLoadingStore } from './loading';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('user')) || null,
        token: localStorage.getItem('token') || null,
        activeRole: JSON.parse(localStorage.getItem('activeRole')) || null,
        permissions: JSON.parse(localStorage.getItem('permissions')) || [],
    }),

    getters: {
        isAuthenticated: (state) => !!state.token,
        userRoles: (state) => state.user?.roles || [],
        currentRoleName: (state) => state.activeRole?.name || '',
    },

    actions: {
        async login(credentials) {
            try {
                // In real app, send credentials. Mock just returns static user.
                const response = await api.post('/login', credentials);
                const { user, token } = response.data;

                this.token = token;
                this.user = user;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));

                // Default to first role or restore if valid, but here we default to first for login
                if (user.roles && user.roles.length > 0) {
                    this.switchRole(user.roles[0].id);
                }

                return true;
            } catch (error) {
                console.error('Login failed', error);
                throw error;
            }
        },

        async switchRole(roleId) {
            if (!this.user) return;

            // Use Loading Store
            const loadingStore = useLoadingStore();
            loadingStore.show('Mengganti Role...');

            // Simulate a delay for UX so the splash is visible
            await new Promise(resolve => setTimeout(resolve, 1000));

            const role = this.user.roles.find(r => r.id === roleId);
            if (role) {
                this.activeRole = role;
                this.permissions = role.permissions || [];

                localStorage.setItem('activeRole', JSON.stringify(this.activeRole));
                localStorage.setItem('permissions', JSON.stringify(this.permissions));

                console.log(`Switched to role: ${role.name}`);
            }

            loadingStore.hide();
        },

        hasPermission(permission) {
            if (!this.activeRole) return false;
            if (this.permissions.includes('*')) return true;
            return this.permissions.includes(permission);
        },

        logout() {
            this.user = null;
            this.token = null;
            this.activeRole = null;
            this.permissions = [];

            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('activeRole');
            localStorage.removeItem('permissions');
        }
    }
});
