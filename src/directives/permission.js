import { useAuthStore } from '../stores/auth';

export const permission = {
    mounted(el, binding) {
        const { value } = binding;
        const authStore = useAuthStore();

        if (value && typeof value === 'string') {
            const hasPermission = authStore.hasPermission(value);

            if (!hasPermission) {
                el.parentNode && el.parentNode.removeChild(el);
            }
        } else {
            throw new Error(`need permission! Like v-permission="'user.create'"`);
        }
    },
    // Re-check when component updates/role changes (though simple removal usually suffices, reactivity might need key change)
    updated(el, binding) {
        const { value } = binding;
        const authStore = useAuthStore();
        if (value && typeof value === 'string') {
            const hasPermission = authStore.hasPermission(value);
            if (!hasPermission) {
                // If it was previously visible and now isn't, remove it. 
                // Note: Re-inserting removed DOM is hard with directives alone without v-if. 
                // For dynamic role switching, v-if="hasPermission()" is often safer, but directive is good for static initial checks.
                // For this demo, we'll suggest refreshing or using v-if for complex dynamic switches, 
                // but we'll try to hide it if role changes permissions to negative.
                el.style.display = 'none';
            } else {
                el.style.display = '';
            }
        }
    }
};
