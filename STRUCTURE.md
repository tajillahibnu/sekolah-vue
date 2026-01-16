# Struktur Direktori Aplikasi Sekolah

## Overview

Aplikasi ini menggunakan **feature-based directory structure** untuk meningkatkan maintainability dan scalability. Setiap fitur utama memiliki direktori sendiri dengan komponen, views, data, dan logic yang terkait.

## Struktur Direktori

```
src/
├── features/                    # Feature-based modules
│   └── students/               # Student management feature
│       ├── components/         # Student-specific components
│       │   ├── StudentForm.vue
│       │   └── StudentModal.vue
│       ├── views/              # Student pages/views
│       │   └── Students.vue
│       ├── composables/        # Student-specific composables (future)
│       │   └── useStudents.js
│       └── data/               # Student dummy data
│           └── students.json
│
├── components/                  # Shared/global components
│   ├── layout/                 # Layout components
│   │   ├── MainLayout.vue
│   │   └── Sidebar.vue
│   └── common/                 # Common reusable components
│       └── ConfirmDialog.vue
│
├── composables/                # Shared composables
│   ├── useAuth.js
│   └── useTheme.js
│
├── services/                   # API services
│   └── api.js
│
├── stores/                     # Pinia stores
│   ├── auth.js
│   └── loading.js
│
├── router/                     # Router configuration
│   └── index.js
│
├── data_dummy/                 # Global dummy data
│   ├── login.json
│   ├── menus.json
│   └── users.json
│
└── directives/                 # Custom directives
    └── clickOutside.js
```

## Prinsip Organisasi

### 1. Feature-Based Organization

Setiap fitur utama (students, employees, dashboard, dll) memiliki direktori sendiri di `src/features/`:

**Keuntungan:**
- ✅ Mudah menemukan file terkait fitur tertentu
- ✅ Scalable - mudah menambah/menghapus fitur
- ✅ Maintainable - perubahan pada satu fitur tidak mempengaruhi fitur lain
- ✅ Clear separation of concerns

### 2. Component Hierarchy

**Feature Components** (`features/*/components/`)
- Komponen yang HANYA digunakan dalam fitur tersebut
- Contoh: `StudentForm.vue`, `StudentModal.vue`

**Shared Components** (`components/common/`)
- Komponen yang digunakan di MULTIPLE fitur
- Contoh: `ConfirmDialog.vue`, `DataTable.vue`

**Layout Components** (`components/layout/`)
- Komponen layout aplikasi
- Contoh: `MainLayout.vue`, `Sidebar.vue`, `Header.vue`

### 3. Naming Convention

| Type | Convention | Example |
|------|-----------|---------|
| Views | PascalCase, nama halaman | `Students.vue`, `Dashboard.vue` |
| Components | PascalCase dengan prefix fitur | `StudentForm.vue`, `EmployeeCard.vue` |
| Composables | camelCase dengan prefix `use` | `useStudents.js`, `useAuth.js` |
| Data files | lowercase dengan underscore | `students.json`, `users.json` |
| Stores | camelCase | `auth.js`, `loading.js` |

## Import Paths

Gunakan path alias `@/` untuk import yang lebih clean:

```javascript
// ✅ Good - menggunakan alias
import api from '@/services/api';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';

// ❌ Avoid - relative path yang panjang
import api from '../../../services/api';
import ConfirmDialog from '../../../components/common/ConfirmDialog.vue';
```

**Relative imports** hanya untuk file dalam direktori yang sama atau subdirectory:

```javascript
// ✅ Good - relative untuk file dalam feature yang sama
import StudentForm from '../components/StudentForm.vue';
import StudentModal from '../components/StudentModal.vue';
```

## Menambah Fitur Baru

Saat menambah fitur baru, ikuti struktur berikut:

### 1. Buat Direktori Fitur

```bash
mkdir -p src/features/nama-fitur/{components,views,composables,data}
```

### 2. Struktur Minimal

```
src/features/nama-fitur/
├── components/          # Feature-specific components
│   ├── NamaFiturForm.vue
│   └── NamaFiturModal.vue
├── views/              # Feature pages
│   └── NamaFitur.vue
├── composables/        # Feature-specific logic (optional)
│   └── useNamaFitur.js
└── data/               # Feature dummy data (optional)
    └── nama-fitur.json
```

### 3. Update Router

```javascript
// src/router/index.js
{
    path: 'nama-fitur',
    name: 'nama-fitur',
    component: () => import('@/features/nama-fitur/views/NamaFitur.vue')
}
```

### 4. Update API Service (jika perlu)

```javascript
// src/services/api.js
import namaFiturData from '@/features/nama-fitur/data/nama-fitur.json';
```

## Contoh Implementasi

### Students Feature (Sudah Diimplementasi)

```
src/features/students/
├── components/
│   ├── StudentForm.vue      # Form untuk tambah/edit siswa
│   └── StudentModal.vue     # Modal wrapper untuk form
├── views/
│   └── Students.vue         # Halaman utama data siswa
└── data/
    └── students.json        # Data dummy 30 siswa
```

**Import di Students.vue:**
```javascript
import api from '@/services/api';
import StudentModal from '../components/StudentModal.vue';
import StudentForm from '../components/StudentForm.vue';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';
```

### Future Features

**Employees Feature:**
```
src/features/employees/
├── components/
│   ├── EmployeeForm.vue
│   └── EmployeeModal.vue
├── views/
│   └── Employees.vue
├── composables/
│   └── useEmployees.js
└── data/
    └── employees.json
```

**Dashboard Feature:**
```
src/features/dashboard/
├── components/
│   ├── DashboardCard.vue
│   ├── StatWidget.vue
│   └── ChartWidget.vue
└── views/
    ├── Dashboard.vue
    ├── AdminDashboard.vue
    └── TeacherDashboard.vue
```

## Best Practices

### 1. Feature Isolation
- Semua logic dan komponen spesifik fitur harus di dalam feature directory
- Jangan import komponen dari feature lain
- Gunakan shared components untuk komponen yang digunakan di multiple features

### 2. Composables
- Feature-specific composables di `features/*/composables/`
- Shared composables di `src/composables/`
- Prefix dengan `use` (e.g., `useStudents`, `useAuth`)

### 3. Data Management
- Dummy data spesifik fitur di `features/*/data/`
- Global dummy data di `src/data_dummy/`
- API calls di `src/services/api.js`

### 4. Routing
- Lazy load views menggunakan dynamic import
- Gunakan absolute path dengan `@/` alias

```javascript
// ✅ Good
component: () => import('@/features/students/views/Students.vue')

// ❌ Avoid
component: () => import('../features/students/views/Students.vue')
```

## Migration Guide

Untuk migrate fitur existing ke struktur baru:

1. **Buat direktori fitur:**
   ```bash
   mkdir -p src/features/nama-fitur/{components,views,composables,data}
   ```

2. **Pindahkan files:**
   ```bash
   mv src/views/NamaFitur.vue src/features/nama-fitur/views/
   mv src/components/NamaFitur*.vue src/features/nama-fitur/components/
   mv src/data_dummy/nama-fitur.json src/features/nama-fitur/data/
   ```

3. **Update imports** di semua file yang terpengaruh

4. **Test** aplikasi untuk memastikan tidak ada broken imports

## Troubleshooting

### Import Error

Jika mendapat error import:
1. Pastikan path benar (gunakan `@/` untuk absolute path)
2. Check case sensitivity (Vue.js vs vue.js)
3. Pastikan file extension `.vue` atau `.js` ada

### Module Not Found

Jika module not found:
1. Restart dev server (`npm run dev`)
2. Clear cache dan rebuild
3. Check vite.config.js untuk alias configuration

## Kesimpulan

Struktur ini dirancang untuk:
- ✅ **Scalability**: Mudah menambah fitur baru
- ✅ **Maintainability**: Mudah menemukan dan update code
- ✅ **Clarity**: Struktur yang jelas dan konsisten
- ✅ **Reusability**: Shared components untuk code reuse

Ikuti struktur ini untuk semua fitur baru yang akan ditambahkan ke aplikasi.
