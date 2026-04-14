import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

const linkClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium ${isActive ? 'bg-indigo-100 text-indigo-800' : 'text-slate-600 hover:bg-slate-100'}`;

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="text-lg font-semibold text-slate-900">
          Tasks
        </Link>
        <nav className="flex flex-wrap items-center gap-1">
          <NavLink to="/" end className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/tasks/new" className={linkClass}>
            New task
          </NavLink>
        </nav>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-slate-600 sm:inline">
            {user?.email}
            {user?.role === 'admin' && (
              <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-900">admin</span>
            )}
          </span>
          <Button type="button" variant="secondary" className="!py-1.5 !text-sm" onClick={logout}>
            Log out
          </Button>
        </div>
      </div>
    </header>
  );
}
