<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
    CalendarIcon,
    UserGroupIcon,
    BookOpenIcon,
    CheckCircleIcon,
    CheckIcon,
    ArrowRightIcon,
    AcademicCapIcon,
    PencilSquareIcon,
    DocumentTextIcon,
    ClipboardDocumentCheckIcon,
    MagnifyingGlassIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from '@heroicons/vue/24/outline';
import Button from '@/components/ui/button/Button.vue';
import Input from '@/components/ui/input/Input.vue';
import { useToast } from '@/composables/useToast';

const router = useRouter();
const toast = useToast();

const step = ref(1);
const loading = ref(false);

const form = ref({
    assignmentType: 'teacher', 
    
    // Teacher Specific
    teacherTaskType: null, // 'create' | 'review'
    selectedTeachers: [],
    targetClassesForCreate: [],
    targetTkasForReview: [],
    teacherDeadline: '',

    // Student Specific
    studentTkaId: null,
    studentTargetType: 'class',
    selectedStudentClasses: [],
    studentStartDate: '',
    studentEndDate: '',
    studentSettings: {
        randomizeQuestions: false,
        randomizeOptions: false,
        showResult: true,
        tokenMode: 'static', 
    }
});

// Mock Data Generators for Pagination Testing
const generateTeachers = () => {
    return Array.from({ length: 25 }, (_, i) => ({
        id: `t-${i + 1}`,
        name: `Guru ${i + 1} - ${['Budi', 'Siti', 'Dewi', 'Joko', 'Rina'][i % 5]}`,
        subject: ['Matematika', 'Fisika', 'Biologi', 'Kimia', 'Bahasa Inggris', 'Sejarah'][i % 6]
    }));
};

const generateTkas = () => {
    return Array.from({ length: 18 }, (_, i) => ({
        id: i + 1,
        title: `Ujian TKA ${i + 1} - ${['Harian', 'UTS', 'UAS'][i % 3]}`,
        subject: ['Matematika', 'Fisika', 'Biologi', 'Kimia', 'Bahasa Inggris', 'Sejarah'][i % 6],
        duration: [30, 45, 60, 90][i % 4]
    }));
};

const generateClasses = () => {
    return Array.from({ length: 12 }, (_, i) => ({
        id: `c-${i + 1}`,
        name: `${['X', 'XI', 'XII'][i % 3]} ${['IPA', 'IPS'][i % 2]} ${Math.floor(i / 6) + 1}`,
        studentCount: 25 + (i % 10)
    }));
};

const teachersList = ref(generateTeachers());
const tkaList = ref(generateTkas());
const classesList = ref(generateClasses());

// --- Pagination Logic ---
const ITEMS_PER_PAGE = 6;

const teacherSearch = ref('');
const teacherPage = ref(1);

const tkaSearch = ref('');
const tkaPage = ref(1);

const classSearch = ref('');
const classPage = ref(1);

// Filter & Paginate Teachers
const filteredTeachers = computed(() => {
    return teachersList.value.filter(t => 
        t.name.toLowerCase().includes(teacherSearch.value.toLowerCase()) ||
        t.subject.toLowerCase().includes(teacherSearch.value.toLowerCase())
    );
});
const paginatedTeachers = computed(() => {
    const start = (teacherPage.value - 1) * ITEMS_PER_PAGE;
    return filteredTeachers.value.slice(start, start + ITEMS_PER_PAGE);
});
const totalTeacherPages = computed(() => Math.ceil(filteredTeachers.value.length / ITEMS_PER_PAGE));

// Filter & Paginate TKAs
const filteredTkas = computed(() => {
    return tkaList.value.filter(t => 
        t.title.toLowerCase().includes(tkaSearch.value.toLowerCase()) ||
        t.subject.toLowerCase().includes(tkaSearch.value.toLowerCase())
    );
});
const paginatedTkas = computed(() => {
    const start = (tkaPage.value - 1) * ITEMS_PER_PAGE;
    return filteredTkas.value.slice(start, start + ITEMS_PER_PAGE);
});
const totalTkaPages = computed(() => Math.ceil(filteredTkas.value.length / ITEMS_PER_PAGE));

// Filter & Paginate Classes
const filteredClasses = computed(() => {
    return classesList.value.filter(c => 
        c.name.toLowerCase().includes(classSearch.value.toLowerCase())
    );
});
const paginatedClasses = computed(() => {
    const start = (classPage.value - 1) * ITEMS_PER_PAGE;
    return filteredClasses.value.slice(start, start + ITEMS_PER_PAGE);
});
const totalClassPages = computed(() => Math.ceil(filteredClasses.value.length / ITEMS_PER_PAGE));


// --- Helpers ---
const toggleSelection = (array, id) => {
    const index = array.indexOf(id);
    if (index === -1) array.push(id);
    else array.splice(index, 1);
};

const setAssignmentType = (type) => {
    if (form.value.assignmentType === type) return;
    form.value.assignmentType = type;
    resetForm();
    step.value = 1;
};

const resetForm = () => {
    form.value.teacherTaskType = null;
    form.value.selectedTeachers = [];
    form.value.targetClassesForCreate = [];
    form.value.targetTkasForReview = [];
    form.value.teacherDeadline = '';
    form.value.studentTkaId = null;
    form.value.selectedStudentClasses = [];
    form.value.studentStartDate = '';
    form.value.studentEndDate = '';
    
    // Reset filters
    teacherSearch.value = ''; teacherPage.value = 1;
    tkaSearch.value = ''; tkaPage.value = 1;
    classSearch.value = ''; classPage.value = 1;
};

// --- Computer Steps ---
const totalSteps = computed(() => {
    if (form.value.assignmentType === 'teacher') return 4;
    return 3;
});

const stepTitle = (s) => {
    if (form.value.assignmentType === 'teacher') {
        if (s === 1) return 'Pilih Guru';
        if (s === 2) return 'Jenis Tugas';
        if (s === 3) return 'Target';
        return 'Tenggat';
    } else {
        if (s === 1) return 'Pilih TKA';
        if (s === 2) return 'Peserta';
        return 'Jadwal';
    }
};

// --- Navigation ---
const nextStep = () => {
    const f = form.value;
    
    if (f.assignmentType === 'teacher') {
        if (step.value === 1 && f.selectedTeachers.length === 0) {
            toast.error('Pilih Guru', 'Silakan pilih minimal satu guru.'); return;
        }
        if (step.value === 2 && !f.teacherTaskType) {
            toast.error('Pilih Tugas', 'Silakan pilih jenis tugas guru.'); return;
        }
        if (step.value === 3) {
            if (f.teacherTaskType === 'create' && f.targetClassesForCreate.length === 0) {
                toast.error('Pilih Kelas', 'Pilih kelas target pembuatan soal.'); return;
            }
            if (f.teacherTaskType === 'review' && f.targetTkasForReview.length === 0) {
                toast.error('Pilih TKA', 'Pilih minimal satu TKA untuk direview.'); return;
            }
        }
    } else {
        if (step.value === 1 && !f.studentTkaId) {
             toast.error('Pilih TKA', 'Silakan pilih ujiannya.'); return;
        }
        if (step.value === 2 && f.selectedStudentClasses.length === 0) {
             toast.error('Pilih Peserta', 'Pilih kelas peserta ujian.'); return;
        }
    }
    
    step.value++;
};

const submitAssignment = () => {
    const f = form.value;
    if (f.assignmentType === 'teacher') {
        if (!f.teacherDeadline) {
            toast.error('Tenggat Waktu', 'Silakan isi tenggat waktu pengerjaan.'); return;
        }
    } else {
        if (!f.studentStartDate || !f.studentEndDate) {
            toast.error('Jadwal Ujian', 'Isi waktu mulai dan selesai ujian.'); return;
        }
    }

    loading.value = true;
    setTimeout(() => {
        loading.value = false;
        const msg = f.assignmentType === 'teacher' 
            ? (f.teacherTaskType === 'create' ? 'Tugas Membuat Soal berhasil dikirim.' : 'Tugas Review berhasil dikirim.')
            : 'Jadwal Ujian berhasil diterbitkan.';
        toast.success('Berhasil', msg);
        router.push('/admin/tka/list');
    }, 1500);
};

</script>

<template>
    <div class="p-6 max-w-5xl mx-auto space-y-8">

        <!-- Header & Tabs -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 class="text-2xl font-bold text-slate-900">Penugasan TKA</h1>
                <p class="text-slate-500">Kelola penugasan pembuatan soal untuk guru dan jadwal ujian untuk siswa.</p>
            </div>
            
            <div class="bg-slate-100 p-1 rounded-xl flex items-center">
                <button @click="setAssignmentType('teacher')"
                    class="px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all"
                    :class="form.assignmentType === 'teacher' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'">
                    <PencilSquareIcon class="w-4 h-4" />
                    Penugasan Guru
                </button>
                <button @click="setAssignmentType('student')"
                    class="px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all"
                    :class="form.assignmentType === 'student' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'">
                    <AcademicCapIcon class="w-4 h-4" />
                    Penugasan Siswa
                </button>
            </div>
        </div>

        <!-- Stepper Visual -->
        <div class="flex items-center justify-between relative px-10">
            <div class="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 -z-10 rounded-full"></div>
            <div v-for="s in totalSteps" :key="s"
                class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ring-4 relative bg-white"
                :class="step >= s ? (form.assignmentType === 'teacher' ? 'bg-violet-600 text-white ring-violet-50 border-violet-600' : 'bg-indigo-600 text-white ring-indigo-50 border-indigo-600') : 'text-slate-400 ring-white border border-slate-200'">
                {{ s }}
                <span class="absolute -bottom-8 text-xs font-medium text-slate-500 whitespace-nowrap hidden md:block">
                    {{ stepTitle(s) }}
                </span>
            </div>
        </div>

        <!-- Content Area -->
        <div class="bg-white border border-slate-100 rounded-3xl p-8 shadow-xl shadow-slate-200/50 min-h-[500px] transition-colors duration-300 flex flex-col"
             :class="form.assignmentType === 'teacher' ? 'shadow-violet-200/50' : 'shadow-indigo-200/50'">
             
            <!-- =========================== -->
            <!-- TEACHER FLOW -->
            <!-- =========================== -->
            <template v-if="form.assignmentType === 'teacher'">
                
                <!-- Step 1: Select Teachers (PAGINATED LIST) -->
                <div v-if="step === 1" class="flex-1 flex flex-col">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <UserGroupIcon class="w-6 h-6 text-violet-500" /> Pilih Guru
                        </h2>
                        <div class="relative w-64">
                            <MagnifyingGlassIcon class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="text" v-model="teacherSearch" placeholder="Cari nama atau mapel..." 
                                class="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-violet-200 focus:border-violet-500 outline-none" />
                        </div>
                    </div>
                    
                    <div class="flex-1 overflow-y-auto min-h-[300px]">
                        <div class="space-y-2">
                             <div v-if="paginatedTeachers.length === 0" class="text-center py-10 text-slate-400">
                                Tidak ada data guru ditemukan.
                            </div>
                            <div v-for="teacher in paginatedTeachers" :key="teacher.id" 
                                 @click="toggleSelection(form.selectedTeachers, teacher.id)"
                                 class="p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between hover:bg-slate-50"
                                 :class="form.selectedTeachers.includes(teacher.id) ? 'border-violet-500 bg-violet-50/10' : 'border-slate-100 bg-white'">
                                <div class="flex items-center gap-4">
                                    <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                                        {{ teacher.name.charAt(0) }}
                                    </div>
                                    <div>
                                        <div class="font-bold text-slate-800">{{ teacher.name }}</div>
                                        <div class="text-xs text-slate-500">{{ teacher.subject }}</div>
                                    </div>
                                </div>
                                <div class="w-6 h-6 rounded-full border flex items-center justify-center transition-colors"
                                     :class="form.selectedTeachers.includes(teacher.id) ? 'bg-violet-500 border-violet-500 text-white' : 'border-slate-300'">
                                    <CheckIcon v-if="form.selectedTeachers.includes(teacher.id)" class="w-3 h-3" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Pagination Controls -->
                    <div class="mt-4 flex justify-between items-center pt-4 border-t border-slate-100" v-if="filteredTeachers.length > 0">
                        <span class="text-xs text-slate-400">Menampilkan {{ paginatedTeachers.length }} dari {{ filteredTeachers.length }} guru</span>
                         <div class="flex items-center gap-2">
                            <button @click="teacherPage--" :disabled="teacherPage === 1"
                                class="p-2 rounded-lg border hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                <ChevronLeftIcon class="w-4 h-4 text-slate-600" />
                            </button>
                            <span class="text-sm font-medium text-slate-600 px-2">Hal. {{ teacherPage }}</span>
                            <button @click="teacherPage++" :disabled="teacherPage >= totalTeacherPages"
                                class="p-2 rounded-lg border hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                <ChevronRightIcon class="w-4 h-4 text-slate-600" />
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Step 2: Task Type -->
                <div v-else-if="step === 2" class="space-y-6">
                    <h2 class="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <ClipboardDocumentCheckIcon class="w-6 h-6 text-violet-500" /> Jenis Tugas
                    </h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div @click="form.teacherTaskType = 'create'"
                            class="p-6 rounded-2xl border-2 cursor-pointer transition-all hover:border-violet-300 hover:shadow-lg group"
                            :class="form.teacherTaskType === 'create' ? 'border-violet-600 bg-violet-50/50' : 'border-slate-100 bg-white'">
                            <div class="flex flex-col items-center text-center gap-4">
                                <div class="w-16 h-16 rounded-full flex items-center justify-center transition-colors"
                                    :class="form.teacherTaskType === 'create' ? 'bg-violet-100 text-violet-600' : 'bg-slate-50 text-slate-400'">
                                    <PencilSquareIcon class="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 class="text-lg font-bold text-slate-800">Buat Soal</h3>
                                    <p class="text-sm text-slate-500 mt-2">Guru ditugaskan untuk membuat paket soal baru untuk kelas tertentu.</p>
                                </div>
                            </div>
                        </div>
                        <div @click="form.teacherTaskType = 'review'"
                            class="p-6 rounded-2xl border-2 cursor-pointer transition-all hover:border-violet-300 hover:shadow-lg group"
                            :class="form.teacherTaskType === 'review' ? 'border-violet-600 bg-violet-50/50' : 'border-slate-100 bg-white'">
                            <div class="flex flex-col items-center text-center gap-4">
                                <div class="w-16 h-16 rounded-full flex items-center justify-center transition-colors"
                                    :class="form.teacherTaskType === 'review' ? 'bg-violet-100 text-violet-600' : 'bg-slate-50 text-slate-400'">
                                    <DocumentTextIcon class="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 class="text-lg font-bold text-slate-800">Review Ujian</h3>
                                    <p class="text-sm text-slate-500 mt-2">Guru ditugaskan untuk mereview soal-soal pada TKA yang sudah ada.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Step 3: Context (PAGINATED LISTS) -->
                <div v-else-if="step === 3" class="flex-1 flex flex-col">
                    <!-- Heading & Search -->
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-xl font-bold text-slate-800 flex items-center gap-2">
                             <UserGroupIcon v-if="form.teacherTaskType === 'create'" class="w-6 h-6 text-violet-500" />
                            <BookOpenIcon v-else class="w-6 h-6 text-violet-500" />
                            {{ form.teacherTaskType === 'create' ? 'Target Kelas' : 'Pilih Ujian untuk Direview' }}
                        </h2>
                        
                        <!-- Class Search -->
                        <div v-if="form.teacherTaskType === 'create'" class="relative w-64">
                             <MagnifyingGlassIcon class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="text" v-model="classSearch" placeholder="Cari kelas..." 
                                class="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-violet-200 focus:border-violet-500 outline-none" />
                        </div>

                         <!-- TKA Search -->
                        <div v-if="form.teacherTaskType === 'review'" class="relative w-64">
                             <MagnifyingGlassIcon class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="text" v-model="tkaSearch" placeholder="Cari ujian..." 
                                class="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-violet-200 focus:border-violet-500 outline-none" />
                        </div>
                    </div>

                    <!-- Create: Class List -->
                    <div v-if="form.teacherTaskType === 'create'" class="flex-1">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div v-for="cls in paginatedClasses" :key="cls.id" 
                                 @click="toggleSelection(form.targetClassesForCreate, cls.id)"
                                 class="p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-center hover:bg-slate-50"
                                 :class="form.targetClassesForCreate.includes(cls.id) ? 'border-violet-500 bg-violet-50/10' : 'border-slate-100 bg-white'">
                                <div>
                                    <div class="font-bold text-slate-800">{{ cls.name }}</div>
                                    <div class="text-xs text-slate-500 mt-1">{{ cls.studentCount }} Siswa</div>
                                </div>
                                <div class="w-6 h-6 rounded-full border flex items-center justify-center transition-colors"
                                    :class="form.targetClassesForCreate.includes(cls.id) ? 'bg-violet-500 border-violet-500 text-white' : 'border-slate-300'">
                                    <CheckIcon v-if="form.targetClassesForCreate.includes(cls.id)" class="w-3 h-3" />
                                </div>
                            </div>
                        </div>
                         <!-- Pagination Controls -->
                        <div class="mt-4 flex justify-between items-center pt-4 border-t border-slate-100">
                             <span class="text-xs text-slate-400">Menampilkan {{ paginatedClasses.length }} dari {{ filteredClasses.length }} kelas</span>
                             <div class="flex items-center gap-2">
                                <button @click="classPage--" :disabled="classPage === 1"
                                    class="p-2 rounded-lg border hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <ChevronLeftIcon class="w-4 h-4 text-slate-600" />
                                </button>
                                <span class="text-sm font-medium text-slate-600 px-2">Hal. {{ classPage }}</span>
                                <button @click="classPage++" :disabled="classPage >= totalClassPages"
                                    class="p-2 rounded-lg border hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <ChevronRightIcon class="w-4 h-4 text-slate-600" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Review: TKA List -->
                    <div v-else class="flex-1">
                         <div class="space-y-2">
                            <div v-for="tka in paginatedTkas" :key="tka.id" 
                                 @click="toggleSelection(form.targetTkasForReview, tka.id)"
                                 class="p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-center hover:bg-slate-50"
                                 :class="form.targetTkasForReview.includes(tka.id) ? 'border-violet-500 bg-violet-50/10' : 'border-slate-100'">
                                <div>
                                    <h3 class="font-bold text-slate-800">{{ tka.title }}</h3>
                                    <p class="text-sm text-slate-500 mt-1">{{ tka.subject }}</p>
                                </div>
                                <div class="w-6 h-6 rounded-full border flex items-center justify-center"
                                    :class="form.targetTkasForReview.includes(tka.id) ? 'border-violet-500 bg-violet-500 text-white' : 'border-slate-300'">
                                    <CheckIcon v-if="form.targetTkasForReview.includes(tka.id)" class="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                         <!-- Pagination Controls -->
                         <div class="mt-4 flex justify-between items-center pt-4 border-t border-slate-100">
                             <span class="text-xs text-slate-400">Menampilkan {{ paginatedTkas.length }} dari {{ filteredTkas.length }} ujian</span>
                             <div class="flex items-center gap-2">
                                <button @click="tkaPage--" :disabled="tkaPage === 1"
                                    class="p-2 rounded-lg border hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <ChevronLeftIcon class="w-4 h-4 text-slate-600" />
                                </button>
                                <span class="text-sm font-medium text-slate-600 px-2">Hal. {{ tkaPage }}</span>
                                <button @click="tkaPage++" :disabled="tkaPage >= totalTkaPages"
                                    class="p-2 rounded-lg border hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <ChevronRightIcon class="w-4 h-4 text-slate-600" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Step 4: Teacher Deadline -->
                <div v-else-if="step === 4" class="space-y-6">
                    <h2 class="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <CalendarIcon class="w-6 h-6 text-violet-500" /> Tenggat Waktu
                    </h2>
                    <div class="max-w-md">
                        <label class="block text-sm font-bold text-slate-700 mb-2">Batas Akhir Pengerjaan</label>
                        <Input v-model="form.teacherDeadline" type="datetime-local" />
                        <p class="text-sm text-slate-500 mt-2">Guru harus menyelesaikan tugas sebelum waktu ini.</p>
                    </div>
                </div>

            </template>

            <!-- =========================== -->
            <!-- STUDENT FLOW -->
            <!-- =========================== -->
            <template v-else>
                 <!-- Step 1: Select TKA (PAGINATED LIST) -->
                <div v-if="step === 1" class="flex-1 flex flex-col">
                     <div class="flex justify-between items-center mb-6">
                        <h2 class="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <BookOpenIcon class="w-6 h-6 text-indigo-500" /> Pilih Ujian (TKA)
                        </h2>
                        <div class="relative w-64">
                            <MagnifyingGlassIcon class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="text" v-model="tkaSearch" placeholder="Cari ujian..." 
                                class="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none" />
                        </div>
                    </div>

                    <div class="flex-1 space-y-2">
                        <div v-for="tka in paginatedTkas" :key="tka.id" @click="form.studentTkaId = tka.id"
                            class="p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-center hover:bg-slate-50"
                            :class="form.studentTkaId === tka.id ? 'border-indigo-500 bg-indigo-50/10' : 'border-slate-100 bg-white'">
                            <div>
                                <h3 class="font-bold text-slate-800">{{ tka.title }}</h3>
                                <p class="text-sm text-slate-500 mt-1">{{ tka.subject }} • {{ tka.duration }} Menit</p>
                            </div>
                            <div class="w-6 h-6 rounded-full border flex items-center justify-center transition-colors"
                                :class="form.studentTkaId === tka.id ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-300'">
                                <CheckCircleIcon v-if="form.studentTkaId === tka.id" class="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                     <!-- Pagination Controls -->
                     <div class="mt-4 flex justify-between items-center pt-4 border-t border-slate-100">
                             <span class="text-xs text-slate-400">Menampilkan {{ paginatedTkas.length }} dari {{ filteredTkas.length }} ujian</span>
                             <div class="flex items-center gap-2">
                                <button @click="tkaPage--" :disabled="tkaPage === 1"
                                    class="p-2 rounded-lg border hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <ChevronLeftIcon class="w-4 h-4 text-slate-600" />
                                </button>
                                <span class="text-sm font-medium text-slate-600 px-2">Hal. {{ tkaPage }}</span>
                                <button @click="tkaPage++" :disabled="tkaPage >= totalTkaPages"
                                    class="p-2 rounded-lg border hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <ChevronRightIcon class="w-4 h-4 text-slate-600" />
                                </button>
                            </div>
                        </div>
                </div>

                <!-- Step 2: Target Students (PAGINATED LIST) -->
                <div v-else-if="step === 2" class="flex-1 flex flex-col">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <UserGroupIcon class="w-6 h-6 text-indigo-500" /> Pilih Peserta Ujian
                        </h2>
                         <div class="relative w-64">
                            <MagnifyingGlassIcon class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="text" v-model="classSearch" placeholder="Cari kelas..." 
                                class="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none" />
                        </div>
                    </div>

                    <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-min">
                        <div v-for="cls in paginatedClasses" :key="cls.id" 
                             @click="toggleSelection(form.selectedStudentClasses, cls.id)"
                            class="p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-center hover:bg-slate-50"
                            :class="form.selectedStudentClasses.includes(cls.id) ? 'border-indigo-500 bg-indigo-50/10' : 'border-slate-100 hover:border-indigo-200'">
                            <div>
                                <div class="font-bold text-slate-800">{{ cls.name }}</div>
                                <div class="text-xs text-slate-500 mt-1">{{ cls.studentCount }} Siswa</div>
                            </div>
                            <div class="w-6 h-6 rounded-full border flex items-center justify-center transition-colors"
                                :class="form.selectedStudentClasses.includes(cls.id) ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300'">
                                <CheckIcon v-if="form.selectedStudentClasses.includes(cls.id)" class="w-3 h-3" />
                            </div>
                        </div>
                    </div>
                     <!-- Pagination Controls -->
                        <div class="mt-4 flex justify-between items-center pt-4 border-t border-slate-100">
                             <span class="text-xs text-slate-400">Menampilkan {{ paginatedClasses.length }} dari {{ filteredClasses.length }} kelas</span>
                             <div class="flex items-center gap-2">
                                <button @click="classPage--" :disabled="classPage === 1"
                                    class="p-2 rounded-lg border hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <ChevronLeftIcon class="w-4 h-4 text-slate-600" />
                                </button>
                                <span class="text-sm font-medium text-slate-600 px-2">Hal. {{ classPage }}</span>
                                <button @click="classPage++" :disabled="classPage >= totalClassPages"
                                    class="p-2 rounded-lg border hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <ChevronRightIcon class="w-4 h-4 text-slate-600" />
                                </button>
                            </div>
                        </div>
                </div>

                <!-- Step 3: Schedule -->
                <div v-else-if="step === 3" class="space-y-6">
                    <h2 class="text-xl font-bold text-slate-800 flex items-center gap-2">
                         <CalendarIcon class="w-6 h-6 text-indigo-500" /> Jadwal & Pengaturan
                    </h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-2">
                            <label class="text-sm font-bold text-slate-700">Waktu Mulai Ujian</label>
                            <Input v-model="form.studentStartDate" type="datetime-local" />
                        </div>
                        <div class="space-y-2">
                            <label class="text-sm font-bold text-slate-700">Waktu Selesai Ujian</label>
                            <Input v-model="form.studentEndDate" type="datetime-local" />
                        </div>
                    </div>
                    <div class="pt-6 border-t border-slate-100 space-y-4">
                        <h3 class="font-bold text-slate-800">Pengaturan Tambahan</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label class="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-slate-50">
                                <input type="checkbox" v-model="form.studentSettings.randomizeQuestions"
                                    class="w-4 h-4 text-indigo-600 rounded">
                                <span class="text-sm font-medium text-slate-700">Acak Soal</span>
                            </label>
                            <label class="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-slate-50">
                                <input type="checkbox" v-model="form.studentSettings.showResult"
                                    class="w-4 h-4 text-indigo-600 rounded">
                                <span class="text-sm font-medium text-slate-700">Tampilkan Hasil ke Siswa</span>
                            </label>
                        </div>
                    </div>
                </div>
            </template>

        </div>

        <!-- Footer -->
        <div class="flex justify-between items-center">
            <Button v-if="step > 1" @click="step--" variant="outline" class="px-8">
                Kembali
            </Button>
            <div v-else></div>

            <Button v-if="step < totalSteps" @click="nextStep" class="px-8 gap-2"
                 :class="form.assignmentType === 'teacher' ? 'bg-violet-600 hover:bg-violet-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'">
                Lanjut <ArrowRightIcon class="w-4 h-4" />
            </Button>
            <Button v-else @click="submitAssignment" :disabled="loading"
                class="px-8 gap-2 text-white"
                :class="form.assignmentType === 'teacher' ? 'bg-violet-600 hover:bg-violet-700' : 'bg-indigo-600 hover:bg-indigo-700'">
                <span v-if="loading">Menyimpan...</span>
                <span v-else>Tugaskan Sekarang</span>
            </Button>
        </div>

    </div>
</template>
