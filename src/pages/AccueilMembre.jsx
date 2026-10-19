import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import useLiveRefresh from '../hooks/useLiveRefresh';
import { STATUT_COTISATION_LABELS } from '../constants/statuts';

function formatFCFA(n) {
  return new Intl.NumberFormat('fr-FR').format(Math.round(Number(n) || 0)) + ' FCFA';
}

function periodeCourante() {
  const d = new Date();
  return { annee: d.getFullYear(), mois: d.getMonth() + 1 };
}

export default function AccueilMembre() {
  const { user } = useAuth();
  const [solde, setSolde] = useState(null);
  const [maFiche, setMaFiche] = useState(null);
  const [actus, setActus] = useState([]);
  const [notifications, setNotifications] = useState([]);
  // Suivi du mois/annee en cours : permet de detecter le changement de mois (ou d'annee)
  // si la page reste ouverte, et de rafraichir automatiquement "Ma cotisation ce mois".
  const [periode, setPeriode] = useState(periodeCourante);

  const chargerSolde = () => api.get('/caisse/solde').then(({ data }) => setSolde(data));
  const chargerMaFiche = () => api.get('/cotisations/ma-fiche').then(({ data }) => setMaFiche(data));
  const chargerActus = () => api.get('/actualites').then(({ data }) => setActus(data.slice(0, 3)));
  const chargerNotifications = () =>
    api.get('/notifications').then(({ data }) => setNotifications(data.filter((n) => !n.lu).slice(0, 5)));

  useEffect(() => {
    chargerSolde();
    chargerActus();
    chargerNotifications();
  }, []);

  useEffect(() => {
    chargerMaFiche();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periode.annee, periode.mois]);

  useEffect(() => {
    const id = setInterval(() => {
      setPeriode((prev) => {
        const actuelle = periodeCourante();
        return prev.annee === actuelle.annee && prev.mois === actuelle.mois ? prev : actuelle;
      });
    }, 60 * 1000);
    return () => clearInterval(id);
  }, []);

  useLiveRefresh('caisse:update', chargerSolde);
  useLiveRefresh('cotisations:update', chargerMaFiche);
  useLiveRefresh('actualites:update', chargerActus);
  useLiveRefresh('notification', chargerNotifications);

  const statutMoisActuel = maFiche?.mois.find((m) => m.mois === periode.mois);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Bonjour {user?.prenom} !</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Numéro de membre : {user?.numero_membre}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link to="/caisse" className="rounded-xl bg-blue-800 text-white p-5 shadow hover:brightness-110">
          <i className="fa-solid fa-wallet text-xl opacity-80" />
          <p className="text-sm mt-2 opacity-90">Solde de la caisse</p>
          <p className="text-2xl font-bold mt-1">{solde ? formatFCFA(solde.solde) : '...'}</p>
        </Link>

        <Link to="/cotisations/ma-fiche" className="rounded-xl bg-white dark:bg-slate-800 p-5 shadow hover:shadow-md">
          <i className="fa-solid fa-user-check text-xl text-blue-800 dark:text-blue-300" />
          <p className="text-sm mt-2 text-slate-500 dark:text-slate-400">Ma cotisation ce mois</p>
          <p className={`text-lg font-bold mt-1 ${
            !maFiche ? 'text-slate-400' :
            statutMoisActuel?.statut === 'paye' ? 'text-green-600' :
            statutMoisActuel?.statut === 'partiel' ? 'text-amber-600' :
            statutMoisActuel?.statut === 'non_du' || !statutMoisActuel ? 'text-slate-400' : 'text-red-600'
          }`}>
            {!maFiche ? 'Chargement...' : statutMoisActuel ? (STATUT_COTISATION_LABELS[statutMoisActuel.statut] || statutMoisActuel.statut) : 'Non configuré'}
          </p>
        </Link>

        <Link to="/messagerie" className="rounded-xl bg-white dark:bg-slate-800 p-5 shadow hover:shadow-md">
          <i className="fa-solid fa-bell text-xl text-blue-800 dark:text-blue-300" />
          <p className="text-sm mt-2 text-slate-500 dark:text-slate-400">Notifications non lues</p>
          <p className="text-2xl font-bold mt-1">{notifications.length}</p>
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl bg-white dark:bg-slate-800 p-5 shadow">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-900 dark:text-white">Dernières actualités</h2>
            <Link to="/actualites" className="text-xs text-blue-700 dark:text-blue-300 hover:underline">Voir tout</Link>
          </div>
          <div className="space-y-3">
            {actus.length === 0 && <p className="text-sm text-slate-400">Aucune actualité.</p>}
            {actus.map((a) => (
              <Link key={a.id} to={`/actualites/${a.id}`} className="block border-b border-slate-100 dark:border-slate-700 pb-2 last:border-0">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{a.titre}</p>
                <p className="text-xs text-slate-400">{new Date(a.created_at).toLocaleDateString('fr-FR')}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-white dark:bg-slate-800 p-5 shadow">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-3">Notifications récentes</h2>
          <div className="space-y-3">
            {notifications.length === 0 && <p className="text-sm text-slate-400">Aucune notification non lue.</p>}
            {notifications.map((n) => (
              <div key={n.id} className="border-b border-slate-100 dark:border-slate-700 pb-2 last:border-0">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{n.titre}</p>
                {n.contenu && <p className="text-xs text-slate-400 line-clamp-1">{n.contenu}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
