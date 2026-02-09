
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import EquipmentPage from './pages/Equipment';
import LoansPage from './pages/Loans';
import ReturnsPage from './pages/Returns';
import Profile from './pages/Profile';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ChipsInventory from './pages/ChipsInventory';
import { storage } from './services/storage';
import { User } from './types';

// Componente para proteger rutas basándose en accessibleModules
const ModuleGuard: React.FC<{ user: User, module: string, children: React.ReactNode }> = ({ user, module, children }) => {
  const hasAccess = user.accessibleModules.includes(module) || user.role === 'Administrador';

  if (!hasAccess) {
    console.warn(`Acceso Denegado al módulo: ${module}`);
    return <Navigate to="/" state={{ error: "Acceso Denegado: No cuenta con permisos para este módulo." }} />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    storage.init();
    const currentUser = storage.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const handleLogout = () => {
    storage.setCurrentUser(null);
    setUser(null);
  };

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login onLogin={setUser} />} />

        {/* Rutas Protegidas */}
        <Route
          path="/*"
          element={
            user ? (
              <div className="flex h-screen bg-slate-50">
                <Sidebar user={user} />
                <div className="flex-1 flex flex-col overflow-hidden">
                  <Navbar user={user} onLogout={handleLogout} />
                  <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />

                      <Route path="/employees" element={
                        <ModuleGuard user={user} module="Personal">
                          <Employees />
                        </ModuleGuard>
                      } />

                      <Route path="/equipment" element={
                        <ModuleGuard user={user} module="Inventario">
                          <EquipmentPage />
                        </ModuleGuard>
                      } />

                      <Route path="/chips" element={
                        <ModuleGuard user={user} module="Inventario">
                          <ChipsInventory />
                        </ModuleGuard>
                      } />

                      <Route path="/loans" element={
                        <ModuleGuard user={user} module="Préstamos">
                          <LoansPage user={user} />
                        </ModuleGuard>
                      } />

                      <Route path="/returns" element={
                        <ModuleGuard user={user} module="Devoluciones">
                          <ReturnsPage />
                        </ModuleGuard>
                      } />

                      <Route path="/users" element={
                        <ModuleGuard user={user} module="Configuración">
                          <Register />
                        </ModuleGuard>
                      } />

                      <Route path="/profile" element={<Profile user={user} onUpdate={setUser} />} />
                      <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                  </main>
                </div>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
