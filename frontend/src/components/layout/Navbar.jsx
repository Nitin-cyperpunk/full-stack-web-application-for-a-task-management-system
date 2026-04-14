import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

function NavItem({ to, end, children }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          'relative rounded-lg px-3 py-2 text-[13px] font-medium tracking-wide transition-colors',
          isActive
            ? 'bg-white/70 text-stone-900 shadow-sm ring-1 ring-stone-200/80'
            : 'text-stone-600 hover:bg-white/40 hover:text-stone-900',
        ].join(' ')
      }
    >
      {children}
    </NavLink>
  );
}

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 px-3 pt-4 sm:px-5">
      {/* max-w-6xl ≈ comfortable “xl” reading width; rounded + glass */}
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/50 bg-white/55 px-3 py-2.5 shadow-glass-lg backdrop-blur-xl backdrop-saturate-150 sm:gap-4 sm:px-5 sm:py-3">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-5">
          <Link
            to="/"
            className="group flex shrink-0 items-baseline gap-1.5 no-underline"
            title="Home"
          >
            <span className="font-display text-[1.15rem] font-semibold tracking-tight text-stone-900 sm:text-xl">
              Tasks
            </span>
            <span className="hidden text-[11px] font-normal uppercase tracking-[0.12em] text-stone-500 sm:inline">
              board
            </span>
          </Link>

          <span className="hidden h-6 w-px bg-stone-300/80 sm:block" aria-hidden />

          <nav className="flex flex-wrap items-center gap-1 sm:gap-0.5" aria-label="Main">
            <NavItem to="/" end>
              Overview
            </NavItem>
            <NavItem to="/tasks/new">New</NavItem>
          </nav>
        </div>

        <div className="flex w-full min-w-0 items-center justify-between gap-3 sm:w-auto sm:justify-end">
          <div className="min-w-0 flex-1 text-right sm:max-w-[14rem] sm:flex-initial sm:text-left">
            <p className="truncate text-[12px] leading-tight text-stone-600" title={user?.email}>
              {user?.email}
            </p>
            {user?.role === 'admin' && (
              <p className="mt-0.5 text-[11px] text-amber-800/90">admin access</p>
            )}
          </div>
          <Button
            type="button"
            variant="secondary"
            className="!shrink-0 !rounded-lg !border-stone-200/90 !bg-white/80 !py-1.5 !text-[13px] !shadow-sm hover:!bg-white"
            onClick={logout}
          >
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
