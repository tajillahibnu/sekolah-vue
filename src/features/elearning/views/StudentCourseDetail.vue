<template>
    <div class="h-[calc(100vh-64px)] flex flex-col">
        <!-- Header -->
        <div class="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shrink-0">
            <div class="flex items-center gap-4">
                <button @click="router.push({ name: 'elearning-learn' })"
                    class="text-gray-500 hover:text-indigo-600 transition-colors">
                    <ArrowLeftIcon class="w-5 h-5" />
                </button>
                <div>
                    <h1 class="font-bold text-gray-800 text-lg" v-if="course">{{ course.title }}</h1>
                </div>
            </div>
            <div v-if="course" class="flex items-center gap-3">
                <div class="text-right hidden sm:block">
                    <div class="text-xs text-gray-500">Progress Anda</div>
                    <div class="text-sm font-bold text-indigo-600">{{ course.progress }}%</div>
                </div>
                <div class="w-24 bg-gray-200 rounded-full h-2 hidden sm:block">
                    <div class="bg-indigo-600 h-2 rounded-full" :style="{ width: course.progress + '%' }"></div>
                </div>
            </div>
        </div>

        <div v-if="loading" class="flex-grow flex justify-center items-center">
            <span class="loading loading-spinner loading-lg text-indigo-600"></span>
        </div>

        <div v-else-if="course" class="flex-grow flex overflow-hidden">
            <!-- Sidebar / Playlist -->
            <div class="w-80 border-r border-gray-200 bg-white flex flex-col shrink-0 overflow-y-auto hidden md:block">
                <div class="p-4 bg-gray-50 font-semibold text-gray-700 border-b border-gray-200">
                    Daftar Materi
                </div>
                <div class="p-4">
                    <ModuleList :modules="course.modules" @select-lesson="selectLesson" />
                </div>
            </div>

            <!-- Main Content Area -->
            <div class="flex-grow bg-gray-50 overflow-y-auto p-6 md:p-8">
                <div v-if="currentLesson" class="max-w-4xl mx-auto">
                    <!-- Breadcrumbs -->
                    <div class="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <span>{{ course.title }}</span>
                        <ChevronRightIcon class="w-4 h-4" />
                        <span class="font-medium text-gray-800">{{ currentLesson.title }}</span>
                    </div>

                    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                        <!-- Video Player Simulation -->
                        <div v-if="currentLesson.type === 'video'"
                            class="aspect-video bg-black flex items-center justify-center relative group cursor-pointer">
                            <PlayCircleIcon
                                class="w-20 h-20 text-white/80 group-hover:text-white transition-all transform group-hover:scale-110" />
                            <div class="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                                {{ currentLesson.duration }}
                            </div>
                        </div>

                        <!-- Document Viewer (PDF) -->
                        <div v-else-if="currentLesson.type === 'pdf'" class="flex flex-col h-[600px] border-b">
                            <div class="bg-gray-100 p-4 border-b flex justify-between items-center">
                                <div class="flex items-center gap-2 text-sm text-gray-700">
                                    <DocumentTextIcon class="w-5 h-5" />
                                    <span class="font-medium">{{ currentLesson.title }}.pdf</span>
                                </div>
                                <div class="flex gap-2">
                                    <button class="btn btn-sm btn-ghost">Page 1 of {{ currentLesson.pages }}</button>
                                    <button class="btn btn-primary btn-sm gap-2">
                                        <ArrowDownTrayIcon class="w-4 h-4" /> Download
                                    </button>
                                </div>
                            </div>
                            <!-- Mock PDF View -->
                            <div class="flex-grow bg-gray-500 overflow-y-auto p-8 flex justify-center">
                                <div
                                    class="bg-white shadow-lg w-full max-w-2xl h-[800px] p-12 text-gray-800 text-sm leading-relaxed relative">
                                    <!-- Decorate as PDF page -->
                                    <div class="h-full border border-gray-100 p-8">
                                        <h1 class="text-3xl font-bold mb-6 text-center text-gray-900 border-b pb-4">{{
                                            currentLesson.title }}</h1>
                                        <p class="mb-4 text-justify">
                                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
                                            tempor incididunt ut labore et dolore magna aliqua.
                                            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                                            aliquip ex ea commodo consequat.
                                        </p>
                                        <p class="mb-4 text-justify">
                                            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore
                                            eu fugiat nulla pariatur.
                                            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
                                            deserunt mollit anim id est laborum.
                                        </p>
                                        <div
                                            class="my-8 h-40 bg-gray-100 rounded flex items-center justify-center text-gray-400 italic">
                                            [Illustration / Diagram Placeholder]
                                        </div>
                                        <p class="mb-4 text-justify">
                                            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium
                                            doloremque laudantium, totam rem aperiam.
                                        </p>
                                    </div>
                                    <div class="absolute bottom-4 right-8 text-gray-400 text-xs">Page 1</div>
                                </div>
                            </div>
                        </div>

                        <!-- Quiz Interface -->
                        <div v-else-if="currentLesson.type === 'quiz'" class="p-8">
                            <div v-if="!quizStarted && !quizCompleted" class="text-center py-12">
                                <ClipboardDocumentCheckIcon class="w-24 h-24 text-indigo-200 mx-auto mb-6" />
                                <h2 class="text-2xl font-bold text-gray-800 mb-3">{{ currentLesson.title }}</h2>
                                <div class="flex justify-center gap-4 text-sm text-gray-500 mb-8">
                                    <span class="flex items-center gap-1">
                                        <ClockIcon class="w-4 h-4" /> 15 Menit
                                    </span>
                                    <span class="flex items-center gap-1">
                                        <QuestionMarkCircleIcon class="w-4 h-4" /> {{ currentLesson.questions }} Soal
                                    </span>
                                </div>
                                <div class="alert alert-info max-w-md mx-auto mb-8 text-left text-sm shadow-sm"
                                    v-if="currentLesson.isOptional">
                                    <InformationCircleIcon class="w-5 h-5" />
                                    <span>Kuis ini bersifat <strong>opsional</strong>. Anda dapat melewatinya jika
                                        ingin.</span>
                                </div>
                                <button @click="startQuiz"
                                    class="btn btn-primary bg-indigo-600 text-white border-none px-12 btn-lg shadow-lg shadow-indigo-200">
                                    Mulai Kuis
                                </button>
                            </div>

                            <!-- Quiz Active State -->
                            <div v-else-if="quizStarted && !quizCompleted" class="max-w-2xl mx-auto">
                                <div class="flex justify-between items-center mb-6">
                                    <h3 class="font-bold text-gray-500">Soal {{ currentQuestionIndex + 1 }} / {{
                                        quizData.length }}</h3>
                                    <div class="badge badge-lg badge-ghost gap-2">
                                        <ClockIcon class="w-4 h-4" /> 14:32
                                    </div>
                                </div>

                                <div class="card bg-white border border-gray-200 shadow-sm mb-6">
                                    <div class="card-body">
                                        <h4 class="text-lg font-medium text-gray-800 mb-6">{{ currentQuestion.question
                                            }}</h4>
                                        <div class="space-y-3">
                                            <button v-for="(option, idx) in currentQuestion.options" :key="idx"
                                                class="w-full text-left p-4 rounded-lg border hover:bg-indigo-50 hover:border-indigo-300 transition-all flex items-center gap-3"
                                                :class="selectedAnswer === idx ? 'border-indigo-600 ring-1 ring-indigo-600 bg-indigo-50' : 'border-gray-200'"
                                                @click="selectAnswer(idx)">
                                                <div class="w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold"
                                                    :class="selectedAnswer === idx ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 text-gray-500'">
                                                    {{ ['A', 'B', 'C', 'D'][idx] }}
                                                </div>
                                                <span>{{ option }}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div class="flex justify-between mt-8">
                                    <button class="btn btn-ghost" :disabled="currentQuestionIndex === 0"
                                        @click="prevQuestion">
                                        Previous
                                    </button>
                                    <button class="btn btn-primary" @click="nextQuestion">
                                        {{ currentQuestionIndex === quizData.length - 1 ? 'Selesai' : 'Next' }}
                                    </button>
                                </div>
                            </div>

                            <!-- Quiz Result -->
                            <div v-else-if="quizCompleted" class="text-center py-12 max-w-lg mx-auto">
                                <div
                                    class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                                    <CheckCircleIcon class="w-12 h-12" />
                                </div>
                                <h2 class="text-3xl font-bold text-gray-800 mb-2">Selamat!</h2>
                                <p class="text-gray-500 mb-8">Anda telah menyelesaikan kuis ini.</p>

                                <div class="grid grid-cols-3 gap-4 mb-8">
                                    <div class="bg-gray-50 p-4 rounded-xl">
                                        <div class="text-xs text-gray-500 uppercase tracking-wide">Skor</div>
                                        <div class="text-2xl font-bold text-indigo-600">80</div>
                                    </div>
                                    <div class="bg-gray-50 p-4 rounded-xl">
                                        <div class="text-xs text-gray-500 uppercase tracking-wide">Benar</div>
                                        <div class="text-2xl font-bold text-green-600">4/5</div>
                                    </div>
                                    <div class="bg-gray-50 p-4 rounded-xl">
                                        <div class="text-xs text-gray-500 uppercase tracking-wide">Waktu</div>
                                        <div class="text-2xl font-bold text-gray-800">5m</div>
                                    </div>
                                </div>

                                <button @click="resetQuiz" class="btn btn-outline mr-2">Ulangi Kuis</button>
                                <button @click="markLessonComplete" class="btn btn-primary">Lanjut Materi
                                    Berikutnya</button>
                            </div>
                        </div>

                        <div class="p-6" v-if="!quizStarted || quizCompleted">
                            <div class="flex justify-between items-start mb-4">
                                <h2 class="text-2xl font-bold text-gray-800">{{ currentLesson.title }}</h2>
                                <button class="btn btn-sm btn-outline"
                                    :class="currentLesson.completed ? 'btn-success text-white' : 'text-gray-600'">
                                    <CheckCircleIcon class="w-4 h-4 mr-1" />
                                    {{ currentLesson.completed ? 'Selesai' : 'Tandai Selesai' }}
                                </button>
                            </div>
                            <p class="text-gray-600 leading-relaxed">
                                Deskripsi atau konten tambahan untuk materi ini akan ditampilkan di sini. Guru dapat
                                menambahkan catatan atau instruksi khusus untuk siswa.
                            </p>
                        </div>
                    </div>

                    <!-- Navigation Buttons -->
                    <div class="flex justify-between" v-if="!quizStarted || quizCompleted">
                        <button class="btn btn-ghost text-gray-600 gap-2">
                            <ArrowLeftIcon class="w-4 h-4" /> Sebelumnya
                        </button>
                        <button class="btn btn-primary bg-indigo-600 border-none text-white gap-2">
                            Selanjutnya
                            <ArrowRightIcon class="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div v-else class="h-full flex flex-col items-center justify-center text-gray-400">
                    <BookOpenIcon class="w-20 h-20 mb-4 text-gray-300" />
                    <p>Pilih materi dari daftar di sebelah kiri untuk mulai belajar.</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    ChevronRightIcon,
    PlayCircleIcon,
    DocumentTextIcon,
    ClipboardDocumentCheckIcon,
    CheckCircleIcon,
    BookOpenIcon,
    ArrowDownTrayIcon,
    ClockIcon,
    QuestionMarkCircleIcon,
    InformationCircleIcon
} from '@heroicons/vue/24/outline';
import ModuleList from '../components/ModuleList.vue';
import { getCourseById } from '../services';

const route = useRoute();
const router = useRouter();
const course = ref(null);
const loading = ref(true);
const currentLesson = ref(null);

// Quiz State
const quizStarted = ref(false);
const quizCompleted = ref(false);
const currentQuestionIndex = ref(0);
const selectedAnswer = ref(null);
const quizData = ref([]);

const currentQuestion = computed(() => quizData.value[currentQuestionIndex.value]);

onMounted(async () => {
    try {
        course.value = await getCourseById(route.params.id);
        // Auto select first lesson
        if (course.value?.modules?.[0]?.lessons?.[0]) {
            currentLesson.value = course.value.modules[0].lessons[0];
        }
    } finally {
        loading.value = false;
    }
});

const selectLesson = (lesson) => {
    currentLesson.value = lesson;
    resetQuizState();
};

const resetQuizState = () => {
    quizStarted.value = false;
    quizCompleted.value = false;
    currentQuestionIndex.value = 0;
    selectedAnswer.value = null;
};

// Quiz Logic
const startQuiz = () => {
    quizStarted.value = true;
    // Load quiz data from currentLesson (mock)
    quizData.value = currentLesson.value.quizData || [
        { question: "Contoh Soal 1?", options: ["A", "B", "C", "D"], correct: 0 },
        { question: "Contoh Soal 2?", options: ["A", "B", "C", "D"], correct: 1 }
    ];
};

const selectAnswer = (idx) => {
    selectedAnswer.value = idx;
};

const nextQuestion = () => {
    if (currentQuestionIndex.value < quizData.value.length - 1) {
        currentQuestionIndex.value++;
        selectedAnswer.value = null;
    } else {
        finishQuiz();
    }
};

const prevQuestion = () => {
    if (currentQuestionIndex.value > 0) {
        currentQuestionIndex.value--;
        selectedAnswer.value = null; // Ideally save state per question
    }
};

const finishQuiz = () => {
    quizCompleted.value = true;
};

const resetQuiz = () => {
    resetQuizState();
    startQuiz();
};

const markLessonComplete = () => {
    if (currentLesson.value) {
        currentLesson.value.completed = true;
    }
    // Navigate to next lesson logic here
};
</script>
