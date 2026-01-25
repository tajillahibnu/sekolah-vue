<template>
    <div class="p-8">
        <div class="mb-8">
            <h1 class="text-2xl font-bold text-gray-800">Ruang Belajar Saya</h1>
            <p class="text-gray-500">Akses materi pelajaran dan tugas anda di sini.</p>
        </div>

        <div v-if="loading" class="flex justify-center p-12">
            <span class="loading loading-spinner loading-lg text-indigo-600"></span>
        </div>

        <div v-else-if="courses.length === 0"
            class="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <BookOpenIcon class="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900">Tidak Ada Kursus</h3>
            <p class="text-gray-500 max-w-sm mx-auto mt-2">Anda belum terdaftar dalam kursus apapun.</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <CourseCard v-for="course in courses" :key="course.id" :course="course" role="student"
                @click="goToDetail(course.id)" />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { BookOpenIcon } from '@heroicons/vue/24/outline';
import CourseCard from '../components/CourseCard.vue';
import { getCourses } from '../services';

const router = useRouter();
const courses = ref([]);
const loading = ref(true);

onMounted(async () => {
    try {
        courses.value = await getCourses('student');
    } finally {
        loading.value = false;
    }
});

const goToDetail = (id) => {
    router.push({ name: 'elearning-learn-detail', params: { id } });
};
</script>
