import studentClassesData from '@/data_dummy/studentClasses.json';
import classTransfersData from '@/data_dummy/classTransfers.json';
import studentExitsData from '@/data_dummy/studentExits.json';
import classService from './classService';

// In-memory stores
let mockStudentClasses = [...studentClassesData];
let mockClassTransfers = [...classTransfersData];
let mockStudentExits = [...studentExitsData];

export default {
    /**
     * Assign a student to a class
     * @param {number} studentId - Student ID
     * @param {number} classId - Class ID
     * @param {string} assignmentType - Type: 'ppdb', 'transfer_in', 'promotion'
     * @param {string} notes - Optional notes
     * @returns {Promise<Object>} - { data: StudentClass }
     */
    async assignStudentToClass(studentId, classId, assignmentType = 'ppdb', notes = '') {
        return new Promise(async (resolve, reject) => {
            setTimeout(async () => {
                try {
                    // Check if student already has an active assignment
                    const existingAssignment = mockStudentClasses.find(
                        sc => sc.studentId === studentId && sc.status === 'active'
                    );

                    if (existingAssignment) {
                        reject(new Error('Siswa sudah terdaftar di kelas lain. Gunakan fitur pindah kelas.'));
                        return;
                    }

                    // Check class capacity
                    const classData = await classService.getClassById(classId);
                    if (classData.data.currentStudents >= classData.data.capacity) {
                        reject(new Error('Kapasitas kelas sudah penuh'));
                        return;
                    }

                    // Create assignment
                    const newAssignment = {
                        id: Math.max(...mockStudentClasses.map(sc => sc.id), 0) + 1,
                        studentId,
                        classId,
                        academicYear: new Date().getFullYear() + '/' + (new Date().getFullYear() + 1),
                        assignmentType,
                        assignedDate: new Date().toISOString().split('T')[0],
                        status: 'active',
                        notes
                    };

                    mockStudentClasses.push(newAssignment);

                    // Update class student count
                    await classService.updateClass(classId, {
                        currentStudents: classData.data.currentStudents + 1
                    });

                    resolve({ data: newAssignment });
                } catch (error) {
                    reject(error);
                }
            }, 400);
        });
    },

    /**
     * Bulk assign students to a class (for PPDB)
     * @param {number[]} studentIds - Array of student IDs
     * @param {number} classId - Class ID
     * @param {string} notes - Optional notes
     * @returns {Promise<Object>} - { data: { success: number, failed: number, assignments: StudentClass[] } }
     */
    async bulkAssignStudents(studentIds, classId, notes = '') {
        return new Promise(async (resolve, reject) => {
            setTimeout(async () => {
                try {
                    const results = {
                        success: 0,
                        failed: 0,
                        assignments: [],
                        errors: []
                    };

                    for (const studentId of studentIds) {
                        try {
                            const assignment = await this.assignStudentToClass(studentId, classId, 'ppdb', notes);
                            results.assignments.push(assignment.data);
                            results.success++;
                        } catch (error) {
                            results.failed++;
                            results.errors.push({ studentId, error: error.message });
                        }
                    }

                    resolve({ data: results });
                } catch (error) {
                    reject(error);
                }
            }, 600);
        });
    },

    /**
     * Transfer student from one class to another
     * @param {number} studentId - Student ID
     * @param {number} fromClassId - Current class ID
     * @param {number} toClassId - Target class ID
     * @param {string} reason - Transfer reason
     * @param {string} approvedBy - Approver name
     * @returns {Promise<Object>} - { data: ClassTransfer }
     */
    async transferStudent(studentId, fromClassId, toClassId, reason, approvedBy) {
        return new Promise(async (resolve, reject) => {
            setTimeout(async () => {
                try {
                    // Find current assignment
                    const currentAssignment = mockStudentClasses.find(
                        sc => sc.studentId === studentId && sc.classId === fromClassId && sc.status === 'active'
                    );

                    if (!currentAssignment) {
                        reject(new Error('Siswa tidak ditemukan di kelas asal'));
                        return;
                    }

                    // Check target class capacity
                    const targetClass = await classService.getClassById(toClassId);
                    if (targetClass.data.currentStudents >= targetClass.data.capacity) {
                        reject(new Error('Kapasitas kelas tujuan sudah penuh'));
                        return;
                    }

                    // Create transfer record
                    const transfer = {
                        id: Math.max(...mockClassTransfers.map(ct => ct.id), 0) + 1,
                        studentId,
                        fromClassId,
                        toClassId,
                        transferDate: new Date().toISOString().split('T')[0],
                        reason,
                        approvedBy,
                        approvedDate: new Date().toISOString().split('T')[0],
                        notes: ''
                    };

                    mockClassTransfers.push(transfer);

                    // Deactivate current assignment
                    currentAssignment.status = 'transferred';

                    // Create new assignment
                    const newAssignment = {
                        id: Math.max(...mockStudentClasses.map(sc => sc.id), 0) + 1,
                        studentId,
                        classId: toClassId,
                        academicYear: currentAssignment.academicYear,
                        assignmentType: 'transfer',
                        assignedDate: new Date().toISOString().split('T')[0],
                        status: 'active',
                        notes: `Pindahan dari kelas ${fromClassId}`
                    };

                    mockStudentClasses.push(newAssignment);

                    // Update class student counts
                    const fromClass = await classService.getClassById(fromClassId);
                    await classService.updateClass(fromClassId, {
                        currentStudents: fromClass.data.currentStudents - 1
                    });

                    await classService.updateClass(toClassId, {
                        currentStudents: targetClass.data.currentStudents + 1
                    });

                    resolve({ data: transfer });
                } catch (error) {
                    reject(error);
                }
            }, 500);
        });
    },

    /**
     * Process student exit
     * @param {number} studentId - Student ID
     * @param {Object} exitData - { exitType, destination, reason, approvedBy }
     * @returns {Promise<Object>} - { data: StudentExit }
     */
    async exitStudent(studentId, exitData) {
        return new Promise(async (resolve, reject) => {
            setTimeout(async () => {
                try {
                    // Find current assignment
                    const currentAssignment = mockStudentClasses.find(
                        sc => sc.studentId === studentId && sc.status === 'active'
                    );

                    if (!currentAssignment) {
                        reject(new Error('Siswa tidak memiliki kelas aktif'));
                        return;
                    }

                    // Create exit record
                    const exit = {
                        id: Math.max(...mockStudentExits.map(se => se.id), 0) + 1,
                        studentId,
                        exitDate: new Date().toISOString().split('T')[0],
                        exitType: exitData.exitType,
                        destination: exitData.destination || null,
                        reason: exitData.reason,
                        approvedBy: exitData.approvedBy,
                        approvedDate: new Date().toISOString().split('T')[0],
                        notes: exitData.notes || '',
                        lastClassId: currentAssignment.classId
                    };

                    mockStudentExits.push(exit);

                    // Deactivate current assignment
                    currentAssignment.status = 'exited';

                    // Update class student count
                    const classData = await classService.getClassById(currentAssignment.classId);
                    await classService.updateClass(currentAssignment.classId, {
                        currentStudents: classData.data.currentStudents - 1
                    });

                    resolve({ data: exit });
                } catch (error) {
                    reject(error);
                }
            }, 500);
        });
    },

    /**
     * Get student's class history
     * @param {number} studentId - Student ID
     * @returns {Promise<Object>} - { data: { assignments, transfers, exits } }
     */
    async getStudentClassHistory(studentId) {
        return new Promise(resolve => {
            setTimeout(() => {
                const assignments = mockStudentClasses.filter(sc => sc.studentId === studentId);
                const transfers = mockClassTransfers.filter(ct => ct.studentId === studentId);
                const exits = mockStudentExits.filter(se => se.studentId === studentId);

                resolve({
                    data: {
                        assignments,
                        transfers,
                        exits
                    }
                });
            }, 300);
        });
    },

    /**
     * Get all students in a class
     * @param {number} classId - Class ID
     * @returns {Promise<Object>} - { data: StudentClass[] }
     */
    async getClassStudents(classId) {
        return new Promise(resolve => {
            setTimeout(() => {
                const students = mockStudentClasses.filter(
                    sc => sc.classId === classId && sc.status === 'active'
                );
                resolve({ data: students });
            }, 300);
        });
    },

    /**
     * Get all class transfers
     * @param {Object} filters - { studentId, fromClassId, toClassId }
     * @returns {Promise<Object>} - { data: ClassTransfer[] }
     */
    async getClassTransfers(filters = {}) {
        return new Promise(resolve => {
            setTimeout(() => {
                let transfers = [...mockClassTransfers];

                if (filters.studentId) {
                    transfers = transfers.filter(ct => ct.studentId === filters.studentId);
                }
                if (filters.fromClassId) {
                    transfers = transfers.filter(ct => ct.fromClassId === filters.fromClassId);
                }
                if (filters.toClassId) {
                    transfers = transfers.filter(ct => ct.toClassId === filters.toClassId);
                }

                resolve({ data: transfers });
            }, 300);
        });
    },

    /**
     * Get all student exits
     * @param {Object} filters - { exitType, studentId }
     * @returns {Promise<Object>} - { data: StudentExit[] }
     */
    async getStudentExits(filters = {}) {
        return new Promise(resolve => {
            setTimeout(() => {
                let exits = [...mockStudentExits];

                if (filters.exitType) {
                    exits = exits.filter(se => se.exitType === filters.exitType);
                }
                if (filters.studentId) {
                    exits = exits.filter(se => se.studentId === filters.studentId);
                }

                resolve({ data: exits });
            }, 300);
        });
    },

    /**
     * Get class student history (past academic years)
     * @param {number} classId - Class ID
     * @returns {Promise<Object>} - { data: StudentClass[] }
     */
    async getClassHistory(classId) {
        return new Promise(resolve => {
            setTimeout(() => {
                // Return entries that are NOT active for this class, or belong to different academic years
                // For mock purposes, just return a subset or all non-active records for this class
                const history = mockStudentClasses.filter(
                    sc => sc.classId === classId
                );
                resolve({ data: history });
            }, 300);
        });
    },

    /**
     * Get class statistics by academic year
     * @param {number} classId - Class ID
     * @param {string} academicYear - Academic year (e.g., "2023/2024")
     * @returns {Promise<Object>} - { data: { homeroomTeacher, attendance, grades, students } }
     */
    async getClassStatsByYear(classId, academicYear) {
        return new Promise(resolve => {
            setTimeout(() => {
                // Mock data for class statistics
                const mockStats = {
                    academicYear,
                    homeroomTeacher: academicYear === '2024/2025' ? 'Budi Santoso, S.Pd' :
                        academicYear === '2023/2024' ? 'Siti Aminah, M.Pd' :
                            'Ahmad Fauzi, S.Pd',
                    attendance: {
                        totalDays: 180,
                        present: Math.floor(Math.random() * 500) + 4000,
                        sick: Math.floor(Math.random() * 100) + 80,
                        permission: Math.floor(Math.random() * 80) + 50,
                        alpha: Math.floor(Math.random() * 120) + 60
                    },
                    grades: {
                        average: (Math.random() * 15 + 75).toFixed(1),
                        highest: (Math.random() * 5 + 90).toFixed(1),
                        lowest: (Math.random() * 10 + 60).toFixed(1)
                    },
                    students: [
                        {
                            id: 1,
                            name: 'Ahmad Rizki',
                            attendance: {
                                present: 165,
                                sick: 8,
                                permission: 5,
                                alpha: 2,
                                percentage: 91.7
                            },
                            grades: {
                                average: 85.5,
                                rank: 3
                            }
                        },
                        {
                            id: 2,
                            name: 'Siti Nurhaliza',
                            attendance: {
                                present: 175,
                                sick: 3,
                                permission: 2,
                                alpha: 0,
                                percentage: 97.2
                            },
                            grades: {
                                average: 92.3,
                                rank: 1
                            }
                        },
                        {
                            id: 3,
                            name: 'Budi Santoso',
                            attendance: {
                                present: 170,
                                sick: 5,
                                permission: 3,
                                alpha: 2,
                                percentage: 94.4
                            },
                            grades: {
                                average: 88.7,
                                rank: 2
                            }
                        },
                        {
                            id: 4,
                            name: 'Dewi Lestari',
                            attendance: {
                                present: 160,
                                sick: 12,
                                permission: 6,
                                alpha: 2,
                                percentage: 88.9
                            },
                            grades: {
                                average: 82.1,
                                rank: 5
                            }
                        },
                        {
                            id: 5,
                            name: 'Eko Prasetyo',
                            attendance: {
                                present: 168,
                                sick: 6,
                                permission: 4,
                                alpha: 2,
                                percentage: 93.3
                            },
                            grades: {
                                average: 84.9,
                                rank: 4
                            }
                        }
                    ]
                };

                resolve({ data: mockStats });
            }, 400);
        });
    }
};
