import menuData from '@/data_dummy/menus.json';

// In-memory store for development (mock database)
// Flatten the initial structure to manageable items with parentIds if needed, 
// or keep as hierarchy. For CRUD, flat with parent_id is usually easier to manage.

let mockMenus = [];
let nextId = 1;

// Helper to flatten the seed data for initial state
const flattenMenus = (items, parentId = null, role = null) => {
    items.forEach(item => {
        const id = nextId++;
        const menuItem = {
            id,
            parentId,
            label: item.label,
            to: item.to,
            icon: item.icon,
            roles: role ? [role] : [], // Assign seed role
            order: id // simple ordering
        };
        mockMenus.push(menuItem);

        if (item.children) {
            flattenMenus(item.children, id, role);
        }
    });
};

// Initialize mock data
menuData.forEach(roleGroup => {
    flattenMenus(roleGroup.items, null, roleGroup.role);
});

// Remove duplicates based on label/path if any (since seed has role-based separation)
// In a real app, menu structure is unified and roles are assigned to items.
// We will unify them by label for this mock to create a "Master Menu List".
const uniqueMenus = [];
const seenLabels = new Set();
// Re-build a clean list for "Master Data" purposes
mockMenus.forEach(m => {
    const key = `${m.label}-${m.to}`;
    if (!seenLabels.has(key)) {
        seenLabels.add(key);
        uniqueMenus.push(m);
    }
});
mockMenus = uniqueMenus;


export default {
    async getMenus() {
        return new Promise(resolve => {
            setTimeout(() => {
                // Return as flat list, component can treeify it
                resolve({ data: [...mockMenus] });
            }, 300);
        });
    },

    async getMenu(id) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const menu = mockMenus.find(m => m.id === id);
                if (menu) resolve({ data: menu });
                else reject(new Error('Menu not found'));
            }, 200);
        });
    },

    async createMenu(menuData) {
        return new Promise(resolve => {
            setTimeout(() => {
                const newMenu = {
                    id: String(Date.now()), // Mock ID
                    ...menuData,
                    order: mockMenus.length + 1
                };
                mockMenus.push(newMenu);
                resolve({ data: newMenu });
            }, 400);
        });
    },

    async updateMenu(id, menuData) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = mockMenus.findIndex(m => m.id === id);
                if (index !== -1) {
                    mockMenus[index] = { ...mockMenus[index], ...menuData };
                    resolve({ data: mockMenus[index] });
                } else {
                    reject(new Error('Menu not found'));
                }
            }, 400);
        });
    },

    async deleteMenu(id) {
        return new Promise(resolve => {
            setTimeout(() => {
                // Recursive delete for mock
                const deleteRecursive = (targetId) => {
                    const children = mockMenus.filter(m => m.parentId === targetId);
                    children.forEach(c => deleteRecursive(c.id));

                    const idx = mockMenus.findIndex(m => m.id === targetId);
                    if (idx !== -1) mockMenus.splice(idx, 1);
                };

                deleteRecursive(id);
                resolve({ success: true });
            }, 400);
        });
    }
};
