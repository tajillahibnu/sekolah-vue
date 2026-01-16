<script setup>
const companyName = import.meta.env.VITE_FOOTER_COMPANY_NAME || 'MOCA';
const year = import.meta.env.VITE_FOOTER_YEAR || new Date().getFullYear();
const link = import.meta.env.VITE_FOOTER_LINK || '#';
</script>

<template>
  <footer class="bg-base-200 border-t border-base-300 py-2 sm:py-4 mt-auto">
    <div class="container mx-auto px-4">
      <div class="flex flex-wrap items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm text-base-content/70">
        <span>© {{ year }}</span>
        <a 
          :href="link" 
          target="_blank" 
          rel="noopener noreferrer"
          class="font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          {{ companyName }}
        </a>
        <span class="hidden sm:inline">•</span>
        <span class="hidden sm:inline">All rights reserved</span>
      </div>
    </div>
  </footer>
</template>
