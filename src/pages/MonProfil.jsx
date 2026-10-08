import { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PasswordInput from '../components/PasswordInput';
import BadgeMembre from '../components/BadgeMembre';

export default function MonProfil() {
  const { user, refresh } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ nom: user.nom, prenom: user.prenom, email: user.email, telephone: user.telephone, filiere: user.filiere || '', niveau: user.niveau || '', promotion: user.promotion || '' });
  const [photo, setPhoto] = useState(null);
  const [msg, setMsg] = useState('');

  const [pwdForm, setPwdForm] = useState({ motDePasseActuel: '', nouveauMotDePasse: '', confirmation: '' });
  const [pwdLoading, setPwdLoading] = useState(false);

  const [deuxFAActive, setDeuxFAActive] = useState(!!user.two_fa_enabled);
  const [setupDeuxFA, setSetupDeuxFA] = useState(null); // { secret, qrCode }
  const [codeDeuxFA, setCodeDeuxFA] = useState('');
  const [codeDesactivation, setCodeDesactivation] = useState('');
  const [deuxFALoading, setDeuxFALoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (photo) fd.append('photo', photo);
      await api.put(`/membres/${user.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMsg('Fiche mise a jour.');
      showToast('Profil mis a jour.', 'succes');
      refresh();
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur lors de la mise a jour.', 'erreur');
    }
  };

  const changerMotDePasse = async (e) => {
    e.preventDefault();
    if (pwdForm.nouveauMotDePasse.length < 8) {
      showToast('Le nouveau mot de passe doit contenir au moins 8 caracteres.', 'erreur');
      return;
    }
    if (pwdForm.nouveauMotDePasse !== pwdForm.confirmation) {
      showToast('La confirmation ne correspond pas au nouveau mot de passe.', 'erreur');
      return;
    }
    setPwdLoading(true);
    try {
      await api.put('/auth/mot-de-passe', {
        motDePasseActuel: pwdForm.motDePasseActuel,
        nouveauMotDePasse: pwdForm.nouveauMotDePasse,
      });
      showToast('Mot de passe modifie avec succes.', 'succes');
      setPwdForm({ motDePasseActuel: '', nouveauMotDePasse: '', confirmation: '' });
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur lors du changement de mot de passe.', 'erreur');
    } finally {
      setPwdLoading(false);
    }
  };

  const initierDeuxFA = async () => {
    setDeuxFALoading(true);
    try {
      const { data } = await api.post('/auth/2fa/init');
      setSetupDeuxFA(data);
    } catch (err) {
      showToast(err.response?.data?.message || "Erreur lors de l'initialisation.", 'erreur');
    } finally {
      setDeuxFALoading(false);
    }
  };

  const activerDeuxFA = async (e) => {
    e.preventDefault();
    setDeuxFALoading(true);
    try {
      await api.post('/auth/2fa/activer', { code: codeDeuxFA });
      showToast('Double authentification activee.', 'succes');
      setDeuxFAActive(true);
      setSetupDeuxFA(null);
      setCodeDeuxFA('');
      refresh();
    } catch (err) {
      showToast(err.response?.data?.message || 'Code incorrect.', 'erreur');
    } finally {
      setDeuxFALoading(false);
    }
  };

  const desactiverDeuxFA = async (e) => {
    e.preventDefault();
    setDeuxFALoading(true);
    try {
      await api.post('/auth/2fa/desactiver', { code: codeDesactivation });
      showToast('Double authentification desactivee.', 'succes');
      setDeuxFAActive(false);
      setCodeDesactivation('');
      refresh();
    } catch (err) {
      showToast(err.response?.data?.message || 'Code incorrect.', 'erreur');
    } finally {
      setDeuxFALoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mon profil</h1>

      <div className="rounded-xl bg-white dark:bg-slate-800 p-5 shadow flex items-center gap-4">
        {user.photo ? (
          <img src={user.photo} alt={user.prenom} className="w-16 h-16 rounded-full object-cover" />
        ) : (
          <i className="fa-solid fa-circle-user text-6xl text-slate-300" />
        )}
        <div>
          <p className="font-semibold">{user.prenom} {user.nom}</p>
          <p className="text-sm text-slate-400">{user.numero_membre} - {user.role.replace('_', ' ')}</p>
        </div>
      </div>

      <BadgeMembre user={user} />

      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <div className="rounded-xl bg-white dark:bg-slate-800 p-5 shadow">
          {msg && <p className="mb-3 text-sm text-green-700 dark:text-green-300">{msg}</p>}
          <form onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Nom" value={form.nom} onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-1.5 text-sm" />
              <input placeholder="Prenom" value={form.prenom} onChange={(e) => setForm((f) => ({ ...f, prenom: e.target.value }))} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-1.5 text-sm" />
            </div>
            <input placeholder="E-mail" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-1.5 text-sm" />
            <input placeholder="Telephone" value={form.telephone} onChange={(e) => setForm((f) => ({ ...f, telephone: e.target.value }))} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-1.5 text-sm" />
            <div className="grid grid-cols-3 gap-3">
              <input placeholder="Filiere" value={form.filiere} onChange={(e) => setForm((f) => ({ ...f, filiere: e.target.value }))} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-1.5 text-sm" />
              <input placeholder="Niveau" value={form.niveau} onChange={(e) => setForm((f) => ({ ...f, niveau: e.target.value }))} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-1.5 text-sm" />
              <input placeholder="Promotion" value={form.promotion} onChange={(e) => setForm((f) => ({ ...f, promotion: e.target.value }))} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-1.5 text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-500">Photo de profil</label>
              <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files[0])} className="w-full text-sm" />
            </div>
            <button type="submit" className="w-full rounded-lg bg-blue-800 text-white py-2 text-sm font-semibold">Enregistrer</button>
          </form>
        </div>

        <div className="rounded-xl bg-white dark:bg-slate-800 p-5 shadow">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-3">
            <i className="fa-solid fa-key mr-2 text-blue-800 dark:text-blue-300" />
            Changer le mot de passe
          </h2>
          <form onSubmit={changerMotDePasse} className="space-y-3">
            <div>
              <label className="text-xs text-slate-500">Mot de passe actuel</label>
              <PasswordInput
                icon={false}
                value={pwdForm.motDePasseActuel}
                onChange={(e) => setPwdForm((f) => ({ ...f, motDePasseActuel: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Nouveau mot de passe</label>
              <PasswordInput
                icon={false}
                minLength={8}
                value={pwdForm.nouveauMotDePasse}
                onChange={(e) => setPwdForm((f) => ({ ...f, nouveauMotDePasse: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Confirmer le nouveau mot de passe</label>
              <PasswordInput
                icon={false}
                minLength={8}
                value={pwdForm.confirmation}
                onChange={(e) => setPwdForm((f) => ({ ...f, confirmation: e.target.value }))}
                required
              />
            </div>
            <button
              type="submit"
              disabled={pwdLoading}
              className="w-full rounded-lg bg-blue-800 text-white py-2 text-sm font-semibold disabled:opacity-60"
            >
              {pwdLoading ? <i className="fa-solid fa-circle-notch fa-spin" /> : 'Modifier le mot de passe'}
            </button>
          </form>
        </div>
      </div>

      <div className="rounded-xl bg-white dark:bg-slate-800 p-5 shadow max-w-lg">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-1">
          <i className="fa-solid fa-shield-halved mr-2 text-blue-800 dark:text-blue-300" />
          Double authentification (2FA)
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
          Recommandee pour les membres du bureau : un code a 6 chiffres genere par une application
          (Google Authenticator, Microsoft Authenticator...) sera demande a chaque connexion.
        </p>

        {deuxFAActive ? (
          <div className="space-y-3">
            <p className="inline-flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-300">
              <i className="fa-solid fa-circle-check" /> Activee
            </p>
            <form onSubmit={desactiverDeuxFA} className="space-y-2">
              <label className="text-xs text-slate-500">Entrez un code actuel pour desactiver</label>
              <input
                inputMode="numeric"
                maxLength={6}
                value={codeDesactivation}
                onChange={(e) => setCodeDesactivation(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-40 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-1.5 text-sm text-center tracking-widest"
              />
              <button
                type="submit"
                disabled={deuxFALoading || codeDesactivation.length !== 6}
                className="block rounded-lg border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 px-3 py-1.5 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-60"
              >
                Desactiver
              </button>
            </form>
          </div>
        ) : setupDeuxFA ? (
          <form onSubmit={activerDeuxFA} className="space-y-3">
            <div className="flex flex-col items-center gap-2">
              <img src={setupDeuxFA.qrCode} alt="QR code 2FA" className="w-40 h-40 rounded-lg border border-slate-200 dark:border-slate-700" />
              <p className="text-xs text-slate-400 break-all text-center">Ou saisissez la cle : {setupDeuxFA.secret}</p>
            </div>
            <label className="text-xs text-slate-500 block">Code affiche par l'application</label>
            <input
              autoFocus
              inputMode="numeric"
              maxLength={6}
              value={codeDeuxFA}
              onChange={(e) => setCodeDeuxFA(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-40 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-1.5 text-sm text-center tracking-widest"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setSetupDeuxFA(null); setCodeDeuxFA(''); }}
                className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={deuxFALoading || codeDeuxFA.length !== 6}
                className="px-3 py-1.5 text-sm rounded-lg bg-blue-800 text-white disabled:opacity-60"
              >
                Confirmer l'activation
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={initierDeuxFA}
            disabled={deuxFALoading}
            className="rounded-lg bg-blue-800 text-white px-4 py-2 text-sm disabled:opacity-60"
          >
            {deuxFALoading ? <i className="fa-solid fa-circle-notch fa-spin" /> : 'Activer la double authentification'}
          </button>
        )}
      </div>
    </div>
  );
}
