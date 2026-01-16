<script setup>
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import Toast from './components/ui/Toast.vue';
import SplashScreen from './components/ui/SplashScreen.vue';
import { useLoadingStore } from './stores/loading';

const loadingStore = useLoadingStore();

onMounted(() => {
    // Initial App Load
    loadingStore.show('Memuat Aplikasi...');
    setTimeout(() => {
        loadingStore.hide();
    }, 2000);
});
</script>

<template>
  <SplashScreen v-if="loadingStore.isLoading" :message="loadingStore.message" />
  <!-- Use v-show or v-if based on preference, but v-show allows mounting in background if needed. 
       However, if we want to block interaction, v-if is fine or overlay on top. 
       Current logic uses v-if/else which unmounts the app. 
       Better to overlay it so the app loads underneath. -->
  <div v-show="!loadingStore.isLoading">
    <Toast />
    <RouterView />
  </div>
</template>
