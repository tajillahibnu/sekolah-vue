<script setup>
import { ref } from 'vue';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Input from '@/components/ui/input/Input.vue';
import Label from '@/components/ui/label/Label.vue';
import { useToast } from '@/composables/useToast';
import {
    MagnifyingGlassIcon,
    FunnelIcon
} from '@heroicons/vue/24/outline';

const toast = useToast();
const loading = ref(false);

const selectedClass = ref('XA');
const selectedSubject = ref('mtk');
const selectedSemester = ref('ganjil');
const activeTab = ref('uh'); // uh, uts, uas

const students = ref([
    { id: 1, name: 'Adi Pratama', nis: '12345', grades: { uh: 85, uts: 88, uas: 90 } },
    { id: 2, name: 'Bunga Citra', nis: '12346', grades: { uh: 92, uts: 90, uas: 95 } },
    { id: 3, name: 'Candra Wijaya', nis: '12347', grades: { uh: 78, uts: 80, uas: 82 } },
    { id: 4, name: 'Dewi Sartika', nis: '12348', grades: { uh: 88, uts: 85, uas: 88 } },
    { id: 5, name: 'Eko Purnomo', nis: '12349', grades: { uh: 75, uts: 78, uas: 75 } },
]);

const handleSave = () => {
    loading.value = true;
    setTimeout(() => {
        loading.value = false;
        toast.success('Nilai berhasil disimpan!');
    }, 1000);
};
</script>

<template>
    <div class="p-8 space-y-8 animate-in fade-in duration-500">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 class="text-3xl font-bold tracking-tight text-foreground">Input Nilai</h1>
                <p class="text-muted-foreground mt-1">Masukkan nilai Ulangan Harian, UTS, dan UAS/PAT.</p>
            </div>
            <Button @click="handleSave" :disabled="loading" class="shadow-lg shadow-primary/20">
                <svg v-if="loading" class="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                </svg>
                {{ loading ? 'Menyimpan...' : 'Simpan Perubahan' }}
            </Button>
        </div>

        <!-- Filters -->
        <Card class="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle class="text-base font-semibold">Filter Data</CardTitle>
            </CardHeader>
            <CardContent>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div class="space-y-2">
                        <Label class="text-xs font-medium uppercase text-muted-foreground">Kelas</Label>
                        <select v-model="selectedClass"
                            class="flex h-10 w-full rounded-xl border-0 bg-muted/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:bg-muted">
                            <option value="XA">X-A</option>
                            <option value="XB">X-B</option>
                            <option value="XIIPA1">XI IPA 1</option>
                        </select>
                    </div>
                    <div class="space-y-2">
                        <Label class="text-xs font-medium uppercase text-muted-foreground">Mata Pelajaran</Label>
                        <select v-model="selectedSubject"
                            class="flex h-10 w-full rounded-xl border-0 bg-muted/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:bg-muted">
                            <option value="mtk">Matematika</option>
                            <option value="indo">Bahasa Indonesia</option>
                            <option value="inggris">Bahasa Inggris</option>
                            <option value="ipa">IPA</option>
                        </select>
                    </div>
                    <div class="space-y-2">
                        <Label class="text-xs font-medium uppercase text-muted-foreground">Semester</Label>
                        <select v-model="selectedSemester"
                            class="flex h-10 w-full rounded-xl border-0 bg-muted/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:bg-muted">
                            <option value="ganjil">Ganjil</option>
                            <option value="genap">Genap</option>
                        </select>
                    </div>
                    <div class="flex items-end">
                        <Button variant="outline"
                            class="w-full border-0 bg-muted/50 hover:bg-primary/10 hover:text-primary transition-all">
                            <FunnelIcon class="w-4 h-4 mr-2" />
                            Terapkan Filter
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>

        <!-- Tabs -->
        <div class="flex space-x-1 rounded-2xl bg-muted/50 p-1.5 w-fit">
            <button
                v-for="tab in [{ id: 'uh', label: 'Ulangan Harian' }, { id: 'uts', label: 'UTS (Tengah Semester)' }, { id: 'uas', label: 'UAS (Akhir Semester)' }]"
                :key="tab.id" @click="activeTab = tab.id"
                class="rounded-xl px-6 py-2.5 text-sm font-medium leading-5 transition-all duration-200" :class="activeTab === tab.id
                    ? 'bg-background text-primary shadow-sm scale-[1.02]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'">
                {{ tab.label }}
            </button>
        </div>

        <!-- Grade Table -->
        <Card class="border-0 shadow-sm overflow-hidden">
            <CardContent class="p-0">
                <div class="relative w-full overflow-auto">
                    <table class="w-full caption-bottom text-sm">
                        <thead class="bg-muted/20">
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
                                    Nilai {{ activeTab.toUpperCase() }}</th>
                                <th class="h-12 px-6 text-left align-middle font-semibold text-muted-foreground">
                                    Keterangan</th>
                            </tr>
                        </thead>
                        <tbody class="[&_tr:last-child]:border-0">
                            <tr v-for="(student, index) in students" :key="student.id"
                                class="border-b border-muted/50 transition-colors hover:bg-muted/10">
                                <td class="p-6 align-middle text-muted-foreground">{{ index + 1 }}</td>
                                <td class="p-6 align-middle font-medium text-foreground">{{ student.name }}</td>
                                <td class="p-6 align-middle text-muted-foreground">{{ student.nis }}</td>
                                <td class="p-6 align-middle">
                                    <input type="number" min="0" max="100" v-model="student.grades[activeTab]"
                                        class="flex h-10 w-full rounded-xl border-0 bg-muted/30 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus:bg-background focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-all text-center font-bold"
                                        :class="{
                                            'text-red-500 focus:ring-red-200 bg-red-50/50': student.grades[activeTab] < 75,
                                            'text-green-600 focus:ring-green-200 bg-green-50/50': student.grades[activeTab] >= 75
                                        }" />
                                </td>
                                <td class="p-6 align-middle text-muted-foreground">
                                    <span v-if="student.grades[activeTab] >= 75"
                                        class="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold bg-green-50 text-green-700">
                                        Tuntas
                                    </span>
                                    <span v-else
                                        class="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold bg-red-50 text-red-700">
                                        Belum Tuntas
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    </div>
</template>
