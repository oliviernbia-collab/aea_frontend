import { useEffect, useState } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import useLiveRefresh from '../hooks/useLiveRefresh';
import { MOYENS_PAIEMENT } from '../constants/moyensPaiement';

const MOIS_LABELS = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'];
const STATUT_CLASS = { paye: 'badge-paye', partiel: 'badge-partiel', non_paye: 'badge-non-paye', non_du: 'badge-non-du' };
const MODE_LABELS = { especes: 'Especes', orange_money: 'Orange Money', mtn_momo: 'MTN MoMo', moov_money: 'Moov Money', wave: 'Wave' };
// Les routes de paiement en ligne (Jeko) utilisent les codes operateur bruts (wave/orange/mtn/moov) ;
// le reste de l'app (historique, declarations manuelles) utilise les codes _money existants.
const CODE_JEKO_VERS_MODE = { wave: 'wave', orange: 'orange_money', mtn: 'mtn_momo', moov: 'moov_money' };
// Doit rester synchronise avec FRAIS_PLATEFORME_FCFA (backend/src/utils/cotisations.js) : forfait ajoute
// au montant du pour compenser la commission Jeko (1,5%) sur chaque paiement en ligne.
const FRAIS_PLATEFORME_FCFA = 100;

function formatFCFA(n) {
  return new Intl.NumberFormat('fr-FR').format(Math.round(Number(n) || 0)) + ' FCFA';
}

export default function MaFicheCotisation() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [fiche, setFiche] = useState(null);
  const [config, setConfig] = useState(null);
  const [showDeclaration, setShowDeclaration] = useState(false);
  const [onglet, setOnglet] = useState('en_ligne');
  const [form, setForm] = useState({ montant: '', date_paiement: '', mode_paiement: 'wave', mois: [] });
  const [payerPhone, setPayerPhone] = useState('');
  const [preuve, setPreuve] = useState(null);
  const [envoi, setEnvoi] = useState(false);
  const [paiementEnCours, setPaiementEnCours] = useState(false);
  const annee = new Date().getFullYear();

  const charger = async () => {
    const [{ data: ficheData }, { data: configData }] = await Promise.all([
      api.get('/cotisations/ma-fiche', { params: { annee } }),
      api.get('/cotisations/config', { params: { annee } }),
    ]);
    setFiche(ficheData);
    setConfig(configData);
  };

  useEffect(() => {
    charger();
  }, []);

  useEffect(() => {
    if (user?.telephone && !payerPhone) setPayerPhone(user.telephone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Retour depuis la page de paiement de l'operateur (Wave/Orange) ou la page d'attente Jeko (MTN/Moov).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const statutRetour = params.get('paiement');
    const reference = params.get('reference');
    if (!statutRetour || !reference) return;

    (async () => {
      try {
        const { data } = await api.get(`/cotisations/paiement-en-ligne/${reference}`);
        if (data.statut === 'success') {
          showToast(`Paiement de ${formatFCFA(data.montant)} confirme.`, 'succes');
        } else if (data.statut === 'error') {
          showToast("Le paiement a echoue cote operateur. Vous pouvez reessayer.", 'erreur');
        } else {
          showToast('Paiement en attente de confirmation aupres de l\'operateur. Cela peut prendre quelques minutes.', 'info');
        }
      } catch {
        // la reference peut ne pas (encore) exister si l'appel precedent a echoue avant creation
      } finally {
        window.history.replaceState({}, '', window.location.pathname);
        charger();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLiveRefresh('cotisations:update', charger);

  const operateurChoisi = MOYENS_PAIEMENT.find((m) => m.value === form.mode_paiement);
  const numeroReception = operateurChoisi && config ? config[operateurChoisi.configKey] : null;

  const copierNumero = () => {
    if (!numeroReception) return;
    navigator.clipboard?.writeText(numeroReception);
    showToast('Numero copie dans le presse-papiers.', 'succes');
  };

  const toggleMois = (mois) => {
    setForm((f) => ({
      ...f,
      mois: f.mois.includes(mois) ? f.mois.filter((m) => m !== mois) : [...f.mois, mois],
    }));
  };

  const totalSelection = !fiche ? 0 : form.mois.reduce((sum, m) => {
    if (m === 0) {
      return sum + Math.max(0, Number(fiche.adhesion?.montant_du || 0) - Number(fiche.adhesion?.montant_paye || 0));
    }
    const ligne = fiche.mois.find((x) => x.mois === m);
    return sum + Math.max(0, Number(ligne?.montant_du || 0) - Number(ligne?.montant_paye || 0));
  }, 0);

  const payerMaintenant = async () => {
    if (form.mois.length === 0) {
      showToast('Selectionnez au moins un mois a payer.', 'erreur');
      return;
    }
    if (!payerPhone) {
      showToast('Renseignez le numero Mobile Money a debiter.', 'erreur');
      return;
    }
    setPaiementEnCours(true);
    try {
      const { data } = await api.post('/cotisations/paiement-en-ligne', {
        mode_paiement: form.mode_paiement,
        mois_couverts: form.mois.map((m) => ({ annee, mois: m })),
        payer_phone: payerPhone,
      });
      window.location.href = data.redirectUrl;
    } catch (err) {
      showToast(err.response?.data?.message || "Erreur lors de l'initialisation du paiement.", 'erreur');
      setPaiementEnCours(false);
    }
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
      fd.append('mode_paiement', CODE_JEKO_VERS_MODE[form.mode_paiement] || form.mode_paiement);
      fd.append('mois_couverts', JSON.stringify(form.mois.map((m) => ({ annee, mois: m }))));
      fd.append('preuve', preuve);
      await api.post('/cotisations/declarations', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      showToast('Declaration envoyee. Le tresorier va la verifier.', 'succes');
      setShowDeclaration(false);
      setForm({ montant: '', date_paiement: '', mode_paiement: 'wave', mois: [] });
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
          <i className="fa-solid fa-mobile-screen mr-1" /> Payer ma cotisation
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
                <p className="font-medium">{formatFCFA(p.montant)} - {MODE_LABELS[p.mode_paiement] || p.mode_paiement}</p>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 overflow-y-auto">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-800 p-5 shadow-xl space-y-3">
            <h3 className="font-semibold">Payer ma cotisation</h3>

            <div className="flex gap-1 rounded-lg bg-slate-100 dark:bg-slate-700 p-1 text-sm">
              <button
                type="button"
                onClick={() => setOnglet('en_ligne')}
                className={`flex-1 rounded-md py-1.5 ${onglet === 'en_ligne' ? 'bg-white dark:bg-slate-800 shadow font-medium' : 'text-slate-500'}`}
              >
                Payer en ligne
              </button>
              <button
                type="button"
                onClick={() => setOnglet('manuelle')}
                className={`flex-1 rounded-md py-1.5 ${onglet === 'manuelle' ? 'bg-white dark:bg-slate-800 shadow font-medium' : 'text-slate-500'}`}
              >
                J'ai deja paye
              </button>
            </div>

            <div>
              <label className="text-xs text-slate-500 block mb-1.5">Operateur</label>
              <div className="grid grid-cols-4 gap-2">
                {MOYENS_PAIEMENT.map((m) => (
                  <button
                    type="button"
                    key={m.value}
                    onClick={() => setForm((f) => ({ ...f, mode_paiement: m.value }))}
                    className={`flex flex-col items-center gap-1 rounded-lg border p-2 transition ${
                      form.mode_paiement === m.value
                        ? 'border-blue-800 ring-2 ring-blue-800/30 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <img src={m.logo} alt={m.label} className="h-8 w-8 object-contain" />
                    <span className="text-[11px] text-center leading-tight">{m.label}</span>
                  </button>
                ))}
              </div>
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

            {onglet === 'en_ligne' ? (
              <>
                <div className="rounded-lg bg-slate-50 dark:bg-slate-700/50 p-3 text-sm space-y-1">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span>Cotisation</span>
                    <span>{formatFCFA(totalSelection)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span>Frais de transaction</span>
                    <span>{formatFCFA(FRAIS_PLATEFORME_FCFA)}</span>
                  </div>
                  <div className="flex items-center justify-between font-semibold pt-1 border-t border-slate-200 dark:border-slate-600">
                    <span>Total debite</span>
                    <span>{formatFCFA(totalSelection > 0 ? totalSelection + FRAIS_PLATEFORME_FCFA : 0)}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Numero {operateurChoisi?.label} a debiter</label>
                  <input
                    required
                    type="tel"
                    placeholder="07XXXXXXXX"
                    value={payerPhone}
                    onChange={(e) => setPayerPhone(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-1.5 text-sm"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Sur MTN et Moov, l'operateur vous envoie une demande de code a valider sur votre telephone. Sur Wave et Orange, vous serez redirige vers leur application.
                  </p>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowDeclaration(false)} className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600">Annuler</button>
                  <button type="button" onClick={payerMaintenant} disabled={paiementEnCours || totalSelection <= 0} className="px-3 py-1.5 text-sm rounded-lg bg-blue-800 text-white disabled:opacity-60">
                    {paiementEnCours ? <i className="fa-solid fa-circle-notch fa-spin" /> : `Payer ${formatFCFA(totalSelection + FRAIS_PLATEFORME_FCFA)}`}
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={envoyerDeclaration} className="space-y-3">
                <div className="rounded-lg bg-slate-50 dark:bg-slate-700/50 p-3 text-sm">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Envoyez le montant via {operateurChoisi?.label} au numero :</p>
                  {numeroReception ? (
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-semibold text-blue-800 dark:text-blue-300">{numeroReception}</span>
                      <button type="button" onClick={copierNumero} className="text-xs rounded-lg border border-slate-300 dark:border-slate-600 px-2 py-1">
                        <i className="fa-solid fa-copy mr-1" /> Copier
                      </button>
                    </div>
                  ) : (
                    <p className="text-slate-400 text-xs">Numero non encore configure par le tresorier. Rapprochez-vous du bureau.</p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-slate-500">Montant envoye (FCFA)</label>
                  <input required type="number" value={form.montant} onChange={(e) => setForm((f) => ({ ...f, montant: e.target.value }))} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Date du paiement</label>
                  <input required type="date" value={form.date_paiement} onChange={(e) => setForm((f) => ({ ...f, date_paiement: e.target.value }))} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-1.5 text-sm" />
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
            )}
          </div>
        </div>
      )}
    </div>
  );
}
