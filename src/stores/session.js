import { defineStore } from 'pinia';

export const useSessionStore = defineStore('session', {
    state: () => ({
        academicYear: localStorage.getItem('academicYear') || '2023/2024',
        semester: localStorage.getItem('semester') || 'Ganjil',
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
        updateSession(year, semester) {
            this.setAcademicYear(year);
            this.setSemester(semester);
        }
    }
});
