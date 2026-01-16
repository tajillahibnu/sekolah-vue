<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useToast } from '../composables/useToast';

const email = ref('budi@sekolah.id');
const password = ref('password');
const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();
const loading = ref(false);

const handleLogin = async () => {
  loading.value = true;
  try {
    await authStore.login({ email: email.value, password: password.value });
    toast.success('Login Berhasil!');
    router.push('/admin');
  } catch (error) {
    toast.error('Login Gagal. Cek kredensial anda.');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-primary/10 via-base-200 to-secondary/10 flex items-center justify-center p-4">
    <div class="card w-full max-w-md shadow-2xl bg-base-100 border border-base-300">
      <div class="card-body p-8">
        <router-link to="/"
          class="flex items-center gap-2 text-primary hover:text-primary/70 transition-colors text-sm font-medium mb-6 group w-fit">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform group-hover:-translate-x-1"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali ke Beranda
        </router-link>
        <div class="flex flex-col items-center mb-8 text-center">
          <div
            class="w-20 h-20 bg-primary text-primary-content rounded-2xl flex items-center justify-center mb-4 shadow-xl rotate-3 hover:rotate-0 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <h2 class="text-4xl font-extrabold text-primary tracking-tight">Sekolah App</h2>
          <p class="text-sm text-base-content/60 mt-2">Sistem Administrasi Sekolah Terpadu</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-5">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">Email Pengguna</span>
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-base-content/40">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </span>
              <input type="email" v-model="email" placeholder="nama@sekolah.id"
                class="input input-bordered w-full pl-10 focus:input-primary transition-all duration-200" required />
            </div>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">Kata Sandi</span>
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-base-content/40">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clip-rule="evenodd" />
                </svg>
              </span>
              <input type="password" v-model="password" placeholder="********"
                class="input input-bordered w-full pl-10 focus:input-primary transition-all duration-200" required />
            </div>
          </div>

          <div class="flex items-center justify-between text-sm mt-1">
            <label class="label cursor-pointer gap-2">
              <input type="checkbox" class="checkbox checkbox-sm checkbox-primary" />
              <span class="label-text">Ingat saya</span>
            </label>
            <a href="#" class="link link-primary link-hover font-medium">Lupa password?</a>
          </div>

          <div class="form-control mt-8">
            <button type="submit"
              class="btn btn-primary w-full shadow-lg hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              :class="{ 'loading': loading }" :disabled="loading">
              Masuk ke Dashboard
            </button>
          </div>
        </form>

        <div class="divider text-xs text-base-content/30 mt-8 uppercase tracking-widest">© 2024 Sekolah App</div>
      </div>
    </div>
  </div>
</template>
