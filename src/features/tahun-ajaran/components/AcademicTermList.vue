<script setup>
import { ref, computed } from 'vue';
import { PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon, SparklesIcon } from '@heroicons/vue/24/outline';
import api from '@/services/api';
import AcademicTermForm from './AcademicTermForm.vue';

const props = defineProps({
    academicYear: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['refresh', 'close']);

const viewMode = ref('list'); // 'list' | 'form'
const formMode = ref('create'); // 'create' | 'edit'
const selectedTerm = ref(null);
const loading = ref(false);

const formTitle = computed(() => formMode.value === 'create' ? 'Tambah Sesi Baru' : 'Edit Sesi Semester');

const terms = computed(() => props.academicYear?.terms || []);

const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
};

const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
};

const handleAdd = () => {
    formMode.value = 'create';
    selectedTerm.value = null;
    viewMode.value = 'form';
};

const handleEdit = (term) => {
    formMode.value = 'edit';
    selectedTerm.value = term;
    viewMode.value = 'form';
};

const handleDelete = async (term) => {
    if (!confirm(`Hapus sesi ${term.semester} dari tahun pelajaran ini?`)) return;

    loading.value = true;
    try {
        await api.delete(`/academic-terms/${term.id}`);
        emit('refresh');
    } catch (error) {
        console.error('Gagal menghapus sesi', error);
        alert(error.response?.data?.message || 'Gagal menghapus sesi');
    } finally {
        loading.value = false;
    }
};

const handleSetActive = async (term) => {
    loading.value = true;
    try {
        await api.post(`/academic-terms/${term.id}/set-active`);
        emit('refresh');
    } catch (error) {
        console.error('Gagal mengaktifkan sesi', error);
        alert(error.response?.data?.message || 'Gagal mengaktifkan sesi');
    } finally {
        loading.value = false;
    }
};

const onFormSubmit = async (formData) => {
    loading.value = true;
    try {
        if (formMode.value === 'create') {
            await api.post(`/academic-years/${props.academicYear.id}/terms`, formData);
        } else {
            await api.put(`/academic-terms/${selectedTerm.value.id}`, formData);
        }
        viewMode.value = 'list';
        emit('refresh');
    } catch (error) {
        console.error('Gagal menyimpan sesi', error);
        alert(error.response?.data?.message || 'Gagal menyimpan sesi');
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div class="space-y-3">
        <template v-if="viewMode === 'list'">
            <div
                class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white/40 backdrop-blur-md border border-white/60 p-5 rounded-[18px] shadow-sm">
                <div class="space-y-1">
                    <h3 class="font-black text-xl text-slate-800 tracking-tight flex items-center gap-2">
                        <div class="p-2 bg-gradient-to-br from-primary/20 to-indigo-500/10 rounded-xl">
                            <SparklesIcon class="w-5 h-5 text-primary" />
                        </div>
                        Manajemen Sesi Semester
                    </h3>
                    <p class="text-xs font-medium text-slate-500 pl-11">Susunan rentang kalender akademik dan tenggat
                        nilai (Ganjil & Genap).</p>
                </div>
                <button @click="handleAdd"
                    class="bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500 text-white px-5 py-3 rounded-2xl text-[13px] font-bold transition-all duration-300 shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2">
                    <div class="bg-white/20 p-1 rounded-lg">
                        <PlusIcon class="w-4 h-4 text-white" />
                    </div>
                    Tambah Sesi Baru
                </button>
            </div>

            <div v-if="loading" class="text-center py-12">
                <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
                <p class="text-xs text-slate-500 mt-3 font-medium tracking-wide">Memproses Sinkronisasi...</p>
            </div>

            <div v-else-if="terms.length === 0"
                class="text-center py-16 bg-white/40 backdrop-blur-md rounded-[32px] border-2 border-dashed border-primary/20 shadow-sm relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
                <div class="relative z-10 space-y-3">
                    <div
                        class="w-16 h-16 bg-primary/10 rounded-3xl mx-auto flex items-center justify-center text-primary">
                        <CalendarIcon class="w-8 h-8" />
                    </div>
                    <div>
                        <h3 class="font-black text-lg text-slate-800 tracking-tight">Belum Ada Sesi</h3>
                        <p class="text-slate-500 text-xs font-medium mt-1">Sesi pembelajaran untuk tahun akademik ini
                            belum didaftarkan.</p>
                    </div>
                </div>
            </div>

            <div v-else class="grid grid-cols-1 gap-4">
                <div v-for="term in terms" :key="term.id"
                    class="group relative bg-white/70 backdrop-blur-xl border border-white/80 p-4 lg:p-5 rounded-[24px] shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-500 overflow-hidden"
                    :class="term.is_active ? 'ring-2 ring-primary/20 bg-gradient-to-br from-primary/[0.04] to-indigo-50/50' : ''">

                    <div v-if="term.is_active"
                        class="absolute -top-32 -right-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none transition-all duration-1000">
                    </div>

                    <div class="space-y-4 relative z-10">
                        <div class="flex flex-wrap items-center justify-between gap-4">
                            <div class="flex items-center gap-4">
                                <h4 class="font-black text-2xl tracking-tight"
                                    :class="term.is_active ? 'bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent drop-shadow-sm' : 'text-slate-700'">
                                    Semester {{ term.semester }}
                                </h4>
                                <span v-if="term.is_active"
                                    class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-primary to-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-[0_0_15px_rgba(var(--primary),0.3)] ring-1 ring-white/20">
                                    <CheckCircleIcon class="w-4 h-4" /> Sedang Aktif
                                </span>
                            </div>
                        </div>

                        <div
                            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 md:gap-4 text-sm z-20 relative">
                            <div
                                class="bg-white border border-slate-100/80 rounded-[16px] p-4 shadow-sm group-hover:border-primary/20 transition-colors duration-300">
                                <p class="text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-1.5">Masa
                                    Berlaku</p>
                                <p class="font-bold text-slate-700 text-xs">{{ formatDate(term.start_date) }}</p>
                            </div>
                            <div
                                class="bg-slate-50/50 backdrop-blur-sm border border-slate-100/80 rounded-[16px] p-4 shadow-sm group-hover:bg-white group-hover:border-primary/20 transition-all duration-300">
                                <p class="text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-1.5">Batas
                                    Isi UTS</p>
                                <p class="font-bold text-slate-700 text-xs">{{ formatDateTime(term.uts_input_deadline)
                                }}</p>
                            </div>
                            <div
                                class="bg-slate-50/50 backdrop-blur-sm border border-slate-100/80 rounded-[16px] p-4 shadow-sm group-hover:bg-white group-hover:border-primary/20 transition-all duration-300">
                                <p class="text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-1.5">Batas
                                    Isi UAS</p>
                                <p class="font-bold text-slate-700 text-xs">{{ formatDateTime(term.uas_input_deadline)
                                }}</p>
                            </div>
                            <div
                                class="bg-emerald-50/30 backdrop-blur-sm border border-emerald-100/80 rounded-[16px] p-4 shadow-sm group-hover:bg-emerald-50 transition-all duration-300">
                                <p class="text-[9px] uppercase tracking-widest text-emerald-600 font-bold mb-1.5">Terbit
                                    Raport</p>
                                <p class="font-black text-emerald-700 text-xs">{{
                                    formatDateTime(term.report_release_date) }}</p>
                            </div>
                        </div>

                        <!-- Actions - Moved to bottom -->
                        <div
                            class="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-slate-100/60 mt-4">
                            <button v-if="!term.is_active" @click="handleSetActive(term)"
                                class="px-5 py-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white hover:shadow-lg hover:shadow-emerald-500/20 font-black text-[10px] uppercase tracking-widest rounded-[14px] transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 border border-emerald-100/50"
                                title="Aktifkan Sesi Ini">
                                <SparklesIcon class="w-4 h-4" /> Terapkan Aktif
                            </button>

                            <button @click="handleEdit(term)"
                                class="px-4 py-2 bg-white border border-slate-100 text-slate-500 hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50/50 hover:shadow-sm rounded-[14px] transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 text-xs font-bold">
                                <PencilIcon class="w-4 h-4" /> Edit
                            </button>

                            <button @click="handleDelete(term)"
                                class="px-4 py-2 bg-white border border-slate-100 text-slate-500 hover:border-rose-200 hover:text-rose-600 hover:bg-rose-50/50 hover:shadow-sm rounded-[14px] transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 text-xs font-bold">
                                <TrashIcon class="w-4 h-4" /> Hapus
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </template>

        <template v-else>
            <div class="max-w-4xl mx-auto">
                <div
                    class="flex items-center justify-between bg-white/40 backdrop-blur-md border border-white/60 p-4 rounded-[24px] shadow-sm mb-4">
                    <div class="flex items-center gap-3">
                        <div class="p-2.5 bg-gradient-to-br from-primary/10 to-indigo-500/5 antialiased rounded-[16px]">
                            <PencilIcon v-if="formMode === 'edit'" class="w-5 h-5 text-primary" />
                            <PlusIcon v-else class="w-5 h-5 text-primary" />
                        </div>
                        <div class="space-y-0.5">
                            <h3 class="font-black text-xl text-slate-800 tracking-tight">{{ formTitle }}</h3>
                            <p class="text-xs text-slate-500 font-medium tracking-wide">Lengkapi form formulir dan pilih
                                jadwal tanggal</p>
                        </div>
                    </div>
                    <button @click="viewMode = 'list'"
                        class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-[13px] font-bold transition-all active:scale-95 border border-slate-200/50">
                        Batal & Kembali
                    </button>
                </div>

                <div class="pt-2">
                    <AcademicTermForm :mode="formMode" :model-value="selectedTerm" @submit="onFormSubmit"
                        @cancel="viewMode = 'list'" />
                </div>
            </div>
        </template>
    </div>
</template>
