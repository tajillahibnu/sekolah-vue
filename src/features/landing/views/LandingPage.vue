<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
    AcademicCapIcon,
    UserGroupIcon,
    TrophyIcon,
    StarIcon,
    ArrowRightIcon,
    Bars3Icon,
    XMarkIcon,
    MapPinIcon,
    PhoneIcon,
    EnvelopeIcon,
    ArrowTopRightOnSquareIcon,
    LightBulbIcon,
    RocketLaunchIcon,
    GlobeAsiaAustraliaIcon,
    CheckBadgeIcon,
    SparklesIcon,
    MagnifyingGlassIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    PlayIcon,
    GlobeAltIcon
} from '@heroicons/vue/24/outline'
import { PlayIcon as PlaySolidIcon } from '@heroicons/vue/24/solid'
import Button from '@/components/ui/button/Button.vue'
import Badge from '@/components/ui/badge/Badge.vue'
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import Skeleton from '@/components/ui/skeleton/Skeleton.vue'
import ThemeToggle from '@/components/common/ThemeToggle.vue'

const router = useRouter()
const isMenuOpen = ref(false)
const scrolled = ref(false)
const isLoading = ref(true)

const handleScroll = () => {
    scrolled.value = window.scrollY > 50
}

onMounted(() => {
    window.addEventListener('scroll', handleScroll)
    // Simulate loading
    setTimeout(() => {
        isLoading.value = false
    }, 1500)
})

const stats = [
    { label: 'Siswa Aktif', value: '1,200+', icon: UserGroupIcon },
    { label: 'Tenaga Pengajar', value: '80+', icon: AcademicCapIcon },
    { label: 'Prestasi Nasional', value: '150+', icon: TrophyIcon },
    { label: 'Akreditasi', value: 'A+', icon: StarIcon },
]

const programs = [
    {
        title: 'Kurikulum Merdeka',
        description: 'Menerapkan metode pembelajaran yang fleksibel dan berfokus pada potensi siswa.',
        icon: AcademicCapIcon,
        color: 'bg-blue-500'
    },
    {
        title: 'Program Bilingual',
        description: 'Pengantar bahasa Inggris untuk mata pelajaran sains dan matematika.',
        icon: UserGroupIcon,
        color: 'bg-indigo-500'
    },
    {
        title: 'Ekstrakurikuler Unggulan',
        description: 'Lebih dari 20 klub bakat dan minat mulai dari robotik hingga seni tradisional.',
        icon: StarIcon,
        color: 'bg-amber-500'
    }
]

import { achievements as allAchievements } from '@/data_dummy/achievements'
const achievements = allAchievements.slice(0, 3)

import { events as allEvents } from '@/data_dummy/events'
const events = allEvents.slice(0, 3)

const selectedAchievement = ref(null)
const selectedEvent = ref(null)

const openAchievementDetail = (achievement) => {
    selectedAchievement.value = achievement
}

const openEventDetail = (event) => {
    selectedEvent.value = event
}

const closeAchievementDetail = () => {
    selectedAchievement.value = null
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

const navigateToLogin = () => {
    router.push('/login')
}

const scrollToSection = (id) => {
    isMenuOpen.value = false
    const element = document.getElementById(id)
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
    }
}

const missionItems = [
    {
        title: 'Akademik Unggul',
        description: 'Menyelenggarakan pendidikan berkualitas tinggi berbasis teknologi dan inovasi.',
        icon: RocketLaunchIcon,
        color: 'text-blue-600',
        bg: 'bg-blue-50'
    },
    {
        title: 'Karakter Mulia',
        description: 'Membentuk integritas, etika, dan nilai-nilai moral yang kokoh pada setiap siswa.',
        icon: CheckBadgeIcon,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50'
    },
    {
        title: 'Wawasan Global',
        description: 'Mempersiapkan siswa menjadi warga dunia yang kompetitif dan adaptif.',
        icon: GlobeAsiaAustraliaIcon,
        color: 'text-indigo-600',
        bg: 'bg-indigo-50'
    },
    {
        title: 'Inovasi Berkelanjutan',
        description: 'Mendorong kreativitas dan budaya riset untuk solusi masa depan.',
        icon: SparklesIcon,
        color: 'text-amber-600',
        bg: 'bg-amber-50'
    }
]

const staffData = [
    { id: 1, name: 'Dr. Budi Santoso, M.Pd', position: 'Kepala Sekolah', type: 'Guru', gender: 'Laki-laki', photo: null, website: 'https://budisantoso.com', socials: { instagram: '@budi.santoso', facebook: 'Budi Santoso' } },
    { id: 2, name: 'Siti Aminah, S.Pd', position: 'Waka Kurikulum', type: 'Guru', gender: 'Perempuan', photo: null, website: null, socials: { instagram: '@siti.aminah', tiktok: '@sitiaminah_edu' } },
    { id: 3, name: 'Ahmad Rizki, S.Kom', position: 'Waka Kesiswaan', type: 'Guru', gender: 'Laki-laki', photo: null, website: 'https://rizki.dev', socials: { twitter: '@ahmad_rizki' } },
    { id: 4, name: 'Ratna Dewi, S.Pd', position: 'Walikelas X-A', type: 'Guru', gender: 'Perempuan', photo: null, website: null, socials: { instagram: '@ratnadewi_spd' } },
    { id: 5, name: 'Joko Susilo', position: 'Staff Tata Usaha', type: 'Pegawai', gender: 'Laki-laki', photo: null, website: null, socials: null },
    { id: 6, name: 'Hendra Wijaya, M.Sc', position: 'Guru Fisika', type: 'Guru', gender: 'Laki-laki', photo: null, website: 'https://hendrawijaya.sc', socials: { instagram: '@hendra_physics', facebook: 'Hendra Wijaya' } },
]

const navigateToAchievements = () => {
    router.push('/achievements')
}

const navigateToEvents = () => {
    router.push('/events')
}

const sliderRef = ref(null)
const scrollLeft = () => {
    if (sliderRef.value) {
        sliderRef.value.scrollBy({ left: -300, behavior: 'smooth' })
    }
}
const scrollRight = () => {
    if (sliderRef.value) {
        sliderRef.value.scrollBy({ left: 300, behavior: 'smooth' })
    }
}

const navigateToTeachers = () => {
    router.push('/teachers')
}

import { computed, watch } from 'vue'

watch(isMenuOpen, (val) => {
    if (val) {
        document.body.style.overflow = 'hidden'
    } else {
        document.body.style.overflow = ''
    }
})
const searchQuery = ref('')
const selectedStaffType = ref('Semua')

const staffCategories = ['Semua', 'Guru', 'Pegawai']

// Section visibility controls from environment variables
const showHero = computed(() => import.meta.env.VITE_SHOW_HERO !== 'false')
const showVisionMission = computed(() => import.meta.env.VITE_SHOW_VISION_MISSION !== 'false')
const showStats = computed(() => import.meta.env.VITE_SHOW_STATS !== 'false')
const showPrograms = computed(() => import.meta.env.VITE_SHOW_PROGRAMS !== 'false')
const showStaff = computed(() => import.meta.env.VITE_SHOW_STAFF !== 'false')
const showEvents = computed(() => import.meta.env.VITE_SHOW_EVENTS !== 'false')
const showAchievements = computed(() => import.meta.env.VITE_SHOW_ACHIEVEMENTS !== 'false')
const showCTA = computed(() => import.meta.env.VITE_SHOW_CTA !== 'false')
const showFooter = computed(() => import.meta.env.VITE_SHOW_FOOTER !== 'false')

const filteredStaff = computed(() => {
    return staffData.filter(staff => {
        const matchesSearch = staff.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            staff.position.toLowerCase().includes(searchQuery.value.toLowerCase())
        const matchesType = selectedStaffType.value === 'Semua' || staff.type === selectedStaffType.value
        return matchesSearch && matchesType
    })
})
</script>

<template>
    <div
        class="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-sans selection:bg-primary selection:text-white">
        <!-- Navigation -->
        <nav class="fixed top-0 left-0 right-0 z-[100] transition-all duration-300 px-6 py-4"
            :class="scrolled ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-800 py-3' : 'bg-transparent'">
            <div class="max-w-7xl mx-auto flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <div
                        class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                        <AcademicCapIcon class="w-6 h-6 text-white" />
                    </div>
                    <span
                        class="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
                        Global Academy
                    </span>
                </div>

                <!-- Desktop Menu -->
                <div class="hidden md:flex items-center gap-8">
                    <a href="#beranda" @click.prevent="scrollToSection('beranda')"
                        class="text-sm font-medium hover:text-primary transition-colors">Beranda</a>
                    <a href="#visi-misi" @click.prevent="scrollToSection('visi-misi')"
                        class="text-sm font-medium hover:text-primary transition-colors">Visi Misi</a>
                    <a href="#program" @click.prevent="scrollToSection('program')"
                        class="text-sm font-medium hover:text-primary transition-colors">Program</a>
                    <a href="#staff" @click.prevent="scrollToSection('staff')"
                        class="text-sm font-medium hover:text-primary transition-colors">Guru & Staf</a>
                    <a href="#kegiatan" @click.prevent="scrollToSection('kegiatan')"
                        class="text-sm font-medium hover:text-primary transition-colors">Kegiatan</a>
                    <a href="#prestasi" @click.prevent="scrollToSection('prestasi')"
                        class="text-sm font-medium hover:text-primary transition-colors">Prestasi</a>
                    <a href="#kontak" @click.prevent="scrollToSection('kontak')"
                        class="text-sm font-medium hover:text-primary transition-colors dark:text-slate-200 dark:hover:text-primary">Kontak</a>
                    <Button variant="default" @click="navigateToLogin"
                        class="px-6 rounded-full shadow-lg shadow-primary/20">
                        Portal Login
                    </Button>
                </div>

                <!-- Mobile Menu Toggle -->
                <div class="flex items-center gap-4 md:hidden">
                    <ThemeToggle />
                    <button class="p-2" @click="isMenuOpen = !isMenuOpen">
                        <component :is="isMenuOpen ? XMarkIcon : Bars3Icon" class="w-6 h-6 dark:text-white" />
                    </button>
                </div>
            </div>
        </nav>

        <!-- Mobile Menu Overlay (Backdrop) -->
        <transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0"
            enter-to-class="opacity-100" leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="isMenuOpen" class="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-sm md:hidden"
                @click="isMenuOpen = false"></div>
        </transition>

        <!-- Mobile Menu Panel (Slide from Right) -->
        <transition enter-active-class="transition duration-500 cubic-bezier(0.4, 0, 0.2, 1)"
            enter-from-class="translate-x-full" enter-to-class="translate-x-0"
            leave-active-class="transition duration-400 cubic-bezier(0.4, 0, 0.2, 1)" leave-from-class="translate-x-0"
            leave-to-class="translate-x-full">
            <div v-if="isMenuOpen"
                class="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm z-[160] bg-white dark:bg-slate-900 shadow-2xl md:hidden overflow-y-auto">
                <div class="flex flex-col p-10 space-y-10">
                    <!-- Menu Header -->
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <AcademicCapIcon class="w-5 h-5 text-white" />
                            </div>
                            <span class="font-bold text-slate-900">GA</span>
                        </div>
                        <button @click="isMenuOpen = false"
                            class="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-primary hover:text-white transition-all">
                            <XMarkIcon class="w-6 h-6" />
                        </button>
                    </div>

                    <!-- Navigation Links -->
                    <div class="flex flex-col gap-4">
                        <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Navigasi
                        </h4>
                        <a v-for="link in [
                            { id: 'beranda', label: 'Beranda' },
                            { id: 'visi-misi', label: 'Visi Misi' },
                            { id: 'program', label: 'Program' },
                            { id: 'staff', label: 'Guru & Staf' },
                            { id: 'kegiatan', label: 'Kegiatan' },
                            { id: 'prestasi', label: 'Prestasi' },
                            { id: 'kontak', label: 'Kontak' }
                        ]" :key="link.id" :href="`#${link.id}`"
                            class="group flex items-center justify-between py-2 text-xl font-bold text-slate-700 dark:text-slate-200 hover:text-primary transition-colors"
                            @click="scrollToSection(link.id)">
                            @click="scrollToSection(link.id)">
                            {{ link.label }}
                            <ArrowRightIcon
                                class="w-5 h-5 opacity-0 -translate-x-4 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                        </a>
                    </div>

                    <!-- CTA -->
                    <div class="pt-6 border-t border-slate-100 dark:border-slate-800 italic">
                        <Button variant="default" size="lg" @click="navigateToLogin"
                            class="w-full rounded-2xl py-8 text-lg font-black shadow-xl shadow-primary/20">
                            Portal Login
                        </Button>
                    </div>

                    <!-- School Info -->
                    <div class="mt-auto pt-10 text-slate-400">
                        <p class="text-[10px] font-bold uppercase tracking-widest mb-4">Hubungi Kami</p>
                        <div class="space-y-3">
                            <div class="flex items-center gap-3 text-sm font-medium">
                                <PhoneIcon class="w-4 h-4" />
                                +62 21 1234 5678
                            </div>
                            <div class="flex items-center gap-3 text-sm font-medium">
                                <EnvelopeIcon class="w-4 h-4" />
                                info@globalacademy.sch.id
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </transition>

        <!-- Hero Section -->
        <section v-if="showHero" id="beranda"
            class="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden scroll-mt-24">
            <div
                class="absolute top-0 right-0 w-1/2 h-full bg-slate-50 dark:bg-slate-800/20 -skew-x-12 translate-x-1/4 -z-10">
            </div>
            <div class="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                <div class="space-y-8 max-w-xl">
                    <Badge variant="secondary"
                        class="px-4 py-1.5 rounded-full text-primary bg-primary/10 border-none font-semibold hover:bg-primary hover:text-white transition-colors">
                        Penerimaan Siswa Baru TA 2024/2025
                    </Badge>
                    <h1
                        class="text-5xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight text-slate-900 dark:text-white">
                        Membangun Masa Depan <span class="text-primary italic">Cerdas</span> & Berakhlak
                    </h1>
                    <p class="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                        Global Academy berkomitmen memberikan pendidikan berkualitas tinggi dengan pendekatan inovatif
                        untuk mencetak generasi pemimpin masa depan.
                    </p>
                    <div class="flex flex-col sm:flex-row gap-4 pt-4">
                        <Button size="lg" class="px-8 py-7 text-lg rounded-full shadow-xl shadow-primary/30 group">
                            Daftar Sekarang
                            <ArrowRightIcon class="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                        </Button>
                        <Button variant="outline" size="lg"
                            class="px-8 py-7 text-lg rounded-full border-2 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-white">
                            Lihat Profil Sekolah
                        </Button>
                    </div>
                </div>
                <div class="relative">
                    <div class="absolute -inset-4 bg-primary/10 blur-3xl rounded-full -z-10 animate-pulse"></div>
                    <div class="rounded-3xl overflow-hidden shadow-2xl shadow-indigo-200/50 aspect-[4/3] rotate-1">
                        <img src="@/assets/images/hero.png" alt="Global Academy Campus"
                            class="w-full h-full object-cover" />
                    </div>
                    <!-- Floating Card -->
                    <div
                        class="absolute -bottom-6 -left-6 bg-white dark:bg-slate-800 dark:border dark:border-slate-700 p-6 rounded-2xl shadow-xl flex items-center gap-4 animate-bounce-slow">
                        <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <StarIcon class="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p class="text-sm font-bold dark:text-white">Sekolah Unggulan</p>
                            <p class="text-xs text-slate-500 dark:text-slate-400 text-nowrap">Akreditasi A+ 2024</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Vision & Mission Section -->
        <section v-if="showVisionMission" id="visi-misi"
            class="py-24 relative overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 scroll-mt-24">
            <div class="max-w-7xl mx-auto px-6">
                <!-- Vision -->
                <div
                    class="bg-white dark:bg-slate-800 rounded-[3rem] p-12 lg:p-20 relative overflow-hidden mb-20 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700">
                    <div class="absolute -top-12 -right-12 w-64 h-64 bg-primary/10 blur-[100px] rounded-full"></div>
                    <div class="relative z-10 flex flex-col lg:flex-row gap-12 items-center">
                        <div
                            class="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center shrink-0 shadow-2xl shadow-primary/40 rotate-3">
                            <LightBulbIcon class="w-12 h-12 text-white" />
                        </div>
                        <div class="space-y-6">
                            <Badge variant="outline" class="text-primary border-primary font-bold">Visi Kami</Badge>
                            <h2 class="text-3xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">
                                "Menjadi institusi pendidikan <span class="text-primary italic">terdepan</span> yang
                                mencetak generasi inovatif berkarakter global dengan landasan etika yang kokoh."
                            </h2>
                        </div>
                    </div>
                </div>

                <!-- Mission -->
                <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div v-for="(item, index) in missionItems" :key="index"
                        class="group p-8 rounded-[2.5rem] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500">
                        <div
                            :class="[item.bg, item.color, 'w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110 group-hover:-rotate-6 shadow-sm']">
                            <component :is="item.icon" class="w-7 h-7" />
                        </div>
                        <h4
                            class="text-xl font-bold mb-4 text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                            {{
                                item.title }}</h4>
                        <p class="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                            {{ item.description }}
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Stats Section -->
        <section v-if="showStats" class="bg-slate-900 py-20 text-white relative overflow-hidden">
            <div class="absolute -top-24 -left-24 w-64 h-64 bg-primary/20 blur-[100px] rounded-full"></div>
            <div class="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full"></div>
            <div class="max-w-7xl mx-auto px-6">
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    <div v-for="stat in stats" :key="stat.label" class="text-center space-y-4">
                        <div
                            class="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/10">
                            <component :is="stat.icon" class="w-8 h-8 text-primary" />
                        </div>
                        <h3 class="text-4xl font-black">{{ stat.value }}</h3>
                        <p class="text-slate-400 font-medium tracking-wide uppercase text-xs">{{ stat.label }}</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Programs Section -->
        <section v-if="showPrograms" id="program" class="py-24 lg:py-32 scroll-mt-24">
            <div class="max-w-7xl mx-auto px-6">
                <div class="text-center max-w-3xl mx-auto mb-20 space-y-4">
                    <h2 class="text-4xl font-bold lg:text-5xl tracking-tight dark:text-white">Kurikulum Berstandar
                        Internasional</h2>
                    <p class="text-lg text-slate-600 dark:text-slate-300">
                        Kami mengintegrasikan kurikulum nasional dengan metode pembelajaran global untuk memastikan
                        siswa memiliki daya saing tinggi.
                    </p>
                </div>
                <div class="grid md:grid-cols-3 gap-8">
                    <Card v-for="program in programs" :key="program.title"
                        class="group hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 border-slate-200 dark:border-slate-800 dark:bg-slate-900/50">
                        <CardContent class="pt-8 text-center space-y-6">
                            <div class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto transition-all duration-300 group-hover:scale-110"
                                :class="program.color">
                                <component :is="program.icon" class="w-8 h-8 text-white" />
                            </div>
                            <h3 class="text-2xl font-bold dark:text-white">{{ program.title }}</h3>
                            <p class="text-slate-600 dark:text-slate-400 leading-relaxed">
                                {{ program.description }}
                            </p>
                            <Button variant="ghost" class="text-primary hover:text-primary/80 group/btn">
                                Pelajari Selengkapnya
                                <ArrowRightIcon
                                    class="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>

        <!-- Teachers & Staff Section -->
        <section v-if="showStaff" id="staff" class="py-24 lg:py-30 scroll-mt-2 overflow-hidden">
            <div class="max-w-7xl mx-auto px-6">
                <div class="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                    <div class="space-y-4 max-w-2xl">
                        <Badge variant="outline" class="text-primary border-primary">Tenaga Pengajar & Staf</Badge>
                        <h2 class="text-4xl font-bold lg:text-5xl tracking-tight text-slate-900 dark:text-white">
                            Mengenal Lebih Dekat
                            Pendidik Kami</h2>
                        <p class="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                            Dipandu oleh tenaga profesional yang berdedikasi tinggi untuk memberikan bimbingan terbaik
                            bagi setiap siswa.
                        </p>
                    </div>

                    <!-- Slider Controls & View All -->
                    <div class="flex items-center gap-6">
                        <Button @click="navigateToTeachers" variant="ghost" size="sm"
                            class="hidden md:flex items-center gap-2 text-primary font-bold hover:bg-primary/5 rounded-xl transition-all group/btn">
                            Lihat Seluruh Guru & Staf
                            <ArrowRightIcon class="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                        </Button>
                        <div class="flex gap-4">
                            <button @click="scrollLeft"
                                class="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 hover:text-primary hover:border-primary hover:bg-white hover:shadow-lg transition-all">
                                <ChevronLeftIcon class="w-6 h-6" />
                            </button>
                            <button @click="scrollRight"
                                class="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 hover:text-primary hover:border-primary hover:bg-white hover:shadow-lg transition-all">
                                <ChevronRightIcon class="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Staff Slider -->
                <div v-if="isLoading" class="flex gap-6 overflow-x-auto no-scrollbar pb-10">
                    <div v-for="i in 4" :key="i"
                        class="min-w-[280px] bg-white border border-slate-100 rounded-3xl overflow-hidden">
                        <Skeleton class="aspect-square w-full" />
                        <div class="p-6 space-y-4">
                            <Skeleton class="h-6 w-3/4 mx-auto" />
                            <Skeleton class="h-4 w-1/2 mx-auto" />
                        </div>
                    </div>
                </div>

                <div v-else ref="sliderRef" class="flex gap-6 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-10">
                    <div v-for="staff in staffData" :key="staff.id"
                        class="min-w-[280px] snap-center group bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-primary/20 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-700 text-center overflow-hidden rounded-3xl">
                        <div
                            class="aspect-square overflow-hidden mb-8 relative bg-slate-50 group-hover:scale-105 transition-transform duration-700">
                            <img :src="staff.photo || (staff.gender === 'Laki-laki' ? '/src/assets/images/blank_avatar_male.png' : '/src/assets/images/blank_avatar_female.png')"
                                :alt="staff.name"
                                class="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000" />

                            <!-- Position Tag Overlay -->
                            <div class="absolute bottom-4 left-4 z-10">
                                <div
                                    class="px-4 py-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-white/50 dark:border-slate-700 shadow-sm text-[10px] font-black uppercase tracking-[0.15em] text-slate-600 dark:text-slate-300 group-hover:bg-primary group-hover:text-white group-hover:border-primary/20 transition-all duration-500 rounded-lg">
                                    {{ staff.position }}
                                </div>
                            </div>

                            <div
                                class="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            </div>
                        </div>
                        <div class="space-y-4 px-6 pb-8">
                            <h4
                                class="text-lg font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-tight line-clamp-2 min-h-[3.5rem] flex items-center justify-center">
                                {{ staff.name }}</h4>

                            <!-- Social Links & Website -->
                            <div
                                class="pt-4 border-t border-slate-50 dark:border-slate-700 flex items-center justify-center gap-3">
                                <template
                                    v-if="staff.website || (staff.socials && Object.keys(staff.socials).length > 0)">
                                    <a v-if="staff.website" :href="staff.website" target="_blank"
                                        class="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-xl text-slate-400 hover:bg-primary/10 hover:text-primary transition-all group/social"
                                        title="Website/Blog">
                                        <GlobeAltIcon class="w-4 h-4" />
                                    </a>
                                    <template v-for="(handle, brand) in staff.socials" :key="brand">
                                        <a v-if="handle" href="#"
                                            class="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-xl text-slate-400 hover:bg-primary/10 hover:text-primary transition-all group/social"
                                            :title="brand.charAt(0).toUpperCase() + brand.slice(1)">
                                            <!-- SVG Icons for brands -->
                                            <svg v-if="brand === 'instagram'" class="w-4 h-4 fill-current"
                                                viewBox="0 0 24 24">
                                                <path
                                                    d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                            </svg>
                                            <svg v-else-if="brand === 'facebook'" class="w-4 h-4 fill-current"
                                                viewBox="0 0 24 24">
                                                <path
                                                    d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                                            </svg>
                                            <svg v-else-if="brand === 'tiktok'" class="w-4 h-4 fill-current"
                                                viewBox="0 0 24 24">
                                                <path
                                                    d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.59-5.75-.29-4.36 3.35-8.51 7.42-7.99.03 1.88 0 3.75-.02 5.63-.12-.01-.24-.01-.36-.01-1.15.01-2.35.4-3.17 1.26-.53.51-.87 1.19-.94 1.9-.11 1.71 1.23 3.32 2.92 3.48 1.29.12 2.61-.41 3.37-1.44.41-.53.62-1.19.64-1.85-.02-3.8-.01-7.61-.02-11.41z" />
                                            </svg>
                                            <svg v-else-if="brand === 'twitter'" class="w-4 h-4 fill-current"
                                                viewBox="0 0 24 24">
                                                <path
                                                    d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                            </svg>
                                            <span v-else class="text-[10px] font-bold">{{ brand.charAt(0).toUpperCase()
                                                }}</span>
                                        </a>
                                    </template>
                                </template>
                                <span v-else class="text-slate-300 font-bold text-lg">-</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Mobile View All CTA -->
                <div class="mt-12 text-center md:hidden">
                    <Button @click="navigateToTeachers" size="lg"
                        class="px-12 rounded-2xl py-8 text-lg font-black shadow-2xl shadow-primary/30 transition-all hover:-translate-y-1 active:scale-95 group">
                        Lihat Seluruh Guru & Staf
                        <ArrowRightIcon class="w-5 h-5 ml-3 transition-transform group-hover:translate-x-1" />
                    </Button>
                </div>
            </div>
        </section>

        <!-- Events Section -->
        <section v-if="showEvents" id="kegiatan" class="py-24 lg:py-32 scroll-mt-24">
            <div class="max-w-7xl mx-auto px-6">
                <div class="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div class="space-y-4 max-w-2xl">
                        <Badge variant="outline" class="text-primary border-primary">Kegiatan Terbaru</Badge>
                        <h2 class="text-4xl font-bold lg:text-5xl tracking-tight text-slate-900 dark:text-white">Momen &
                            Aktivitas</h2>
                        <p class="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                            Intip berbagai keseruan dan momen berharga dalam kegiatan akademik maupun non-akademik di
                            Global Academy.
                        </p>
                    </div>

                    <Button @click="navigateToEvents" variant="ghost" size="sm"
                        class="hidden md:flex items-center gap-2 text-primary font-bold hover:bg-primary/5 rounded-xl transition-all group/btn">
                        Lihat Seluruh Kegiatan
                        <ArrowRightIcon class="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                </div>

                <div v-if="isLoading" class="grid md:grid-cols-3 gap-8">
                    <div v-for="i in 3" :key="i" class="bg-white rounded-3xl border border-slate-200 overflow-hidden">
                        <Skeleton class="aspect-[16/10] w-full" />
                        <div class="p-8 space-y-4">
                            <Skeleton class="h-4 w-20" />
                            <Skeleton class="h-6 w-full" />
                            <Skeleton class="h-4 w-3/4" />
                        </div>
                    </div>
                </div>

                <div v-else class="grid md:grid-cols-3 gap-8">
                    <div v-for="item in events" :key="item.id"
                        class="group bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 cursor-pointer"
                        @click="openEventDetail(item)">
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
                                item.description }}</p>
                            <div class="pt-4 flex items-center gap-2 text-primary font-bold text-sm">
                                Lihat Galeri
                                <ArrowRightIcon class="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Mobile View All CTA -->
                <div v-if="allEvents.length > 3" class="mt-16 text-center md:hidden">
                    <Button @click="navigateToEvents" size="lg"
                        class="px-12 rounded-2xl py-8 text-lg font-black shadow-2xl shadow-primary/30 transition-all hover:-translate-y-1 active:scale-95 group">
                        Lihat Seluruh Kegiatan
                        <ArrowRightIcon class="w-5 h-5 ml-3 transition-transform group-hover:translate-x-1" />
                    </Button>
                </div>
            </div>
        </section>

        <!-- Achievements Section -->
        <section v-if="showAchievements" id="prestasi"
            class="py-24 lg:py-32 bg-slate-50 dark:bg-slate-900/50 scroll-mt-24">
            <div class="max-w-7xl mx-auto px-6">
                <div class="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div class="space-y-4 max-w-2xl">
                        <Badge variant="outline" class="text-primary border-primary">Prestasi & Penghargaan</Badge>
                        <h2 class="text-4xl font-bold lg:text-5xl tracking-tight text-slate-900 dark:text-white">
                            Mencetak
                            Generasi Juara
                        </h2>
                        <p class="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                            Dedikasi dan kerja keras civitas akademika Global Academy membuahkan berbagai prestasi
                            gemilang di tingkat nasional maupun internasional.
                        </p>
                    </div>

                    <Button @click="navigateToAchievements" variant="ghost" size="sm"
                        class="hidden md:flex items-center gap-2 text-primary font-bold hover:bg-primary/5 rounded-xl transition-all group/btn">
                        Lihat Seluruh Prestasi
                        <ArrowRightIcon class="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                </div>

                <div v-if="isLoading" class="grid md:grid-cols-3 gap-8">
                    <div v-for="i in 3" :key="i" class="bg-white rounded-3xl border border-slate-200 overflow-hidden">
                        <Skeleton class="aspect-[16/10] w-full" />
                        <div class="p-8 space-y-4">
                            <Skeleton class="h-4 w-20" />
                            <Skeleton class="h-6 w-full" />
                            <Skeleton class="h-4 w-3/4" />
                        </div>
                    </div>
                </div>

                <div v-else class="grid md:grid-cols-3 gap-8">
                    <div v-for="item in achievements" :key="item.id"
                        class="group bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 cursor-pointer"
                        @click="openAchievementDetail(item)">
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
                                class="text-xl font-bold group-hover:text-primary dark:text-white transition-colors line-clamp-2 leading-tight">
                                {{ item.title }}</h3>
                            <p class="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 leading-relaxed">{{
                                item.description }}</p>
                            <div class="pt-4 flex items-center gap-2 text-primary font-bold text-sm">
                                Selengkapnya
                                <ArrowRightIcon class="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Mobile View All CTA -->
                <div v-if="allAchievements.length > 3" class="mt-16 text-center md:hidden">
                    <Button @click="navigateToAchievements" size="lg"
                        class="px-12 rounded-2xl py-8 text-lg font-black shadow-2xl shadow-primary/30 transition-all hover:-translate-y-1 active:scale-95 group">
                        Lihat Seluruh Prestasi
                        <ArrowRightIcon class="w-5 h-5 ml-3 transition-transform group-hover:translate-x-1" />
                    </Button>
                </div>
            </div>
        </section>

        <!-- CTA Section -->
        <section v-if="showCTA" class="max-w-7xl mx-auto px-6 mb-24">
            <div
                class="bg-gradient-to-r from-primary via-indigo-600 to-indigo-700 rounded-[3rem] p-12 lg:p-24 text-center text-white relative overflow-hidden">
                <!-- Abstract blobs -->
                <div
                    class="absolute top-0 left-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -translate-x-1/2 -translate-y-1/2">
                </div>
                <div
                    class="absolute bottom-0 right-0 w-64 h-64 bg-black/10 blur-[80px] rounded-full translate-x-1/2 translate-y-1/2">
                </div>

                <div class="relative z-10 max-w-3xl mx-auto space-y-10">
                    <h2 class="text-4xl lg:text-6xl font-black leading-tight">
                        Siap Menjadi Bagian dari Global Academy?
                    </h2>
                    <p class="text-xl text-white/80 leading-relaxed">
                        Daftarkan putra-putri Anda sekarang dan dapatkan potongan biaya pendaftaran khusus untuk 50
                        pendaftar pertama bulan ini.
                    </p>
                    <div class="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" variant="secondary"
                            class="px-12 py-8 rounded-full text-lg font-bold bg-white text-primary hover:bg-slate-50 transition-transform hover:scale-105 active:scale-95 shadow-2xl">
                            Daftar Sekarang
                        </Button>
                        <Button variant="ghost" size="lg"
                            class="px-12 py-8 rounded-full text-lg font-bold text-white hover:bg-white/10 border border-white/20">
                            Hubungi Admin
                        </Button>
                    </div>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer v-if="showFooter" id="kontak" class="bg-slate-50 dark:bg-slate-950 pt-24 pb-12 scroll-mt-24">
            <div class="max-w-7xl mx-auto px-6">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                    <div class="space-y-6">
                        <div class="flex items-center gap-2">
                            <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <AcademicCapIcon class="w-5 h-5 text-white" />
                            </div>
                            <span class="text-lg font-bold dark:text-white">Global Academy</span>
                        </div>
                        <p class="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                            Menciptakan ekosistem pendidikan terbaik untuk masa depan gemilang putra-putri Indonesia.
                        </p>
                    </div>
                    <div>
                        <h4 class="font-bold mb-6 dark:text-white">Tautan Cepat</h4>
                        <ul class="space-y-4 text-sm text-slate-500 dark:text-slate-400">
                            <li><a href="#" class="hover:text-primary">Tentang Kami</a></li>
                            <li><a href="#" class="hover:text-primary">Kurikulum</a></li>
                            <li><a href="#" class="hover:text-primary">Kehidupan Siswa</a></li>
                            <li><a href="#" class="hover:text-primary">Alumni</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="font-bold mb-6 dark:text-white">Program</h4>
                        <ul class="space-y-4 text-sm text-slate-500 dark:text-slate-400">
                            <li><a href="#" class="hover:text-primary">SD (Elementary)</a></li>
                            <li><a href="#" class="hover:text-primary">SMP (Junior High)</a></li>
                            <li><a href="#" class="hover:text-primary">SMA (Senior High)</a></li>
                            <li><a href="#" class="hover:text-primary">Scholarships</a></li>
                        </ul>
                    </div>
                    <div class="space-y-6">
                        <h4 class="font-bold mb-6 dark:text-white">Kontak Kami</h4>
                        <div class="flex flex-col gap-4 text-sm text-slate-500 dark:text-slate-400">
                            <div class="flex items-center gap-3">
                                <MapPinIcon class="w-5 h-5 text-primary shrink-0" />
                                <span>Jl. Edukasi No. 123, Jakarta Selatan</span>
                            </div>
                            <div class="flex items-center gap-3">
                                <PhoneIcon class="w-5 h-5 text-primary shrink-0" />
                                <span>+62 21 1234 5678</span>
                            </div>
                            <div class="flex items-center gap-3">
                                <EnvelopeIcon class="w-5 h-5 text-primary shrink-0" />
                                <span>info@globalacademy.sch.id</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="pt-12 border-t border-slate-200 text-center text-sm text-slate-400">
                    <p>&copy; 2024 Global Academy. All rights reserved.</p>
                </div>
            </div>
        </footer>

        <!-- Event Detail Modal -->
        <transition enter-active-class="transition duration-500 ease-out"
            enter-from-class="opacity-0 scale-95 translate-y-8" enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition duration-300 ease-in" leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 translate-y-8">
            <div v-if="selectedEvent"
                class="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8 backdrop-blur-xl bg-slate-900/40"
                @click.self="closeEventDetail">
                <div
                    class="bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden max-w-6xl w-full max-h-[90vh] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.3)] relative flex flex-col transition-all duration-500">
                    <button
                        class="absolute top-8 right-8 z-50 p-3 bg-white/10 hover:bg-primary hover:text-white backdrop-blur-md rounded-2xl text-slate-900 transition-all duration-300 shadow-xl group"
                        @click="closeEventDetail">
                        <XMarkIcon class="w-6 h-6 transition-transform group-hover:rotate-90" />
                    </button>

                    <div class="flex flex-col lg:flex-row h-full overflow-hidden">
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
                                            class="w-10 h-10 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center shadow-sm">
                                            <MapPinIcon class="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                Lokasi</p>
                                            <p class="text-sm font-bold text-slate-700 dark:text-slate-200">Area Kampus
                                                Utama
                                            </p>
                                        </div>
                                    </div>
                                    <div
                                        class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                                        <div
                                            class="w-10 h-10 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center shadow-sm">
                                            <SparklesIcon class="w-5 h-5 text-indigo-500" />
                                        </div>
                                        <div>
                                            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                Penyelenggara</p>
                                            <p class="text-sm font-bold text-slate-700 dark:text-slate-200">Osis & Humas
                                                Sekolah
                                            </p>
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

        <!-- Achievement Detail Modal -->
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
                                class="text-3xl md:text-5xl font-black leading-[1.1] tracking-tight text-slate-900 dark:text-white leading-tight">
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
                                        class="inline-flex items-center gap-3 px-6 py-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-700 dark:text-slate-200 text-sm font-bold transition-all hover:border-primary hover:text-primary hover:shadow-lg hover:shadow-primary/10 group/link">
                                        {{ link.label }}
                                        <ArrowTopRightOnSquareIcon
                                            class="w-4 h-4 text-slate-400 group-hover/link:text-primary transition-colors" />
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div
                            class="pt-10 flex flex-col sm:flex-row gap-4 border-t border-slate-100 dark:border-slate-800">
                            <Button @click="closeAchievementDetail" size="lg"
                                class="px-12 rounded-2xl py-8 text-lg font-black shadow-2xl shadow-primary/30 transition-all hover:-translate-y-1 active:scale-95">
                                Bagikan Prestasi
                            </Button>
                            <Button @click="closeAchievementDetail" variant="outline" size="lg"
                                class="px-12 rounded-2xl py-8 text-lg font-black border-2 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-white">
                                Tutup
                            </Button>
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
                        class="absolute bottom-0 left-0 right-0 p-10 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
                        <Badge
                            class="bg-primary text-white border-none mb-4 uppercase tracking-[0.2em] font-black text-[10px] px-4 py-1.5">
                            {{ selectedMedia.type === 'image' ? 'Foto' : 'Video' }}
                        </Badge>
                        <h4 class="text-2xl font-bold text-white">{{ selectedMedia.alt }}</h4>
                    </div>
                </div>
            </div>
        </transition>
        <!-- Floating Theme Toggle -->
        <div class="fixed bottom-6 right-6 z-[90]">
            <ThemeToggle class="shadow-2xl shadow-slate-900/20" />
        </div>
    </div>
</template>

<style scoped>
@keyframes bounce-slow {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-10px);
    }
}

.animate-bounce-slow {
    animation: bounce-slow 4s infinite ease-in-out;
}

section {
    transition: all 0.5s ease-out;
}

html {
    scroll-behavior: smooth;
}

.no-scrollbar::-webkit-scrollbar {
    display: none;
}

.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
