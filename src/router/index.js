import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useLoadingStore } from '../stores/loading';
import MainLayout from '../components/layout/MainLayout.vue';
import Login from '../views/Login.vue';
import Dashboard from '../views/Dashboard.vue';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'landing',
            component: () => import('@/features/landing/views/LandingPage.vue'),
            meta: { guest: true }
        },
        {
            path: '/teachers',
            name: 'teachers-directory',
            component: () => import('@/features/landing/views/TeachersDirectory.vue'),
            meta: { guest: true }
        },
        {
            path: '/achievements',
            name: 'achievements-directory',
            component: () => import('@/features/landing/views/AchievementsDirectory.vue'),
            meta: { guest: true }
        },
        {
            path: '/events',
            name: 'events-directory',
            component: () => import('@/features/landing/views/EventsDirectory.vue'),
            meta: { guest: true }
        },
        {
            path: '/login',
            name: 'login',
            component: Login,
            meta: { guest: true }
        },
        {
            path: '/admin',
            component: MainLayout,
            meta: { requiresAuth: true },
            children: [
                {
                    path: '',
                    redirect: '/admin/dashboard'
                },
                {
                    path: 'dashboard',
                    name: 'dashboard',
                    component: Dashboard
                },
                {
                    path: 'profile',
                    name: 'profile',
                    component: () => import('../views/Profile.vue')
                },
                {
                    path: 'users',
                    name: 'users',
                    component: () => import('../views/Users.vue')
                },
                {
                    path: 'students',
                    name: 'students',
                    component: () => import('@/features/students/views/Students.vue')
                },
                {
                    path: 'students/:id',
                    name: 'student-detail',
                    component: () => import('@/features/students/views/StudentDetail.vue')
                },
                {
                    path: 'employees',
                    name: 'employees',
                    component: () => import('../features/employees/views/Employees.vue')
                },
                {
                    path: 'employees/:id',
                    name: 'employee-detail',
                    component: () => import('../features/employees/views/EmployeeDetail.vue')
                },
                {
                    path: 'form-example',
                    name: 'form-example',
                    component: () => import('../views/FormExample.vue')
                },
                {
                    path: 'settings',
                    name: 'settings',
                    component: () => import('../features/settings/views/Settings.vue'),
                    redirect: '/settings/users',
                    children: [
                        {
                            path: 'users',
                            name: 'settings-users',
                            component: () => import('../features/settings/components/users/UsersList.vue')
                        },
                        {
                            path: 'academic-years',
                            name: 'settings-academic-years',
                            component: () => import('../features/settings/components/academic-years/AcademicYearsList.vue')
                        },
                        {
                            path: 'classes',
                            name: 'settings-classes',
                            component: () => import('../features/settings/components/classes/ClassesList.vue')
                        },
                        {
                            path: 'subjects',
                            name: 'settings-subjects',
                            component: () => import('../features/settings/components/subjects/SubjectsList.vue')
                        },
                        {
                            path: 'school',
                            name: 'settings-school',
                            component: () => import('../features/settings/components/school/SchoolSettingsForm.vue')
                        },
                        {
                            path: 'backup',
                            name: 'settings-backup',
                            component: () => import('../features/settings/components/backup/BackupList.vue')
                        }
                    ]
                },
                // Placeholders for other routes
                {
                    path: '/:pathMatch(.*)*',
                    name: 'not-found',
                    component: () => import('../views/Dashboard.vue') // Fallback to dashboard for now
                }
            ]
        }
    ]
});

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    const loadingStore = useLoadingStore();
    const isAuthenticated = authStore.isAuthenticated;

    // Trigger Splash Screen for navigation
    loadingStore.show('Memuat Halaman...');

    if (to.meta.requiresAuth && !isAuthenticated) {
        next('/login');
    } else if (to.meta.guest && isAuthenticated) {
        next('/admin');
    } else {
        next();
    }
});

router.afterEach(() => {
    const loadingStore = useLoadingStore();
    // Small delay to ensure smooth transition availability
    setTimeout(() => {
        loadingStore.hide();
    }, 500);
});

export default router;
