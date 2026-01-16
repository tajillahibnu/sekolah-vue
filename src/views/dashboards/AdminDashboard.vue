<script setup>
import { ref, onMounted } from 'vue';
import api from '@/services/api';
import Skeleton from '@/components/ui/skeleton/Skeleton.vue';
import StatsCard from '../../components/widgets/StatsCard.vue';
import ActivityList from '../../components/widgets/ActivityList.vue';
import QuickActions from '../../components/widgets/QuickActions.vue';
import Calendar from '../../components/ui/Calendar.vue';
import { Card, CardContent } from '@/components/ui/card';

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
  <div class="space-y-8 animate-in fade-in duration-500">
    <!-- Header/Greeting -->
    <div class="flex flex-col gap-1">
      <h1 class="text-3xl font-bold tracking-tight text-foreground">Dashboard Overview</h1>
      <p class="text-muted-foreground font-medium">Selamat datang kembali, berikut adalah ringkasan sekolah hari ini.
      </p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <template v-if="loading">
        <Card v-for="i in 4" :key="i" class="border-none shadow-sm bg-background/50 backdrop-blur-sm">
          <CardContent class="p-6 space-y-4">
            <div class="flex justify-between items-start">
              <Skeleton class="h-12 w-12 rounded-2xl" />
              <Skeleton class="h-4 w-12 rounded-full" />
            </div>
            <div class="space-y-3">
              <Skeleton class="h-4 w-24" />
              <Skeleton class="h-8 w-32" />
            </div>
          </CardContent>
        </Card>
      </template>
      <template v-else>
        <StatsCard v-for="(stat, index) in stats" :key="index" v-bind="stat" />
      </template>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Activity & Quick Actions -->
      <div class="lg:col-span-8 space-y-8">
        <template v-if="loading">
          <Card class="border-none shadow-sm bg-background/50 backdrop-blur-sm">
            <CardContent class="p-6 space-y-6">
              <Skeleton class="h-6 w-48" />
              <div class="space-y-6">
                <div v-for="i in 3" :key="i" class="flex gap-4">
                  <Skeleton class="h-10 w-10 rounded-full" />
                  <div class="space-y-2 flex-1">
                    <Skeleton class="h-4 w-3/4" />
                    <Skeleton class="h-3 w-1/4" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </template>
        <template v-else>
          <ActivityList :activities="activities" />
          <QuickActions :actions="quickActions" />
        </template>
      </div>

      <!-- Side Content: Calendar -->
      <div class="lg:col-span-4">
        <template v-if="loading">
          <Card class="border-none shadow-sm bg-background/50 backdrop-blur-sm">
            <CardContent class="p-6 space-y-6">
              <Skeleton class="h-6 w-32" />
              <Skeleton class="h-[350px] w-full rounded-2xl" />
            </CardContent>
          </Card>
        </template>
        <Card v-else class="border-none shadow-sm bg-background/50 backdrop-blur-sm">
          <CardContent class="p-6 h-fit">
            <h3 class="font-bold text-foreground text-sm uppercase tracking-wider mb-6 opacity-50 px-1">Kalender
              Akademik
            </h3>
            <Calendar />
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
