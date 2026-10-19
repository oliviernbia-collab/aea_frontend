import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import useLiveRefresh from '../hooks/useLiveRefresh';
import { ROLE_LABELS } from '../constants/roles';

export default function GestionPermissions() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [roleActif, setRoleActif] = useState(null);

  const charger = useCallback(async () => {
    try {
      const { data } = await api.get('/permissions');
      setRoles(data.roles);
      setPermissions(data.permissions);
      setRoleActif((prev) => prev || data.roles.find((r) => r !== 'super_admin'));
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
      showToast(err.response?.data?.message || 'Erreur lors de la mise à jour du droit.', 'erreur');
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
      <div className="flex items-start gap-3">
        <button
          onClick={() => navigate(-1)}
          aria-label="Retour"
          title="Retour"
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
        >
          <i className="fa-solid fa-arrow-left" />
        </button>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gestion des permissions</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Le Super administrateur conserve toujours tous les droits, afin d'éviter de verrouiller l'application par erreur.
          </p>
        </div>
      </div>

      {/* Vue compacte (mobile/tablette) : un role a la fois, pour eviter de faire defiler
          horizontalement une matrice de 30+ colonnes sur un petit ecran. */}
      <div className="lg:hidden space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {rolesEditables.map((r) => (
            <button
              key={r}
              onClick={() => setRoleActif(r)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs whitespace-nowrap ${
                roleActif === r
                  ? 'bg-blue-800 border-blue-800 text-white'
                  : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300'
              }`}
            >
              {ROLE_LABELS[r] || r}
            </button>
          ))}
        </div>

        {modules.map((module) => (
          <div key={module} className="rounded-xl bg-white dark:bg-slate-800 p-4 shadow">
            <h2 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">{module}</h2>
            {permissions.filter((p) => p.module === module).map((p) => {
              const valeur = !!p.roles[roleActif];
              const cellId = `${p.key}:${roleActif}`;
              return (
                <div key={p.key} className="flex items-center justify-between gap-3 border-b border-slate-50 dark:border-slate-700/50 py-2 last:border-0">
                  <span className="text-sm text-slate-900 dark:text-white">{p.label}</span>
                  {saving === cellId ? (
                    <i className="fa-solid fa-circle-notch fa-spin text-slate-400 shrink-0" />
                  ) : (
                    <input
                      type="checkbox"
                      checked={valeur}
                      onChange={() => basculer(p.key, roleActif, valeur)}
                      className="h-5 w-5 shrink-0 accent-blue-800"
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Vue matrice complete (ecrans larges) : premiere colonne figee pour garder le libelle du
          droit visible pendant le defilement horizontal des (nombreux) roles. */}
      <div className="hidden lg:block space-y-6">
        {modules.map((module) => (
          <div key={module} className="rounded-xl bg-white dark:bg-slate-800 p-3 shadow overflow-x-auto">
            <h2 className="px-2 pt-1 pb-2 font-semibold text-slate-700 dark:text-slate-200">{module}</h2>
            <table className="text-sm">
              <thead>
                <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">
                  <th className="sticky left-0 z-10 bg-white dark:bg-slate-800 py-2 pr-4 whitespace-nowrap border-r border-slate-100 dark:border-slate-700">Droit</th>
                  {rolesEditables.map((r) => (
                    <th key={r} className="py-2 px-2 text-center whitespace-nowrap">{ROLE_LABELS[r] || r}</th>
                  ))}
                  <th className="py-2 px-2 text-center whitespace-nowrap text-slate-400">Super admin</th>
                </tr>
              </thead>
              <tbody>
                {permissions.filter((p) => p.module === module).map((p) => (
                  <tr key={p.key} className="border-b border-slate-50 dark:border-slate-700/50">
                    <td className="sticky left-0 z-10 bg-white dark:bg-slate-800 py-2 pr-4 whitespace-nowrap border-r border-slate-100 dark:border-slate-700">{p.label}</td>
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
    </div>
  );
}
