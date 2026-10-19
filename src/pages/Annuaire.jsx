import { useEffect, useState } from 'react';
import api from '../services/api';
import useLiveRefresh from '../hooks/useLiveRefresh';

export default function Annuaire() {
  const [membres, setMembres] = useState([]);
  const [q, setQ] = useState('');

  const charger = async () => {
    const { data } = await api.get('/membres', { params: q ? { q } : {} });
    setMembres(data);
  };

  useEffect(() => {
    const timeout = setTimeout(charger, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  useLiveRefresh('membres:update', charger);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Annuaire des membres</h1>
      <div className="relative max-w-sm">
        <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher un membre..."
          className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent py-2 pl-9 pr-3 text-sm"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {membres.map((m) => (
          <div key={m.id} className="rounded-xl bg-white dark:bg-slate-800 p-4 shadow flex items-center gap-3">
            {m.photo ? (
              <img src={m.photo} alt={m.prenom} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <i className="fa-solid fa-circle-user text-4xl text-slate-300" />
            )}
            <div>
              <p className="font-medium text-sm">{m.prenom} {m.nom}</p>
              <p className="text-xs text-slate-400">{m.numero_membre}</p>
              {m.filiere && <p className="text-xs text-slate-400">{m.filiere} - {m.promotion}</p>}
            </div>
          </div>
        ))}
        {membres.length === 0 && <p className="text-sm text-slate-400">Aucun membre trouvé.</p>}
      </div>
    </div>
  );
}
