import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import useLiveRefresh from '../hooks/useLiveRefresh';

const ROLE_LABELS = {
  membre: 'Membre',
  tresorier: 'Tresorier(ere)',
  secretaire_general: 'Secretaire General(e)',
  resp_communication: 'Resp. Communication',
  president: 'President(e)',
  super_admin: 'Super administrateur',
};

export default function GestionPermissions() {
  const { showToast } = useToast();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  const charger = useCallback(async () => {
    try {
      const { data } = await api.get('/permissions');
      setRoles(data.roles);
      setPermissions(data.permissions);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  useLiveRefresh(['permissions:update'], charger);

  const basculer = async (key, role, valeurActuelle) => {
    const cellId = `${key}:${role}`;
    setSaving(cellId);
    setPermissions((prev) =>
      prev.map((p) => (p.key === key ? { ...p, roles: { ...p.roles, [role]: !valeurActuelle } } : p))
    );
    try {
      await api.put('/permissions', { role, key, autorise: !valeurActuelle });
    } catch (err) {
      setPermissions((prev) =>
        prev.map((p) => (p.key === key ? { ...p, roles: { ...p.roles, [role]: valeurActuelle } } : p))
      );
      showToast(err.response?.data?.message || 'Erreur lors de la mise a jour du droit.', 'erreur');
    } finally {
      setSaving(null);
    }
  };

  const modules = [...new Set(permissions.map((p) => p.module))];
  const rolesEditables = roles.filter((r) => r !== 'super_admin');

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <i className="fa-solid fa-circle-notch fa-spin text-2xl text-blue-800 dark:text-blue-300" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gestion des permissions</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Le Super administrateur conserve toujours tous les droits, afin d'eviter de verrouiller l'application par erreur.
        </p>
      </div>

      {modules.map((module) => (
        <div key={module} className="rounded-xl bg-white dark:bg-slate-800 p-3 shadow overflow-x-auto">
          <h2 className="px-2 pt-1 pb-2 font-semibold text-slate-700 dark:text-slate-200">{module}</h2>
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">
                <th className="py-2 pr-2">Droit</th>
                {rolesEditables.map((r) => (
                  <th key={r} className="py-2 px-2 text-center whitespace-nowrap">{ROLE_LABELS[r] || r}</th>
                ))}
                <th className="py-2 px-2 text-center whitespace-nowrap text-slate-400">Super admin</th>
              </tr>
            </thead>
            <tbody>
              {permissions.filter((p) => p.module === module).map((p) => (
                <tr key={p.key} className="border-b border-slate-50 dark:border-slate-700/50">
                  <td className="py-2 pr-2">{p.label}</td>
                  {rolesEditables.map((r) => {
                    const valeur = !!p.roles[r];
                    const cellId = `${p.key}:${r}`;
                    return (
                      <td key={r} className="py-2 px-2 text-center">
                        <input
                          type="checkbox"
                          checked={valeur}
                          disabled={saving === cellId}
                          onChange={() => basculer(p.key, r, valeur)}
                          className="h-4 w-4 accent-blue-800 disabled:opacity-50"
                        />
                      </td>
                    );
                  })}
                  <td className="py-2 px-2 text-center">
                    <input type="checkbox" checked disabled className="h-4 w-4 accent-slate-400 opacity-60" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
