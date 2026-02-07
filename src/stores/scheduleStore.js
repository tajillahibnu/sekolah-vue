import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useScheduleStore = defineStore('schedule', () => {
    // --- Constant Data ---
    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    // Standard Periods Definition (JP 1-10 + Breaks)
    const periods = [
        { id: 1, type: 'teaching', time: '07:15 - 08:00', label: '1' },
        { id: 2, type: 'teaching', time: '08:00 - 08:45', label: '2' },
        { id: 3, type: 'teaching', time: '08:45 - 09:30', label: '3' },
        { id: 'b1', type: 'break', time: '09:30 - 09:45', label: 'Istirahat 1' },
        { id: 4, type: 'teaching', time: '09:45 - 10:30', label: '4' },
        { id: 5, type: 'teaching', time: '10:30 - 11:15', label: '5' },
        { id: 6, type: 'teaching', time: '11:15 - 12:00', label: '6' },
        { id: 'b2', type: 'break', time: '12:00 - 12:30', label: 'Ishoma' },
        { id: 7, type: 'teaching', time: '12:30 - 13:15', label: '7' },
        { id: 8, type: 'teaching', time: '13:15 - 14:00', label: '8' },
        { id: 9, type: 'teaching', time: '14:00 - 14:45', label: '9' },
    ];

    // --- State ---
    const classes = ref(['X-RPL-1', 'X-RPL-2', 'XI-RPL-1', 'XI-IPA-1', 'XI-IPS-1', 'XII-RPL-1']);

    const subjects = ref([
        { id: 'mtk', nama: 'Matematika Wajib', color: 'bg-blue-100 border-blue-200 text-blue-700' },
        { id: 'ind', nama: 'Bahasa Indonesia', color: 'bg-emerald-100 border-emerald-200 text-emerald-700' },
        { id: 'ing', nama: 'Bahasa Inggris', color: 'bg-violet-100 border-violet-200 text-violet-700' },
        { id: 'web', nama: 'Pemrograman Web', color: 'bg-amber-100 border-amber-200 text-amber-700' },
        { id: 'db', nama: 'Basis Data', color: 'bg-cyan-100 border-cyan-200 text-cyan-700' },
        { id: 'pkn', nama: 'PKN', color: 'bg-rose-100 border-rose-200 text-rose-700' },
        { id: 'agm', nama: 'Agama', color: 'bg-lime-100 border-lime-200 text-lime-700' },
    ]);

    const teachers = ref([
        { id: 'Guru-1', name: 'Budi Santoso, S.Pd' },
        { id: 'Guru-2', name: 'Siti Aminah, S.Pd' },
        { id: 'Guru-3', name: 'Rudi Hartono, M.Si' },
        { id: 'Guru-4', name: 'Dewi Lestari, S.Kom' },
    ]);

    const activeVersions = ref([
        { id: 'v1', year: '2023/2024', semester: 'Ganjil', name: 'Revisi 1 (Final)', isActive: true },
        { id: 'v2', year: '2023/2024', semester: 'Genap', name: 'Draft Awal', isActive: false },
    ]);

    // Raw Schedule Data (Linear)
    const schedules = ref([
        // Senin
        { id: 1, versionId: 'v1', day: 'Senin', periodId: 1, classId: 'X-RPL-1', subjectId: 'mtk', teacherId: 'Guru-1' },
        { id: 2, versionId: 'v1', day: 'Senin', periodId: 2, classId: 'X-RPL-1', subjectId: 'mtk', teacherId: 'Guru-1' }, // Merged
        { id: 3, versionId: 'v1', day: 'Senin', periodId: 3, classId: 'X-RPL-1', subjectId: 'ind', teacherId: 'Guru-2' },
        // Selasa
        { id: 4, versionId: 'v1', day: 'Selasa', periodId: 1, classId: 'X-RPL-1', subjectId: 'web', teacherId: 'Guru-4' },
        { id: 5, versionId: 'v1', day: 'Selasa', periodId: 2, classId: 'X-RPL-1', subjectId: 'web', teacherId: 'Guru-4' },
        { id: 6, versionId: 'v1', day: 'Selasa', periodId: 3, classId: 'X-RPL-1', subjectId: 'web', teacherId: 'Guru-4' },
    ]);

    // --- Actions ---
    function addSchedule(schedule) {
        schedules.value.push({ ...schedule, id: Date.now() });
    }

    function updateSchedule(updatedSchedule) {
        const index = schedules.value.findIndex(s => s.id === updatedSchedule.id);
        if (index !== -1) schedules.value[index] = updatedSchedule;
    }

    function deleteSchedule(id) {
        schedules.value = schedules.value.filter(s => s.id !== id);
    }

    function addVersion(version) {
        activeVersions.value.push({ ...version, id: `v${Date.now()}` });
    }

    // --- Helpers / Getters ---

    // Get Grid Data with Merging Logic
    const getScheduleGrid = (classId, versionId) => {
        const grid = {};
        // Init Grid: grid[periodId][day] = null
        periods.forEach(p => {
            grid[p.id] = {};
            days.forEach(d => grid[p.id][d] = null);
        });

        // Fill Grid
        const classSchedules = schedules.value.filter(s => s.classId === classId && s.versionId === versionId);

        classSchedules.forEach(s => {
            const subject = subjects.value.find(sub => sub.id === s.subjectId);
            const teacher = teachers.value.find(t => t.id === s.teacherId);

            if (grid[s.periodId]) {
                grid[s.periodId][s.day] = {
                    ...s,
                    subjectName: subject?.nama || 'Unknown',
                    subjectColor: subject?.color || 'bg-slate-100 border-slate-200 text-slate-600',
                    teacherName: teacher?.name || 'Unknown',
                    rowSpan: 1,
                    isMerged: false
                };
            }
        });

        // Calculate RowSpans (Vertical Merging)
        days.forEach(day => {
            for (let i = 0; i < periods.length; i++) {
                const currentPeriod = periods[i];
                if (currentPeriod.type === 'break') continue;

                const currentCell = grid[currentPeriod.id][day];
                if (currentCell && !currentCell.isMerged) {
                    let span = 1;
                    // Check next periods
                    for (let j = i + 1; j < periods.length; j++) {
                        const nextPeriod = periods[j];
                        if (nextPeriod.type === 'break') break; // Don't merge across breaks

                        const nextCell = grid[nextPeriod.id][day];
                        if (nextCell &&
                            nextCell.subjectId === currentCell.subjectId &&
                            nextCell.teacherId === currentCell.teacherId) {
                            span++;
                            nextCell.isMerged = true; // Mark as merged so we don't render it
                        } else {
                            break;
                        }
                    }
                    currentCell.rowSpan = span;
                }
            }
        });

        return grid;
    };

    // Teacher Grid Logic
    const getTeacherScheduleGrid = (teacherId, versionId) => {
        const grid = {};
        // Init Grid
        periods.forEach(p => {
            grid[p.id] = {};
            days.forEach(d => grid[p.id][d] = null);
        });

        // Fill Grid
        const teacherSchedules = schedules.value.filter(s => s.teacherId === teacherId && s.versionId === versionId);

        teacherSchedules.forEach(s => {
            const subject = subjects.value.find(sub => sub.id === s.subjectId);

            if (grid[s.periodId]) {
                grid[s.periodId][s.day] = {
                    ...s,
                    subjectName: subject?.nama || 'Unknown',
                    subjectColor: subject?.color || 'bg-slate-100 border-slate-200 text-slate-600',
                    className: s.classId,
                    rowSpan: 1,
                    isMerged: false
                };
            }
        });

        // Calculate RowSpans (Vertical Merging)
        days.forEach(day => {
            for (let i = 0; i < periods.length; i++) {
                const currentPeriod = periods[i];
                if (currentPeriod.type === 'break') continue;

                const currentCell = grid[currentPeriod.id][day];
                if (currentCell && !currentCell.isMerged) {
                    let span = 1;
                    // Check next periods
                    for (let j = i + 1; j < periods.length; j++) {
                        const nextPeriod = periods[j];
                        if (nextPeriod.type === 'break') break;

                        const nextCell = grid[nextPeriod.id][day];
                        if (nextCell &&
                            nextCell.subjectId === currentCell.subjectId &&
                            nextCell.classId === currentCell.classId) {
                            span++;
                            nextCell.isMerged = true;
                        } else {
                            break;
                        }
                    }
                    currentCell.rowSpan = span;
                }
            }
        });

        return grid;
    };

    const getSchedulesByClass = (classId) => schedules.value.filter(s => s.classId === classId);
    const getSchedulesByTeacher = (teacherId) => schedules.value.filter(s => s.teacherId === teacherId);

    return {
        // State
        periods,
        days,
        classes,
        subjects,
        teachers,
        activeVersions,
        schedules,

        // Actions
        addSchedule,
        updateSchedule,
        deleteSchedule,
        addVersion,
        getScheduleGrid,
        getTeacherScheduleGrid,
        getSchedulesByClass,
        getSchedulesByTeacher
    };
});
