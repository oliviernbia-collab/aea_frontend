import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import PasswordInput from '../components/PasswordInput';

export default function Connexion() {
  const { login, verifierCodeDeuxFA } = useAuth();
  const navigate = useNavigate();
  const [identifiant, setIdentifiant] = useState('');
  const [password, setPassword] = useState('');
  const [erreur, setErreur] = useState('');
  const [loading, setLoading] = useState(false);
  const [tempToken, setTempToken] = useState(null);
  const [code, setCode] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErreur('');
    setLoading(true);
    try {
      const resultat = await login(identifiant, password);
      if (resultat.requiresTwoFactor) {
        setTempToken(resultat.tempToken);
      } else {
        navigate('/accueil');
      }
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur de connexion.');
    } finally {
      setLoading(false);
    }
  };

  const submitCode = async (e) => {
    e.preventDefault();
    setErreur('');
    setLoading(true);
    try {
      await verifierCodeDeuxFA(tempToken, code);
      navigate('/accueil');
    } catch (err) {
      setErreur(err.response?.data?.message || 'Code incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-900 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-800 p-8 shadow-xl">
        <div className="flex flex-col items-center gap-2 mb-6">
          <Logo size={64} showText={false} />
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Espace Membre AEA</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
            Association des Étudiants d'Assoumoukro
          </p>
        </div>

        {erreur && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-900/30 px-3 py-2 text-sm text-red-700 dark:text-red-300">
            <i className="fa-solid fa-circle-exclamation" />
            {erreur}
          </div>
        )}

        {tempToken ? (
          <form onSubmit={submitCode} className="space-y-4">
            <div className="text-center">
              <i className="fa-solid fa-shield-halved text-3xl text-blue-800 dark:text-blue-300 mb-2" />
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Entrez le code à 6 chiffres de votre application d'authentification.
              </p>
            </div>
            <input
              autoFocus
              inputMode="numeric"
              maxLength={6}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent py-2 px-3 text-center text-lg tracking-[0.5em] focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              required
            />
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full rounded-lg bg-blue-800 py-2.5 text-sm font-semibold text-white hover:bg-blue-900 disabled:opacity-60"
            >
              {loading ? <i className="fa-solid fa-circle-notch fa-spin" /> : 'Valider'}
            </button>
            <button
              type="button"
              onClick={() => { setTempToken(null); setCode(''); setErreur(''); }}
              className="w-full text-xs text-slate-500 dark:text-slate-400 hover:underline"
            >
              Retour
            </button>
          </form>
        ) : (
          <>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Téléphone ou e-mail
                </label>
                <div className="relative">
                  <i className="fa-solid fa-user absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent py-2 pl-9 pr-3 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    value={identifiant}
                    onChange={(e) => setIdentifiant(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Mot de passe</label>
                <PasswordInput
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-800 py-2.5 text-sm font-semibold text-white hover:bg-blue-900 disabled:opacity-60"
              >
                {loading ? <i className="fa-solid fa-circle-notch fa-spin" /> : 'Se connecter'}
              </button>
            </form>

            <div className="mt-4 flex justify-between text-xs">
              <Link to="/mot-de-passe-oublie" className="text-blue-700 dark:text-blue-300 hover:underline">
                Mot de passe oublié ?
              </Link>
              <Link to="/inscription" className="text-blue-700 dark:text-blue-300 hover:underline">
                Créer un compte
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
