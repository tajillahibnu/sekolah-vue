<script setup>
import StatsCard from '../../components/widgets/StatsCard.vue';
import ActivityList from '../../components/widgets/ActivityList.vue';
import SchoolBulletin from '../../components/widgets/SchoolBulletin.vue';
import Calendar from '../../components/ui/Calendar.vue';

const stats = [
  { title: 'Siswa di Kelas', value: '38', icon: '👨‍🎓', color: 'primary' },
  { title: 'Kehadiran Hari Ini', value: '97%', icon: '✓', color: 'success', trend: 'up', trendValue: '+3%' },
  { title: 'Rata-rata Nilai', value: '82', icon: '📊', color: 'info' },
  { title: 'Pesan Ortu Baru', value: '5', icon: '💬', color: 'warning' }
];

const activities = [
  { title: 'Absensi pagi berhasil diinput', time: '2 jam yang lalu', color: 'success' },
  { title: 'Pesan dari Orang Tua Ahmad', time: '3 jam yang lalu', color: 'warning' },
  { title: 'Konseling dengan Siti selesai', time: '5 jam yang lalu', color: 'info' }
];
</script>

<template>
  <div class="space-y-6">
    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard v-for="(stat, index) in stats" :key="index" v-bind="stat" />
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Calendar -->
      <div class="lg:col-span-1">
        <Calendar />
      </div>

      <!-- Activity & Quick Actions -->
      <div class="lg:col-span-2 space-y-6">
        <ActivityList :activities="activities" />
        <SchoolBulletin />
      </div>
    </div>
  </div>
</template>
