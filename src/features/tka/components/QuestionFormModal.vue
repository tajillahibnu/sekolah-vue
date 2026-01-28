<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { PlusIcon, TrashIcon, XMarkIcon } from '@heroicons/vue/24/outline';
import Button from '@/components/ui/button/Button.vue';
import Input from '@/components/ui/input/Input.vue';
import Textarea from '@/components/ui/textarea/Textarea.vue';
import Modal from '@/components/common/Modal.vue';
import Combobox from '@/components/ui/combobox/Combobox.vue';
import api from '@/services/api';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const props = defineProps({
    show: {
        type: Boolean,
        default: false
    },
    question: {
        type: Object,
        default: null
    }
});

const emit = defineEmits(['update:show', 'save']);

const subjectOptions = ref([]);

// Form state
const tagInput = ref('');
const initialQuestionState = {
    text: '',
    type: 'Pilihan Ganda',
    subject: '',
    category: '',
    level: '',
    tags: [],
    options: ['', '', '', ''],
    correctAnswer: '',
    imagePreview: null
};

const newQuestion = ref({ ...initialQuestionState });

const isEditing = computed(() => !!props.question);
const modalTitle = computed(() => isEditing.value ? 'Edit Soal' : 'Tambah Soal Baru');

// Fetch Subjects
onMounted(async () => {
    try {
        const response = await api.get('/subjects', { params: { limit: 100 } });
        if (response.data && response.data.data) {
            subjectOptions.value = response.data.data.map(s => ({
                value: s.name,
                label: `${s.name} (${s.code})`
            }));
        }
    } catch (error) {
        console.error('Failed to fetch subjects:', error);
    }
});

const addTag = () => {
    const val = tagInput.value.trim();
    if (val && !newQuestion.value.tags.includes(val)) {
        newQuestion.value.tags.push(val);
        tagInput.value = '';
    }
};

const removeTag = (index) => {
    newQuestion.value.tags.splice(index, 1);
};

const addOption = () => {
    newQuestion.value.options.push('');
};

const removeOption = (index) => {
    if (newQuestion.value.options.length > 2) {
        newQuestion.value.options.splice(index, 1);
        // Reset correct answer if it was the removed option
    }
};

const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
        // Create fake preview
        newQuestion.value.imagePreview = URL.createObjectURL(file);
    }
};

const removeImage = () => {
    newQuestion.value.imagePreview = null;
    // Clear input if possible (requires ref to input)
};

const saveQuestion = (mode = 'create') => {
    if (!newQuestion.value.text) return;

    // Auto add tag if text remains in input
    if (tagInput.value.trim()) {
        addTag();
    }

    const payload = {
        text: newQuestion.value.text,
        type: newQuestion.value.type,
        subject: newQuestion.value.subject,
        category: newQuestion.value.category,
        level: newQuestion.value.level,
        tags: [...newQuestion.value.tags],
        imagePreview: newQuestion.value.imagePreview
    };

    if (newQuestion.value.type === 'Pilihan Ganda') {
        payload.options = [...newQuestion.value.options];
        payload.correctAnswer = newQuestion.value.correctAnswer;
    }

    emit('save', { data: payload, mode });
    handleClose();
};

const handleClose = () => {
    emit('update:show', false);
};

// Watch for show and question prop changes to populate form
watch(() => props.show, (val) => {
    if (val) {
        if (props.question) {
            // Populate form with existing question data (clone to avoid direct mutation)
            newQuestion.value = JSON.parse(JSON.stringify(props.question));
            // Ensure options exists for different types if switching types
            if (!newQuestion.value.options) newQuestion.value.options = ['', '', '', ''];
            if (!newQuestion.value.tags) newQuestion.value.tags = [];
        } else {
            // Reset to default
            newQuestion.value = { ...initialQuestionState };
            // Use array copy for options to avoid reference issues
            newQuestion.value.options = ['', '', '', ''];
            newQuestion.value.tags = [];
        }
        tagInput.value = '';
    }
});
</script>

<template>
    <Modal :show="show" @update:show="$emit('update:show', $event)" :title="modalTitle" size="lg">
        <div class="space-y-6">
            <!-- Modal Body -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-4 md:col-span-2">
                    <label class="text-sm font-medium">Pertanyaan</label>

                    <!-- Simple Editor Wrapper -->
                    <div
                        class="rounded-md bg-gray-50/50 group focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-sm">
                        <!-- Editor Toolbar -->
                        <div class="flex items-center gap-1 p-2 border-b border-dashed border-gray-200">
                            <Button variant="ghost" size="icon" class="h-8 w-8 hover:bg-white" title="Bold">
                                <span class="font-bold">B</span>
                            </Button>
                            <Button variant="ghost" size="icon" class="h-8 w-8 hover:bg-white" title="Italic">
                                <span class="italic">I</span>
                            </Button>
                            <Button variant="ghost" size="icon" class="h-8 w-8 hover:bg-white" title="Underline">
                                <span class="underline">U</span>
                            </Button>
                            <div class="w-px h-4 bg-gray-300 mx-1"></div>
                            <Button variant="ghost" size="icon" class="h-8 w-8 hover:bg-white" title="List">
                                <span class="text-xs">list</span>
                            </Button>
                        </div>
                        <Textarea v-model="newQuestion.text" placeholder="Tulis pertanyaan lengkap di sini..."
                            class="min-h-[120px] border-0 rounded-t-none focus-visible:ring-0 bg-transparent resize-none" />
                    </div>

                    <!-- Image Upload -->
                    <div class="space-y-2">
                        <label class="text-sm font-medium">Media (Gambar)</label>
                        <div class="flex items-center gap-4">
                            <div v-if="newQuestion.imagePreview"
                                class="relative w-24 h-24 rounded-lg overflow-hidden border">
                                <img :src="newQuestion.imagePreview" class="w-full h-full object-cover" />
                                <button @click="removeImage"
                                    class="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 hover:bg-red-500">
                                    <XMarkIcon class="w-3 h-3" />
                                </button>
                            </div>
                            <div class="flex-1">
                                <Input type="file" accept="image/*" @change="handleImageUpload"
                                    class="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                                <p class="text-[10px] text-gray-500 mt-1">Format: JPG, PNG. Maks: 2MB.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="space-y-2">
                    <label class="text-sm font-medium">Mata Pelajaran</label>
                    <Combobox v-model="newQuestion.subject" :options="subjectOptions" placeholder="Pilih Mata Pelajaran"
                        searchPlaceholder="Cari mapel..." />
                </div>

                <div class="space-y-2">
                    <label class="text-sm font-medium">Kategori</label>
                    <Input v-model="newQuestion.category" placeholder="Contoh: Aljabar" />
                </div>

                <div class="space-y-2">
                    <label class="text-sm font-medium">Tingkat / Kelas</label>
                    <Input v-model="newQuestion.level" placeholder="Contoh: 10, 11, 12" />
                </div>

                <div class="space-y-2">
                    <label class="text-sm font-medium">Tipe Soal</label>
                    <Select v-model="newQuestion.type">
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih Tipe" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Pilihan Ganda">Pilihan Ganda</SelectItem>
                            <SelectItem value="Esai">Esai</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <!-- Tags Input -->
                <div class="space-y-2 md:col-span-2">
                    <label class="text-sm font-medium">Tags Materi</label>
                    <div class="space-y-2">
                        <div class="flex flex-wrap gap-2 mb-2" v-if="newQuestion.tags.length > 0">
                            <span v-for="(tag, index) in newQuestion.tags" :key="index"
                                class="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                                #{{ tag }}
                                <button @click="removeTag(index)" class="hover:text-red-500">
                                    <XMarkIcon class="w-3 h-3" />
                                </button>
                            </span>
                        </div>
                        <Input v-model="tagInput" @keydown.enter.prevent="addTag"
                            placeholder="Ketik tag lalu tekan Enter..." />
                        <p class="text-[10px] text-gray-500">Contoh: Aljabar, Trigonometri, Dasar.</p>
                    </div>
                </div>
            </div>

            <!-- Options Section for Multiple Choice -->
            <div v-if="newQuestion.type === 'Pilihan Ganda'" class="space-y-4 pt-4 border-t">
                <div class="flex justify-between items-center">
                    <label class="text-sm font-medium">Opsi Jawaban</label>
                    <Button variant="ghost" size="sm" @click="addOption" class="text-primary hover:text-primary/80 h-8">
                        <PlusIcon class="w-4 h-4 mr-1" /> Tambah Opsi
                    </Button>
                </div>

                <div class="space-y-3">
                    <div v-for="(option, index) in newQuestion.options" :key="index" class="flex gap-3 items-center">
                        <div
                            class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                            {{ String.fromCharCode(65 + index) }}
                        </div>
                        <Input v-model="newQuestion.options[index]"
                            :placeholder="'Jawaban Opsi ' + String.fromCharCode(65 + index)" />
                        <div class="flex items-center gap-2">
                            <input type="radio" :name="'correctAnswer'" :value="option"
                                @change="newQuestion.correctAnswer = option"
                                :checked="newQuestion.correctAnswer === option && option !== ''"
                                class="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                                title="Tandai sebagai kunci jawaban" />
                            <button @click="removeOption(index)" class="text-gray-400 hover:text-red-500"
                                v-if="newQuestion.options.length > 2">
                                <TrashIcon class="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
                <p class="text-xs text-gray-500 mt-2">* Pilih radio button di sebelah kanan untuk menandai kunci jawaban
                    yang benar.</p>
            </div>

            <!-- Modal Footer -->
            <div class="flex justify-end gap-3 pt-4 border-t mt-6">
                <Button variant="ghost" @click="handleClose">Batal</Button>
                <div class="flex gap-2" v-if="isEditing">
                    <Button variant="outline" @click="saveQuestion('duplicate')">Simpan Duplicate</Button>
                    <Button @click="saveQuestion('update')">Simpan Update</Button>
                </div>
                <Button v-else @click="saveQuestion('create')">Simpan Soal</Button>
            </div>
        </div>
    </Modal>
</template>
