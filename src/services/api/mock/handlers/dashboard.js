import { createResponse } from '../utils';

export const dashboardHandler = (config) => {
    const { url, method } = config;

    // GET /dashboard/stats
    if (url === '/dashboard/stats' && method === 'get') {
        const stats = [
            { title: 'Total Siswa', value: '450', icon: '🎓', color: 'primary', trend: 'up', trendValue: '+15%' },
            { title: 'Staff Aktif', value: '86', icon: '👥', color: 'secondary', trend: 'up', trendValue: '+5%' },
            { title: 'Hadir Hari Ini', value: '92%', icon: '📅', color: 'accent', trend: 'up', trendValue: '+2%' },
            { title: 'Tagihan Pending', value: 'Rp 4.5jt', icon: '💰', color: 'info' }
        ];
        return createResponse(stats, 200, 'OK', {}, config);
    }

    // GET /dashboard/activities
    if (url === '/dashboard/activities' && method === 'get') {
        const activities = [
            { title: 'Siswa baru terdaftar', time: '5 menit yang lalu', color: 'primary' },
            { title: 'Pembayaran SPP diverifikasi', time: '1 jam yang lalu', color: 'secondary' },
            { title: 'Nilai ujian diunggah', time: '3 jam yang lalu', color: 'accent' },
            { title: 'Update profil sekolah', time: '5 jam yang lalu', color: 'info' }
        ];
        return createResponse(activities, 200, 'OK', {}, config);
    }

    return null;
};
