
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { storage } from '../services/storage';
import { Employee, User } from '../types';
import {
  UserPlus, ClipboardList, Search, Mail, Phone, ShieldCheck,
  Save, X, MapPin, Award, Hash, Building2, Camera, CheckCircle,
  Edit2, Trash2, Check, AlertTriangle
} from 'lucide-react';

const RANGOS = [
  "Mayor", "Capitán", "Teniente", "Sargento Primero",
  "Sargento Segundo", "Cabo Primero", "Cabo Segundo", "Agente"
];

const Employees: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const viewParam = searchParams.get('v') || 'list';
  const currentUser = storage.getCurrentUser();
  const isReadOnly = currentUser?.role === 'Consulta';

  const [view, setView] = useState<'list' | 'new' | 'distribution'>(viewParam as any);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [distribution, setDistribution] = useState<Record<string, { rank: string; count: number }[]>>({});
  const [detailRows, setDetailRows] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Inline Editing State - Changed to Modal
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editForm, setEditForm] = useState<Partial<Employee>>({});

  // New Employee Form State
  const [formData, setFormData] = useState<Partial<Employee>>({
    rank: RANGOS[0],
    department: '',
    hireDate: new Date().toISOString().split('T')[0],
    loanLimit: 3,
    accessLevel: 'Básico',
    criticalAccess: false
  });

  useEffect(() => {
    loadEmployees();
  }, [viewParam]);

  const loadEmployees = async () => {
    try {
      const data = await storage.getEmployees();
      setEmployees(data);
      setView(viewParam as any);
    } catch (err) {
      console.error("Error loading employees:", err);
    }
  };

  const loadDistribution = async () => {
    try {
      const res = await fetch('/api/employees/distribution');
      const json = await res.json();
      setDistribution(json.summary || {});
      setView('distribution');
    } catch (err) {
      console.error('Error loading distribution:', err);
    }
  };

  const loadDetail = async (department: string, rank: string) => {
    try {
      const q = new URLSearchParams({ department, rank });
      const res = await fetch(`/api/employees/filter?${q.toString()}`);
      const json = await res.json();
      setDetailRows(json || []);
      // ensure distribution view active
      setView('distribution');
    } catch (err) {
      console.error('Error loading detail:', err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

    const newEmployee: Partial<Employee> = {
      name: formData.name || '',
      lastName: formData.lastName || '',
      rank: formData.rank || RANGOS[0],
      badgeNumber: formData.badgeNumber || '',
      unit: formData.department || '',
      department: formData.department || '',
      position: formData.position || '',
      hireDate: formData.hireDate || new Date().toISOString().split('T')[0],
      institutionalEmail: formData.institutionalEmail || '',
      phone: formData.phone || '',
      loanLimit: formData.loanLimit || 3,
      accessLevel: formData.accessLevel || 'Básico',
      criticalAccess: formData.criticalAccess || false,
      createdAt: new Date().toISOString()
    };

    try {
      await storage.addEmployee(newEmployee);
      await loadEmployees();
      setSuccessMessage('¡Personal registrado exitosamente!');
      setTimeout(() => {
        setSuccessMessage('');
        navigate('/employees?v=list');
      }, 2000);
    } catch (err) {
      console.error("Error saving employee:", err);
      alert("Error al guardar empleado: " + (err as Error).message);
    }
  };

  const handleStartEdit = (emp: Employee) => {
    if (isReadOnly) return;
    setEditingEmployee(emp);
    setEditForm({ ...emp });
  };

  const handleCancelEdit = () => {
    setEditingEmployee(null);
    setEditForm({});
  };

  const handleSaveEdit = async () => {
    if (isReadOnly || !editingEmployee) return;
    try {
      const updatedEmployee: Employee = {
        ...editingEmployee,
        ...editForm,
        unit: editForm.department || editingEmployee.department,
      };
      await storage.updateEmployee(updatedEmployee);
      await loadEmployees();
      setEditingEmployee(null);
      setEditForm({});
      setSuccessMessage('¡Registro actualizado!');
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (err) {
      console.error("Error updating employee:", err);
      alert("Error al actualizar empleado: " + (err as Error).message);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (isReadOnly) return;
    if (confirm('¿Está seguro de eliminar este registro institucional? Esta acción no se puede deshacer.')) {
      try {
        await storage.deleteEmployee(id);
        const filtered = employees.filter(e => e.id !== id);
        setEmployees(filtered); // Optimistic update
        setSuccessMessage('¡Registro eliminado correctamente!');
        setTimeout(() => setSuccessMessage(''), 2000);
      } catch (err) {
        console.error("Error deleting employee:", err);
      }
    }
  };

  const filteredEmployees = employees.filter(e => {
    const term = searchTerm.toLowerCase();
    return (
      e.name.toLowerCase().includes(term) ||
      e.lastName.toLowerCase().includes(term) ||
      e.badgeNumber.includes(term) ||
      e.rank.toLowerCase().includes(term) ||
      e.department.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Gestión de Personal</h2>
          <p className="text-slate-500 font-medium">Registro y control institucional de colaboradores</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
          <button
            onClick={() => navigate('/employees?v=list')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${view === 'list' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            LISTA
          </button>
          {!isReadOnly && (
            <>
              <button
                onClick={() => navigate('/employees?v=new')}
                className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${view === 'new' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                NUEVO EMPLEADO
              </button>
              <button
                onClick={() => loadDistribution()}
                className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${view === 'distribution' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                DISTRIBUCIÓN DE PERSONAL
              </button>
            </>
          )}
        </div>
      </div>

      {isReadOnly && (
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center gap-3 text-amber-700 font-bold text-sm">
          <AlertTriangle className="w-5 h-5" /> Modo de Solo Consulta: No puede realizar cambios en la base de datos de personal.
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl flex items-center gap-3 font-bold animate-in zoom-in border border-emerald-100">
          <CheckCircle className="w-6 h-6" /> {successMessage}
        </div>
      )}

      {view === 'list' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl flex items-center gap-4 group">
            <Search className="w-6 h-6 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Buscar por nombre, apellido, placa, rango o departamento..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent text-base font-medium focus:outline-none"
            />
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Personal</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">PLACA</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rango</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Unidad / Depto</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cargo</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Teléfono</th>
                  {!isReadOnly && <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredEmployees.map(emp => (
                  <tr key={emp.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 font-bold group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                          {emp.name[0]}{emp.lastName[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{emp.name} {emp.lastName}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{emp.institutionalEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="font-mono font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg text-xs tracking-wider">#{emp.badgeNumber}</span>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-slate-700">{emp.rank}</p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-medium text-slate-600 italic">{emp.department}</p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-medium text-slate-700">{emp.position}</p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs font-medium text-slate-500">{emp.phone}</p>
                    </td>
                    {!isReadOnly && (
                      <td className="px-8 py-5">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleStartEdit(emp)}
                            className="p-2.5 bg-blue-50 text-blue-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                            title="Editar registro"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEmployee(emp.id)}
                            className="p-2.5 bg-red-50 text-red-400 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                            title="Eliminar fila"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === 'distribution' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl">
            <h3 className="text-lg font-bold">Distribución de Personal por Departamento</h3>
            {Object.keys(distribution).length === 0 && (
              <p className="text-sm text-slate-400 mt-4">No hay datos para mostrar</p>
            )}
            {Object.entries(distribution).map(([dept, ranks]) => (
              <div key={dept} className="mt-6">
                <div className="font-bold text-slate-800">{dept} ({ranks.reduce((s, r) => s + r.count, 0)} total)</div>
                <ul className="ml-4 mt-2 list-disc">
                  {ranks.map(r => (
                    <li key={r.rank} className="cursor-pointer text-slate-600 hover:text-slate-900" onClick={() => loadDetail(dept, r.rank)}>
                      {r.rank}: {r.count}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {detailRows.length > 0 && (
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl">
              <h3 className="text-lg font-bold">Detalle</h3>
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-4 py-2 text-sm font-bold">ID</th>
                      <th className="px-4 py-2 text-sm font-bold">Nombre Completo</th>
                      <th className="px-4 py-2 text-sm font-bold">Placa</th>
                      <th className="px-4 py-2 text-sm font-bold">Rango</th>
                      <th className="px-4 py-2 text-sm font-bold">Departamento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailRows.map(row => (
                      <tr key={row.id} className="border-t">
                        <td className="px-4 py-2">{row.id}</td>
                        <td className="px-4 py-2">{row.fullName}</td>
                        <td className="px-4 py-2">{row.badgeNumber}</td>
                        <td className="px-4 py-2">{row.rank}</td>
                        <td className="px-4 py-2">{row.department}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {view === 'new' && !isReadOnly && (
        <div className="max-w-4xl mx-auto mb-20">
          <form onSubmit={handleSave} className="space-y-8">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-8">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
                <div className="bg-blue-600 p-2 rounded-xl text-white"><ShieldCheck className="w-6 h-6" /></div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Registro Institucional</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre(s)</label>
                  <input type="text" required value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-base font-medium focus:ring-4 focus:ring-blue-500/10 transition-all" placeholder="Ej: Ricardo" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Apellido(s)</label>
                  <input type="text" required value={formData.lastName || ''} onChange={e => setFormData({ ...formData, lastName: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-base font-medium focus:ring-4 focus:ring-blue-500/10 transition-all" placeholder="Ej: Arjona" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Número de Placa</label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input type="number" required value={formData.badgeNumber || ''} onChange={e => setFormData({ ...formData, badgeNumber: e.target.value })} className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-base font-black text-blue-600 tracking-widest" placeholder="000000" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Rango</label>
                  <div className="relative">
                    <Award className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <select value={formData.rank} onChange={e => setFormData({ ...formData, rank: e.target.value })} className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-base font-bold appearance-none">
                      {RANGOS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Unidad / Departamento</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input type="text" required value={formData.department || ''} onChange={e => setFormData({ ...formData, department: e.target.value })} className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-base font-medium" placeholder="Ej: DNI, DAIN, Operaciones" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Cargo / Posición *</label>
                  <input type="text" required value={formData.position || ''} onChange={e => setFormData({ ...formData, position: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-base font-medium focus:ring-4 focus:ring-blue-500/10 transition-all" placeholder="Ej: Analista, Operador, Técnico" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Fecha de Contratación *</label>
                  <input type="date" required value={formData.hireDate || ''} onChange={e => setFormData({ ...formData, hireDate: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-base font-medium focus:ring-4 focus:ring-blue-500/10 transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Institucional *</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input type="email" required value={formData.institutionalEmail || ''} onChange={e => setFormData({ ...formData, institutionalEmail: e.target.value })} className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-base font-medium focus:ring-4 focus:ring-blue-500/10 transition-all" placeholder="nombre.apellido@senan.gob.pa" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Teléfono *</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input type="tel" required value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-base font-medium focus:ring-4 focus:ring-blue-500/10 transition-all" placeholder="6XXX-XXXX" />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => navigate('/employees?v=list')} className="flex-1 py-5 bg-white border border-slate-200 rounded-2xl font-black text-slate-500 shadow-lg hover:bg-slate-50 transition-all uppercase tracking-widest">
                  CANCELAR
                </button>
                <button type="submit" className="flex-[2] py-5 bg-blue-600 text-white rounded-2xl font-black text-xl shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all uppercase tracking-widest">
                  GUARDAR PERSONAL
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Modal de Edición */}
      {editingEmployee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-10 space-y-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 p-2 rounded-xl text-white"><ShieldCheck className="w-6 h-6" /></div>
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Editar Personal</h3>
                </div>
                <button onClick={handleCancelEdit} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre(s)</label>
                  <input type="text" required value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-base font-medium focus:ring-4 focus:ring-blue-500/10 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Apellido(s)</label>
                  <input type="text" required value={editForm.lastName || ''} onChange={e => setEditForm({ ...editForm, lastName: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-base font-medium focus:ring-4 focus:ring-blue-500/10 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Número de Placa</label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input type="text" required value={editForm.badgeNumber || ''} onChange={e => setEditForm({ ...editForm, badgeNumber: e.target.value })} className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-base font-black text-blue-600 tracking-widest" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Rango</label>
                  <div className="relative">
                    <Award className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <select value={editForm.rank} onChange={e => setEditForm({ ...editForm, rank: e.target.value })} className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-base font-bold appearance-none">
                      {RANGOS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Unidad / Departamento</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input type="text" required value={editForm.department || ''} onChange={e => setEditForm({ ...editForm, department: e.target.value })} className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-base font-medium" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Cargo / Posición</label>
                  <input type="text" required value={editForm.position || ''} onChange={e => setEditForm({ ...editForm, position: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-base font-medium focus:ring-4 focus:ring-blue-500/10 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Fecha de Contratación</label>
                  <input type="date" required value={editForm.hireDate || ''} onChange={e => setEditForm({ ...editForm, hireDate: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-base font-medium focus:ring-4 focus:ring-blue-500/10 transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Institucional</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input type="email" required value={editForm.institutionalEmail || ''} onChange={e => setEditForm({ ...editForm, institutionalEmail: e.target.value })} className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-base font-medium focus:ring-4 focus:ring-blue-500/10 transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Teléfono</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input type="tel" required value={editForm.phone || ''} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-base font-medium focus:ring-4 focus:ring-blue-500/10 transition-all" />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={handleCancelEdit} className="flex-1 py-5 bg-white border border-slate-200 rounded-2xl font-black text-slate-500 shadow-lg hover:bg-slate-50 transition-all uppercase tracking-widest">
                  CANCELAR
                </button>
                <button type="button" onClick={handleSaveEdit} className="flex-[2] py-5 bg-blue-600 text-white rounded-2xl font-black text-xl shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all uppercase tracking-widest">
                  GUARDAR CAMBIOS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
