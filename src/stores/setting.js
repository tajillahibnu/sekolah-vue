import { defineStore } from 'pinia';
import api from '@/services/api';

export const useSettingStore = defineStore('setting', {
    state: () => ({
        settings: JSON.parse(sessionStorage.getItem('masterData')) || [],
        loading: false,
        error: null,
    }),

    getters: {
        getValue: (state) => (key, defaultValue = null) => {
            const setting = state.settings.find(s => s.key === key);
            return setting ? setting.value : defaultValue;
        },
        getArray: (state) => (key, defaultValue = []) => {
            const setting = state.settings.find(s => s.key === key);
            if (!setting || !setting.value) return defaultValue;
            try {
                // Return as parsed JSON if it's an array string, or split by comma if flat string
                if (setting.value.startsWith('[')) {
                    return JSON.parse(setting.value);
                }
                return setting.value.split(',').map(s => s.trim()).filter(Boolean);
            } catch (e) {
                return defaultValue;
            }
        }
    },

    actions: {
        async fetchSettings(params = {}) {
            this.loading = true;
            this.error = null;
            try {
                const response = await api.get('/settings', { params });
                this.settings = response.data.data;
                sessionStorage.setItem('masterData', JSON.stringify(this.settings));
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
