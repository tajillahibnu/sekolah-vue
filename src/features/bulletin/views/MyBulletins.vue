<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  InformationCircleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  InboxIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon,
  CheckIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  VideoCameraIcon
} from '@heroicons/vue/24/outline';
import bulletinService from '@/services/bulletinService';
import BulletinForm from '../components/BulletinForm.vue';
import Modal from '@/components/common/Modal.vue';

const router = useRouter();
const bulletins = ref([]);
const loading = ref(true);
const showFormModal = ref(false);
const showRejectionModal = ref(false);
const selectedBulletin = ref(null);
const currentRejectionNote = ref('');
const searchQuery = ref('');
const selectedStatus = ref('all');

const statusOptions = [
  { value: 'all', label: 'Semua Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
  { value: 'published', label: 'Terbit' },
  { value: 'rejected', label: 'Ditolak' }
];

const showStatusDropdown = ref(false);

const fetchMyBulletins = async () => {
  loading.value = true;
  try {
    const response = await bulletinService.getBulletins({
      status: selectedStatus.value,
      q: searchQuery.value,
      author: 'User', // Mocking current user
      limit: 100
    });
    bulletins.value = response.data;
  } catch (error) {
    console.error('Failed to fetch my bulletins', error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchMyBulletins);

watch([searchQuery, selectedStatus], () => {
  fetchMyBulletins();
});

const getStatusDetails = (status) => {
  const map = {
    'draft': {
      label: 'Draft',
      color: 'bg-slate-50 text-slate-600 border-slate-200/50',
      icon: InboxIcon
    },
    'pending': {
      label: 'Review',
      color: 'bg-amber-50 text-amber-600 border-amber-200/50',
      icon: ClockIcon
    },
    'published': {
      label: 'Terbit',
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200/50',
      icon: CheckCircleIcon
    },
    'rejected': {
      label: 'Ditolak',
      color: 'bg-rose-50 text-rose-600 border-rose-200/50',
      icon: XCircleIcon
    }
  };
  return map[status] || map.draft;
};

const handleCreate = () => {
  selectedBulletin.value = null;
  showFormModal.value = true;
};

const handleEdit = (bulletin) => {
  selectedBulletin.value = bulletin;
  showFormModal.value = true;
};

const handleSave = async (payload) => {
  await bulletinService.createBulletin(payload);
  showFormModal.value = false;
  fetchMyBulletins();
};

const viewRejectionNote = (bulletin) => {
  currentRejectionNote.value = bulletin.verifierNote || 'Tidak ada keterangan tambahan.';
  showRejectionModal.value = true;
};
</script>

<template>
  <div class="space-y-8 pb-12 animate-in fade-in duration-700">
    <!-- Header (Consistent with Data Siswa) -->
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
      <div class="space-y-1">
        <h1 class="text-3xl font-black text-foreground tracking-tight">Buletin Saya</h1>
        <p class="text-muted-foreground font-medium">Kelola tulisan dan kontribusi Anda di majalah sekolah.</p>
      </div>
      <button @click="handleCreate"
        class="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-3">
        <PlusIcon class="w-5 h-5" />
        Buat Buletin Baru
      </button>
    </div>

    <!-- Filters (Premium Glassmorphism Style from Data Siswa) -->
    <div
      class="relative z-40 bg-background/60 backdrop-blur-md border border-primary/10 rounded-[32px] p-2 shadow-xl shadow-primary/5">
      <div class="flex flex-col lg:flex-row items-stretch lg:items-center gap-2">
        <!-- Search -->
        <div class="relative flex-1 group">
          <div class="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <MagnifyingGlassIcon
              class="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>
          <input v-model="searchQuery" type="text" placeholder="Cari judul atau isi buletin..."
            class="block w-full pl-14 pr-6 py-5 bg-primary/5 border-transparent rounded-[24px] text-sm font-bold focus:bg-background focus:ring-4 focus:ring-primary/10 outline-none transition-all" />
        </div>

        <div class="flex flex-col sm:flex-row gap-2">
          <!-- Status Dropdown -->
          <div class="relative w-full sm:w-64">
            <button @click="showStatusDropdown = !showStatusDropdown"
              class="w-full h-full flex items-center justify-between px-6 py-5 bg-primary/5 border-transparent rounded-[24px] text-sm font-black text-foreground hover:bg-primary/10 transition-all text-left">
              <div class="flex items-center gap-3">
                <FunnelIcon class="w-4 h-4 text-primary" />
                <span>{{statusOptions.find(opt => opt.value === selectedStatus)?.label}}</span>
              </div>
              <ChevronDownIcon class="w-4 h-4 text-muted-foreground transition-transform duration-300"
                :class="{ 'rotate-180': showStatusDropdown }" />
            </button>

            <div v-if="showStatusDropdown"
              class="absolute top-full left-0 right-0 mt-3 z-[60] bg-background/95 backdrop-blur-lg border border-primary/10 rounded-[28px] shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-200">
              <div class="space-y-1">
                <button v-for="opt in statusOptions" :key="opt.value"
                  @click="selectedStatus = opt.value; showStatusDropdown = false"
                  class="w-full flex items-center justify-between px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                  :class="selectedStatus === opt.value ? 'bg-primary text-white shadow-lg' : 'hover:bg-primary/5 text-muted-foreground hover:text-foreground'">
                  <span>{{ opt.label }}</span>
                  <CheckIcon v-if="selectedStatus === opt.value" class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bulletin List (Horizontal Card Style consistent with Data Siswa) -->
    <div class="space-y-4">
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 3" :key="i"
          class="bg-background border border-primary/10 rounded-[32px] p-6 animate-pulse h-32"></div>
      </div>

      <template v-else-if="bulletins.length > 0">
        <div v-for="bulletin in bulletins" :key="bulletin.id"
          class="group bg-background border border-primary/10 rounded-[40px] p-6 hover:shadow-2xl hover:shadow-primary/5 transition-all hover:-translate-y-1 overflow-hidden">
          <div class="flex flex-col md:flex-row items-center gap-8">
            <!-- Media Preview Circle/Square like avatar -->
            <div class="relative shrink-0">
              <div
                class="w-24 h-24 rounded-[28px] overflow-hidden bg-primary/5 border-2 border-primary/5 group-hover:border-primary/20 transition-all shadow-inner">
                <img v-if="bulletin.mediaUrl || bulletin.thumbnailUrl"
                  :src="bulletin.type === 'video' ? bulletin.thumbnailUrl : bulletin.mediaUrl"
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div v-else class="w-full h-full flex items-center justify-center text-primary/20">
                  <BookOpenIcon class="w-10 h-10" />
                </div>
              </div>
              <div class="absolute -bottom-2 -right-2 bg-background p-1.5 rounded-xl shadow-md border border-primary/5">
                <InformationCircleIcon v-if="bulletin.type === 'image'" class="w-4 h-4 text-primary" />
                <VideoCameraIcon v-else class="w-5 h-5 text-primary" />
              </div>
            </div>

            <!-- Content Area -->
            <div class="flex-1 space-y-2 min-w-0">
              <div class="flex items-center gap-4">
                <span
                  class="px-3 py-1 bg-primary/5 text-primary text-[10px] font-black rounded-full uppercase tracking-widest">{{
                    bulletin.category }}</span>
                <span class="text-[10px] font-bold text-muted-foreground uppercase opacity-40">{{ bulletin.date
                  }}</span>
                <span v-if="bulletin.usePenName && bulletin.penName || !bulletin.usePenName && bulletin.author"
                  class="text-[10px] font-black text-primary/40 uppercase tracking-widest italic">• {{
                    bulletin.usePenName ? bulletin.penName : bulletin.author
                  }}</span>
              </div>
              <h3
                class="text-xl font-black text-foreground group-hover:text-primary transition-colors truncate tracking-tighter">
                {{ bulletin.title }}
              </h3>
              <p class="text-sm text-muted-foreground line-clamp-1 font-medium italic pr-10">
                "{{ bulletin.excerpt }}"
              </p>
            </div>

            <!-- Status & Actions (Right Aligned like Data Siswa) -->
            <div
              class="flex flex-col sm:flex-row items-center gap-6 shrink-0 w-full md:w-auto pt-6 md:pt-0 border-t md:border-t-0 md:border-l border-primary/5 md:pl-8">
              <div
                class="px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border flex items-center gap-2 shadow-sm"
                :class="getStatusDetails(bulletin.status).color">
                <component :is="getStatusDetails(bulletin.status).icon" class="w-4 h-4" />
                {{ getStatusDetails(bulletin.status).label }}
              </div>

              <div class="flex items-center gap-2">
                <button v-if="bulletin.status === 'rejected'" @click="viewRejectionNote(bulletin)"
                  class="p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-600 hover:text-white transition-all active:scale-95 shadow-sm"
                  title="Lihat Revisi">
                  <ChatBubbleLeftRightIcon class="w-5 h-5" />
                </button>
                <button v-if="['draft', 'rejected'].includes(bulletin.status)" @click="handleEdit(bulletin)"
                  class="p-3 bg-primary/5 text-primary rounded-2xl hover:bg-primary hover:text-white transition-all active:scale-95 shadow-sm"
                  title="Ubah">
                  <PencilIcon class="w-5 h-5" />
                </button>
                <button @click="router.push(`/admin/bulletins/${bulletin.id}`)"
                  class="p-3 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-600 hover:text-white transition-all active:scale-95 shadow-sm"
                  title="Lihat">
                  <EyeIcon class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Empty State -->
      <div v-else class="text-center py-32 bg-primary/5 rounded-[60px] border-4 border-dashed border-primary/10">
        <div class="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
          <InboxIcon class="w-12 h-12 text-primary/50" />
        </div>
        <h3 class="text-3xl font-black text-foreground mb-4 tracking-tighter">BELUM ADA ARTIKEL.</h3>
        <p class="text-muted-foreground font-medium text-lg max-w-sm mx-auto">Mulai menulis sekarang dan buat inspirasi
          untuk
          sekolah kita!</p>
      </div>
    </div>

    <!-- Wider Modal Support (xl) -->
    <Modal :show="showFormModal" size="xl" @close="showFormModal = false"
      :title="selectedBulletin ? 'Detail & Edit Artikel' : 'Tulis Artikel Baru'"
      desc="Pastikan isi konten informatif dan sesuai dengan norma sekolah.">
      <BulletinForm :bulletin="selectedBulletin" @cancel="showFormModal = false" @save="handleSave"
        @submit="handleSave" />
    </Modal>

    <!-- Rejection Note Modal -->
    <Modal :show="showRejectionModal" @close="showRejectionModal = false" title="Catatan Revisi"
      desc="Berdasarkan hasil tinjauan dari tim verifikator.">
      <div class="space-y-6">
        <div class="bg-rose-50 border border-rose-100 rounded-[32px] p-8 relative overflow-hidden">
          <div class="absolute -top-10 -right-10 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl"></div>
          <div class="relative flex gap-5">
            <ChatBubbleLeftRightIcon class="w-8 h-8 text-rose-500 shrink-0" />
            <div class="space-y-2">
              <h5 class="text-xs font-black uppercase tracking-widest text-rose-600">Alasan Penolakan</h5>
              <p class="text-sm text-foreground font-medium leading-relaxed italic whitespace-pre-wrap">
                "{{ currentRejectionNote }}"
              </p>
            </div>
          </div>
        </div>

        <div class="bg-primary/5 rounded-[32px] p-8 border border-primary/10 flex gap-5">
          <InformationCircleIcon class="w-8 h-8 text-primary shrink-0" />
          <div class="space-y-2">
            <h5 class="text-xs font-black uppercase tracking-widest text-primary">Langkah Selanjutnya</h5>
            <p class="text-[11px] text-muted-foreground font-semibold leading-relaxed">
              Klik tombol "Ubah" (ikon pensil) pada artikel Anda untuk melakukan perbaikan sesuai dengan catatan di
              atas,
              kemudian kirimkan kembali untuk direview.
            </p>
          </div>
        </div>

        <button @click="showRejectionModal = false"
          class="w-full py-4 bg-primary text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
          Tutup
        </button>
      </div>
    </Modal>
  </div>
</template>