
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Laptop,
  ArrowUpRight,
  ArrowDownLeft,
  UserPlus,
  Box,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  AlertCircle,
  BarChart3,
  UserCheck,
  ShieldCheck,
  Tag,
  History,
  Settings,
  Lock,
  Activity
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  user: User;
}

interface MenuItem {
  name: string;
  moduleName: string;
  icon: any;
  path: string;
  subItems?: { name: string; path: string; icon?: any }[];
}

const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    'DASHBOARD': true,
    'CONFIGURACIÓN': true,
    'PRÉSTAMOS': false
  });

  const toggleMenu = (name: string) => {
    setExpandedMenus(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const menuStructure: MenuItem[] = [
    {
      name: 'DASHBOARD',
      moduleName: 'Dashboard',
      icon: LayoutDashboard,
      path: '/',
      subItems: [
        { name: 'Resumen general', path: '/', icon: LayoutDashboard },
      ]
    },
    {
      name: 'PRÉSTAMOS',
      moduleName: 'Préstamos',
      icon: ArrowUpRight,
      path: '/loans',
      subItems: [
        { name: 'Listado Activos', path: '/loans?v=list', icon: History },
        { name: 'Nueva Orden', path: '/loans?v=new', icon: UserPlus },
      ]
    },
    {
      name: 'DEVOLUCIONES',
      moduleName: 'Devoluciones',
      icon: ArrowDownLeft,
      path: '/returns',
      subItems: [
        { name: 'Registrar Devolución', path: '/returns', icon: ArrowDownLeft },
      ]
    },
    {
      name: 'INVENTARIO',
      moduleName: 'Inventario',
      icon: Box,
      path: '/equipment',
      subItems: [
        { name: 'Inventario Global', path: '/equipment', icon: Tag },
        { name: 'Chips Satelitales', path: '/chips', icon: Box },
        { name: 'Nuevo Equipo', path: '/equipment?v=new', icon: UserPlus },
      ]
    },
    {
      name: 'PERSONAL',
      moduleName: 'Personal',
      icon: Users,
      path: '/employees',
      subItems: [
        { name: 'Lista Personal', path: '/employees?v=list', icon: ClipboardList },
        { name: 'Nuevo Ingreso', path: '/employees?v=new', icon: UserPlus },
        { name: 'Distribución de Personal', path: '/employees?v=distribution', icon: BarChart3 },
      ]
    },
    {
      name: 'CONFIGURACIÓN',
      moduleName: 'Configuración',
      icon: Settings,
      path: '/users',
      subItems: [
        { name: 'Centro de Control', path: '/users', icon: UserCheck }
      ]
    }
  ];

  const visibleMenu = menuStructure.filter(item =>
    user.role === 'Administrador' || user.accessibleModules?.includes(item.moduleName) || false
  );

  return (
    <aside className="w-72 bg-white border-r border-slate-200 hidden md:flex flex-col shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-[#1e3a8a]">
        <Link to="/" className="flex items-center gap-3">
          <div className="bg-white/10 p-2.5 rounded-2xl shadow-lg">
            <Laptop className="text-white w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-black text-white tracking-tighter">ElectroTrack</span>
            <p className="text-[10px] font-bold text-blue-300 tracking-widest uppercase">Sistema SENAN</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1 bg-white">
        {visibleMenu.map((item) => {
          const Icon = item.icon;
          const isExpanded = expandedMenus[item.name];
          const hasActiveChild = item.subItems?.some(sub => location.pathname + location.search === sub.path);

          return (
            <div key={item.name} className="space-y-1 mb-2">
              <button
                onClick={() => toggleMenu(item.name)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200 group ${hasActiveChild
                  ? 'bg-blue-50 text-[#1e3a8a]'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${hasActiveChild ? 'text-[#1e3a8a]' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  <span className="font-black text-[11px] tracking-wider uppercase">{item.name}</span>
                </div>
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4 opacity-50" />}
              </button>

              {isExpanded && item.subItems && (
                <div className="ml-4 pl-4 border-l-2 border-slate-100 space-y-1">
                  {item.subItems.map((sub) => {
                    const isActive = location.pathname + location.search === sub.path;
                    return (
                      <Link
                        key={sub.name}
                        to={sub.path}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all ${isActive
                          ? 'bg-[#1e3a8a] text-white shadow-md'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                          }`}
                      >
                        {sub.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-4 bg-slate-50 border-t border-slate-100">
        <Link to="/profile" className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 transition-all">
          <div className="w-10 h-10 bg-[#1e3a8a] rounded-xl flex items-center justify-center text-white font-bold uppercase">
            {user.username[0]}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-black text-slate-800 truncate">{user.username}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{user.role}</p>
          </div>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
