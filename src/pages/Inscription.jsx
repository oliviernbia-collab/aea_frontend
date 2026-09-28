import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Logo from '../components/Logo';
import PasswordInput from '../components/PasswordInput';

const CHAMPS = [
  { name: 'nom', label: 'Nom', type: 'text' },
  { name: 'prenom', label: 'Prenom', type: 'text' },
  { name: 'email', label: 'E-mail', type: 'email' },
  { name: 'telephone', label: 'Telephone', type: 'tel' },
  { name: 'filiere', label: 'Filiere', type: 'text' },
  { name: 'niveau', label: 'Niveau', type: 'text' },
  { name: 'promotion', label: 'Promotion', type: 'select' },
];

const PROMOTIONS = [
  { value: 'membre', label: 'Membre' },
  { value: 'tresorier', label: 'Tresorier(ere)' },
  { value: 'secretaire_general', label: 'Secretaire General(e)' },
  { value: 'resp_communication', label: 'Resp. Communication' },
  { value: 'president', label: 'President(e)' },
];

export default function Inscription() {
  const navigate = useNavigate();
  const [form, setForm] = useState({});
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');
  const [loading, setLoading] = useState(false);

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setErreur('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/inscription', form);
      setSucces(`Inscription enregistree ! Votre numero de membre : ${data.numeroMembre}. Elle sera validee par le Secretaire General avant votre premiere connexion.`);
      setTimeout(() => navigate('/connexion'), 4000);
    } catch (err) {
      setErreur(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-900 px-4 py-8">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-800 p-8 shadow-xl">
        <div className="flex flex-col items-center gap-2 mb-6">
          <Logo size={56} showText={false} />
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Adhesion a l'AEA</h1>
        </div>

        {erreur && (
          <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/30 px-3 py-2 text-sm text-red-700 dark:text-red-300">
            {erreur}
          </div>
        )}
        {succes && (
          <div className="mb-4 rounded-lg bg-green-50 dark:bg-green-900/30 px-3 py-2 text-sm text-green-700 dark:text-green-300">
            {succes}
          </div>
        )}

        {!succes && (
          <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CHAMPS.map((c) => (
              <div key={c.name} className={c.name === 'email' || c.name === 'telephone' ? 'sm:col-span-2' : ''}>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">{c.label}</label>
                {c.type === 'select' ? (
                  <select
                    name={c.name}
                    onChange={change}
                    defaultValue=""
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent py-2 px-3 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="" disabled>Selectionner...</option>
                    {PROMOTIONS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={c.type}
                    name={c.name}
                    onChange={change}
                    required={['nom', 'prenom', 'email', 'telephone'].includes(c.name)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent py-2 px-3 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                )}
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Mot de passe</label>
              <PasswordInput
                name="password"
                minLength={8}
                onChange={change}
                required
                icon={false}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="sm:col-span-2 w-full rounded-lg bg-blue-800 py-2.5 text-sm font-semibold text-white hover:bg-blue-900 disabled:opacity-60"
            >
              {loading ? <i className="fa-solid fa-circle-notch fa-spin" /> : "S'inscrire"}
            </button>
          </form>
        )}

        <p className="mt-4 text-center text-xs">
          <Link to="/connexion" className="text-blue-700 dark:text-blue-300 hover:underline">
            Deja membre ? Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
