<script setup>
import { ref, onMounted } from 'vue';
import api from '@/services/api';
import Skeleton from '@/components/ui/skeleton/Skeleton.vue';
import StatsCard from '../../components/widgets/StatsCard.vue';
import ActivityList from '../../components/widgets/ActivityList.vue';
import QuickActions from '../../components/widgets/QuickActions.vue';
import Calendar from '../../components/ui/Calendar.vue';

const stats = ref([]);
const activities = ref([]);
const loading = ref(true);

const fetchDashboardData = async () => {
  loading.value = true;
  try {
    // Artificial delay for demo
    await new Promise(resolve => setTimeout(resolve, 1000));

    const [statsRes, activitiesRes] = await Promise.all([
      api.get('/dashboard/stats'),
      api.get('/dashboard/activities')
    ]);

    stats.value = statsRes.data;
    activities.value = activitiesRes.data;
  } catch (error) {
    console.error('Failed to fetch dashboard data', error);
  } finally {
    loading.value = false;
  }
};

const quickActions = [
  { label: 'Tambah Siswa', icon: '➕', variant: 'btn-primary' },
  { label: 'Kelola Staff', icon: '👥', variant: 'btn-secondary' },
  { label: 'Lihat Laporan', icon: '📊', variant: 'btn-accent' },
  { label: 'Pengaturan', icon: '⚙️', variant: 'btn-ghost' }
];

onMounted(() => {
  fetchDashboardData();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <template v-if="loading">
        <div v-for="i in 4" :key="i" class="card bg-base-100 shadow-sm border border-base-200 p-6 space-y-3">
          <div class="flex justify-between items-start">
            <Skeleton class="h-10 w-10 rounded-xl" />
            <Skeleton class="h-4 w-12 rounded-full" />
          </div>
          <div class="space-y-2">
            <Skeleton class="h-4 w-20" />
            <Skeleton class="h-8 w-24" />
          </div>
        </div>
      </template>
      <template v-else>
        <StatsCard v-for="(stat, index) in stats" :key="index" v-bind="stat" />
      </template>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Calendar -->
      <div class="lg:col-span-1">
        <template v-if="loading">
          <div class="card bg-base-100 shadow-sm border border-base-200 p-6 space-y-4">
            <Skeleton class="h-6 w-32" />
            <Skeleton class="h-64 w-full rounded-xl" />
          </div>
        </template>
        <Calendar v-else />
      </div>

      <!-- Activity & Quick Actions -->
      <div class="lg:col-span-2 space-y-6">
        <template v-if="loading">
          <div class="card bg-base-100 shadow-sm border border-base-200 p-6 space-y-4">
            <Skeleton class="h-6 w-40" />
            <div class="space-y-4">
              <div v-for="i in 3" :key="i" class="flex gap-4">
                <Skeleton class="h-10 w-10 rounded-full" />
                <div class="space-y-2 flex-1">
                  <Skeleton class="h-4 w-3/4" />
                  <Skeleton class="h-3 w-1/4" />
                </div>
              </div>
            </div>
          </div>
        </template>
        <ActivityList v-else :activities="activities" />
        <QuickActions :actions="quickActions" />
      </div>
    </div>
  </div>
</template>
