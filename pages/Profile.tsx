
import React, { useState } from 'react';
import { storage } from '../services/storage';
import { User } from '../types';
import { User as UserIcon, Lock, Shield, CheckCircle, Save, Award, Hash, Key } from 'lucide-react';

interface ProfileProps {
  user: User;
  onUpdate: (user: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    lastName: user.lastName,
    rank: user.rank,
    badgeNumber: user.badgeNumber,
    password: '',
    confirmPassword: ''
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const validatePassword = (pass: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(pass);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password) {
      if (!validatePassword(formData.password)) {
        setError('La nueva contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }
    }

    const updatedUser: User = {
      ...user,
      name: formData.name,
      lastName: formData.lastName,
      rank: formData.rank,
      badgeNumber: formData.badgeNumber,
      password: formData.password || user.password
    };

    try {
      await storage.updateUser(updatedUser);
      onUpdate(updatedUser);
      setSuccess(true);
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Error al actualizar el perfil.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Configuración de Perfil</h2>
        <p className="text-slate-500 font-medium text-lg">Identificador: <span className="text-blue-600 font-bold">{user.username}</span></p>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
        <form onSubmit={handleSubmit} className="space-y-6">
          {success && (
            <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl flex items-center gap-2 font-bold animate-in zoom-in">
              <CheckCircle className="w-5 h-5" /> Perfil actualizado correctamente
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl font-bold border border-red-100">
              {error}
            </div>
          )}

          <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-slate-50">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-xl shadow-blue-200">
              <UserIcon className="w-14 h-14" />
            </div>
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-bold uppercase tracking-widest text-slate-400">Rol: {user.role}</span>
              </div>
              <h3 className="text-3xl font-bold text-slate-800">{user.name} {user.lastName}</h3>
              <p className="text-slate-500 font-semibold">{user.rank} • Placa #{user.badgeNumber}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Nombre</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text" required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Apellido</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text" required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Rango</label>
              <div className="relative">
                <Award className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text" required
                  value={formData.rank}
                  onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Número de Placa</label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text" required
                  value={formData.badgeNumber}
                  onChange={(e) => setFormData({ ...formData, badgeNumber: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-50">
            <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-600" /> Seguridad
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Nueva Contraseña</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="password"
                    placeholder="Dejar en blanco para no cambiar"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Confirmar Contraseña</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="password"
                    placeholder="Repita la nueva contraseña"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>
            {formData.password && (
              <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Requisitos de Seguridad:</p>
                <ul className="grid grid-cols-2 gap-2">
                  <li className={`text-[10px] font-bold ${formData.password.length >= 8 ? 'text-emerald-600' : 'text-slate-400'}`}>✓ Mínimo 8 caracteres</li>
                  <li className={`text-[10px] font-bold ${/[A-Z]/.test(formData.password) ? 'text-emerald-600' : 'text-slate-400'}`}>✓ Una Mayúscula</li>
                  <li className={`text-[10px] font-bold ${/[a-z]/.test(formData.password) ? 'text-emerald-600' : 'text-slate-400'}`}>✓ Una Minúscula</li>
                  <li className={`text-[10px] font-bold ${/\d/.test(formData.password) ? 'text-emerald-600' : 'text-slate-400'}`}>✓ Un Número</li>
                </ul>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 text-lg"
          >
            <Save className="w-6 h-6" />
            Guardar Cambios
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
