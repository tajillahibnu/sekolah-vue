<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
    UsersIcon,
    CalendarDaysIcon,
    AcademicCapIcon,
    BookOpenIcon,
    BuildingOffice2Icon,
    ArrowPathIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()

const authStore = useAuthStore()

const menuItems = [
    {
        id: 'users',
        label: 'Users Management',
        description: 'Kelola pengguna sistem',
        icon: UsersIcon,
        path: '/settings/users',
        permission: 'users.view'
    },
    {
        id: 'academic-years',
        label: 'Tahun Ajaran',
        description: 'Kelola tahun ajaran',
        icon: CalendarDaysIcon,
        path: '/settings/academic-years',
        permission: 'settings.manage'
    },
    {
        id: 'classes',
        label: 'Kelas',
        description: 'Kelola kelas dan wali kelas',
        icon: AcademicCapIcon,
        path: '/settings/classes',
        permission: 'classes.view'
    },
    {
        id: 'subjects',
        label: 'Mata Pelajaran',
        description: 'Kelola mata pelajaran',
        icon: BookOpenIcon,
        path: '/settings/subjects',
        permission: 'subjects.view'
    },
    {
        id: 'school',
        label: 'Informasi Sekolah',
        description: 'Pengaturan sekolah',
        icon: BuildingOffice2Icon,
        path: '/settings/school',
        permission: 'settings.manage'
    },
    {
        id: 'backup',
        label: 'Backup & Restore',
        description: 'Cadangkan & pulihkan data',
        icon: ArrowPathIcon,
        path: '/settings/backup',
        permission: 'settings.manage'
    }
]

const filteredMenuItems = computed(() => {
    return menuItems.filter(item => !item.permission || authStore.hasPermission(item.permission))
})

const isActive = (path) => {
    return route.path === path
}
</script>

<template>
    <nav class="space-y-1">
        <router-link v-for="item in filteredMenuItems" :key="item.id" :to="item.path"
            class="flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors group" :class="[
                isActive(item.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
            ]">
            <component :is="item.icon" class="w-5 h-5 mt-0.5 flex-shrink-0" :class="[
                isActive(item.path)
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground group-hover:text-foreground'
            ]" />
            <div class="flex-1 min-w-0">
                <p class="text-sm font-medium">{{ item.label }}</p>
                <p class="text-xs mt-0.5" :class="[
                    isActive(item.path)
                        ? 'text-primary-foreground/80'
                        : 'text-muted-foreground'
                ]">
                    {{ item.description }}
                </p>
            </div>
        </router-link>
    </nav>
</template>
