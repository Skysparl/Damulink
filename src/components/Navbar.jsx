import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${
      isActive ? 'text-crimson' : 'text-ink/70 hover:text-crimson'
    }`;

  async function handleLogout() {
    setSigningOut(true);
    try {
      await logout();
      setOpen(false);
      navigate('/');
    } finally {
      setSigningOut(false);
    }
  }

  const firstName = user?.name ? user.name.split(' ')[0] : '';

    return (
        <header className="sticky top-0 z-40 border-b border-ink/10 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-crimson text-lg font-bold text-white">
            D
          </span>
          <span className="text-lg font-bold tracking-tight text-ink">
            Damu<span className="text-crimson">Link</span>
          </span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <NavLink to="/" end className={linkClass}>
            Appeals
          </NavLink>
          <NavLink to="/create-appeal" className={linkClass}>
            Request blood
          </NavLink>
          {user && (
            <NavLink to="/dashboard" className={linkClass}>
              Dashboard
            </NavLink>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted">Hi, {firstName}</span>
              <button
                type="button"
                onClick={handleLogout}
                disabled={signingOut}
                className="btn btn-outline"
              >
                {signingOut ? 'Signing out...' : 'Sign out'}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="btn btn-outline">
                Sign in
              </Link>
              <Link to="/register" className="btn btn-primary">
                Join
              </Link>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="rounded-md border border-ink/15 p-2 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <span className="block h-0.5 w-5 bg-ink" />
          <span className="mt-1 block h-0.5 w-5 bg-ink" />
          <span className="mt-1 block h-0.5 w-5 bg-ink" />
        </button>
      </nav>

      {open && (
        <div className="border-t border-ink/10 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-3">
            <NavLink to="/" end className={linkClass} onClick={() => setOpen(false)}>
              Appeals
            </NavLink>
            <NavLink to="/create-appeal" className={linkClass} onClick={() => setOpen(false)}>
              Request blood
            </NavLink>
            {user && (
              <NavLink to="/dashboard" className={linkClass} onClick={() => setOpen(false)}>
                Dashboard
              </NavLink>
            )}

            {user ? (
              <button type="button" onClick={handleLogout} className="btn btn-outline w-full">
                Sign out ({firstName})
              </button>
            ) : (
              <div className="flex gap-3">
                <Link to="/login" className="btn btn-outline flex-1" onClick={() => setOpen(false)}>
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary flex-1"
                  onClick={() => setOpen(false)}
                >
                  Join
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}