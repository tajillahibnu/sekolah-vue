<script setup>
import { ref, watch, computed } from 'vue';
import {
  XMarkIcon,
  PhotoIcon,
  VideoCameraIcon,
  CheckIcon,
  PaperAirplaneIcon,
  DocumentArrowDownIcon,
  CloudArrowUpIcon,
  EyeIcon,
  InformationCircleIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
  bulletin: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['save', 'submit', 'cancel']);

const form = ref({
  title: '',
  penName: '',
  usePenName: false,
  category: 'Majalah',
  type: 'image',
  mediaUrl: '',
  thumbnailUrl: '',
  excerpt: '',
  content: '',
  author: 'User' // Default to logged in user in real app
});

watch(() => props.bulletin, (val) => {
  if (val) {
    form.value = { ...val };
  }
}, { immediate: true });

const categories = ['Majalah', 'Buletin', 'Berita'];
const types = [
  { value: 'image', label: 'Gambar', icon: PhotoIcon },
  { value: 'video', label: 'Video', icon: VideoCameraIcon }
];

const handleSaveDraft = () => {
  emit('save', { ...form.value, status: 'draft' });
};

const handleSubmitReview = () => {
  emit('submit', { ...form.value, status: 'pending' });
};
</script>

<template>
  <div class="space-y-12">
    <!-- Form Layout: 2 Columns on Large Screens -->
    <div class="grid grid-cols-1 xl:grid-cols-5 gap-12">

      <!-- Input Section (Lef/Center Column) -->
      <form @submit.prevent class="xl:col-span-3 space-y-10">
        <div
          class="space-y-8 bg-background/50 backdrop-blur-sm border border-primary/5 rounded-[40px] p-8 lg:p-10 shadow-sm">

          <!-- Title & Category Row -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="md:col-span-2 space-y-3">
              <label class="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 ml-2">Judul
                Artikel</label>
              <input v-model="form.title" type="text" placeholder="Judul yang menarik..."
                class="w-full px-8 py-5 bg-primary/5 border-2 border-transparent focus:border-primary/20 rounded-[28px] text-lg font-black focus:ring-4 focus:ring-primary/10 outline-none transition-all" />
            </div>
            <div class="space-y-3">
              <label class="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 ml-2">Kategori</label>
              <select v-model="form.category"
                class="w-full px-8 py-5 bg-primary/5 border-2 border-transparent focus:border-primary/20 rounded-[28px] text-sm font-black focus:ring-4 focus:ring-primary/10 outline-none transition-all appearance-none cursor-pointer">
                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>
          </div>

          <!-- Type & Media Row -->
          <div class="space-y-3">
            <label class="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 ml-2">Tipe & URL
              Media</label>
            <div class="flex flex-col sm:flex-row gap-4">
              <div class="flex bg-primary/5 p-1.5 rounded-[24px] shrink-0 border border-primary/5">
                <button v-for="t in types" :key="t.value" @click="form.type = t.value" type="button"
                  class="px-6 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                  :class="form.type === t.value ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:text-primary'">
                  <component :is="t.icon" class="w-4 h-4" />
                  {{ t.label }}
                </button>
              </div>
              <input v-model="form.mediaUrl" type="text" placeholder="https://..."
                class="flex-1 px-8 py-4 bg-primary/5 border-2 border-transparent focus:border-primary/20 rounded-[24px] text-sm font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all" />
            </div>
          </div>

          <!-- Thumbnail for Video -->
          <div v-if="form.type === 'video'" class="space-y-3 animate-in slide-in-from-top-4 duration-500">
            <label class="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 ml-2">Thumbnail Video
              URL</label>
            <input v-model="form.thumbnailUrl" type="text" placeholder="https://images.unsplash.com/..."
              class="w-full px-8 py-4 bg-primary/5 border-2 border-transparent focus:border-primary/20 rounded-[24px] text-sm font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all" />
          </div>

          <!-- Excerpt -->
          <div class="space-y-3">
            <label class="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 ml-2">Ringkasan
              (Snippet)</label>
            <textarea v-model="form.excerpt" rows="2" placeholder="Teks singkat yang muncul di kartu artikel..."
              class="w-full px-8 py-5 bg-primary/5 border-2 border-transparent focus:border-primary/20 rounded-[32px] text-sm font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none"></textarea>
          </div>

          <!-- Full Content -->
          <div class="space-y-3">
            <label class="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 ml-2">Isi Konten</label>
            <textarea v-model="form.content" rows="8" placeholder="Tuangkan semua ide dan cerita Anda di sini..."
              class="w-full px-8 py-6 bg-primary/5 border-2 border-transparent focus:border-primary/20 rounded-[40px] text-base font-medium focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none leading-relaxed"></textarea>
          </div>

          <!-- Author Identity Section (New) -->
          <div class="pt-6 border-t border-primary/5 space-y-6">
            <div class="flex items-center justify-between px-4 py-3 bg-primary/5 rounded-2xl">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-primary/10 rounded-xl">
                  <UserIcon class="w-5 h-5 text-primary" />
                </div>
                <div class="flex flex-col">
                  <span class="text-xs font-black uppercase tracking-widest text-foreground">Identitas Penulis</span>
                  <span class="text-[10px] font-medium text-muted-foreground uppercase opacity-60">Pilih nama yang ingin
                    ditampilkan</span>
                </div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="form.usePenName" class="sr-only peer">
                <div
                  class="w-11 h-6 bg-primary/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary">
                </div>
                <span class="ml-3 text-[10px] font-black uppercase tracking-widest text-primary">{{ form.usePenName ?
                  'Nama Pena' : 'Nama Asli' }}</span>
              </label>
            </div>

            <div v-if="form.usePenName" class="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <label class="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 ml-2">Masukkan Nama Pena /
                Nickname</label>
              <input v-model="form.penName" type="text" placeholder="Contoh: Sang Pemimpi, Penjelajah Waktu..."
                class="w-full px-8 py-5 bg-primary/5 border-2 border-transparent focus:border-primary/20 rounded-[28px] text-sm font-black focus:ring-4 focus:ring-primary/10 outline-none transition-all" />
            </div>
          </div>
        </div>

        <!-- Action Buttons (Floating style) -->
        <div class="flex flex-col sm:flex-row items-center gap-4 pt-4">
          <button @click="handleSaveDraft" type="button"
            class="w-full sm:w-56 py-5 bg-background border-2 border-primary/10 text-primary rounded-[28px] font-black text-xs uppercase tracking-[0.2em] hover:bg-primary/5 transition-all flex items-center justify-center gap-3">
            <DocumentArrowDownIcon class="w-5 h-5" />
            Simpan Draft
          </button>
          <button @click="handleSubmitReview" type="button"
            class="w-full sm:flex-1 py-5 bg-primary text-white rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
            <PaperAirplaneIcon class="w-5 h-5" />
            Kirim Untuk Review
          </button>
        </div>
      </form>

      <!-- Preview Section (Right Column) -->
      <div class="xl:col-span-2 space-y-8 sticky top-0 h-fit">
        <div class="flex items-center gap-3 mb-2 px-4">
          <EyeIcon class="w-5 h-5 text-primary" />
          <h4 class="text-sm font-black uppercase tracking-widest text-foreground">Live Preview</h4>
        </div>

        <!-- Magazine Style Detail Preview -->
        <div class="bg-card border border-primary/10 rounded-[48px] overflow-hidden shadow-2xl space-y-0">
          <!-- Hero Preview -->
          <div class="aspect-video bg-primary/5 relative overflow-hidden flex items-center justify-center group">
            <img v-if="form.mediaUrl || form.thumbnailUrl"
              :src="form.type === 'video' ? form.thumbnailUrl : form.mediaUrl"
              class="w-full h-full object-cover opacity-90" />
            <div v-else class="flex flex-col items-center gap-4 text-primary/20">
              <CloudArrowUpIcon class="w-16 h-16" />
              <span class="text-[10px] font-black uppercase tracking-widest">Media Preview</span>
            </div>

            <div class="absolute top-6 right-6">
              <div
                class="px-4 py-2 bg-white/90 backdrop-blur rounded-2xl shadow-xl flex items-center gap-2 text-[10px] font-black uppercase text-primary">
                <VideoCameraIcon v-if="form.type === 'video'" class="w-4 h-4" />
                <PhotoIcon v-else class="w-4 h-4" />
                {{ form.type }}
              </div>
            </div>
          </div>

          <!-- Content Preview -->
          <div class="p-10 space-y-6 bg-background/50 backdrop-blur-sm">
            <div class="flex items-center gap-4">
              <span
                class="px-4 py-1.5 bg-primary/10 text-primary text-[9px] font-black rounded-full uppercase tracking-widest">{{
                  form.category || 'Kategori' }}</span>
              <span class="text-[9px] font-black text-muted-foreground uppercase opacity-40">{{ new
                Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) }}</span>
            </div>

            <h3 class="text-3xl font-black text-foreground tracking-tighter leading-tight line-clamp-2">
              {{ form.title || 'Judul Artikel Anda' }}
            </h3>

            <p
              class="text-sm text-primary font-black italic underline underline-offset-4 decoration-2 decoration-primary/20">
              By {{ form.usePenName ? (form.penName || 'Penulis') : (form.author || 'User') }}
            </p>

            <div class="h-px bg-primary/5"></div>

            <div class="space-y-4">
              <p v-if="form.excerpt"
                class="text-base text-foreground font-black italic border-l-4 border-primary/30 pl-4 leading-relaxed">
                "{{ form.excerpt }}"
              </p>
              <div class="text-sm text-muted-foreground font-medium leading-relaxed whitespace-pre-wrap">
                {{ form.content || 'Mulailah menulis untuk melihat tampilan konten lengkap di sini...' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Tips Card -->
        <div class="bg-primary/5 rounded-[32px] p-8 border border-primary/10 flex gap-5">
          <InformationCircleIcon class="w-8 h-8 text-primary shrink-0" />
          <div class="space-y-2">
            <h5 class="text-xs font-black uppercase tracking-widest text-primary">Tips Menulis</h5>
            <p class="text-[11px] text-muted-foreground font-semibold leading-relaxed">
              Gunakan judul yang singkat dan padat. Sertakan ringkasan (excerpt) yang menarik perhatian agar pembaca
              tertarik untuk membuka artikel Anda.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
