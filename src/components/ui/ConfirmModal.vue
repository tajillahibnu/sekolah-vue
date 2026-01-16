<script setup>
import { computed } from 'vue';
import * as HeroIcons from '@heroicons/vue/24/outline';

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: 'Confirm Action'
  },
  message: {
    type: String,
    default: 'Are you sure you want to proceed?'
  },
  confirmText: {
    type: String,
    default: 'Confirm'
  },
  cancelText: {
    type: String,
    default: 'Cancel'
  },
  type: {
    type: String,
    default: 'warning', // warning, error, info, success
    validator: (value) => ['warning', 'error', 'info', 'success'].includes(value)
  }
});

const emit = defineEmits(['confirm', 'cancel', 'close']);

const IconComponent = (name) => {
  return HeroIcons[name] || HeroIcons['QuestionMarkCircleIcon'];
};

const iconConfig = computed(() => {
  const configs = {
    warning: {
      icon: 'ExclamationTriangleIcon',
      bgClass: 'bg-warning/10',
      textClass: 'text-warning'
    },
    error: {
      icon: 'ExclamationTriangleIcon',
      bgClass: 'bg-error/10',
      textClass: 'text-error'
    },
    info: {
      icon: 'InformationCircleIcon',
      bgClass: 'bg-info/10',
      textClass: 'text-info'
    },
    success: {
      icon: 'CheckCircleIcon',
      bgClass: 'bg-success/10',
      textClass: 'text-success'
    }
  };
  return configs[props.type] || configs.warning;
});

const handleConfirm = () => {
  emit('confirm');
  emit('close');
};

const handleCancel = () => {
  emit('cancel');
  emit('close');
};

const handleBackdropClick = () => {
  emit('close');
};
</script>

<template>
  <Teleport to="body">
    <div 
      v-if="show" 
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" 
      @click="handleBackdropClick"
    >
      <div class="bg-base-100 rounded-2xl shadow-2xl max-w-md w-full p-6" @click.stop>
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 rounded-full flex items-center justify-center" :class="iconConfig.bgClass">
            <component :is="IconComponent(iconConfig.icon)" class="w-6 h-6" :class="iconConfig.textClass" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-base-content">{{ title }}</h3>
            <p class="text-sm text-base-content/60">{{ message }}</p>
          </div>
        </div>
        <div class="flex gap-3 mt-6">
          <button @click="handleCancel" class="flex-1 btn btn-outline">
            {{ cancelText }}
          </button>
          <button @click="handleConfirm" class="flex-1 btn" :class="type === 'error' ? 'btn-error' : 'btn-primary'">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
