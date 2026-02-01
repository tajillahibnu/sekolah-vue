import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useLibraryStore = defineStore('library', () => {
    // --- State ---
    const books = ref([
        {
            id: 1,
            title: 'Laskar Pelangi',
            author: 'Andrea Hirata',
            isbn: '978-979-3062-79-2',
            category: 'Novel',
            stock: 5,
            location: 'Rak A-1',
            cover: 'https://cdn.gramedia.com/uploads/items/9789793062792_Laskar_Pelangi_Cover_Baru_2024.jpg',
            description: 'Novel debut Andrea Hirata yang bercerita tentang kehidupan 10 anak di Belitong.',
            fileUrl: null,
            viewCount: 1250
        },
        {
            id: 2,
            title: 'Bumi Manusia',
            author: 'Pramoedya Ananta Toer',
            isbn: '978-979-97312-3-2',
            category: 'Sastra',
            stock: 3,
            location: 'Rak B-3',
            cover: 'https://cdn.gramedia.com/uploads/items/9789799731232_bumi-manusia.jpg',
            description: 'Roman tetralogi Buru yang mengambil latar belakang masa kebangkitan nasional.',
            fileUrl: 'https://pdfobject.com/pdf/sample.pdf',
            viewCount: 3420
        },
        {
            id: 3,
            title: 'Algoritma dan Pemrograman',
            author: 'Rinaldi Munir',
            isbn: '978-602-8758-21-5',
            category: 'Komputer',
            stock: 10,
            location: 'Rak C-2',
            cover: null,
            description: 'Buku teks dasar algoritma dan pemrograman menggunakan bahasa Pascal dan C.',
            fileUrl: null,
            viewCount: 890
        },
        {
            id: 4,
            title: 'Sejarah Dunia yang Disembunyikan',
            author: 'Jonathan Black',
            isbn: '978-602-9193-67-1',
            category: 'Sejarah',
            stock: 2,
            location: 'Rak D-1',
            cover: null,
            description: 'Mengupas sejarah dunia dari sudut pandang yang berbeda dan penuh misteri.',
            fileUrl: null,
            viewCount: 560
        },
        {
            id: 5,
            title: 'Filosofi Teras',
            author: 'Henry Manampiring',
            isbn: '978-602-412-518-9',
            category: 'Pengembangan Diri',
            stock: 8,
            location: 'Rak A-2',
            cover: 'https://cdn.gramedia.com/uploads/items/FILOSOFI_TERAS.jpg',
            description: 'Penjelasan filsafat Stoisisme yang relevan dengan kehidupan masa kini.',
            fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            viewCount: 4100
        },
    ]);

    const transactions = ref([
        { id: 'TRX-001', studentName: 'Budi Santoso', bookTitle: 'Laskar Pelangi', borrowDate: '2024-10-20', dueDate: '2024-10-27', returnDate: null, status: 'borrowed' },
        { id: 'TRX-002', studentName: 'Siti Aminah', bookTitle: 'Filosofi Teras', borrowDate: '2024-10-18', dueDate: '2024-10-25', returnDate: null, status: 'overdue' },
        { id: 'TRX-003', studentName: 'Rudi Hartono', bookTitle: 'Bumi Manusia', borrowDate: '2024-10-15', dueDate: '2024-10-22', returnDate: '2024-10-20', status: 'returned' },
        { id: 'TRX-004', studentName: 'Dewi Lestari', bookTitle: 'Algoritma dan Pemrograman', borrowDate: '2024-10-24', dueDate: '2024-10-31', returnDate: null, status: 'borrowed' },
    ]);

    const visitors = ref([
        { id: 1, name: 'Andi Saputra', role: 'Siswa', class: 'XII RPA 1', purpose: 'Membaca', timeIn: '08:00', timeOut: '09:30', date: '2024-10-25' },
        { id: 2, name: 'Budi Santoso', role: 'Siswa', class: 'XI TKJ 2', purpose: 'Pinjam Buku', timeIn: '09:15', timeOut: '09:30', date: '2024-10-25' },
        { id: 3, name: 'Citra Kirana', role: 'Siswa', class: 'X MIPA 3', purpose: 'Kerja Kelompok', timeIn: '10:00', timeOut: null, date: '2024-10-25' },
        { id: 4, name: 'Dewi Lestari', role: 'Guru', class: '-', purpose: 'Mencari Referensi', timeIn: '10:30', timeOut: '11:00', date: '2024-10-24' },
        { id: 5, name: 'Eko Purnomo', role: 'Siswa', class: 'XII IPS 2', purpose: 'Mengerjakan Tugas', timeIn: '11:00', timeOut: null, date: '2024-10-24' },
        { id: 6, name: 'Fani Rahmawati', role: 'Siswa', class: 'XI MIPA 1', purpose: 'Membaca', timeIn: '13:00', timeOut: '14:00', date: '2024-10-23' },
        { id: 7, name: 'Gilang Ramadhan', role: 'Siswa', class: 'X IPS 1', purpose: 'Wifi', timeIn: '14:00', timeOut: '15:00', date: '2024-10-23' },
        { id: 8, name: 'Haniifah', role: 'Siswa', class: 'XII MIPA 4', purpose: 'Pinjam Buku', timeIn: '08:15', timeOut: '08:30', date: '2024-10-22' },
        { id: 9, name: 'Indra Gunawan', role: 'Guru', class: '-', purpose: 'Rapat', timeIn: '09:00', timeOut: '11:00', date: '2024-10-22' },
        { id: 10, name: 'Joko Anwar', role: 'Siswa', class: 'XI TKJ 1', purpose: 'Membaca', timeIn: '10:00', timeOut: '10:45', date: '2024-10-21' },
        { id: 11, name: 'Kartika Sari', role: 'Siswa', class: 'XII RPA 2', purpose: 'Mengerjakan Tugas', timeIn: '11:30', timeOut: '13:00', date: '2024-10-21' },
        { id: 12, name: 'Lukman Hakim', role: 'Siswa', class: 'X MIPA 2', purpose: 'Istirahat', timeIn: '12:00', timeOut: '12:30', date: '2024-10-20' },
        { id: 13, name: 'Maya Septha', role: 'Siswa', class: 'XI IPS 3', purpose: 'Kembalikan Buku', timeIn: '13:15', timeOut: '13:30', date: '2024-10-20' },
        { id: 14, name: 'Nina Zatulini', role: 'Siswa', class: 'XII MIPA 1', purpose: 'Membaca', timeIn: '08:00', timeOut: '09:00', date: '2024-10-19' },
        { id: 15, name: 'Oscar Lawalata', role: 'Guru', class: '-', purpose: 'Mencari Referensi', timeIn: '09:30', timeOut: '10:00', date: '2024-10-19' },
    ]);

    // --- Getters ---
    const totalBooks = computed(() => books.value.length);
    const activeBorrows = computed(() => transactions.value.filter(t => t.status === 'borrowed' || t.status === 'overdue').length);
    const overdueCount = computed(() => transactions.value.filter(t => t.status === 'overdue').length);
    const todayVisitors = computed(() => visitors.value.filter(v => v.date === '2024-10-25').length); // Fixed date for mock

    const recentActivities = computed(() => {
        return transactions.value.slice(0, 5).map(t => ({
            ...t,
            type: t.status === 'returned' ? 'return' : 'borrow',
            date: t.status === 'returned' ? t.returnDate : t.borrowDate
        }));
    });

    const popularBooks = computed(() => {
        // Mock calculation
        return books.value.slice(0, 3).map(b => ({
            ...b,
            borrowCount: Math.floor(Math.random() * 50) + 10
        })).sort((a, b) => b.borrowCount - a.borrowCount);
    });

    // --- Actions ---
    function addBook(book) {
        books.value.push({ ...book, id: Date.now() });
    }

    function updateBook(updatedBook) {
        const index = books.value.findIndex(b => b.id === updatedBook.id);
        if (index !== -1) books.value[index] = updatedBook;
    }

    function deleteBook(id) {
        books.value = books.value.filter(b => b.id !== id);
    }

    function borrowBook(studentName, bookId, dueDate) {
        const book = books.value.find(b => b.id === bookId);
        if (book && book.stock > 0) {
            book.stock--;
            transactions.value.unshift({
                id: `TRX-${Date.now()}`,
                studentName,
                bookTitle: book.title,
                borrowDate: new Date().toISOString().split('T')[0],
                dueDate,
                returnDate: null,
                status: 'borrowed'
            });
            return true;
        }
        return false;
    }

    function returnBook(transactionId, condition = 'good', fine = 0, notes = '') {
        const trx = transactions.value.find(t => t.id === transactionId);
        if (trx) {
            trx.status = 'returned';
            trx.returnDate = new Date().toISOString().split('T')[0];
            trx.condition = condition; // 'good', 'damaged', 'lost'
            trx.fine = fine;
            trx.notes = notes;

            // Only return to stock if NOT lost
            if (condition !== 'lost') {
                const book = books.value.find(b => b.title === trx.bookTitle); // Simplified match
                if (book) book.stock++;
            }
        }
    }

    function addVisitor(visitor) {
        visitors.value.unshift({
            ...visitor,
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            timeIn: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            timeOut: null
        });
    }

    return {
        books,
        transactions,
        visitors,
        totalBooks,
        activeBorrows,
        overdueCount,
        todayVisitors,
        recentActivities,
        popularBooks,
        addBook,
        updateBook,
        deleteBook,
        borrowBook,
        returnBook,
        addVisitor
    };
});
