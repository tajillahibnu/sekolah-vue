import api from './api';

// Mock data for development
const mockRoles = [
    {
        id: 1,
        name: 'Super Admin',
        description: 'Full access to all features',
        permissions: ['*']
    },
    {
        id: 2,
        name: 'Teacher',
        description: 'Access to academic features',
        permissions: [
            'students.view',
            'students.grade',
            'classes.view'
        ]
    },
    {
        id: 3,
        name: 'Admin Staff',
        description: 'Manage administrative tasks',
        permissions: [
            'users.view',
            'students.view',
            'students.create',
            'students.edit',
            'employees.view'
        ]
    }
];

const mockPermissions = {
    'User Management': [
        { id: 'users.view', label: 'View Users' },
        { id: 'users.create', label: 'Create Users' },
        { id: 'users.edit', label: 'Edit Users' },
        { id: 'users.delete', label: 'Delete Users' }
    ],
    'Student Management': [
        { id: 'students.view', label: 'View Students' },
        { id: 'students.create', label: 'Create Students' },
        { id: 'students.edit', label: 'Edit Students' },
        { id: 'students.delete', label: 'Delete Students' },
        { id: 'students.grade', label: 'Grade Students' }
    ],
    'Academics': [
        { id: 'classes.view', label: 'View Classes' },
        { id: 'subjects.view', label: 'View Subjects' },
        { id: 'schedules.manage', label: 'Manage Schedules' }
    ],
    'Settings': [
        { id: 'settings.manage', label: 'Manage Settings' },
        { id: 'roles.manage', label: 'Manage Roles & Permissions' }
    ]
};

export default {
    async getRoles() {
        // In real app: return api.get('/roles');
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({ data: [...mockRoles] });
            }, 500);
        });
    },

    async getRole(id) {
        // In real app: return api.get(`/roles/${id}`);
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const role = mockRoles.find(r => r.id == id);
                if (role) resolve({ data: role });
                else reject(new Error('Role not found'));
            }, 300);
        });
    },

    async createRole(roleData) {
        // In real app: return api.post('/roles', roleData);
        return new Promise(resolve => {
            setTimeout(() => {
                const newRole = {
                    id: mockRoles.length + 1,
                    ...roleData,
                    permissions: roleData.permissions || []
                };
                mockRoles.push(newRole);
                resolve({ data: newRole });
            }, 500);
        });
    },

    async updateRole(id, roleData) {
        // In real app: return api.put(`/roles/${id}`, roleData);
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = mockRoles.findIndex(r => r.id == id);
                if (index !== -1) {
                    mockRoles[index] = { ...mockRoles[index], ...roleData };
                    resolve({ data: mockRoles[index] });
                } else {
                    reject(new Error('Role not found'));
                }
            }, 500);
        });
    },

    async deleteRole(id) {
        // In real app: return api.delete(`/roles/${id}`);
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = mockRoles.findIndex(r => r.id == id);
                if (index !== -1) {
                    mockRoles.splice(index, 1);
                    resolve({ success: true });
                } else {
                    reject(new Error('Role not found'));
                }
            }, 500);
        });
    },

    async getPermissions() {
        // In real app: return api.get('/permissions');
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({ data: mockPermissions });
            }, 300);
        });
    },

    async createPermission(permissionData) {
        // In real app: return api.post('/permissions', permissionData);
        return new Promise(resolve => {
            setTimeout(() => {
                const { category, id, label } = permissionData;
                if (!mockPermissions[category]) {
                    mockPermissions[category] = [];
                }
                const newPermission = { id, label };
                mockPermissions[category].push(newPermission);
                resolve({ data: newPermission });
            }, 500);
        });
    },

    // Note: In a real relational DB, updating permission ID cascade might be complex.
    // For this mock, we'll assume we verify ID uniqueness and just update properties.
    async updatePermission(oldId, permissionData) {
        // In real app: return api.put(`/permissions/${oldId}`, permissionData);
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const { category, id, label, oldCategory } = permissionData;
                let found = false;

                // Handle category change if needed (remove from old, add to new)
                if (oldCategory && oldCategory !== category && mockPermissions[oldCategory]) {
                    const idx = mockPermissions[oldCategory].findIndex(p => p.id === oldId);
                    if (idx !== -1) {
                        mockPermissions[oldCategory].splice(idx, 1);
                        // Clean up empty category if needed
                        if (mockPermissions[oldCategory].length === 0) {
                            delete mockPermissions[oldCategory];
                        }
                    }
                }

                // If staying in same category or moving to new one
                if (!mockPermissions[category]) {
                    mockPermissions[category] = [];
                }

                // If it was a move, we push new. If inplace update, we find and update.
                // Simplified: Just find in target category if it exists, or push if it was a move.
                // Ideally for mock: Remove from wherever it was, add to where it should be.

                // Let's do a safe "Remove then Add" approach for the mock to handle all cases
                // 1. Find and Remove
                let targetCat = oldCategory || category; // Fallback
                // If we didn't get oldCategory passed, search for it
                if (!oldCategory) {
                    for (const cat in mockPermissions) {
                        if (mockPermissions[cat].find(p => p.id === oldId)) {
                            targetCat = cat;
                            break;
                        }
                    }
                }

                if (mockPermissions[targetCat]) {
                    const idx = mockPermissions[targetCat].findIndex(p => p.id === oldId);
                    if (idx !== -1) {
                        mockPermissions[targetCat].splice(idx, 1);
                        if (mockPermissions[targetCat].length === 0) delete mockPermissions[targetCat];
                    }
                }

                // 2. Add new
                if (!mockPermissions[category]) mockPermissions[category] = [];
                const updatedPermission = { id, label };
                mockPermissions[category].push(updatedPermission);

                resolve({ data: updatedPermission });
            }, 500);
        });
    },

    async deletePermission(id) {
        // In real app: return api.delete(`/permissions/${id}`);
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                let deleted = false;
                for (const cat in mockPermissions) {
                    const index = mockPermissions[cat].findIndex(p => p.id === id);
                    if (index !== -1) {
                        mockPermissions[cat].splice(index, 1);
                        if (mockPermissions[cat].length === 0) {
                            delete mockPermissions[cat];
                        }
                        deleted = true;
                        break;
                    }
                }

                if (deleted) resolve({ success: true });
                else reject(new Error('Permission not found'));
            }, 500);
        });
    }
};
