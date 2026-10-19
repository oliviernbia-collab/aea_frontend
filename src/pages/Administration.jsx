import { useEffect, useState } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/PasswordInput';
import useLiveRefresh from '../hooks/useLiveRefresh';
import { MOYENS_PAIEMENT } from '../constants/moyensPaiement';
import { GROUPES_ROLES, ROLE_LABELS } from '../constants/roles';
import { STATUT_MEMBRE_LABELS, STATUT_COTISATION_LABELS } from '../constants/statuts';

function OptionsRoles() {
  return GROUPES_ROLES.map((g) => (
    <optgroup key={g.label} label={g.label}>
      {g.roles.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
    </optgroup>
  ));
}

const STATUTS = ['actif', 'inactif', 'suspendu', 'honoraire'];

export default function Administration() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const estSuperAdmin = user?.role === 'super_admin';
  const [onglet, setOnglet] = useState('inscriptions');
  const [enAttente, setEnAttente] = useState([]);
  const [membres, setMembres] = useState([]);
  const [adhesions, setAdhesions] = useState([]);
  const [rechercheInfos, setRechercheInfos] = useState('');
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
      showToast(`Inscription de ${nom} validée.`, 'succes');
      charger();
    } catch (err) {
      showToast(err.response?.data?.message || "Erreur lors de la validation.", 'erreur');
    }
  };

  const rejeterInscription = async (id, nom) => {
    if (!window.confirm(`Rejeter l'inscription de ${nom} ? Le compte restera inactif et ne pourra pas se connecter.`)) return;
    try {
      await api.patch(`/membres/${id}/statut`, { statut: 'inactif' });
      showToast(`Inscription de ${nom} rejetée.`, 'succes');
      charger();
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur lors du rejet.', 'erreur');
    }
  };

  const changerStatut = async (id, statut) => {
    try {
      await api.patch(`/membres/${id}/statut`, { statut });
      showToast(`Statut mis à jour : ${statut}.`, 'succes');
      charger();
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur lors du changement de statut.', 'erreur');
    }
  };

  const changerRole = async (id, role) => {
    try {
      await api.patch(`/membres/${id}/role`, { role });
      showToast('Rôle mis à jour.', 'succes');
      charger();
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur lors du changement de rôle.', 'erreur');
    }
  };

  const creerMembre = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      const { data } = await api.post('/membres', createForm);
      setCreateResult(data);
      showToast('Membre créé avec succès.', 'succes');
      charger();
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur lors de la création du membre.', 'erreur');
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
    const texte = `Numéro de membre : ${createResult.numeroMembre}\nIdentifiant : ${createForm.email}\nMot de passe : ${createResult.motDePasseInitial}`;
    navigator.clipboard?.writeText(texte);
    showToast('Identifiants copiés dans le presse-papiers.', 'succes');
  };

  const enregistrerConfig = async (e) => {
    e.preventDefault();
    try {
      await api.post('/cotisations/config', config);
      setConfigMsg('Configuration enregistrée. Les lignes de cotisation ont été initialisées pour tous les membres actifs.');
      showToast('Configuration des cotisations enregistrée.', 'succes');
    } catch (err) {
      showToast(err.response?.data?.message || "Erreur lors de l'enregistrement.", 'erreur');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Administration</h1>

      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
        {[
          { key: 'inscriptions', label: `Inscriptions (${enAttente.length})` },
          { key: 'membres', label: 'Membres' },
          { key: 'cotisations', label: 'Paramètres cotisations' },
          ...(estSuperAdmin ? [{ key: 'infos', label: 'Informations membres' }] : []),
        ].map((t) => (
          <button key={t.key} onClick={() => setOnglet(t.key)} className={`px-3 py-2 text-sm font-medium whitespace-nowrap ${onglet === t.key ? 'text-blue-800 dark:text-blue-300 border-b-2 border-blue-800' : 'text-slate-400'}`}>
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
                <th className="py-2 pr-2">Rôle</th>
                <th className="py-2 pr-2">Droit d'adhésion</th>
              </tr>
            </thead>
            <tbody>
              {membres.map((m) => (
                <tr key={m.id} className="border-b border-slate-50 dark:border-slate-700/50">
                  <td className="py-2 pr-2">{m.prenom} {m.nom}<span className="block text-xs text-slate-400">{m.numero_membre}</span></td>
                  <td className="py-2 pr-2">
                    <select value={m.statut} onChange={(e) => changerStatut(m.id, e.target.value)} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-2 py-1 text-xs">
                      {STATUTS.map((s) => <option key={s} value={s}>{STATUT_MEMBRE_LABELS[s] || s}</option>)}
                    </select>
                  </td>
                  <td className="py-2 pr-2">
                    <select value={m.role} onChange={(e) => changerRole(m.id, e.target.value)} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-2 py-1 text-xs">
                      <OptionsRoles />
                    </select>
                  </td>
                  <td className="py-2 pr-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      statutAdhesion(m.id) === 'paye' ? 'badge-paye' : statutAdhesion(m.id) === 'partiel' ? 'badge-partiel' : 'badge-non-paye'
                    }`}>
                      {STATUT_COTISATION_LABELS[statutAdhesion(m.id)] || statutAdhesion(m.id)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {onglet === 'infos' && estSuperAdmin && (
        <div className="space-y-3">
          <div className="relative max-w-sm">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={rechercheInfos}
              onChange={(e) => setRechercheInfos(e.target.value)}
              placeholder="Rechercher un membre..."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent py-2 pl-9 pr-3 text-sm"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {membres
              .filter((m) => {
                if (!rechercheInfos) return true;
                const cible = `${m.prenom} ${m.nom} ${m.numero_membre} ${m.email || ''}`.toLowerCase();
                return cible.includes(rechercheInfos.toLowerCase());
              })
              .map((m) => (
                <div key={m.id} className="rounded-xl bg-white dark:bg-slate-800 p-4 shadow space-y-3">
                  <div className="flex items-center gap-3">
                    {m.photo ? (
                      <img src={m.photo} alt={m.prenom} className="w-12 h-12 rounded-full object-cover shrink-0" />
                    ) : (
                      <i className="fa-solid fa-circle-user text-4xl text-slate-300 shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{m.prenom} {m.nom}</p>
                      <p className="text-xs text-slate-400">{m.numero_membre}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        statutAdhesion(m.id) === 'paye' ? 'badge-paye' : statutAdhesion(m.id) === 'partiel' ? 'badge-partiel' : 'badge-non-paye'
                      }`}>
                        {STATUT_COTISATION_LABELS[statutAdhesion(m.id)] || statutAdhesion(m.id)}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                        {STATUT_MEMBRE_LABELS[m.statut] || m.statut}
                      </span>
                    </div>
                  </div>

                  <dl className="grid grid-cols-1 gap-y-1.5 text-xs">
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-400">Rôle</dt>
                      <dd className="text-right text-slate-700 dark:text-slate-200">{ROLE_LABELS[m.role] || m.role}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-400">E-mail</dt>
                      <dd className="text-right text-slate-700 dark:text-slate-200 truncate">{m.email || '—'}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-400">Téléphone</dt>
                      <dd className="text-right text-slate-700 dark:text-slate-200">{m.telephone || '—'}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-400">Filière</dt>
                      <dd className="text-right text-slate-700 dark:text-slate-200">{m.filiere || '—'}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-400">Niveau</dt>
                      <dd className="text-right text-slate-700 dark:text-slate-200">{m.niveau || '—'}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-400">Promotion</dt>
                      <dd className="text-right text-slate-700 dark:text-slate-200">{m.promotion || '—'}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-400">Inscrit le</dt>
                      <dd className="text-right text-slate-700 dark:text-slate-200">
                        {m.created_at ? new Date(m.created_at).toLocaleDateString('fr-FR') : '—'}
                      </dd>
                    </div>
                  </dl>
                </div>
              ))}
            {membres.length === 0 && <p className="text-sm text-slate-400">Aucun membre trouvé.</p>}
          </div>
        </div>
      )}

      {onglet === 'cotisations' && (
        <div className="rounded-xl bg-white dark:bg-slate-800 p-5 shadow max-w-md">
          {configMsg && <p className="mb-3 text-sm text-green-700 dark:text-green-300">{configMsg}</p>}
          <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
            Le droit d'adhésion est dû une seule fois par tout nouveau membre. La cotisation mensuelle dépend du rôle :
            membre simple ou rôle du bureau (trésorier, secrétaire général, resp. communication, président, super admin).
          </p>
          <form onSubmit={enregistrerConfig} className="space-y-3">
            <div>
              <label className="text-xs text-slate-500">Année</label>
              <input type="number" value={config.annee} onChange={(e) => setConfig((c) => ({ ...c, annee: Number(e.target.value) }))} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-1.5 text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-500">Droit d'adhésion, une fois (FCFA)</label>
              <input type="number" value={config.montant_adhesion} onChange={(e) => setConfig((c) => ({ ...c, montant_adhesion: Number(e.target.value) }))} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-1.5 text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-500">Cotisation mensuelle - Membre (FCFA)</label>
              <input type="number" value={config.montant_membre} onChange={(e) => setConfig((c) => ({ ...c, montant_membre: Number(e.target.value) }))} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-1.5 text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-500">Cotisation mensuelle - Rôles du bureau (FCFA)</label>
              <input type="number" value={config.montant_bureau} onChange={(e) => setConfig((c) => ({ ...c, montant_bureau: Number(e.target.value) }))} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-1.5 text-sm" />
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
              <p className="text-sm font-medium mb-2">Numéros Mobile Money de l'association</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Affichés aux membres pour qu'ils sachent où envoyer leur paiement avant de le déclarer.
              </p>
              <div className="space-y-2">
                {MOYENS_PAIEMENT.map((m) => (
                  <div key={m.value} className="flex items-center gap-2">
                    <img src={m.logo} alt={m.label} className="h-6 w-6 object-contain shrink-0" />
                    <input
                      type="tel"
                      placeholder={`Numéro ${m.label}`}
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
                  <h3 className="font-semibold">Membre créé avec succès</h3>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Transmettez ces identifiants au membre. Le mot de passe ne sera plus affiché ensuite.
                </p>
                <div className="rounded-lg bg-slate-50 dark:bg-slate-700 p-3 text-sm space-y-1 font-mono">
                  <p><span className="text-slate-400">Numéro :</span> {createResult.numeroMembre}</p>
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
                  <input required placeholder="Prénom" value={createForm.prenom} onChange={(e) => setCreateForm((f) => ({ ...f, prenom: e.target.value }))} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-1.5 text-sm" />
                </div>
                <input required type="email" placeholder="E-mail" value={createForm.email} onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-1.5 text-sm" />
                <input required placeholder="Téléphone" value={createForm.telephone} onChange={(e) => setCreateForm((f) => ({ ...f, telephone: e.target.value }))} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-1.5 text-sm" />
                <div className="grid grid-cols-3 gap-3">
                  <input placeholder="Filière" value={createForm.filiere} onChange={(e) => setCreateForm((f) => ({ ...f, filiere: e.target.value }))} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-1.5 text-sm" />
                  <input placeholder="Niveau" value={createForm.niveau} onChange={(e) => setCreateForm((f) => ({ ...f, niveau: e.target.value }))} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-1.5 text-sm" />
                  <input placeholder="Promotion" value={createForm.promotion} onChange={(e) => setCreateForm((f) => ({ ...f, promotion: e.target.value }))} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-1.5 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500">Rôle</label>
                    <select value={createForm.role} onChange={(e) => setCreateForm((f) => ({ ...f, role: e.target.value }))} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-1.5 text-sm">
                      <OptionsRoles />
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Statut</label>
                    <select value={createForm.statut} onChange={(e) => setCreateForm((f) => ({ ...f, statut: e.target.value }))} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-1.5 text-sm">
                      {STATUTS.map((s) => <option key={s} value={s}>{STATUT_MEMBRE_LABELS[s] || s}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Mot de passe initial (facultatif, min. 8 caractères)</label>
                  <PasswordInput
                    icon={false}
                    minLength={8}
                    placeholder="Laisser vide pour générer automatiquement"
                    value={createForm.password}
                    onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={fermerCreation} className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600">
                    Annuler
                  </button>
                  <button type="submit" disabled={createLoading} className="px-3 py-1.5 text-sm rounded-lg bg-blue-800 text-white disabled:opacity-60">
                    {createLoading ? <i className="fa-solid fa-circle-notch fa-spin" /> : 'Créer le membre'}
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
