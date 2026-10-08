import { useEffect, useState } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import PasswordInput from '../components/PasswordInput';
import useLiveRefresh from '../hooks/useLiveRefresh';
import { MOYENS_PAIEMENT } from '../constants/moyensPaiement';

const ROLES = [
  { value: 'membre', label: 'Membre' },
  { value: 'tresorier', label: 'Tresorier(ere)' },
  { value: 'secretaire_general', label: 'Secretaire General(e)' },
  { value: 'resp_communication', label: 'Resp. Communication' },
  { value: 'president', label: 'President(e)' },
  { value: 'super_admin', label: 'Super administrateur' },
];

const STATUTS = ['actif', 'inactif', 'suspendu', 'honoraire'];

export default function Administration() {
  const { showToast } = useToast();
  const [onglet, setOnglet] = useState('inscriptions');
  const [enAttente, setEnAttente] = useState([]);
  const [membres, setMembres] = useState([]);
  const [adhesions, setAdhesions] = useState([]);
  const [config, setConfig] = useState({
    annee: new Date().getFullYear(), montant_membre: 500, montant_bureau: 1000, montant_adhesion: 1000,
    numero_wave: '', numero_mtn_momo: '', numero_orange_money: '', numero_moov_money: '',
  });
  const [configMsg, setConfigMsg] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(vierge());
  const [createLoading, setCreateLoading] = useState(false);
  const [createResult, setCreateResult] = useState(null);

  function vierge() {
    return { nom: '', prenom: '', email: '', telephone: '', password: '', filiere: '', niveau: '', promotion: '', role: 'membre', statut: 'actif' };
  }

  const charger = async () => {
    const [ea, m, c, a] = await Promise.all([
      api.get('/membres/en-attente'),
      api.get('/membres'),
      api.get('/cotisations/config', { params: { annee: new Date().getFullYear() } }),
      api.get('/cotisations/adhesions', { params: { annee: new Date().getFullYear() } }),
    ]);
    setEnAttente(ea.data);
    setMembres(m.data);
    if (c.data) setConfig(c.data);
    setAdhesions(a.data);
  };

  const statutAdhesion = (membreId) => adhesions.find((a) => a.membre_id === membreId)?.statut || 'non_paye';

  useEffect(() => {
    charger();
  }, []);

  useLiveRefresh(['membres:update', 'cotisations:update'], charger);

  const validerInscription = async (id, nom) => {
    try {
      await api.patch(`/membres/${id}/statut`, { statut: 'actif' });
      showToast(`Inscription de ${nom} validee.`, 'succes');
      charger();
    } catch (err) {
      showToast(err.response?.data?.message || "Erreur lors de la validation.", 'erreur');
    }
  };

  const rejeterInscription = async (id, nom) => {
    if (!window.confirm(`Rejeter l'inscription de ${nom} ? Le compte restera inactif et ne pourra pas se connecter.`)) return;
    try {
      await api.patch(`/membres/${id}/statut`, { statut: 'inactif' });
      showToast(`Inscription de ${nom} rejetee.`, 'succes');
      charger();
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur lors du rejet.', 'erreur');
    }
  };

  const changerStatut = async (id, statut) => {
    try {
      await api.patch(`/membres/${id}/statut`, { statut });
      showToast(`Statut mis a jour : ${statut}.`, 'succes');
      charger();
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur lors du changement de statut.', 'erreur');
    }
  };

  const changerRole = async (id, role) => {
    try {
      await api.patch(`/membres/${id}/role`, { role });
      showToast('Role mis a jour.', 'succes');
      charger();
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur lors du changement de role.', 'erreur');
    }
  };

  const creerMembre = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      const { data } = await api.post('/membres', createForm);
      setCreateResult(data);
      showToast('Membre cree avec succes.', 'succes');
      charger();
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur lors de la creation du membre.', 'erreur');
    } finally {
      setCreateLoading(false);
    }
  };

  const fermerCreation = () => {
    setShowCreate(false);
    setCreateForm(vierge());
    setCreateResult(null);
  };

  const copierIdentifiants = () => {
    const texte = `Numero de membre : ${createResult.numeroMembre}\nIdentifiant : ${createForm.email}\nMot de passe : ${createResult.motDePasseInitial}`;
    navigator.clipboard?.writeText(texte);
    showToast('Identifiants copies dans le presse-papiers.', 'succes');
  };

  const enregistrerConfig = async (e) => {
    e.preventDefault();
    try {
      await api.post('/cotisations/config', config);
      setConfigMsg('Configuration enregistree. Les lignes de cotisation ont ete initialisees pour tous les membres actifs.');
      showToast('Configuration des cotisations enregistree.', 'succes');
    } catch (err) {
      showToast(err.response?.data?.message || "Erreur lors de l'enregistrement.", 'erreur');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Administration</h1>

      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        {[
          { key: 'inscriptions', label: `Inscriptions (${enAttente.length})` },
          { key: 'membres', label: 'Membres' },
          { key: 'cotisations', label: 'Parametres cotisations' },
        ].map((t) => (
          <button key={t.key} onClick={() => setOnglet(t.key)} className={`px-3 py-2 text-sm font-medium ${onglet === t.key ? 'text-blue-800 dark:text-blue-300 border-b-2 border-blue-800' : 'text-slate-400'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {onglet === 'inscriptions' && (
        <div className="rounded-xl bg-white dark:bg-slate-800 p-5 shadow space-y-2">
          {enAttente.length === 0 && <p className="text-sm text-slate-400">Aucune inscription en attente.</p>}
          {enAttente.map((m) => (
            <div key={m.id} className="flex items-center justify-between border-b border-slate-50 dark:border-slate-700/50 pb-2 last:border-0">
              <div>
                <p className="font-medium text-sm">{m.prenom} {m.nom} - {m.numero_membre}</p>
                <p className="text-xs text-slate-400">{m.email} - {m.telephone} - {m.filiere || 'N/A'}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => validerInscription(m.id, `${m.prenom} ${m.nom}`)} className="rounded-lg bg-green-700 text-white px-3 py-1.5 text-sm">
                  <i className="fa-solid fa-check mr-1" /> Valider
                </button>
                <button onClick={() => rejeterInscription(m.id, `${m.prenom} ${m.nom}`)} className="rounded-lg border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 px-3 py-1.5 text-sm hover:bg-red-50 dark:hover:bg-red-900/20">
                  <i className="fa-solid fa-xmark mr-1" /> Rejeter
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {onglet === 'membres' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button onClick={() => setShowCreate(true)} className="rounded-lg bg-blue-800 text-white px-4 py-2 text-sm">
              <i className="fa-solid fa-user-plus mr-1" /> Nouveau membre
            </button>
          </div>
          <div className="rounded-xl bg-white dark:bg-slate-800 p-3 shadow overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">
                <th className="py-2 pr-2">Membre</th>
                <th className="py-2 pr-2">Statut</th>
                <th className="py-2 pr-2">Role</th>
                <th className="py-2 pr-2">Droit d'adhesion</th>
              </tr>
            </thead>
            <tbody>
              {membres.map((m) => (
                <tr key={m.id} className="border-b border-slate-50 dark:border-slate-700/50">
                  <td className="py-2 pr-2">{m.prenom} {m.nom}<span className="block text-xs text-slate-400">{m.numero_membre}</span></td>
                  <td className="py-2 pr-2">
                    <select value={m.statut} onChange={(e) => changerStatut(m.id, e.target.value)} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-2 py-1 text-xs">
                      {STATUTS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="py-2 pr-2">
                    <select value={m.role} onChange={(e) => changerRole(m.id, e.target.value)} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-2 py-1 text-xs">
                      {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </td>
                  <td className="py-2 pr-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      statutAdhesion(m.id) === 'paye' ? 'badge-paye' : statutAdhesion(m.id) === 'partiel' ? 'badge-partiel' : 'badge-non-paye'
                    }`}>
                      {statutAdhesion(m.id).replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {onglet === 'cotisations' && (
        <div className="rounded-xl bg-white dark:bg-slate-800 p-5 shadow max-w-md">
          {configMsg && <p className="mb-3 text-sm text-green-700 dark:text-green-300">{configMsg}</p>}
          <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
            Le droit d'adhesion est du une seule fois par tout nouveau membre. La cotisation mensuelle depend du role :
            membre simple ou role du bureau (tresorier, secretaire general, resp. communication, president, super admin).
          </p>
          <form onSubmit={enregistrerConfig} className="space-y-3">
            <div>
              <label className="text-xs text-slate-500">Annee</label>
              <input type="number" value={config.annee} onChange={(e) => setConfig((c) => ({ ...c, annee: Number(e.target.value) }))} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-1.5 text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-500">Droit d'adhesion, une fois (FCFA)</label>
              <input type="number" value={config.montant_adhesion} onChange={(e) => setConfig((c) => ({ ...c, montant_adhesion: Number(e.target.value) }))} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-1.5 text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-500">Cotisation mensuelle - Membre (FCFA)</label>
              <input type="number" value={config.montant_membre} onChange={(e) => setConfig((c) => ({ ...c, montant_membre: Number(e.target.value) }))} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-1.5 text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-500">Cotisation mensuelle - Roles du bureau (FCFA)</label>
              <input type="number" value={config.montant_bureau} onChange={(e) => setConfig((c) => ({ ...c, montant_bureau: Number(e.target.value) }))} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-1.5 text-sm" />
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
              <p className="text-sm font-medium mb-2">Numeros Mobile Money de l'association</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Affiches aux membres pour qu'ils sachent ou envoyer leur paiement avant de le declarer.
              </p>
              <div className="space-y-2">
                {MOYENS_PAIEMENT.map((m) => (
                  <div key={m.value} className="flex items-center gap-2">
                    <img src={m.logo} alt={m.label} className="h-6 w-6 object-contain shrink-0" />
                    <input
                      type="tel"
                      placeholder={`Numero ${m.label}`}
                      value={config[m.configKey] || ''}
                      onChange={(e) => setConfig((c) => ({ ...c, [m.configKey]: e.target.value }))}
                      className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-1.5 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className="w-full rounded-lg bg-blue-800 text-white py-2 text-sm font-semibold">Enregistrer</button>
          </form>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 overflow-y-auto">
          <div className="w-full max-w-lg rounded-xl bg-white dark:bg-slate-800 p-5 shadow-xl">
            {createResult ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <i className="fa-solid fa-circle-check text-xl" />
                  <h3 className="font-semibold">Membre cree avec succes</h3>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Transmettez ces identifiants au membre. Le mot de passe ne sera plus affiche ensuite.
                </p>
                <div className="rounded-lg bg-slate-50 dark:bg-slate-700 p-3 text-sm space-y-1 font-mono">
                  <p><span className="text-slate-400">Numero :</span> {createResult.numeroMembre}</p>
                  <p><span className="text-slate-400">Identifiant :</span> {createForm.email}</p>
                  <p><span className="text-slate-400">Mot de passe :</span> {createResult.motDePasseInitial}</p>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={copierIdentifiants} className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600">
                    <i className="fa-solid fa-copy mr-1" /> Copier
                  </button>
                  <button onClick={fermerCreation} className="px-3 py-1.5 text-sm rounded-lg bg-blue-800 text-white">
                    Fermer
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={creerMembre} className="space-y-3">
                <h3 className="font-semibold">Nouveau membre</h3>
                <div className="grid grid-cols-2 gap-3">
                  <input required placeholder="Nom" value={createForm.nom} onChange={(e) => setCreateForm((f) => ({ ...f, nom: e.target.value }))} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-1.5 text-sm" />
                  <input required placeholder="Prenom" value={createForm.prenom} onChange={(e) => setCreateForm((f) => ({ ...f, prenom: e.target.value }))} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-1.5 text-sm" />
                </div>
                <input required type="email" placeholder="E-mail" value={createForm.email} onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-1.5 text-sm" />
                <input required placeholder="Telephone" value={createForm.telephone} onChange={(e) => setCreateForm((f) => ({ ...f, telephone: e.target.value }))} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-1.5 text-sm" />
                <div className="grid grid-cols-3 gap-3">
                  <input placeholder="Filiere" value={createForm.filiere} onChange={(e) => setCreateForm((f) => ({ ...f, filiere: e.target.value }))} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-1.5 text-sm" />
                  <input placeholder="Niveau" value={createForm.niveau} onChange={(e) => setCreateForm((f) => ({ ...f, niveau: e.target.value }))} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-1.5 text-sm" />
                  <input placeholder="Promotion" value={createForm.promotion} onChange={(e) => setCreateForm((f) => ({ ...f, promotion: e.target.value }))} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-1.5 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500">Role</label>
                    <select value={createForm.role} onChange={(e) => setCreateForm((f) => ({ ...f, role: e.target.value }))} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-1.5 text-sm">
                      {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Statut</label>
                    <select value={createForm.statut} onChange={(e) => setCreateForm((f) => ({ ...f, statut: e.target.value }))} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-1.5 text-sm">
                      {STATUTS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Mot de passe initial (facultatif, min. 8 caracteres)</label>
                  <PasswordInput
                    icon={false}
                    minLength={8}
                    placeholder="Laisser vide pour generer automatiquement"
                    value={createForm.password}
                    onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={fermerCreation} className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600">
                    Annuler
                  </button>
                  <button type="submit" disabled={createLoading} className="px-3 py-1.5 text-sm rounded-lg bg-blue-800 text-white disabled:opacity-60">
                    {createLoading ? <i className="fa-solid fa-circle-notch fa-spin" /> : 'Creer le membre'}
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
