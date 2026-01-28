<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    ArrowLeftIcon,
    PrinterIcon,
    ShareIcon
} from '@heroicons/vue/24/outline';
import Button from '@/components/ui/button/Button.vue';

const route = useRoute();
const router = useRouter();
const tkaId = route.params.id;

// Mock Result Data
// Mock Database
const mockResults = {
    '1': {
        title: 'Ujian Akhir Semester Matematika',
        subject: 'Matematika Wajib',
        score: 85,
        maxScore: 100,
        passingGrade: 75,
        status: 'Lulus',
        correct: 34,
        wrong: 6,
        totalQuestions: 40,
        timeTaken: '85 Menit',
        submittedAt: '2025-06-20 09:25',
        feedback: 'Kerja bagus! Pertahankan prestasi anda.'
    },
    '102': {
        title: 'Kuis Sejarah Indonesia',
        subject: 'Sejarah',
        score: 92,
        maxScore: 100,
        passingGrade: 70,
        status: 'Lulus',
        correct: 18,
        wrong: 2,
        totalQuestions: 20,
        timeTaken: '40 Menit',
        submittedAt: '2025-05-10 10:15',
        feedback: 'Luar biasa! Pemahaman sejarah anda sangat baik.'
    },
    '103': {
        title: 'Ujian Harian Kimia Dasar',
        subject: 'Kimia',
        score: 45,
        maxScore: 100,
        passingGrade: 75,
        status: 'Tidak Lulus',
        correct: 9,
        wrong: 11,
        totalQuestions: 20,
        timeTaken: '60 Menit',
        submittedAt: '2025-05-08 08:55',
        feedback: 'Jangan patah semangat. Tingkatkan lagi belajarnya ya!'
    }
};

const result = ref(mockResults[tkaId] || mockResults['1']); // Fallback to 1

const isPassed = computed(() => result.value.score >= result.value.passingGrade);

// Mock Review Data (subset)
const reviewQuestions = ref([
    {
        id: 1,
        text: 'Jika f(x) = 2x + 5, maka nilai f(3) adalah...',
        userAnswer: result.value.id === '103' ? 'A' : 'C', // Adjust for fail scenario if needed
        correctAnswer: 'C',
        explanation: 'Substitusi x = 3 ke dalam fungsi: f(3) = 2(3) + 5 = 6 + 5 = 11.',
        options: [
            { id: 'A', text: '8' },
            { id: 'B', text: '10' },
            { id: 'C', text: '11' },
            { id: 'D', text: '13' },
            { id: 'E', text: '15' }
        ]
    },
    // Keep other questions static for now or expand if needed
    {
        id: 2,
        text: 'Turunan pertama dari f(x) = 3x² + 4x - 5 adalah...',
        userAnswer: 'B',
        correctAnswer: 'A',
        explanation: 'Turunan dari 3x² adalah 6x. Turunan dari 4x adalah 4. Turunan dari -5 adalah 0. Jadi f\'(x) = 6x + 4.',
        options: [
            { id: 'A', text: '6x + 4' },
            { id: 'B', text: '3x + 4' },
            { id: 'C', text: '6x - 4' },
            { id: 'D', text: '6x + 5' },
            { id: 'E', text: '3x - 5' }
        ]
    },
    {
        id: 3,
        text: 'Integral dari ∫(2x + 3) dx adalah...',
        userAnswer: 'A',
        correctAnswer: 'A',
        explanation: 'Integral 2x adalah x². Integral 3 adalah 3x. Tambahkan konstanta C. Jadi x² + 3x + C.',
        options: [
            { id: 'A', text: 'x² + 3x + C' },
            { id: 'B', text: '2x² + 3x + C' },
            { id: 'C', text: 'x² + 3 + C' },
            { id: 'D', text: '2x² + 3 + C' },
            { id: 'E', text: 'x² + C' }
        ]
    }
]);

const selectedQuestionIndex = ref(0);
const selectedQuestion = computed(() => reviewQuestions.value[selectedQuestionIndex.value]);

const getOptionClass = (question, optionId) => {
    const isSelected = question.userAnswer === optionId;
    const isCorrect = question.correctAnswer === optionId;

    if (isCorrect) {
        return 'bg-emerald-100 border-emerald-500 text-emerald-700 font-bold';
    }
    if (isSelected && !isCorrect) {
        return 'bg-rose-100 border-rose-500 text-rose-700 font-bold';
    }
    return 'bg-white border-slate-200 text-slate-500 opacity-60';
};

const getGridItemClass = (question, index) => {
    const isSelected = selectedQuestionIndex.value === index;
    const isCorrect = question.userAnswer === question.correctAnswer;

    let classes = 'w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold border transition-all ';

    if (isSelected) {
        classes += 'ring-2 ring-primary ring-offset-2 ';
    }

    if (isCorrect) {
        classes += 'bg-emerald-100 text-emerald-700 border-emerald-200 ';
    } else {
        classes += 'bg-rose-100 text-rose-700 border-rose-200 ';
    }

    return classes;
};

</script>

<template>
    <div class="min-h-[80vh] flex items-center justify-center p-4">
        <div
            class="max-w-6xl w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">

            <!-- Header Status -->
            <div class="relative p-6 md:p-10 text-center overflow-hidden">
                <div class="absolute inset-0 opacity-10" :class="isPassed ? 'bg-emerald-500' : 'bg-rose-500'">
                </div>

                <div class="relative z-10 flex flex-col items-center">
                    <div class="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mb-4 md:mb-6 shadow-xl ring-4 ring-white"
                        :class="isPassed ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'">
                        <CheckCircleIcon v-if="isPassed" class="w-10 h-10 md:w-12 md:h-12" />
                        <XCircleIcon v-else class="w-10 h-10 md:w-12 md:h-12" />
                    </div>

                    <h1 class="text-2xl md:text-4xl font-black text-slate-800 mb-2">
                        {{ isPassed ? 'Selamat! Anda Lulus' : 'Mohon Maaf, Belum Lulus' }}
                    </h1>
                    <p class="text-slate-500 text-sm md:text-base max-w-md mx-auto px-4">
                        {{ result.feedback }}
                    </p>
                </div>
            </div>

            <!-- Score Stats -->
            <div class="p-6 md:p-12">
                <div class="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 mb-8 md:mb-12">
                    <div class="text-center">
                        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Nilai Akhir</p>
                        <p class="text-5xl md:text-6xl font-black"
                            :class="isPassed ? 'text-emerald-500' : 'text-rose-500'">
                            {{ result.score }}
                        </p>
                    </div>

                    <div class="h-px w-full md:h-16 md:w-px bg-slate-200 block"></div>

                    <div class="grid grid-cols-2 gap-x-8 gap-y-6 w-full md:w-auto">
                        <div>
                            <p class="text-xs font-bold text-slate-400 uppercase">Jawaban Benar</p>
                            <p class="text-xl font-bold text-slate-700">{{ result.correct }} <span
                                    class="text-xs font-normal text-slate-400">/ {{ result.totalQuestions }}</span></p>
                        </div>
                        <div>
                            <p class="text-xs font-bold text-slate-400 uppercase">Jawaban Salah</p>
                            <p class="text-xl font-bold text-slate-700">{{ result.wrong }} <span
                                    class="text-xs font-normal text-slate-400">/ {{ result.totalQuestions }}</span></p>
                        </div>
                        <div>
                            <p class="text-xs font-bold text-slate-400 uppercase">Waktu Pengerjaan</p>
                            <p class="text-xl font-bold text-slate-700">{{ result.timeTaken }}</p>
                        </div>
                        <div>
                            <p class="text-xs font-bold text-slate-400 uppercase">Submitted</p>
                            <p class="text-sm font-bold text-slate-700 mt-1">{{ result.submittedAt }}</p>
                        </div>
                    </div>
                </div>

                <!-- Review Section -->
                <div class="mt-12 border-t border-slate-100 pt-8">
                    <h3 class="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <DocumentTextIcon class="w-6 h-6 text-indigo-500" />
                        Pembahasan Soal
                    </h3>

                    <div class="flex flex-col md:flex-row gap-8 items-start">
                        <!-- Navigation Grid -->
                        <div class="w-full md:w-1/3 bg-slate-50 rounded-2xl p-6 border border-slate-100">
                            <div class="flex items-center justify-between mb-4">
                                <h4 class="font-bold text-slate-700 text-sm">Nomor Soal</h4>
                                <div class="flex gap-2 text-[10px] font-bold">
                                    <span class="px-2 py-1 bg-emerald-100 text-emerald-700 rounded">Benar</span>
                                    <span class="px-2 py-1 bg-rose-100 text-rose-700 rounded">Salah</span>
                                </div>
                            </div>

                            <div class="grid grid-cols-5 gap-3">
                                <button v-for="(q, index) in reviewQuestions" :key="q.id"
                                    @click="selectedQuestionIndex = index" :class="getGridItemClass(q, index)">
                                    {{ index + 1 }}
                                </button>
                            </div>
                        </div>

                        <!-- Question Detail -->
                        <div class="w-full md:w-2/3">
                            <div class="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm">
                                <div class="flex items-start gap-4 mb-6">
                                    <span
                                        class="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-lg shadow-lg shadow-slate-900/10">
                                        {{ selectedQuestionIndex + 1 }}
                                    </span>
                                    <div class="flex-1">
                                        <p class="text-lg font-medium text-slate-800 leading-relaxed">
                                            {{ selectedQuestion.text }}
                                        </p>
                                    </div>
                                </div>

                                <!-- Options -->
                                <div class="space-y-3 mb-6">
                                    <div v-for="opt in selectedQuestion.options" :key="opt.id"
                                        class="p-4 rounded-xl border flex items-center justify-between text-sm transition-all"
                                        :class="getOptionClass(selectedQuestion, opt.id)">
                                        <div class="flex items-center gap-4">
                                            <span
                                                class="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold bg-black/5">
                                                {{ opt.id }}
                                            </span>
                                            <span class="font-medium">{{ opt.text }}</span>
                                        </div>
                                        <!-- Status Icon -->
                                        <div v-if="selectedQuestion.correctAnswer === opt.id"
                                            class="flex items-center gap-1">
                                            <CheckCircleIcon class="w-5 h-5" />
                                        </div>
                                        <div v-if="selectedQuestion.userAnswer === opt.id && selectedQuestion.userAnswer !== selectedQuestion.correctAnswer"
                                            class="flex items-center gap-1">
                                            <XCircleIcon class="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>

                                <!-- Explanation -->
                                <div class="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
                                    <div class="flex items-center gap-2 mb-2">
                                        <div class="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
                                            <DocumentTextIcon class="w-4 h-4" />
                                        </div>
                                        <span
                                            class="font-bold text-indigo-800 text-sm uppercase tracking-wide">Pembahasan</span>
                                    </div>
                                    <p class="text-indigo-900 text-sm leading-relaxed">
                                        {{ selectedQuestion.explanation }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex flex-col sm:flex-row gap-3 justify-center border-t border-slate-100 pt-8 mt-12">
                    <Button @click="router.push('/admin/tka/student/list')" variant="outline" class="gap-2">
                        <ArrowLeftIcon class="w-4 h-4" />
                        Kembali ke Daftar
                    </Button>
                    <!-- Future Features -->
                    <!-- <Button variant="ghost" class="gap-2">
                        <PrinterIcon class="w-4 h-4" />
                        Cetak Hasil
                    </Button> -->
                </div>
            </div>

        </div>
    </div>
</template>
