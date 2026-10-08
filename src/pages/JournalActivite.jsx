import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import useLiveRefresh from '../hooks/useLiveRefresh';

const TABLES = [
  { value: '', label: 'Toutes les tables' },
  { value: 'users', label: 'Membres' },
  { value: 'caisse_operations', label: 'Caisse' },
  { value: 'role_permissions', label: 'Permissions' },
];

const ACTIONS = [
  { value: '', label: 'Toutes les actions' },
  { value: 'creation', label: 'Creation' },
  { value: 'modification', label: 'Modification' },
  { value: 'validation', label: 'Validation' },
  { value: 'annulation', label: 'Annulation' },
];

const ACTION_BADGE = {
  creation: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  modification: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  validation: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  annulation: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

const TABLE_LABELS = { users: 'Membre', caisse_operations: 'Operation de caisse', cotisations: 'Cotisation', role_permissions: 'Permission' };

function resume(valeur) {
  if (!valeur) return null;
  try {
    const obj = typeof valeur === 'string' ? JSON.parse(valeur) : valeur;
    return Object.entries(obj)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
  } catch {
    return String(valeur);
  }
}

export default function JournalActivite() {
  const [entries, setEntries] = useState([]);
  const [table, setTable] = useState('');
  const [action, setAction] = useState('');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const LIMIT = 50;

  const charger = useCallback(async (nouvelOffset = 0) => {
    setLoading(true);
    try {
      const { data } = await api.get('/journal', {
        params: { table: table || undefined, action: action || undefined, limit: LIMIT, offset: nouvelOffset },
      });
      if (nouvelOffset === 0) setEntries(data);
      else setEntries((prev) => [...prev, ...data]);
      setHasMore(data.length === LIMIT);
      setOffset(nouvelOffset);
    } finally {
      setLoading(false);
    }
  }, [table, action]);

  useEffect(() => {
    charger(0);
  }, [charger]);

  useLiveRefresh(['journal:update'], () => charger(0));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Journal d'activite</h1>

      <div className="flex flex-wrap gap-2">
        <select value={table} onChange={(e) => setTable(e.target.value)} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-1.5 text-sm">
          {TABLES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select value={action} onChange={(e) => setAction(e.target.value)} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-1.5 text-sm">
          {ACTIONS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
        </select>
      </div>

      <div className="rounded-xl bg-white dark:bg-slate-800 p-3 shadow overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">
              <th className="py-2 pr-2">Date</th>
              <th className="py-2 pr-2">Auteur</th>
              <th className="py-2 pr-2">Action</th>
              <th className="py-2 pr-2">Concerne</th>
              <th className="py-2 pr-2">Detail</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 && !loading && (
              <tr><td colSpan={5} className="py-4 text-center text-sm text-slate-400">Aucune activite trouvee.</td></tr>
            )}
            {entries.map((e) => (
              <tr key={e.id} className="border-b border-slate-50 dark:border-slate-700/50 align-top">
                <td className="py-2 pr-2 whitespace-nowrap text-slate-500 dark:text-slate-400">{new Date(e.created_at).toLocaleString('fr-FR')}</td>
                <td className="py-2 pr-2 whitespace-nowrap">{e.auteur_prenom} {e.auteur_nom}<span className="block text-xs text-slate-400">{e.auteur_role}</span></td>
                <td className="py-2 pr-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ACTION_BADGE[e.action] || 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                    {e.action}
                  </span>
                </td>
                <td className="py-2 pr-2 whitespace-nowrap">{TABLE_LABELS[e.table_name] || e.table_name} #{e.record_id}</td>
                <td className="py-2 pr-2 text-xs text-slate-500 dark:text-slate-400">
                  {resume(e.nouvelle_valeur) || resume(e.ancienne_valeur) || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <button onClick={() => charger(offset + LIMIT)} disabled={loading} className="rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm disabled:opacity-60">
            {loading ? <i className="fa-solid fa-circle-notch fa-spin" /> : 'Charger plus'}
          </button>
        </div>
      )}
    </div>
  );
}
