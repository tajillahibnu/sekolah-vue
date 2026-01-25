<template>
    <div class="p-8">
        <div class="flex justify-between items-center mb-8">
            <div>
                <h1 class="text-2xl font-bold text-gray-800">Manajemen Kelas & Materi</h1>
                <p class="text-gray-500">Kelola materi pelajaran dan tugas untuk siswa.</p>
            </div>
            <button @click="openCreateModal"
                class="btn btn-primary bg-indigo-600 hover:bg-indigo-700 border-none text-white gap-2">
                <PlusIcon class="w-5 h-5" />
                Buat Kelas Baru
            </button>
        </div>

        <div v-if="loading" class="flex justify-center p-12">
            <span class="loading loading-spinner loading-lg text-indigo-600"></span>
        </div>

        <div v-else-if="courses.length === 0"
            class="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <BookOpenIcon class="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900">Belum Ada Kelas</h3>
            <p class="text-gray-500 max-w-sm mx-auto mt-2">Anda belum membuat kelas apapun. Mulai dengan membuat kelas
                baru untuk membagikan materi.</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <CourseCard v-for="course in courses" :key="course.id" :course="course" role="teacher"
                @click="goToDetail(course.id)" />
        </div>

        <!-- Create Course Modal -->
        <Modal :show="showCreateModal" title="Buat Kelas Baru" desc="Buat kelas mata pelajaran baru untuk siswa"
            size="md" @close="showCreateModal = false">
            <div class="space-y-6">
                <FormInput v-model="newCourse.title" label="Nama Mata Pelajaran"
                    placeholder="Contoh: Matematika Wajib X" :required="true" />

                <div class="form-control w-full">
                    <label class="label">
                        <span class="label-text font-bold mb-1">Tingkat Kelas</span>
                    </label>
                    <select class="select select-bordered w-full rounded-xl" v-model="newCourse.grade">
                        <option value="10">Kelas 10</option>
                        <option value="11">Kelas 11</option>
                        <option value="12">Kelas 12</option>
                    </select>
                </div>

                <FormTextarea v-model="newCourse.description" label="Deskripsi Singkat"
                    placeholder="Deskripsi singkat tentang mata pelajaran ini..." :rows="3" />

                <div class="flex justify-end gap-3 pt-6 border-t border-gray-100">
                    <button @click="showCreateModal = false" class="btn btn-ghost rounded-xl">Batal</button>
                    <button @click="handleCreateCourse" class="btn btn-primary rounded-xl px-8">Buat Kelas</button>
                </div>
            </div>
        </Modal>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { PlusIcon, BookOpenIcon } from '@heroicons/vue/24/outline';
import CourseCard from '../components/CourseCard.vue';
import { getCourses } from '../services';

// Shared UI Components
import Modal from '@/components/common/Modal.vue';
import FormInput from '@/components/ui/form/FormInput.vue';
import FormTextarea from '@/components/ui/form/FormTextarea.vue';

const router = useRouter();
const courses = ref([]);
const loading = ref(true);

const showCreateModal = ref(false);
const newCourse = reactive({
    title: '',
    description: '',
    grade: '10'
});

onMounted(async () => {
    try {
        courses.value = await getCourses('teacher');
    } finally {
        loading.value = false;
    }
});

const goToDetail = (id) => {
    router.push({ name: 'elearning-teach-detail', params: { id } });
};

const openCreateModal = () => {
    newCourse.title = '';
    newCourse.description = '';
    newCourse.grade = '10';
    showCreateModal.value = true;
};

const handleCreateCourse = () => {
    // Mock creation
    console.log('Creating course:', newCourse);
    showCreateModal.value = false;
    // In a real app we would refresh the list here
};
</script>
