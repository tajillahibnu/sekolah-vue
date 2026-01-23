<script setup>
import { computed } from 'vue';
import { useTheme } from '@/composables/useTheme';
import Button from '@/components/ui/button/Button.vue';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/vue/24/outline';

const { theme, setTheme } = useTheme();

const cycleTheme = () => {
    if (theme.value === 'light') {
        setTheme('dark');
    } else if (theme.value === 'dark') {
        setTheme('system');
    } else {
        setTheme('light');
    }
};

const currentIcon = computed(() => {
    switch (theme.value) {
        case 'light':
            return SunIcon;
        case 'dark':
            return MoonIcon;
        default:
            return ComputerDesktopIcon;
    }
});
</script>

<template>
    <Button variant="ghost" size="icon" @click="cycleTheme"
        class="rounded-full w-9 h-9 transition-all hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white"
        title="Ganti Tema">
        <component :is="currentIcon" class="w-5 h-5 transition-all" />
        <span class="sr-only">Ganti Tema</span>
    </Button>
</template>
