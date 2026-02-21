<script setup>
import { ref, watch, computed } from 'vue';
import { CalendarIcon, SparklesIcon, ClockIcon } from '@heroicons/vue/24/outline';
import FormInput from '@/components/ui/form/FormInput.vue'
import FormSelect from '@/components/ui/form/FormSelect.vue'
import { Button } from '@/components/ui/button'

const props = defineProps({
    modelValue: {
        type: Object,
        default: () => ({})
    },
    mode: {
        type: String,
        default: 'create'
    }
});

const emit = defineEmits(['update:modelValue', 'submit', 'cancel']);

const form = ref({
    semester: 'Ganjil',
    start_date: '',
    end_date: '',
    uts_input_deadline: '',
    uas_input_deadline: '',
    report_release_date: ''
});

const errors = ref({});

const semesterOptions = ['Ganjil', 'Genap'];

// HTML datetime-local requires format YYYY-MM-DDThh:mm
const formatForDatetimeLocal = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    // get parts in local time
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const mins = String(date.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T${hh}:${mins}`;
};

const resetForm = () => {
    form.value = {
        semester: 'Ganjil',
        start_date: '',
        end_date: '',
        uts_input_deadline: '',
        uas_input_deadline: '',
        report_release_date: ''
    };
    errors.value = {};
};

watch(() => props.modelValue, (val) => {
    if (val && Object.keys(val).length > 0) {
        form.value = {
            semester: val.semester || 'Ganjil',
            start_date: val.start_date || '',
            end_date: val.end_date || '',
            uts_input_deadline: formatForDatetimeLocal(val.uts_input_deadline),
            uas_input_deadline: formatForDatetimeLocal(val.uas_input_deadline),
            report_release_date: formatForDatetimeLocal(val.report_release_date)
        };
    } else {
        resetForm();
    }
}, { immediate: true });

const isEdit = computed(() => props.mode === 'edit');

const validate = () => {
    errors.value = {};
    let isValid = true;

    if (!form.value.semester) {
        errors.value.semester = 'Semester wajib dipilih';
        isValid = false;
    }

    if (form.value.start_date && form.value.end_date) {
        if (new Date(form.value.end_date) < new Date(form.value.start_date)) {
            errors.value.end_date = 'Tanggal akhir harus setelah tanggal mulai';
            isValid = false;
        }
    }

    return isValid;
};

const handleSubmit = () => {
    if (validate()) {
        // Prepare payload, format datetime fields appropriately for backend (YYYY-MM-DD HH:mm:ss)
        const payload = { ...form.value };

        ['uts_input_deadline', 'uas_input_deadline', 'report_release_date'].forEach(field => {
            if (payload[field]) {
                payload[field] = payload[field].replace('T', ' ') + ':00'; // Append seconds
            } else {
                payload[field] = null; // Send null explicitly if empty
            }
        });

        if (!payload.start_date) payload.start_date = null;
        if (!payload.end_date) payload.end_date = null;

        emit('submit', payload);
    }
};
</script>

<template>
    <form @submit.prevent="handleSubmit" class="relative px-1 md:px-2 py-1">
        <div class="space-y-6 relative z-10">
            <!-- Informasi Umum -->
            <div class="space-y-4 group">
                <h4
                    class="text-lg font-black bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent border-b border-primary/10 pb-4 flex items-center gap-3">
                    <div
                        class="p-2 bg-gradient-to-br from-primary/10 to-indigo-500/5 antialiased rounded-xl shadow-inner group-hover:scale-110 transition-transform">
                        <CalendarIcon class="w-6 h-6 text-primary" />
                    </div>
                    Informasi Umum Sesi
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                    <FormSelect v-model="form.semester" label="Semester" :options="semesterOptions"
                        :error="errors.semester" required />
                    <FormInput v-model="form.start_date" type="date" label="Tanggal Mulai" :error="errors.start_date" />
                    <FormInput v-model="form.end_date" type="date" label="Tanggal Akhir" :error="errors.end_date" />
                </div>
            </div>

            <!-- Tenggat Waktu Edukasi -->
            <div class="space-y-4 group transition-all duration-300">
                <h4 class="text-lg font-black text-slate-700 border-b border-slate-200/60 pb-4 flex items-center gap-3">
                    <div
                        class="p-2 bg-gradient-to-br from-slate-200/50 to-slate-100 rounded-xl shadow-inner group-hover:bg-primary/10 group-hover:text-primary transition-all">
                        <ClockIcon class="w-6 h-6" />
                    </div>
                    Tenggat Waktu Edukasi
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                    <FormInput v-model="form.uts_input_deadline" type="datetime-local" label="Batas Input Nilai UTS"
                        :error="errors.uts_input_deadline" />
                    <FormInput v-model="form.uas_input_deadline" type="datetime-local" label="Batas Input Nilai UAS"
                        :error="errors.uas_input_deadline" />
                    <FormInput v-model="form.report_release_date" type="datetime-local" label="Tanggal Terbit Raport"
                        :error="errors.report_release_date" />
                </div>

                <div
                    class="bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200/50 rounded-2xl p-4 flex items-start gap-3 mt-4 shadow-sm hover:shadow-md transition-shadow">
                    <div class="p-1.5 bg-amber-100 rounded-lg shrink-0">
                        <SparklesIcon class="w-5 h-5 text-amber-600" />
                    </div>
                    <p class="text-[11px] text-amber-800/80 font-medium leading-relaxed">
                        <span class="font-bold text-amber-700 block mb-0.5">Catatan Sistem</span>
                        Tenggat UTS, UAS, dan Terbit Raport di atas bersifat absolut dan akan men-trigger <strong>Aksi
                            Penguncian Otomatis</strong> sistem nilai.
                    </p>
                </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-end gap-4 pt-2">
                <button type="button" @click="$emit('cancel')"
                    class="px-6 py-3 rounded-2xl font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all active:scale-95 border-2 border-transparent hover:border-slate-200">
                    Batal
                </button>
                <button type="submit"
                    class="bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500 text-white px-8 py-3 rounded-[20px] font-black transition-all duration-300 shadow-[0_8px_20px_rgba(var(--primary),0.25)] hover:shadow-[0_12px_25px_rgba(var(--primary),0.35)] hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 border border-white/20">
                    {{ isEdit ? 'Simpan Perubahan Sesi' : 'Buat Sesi Baru Sekarang' }}
                    <SparklesIcon class="w-5 h-5 shadow-sm" />
                </button>
            </div>
        </div>
    </form>
</template>
