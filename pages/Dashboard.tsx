
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { geminiService } from '../services/gemini';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  Users, Laptop, ArrowUpRight, Sparkles, TrendingUp, PackageCheck,
  DollarSign, Activity, AlertTriangle, Wrench, Clock, Trophy, ChevronRight
} from 'lucide-react';

import { Equipment, Loan } from '../types';

const Dashboard: React.FC = () => {
  const [insight, setInsight] = useState<string>('Cargando análisis de IA...');
  const [loading, setLoading] = useState(true);

  // Statistics state
  const [overview, setOverview] = useState<any>(null);
  const [loansByMonth, setLoansByMonth] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [topEquipment, setTopEquipment] = useState<any[]>([]);
  const [topEmployees, setTopEmployees] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any>(null);
  const [recentLoans, setRecentLoans] = useState<Loan[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [
        overviewData,
        loansMonthData,
        categoryDistribution,
        topEq,
        topEmp,
        alertsData,
        loans,
        equipment
      ] = await Promise.all([
        api.getStatsOverview(),
        api.getLoansByMonth(),
        api.getEquipmentByCategory(),
        api.getTopEquipment(),
        api.getTopEmployees(),
        api.getAlerts(),
        api.getLoans(),
        api.getEquipment()
      ]);

      setOverview(overviewData);
      setLoansByMonth(loansMonthData);
      setCategoryData(categoryDistribution);
      setTopEquipment(topEq);
      setTopEmployees(topEmp);
      setAlerts(alertsData);
      setRecentLoans(loans.slice(-10).reverse());

      // Load AI insight
      if (equipment.length > 0) {
        const text = await geminiService.getInventoryInsights(equipment, loans);
        setInsight(text || '');
      } else {
        setInsight("Aún no hay suficientes datos para generar un análisis detallado.");
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setInsight("Error cargando datos.");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !overview) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Activity className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const stats = [
    {
      label: 'Total Equipos',
      value: overview.totalEquipment,
      subValue: `$${overview.totalValue.toLocaleString()}`,
      icon: Laptop,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      trend: '+0%'
    },
    {
      label: 'Préstamos Activos',
      value: overview.activeLoans,
      subValue: `${overview.loansChangePercent >= 0 ? '+' : ''}${overview.loansChangePercent}% vs semana anterior`,
      icon: ArrowUpRight,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
      trend: `${overview.loansChangePercent >= 0 ? '+' : ''}${overview.loansChangePercent}%`
    },
    {
      label: 'Personal Activo',
      value: overview.activeEmployees,
      subValue: `${overview.utilizationRate}% tasa de utilización`,
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      trend: `${overview.utilizationRate}%`
    },
    {
      label: 'Disponibles',
      value: overview.availableCount,
      subValue: `${overview.availablePercent}% del inventario`,
      icon: PackageCheck,
      color: 'text-amber-600',
      bg: 'bg-amber-100',
      trend: `${overview.availablePercent}%`
    },
  ];

  const totalAlerts = (alerts?.maintenanceDue?.length || 0) +
    (alerts?.overdueLoans?.length || 0) +
    (alerts?.damagedEquipment?.length || 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Vista General</h2>
          <p className="text-slate-500 font-medium">Panel de control de recursos electrónicos</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isPositive = parseFloat(stat.trend) >= 0;
          return (
            <div key={stat.label} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}>
                  <Icon className="w-6 h-6" />
                </div>
                {stat.label === 'Préstamos Activos' && (
                  <div className={`text-xs font-bold flex items-center gap-1 px-2 py-1 rounded-full ${isPositive ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                    <TrendingUp className={`w-3 h-3 ${!isPositive && 'rotate-180'}`} />
                    {stat.trend}
                  </div>
                )}
              </div>
              <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</p>
              <p className="text-xs text-slate-400 mt-2 font-medium">{stat.subValue}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Loans by Month */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Préstamos por Mes
          </h3>
          {loansByMonth.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={loansByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-400 text-center py-16">No hay datos de préstamos en los últimos 6 meses</p>
          )}
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-emerald-600" />
            Distribución por Categoría
          </h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percentage }) => `${category} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-400 text-center py-16">No hay equipos registrados</p>
          )}
        </div>
      </div>

      {/* Rankings and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Equipment */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Top 5 Equipos Más Prestados
          </h3>
          {topEquipment.length > 0 ? (
            <div className="space-y-4">
              {topEquipment.map((eq, index) => {
                const maxCount = topEquipment[0]?.loanCount || 1;
                const percentage = (eq.loanCount / maxCount) * 100;
                return (
                  <div key={eq.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-amber-100 text-amber-600' :
                            index === 1 ? 'bg-slate-200 text-slate-600' :
                              index === 2 ? 'bg-orange-100 text-orange-600' :
                                'bg-slate-100 text-slate-500'
                          }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{eq.name}</p>
                          <p className="text-xs text-slate-500">{eq.category}</p>
                        </div>
                      </div>
                      <span className="text-sm font-black text-blue-600">{eq.loanCount} veces</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-400 text-center py-8">No hay datos de préstamos</p>
          )}
        </div>

        {/* Alerts Panel */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Alertas y Notificaciones
            {totalAlerts > 0 && (
              <span className="ml-auto bg-red-100 text-red-600 text-xs font-black px-3 py-1 rounded-full">
                {totalAlerts}
              </span>
            )}
          </h3>
          <div className="space-y-4">
            {alerts?.maintenanceDue?.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <Wrench className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-amber-900">Mantenimiento Requerido</p>
                    <p className="text-xs text-amber-700 mt-1">
                      {alerts.maintenanceDue.length} equipo(s) requieren mantenimiento preventivo
                    </p>
                    <div className="mt-2 space-y-1">
                      {alerts.maintenanceDue.slice(0, 3).map((item: any) => (
                        <p key={item.id} className="text-xs text-amber-600">• {item.name}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {alerts?.overdueLoans?.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-red-900">Préstamos Próximos a Vencer</p>
                    <p className="text-xs text-red-700 mt-1">
                      {alerts.overdueLoans.length} préstamo(s) con más de 25 días activos
                    </p>
                    <div className="mt-2 space-y-1">
                      {alerts.overdueLoans.slice(0, 3).map((item: any) => (
                        <p key={item.id} className="text-xs text-red-600">• {item.employeeName} ({item.daysActive} días)</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {alerts?.damagedEquipment?.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-orange-900">Equipos Dañados</p>
                    <p className="text-xs text-orange-700 mt-1">
                      {alerts.damagedEquipment.length} equipo(s) requieren reparación
                    </p>
                  </div>
                </div>
              </div>
            )}

            {totalAlerts === 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
                <PackageCheck className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-emerald-900">¡Todo en orden!</p>
                <p className="text-xs text-emerald-700 mt-1">No hay alertas pendientes</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Insight + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* AI Insight */}
        <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
          <Sparkles className="absolute top-8 right-8 w-16 h-16 text-white/10" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-blue-200" />
              <span className="text-sm font-bold tracking-widest uppercase text-blue-100">AI Inventory Insight</span>
            </div>
            <div className="text-lg font-medium leading-relaxed opacity-95 whitespace-pre-line">
              {insight}
            </div>
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            Actividad Reciente
          </h3>
          <div className="space-y-4">
            {recentLoans.length > 0 ? (
              recentLoans.slice(0, 5).map((loan) => {
                const date = new Date(loan.loanDate);
                const isToday = date.toDateString() === new Date().toDateString();
                const timeStr = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                const dateStr = isToday ? 'Hoy' : date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });

                return (
                  <div key={loan.id} className="flex items-start gap-3 pb-4 border-b border-slate-100 last:border-0">
                    <div className={`w-2 h-2 rounded-full mt-2 ${loan.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 font-medium">{dateStr}, {timeStr}</p>
                      <p className="text-sm text-slate-800 font-medium mt-0.5 truncate">
                        {loan.status === 'active' ? 'Préstamo registrado' : 'Devolución completada'}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-slate-400 text-center py-8 text-sm">No hay actividad reciente</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
