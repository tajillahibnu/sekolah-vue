<script setup>
import { ref } from 'vue';

const title = ref('Penugasan TKA');
</script>

<template>
    <div class="p-6">
        <div class="mb-6">
            <h1 class="text-2xl font-bold text-gray-900">{{ title }}</h1>
            <p class="text-gray-600">Halaman untuk menugaskan TKA kepada siswa atau kelas.</p>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
            <p>Form penugasan TKA akan ditampilkan di sini.</p>
        </div>
    </div>
</template>
