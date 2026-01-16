<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
    UserIcon,
    AcademicCapIcon,
    UsersIcon,
    TrophyIcon,
    ArrowLeftIcon,
    PencilIcon
} from '@heroicons/vue/24/outline'
import Button from '@/components/ui/button/Button.vue'
import Card from '@/components/ui/card/Card.vue'
import CardHeader from '@/components/ui/card/CardHeader.vue'
import CardTitle from '@/components/ui/card/CardTitle.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import Avatar from '@/components/ui/avatar/Avatar.vue'
import Badge from '@/components/ui/badge/Badge.vue'
import Separator from '@/components/ui/separator/Separator.vue'
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
        // Mock data fetch - in real app use api.get(`/students/${id}`)
        // For now finding in list from localStorage or mock
        const response = await api.get('/students')
        student.value = response.data.find(s => s.id == id)
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

onMounted(() => {
    fetchStudent()
})
</script>

<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center gap-4">
            <Button variant="ghost" size="icon" @click="router.back()">
                <ArrowLeftIcon class="w-5 h-5" />
            </Button>
            <div>
                <h1 class="text-2xl font-bold tracking-tight">Detail Siswa</h1>
                <p class="text-muted-foreground">Informasi lengkap data siswa</p>
            </div>
            <div class="ml-auto" v-if="student">
                <Button variant="outline" @click="router.push(`/students`)">
                    <PencilIcon class="w-4 h-4 mr-2" />
                    Edit Data
                </Button>
            </div>
        </div>

        <div v-if="loading" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Skeleton Profile Card -->
            <Card class="lg:col-span-1 h-fit">
                <CardContent class="pt-6 flex flex-col items-center text-center">
                    <Skeleton class="w-32 h-32 rounded-full mb-4" />
                    <Skeleton class="h-6 w-48 mb-2" />
                    <Skeleton class="h-4 w-32 mb-4" />
                    <Skeleton class="h-6 w-16 rounded-full mb-6" />
                    <Separator class="my-6 w-full" />
                    <div class="w-full space-y-4">
                        <div v-for="i in 4" :key="i" class="flex justify-between">
                            <Skeleton class="h-4 w-20" />
                            <Skeleton class="h-4 w-24" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <!-- Skeleton Tabs/Sections -->
            <div class="lg:col-span-2 space-y-6">
                <Card v-for="i in 3" :key="i">
                    <CardHeader>
                        <div class="flex items-center gap-2">
                            <Skeleton class="h-5 w-5 rounded-full" />
                            <Skeleton class="h-5 w-40" />
                        </div>
                    </CardHeader>
                    <CardContent class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div v-for="j in 4" :key="j" class="space-y-2">
                            <Skeleton class="h-3 w-24" />
                            <Skeleton class="h-4 w-48" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>

        <div v-else-if="student" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Left Column: Profile Card -->
            <Card class="lg:col-span-1 h-fit">
                <CardContent class="pt-6 flex flex-col items-center text-center">
                    <Avatar :src="student.avatar" :alt="student.name" class="w-32 h-32 mb-4" />
                    <h2 class="text-xl font-bold">{{ student.name }}</h2>
                    <p class="text-muted-foreground mb-2">{{ student.nis }} / {{ student.nisn }}</p>
                    <Badge :variant="student.status === 'active' ? 'default' : 'secondary'">
                        {{ student.status === 'active' ? 'Aktif' : student.status }}
                    </Badge>

                    <Separator class="my-6" />

                    <div class="w-full space-y-4 text-sm text-left">
                        <div class="flex justify-between">
                            <span class="text-muted-foreground">Kelas</span>
                            <span class="font-medium">{{ student.class }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-muted-foreground">Jenis Kelamin</span>
                            <span class="font-medium">{{ student.gender === 'L' ? 'Laki-laki' : 'Perempuan' }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-muted-foreground">Agama</span>
                            <span class="font-medium">{{ student.religion }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-muted-foreground">Tahun Masuk</span>
                            <span class="font-medium">{{ formatDate(student.joinDate) }}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <!-- Right Column: Details Tabs/Sections -->
            <div class="lg:col-span-2 space-y-6">

                <!-- Personal Info -->
                <Card>
                    <CardHeader>
                        <div class="flex items-center gap-2">
                            <UserIcon class="w-5 h-5 text-blue-500" />
                            <CardTitle>Informasi Pribadi</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p class="text-sm text-muted-foreground">Tempat, Tanggal Lahir</p>
                            <p class="font-medium">{{ student.birthPlace }}, {{ formatDate(student.birthDate) }}</p>
                        </div>
                        <div>
                            <p class="text-sm text-muted-foreground">Email</p>
                            <p class="font-medium">{{ student.email }}</p>
                        </div>
                        <div>
                            <p class="text-sm text-muted-foreground">Telepon</p>
                            <p class="font-medium">{{ student.phone }}</p>
                        </div>
                        <div class="md:col-span-2">
                            <p class="text-sm text-muted-foreground">Alamat</p>
                            <p class="font-medium">{{ student.address }}</p>
                        </div>
                    </CardContent>
                </Card>

                <!-- Academic Info -->
                <Card>
                    <CardHeader>
                        <div class="flex items-center gap-2">
                            <AcademicCapIcon class="w-5 h-5 text-green-500" />
                            <CardTitle>Data Akademik</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p class="text-sm text-muted-foreground">Sekolah Asal</p>
                            <p class="font-medium">{{ student.academic?.previousSchool || '-' }}</p>
                        </div>
                        <div>
                            <p class="text-sm text-muted-foreground">Nilai Masuk</p>
                            <p class="font-medium">{{ student.academic?.entryScore || '-' }}</p>
                        </div>
                    </CardContent>
                </Card>

                <!-- Parent Info -->
                <Card>
                    <CardHeader>
                        <div class="flex items-center gap-2">
                            <UsersIcon class="w-5 h-5 text-purple-500" />
                            <CardTitle>Data Orang Tua</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-3">
                            <p class="font-semibold text-sm">Ayah</p>
                            <div>
                                <p class="text-sm text-muted-foreground">Nama</p>
                                <p class="font-medium">{{ student.parent?.father?.name || '-' }}</p>
                            </div>
                            <div>
                                <p class="text-sm text-muted-foreground">Telepon</p>
                                <p class="font-medium">{{ student.parent?.father?.phone || '-' }}</p>
                            </div>
                            <div>
                                <p class="text-sm text-muted-foreground">Pekerjaan</p>
                                <p class="font-medium">{{ student.parent?.father?.occupation || '-' }}</p>
                            </div>
                        </div>
                        <div class="space-y-3">
                            <p class="font-semibold text-sm">Ibu</p>
                            <div>
                                <p class="text-sm text-muted-foreground">Nama</p>
                                <p class="font-medium">{{ student.parent?.mother?.name || '-' }}</p>
                            </div>
                            <div>
                                <p class="text-sm text-muted-foreground">Telepon</p>
                                <p class="font-medium">{{ student.parent?.mother?.phone || '-' }}</p>
                            </div>
                            <div>
                                <p class="text-sm text-muted-foreground">Pekerjaan</p>
                                <p class="font-medium">{{ student.parent?.mother?.occupation || '-' }}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <!-- Achievements -->
                <Card>
                    <CardHeader>
                        <div class="flex items-center gap-2">
                            <TrophyIcon class="w-5 h-5 text-yellow-500" />
                            <CardTitle>Prestasi</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ul v-if="student.academic?.achievements?.length" class="space-y-2">
                            <li v-for="(achievement, idx) in student.academic.achievements" :key="idx"
                                class="flex items-center gap-2 p-2 bg-muted/50 rounded">
                                <TrophyIcon class="w-4 h-4 text-yellow-500" />
                                <span>{{ achievement }}</span>
                            </li>
                        </ul>
                        <p v-else class="text-muted-foreground text-sm">Belum ada data prestasi.</p>
                    </CardContent>
                </Card>

            </div>
        </div>

        <div v-else class="text-center py-12">
            <h3 class="text-lg font-medium">Siswa tidak ditemukan</h3>
            <Button variant="link" @click="router.push('/students')">Kembali ke Daftar Siswa</Button>
        </div>
    </div>
</template>
