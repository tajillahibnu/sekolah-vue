<script setup>
import { useToastStore } from '../../stores/toast';
import { storeToRefs } from 'pinia';
import {
    CheckCircleIcon,
    ExclamationCircleIcon,
    InformationCircleIcon,
    XMarkIcon
} from '@heroicons/vue/24/outline';

const store = useToastStore();
const { toasts } = storeToRefs(store);

const icons = {
    success: CheckCircleIcon,
    error: ExclamationCircleIcon,
    warning: ExclamationCircleIcon,
    info: InformationCircleIcon,
};

const typeStyles = {
    success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600',
    error: 'bg-rose-500/10 border-rose-500/20 text-rose-600',
    warning: 'bg-amber-500/10 border-amber-500/20 text-amber-600',
    info: 'bg-blue-500/10 border-blue-500/20 text-blue-600',
};

const iconStyles = {
    success: 'text-emerald-500',
    error: 'text-rose-500',
    warning: 'text-amber-500',
    info: 'text-blue-500',
};
</script>

<template>
    <div class="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none w-full max-w-sm">
        <TransitionGroup enter-active-class="transform ease-out duration-300 transition"
            enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
            leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100"
            leave-to-class="opacity-0">
            <div v-for="toast in toasts" :key="toast.id"
                class="pointer-events-auto flex items-start gap-4 p-4 rounded-2xl border shadow-lg backdrop-blur-md bg-white/80 dark:bg-zinc-900/80"
                :class="typeStyles[toast.type] || typeStyles.info">
                <component :is="icons[toast.type] || icons.info" class="h-6 w-6 mt-0.5"
                    :class="iconStyles[toast.type]" />

                <div class="flex-1 pt-0.5">
                    <p class="font-bold text-sm leading-5">
                        {{ toast.type === 'error' ? 'Gagal' : toast.type === 'success' ? 'Berhasil' : 'Info' }}
                    </p>
                    <p class="text-sm opacity-90 mt-1 leading-relaxed">{{ toast.message }}</p>
                </div>

                <button @click="store.remove(toast.id)"
                    class="shrink-0 rounded-lg p-1 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <XMarkIcon class="h-5 w-5 opacity-50" />
                </button>
            </div>
        </TransitionGroup>
    </div>
</template>
