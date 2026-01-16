<script setup>
import StatsCard from '../../components/widgets/StatsCard.vue';
import ActivityList from '../../components/widgets/ActivityList.vue';
import QuickActions from '../../components/widgets/QuickActions.vue';
import Calendar from '../../components/ui/Calendar.vue';

const stats = [
  { title: 'Mata Pelajaran', value: '42', icon: '📚', color: 'primary' },
  { title: 'Total Guru', value: '86', icon: '👨‍🏫', color: 'secondary' },
  { title: 'Kelas Aktif', value: '32', icon: '🏫', color: 'accent' },
  { title: 'Silabus Selesai', value: '38/42', icon: '✓', color: 'success' }
];

const activities = [
  { title: 'Silabus Matematika diperbarui', time: '2 jam yang lalu', color: 'primary' },
  { title: 'Guru baru ditugaskan - Fisika', time: '4 jam yang lalu', color: 'secondary' },
  { title: 'Jadwal Kelas 10 disesuaikan', time: '1 hari yang lalu', color: 'info' }
];

const quickActions = [
  { label: 'Kelola Mapel', icon: '📚', variant: 'btn-primary' },
  { label: 'Atur Jadwal', icon: '📅', variant: 'btn-secondary' },
  { label: 'Data Guru', icon: '👨‍🏫', variant: 'btn-accent' },
  { label: 'Silabus', icon: '📋', variant: 'btn-ghost' }
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
