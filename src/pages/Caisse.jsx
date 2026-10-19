import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import useLiveRefresh from '../hooks/useLiveRefresh';
import { FONDS_LABELS } from '../constants/statuts';

function formatFCFA(n) {
  return new Intl.NumberFormat('fr-FR').format(Math.round(Number(n) || 0)) + ' FCFA';
}

const CATEGORIE_ICON = { entree: 'fa-arrow-down text-green-600', sortie: 'fa-arrow-up text-red-600' };

export default function Caisse() {
  const { showToast } = useToast();
  const [solde, setSolde] = useState(null);
  const [moisCourant, setMoisCourant] = useState(null);
  const [evolution, setEvolution] = useState([]);
  const [operations, setOperations] = useState([]);
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [signalement, setSignalement] = useState({ show: false, operationId: null, message: '' });

  const chargerOperations = async () => {
    const params = {};
    if (dateDebut) params.date_debut = dateDebut;
    if (dateFin) params.date_fin = dateFin;
    const { data } = await api.get('/caisse/operations', { params });
    setOperations(data);
  };

  const charger = async () => {
    const [s, m, e] = await Promise.all([
      api.get('/caisse/solde'),
      api.get('/caisse/mois-courant'),
      api.get('/caisse/evolution'),
    ]);
    setSolde(s.data);
    setMoisCourant(m.data);
    setEvolution(e.data);
  };

  useEffect(() => {
    charger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    chargerOperations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateDebut, dateFin]);

  const rafraichirTout = () => {
    charger();
    chargerOperations();
  };

  useLiveRefresh('caisse:update', rafraichirTout);

  const envoyerSignalement = async () => {
    if (!signalement.message.trim()) return;
    try {
      await api.post('/caisse/signalements', { operation_id: signalement.operationId, message: signalement.message });
      setSignalement({ show: false, operationId: null, message: '' });
      showToast('Signalement transmis au bureau.', 'succes');
    } catch (err) {
      showToast(err.response?.data?.message || "Erreur lors de l'envoi du signalement.", 'erreur');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Caisse de l'association</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-blue-800 text-white p-5 shadow">
          <p className="text-sm opacity-90">Solde total</p>
          <p className="text-2xl font-bold mt-1">{solde ? formatFCFA(solde.solde) : '...'}</p>
        </div>
        <div className="rounded-xl bg-white dark:bg-slate-800 p-5 shadow">
          <p className="text-sm text-slate-500 dark:text-slate-400">Entrées ce mois</p>
          <p className="text-xl font-bold mt-1 text-green-600">{moisCourant ? formatFCFA(moisCourant.entrees) : '...'}</p>
        </div>
        <div className="rounded-xl bg-white dark:bg-slate-800 p-5 shadow">
          <p className="text-sm text-slate-500 dark:text-slate-400">Sorties ce mois</p>
          <p className="text-xl font-bold mt-1 text-red-600">{moisCourant ? formatFCFA(moisCourant.sorties) : '...'}</p>
        </div>
      </div>

      {solde?.parFonds?.length > 0 && (
        <div className="rounded-xl bg-white dark:bg-slate-800 p-5 shadow">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-3">Répartition par fonds</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {solde.parFonds.map((f) => (
              <div key={f.fonds} className="rounded-lg bg-slate-50 dark:bg-slate-700 p-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">{FONDS_LABELS[f.fonds] || f.fonds}</p>
                <p className="font-semibold">{formatFCFA(f.solde)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl bg-white dark:bg-slate-800 p-5 shadow">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-3">Évolution du solde (12 mois)</h2>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <LineChart data={evolution}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
              <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={70} />
              <Tooltip formatter={(v) => formatFCFA(v)} />
              <Line type="monotone" dataKey="solde" stroke="#1e3a8a" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl bg-white dark:bg-slate-800 p-5 shadow">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h2 className="font-semibold text-slate-900 dark:text-white">Dernières opérations</h2>
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs text-slate-500 dark:text-slate-400">Du</label>
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              max={dateFin || undefined}
              className="rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-2 py-1 text-sm"
            />
            <label className="text-xs text-slate-500 dark:text-slate-400">Au</label>
            <input
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              min={dateDebut || undefined}
              className="rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-2 py-1 text-sm"
            />
            {(dateDebut || dateFin) && (
              <button
                onClick={() => { setDateDebut(''); setDateFin(''); }}
                className="text-xs text-blue-700 dark:text-blue-300 hover:underline"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">
                <th className="py-2 pr-2">Date</th>
                <th className="py-2 pr-2">Libellé</th>
                <th className="py-2 pr-2">Catégorie</th>
                <th className="py-2 pr-2">Montant</th>
                <th className="py-2 pr-2">Saisi par</th>
                <th className="py-2 pr-2">Justificatif</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {operations.map((op) => (
                <tr key={op.id} className="border-b border-slate-50 dark:border-slate-700/50">
                  <td className="py-2 pr-2 whitespace-nowrap">{new Date(op.date_operation).toLocaleDateString('fr-FR')}</td>
                  <td className="py-2 pr-2">
                    <i className={`fa-solid ${CATEGORIE_ICON[op.type]} mr-1`} />
                    {op.libelle}
                    {op.statut === 'annulee' && <span className="ml-2 text-xs text-slate-400">(annulée)</span>}
                    {op.statut === 'en_attente_validation' && (
                      <span className="ml-2 text-xs text-amber-600">(en attente de validation)</span>
                    )}
                  </td>
                  <td className="py-2 pr-2 text-slate-500 dark:text-slate-400">{op.categorie}</td>
                  <td className={`py-2 pr-2 font-medium ${op.type === 'entree' ? 'text-green-600' : 'text-red-600'}`}>
                    {op.type === 'entree' ? '+' : '-'}{formatFCFA(op.montant)}
                  </td>
                  <td className="py-2 pr-2 text-slate-500 dark:text-slate-400">{op.saisi_par_prenom} {op.saisi_par_nom}</td>
                  <td className="py-2 pr-2">
                    {op.justificatif ? (
                      <a href={op.justificatif} target="_blank" rel="noreferrer" className="text-blue-700 dark:text-blue-300 hover:underline">
                        <i className="fa-solid fa-file-lines" />
                      </a>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="py-2">
                    <button
                      onClick={() => setSignalement({ show: true, operationId: op.id, message: '' })}
                      title="Signaler une anomalie"
                      className="text-slate-400 hover:text-red-600"
                    >
                      <i className="fa-solid fa-flag" />
                    </button>
                  </td>
                </tr>
              ))}
              {operations.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">
                    {dateDebut || dateFin ? 'Aucune opération sur cette période.' : 'Aucune opération enregistrée.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {signalement.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-800 p-5 shadow-xl">
            <h3 className="font-semibold mb-3">Signaler une anomalie</h3>
            <textarea
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent p-2 text-sm"
              rows={4}
              value={signalement.message}
              onChange={(e) => setSignalement((s) => ({ ...s, message: e.target.value }))}
              placeholder="Décrivez l'anomalie constatée..."
            />
            <div className="mt-3 flex justify-end gap-2">
              <button onClick={() => setSignalement({ show: false, operationId: null, message: '' })} className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600">
                Annuler
              </button>
              <button onClick={envoyerSignalement} className="px-3 py-1.5 text-sm rounded-lg bg-blue-800 text-white">
                Envoyer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
