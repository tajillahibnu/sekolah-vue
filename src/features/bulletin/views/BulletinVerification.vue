<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import {
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  InboxIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon,
  ArrowPathIcon,
  ArrowLeftIcon
} from '@heroicons/vue/24/outline';
import bulletinService from '@/services/bulletinService';

const router = useRouter();
const bulletins = ref([]);
const loading = ref(true);
const activeTab = ref('pending'); // 'pending' or 'history'
const searchQuery = ref('');
const showReviewModal = ref(false);
const selectedBulletin = ref(null);
const verifierNote = ref('');

// Pagination
const page = ref(1);
const limit = 5;
const total = ref(0);

const fetchBulletins = async () => {
  loading.value = true;
  try {
    const statusParams = activeTab.value === 'pending' ? 'pending' : 'all_historical';
    // We'll mock 'all_historical' in our service to return published/rejected

    const response = await bulletinService.getBulletins({
      status: statusParams,
      q: searchQuery.value,
      limit: 100 // Fetch all for mock pagination
    });

    let filtered = response.data;
    if (activeTab.value === 'history') {
      filtered = filtered.filter(b => ['published', 'rejected'].includes(b.status));
    }

    total.value = filtered.length;
    // Client-side pagination for mock
    bulletins.value = filtered.slice((page.value - 1) * limit, page.value * limit);
  } catch (error) {
    console.error('Failed to fetch bulletins', error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchBulletins);

watch([activeTab, searchQuery, page], () => {
  if (activeTab.value && page.value) fetchBulletins();
});

const openReview = (bulletin) => {
  selectedBulletin.value = bulletin;
  verifierNote.value = '';
  showReviewModal.value = true;
};

const handleApprove = async (bulletinId) => {
  const id = bulletinId || selectedBulletin.value.id;
  await bulletinService.updateBulletinStatus(id, 'published');
  showReviewModal.value = false;
  fetchBulletins();
};

const handleReject = async () => {
  if (!verifierNote.value) {
    alert('Harap berikan alasan penolakan untuk membantu penulis merevisi.');
    return;
  }
  await bulletinService.updateBulletinStatus(selectedBulletin.value.id, 'rejected', verifierNote.value);
  showReviewModal.value = false;
  fetchBulletins();
};

const cancelRejection = async (bulletinId) => {
  if (confirm('Apakah Anda yakin ingin membatalkan penolakan dan langsung menerbitkan buletin ini?')) {
    await bulletinService.updateBulletinStatus(bulletinId, 'published');
    fetchBulletins();
  }
};

const getStatusBadge = (status) => {
  const map = {
    'published': 'bg-emerald-50 text-emerald-600 border-emerald-100',
    'rejected': 'bg-rose-50 text-rose-600 border-rose-100',
    'pending': 'bg-amber-50 text-amber-600 border-amber-100'
  };
  return map[status] || 'bg-slate-50 text-slate-600';
};
</script>

<template>
  <div class="space-y-10 animate-in fade-in duration-700 pb-20">
    <!-- Header -->
    <div class="space-y-2">
      <h1 class="text-4xl font-black tracking-tighter text-foreground">
        VERIFIKASI <span class="text-primary italic">KONTEN.</span>
      </h1>
      <p class="text-muted-foreground font-medium">Tinjau dan kurasi setiap pengajuan buletin sebelum diterbitkan.</p>
    </div>

    <!-- Tabs & Filters (Premium Glassmorphism Style) -->
    <div class="space-y-6">
      <div class="flex flex-col lg:flex-row items-center justify-between gap-6">
        <!-- Modern Tabs -->
        <div class="flex bg-primary/5 p-1.5 rounded-[24px] border border-primary/5">
          <button @click="activeTab = 'pending'; page = 1"
            class="px-8 py-3.5 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
            :class="activeTab === 'pending' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-muted-foreground hover:text-primary'">
            <ClockIcon class="w-4 h-4" />
            Menunggu Review
          </button>
          <button @click="activeTab = 'history'; page = 1"
            class="px-8 py-3.5 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
            :class="activeTab === 'history' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-muted-foreground hover:text-primary'">
            <ArrowPathIcon class="w-4 h-4" />
            Riwayat Review
          </button>
        </div>

        <!-- Search Filter -->
        <div class="relative w-full lg:w-96 group">
          <div class="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <MagnifyingGlassIcon
              class="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>
          <input v-model="searchQuery" type="text" placeholder="Cari penulis atau judul..."
            class="block w-full pl-14 pr-6 py-4 bg-primary/5 border-transparent rounded-[24px] text-sm font-bold focus:bg-background focus:ring-4 focus:ring-primary/10 outline-none transition-all" />
        </div>
      </div>
    </div>

    <!-- Content List -->
    <div class="space-y-4">
      <div v-if="loading" class="space-y-6">
        <div v-for="i in 3" :key="i" class="h-32 w-full bg-primary/5 rounded-[32px] animate-pulse"></div>
      </div>

      <div v-else-if="bulletins.length > 0" class="space-y-4">
        <div v-for="bulletin in bulletins" :key="bulletin.id"
          class="group bg-background border border-primary/5 rounded-[40px] p-6 hover:shadow-2xl hover:shadow-primary/5 transition-all flex flex-col md:flex-row md:items-center gap-8">
          <!-- Media Preview (Simplified like Data Siswa avatar style) -->
          <div
            class="w-20 h-20 rounded-[24px] overflow-hidden bg-primary/10 shrink-0 shadow-inner border border-primary/5">
            <img v-if="bulletin.mediaUrl || bulletin.thumbnailUrl"
              :src="bulletin.type === 'video' ? bulletin.thumbnailUrl : bulletin.mediaUrl"
              class="w-full h-full object-cover" />
          </div>

          <!-- Info -->
          <div class="flex-1 space-y-2">
            <div class="flex items-center gap-3">
              <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border"
                :class="getStatusBadge(bulletin.status)">
                {{ bulletin.status }}
              </span>
              <span class="text-[10px] text-muted-foreground font-bold tracking-widest uppercase italic">
                {{ bulletin.author }} <span v-if="bulletin.usePenName && bulletin.penName">({{ bulletin.penName
                  }})</span> • {{ bulletin.date }}
              </span>
            </div>
            <h3 class="text-xl font-black text-foreground group-hover:text-primary transition-colors tracking-tighter">
              {{ bulletin.title }}
            </h3>
            <p v-if="bulletin.status === 'rejected'" class="text-[11px] font-bold text-rose-500 line-clamp-1 italic">
              "Note: {{ bulletin.verifierNote }}"
            </p>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 pt-6 md:pt-0 border-t md:border-t-0 md:border-l border-primary/5 md:pl-8">
            <button @click="router.push(`/admin/bulletins/${bulletin.id}`)"
              class="p-3 bg-primary/5 text-primary rounded-2xl hover:bg-primary/10 transition-all shadow-sm"
              title="Preview Konten">
              <EyeIcon class="w-5 h-5" />
            </button>

            <!-- Contextual Actions -->
            <template v-if="activeTab === 'pending'">
              <button @click="openReview(bulletin)"
                class="px-6 py-3 bg-primary text-white rounded-2xl hover:scale-105 transition-all shadow-xl shadow-primary/20 font-black text-[10px] uppercase tracking-widest">
                Tinjau Artikel
              </button>
            </template>
            <template v-else-if="bulletin.status === 'rejected'">
              <button @click="cancelRejection(bulletin.id)"
                class="px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
                title="Batal Tolak & Terbitkan">
                <CheckCircleIcon class="w-5 h-5" />
                Terbitkan
              </button>
            </template>
          </div>
        </div>

        <!-- Pagination (Premium Style) -->
        <div class="flex items-center justify-between pt-10 border-t border-primary/5">
          <div class="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
            Menampilkan <span class="text-primary">{{ (page - 1) * limit + 1 }} - {{ Math.min(page * limit, total)
              }}</span>
            dari {{ total }} Artikel
          </div>
          <div class="flex items-center gap-2">
            <button @click="page--" :disabled="page === 1"
              class="p-2.5 bg-primary/5 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary/10 transition-all">
              <ArrowLeftIcon class="w-5 h-5" />
            </button>
            <button v-for="p in Math.ceil(total / limit)" :key="p" @click="page = p"
              class="w-10 h-10 rounded-xl text-[10px] font-black transition-all"
              :class="page === p ? 'bg-primary text-white shadow-lg' : 'bg-primary/5 text-muted-foreground hover:bg-primary/10'">
              {{ p }}
            </button>
            <button @click="page++" :disabled="page * limit >= total"
              class="p-2.5 bg-primary/5 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary/10 transition-all rotate-180">
              <ArrowLeftIcon class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-32 bg-primary/5 rounded-[60px] border-4 border-dashed border-primary/10">
        <div class="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
          <component :is="activeTab === 'pending' ? CheckCircleIcon : InboxIcon" class="w-12 h-12 text-primary/50" />
        </div>
        <h3 class="text-3xl font-black text-foreground mb-4 tracking-tighter uppercase">
          {{ activeTab === 'pending' ? 'Semua Beres!' : 'Riwayat Kosong' }}
        </h3>
        <p class="text-muted-foreground font-medium text-lg max-w-sm mx-auto">
          {{ activeTab === 'pending' ? 'Tidak ada pengajuan buletin baru yang menunggu verifikasi saat ini.' : 'Belum ada riwayat verifikasi yang terekam.' }}
        </p>
      </div>
    </div>

    <!-- Review Modal -->
    <div v-if="showReviewModal"
      class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        class="bg-card w-full max-w-lg rounded-[48px] p-10 space-y-8 shadow-2xl border border-primary/10 overflow-hidden relative">
        <div class="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>

        <div class="relative space-y-4">
          <h3 class="text-3xl font-black tracking-tighter text-foreground leading-none">
            REVIEW <span class="text-primary italic">KONTEN.</span>
          </h3>
          <p class="text-muted-foreground font-medium text-sm">
            Apakah Anda ingin menyetujui "<strong>{{ selectedBulletin?.title }}</strong>" untuk diterbitkan?
          </p>
        </div>

        <div class="space-y-4 relative">
          <label class="text-[10px] font-black uppercase tracking-widest text-primary ml-2 flex items-center gap-2">
            <ChatBubbleLeftRightIcon class="w-4 h-4" />
            Catatan Verifikator (Wajib jika Tolak)
          </label>
          <textarea v-model="verifierNote" rows="4"
            placeholder="Tuliskan alasan penolakan agar penulis dapat melakukan revisi..."
            class="w-full px-8 py-5 bg-primary/5 border-none rounded-[32px] text-sm font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none"></textarea>
        </div>

        <div class="flex flex-col sm:flex-row gap-4 pt-4 relative">
          <button @click="handleReject"
            class="flex-1 py-5 bg-rose-50 text-rose-600 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-2">
            <XCircleIcon class="w-5 h-5" /> Tolak & Revisi
          </button>
          <button @click="handleApprove()"
            class="flex-1 py-5 bg-primary text-white rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-105 transition-all flex items-center justify-center gap-2">
            <CheckCircleIcon class="w-5 h-5" /> Terbitkan
          </button>
        </div>

        <button @click="showReviewModal = false"
          class="absolute top-6 right-6 text-muted-foreground hover:text-foreground p-2">
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>
    </div>
  </div>
</template>
