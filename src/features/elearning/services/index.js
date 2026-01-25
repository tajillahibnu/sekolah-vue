// Mock data for E-Learning

const courses = [
    {
        id: 'c1',
        title: 'Matematika Dasar',
        description: 'Pengenalan konsep dasar matematika termasuk aljabar dan geometri dasar.',
        teacherId: 't1', // Assuming logged in teacher is t1
        teacherName: 'Budi Santoso',
        grade: '10',
        subject: 'Matematika',
        thumbnail: 'https://placehold.co/600x400?text=Matematika',
        progress: 75, // For student view
        modules: [
            {
                id: 'm1',
                title: 'Bab 1: Eksponen dan Logaritma',
                lessons: [
                    {
                        id: 'l1',
                        title: 'Konsep Eksponen',
                        type: 'video',
                        duration: '10:00',
                        completed: true,
                        contentUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' // Mock video
                    },
                    {
                        id: 'l2',
                        title: 'Latihan Soal Eksponen',
                        type: 'quiz',
                        questions: 5,
                        isOptional: true,
                        completed: false,
                        quizData: [
                            {
                                id: 1,
                                question: "2 pangkat 3 sama dengan?",
                                options: ["4", "6", "8", "9"],
                                correct: 2 // Index of "8"
                            },
                            {
                                id: 2,
                                question: "Bentuk sederhana dari a^3 * a^2 adalah:",
                                options: ["a^1", "a^5", "a^6", "2a^5"],
                                correct: 1
                            }
                        ]
                    },
                    {
                        id: 'l3',
                        title: 'Modul Ringkasan',
                        type: 'pdf',
                        pages: 5,
                        completed: false,
                        contentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
                    }
                ]
            },
            {
                id: 'm2',
                title: 'Bab 2: Persamaan Linear',
                lessons: [
                    { id: 'l4', title: 'Persamaan Linear Satu Variabel', type: 'video', duration: '15:00', completed: false }
                ]
            }
        ]
    },
    {
        id: 'c2',
        title: 'Fisika Dasar',
        description: 'Memahami hukum-hukum fisika dalam kehidupan sehari-hari.',
        teacherId: 't1',
        teacherName: 'Budi Santoso',
        grade: '10',
        subject: 'Fisika',
        thumbnail: 'https://placehold.co/600x400?text=Fisika',
        progress: 10,
        modules: []
    },
    {
        id: 'c3',
        title: 'Bahasa Indonesia',
        description: 'Mendalami tata bahasa dan sastra Indonesia.',
        teacherId: 't2',
        teacherName: 'Siti Aminah',
        grade: '10',
        subject: 'Bahasa Indonesia',
        thumbnail: 'https://placehold.co/600x400?text=B+Indo',
        progress: 0,
        modules: []
    }
];

export const getCourses = async (role = 'student') => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (role === 'teacher') {
        // Return courses taught by this teacher (mock: all for now or filter)
        return courses; // In real app, filter by logged in user
    }
    return courses;
};

export const getCourseById = async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return courses.find(c => c.id === id);
};

export const createCourse = async (courseData) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newCourse = {
        ...courseData,
        id: `c${courses.length + 1}`,
        modules: []
    };
    courses.push(newCourse);
    return newCourse;
};
