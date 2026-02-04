<script setup>
import { ref } from 'vue';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    DocumentChartBarIcon,
    PencilSquareIcon,
    PrinterIcon,
    ClockIcon
} from '@heroicons/vue/24/outline';

const stats = ref([
    { title: 'Total Kelas', value: '12', desc: 'Kelas Aktif', icon: 'BuildingOfficeIcon', color: 'bg-blue-100 text-blue-600' },
    { title: 'Siswa Dinilai', value: '350', desc: 'Dari 480 Siswa', icon: 'UserGroupIcon', color: 'bg-green-100 text-green-600' },
    { title: 'Tenggat Waktu', value: '5 Hari', desc: 'Sisa waktu input', icon: 'ClockIcon', color: 'bg-amber-100 text-amber-600' },
]);

const activities = ref([
    { teacher: 'Budi Santoso', action: 'Menginput Nilai UH 1', time: '2 menit yang lalu', subject: 'Matematika' },
    { teacher: 'Siti Aminah', action: 'Menyelesaikan Raport Tengah Semester', time: '1 jam yang lalu', subject: 'Bahasa Indonesia' },
    { teacher: 'Agus Dermawan', action: 'Mengedit Nilai UTS', time: '3 jam yang lalu', subject: 'IPA' },
]);
</script>

<template>
    <div class="p-8 space-y-8 animate-in fade-in duration-500">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-3xl font-bold tracking-tight text-foreground">Dashboard E-Raport</h1>
                <p class="text-muted-foreground mt-1">Pantau progres penilaian dan kelola raport siswa.</p>
            </div>
            <div class="flex gap-3">
                <Button variant="outline" class="gap-2 border-0 shadow-sm bg-background hover:bg-muted/50">
                    <PrinterIcon class="w-4 h-4" />
                    Cetak Laporan
                </Button>
                <Button class="gap-2 shadow-lg shadow-primary/20">
                    <PencilSquareIcon class="w-4 h-4" />
                    Input Nilai Baru
                </Button>
            </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid gap-6 md:grid-cols-3">
            <Card v-for="(stat, i) in stats" :key="i"
                class="border-0 shadow-sm bg-card hover:shadow-md transition-all duration-300">
                <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle class="text-sm font-medium text-muted-foreground">
                        {{ stat.title }}
                    </CardTitle>
                    <div :class="`p-2.5 rounded-xl ${stat.color} bg-opacity-20`">
                        <component :is="stat.icon === 'ClockIcon' ? ClockIcon : DocumentChartBarIcon" class="h-5 w-5" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div class="text-3xl font-bold">{{ stat.value }}</div>
                    <p class="text-xs text-muted-foreground mt-1 font-medium">
                        {{ stat.desc }}
                    </p>
                </CardContent>
            </Card>
        </div>

        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <!-- Timeline / Recent Activity -->
            <Card class="col-span-4 border-0 shadow-sm">
                <CardHeader>
                    <CardTitle>Aktivitas Terbaru</CardTitle>
                    <CardDescription>
                        Log aktivitas input nilai oleh guru.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div class="space-y-8 pl-2">
                        <div v-for="(activity, index) in activities" :key="index"
                            class="relative pl-6 border-l border-muted last:border-l-0 pb-6 last:pb-0">
                            <span
                                class="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full ring-4 ring-background bg-primary"></span>
                            <div class="space-y-1">
                                <p class="text-sm font-medium leading-none">{{ activity.teacher }}</p>
                                <p class="text-sm text-muted-foreground">
                                    {{ activity.action }} <span class="text-muted-foreground mx-1">•</span> <span
                                        class="font-medium text-primary">{{ activity.subject }}</span>
                                </p>
                                <p class="text-xs text-muted-foreground/60">{{ activity.time }}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <!-- Quick Actions -->
            <Card class="col-span-3 border-0 shadow-sm bg-gradient-to-br from-primary/5 via-transparent to-transparent">
                <CardHeader>
                    <CardTitle>Menu Cepat</CardTitle>
                    <CardDescription>Akses cepat ke fitur utama raport</CardDescription>
                </CardHeader>
                <CardContent class="grid gap-4">
                    <router-link to="/admin/raport/entries">
                        <div
                            class="flex items-center justify-between p-4 bg-background rounded-xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer group">
                            <div class="flex items-center gap-4">
                                <div
                                    class="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <PencilSquareIcon class="w-6 h-6" />
                                </div>
                                <div>
                                    <p class="font-semibold">Input Nilai</p>
                                    <p class="text-xs text-muted-foreground">Kelola nilai harian & ujian</p>
                                </div>
                            </div>
                        </div>
                    </router-link>
                    <router-link to="/admin/raport/print">
                        <div
                            class="flex items-center justify-between p-4 bg-background rounded-xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer group">
                            <div class="flex items-center gap-4">
                                <div
                                    class="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    <PrinterIcon class="w-6 h-6" />
                                </div>
                                <div>
                                    <p class="font-semibold">Cetak Raport</p>
                                    <p class="text-xs text-muted-foreground">Download raport siswa</p>
                                </div>
                            </div>
                        </div>
                    </router-link>
                </CardContent>
            </Card>
        </div>
    </div>
</template>
