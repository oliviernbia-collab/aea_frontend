import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import NotificationBell from './NotificationBell';

const NAV_ITEMS = [
  { to: '/accueil', label: 'Accueil', icon: 'fa-house', permission: null },
  { to: '/caisse', label: 'Caisse', icon: 'fa-wallet', permission: null },
  { to: '/cotisations', label: 'Cotisations', icon: 'fa-table-list', permission: null },
  { to: '/cotisations/ma-fiche', label: 'Ma cotisation', icon: 'fa-user-check', permission: null },
  { to: '/actualites', label: 'Actualités', icon: 'fa-newspaper', permission: null },
  { to: '/messagerie', label: 'Messagerie', icon: 'fa-comments', permission: null },
  { to: '/annuaire', label: 'Annuaire', icon: 'fa-address-book', permission: null },
  { to: '/saisie-financiere', label: 'Saisie financière', icon: 'fa-file-invoice-dollar', permission: 'saisie_financiere.acceder' },
  { to: '/administration', label: 'Administration', icon: 'fa-gear', permission: 'administration.acceder' },
  { to: '/journal-activite', label: "Journal d'activité", icon: 'fa-clock-rotate-left', permission: 'journal.consulter' },
  { to: '/gestion-permissions', label: 'Gestion des permissions', icon: 'fa-user-shield', permission: 'permissions.gerer' },
  { to: '/cartes', label: 'Cartes', icon: 'fa-id-card', permission: 'cartes.generer' },
];

export default function Layout() {
  const { user, logout, isBureau, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem('aea_theme') === 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('aea_theme', dark ? 'dark' : 'light');
  }, [dark]);

  const items = NAV_ITEMS.filter(
    (item) => !item.permission || user?.role === 'super_admin' || hasPermission(item.permission)
  );

  const handleLogout = () => {
    logout();
    navigate('/connexion');
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex md:w-60 md:flex-col md:sticky md:top-0 md:h-screen md:overflow-y-auto bg-blue-900 text-white">
        <div className="px-4 py-5">
          <Logo />
        </div>
        <div className="px-2 pb-2">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-lg border border-white/20 px-3 py-2 text-sm text-blue-100 hover:bg-white/10 hover:text-white transition"
          >
            <i className="fa-solid fa-globe w-4 text-center" />
            Page d'accueil du site
          </Link>
        </div>
        <nav className="flex-1 space-y-1 px-2">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/accueil'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                  isActive ? 'bg-white/15 font-semibold' : 'text-blue-100 hover:bg-white/10'
                }`
              }
            >
              <i className={`fa-solid ${item.icon} w-4 text-center`} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="m-2 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-300 hover:bg-red-500/20 hover:text-red-200"
        >
          <i className="fa-solid fa-right-from-bracket w-4 text-center" />
          Déconnexion
        </button>
      </aside>

      {/* Topbar mobile + desktop */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between bg-blue-900 px-3 py-3 text-white md:bg-white md:text-slate-900 md:border-b md:border-slate-200 md:dark:bg-slate-900 md:dark:text-slate-100 md:dark:border-slate-700">
          <button className="md:hidden p-2" onClick={() => setMenuOpen(true)} aria-label="Ouvrir le menu">
            <i className="fa-solid fa-bars text-lg" />
          </button>
          <div className="md:hidden">
            <Logo size={32} />
          </div>
          <div className="hidden md:block font-semibold">
            {isBureau ? 'Espace Bureau' : 'Espace Membre'} - {user?.prenom} {user?.nom}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setDark((d) => !d)}
              className="rounded-full p-2 hover:bg-white/10 md:hover:bg-slate-100 md:dark:hover:bg-slate-800"
              aria-label="Basculer le thème"
            >
              <i className={`fa-solid ${dark ? 'fa-sun' : 'fa-moon'}`} />
            </button>
            <NotificationBell />
            <NavLink to="/mon-profil" className="ml-1 rounded-full p-2 hover:bg-white/10 md:hover:bg-slate-100 md:dark:hover:bg-slate-800">
              <i className="fa-solid fa-circle-user text-lg" />
            </NavLink>
          </div>
        </header>

        <main className="flex-1 min-w-0 bg-slate-50 dark:bg-slate-900 p-3 md:p-6">
          <Outlet />
        </main>
      </div>

      {/* Sidebar mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-blue-900 text-white flex flex-col">
            <div className="flex items-center justify-between px-4 py-5">
              <Logo />
              <button onClick={() => setMenuOpen(false)} aria-label="Fermer">
                <i className="fa-solid fa-xmark text-lg" />
              </button>
            </div>
            <div className="px-2 pb-2">
              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-lg border border-white/20 px-3 py-2 text-sm text-blue-100 hover:bg-white/10 hover:text-white transition"
              >
                <i className="fa-solid fa-globe w-4 text-center" />
                Page d'accueil du site
              </Link>
            </div>
            <nav className="flex-1 space-y-1 px-2">
              {items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/accueil'}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                      isActive ? 'bg-white/15 font-semibold' : 'text-blue-100 hover:bg-white/10'
                    }`
                  }
                >
                  <i className={`fa-solid ${item.icon} w-4 text-center`} />
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <button
              onClick={handleLogout}
              className="m-2 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-300 hover:bg-red-500/20 hover:text-red-200"
            >
              <i className="fa-solid fa-right-from-bracket w-4 text-center" />
              Déconnexion
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}
