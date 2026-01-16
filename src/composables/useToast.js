import { useToastStore } from '../stores/toast';

export function useToast() {
    const store = useToastStore();

    return {
        success: (message, duration) => store.add(message, 'success', duration),
        error: (message, duration) => store.add(message, 'error', duration),
        info: (message, duration) => store.add(message, 'info', duration),
        warning: (message, duration) => store.add(message, 'warning', duration),
    };
}
