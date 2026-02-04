<script setup>
import { ref, computed } from 'vue';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline';

const currentDate = ref(new Date());
const selectedDate = ref(new Date());

const currentMonth = computed(() => currentDate.value.getMonth());
const currentYear = computed(() => currentDate.value.getFullYear());

const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const daysInMonth = computed(() => {
  const year = currentYear.value;
  const month = currentMonth.value;
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days = [];

  // Add empty slots for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }

  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }

  return days;
});

const isToday = (date) => {
  if (!date) return false;
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

const isSelected = (date) => {
  if (!date) return false;
  return date.getDate() === selectedDate.value.getDate() &&
    date.getMonth() === selectedDate.value.getMonth() &&
    date.getFullYear() === selectedDate.value.getFullYear();
};

const previousMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1);
};

const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1);
};

const selectDate = (date) => {
  if (date) {
    selectedDate.value = date;
  }
};
</script>

<template>
  <div class="bg-card text-card-foreground rounded-xl border border-border shadow-sm overflow-hidden">
    <!-- Calendar Header -->
    <div class="bg-muted/30 px-4 py-3 border-b border-border">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold text-foreground">
          {{ monthNames[currentMonth] }} {{ currentYear }}
        </h3>
        <div class="flex gap-1">
          <button @click="previousMonth"
            class="p-1 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeftIcon class="w-4 h-4" />
          </button>
          <button @click="nextMonth"
            class="p-1 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors">
            <ChevronRightIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="p-3">
      <!-- Day Names -->
      <div class="grid grid-cols-7 gap-1 mb-2">
        <div v-for="day in dayNames" :key="day" class="text-center text-xs font-medium text-muted-foreground py-1">
          {{ day }}
        </div>
      </div>

      <!-- Days -->
      <div class="grid grid-cols-7 gap-1">
        <button v-for="(date, index) in daysInMonth" :key="index" @click="selectDate(date)" :disabled="!date"
          class="aspect-square flex items-center justify-center text-sm rounded-lg transition-all duration-200" :class="{
            'invisible': !date,
            'bg-primary text-primary-foreground font-bold': isToday(date),
            'bg-primary/10 text-primary font-medium': isSelected(date) && !isToday(date),
            'hover:bg-muted text-foreground': date && !isToday(date) && !isSelected(date)
          }">
          {{ date ? date.getDate() : '' }}
        </button>
      </div>
    </div>
  </div>
</template>
