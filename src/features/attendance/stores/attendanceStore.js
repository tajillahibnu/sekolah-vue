import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAttendanceStore = defineStore('attendance', () => {
    // --- Mock Data Generators ---
    const classes = ['XII IPA 1', 'XII IPA 2', 'XII IPS 1', 'XI IPA 1', 'XI IPS 1', 'X A', 'X B'];
    const subjects = ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'B. Indonesia', 'B. Inggris', 'PKN', 'Sejarah', 'Agama', 'Penjaskes'];
    const teachers = ['Pak Budi', 'Bu Siti', 'Pak Agus', 'Bu Rina', 'Pak Doni', 'Bu Eka', 'Pak Fajar'];

    // Detailed Student Data for Demo
    // Matches typical mock names found in student lists
    const studentNames = [
        'Ahmad Dahlan', 'Budi Santoso', 'Citra Kirana', 'Dewi Lestari', 'Eko Saputra',
        'Fajar Nugraha', 'Gita Gutawa', 'Hendra Wijaya', 'Indah Permatasari', 'Joko Anwar',
        'Kartika Putri', 'Lukman Sardi', 'Mawar Eva', 'Nicholas Saputra', 'Olivia Jensen',
        'Putri Titian', 'Reza Rahadian', 'Sandra Dewi', 'Tora Sudiro', 'Vino G. Bastian',
        'Wulan Guritno', 'Xavier Marks', 'Yuki Kato', 'Zaskia Adya Mecca'
    ];

    // Generate Daily Log / Student List
    const generateStudents = () => {
        const list = [];
        let idCounter = 1;

        // 1. Current User (You)
        list.push({
            id: idCounter++,
            studentId: 1,
            studentName: 'Tajillah Ibnu', // Changed to match likely user
            className: 'XII IPA 1',
            date: new Date().toISOString().split('T')[0],
            timeIn: '06:42',
            timeOut: null,
            status: 'Hadir',
            notes: '',
            photo: null
        });

        // 2. Population from Name List
        studentNames.forEach((name, idx) => {
            const cls = classes[idx % classes.length];
            const isLate = Math.random() > 0.8;
            const statusRandom = Math.random();

            let status = 'Hadir';
            let timeIn = `06:${45 + Math.floor(Math.random() * 15)}`; // On time mostly

            if (isLate) {
                timeIn = `07:${Math.floor(Math.random() * 30)}`; // Late
            }

            if (statusRandom > 0.85) {
                status = 'Sakit';
                timeIn = '-';
            } else if (statusRandom > 0.95) {
                status = 'Alpha';
                timeIn = '-';
            } else if (statusRandom > 0.80) {
                status = 'Izin';
                timeIn = '-';
            }

            list.push({
                id: idCounter++,
                studentId: 100 + idx,
                studentName: name,
                className: cls,
                date: new Date().toISOString().split('T')[0],
                timeIn: timeIn === '-' ? '-' : (status === 'Hadir' ? timeIn : '-'),
                timeOut: null,
                status: status,
                notes: status === 'Late' ? 'Terlambat' : '',
                photo: null
            });
        });

        return list;
    };

    // State
    const dailyAttendance = ref(generateStudents());
    const loading = ref(false);

    // --- Actions & Getters ---

    const getClasses = () => classes;

    const getStudentsByClass = (className) => {
        return dailyAttendance.value.filter(l => l.className === className);
    };

    const getAllStudents = () => {
        return dailyAttendance.value;
    };

    // Cache for consistency in KBM schedule
    const scheduleCache = new Map();

    const getKbmSchedule = (studentId) => {
        if (scheduleCache.has(studentId)) {
            return scheduleCache.get(studentId);
        }

        // Schedule Structure (Fixed Time Slots)
        const schedule = [
            { type: 'lesson', time: '06:45 - 07:30', jam: 1 },
            { type: 'lesson', time: '07:30 - 08:15', jam: 2 },
            { type: 'lesson', time: '08:15 - 09:00', jam: 3 },
            { type: 'break', time: '09:00 - 09:15', label: 'Istirahat Pertama' },
            { type: 'lesson', time: '09:15 - 10:00', jam: 4 },
            { type: 'lesson', time: '10:00 - 10:45', jam: 5 },
            { type: 'lesson', time: '10:45 - 11:30', jam: 6 },
            { type: 'lesson', time: '11:30 - 12:00', jam: 7 }, // Shortened before Ishoma
            { type: 'break', time: '12:00 - 12:15', label: 'ISHOMA' },
            { type: 'lesson', time: '12:15 - 13:00', jam: 8 },
        ];

        // Randomly assign subjects/presence based on daily status
        const studentLog = dailyAttendance.value.find(s => s.studentId === studentId) ||
            dailyAttendance.value.find(s => s.id === studentId); // Fallback to ID match

        const baseStatus = studentLog ? studentLog.status : 'Hadir';

        const kbmData = schedule.map(slot => {
            if (slot.type === 'break') return slot;

            let slotStatus = baseStatus;

            // If main status is Hadir, introduce some variation (skipped class, sick mid-day)
            if (baseStatus === 'Hadir') {
                const rand = Math.random();
                if (rand > 0.95) slotStatus = 'Bolos'; // Rare bolos
                else if (rand > 0.98) slotStatus = 'Izin UKS';
            }

            return {
                ...slot,
                subject: subjects[Math.floor(Math.random() * subjects.length)],
                teacher: teachers[Math.floor(Math.random() * teachers.length)],
                status: slotStatus,
                scanIn: slotStatus === 'Hadir' ? slot.time.split(' - ')[0] : '-',
                scanOut: slotStatus === 'Hadir' ? slot.time.split(' - ')[1] : '-'
            };
        });

        scheduleCache.set(studentId, kbmData);
        return kbmData;
    };

    // --- Legacy Actions (Preserved) ---
    function checkIn(studentInfo) {
        loading.value = true;
        return new Promise((resolve) => {
            setTimeout(() => {
                const today = new Date().toISOString().split('T')[0];
                const now = new Date();
                const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

                const existing = dailyAttendance.value.find(s => s.studentId === studentInfo.id);
                if (existing) {
                    existing.timeIn = timeString;
                    existing.status = 'Hadir';
                    resolve(existing);
                } else {
                    const newLog = {
                        id: Date.now(),
                        studentId: studentInfo.id,
                        studentName: studentInfo.name,
                        className: studentInfo.class || 'XII IPA 1',
                        date: today,
                        timeIn: timeString,
                        timeOut: null,
                        status: 'Hadir',
                        notes: ''
                    };
                    dailyAttendance.value.unshift(newLog);
                    resolve(newLog);
                }
                loading.value = false;
            }, 500);
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
            }, 500);
        });
    }

    // Stub Getters
    const todayLog = computed(() => dailyAttendance.value);
    const getMyTodayStatus = (id) => computed(() => dailyAttendance.value.find(l => l.studentId === id));
    function getStudentHistory(id) { return []; }
    function updateLog(id, u) { }
    function addLog(l) { }
    const todayStatusMap = computed(() => ({}));

    return {
        dailyAttendance,
        loading,
        getClasses,
        getStudentsByClass,
        getAllStudents,
        getKbmSchedule,
        checkIn,
        checkOut,
        todayLog,
        getMyTodayStatus,
        getStudentHistory,
        updateLog,
        addLog,
        todayStatusMap,
        getAllDaily: getAllStudents,
        getAllKbm: () => []
    };
});
