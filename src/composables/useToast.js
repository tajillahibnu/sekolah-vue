import { useToastStore } from '../stores/toast';

export function useToast() {
    const store = useToastStore();

    // Extract duration if options is an object or number, default to 3000
    const getDuration = (options) => {
        if (typeof options === 'number') return options;
        if (typeof options === 'object' && options?.duration) return options.duration;
        return 3000;
    };

    return {
        success: (message, options) => store.add(message, 'success', getDuration(options)),
        error: (message, options) => store.add(message, 'error', getDuration(options)),
        info: (message, options) => store.add(message, 'info', getDuration(options)),
        warning: (message, options) => store.add(message, 'warning', getDuration(options)),
        // Map loading to info for now
        loading: (message, options) => {
            store.add(message, 'info', getDuration(options));
            return Date.now();
        },
        dismiss: (id) => store.remove(id),
    };
}
