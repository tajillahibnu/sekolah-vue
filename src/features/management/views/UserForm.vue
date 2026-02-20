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
    primaryRole: 'Siswa',
    roles: [],
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
            primaryRole: newValue.primaryRole || 'Siswa',
            roles: newValue.roles_array && newValue.roles_array.length > 0 ? newValue.roles_array.map(r => r.toLowerCase()) : [],
            password: '',
            confirmPassword: ''
        }
    }
}, { immediate: true })

// Primary Role options
const primaryRoleOptions = [
    { value: 'Siswa', label: 'Siswa' },
    { value: 'Guru', label: 'Guru' },
    { value: 'Karyawan', label: 'Karyawan' }
]

// Additional Role options (Spatie)
const roleOptions = [
    { value: 'admin', label: 'Administrator' },
    { value: 'guru', label: 'Guru' },
    { value: 'kesiswaan', label: 'Kesiswaan' },
    { value: 'kurikulum', label: 'Kurikulum' },
    { value: 'walikelas', label: 'Wali Kelas' }
]

// Toggle Role Function
const toggleRole = (roleValue) => {
    const index = formData.value.roles.indexOf(roleValue)
    if (index === -1) {
        formData.value.roles.push(roleValue)
    } else {
        // Prevent unselecting last role if desired, but here we allow empty array and validate
        formData.value.roles.splice(index, 1)
    }
}

// Validate form
const validateForm = () => {
    errors.value = {}

    if (!formData.value.name) {
        errors.value.name = 'Nama wajib diisi'
    }

    if (!formData.value.primaryRole) {
        errors.value.primaryRole = 'Role utama wajib dipilih'
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
        // Generate auto ID for mock earlier, now handled by DB
        const submitData = {
            name: formData.value.name,
            email: formData.value.email,
            phone: formData.value.phone,
            primaryRole: formData.value.primaryRole,
            status: formData.value.status,
            joinDate: formData.value.joinDate,
            roles: formData.value.roles,
        }

        if (props.mode === 'create') {
            submitData.password = formData.value.password;
        } else if (props.mode === 'edit' && formData.value.password) {
            submitData.password = formData.value.password;
        }

        // Emit submit event with properly formatted payload
        emit('submit', { ...formData.value, submitData })
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

            <FormSelect v-model="formData.primaryRole" label="Role Utama" :options="primaryRoleOptions" :required="true"
                :error="errors.primaryRole" />

            <div class="space-y-2">
                <label class="text-sm font-medium leading-none text-foreground">
                    Role Tambahan (Opsional)
                </label>
                <div class="flex flex-wrap gap-2 mt-1.5">
                    <Button v-for="role in roleOptions" :key="role.value" type="button"
                        :variant="formData.roles.includes(role.value) ? 'default' : 'outline'" size="sm"
                        @click="toggleRole(role.value)" :class="[
                            'rounded-full px-4 text-xs h-8 transition-colors',
                            formData.roles.includes(role.value) ? 'shadow-sm' : 'border-border/60 hover:bg-muted/50'
                        ]">
                        {{ role.label }}
                    </Button>
                </div>
                <p v-if="errors.roles" class="text-sm text-destructive mt-1">{{ errors.roles }}</p>
            </div>

            <FormInput v-model="formData.joinDate" label="Tanggal Bergabung" type="date" :required="true" />

            <div class="md:col-span-2">
                <FormSwitch v-model="formData.status" :checked="formData.status === 'active'"
                    @update:checked="formData.status = $event ? 'active' : 'inactive'" label="Status Aktif"
                    description="User dapat login dan mengakses sistem" />
            </div>

            <div class="md:col-span-2 mt-2">
                <div class="bg-muted/30 dark:bg-muted/10 rounded-lg p-4 border border-border/40">
                    <h3 class="text-sm font-semibold text-foreground/80 mb-4 flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        {{ mode === 'create' ? 'Pengaturan Password' : 'Ubah Password (Opsional)' }}
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput v-model="formData.password" label="Password" type="password"
                            placeholder="Minimal 8 karakter" :required="mode === 'create'" :error="errors.password" />

                        <FormInput v-model="formData.confirmPassword" label="Konfirmasi Password" type="password"
                            placeholder="Ulangi password" :required="mode === 'create'"
                            :error="errors.confirmPassword" />
                    </div>
                </div>
            </div>
        </div>

        <div class="flex justify-end gap-3 pt-6 mt-4 border-t border-border/50">
            <Button type="button" variant="outline" @click="handleCancel"
                class="rounded-lg px-5 hover:bg-muted/50 transition-colors">
                Batal
            </Button>
            <Button type="submit"
                class="rounded-lg px-6 shadow-md shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-200">
                {{ mode === 'create' ? 'Simpan User Baru' : 'Simpan Perubahan' }}
            </Button>
        </div>
    </form>
</template>
