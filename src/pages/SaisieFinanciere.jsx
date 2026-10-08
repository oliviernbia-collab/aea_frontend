import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import useLiveRefresh from '../hooks/useLiveRefresh';

const MOIS_LABELS = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aout', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatFCFA(n) {
  return new Intl.NumberFormat('fr-FR').format(Math.round(Number(n) || 0)) + ' FCFA';
}

export default function SaisieFinanciere() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [enAttente, setEnAttente] = useState([]);
  const [membres, setMembres] = useState([]);

  const [opForm, setOpForm] = useState({ type: 'sortie', fonds: 'fonctionnement', categorie: '', libelle: '', montant: '', date_operation: new Date().toISOString().slice(0, 10) });
  const [justificatif, setJustificatif] = useState(null);
  const [opMsg, setOpMsg] = useState('');

  const [paieForm, setPaieForm] = useState({ membre_id: '', montant: '', date_paiement: new Date().toISOString().slice(0, 10), mode_paiement: 'especes', mois: [] });
  const [paieMsg, setPaieMsg] = useState('');

  const charger = async () => {
    const [o, m] = await Promise.all([
      api.get('/caisse/operations', { params: { statut: 'en_attente_validation' } }),
      api.get('/membres', { params: { statut: 'actif' } }),
    ]);
    setEnAttente(o.data);
    setMembres(m.data);
  };

  useEffect(() => {
    charger();
  }, []);

  useLiveRefresh(['caisse:update', 'membres:update'], charger);

  const soumettreOperation = async (e) => {
    e.preventDefault();
    setOpMsg('');
    try {
      const fd = new FormData();
      Object.entries(opForm).forEach(([k, v]) => fd.append(k, v));
      if (justificatif) fd.append('justificatif', justificatif);
      const { data } = await api.post('/caisse/operations', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const message = data.statut === 'en_attente_validation' ? 'Depense enregistree, en attente de validation du President (montant > 25 000 FCFA).' : 'Operation enregistree.';
      setOpMsg(message);
      showToast(message, data.statut === 'en_attente_validation' ? 'info' : 'succes');
      setOpForm({ type: 'sortie', fonds: 'fonctionnement', categorie: '', libelle: '', montant: '', date_operation: new Date().toISOString().slice(0, 10) });
      setJustificatif(null);
      charger();
    } catch (err) {
      showToast(err.response?.data?.message || "Erreur lors de l'enregistrement.", 'erreur');
    }
  };

  const validerDepense = async (id) => {
    try {
      await api.patch(`/caisse/operations/${id}/valider`);
      showToast('Depense validee.', 'succes');
      charger();
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur lors de la validation.', 'erreur');
    }
  };

  const toggleMois = (mois) => {
    setPaieForm((f) => ({ ...f, mois: f.mois.includes(mois) ? f.mois.filter((m) => m !== mois) : [...f.mois, mois] }));
  };

  const soumettrePaiement = async (e) => {
    e.preventDefault();
    setPaieMsg('');
    if (paieForm.mois.length === 0) {
      setPaieMsg('Selectionnez au moins un mois.');
      showToast('Selectionnez au moins un mois.', 'erreur');
      return;
    }
    try {
      const { data } = await api.post('/cotisations/paiements', {
        membre_id: paieForm.membre_id,
        montant: paieForm.montant,
        date_paiement: paieForm.date_paiement,
        mode_paiement: paieForm.mode_paiement,
        mois_couverts: paieForm.mois.map((m) => ({ annee: new Date().getFullYear(), mois: m })),
      });
      setPaieMsg(`Paiement enregistre. Recu : ${data.recuNumero}`);
      showToast(`Paiement enregistre. Recu ${data.recuNumero}.`, 'succes');
      setPaieForm({ membre_id: '', montant: '', date_paiement: new Date().toISOString().slice(0, 10), mode_paiement: 'especes', mois: [] });
    } catch (err) {
      showToast(err.response?.data?.message || "Erreur lors de l'enregistrement du paiement.", 'erreur');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Saisie financiere</h1>

      {user.role === 'president' && enAttente.length > 0 && (
        <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 p-5 shadow">
          <h2 className="font-semibold mb-3 text-amber-800 dark:text-amber-200">
            <i className="fa-solid fa-triangle-exclamation mr-1" /> Depenses en attente de votre validation
          </h2>
          <div className="space-y-2">
            {enAttente.map((op) => (
              <div key={op.id} className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-lg px-4 py-2">
                <div>
                  <p className="font-medium text-sm">{op.libelle}</p>
                  <p className="text-xs text-slate-400">{formatFCFA(op.montant)} - saisi par {op.saisi_par_prenom} {op.saisi_par_nom}</p>
                </div>
                <button onClick={() => validerDepense(op.id)} className="rounded-lg bg-green-700 text-white px-3 py-1.5 text-sm">
                  Valider
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white dark:bg-slate-800 p-5 shadow">
          <h2 className="font-semibold mb-3">Nouvelle operation de caisse</h2>
          {opMsg && <p className="mb-3 text-sm text-green-700 dark:text-green-300">{opMsg}</p>}
          <form onSubmit={soumettreOperation} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <select value={opForm.type} onChange={(e) => setOpForm((f) => ({ ...f, type: e.target.value }))} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-1.5 text-sm">
                <option value="entree">Entree</option>
                <option value="sortie">Sortie (depense)</option>
              </select>
              <select value={opForm.fonds} onChange={(e) => setOpForm((f) => ({ ...f, fonds: e.target.value }))} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-1.5 text-sm">
                <option value="fonctionnement">Fonctionnement</option>
                <option value="entraide">Entraide</option>
                <option value="evenements">Evenements</option>
              </select>
            </div>
            <input required placeholder="Categorie" value={opForm.categorie} onChange={(e) => setOpForm((f) => ({ ...f, categorie: e.target.value }))} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-1.5 text-sm" />
            <input required placeholder="Libelle" value={opForm.libelle} onChange={(e) => setOpForm((f) => ({ ...f, libelle: e.target.value }))} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-1.5 text-sm" />
            <div className="grid grid-cols-2 gap-3">
              <input required type="number" placeholder="Montant (FCFA)" value={opForm.montant} onChange={(e) => setOpForm((f) => ({ ...f, montant: e.target.value }))} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-1.5 text-sm" />
              <input required type="date" value={opForm.date_operation} onChange={(e) => setOpForm((f) => ({ ...f, date_operation: e.target.value }))} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-1.5 text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-500">Justificatif (photo de recu ou PDF)</label>
              <input type="file" accept="image/*,.pdf" onChange={(e) => setJustificatif(e.target.files[0])} className="w-full text-sm" />
            </div>
            {opForm.type === 'sortie' && Number(opForm.montant) > 25000 && (
              <p className="text-xs text-amber-600"><i className="fa-solid fa-circle-info mr-1" />Cette depense exigera la validation du President.</p>
            )}
            <button type="submit" className="w-full rounded-lg bg-blue-800 text-white py-2 text-sm font-semibold">Enregistrer</button>
          </form>
        </div>

        <div className="rounded-xl bg-white dark:bg-slate-800 p-5 shadow">
          <h2 className="font-semibold mb-3">Enregistrer un paiement de cotisation</h2>
          {paieMsg && <p className="mb-3 text-sm text-green-700 dark:text-green-300">{paieMsg}</p>}
          <form onSubmit={soumettrePaiement} className="space-y-3">
            <select required value={paieForm.membre_id} onChange={(e) => setPaieForm((f) => ({ ...f, membre_id: e.target.value }))} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-1.5 text-sm">
              <option value="">Selectionner un membre</option>
              {membres.map((m) => <option key={m.id} value={m.id}>{m.prenom} {m.nom} ({m.numero_membre})</option>)}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <input required type="number" placeholder="Montant (FCFA)" value={paieForm.montant} onChange={(e) => setPaieForm((f) => ({ ...f, montant: e.target.value }))} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-1.5 text-sm" />
              <input required type="date" value={paieForm.date_paiement} onChange={(e) => setPaieForm((f) => ({ ...f, date_paiement: e.target.value }))} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-1.5 text-sm" />
            </div>
            <select value={paieForm.mode_paiement} onChange={(e) => setPaieForm((f) => ({ ...f, mode_paiement: e.target.value }))} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-1.5 text-sm">
              <option value="especes">Especes</option>
              <option value="orange_money">Orange Money</option>
              <option value="mtn_momo">MTN MoMo</option>
              <option value="moov_money">Moov Money</option>
              <option value="wave">Wave</option>
            </select>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Mois concernes (ou droit d'adhesion)</label>
              <div className="flex flex-wrap gap-1">
                <button type="button" onClick={() => toggleMois(0)} className={`text-xs px-2 py-1 rounded-full border ${paieForm.mois.includes(0) ? 'bg-amber-500 text-white border-amber-500' : 'border-amber-400 text-amber-700 dark:text-amber-400'}`}>
                  Droit d'adhesion
                </button>
                {MOIS_LABELS.map((label, idx) => (
                  <button type="button" key={label} onClick={() => toggleMois(idx + 1)} className={`text-xs px-2 py-1 rounded-full border ${paieForm.mois.includes(idx + 1) ? 'bg-blue-800 text-white border-blue-800' : 'border-slate-300 dark:border-slate-600'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" className="w-full rounded-lg bg-blue-800 text-white py-2 text-sm font-semibold">Enregistrer le paiement</button>
          </form>
        </div>
      </div>
    </div>
  );
}
