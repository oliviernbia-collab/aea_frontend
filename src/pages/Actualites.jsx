import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import useLiveRefresh from '../hooks/useLiveRefresh';

const CATEGORIES = [
  { value: 'annonce_officielle', label: 'Annonce officielle' },
  { value: 'vie_academique', label: 'Vie academique' },
  { value: 'culture', label: 'Culture' },
  { value: 'social', label: 'Social' },
  { value: 'opportunites', label: 'Opportunites' },
];

export default function Actualites() {
  const { isBureau } = useAuth();
  const { showToast } = useToast();
  const [actus, setActus] = useState([]);
  const [categorie, setCategorie] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ titre: '', texte: '', categorie: 'annonce_officielle', visibilite: 'membres', epingle: false });
  const [image, setImage] = useState(null);
  const [envoi, setEnvoi] = useState(false);

  const charger = async () => {
    const { data } = await api.get('/actualites', { params: categorie ? { categorie } : {} });
    setActus(data);
  };

  useEffect(() => {
    charger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorie]);

  useLiveRefresh('actualites:update', charger);

  const publier = async (e) => {
    e.preventDefault();
    setEnvoi(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append('image', image);
      await api.post('/actualites', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      showToast('Actualite publiee.', 'succes');
      setShowForm(false);
      setForm({ titre: '', texte: '', categorie: 'annonce_officielle', visibilite: 'membres', epingle: false });
      setImage(null);
      charger();
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur lors de la publication.', 'erreur');
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Actualites</h1>
        {isBureau && (
          <button onClick={() => setShowForm(true)} className="rounded-lg bg-blue-800 text-white px-4 py-2 text-sm">
            <i className="fa-solid fa-plus mr-1" /> Publier
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setCategorie('')} className={`text-xs px-3 py-1.5 rounded-full border ${!categorie ? 'bg-blue-800 text-white border-blue-800' : 'border-slate-300 dark:border-slate-600'}`}>
          Toutes
        </button>
        {CATEGORIES.map((c) => (
          <button key={c.value} onClick={() => setCategorie(c.value)} className={`text-xs px-3 py-1.5 rounded-full border ${categorie === c.value ? 'bg-blue-800 text-white border-blue-800' : 'border-slate-300 dark:border-slate-600'}`}>
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {actus.map((a) => (
          <Link key={a.id} to={`/actualites/${a.id}`} className="rounded-xl bg-white dark:bg-slate-800 shadow overflow-hidden hover:shadow-md">
            {a.image && <img src={a.image} alt={a.titre} className="h-36 w-full object-cover" />}
            <div className="p-4">
              {a.epingle === 1 && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 mb-1">
                  <i className="fa-solid fa-thumbtack" /> Epingle
                </span>
              )}
              <span className="block text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">
                {CATEGORIES.find((c) => c.value === a.categorie)?.label}
              </span>
              <h3 className="font-semibold text-slate-900 dark:text-white">{a.titre}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">{a.texte}</p>
              <p className="text-xs text-slate-400 mt-2">{a.auteur_prenom} {a.auteur_nom} - {new Date(a.created_at).toLocaleDateString('fr-FR')}</p>
            </div>
          </Link>
        ))}
        {actus.length === 0 && <p className="text-sm text-slate-400">Aucune actualite.</p>}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 overflow-y-auto">
          <form onSubmit={publier} className="w-full max-w-lg rounded-xl bg-white dark:bg-slate-800 p-5 shadow-xl space-y-3">
            <h3 className="font-semibold">Nouvelle actualite</h3>
            <input required placeholder="Titre" value={form.titre} onChange={(e) => setForm((f) => ({ ...f, titre: e.target.value }))} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-1.5 text-sm" />
            <textarea required placeholder="Texte" rows={4} value={form.texte} onChange={(e) => setForm((f) => ({ ...f, texte: e.target.value }))} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-1.5 text-sm" />
            <select value={form.categorie} onChange={(e) => setForm((f) => ({ ...f, categorie: e.target.value }))} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-1.5 text-sm">
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <select value={form.visibilite} onChange={(e) => setForm((f) => ({ ...f, visibilite: e.target.value }))} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-1.5 text-sm">
              <option value="membres">Reservee aux membres</option>
              <option value="publique">Publique (visible sur le site)</option>
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.epingle} onChange={(e) => setForm((f) => ({ ...f, epingle: e.target.checked }))} />
              Epingler en haut du fil
            </label>
            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} className="w-full text-sm" />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600">Annuler</button>
              <button type="submit" disabled={envoi} className="px-3 py-1.5 text-sm rounded-lg bg-blue-800 text-white disabled:opacity-60">
                {envoi ? <i className="fa-solid fa-circle-notch fa-spin" /> : 'Publier'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
