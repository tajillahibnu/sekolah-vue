<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  VideoCameraIcon,
  PhotoIcon,
  ChevronRightIcon,
  BookOpenIcon,
  ClockIcon,
  EyeIcon,
  ChevronLeftIcon
} from '@heroicons/vue/24/outline';
import bulletinService from '@/services/bulletinService';

const router = useRouter();
const bulletins = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const selectedCategory = ref('Semua');

// Pagination state
const page = ref(1);
const total = ref(0);
const limit = ref(6);
const totalPages = ref(1);

// Carousel state
const carouselIndex = ref(0);
const carouselInterval = ref(null);

const categories = ['Semua', 'Majalah', 'Buletin', 'Berita'];

const fetchBulletins = async () => {
  loading.value = true;
  try {
    const response = await bulletinService.getBulletins({
      page: page.value,
      limit: limit.value,
      q: searchQuery.value,
      category: selectedCategory.value
    });
    bulletins.value = response.data;
    total.value = response.meta.total;
    totalPages.value = response.meta.totalPages;
  } catch (error) {
    console.error('Failed to fetch bulletins', error);
  } finally {
    loading.value = false;
  }
};

const carouselBulletins = computed(() => {
  return bulletins.value.filter(b => b.isFeatured).slice(0, 3);
});

const startAutoplay = () => {
  if (carouselBulletins.value.length <= 1) return;
  carouselInterval.value = setInterval(() => {
    carouselIndex.value = (carouselIndex.value + 1) % carouselBulletins.value.length;
  }, 5000);
};

const stopAutoplay = () => {
  if (carouselInterval.value) {
    clearInterval(carouselInterval.value);
    carouselInterval.value = null;
  }
};

const nextSlide = () => {
  stopAutoplay();
  carouselIndex.value = (carouselIndex.value + 1) % carouselBulletins.value.length;
  startAutoplay();
};

const prevSlide = () => {
  stopAutoplay();
  carouselIndex.value = (carouselIndex.value - 1 + carouselBulletins.value.length) % carouselBulletins.value.length;
  startAutoplay();
};

onMounted(async () => {
  await fetchBulletins();
  startAutoplay();
});

onUnmounted(stopAutoplay);

// Watch for filter changes
watch([searchQuery, selectedCategory], () => {
  page.value = 1;
  fetchBulletins();
});

const changePage = (newPage) => {
  if (newPage > 0 && newPage <= totalPages.value) {
    page.value = newPage;
    fetchBulletins();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const navigateToDetail = (id) => {
  router.push(`/admin/bulletins/${id}`);
};
</script>

<template>
  <div class="space-y-12 pb-20 animate-in fade-in duration-700">
    <!-- Magazine Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b-4 border-primary/10 pb-10">
      <div class="space-y-4 max-w-2xl">
        <div class="flex items-center gap-3">
          <div class="p-3 bg-primary/10 rounded-2xl text-primary">
            <BookOpenIcon class="w-8 h-8" />
          </div>
          <span class="text-sm font-black uppercase tracking-[0.3em] text-primary/60">The School Journal</span>
        </div>
        <h1 class="text-5xl md:text-7xl font-black tracking-tighter text-foreground leading-[0.9]">
          BACA & <span class="text-primary italic">INSPIRASI.</span>
        </h1>
        <p class="text-xl text-muted-foreground font-medium max-w-lg leading-relaxed pt-2">
          Jendela informasi, prestasi, dan kreativitas siswa dalam format majalah digital yang fresh.
        </p>
      </div>

      <!-- Quick Search Style Students -->
      <div class="flex flex-col gap-4 w-full md:w-96">
        <div class="relative group">
          <MagnifyingGlassIcon
            class="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-all pr-1" />
          <input v-model="searchQuery" type="text" placeholder="Cari artikel..."
            class="w-full pl-14 pr-6 py-5 bg-primary/5 border-none rounded-[28px] text-sm font-black focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/50 pr-2" />
        </div>
      </div>
    </div>

    <!-- Category Filter Style Students -->
    <div class="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
      <button v-for="cat in categories" :key="cat" @click="selectedCategory = cat"
        class="px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap"
        :class="selectedCategory === cat
          ? 'bg-primary text-primary-foreground shadow-2xl shadow-primary/20 scale-105'
          : 'bg-primary/5 text-muted-foreground hover:bg-primary/10 hover:text-primary'">
        {{ cat }}
      </button>
    </div>

    <!-- Magazine Featured Layout (Asymmetrical) -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
      <div v-for="i in 6" :key="i" class="bg-primary/5 rounded-[40px] p-8 space-y-6 animate-pulse">
        <div class="w-full aspect-[4/3] bg-primary/10 rounded-[32px]"></div>
        <div class="h-4 w-24 bg-primary/10 rounded-full"></div>
        <div class="h-10 w-full bg-primary/10 rounded-xl"></div>
        <div class="h-20 w-full bg-primary/5 rounded-2xl"></div>
      </div>
    </div>

    <div v-else-if="bulletins.length > 0" class="magazine-grid">
      <!-- Magazine Carousel (Featured) -->
      <div v-if="page === 1 && carouselBulletins.length > 0" class="col-span-full mb-12 relative group/carousel">
        <transition name="slide" mode="out-in">
          <div :key="carouselIndex" @click="navigateToDetail(carouselBulletins[carouselIndex].id)"
            class="relative bg-primary/5 rounded-[48px] overflow-hidden cursor-pointer flex flex-col lg:flex-row items-center transition-all duration-700 hover:shadow-2xl hover:shadow-primary/5 border-none">

            <div class="w-full lg:w-3/5 aspect-video lg:aspect-auto self-stretch overflow-hidden">
              <img
                :src="carouselBulletins[carouselIndex].type === 'video' ? carouselBulletins[carouselIndex].thumbnailUrl : carouselBulletins[carouselIndex].mediaUrl"
                class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
            </div>

            <div
              class="w-full lg:w-2/5 p-12 lg:p-16 space-y-8 bg-primary/5 backdrop-blur-sm self-stretch flex flex-col justify-center">
              <div class="flex items-center gap-4">
                <span
                  class="px-5 py-2 bg-primary text-white text-[10px] font-black rounded-full uppercase tracking-widest">
                  {{ carouselBulletins[carouselIndex].category }}
                </span>
                <span class="flex items-center gap-2 text-xs font-black text-muted-foreground uppercase">
                  <ClockIcon class="w-4 h-4" /> {{ carouselBulletins[carouselIndex].date }}
                </span>
              </div>

              <h2
                class="text-4xl md:text-5xl font-black text-foreground leading-[1.1] tracking-tighter hover:text-primary transition-colors pr-2">
                {{ carouselBulletins[carouselIndex].title }}
              </h2>

              <p
                class="text-lg text-muted-foreground font-medium leading-relaxed italic border-l-4 border-primary/30 pl-6 line-clamp-3">
                "{{ carouselBulletins[carouselIndex].excerpt }}"
              </p>

              <div class="flex items-center justify-between pt-6 border-t border-primary/10">
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-black">
                    {{ (carouselBulletins[carouselIndex].usePenName ? carouselBulletins[carouselIndex].penName :
                      carouselBulletins[carouselIndex].author).charAt(0)
                    }}
                  </div>
                  <span class="text-sm font-black">{{ carouselBulletins[carouselIndex].usePenName ?
                    carouselBulletins[carouselIndex].penName : carouselBulletins[carouselIndex].author }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <div
                    class="w-8 h-8 rounded-full border border-primary/20 flex items-center justify-center text-primary font-black text-[10px]">
                    {{ carouselIndex + 1 }}
                  </div>
                  <ChevronRightIcon class="w-8 h-8 text-primary group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </div>

            <!-- Type Badge -->
            <div class="absolute top-8 right-8">
              <div
                class="px-4 py-2 bg-white/90 backdrop-blur rounded-2xl shadow-xl flex items-center gap-2 text-[10px] font-black uppercase text-primary">
                <VideoCameraIcon v-if="carouselBulletins[carouselIndex].type === 'video'" class="w-4 h-4" />
                <PhotoIcon v-else class="w-4 h-4" />
                {{ carouselBulletins[carouselIndex].type }}
              </div>
            </div>
          </div>
        </transition>

        <!-- Carousel Controls -->
        <button @click.stop="prevSlide"
          class="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/50 backdrop-blur rounded-full flex items-center justify-center text-primary opacity-0 group-hover/carousel:opacity-100 transition-all shadow-xl hover:bg-white border-none">
          <ChevronLeftIcon class="w-6 h-6" />
        </button>
        <button @click.stop="nextSlide"
          class="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/50 backdrop-blur rounded-full flex items-center justify-center text-primary opacity-0 group-hover/carousel:opacity-100 transition-all shadow-xl hover:bg-white border-none">
          <ChevronRightIcon class="w-6 h-6" />
        </button>

        <!-- Dots Navigation -->
        <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          <button v-for="(_, i) in carouselBulletins" :key="i"
            @click.stop="carouselIndex = i; stopAutoplay(); startAutoplay();"
            class="w-2.5 h-2.5 rounded-full transition-all duration-300 border-none"
            :class="carouselIndex === i ? 'bg-primary w-8' : 'bg-primary/30'">
          </button>
        </div>
      </div>

      <!-- Grid for the rest -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        <div v-for="item in bulletins" :key="item.id" @click="navigateToDetail(item.id)"
          class="group flex flex-col bg-background rounded-[40px] hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-3 cursor-pointer overflow-hidden pb-5 border-none">

          <div class="relative aspect-[4/5] rounded-[40px] overflow-hidden mb-8 border-none">
            <img :src="item.type === 'video' ? item.thumbnailUrl : item.mediaUrl"
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity">
            </div>

            <div class="absolute bottom-8 left-8 right-8">
              <span
                class="px-4 py-1.5 bg-white text-primary text-[9px] font-black rounded-full uppercase tracking-widest mb-4 inline-block">{{
                  item.category }}</span>
              <h3
                class="text-2xl font-black text-white leading-tight tracking-tight group-hover:translate-y-[-8px] transition-transform duration-500 pr-2">
                {{ item.title }}
              </h3>
            </div>

            <!-- Media Badge -->
            <div class="absolute top-6 right-6">
              <div
                class="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/30">
                <VideoCameraIcon v-if="item.type === 'video'" class="w-5 h-5" />
                <PhotoIcon v-else class="w-5 h-5" />
              </div>
            </div>
          </div>

          <div class="px-8 space-y-4 flex-1 flex flex-col">
            <p class="text-sm text-muted-foreground font-medium line-clamp-2 leading-relaxed italic">
              {{ item.excerpt }}
            </p>

            <div class="mt-auto pt-6 border-t border-primary/5 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-black text-muted-foreground uppercase opacity-60 tracking-tighter">{{
                  item.usePenName ? item.penName : item.author }}</span>
              </div>
              <div class="flex items-center gap-1.5 text-primary">
                <EyeIcon class="w-4 h-4" />
                <span class="text-xs font-black">{{ item.views }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Magazine Pagination Style -->
    <div v-if="totalPages > 1"
      class="flex flex-col sm:flex-row items-center justify-between gap-8 pt-12 border-t-2 border-primary/5 mt-10">
      <div class="flex items-center gap-1 bg-primary/5 p-1.5 rounded-[24px]">
        <button v-for="p in totalPages" :key="p" @click="changePage(p)"
          class="w-12 h-12 flex items-center justify-center rounded-[18px] text-xs font-black transition-all border-none"
          :class="page === p
            ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-110'
            : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'">
          {{ p }}
        </button>
      </div>

      <div class="flex items-center gap-4">
        <button @click="changePage(page - 1)" :disabled="page <= 1"
          class="flex items-center gap-3 px-8 py-4 bg-primary/5 disabled:opacity-30 rounded-2xl font-black text-xs uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all border-none">
          <ChevronLeftIcon class="w-5 h-5" /> Prev
        </button>
        <button @click="changePage(page + 1)" :disabled="page >= totalPages"
          class="flex items-center gap-3 px-8 py-4 bg-primary disabled:opacity-30 rounded-2xl font-black text-xs uppercase tracking-widest text-white hover:scale-105 shadow-xl shadow-primary/20 transition-all border-none">
          Next
          <ChevronRightIcon class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading"
      class="text-center py-32 bg-primary/5 rounded-[60px] border-4 border-dashed border-primary/10">
      <div class="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
        <BookOpenIcon class="w-12 h-12 text-primary/50" />
      </div>
      <h3 class="text-3xl font-black text-foreground mb-4 tracking-tighter">BELUM ADA BERITA.</h3>
      <p class="text-muted-foreground font-medium text-lg max-w-sm mx-auto">Tunggu update terbaru dari kami atau coba
        filter pencarian yang lain.</p>
      <button @click="searchQuery = ''; selectedCategory = 'Semua'"
        class="mt-8 px-10 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all border-none">
        Reset Pencarian
      </button>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Slide Transition for Carousel */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(50px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-50px);
}
</style>
