<script setup>
import { ref } from 'vue';
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/vue/24/outline';
import Button from '@/components/ui/button/Button.vue';
import Input from '@/components/ui/input/Input.vue';
import Card from '@/components/ui/card/Card.vue';
import QuestionFormModal from '../components/QuestionFormModal.vue';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const title = ref('Bank Soal TKA');
const searchQuery = ref('');
const filterType = ref('all');

// Mock Data
const questions = ref([
    {
        id: 1,
        text: 'Apa ibukota Indonesia?',
        type: 'Pilihan Ganda',
        subject: 'Matematika',
        category: 'Geografi',
        level: '10',
        tags: ['Ibukota', 'Indonesia', 'Dasar'],
        options: ['Jakarta', 'Bandung', 'Surabaya', 'Medan'],
        correctAnswer: 'Jakarta',
        imagePreview: null
    },
    {
        id: 2,
        text: 'Jelaskan pengertian TKA!',
        type: 'Esai',
        subject: 'Bahasa Indonesia',
        category: 'Definisi',
        level: '11',
        tags: ['Definisi', 'Esai']
    },
    {
        id: 3,
        text: '2 + 2 = ?',
        type: 'Pilihan Ganda',
        subject: 'Matematika',
        category: 'Aritmatika',
        level: '10',
        tags: ['Penjumlahan', 'Dasar'],
        options: ['3', '4', '5', '6'],
        correctAnswer: '4'
    },
]);

// Methods
const deleteQuestion = (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus soal ini?')) {
        questions.value = questions.value.filter(q => q.id !== id);
    }
};

const showAddForm = ref(false);
const questionToEdit = ref(null);

const editQuestion = (question) => {
    questionToEdit.value = question;
    showAddForm.value = true;
};

const handleSaveQuestion = ({ data, mode }) => {
    if (mode === 'create') {
        const newId = questions.value.length + 1;
        questions.value.push({
            id: newId,
            ...data
        });
    } else if (mode === 'update') {
        const index = questions.value.findIndex(q => q.id === questionToEdit.value.id);
        if (index !== -1) {
            questions.value[index] = { ...questions.value[index], ...data };
        }
    } else if (mode === 'duplicate') {
        const newId = questions.value.length + 1;
        questions.value.push({
            id: newId,
            ...data
        });
    }
    // Form closing is handled by modal update:show event but we should ensure state is reset
    questionToEdit.value = null;
};

const handleModalUpdate = (val) => {
    showAddForm.value = val;
    if (!val) {
        questionToEdit.value = null;
    }
}
</script>

<template>
    <div class="p-6 space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 class="text-2xl font-bold text-gray-900">{{ title }}</h1>
                <p class="text-gray-600">Kelola daftar soal untuk Tes Kemampuan Akademik.</p>
            </div>
            <Button @click="showAddForm = true">
                <PlusIcon class="w-5 h-5 mr-2" />
                Tambah Soal
            </Button>
        </div>

        <!-- Add Question Modal -->
        <QuestionFormModal :show="showAddForm" @update:show="handleModalUpdate" :question="questionToEdit"
            @save="handleSaveQuestion" />

        <!-- Filters -->
        <div class="flex flex-col sm:flex-row gap-4">
            <div class="relative flex-1">
                <Input v-model="searchQuery" placeholder="Cari soal..." class="pl-10" />
                <!-- Search Icon placeholder if Input doesn't support slot, otherwise use absolute -->
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 absolute left-3 top-3.5"
                    viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clip-rule="evenodd" />
                </svg>
            </div>
            <Select v-model="filterType">
                <SelectTrigger class="w-[180px]">
                    <SelectValue placeholder="Semua Tipe" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Semua Tipe</SelectItem>
                    <SelectItem value="Pilihan Ganda">Pilihan Ganda</SelectItem>
                    <SelectItem value="Esai">Esai</SelectItem>
                </SelectContent>
            </Select>
        </div>

        <!-- Questions List -->
        <Card class="overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-sm text-left">
                    <thead class="bg-gray-50 text-gray-700 font-medium">
                        <tr>
                            <th class="px-6 py-4">ID</th>
                            <th class="px-6 py-4">Pertanyaan</th>
                            <th class="px-6 py-4">Kategori</th>
                            <th class="px-6 py-4">Mapel</th>
                            <th class="px-6 py-4">Kelas</th>
                            <th class="px-6 py-4">Tipe</th>
                            <th class="px-6 py-4 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        <tr v-for="q in questions" :key="q.id" class="hover:bg-gray-50/50">
                            <td class="px-6 py-4 font-medium text-gray-900">#{{ q.id }}</td>
                            <td class="px-6 py-4 max-w-xs">
                                <div class="flex items-center gap-2">
                                    <div v-if="q.imagePreview" class="w-8 h-8 rounded bg-gray-100 flex-shrink-0">
                                        <img :src="q.imagePreview" class="w-full h-full object-cover rounded" />
                                    </div>
                                    <div class="truncate">
                                        <p :title="q.text" class="truncate">{{ q.text }}</p>
                                        <div class="flex flex-wrap gap-1 mt-1" v-if="q.tags && q.tags.length">
                                            <span v-for="tag in q.tags" :key="tag"
                                                class="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">#{{
                                                    tag }}</span>
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <span class="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                    {{ q.category || '-' }}
                                </span>
                            </td>
                            <td class="px-6 py-4">
                                {{ q.subject }}
                            </td>
                            <td class="px-6 py-4">
                                <span class="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                    {{ q.level || '-' }}
                                </span>
                            </td>
                            <td class="px-6 py-4">{{ q.type }}</td>
                            <td class="px-6 py-4 text-right">
                                <div class="flex justify-end gap-2">
                                    <button @click="editQuestion(q)" class="text-gray-400 hover:text-blue-600">
                                        <PencilIcon class="w-5 h-5" />
                                    </button>
                                    <button @click="deleteQuestion(q.id)" class="text-gray-400 hover:text-red-600">
                                        <TrashIcon class="w-5 h-5" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr v-if="questions.length === 0">
                            <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                                Belum ada soal. Silakan tambahkan soal baru.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </Card>
    </div>
</template>
