import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useToastStore = defineStore('toast', () => {
    const toasts = ref([]);

    const add = (message, type = 'info', duration = 3000) => {
        const id = Date.now() + Math.random(); // Ensure unique ID
        const toast = { id, message, type };
        toasts.value.push(toast);

        if (duration > 0) {
            setTimeout(() => {
                remove(id);
            }, duration);
        }
    };

    const remove = (id) => {
        const index = toasts.value.findIndex((t) => t.id === id);
        if (index !== -1) {
            toasts.value.splice(index, 1);
        }
    };

    return { toasts, add, remove };
});
