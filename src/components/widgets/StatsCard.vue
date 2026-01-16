<script setup>
import { computed } from 'vue';
import { Card, CardContent } from '@/components/ui/card';

const props = defineProps({
  title: String,
  value: [String, Number],
  icon: String,
  trend: String,
  trendValue: String,
  color: {
    type: String,
    default: 'primary'
  }
});

const colorClasses = computed(() => {
  const maps = {
    primary: 'bg-indigo-50 text-indigo-600',
    secondary: 'bg-purple-50 text-purple-600',
    success: 'bg-emerald-50 text-emerald-600',
    warning: 'bg-amber-50 text-amber-600',
    error: 'bg-rose-50 text-rose-600',
    info: 'bg-sky-50 text-sky-600'
  };
  return maps[props.color] || maps.primary;
});
</script>

<template>
  <Card
    class="transition-all hover:shadow-lg hover:shadow-primary/5 group border-none shadow-sm bg-background/50 backdrop-blur-sm">
    <CardContent class="p-6">
      <div class="flex items-start justify-between">
        <div class="space-y-1.5">
          <p class="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">{{ title }}
          </p>
          <div class="flex items-baseline gap-2">
            <p class="text-3xl font-bold tracking-tight text-foreground">{{ value }}</p>
          </div>
          <p v-if="trend" class="flex items-center gap-1 text-xs font-semibold"
            :class="trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground'">
            <span v-if="trend === 'up'" class="p-0.5 bg-green-50 rounded-full text-[10px]">↑</span>
            <span v-else-if="trend === 'down'" class="p-0.5 bg-destructive/10 rounded-full text-[10px]">↓</span>
            <span v-if="trendValue">{{ trendValue }}</span>
          </p>
        </div>
        <div v-if="icon"
          class="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm"
          :class="colorClasses">
          <span class="text-2xl">{{ icon }}</span>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
