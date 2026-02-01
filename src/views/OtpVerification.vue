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

const otp = ref('');
const router = useRouter();
const toast = useToast();
const loading = ref(false);
const { theme, setTheme } = useTheme();

const toggleTheme = () => {
    setTheme(theme.value === 'dark' ? 'light' : 'dark');
};

const handleVerify = async () => {
    loading.value = true;
    // Mock OTP verification delay
    setTimeout(() => {
        loading.value = false;
        toast.success('Verifikasi Berhasil!');
        router.push('/login');
    }, 1500);
};
</script>

<template>
    <div
        class="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">

        <router-link to="/register"
            class="absolute right-4 top-4 md:right-8 md:top-8 z-50 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeftIcon class="w-4 h-4" />
            Kembali
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
        </div>

        <!-- Right Side (OTP Form) -->
        <div class="lg:p-8">
            <div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                <div class="flex flex-col space-y-2 text-center">
                    <h1 class="text-2xl font-semibold tracking-tight">
                        Verifikasi OTP
                    </h1>
                    <p class="text-sm text-muted-foreground">
                        Masukkan kode 6 digit yang kami kirimkan ke email Anda.
                    </p>
                </div>

                <div class="grid gap-6">
                    <form @submit.prevent="handleVerify">
                        <div class="grid gap-4">
                            <div class="grid gap-2">
                                <Label for="otp">Kode OTP</Label>
                                <Input id="otp" placeholder="123456" type="text" maxlength="6"
                                    class="text-center tracking-widest text-lg" :disabled="loading" v-model="otp"
                                    required />
                            </div>

                            <Button :disabled="loading" class="mt-2">
                                <svg v-if="loading" class="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg"
                                    width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                </svg>
                                Verifikasi
                            </Button>
                        </div>
                    </form>

                    <p class="px-8 text-center text-sm text-muted-foreground">
                        Tidak menerima kode?
                        <button class="underline underline-offset-4 hover:text-primary font-medium text-foreground">
                            Kirim Ulang
                        </button>
                    </p>
                </div>
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
