<script setup>
import { Card, CardContent } from '@/components/ui/card';

defineProps({
  activities: {
    type: Array,
    default: () => []
  }
});
</script>

<template>
  <Card class="border-none shadow-sm bg-background/50 backdrop-blur-sm">
    <CardContent class="p-6">
      <h3 class="font-bold text-foreground text-sm uppercase tracking-wider mb-5 opacity-50 px-1">Aktivitas Terkini</h3>
      <div class="space-y-5">
        <div v-for="(activity, index) in activities" :key="index" class="flex items-start gap-4 group cursor-default">
          <div class="relative flex flex-col items-center">
            <div
              class="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ring-4 ring-background transition-transform group-hover:scale-125"
              :class="activity.color === 'success' ? 'bg-green-500' : activity.color === 'error' ? 'bg-destructive' : 'bg-primary'">
            </div>
            <div v-if="index !== activities.length - 1" class="w-px h-full bg-primary/10 absolute top-5"></div>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{{
              activity.title
              }}</p>
            <p class="text-xs font-medium text-muted-foreground">{{ activity.time }}</p>
          </div>
        </div>
        <div v-if="activities.length === 0" class="text-center py-8">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/5 mb-3">
            <span class="text-2xl text-muted-foreground opacity-50">∅</span>
          </div>
          <p class="text-sm font-medium text-muted-foreground">Tidak ada aktivitas terkini</p>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
