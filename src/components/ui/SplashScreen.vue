<script setup>
defineProps({
  message: {
    type: String,
    default: 'Memuat Sistem...'
  }
});
</script>

<template>
  <div
    class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/60 backdrop-blur-md transition-opacity duration-500 overflow-hidden">
    <!-- Animated Background Elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px] animate-pulse">
      </div>
      <div
        class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[100px] animate-pulse"
        style="animation-delay: 1s;"></div>
    </div>

    <div class="flex flex-col items-center relative z-10">
      <!-- Logo Icon with Bounce & Glow -->
      <div
        class="w-24 h-24 bg-primary text-primary-content rounded-3xl flex items-center justify-center mb-8 shadow-2xl animate-bounce-slow hover-trigger">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-14 w-14 drop-shadow-lg" fill="none" viewBox="0 0 24 24"
          stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        </svg>
      </div>

      <!-- Text with Staggered Fade & Slide -->
      <div class="text-center space-y-2 animate-fade-in-up">
        <h1 class="text-5xl font-black text-primary tracking-tight">Sekolah Beta</h1>
        <div class="h-1 w-12 bg-primary/20 mx-auto rounded-full"></div>
        <p class="text-foreground/60 font-semibold tracking-wide uppercase text-xs">{{ message }}</p>
      </div>

      <!-- Minimalist Loader -->
      <div class="mt-12 flex items-center gap-2 animate-fade-in" style="animation-delay: 0.5s;">
        <span class="w-2 h-2 rounded-full bg-primary animate-bounce" style="animation-delay: 0.1s"></span>
        <span class="w-2 h-2 rounded-full bg-primary animate-bounce" style="animation-delay: 0.2s"></span>
        <span class="w-2 h-2 rounded-full bg-primary animate-bounce" style="animation-delay: 0.3s"></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes bounce-slow {

  0%,
  100% {
    transform: translateY(-10%) rotate(3deg);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }

  50% {
    transform: translateY(0) rotate(-2deg);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.animate-bounce-slow {
  animation: bounce-slow 3s infinite;
}

.animate-fade-in-up {
  animation: fade-in-up 0.8s ease-out forwards;
}

.animate-fade-in {
  animation: fade-in 1s ease-out forwards;
}
</style>
