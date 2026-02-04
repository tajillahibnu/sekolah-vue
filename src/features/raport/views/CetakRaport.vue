<script setup>
import { ref } from 'vue';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Label from '@/components/ui/label/Label.vue';
import { useToast } from '@/composables/useToast';
import {
    PrinterIcon,
    EyeIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    ArrowDownTrayIcon
} from '@heroicons/vue/24/outline';

const toast = useToast();
const selectedClass = ref('XA');
const selectedYear = ref('2023/2024');

// Mock Data
const students = ref([
    { id: 1, name: 'Adi Pratama', nis: '12345', status: 'ready' },
    { id: 2, name: 'Bunga Citra', nis: '12346', status: 'ready' },
    { id: 3, name: 'Candra Wijaya', nis: '12347', status: 'incomplete' },
    { id: 4, name: 'Dewi Sartika', nis: '12348', status: 'ready' },
    { id: 5, name: 'Eko Purnomo', nis: '12349', status: 'ready' },
]);

const handlePrint = (type, studentName) => {
    toast.info(`Mencetak Raport ${type} untuk ${studentName}...`);
    // Mock print delay
    setTimeout(() => {
        window.print();
    }, 1000);
};
</script>

<template>
    <div class="p-8 space-y-8 animate-in fade-in duration-500">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 class="text-3xl font-bold tracking-tight text-foreground">Cetak Raport</h1>
                <p class="text-muted-foreground mt-1">Unduh dan cetak raport hasil belajar siswa.</p>
            </div>
            <Button variant="outline" class="gap-2 border-0 shadow-sm bg-white hover:bg-muted">
                <PrinterIcon class="w-4 h-4" />
                Cetak Rekap Nilai Kelas
            </Button>
        </div>

        <!-- Filters -->
        <Card class="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
            <CardContent class="pt-6">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="space-y-2">
                        <Label class="text-xs font-medium uppercase text-muted-foreground">Pilih Kelas</Label>
                        <select v-model="selectedClass"
                            class="flex h-10 w-full rounded-xl border-0 bg-muted/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:bg-muted">
                            <option value="XA">X-A</option>
                            <option value="XB">X-B</option>
                            <option value="XIIPA1">XI IPA 1</option>
                        </select>
                    </div>
                    <div class="space-y-2">
                        <Label class="text-xs font-medium uppercase text-muted-foreground">Tahun Ajaran</Label>
                        <select v-model="selectedYear"
                            class="flex h-10 w-full rounded-xl border-0 bg-muted/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:bg-muted">
                            <option value="2023/2024">2023/2024</option>
                            <option value="2022/2023">2022/2023</option>
                        </select>
                    </div>
                </div>
            </CardContent>
        </Card>

        <!-- Student List -->
        <Card class="border-0 shadow-sm overflow-hidden">
            <CardHeader class="border-b border-muted/20 bg-muted/5 pb-4">
                <CardTitle class="text-base font-semibold">Daftar Siswa Kelas {{ selectedClass }}</CardTitle>
            </CardHeader>
            <CardContent class="p-0">
                <div class="relative w-full overflow-auto">
                    <table class="w-full caption-bottom text-sm">
                        <thead>
                            <tr class="transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th
                                    class="h-12 px-6 text-left align-middle font-semibold text-muted-foreground w-[80px]">
                                    No</th>
                                <th class="h-12 px-6 text-left align-middle font-semibold text-muted-foreground">Nama
                                    Siswa</th>
                                <th
                                    class="h-12 px-6 text-left align-middle font-semibold text-muted-foreground w-[150px]">
                                    NIS</th>
                                <th
                                    class="h-12 px-6 text-left align-middle font-semibold text-muted-foreground w-[200px]">
                                    Status Nilai</th>
                                <th class="h-12 px-6 text-center align-middle font-semibold text-muted-foreground">Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody class="[&_tr:last-child]:border-0">
                            <tr v-for="(student, index) in students" :key="student.id"
                                class="border-b border-muted/50 transition-colors hover:bg-muted/10">
                                <td class="p-6 align-middle text-muted-foreground">{{ index + 1 }}</td>
                                <td class="p-6 align-middle font-medium text-foreground">{{ student.name }}</td>
                                <td class="p-6 align-middle text-muted-foreground">{{ student.nis }}</td>
                                <td class="p-6 align-middle">
                                    <div v-if="student.status === 'ready'"
                                        class="flex items-center text-green-600 gap-2 px-3 py-1 rounded-full bg-green-50 w-fit">
                                        <CheckCircleIcon class="w-4 h-4" />
                                        <span class="text-xs font-semibold">Lengkap</span>
                                    </div>
                                    <div v-else
                                        class="flex items-center text-amber-600 gap-2 px-3 py-1 rounded-full bg-amber-50 w-fit">
                                        <ExclamationCircleIcon class="w-4 h-4" />
                                        <span class="text-xs font-semibold">Belum Lengkap</span>
                                    </div>
                                </td>
                                <td class="p-6 align-middle text-right md:text-center space-x-3">
                                    <Button size="sm" variant="secondary"
                                        class="rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-0"
                                        @click="handlePrint('PTS', student.name)">
                                        <PrinterIcon class="w-3.5 h-3.5 mr-1.5" />
                                        PTS
                                    </Button>
                                    <Button size="sm"
                                        class="rounded-lg shadow-none bg-primary text-primary-foreground hover:bg-primary/90"
                                        @click="handlePrint('PAS', student.name)">
                                        <ArrowDownTrayIcon class="w-3.5 h-3.5 mr-1.5" />
                                        PAS
                                    </Button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    </div>
</template>
