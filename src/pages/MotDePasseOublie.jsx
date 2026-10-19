import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Logo from '../components/Logo';

export default function MotDePasseOublie() {
  const [identifiant, setIdentifiant] = useState('');
  const [envoye, setEnvoye] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    await api.post('/auth/mot-de-passe-oublie', { identifiant });
    setEnvoye(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-900 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-800 p-8 shadow-xl">
        <div className="flex flex-col items-center gap-2 mb-6">
          <Logo size={56} showText={false} />
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Mot de passe oublié</h1>
        </div>

        {envoye ? (
          <p className="text-sm text-green-700 dark:text-green-300 text-center">
            Si ce compte existe, des instructions de réinitialisation ont été envoyées par SMS ou e-mail.
          </p>
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
            <button type="submit" className="w-full rounded-lg bg-blue-800 py-2.5 text-sm font-semibold text-white hover:bg-blue-900">
              Envoyer
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
