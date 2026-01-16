import { defineStore } from 'pinia';

export const useLoadingStore = defineStore('loading', {
    state: () => ({
        isLoading: false,
        message: 'Memuat Sistem...',
    }),

    actions: {
        show(msg = 'Memuat Sistem...') {
            this.message = msg;
            this.isLoading = true;
        },
        hide() {
            this.isLoading = false;
            this.message = 'Memuat Sistem...'; // Reset to default
        }
    }
});
