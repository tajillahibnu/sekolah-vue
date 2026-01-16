<script setup>
import { ref, watch } from 'vue'
import Button from '@/components/ui/button/Button.vue'
import FormInput from '@/components/ui/form/FormInput.vue'
import FormSelect from '@/components/ui/form/FormSelect.vue'
import FormSwitch from '@/components/ui/form/FormSwitch.vue'

const props = defineProps({
    modelValue: {
        type: Object,
        default: null
    },
    mode: {
        type: String,
        default: 'create',
        validator: (value) => ['create', 'edit'].includes(value)
    }
})

const emit = defineEmits(['submit', 'cancel'])

// Form data
const formData = ref({
    id: '',
    name: '',
    email: '',
    role: 'Guru',
    phone: '',
    status: 'active',
    password: '',
    confirmPassword: '',
    joinDate: new Date().toISOString().split('T')[0],
    avatar: ''
})

// Errors
const errors = ref({})

// Watch for modelValue changes (edit mode)
watch(() => props.modelValue, (newValue) => {
    if (newValue) {
        formData.value = {
            ...newValue,
            password: '',
            confirmPassword: ''
        }
    }
}, { immediate: true })

// Role options
const roleOptions = [
    { value: 'Admin', label: 'Administrator' },
    { value: 'Guru', label: 'Guru' },
    { value: 'Kesiswaan', label: 'Kesiswaan' },
    { value: 'Kurikulum', label: 'Kurikulum' },
    { value: 'Walikelas', label: 'Wali Kelas' }
]

// Validate form
const validateForm = () => {
    errors.value = {}

    if (!formData.value.name) {
        errors.value.name = 'Nama wajib diisi'
    }

    if (!formData.value.email) {
        errors.value.email = 'Email wajib diisi'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
        errors.value.email = 'Format email tidak valid'
    }

    if (!formData.value.phone) {
        errors.value.phone = 'Telepon wajib diisi'
    } else if (!/^08\d{8,11}$/.test(formData.value.phone)) {
        errors.value.phone = 'Format telepon tidak valid (contoh: 081234567890)'
    }

    // Password validation for new user
    if (props.mode === 'create') {
        if (!formData.value.password) {
            errors.value.password = 'Password wajib diisi'
        } else if (formData.value.password.length < 8) {
            errors.value.password = 'Password minimal 8 karakter'
        }

        if (formData.value.password !== formData.value.confirmPassword) {
            errors.value.confirmPassword = 'Password tidak cocok'
        }
    } else {
        // Password validation for edit (optional)
        if (formData.value.password && formData.value.password.length < 8) {
            errors.value.password = 'Password minimal 8 karakter'
        }

        if (formData.value.password && formData.value.password !== formData.value.confirmPassword) {
            errors.value.confirmPassword = 'Password tidak cocok'
        }
    }

    return Object.keys(errors.value).length === 0
}

// Handle submit
const handleSubmit = () => {
    if (validateForm()) {
        // Generate avatar if not exists
        if (!formData.value.avatar) {
            const colors = ['6366F1', '10B981', 'F59E0B', '8B5CF6', 'EC4899', '14B8A6', '3B82F6', 'EF4444']
            const randomColor = colors[Math.floor(Math.random() * colors.length)]
            formData.value.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.value.name)}&background=${randomColor}&color=fff`
        }

        // Generate ID for new user
        if (props.mode === 'create') {
            formData.value.id = `usr${Date.now().toString().slice(-6)}`
        }

        // Remove password fields if empty (edit mode)
        const submitData = { ...formData.value }
        delete submitData.confirmPassword
        if (props.mode === 'edit' && !submitData.password) {
            delete submitData.password
        }

        emit('submit', submitData)
    }
}

// Handle cancel
const handleCancel = () => {
    emit('cancel')
}
</script>

<template>
    <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
                <FormInput v-model="formData.name" label="Nama Lengkap" placeholder="Masukkan nama lengkap"
                    :required="true" :error="errors.name" />
            </div>

            <FormInput v-model="formData.email" label="Email" type="email" placeholder="email@sekolah.id"
                :required="true" :error="errors.email" />

            <FormInput v-model="formData.phone" label="Telepon" type="tel" placeholder="081234567890" :required="true"
                :error="errors.phone" />

            <FormSelect v-model="formData.role" label="Role" :options="roleOptions" :required="true" />

            <FormInput v-model="formData.joinDate" label="Tanggal Bergabung" type="date" :required="true" />

            <div class="md:col-span-2">
                <FormSwitch v-model="formData.status" :checked="formData.status === 'active'"
                    @update:checked="formData.status = $event ? 'active' : 'inactive'" label="Status Aktif"
                    description="User dapat login dan mengakses sistem" />
            </div>

            <div class="md:col-span-2">
                <h3 class="text-sm font-medium mb-4">
                    {{ mode === 'create' ? 'Password' : 'Ubah Password (Opsional)' }}
                </h3>
            </div>

            <FormInput v-model="formData.password" label="Password" type="password" placeholder="Minimal 8 karakter"
                :required="mode === 'create'" :error="errors.password" />

            <FormInput v-model="formData.confirmPassword" label="Konfirmasi Password" type="password"
                placeholder="Ulangi password" :required="mode === 'create'" :error="errors.confirmPassword" />
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" @click="handleCancel">
                Batal
            </Button>
            <Button type="submit">
                {{ mode === 'create' ? 'Tambah User' : 'Simpan Perubahan' }}
            </Button>
        </div>
    </form>
</template>
