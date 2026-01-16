<script setup>
import { Card, CardContent } from '@/components/ui/card';

defineProps({
  actions: {
    type: Array,
    default: () => []
  }
});
</script>

<template>
  <Card class="border-none shadow-sm bg-background/50 backdrop-blur-sm">
    <CardContent class="p-6">
      <h3 class="font-bold text-foreground text-sm uppercase tracking-wider mb-4 opacity-50 px-1">Aksi Cepat</h3>
      <div class="grid grid-cols-2 gap-3">
        <button v-for="(action, index) in actions" :key="index"
          class="flex items-center gap-3 px-4 py-3 bg-primary/5 hover:bg-primary/10 hover:text-primary rounded-xl transition-all group border border-transparent hover:border-primary/20">
          <span class="text-xl transition-transform group-hover:scale-110">{{ action.icon }}</span>
          <span class="text-sm font-semibold truncate">{{ action.label }}</span>
        </button>
      </div>
    </CardContent>
  </Card>
</template>
