<script setup>
import { useRouter } from 'vue-router';
import { Card, CardContent } from '@/components/ui/card';
import { 
  BookOpenIcon, 
  ArrowRightIcon, 
  VideoCameraIcon, 
  PhotoIcon 
} from '@heroicons/vue/24/outline';

const router = useRouter();

const bulletins = [
  {
    id: 1,
    title: 'Edisi Spesial: Prestasi Gemilang Semester Ganjil',
    date: '24 Jan 2024',
    excerpt: 'Simak rangkuman prestasi siswa-siswi kita selama semester ini...',
    category: 'Majalah',
    type: 'image'
  },
  {
    id: 2,
    title: 'Karya Siswa: Puisi dan Cerpen Inspiratif',
    date: '20 Jan 2024',
    excerpt: 'Kumpulan karya sastra terbaik dari ekstrakurikuler Jurnalistik.',
    category: 'Buletin',
    type: 'image'
  },
  {
    id: 3,
    title: 'Liputan Khusus: Hari Guru Nasional 2023',
    date: '15 Jan 2024',
    excerpt: 'Momen penuh haru dan kegembiraan di perayaan hari guru.',
    category: 'Berita',
    type: 'video'
  }
];

const navigateToList = () => {
  router.push('/admin/bulletins');
};

const navigateToDetail = (id) => {
  router.push(`/admin/bulletins/${id}`);
};
</script>

<template>
  <Card class="border-none shadow-sm bg-background/50 backdrop-blur-sm overflow-hidden group">
    <CardContent class="p-6">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-2">
          <BookOpenIcon class="w-5 h-5 text-primary" />
          <h3 class="font-bold text-foreground text-sm uppercase tracking-wider opacity-50 px-1">Buletin Majalah Sekolah</h3>
        </div>
        <button @click="navigateToList" class="text-xs font-bold text-primary hover:underline flex items-center gap-1">
          Lihat Semua
          <ArrowRightIcon class="w-3 h-3" />
        </button>
      </div>

      <div class="space-y-4">
        <div v-for="item in bulletins" :key="item.id" 
          @click="navigateToDetail(item.id)"
          class="p-4 rounded-2xl bg-primary/5 hover:bg-primary/10 transition-all cursor-pointer border border-transparent hover:border-primary/20 flex flex-col gap-2">
          
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-black rounded-full uppercase tracking-wider">
                {{ item.category }}
              </span>
              <!-- Media Indicator -->
              <div v-if="item.type === 'video'" class="flex items-center gap-1 text-[10px] text-primary/70 font-bold uppercase tracking-tighter">
                <VideoCameraIcon class="w-3 h-3" />
                VIDEO
              </div>
              <div v-else-if="item.type === 'image'" class="flex items-center gap-1 text-[10px] text-primary/70 font-bold uppercase tracking-tighter">
                <PhotoIcon class="w-3 h-3" />
                GAMBAR
              </div>
            </div>
            <span class="text-[10px] text-muted-foreground font-medium">{{ item.date }}</span>
          </div>

          <h4 class="text-sm font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
            {{ item.title }}
          </h4>
          <p class="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
            {{ item.excerpt }}
          </p>
        </div>
      </div>

      <div class="mt-6 pt-6 border-t border-primary/10 flex items-center justify-center">
        <button @click="navigateToList" class="text-[11px] font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-widest">
          Lihat Semuanya
        </button>
      </div>
    </CardContent>
  </Card>
</template>
