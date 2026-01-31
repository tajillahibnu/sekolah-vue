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
                    path: 'attendance',
                    children: [
                        {
                            path: '',
                            name: 'attendance',
                            component: () => import('@/features/attendance/views/AttendanceEntry.vue')
                        },
                        {
                            path: 'daily',
                            name: 'attendance-daily',
                            component: () => import('@/features/attendance/views/AdminAttendance.vue'),
                            meta: { permission: 'attendance.view' }
                        },
                        {
                            path: 'daily/:id',
                            name: 'attendance-detail',
                            component: () => import('@/features/attendance/views/AdminAttendanceDetail.vue'),
                            meta: { permission: 'attendance.view' }
                        },
                        {
                            path: 'kbm',
                            name: 'attendance-kbm',
                            component: () => import('@/features/attendance/views/AdminKbmAttendance.vue'),
                            meta: { permission: 'attendance.view' }
                        }
                    ]
                },
                // Academic Management Routes
                {
                    path: 'academic',
                    redirect: '/admin/academic/classes',
                    children: [
                        {
                            path: 'classes',
                            name: 'academic-classes',
                            component: () => import('@/features/classes/views/Classes.vue'),
                            meta: { permission: 'classes.view' }
                        },
                        {
                            path: 'classes/:id',
                            name: 'academic-class-detail',
                            component: () => import('@/features/classes/views/ClassDetail.vue'),
                            meta: { permission: 'classes.view' }
                        },
                        {
                            path: 'assignments',
                            name: 'academic-assignments',
                            component: () => import('@/features/classes/components/AssignStudentToClass.vue'),
                            meta: { permission: 'classes.manage' }
                        },
                        {
                            path: 'school-year',
                            name: 'academic-school-year',
                            component: () => import('@/features/tahun-ajaran/views/AcademicYears.vue'),
                            meta: { permission: 'academic.manage' }
                        },
                        {
                            path: 'subjects',
                            name: 'academic-subjects',
                            component: () => import('@/features/matapelajaran/views/Subjects.vue'),
                            meta: { permission: 'subjects.view' }
                        }
                    ]
                },
                // Settings Routes
                {
                    path: 'settings',
                    name: 'settings',
                    component: () => import('../features/settings/views/Settings.vue'),
                    redirect: '/admin/settings/users',
                    children: [
                        {
                            path: 'users',
                            name: 'settings-users',
                            component: () => import('../features/settings/components/users/UsersList.vue'),
                            meta: { permission: 'users.view' }
                        },
                        {
                            path: 'school',
                            name: 'settings-school',
                            component: () => import('../features/settings/components/school/SchoolSettingsForm.vue'),
                            meta: { permission: 'settings.manage' }
                        },
                        {
                            path: 'backup',
                            name: 'settings-backup',
                            component: () => import('../features/settings/components/backup/BackupList.vue'),
                            meta: { permission: 'settings.manage' }
                        }
                    ]
                },
                // Bulletin Routes
                {
                    path: 'bulletins',
                    children: [
                        {
                            path: '',
                            name: 'bulletins-list',
                            component: () => import('@/features/bulletin/views/BulletinList.vue'),
                            meta: { permission: 'bulletin.view' }
                        },
                        {
                            path: 'my-bulletins',
                            name: 'bulletins-my',
                            component: () => import('@/features/bulletin/views/MyBulletins.vue'),
                            meta: { permission: 'bulletin.submit' }
                        },
                        {
                            path: 'verify',
                            name: 'bulletins-verify',
                            component: () => import('@/features/bulletin/views/BulletinVerification.vue'),
                            meta: { permission: 'bulletin.verify' }
                        },
                        {
                            path: ':id',
                            name: 'bulletin-detail',
                            component: () => import('@/features/bulletin/views/BulletinDetail.vue'),
                            meta: { permission: 'bulletin.view' }
                        }
                    ]
                },
                // E-Learning Routes
                {
                    path: 'elearning',
                    children: [
                        {
                            path: 'teach',
                            name: 'elearning-teach',
                            component: () => import('@/features/elearning/views/TeacherCourseList.vue'),
                            meta: { permission: 'elearning.teach' }
                        },
                        {
                            path: 'teach/:id',
                            name: 'elearning-teach-detail',
                            component: () => import('@/features/elearning/views/TeacherCourseDetail.vue'),
                            meta: { permission: 'elearning.teach' }
                        },
                        {
                            path: 'learn',
                            name: 'elearning-learn',
                            component: () => import('@/features/elearning/views/StudentCourseList.vue'),
                            meta: { permission: 'elearning.learn' }
                        },
                        {
                            path: 'learn/:id',
                            name: 'elearning-learn-detail',
                            component: () => import('@/features/elearning/views/StudentCourseDetail.vue'),
                            meta: { permission: 'elearning.learn' }
                        },
                        {
                            path: 'monitor',
                            name: 'elearning-monitor',
                            component: () => import('@/features/elearning/views/MonitoringDashboard.vue'),
                            meta: { permission: 'elearning.monitor' }
                        }
                    ]
                },
                // TKA Routes
                {
                    path: 'tka',
                    redirect: '/admin/tka/create',
                    children: [
                        {
                            path: 'list',
                            name: 'tka-list',
                            component: () => import('@/features/tka/views/ListTka.vue'),
                            meta: { permission: 'tka.manage' }
                        },
                        {
                            path: 'bank-soal',
                            name: 'tka-bank-soal',
                            component: () => import('@/features/tka/views/BankSoal.vue'),
                            meta: { permission: 'tka.manage' }
                        },
                        {
                            path: 'create',
                            name: 'tka-create',
                            component: () => import('@/features/tka/views/CreateTka.vue'),
                            meta: { permission: 'tka.manage' }
                        },
                        {
                            path: 'edit/:id',
                            name: 'tka-edit',
                            component: () => import('@/features/tka/views/CreateTka.vue'),
                            meta: { permission: 'tka.manage' }
                        },
                        {
                            path: 'detail/:id',
                            name: 'tka-detail',
                            component: () => import('@/features/tka/views/TkaDetail.vue'),
                            meta: { permission: 'tka.manage' }
                        },
                        {
                            path: 'assign',
                            name: 'tka-assign',
                            component: () => import('@/features/tka/views/AssignTka.vue'),
                            meta: { permission: 'tka.manage' }
                        },
                        {
                            path: 'monitor',
                            name: 'tka-monitor',
                            component: () => import('@/features/tka/views/MonitorTka.vue'),
                            meta: { permission: 'tka.monitor' }
                        },
                        {
                            path: 'verify',
                            name: 'tka-verify',
                            component: () => import('@/features/tka/views/VerifyTka.vue'),
                            meta: { permission: 'tka.verify' }
                        },
                        {
                            path: 'student/list',
                            name: 'tka-student-list',
                            component: () => import('@/features/tka/views/StudentTkaList.vue'),
                            // Relaxed permission for now, strictly role check handled in Sidebar/Menu or could add specific permission later
                            meta: { guest: false }
                        },
                        {
                            path: 'student/intro/:id',
                            name: 'tka-student-intro',
                            component: () => import('@/features/tka/views/TkaIntro.vue'),
                            meta: { guest: false }
                        },
                        {
                            path: 'student/do/:id',
                            name: 'tka-student-do',
                            component: () => import('@/features/tka/views/DoTka.vue'),
                            meta: { guest: false }
                        },
                        {
                            path: 'student/result/:id',
                            name: 'tka-student-result',
                            component: () => import('@/features/tka/views/TkaResult.vue'),
                            meta: { guest: false }
                        }
                    ]
                },
                // App Management Routes
                {
                    path: 'app',
                    redirect: '/admin/app/roles',
                    children: [
                        {
                            path: 'roles',
                            name: 'roles-list',
                            component: () => import('../features/settings/components/roles/RolesList.vue'),
                            meta: { permission: 'roles.manage' }
                        },
                        {
                            path: 'roles/:id',
                            name: 'role-edit',
                            component: () => import('../features/settings/components/roles/RolesList.vue'),
                            meta: { permission: 'roles.manage' }
                        },
                        {
                            path: 'menus',
                            name: 'menus-list',
                            component: () => import('../features/settings/components/menus/MenuList.vue'),
                            meta: { permission: 'roles.manage' }
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
    } else if (to.meta.permission && !authStore.hasPermission(to.meta.permission)) {
        // Redirect to dashboard or show unauthorized
        next('/admin/dashboard');
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
