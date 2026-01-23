<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
    AcademicCapIcon,
    MagnifyingGlassIcon,
    ArrowLeftIcon,
    HomeIcon,
    GlobeAltIcon
} from '@heroicons/vue/24/outline'
import Badge from '@/components/ui/badge/Badge.vue'
import Skeleton from '@/components/ui/skeleton/Skeleton.vue'
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import Button from '@/components/ui/button/Button.vue'

const router = useRouter()
const isLoading = ref(true)
const searchQuery = ref('')
const selectedStaffType = ref('Semua')

const staffCategories = ['Semua', 'Guru', 'Pegawai']

// Mock data (same as landing page but more complete)
const staffData = [
    { id: 1, name: 'Dr. Budi Santoso, M.Pd', position: 'Kepala Sekolah', type: 'Guru', gender: 'Laki-laki', photo: null, website: 'https://budisantoso.com', socials: { instagram: '@budi.santoso', facebook: 'Budi Santoso' } },
    { id: 2, name: 'Siti Aminah, S.Pd', position: 'Waka Kurikulum', type: 'Guru', gender: 'Perempuan', photo: null, website: null, socials: { instagram: '@siti.aminah', tiktok: '@sitiaminah_edu' } },
    { id: 3, name: 'Ahmad Rizki, S.Kom', position: 'Waka Kesiswaan', type: 'Guru', gender: 'Laki-laki', photo: null, website: 'https://rizki.dev', socials: { twitter: '@ahmad_rizki' } },
    { id: 4, name: 'Ratna Dewi, S.Pd', position: 'Walikelas X-A', type: 'Guru', gender: 'Perempuan', photo: null, website: null, socials: { instagram: '@ratnadewi_spd' } },
    { id: 5, name: 'Joko Susilo', position: 'Staff Tata Usaha', type: 'Pegawai', gender: 'Laki-laki', photo: null, website: null, socials: null },
    { id: 6, name: 'Hendra Wijaya, M.Sc', position: 'Guru Fisika', type: 'Guru', gender: 'Laki-laki', photo: null, website: 'https://hendrawijaya.sc', socials: { instagram: '@hendra_physics', facebook: 'Hendra Wijaya' } },
    { id: 7, name: 'Lia Kusuma, S.Pd', position: 'Guru Kimia', type: 'Guru', gender: 'Perempuan', photo: null, website: null, socials: { instagram: '@lia_kusuma' } },
    { id: 8, name: 'Budi Raharjo', position: 'Staff Keamanan', type: 'Pegawai', gender: 'Laki-laki', photo: null, website: null, socials: null },
    { id: 9, name: 'Santi Puteri, M.Psi', position: 'Konselor Sekolah', type: 'Pegawai', gender: 'Perempuan', photo: null, website: 'https://santiputeri.me', socials: { instagram: '@santi_puteri' } },
    { id: 10, name: 'Andi Pratama, S.Pd', position: 'Guru Olahraga', type: 'Guru', gender: 'Laki-laki', photo: null, website: null, socials: { facebook: 'Andi Pratama' } },
    { id: 11, name: 'Diana Fitri, M.Hum', position: 'Guru Bahasa Inggris', type: 'Guru', gender: 'Perempuan', photo: null, website: null, socials: { instagram: '@diana_fitri' } },
    { id: 12, name: 'Rahmat Hidayat', position: 'Staff Perpustakaan', type: 'Pegawai', gender: 'Laki-laki', photo: null, website: null, socials: null },
    { id: 13, name: 'Eka Wijaya, S.Pd', position: 'Guru Biologi', type: 'Guru', gender: 'Perempuan', photo: null, website: null, socials: { tiktok: '@ekawijaya_bio' } },
    { id: 14, name: 'Fajar Nugraha', position: 'Staff Admin', type: 'Pegawai', gender: 'Laki-laki', photo: null, website: null, socials: null },
    { id: 15, name: 'Gita Permata, M.Pd', position: 'Guru Sejarah', type: 'Guru', gender: 'Perempuan', photo: null, website: null, socials: { instagram: '@gita_permata' } },
]

const filteredStaff = computed(() => {
    return staffData.filter(staff => {
        const matchesSearch = staff.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            staff.position.toLowerCase().includes(searchQuery.value.toLowerCase())
        const matchesType = selectedStaffType.value === 'Semua' || staff.type === selectedStaffType.value
        return matchesSearch && matchesType
    })
})

const goBack = () => {
    router.push('/')
}

onMounted(() => {
    // Scroll to top
    window.scrollTo(0, 0)
    // Simulate loading
    setTimeout(() => {
        isLoading.value = false
    }, 1500)
})
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
                            class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                            <AcademicCapIcon class="w-6 h-6 text-white" />
                        </div>
                        <h1 class="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Direktori Guru &
                            Staf</h1>
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <ThemeToggle />
                    <Button variant="ghost" @click="goBack"
                        class="hidden sm:flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all">
                        <HomeIcon class="w-5 h-5" />
                        Kembali ke Beranda
                    </Button>
                </div>
            </div>
        </header>

        <!-- Search & Filter Bar -->
        <div
            class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-8 lg:py-12 transition-colors duration-300">
            <div class="max-w-7xl mx-auto px-6">
                <div class="flex flex-col lg:flex-row gap-6 items-center justify-between">
                    <div class="space-y-2 text-center lg:text-left">
                        <h2 class="text-3xl font-black text-slate-900 dark:text-white">Cari Pengajar Kami</h2>
                        <p class="text-slate-500 dark:text-slate-400 font-medium tracking-tight">Temukan profil tenaga
                            pendidik dan staf
                            profesional kami.
                        </p>
                    </div>

                    <div class="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                        <div class="relative group flex-1 sm:w-96">
                            <MagnifyingGlassIcon
                                class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <input v-model="searchQuery" type="text" placeholder="Cari nama atau jabatan..."
                                class="pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-full focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none text-sm font-bold text-slate-900 dark:text-white dark:placeholder-slate-500" />
                        </div>
                        <div class="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl shrink-0">
                            <button v-for="cat in staffCategories" :key="cat" @click="selectedStaffType = cat"
                                class="px-6 py-3 rounded-xl text-xs font-black transition-all"
                                :class="selectedStaffType === cat ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'">
                                {{ cat }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <main class="max-w-7xl mx-auto px-6 py-12 lg:py-20">
            <!-- Unified Staff Grid -->
            <div v-if="isLoading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                <div v-for="i in 8" :key="i"
                    class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] overflow-hidden">
                    <Skeleton class="aspect-square w-full" />
                    <div class="p-6 space-y-4">
                        <Skeleton class="h-6 w-3/4 mx-auto" />
                        <Skeleton class="h-4 w-1/2 mx-auto" />
                    </div>
                </div>
            </div>

            <transition-group v-else tag="div" enter-active-class="transition duration-700 ease-out"
                enter-from-class="opacity-0 translate-y-12" enter-to-class="opacity-100 translate-y-0"
                move-class="transition duration-500"
                class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                <div v-for="staff in filteredStaff" :key="staff.id"
                    class="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-primary/20 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-700 text-center overflow-hidden rounded-[2rem]">
                    <div
                        class="aspect-square overflow-hidden mb-8 relative bg-slate-50 dark:bg-slate-800 group-hover:scale-105 transition-transform duration-700">
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
                            class="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        </div>
                    </div>
                    <div class="space-y-4 px-6 pb-8">
                        <h4
                            class="text-lg font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-tight line-clamp-2 min-h-[3.5rem] flex items-center justify-center">
                            {{ staff.name }}</h4>

                        <!-- Social Links & Website -->
                        <div
                            class="pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-center gap-3">
                            <template v-if="staff.website || (staff.socials && Object.keys(staff.socials).length > 0)">
                                <a v-if="staff.website" :href="staff.website" target="_blank"
                                    class="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:bg-primary/10 hover:text-primary transition-all group/social"
                                    title="Website/Blog">
                                    <GlobeAltIcon class="w-4 h-4" />
                                </a>
                                <template v-for="(handle, brand) in staff.socials" :key="brand">
                                    <a v-if="handle" href="#"
                                        class="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:bg-primary/10 hover:text-primary transition-all group/social"
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
            </transition-group>

            <!-- Empty State -->
            <div v-if="filteredStaff.length === 0" class="py-32 text-center space-y-10">
                <div class="relative inline-block">
                    <div
                        class="w-32 h-32 bg-white dark:bg-slate-900 shadow-xl flex items-center justify-center mx-auto border border-slate-50 dark:border-slate-800 rounded-3xl">
                        <MagnifyingGlassIcon class="w-12 h-12 text-slate-200 dark:text-slate-700" />
                    </div>
                </div>
                <div class="space-y-3">
                    <h3 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Tidak ada yang kami
                        temukan</h3>
                    <p class="text-slate-400 max-w-sm mx-auto font-medium text-lg leading-relaxed">Coba kata kunci lain
                        atau gunakan filter kategori di atas.</p>
                </div>
                <Button @click="searchQuery = ''; selectedStaffType = 'Semua'" variant="default" size="lg"
                    class="px-10 rounded-2xl font-black py-7 shadow-xl shadow-primary/20">
                    Mulai Ulang Pencarian
                </Button>
            </div>
        </main>

        <!-- Footer -->
        <footer
            class="bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 py-20 mt-20 transition-colors duration-300">
            <div class="max-w-7xl mx-auto px-6 flex flex-col items-center gap-10">
                <div class="flex items-center gap-4 opacity-30 grayscale saturate-0 dark:invert">
                    <span class="text-2xl font-black tracking-tighter">GLOBAL ACADEMY</span>
                    <div class="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-white"></div>
                    <span class="text-xs font-bold tracking-widest uppercase">Excellentia</span>
                </div>
                <p class="text-slate-400 text-sm font-medium">&copy; 2026 Global Academy. Empowering Minds Since 1998.
                </p>
            </div>
        </footer>
    </div>
</template>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
