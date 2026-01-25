<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  ArrowLeftIcon,
  CalendarIcon,
  UserIcon,
  EyeIcon,
  ShareIcon,
  VideoCameraIcon,
  PhotoIcon,
  ClockIcon,
  BookmarkIcon
} from '@heroicons/vue/24/outline';
import bulletinService from '@/services/bulletinService';

const route = useRoute();
const router = useRouter();
const bulletin = ref(null);
const loading = ref(true);

onMounted(async () => {
  const response = await bulletinService.getBulletinById(route.params.id);
  bulletin.value = response.data;
  loading.value = false;
});

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/admin/bulletins');
  }
};
</script>

<template>
  <div class="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-32">
    <!-- Premium Navigation -->
    <div class="flex items-center justify-between mb-12">
      <button @click="goBack"
        class="flex items-center gap-3 px-6 py-3 bg-primary/5 hover:bg-primary text-primary hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all group">
        <ArrowLeftIcon class="w-5 h-5 transition-transform group-hover:-translate-x-1" />
        Kembali
      </button>

      <div class="flex items-center gap-2">
        <button class="p-3 bg-primary/5 hover:bg-primary/10 text-primary rounded-2xl transition-all">
          <BookmarkIcon class="w-5 h-5" />
        </button>
        <button class="p-3 bg-primary/5 hover:bg-primary/10 text-primary rounded-2xl transition-all">
          <ShareIcon class="w-5 h-5" />
        </button>
      </div>
    </div>

    <div v-if="loading" class="space-y-12 animate-pulse">
      <div class="w-full aspect-[21/9] bg-primary/5 rounded-[60px]"></div>
      <div class="max-w-3xl mx-auto space-y-6">
        <div class="h-16 w-full bg-primary/10 rounded-2xl"></div>
        <div class="h-16 w-3/4 bg-primary/10 rounded-2xl"></div>
        <div class="flex gap-4 pt-10">
          <div class="w-12 h-12 rounded-full bg-primary/5"></div>
          <div class="space-y-2">
            <div class="h-4 w-32 bg-primary/5 rounded"></div>
            <div class="h-3 w-24 bg-primary/5 rounded"></div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="bulletin" class="space-y-16">
      <!-- Magazine Hero Section -->
      <div class="relative rounded-[60px] overflow-hidden shadow-2xl shadow-primary/5 group">
        <!-- Media Rendering -->
        <template v-if="bulletin.type === 'image'">
          <img :src="bulletin.mediaUrl" :alt="bulletin.title"
            class="w-full aspect-[21/9] object-cover transition-transform duration-1000 group-hover:scale-105" />
        </template>
        <template v-else-if="bulletin.type === 'video'">
          <video controls class="w-full aspect-[21/9] object-cover bg-black" :poster="bulletin.thumbnailUrl">
            <source :src="bulletin.mediaUrl" type="video/mp4">
          </video>
        </template>

        <!-- Floating Category Badge -->
        <div class="absolute top-10 left-10">
          <span
            class="px-6 py-2.5 bg-white/90 backdrop-blur-xl text-primary text-xs font-black rounded-2xl uppercase tracking-[0.2em] shadow-2xl">
            {{ bulletin.category }}
          </span>
        </div>
      </div>

      <!-- Article Header -->
      <div class="max-w-4xl mx-auto space-y-10 text-center lg:text-left">
        <div class="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10">
          <div
            class="flex items-center justify-center lg:justify-start gap-4 text-muted-foreground text-xs font-black uppercase tracking-widest">
            <span class="flex items-center gap-2">
              <ClockIcon class="w-4 h-4 text-primary" /> {{ bulletin.date }}
            </span>
            <span class="w-1.5 h-1.5 rounded-full bg-primary/30"></span>
            <span class="flex items-center gap-2">
              <EyeIcon class="w-4 h-4 text-primary" /> {{ bulletin.views }} Views
            </span>
          </div>
        </div>

        <h1 class="text-5xl md:text-7xl font-black text-foreground leading-[1.05] tracking-tighter">
          {{ bulletin.title }}
        </h1>

        <!-- Author Card -->
        <div class="flex items-center justify-center lg:justify-start gap-5 pt-6 border-t border-primary/10">
          <div
            class="w-16 h-16 rounded-[24px] bg-primary/10 flex items-center justify-center text-primary font-black text-2xl shadow-inner">
            {{ (bulletin.usePenName ? bulletin.penName : bulletin.author)?.charAt(0) || 'P' }}
          </div>
          <div class="text-left">
            <p class="text-[10px] uppercase tracking-[0.3em] font-black text-primary mb-1">Diterbitkan Oleh</p>
            <p class="text-xl font-black text-foreground italic">{{ bulletin.usePenName ? bulletin.penName :
              bulletin.author
            }}</p>
          </div>
        </div>
      </div>

      <!-- Magazine Content Body -->
      <div class="max-w-3xl mx-auto">
        <div class="prose prose-2xl max-w-none">
          <!-- Lead Paragraph -->
          <p
            class="text-3xl font-bold text-foreground leading-tight tracking-tight mb-16 border-l-8 border-primary pl-10 py-4 bg-primary/5 rounded-r-[32px]">
            {{ bulletin.excerpt }}
          </p>

          <div class="space-y-10 text-xl font-medium text-muted-foreground leading-relaxed">
            <p v-for="(p, i) in 3" :key="i">
              {{ bulletin.content }} Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent
              libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis
              ipsum.
              Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget
              nulla.
              Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.
            </p>
          </div>
        </div>

        <!-- Magazine Quote Block -->
        <div
          class="my-20 p-16 bg-primary text-primary-foreground rounded-[60px] relative overflow-hidden shadow-2xl shadow-primary/30">
          <div class="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div class="relative z-10 space-y-6">
            <svg class="w-16 h-16 opacity-20" fill="currentColor" viewBox="0 0 32 32">
              <path d="M10 8v8H6v-8h4zm12 0v8h-4v-8h4zM4 16h8v8H4v-8zm16 0h8v8h-8v-8z" />
            </svg>
            <p class="text-3xl font-black leading-tight tracking-tight italic">
              "Kreativitas bukan hanya tentang hasil akhir, tapi tentang bagaimana kita mengekspresikan diri melalui
              proses
              belajar."
            </p>
            <div class="h-1 w-20 bg-white/30 rounded-full"></div>
            <p class="text-sm font-black uppercase tracking-widest opacity-80">Tim Redaksi Majalah Sekolah</p>
          </div>
        </div>
      </div>

      <!-- Footer Action -->
      <div class="max-w-4xl mx-auto pt-20 border-t-4 border-primary/10 text-center space-y-10">
        <h4 class="text-4xl font-black tracking-tighter">BACA CERITA LAINNYA.</h4>
        <button @click="goBack"
          class="px-12 py-5 bg-primary text-white rounded-[24px] font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-105 transition-all">
          Kembali ke Katalog
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom prose tweaks for magazine feel */
p {
  margin-bottom: 2rem;
}
</style>
