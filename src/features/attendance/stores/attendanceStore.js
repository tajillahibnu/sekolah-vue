import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAttendanceStore = defineStore('attendance', () => {
    // State
    const dailyAttendance = ref([
        {
            id: 1,
            studentId: 1, // Assumes current user (student) has ID 1 for testing
            studentName: 'Budi Santoso',
            className: 'XII IPA 1',
            date: new Date().toISOString().split('T')[0],
            timeIn: '06:45',
            timeOut: null,
            status: 'Hadir',
            notes: ''
        },
        {
            id: 2,
            studentId: 101,
            studentName: 'Siti Aminah',
            className: 'XII IPA 1',
            date: new Date().toISOString().split('T')[0],
            timeIn: '06:55',
            timeOut: '14:00',
            status: 'Hadir',
            notes: ''
        },
        {
            id: 3,
            studentId: 102,
            studentName: 'Rudi Hermawan',
            className: 'XII IPA 1',
            date: new Date().toISOString().split('T')[0],
            timeIn: '',
            timeOut: '',
            status: 'Alpha',
            notes: 'Tanpa Keterangan'
        }
    ]);

    const kbmAttendance = ref([
        {
            id: 1,
            studentId: 1,
            studentName: 'Budi Santoso',
            className: 'XII IPA 1',
            subject: 'Matematika Wajib',
            teacher: 'Pak Guru A',
            date: new Date().toISOString().split('T')[0],
            status: 'Hadir',
            time: '07:00 - 08:30'
        },
        {
            id: 2,
            studentId: 1,
            studentName: 'Budi Santoso',
            className: 'XII IPA 1',
            subject: 'Fisika',
            teacher: 'Bu Guru B',
            date: new Date().toISOString().split('T')[0],
            status: 'Izin',
            time: '08:30 - 10:00'
        }
    ]);

    const loading = ref(false);

    // Getters
    const todayLog = computed(() => {
        const today = new Date().toISOString().split('T')[0];
        return dailyAttendance.value.filter(log => log.date === today);
    });

    const getMyTodayStatus = (studentId) => computed(() => {
        const today = new Date().toISOString().split('T')[0];
        return dailyAttendance.value.find(log => log.studentId === studentId && log.date === today);
    });

    const todayStatusMap = computed(() => {
        const today = new Date().toISOString().split('T')[0];
        const map = {};
        dailyAttendance.value.forEach(log => {
            if (log.date === today) {
                map[log.studentId] = log;
            }
        });
        return map;
    });

    // Actions
    function checkIn(studentInfo) {
        loading.value = true;
        return new Promise((resolve) => {
            setTimeout(() => {
                const today = new Date().toISOString().split('T')[0];
                const now = new Date();
                const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

                const newLog = {
                    id: Date.now(),
                    studentId: studentInfo.id,
                    studentName: studentInfo.name,
                    className: studentInfo.class || 'XII IPA 1', // Mock class
                    date: today,
                    timeIn: timeString,
                    timeOut: null,
                    status: 'Hadir',
                    notes: ''
                };

                dailyAttendance.value.unshift(newLog); // Add to top
                loading.value = false;
                resolve(newLog);
            }, 800);
        });
    }

    function checkOut(logId) {
        loading.value = true;
        return new Promise((resolve) => {
            setTimeout(() => {
                const log = dailyAttendance.value.find(l => l.id === logId);
                if (log) {
                    const now = new Date();
                    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                    log.timeOut = timeString;
                }
                loading.value = false;
                resolve(log);
            }, 800);
        });
    }

    function getStudentHistory(studentId) {
        return dailyAttendance.value
            .filter(log => log.studentId === studentId)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    function updateLog(logId, updates) {
        loading.value = true;
        return new Promise((resolve) => {
            setTimeout(() => {
                const logIndex = dailyAttendance.value.findIndex(l => l.id === logId);
                if (logIndex !== -1) {
                    dailyAttendance.value[logIndex] = {
                        ...dailyAttendance.value[logIndex],
                        ...updates
                    };
                }
                loading.value = false;
                resolve(dailyAttendance.value[logIndex]);
            }, 500);
        });
    }

    function addLog(logData) {
        loading.value = true;
        return new Promise((resolve) => {
            setTimeout(() => {
                const newLog = {
                    id: Date.now(),
                    ...logData
                };
                dailyAttendance.value.unshift(newLog); // Add to top
                loading.value = false;
                resolve(newLog);
            }, 500);
        });
    }

    function getAllDaily(filter = {}) {
        // Simple filter implementation
        let result = dailyAttendance.value;
        if (filter.class) {
            result = result.filter(l => l.className === filter.class);
        }
        if (filter.date) {
            result = result.filter(l => l.date === filter.date);
        }
        return result.sort((a, b) => b.id - a.id);
    }

    function getAllKbm(filter = {}) {
        let result = kbmAttendance.value;
        if (filter.class) {
            result = result.filter(l => l.className === filter.class);
        }
        return result;
    }

    return {
        dailyAttendance,
        kbmAttendance,
        loading,
        todayLog,
        getMyTodayStatus,
        todayStatusMap,
        checkIn,
        checkOut,
        updateLog,
        addLog,
        getStudentHistory,
        getAllDaily,
        getAllKbm
    };
});
