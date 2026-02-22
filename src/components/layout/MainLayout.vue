<script setup>
import { computed } from 'vue';
import Sidebar from './Sidebar.vue';
import Header from './Header.vue';
import Footer from './Footer.vue';
import { useLayoutStore } from '../../stores/layout';

const layoutStore = useLayoutStore();
</script>

<template>
  <div class="min-h-screen flex flex-col admin-pattern text-foreground">
    <!-- Top Fixed Header -->
    <Header class="z-[60]" />

    <div class="flex flex-1 pt-16">
      <!-- Sidebar (Fixed Left, below Header) -->
      <Sidebar class="z-40" />

      <!-- Main Content -->
      <div class="flex-1 flex flex-col w-full transition-all duration-300 min-w-0">
        <main class="flex-1 p-6 overflow-y-auto">
          <router-view v-slot="{ Component, route }">
            <transition name="fade" mode="out-in">
              <component :is="Component" :key="route.fullPath" />
            </transition>
          </router-view>
        </main>

        <!-- Footer -->
        <Footer />
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-pattern {
  background-color: hsl(var(--background));
  background-image: radial-gradient(hsl(var(--foreground) / 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
