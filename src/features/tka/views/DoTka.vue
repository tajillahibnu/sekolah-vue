<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
    ClockIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    FlagIcon,
    CheckCircleIcon,
    Bars3Icon,
    XMarkIcon,
    ExclamationCircleIcon
} from '@heroicons/vue/24/outline';
import { FlagIcon as FlagIconSolid } from '@heroicons/vue/24/solid';
import Button from '@/components/ui/button/Button.vue';
import ConfirmModal from '@/components/ui/ConfirmModal.vue';
import { useToast } from '@/composables/useToast';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const isSidebarOpen = ref(false);
const currentQuestionIndex = ref(0);
const showSubmitModal = ref(false);

// Strict Mode Flag
const isStrictSequential = ref(true); // Enabled by default for this demo

// Mock Data
const questions = ref([
    {
        id: 1,
        text: 'Jika f(x) = 2x + 5, maka nilai f(3) adalah...',
        options: [
            { id: 'A', text: '8' },
            { id: 'B', text: '10' },
            { id: 'C', text: '11' },
            { id: 'D', text: '13' },
            { id: 'E', text: '15' }
        ],
        type: 'multiple_choice',
        timeLimit: 60 // 1 minute per question
    },
    {
        id: 2,
        text: 'Turunan pertama dari f(x) = 3x² + 4x - 5 adalah...',
        options: [
            { id: 'A', text: '6x + 4' },
            { id: 'B', text: '3x + 4' },
            { id: 'C', text: '6x - 4' },
            { id: 'D', text: '6x + 5' },
            { id: 'E', text: '3x - 5' }
        ],
        type: 'multiple_choice',
        timeLimit: 60
    },
    {
        id: 3,
        text: 'Integral dari ∫(2x + 3) dx adalah...',
        options: [
            { id: 'A', text: 'x² + 3x + C' },
            { id: 'B', text: '2x² + 3x + C' },
            { id: 'C', text: 'x² + 3 + C' },
            { id: 'D', text: '2x² + 3 + C' },
            { id: 'E', text: 'x² + C' }
        ],
        type: 'multiple_choice',
        timeLimit: 45
    },
    {
        id: 4,
        text: 'Jika diketahui matriks A = [[1, 2], [3, 4]], maka determinan matriks A adalah...',
        options: [
            { id: 'A', text: '-2' },
            { id: 'B', text: '2' },
            { id: 'C', text: '0' },
            { id: 'D', text: '10' },
            { id: 'E', text: '-1' }
        ],
        type: 'multiple_choice',
        timeLimit: 60
    }
]);

// State for answers
const answers = ref({}); // { questionId: optionId }
const flagged = ref({}); // { questionId: true/false }

// Timer Logic
const totalTime = 90 * 60; // Global Timer (still runs)
const timeRemaining = ref(totalTime);
let timerInterval = null;

// Per-Question Timer Logic
const questionTimeRemaining = ref({}); // { questionId: seconds }
const currentQuestionTimer = ref(null);
let questionInterval = null;

const formattedTime = computed(() => {
    const hours = Math.floor(timeRemaining.value / 3600);
    const minutes = Math.floor((timeRemaining.value % 3600) / 60);
    const seconds = timeRemaining.value % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

const startTimer = () => {
    timerInterval = setInterval(() => {
        if (timeRemaining.value > 0) {
            timeRemaining.value--;
        } else {
            submitExam(true); // Auto submit global
        }
    }, 1000);
};

// Handle Question Timer
const setupQuestionTimer = (newQuestion) => {
    if (questionInterval) {
        clearInterval(questionInterval);
        questionInterval = null;
    }
    currentQuestionTimer.value = null;

    if (newQuestion && newQuestion.timeLimit) {
        if (questionTimeRemaining.value[newQuestion.id] === undefined) {
            questionTimeRemaining.value[newQuestion.id] = newQuestion.timeLimit;
        }

        if (questionTimeRemaining.value[newQuestion.id] > 0) {
            currentQuestionTimer.value = questionTimeRemaining.value[newQuestion.id];

            questionInterval = setInterval(() => {
                if (questionTimeRemaining.value[newQuestion.id] > 0) {
                    questionTimeRemaining.value[newQuestion.id]--;
                    currentQuestionTimer.value = questionTimeRemaining.value[newQuestion.id];
                } else {
                    clearInterval(questionInterval);
                    toast.info('Waktu Habis', 'Waktu soal habis, beralih ke soal berikutnya.');

                    // Auto Advance Logic or Lock
                    if (isStrictSequential.value) {
                        if (currentQuestionIndex.value < questions.value.length - 1) {
                            nextQuestion();
                        } else {
                            // Last question timeout
                            submitExam(true);
                        }
                    }
                }
            }, 1000);
        } else if (isStrictSequential.value && questionTimeRemaining.value[newQuestion.id] <= 0) {
            // Already timed out? Should probably block or move next logic handling
            // Ideally we shouldn't arrive here if forward only, unless re-visiting which is banned.
        }
    }
};

// Navigation
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value]);

watch(currentQuestion, (newQ) => {
    setupQuestionTimer(newQ);
}, { immediate: true });

const goToQuestion = (index) => {
    // Strict Mode: Block jumping if not exact next (or logic prevents sidebar clicks entirely)
    if (isStrictSequential.value) return;

    if (index >= 0 && index < questions.value.length) {
        currentQuestionIndex.value = index;
        if (window.innerWidth < 768) {
            isSidebarOpen.value = false;
        }
    }
};

const nextQuestion = () => {
    if (currentQuestionIndex.value < questions.value.length - 1) {
        currentQuestionIndex.value++;
    }
};

const prevQuestion = () => {
    if (isStrictSequential.value) return; // Disable Previous
    if (currentQuestionIndex.value > 0) {
        currentQuestionIndex.value--;
    }
};

// Answer Logic
const selectAnswer = (optionId) => {
    answers.value[currentQuestion.value.id] = optionId;
};

const toggleFlag = () => {
    const qId = currentQuestion.value.id;
    flagged.value[qId] = !flagged.value[qId];
};

// Submission
const submitExam = (auto = false) => {
    clearInterval(timerInterval);
    if (auto) {
        toast.info('Waktu Habis', 'Ujian dikumpulkan otomatis.');
    } else {
        toast.success('Berhasil', 'Ujian berhasil dikumpulkan.');
    }
    showSubmitModal.value = false;
    router.push('/admin/tka/student/list');
};

onMounted(() => {
    startTimer();
});

onUnmounted(() => {
    if (timerInterval) clearInterval(timerInterval);
    if (questionInterval) clearInterval(questionInterval);
});

// Helper for grid styling
const getGridItemClass = (index, question) => {
    const isCurrent = currentQuestionIndex.value === index;
    const isAnswered = !!answers.value[question.id];
    const isFlagged = !!flagged.value[question.id];

    let classes = 'w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold border transition-all ';

    if (isCurrent) {
        classes += 'ring-2 ring-primary ring-offset-2 ';
    }

    if (isFlagged) {
        classes += 'bg-amber-100 text-amber-700 border-amber-200 ';
    } else if (isAnswered) {
        classes += 'bg-emerald-100 text-emerald-700 border-emerald-200 ';
    } else {
        classes += 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 ';
    }

    return classes;
};

</script>

<template>
    <div class="h-[calc(100vh-5rem)] flex flex-col md:flex-row gap-6 overflow-hidden relative">

        <!-- Mobile Sidebar Toggle (Floating) -->
        <button @click="isSidebarOpen = !isSidebarOpen"
            class="md:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-xl flex items-center justify-center">
            <Bars3Icon v-if="!isSidebarOpen" class="w-6 h-6" />
            <XMarkIcon v-else class="w-6 h-6" />
        </button>

        <!-- Main Content (Question Area) -->
        <div
            class="flex-1 flex flex-col h-full bg-white/50 backdrop-blur-sm rounded-3xl border border-white/60 shadow-xl shadow-slate-200/50 overflow-hidden">

            <!-- Sticky Header -->
            <div
                class="h-16 px-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md z-10">
                <div class="flex items-center gap-4">
                    <span class="text-sm font-bold text-slate-400">Soal No.</span>
                    <span class="text-2xl font-black text-slate-800">{{ currentQuestionIndex + 1 }}</span>
                    <span class="text-sm text-slate-400">/ {{ questions.length }}</span>
                </div>

                <!-- Timer Display -->
                <div
                    class="flex flex-col items-end justify-center mb-[-1.5rem] md:mb-0 translate-y-8 md:translate-y-0 relative z-20">
                    <div
                        class="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-900/10">
                        <ClockIcon class="w-4 h-4 text-emerald-400 animate-pulse" />
                        <span class="text-lg font-bold font-mono tracking-widest">{{ formattedTime }}</span>
                    </div>

                    <!-- Per Question Timer -->
                    <div v-if="currentQuestionTimer !== null"
                        class="mt-2 flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-lg animate-pulse">
                        <ExclamationCircleIcon class="w-4 h-4" />
                        <span class="text-sm font-bold font-mono">Waktu Soal: {{ currentQuestionTimer }}s</span>
                    </div>
                </div>
            </div>

            <!-- Scrollable Content -->
            <div class="flex-1 overflow-y-auto p-6 md:p-10">
                <div class="max-w-3xl mx-auto space-y-8">
                    <!-- Question Text -->
                    <div class="prose prose-lg prose-slate max-w-none">
                        <p class="text-xl font-medium text-slate-800 leading-relaxed">
                            {{ currentQuestion.text }}
                        </p>
                    </div>

                    <!-- Options -->
                    <div class="space-y-3">
                        <button v-for="option in currentQuestion.options" :key="option.id"
                            @click="currentQuestionTimer === 0 ? null : selectAnswer(option.id)"
                            :disabled="currentQuestionTimer === 0"
                            class="w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 group hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                            :class="answers[currentQuestion.id] === option.id
                                ? 'border-primary bg-primary/5 shadow-sm'
                                : 'border-slate-100 bg-white'">
                            <span
                                class="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors"
                                :class="answers[currentQuestion.id] === option.id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'">
                                {{ option.id }}
                            </span>
                            <span class="text-base text-slate-700 font-medium group-hover:text-slate-900">
                                {{ option.text }}
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Footer Controls -->
            <div class="h-20 px-6 border-t border-slate-100 flex items-center justify-between bg-white z-10">
                <Button v-if="!isStrictSequential" variant="ghost" @click="prevQuestion"
                    :disabled="currentQuestionIndex === 0" class="gap-2">
                    <ChevronLeftIcon class="w-4 h-4" />
                    Sebelumnya
                </Button>
                <div v-else class="text-xs text-slate-400 font-medium italic">
                    Mode Berurutan: Tidak bisa kembali.
                </div>

                <div class="flex items-center gap-3">
                    <button @click="toggleFlag" class="p-3 rounded-xl border transition-colors" :class="flagged[currentQuestion.id]
                        ? 'bg-amber-100 border-amber-200 text-amber-600'
                        : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'" title="Ragu-ragu">
                        <component :is="flagged[currentQuestion.id] ? FlagIconSolid : FlagIcon" class="w-5 h-5" />
                    </button>

                    <Button v-if="currentQuestionIndex < questions.length - 1" @click="nextQuestion"
                        class="gap-2 shadow-lg shadow-indigo-500/20">
                        Selanjutnya
                        <ChevronRightIcon class="w-4 h-4" />
                    </Button>
                    <Button v-else @click="showSubmitModal = true" variant="destructive"
                        class="gap-2 shadow-lg shadow-red-500/20">
                        Selesai
                        <CheckCircleIcon class="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>

        <!-- Right Panel: Navigation Grid (Sidebar) -->
        <div class="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl z-40 transform transition-transform duration-300 md:relative md:transform-none md:w-80 md:shadow-none md:bg-transparent md:flex md:flex-col"
            :class="isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'">
            <div
                class="h-full flex flex-col bg-white/50 backdrop-blur-sm rounded-l-3xl md:rounded-3xl border border-white/60 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div class="p-5 border-b border-slate-100 bg-white/80 backdrop-blur-md">
                    <h3 class="font-bold text-slate-800">Navigasi Soal</h3>
                    <p class="text-xs text-slate-500 mt-1">Klik nomor untuk melompat.</p>
                </div>

                <div class="flex-1 overflow-y-auto p-5">
                    <div class="grid grid-cols-5 gap-3">
                        <button v-for="(question, index) in questions" :key="question.id" @click="goToQuestion(index)"
                            :disabled="isStrictSequential"
                            :class="[getGridItemClass(index, question), isStrictSequential ? 'cursor-not-allowed opacity-80' : '']">
                            {{ index + 1 }}
                            <div v-if="flagged[question.id]"
                                class="absolute top-0 right-0 w-2 h-2 bg-amber-500 rounded-full border border-white transform translate-x-1/4 -translate-y-1/4">
                            </div>
                        </button>
                    </div>

                    <!-- Legend -->
                    <div class="mt-8 space-y-3">
                        <div class="flex items-center gap-3">
                            <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
                            <span class="text-xs text-slate-600">Sudah dijawab</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="w-3 h-3 rounded-full bg-amber-500"></div>
                            <span class="text-xs text-slate-600">Ragu-ragu</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="w-3 h-3 rounded-full bg-slate-200"></div>
                            <span class="text-xs text-slate-600">Belum dijawab</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="w-3 h-3 rounded-full border-2 border-primary"></div>
                            <span class="text-xs text-slate-600">Posisi sekarang</span>
                        </div>
                    </div>
                </div>

                <div class="p-5 border-t border-slate-100 bg-slate-50">
                    <Button @click="showSubmitModal = true" variant="outline" class="w-full">
                        Kumpulkan Jawaban
                    </Button>
                </div>
            </div>
        </div>

        <!-- Confirmation Modal -->
        <ConfirmModal :show="showSubmitModal" title="Kumpulkan Ujian?"
            message="Pastikan anda telah memeriksa semua jawaban. Anda tidak dapat mengubah jawaban setelah dikumpulkan."
            confirmText="Ya, Kumpulkan" cancelText="Periksa Kembali" @confirm="submitExam(false)"
            @close="showSubmitModal = false" />

    </div>
</template>
