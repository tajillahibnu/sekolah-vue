<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { MagnifyingGlassIcon, PlusIcon, PencilIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon, EyeIcon } from '@heroicons/vue/24/outline'
import api from '@/services/api'
import Button from '@/components/ui/button/Button.vue'
import FormInput from '@/components/ui/form/FormInput.vue'
import FormSelect from '@/components/ui/form/FormSelect.vue'
import Badge from '@/components/ui/badge/Badge.vue'
import Avatar from '@/components/ui/avatar/Avatar.vue'
import Skeleton from '@/components/ui/skeleton/Skeleton.vue'
import Card from '@/components/ui/card/Card.vue'
import CardHeader from '@/components/ui/card/CardHeader.vue'
import CardTitle from '@/components/ui/card/CardTitle.vue'
import CardDescription from '@/components/ui/card/CardDescription.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import Modal from '@/components/common/Modal.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import UserForm from './UserForm.vue'

// State
const users = ref([])
const loading = ref(false)
const searchQuery = ref('')
const filterRole = ref('all')
const filterStatus = ref('all')

// Modal state
const showModal = ref(false)
const modalMode = ref('create')
const selectedUser = ref(null)

// Confirm dialog
const showConfirmDialog = ref(false)
const userToDelete = ref(null)

// Role options
const roleOptions = [
    { value: 'all', label: 'Semua Role' },
    { value: 'admin', label: 'Admin' },
    { value: 'guru', label: 'Guru' },
    { value: 'kesiswaan', label: 'Kesiswaan' },
    { value: 'kurikulum', label: 'Kurikulum' },
    { value: 'walikelas', label: 'Walikelas' }
]

// Status options
const statusOptions = [
    { value: 'all', label: 'Semua Status' },
    { value: 'active', label: 'Aktif' },
    { value: 'inactive', label: 'Nonaktif' }
]

// Fetch state
const totalUsers = ref(0)
const totalPages = ref(1)
let searchTimeout = null

// Fetch users
const fetchUsers = async () => {
    loading.value = true
    try {
        const response = await api.get('/users', {
            params: {
                search: searchQuery.value,
                role: filterRole.value,
                status: filterStatus.value,
                page: currentPage.value,
                per_page: itemsPerPage.value
            }
        })

        const responseData = response.data.data
        users.value = responseData.data
        totalUsers.value = responseData.total
        totalPages.value = responseData.last_page
        currentPage.value = responseData.current_page
    } catch (error) {
        console.error('Failed to fetch users', error)
    } finally {
        loading.value = false
    }
}

// Pagination state
const currentPage = ref(1)
const itemsPerPage = ref(10)

const changePage = (page) => {
    currentPage.value = page
    fetchUsers()
}

// Reset page and fetch when filters change
watch([filterRole, filterStatus], () => {
    currentPage.value = 1
    fetchUsers()
})

// Debounce setup for search query
watch(searchQuery, () => {
    if (searchTimeout) clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        currentPage.value = 1
        fetchUsers()
    }, 500)
})

// Handle add user
const handleAddUser = () => {
    modalMode.value = 'create'
    selectedUser.value = null
    showModal.value = true
}

// Handle view user
const handleViewUser = (user) => {
    modalMode.value = 'view'
    selectedUser.value = { ...user }
    showModal.value = true
}

// Handle edit user
const handleEditUser = (user) => {
    modalMode.value = 'edit'
    selectedUser.value = { ...user }
    showModal.value = true
}

// Handle delete user
const handleDeleteUser = (user) => {
    userToDelete.value = user
    showConfirmDialog.value = true
}

// Confirm delete
const confirmDelete = async () => {
    try {
        await api.delete(`/users/${userToDelete.value.id}`)
        await fetchUsers()
        showConfirmDialog.value = false
        userToDelete.value = null
    } catch (error) {
        console.error('Failed to delete user', error)
    }
}

// Handle form submit
const handleFormSubmit = async (payload) => {
    try {
        const { submitData, id } = payload;
        if (modalMode.value === 'create') {
            await api.post('/users', submitData)
        } else {
            await api.put(`/users/${id}`, submitData)
        }
        await fetchUsers()
        showModal.value = false
    } catch (error) {
        console.error('Failed to save user', error)
        // Add robust error handling if needed, like displaying toast
    }
}

// Get status badge variant
const getStatusVariant = (status) => {
    return status === 'active' ? 'default' : 'secondary'
}

// Get role badge color
const getRoleBadgeVariant = (role) => {
    const variants = {
        'Admin': 'destructive',
        'Guru': 'default',
        'Kesiswaan': 'secondary',
        'Kurikulum': 'secondary',
        'Walikelas': 'secondary'
    }
    return variants[role] || 'outline'
}

// Format date
const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
}

onMounted(() => {
    fetchUsers()
})
</script>

<template>
    <div class="space-y-6">
        <!-- Header Title Content -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h1 class="text-2xl font-bold tracking-tight text-foreground">Users Management</h1>
                <p class="text-muted-foreground mt-1">Kelola pengguna sistem sekolah secara menyeluruh dan atur hak
                    akses.</p>
            </div>
            <Button @click="handleAddUser"
                class="shadow-md shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200 rounded-lg px-6 h-10">
                <PlusIcon class="w-5 h-5 mr-2" />
                Tambah User
            </Button>
        </div>

        <!-- Main Content -->
        <Card
            class="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-800/60 shadow-xl rounded-xl overflow-hidden transition-all duration-300">
            <CardContent class="pt-6">
                <!-- Filters -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <FormInput v-model="searchQuery" placeholder="Cari nama atau email..." type="search">
                        <template #prefix>
                            <MagnifyingGlassIcon class="w-4 h-4 text-muted-foreground" />
                        </template>
                    </FormInput>

                    <FormSelect v-model="filterRole" :options="roleOptions" placeholder="Filter Role" />

                    <FormSelect v-model="filterStatus" :options="statusOptions" placeholder="Filter Status" />
                </div>

                <!-- Loading State -->
                <div v-if="loading" class="overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="border-b border-border">
                                <th class="text-center py-3 px-4 text-sm font-medium text-muted-foreground w-16">No</th>
                                <th class="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                                <th class="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Role</th>
                                <th class="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                                <th class="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Bergabung</th>
                                <th class="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="i in 5" :key="i" class="border-b border-border">
                                <td class="py-3 px-4 text-center">
                                    <Skeleton class="h-4 w-6 mx-auto" />
                                </td>
                                <td class="py-3 px-4">
                                    <div class="flex items-center gap-3">
                                        <Skeleton class="h-10 w-10 rounded-full" />
                                        <div class="space-y-1.5">
                                            <Skeleton class="h-4 w-32" />
                                            <Skeleton class="h-3 w-40" />
                                            <Skeleton class="h-3 w-24" />
                                        </div>
                                    </div>
                                </td>
                                <td class="py-3 px-4">
                                    <Skeleton class="h-6 w-16 rounded-full" />
                                </td>
                                <td class="py-3 px-4">
                                    <Skeleton class="h-6 w-16 rounded-full" />
                                </td>
                                <td class="py-3 px-4">
                                    <Skeleton class="h-4 w-28" />
                                </td>
                                <td class="py-3 px-4">
                                    <div class="flex justify-end gap-2">
                                        <Skeleton class="h-8 w-8" />
                                        <Skeleton class="h-8 w-8" />
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Users Table -->
                <div v-else-if="users.length > 0" class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-muted/30 dark:bg-muted/10">
                            <tr>
                                <th
                                    class="text-center py-4 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 rounded-tl-xl w-16">
                                    No
                                </th>
                                <th
                                    class="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                                    User</th>
                                <th
                                    class="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                                    Role</th>
                                <th
                                    class="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                                    Status</th>
                                <th
                                    class="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                                    Bergabung</th>
                                <th
                                    class="text-right py-4 px-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 rounded-tr-xl">
                                    Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-border/40">
                            <tr v-for="(user, index) in users" :key="user.id"
                                class="hover:bg-primary/5 hover:shadow-[0_0_15px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_0_15px_rgba(255,255,255,0.02)] transition-all duration-200 group">
                                <td class="py-4 px-4 text-center">
                                    <span class="text-sm font-medium text-muted-foreground">{{ (currentPage - 1) *
                                        itemsPerPage + index
                                        + 1 }}</span>
                                </td>
                                <td class="py-4 px-6 relative">
                                    <div class="flex items-center gap-4">
                                        <Avatar :src="user.avatar" :alt="user.name"
                                            class="ring-2 ring-primary/10 shadow-sm"
                                            :fallback="user.name.split(' ').map(n => n[0]).join('')" />
                                        <div class="flex flex-col">
                                            <p
                                                class="font-semibold text-foreground/90 group-hover:text-primary transition-colors">
                                                {{ user.name }}</p>
                                            <p class="text-sm text-muted-foreground mt-0.5">{{ user.email }}</p>
                                            <p class="text-xs text-muted-foreground/70 mt-0.5">{{ user.phone }}</p>
                                        </div>
                                    </div>
                                </td>
                                <td class="py-4 px-6">
                                    <Badge :variant="getRoleBadgeVariant(user.primaryRole)"
                                        class="shadow-sm font-medium tracking-wide">
                                        {{ user.primaryRole }}
                                    </Badge>
                                </td>
                                <td class="py-4 px-6">
                                    <Badge :variant="getStatusVariant(user.status)" class="shadow-sm font-medium">
                                        {{ user.status === 'active' ? 'Aktif' : 'Nonaktif' }}
                                    </Badge>
                                </td>
                                <td class="py-4 px-6">
                                    <span class="text-xs text-muted-foreground font-medium">{{ formatDate(user.joinDate)
                                    }}</span>
                                </td>
                                <td class="py-4 px-6">
                                    <div
                                        class="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="sm" @click="handleViewUser(user)"
                                            class="hover:bg-info/10 hover:text-info rounded-lg transition-colors">
                                            <EyeIcon
                                                class="w-4 h-4 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200" />
                                        </Button>
                                        <Button variant="ghost" size="sm" @click="handleEditUser(user)"
                                            class="hover:bg-primary/10 hover:text-primary rounded-lg transition-colors">
                                            <PencilIcon class="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" @click="handleDeleteUser(user)"
                                            class="hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors">
                                            <TrashIcon class="w-4 h-4 text-destructive" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Pagination Controls -->
                <div v-if="!loading && users.length > 0" class="flex items-center justify-between mt-6 px-2">
                    <p class="text-sm text-muted-foreground">
                        Menampilkan <span class="font-medium text-foreground">{{ totalUsers === 0 ? 0 : ((currentPage -
                            1) *
                            itemsPerPage) + 1
                            }}</span>
                        hingga <span class="font-medium text-foreground">{{ Math.min(currentPage * itemsPerPage,
                            totalUsers)
                        }}</span>
                        dari <span class="font-medium text-foreground">{{ totalUsers }}</span> hasil
                    </p>
                    <div class="flex items-center gap-2">
                        <Button variant="outline" size="sm" class="w-9 h-9 p-0 rounded-lg hover:bg-muted/50"
                            :disabled="currentPage <= 1" @click="changePage(currentPage - 1)">
                            <ChevronLeftIcon class="w-4 h-4" />
                        </Button>
                        <div class="text-sm font-medium px-4">
                            Halaman {{ currentPage }} dari {{ totalPages === 0 ? 1 : totalPages }}
                        </div>
                        <Button variant="outline" size="sm" class="w-9 h-9 p-0 rounded-lg hover:bg-muted/50"
                            :disabled="currentPage >= totalPages || totalPages === 0"
                            @click="changePage(currentPage + 1)">
                            <ChevronRightIcon class="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <!-- Empty State -->
                <div v-else-if="!loading && users.length === 0"
                    class="flex flex-col items-center justify-center py-20 px-4 text-center bg-muted/10 rounded-xl border border-dashed border-border/60 mt-4">
                    <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <MagnifyingGlassIcon class="w-8 h-8 text-primary/60" />
                    </div>
                    <h3 class="text-lg font-semibold text-foreground/90 mb-1">Tidak ada user ditemukan</h3>
                    <p class="text-sm text-muted-foreground max-w-sm">Coba sesuaikan kata kunci pencarian atau ubah
                        filter role/status
                        untuk menemukan user yang Anda cari.</p>
                    <Button variant="outline" class="mt-6 rounded-lg hover:bg-primary/5 transition-colors"
                        @click="searchQuery = ''; filterRole = 'all'; filterStatus = 'all'">
                        Reset Filter
                    </Button>
                </div>
            </CardContent>
        </Card>

        <!-- User Modal -->
        <Modal :show="showModal"
            :title="modalMode === 'create' ? 'Tambah User Baru' : (modalMode === 'view' ? 'Detail User' : 'Edit User')"
            @close="showModal = false">

            <div v-if="modalMode === 'view' && selectedUser" class="space-y-6">
                <div class="flex items-center gap-4 bg-muted/20 p-4 rounded-xl border border-border/50">
                    <Avatar :src="selectedUser.avatar" :alt="selectedUser.name" class="w-16 h-16 ring-2 ring-primary/20"
                        :fallback="selectedUser.name.split(' ').map(n => n[0]).join('')" />
                    <div>
                        <h3 class="text-lg font-semibold text-foreground">{{ selectedUser.name }}</h3>
                        <p class="text-sm text-muted-foreground">{{ selectedUser.email }}</p>
                        <div class="flex items-center gap-2 mt-2">
                            <Badge :variant="getStatusVariant(selectedUser.status)">{{ selectedUser.status === 'active'
                                ?
                                'Aktif' : 'Nonaktif' }}</Badge>
                            <Badge :variant="getRoleBadgeVariant(selectedUser.primaryRole)">{{ selectedUser.primaryRole
                            }}
                            </Badge>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="space-y-1 bg-white dark:bg-slate-900 p-3 rounded-lg border border-border/40">
                        <p class="text-xs text-muted-foreground uppercase font-medium">Nomor Telepon</p>
                        <p class="text-sm font-medium text-foreground">{{ selectedUser.phone || '-' }}</p>
                    </div>
                    <div class="space-y-1 bg-white dark:bg-slate-900 p-3 rounded-lg border border-border/40">
                        <p class="text-xs text-muted-foreground uppercase font-medium">Tanggal Bergabung</p>
                        <p class="text-sm font-medium text-foreground">{{ formatDate(selectedUser.joinDate) }}</p>
                    </div>
                </div>

                <div class="space-y-2">
                    <p class="text-xs text-muted-foreground uppercase font-medium">Role Tambahan (Akses Sistem)</p>
                    <div class="flex flex-wrap gap-2">
                        <p v-if="!selectedUser.roles_array || selectedUser.roles_array.length === 0"
                            class="text-sm italic text-muted-foreground/70">
                            Tidak ada hak akses tambahan
                        </p>
                        <Badge v-else v-for="role in selectedUser.roles_array" :key="role" variant="outline"
                            class="text-xs px-3 py-1 bg-muted/10 border-border/60">
                            {{ role }}
                        </Badge>
                    </div>
                </div>

                <div class="flex justify-end pt-4 border-t border-border/50">
                    <Button variant="outline" @click="showModal = false" class="rounded-lg px-6">
                        Tutup
                    </Button>
                </div>
            </div>

            <UserForm v-else :mode="modalMode" :model-value="selectedUser" @submit="handleFormSubmit"
                @cancel="showModal = false" />
        </Modal>

        <!-- Confirm Dialog -->
        <ConfirmDialog :show="showConfirmDialog" title="Hapus User"
            :message="`Apakah Anda yakin ingin menghapus user ${userToDelete?.name}?`" type="danger"
            @confirm="confirmDelete" @cancel="showConfirmDialog = false" />
    </div>
</template>
