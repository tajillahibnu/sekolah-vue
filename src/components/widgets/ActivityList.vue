<script setup>
defineProps({
  activities: {
    type: Array,
    default: () => []
  }
});
</script>

<template>
  <div class="card bg-base-100 shadow-sm border border-base-200">
    <div class="card-body p-4">
      <h3 class="font-semibold text-base mb-3">Aktivitas Terkini</h3>
      <div class="space-y-3">
        <div v-for="(activity, index) in activities" :key="index" class="flex items-start gap-3">
          <div class="w-2 h-2 rounded-full mt-1.5 shrink-0" :class="`bg-${activity.color || 'primary'}`"></div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-base-content">{{ activity.title }}</p>
            <p class="text-xs text-base-content/60">{{ activity.time }}</p>
          </div>
        </div>
        <div v-if="activities.length === 0" class="text-center py-4 text-sm text-base-content/60">
          Tidak ada aktivitas terkini
        </div>
      </div>
    </div>
  </div>
</template>
