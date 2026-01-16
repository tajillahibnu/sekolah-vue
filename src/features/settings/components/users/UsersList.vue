<script setup>
import { ref, computed, onMounted } from 'vue'
import { MagnifyingGlassIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'
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
    { value: 'Admin', label: 'Admin' },
    { value: 'Guru', label: 'Guru' },
    { value: 'Kesiswaan', label: 'Kesiswaan' },
    { value: 'Kurikulum', label: 'Kurikulum' },
    { value: 'Walikelas', label: 'Walikelas' }
]

// Status options
const statusOptions = [
    { value: 'all', label: 'Semua Status' },
    { value: 'active', label: 'Aktif' },
    { value: 'inactive', label: 'Nonaktif' }
]

// Fetch users
const fetchUsers = async () => {
    loading.value = true
    try {
        // Artificial delay for demo
        await new Promise(resolve => setTimeout(resolve, 800))
        const response = await api.get('/settings/users')
        users.value = response.data
    } catch (error) {
        console.error('Failed to fetch users', error)
    } finally {
        loading.value = false
    }
}

// Filtered users
const filteredUsers = computed(() => {
    let filtered = users.value

    // Search
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(user =>
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query)
        )
    }

    // Filter by role
    if (filterRole.value !== 'all') {
        filtered = filtered.filter(user => user.role === filterRole.value)
    }

    // Filter by status
    if (filterStatus.value !== 'all') {
        filtered = filtered.filter(user => user.status === filterStatus.value)
    }

    return filtered
})

// Handle add user
const handleAddUser = () => {
    modalMode.value = 'create'
    selectedUser.value = null
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
        await api.delete(`/settings/users/${userToDelete.value.id}`)
        await fetchUsers()
        showConfirmDialog.value = false
        userToDelete.value = null
    } catch (error) {
        console.error('Failed to delete user', error)
    }
}

// Handle form submit
const handleFormSubmit = async (formData) => {
    try {
        if (modalMode.value === 'create') {
            await api.post('/settings/users', formData)
        } else {
            await api.put(`/settings/users/${formData.id}`, formData)
        }
        await fetchUsers()
        showModal.value = false
    } catch (error) {
        console.error('Failed to save user', error)
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
        <Card>
            <CardHeader>
                <div class="flex items-center justify-between">
                    <div>
                        <CardTitle>Users Management</CardTitle>
                        <CardDescription>Kelola pengguna sistem sekolah</CardDescription>
                    </div>
                    <Button @click="handleAddUser">
                        <PlusIcon class="w-4 h-4 mr-2" />
                        Tambah User
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
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
                                <th class="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                                <th class="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                                <th class="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Role</th>
                                <th class="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                                <th class="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Bergabung</th>
                                <th class="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="i in 5" :key="i" class="border-b border-border">
                                <td class="py-3 px-4">
                                    <div class="flex items-center gap-3">
                                        <Skeleton class="h-10 w-10 rounded-full" />
                                        <div class="space-y-2">
                                            <Skeleton class="h-4 w-32" />
                                            <Skeleton class="h-3 w-24" />
                                        </div>
                                    </div>
                                </td>
                                <td class="py-3 px-4">
                                    <Skeleton class="h-4 w-48" />
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
                <div v-else-if="filteredUsers.length > 0" class="overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="border-b border-border">
                                <th class="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                                <th class="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                                <th class="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Role</th>
                                <th class="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                                <th class="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Bergabung</th>
                                <th class="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="user in filteredUsers" :key="user.id"
                                class="border-b border-border hover:bg-muted/50 transition-colors">
                                <td class="py-3 px-4">
                                    <div class="flex items-center gap-3">
                                        <Avatar :src="user.avatar" :alt="user.name"
                                            :fallback="user.name.split(' ').map(n => n[0]).join('')" />
                                        <div>
                                            <p class="font-medium">{{ user.name }}</p>
                                            <p class="text-sm text-muted-foreground">{{ user.phone }}</p>
                                        </div>
                                    </div>
                                </td>
                                <td class="py-3 px-4">
                                    <span class="text-sm">{{ user.email }}</span>
                                </td>
                                <td class="py-3 px-4">
                                    <Badge :variant="getRoleBadgeVariant(user.role)">
                                        {{ user.role }}
                                    </Badge>
                                </td>
                                <td class="py-3 px-4">
                                    <Badge :variant="getStatusVariant(user.status)">
                                        {{ user.status === 'active' ? 'Aktif' : 'Nonaktif' }}
                                    </Badge>
                                </td>
                                <td class="py-3 px-4">
                                    <span class="text-sm text-muted-foreground">{{ formatDate(user.joinDate) }}</span>
                                </td>
                                <td class="py-3 px-4">
                                    <div class="flex items-center justify-end gap-2">
                                        <Button variant="ghost" size="sm" @click="handleEditUser(user)">
                                            <PencilIcon class="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" @click="handleDeleteUser(user)">
                                            <TrashIcon class="w-4 h-4 text-destructive" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Empty State -->
                <div v-else class="text-center py-12">
                    <p class="text-muted-foreground">Tidak ada user ditemukan</p>
                </div>
            </CardContent>
        </Card>

        <!-- User Modal -->
        <Modal :show="showModal" :title="modalMode === 'create' ? 'Tambah User Baru' : 'Edit User'"
            @close="showModal = false">
            <UserForm :mode="modalMode" :model-value="selectedUser" @submit="handleFormSubmit"
                @cancel="showModal = false" />
        </Modal>

        <!-- Confirm Dialog -->
        <ConfirmDialog :show="showConfirmDialog" title="Hapus User"
            :message="`Apakah Anda yakin ingin menghapus user ${userToDelete?.name}?`" type="danger"
            @confirm="confirmDelete" @cancel="showConfirmDialog = false" />
    </div>
</template>
