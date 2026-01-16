<script setup>
defineProps({
  actions: {
    type: Array,
    default: () => []
  }
});
</script>

<template>
  <div class="card bg-base-100 shadow-sm border border-base-200">
    <div class="card-body p-4">
      <h3 class="font-semibold text-base mb-3">Aksi Cepat</h3>
      <div class="grid grid-cols-2 gap-2">
        <button 
          v-for="(action, index) in actions" 
          :key="index"
          class="btn btn-sm justify-start gap-2"
          :class="action.variant || 'btn-ghost'"
        >
          <span class="text-lg">{{ action.icon }}</span>
          <span class="text-xs">{{ action.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
