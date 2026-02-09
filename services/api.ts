const API_URL = '/api';

export const api = {
    // Generic fetch wrapper
    request: async (endpoint: string, options: RequestInit = {}) => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || `Error ${response.status}: ${response.statusText}`);
        }

        return response.json();
    },

    // Users
    getUsers: () => api.request('/users'),
    saveUser: (user: any) => api.request('/users', { method: 'POST', body: JSON.stringify(user) }),
    updateUser: (user: any) => api.request(`/users/${user.id}`, { method: 'PUT', body: JSON.stringify(user) }),
    deleteUser: (id: string) => api.request(`/users/${id}`, { method: 'DELETE' }),
    checkUsername: (username: string, excludeId?: string) =>
        api.request(`/auth/check-username?username=${encodeURIComponent(username)}${excludeId ? `&excludeId=${excludeId}` : ''}`),

    // Employees
    getEmployees: () => api.request('/employees'),
    addEmployee: (employee: any) => api.request('/employees', { method: 'POST', body: JSON.stringify(employee) }),
    updateEmployee: (employee: any) => api.request(`/employees/${employee.id}`, { method: 'PUT', body: JSON.stringify(employee) }),
    deleteEmployee: (id: string) => api.request(`/employees/${id}`, { method: 'DELETE' }),

    // Equipment
    getEquipment: () => api.request('/equipment'),
    addEquipment: (equipment: any) => api.request('/equipment', { method: 'POST', body: JSON.stringify(equipment) }),
    updateEquipment: (equipment: any) => api.request(`/equipment/${equipment.id}`, { method: 'PUT', body: JSON.stringify(equipment) }),
    deleteEquipment: (id: string) => api.request(`/equipment/${id}`, { method: 'DELETE' }),

    // Satellite Chips
    getSatelliteChips: () => api.request('/chips'),
    addSatelliteChip: (chip: any) => api.request('/chips', { method: 'POST', body: JSON.stringify(chip) }),
    updateSatelliteChip: (chip: any) => api.request(`/chips/${chip.id}`, { method: 'PUT', body: JSON.stringify(chip) }),
    deleteSatelliteChip: (id: string) => api.request(`/chips/${id}`, { method: 'DELETE' }),

    // Loans
    getLoans: () => api.request('/loans'),
    addLoan: (loan: any) => api.request('/loans', { method: 'POST', body: JSON.stringify(loan) }),
    updateLoan: (loan: any) => api.request(`/loans/${loan.id}`, { method: 'PUT', body: JSON.stringify(loan) }),
    finalizeReturn: (loanId: string, returnData: any) =>
        api.request(`/loans/${loanId}/return`, { method: 'PUT', body: JSON.stringify(returnData) }),

    // Categories
    getCategories: () => api.request('/categories'),

    // Statistics
    getStatsOverview: () => api.request('/stats/overview'),
    getLoansByMonth: () => api.request('/stats/loans-by-month'),
    getEquipmentByCategory: () => api.request('/stats/equipment-by-category'),
    getTopEquipment: () => api.request('/stats/top-equipment'),
    getTopEmployees: () => api.request('/stats/top-employees'),
    getAlerts: () => api.request('/stats/alerts'),
};
