<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const activeTab = ref('biodata');

// Mock Data
const user = ref({
    ...authStore.user,
    birthDate: '2 April 1992',
    gender: 'Pria',
    phone: '6285815314796'
});
</script>

<template>
  <div class="flex flex-col lg:flex-row gap-6 p-2">
    <!-- Left Sidebar: Profile Card -->
    <div class="w-full lg:w-1/4 space-y-6">
        <!-- Profile Info -->
        <div class="card bg-base-100 shadow-sm border border-base-200">
            <div class="card-body p-6 flex flex-col items-center text-center">
                <div class="avatar mb-4">
                    <div class="w-24 h-24 rounded-full border-4 border-base-200">
                        <img :src="user.avatar || 'https://ui-avatars.com/api/?name=' + user.name" />
                    </div>
                </div>
                <h2 class="font-bold text-lg mb-1">{{ user.name }}</h2>
                
                <!-- Stats / Wallet (Mock) -->
                <div class="w-full mt-4 space-y-3 text-left">
                    <div class="flex justify-between items-center text-sm">
                        <span class="text-base-content/70">GoPay</span>
                        <span class="font-bold">Rp27.049</span>
                    </div>
                     <div class="flex justify-between items-center text-sm">
                        <span class="text-base-content/70">Tokopedia Card</span>
                        <span class="text-primary font-bold cursor-pointer">Daftar</span>
                    </div>
                    <div class="flex justify-between items-center text-sm">
                        <span class="text-base-content/70">Saldo</span>
                        <span class="font-bold">Rp175</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Menu Navigation -->
        <div class="bg-base-100 shadow-sm border border-base-200 rounded-box p-2">
            <ul class="menu w-full rounded-box">
                <li class="menu-title text-black font-bold">Kotak Masuk</li>
                <li><a>Chat <span class="badge badge-sm badge-error text-white ml-auto">1</span></a></li>
                <li><a>Ulasan</a></li>
                <li><a>Pesan Bantuan</a></li>
                <li><a>Pesanan Dikomplain</a></li>
                
                <li class="menu-title text-black font-bold mt-2">Pembelian</li>
                <li><a>Menunggu Pembayaran</a></li>
                <li><a>Daftar Transaksi</a></li>

                <li class="menu-title text-black font-bold mt-2">Profil Saya</li>
                <li>
                    <a class="active bg-emerald-50 text-emerald-600 font-bold hover:bg-emerald-100 hover:text-emerald-700">
                        Biodata Diri
                    </a>
                </li>
                <li><a>Daftar Alamat</a></li>
            </ul>
        </div>
    </div>

    <!-- Right Content: Profile Settings -->
    <div class="w-full lg:w-3/4">
        <div class="card bg-base-100 shadow-sm border border-base-200">
             <!-- Tabs -->
            <div class="border-b border-base-200 px-6 pt-4">
                <div class="tabs tabs-bordered -mb-px">
                     <a class="tab tab-lg px-6 font-bold tab-active border-b-2 border-emerald-500 text-emerald-600">Biodata Diri</a>
                     <a class="tab tab-lg px-6">Daftar Alamat</a>
                     <a class="tab tab-lg px-6">Pembayaran</a>
                     <a class="tab tab-lg px-6">Notifikasi</a>
                     <a class="tab tab-lg px-6">Keamanan</a>
                </div>
            </div>
            
            <div class="card-body p-8">
                <!-- Main Layout -->
                <div class="flex flex-col md:flex-row gap-8">
                    <!-- Photo Section -->
                    <div class="w-full md:w-1/3 flex flex-col gap-4">
                        <div class="aspect-square rounded-lg border border-base-300 overflow-hidden shadow-sm relative group bg-base-200">
                             <img class="object-cover w-full h-full" src="https://images.unsplash.com/photo-1542831371-29b0f74f9713?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="Profile" />
                        </div>
                        <button class="btn btn-outline w-full font-bold">Pilih Foto</button>
                        <p class="text-xs text-base-content/60 leading-relaxed text-center">
                            Besar file: maksimum 10.000.000 bytes (10 Megabytes). Ekstensi file yang diperbolehkan: .JPG .JPEG .PNG
                        </p>
                    </div>

                    <!-- Details Form -->
                    <div class="w-full md:w-2/3 space-y-8">
                        <div>
                            <h3 class="font-bold text-lg mb-4">Ubah Biodata Diri</h3>
                            <div class="space-y-4">
                                <div class="flex flex-col sm:flex-row sm:items-center justify-between py-2">
                                    <span class="text-base-content/70 w-32">Nama</span>
                                    <div class="flex-1 flex justify-between items-center group">
                                         <span class="font-medium">{{ user.name }}</span>
                                         <span class="text-emerald-600 text-sm font-bold cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">Ubah</span>
                                    </div>
                                </div>
                                <div class="flex flex-col sm:flex-row sm:items-center justify-between py-2">
                                    <span class="text-base-content/70 w-32">Tanggal Lahir</span>
                                    <div class="flex-1 flex justify-between items-center group">
                                         <span class="font-medium">{{ user.birthDate }}</span>
                                         <span class="text-emerald-600 text-sm font-bold cursor-pointer">Ubah Tanggal Lahir</span>
                                    </div>
                                </div>
                                <div class="flex flex-col sm:flex-row sm:items-center justify-between py-2">
                                    <span class="text-base-content/70 w-32">Jenis Kelamin</span>
                                    <div class="flex-1 flex justify-between items-center group">
                                         <span class="font-medium">{{ user.gender }}</span>
                                         <span class="text-emerald-600 text-sm font-bold cursor-pointer">Ubah</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 class="font-bold text-lg mb-4">Ubah Kontak</h3>
                            <div class="space-y-4">
                               <div class="flex flex-col sm:flex-row sm:items-center justify-between py-2">
                                    <span class="text-base-content/70 w-32">Email</span>
                                    <div class="flex-1 flex justify-between items-center">
                                         <div class="flex items-center gap-2">
                                             <span class="font-medium text-sm sm:text-base">{{ user.email }}</span>
                                             <span class="badge badge-success badge-sm text-white font-bold text-xs">Terverifikasi</span>
                                         </div>
                                         <span class="text-emerald-600 text-sm font-bold cursor-pointer">Ubah</span>
                                    </div>
                                </div>
                                <div class="flex flex-col sm:flex-row sm:items-center justify-between py-2">
                                    <span class="text-base-content/70 w-32">Nomor HP</span>
                                    <div class="flex-1 flex justify-between items-center">
                                         <div class="flex items-center gap-2">
                                             <span class="font-medium">{{ user.phone }}</span>
                                             <span class="badge badge-success badge-sm text-white font-bold text-xs">Terverifikasi</span>
                                         </div>
                                         <span class="text-emerald-600 text-sm font-bold cursor-pointer">Ubah</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                             <h3 class="font-bold text-lg mb-4">Safe Mode</h3>
                             <p class="text-sm text-base-content/60 mb-3">Fitur ini akan otomatis menyaring hasil pencarian sesuai kebijakan dan batasan usia pengguna</p>
                             <div class="flex items-center gap-4">
                                 <span class="text-sm font-medium">Aktifkan</span>
                                 <input type="checkbox" class="toggle toggle-success" />
                             </div>
                        </div>

                         <div class="grid grid-cols-1 gap-4 pt-4">
                            <button class="btn btn-outline font-bold justify-between group hover:border-emerald-500 hover:text-emerald-600">
                                Ubah Kata Sandi
                                <span class="hidden group-hover:inline">Update</span>
                            </button>
                            <button class="btn btn-outline font-bold justify-between group hover:border-emerald-500 hover:text-emerald-600">
                                PIN Tokopedia
                                <span class="hidden group-hover:inline">Update</span>
                            </button>
                             <button class="btn btn-outline font-bold justify-between group hover:border-emerald-500 hover:text-emerald-600">
                                Verifikasi Instan
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom overrides for Tokopedia-like feel if needed */
.tab-active {
    color: #03AC0E !important; /* Tokopedia Green */
    border-color: #03AC0E !important;
}
</style>
