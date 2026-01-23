<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
    MagnifyingGlassIcon,
    ArrowLeftIcon,
    HomeIcon,
    ArrowRightIcon,
    ChevronDownIcon,
    TrophyIcon,
    MapPinIcon,
    AcademicCapIcon,
    StarIcon,
    ArrowTopRightOnSquareIcon,
    XMarkIcon,
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
import { achievements as allAchievements } from '@/data_dummy/achievements'
import ThemeToggle from '@/components/common/ThemeToggle.vue'

const isLoading = ref(true)
const router = useRouter()
const searchQuery = ref('')
const selectedCategory = ref('Semua')

const categories = ['Semua', 'Akademik', 'Teknologi', 'Olahraga', 'Lingkungan', 'Fasilitas']

// Pagination & Infinite Scroll State
const itemsPerPage = ref(10)
const displayLimit = ref(10)
const loadingMore = ref(false)
const sentinel = ref(null)
let observer = null

const pageOptions = [10, 15, 20]

const filteredAchievements = computed(() => {
    const list = allAchievements.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            item.achievement.toLowerCase().includes(searchQuery.value.toLowerCase())
        const matchesCategory = selectedCategory.value === 'Semua' || item.category === selectedCategory.value
        return matchesSearch && matchesCategory
    })
    return list
})

const displayedAchievements = computed(() => {
    return filteredAchievements.value.slice(0, displayLimit.value)
})

const hasMore = computed(() => {
    return displayLimit.value < filteredAchievements.value.length
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

const selectedAchievement = ref(null)

const openAchievementDetail = (achievement) => {
    selectedAchievement.value = achievement
}

const closeAchievementDetail = () => {
    selectedAchievement.value = null
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
                            class="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <TrophyIcon class="w-6 h-6 text-white" />
                        </div>
                        <h1 class="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Prestasi &
                            Penghargaan</h1>
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

        <!-- Header Title Section (Stays at Top) -->
        <div
            class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-12 lg:py-16 transition-colors duration-300">
            <div class="max-w-7xl mx-auto px-6 text-center lg:text-left">
                <div class="space-y-4 max-w-3xl">
                    <h2 class="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-tight">Galeri
                        Keunggulan</h2>
                    <p class="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed">
                        Rekam jejak dedikasi, inovasi, dan prestasi luar biasa civitas akademika Global Academy dalam
                        mewujudkan visi pendidikan masa depan.
                    </p>
                </div>
            </div>
        </div>

        <div class="max-w-7xl mx-auto px-6 py-12 lg:py-20">
            <div class="flex flex-col lg:flex-row gap-12">
                <!-- Sidebar (Search & Categories) -->
                <aside class="w-full lg:w-80 shrink-0 space-y-10">
                    <!-- Search Component -->
                    <div class="space-y-4">
                        <h4
                            class="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
                            <span class="w-2 h-2 bg-primary rounded-full"></span>
                            Pencarian
                        </h4>
                        <div class="relative group">
                            <MagnifyingGlassIcon
                                class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <input v-model="searchQuery" type="text" placeholder="Cari prestasi..."
                                class="pl-12 pr-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none text-sm font-bold shadow-sm text-slate-900 dark:text-white dark:placeholder-slate-500" />
                        </div>
                    </div>

                    <!-- Categories Component -->
                    <div class="space-y-4">
                        <h4
                            class="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
                            <span class="w-2 h-2 bg-amber-500 rounded-full"></span>
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
                            <span class="w-2 h-2 bg-indigo-500 rounded-full"></span>
                            Tampilkan
                        </h4>
                        <Select :model-value="itemsPerPage.toString()"
                            @update:model-value="(val) => handleItemsPerPageChange(Number(val))">
                            <SelectTrigger
                                class="w-full h-14 px-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-white shadow-sm hover:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all">
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

                <!-- Main Content (Achievements Grid) -->
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
                        <div v-for="item in displayedAchievements" :key="item.id"
                            class="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 cursor-pointer"
                            @click="openAchievementDetail(item)">
                            <div class="aspect-[16/10] overflow-hidden relative">
                                <img :src="item.thumbnail" :alt="item.title"
                                    class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div
                                    class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                </div>
                                <div class="absolute top-4 left-4">
                                    <Badge
                                        class="bg-white/90 backdrop-blur-md text-primary border-none font-bold uppercase text-[10px] tracking-widest px-3 py-1 hover:text-white transition-colors">
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
                                    Selengkapnya
                                    <ArrowRightIcon class="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        </div>
                    </transition-group>

                    <!-- Load More & Sentinel -->
                    <div v-if="filteredAchievements.length > 0" class="mt-16 space-y-8">
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
                        <div v-else-if="filteredAchievements.length > itemsPerPage" class="text-center">
                            <div
                                class="inline-flex items-center gap-3 px-6 py-3 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 dark:text-slate-500 text-sm font-bold">
                                <CheckBadgeIcon class="w-5 h-5 text-emerald-500" />
                                Semua prestasi telah ditampilkan
                            </div>
                        </div>
                    </div>

                    <!-- Empty State -->
                    <div v-if="filteredAchievements.length === 0" class="py-24 text-center space-y-8">
                        <div
                            class="w-24 h-24 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl flex items-center justify-center mx-auto border border-slate-100 dark:border-slate-800">
                            <MagnifyingGlassIcon class="w-10 h-10 text-slate-200 dark:text-slate-700" />
                        </div>
                        <div class="space-y-3">
                            <h3 class="text-2xl font-black text-slate-900 dark:text-white">Tidak ada prestasi ditemukan
                            </h3>
                            <p class="text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium leading-relaxed">
                                Coba sesuaikan kata
                                kunci pencarian atau
                                filter kategori Anda.</p>
                        </div>
                        <Button @click="searchQuery = ''; selectedCategory = 'Semua'" variant="outline"
                            class="px-8 rounded-xl font-bold border-2 dark:border-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800">
                            Reset Pencarian
                        </Button>
                    </div>
                </main>
            </div>
        </div>

        <!-- Achievement Detail Modal (Same as Landing Page) -->
        <transition enter-active-class="transition duration-500 ease-out"
            enter-from-class="opacity-0 scale-95 translate-y-8" enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition duration-300 ease-in" leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 translate-y-8">
            <div v-if="selectedAchievement"
                class="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8 backdrop-blur-xl bg-slate-900/40"
                @click.self="closeAchievementDetail">
                <div
                    class="bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden max-w-6xl w-full max-h-[90vh] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.3)] relative flex flex-col lg:flex-row transition-all duration-500">
                    <!-- Close Button -->
                    <button
                        class="absolute top-8 right-8 z-30 p-3 bg-white/10 hover:bg-primary hover:text-white backdrop-blur-md rounded-2xl text-slate-900 transition-all duration-300 shadow-xl group"
                        @click="closeAchievementDetail">
                        <XMarkIcon class="w-6 h-6 transition-transform group-hover:rotate-90" />
                    </button>

                    <!-- Image Panel -->
                    <div class="w-full lg:w-5/12 h-[350px] lg:h-auto shrink-0 relative overflow-hidden group/img cursor-zoom-in"
                        @click="openMediaViewer({ type: 'image', url: selectedAchievement.image, alt: selectedAchievement.title })">
                        <img :src="selectedAchievement.image" :alt="selectedAchievement.title"
                            class="w-full h-full object-cover transition-transform duration-1000 group-hover/img:scale-110" />
                        <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent">
                        </div>
                        <div class="absolute bottom-10 left-10 right-10">
                            <Badge
                                class="bg-primary/90 backdrop-blur-md text-white border-none px-6 py-2.5 text-xs font-black uppercase tracking-[0.2em] mb-4">
                                {{ selectedAchievement.category }}
                            </Badge>
                            <h3 class="text-white text-2xl font-bold leading-tight">{{ selectedAchievement.achievement
                                }}</h3>
                        </div>
                    </div>

                    <!-- Content Panel -->
                    <div
                        class="p-8 md:p-12 lg:p-16 space-y-12 flex-1 overflow-y-auto bg-white dark:bg-slate-900 custom-scrollbar">
                        <div class="space-y-6">
                            <div
                                class="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">
                                <TrophyIcon class="w-4 h-4" />
                                {{ selectedAchievement.date }}
                            </div>
                            <h2
                                class="text-3xl md:text-5xl font-black leading-[1.1] tracking-tight text-slate-900 dark:text-white">
                                {{ selectedAchievement.title }}
                            </h2>
                            <div class="flex items-center gap-3 text-primary">
                                <TrophyIcon class="w-6 h-6" />
                                <span class="font-bold text-2xl tracking-tight">{{ selectedAchievement.achievement
                                }}</span>
                            </div>
                        </div>

                        <div class="space-y-12">
                            <!-- Story -->
                            <div class="space-y-6">
                                <h4
                                    class="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs flex items-center gap-2">
                                    <span class="w-8 h-px bg-primary"></span>
                                    Cerita Dibalik Layar
                                </h4>
                                <p class="text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                    {{ selectedAchievement.description }}
                                </p>
                            </div>

                            <!-- Participants & Mentors -->
                            <div class="space-y-10 pt-8 border-t border-slate-50 dark:border-slate-800"
                                v-if="selectedAchievement.students || selectedAchievement.mentors">
                                <div v-if="selectedAchievement.students" class="space-y-4">
                                    <h4
                                        class="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs">
                                        Peserta
                                        Terbaik</h4>
                                    <div class="flex flex-wrap gap-2">
                                        <span v-for="student in selectedAchievement.students" :key="student"
                                            class="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 text-sm font-bold border border-slate-100 dark:border-slate-700">
                                            {{ student }}
                                        </span>
                                    </div>
                                </div>
                                <div v-if="selectedAchievement.mentors" class="space-y-4">
                                    <h4
                                        class="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs">
                                        Guru
                                        Pembina
                                    </h4>
                                    <div class="flex flex-wrap gap-2">
                                        <span v-for="mentor in selectedAchievement.mentors" :key="mentor"
                                            class="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-xl text-indigo-700 dark:text-indigo-300 text-sm font-bold">
                                            {{ mentor }}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <!-- Competition Tags -->
                            <div class="flex flex-wrap gap-3 pt-8 border-t border-slate-50 dark:border-slate-800">
                                <div
                                    class="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-bold flex items-center gap-2 border border-blue-100/50 dark:border-blue-800">
                                    <AcademicCapIcon class="w-3.5 h-3.5" />
                                    <span>Penyelenggara: {{ selectedAchievement.organizer }}</span>
                                </div>
                                <div
                                    class="px-4 py-2 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-xl text-xs font-bold flex items-center gap-2 border border-amber-100/50 dark:border-amber-800">
                                    <MapPinIcon class="w-3.5 h-3.5" />
                                    <span>Lokasi: {{ selectedAchievement.location }}</span>
                                </div>
                                <div
                                    class="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2 border border-emerald-100/50 dark:border-emerald-800">
                                    <TrophyIcon class="w-3.5 h-3.5" />
                                    <span>Tingkat: {{ selectedAchievement.level }}</span>
                                </div>
                                <div v-if="selectedAchievement.branch"
                                    class="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold flex items-center gap-2 border border-indigo-100/50 dark:border-indigo-800">
                                    <StarIcon class="w-3.5 h-3.5" />
                                    <span>Bidang: {{ selectedAchievement.branch }}</span>
                                </div>
                            </div>

                            <!-- Related Links -->
                            <div v-if="selectedAchievement.links && selectedAchievement.links.length > 0"
                                class="space-y-6 pt-8 border-t border-slate-50 dark:border-slate-800">
                                <h4
                                    class="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs flex items-center gap-2">
                                    <span class="w-8 h-px bg-primary"></span>
                                    Tautan & Berita Terkait
                                </h4>
                                <div class="flex flex-wrap gap-4">
                                    <a v-for="link in selectedAchievement.links" :key="link.label" :href="link.url"
                                        target="_blank"
                                        class="inline-flex items-center gap-3 px-6 py-4 bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-700 dark:text-slate-200 text-sm font-bold transition-all hover:border-primary hover:text-primary hover:shadow-lg hover:shadow-primary/10 group/link">
                                        {{ link.label }}
                                        <ArrowTopRightOnSquareIcon
                                            class="w-4 h-4 text-slate-400 group-hover/link:text-primary transition-colors" />
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div
                            class="pt-10 flex flex-col sm:flex-row gap-4 border-t border-slate-100 dark:border-slate-800">
                            <Button @click="closeAchievementDetail" variant="outline" size="lg"
                                class="px-12 rounded-2xl py-8 text-lg font-black border-2 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-white w-full sm:w-auto">
                                Tutup
                            </Button>
                        </div>
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
                        class="absolute bottom-0 left-0 right-0 p-10 bg-gradient-to-t from-black/80 to-transparent pointer-events-none text-left font-sans">
                        <Badge
                            class="bg-primary text-white border-none mb-4 uppercase tracking-[0.2em] font-black text-[10px] px-4 py-1.5">
                            {{ selectedMedia.type === 'image' ? 'Foto' : 'Video' }}
                        </Badge>
                        <h4 class="text-2xl font-bold text-white">{{ selectedMedia.alt }}</h4>
                    </div>
                </div>
            </div>
        </transition>
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

.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #cbd5e1;
}
</style>
