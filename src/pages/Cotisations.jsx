import { useEffect, useState } from 'react';
import api from '../services/api';
import useLiveRefresh from '../hooks/useLiveRefresh';
import { GROUPES_ROLES } from '../constants/roles';

const MOIS_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

const STATUT_CLASS = {
  paye: 'badge-paye',
  partiel: 'badge-partiel',
  non_paye: 'badge-non-paye',
  non_du: 'badge-non-du',
};

function formatFCFA(n) {
  return new Intl.NumberFormat('fr-FR').format(Math.round(Number(n) || 0));
}

export default function Cotisations() {
  const [annee, setAnnee] = useState(new Date().getFullYear());
  const [membres, setMembres] = useState([]);
  const [taux, setTaux] = useState(null);
  const [filtres, setFiltres] = useState({ role: '', filiere: '' });

  const charger = async () => {
    const params = { annee, ...filtres };
    const [t, r] = await Promise.all([
      api.get('/cotisations/taux-recouvrement', { params: { annee } }),
      api.get('/cotisations/tableau', { params }),
    ]);
    setTaux(t.data);
    setMembres(r.data);
  };

  useEffect(() => {
    charger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [annee]);

  useLiveRefresh('cotisations:update', charger);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cotisations {annee}</h1>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={annee}
            onChange={(e) => setAnnee(Number(e.target.value))}
            className="w-24 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-2 py-1 text-sm"
          />
          {taux && (
            <span className="text-sm font-medium rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1">
              Taux de recouvrement (mois courant) : {taux.taux}% ({taux.ajour}/{taux.total})
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={filtres.role}
          onChange={(e) => setFiltres((f) => ({ ...f, role: e.target.value }))}
          className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-1.5 text-sm"
        >
          <option value="">Filtrer par rôle (tous)</option>
          {GROUPES_ROLES.map((g) => (
            <optgroup key={g.label} label={g.label}>
              {g.roles.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </optgroup>
          ))}
        </select>
        <input
          placeholder="Filtrer par filière"
          value={filtres.filiere}
          onChange={(e) => setFiltres((f) => ({ ...f, filiere: e.target.value }))}
          className="rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-1.5 text-sm"
        />
        <button onClick={charger} className="rounded-lg bg-blue-800 text-white px-4 py-1.5 text-sm">
          <i className="fa-solid fa-filter mr-1" /> Filtrer
        </button>
      </div>

      <div className="flex flex-wrap gap-3 text-xs">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full badge-paye inline-block" /> Payé</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full badge-partiel inline-block" /> Partiel</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full badge-non-paye inline-block" /> Non payé</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full badge-non-du inline-block" /> Non dû</span>
      </div>

      <div className="rounded-xl bg-white dark:bg-slate-800 p-3 shadow overflow-x-auto">
        <table className="w-full text-xs sm:text-sm min-w-[900px]">
          <thead>
            <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">
              <th className="py-2 pr-2 sticky left-0 bg-white dark:bg-slate-800">Membre</th>
              {MOIS_LABELS.map((m) => (
                <th key={m} className="py-2 px-1 text-center">{m}</th>
              ))}
              <th className="py-2 pl-2">Total payé</th>
              <th className="py-2 pl-2">Retard</th>
            </tr>
          </thead>
          <tbody>
            {membres.map((m) => (
              <tr key={m.membre_id} className="border-b border-slate-50 dark:border-slate-700/50">
                <td className="py-2 pr-2 sticky left-0 bg-white dark:bg-slate-800 whitespace-nowrap">
                  <p className="font-medium">{m.prenom} {m.nom}</p>
                  <p className="text-slate-400">{m.numero_membre}</p>
                </td>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((mois) => {
                  const c = m.mois[mois];
                  return (
                    <td key={mois} className="py-2 px-1 text-center">
                      <span className={`inline-block w-6 h-6 rounded ${STATUT_CLASS[c?.statut] || 'badge-non-du'}`} title={c?.statut} />
                    </td>
                  );
                })}
                <td className="py-2 pl-2 font-medium whitespace-nowrap">{formatFCFA(m.totalPaye)} FCFA</td>
                <td className="py-2 pl-2">
                  {m.moisEnRetard > 0 ? (
                    <span className="text-red-600 font-medium">{m.moisEnRetard} mois</span>
                  ) : (
                    <span className="text-green-600">à jour</span>
                  )}
                </td>
              </tr>
            ))}
            {membres.length === 0 && (
              <tr><td colSpan={15} className="py-6 text-center text-slate-400">Aucune donnée pour cette année.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
