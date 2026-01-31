<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import StudentAttendance from './StudentAttendance.vue';
import AdminAttendance from './AdminAttendance.vue';

const authStore = useAuthStore();

// Determine which view to show
const isStudent = computed(() => {
    // Check if active role is student
    if (authStore.activeRole && authStore.activeRole.name.toLowerCase() === 'siswa') {
        return true;
    }
    // Also check if user object has role 'siswa' if activeRole is missing (fallback)
    return authStore.currentRoleName.toLowerCase() === 'siswa';
});
</script>

<template>
    <div class="attendance-wrapper">
        <component :is="isStudent ? StudentAttendance : AdminAttendance" />
    </div>
</template>
