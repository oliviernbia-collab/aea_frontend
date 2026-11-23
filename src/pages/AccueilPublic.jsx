import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Logo from '../components/Logo';
import Footer from '../components/Footer';
import BoutonRetourHaut from '../components/BoutonRetourHaut';
import affiche from '../assets/AEA1.webp';
import globe from '../assets/globe.webp';
import globe1 from '../assets/globe1.webp';
import { useAuth } from '../context/AuthContext';
import { TARIFS_DOCUMENTS } from '../constants/documents';

const CATEGORIE_LABEL = {
  annonce_officielle: 'Annonce officielle',
  vie_academique: 'Vie académique',
  culture: 'Culture',
  social: 'Social',
  opportunites: 'Opportunités',
};

export default function AccueilPublic() {
  const { user } = useAuth();
  const [actus, setActus] = useState([]);

  useEffect(() => {
    api.get('/actualites/publiques').then(({ data }) => setActus(data));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <img
        src={globe}
        alt=""
        aria-hidden="true"
        className="animate-roam-a pointer-events-none select-none fixed z-40 top-[12%] left-[6%] w-36 sm:w-52 rounded-full shadow-xl opacity-35 mix-blend-multiply dark:mix-blend-screen dark:opacity-25"
      />
      <img
        src={globe1}
        alt=""
        aria-hidden="true"
        className="animate-roam-b pointer-events-none select-none fixed z-40 top-[55%] right-[8%] w-36 sm:w-52 rounded-full shadow-xl opacity-35 mix-blend-multiply dark:mix-blend-screen dark:opacity-25"
      />

      <header className="bg-blue-900 text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Logo />
          <div className="flex gap-2">
            {user ? (
              <Link to="/accueil" className="rounded-lg bg-amber-500 px-4 py-1.5 text-sm font-semibold hover:bg-amber-600">
                <i className="fa-solid fa-gauge mr-1" /> Mon espace
              </Link>
            ) : (
              <>
                <Link to="/connexion" className="rounded-lg border border-white/40 px-4 py-1.5 text-sm hover:bg-white/10">
                  Connexion
                </Link>
                <Link to="/inscription" className="rounded-lg bg-amber-500 px-4 py-1.5 text-sm font-semibold hover:bg-amber-600">
                  Adhérer
                </Link>
              </>
            )}
          </div>
        </div>
        {/* Services payants ouverts a tous : CV et carte de visite a telecharger en PDF. */}
        <div className="border-y border-white/10 bg-blue-950/40">
          <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-3 sm:flex-row sm:justify-center sm:gap-4">
            <Link
              to="/documents/cv"
              className="relative z-50 flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-blue-900 shadow hover:bg-blue-50 transition"
            >
              <i className="fa-solid fa-file-lines" /> Je veux un CV
              <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs text-white">{TARIFS_DOCUMENTS.cv} FCFA</span>
            </Link>
            <Link
              to="/documents/carte-visite"
              className="relative z-50 flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-amber-600 transition"
            >
              <i className="fa-solid fa-address-card" /> Je veux une carte de visite
              <span className="rounded-full bg-white px-2 py-0.5 text-xs text-amber-600">{TARIFS_DOCUMENTS.carte_visite} FCFA</span>
            </Link>
          </div>
        </div>
        <div className="mx-auto max-w-5xl px-4 pb-16 pt-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold">Association des Étudiants d'Assoumoukro</h1>
          <p className="mt-3 text-blue-100 max-w-2xl mx-auto">
            Entraide, culture et réussite académique. Suivez en temps réel la caisse de l'association, vos
            cotisations et toutes les actualités de l'AEA.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 -mt-10 pb-16">
        <div className="grid gap-4 sm:grid-cols-3 mb-10">
          <div className="rounded-xl bg-white dark:bg-slate-800 p-5 shadow text-center">
            <i className="fa-solid fa-wallet text-2xl text-blue-800 dark:text-blue-300" />
            <p className="mt-2 font-semibold">Transparence financière</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Solde de la caisse visible par tous</p>
          </div>
          <div className="rounded-xl bg-white dark:bg-slate-800 p-5 shadow text-center">
            <i className="fa-solid fa-table-list text-2xl text-blue-800 dark:text-blue-300" />
            <p className="mt-2 font-semibold">Suivi des cotisations</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Mois par mois, pour chaque membre</p>
          </div>
          <div className="rounded-xl bg-white dark:bg-slate-800 p-5 shadow text-center">
            <i className="fa-solid fa-comments text-2xl text-blue-800 dark:text-blue-300" />
            <p className="mt-2 font-semibold">Communication centralisée</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Messages et actualités en un seul endroit</p>
          </div>
        </div>

        <div className="flex justify-center mb-10">
          <img
            src={affiche}
            alt="Affiche de présentation de l'AEA - Association des Étudiants d'Assoumoukro"
            className="relative z-10 w-full max-w-sm rounded-2xl shadow-lg"
          />
        </div>

        <h2 id="actualites" className="text-xl font-bold mb-4 text-slate-900 dark:text-white scroll-mt-4">Actualités publiques</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {actus.length === 0 && <p className="text-sm text-slate-500">Aucune actualité publiée pour le moment.</p>}
          {actus.map((a) => {
            const contenu = (
              <>
                {a.image && <img src={a.image} alt={a.titre} className="h-48 w-full object-contain bg-slate-100 dark:bg-slate-900" />}
                <div className="p-4">
                  {a.epingle === 1 && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 mb-1">
                      <i className="fa-solid fa-thumbtack" /> Épinglé
                    </span>
                  )}
                  <span className="block text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">
                    {CATEGORIE_LABEL[a.categorie]}
                  </span>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{a.titre}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mt-1">{a.texte}</p>
                </div>
              </>
            );
            const className = 'rounded-xl bg-white dark:bg-slate-800 shadow overflow-hidden block';
            return user ? (
              <Link key={a.id} to={`/actualites/${a.id}`} className={`${className} hover:shadow-md transition-shadow`}>
                {contenu}
              </Link>
            ) : (
              <article key={a.id} className={className}>
                {contenu}
              </article>
            );
          })}
        </div>
      </main>

      <Footer />
      <BoutonRetourHaut />
    </div>
  );
}
