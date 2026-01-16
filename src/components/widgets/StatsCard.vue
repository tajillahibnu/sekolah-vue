<script setup>
defineProps({
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
</script>

<template>
  <div class="card bg-base-100 shadow-sm border border-base-200">
    <div class="card-body p-4">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <p class="text-xs text-base-content/60 font-medium mb-1">{{ title }}</p>
          <p class="text-2xl font-bold text-base-content">{{ value }}</p>
          <p v-if="trend" class="text-xs mt-2" :class="trend === 'up' ? 'text-success' : trend === 'down' ? 'text-error' : 'text-base-content/60'">
            <span v-if="trendValue">{{ trendValue }}</span>
            <span v-if="trend === 'up'">↑</span>
            <span v-else-if="trend === 'down'">↓</span>
          </p>
        </div>
        <div v-if="icon" class="w-12 h-12 rounded-lg flex items-center justify-center" :class="`bg-${color}/10 text-${color}`">
          <span class="text-2xl">{{ icon }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
