<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
    UserIcon,
    AcademicCapIcon,
    UsersIcon,
    TrophyIcon,
    ArrowLeftIcon,
    PencilIcon,
    EnvelopeIcon,
    PhoneIcon,
    MapPinIcon,
    CalendarIcon
} from '@heroicons/vue/24/outline'
import Button from '@/components/ui/button/Button.vue'
import Skeleton from '@/components/ui/skeleton/Skeleton.vue'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()
const student = ref(null)
const loading = ref(true)

const fetchStudent = async () => {
    loading.value = true
    try {
        const id = route.params.id
        // Artificial delay for demo
        await new Promise(resolve => setTimeout(resolve, 800))
        const response = await api.get('/students')
        const data = response.data.data || response.data
        student.value = data.find(s => s.id == id)
    } catch (error) {
        console.error('Failed to fetch student', error)
    } finally {
        loading.value = false
    }
}

const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric'
    })
}

const calculateAge = (birthDate) => {
    if (!birthDate) return '-'
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--
    }
    return `${age} tahun`
}

onMounted(() => {
    fetchStudent()
})
</script>

<template>
    <div class="space-y-8 pb-12">
        <!-- Header -->
        <div class="flex items-center gap-4">
            <button @click="router.back()"
                class="p-3 hover:bg-primary/5 rounded-2xl text-muted-foreground hover:text-primary transition-all active:scale-95 group">
                <ArrowLeftIcon class="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div class="space-y-1 flex-1">
                <h1 class="text-3xl font-black text-foreground tracking-tight">Detail Siswa</h1>
                <p class="text-sm font-bold uppercase tracking-widest text-muted-foreground/50">Profil Lengkap & Data
                    Akademik</p>
            </div>
            <div v-if="student">
                <button @click="router.push(`/students`)"
                    class="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-2xl font-bold transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-primary/30">
                    <PencilIcon class="w-4 h-4" />
                    Edit Profil
                </button>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Skeleton Profile Card -->
            <div
                class="lg:col-span-1 h-fit bg-background border border-primary/10 rounded-3xl shadow-xl shadow-primary/5 overflow-hidden p-6">
                <Skeleton class="w-32 h-32 rounded-full mx-auto mb-4" />
                <Skeleton class="h-6 w-48 mx-auto mb-2" />
                <Skeleton class="h-4 w-32 mx-auto mb-4" />
                <Skeleton class="h-6 w-20 mx-auto rounded-full mb-6" />
                <div class="space-y-4 mt-8">
                    <div v-for="i in 4" :key="i" class="flex justify-between">
                        <Skeleton class="h-4 w-20" />
                        <Skeleton class="h-4 w-24" />
                    </div>
                </div>
            </div>

            <!-- Skeleton Sections -->
            <div class="lg:col-span-2 space-y-8">
                <div v-for="i in 4" :key="i" class="bg-background border border-primary/10 rounded-3xl p-8">
                    <div class="flex items-center gap-4 mb-8">
                        <Skeleton class="h-12 w-12 rounded-2xl" />
                        <Skeleton class="h-6 w-40" />
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div v-for="j in 4" :key="j" class="space-y-2">
                            <Skeleton class="h-3 w-24" />
                            <Skeleton class="h-4 w-full" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Content -->
        <div v-else-if="student" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Left Column: Profile Card -->
            <div
                class="lg:col-span-1 h-fit bg-background border border-primary/10 rounded-3xl shadow-xl shadow-primary/5 overflow-hidden">
                <!-- Header with gradient -->
                <div class="h-32 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent relative">
                    <div
                        class="absolute -bottom-16 left-1/2 -translate-x-1/2 p-2 bg-background rounded-[2.5rem] shadow-xl shadow-primary/10">
                        <img :src="student.avatar || `https://ui-avatars.com/api/?name=${student.name}&background=random`"
                            class="w-32 h-32 rounded-[2rem] object-cover border-4 border-background" />
                    </div>
                </div>

                <!-- Profile Info -->
                <div class="pt-20 pb-8 px-6 flex flex-col items-center text-center">
                    <h2 class="text-2xl font-black text-foreground tracking-tight">{{ student.name }}</h2>
                    <p class="text-xs font-bold text-muted-foreground tracking-widest uppercase mt-1">
                        NIS: {{ student.nis }} • NISN: {{ student.nisn }}
                    </p>

                    <!-- Status Badge -->
                    <div class="mt-4">
                        <span
                            class="inline-flex items-center px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-wider border-2"
                            :class="student.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-50 text-slate-700 border-slate-200'">
                            {{ student.status === 'active' ? '● Aktif' : student.status }}
                        </span>
                    </div>

                    <!-- Quick Actions -->
                    <div class="w-full mt-6 grid grid-cols-2 gap-3">
                        <a :href="`mailto:${student.email}`"
                            class="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-2xl font-bold text-xs transition-all active:scale-95">
                            <EnvelopeIcon class="w-4 h-4" />
                            Email
                        </a>
                        <a :href="`tel:${student.phone}`"
                            class="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-2xl font-bold text-xs transition-all active:scale-95">
                            <PhoneIcon class="w-4 h-4" />
                            Telepon
                        </a>
                    </div>

                    <!-- Divider -->
                    <div class="w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent my-8"></div>

                    <!-- Quick Info -->
                    <div class="w-full space-y-5 text-sm">
                        <div class="flex justify-between items-center p-3 bg-primary/[0.02] rounded-2xl">
                            <span
                                class="text-muted-foreground font-bold text-[10px] uppercase tracking-widest">Kelas</span>
                            <span class="font-black text-primary bg-primary/10 px-3 py-1 rounded-xl">{{ student.class
                                }}</span>
                        </div>
                        <div class="flex justify-between items-center p-3 bg-primary/[0.02] rounded-2xl">
                            <span class="text-muted-foreground font-bold text-[10px] uppercase tracking-widest">Jenis
                                Kelamin</span>
                            <span class="font-bold text-foreground">{{ student.gender === 'L' ? 'Laki-laki' :
                                'Perempuan' }}</span>
                        </div>
                        <div class="flex justify-between items-center p-3 bg-primary/[0.02] rounded-2xl">
                            <span
                                class="text-muted-foreground font-bold text-[10px] uppercase tracking-widest">Agama</span>
                            <span class="font-bold text-foreground">{{ student.religion }}</span>
                        </div>
                        <div class="flex justify-between items-center p-3 bg-primary/[0.02] rounded-2xl">
                            <span
                                class="text-muted-foreground font-bold text-[10px] uppercase tracking-widest">Usia</span>
                            <span class="font-bold text-foreground">{{ calculateAge(student.birthDate) }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Column: Details Sections -->
            <div class="lg:col-span-2 space-y-8">
                <!-- Personal Info -->
                <div
                    class="bg-background border border-primary/10 rounded-3xl shadow-xl shadow-primary/5 p-8 relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 blur-3xl rounded-full"></div>
                    <div class="flex items-center gap-4 mb-8 relative">
                        <div class="p-3 bg-blue-50 rounded-2xl shadow-sm">
                            <UserIcon class="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 class="text-xl font-black text-foreground tracking-tight">Informasi Pribadi</h3>
                            <p class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Data
                                Identitas Lengkap</p>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                        <div class="space-y-2 p-4 bg-primary/[0.02] rounded-2xl">
                            <div class="flex items-center gap-2 mb-1">
                                <CalendarIcon class="w-3.5 h-3.5 text-blue-500" />
                                <p class="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                    Tempat, Tanggal Lahir</p>
                            </div>
                            <p class="font-bold text-foreground">{{ student.birthPlace }}, {{
                                formatDate(student.birthDate) }}</p>
                        </div>
                        <div class="space-y-2 p-4 bg-primary/[0.02] rounded-2xl">
                            <div class="flex items-center gap-2 mb-1">
                                <EnvelopeIcon class="w-3.5 h-3.5 text-blue-500" />
                                <p class="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Email
                                </p>
                            </div>
                            <p class="font-bold text-foreground break-all">{{ student.email }}</p>
                        </div>
                        <div class="space-y-2 p-4 bg-primary/[0.02] rounded-2xl">
                            <div class="flex items-center gap-2 mb-1">
                                <PhoneIcon class="w-3.5 h-3.5 text-blue-500" />
                                <p class="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                    Telepon</p>
                            </div>
                            <p class="font-bold text-foreground">{{ student.phone }}</p>
                        </div>
                        <div class="md:col-span-2 space-y-2 p-4 bg-primary/[0.02] rounded-2xl">
                            <div class="flex items-center gap-2 mb-1">
                                <MapPinIcon class="w-3.5 h-3.5 text-blue-500" />
                                <p class="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Alamat
                                    Lengkap</p>
                            </div>
                            <p class="font-bold text-foreground leading-relaxed">{{ student.address }}</p>
                        </div>
                    </div>
                </div>

                <!-- Academic Info -->
                <div
                    class="bg-background border border-primary/10 rounded-3xl shadow-xl shadow-primary/5 p-8 relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 blur-3xl rounded-full"></div>
                    <div class="flex items-center gap-4 mb-8 relative">
                        <div class="p-3 bg-emerald-50 rounded-2xl shadow-sm">
                            <AcademicCapIcon class="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <h3 class="text-xl font-black text-foreground tracking-tight">Data Akademik</h3>
                            <p class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Riwayat
                                Pendidikan</p>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                        <div class="space-y-2 p-4 bg-primary/[0.02] rounded-2xl">
                            <p class="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Sekolah
                                Asal</p>
                            <p class="font-bold text-foreground">{{ student.academic?.previousSchool || '-' }}</p>
                        </div>
                        <div class="space-y-2 p-4 bg-primary/[0.02] rounded-2xl">
                            <p class="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Nilai
                                Masuk</p>
                            <span
                                class="inline-flex bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-xl font-black text-sm border-2 border-emerald-200">
                                {{ student.academic?.entryScore || '-' }}
                            </span>
                        </div>
                        <div class="space-y-2 p-4 bg-primary/[0.02] rounded-2xl">
                            <p class="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Tanggal
                                Masuk</p>
                            <p class="font-bold text-foreground">{{ formatDate(student.joinDate) }}</p>
                        </div>
                    </div>
                </div>

                <!-- Parent Info -->
                <div
                    class="bg-background border border-primary/10 rounded-3xl shadow-xl shadow-primary/5 p-8 relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-40 h-40 bg-purple-500/5 blur-3xl rounded-full"></div>
                    <div class="flex items-center gap-4 mb-8 relative">
                        <div class="p-3 bg-purple-50 rounded-2xl shadow-sm">
                            <UsersIcon class="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <h3 class="text-xl font-black text-foreground tracking-tight">Data Orang Tua</h3>
                            <p class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                                Informasi Wali Murid</p>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                        <!-- Father -->
                        <div class="space-y-4 p-6 bg-blue-50/30 rounded-2xl border border-blue-100/50">
                            <div class="flex items-center gap-2 mb-4">
                                <div class="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                                <p class="font-black text-sm uppercase tracking-wider text-blue-700">Data Ayah</p>
                            </div>
                            <div class="space-y-4 pl-3.5">
                                <div class="space-y-1">
                                    <p class="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                                        Nama Lengkap</p>
                                    <p class="font-bold text-foreground">{{ student.parent?.father?.name || '-' }}</p>
                                </div>
                                <div class="space-y-1">
                                    <p class="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                                        Telepon</p>
                                    <p class="font-bold text-foreground">{{ student.parent?.father?.phone || '-' }}</p>
                                </div>
                                <div class="space-y-1">
                                    <p class="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                                        Pekerjaan</p>
                                    <p class="font-bold text-foreground">{{ student.parent?.father?.occupation || '-' }}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Mother -->
                        <div class="space-y-4 p-6 bg-pink-50/30 rounded-2xl border border-pink-100/50">
                            <div class="flex items-center gap-2 mb-4">
                                <div class="w-1.5 h-6 bg-pink-500 rounded-full"></div>
                                <p class="font-black text-sm uppercase tracking-wider text-pink-700">Data Ibu</p>
                            </div>
                            <div class="space-y-4 pl-3.5">
                                <div class="space-y-1">
                                    <p class="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                                        Nama Lengkap</p>
                                    <p class="font-bold text-foreground">{{ student.parent?.mother?.name || '-' }}</p>
                                </div>
                                <div class="space-y-1">
                                    <p class="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                                        Telepon</p>
                                    <p class="font-bold text-foreground">{{ student.parent?.mother?.phone || '-' }}</p>
                                </div>
                                <div class="space-y-1">
                                    <p class="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                                        Pekerjaan</p>
                                    <p class="font-bold text-foreground">{{ student.parent?.mother?.occupation || '-' }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Achievements -->
                <div
                    class="bg-background border border-primary/10 rounded-3xl shadow-xl shadow-primary/5 p-8 relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-40 h-40 bg-amber-500/5 blur-3xl rounded-full"></div>
                    <div class="flex items-center gap-4 mb-8 relative">
                        <div class="p-3 bg-amber-50 rounded-2xl shadow-sm">
                            <TrophyIcon class="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <h3 class="text-xl font-black text-foreground tracking-tight">Daftar Prestasi</h3>
                            <p class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                                Penghargaan & Sertifikat</p>
                        </div>
                    </div>
                    <div class="relative">
                        <div v-if="student.academic?.achievements?.length" class="grid grid-cols-1 gap-3">
                            <div v-for="(achievement, idx) in student.academic.achievements" :key="idx"
                                class="flex items-center gap-4 p-5 bg-gradient-to-r from-amber-50/50 to-transparent border border-amber-200/30 rounded-2xl group/item hover:from-amber-50 hover:shadow-md transition-all">
                                <div
                                    class="p-2.5 bg-white rounded-xl shadow-sm group-hover/item:scale-110 group-hover/item:shadow-md transition-all">
                                    <TrophyIcon class="w-5 h-5 text-amber-500" />
                                </div>
                                <div class="flex-1">
                                    <span class="font-bold text-foreground text-sm leading-tight">{{ achievement
                                        }}</span>
                                </div>
                                <div
                                    class="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center font-black text-xs text-amber-700">
                                    {{ idx + 1 }}
                                </div>
                            </div>
                        </div>
                        <div v-else
                            class="flex flex-col items-center justify-center py-16 bg-primary/[0.02] rounded-3xl border-2 border-dashed border-primary/10">
                            <div class="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-4">
                                <TrophyIcon class="w-8 h-8 text-amber-400" />
                            </div>
                            <p class="text-muted-foreground font-bold text-sm">Belum ada prestasi tercatat</p>
                            <p class="text-muted-foreground/60 text-xs mt-1">Data prestasi akan muncul di sini</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Not Found State -->
        <div v-else class="flex flex-col items-center justify-center py-20">
            <div class="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center mb-6">
                <UserIcon class="w-10 h-10 text-primary/40" />
            </div>
            <h3 class="text-2xl font-black text-foreground mb-2">Siswa Tidak Ditemukan</h3>
            <p class="text-muted-foreground mb-6">Data siswa yang Anda cari tidak tersedia</p>
            <Button @click="router.push('/students')" class="bg-primary hover:bg-primary/90 text-primary-foreground">
                Kembali ke Daftar Siswa
            </Button>
        </div>
    </div>
</template>
