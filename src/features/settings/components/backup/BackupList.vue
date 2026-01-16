<script setup>
import { ref, onMounted } from 'vue'
import {
    CloudArrowUpIcon,
    ArrowPathIcon,
    TrashIcon,
    CircleStackIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ArrowDownTrayIcon,
    InboxArrowDownIcon,
    DocumentArrowUpIcon
} from '@heroicons/vue/24/outline'
import api from '@/services/api'
import { useToast } from '@/composables/useToast'
import Button from '@/components/ui/button/Button.vue'
import Card from '@/components/ui/card/Card.vue'
import CardHeader from '@/components/ui/card/CardHeader.vue'
import CardTitle from '@/components/ui/card/CardTitle.vue'
import CardDescription from '@/components/ui/card/CardDescription.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import Skeleton from '@/components/ui/skeleton/Skeleton.vue'
import Badge from '@/components/ui/badge/Badge.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const { success, error: toastError } = useToast()

const activeTab = ref('backups')
const backups = ref([])
const loading = ref(true)
const backupInProgress = ref(false)
const exporting = ref(false)
const importing = ref(false)
const fileInput = ref(null)

// Confirm dialog state
const showConfirmRestore = ref(false)
const showConfirmDelete = ref(false)
const selectedBackup = ref(null)

const fetchBackups = async () => {
    loading.value = true
    try {
        // Artificial delay for skeleton demo
        await new Promise(resolve => setTimeout(resolve, 800))
        const response = await api.get('/settings/backups')
        backups.value = response.data
    } catch (err) {
        console.error('Failed to fetch backups', err)
        toastError('Gagal memuat daftar backup')
    } finally {
        loading.value = false
    }
}

const handleCreateBackup = async () => {
    backupInProgress.value = true
    try {
        // Simulate backup time
        await new Promise(resolve => setTimeout(resolve, 2000))
        await api.post('/settings/backups')
        await fetchBackups()
        success('Backup berhasil dibuat')
    } catch (err) {
        console.error('Failed to create backup', err)
        toastError('Gagal membuat backup')
    } finally {
        backupInProgress.value = false
    }
}

const handleDownload = (backup) => {
    const data = JSON.stringify(backup, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `backup_${backup.id}_${new Date(backup.date).getTime()}.json`
    link.click()
    URL.revokeObjectURL(url)
    success('Download dimulai')
}

const handleExportAll = async () => {
    exporting.value = true
    try {
        const response = await api.post('/settings/export')
        const { data, filename } = response.data
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        link.click()
        URL.revokeObjectURL(url)
        success('Seluruh data berhasil diekspor')
    } catch (err) {
        console.error('Failed to export data', err)
        toastError('Gagal mengekspor data')
    } finally {
        exporting.value = false
    }
}

const triggerImport = () => {
    fileInput.value.click()
}

const handleImport = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
        try {
            const data = e.target.result
            importing.value = true
            await api.post('/settings/import', data)
            success('Data berhasil diimpor')
            // Reload page to reflect changes
            setTimeout(() => window.location.reload(), 1500)
        } catch (err) {
            console.error('Failed to import data', err)
            toastError('Gagal mengimpor data: Format tidak valid')
        } finally {
            importing.value = false
            event.target.value = '' // Reset input
        }
    }
    reader.readAsText(file)
}

const handleRestore = (backup) => {
    selectedBackup.value = backup
    showConfirmRestore.value = true
}

const confirmRestore = async () => {
    try {
        await api.post(`/settings/backups/${selectedBackup.value.id}/restore`)
        success('Database berhasil dipulihkan')
        showConfirmRestore.value = false
    } catch (err) {
        console.error('Failed to restore backup', err)
        toastError('Gagal memulihkan database')
    }
}

const handleDelete = (backup) => {
    selectedBackup.value = backup
    showConfirmDelete.value = true
}

const confirmDelete = async () => {
    try {
        await api.delete(`/settings/backups/${selectedBackup.value.id}`)
        await fetchBackups()
        success('Backup berhasil dihapus')
        showConfirmDelete.value = false
    } catch (err) {
        console.error('Failed to delete backup', err)
        toastError('Gagal menghapus backup')
    }
}

const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

onMounted(() => {
    fetchBackups()
})
</script>

<template>
    <div class="space-y-6">
        <!-- Tabs -->
        <div class="flex gap-1 p-1 bg-muted rounded-xl w-fit">
            <button class="px-6 py-2 rounded-lg text-sm font-medium transition-all"
                :class="activeTab === 'backups' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
                @click="activeTab = 'backups'">
                Backups
            </button>
            <button class="px-6 py-2 rounded-lg text-sm font-medium transition-all"
                :class="activeTab === 'exchange' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
                @click="activeTab = 'exchange'">
                Ekspor & Impor
            </button>
        </div>

        <!-- Backups Tab Content -->
        <div v-if="activeTab === 'backups'" class="space-y-6">
            <Card>
                <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-7">
                    <div class="space-y-1">
                        <CardTitle class="text-2xl font-bold flex items-center gap-2">
                            <CircleStackIcon class="w-6 h-6 text-primary" />
                            Riwayat Backup
                        </CardTitle>
                        <CardDescription>
                            Kelola cadangan data sistem sekolah untuk keamanan data Anda.
                        </CardDescription>
                    </div>
                    <Button :disabled="backupInProgress" @click="handleCreateBackup">
                        <CloudArrowUpIcon v-if="!backupInProgress" class="w-4 h-4 mr-2" />
                        <ArrowPathIcon v-else class="w-4 h-4 mr-2 animate-spin" />
                        {{ backupInProgress ? 'Memproses...' : 'Backup Sekarang' }}
                    </Button>
                </CardHeader>
                <CardContent>
                    <!-- Loading State -->
                    <div v-if="loading" class="space-y-4">
                        <div v-for="i in 3" :key="i"
                            class="flex items-center justify-between p-4 border border-border rounded-lg">
                            <div class="space-y-2">
                                <Skeleton class="h-5 w-48" />
                                <Skeleton class="h-4 w-32" />
                            </div>
                            <div class="flex gap-2">
                                <Skeleton class="h-9 w-24" />
                                <Skeleton class="h-9 w-24" />
                            </div>
                        </div>
                    </div>

                    <!-- Empty State -->
                    <div v-else-if="backups.length === 0"
                        class="text-center py-12 bg-muted/20 border-2 border-dashed border-border rounded-xl">
                        <CircleStackIcon class="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                        <h3 class="text-lg font-medium">Belum ada backup</h3>
                        <p class="text-muted-foreground max-w-xs mx-auto mt-1">
                            Anda belum memiliki riwayat backup data.
                        </p>
                    </div>

                    <!-- Backup List -->
                    <div v-else class="space-y-4">
                        <div v-for="backup in backups" :key="backup.id"
                            class="flex flex-col md:flex-row md:items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors gap-4">
                            <div class="flex items-start gap-4">
                                <div class="p-2 bg-primary/10 rounded-lg shrink-0">
                                    <CheckCircleIcon class="w-6 h-6 text-primary" />
                                </div>
                                <div class="min-w-0">
                                    <div class="flex items-center gap-2 flex-wrap">
                                        <p class="font-semibold">{{ formatDate(backup.date) }}</p>
                                        <Badge variant="outline" class="text-[10px] uppercase font-bold tracking-wider">
                                            {{ backup.version }}
                                        </Badge>
                                    </div>
                                    <div class="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                        <span>Ukuran: {{ backup.size }}</span>
                                        <span>•</span>
                                        <span class="text-green-600 font-medium">Status: {{ backup.status }}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center gap-2 shrink-0 self-end md:self-center">
                                <Button variant="outline" size="sm" @click="handleDownload(backup)"
                                    title="Download file JSON">
                                    <ArrowDownTrayIcon class="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm" @click="handleRestore(backup)">
                                    <ArrowPathIcon class="w-4 h-4 mr-2" />
                                    Restore
                                </Button>
                                <Button variant="ghost" size="sm" class="text-destructive hover:bg-destructive/10"
                                    @click="handleDelete(backup)">
                                    <TrashIcon class="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <!-- Informational Card -->
            <Card class="bg-blue-50/50 border-blue-200">
                <CardContent class="pt-6">
                    <div class="flex gap-4">
                        <ExclamationTriangleIcon class="w-6 h-6 text-blue-600 shrink-0" />
                        <div class="space-y-1">
                            <h4 class="font-bold text-blue-900">Penting: Penyimpanan Backup</h4>
                            <p class="text-sm text-blue-800 leading-relaxed">
                                Secara default, backup hanya disimpan di server lokal. Kami sangat menyarankan untuk
                                mengunduh file backup secara berkala dan menyimpannya di media penyimpanan eksternal
                                atau cloud storage untuk keamanan ekstra.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        <!-- Data Exchange Tab Content -->
        <div v-else-if="activeTab === 'exchange'" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Export Card -->
                <Card>
                    <CardHeader>
                        <CardTitle class="flex items-center gap-2">
                            <ArrowDownTrayIcon class="w-5 h-5 text-primary" />
                            Ekspor Seluruh Data
                        </CardTitle>
                        <CardDescription>
                            Unduh seluruh database sistem sekolah dalam satu file JSON.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p class="text-sm text-muted-foreground mb-6">
                            Fitur ini berguna untuk melakukan migrasi data atau menyimpan salinan lengkap database di
                            perangkat lokal Anda sendiri.
                        </p>
                        <Button class="w-full" :disabled="exporting" @click="handleExportAll">
                            <InboxArrowDownIcon v-if="!exporting" class="w-4 h-4 mr-2" />
                            <ArrowPathIcon v-else class="w-4 h-4 mr-2 animate-spin" />
                            {{ exporting ? 'Mengekspor...' : 'Mulai Ekspor (JSON)' }}
                        </Button>
                    </CardContent>
                </Card>

                <!-- Import Card -->
                <Card>
                    <CardHeader>
                        <CardTitle class="flex items-center gap-2">
                            <DocumentArrowUpIcon class="w-5 h-5 text-primary" />
                            Impor Data
                        </CardTitle>
                        <CardDescription>
                            Unggah file JSON hasil ekspor untuk memulihkan seluruh data.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p class="text-sm text-amber-600 font-medium mb-6">
                            <ExclamationTriangleIcon class="w-4 h-4 inline mr-1" />
                            Peringatan: Mengimpor data akan menimpa seluruh data yang saat ini ada di sistem.
                        </p>
                        <input type="file" ref="fileInput" class="hidden" accept=".json" @change="handleImport" />
                        <Button variant="outline" class="w-full" :disabled="importing" @click="triggerImport">
                            <DocumentArrowUpIcon v-if="!importing" class="w-4 h-4 mr-2" />
                            <ArrowPathIcon v-else class="w-4 h-4 mr-2 animate-spin" />
                            {{ importing ? 'Mengimpor...' : 'Pilih File & Impor' }}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>

        <!-- Confirm Restore -->
        <ConfirmDialog :show="showConfirmRestore" title="Restore Database"
            :message="`Apakah Anda yakin ingin memulihkan database menggunakan backup tanggal ${selectedBackup ? formatDate(selectedBackup.date) : ''}? Data saat ini akan ditimpa.`"
            type="warning" @confirm="confirmRestore" @cancel="showConfirmRestore = false" />

        <!-- Confirm Delete -->
        <ConfirmDialog :show="showConfirmDelete" title="Hapus Backup"
            :message="`Konfirmasi penghapusan backup file tanggal ${selectedBackup ? formatDate(selectedBackup.date) : ''}. Tindakan ini tidak dapat dibatalkan.`"
            type="error" @confirm="confirmDelete" @cancel="showConfirmDelete = false" />
    </div>
</template>
