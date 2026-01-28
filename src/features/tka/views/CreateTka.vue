<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import {
    CalendarIcon,
    ClockIcon,
    CheckBadgeIcon,
    PlusIcon,
    TrashIcon,
    PencilIcon,
    AdjustmentsHorizontalIcon
} from '@heroicons/vue/24/outline';
import Button from '@/components/ui/button/Button.vue';
import Input from '@/components/ui/input/Input.vue';
import Card from '@/components/ui/card/Card.vue';
import Textarea from '@/components/ui/textarea/Textarea.vue';
import QuestionFormModal from '../components/QuestionFormModal.vue';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/composables/useToast';

const toast = useToast();
const route = useRoute();

const isEditMode = computed(() => !!route.params.id);
const pageTitle = computed(() => isEditMode.value ? 'Edit TKA' : 'Buat TKA Baru');

onMounted(() => {
    if (isEditMode.value) {
        // Mock fetch data based on ID
        const id = route.params.id;
        // Simulating data fetch
        form.value = {
            title: id == 1 ? 'Tes Kemampuan Daswar Tahap 1' : 'Evaluasi Semester Ganjil Matematika',
            description: id == 1 ? 'Tes untuk seleksi awal masuk kelas unggulan.' : 'Ujian akhir semester.',
            duration: 90,
            duration_type: 'total',
            passing_grade: 75,
            is_advanced_mode: true,
            target_level: '10',
            target_subject: 'Matematika',
            questions: availableQuestions.value.slice(0, 3).map(q => ({ ...q, point: 10 })), // Mock selected questions
            randomize_answers: false,
            question_order: 'random'
        };
    }
});

const form = ref({
    title: '',
    description: '',
    duration: 60,
    duration_type: 'total', // 'total' or 'per_question'
    passing_grade: 75,
    is_advanced_mode: false,
    target_level: '',
    target_subject: '',
    questions: [],
    randomize_answers: false,
    question_order: 'random' // 'random' or 'ordered'
});

// Mock Data for Bank Soal Selection (Simulating data from store/api)
// Added 'level' and 'subject' to mock data for filtering
const availableQuestions = ref([
    { id: 1, text: 'Apa ibukota Indonesia?', type: 'Pilihan Ganda', subject: 'Pengetahuan Umum', level: '10' },
    { id: 2, text: 'Jelaskan pengertian TKA!', type: 'Esai', subject: 'Akademik', level: '11' },
    { id: 3, text: '2 + 2 = ?', type: 'Pilihan Ganda', subject: 'Matematika', level: '10' },
    { id: 4, text: 'Siapa penemu lampu pijar?', type: 'Pilihan Ganda', subject: 'Sains', level: '12' },
    { id: 5, text: 'Sebutkan 5 sila Pancasila!', type: 'Esai', subject: 'PKN', level: '10' },
]);

const showQuestionBank = ref(false);
const selectedQuestionIds = ref([]);
const bankSearchQuery = ref('');
const showAddQuestionModal = ref(false);
const questionToEdit = ref(null);

const addQuestionsInfo = computed(() => {
    return `${form.value.questions.length} Soal Terpilih`;
});

const totalPoints = computed(() => {
    return form.value.questions.reduce((sum, q) => sum + (parseInt(q.point) || 0), 0);
});

// Computed property to filter questions in the sidebar
const filteredQuestions = computed(() => {
    let result = availableQuestions.value;

    // Filter by search query
    if (bankSearchQuery.value) {
        const query = bankSearchQuery.value.toLowerCase();
        result = result.filter(q => q.text.toLowerCase().includes(query));
    }

    // Filter by Advanced Mode settings if active
    if (form.value.is_advanced_mode) {
        if (form.value.target_level) {
            result = result.filter(q => q.level === form.value.target_level);
        }
        if (form.value.target_subject) {
            result = result.filter(q => q.subject.toLowerCase() === form.value.target_subject.toLowerCase());
        }
    }

    return result;
});

const toggleQuestionSelection = (question) => {
    const index = form.value.questions.findIndex(q => q.id === question.id);
    if (index === -1) {
        // Add with default point
        form.value.questions.push({ ...question, point: 10 });
    } else {
        form.value.questions.splice(index, 1);
    }
};

const isSelected = (id) => {
    return form.value.questions.some(q => q.id === id);
};

const removeQuestion = (index) => {
    form.value.questions.splice(index, 1);
};

const editQuestion = (question) => {
    questionToEdit.value = question;
    showAddQuestionModal.value = true;
};

const handleSaveQuestion = ({ data, mode }) => {
    if (mode === 'create') {
        const newId = availableQuestions.value.length + 1; // logical id
        const newQuestion = {
            id: newId,
            ...data
        };
        // Add to bank
        availableQuestions.value.push(newQuestion);
        // Automatically select it
        toggleQuestionSelection(newQuestion);
        toast.success('Soal berhasil dibuat dan ditambahkan');
    } else if (mode === 'update') {
        // Update existing question in bank and form
        const index = availableQuestions.value.findIndex(q => q.id === questionToEdit.value.id);
        if (index !== -1) {
            availableQuestions.value[index] = { ...availableQuestions.value[index], ...data };
        }
        // Also update in selected form questions (if it's a reference it might update auto, but let's be safe)
        const selectedIndex = form.value.questions.findIndex(q => q.id === questionToEdit.value.id);
        if (selectedIndex !== -1) {
            form.value.questions[selectedIndex] = { ...form.value.questions[selectedIndex], ...data };
        }
        toast.success('Soal berhasil diperbarui');
    } else if (mode === 'duplicate') {
        // Create new but based on edit, don't change original
        const newId = availableQuestions.value.length + 1;
        const newQuestion = {
            id: newId,
            ...data
        };
        availableQuestions.value.push(newQuestion);
        // Passively add it to selection? Or replace the old one?
        // Usually duplicate implies adding a copy.
        toggleQuestionSelection(newQuestion);
        toast.success('Soal berhasil diduplikasi');
    }

    // Reset edit state
    questionToEdit.value = null;
};

// Handle modal close to reset edit state if cancelled
const handleModalUpdate = (val) => {
    showAddQuestionModal.value = val;
    if (!val) {
        questionToEdit.value = null;
    }
}

const saveTka = () => {
    // Validate
    if (!form.value.title) {
        toast.error('Judul TKA wajib diisi');
        return;
    }
    if (form.value.questions.length === 0) {
        toast.error('Pilih minimal satu soal');
        return;
    }

    // Mock API call
    console.log('Saving TKA:', form.value);
    toast.success(isEditMode.value ? 'TKA berhasil diperbarui' : 'TKA berhasil dibuat');

    // router.push('/admin/tka/assign');
};

// Drag and Drop Logic
const draggedItemIndex = ref(null);

const onDragStart = (index) => {
    draggedItemIndex.value = index;
};

const onDragOver = (event) => {
    // Necessary to allow dropping
    event.preventDefault();
};

const onDrop = (dropIndex) => {
    const dragIndex = draggedItemIndex.value;
    if (dragIndex !== null && dragIndex !== dropIndex) {
        // Move item
        const itemToMove = form.value.questions[dragIndex];
        form.value.questions.splice(dragIndex, 1);
        form.value.questions.splice(dropIndex, 0, itemToMove);
    }
    draggedItemIndex.value = null;
};

</script>

<template>
    <div class="p-6 space-y-6 max-w-6xl mx-auto">
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-2xl font-bold text-gray-900">{{ pageTitle }}</h1>
                <p class="text-gray-600">Atur detail TKA dan kelola bank soal.</p>
            </div>
            <div class="flex gap-3">
                <Button variant="outline">Batal</Button>
                <Button @click="saveTka">Simpan TKA</Button>
            </div>
        </div>

        <!-- Add Question Modal -->
        <QuestionFormModal :show="showAddQuestionModal" @update:show="handleModalUpdate" :question="questionToEdit"
            @save="handleSaveQuestion" />
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Main Form -->
            <div class="lg:col-span-2 space-y-6">
                <!-- Basic Info Card -->
                <Card class="p-6 space-y-6 border-none shadow-lg shadow-gray-200/50 bg-white ring-1 ring-gray-100">
                    <div class="flex justify-between items-start">
                        <h3 class="font-semibold text-lg flex items-center gap-2">
                            <CheckBadgeIcon class="w-5 h-5 text-primary" />
                            Informasi Dasar
                        </h3>

                        <!-- Advanced Mode Toggle -->
                        <div class="flex items-center gap-2">
                            <label class="text-sm font-medium text-gray-700 cursor-pointer select-none"
                                for="advanced-mode">
                                Mode Lanjutan
                            </label>
                            <button id="advanced-mode"
                                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                :class="form.is_advanced_mode ? 'bg-primary' : 'bg-gray-200'"
                                @click="form.is_advanced_mode = !form.is_advanced_mode">
                                <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                                    :class="form.is_advanced_mode ? 'translate-x-6' : 'translate-x-1'" />
                            </button>
                        </div>
                    </div>

                    <div class="space-y-4">
                        <div class="space-y-2">
                            <label class="text-sm font-medium">Judul Tes</label>
                            <Input v-model="form.title" placeholder="Contoh: Tes Kemampuan Dasar Tahap 1" />
                        </div>

                        <div class="space-y-2">
                            <label class="text-sm font-medium">Deskripsi / Instruksi</label>
                            <Textarea v-model="form.description" placeholder="Instruksi pengerjaan tes..." rows="4" />
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <!-- Duration Config -->
                            <div class="space-y-2">
                                <label class="text-sm font-medium">Durasi (Menit)</label>
                                <div class="relative">
                                    <Input type="number" v-model="form.duration" class="pl-10" />
                                    <ClockIcon class="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                                </div>
                            </div>

                            <div class="space-y-2">
                                <label class="text-sm font-medium">Tipe Durasi</label>
                                <Select v-model="form.duration_type">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Tipe Durasi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="total">Total Pengerjaan</SelectItem>
                                        <SelectItem value="per_question">Per Soal</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div class="space-y-2">
                                <label class="text-sm font-medium">Passing Grade / KKM</label>
                                <Input type="number" v-model="form.passing_grade" />
                            </div>
                        </div>



                        <!-- Advanced Fields -->
                        <div v-if="form.is_advanced_mode" class="pt-4 space-y-4 animate-in fade-in slide-in-from-top-2">
                            <div
                                class="flex items-center gap-2 text-primary font-medium text-sm bg-primary/5 p-3 rounded-md">
                                <AdjustmentsHorizontalIcon class="w-4 h-4" />
                                <span>Pengaturan Lanjutan</span>
                            </div>

                            <!-- Randomization & Ordering -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="space-y-2">
                                    <label class="text-sm font-medium">Acak Jawaban?</label>
                                    <div class="flex items-center gap-3 mt-1">
                                        <button
                                            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                            :class="form.randomize_answers ? 'bg-primary' : 'bg-gray-200'"
                                            @click="form.randomize_answers = !form.randomize_answers">
                                            <span
                                                class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                                                :class="form.randomize_answers ? 'translate-x-6' : 'translate-x-1'" />
                                        </button>
                                        <span class="text-sm text-gray-600">{{ form.randomize_answers ? 'Ya' : 'Tidak'
                                        }}</span>
                                    </div>
                                </div>
                                <div class="space-y-2">
                                    <label class="text-sm font-medium">Urutan Soal</label>
                                    <Select v-model="form.question_order">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Urutan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="random">Acak (Random)</SelectItem>
                                            <SelectItem value="ordered">Sesuai Urutan (Ordered)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="space-y-2">
                                    <label class="text-sm font-medium">Tingkat / Kelas (Target)</label>
                                    <Input v-model="form.target_level" placeholder="Contoh: 10, 11, 12" />
                                    <p class="text-[10px] text-gray-500">Filter soal otomatis sesuai tingkat.</p>
                                </div>
                                <div class="space-y-2">
                                    <label class="text-sm font-medium">Mata Pelajaran</label>
                                    <Input v-model="form.target_subject" placeholder="Contoh: Matematika" />
                                    <p class="text-[10px] text-gray-500">Filter soal otomatis sesuai mapel.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                <!-- Questions Selection Card -->
                <Card class="p-6 space-y-6 border-none shadow-lg shadow-gray-200/50 bg-white ring-1 ring-gray-100">
                    <div class="flex justify-between items-center">
                        <h3 class="font-semibold text-lg flex items-center gap-2">
                            <span
                                class="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs">
                                {{ form.questions.length }}
                            </span>
                            Daftar Soal
                            <span v-if="form.questions.length > 0"
                                class="ml-2 text-xs font-medium bg-green-50 text-green-700 px-2 py-1 rounded-md border border-green-200">
                                Total Poin: {{ totalPoints }}
                            </span>
                        </h3>
                        <div class="flex gap-2">
                            <Button variant="ghost" size="sm" @click="showAddQuestionModal = true">
                                <PlusIcon class="w-4 h-4 mr-2" />
                                Buat Baru
                            </Button>
                            <Button variant="outline" size="sm" @click="showQuestionBank = !showQuestionBank">
                                {{ showQuestionBank ? 'Tutup Bank Soal' : 'Buka Bank Soal' }}
                            </Button>
                        </div>
                    </div>

                    <!-- Selected Questions List -->
                    <div v-if="form.questions.length > 0" class="space-y-3">
                        <div v-for="(q, index) in form.questions" :key="index"
                            :draggable="form.question_order === 'ordered'" @dragstart="onDragStart(index)"
                            @dragover.prevent="onDragOver" @drop="onDrop(index)"
                            class="p-4 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 flex gap-4 group transition-colors icon-start"
                            :class="{ 'cursor-move ring-1 ring-primary/30': form.question_order === 'ordered' }">
                            <div
                                class="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 font-medium text-gray-500 text-sm">
                                {{ index + 1 }}
                            </div>
                            <div class="flex-1 space-y-2">
                                <p class="font-medium text-gray-900">{{ q.text }}</p>
                                <div class="flex flex-wrap gap-2 text-xs text-gray-500">
                                    <span class="bg-white px-2 py-0.5 rounded shadow-sm">{{ q.type }}</span>
                                    <span class="bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{{ q.subject }}</span>
                                    <span v-if="q.level" class="bg-gray-100 px-2 py-0.5 rounded">Kelas {{ q.level
                                    }}</span>
                                </div>
                            </div>

                            <!-- Point Input -->
                            <div class="flex flex-col items-end gap-1 shrink-0">
                                <label class="text-[10px] uppercase font-bold text-gray-400">Poin</label>
                                <Input type="number" v-model="q.point" class="w-20 h-9 text-center font-medium"
                                    min="0" />
                            </div>

                            <div class="flex flex-col gap-2 pt-1 border-l pl-3 ml-2 border-gray-200/60">
                                <button @click="editQuestion(q)"
                                    class="self-start text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Edit Soal">
                                    <PencilIcon class="w-5 h-5" />
                                </button>
                                <button @click="removeQuestion(index)"
                                    class="self-start text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Hapus dari daftar">
                                    <TrashIcon class="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div v-else class="text-center py-10 bg-gray-50/50 rounded-xl text-gray-400">
                        <p>Belum ada soal dipilih</p>
                        <div class="flex gap-2 justify-center mt-2">
                            <Button variant="link" @click="showQuestionBank = true">Pilih dari Bank Soal</Button>
                            <span class="text-gray-300">|</span>
                            <Button variant="link" @click="showAddQuestionModal = true">Buat Soal Baru</Button>
                        </div>
                    </div>
                </Card>
            </div>

            <!-- Bank Soal Sidebar (Dynamic) -->
            <div class="lg:col-span-1">
                <Transition enter-active-class="transition ease-out duration-200"
                    enter-from-class="opacity-0 translate-y-4" enter-to-class="opacity-100 translate-y-0"
                    leave-active-class="transition ease-in duration-150" leave-from-class="opacity-100 translate-y-0"
                    leave-to-class="opacity-0 translate-y-4">
                    <Card v-if="showQuestionBank"
                        class="overflow-hidden flex flex-col h-[600px] sticky top-6 shadow-xl shadow-gray-200/50 border-none bg-white ring-1 ring-gray-100">
                        <div class="p-4 border-b bg-gray-50/50">
                            <div class="flex justify-between items-center mb-1">
                                <h3 class="font-semibold">Bank Soal</h3>
                                <Button variant="ghost" size="icon" @click="showAddQuestionModal = true"
                                    title="Buat Soal Baru">
                                    <PlusIcon class="w-4 h-4" />
                                </Button>
                            </div>
                            <p class="text-xs text-gray-500">Klik soal untuk memilih</p>

                            <!-- Auto-filter Badge -->
                            <div v-if="form.is_advanced_mode && (form.target_level || form.target_subject)"
                                class="mt-2 flex flex-wrap gap-1">
                                <span v-if="form.target_level"
                                    class="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                    Level: {{ form.target_level }}
                                </span>
                                <span v-if="form.target_subject"
                                    class="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                    Mapel: {{ form.target_subject }}
                                </span>
                            </div>
                        </div>

                        <div class="p-4 border-b">
                            <Input v-model="bankSearchQuery" placeholder="Cari soal..." class="h-9 text-sm" />
                        </div>

                        <div class="flex-1 overflow-y-auto p-2 space-y-2">
                            <div v-for="q in filteredQuestions" :key="q.id" @click="toggleQuestionSelection(q)"
                                class="p-3 rounded-lg cursor-pointer transition-all text-sm group"
                                :class="isSelected(q.id) ? 'bg-primary/5 shadow-sm shadow-primary/10' : 'hover:bg-gray-50 text-gray-600 hover:shadow-sm'">
                                <div class="flex justify-between items-start gap-2">
                                    <p class="font-medium line-clamp-2"
                                        :class="isSelected(q.id) ? 'text-primary' : 'text-gray-800'">{{ q.text }}</p>
                                    <CheckBadgeIcon v-if="isSelected(q.id)" class="w-5 h-5 text-primary shrink-0" />
                                </div>
                                <div class="mt-2 flex flex-wrap gap-2">
                                    <span class="text-[10px] uppercase tracking-wider font-semibold text-gray-500">{{
                                        q.subject }}</span>
                                    <span class="text-[10px] bg-gray-100 px-1.5 rounded">{{ q.type }}</span>
                                    <span v-if="q.level" class="text-[10px] bg-gray-50 px-1.5 rounded">Kls {{
                                        q.level }}</span>
                                </div>
                            </div>

                            <div v-if="filteredQuestions.length === 0" class="text-center py-8 text-gray-400 text-sm">
                                Tidak ada soal yang cocok dengan filter.
                            </div>
                        </div>
                    </Card>
                </Transition>

                <!-- Helper/Tips Card if Bank Soal is closed or small screen -->
                <Card v-if="!showQuestionBank"
                    class="p-6 bg-blue-50 text-blue-900 border-none shadow-md shadow-blue-100/50">
                    <h4 class="font-semibold mb-2">Tips Membuat TKA</h4>
                    <ul class="text-sm space-y-2 list-disc pl-4 text-blue-800/80">
                        <li>Pastikan deskripsi instruksi jelas.</li>
                        <li>Gunakan variasi tipe soal (Pilihan Ganda & Esai).</li>
                        <li>Mode Lanjutan membantu memfilter soal yang relevan.</li>
                        <li>Sesuaikan durasi dengan jumlah soal.</li>
                        <li>Gunakan "Buat Baru" untuk menambah soal instan.</li>
                    </ul>
                </Card>
            </div>
        </div>
    </div>
</template>
