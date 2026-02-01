<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from '../composables/useToast';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/input/Input.vue';
import Label from '@/components/ui/label/Label.vue';
import { SunIcon, MoonIcon, ArrowLeftIcon } from '@heroicons/vue/24/outline';
import { useTheme } from '../composables/useTheme';

const email = ref('');
const router = useRouter();
const toast = useToast();
const loading = ref(false);
const sent = ref(false);
const { theme, setTheme } = useTheme();

const toggleTheme = () => {
    setTheme(theme.value === 'dark' ? 'light' : 'dark');
};

const handleReset = async () => {
    loading.value = true;
    setTimeout(() => {
        loading.value = false;
        sent.value = true;
        toast.success('Email reset password telah dikirim!');
    }, 1500);
};
</script>

<template>
    <div
        class="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">

        <router-link to="/login"
            class="absolute right-4 top-4 md:right-8 md:top-8 z-50 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeftIcon class="w-4 h-4" />
            Kembali ke Login
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

        <!-- Right Side (Forgot Form) -->
        <div class="lg:p-8">
            <div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                <div class="flex flex-col space-y-2 text-center">
                    <h1 class="text-2xl font-semibold tracking-tight">
                        Lupa Kata Sandi?
                    </h1>
                    <p class="text-sm text-muted-foreground">
                        Masukkan email Anda dan kami akan mengirimkan link untuk mereset kata sandi.
                    </p>
                </div>

                <div class="grid gap-6">
                    <form v-if="!sent" @submit.prevent="handleReset">
                        <div class="grid gap-4">
                            <div class="grid gap-2">
                                <Label for="email">Email</Label>
                                <Input id="email" placeholder="nama@sekolah.id" type="email" :disabled="loading"
                                    v-model="email" required />
                            </div>

                            <Button :disabled="loading" class="mt-2">
                                <svg v-if="loading" class="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg"
                                    width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                </svg>
                                Kirim Link Reset
                            </Button>
                        </div>
                    </form>

                    <div v-else class="text-center p-6 bg-primary/10 rounded-xl border border-primary/20">
                        <h3 class="font-bold text-primary mb-2">Email Terkirim!</h3>
                        <p class="text-sm text-muted-foreground mb-4">Silakan cek inbox email {{ email }} untuk
                            instruksi selanjutnya.</p>
                        <Button variant="outline" @click="sent = false" class="w-full">Kirim Ulang</Button>
                    </div>
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
