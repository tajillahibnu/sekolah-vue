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

const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const router = useRouter();
const toast = useToast();
const loading = ref(false);
const { theme, setTheme } = useTheme();

const toggleTheme = () => {
    setTheme(theme.value === 'dark' ? 'light' : 'dark');
};

const handleRegister = async () => {
    if (password.value !== confirmPassword.value) {
        toast.error('Password tidak cocok!');
        return;
    }

    loading.value = true;
    // Mock registration delay
    setTimeout(() => {
        loading.value = false;
        toast.success('Registrasi berhasil! Silakan cek kode OTP.');
        router.push('/auth/otp');
    }, 1500);
};
</script>

<template>
    <div
        class="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">

        <router-link to="/"
            class="absolute right-4 top-4 md:right-8 md:top-8 z-50 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeftIcon class="w-4 h-4" />
            Kembali ke Portal
        </router-link>

        <!-- Left Side (Branding / Hero) -->
        <div class="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
            <div class="absolute inset-0 bg-zinc-900">
                <img src="/assets/login-bg.png" alt="Background" class="h-full w-full object-cover opacity-80" />
                <div class="absolute inset-0 bg-primary/20 mix-blend-multiply" />
            </div>
            <div class="relative z-20 flex items-center text-lg font-medium gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2 h-6 w-6">
                    <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
                </svg>
                Sekolah App
            </div>
            <div class="relative z-20 mt-auto">
                <blockquote class="space-y-2">
                    <p class="text-lg">
                        &ldquo;Bergabunglah dengan ribuan sekolah yang telah bertransformasi digital.&rdquo;
                    </p>
                </blockquote>
            </div>
        </div>

        <!-- Right Side (Register Form) -->
        <div class="lg:p-8">
            <div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                <div class="flex flex-col space-y-2 text-center">
                    <h1 class="text-2xl font-semibold tracking-tight">
                        Buat Akun Baru
                    </h1>
                    <p class="text-sm text-muted-foreground">
                        Lengkapi data di bawah ini untuk mendaftar
                    </p>
                </div>

                <div class="grid gap-6">
                    <form @submit.prevent="handleRegister">
                        <div class="grid gap-4">
                            <div class="grid gap-2">
                                <Label for="name">Nama Lengkap</Label>
                                <Input id="name" placeholder="Budi Santoso" type="text" :disabled="loading"
                                    v-model="name" required />
                            </div>
                            <div class="grid gap-2">
                                <Label for="email">Email</Label>
                                <Input id="email" placeholder="nama@sekolah.id" type="email" auto-capitalize="none"
                                    auto-complete="email" auto-correct="off" :disabled="loading" v-model="email"
                                    required />
                            </div>
                            <div class="grid gap-2">
                                <Label for="password">Kata Sandi</Label>
                                <Input id="password" type="password" :disabled="loading" v-model="password" required />
                            </div>
                            <div class="grid gap-2">
                                <Label for="confirmPassword">Konfirmasi Kata Sandi</Label>
                                <Input id="confirmPassword" type="password" :disabled="loading"
                                    v-model="confirmPassword" required />
                            </div>

                            <Button :disabled="loading" class="mt-2">
                                <svg v-if="loading" class="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg"
                                    width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                </svg>
                                Daftar Sekarang
                            </Button>
                        </div>
                    </form>

                    <Button variant="outline" type="button" :disabled="loading">
                        <svg class="mr-2 h-4 w-4" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4" />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853" />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05" />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335" />
                        </svg>
                        Google
                    </Button>
                </div>

                <p class="px-8 text-center text-sm text-muted-foreground">
                    Sudah punya akun?
                    <router-link to="/login" class="underline underline-offset-4 hover:text-primary">
                        Masuk
                    </router-link>
                </p>
            </div>
        </div>

        <!-- Floating Theme Toggle -->
        <Button variant="outline" size="icon"
            class="fixed bottom-4 right-4 z-50 rounded-full h-10 w-10 bg-background/80 backdrop-blur shadow-lg hover:bg-accent border-border"
            @click="toggleTheme">
            <SunIcon v-if="theme === 'dark'" class="h-[1.2rem] w-[1.2rem] transition-all" />
            <MoonIcon v-else class="h-[1.2rem] w-[1.2rem] transition-all" />
            <span class="sr-only">Toggle theme</span>
        </Button>
    </div>
</template>
