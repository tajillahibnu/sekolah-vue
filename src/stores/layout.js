import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useLayoutStore = defineStore('layout', {
    state: () => ({
        isSidebarOpen: false, // Mobile state
        isSidebarCollapsed: false, // Desktop collapsed state
    }),

    actions: {
        toggleSidebar() {
            this.isSidebarOpen = !this.isSidebarOpen;
        },
        closeSidebar() {
            this.isSidebarOpen = false;
        },
        openSidebar() {
            this.isSidebarOpen = true;
        },
        toggleCollapse() {
            this.isSidebarCollapsed = !this.isSidebarCollapsed;
        }
    }
});
