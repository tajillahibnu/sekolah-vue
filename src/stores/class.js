import { defineStore } from 'pinia';
import classService from '@/services/classService';

export const useClassStore = defineStore('class', {
    state: () => ({
        classes: [],
        loading: false,
        error: null,
        jurusanList: []
    }),

    getters: {
        /**
         * Get class by ID
         */
        getClassById: (state) => (id) => {
            return state.classes.find(c => c.id === parseInt(id));
        },

        /**
         * Get active classes only
         */
        activeClasses: (state) => {
            return state.classes.filter(c => c.status === 'active');
        },

        /**
         * Get classes grouped by grade
         */
        classesByGrade: (state) => {
            const grouped = {};
            state.classes.forEach(c => {
                if (!grouped[c.grade]) {
                    grouped[c.grade] = [];
                }
                grouped[c.grade].push(c);
            });
            return grouped;
        },

        /**
         * Get classes by jurusan (for SMK)
         */
        classesByJurusan: (state) => {
            const grouped = {};
            state.classes.forEach(c => {
                if (c.jurusan) {
                    if (!grouped[c.jurusan]) {
                        grouped[c.jurusan] = [];
                    }
                    grouped[c.jurusan].push(c);
                }
            });
            return grouped;
        },

        /**
         * Get classes with available capacity
         */
        availableClasses: (state) => {
            return state.classes.filter(c =>
                c.status === 'active' &&
                c.currentStudents < c.capacity
            );
        },

        /**
         * Get capacity percentage for a class
         */
        getCapacityPercentage: (state) => (classId) => {
            const classData = state.classes.find(c => c.id === parseInt(classId));
            if (!classData || classData.capacity === 0) return 0;
            return Math.round((classData.currentStudents / classData.capacity) * 100);
        }
    },

    actions: {
        /**
         * Fetch all classes with optional filters
         */
        async fetchClasses(filters = {}) {
            this.loading = true;
            this.error = null;

            try {
                const response = await classService.getClasses(filters);
                this.classes = response.data;
            } catch (error) {
                this.error = error.message;
                console.error('Error fetching classes:', error);
            } finally {
                this.loading = false;
            }
        },

        /**
         * Fetch single class by ID
         */
        async fetchClassById(id) {
            this.loading = true;
            this.error = null;

            try {
                const response = await classService.getClassById(id);
                // Update or add to classes array
                const index = this.classes.findIndex(c => c.id === parseInt(id));
                if (index !== -1) {
                    this.classes[index] = response.data;
                } else {
                    this.classes.push(response.data);
                }
                return response.data;
            } catch (error) {
                this.error = error.message;
                console.error('Error fetching class:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        /**
         * Create new class
         */
        async createClass(classData) {
            this.loading = true;
            this.error = null;

            try {
                const response = await classService.createClass(classData);
                this.classes.push(response.data);
                return response.data;
            } catch (error) {
                this.error = error.message;
                console.error('Error creating class:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        /**
         * Update existing class
         */
        async updateClass(id, classData) {
            this.loading = true;
            this.error = null;

            try {
                const response = await classService.updateClass(id, classData);
                const index = this.classes.findIndex(c => c.id === parseInt(id));
                if (index !== -1) {
                    this.classes[index] = response.data;
                }
                return response.data;
            } catch (error) {
                this.error = error.message;
                console.error('Error updating class:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        /**
         * Delete class
         */
        async deleteClass(id) {
            this.loading = true;
            this.error = null;

            try {
                await classService.deleteClass(id);
                const index = this.classes.findIndex(c => c.id === parseInt(id));
                if (index !== -1) {
                    this.classes.splice(index, 1);
                }
            } catch (error) {
                this.error = error.message;
                console.error('Error deleting class:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        /**
         * Fetch jurusan list (for SMK)
         */
        async fetchJurusanList() {
            try {
                const response = await classService.getJurusanList();
                this.jurusanList = response.data;
            } catch (error) {
                console.error('Error fetching jurusan list:', error);
            }
        },

        /**
         * Get available classes with minimum capacity
         */
        async fetchAvailableClasses(minCapacity = 1) {
            this.loading = true;
            this.error = null;

            try {
                const response = await classService.getAvailableClasses(minCapacity);
                return response.data;
            } catch (error) {
                this.error = error.message;
                console.error('Error fetching available classes:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        }
    }
});
