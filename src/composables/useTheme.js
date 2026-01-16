import { ref, onMounted, onUnmounted } from 'vue';

export function useTheme() {
    const theme = ref(localStorage.getItem('theme') || 'system');

    const applyTheme = () => {
        const isDark =
            theme.value === 'dark' ||
            (theme.value === 'system' &&
                window.matchMedia('(prefers-color-scheme: dark)').matches);

        const html = document.documentElement;

        if (isDark) {
            html.classList.add('dark');
            html.setAttribute('data-theme', 'dark'); // DaisyUI
        } else {
            html.classList.remove('dark');
            html.setAttribute('data-theme', 'light'); // DaisyUI, adjust 'light' to your preferred light theme
        }
    };

    const setTheme = (newTheme) => {
        theme.value = newTheme;
        localStorage.setItem('theme', newTheme);
        applyTheme();
    };

    // Listen for system changes if mode is 'system'
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e) => {
        if (theme.value === 'system') {
            applyTheme();
        }
    };

    onMounted(() => {
        applyTheme();
        mediaQuery.addEventListener('change', handleSystemChange);
    });

    onUnmounted(() => {
        mediaQuery.removeEventListener('change', handleSystemChange);
    });

    return {
        theme,
        setTheme,
    };
}
