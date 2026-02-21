import { defineStore } from 'pinia';
import api from '../services/api';

export const useSessionStore = defineStore('session', {
    state: () => ({
        id: localStorage.getItem('activeAcademicSessionId') || null,
        academicYear: localStorage.getItem('academicYear') || 'Menunggu...',
        semester: localStorage.getItem('semester') || '-',
        isSessionLoaded: false
    }),

    actions: {
        setAcademicYear(year) {
            this.academicYear = year;
            localStorage.setItem('academicYear', year);
        },
        setSemester(semester) {
            this.semester = semester;
            localStorage.setItem('semester', semester);
        },
        updateSession(id, year, semester) {
            this.id = id;
            this.setAcademicYear(year);
            this.setSemester(semester);
            localStorage.setItem('activeAcademicSessionId', id);
        },

        async fetchActiveSessionFallback() {
            // Jika user punya preferensi di localStorage, abaikan override fetch active DB
            if (this.id && this.academicYear !== 'Menunggu...') {
                this.isSessionLoaded = true;
                return;
            }

            // Jika belum diset di localstorage, ambil global backend secara otomatis
            try {
                const response = await api.get('/academic-years/active');
                if (response.data && response.data.data) {
                    const activeData = response.data.data;
                    this.updateSession(activeData.id, activeData.name, activeData.semester);
                    this.isSessionLoaded = true;
                }
            } catch (error) {
                console.error('Gagal mengambil Sesi Akademik aktif:', error);
                // Biarkan fallback ke localStorage jika offline/error
            }
        },

        async resetToGlobalActive() {
            try {
                const response = await api.get('/academic-years/active');
                if (response.data && response.data.data) {
                    const activeData = response.data.data;
                    this.updateSession(activeData.id, activeData.name, activeData.semester);
                    this.isSessionLoaded = true;
                    return true;
                }
            } catch (error) {
                console.error('Gagal mengambil Sesi Akademik aktif untuk reset:', error);
            }
            return false;
        }
    }
});
