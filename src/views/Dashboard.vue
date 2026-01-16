<script setup>
import { useAuthStore } from '../stores/auth';
import { computed } from 'vue';

// Import role-specific dashboards
import AdminDashboard from './dashboards/AdminDashboard.vue';
import GuruDashboard from './dashboards/GuruDashboard.vue';
import SiswaDashboard from './dashboards/SiswaDashboard.vue';
import KesiswaanDashboard from './dashboards/KesiswaanDashboard.vue';
import KurikulumDashboard from './dashboards/KurikulumDashboard.vue';
import WalikelasDashboard from './dashboards/WalikelasDashboard.vue';

const authStore = useAuthStore();

// Get greeting based on time of day
const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Selamat Pagi';
  if (hour < 15) return 'Selamat Siang';
  if (hour < 18) return 'Selamat Sore';
  return 'Selamat Malam';
});

// Get current date in Indonesian format
const currentDate = computed(() => {
  const date = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('id-ID', options);
});

// Get current time
const currentTime = computed(() => {
  const date = new Date();
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
});

// Get the appropriate dashboard component based on role
const dashboardComponent = computed(() => {
  const roleId = authStore.activeRole?.id;
  const dashboards = {
    'admin': AdminDashboard,
    'guru': GuruDashboard,
    'siswa': SiswaDashboard,
    'kesiswaan': KesiswaanDashboard,
    'kurikulum': KurikulumDashboard,
    'walikelas': WalikelasDashboard
  };
  return dashboards[roleId] || AdminDashboard;
});
</script>

<template>
  <div class="space-y-6">
    <!-- Welcome Card with Gradient -->
    <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-white shadow-lg">
      <!-- Decorative Background Pattern -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
      </div>
      
      <div class="relative p-8">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div class="space-y-2">
            <p class="text-sm opacity-90">{{ currentDate }}</p>
            <h1 class="text-3xl md:text-4xl font-bold">
              {{ greeting }}, {{ authStore.user?.name }}! 👋
            </h1>
            <p class="text-base opacity-90">
              Anda login sebagai <span class="font-semibold bg-white/20 px-3 py-1 rounded-full">{{ authStore.activeRole?.name }}</span>
            </p>
          </div>
          
          <!-- Universal Quick Info -->
          <div class="flex gap-4 md:gap-6">
            <div class="text-center">
              <div class="text-2xl md:text-3xl font-bold">{{ currentTime }}</div>
              <div class="text-xs md:text-sm opacity-90">Waktu</div>
            </div>
            <div class="w-px bg-white/30"></div>
            <div class="text-center">
              <div class="text-2xl md:text-3xl font-bold">5</div>
              <div class="text-xs md:text-sm opacity-90">Notifikasi</div>
            </div>
            <div class="w-px bg-white/30"></div>
            <div class="text-center">
              <div class="flex items-center justify-center gap-1">
                <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <div class="text-2xl md:text-3xl font-bold">Online</div>
              </div>
              <div class="text-xs md:text-sm opacity-90">Status</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Role-Based Dashboard Content -->
    <component :is="dashboardComponent" />
  </div>
</template>
