<script setup>
import { useToastStore } from '../../stores/toast';
import { XMarkIcon } from '@heroicons/vue/24/solid';
import { storeToRefs } from 'pinia';

const store = useToastStore();
const { toasts } = storeToRefs(store);

const typeClasses = {
  success: 'bg-green-500 text-white',
  error: 'bg-red-500 text-white',
  info: 'bg-blue-500 text-white',
  warning: 'bg-yellow-500 text-white',
};
</script>

<template>
  <div class="fixed top-20 right-4 z-[100] flex flex-col gap-2">
    <TransitionGroup name="toast">
      <div v-for="toast in toasts" :key="toast.id"
        class="flex items-center justify-between p-4 rounded shadow-lg min-w-[300px]" :class="typeClasses[toast.type]">
        <span>{{ toast.message }}</span>
        <button @click="store.remove(toast.id)" class="ml-4 hover:opacity-75">
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
