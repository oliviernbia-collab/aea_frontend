import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { getSocket } from '../services/socket';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [nonLues, setNonLues] = useState(0);
  const ref = useRef(null);

  const charger = async () => {
    const { data } = await api.get('/notifications');
    setNotifications(data);
    setNonLues(data.filter((n) => !n.lu).length);
  };

  useEffect(() => {
    charger();
    const socket = getSocket();
    const onNotif = (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      setNonLues((n) => n + 1);
    };
    socket?.on('notification', onNotif);

    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);

    return () => {
      socket?.off('notification', onNotif);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, []);

  const toutLire = async () => {
    await api.patch('/notifications/tout-lire');
    setNotifications((prev) => prev.map((n) => ({ ...n, lu: true })));
    setNonLues(0);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-full p-2 hover:bg-white/10 md:hover:bg-slate-100 md:dark:hover:bg-slate-800"
        aria-label="Notifications"
      >
        <i className="fa-solid fa-bell text-lg" />
        {nonLues > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
            {nonLues > 9 ? '9+' : nonLues}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] rounded-lg bg-white shadow-xl ring-1 ring-black/5 dark:bg-slate-800 z-50">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2 dark:border-slate-700">
            <p className="font-semibold text-sm">Notifications</p>
            <button onClick={toutLire} className="text-xs text-blue-700 hover:underline dark:text-blue-300">
              Tout marquer lu
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-slate-400">Aucune notification.</p>
            )}
            {notifications.map((n) => (
              <Link
                key={n.id}
                to={n.lien || '#'}
                onClick={() => setOpen(false)}
                className={`block px-4 py-3 text-sm border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 ${
                  !n.lu ? 'bg-blue-50 dark:bg-slate-700/50' : ''
                }`}
              >
                <p className="font-medium">{n.titre}</p>
                {n.contenu && <p className="text-slate-500 dark:text-slate-400 line-clamp-2">{n.contenu}</p>}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
