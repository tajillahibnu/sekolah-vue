<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
    MagnifyingGlassIcon,
    ArrowLeftIcon,
    HomeIcon,
    CalendarIcon,
    SparklesIcon,
    MapPinIcon,
    StarIcon,
    XMarkIcon,
    ArrowRightIcon,
    PlayIcon,
    ChevronDownIcon,
    CheckBadgeIcon
} from '@heroicons/vue/24/outline'
import { onMounted, onUnmounted, watch } from 'vue'
import Button from '@/components/ui/button/Button.vue'
import Badge from '@/components/ui/badge/Badge.vue'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import Skeleton from '@/components/ui/skeleton/Skeleton.vue'
import { events as allEvents } from '@/data_dummy/events'
import ThemeToggle from '@/components/common/ThemeToggle.vue'

const isLoading = ref(true)
const router = useRouter()
const searchQuery = ref('')
const selectedCategory = ref('Semua')

const categories = ['Semua', 'Perayaan', 'Workshop', 'Olahraga', 'Pameran']

// Pagination & Infinite Scroll State
const itemsPerPage = ref(10)
const displayLimit = ref(10)
const loadingMore = ref(false)
const sentinel = ref(null)
let observer = null

const pageOptions = [10, 15, 20]

const filteredEvents = computed(() => {
    const list = allEvents.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.value.toLowerCase())
        const matchesCategory = selectedCategory.value === 'Semua' || item.category === selectedCategory.value
        return matchesSearch && matchesCategory
    })
    return list
})

const displayedEvents = computed(() => {
    return filteredEvents.value.slice(0, displayLimit.value)
})

const hasMore = computed(() => {
    return displayLimit.value < filteredEvents.value.length
})

const loadMore = () => {
    if (hasMore.value && !loadingMore.value) {
        loadingMore.value = true
        // Simulate loading for better UX/slow connection visibility
        setTimeout(() => {
            displayLimit.value += itemsPerPage.value
            loadingMore.value = false
        }, 600)
    }
}

const handleItemsPerPageChange = (val) => {
    itemsPerPage.value = val
    displayLimit.value = val
}

// Watchers
watch([searchQuery, selectedCategory], () => {
    displayLimit.value = itemsPerPage.value
})

onMounted(() => {
    observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore.value) {
            loadMore()
        }
    }, { threshold: 0.1 })

    if (sentinel.value) {
        observer.observe(sentinel.value)
    }

    // Simulate loading
    setTimeout(() => {
        isLoading.value = false
    }, 1500)
})

onUnmounted(() => {
    if (observer) observer.disconnect()
})

const goBack = () => {
    router.push('/')
}

const selectedEvent = ref(null)

const openEventDetail = (event) => {
    selectedEvent.value = event
}

const closeEventDetail = () => {
    selectedEvent.value = null
}

const selectedMedia = ref(null)

const openMediaViewer = (media) => {
    selectedMedia.value = media
}

const closeMediaViewer = () => {
    selectedMedia.value = null
}
</script>

<template>
    <div
        class="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-primary selection:text-white transition-colors duration-300">
        <!-- Header -->
        <header
            class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-300">
            <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div class="flex items-center gap-6">
                    <button @click="goBack" class="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                        <ArrowLeftIcon class="w-6 h-6 text-slate-600" />
                    </button>
                    <div class="flex items-center gap-3">
                        <div
                            class="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                            <CalendarIcon class="w-6 h-6 text-white" />
                        </div>
                        <h1 class="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Kegiatan Sekolah
                        </h1>
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <ThemeToggle />
                    <Button variant="ghost" @click="goBack"
                        class="hidden sm:flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:bg-primary/10 transition-all">
                        <HomeIcon class="w-5 h-5" />
                        Kembali ke Beranda
                    </Button>
                </div>
            </div>
        </header>

        <!-- Header Title Section -->
        <div
            class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-12 lg:py-16 transition-colors duration-300">
            <div class="max-w-7xl mx-auto px-6 text-center lg:text-left">
                <div class="space-y-4 max-w-3xl">
                    <h2 class="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-tight">Momen
                        Berharga Kami</h2>
                    <p class="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed">
                        Kumpulan kegiatan, workshop, dan perayaan yang mewarnai perjalanan akademik dan kreativitas
                        siswa di Global Academy.
                    </p>
                </div>
            </div>
        </div>

        <div class="max-w-7xl mx-auto px-6 py-12 lg:py-20">
            <div class="flex flex-col lg:flex-row gap-12">
                <!-- Sidebar (Search & Categories) -->
                <aside class="w-full lg:w-80 shrink-0 space-y-10">
                    <div class="space-y-4">
                        <h4
                            class="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
                            <span class="w-2 h-2 bg-primary rounded-full"></span>
                            Pencarian
                        </h4>
                        <div class="relative group">
                            <MagnifyingGlassIcon
                                class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <input v-model="searchQuery" type="text" placeholder="Cari kegiatan..."
                                class="pl-12 pr-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none text-sm font-bold shadow-sm text-slate-900 dark:text-white dark:placeholder-slate-500" />
                        </div>
                    </div>

                    <div class="space-y-4">
                        <h4
                            class="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
                            <span class="w-2 h-2 bg-indigo-500 rounded-full"></span>
                            Kategori
                        </h4>
                        <div class="flex flex-col gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                            <button v-for="cat in categories" :key="cat" @click="selectedCategory = cat"
                                class="w-full px-6 py-4 rounded-xl text-sm font-bold transition-all text-left flex items-center justify-between group"
                                :class="selectedCategory === cat ? 'bg-white dark:bg-slate-700 text-primary shadow-md' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50 dark:hover:text-slate-300 dark:hover:bg-slate-700/50'">
                                {{ cat }}
                                <ArrowRightIcon v-if="selectedCategory === cat" class="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <!-- Display Settings Component -->
                    <div class="space-y-4">
                        <h4
                            class="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white flex items-center gap-2">
                            <span class="w-2 h-2 bg-primary rounded-full"></span>
                            Tampilkan
                        </h4>
                        <Select :model-value="itemsPerPage.toString()"
                            @update:model-value="(val) => handleItemsPerPageChange(Number(val))">
                            <SelectTrigger
                                class="w-full h-14 px-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-slate-200 shadow-sm hover:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all">
                                <SelectValue :placeholder="`${itemsPerPage} per halaman`" />
                            </SelectTrigger>
                            <SelectContent
                                class="rounded-2xl border-slate-100 dark:border-slate-800 shadow-2xl p-1 bg-white dark:bg-slate-900">
                                <SelectItem v-for="opt in pageOptions" :key="opt" :value="opt.toString()"
                                    class="rounded-xl py-3 pl-10 pr-4 text-sm font-bold focus:bg-primary/5 focus:text-primary transition-colors cursor-pointer capitalize text-slate-700 dark:text-slate-300">
                                    {{ opt }} per halaman
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </aside>

                <!-- Main Content -->
                <main class="flex-1">
                    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div v-for="i in 6" :key="i"
                            class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <Skeleton class="aspect-[16/10] w-full" />
                            <div class="p-8 space-y-4">
                                <Skeleton class="h-4 w-20" />
                                <Skeleton class="h-6 w-full" />
                                <Skeleton class="h-4 w-3/4" />
                            </div>
                        </div>
                    </div>

                    <transition-group v-else tag="div" enter-active-class="transition duration-500 ease-out"
                        enter-from-class="opacity-0 translate-y-8" enter-to-class="opacity-100 translate-y-0"
                        move-class="transition duration-500" class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div v-for="item in displayedEvents" :key="item.id"
                            class="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 cursor-pointer"
                            @click="openEventDetail(item)">
                            <div class="aspect-[16/10] overflow-hidden relative">
                                <img :src="item.thumbnail" :alt="item.title"
                                    class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div
                                    class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                </div>
                                <div class="absolute top-4 left-4">
                                    <Badge
                                        class="bg-white/90 backdrop-blur-md text-primary border-none font-bold uppercase text-[10px] tracking-widest px-3 py-1">
                                        {{ item.category }}</Badge>
                                </div>
                            </div>
                            <div class="p-8 space-y-4">
                                <div class="text-xs font-semibold text-primary uppercase tracking-wider">{{ item.date }}
                                </div>
                                <h3
                                    class="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                                    {{ item.title }}</h3>
                                <p class="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 leading-relaxed">{{
                                    item.description }}
                                </p>
                                <div class="pt-4 flex items-center gap-2 text-primary font-bold text-sm">
                                    Lihat Galeri
                                    <ArrowRightIcon class="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        </div>
                    </transition-group>

                    <!-- Load More & Sentinel -->
                    <div v-if="filteredEvents.length > 0" class="mt-16 space-y-8">
                        <!-- Sentinel for Infinite Scroll -->
                        <div ref="sentinel" class="h-4 w-full"></div>

                        <div v-if="hasMore" class="flex justify-center">
                            <Button @click="loadMore" variant="outline" size="lg" :disabled="loadingMore"
                                class="px-12 rounded-2xl py-8 text-lg font-black border-2 hover:bg-white hover:border-primary hover:text-primary transition-all shadow-lg hover:shadow-primary/10">
                                <template v-if="loadingMore">
                                    <div class="flex items-center gap-3">
                                        <div
                                            class="w-5 h-5 border-4 border-primary border-t-transparent rounded-full animate-spin">
                                        </div>
                                        Memuat...
                                    </div>
                                </template>
                                <template v-else>
                                    Muat Lebih Banyak
                                </template>
                            </Button>
                        </div>
                        <div v-else-if="filteredEvents.length > itemsPerPage" class="text-center">
                            <div
                                class="inline-flex items-center gap-3 px-6 py-3 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 dark:text-slate-500 text-sm font-bold">
                                <CheckBadgeIcon class="w-5 h-5 text-emerald-500" />
                                Semua kegiatan telah ditampilkan
                            </div>
                        </div>
                    </div>

                    <!-- Empty State -->
                    <div v-if="filteredEvents.length === 0" class="py-24 text-center space-y-8">
                        <div
                            class="w-24 h-24 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl flex items-center justify-center mx-auto border border-slate-100 dark:border-slate-800">
                            <MagnifyingGlassIcon class="w-10 h-10 text-slate-200 dark:text-slate-700" />
                        </div>
                        <div class="space-y-3">
                            <h3 class="text-2xl font-black text-slate-900 dark:text-white">Tidak ada kegiatan ditemukan
                            </h3>
                            <p class="text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium leading-relaxed">
                                Coba sesuaikan kata
                                kunci pencarian atau filter kategori Anda.</p>
                        </div>
                        <Button @click="searchQuery = ''; selectedCategory = 'Semua'" variant="outline"
                            class="px-8 rounded-xl font-bold border-2 dark:border-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800">
                            Reset Pencarian
                        </Button>
                    </div>
                </main>
            </div>
        </div>

        <!-- Event Detail Modal -->
        <transition enter-active-class="transition duration-500 ease-out"
            enter-from-class="opacity-0 scale-95 translate-y-8" enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition duration-300 ease-in" leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 translate-y-8">
            <div v-if="selectedEvent"
                class="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8 backdrop-blur-xl bg-slate-900/40"
                @click.self="closeEventDetail">
                <div
                    class="bg-white rounded-[3rem] overflow-hidden max-w-6xl w-full max-h-[90vh] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.3)] relative flex flex-col transition-all duration-500 bg-white">
                    <!-- Close Button -->
                    <button
                        class="absolute top-8 right-8 z-50 p-3 bg-white/10 hover:bg-primary hover:text-white backdrop-blur-md rounded-2xl text-slate-900 transition-all duration-300 shadow-xl group"
                        @click="closeEventDetail">
                        <XMarkIcon class="w-6 h-6 transition-transform group-hover:rotate-90" />
                    </button>

                    <div class="flex flex-col lg:flex-row h-full overflow-hidden">
                        <!-- Gallery Panel -->
                        <div class="w-full lg:w-7/12 bg-slate-900 flex flex-col relative overflow-hidden">
                            <div class="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div v-for="(media, index) in selectedEvent.gallery" :key="index"
                                        class="relative group/media rounded-2xl overflow-hidden aspect-video bg-slate-800 border border-white/5 cursor-zoom-in"
                                        @click="openMediaViewer(media)">
                                        <template v-if="media.type === 'image'">
                                            <img :src="media.url" :alt="media.alt"
                                                class="w-full h-full object-cover transition-transform duration-700 group-hover/media:scale-110" />
                                        </template>
                                        <template v-else-if="media.type === 'video'">
                                            <video :src="media.url" class="w-full h-full object-cover" muted loop
                                                onmouseover="this.play()" onmouseout="this.pause()"></video>
                                            <div
                                                class="absolute inset-0 flex items-center justify-center bg-black/20 group-hover/media:bg-black/40 transition-colors">
                                                <div
                                                    class="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white ring-4 ring-white/10 group-hover/media:scale-110 transition-transform">
                                                    <PlayIcon class="w-6 h-6 fill-current" />
                                                </div>
                                            </div>
                                        </template>
                                        <div
                                            class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/media:opacity-100 transition-opacity p-4 flex items-end">
                                            <span class="text-white text-xs font-medium">{{ media.alt }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Content Panel -->
                        <div
                            class="p-8 md:p-12 lg:p-16 space-y-8 flex-1 overflow-y-auto bg-white dark:bg-slate-900 custom-scrollbar">
                            <div class="space-y-6">
                                <div
                                    class="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">
                                    <CalendarIcon class="w-4 h-4" />
                                    {{ selectedEvent.date }}
                                </div>
                                <h2
                                    class="text-3xl md:text-5xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
                                    {{ selectedEvent.title }}
                                </h2>
                                <Badge variant="secondary"
                                    class="bg-primary/10 text-primary border-none px-4 py-1.5 font-bold uppercase text-[10px] tracking-widest hover:bg-primary hover:text-white transition-colors">
                                    {{ selectedEvent.category }}
                                </Badge>
                            </div>

                            <div class="space-y-8">
                                <div class="space-y-4">
                                    <h4
                                        class="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs flex items-center gap-2">
                                        <span class="w-8 h-px bg-primary"></span>
                                        Deskripsi Kegiatan
                                    </h4>
                                    <p class="text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                        {{ selectedEvent.description }}
                                    </p>
                                </div>

                                <div class="pt-8 border-t border-slate-100 dark:border-slate-800">
                                    <h4
                                        class="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs mb-6">
                                        Info
                                        Tambahan</h4>
                                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div
                                            class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                                            <div
                                                class="w-10 h-10 bg-white dark:bg-slate-700/50 rounded-xl flex items-center justify-center shadow-sm">
                                                <MapPinIcon class="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p
                                                    class="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                                                    Lokasi</p>
                                                <p class="text-sm font-bold text-slate-700 dark:text-slate-200">Area
                                                    Kampus
                                                    Utama</p>
                                            </div>
                                        </div>
                                        <div
                                            class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                                            <div
                                                class="w-10 h-10 bg-white dark:bg-slate-700/50 rounded-xl flex items-center justify-center shadow-sm">
                                                <SparklesIcon class="w-5 h-5 text-indigo-500" />
                                            </div>
                                            <div>
                                                <p
                                                    class="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                                                    Penyelenggara</p>
                                                <p class="text-sm font-bold text-slate-700 dark:text-slate-200">Osis &
                                                    Humas
                                                    Sekolah</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="pt-10">
                                <Button @click="closeEventDetail" variant="outline" size="lg"
                                    class="px-12 rounded-2xl py-8 text-lg font-black border-2 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-white w-full">
                                    Tutup
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </transition>

        <!-- Media Viewer Modal (Global Lightbox) -->
        <transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0"
            enter-to-class="opacity-100" leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="selectedMedia"
                class="fixed inset-0 z-[300] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 md:p-10"
                @click.self="closeMediaViewer">

                <!-- Close Button -->
                <button @click="closeMediaViewer"
                    class="absolute top-6 right-6 z-[310] p-4 text-white hover:bg-white/10 rounded-full transition-all group">
                    <XMarkIcon class="w-8 h-8 transition-transform group-hover:rotate-90" />
                </button>

                <!-- Media Content -->
                <div
                    class="relative max-w-7xl w-full h-full flex items-center justify-center animate-in fade-in zoom-in duration-300">
                    <template v-if="selectedMedia.type === 'image'">
                        <img :src="selectedMedia.url" :alt="selectedMedia.alt"
                            class="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
                    </template>
                    <template v-else-if="selectedMedia.type === 'video'">
                        <div
                            class="relative w-full aspect-video max-w-5xl rounded-3xl overflow-hidden shadow-2xl bg-black">
                            <video :src="selectedMedia.url" controls autoplay class="w-full h-full"></video>
                        </div>
                    </template>

                    <!-- Media Info (Overlay bottom) -->
                    <div
                        class="absolute bottom-0 left-0 right-0 p-10 bg-gradient-to-t from-black/80 to-transparent pointer-events-none text-left">
                        <Badge
                            class="bg-primary text-white border-none mb-4 uppercase tracking-[0.2em] font-black text-[10px] px-4 py-1.5">
                            {{ selectedMedia.type === 'image' ? 'Foto' : 'Video' }}
                        </Badge>
                        <h4 class="text-2xl font-bold text-white">{{ selectedMedia.alt }}</h4>
                    </div>
                </div>
            </div>
        </transition>

        <!-- Footer -->
        <footer
            class="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12 transition-colors duration-300">
            <div class="max-w-7xl mx-auto px-6 text-center">
                <p class="text-slate-400 text-sm font-medium">&copy; 2026 Global Academy. Empowering Minds Since 1998.
                </p>
            </div>
        </footer>
    </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #cbd5e1;
}
</style>
