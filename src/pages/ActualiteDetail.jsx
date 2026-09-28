import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function ActualiteDetail() {
  const { id } = useParams();
  const [actu, setActu] = useState(null);

  useEffect(() => {
    api.get(`/actualites/${id}`).then(({ data }) => setActu(data));
  }, [id]);

  if (!actu) return <p className="text-slate-400">Chargement...</p>;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Link to="/actualites" className="text-sm text-blue-700 dark:text-blue-300 hover:underline">
        <i className="fa-solid fa-arrow-left mr-1" /> Retour aux actualites
      </Link>
      <article className="rounded-xl bg-white dark:bg-slate-800 shadow overflow-hidden">
        {actu.image && <img src={actu.image} alt={actu.titre} className="w-full max-h-80 object-cover" />}
        <div className="p-6">
          {actu.epingle === 1 && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 mb-2">
              <i className="fa-solid fa-thumbtack" /> Epingle
            </span>
          )}
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">{actu.titre}</h1>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            {actu.auteur_prenom} {actu.auteur_nom} - {new Date(actu.created_at).toLocaleDateString('fr-FR')}
          </p>
          <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">{actu.texte}</p>
        </div>
      </article>
    </div>
  );
}
