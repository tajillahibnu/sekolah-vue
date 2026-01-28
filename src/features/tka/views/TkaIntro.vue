<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
    ClockIcon,
    DocumentTextIcon,
    ShieldCheckIcon,
    ExclamationTriangleIcon,
    ArrowRightIcon
} from '@heroicons/vue/24/outline';
import Button from '@/components/ui/button/Button.vue';
import Input from '@/components/ui/input/Input.vue';
import { useToast } from '@/composables/useToast';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const tkaId = route.params.id;
const token = ref('');
const loading = ref(false);

const tkaDetails = ref({
    title: 'Ujian Akhir Semester Matematika',
    subject: 'Matematika Wajib',
    duration: 90,
    questionCount: 40,
    startTime: '2025-06-20T08:00:00',
    endTime: '2025-06-20T10:00:00',
    description: 'Ujian ini mencakup materi dari Bab 1 hingga Bab 5. Pastikan anda memiliki koneksi internet yang stabil.',
    instructions: [
        'Berdoalah sebelum mengerjakan soal.',
        'Waktu pengerjaan adalah 90 menit. Waktu akan berjalan otomatis saat tombol "Mulai Mengerjakan" ditekan.',
        'Dilarang membuka tab lain atau aplikasi lain selama ujian berlangsung.',
        'Klik tombol "Selesai" jika anda telah yakin dengan semua jawaban anda.',
        'Jika waktu habis, ujian akan tertutup otomatis dan jawaban tersimpan.'
    ]
});

const startExam = async () => {
    // if (!token.value) {
    //     toast.error('Gagal', 'Silakan masukkan token ujian.');
    //     return;
    // }

    // loading.value = true;

    // Simulate API Check
    setTimeout(() => {
        // const cleanToken = token.value.trim();
        // if (cleanToken === '123456') {
        toast.success('Berhasil', 'Token valid. Memasuki ujian...');
        router.push(`/admin/tka/student/do/${tkaId}`).catch(err => {
            console.error('Nav Error:', err);
            toast.error('Navigasi Gagal', 'Gagal memuat halaman ujian.');
        });
        // } else {
        //     toast.error('Token Salah', 'Token yang anda masukkan tidak valid (' + cleanToken + ').');
        //     loading.value = false;
        // }
    }, 1000);
};

</script>

<template>
    <div class="min-h-[80vh] flex items-center justify-center p-4">
        <div
            class="max-w-4xl w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden flex flex-col md:flex-row">

            <!-- Left Panel: Info -->
            <div class="w-full md:w-2/3 p-8 md:p-12 space-y-8">
                <div>
                    <span
                        class="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold mb-3 uppercase tracking-wider">
                        {{ tkaDetails.subject }}
                    </span>
                    <h1 class="text-3xl font-black text-slate-800 leading-tight mb-2">
                        {{ tkaDetails.title }}
                    </h1>
                    <p class="text-slate-500 leading-relaxed">
                        {{ tkaDetails.description }}
                    </p>
                </div>

                <!-- Stats Grid -->
                <div class="grid grid-cols-2 gap-4">
                    <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                        <div
                            class="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                            <ClockIcon class="w-6 h-6" />
                        </div>
                        <div>
                            <p class="text-xs text-slate-400 font-bold uppercase">Durasi</p>
                            <p class="text-lg font-black text-slate-700">{{ tkaDetails.duration }} Menit</p>
                        </div>
                    </div>
                    <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                        <div
                            class="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                            <DocumentTextIcon class="w-6 h-6" />
                        </div>
                        <div>
                            <p class="text-xs text-slate-400 font-bold uppercase">Soal</p>
                            <p class="text-lg font-black text-slate-700">{{ tkaDetails.questionCount }} Butir</p>
                        </div>
                    </div>
                </div>

                <!-- Instructions -->
                <div class="space-y-4">
                    <h3 class="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                        <ExclamationTriangleIcon class="w-4 h-4 text-amber-500" />
                        Instruksi Pengerjaan
                    </h3>
                    <ul class="space-y-2">
                        <li v-for="(inst, i) in tkaDetails.instructions" :key="i"
                            class="flex gap-3 text-sm text-slate-600">
                            <span
                                class="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                                {{ i + 1 }}
                            </span>
                            <span class="leading-relaxed">{{ inst }}</span>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Right Panel: Token -->
            <div
                class="w-full md:w-1/3 bg-slate-50/50 border-l border-slate-100 p-8 md:p-12 flex flex-col justify-center space-y-6">
                <div class="text-center space-y-2">
                    <div
                        class="w-16 h-16 bg-white rounded-2xl shadow-lg shadow-indigo-500/10 flex items-center justify-center mx-auto text-indigo-600 mb-4 ring-1 ring-indigo-50">
                        <ShieldCheckIcon class="w-8 h-8" />
                    </div>
                    <h3 class="text-xl font-bold text-slate-800">Verifikasi Token</h3>
                    <p class="text-xs text-slate-500">
                        Masukkan token ujian yang diberikan oleh pengawas untuk memulai.
                    </p>
                </div>

                <div class="space-y-4">
                    <div class="space-y-2">
                        <label class="text-xs font-bold text-slate-500 uppercase ml-1">Token Ujian</label>
                        <Input v-model="token" placeholder="6 Digit Token"
                            class="text-center text-2xl font-black tracking-widest uppercase placeholder:font-normal placeholder:tracking-normal placeholder:text-sm h-14"
                            maxlength="6" />
                        <p class="text-[10px] text-center text-slate-400">
                            Contoh: 123456
                        </p>
                    </div>

                    <div class="space-y-2">
                        <Button @click="startExam" :disabled="loading"
                            class="w-full h-12 text-sm font-bold shadow-xl shadow-indigo-500/20">
                            <span v-if="!loading" class="flex items-center justify-center gap-2">
                                Mulai Mengerjakan
                                <ArrowRightIcon class="w-4 h-4" />
                            </span>
                            <span v-else>Memverifikasi...</span>
                        </Button>

                        <Button @click="router.push('/admin/tka/student/list')" variant="ghost" :disabled="loading"
                            class="w-full text-slate-400 hover:text-slate-600">
                            Batal
                        </Button>
                    </div>
                </div>

                <div class="mt-auto pt-8 border-t border-slate-200">
                    <p class="text-[10px] text-slate-400 text-center leading-relaxed">
                        Dengan menekan tombol diatas, anda menyetujui aturan ujian dan siap mengerjakan soal dengan
                        jujur.
                    </p>
                </div>
            </div>

        </div>
    </div>
</template>
