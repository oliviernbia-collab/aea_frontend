import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Logo from '../components/Logo';

export default function MotDePasseOublie() {
  const [identifiant, setIdentifiant] = useState('');
  const [motDePasseTemporaire, setMotDePasseTemporaire] = useState('');
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErreur('');
    setChargement(true);
    try {
      const { data } = await api.post('/auth/mot-de-passe-oublie', { identifiant });
      setMotDePasseTemporaire(data.motDePasseTemporaire);
    } catch (err) {
      setErreur(err.response?.data?.message || 'Aucun compte ne correspond à ces informations.');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-900 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-800 p-8 shadow-xl">
        <div className="flex flex-col items-center gap-2 mb-6">
          <Logo size={56} showText={false} />
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Mot de passe oublié</h1>
        </div>

        {motDePasseTemporaire ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Voici votre nouveau mot de passe temporaire :
            </p>
            <p className="select-all rounded-lg bg-slate-100 dark:bg-slate-700 py-3 px-4 text-lg font-mono font-bold tracking-wide text-blue-900 dark:text-blue-200">
              {motDePasseTemporaire}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Connectez-vous avec ce mot de passe, puis changez-le depuis votre profil.
            </p>
            <Link
              to="/connexion"
              className="inline-block w-full rounded-lg bg-blue-800 py-2.5 text-sm font-semibold text-white hover:bg-blue-900"
            >
              Aller à la connexion
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Téléphone ou e-mail
              </label>
              <input
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent py-2 px-3 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                value={identifiant}
                onChange={(e) => setIdentifiant(e.target.value)}
                required
              />
            </div>
            {erreur && <p className="text-sm text-red-600 dark:text-red-400">{erreur}</p>}
            <button
              type="submit"
              disabled={chargement}
              className="w-full rounded-lg bg-blue-800 py-2.5 text-sm font-semibold text-white hover:bg-blue-900 disabled:opacity-60"
            >
              {chargement ? 'Envoi...' : 'Envoyer'}
            </button>
          </form>
        )}

        <p className="mt-4 text-center text-xs">
          <Link to="/connexion" className="text-blue-700 dark:text-blue-300 hover:underline">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}
