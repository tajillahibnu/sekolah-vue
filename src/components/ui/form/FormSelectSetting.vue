<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useSettingStore } from '@/stores/setting';
import { useToast } from '@/composables/useToast';
import {
    ChevronDownIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    CheckIcon
} from '@heroicons/vue/24/outline';
import ConfirmModal from '@/components/ui/ConfirmModal.vue';
import Modal from '@/components/common/Modal.vue';

const props = defineProps({
    modelValue: { type: [String, Number], default: '' },
    label: { type: String, default: '' },
    settingKey: { type: String, required: true },
    placeholder: { type: String, default: 'Pilih...' },
    required: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue']);
const settingStore = useSettingStore();
const toast = useToast();

const isOpen = ref(false);
const dropdownContainer = ref(null);

const settingObject = computed(() => {
    return settingStore.settings.find(s => s.key === props.settingKey);
});

const options = computed(() => {
    return settingStore.getArray(props.settingKey);
});

const toggleDropdown = () => {
    if (!props.disabled) {
        isOpen.value = !isOpen.value;
        if (isOpen.value) {
            searchQuery.value = '';
        }
    }
};

const selectOption = (opt) => {
    emit('update:modelValue', opt);
    isOpen.value = false;
};

// Click outside
const handleClickOutside = (event) => {
    if (dropdownContainer.value && !dropdownContainer.value.contains(event.target)) {
        isOpen.value = false;
    }
};

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});

// CRUD Logic
const showAddModal = ref(false);
const showEditModal = ref(false);
const showDeleteConfirm = ref(false);
const inputValue = ref('');
const editingIndex = ref(-1);
const deletingIndex = ref(-1);

const searchQuery = ref('');

const filteredOptions = computed(() => {
    if (!searchQuery.value) return options.value;
    const query = searchQuery.value.toLowerCase();
    return options.value.filter(opt =>
        String(opt).toLowerCase().includes(query)
    );
});

const handleAdd = () => {
    inputValue.value = '';
    showAddModal.value = true;
    isOpen.value = false;
};

const handleEdit = (opt, event) => {
    event.stopPropagation();
    inputValue.value = opt;
    editingIndex.value = options.value.indexOf(opt);
    showEditModal.value = true;
    isOpen.value = false;
};

const handleDeleteClick = (opt, event) => {
    event.stopPropagation();
    deletingIndex.value = options.value.indexOf(opt);
    showDeleteConfirm.value = true;
    isOpen.value = false;
};

const saveArrayToSetting = async (newArray) => {
    try {
        if (!settingObject.value || !settingObject.value.id) {
            // Create setup fallback
            const payload = {
                key: props.settingKey,
                name: `Master ${props.label}`,
                type: 'json',
                value: JSON.stringify(newArray),
                group: 'Master Data',
                description: `Daftar opsi tersimpan untuk ${props.label}`
            };
            await settingStore.createSetting(payload);
        } else {
            // Update
            const payload = {
                ...settingObject.value,
                value: JSON.stringify(newArray)
            };
            await settingStore.updateSetting(settingObject.value.id, payload);
        }
        return true;
    } catch (e) {
        toast.error('Gagal menyimpan perubahan ke server');
        return false;
    }
};

const submitAdd = async () => {
    if (!inputValue.value.trim()) return;
    const newArray = [...options.value, inputValue.value.trim()];
    const success = await saveArrayToSetting(newArray);
    if (success) {
        // Global interceptor fires the toast from Backend
        showAddModal.value = false;
        // Auto select new value
        emit('update:modelValue', inputValue.value.trim());
    }
};

const submitEdit = async () => {
    if (!inputValue.value.trim() || editingIndex.value === -1) return;
    const newArray = [...options.value];
    const oldValue = newArray[editingIndex.value];
    newArray[editingIndex.value] = inputValue.value.trim();

    const success = await saveArrayToSetting(newArray);
    if (success) {
        showEditModal.value = false;
        // Update v-model if it was currently selected
        if (props.modelValue === oldValue) {
            emit('update:modelValue', inputValue.value.trim());
        }
    }
};

const confirmDelete = async () => {
    if (deletingIndex.value === -1) return;
    const newArray = [...options.value];
    const deletedValue = newArray[deletingIndex.value];
    newArray.splice(deletingIndex.value, 1);

    const success = await saveArrayToSetting(newArray);
    if (success) {
        showDeleteConfirm.value = false;
        // Clear value if deleted
        if (props.modelValue === deletedValue) {
            emit('update:modelValue', '');
        }
    }
};
</script>

<template>
    <div class="relative" ref="dropdownContainer">
        <label v-if="label"
            class="block text-sm font-medium text-foreground mb-1.5 focus-within:text-primary transition-colors">
            {{ label }} <span v-if="required" class="text-destructive">*</span>
        </label>

        <div @click="toggleDropdown"
            class="relative w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[40px] flex items-center justify-between cursor-pointer rounded-xl transition-all duration-200"
            :class="[isOpen ? 'ring-2 ring-primary/20 border-primary' : '']">
            <span :class="!modelValue ? 'text-muted-foreground' : 'text-foreground'">
                {{ modelValue || placeholder }}
            </span>
            <ChevronDownIcon class="w-4 h-4 text-muted-foreground transition-transform duration-200"
                :class="{ 'transform rotate-180': isOpen }" />
        </div>

        <!-- Dropdown Menu -->
        <div v-if="isOpen"
            class="absolute z-50 w-full mt-1 bg-popover text-popover-foreground border border-border rounded-xl shadow-lg max-h-60 overflow-hidden flex flex-col pt-1 animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95">

            <!-- Search Bar -->
            <div class="px-2 py-1.5 border-b border-border sticky top-0 bg-popover z-10">
                <input type="text" v-model="searchQuery"
                    class="w-full text-sm bg-transparent border-none focus:ring-0 px-2 py-1 outline-none placeholder:text-muted-foreground"
                    placeholder="Cari opsi..." @click.stop />
            </div>

            <div class="overflow-y-auto w-full">
                <template v-if="filteredOptions.length > 0">
                    <div v-for="(opt, idx) in filteredOptions" :key="idx"
                        class="relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 group hover:bg-primary/10 transition-colors"
                        @click="selectOption(opt)">
                        <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                            <CheckIcon v-if="modelValue === opt" class="w-4 h-4 text-primary font-bold" />
                        </span>
                        <span class="flex-grow">{{ opt }}</span>

                        <!-- Action Buttons (show on hover) -->
                        <div class="hidden group-hover:flex items-center gap-1">
                            <button type="button" @click.stop="handleEdit(opt, $event)"
                                class="p-1.5 text-muted-foreground hover:text-blue-500 rounded bg-background shadow-sm border border-border hover:border-blue-200 transition-colors"
                                title="Edit opsi">
                                <PencilIcon class="w-3.5 h-3.5" />
                            </button>
                            <button type="button" @click.stop="handleDeleteClick(opt, $event)"
                                class="p-1.5 text-muted-foreground hover:text-destructive rounded bg-background shadow-sm border border-border hover:border-red-200 transition-colors"
                                title="Delete opsi">
                                <TrashIcon class="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </template>

                <div v-else class="py-6 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                    <span class="bg-muted p-2 rounded-full">
                        <PlusIcon class="w-5 h-5 opacity-50" />
                    </span>
                    Belum ada data opsi
                </div>
            </div>

            <!-- Add New Button Sticky Bottom -->
            <button type="button" @click.stop="handleAdd"
                class="w-full flex items-center justify-center gap-2 py-3 mt-1 text-sm bg-primary/5 text-primary hover:bg-primary/10 font-medium transition-colors border-t border-border">
                <PlusIcon class="w-4 h-4 stroke-2" />
                Tambah Opsi {{ label }}
            </button>
        </div>

        <!-- Add/Edit Prompts Modal using Headless UI Radix to avoid z-index & focus traps from parent modal -->
        <!-- Add Modal -->
        <Modal :show="showAddModal" @update:show="showAddModal = $event" title="Tambah Opsi Baru"
            :desc="`Masukkan data array untuk ${label}.`" size="sm">
            <input type="text" v-model="inputValue"
                class="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 mb-5 transition-all font-medium"
                placeholder="Tuliskan nama opsi..." @keyup.enter="submitAdd" autoFocus />

            <div class="flex justify-end gap-3 mt-4">
                <button type="button" @click="showAddModal = false"
                    class="px-5 py-2 text-sm rounded-xl border border-border hover:bg-muted font-medium transition-colors">Batal</button>
                <button type="button" @click="submitAdd"
                    class="px-5 py-2 text-sm rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors shadow-sm shadow-primary/25 disabled:opacity-50"
                    :disabled="!inputValue.trim()">Simpan Opsi</button>
            </div>
        </Modal>

        <!-- Edit Modal -->
        <Modal :show="showEditModal" @update:show="showEditModal = $event" title="Pembaruan Opsi"
            :desc="`Ganti nama opsi untuk ${label}.`" size="sm">
            <input type="text" v-model="inputValue"
                class="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 mb-5 transition-all font-medium"
                placeholder="Ubah nama opsi..." @keyup.enter="submitEdit" autoFocus />

            <div class="flex justify-end gap-3 mt-4">
                <button type="button" @click="showEditModal = false"
                    class="px-5 py-2 text-sm rounded-xl border border-border hover:bg-muted font-medium transition-colors">Batal</button>
                <button type="button" @click="submitEdit"
                    class="px-5 py-2 text-sm rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-medium transition-colors shadow-sm shadow-blue-500/25 disabled:opacity-50"
                    :disabled="!inputValue.trim()">Ubah Opsi</button>
            </div>
        </Modal>

        <!-- Delete Confirm -->
        <ConfirmModal :show="showDeleteConfirm" title="Hapus Opsi Master"
            :message="`Apakah Anda yakin ingin menghapus opsi ini secara permanen? \nHati-hati, data lama yang memakai opsi ini mungkin tidak dapat dipetakan dengan baik.`"
            confirm-text="Hapus Permanen" cancel-text="Batal" @confirm="confirmDelete"
            @close="showDeleteConfirm = false" @cancel="showDeleteConfirm = false" />
    </div>
</template>
