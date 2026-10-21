import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CATEGORIES } from '../constants/actualites';
import { fichierEnDataUri } from '../utils/fichier';

export default function ActualiteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isBureau } = useAuth();
  const { showToast } = useToast();
  const [actu, setActu] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [image, setImage] = useState(null);
  const [envoi, setEnvoi] = useState(false);

  const charger = () => {
    api.get(`/actualites/${id}`).then(({ data }) => setActu(data));
  };

  useEffect(() => {
    charger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!actu) return <p className="text-slate-400">Chargement...</p>;

  const ouvrirEdition = () => {
    setForm({ titre: actu.titre, texte: actu.texte, categorie: actu.categorie, visibilite: actu.visibilite, epingle: actu.epingle === 1 });
    setImage(null);
    setEditing(true);
  };

  const enregistrer = async (e) => {
    e.preventDefault();
    setEnvoi(true);
    try {
      const payload = { ...form };
      if (image) payload.image = await fichierEnDataUri(image);
      await api.patch(`/actualites/${id}`, payload);
      showToast('Actualité mise à jour.', 'succes');
      setEditing(false);
      charger();
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur lors de la mise à jour.', 'erreur');
    } finally {
      setEnvoi(false);
    }
  };

  const supprimer = async () => {
    if (!window.confirm('Supprimer définitivement cette actualité ?')) return;
    try {
      await api.delete(`/actualites/${id}`);
      showToast('Actualité supprimée.', 'succes');
      navigate('/actualites');
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur lors de la suppression.', 'erreur');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Link to="/actualites" className="text-sm text-blue-700 dark:text-blue-300 hover:underline">
          <i className="fa-solid fa-arrow-left mr-1" /> Retour aux actualités
        </Link>
        {isBureau && (
          <div className="flex gap-2">
            <button onClick={ouvrirEdition} className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600">
              <i className="fa-solid fa-pen mr-1" /> Modifier
            </button>
            <button onClick={supprimer} className="text-sm px-3 py-1.5 rounded-lg border border-red-300 text-red-600 dark:border-red-700 dark:text-red-400">
              <i className="fa-solid fa-trash mr-1" /> Supprimer
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <form onSubmit={enregistrer} className="rounded-xl bg-white dark:bg-slate-800 p-5 shadow space-y-3">
          <h3 className="font-semibold">Modifier l'actualité</h3>
          <input required placeholder="Titre" value={form.titre} onChange={(e) => setForm((f) => ({ ...f, titre: e.target.value }))} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-1.5 text-sm" />
          <textarea required placeholder="Texte" rows={4} value={form.texte} onChange={(e) => setForm((f) => ({ ...f, texte: e.target.value }))} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-1.5 text-sm" />
          <select value={form.categorie} onChange={(e) => setForm((f) => ({ ...f, categorie: e.target.value }))} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-1.5 text-sm">
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <select value={form.visibilite} onChange={(e) => setForm((f) => ({ ...f, visibilite: e.target.value }))} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-1.5 text-sm">
            <option value="membres">Réservée aux membres</option>
            <option value="publique">Publique (visible sur le site)</option>
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.epingle} onChange={(e) => setForm((f) => ({ ...f, epingle: e.target.checked }))} />
            Épingler en haut du fil
          </label>
          {actu.image && <img src={actu.image} alt="" className="h-24 rounded-lg object-cover" />}
          <div>
            <label className="text-xs text-slate-500">Remplacer l'image (optionnel)</label>
            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} className="w-full text-sm" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setEditing(false)} className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600">Annuler</button>
            <button type="submit" disabled={envoi} className="px-3 py-1.5 text-sm rounded-lg bg-blue-800 text-white disabled:opacity-60">
              {envoi ? <i className="fa-solid fa-circle-notch fa-spin" /> : 'Enregistrer'}
            </button>
          </div>
        </form>
      ) : (
        <article className="rounded-xl bg-white dark:bg-slate-800 shadow overflow-hidden">
          {actu.image && <img src={actu.image} alt={actu.titre} className="w-full max-h-80 object-cover" />}
          <div className="p-6">
            {actu.epingle === 1 && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 mb-2">
                <i className="fa-solid fa-thumbtack" /> Épinglé
              </span>
            )}
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{actu.titre}</h1>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              {actu.auteur_prenom} {actu.auteur_nom} - {new Date(actu.created_at).toLocaleDateString('fr-FR')}
            </p>
            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">{actu.texte}</p>
          </div>
        </article>
      )}
    </div>
  );
}
