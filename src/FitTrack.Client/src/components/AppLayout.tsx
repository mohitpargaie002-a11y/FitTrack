import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AppLayout() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-4 py-3
        flex items-center justify-between sticky top-0 z-10">
        <span className="font-medium text-gray-900 text-sm">FitTrack</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">{user?.name}</span>
          <button onClick={signOut}
            className="text-xs text-red-400 hover:text-red-600 transition-colors">
            Sign out
          </button>
        </div>
      </div>

      {/* Page content */}
      <div className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100
        flex z-10">
        {[
          { to: '/', label: 'Calendar', icon: '📅' },
          { to: '/dashboard', label: 'Dashboard', icon: '📊' },
        ].map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-3 text-xs transition-colors
              ${isActive ? 'text-violet-600' : 'text-gray-400 hover:text-gray-600'}`
            }
          >
            <span className="text-lg leading-none mb-1">{icon}</span>
            {label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}