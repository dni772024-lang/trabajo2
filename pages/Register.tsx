
import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { User } from '../types';
import {
  Shield, Lock, Mail, Hash, CheckCircle, Edit2, Trash2,
  Search, UserCheck, UserCog, ShieldCheck, Globe, Clock,
  Key, AlertTriangle, Eye, EyeOff, Save, X, Activity,
  Network, Monitor, User as UserIcon, Settings
} from 'lucide-react';

const MODULES = ['Dashboard', 'Inventario', 'Préstamos', 'Devoluciones', 'Personal', 'Configuración'];
const EXPIRATIONS = ['1h', '8h', '24h', 'Permanente'];
const ROLES: ('Administrador' | 'Supervisor' | 'Operador' | 'Consulta')[] = ['Administrador', 'Supervisor', 'Operador', 'Consulta'];

const Register: React.FC = () => {
  const [usersList, setUsersList] = useState<User[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<User>>({
    username: '',
    institutionalEmail: '',
    password: '',
    role: 'Operador',
    status: 'Activo',
    sessionExpiration: '8h',
    accessibleModules: ['Dashboard'],
    requirePasswordChange: false,
    autoLock: true
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    refreshUsers();
  }, []);

  const refreshUsers = async () => {
    try {
      const users = await storage.getUsers();
      setUsersList(users);
    } catch (err) {
      console.error("Error loading users:", err);
    }
  };

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { label: 'Ninguna', color: 'bg-slate-200', width: 'w-0' };
    if (pass.length < 6) return { label: 'Débil', color: 'bg-red-400', width: 'w-1/4' };
    if (pass.length < 10 || !/[A-Z]/.test(pass) || !/\d/.test(pass)) return { label: 'Media', color: 'bg-yellow-400', width: 'w-2/4' };
    if (!/[!@#$%^&*]/.test(pass)) return { label: 'Segura', color: 'bg-blue-400', width: 'w-3/4' };
    return { label: 'Excelente', color: 'bg-emerald-500', width: 'w-full' };
  };

  const handleModuleToggle = (module: string) => {
    const current = formData.accessibleModules || [];
    if (current.includes(module)) {
      setFormData({ ...formData, accessibleModules: current.filter(m => m !== module) });
    } else {
      setFormData({ ...formData, accessibleModules: [...current, module] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.username || !formData.institutionalEmail || (!editingId && !formData.password)) {
      setError('Complete los campos obligatorios de identificación.');
      return;
    }

    try {
      if (editingId) {
        const existing = usersList.find(u => u.id === editingId);
        if (existing) {
          const updated: User = { ...existing, ...formData as User };
          await storage.updateUser(updated);
          setSuccess(true);
        }
      } else {
        const isAvailable = await storage.isUsernameAvailable(formData.username!);
        if (!isAvailable) {
          setError('Este ID de usuario ya está en uso.');
          return;
        }
        const newUser: Partial<User> = {
          ...formData as User,
          name: formData.username || '',
          lastName: '',
          rank: 'Oficial',
          badgeNumber: '000',
          unit: 'Centro de Control',
          permissions: formData.role === 'Administrador' ? ['all'] : ['read'],
          createdAt: new Date().toISOString()
        };
        await storage.saveUser(newUser);
        setSuccess(true);
      }

      await refreshUsers();
      resetForm();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Error saving user:", err);
      setError("Error al guardar usuario: " + (err.message || 'Desconocido'));
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      username: '', institutionalEmail: '', password: '', role: 'Operador',
      status: 'Activo', sessionExpiration: '8h', accessibleModules: ['Dashboard'],
      requirePasswordChange: false, autoLock: true, ipRestriction: ''
    });
  };

  const handleEdit = (user: User) => {
    setEditingId(user.id);
    setFormData(user);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Desea eliminar permanentemente esta cuenta? Esta acción revocará todos los accesos.')) {
      try {
        await storage.deleteUser(id);
        await refreshUsers();
      } catch (err) {
        console.error("Error deleting user:", err);
      }
    }
  };

  const strength = getPasswordStrength(formData.password || '');

  const filteredUsers = usersList.filter(u =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">

      {/* HEADER PRINCIPAL ESTILIZADO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-5">
          <div className="bg-[#1e3a8a] p-4 rounded-[1.5rem] shadow-xl text-white">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none uppercase">Centro de Control y Configuración</h2>
            <p className="text-slate-500 font-bold text-sm mt-2">Gestión unificada de identidad, roles y políticas de seguridad</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* COLUMNA IZQUIERDA: FORMULARIO PRINCIPAL */}
        <div className="lg:col-span-2 space-y-10">

          <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 relative overflow-hidden">

            <form onSubmit={handleSubmit} className="space-y-16">

              {/* I. CREDENCIALES DE IDENTIDAD */}
              <div className="space-y-8">
                <div className="flex items-center gap-3 border-b-2 border-blue-600 pb-5">
                  <Key className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-black text-[#1e3a8a] uppercase tracking-tight">I. Credenciales de Identidad</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-[#1e3a8a] uppercase tracking-widest ml-1">ID de Usuario (Login)</label>
                    <div className="relative group">
                      <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                      <input required type="text" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-base font-black text-slate-700 focus:outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner" placeholder="admin_vial_01" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-[#1e3a8a] uppercase tracking-widest ml-1">Correo Electrónico</label>
                    <div className="relative group">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                      <input required type="email" value={formData.institutionalEmail} onChange={e => setFormData({ ...formData, institutionalEmail: e.target.value })} className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-base font-bold focus:outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner" placeholder="oficial@gob.pa" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-[#1e3a8a] uppercase tracking-widest ml-1">Contraseña</label>
                    <div className="relative group">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                      <input required={!editingId} type={showPassword ? "text" : "password"} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full pl-14 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-base font-mono focus:outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner" placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {formData.password && (
                      <div className="mt-4 px-2">
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-700 ease-out ${strength.color} ${strength.width}`}></div>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fortaleza: <span className={strength.color.replace('bg-', 'text-')}>{strength.label}</span></span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-[#1e3a8a] uppercase tracking-widest ml-1">Confirmar Contraseña</label>
                    <div className="relative group">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                      <input required={!editingId} type="password" className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-base font-mono focus:outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner" placeholder="••••••••" />
                    </div>
                  </div>
                </div>
              </div>

              {/* II. PERFIL DE SEGURIDAD Y ROL */}
              <div className="space-y-10">
                <div className="flex items-center gap-3 border-b-2 border-blue-600 pb-5">
                  <UserCheck className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-black text-[#1e3a8a] uppercase tracking-tight">II. Perfil de Seguridad y Rol</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <label className="text-[11px] font-black text-[#1e3a8a] uppercase tracking-widest ml-1">Rol Operativo en Plataforma</label>
                    <div className="grid grid-cols-2 gap-4">
                      {ROLES.map(r => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setFormData({ ...formData, role: r })}
                          className={`px-4 py-4 rounded-2xl border-2 text-[10px] font-black transition-all uppercase tracking-widest flex items-center justify-center gap-2 ${formData.role === r
                            ? 'border-blue-600 bg-blue-600 text-white shadow-xl shadow-blue-200'
                            : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-blue-300 hover:bg-blue-50'
                            }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <label className="text-[11px] font-black text-[#1e3a8a] uppercase tracking-widest ml-1">Módulos Habilitados</label>
                    <div className="grid grid-cols-2 gap-3">
                      {MODULES.map(m => (
                        <label key={m} className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer group ${formData.accessibleModules?.includes(m) ? 'border-blue-100 bg-blue-50/50 shadow-sm' : 'border-slate-50 hover:bg-slate-50'}`}>
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${formData.accessibleModules?.includes(m) ? 'bg-blue-600 border-blue-600' : 'border-slate-200 group-hover:border-blue-400'}`}>
                            {formData.accessibleModules?.includes(m) && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <input type="checkbox" className="hidden" checked={formData.accessibleModules?.includes(m)} onChange={() => handleModuleToggle(m)} />
                          <span className={`text-[11px] font-bold uppercase tracking-tight ${formData.accessibleModules?.includes(m) ? 'text-[#1e3a8a]' : 'text-slate-400'}`}>{m}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* III. POLÍTICAS DE SEGURIDAD AVANZADA */}
              <div className="space-y-10">
                <div className="flex items-center gap-3 border-b-2 border-blue-600 pb-5">
                  <Lock className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-black text-[#1e3a8a] uppercase tracking-tight">III. Políticas de Seguridad Avanzada</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-[#1e3a8a] uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Clock className="w-3 h-3" /> Expiración de Sesión
                    </label>
                    <select value={formData.sessionExpiration} onChange={e => setFormData({ ...formData, sessionExpiration: e.target.value as any })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-700 appearance-none cursor-pointer focus:border-blue-600 transition-all">
                      {EXPIRATIONS.map(exp => <option key={exp} value={exp}>{exp}</option>)}
                    </select>
                  </div>
                  <div className="space-y-4 pt-4">
                    <label className="flex items-center gap-4 cursor-pointer group">
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.requirePasswordChange ? 'bg-blue-600 border-blue-600' : 'border-slate-200 group-hover:border-blue-400'}`}>
                        {formData.requirePasswordChange && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                      <input type="checkbox" className="hidden" checked={formData.requirePasswordChange} onChange={e => setFormData({ ...formData, requirePasswordChange: e.target.checked })} />
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">Cambio de clave al inicio</span>
                    </label>
                    <label className="flex items-center gap-4 cursor-pointer group">
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.autoLock ? 'bg-blue-600 border-blue-600' : 'border-slate-200 group-hover:border-blue-400'}`}>
                        {formData.autoLock && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                      <input type="checkbox" className="hidden" checked={formData.autoLock} onChange={e => setFormData({ ...formData, autoLock: e.target.checked })} />
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">Bloqueo tras 5 fallos</span>
                    </label>
                  </div>
                </div>

                <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl ${formData.status === 'Activo' ? 'bg-emerald-500 shadow-emerald-200' : 'bg-red-500 shadow-red-200'}`}>
                      <Activity className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-base font-black text-slate-800 uppercase tracking-tight">Estado Operativo del Acceso</p>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Actualmente: {formData.status}</p>
                    </div>
                  </div>
                  <div className="flex bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
                    <button type="button" onClick={() => setFormData({ ...formData, status: 'Activo' })} className={`px-10 py-3 rounded-xl text-[10px] font-black tracking-[0.2em] transition-all ${formData.status === 'Activo' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'text-slate-400 hover:bg-emerald-50'}`}>ACTIVO</button>
                    <button type="button" onClick={() => setFormData({ ...formData, status: 'Suspendido' })} className={`px-10 py-3 rounded-xl text-[10px] font-black tracking-[0.2em] transition-all ${formData.status === 'Suspendido' ? 'bg-red-500 text-white shadow-lg shadow-red-100' : 'text-slate-400 hover:bg-red-50'}`}>SUSPENDIDO</button>
                  </div>
                </div>
              </div>

              {/* ACCIONES FINALES */}
              <div className="flex flex-col md:flex-row gap-6 pt-10 border-t border-slate-100">
                <button type="button" onClick={resetForm} className="flex-1 py-5 bg-white border-2 border-slate-100 text-slate-400 rounded-[2rem] font-black uppercase tracking-widest hover:bg-slate-50 hover:text-slate-600 transition-all flex items-center justify-center gap-3">
                  <X className="w-6 h-6" /> DESCARTAR CAMBIOS
                </button>
                <button type="submit" className="flex-[2] py-5 bg-[#1e3a8a] text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-blue-900/20 hover:bg-[#1a3a70] transition-all flex items-center justify-center gap-3 uppercase tracking-widest">
                  <Save className="w-6 h-6" /> {editingId ? 'ACTUALIZAR CONFIGURACIÓN' : 'GUARDAR NUEVO ACCESO'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* COLUMNA DERECHA: CUENTAS ACTIVAS Y MÉTRICAS */}
        <div className="space-y-10">

          {/* BUSCADOR Y LISTA */}
          <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-8">
            <div className="flex items-center justify-between border-b border-slate-50 pb-6">
              <h3 className="text-xl font-black text-[#1e3a8a] uppercase tracking-tight">Cuentas Activas</h3>
              <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                <UserCog className="w-5 h-5" />
              </div>
            </div>

            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="text"
                placeholder="Buscar ID, Rol o Estado..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all shadow-inner"
              />
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredUsers.length === 0 ? (
                <div className="py-20 text-center">
                  <AlertTriangle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest leading-loose">No se hallaron registros coincidentes</p>
                </div>
              ) : (
                filteredUsers.map(u => (
                  <div key={u.id} className={`group p-6 rounded-[2.5rem] border-2 transition-all duration-300 ${editingId === u.id ? 'bg-[#1e3a8a] border-[#1e3a8a] shadow-xl shadow-blue-900/20' : 'bg-slate-50/50 border-transparent hover:bg-white hover:border-blue-100 hover:shadow-lg'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-all ${editingId === u.id ? 'bg-white text-[#1e3a8a]' : 'bg-blue-100 text-blue-600 group-hover:bg-[#1e3a8a] group-hover:text-white'}`}>
                          {u.username[0].toUpperCase()}
                        </div>
                        <div>
                          <p className={`text-base font-black tracking-tight ${editingId === u.id ? 'text-white' : 'text-slate-800'}`}>{u.username}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[9px] font-black uppercase tracking-widest ${editingId === u.id ? 'text-blue-100/60' : 'text-slate-400'}`}>{u.role}</span>
                            <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'Activo' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(u)} className={`p-2 rounded-xl transition-all ${editingId === u.id ? 'bg-white/20 text-white' : 'bg-white text-blue-600 shadow-sm hover:bg-blue-600 hover:text-white'}`}><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(u.id)} className={`p-2 rounded-xl transition-all ${editingId === u.id ? 'bg-white/10 text-white' : 'bg-white text-red-500 shadow-sm hover:bg-red-500 hover:text-white'}`} disabled={u.username === 'admin.pro.001'}><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* MÉTRICAS DE CONTROL ESTILO DARK */}
          <div className="bg-[#1e293b] p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-5">
              <ShieldCheck className="w-32 h-32" />
            </div>
            <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.3em] mb-8">Métricas de Control</h4>
            <div className="grid grid-cols-2 gap-10 relative z-10">
              <div className="space-y-2">
                <p className="text-4xl font-black tracking-tight">{usersList.filter(u => u.status === 'Activo').length}</p>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accesos Activos</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-4xl font-black tracking-tight">{usersList.filter(u => u.role === 'Administrador').length}</p>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Administradores</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-[#1e3a8a] p-10 rounded-[3rem] text-white shadow-xl shadow-blue-200 text-center relative overflow-hidden">
            <Activity className="absolute -bottom-10 -right-10 w-48 h-48 opacity-10" />
            <div className="relative z-10">
              <Settings className="w-12 h-12 mx-auto mb-6 opacity-50" />
              <h4 className="text-lg font-black uppercase tracking-tight mb-2">Seguridad Centralizada</h4>
              <p className="text-xs font-bold text-blue-100 opacity-70 leading-relaxed uppercase tracking-widest">Gestión integral de la Dirección de Inteligencia</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;
