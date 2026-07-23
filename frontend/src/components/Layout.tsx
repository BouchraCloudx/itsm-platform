import NotificationsBell from './NotificationsBell';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-semibold text-slate-900">ITSM Platform</span>
          <Link to="/" className="text-sm text-slate-600 hover:text-slate-900">Tickets</Link>
          {user?.role === 'ADMIN' && (
            <Link to="/teams" className="text-sm text-slate-600 hover:text-slate-900">Équipes</Link>
          )}
        </div>
        <div className="flex items-center gap-4">
          <NotificationsBell /> 
          <span className="text-sm text-slate-500">{user?.email} · {user?.role}</span>
          <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">
            Déconnexion
          </button>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
