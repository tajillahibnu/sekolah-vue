<script setup>
import { ref, onMounted } from 'vue'
import { BuildingOffice2Icon, AcademicCapIcon, ComputerDesktopIcon, ArrowUpTrayIcon } from '@heroicons/vue/24/outline'
import api from '@/services/api'
import Button from '@/components/ui/button/Button.vue'
import FormInput from '@/components/ui/form/FormInput.vue'
import FormSelect from '@/components/ui/form/FormSelect.vue'
import FormCombobox from '@/components/ui/form/FormCombobox.vue'
import FormTextarea from '@/components/ui/form/FormTextarea.vue'
import FormSwitch from '@/components/ui/form/FormSwitch.vue'
import Card from '@/components/ui/card/Card.vue'
import CardHeader from '@/components/ui/card/CardHeader.vue'
import CardTitle from '@/components/ui/card/CardTitle.vue'
import CardDescription from '@/components/ui/card/CardDescription.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import Separator from '@/components/ui/separator/Separator.vue'
import Avatar from '@/components/ui/avatar/Avatar.vue'
import Alert from '@/components/ui/alert/Alert.vue'
import AlertDescription from '@/components/ui/alert/AlertDescription.vue'

const loading = ref(false)
const saving = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// Form Data through ref
const formData = ref({
    schoolName: '',
    npsn: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    logo: '',
    principal: '',
    accreditation: '',
    foundedYear: '',
    academic: {
        currentAcademicYear: '',
        currentSemester: 1,
        gradingSystem: '',
        minimumPassingGrade: 75
    },
    system: {
        timezone: '',
        dateFormat: '',
        language: '',
        emailNotifications: true
    }
})

// Options
const accreditationOptions = [
    { value: 'A', label: 'Terakreditasi A' },
    { value: 'B', label: 'Terakreditasi B' },
    { value: 'C', label: 'Terakreditasi C' },
    { value: 'Belum Terakreditasi', label: 'Belum Terakreditasi' }
]

const academicYearOptions = [
    { value: '2023/2024', label: '2023/2024' },
    { value: '2024/2025', label: '2024/2025' },
    { value: '2025/2026', label: '2025/2026' }
]

const semesterOptions = [
    { value: 1, label: 'Semester Ganjil (1)' },
    { value: 2, label: 'Semester Genap (2)' }
]

const timezoneOptions = [
    { value: 'Asia/Jakarta', label: 'WIB (Asia/Jakarta)' },
    { value: 'Asia/Makassar', label: 'WITA (Asia/Makassar)' },
    { value: 'Asia/Jayapura', label: 'WIT (Asia/Jayapura)' }
]

const languageOptions = [
    { value: 'id', label: 'Bahasa Indonesia' },
    { value: 'en', label: 'English' }
]

import Skeleton from '@/components/ui/skeleton/Skeleton.vue'

// Fetch Data
const fetchSchoolInfo = async () => {
    loading.value = true
    try {
        // Artificial delay for demo
        await new Promise(resolve => setTimeout(resolve, 800))
        const response = await api.get('/settings/school')
        formData.value = response.data
    } catch (error) {
        console.error('Failed to fetch school info', error)
        errorMessage.value = 'Gagal memuat data sekolah'
    } finally {
        loading.value = false
    }
}

// Save Data
const handleSave = async () => {
    saving.value = true
    successMessage.value = ''
    errorMessage.value = ''

    try {
        // Simulate upload delay if needed
        await api.put('/settings/school', formData.value)
        successMessage.value = 'Pengaturan sekolah berhasil disimpan'

        // Clear success message after 3 seconds
        setTimeout(() => {
            successMessage.value = ''
        }, 3000)
    } catch (error) {
        console.error('Failed to save settings', error)
        errorMessage.value = 'Gagal menyimpan pengaturan'
    } finally {
        saving.value = false
    }
}

// Handle Logo Upload (Simulation)
const handleLogoUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
        // In a real app, we would upload the file here
        // For now, we'll just create a fake URL
        const reader = new FileReader()
        reader.onload = (e) => {
            formData.value.logo = e.target.result
        }
        reader.readAsDataURL(file)
    }
}

onMounted(() => {
    fetchSchoolInfo()
})
</script>

<template>
    <div v-if="loading" class="space-y-6 max-w-4xl mx-auto">
        <div v-for="i in 3" :key="i" class="card bg-base-100 shadow-sm border border-base-200">
            <CardHeader>
                <div class="flex items-center gap-3">
                    <Skeleton class="h-10 w-10 rounded-lg" />
                    <div class="space-y-2">
                        <Skeleton class="h-6 w-48" />
                        <Skeleton class="h-4 w-64" />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div v-for="j in 4" :key="j" class="space-y-2">
                        <Skeleton class="h-3 w-24" />
                        <Skeleton class="h-10 w-full" />
                    </div>
                </div>
            </CardContent>
        </div>
    </div>

    <div v-else class="space-y-6 max-w-4xl mx-auto">
        <!-- Feedback Messages -->
        <Alert v-if="successMessage" class="bg-green-50 border-green-200 text-green-800">
            <AlertDescription>{{ successMessage }}</AlertDescription>
        </Alert>
        <Alert v-if="errorMessage" variant="destructive">
            <AlertDescription>{{ errorMessage }}</AlertDescription>
        </Alert>

        <form @submit.prevent="handleSave" class="space-y-8">

            <!-- 1. Identitas Sekolah -->
            <Card>
                <CardHeader>
                    <div class="flex items-center gap-3">
                        <div class="p-2 bg-primary/10 rounded-lg">
                            <BuildingOffice2Icon class="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle>Identitas Sekolah</CardTitle>
                            <CardDescription>Informasi dasar mengenai profil sekolah</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent class="space-y-6">
                    <div class="flex flex-col md:flex-row gap-8 items-start">
                        <!-- Logo Upload -->
                        <div class="space-y-3 flex-shrink-0">
                            <span class="text-sm font-medium">Logo Sekolah</span>
                            <div class="flex flex-col items-center gap-3">
                                <Avatar :src="formData.logo" :alt="formData.schoolName" fallback="SC"
                                    class="w-32 h-32 border-2 border-border" />
                                <div class="relative">
                                    <input type="file" id="logo-upload" class="hidden" accept="image/*"
                                        @change="handleLogoUpload" />
                                    <Button type="button" variant="outline" size="sm"
                                        onclick="document.getElementById('logo-upload').click()">
                                        <ArrowUpTrayIcon class="w-4 h-4 mr-2" />
                                        Upload Logo
                                    </Button>
                                </div>
                                <p class="text-xs text-muted-foreground text-center max-w-[150px]">
                                    Format: PNG, JPG (Max. 2MB)
                                </p>
                            </div>
                        </div>

                        <!-- Basic Info Fields -->
                        <div class="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput v-model="formData.schoolName" label="Nama Sekolah"
                                placeholder="Contoh: SMA Negeri 1 Jakarta" :required="true" class="md:col-span-2" />

                            <FormInput v-model="formData.npsn" label="NPSN"
                                placeholder="Nomor Pokok Sekolah Nasional" />

                            <FormSelect v-model="formData.accreditation" label="Akreditasi"
                                :options="accreditationOptions" placeholder="Pilih Akreditasi" />

                            <FormInput v-model="formData.principal" label="Kepala Sekolah"
                                placeholder="Nama Kepala Sekolah" class="md:col-span-2" />

                            <FormInput v-model="formData.foundedYear" label="Tahun Berdiri" type="number"
                                placeholder="YYYY" />

                            <FormInput v-model="formData.phone" label="Nomor Telepon" type="tel" />

                            <FormInput v-model="formData.email" label="Email Sekolah" type="email" />

                            <FormInput v-model="formData.website" label="Website" placeholder="https://..." />

                            <FormTextarea v-model="formData.address" label="Alamat Lengkap"
                                placeholder="Jalan, Kelurahan, Kecamatan, Kota/Kabupaten" class="md:col-span-2"
                                rows="3" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <!-- 2. Pengaturan Akademik -->
            <Card>
                <CardHeader>
                    <div class="flex items-center gap-3">
                        <div class="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                            <AcademicCapIcon class="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <CardTitle>Pengaturan Akademik</CardTitle>
                            <CardDescription>Konfigurasi tahun ajaran dan sistem penilaian</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormSelect v-model="formData.academic.currentAcademicYear" label="Tahun Ajaran Aktif"
                        :options="academicYearOptions" />

                    <FormSelect v-model="formData.academic.currentSemester" label="Semester Aktif"
                        :options="semesterOptions" />

                    <FormInput v-model="formData.academic.minimumPassingGrade" label="KKM (Kriteria Ketuntasan Minimal)"
                        type="number" min="0" max="100" />

                    <FormInput v-model="formData.academic.gradingSystem" label="Sistem Penilaian"
                        placeholder="Contoh: 0-100" />
                </CardContent>
            </Card>

            <!-- 3. Pengaturan Sistem -->
            <Card>
                <CardHeader>
                    <div class="flex items-center gap-3">
                        <div class="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                            <ComputerDesktopIcon class="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <CardTitle>Pengaturan Sistem</CardTitle>
                            <CardDescription>Preferensi regional dan notifikasi</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormCombobox v-model="formData.system.timezone" label="Zona Waktu" :options="timezoneOptions"
                        placeholder="Pilih Zona Waktu" search-placeholder="Cari zona waktu..." />

                    <FormCombobox v-model="formData.system.language" label="Bahasa Sistem" :options="languageOptions"
                        placeholder="Pilih Bahasa" search-placeholder="Cari bahasa..." />

                    <div class="md:col-span-2 space-y-4 pt-2">
                        <p class="text-sm font-medium">Notifikasi</p>
                        <FormSwitch v-model="formData.system.emailNotifications" label="Notifikasi Email"
                            description="Kirim notifikasi email untuk aktivitas penting" />
                    </div>
                </CardContent>
            </Card>

            <!-- Action Buttons -->
            <div
                class="flex items-center justify-end gap-4 sticky bottom-6 bg-background/80 backdrop-blur-sm p-4 rounded-lg border border-border shadow-sm">
                <Button type="button" variant="outline" @click="fetchSchoolInfo" :disabled="saving">
                    Reset
                </Button>
                <Button type="submit" :disabled="saving" class="min-w-[120px]">
                    <span v-if="saving">Menyimpan...</span>
                    <span v-else>Simpan Perubahan</span>
                </Button>
            </div>

        </form>
    </div>
</template>
