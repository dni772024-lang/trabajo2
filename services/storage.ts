
import { User, Employee, Equipment, Loan, Category } from '../types';
import { api } from './api';

const KEYS = {
  AUTH: 'etp_auth'
};

export const storage = {
  // Init is now a no-op as data comes from server
  init: () => {
    console.log('Storage initialized - using Server API');
  },

  // Auth - Keep local for session persistence primarily
  getCurrentUser: (): User | null => JSON.parse(localStorage.getItem(KEYS.AUTH) || 'null'),
  setCurrentUser: (user: User | null) => localStorage.setItem(KEYS.AUTH, JSON.stringify(user)),

  // Users
  getUsers: () => api.getUsers(),
  saveUser: (user: User) => api.saveUser(user),
  updateUser: (user: User) => api.updateUser(user),
  deleteUser: (id: string) => api.deleteUser(id),

  // Util for user check
  isUsernameAvailable: (username: string, excludeId?: string) => api.checkUsername(username, excludeId),

  // Employees
  getEmployees: () => api.getEmployees(),
  addEmployee: (employee: Employee) => api.addEmployee(employee),
  updateEmployee: (emp: Employee) => api.updateEmployee(emp),
  deleteEmployee: (id: string) => api.deleteEmployee(id),

  // Equipment
  getEquipment: () => api.getEquipment(),
  addEquipment: (item: Equipment) => api.addEquipment(item),
  updateEquipment: (item: Equipment) => api.updateEquipment(item),
  deleteEquipment: (id: string) => api.deleteEquipment(id),

  // Satellite Chips
  getSatelliteChips: () => api.getSatelliteChips(),
  addSatelliteChip: (chip: any) => api.addSatelliteChip(chip),
  updateSatelliteChip: (chip: any) => api.updateSatelliteChip(chip),
  deleteSatelliteChip: (id: string) => api.deleteSatelliteChip(id),

  // Categories
  getCategories: () => api.getCategories(),

  // Loans
  getLoans: () => api.getLoans(),
  addLoan: (loan: Loan) => api.addLoan(loan),
  updateLoan: (loan: Loan) => api.updateLoan(loan),

  // Return logic is now handled by backend
  finalizeReturn: (loanId: string, returnData: Partial<Loan>) => api.finalizeReturn(loanId, returnData),
};
