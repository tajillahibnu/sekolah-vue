<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useToast } from '../composables/useToast';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/input/Input.vue';
import Label from '@/components/ui/label/Label.vue';
import { SunIcon, MoonIcon, ArrowLeftIcon } from '@heroicons/vue/24/outline';
import { useTheme } from '../composables/useTheme';

const email = ref('');
const password = ref('');
const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();
const loading = ref(false);
const { theme, setTheme } = useTheme();

const toggleTheme = () => {
  setTheme(theme.value === 'dark' ? 'light' : 'dark');
};

const handleLogin = async () => {
  loading.value = true;
  const loadingToast = toast.loading('Memproses login...');
  try {
    await authStore.login({ email: email.value, password: password.value });
    toast.dismiss(loadingToast); // Dismiss loading toast
    toast.success('Login Berhasil!');
    router.push('/admin');
  } catch (error) {
    toast.dismiss(loadingToast);
    toast.error('Login Gagal. Cek kredensial anda.');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen w-full lg:grid lg:grid-cols-2">
    
    <!-- Left Side: Professional Branding & Context -->
    <div class="hidden lg:flex flex-col relative bg-slate-900 text-white overflow-hidden">
        <!-- Abstract Professional Background -->
        <div class="absolute inset-0">
            <div class="absolute inset-0 bg-blue-600/20 mix-blend-multiply"></div>
            <!-- Subtle patterned background or image -->
            <img src="/assets/login-bg.png" alt="School Dashboard" class="w-full h-full object-cover opacity-30 grayscale mix-blend-overlay" />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
        </div>

        <div class="relative z-10 flex flex-col justify-between h-full p-12">
            <!-- Brand Logo Area -->
            <div class="flex items-center gap-3">
                <div class="p-2 bg-blue-600 rounded-lg shadow-sm">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-white">
                        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                    </svg>
                </div>
                <span class="text-xl font-bold tracking-tight">Sekolah Admin</span>
            </div>

            <!-- Testimonial / Value Prop -->
            <div class="max-w-md">
                <blockquote class="text-xl font-medium leading-relaxed text-slate-100">
                    "Sistem manajemen terintegrasi untuk efisiensi operasional sekolah Anda. Kelola akademik, kesiswaan, dan administrasi dalam satu dashboard."
                </blockquote>
                <div class="mt-6 flex items-center gap-4">
                    <div class="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-400/30">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                           <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div>
                        <div class="font-semibold text-white">Admin Portal v2.0</div>
                        <div class="text-sm text-slate-400">Secure Enterprise Access</div>
                    </div>
                </div>
            </div>

            <!-- Footer Links (Left) -->
            <div class="flex gap-6 text-sm text-slate-400">
                <a href="#" class="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" class="hover:text-white transition-colors">Terms of Service</a>
            </div>
        </div>
    </div>

    <!-- Right Side: Login Form -->
    <div class="flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 bg-white dark:bg-slate-950 transition-colors duration-300">
        
        <div class="w-full max-w-sm space-y-8">
            <!-- Header for Mobile (Logo visible only on mobile) -->
            <div class="lg:hidden flex items-center gap-2 mb-8 justify-center text-slate-900 dark:text-white">
                 <div class="p-2 bg-blue-600 rounded-lg">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-white">
                        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                    </svg>
                </div>
                <span class="font-bold text-lg">Sekolah Admin</span>
            </div>

            <div class="text-center lg:text-left space-y-2">
                <h1 class="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Masuk Akun</h1>
                <p class="text-slate-500 dark:text-slate-400">Masukkan kredensial Anda untuk mengakses dashboard.</p>
            </div>

            <form @submit.prevent="handleLogin" class="space-y-6">
                <div class="space-y-4">
                    <div class="space-y-2">
                        <Label for="email" class="text-sm font-medium text-slate-700 dark:text-slate-300">Email Sekolah</Label>
                        <Input 
                            v-model="email"
                            id="email" 
                            type="email" 
                            placeholder="nama@sekolah.id" 
                            :disabled="loading"
                            class="h-11 rounded-lg border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500/20 bg-white dark:bg-slate-900"
                        />
                    </div>
                    
                    <div class="space-y-2">
                        <div class="flex items-center justify-between">
                            <Label for="password" class="text-sm font-medium text-slate-700 dark:text-slate-300">Kata Sandi</Label>
                            <router-link to="/forgot-password" class="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">Lupa sandi?</router-link>
                        </div>
                        <Input 
                            v-model="password"
                            id="password" 
                            type="password" 
                            :disabled="loading"
                            class="h-11 rounded-lg border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500/20 bg-white dark:bg-slate-900"
                        />
                    </div>
                </div>

                <Button 
                    :disabled="loading"
                    class="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-all text-sm"
                >
                    <svg v-if="loading" class="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    <span>Masuk ke Dashboard</span>
                </Button>
                
                <div class="relative">
                    <div class="absolute inset-0 flex items-center">
                    <span class="w-full border-t border-slate-200 dark:border-slate-800"></span>
                    </div>
                    <div class="relative flex justify-center text-xs uppercase">
                    <span class="bg-white dark:bg-slate-950 px-2 text-slate-500">
                        Atau masuk dengan
                    </span>
                    </div>
                </div>

                 <Button 
                    variant="outline" 
                    type="button" 
                    :disabled="loading"
                    class="w-full h-11 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-all"
                >
                    <svg class="mr-2 h-5 w-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Google Workspace
                </Button>
            </form>

            <p class="text-center text-sm text-slate-500 dark:text-slate-400">
                Belum terdaftar? <router-link to="/register" class="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400">Hubungi Administrator</router-link>
            </p>
        </div>

        <!-- Theme Toggle (Bottom Right Corner) -->
        <div class="fixed bottom-6 right-6 z-50">
            <Button variant="ghost" size="icon"
            class="rounded-full h-10 w-10 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-lg backdrop-blur-sm text-slate-600 dark:text-slate-400 hover:text-blue-600"
            @click="toggleTheme">
            <SunIcon v-if="theme === 'dark'" class="h-5 w-5" />
            <MoonIcon v-else class="h-5 w-5" />
            <span class="sr-only">Toggle theme</span>
            </Button>
        </div>
    </div>
  </div>
</template>
