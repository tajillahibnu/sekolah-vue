<template>
    <div class="p-8">
        <div class="mb-8">
            <h1 class="text-2xl font-bold text-gray-800">Monitoring E-Learning</h1>
            <p class="text-gray-500">Pantau aktivitas pembelajaran dan keterlibatan siswa.</p>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div class="flex items-center gap-4">
                    <div class="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                        <BookOpenIcon class="w-6 h-6" />
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Total Kursus</p>
                        <p class="text-2xl font-bold text-gray-800">24</p>
                    </div>
                </div>
            </div>

            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div class="flex items-center gap-4">
                    <div class="p-3 bg-green-50 rounded-lg text-green-600">
                        <UsersIcon class="w-6 h-6" />
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Siswa Aktif</p>
                        <p class="text-2xl font-bold text-gray-800">142</p>
                    </div>
                </div>
            </div>

            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div class="flex items-center gap-4">
                    <div class="p-3 bg-orange-50 rounded-lg text-orange-600">
                        <DocumentCheckIcon class="w-6 h-6" />
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Tugas Diserahkan</p>
                        <p class="text-2xl font-bold text-gray-800">856</p>
                    </div>
                </div>
            </div>

            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div class="flex items-center gap-4">
                    <div class="p-3 bg-blue-50 rounded-lg text-blue-600">
                        <ClockIcon class="w-6 h-6" />
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Jam Belajar (Bulan Ini)</p>
                        <p class="text-2xl font-bold text-gray-800">3.2k</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Active Courses List -->
            <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 class="text-lg font-bold text-gray-800 mb-6">Kursus Terpopuler</h2>
                <div class="overflow-x-auto">
                    <table class="table w-full">
                        <thead>
                            <tr>
                                <th>Kursus</th>
                                <th>Guru</th>
                                <th>Siswa</th>
                                <th>Rating</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="i in 5" :key="i" class="hover:bg-gray-50">
                                <td>
                                    <div class="font-bold">Matematika Dasar X</div>
                                    <div class="text-xs text-gray-500">Matematika</div>
                                </td>
                                <td>Budi Santoso</td>
                                <td>32</td>
                                <td>
                                    <div class="flex text-yellow-500">
                                        <StarIcon class="w-4 h-4 text-yellow-500 fill-current" /> 4.8
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Recent Activity -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 class="text-lg font-bold text-gray-800 mb-6">Aktivitas Terbaru</h2>
                <div class="space-y-6">
                    <div v-for="i in 5" :key="i" class="flex gap-4">
                        <div class="w-2 h-2 mt-2 rounded-full bg-indigo-500 shrink-0"></div>
                        <div>
                            <p class="text-sm text-gray-800"><span class="font-bold">Ahmad</span> menyelesaikan kuis
                                <span class="font-bold">Eksponen</span></p>
                            <p class="text-xs text-gray-500">2 menit yang lalu</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {
    BookOpenIcon,
    UsersIcon,
    DocumentCheckIcon,
    ClockIcon,
    StarIcon
} from '@heroicons/vue/24/outline';
</script>
