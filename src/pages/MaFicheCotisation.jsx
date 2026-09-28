import { useEffect, useState } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import useLiveRefresh from '../hooks/useLiveRefresh';

const MOIS_LABELS = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'];
const STATUT_CLASS = { paye: 'badge-paye', partiel: 'badge-partiel', non_paye: 'badge-non-paye', non_du: 'badge-non-du' };

function formatFCFA(n) {
  return new Intl.NumberFormat('fr-FR').format(Math.round(Number(n) || 0)) + ' FCFA';
}

export default function MaFicheCotisation() {
  const { showToast } = useToast();
  const [fiche, setFiche] = useState(null);
  const [showDeclaration, setShowDeclaration] = useState(false);
  const [form, setForm] = useState({ montant: '', date_paiement: '', mode_paiement: 'orange_money', mois: [] });
  const [preuve, setPreuve] = useState(null);
  const [envoi, setEnvoi] = useState(false);
  const annee = new Date().getFullYear();

  const charger = async () => {
    const { data } = await api.get('/cotisations/ma-fiche', { params: { annee } });
    setFiche(data);
  };

  useEffect(() => {
    charger();
  }, []);

  useLiveRefresh('cotisations:update', charger);

  const toggleMois = (mois) => {
    setForm((f) => ({
      ...f,
      mois: f.mois.includes(mois) ? f.mois.filter((m) => m !== mois) : [...f.mois, mois],
    }));
  };

  const envoyerDeclaration = async (e) => {
    e.preventDefault();
    if (!preuve || form.mois.length === 0) {
      showToast('Selectionnez au moins un mois et joignez une capture de la preuve de paiement.', 'erreur');
      return;
    }
    setEnvoi(true);
    try {
      const fd = new FormData();
      fd.append('montant', form.montant);
      fd.append('date_paiement', form.date_paiement);
      fd.append('mode_paiement', form.mode_paiement);
      fd.append('mois_couverts', JSON.stringify(form.mois.map((m) => ({ annee, mois: m }))));
      fd.append('preuve', preuve);
      await api.post('/cotisations/declarations', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      showToast('Declaration envoyee. Le tresorier va la verifier.', 'succes');
      setShowDeclaration(false);
      setForm({ montant: '', date_paiement: '', mode_paiement: 'orange_money', mois: [] });
      setPreuve(null);
      charger();
    } catch (err) {
      showToast(err.response?.data?.message || "Erreur lors de l'envoi de la declaration.", 'erreur');
    } finally {
      setEnvoi(false);
    }
  };

  if (!fiche) return <p className="text-slate-400">Chargement...</p>;

  const totalDu = fiche.mois.reduce((s, m) => s + Number(m.montant_du), 0) + Number(fiche.adhesion?.montant_du || 0);
  const totalPaye = fiche.mois.reduce((s, m) => s + Number(m.montant_paye), 0) + Number(fiche.adhesion?.montant_paye || 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Ma fiche de cotisation {annee}</h1>
        <button onClick={() => setShowDeclaration(true)} className="rounded-lg bg-blue-800 text-white px-4 py-2 text-sm">
          <i className="fa-solid fa-mobile-screen mr-1" /> Declarer un paiement Mobile Money
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-white dark:bg-slate-800 p-5 shadow">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total du (annee)</p>
          <p className="text-xl font-bold">{formatFCFA(totalDu)}</p>
        </div>
        <div className="rounded-xl bg-white dark:bg-slate-800 p-5 shadow">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total paye</p>
          <p className="text-xl font-bold text-green-600">{formatFCFA(totalPaye)}</p>
        </div>
      </div>

      {fiche.adhesion && (
        <div className="rounded-xl bg-white dark:bg-slate-800 p-5 shadow flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Droit d'adhesion</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Paiement unique du a l'entree dans l'association - {formatFCFA(fiche.adhesion.montant_du)}</p>
          </div>
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${STATUT_CLASS[fiche.adhesion.statut]}`}>
            {fiche.adhesion.statut.replace('_', ' ')}
          </span>
        </div>
      )}

      <div className="rounded-xl bg-white dark:bg-slate-800 p-5 shadow">
        <h2 className="font-semibold mb-3">Detail mois par mois</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {fiche.mois.map((m) => (
            <div key={m.mois} className="flex items-center justify-between rounded-lg border border-slate-100 dark:border-slate-700 px-3 py-2">
              <span className="text-sm">{MOIS_LABELS[m.mois - 1]}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUT_CLASS[m.statut]}`}>
                {m.statut.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-white dark:bg-slate-800 p-5 shadow">
        <h2 className="font-semibold mb-3">Historique des paiements / recus</h2>
        <div className="space-y-2">
          {fiche.paiements.length === 0 && <p className="text-sm text-slate-400">Aucun paiement enregistre.</p>}
          {fiche.paiements.map((p) => (
            <div key={p.id} className="flex items-center justify-between border-b border-slate-50 dark:border-slate-700/50 pb-2 text-sm">
              <div>
                <p className="font-medium">{formatFCFA(p.montant)} - {p.mode_paiement.replace('_', ' ')}</p>
                <p className="text-slate-400 text-xs">{new Date(p.date_paiement).toLocaleDateString('fr-FR')} {p.recu_numero ? `- ${p.recu_numero}` : ''}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${p.statut_validation === 'valide' ? 'badge-paye' : 'badge-partiel'}`}>
                {p.statut_validation}
              </span>
            </div>
          ))}
        </div>
      </div>

      {showDeclaration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <form onSubmit={envoyerDeclaration} className="w-full max-w-md rounded-xl bg-white dark:bg-slate-800 p-5 shadow-xl space-y-3">
            <h3 className="font-semibold">Declarer un paiement Mobile Money</h3>
            <div>
              <label className="text-xs text-slate-500">Montant (FCFA)</label>
              <input required type="number" value={form.montant} onChange={(e) => setForm((f) => ({ ...f, montant: e.target.value }))} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-1.5 text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-500">Date du paiement</label>
              <input required type="date" value={form.date_paiement} onChange={(e) => setForm((f) => ({ ...f, date_paiement: e.target.value }))} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-1.5 text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-500">Mode de paiement</label>
              <select value={form.mode_paiement} onChange={(e) => setForm((f) => ({ ...f, mode_paiement: e.target.value }))} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-1.5 text-sm">
                <option value="orange_money">Orange Money</option>
                <option value="mtn_momo">MTN MoMo</option>
                <option value="moov_money">Moov Money</option>
                <option value="wave">Wave</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Mois concernes</label>
              <div className="flex flex-wrap gap-1">
                {fiche.adhesion && fiche.adhesion.statut !== 'paye' && (
                  <button
                    type="button"
                    onClick={() => toggleMois(0)}
                    className={`text-xs px-2 py-1 rounded-full border ${
                      form.mois.includes(0) ? 'bg-amber-500 text-white border-amber-500' : 'border-amber-400 text-amber-700 dark:text-amber-400'
                    }`}
                  >
                    Droit d'adhesion
                  </button>
                )}
                {MOIS_LABELS.map((label, idx) => (
                  <button
                    type="button"
                    key={label}
                    onClick={() => toggleMois(idx + 1)}
                    className={`text-xs px-2 py-1 rounded-full border ${
                      form.mois.includes(idx + 1) ? 'bg-blue-800 text-white border-blue-800' : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {label.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500">Capture d'ecran de la preuve</label>
              <input required type="file" accept="image/*,.pdf" onChange={(e) => setPreuve(e.target.files[0])} className="w-full text-sm" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowDeclaration(false)} className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600">Annuler</button>
              <button type="submit" disabled={envoi} className="px-3 py-1.5 text-sm rounded-lg bg-blue-800 text-white disabled:opacity-60">
                {envoi ? <i className="fa-solid fa-circle-notch fa-spin" /> : 'Envoyer'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
