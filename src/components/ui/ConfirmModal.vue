<script setup>
import { computed } from 'vue';
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline';

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

const iconConfig = computed(() => {
  const configs = {
    warning: {
      icon: ExclamationTriangleIcon,
      bgClass: 'bg-amber-50',
      iconClass: 'text-amber-600',
      buttonClass: 'bg-amber-600 hover:bg-amber-700 text-white'
    },
    error: {
      icon: ExclamationTriangleIcon,
      bgClass: 'bg-rose-50',
      iconClass: 'text-rose-600',
      buttonClass: 'bg-rose-600 hover:bg-rose-700 text-white'
    },
    info: {
      icon: InformationCircleIcon,
      bgClass: 'bg-blue-50',
      iconClass: 'text-blue-600',
      buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white'
    },
    success: {
      icon: CheckCircleIcon,
      bgClass: 'bg-emerald-50',
      iconClass: 'text-emerald-600',
      buttonClass: 'bg-emerald-600 hover:bg-emerald-700 text-white'
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
    <div v-if="show"
      class="fixed inset-0 bg-slate-950/20 backdrop-blur-md z-[120] flex items-center justify-center p-4 animate-in fade-in duration-200"
      @click="handleBackdropClick">
      <div
        class="bg-background rounded-3xl shadow-2xl shadow-primary/10 max-w-md w-full border border-primary/10 animate-in zoom-in-95 duration-200"
        @click.stop>
        <!-- Close Button -->
        <button @click="handleBackdropClick"
          class="absolute right-6 top-6 p-2.5 rounded-xl bg-primary/5 hover:bg-primary/10 text-muted-foreground hover:text-foreground transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/10 group">
          <XMarkIcon class="h-5 w-5 transition-transform group-hover:rotate-90 duration-200" />
        </button>

        <!-- Content -->
        <div class="p-10">
          <!-- Icon & Title -->
          <div class="flex items-start gap-5 mb-6">
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg"
              :class="iconConfig.bgClass">
              <component :is="iconConfig.icon" class="w-7 h-7" :class="iconConfig.iconClass" />
            </div>
            <div class="flex-1 pt-1">
              <h3 class="text-xl font-black tracking-tight text-foreground mb-2">{{ title }}</h3>
              <p class="text-sm font-medium text-muted-foreground/70 leading-relaxed">{{ message }}</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 mt-8">
            <button @click="handleCancel"
              class="flex-1 h-12 px-6 rounded-2xl border-2 border-primary/10 bg-background hover:bg-primary/5 text-foreground font-bold text-sm transition-all duration-200 active:scale-95">
              {{ cancelText }}
            </button>
            <button @click="handleConfirm"
              class="flex-1 h-12 px-6 rounded-2xl font-bold text-sm shadow-lg transition-all duration-200 active:scale-95"
              :class="iconConfig.buttonClass">
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
