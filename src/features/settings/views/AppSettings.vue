<script setup>
import { ref, computed, onMounted } from 'vue';
import { useSettingStore } from '@/stores/setting';
import { useToast } from '@/composables/useToast';
import Modal from '@/components/common/Modal.vue';
import {
    PlusIcon,
    TrashIcon,
    PencilIcon,
    WrenchScrewdriverIcon,
    MagnifyingGlassIcon,
    TableCellsIcon
} from '@heroicons/vue/24/outline';

const settingStore = useSettingStore();
const toast = useToast();

const searchQuery = ref('');
const loading = ref(false);

const showModal = ref(false);
const showDeleteConfirm = ref(false);
const modalMode = ref('create'); // 'create' or 'edit'
const selectedSetting = ref(null);

const formData = ref({
    key: '',
    name: '',
    type: 'string', // string, json, boolean, integer
    value: '',
    group: '',
    description: ''
});

// JSON Helper state for Form Edit if JSON type
const isJsonValid = ref(true);

const fetchSettings = async () => {
    loading.value = true;
    try {
        await settingStore.fetchSettings({ limit: 'all' });
    } catch {
        toast.error('Gagal mengambil meta data / settings');
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchSettings();
});

const filteredSettings = computed(() => {
    let result = settingStore.settings;
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(item =>
            item.key.toLowerCase().includes(query) ||
            item.name.toLowerCase().includes(query) ||
            (item.group && item.group.toLowerCase().includes(query))
        );
    }
    return result;
});

const handleAdd = () => {
    modalMode.value = 'create';
    formData.value = {
        key: '',
        name: '',
        type: 'string',
        value: '',
        group: '',
        description: ''
    };
    isJsonValid.value = true;
    showModal.value = true;
};

const handleEdit = (setting) => {
    modalMode.value = 'edit';
    selectedSetting.value = setting;

    // Parse JSON safely for edit if needed
    let valStr = setting.value;
    if (setting.type === 'json' && typeof valStr === 'object') {
        valStr = JSON.stringify(valStr, null, 2);
    } else if (setting.type === 'json' && typeof valStr === 'string') {
        try {
            valStr = JSON.stringify(JSON.parse(valStr), null, 2);
        } catch (e) { }
    } else if (setting.type === 'boolean') {
        valStr = setting.value === '1' || setting.value === true ? 'true' : 'false';
    }

    formData.value = {
        key: setting.key,
        name: setting.name,
        type: setting.type,
        value: valStr,
        group: setting.group,
        description: setting.description
    };
    isJsonValid.value = true;
    showModal.value = true;
};

const handleDeleteClick = (setting) => {
    selectedSetting.value = setting;
    showDeleteConfirm.value = true;
};

const confirmDelete = async () => {
    try {
        await settingStore.deleteSetting(selectedSetting.value.id);
        toast.success('Meta data berhasil dihapus');
    } catch {
        toast.error('Gagal menghapus meta data');
    } finally {
        showDeleteConfirm.value = false;
        selectedSetting.value = null;
    }
};

const validateJsonString = (str) => {
    if (!str) return true;
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
};

const submitForm = async () => {
    let finalValue = formData.value.value;

    if (formData.value.type === 'json') {
        if (!validateJsonString(formData.value.value)) {
            isJsonValid.value = false;
            toast.error('Format JSON tidak valid');
            return;
        }
        isJsonValid.value = true;
        // Parse it to send as object/array, though sending string also works 
        finalValue = JSON.parse(formData.value.value);
    }

    if (formData.value.type === 'boolean') {
        finalValue = formData.value.value === 'true' || formData.value.value === true;
    }

    const payload = { ...formData.value, value: finalValue };

    try {
        if (modalMode.value === 'create') {
            await settingStore.createSetting(payload);
            toast.success('Meta data berhasil ditambahkan');
        } else {
            await settingStore.updateSetting(selectedSetting.value.id, payload);
            toast.success('Meta data berhasil diupdate');
        }
        showModal.value = false;
    } catch (error) {
        toast.error(error.response?.data?.message || 'Gagal menyimpan meta data');
    }
};

const getTypeBadgeClass = (type) => {
    switch (type) {
        case 'json': return 'bg-purple-100 text-purple-700 border-purple-200';
        case 'boolean': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        case 'integer': return 'bg-blue-100 text-blue-700 border-blue-200';
        default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
};
</script>

<template>
    <div class="space-y-6">
        <!-- Header Section -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div class="space-y-1">
                <h2 class="text-2xl font-black text-foreground tracking-tight">Meta Data / Aplikasi</h2>
                <p class="text-sm text-muted-foreground font-medium">Kelola konfigurasi non-table & opsi aplikasi
                    (JSON).</p>
            </div>
            <button @click="handleAdd"
                class="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center gap-2">
                <PlusIcon class="w-5 h-5 text-white" />
                Tambah Meta Data
            </button>
        </div>

        <!-- Filter -->
        <div class="bg-background/60 backdrop-blur-md border border-primary/10 rounded-2xl p-2 shadow-sm">
            <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon
                        class="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <input v-model="searchQuery" type="text" placeholder="Cari key, nama, atau grup..."
                    class="block w-full pl-12 pr-4 py-3 bg-primary/5 border-transparent rounded-xl text-sm font-medium focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all" />
            </div>
        </div>

        <!-- Data Grid -->
        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="i in 4" :key="i" class="h-32 bg-primary/5 rounded-3xl animate-pulse"></div>
        </div>

        <div v-else-if="filteredSettings.length > 0" class="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <div v-for="setting in filteredSettings" :key="setting.id"
                class="group flex flex-col justify-between bg-card border border-border hover:border-primary/20 rounded-3xl p-5 shadow-sm hover:shadow-lg transition-all">

                <div class="space-y-3">
                    <div class="flex justify-between items-start gap-4">
                        <div class="flex items-start gap-3">
                            <div class="p-2.5 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                                <TableCellsIcon class="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h3 class="font-black text-lg text-foreground tracking-tight">{{ setting.name }}</h3>
                                <p class="text-xs font-mono font-bold text-primary mt-0.5">{{ setting.key }}</p>
                            </div>
                        </div>
                        <span
                            class="inline-flex px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border"
                            :class="getTypeBadgeClass(setting.type)">
                            {{ setting.type }}
                        </span>
                    </div>

                    <div class="pl-13 text-sm font-medium text-muted-foreground line-clamp-2">
                        {{ setting.description || 'Tidak ada deskripsi' }}
                    </div>

                    <div class="pl-13 mt-2">
                        <span v-if="setting.group"
                            class="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                            #{{ setting.group }}
                        </span>
                    </div>
                </div>

                <div class="mt-5 flex items-center justify-end gap-2 pt-4 border-t border-border/60">
                    <button @click="handleEdit(setting)"
                        class="px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white font-bold text-xs rounded-xl transition-all active:scale-95 flex items-center gap-2">
                        <PencilIcon class="w-4 h-4" /> Edit
                    </button>
                    <button @click="handleDeleteClick(setting)"
                        class="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white font-bold text-xs rounded-xl transition-all active:scale-95 flex items-center gap-2">
                        <TrashIcon class="w-4 h-4" /> Hapus
                    </button>
                </div>
            </div>
        </div>

        <!-- Empty State Premium Glassmorphism -->
        <div v-else
            class="text-center py-20 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[40px] animate-in fade-in zoom-in-95 duration-500">
            <WrenchScrewdriverIcon class="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 class="text-xl font-black text-slate-800 tracking-tight">Tidak ada Meta Data</h3>
            <p class="text-slate-500 text-sm font-medium mt-1 max-w-sm mx-auto">
                {{ searchQuery ? 'Coba ubah kata kunci pencarian Anda.' : 'Belum ada data konfigurasi JSON / Non-table
                yang ditambahkan.' }}
            </p>
            <button v-if="searchQuery" @click="searchQuery = ''"
                class="mt-6 px-6 py-2 bg-white border-2 border-slate-100 hover:border-primary/20 hover:bg-primary/5 text-slate-600 hover:text-primary font-bold text-sm rounded-xl transition-all shadow-sm">
                Reset Pencarian
            </button>
        </div>

        <!-- Form Modal -->
        <Modal :show="showModal" :title="modalMode === 'create' ? 'Tambah Meta Data' : 'Edit Meta Data'" size="lg"
            @close="showModal = false">
            <form @submit.prevent="submitForm" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-1.5">
                        <label class="text-sm font-bold text-foreground">Kunci (Key) <span
                                class="text-rose-500">*</span></label>
                        <input v-model="formData.key" type="text" required placeholder="app_name_config"
                            class="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm font-medium font-mono focus:ring-2 focus:ring-primary/20 transition-all outline-none" />
                    </div>
                    <div class="space-y-1.5">
                        <label class="text-sm font-bold text-foreground">Nama <span
                                class="text-rose-500">*</span></label>
                        <input v-model="formData.name" type="text" required placeholder="Nama Konfigurasi"
                            class="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none" />
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-1.5">
                        <label class="text-sm font-bold text-foreground">Tipe Data</label>
                        <select v-model="formData.type"
                            class="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none">
                            <option value="string">String (Teks)</option>
                            <option value="json">JSON (Object/Array)</option>
                            <option value="boolean">Boolean</option>
                            <option value="integer">Integer (Angka)</option>
                        </select>
                    </div>
                    <div class="space-y-1.5">
                        <label class="text-sm font-bold text-foreground">Grup (Opsional)</label>
                        <input v-model="formData.group" type="text" placeholder="Contoh: General, UI, Config"
                            class="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none" />
                    </div>
                </div>

                <div class="space-y-1.5">
                    <label class="text-sm font-bold text-foreground">Valu (Isi Data)</label>
                    <textarea v-if="formData.type === 'json'" v-model="formData.value" rows="6"
                        placeholder='{"key": "value", "status": true}'
                        class="w-full px-4 py-3 bg-gray-50 border border-border rounded-xl text-sm font-mono focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                        :class="!isJsonValid ? 'border-rose-300 bg-rose-50 focus:ring-rose-200' : ''"></textarea>

                    <select v-else-if="formData.type === 'boolean'" v-model="formData.value"
                        class="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none">
                        <option value="true">True (Aktif)</option>
                        <option value="false">False (Non-aktif)</option>
                    </select>

                    <input v-else-if="formData.type === 'integer'" v-model="formData.value" type="number"
                        class="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none" />

                    <textarea v-else v-model="formData.value" rows="3" placeholder="Masukkan nilai teks/string..."
                        class="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"></textarea>

                    <p v-if="formData.type === 'json' && !isJsonValid" class="text-xs font-bold text-rose-500 mt-1">
                        Format JSON tidak valid! Harap cek tanda kutip atau kurung.
                    </p>
                </div>

                <div class="space-y-1.5">
                    <label class="text-sm font-bold text-foreground">Deskripsi (Opsional)</label>
                    <textarea v-model="formData.description" rows="2"
                        placeholder="Catatan mengenai penggunaan key ini..."
                        class="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none"></textarea>
                </div>

                <div class="flex justify-end gap-3 pt-6 border-t border-border mt-4">
                    <button type="button" @click="showModal = false"
                        class="px-6 py-2.5 rounded-xl font-bold text-muted-foreground hover:bg-muted transition-all">
                        Batal
                    </button>
                    <button type="submit"
                        class="px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 transition-all">
                        Simpan Meta Data
                    </button>
                </div>
            </form>
        </Modal>

        <!-- Delete Confirmation -->
        <Teleport to="body">
            <div v-if="showDeleteConfirm"
                class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div
                    class="w-full max-w-sm bg-background rounded-3xl shadow-xl p-8 animate-in zoom-in-95 duration-300 text-center">
                    <div class="inline-flex p-3 bg-rose-50 rounded-2xl mb-4">
                        <TrashIcon class="w-8 h-8 text-rose-500" />
                    </div>
                    <h3 class="text-xl font-black text-foreground tracking-tight">Hapus Meta Data?</h3>
                    <p class="text-sm text-muted-foreground mt-2 font-medium">
                        Anda yakin ingin menghapus <span class="font-bold text-foreground">"{{ selectedSetting?.name
                            }}"</span>? Aksi ini permanen.
                    </p>
                    <div class="flex gap-3 mt-8">
                        <button @click="showDeleteConfirm = false"
                            class="flex-1 px-4 py-3 bg-muted text-muted-foreground font-bold rounded-xl hover:bg-muted/80 transition-all text-sm">Batal</button>
                        <button @click="confirmDelete"
                            class="flex-1 px-4 py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-all text-sm">Hapus</button>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<style scoped>
@keyframes fade-in {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes zoom-in-95 {
    from {
        opacity: 0;
        transform: scale(0.95);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

.animate-in {
    animation-fill-mode: both;
}

.fade-in {
    animation-name: fade-in;
}

.zoom-in-95 {
    animation-name: zoom-in-95;
}

.duration-200 {
    animation-duration: 200ms;
}

.duration-300 {
    animation-duration: 300ms;
}

.duration-500 {
    animation-duration: 500ms;
}
</style>
