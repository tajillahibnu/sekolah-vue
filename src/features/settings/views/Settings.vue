<script setup>
import { Cog6ToothIcon } from '@heroicons/vue/24/outline'
import SettingsSidebar from '../components/SettingsSidebar.vue'
import Separator from '@/components/ui/separator/Separator.vue'
</script>

<template>
    <div class="container mx-auto p-6 max-w-7xl">
        <!-- Header -->
        <div class="mb-6">
            <div class="flex items-center gap-3 mb-2">
                <div class="p-2 bg-primary/10 rounded-lg">
                    <Cog6ToothIcon class="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h1 class="text-3xl font-bold">Pengaturan</h1>
                    <p class="text-muted-foreground">Kelola pengaturan sistem sekolah</p>
                </div>
            </div>
        </div>

        <Separator class="mb-6" />

        <!-- Main Content -->
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <!-- Sidebar -->
            <aside class="lg:col-span-1">
                <div class="sticky top-6">
                    <div class="bg-card border border-border rounded-lg p-4">
                        <h2 class="text-sm font-semibold mb-3 text-muted-foreground uppercase">Menu</h2>
                        <SettingsSidebar />
                    </div>
                </div>
            </aside>

            <!-- Content Area -->
            <main class="lg:col-span-3">
                <router-view />
            </main>
        </div>
    </div>
</template>
