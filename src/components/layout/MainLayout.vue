<script setup>
import { computed } from 'vue';
import Sidebar from './Sidebar.vue';
import Header from './Header.vue';
import Footer from './Footer.vue';
import { useLayoutStore } from '../../stores/layout';

const layoutStore = useLayoutStore();
</script>

<template>
  <div class="min-h-screen bg-base-50 flex flex-col">
    <!-- Top Fixed Header -->
    <Header class="z-50" />

    <div class="flex flex-1 pt-16">
      <!-- Sidebar (Fixed Left, below Header) -->
      <Sidebar class="z-40" />

      <!-- Main Content -->
      <div class="flex-1 flex flex-col w-full transition-all duration-300 bg-base-50"
        :class="layoutStore.isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'">
        <main class="flex-1 p-6 overflow-y-auto">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
