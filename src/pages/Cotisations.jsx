import { useEffect, useState } from 'react';
import api from '../services/api';
import useLiveRefresh from '../hooks/useLiveRefresh';
import { GROUPES_ROLES } from '../constants/roles';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { STATUT_VALIDATION_LABELS } from '../constants/statuts';

const MOIS_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
const MOIS_LABELS_LONGS = ['Adhésion', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const MODE_LABELS = { especes: 'Espèces', orange_money: 'Orange Money', mtn_momo: 'MTN MoMo', moov_money: 'Moov Money', wave: 'Wave' };

function formatMoisCouverts(mois_couverts) {
  const liste = typeof mois_couverts === 'string' ? JSON.parse(mois_couverts) : mois_couverts;
  return (liste || []).map((m) => MOIS_LABELS_LONGS[m.mois]).join(', ');
}

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
  const { hasPermission } = useAuth();
  const { showToast } = useToast();
  const [annee, setAnnee] = useState(new Date().getFullYear());
  const [membres, setMembres] = useState([]);
  const [taux, setTaux] = useState(null);
  const [filtres, setFiltres] = useState({ role: '', filiere: '' });
  const [historique, setHistorique] = useState(null); // { membre, paiements, chargement }
  const [annulationEnCours, setAnnulationEnCours] = useState(null);

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

  const ouvrirHistorique = async (membre) => {
    setHistorique({ membre, paiements: [], chargement: true });
    try {
      const { data } = await api.get(`/cotisations/membres/${membre.membre_id}/paiements`);
      setHistorique({ membre, paiements: data, chargement: false });
    } catch (err) {
      showToast(err.response?.data?.message || "Erreur lors du chargement de l'historique.", 'erreur');
      setHistorique(null);
    }
  };

  const annulerPaiement = async (paiementId) => {
    if (!window.confirm('Annuler ce paiement ? La caisse et les cotisations seront recalculées.')) return;
    setAnnulationEnCours(paiementId);
    try {
      await api.delete(`/cotisations/paiements/${paiementId}`);
      showToast('Paiement annulé.', 'succes');
      const { data } = await api.get(`/cotisations/membres/${historique.membre.membre_id}/paiements`);
      setHistorique((h) => ({ ...h, paiements: data }));
      charger();
    } catch (err) {
      showToast(err.response?.data?.message || "Erreur lors de l'annulation.", 'erreur');
    } finally {
      setAnnulationEnCours(null);
    }
  };

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
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="font-medium">{m.prenom} {m.nom}</p>
                      <p className="text-slate-400">{m.numero_membre}</p>
                    </div>
                    {hasPermission('cotisations.saisir_paiement') && (
                      <button
                        onClick={() => ouvrirHistorique(m)}
                        title="Voir l'historique des paiements"
                        className="text-slate-400 hover:text-blue-700 dark:hover:text-blue-300"
                      >
                        <i className="fa-solid fa-clock-rotate-left" />
                      </button>
                    )}
                  </div>
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

      {historique && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-xl bg-white dark:bg-slate-800 p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                Historique des paiements — {historique.membre.prenom} {historique.membre.nom}
              </h3>
              <button onClick={() => setHistorique(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {historique.chargement && <p className="text-sm text-slate-400">Chargement...</p>}

            {!historique.chargement && historique.paiements.length === 0 && (
              <p className="text-sm text-slate-400">Aucun paiement enregistré.</p>
            )}

            {!historique.chargement && historique.paiements.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">
                      <th className="py-2 pr-2">Date</th>
                      <th className="py-2 pr-2">Montant</th>
                      <th className="py-2 pr-2">Mode</th>
                      <th className="py-2 pr-2">Mois couverts</th>
                      <th className="py-2 pr-2">Statut</th>
                      {hasPermission('cotisations.annuler_paiement') && <th className="py-2 pl-2" />}
                    </tr>
                  </thead>
                  <tbody>
                    {historique.paiements.map((p) => (
                      <tr key={p.id} className="border-b border-slate-50 dark:border-slate-700/50">
                        <td className="py-2 pr-2 whitespace-nowrap">{new Date(p.date_paiement).toLocaleDateString('fr-FR')}</td>
                        <td className="py-2 pr-2 font-medium whitespace-nowrap">{formatFCFA(p.montant)} FCFA</td>
                        <td className="py-2 pr-2">{MODE_LABELS[p.mode_paiement] || p.mode_paiement}</td>
                        <td className="py-2 pr-2">{formatMoisCouverts(p.mois_couverts)}</td>
                        <td className="py-2 pr-2">{STATUT_VALIDATION_LABELS[p.statut_validation] || p.statut_validation}</td>
                        {hasPermission('cotisations.annuler_paiement') && (
                          <td className="py-2 pl-2 text-right">
                            {p.statut_validation !== 'annulee' && (
                              <button
                                onClick={() => annulerPaiement(p.id)}
                                disabled={annulationEnCours === p.id}
                                className="text-red-600 hover:text-red-700 disabled:opacity-60 text-xs"
                              >
                                {annulationEnCours === p.id ? <i className="fa-solid fa-circle-notch fa-spin" /> : 'Annuler'}
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
