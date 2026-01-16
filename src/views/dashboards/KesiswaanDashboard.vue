<script setup>
import StatsCard from '../../components/widgets/StatsCard.vue';
import ActivityList from '../../components/widgets/ActivityList.vue';
import QuickActions from '../../components/widgets/QuickActions.vue';
import Calendar from '../../components/ui/Calendar.vue';

const stats = [
  { title: 'Total Siswa', value: '1,240', icon: '👨‍🎓', color: 'primary' },
  { title: 'Hadir Hari Ini', value: '95%', icon: '✓', color: 'success', trend: 'up', trendValue: '+2%' },
  { title: 'Pelanggaran Bulan Ini', value: '12', icon: '⚠️', color: 'warning' },
  { title: 'Prestasi Bulan Ini', value: '28', icon: '🏆', color: 'info', trend: 'up', trendValue: '+8' }
];

const activities = [
  { title: 'Siswa baru terdaftar - Kelas 10A', time: '1 jam yang lalu', color: 'primary' },
  { title: 'Pelanggaran: Terlambat - Ahmad (10B)', time: '2 jam yang lalu', color: 'warning' },
  { title: 'Prestasi: Juara Olimpiade - Siti (11A)', time: '5 jam yang lalu', color: 'success' }
];

const quickActions = [
  { label: 'Data Siswa', icon: '👥', variant: 'btn-primary' },
  { label: 'Absensi', icon: '✓', variant: 'btn-secondary' },
  { label: 'Pelanggaran', icon: '⚠️', variant: 'btn-warning' },
  { label: 'Prestasi', icon: '🏆', variant: 'btn-info' }
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
        <QuickActions :actions="quickActions" />
      </div>
    </div>
  </div>
</template>
