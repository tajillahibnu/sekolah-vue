<script setup>
import StatsCard from '../../components/widgets/StatsCard.vue';
import ActivityList from '../../components/widgets/ActivityList.vue';
import QuickActions from '../../components/widgets/QuickActions.vue';
import Calendar from '../../components/ui/Calendar.vue';

const stats = [
  { title: 'Kelas Hari Ini', value: '6', icon: '📚', color: 'primary' },
  { title: 'Tugas Aktif', value: '4', icon: '📝', color: 'warning' },
  { title: 'Nilai Terbaru', value: '85', icon: '⭐', color: 'success' },
  { title: 'Materi Baru', value: '3', icon: '📖', color: 'info' }
];

const activities = [
  { title: 'Matematika - Kelas dimulai 30 menit lagi', time: 'Hari ini, 10:00', color: 'primary' },
  { title: 'Tugas Fisika: Deadline besok', time: 'Besok, 23:59', color: 'warning' },
  { title: 'Nilai Bahasa Indonesia tersedia', time: '1 jam yang lalu', color: 'success' }
];

const quickActions = [
  { label: 'Lihat Jadwal', icon: '📅', variant: 'btn-primary' },
  { label: 'Kumpul Tugas', icon: '📤', variant: 'btn-secondary' },
  { label: 'Lihat Nilai', icon: '📊', variant: 'btn-accent' },
  { label: 'E-Learning', icon: '💻', variant: 'btn-ghost' }
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
