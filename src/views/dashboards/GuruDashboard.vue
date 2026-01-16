<script setup>
import StatsCard from '../../components/widgets/StatsCard.vue';
import ActivityList from '../../components/widgets/ActivityList.vue';
import QuickActions from '../../components/widgets/QuickActions.vue';
import Calendar from '../../components/ui/Calendar.vue';

const stats = [
  { title: 'Kelas Hari Ini', value: '5', icon: '📚', color: 'primary' },
  { title: 'Total Siswa', value: '142', icon: '👨‍🎓', color: 'secondary' },
  { title: 'Tugas Pending', value: '8', icon: '📝', color: 'warning' },
  { title: 'Nilai Belum Input', value: '12', icon: '✏️', color: 'error' }
];

const activities = [
  { title: 'Kelas 10A - Matematika dimulai', time: '30 menit lagi', color: 'primary' },
  { title: 'Tugas Fisika dikumpulkan', time: '2 jam yang lalu', color: 'success' },
  { title: 'Absensi Kelas 10B lengkap', time: '3 jam yang lalu', color: 'info' }
];

const quickActions = [
  { label: 'Input Nilai', icon: '✏️', variant: 'btn-primary' },
  { label: 'Absensi', icon: '✓', variant: 'btn-secondary' },
  { label: 'Buat Tugas', icon: '📝', variant: 'btn-accent' },
  { label: 'Lihat Jadwal', icon: '📅', variant: 'btn-ghost' }
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
