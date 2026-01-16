<script setup>
defineProps({
    message: {
        type: String,
        default: 'Memuat Sistem...'
    }
});
</script>

<template>
  <div class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-base-100 transition-opacity duration-500">
    <div class="flex flex-col items-center animate-pulse">
        <div class="w-24 h-24 bg-primary text-primary-content rounded-2xl flex items-center justify-center mb-6 shadow-2xl rotate-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
        </div>
        <h1 class="text-4xl font-extrabold text-primary tracking-tight mb-2">Sekolah App</h1>
        <p class="text-base-content/60 font-medium">{{ message }}</p>
        <span class="loading loading-dots loading-lg text-primary mt-8"></span>
    </div>
  </div>
</template>
