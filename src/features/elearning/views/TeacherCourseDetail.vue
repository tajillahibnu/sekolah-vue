<template>
    <div class="p-8">
        <div v-if="loading" class="flex justify-center p-12">
            <span class="loading loading-spinner loading-lg text-indigo-600"></span>
        </div>

        <div v-else-if="course">
            <div class="flex justify-between items-start mb-6">
                <div>
                    <button @click="router.back()"
                        class="flex items-center text-gray-500 hover:text-indigo-600 mb-2 transition-colors">
                        <ArrowLeftIcon class="w-4 h-4 mr-1" />
                        Kembali
                    </button>
                    <h1 class="text-2xl font-bold text-gray-800">{{ course.title }}</h1>
                    <p class="text-gray-500">{{ course.description }}</p>
                </div>
                <div class="flex gap-3">
                    <button @click="openEditModal"
                        class="btn btn-outline border-gray-300 text-gray-700 hover:bg-gray-50">
                        <PencilSquareIcon class="w-5 h-5 mr-2" />
                        Edit Info
                    </button>
                    <button @click="openAddModal"
                        class="btn btn-primary bg-indigo-600 hover:bg-indigo-700 border-none text-white">
                        <PlusIcon class="w-5 h-5 mr-2" />
                        Tambah Materi
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Main Content: Module List -->
                <div class="lg:col-span-2 space-y-6">
                    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-lg font-bold text-gray-800">Kurikulum & Materi</h2>
                        </div>

                        <ModuleList :modules="course.modules" @select-lesson="onLessonSelect" />
                    </div>
                </div>

                <!-- Sidebar: Stats & Settings -->
                <div class="space-y-6">
                    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 class="font-bold text-gray-800 mb-4">Statistik Kursus</h3>
                        <div class="space-y-4">
                            <div class="flex justify-between items-center pb-3 border-b border-gray-50">
                                <span class="text-gray-500">Total Siswa</span>
                                <span class="font-semibold text-gray-800">32</span>
                            </div>
                            <div class="flex justify-between items-center pb-3 border-b border-gray-50">
                                <span class="text-gray-500">Rata-rata Nilai</span>
                                <span class="font-semibold text-gray-800">84.5</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-gray-500">Tingkat Penyelesaian</span>
                                <span class="font-semibold text-gray-800">45%</span>
                            </div>
                        </div>
                        <button
                            class="w-full mt-6 btn btn-sm btn-outline text-indigo-600 hover:bg-indigo-50 border-indigo-200">
                            Lihat Laporan Detail
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="text-center py-12">
            <h3 class="text-lg font-medium text-gray-900">Kursus tidak ditemukan</h3>
            <button @click="router.push({ name: 'elearning-teach' })" class="btn btn-link text-indigo-600">
                Kembali ke Daftar
            </button>
        </div>
        <div class="modal-box">
            <h3 class="font-bold text-lg mb-4">Tambah Materi Baru</h3>

            <div class="form-control w-full mb-3">
                <label class="label">
                    <span class="label-text">Judul Materi</span>
                </label>
                <input type="text" placeholder="Contoh: Pengantar Aljabar" class="input input-bordered w-full" />
            </div>

            <div class="form-control w-full mb-3">
                <label class="label">
                    <span class="label-text">Tipe Materi</span>
                </label>
                <select class="select select-bordered" v-model="newLessonType">
                    <option value="video">Video Pembelajaran</option>
                    <option value="pdf">Dokumen PDF</option>
                    <option value="quiz">Kuis / Latihan Soal</option>
                </select>
            </div>

            <!-- Dynamic Fields based on Type -->
            <div v-if="newLessonType === 'video'" class="form-control w-full mb-3">
                <label class="label"><span class="label-text">URL Video (Youtube)</span></label>
                <input type="text" placeholder="https://youtube.com/..." class="input input-bordered w-full" />
            </div>

            <div v-if="newLessonType === 'pdf'" class="form-control w-full mb-3">
                <label class="label"><span class="label-text">Upload File PDF</span></label>
                <input type="file" class="file-input file-input-bordered w-full" accept=".pdf" />
            </div>

            <div v-if="newLessonType === 'quiz'" class="form-control w-full mb-3">
                <label class="label cursor-pointer justify-start gap-4">
                    <input type="checkbox" class="checkbox checkbox-primary" />
                    <span class="label-text">Kuis ini bersifat Opsional (Tidak wajib)</span>
                </label>
                <p class="text-xs text-gray-500 mt-1">Siswa dapat melewati kuis ini tanpa mempengaruhi progress
                    wajib.</p>
            </div>

            <div class="modal-action">
                <form method="dialog">
                    <button class="btn btn-ghost mr-2">Batal</button>
                    <button class="btn btn-primary">Simpan</button>
                </form>
            </div>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </div>

    <!-- Add Module/Lesson Modal -->
    <!-- Add Module/Lesson Modal -->
    <!-- Add/Edit Lesson Modal -->
    <Modal :show="showLessonModal" :title="lessonForm.id ? 'Edit Materi' : 'Tambah Materi Baru'"
        :desc="lessonForm.id ? 'Perbarui konten materi pembelajaran' : 'Tambahkan konten pembelajaran untuk siswa'"
        :size="lessonForm.type === 'quiz' ? 'xl' : 'md'" @close="showLessonModal = false">
        <div class="space-y-6">
            <FormInput link v-model="lessonForm.title" label="Judul Materi" placeholder="Contoh: Pengantar Aljabar"
                :required="true" />

            <FormSelect v-model="lessonForm.type" label="Tipe Materi" :options="[
                { value: 'video', label: 'Video Pembelajaran' },
                { value: 'pdf', label: 'Dokumen PDF' },
                { value: 'quiz', label: 'Kuis / Latihan Soal' }
            ]" :required="true" />

            <!-- Dynamic Fields -->
            <div v-if="lessonForm.type === 'video'" class="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                <FormInput v-model="lessonForm.videoUrl" label="URL Video (Youtube)"
                    placeholder="https://youtube.com/..." :required="true" />
            </div>

            <div v-if="lessonForm.type === 'pdf'" class="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                <div class="form-control w-full">
                    <label class="label"><span class="label-text font-bold mb-1">Upload File PDF</span></label>
                    <input type="file" class="file-input file-input-bordered w-full rounded-xl" accept=".pdf" />
                </div>
            </div>

            <!-- Quiz Builder -->
            <div v-if="lessonForm.type === 'quiz'" class="animate-in fade-in zoom-in-95 duration-200 space-y-6">
                <div class="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-4">
                    <label class="label cursor-pointer justify-start gap-4">
                        <input type="checkbox" v-model="lessonForm.isOptional"
                            class="checkbox checkbox-primary rounded-lg" />
                        <span class="label-text font-bold text-indigo-900">Kuis ini bersifat Opsional</span>
                    </label>
                    <p class="text-xs text-indigo-600/70 mt-1 ml-10">Siswa dapat melewati kuis ini tanpa mempengaruhi
                        progress wajib.</p>
                </div>

                <div class="flex justify-between items-center border-b border-gray-100 pb-2">
                    <h4 class="font-bold text-gray-700">Daftar Pertanyaan</h4>
                    <button @click="addQuestion" class="btn btn-sm btn-primary btn-outline gap-2">
                        <PlusIcon class="w-4 h-4" /> Tambah Soal
                    </button>
                </div>

                <div v-if="lessonForm.quizQuestions.length === 0"
                    class="text-center py-8 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
                    <p class="text-gray-400 text-sm">Belum ada pertanyaan. Klik tombol diatas untuk menambahkan.</p>
                </div>

                <div v-else class="space-y-6">
                    <div v-for="(question, qIndex) in lessonForm.quizQuestions" :key="qIndex"
                        class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm relative group hover:border-indigo-300 transition-colors">

                        <div class="absolute top-4 right-4">
                            <button @click="removeQuestion(qIndex)"
                                class="text-gray-400 hover:text-red-500 transition-colors">
                                <TrashIcon class="w-5 h-5" />
                            </button>
                        </div>

                        <div class="space-y-4 pr-8">
                            <!-- Question Text + Score -->
                            <div class="grid grid-cols-1 md:grid-cols-[1fr_120px] gap-4">
                                <FormInput label="Pertanyaan" v-model="question.text"
                                    placeholder="Tulis pertanyaan disini..." />
                                <FormInput label="Skor" type="number" v-model="question.score" placeholder="10" />
                            </div>

                            <!-- Options -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div v-for="(opt, oIndex) in 4" :key="oIndex" class="flex items-center gap-2">
                                    <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                                        :class="question.correctAnswer === oIndex ? 'bg-green-100 text-green-700 ring-2 ring-green-500' : 'bg-gray-100 text-gray-500'">
                                        {{ ['A', 'B', 'C', 'D'][oIndex] }}
                                    </div>
                                    <input type="text" v-model="question.options[oIndex]"
                                        class="input input-sm input-bordered w-full" placeholder="Jawaban..." />
                                    <input type="radio" :name="`correct-${qIndex}`" :value="oIndex"
                                        v-model="question.correctAnswer" class="radio radio-sm radio-success"
                                        title="Tandai sebagai jawaban benar" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button @click="showLessonModal = false" class="btn btn-ghost rounded-xl">Batal</button>
                <button @click="handleSaveLesson" class="btn btn-primary rounded-xl px-8">Simpan</button>
            </div>
        </div>
    </Modal>

    <!-- Edit Course Info Modal -->
    <Modal :show="showEditModal" title="Edit Informasi Kursus" desc="Perbarui detail informasi kursus ini" size="md"
        @close="showEditModal = false">
        <div class="space-y-6">
            <FormInput v-model="editForm.title" label="Nama Mata Pelajaran" placeholder="Contoh: Matematika Wajib X"
                :required="true" />

            <div class="form-control w-full">
                <label class="label">
                    <span class="label-text font-bold mb-1">Tingkat Kelas</span>
                </label>
                <select class="select select-bordered w-full rounded-xl" v-model="editForm.grade">
                    <option value="10">Kelas 10</option>
                    <option value="11">Kelas 11</option>
                    <option value="12">Kelas 12</option>
                </select>
            </div>

            <FormTextarea v-model="editForm.description" label="Deskripsi Singkat"
                placeholder="Deskripsi singkat tentang mata pelajaran ini..." :rows="3" />

            <div class="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button @click="showEditModal = false" class="btn btn-ghost rounded-xl">Batal</button>
                <button @click="handleUpdateCourse" class="btn btn-primary rounded-xl px-8">Simpan Perubahan</button>
            </div>
        </div>
    </Modal>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeftIcon, PencilSquareIcon, PlusIcon, TrashIcon, CheckCircleIcon } from '@heroicons/vue/24/outline';
import ModuleList from '../components/ModuleList.vue';
import { getCourseById } from '../services';

// Shared UI Components
import Modal from '@/components/common/Modal.vue';
import FormInput from '@/components/ui/form/FormInput.vue';
import FormSelect from '@/components/ui/form/FormSelect.vue';
import FormTextarea from '@/components/ui/form/FormTextarea.vue';

const route = useRoute();
const router = useRouter();
const course = ref(null);
const loading = ref(true);

// Modal States
const showLessonModal = ref(false);
const showEditModal = ref(false);

// Lesson Form State
const lessonForm = reactive({
    id: null,
    title: '',
    type: 'video',
    videoUrl: '',
    pdfFile: null,
    isOptional: false,
    quizQuestions: []
});

// Edit Course Form State
const editForm = ref({
    title: '',
    description: '',
    grade: ''
});

onMounted(async () => {
    try {
        course.value = await getCourseById(route.params.id);
    } finally {
        loading.value = false;
    }
});

// --- Lesson Management ---

const resetLessonForm = () => {
    lessonForm.id = null;
    lessonForm.title = '';
    lessonForm.type = 'video';
    lessonForm.videoUrl = '';
    lessonForm.pdfFile = null;
    lessonForm.isOptional = false;
    lessonForm.quizQuestions = [];
};

const openAddModal = () => {
    resetLessonForm();
    showLessonModal.value = true;
};

const onLessonSelect = (lesson) => {
    // Populate form for editing
    lessonForm.id = lesson.id;
    lessonForm.title = lesson.title;
    lessonForm.type = lesson.type;
    lessonForm.videoUrl = lesson.url || ''; // Mock
    lessonForm.isOptional = false; // Mock

    // Mock quiz data if needed
    if (lesson.type === 'quiz') {
        lessonForm.quizQuestions = [
            {
                text: 'Apa hasil dari 2 + 2?',
                options: ['3', '4', '5', '6'],
                correctAnswer: 1, // index 1 = '4'
                score: 10
            }
        ];
    } else {
        lessonForm.quizQuestions = [];
    }

    showLessonModal.value = true;
};

const handleSaveLesson = () => {
    console.log('Saving lesson:', lessonForm);
    showLessonModal.value = false;
    // In real app, dispatch update/create action here
};

// --- Quiz Builder Logic ---

const addQuestion = () => {
    lessonForm.quizQuestions.push({
        text: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        score: 10
    });
};

const removeQuestion = (index) => {
    lessonForm.quizQuestions.splice(index, 1);
};

// --- Course Info Management ---

const openEditModal = () => {
    if (course.value) {
        editForm.value = {
            title: course.value.title,
            description: course.value.description,
            grade: course.value.grade || '10'
        };
        showEditModal.value = true;
    }
};

const handleUpdateCourse = () => {
    if (course.value) {
        course.value = {
            ...course.value,
            ...editForm.value
        };
        showEditModal.value = false;
    }
};
</script>
