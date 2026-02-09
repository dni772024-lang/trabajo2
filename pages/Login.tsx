
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../services/storage';
import { User } from '../types';
import { Laptop, Lock, User as UserIcon, ArrowRight, Info } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const users = await storage.getUsers();
      // Búsqueda insensible a mayúsculas para el nombre de usuario
      const user = users.find(u => u.username.toLowerCase() === username.toLowerCase().trim());

      // En un entorno real, validación debería ser en backend, pero mantenemos lógica de compatibilidad
      if (user && user.password === password) {
        storage.setCurrentUser(user);
        onLogin(user);
        navigate('/');
      } else {
        setError('Credenciales incorrectas. Verifique su usuario y contraseña.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Error de conexión al servidor.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 mb-4">
            <Laptop className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">ElectroTrack Pro</h1>
          <p className="text-slate-500 mt-2">Control de Inventario Institucional</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 font-bold flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></div>
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wider text-[10px]">ID de Acceso Oficial</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ej: admin.pro.001"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider text-[10px]">Contraseña</label>
                <a href="#" className="text-[10px] text-blue-600 hover:underline font-bold">SOLICITAR RESTRICCIÓN</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-2 group"
            >
              ACCEDER AL PANEL
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Credential help section */}
          <div className="mt-8 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 border-dashed">
            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1">Acceso Maestro Inicial:</p>
                <p className="text-[11px] text-indigo-900 font-medium">
                  Usuario: <span className="font-bold underline">admin.pro.001</span><br />
                  Pass: <span className="font-bold underline">Admin123</span>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-[10px] italic font-medium">
              SISTEMA DE CONTROL DE ACTIVOS ELECTRÓNICOS • PANAMÁ v1.2
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
