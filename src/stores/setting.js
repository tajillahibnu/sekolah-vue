import { defineStore } from 'pinia';
import api from '@/config/api';

export const useSettingStore = defineStore('setting', {
    state: () => ({
        settings: [],
        loading: false,
        error: null,
        meta: null
    }),

    actions: {
        async fetchSettings(params = {}) {
            this.loading = true;
            this.error = null;
            try {
                const response = await api.get('/settings', { params });
                this.settings = response.data.data;
                this.meta = response.data.meta;
                return response.data;
            } catch (error) {
                this.error = error.response?.data?.message || 'Gagal mengambil data settings';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async getSetting(key) {
            try {
                const response = await api.get(`/settings/${key}`);
                return response.data;
            } catch (error) {
                throw error;
            }
        },

        async createSetting(data) {
            this.loading = true;
            try {
                const response = await api.post('/settings', data);
                await this.fetchSettings({ limit: 'all' });
                return response.data;
            } catch (error) {
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateSetting(id, data) {
            this.loading = true;
            try {
                const response = await api.put(`/settings/${id}`, data);
                await this.fetchSettings({ limit: 'all' });
                return response.data;
            } catch (error) {
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async deleteSetting(id) {
            this.loading = true;
            try {
                await api.delete(`/settings/${id}`);
                await this.fetchSettings({ limit: 'all' });
            } catch (error) {
                throw error;
            } finally {
                this.loading = false;
            }
        }
    }
});
