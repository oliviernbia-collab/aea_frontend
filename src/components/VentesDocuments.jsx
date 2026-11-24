import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import useLiveRefresh from '../hooks/useLiveRefresh';
import { MODELES_CV } from './documents/ModelesCV';
import { MODELES_CARTE } from './documents/ModelesCarteVisite';

const fcfa = (n) => `${Number(n || 0).toLocaleString('fr-FR')} FCFA`;
const NOMS_MODELES = Object.fromEntries([...MODELES_CV, ...MODELES_CARTE].map((m) => [m.id, m.nom]));
const OPERATEURS = { wave: 'Wave', orange: 'Orange Money', mtn: 'MTN MoMo', moov: 'Moov Money' };

// Date locale au format AAAA-MM-JJ (toISOString() donnerait la date UTC, decalee le soir).
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function periodes() {
  const auj = new Date();
  const il_y_a = (jours) => new Date(auj.getFullYear(), auj.getMonth(), auj.getDate() - jours);
  return [
    { cle: 'tout', label: 'Tout', du: '', au: '' },
    { cle: 'aujourdhui', label: "Aujourd'hui", du: iso(auj), au: iso(auj) },
    { cle: '7j', label: '7 derniers jours', du: iso(il_y_a(6)), au: iso(auj) },
    { cle: 'mois', label: 'Ce mois-ci', du: iso(new Date(auj.getFullYear(), auj.getMonth(), 1)), au: iso(auj) },
    {
      cle: 'mois_dernier',
      label: 'Mois dernier',
      du: iso(new Date(auj.getFullYear(), auj.getMonth() - 1, 1)),
      au: iso(new Date(auj.getFullYear(), auj.getMonth(), 0)),
    },
    { cle: 'annee', label: 'Cette année', du: iso(new Date(auj.getFullYear(), 0, 1)), au: iso(auj) },
  ];
}

const nomAcheteur = (v) => [v.prenom, v.nom].filter((x) => x && x !== 'null').join(' ') || '—';
const dateVente = (v) => new Date(v.paye_le).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
const libelleDocument = (v) => (v.type === 'cv' ? 'CV' : 'Carte de visite');

function Tuile({ titre, valeur, detail, icone, couleur }) {
  return (
    <div className="rounded-xl bg-white dark:bg-slate-800 p-4 shadow min-w-0">
      <p className="text-xs text-slate-500 dark:text-slate-400">
        <i className={`fa-solid ${icone} mr-1 ${couleur}`} /> {titre}
      </p>
      <p className="mt-1 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white break-words">{valeur}</p>
      {detail && <p className="text-xs text-slate-400">{detail}</p>}
    </div>
  );
}

// Recettes des CV / cartes de visite vendus sur la page d'accueil. Reserve au super admin :
// ces ventes ne figurent pas dans la caisse de l'association, visible par tous les membres.
export default function VentesDocuments() {
  const [filtre, setFiltre] = useState({ cle: 'tout', du: '', au: '' });
  const [donnees, setDonnees] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  const charger = useCallback(async () => {
    setChargement(true);
    try {
      const params = {};
      if (filtre.du) params.du = filtre.du;
      if (filtre.au) params.au = filtre.au;
      const { data } = await api.get('/documents/ventes', { params });
      setDonnees(data);
      setErreur('');
    } catch (err) {
      setErreur(err.response?.data?.message || 'Impossible de charger les ventes.');
    } finally {
      setChargement(false);
    }
  }, [filtre.du, filtre.au]);

  useEffect(() => {
    charger();
  }, [charger]);

  useLiveRefresh('documents:ventes', charger);

  const choisirPeriode = (p) => setFiltre({ cle: p.cle, du: p.du, au: p.au });
  const changerDate = (champ) => (e) => setFiltre((f) => ({ ...f, cle: 'perso', [champ]: e.target.value }));
  const dateInvalide = filtre.du && filtre.au && filtre.du > filtre.au;

  const libellePeriode = () => {
    const fr = (d) => new Date(`${d}T00:00:00`).toLocaleDateString('fr-FR');
    if (!filtre.du && !filtre.au) return 'depuis le début';
    if (filtre.du && filtre.au) return filtre.du === filtre.au ? `le ${fr(filtre.du)}` : `du ${fr(filtre.du)} au ${fr(filtre.au)}`;
    return filtre.du ? `depuis le ${fr(filtre.du)}` : `jusqu'au ${fr(filtre.au)}`;
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        <i className="fa-solid fa-lock mr-1" />
        Visible uniquement par le super administrateur. Ces recettes ne sont pas comptées dans la caisse de l’association.
      </p>

      {/* Filtre par periode */}
      <div className="rounded-xl bg-white dark:bg-slate-800 p-4 shadow space-y-3">
        <div className="flex flex-wrap gap-2">
          {periodes().map((p) => (
            <button
              key={p.cle}
              type="button"
              onClick={() => choisirPeriode(p)}
              className={`rounded-full border px-3 py-1.5 text-xs whitespace-nowrap transition ${
                filtre.cle === p.cle
                  ? 'bg-blue-800 border-blue-800 text-white'
                  : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:flex sm:items-end">
          <label className="text-xs text-slate-500 dark:text-slate-400 min-w-0">
            Du
            <input
              type="date"
              value={filtre.du}
              max={filtre.au || undefined}
              onChange={changerDate('du')}
              className="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs text-slate-500 dark:text-slate-400 min-w-0">
            Au
            <input
              type="date"
              value={filtre.au}
              min={filtre.du || undefined}
              onChange={changerDate('au')}
              className="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm"
            />
          </label>
          {(filtre.du || filtre.au) && (
            <button
              type="button"
              onClick={() => setFiltre({ cle: 'tout', du: '', au: '' })}
              className="col-span-2 sm:col-span-1 rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <i className="fa-solid fa-xmark mr-1" /> Effacer
            </button>
          )}
        </div>
        {dateInvalide && <p className="text-xs text-red-600">La date de début est après la date de fin.</p>}
      </div>

      {erreur && <p className="text-sm text-red-600">{erreur}</p>}
      {!donnees && !erreur && <p className="text-sm text-slate-400">Chargement...</p>}

      {donnees && (
        <div className={`space-y-4 transition-opacity ${chargement ? 'opacity-60' : ''}`}>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Période : {libellePeriode()} — {donnees.nombre} vente{donnees.nombre > 1 ? 's' : ''}
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Tuile titre="Total des ventes" valeur={fcfa(donnees.total)} detail={`${donnees.nombre} document${donnees.nombre > 1 ? 's' : ''} vendu${donnees.nombre > 1 ? 's' : ''}`} icone="fa-sack-dollar" couleur="text-emerald-600" />
            <Tuile titre="CV vendus" valeur={donnees.resume.cv.nombre} detail={fcfa(donnees.resume.cv.total)} icone="fa-file-lines" couleur="text-blue-700" />
            <Tuile titre="Cartes de visite vendues" valeur={donnees.resume.carte_visite.nombre} detail={fcfa(donnees.resume.carte_visite.total)} icone="fa-address-card" couleur="text-amber-600" />
          </div>

          {/* Petit ecran : une carte par vente plutot qu'un tableau a faire defiler de cote. */}
          <div className="space-y-2 md:hidden">
            {donnees.ventes.map((v) => (
              <div key={v.reference} className="rounded-xl bg-white dark:bg-slate-800 p-3 shadow">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{nomAcheteur(v)}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {libelleDocument(v)} ({NOMS_MODELES[v.modele] || v.modele})
                    </p>
                  </div>
                  <p className="font-semibold text-sm whitespace-nowrap">{fcfa(v.montant)}</p>
                </div>
                <div className="mt-2 flex flex-wrap justify-between gap-x-3 text-xs text-slate-400">
                  <span>{dateVente(v)}</span>
                  <span>
                    {OPERATEURS[v.payment_method] || v.payment_method} • {v.payer_phone}
                  </span>
                </div>
              </div>
            ))}
            {donnees.ventes.length === 0 && <p className="text-sm text-center text-slate-400 py-4">Aucune vente sur cette période.</p>}
          </div>

          {/* Ecran large : tableau */}
          <div className="hidden md:block rounded-xl bg-white dark:bg-slate-800 shadow overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">
                  <th className="p-3">Date</th>
                  <th className="p-3">Document</th>
                  <th className="p-3">Au nom de</th>
                  <th className="p-3">Paiement</th>
                  <th className="p-3 text-right">Montant</th>
                </tr>
              </thead>
              <tbody>
                {donnees.ventes.map((v) => (
                  <tr key={v.reference} className="border-b border-slate-50 dark:border-slate-700/50">
                    <td className="p-3 whitespace-nowrap">{dateVente(v)}</td>
                    <td className="p-3 whitespace-nowrap">
                      {libelleDocument(v)} <span className="text-xs text-slate-400">({NOMS_MODELES[v.modele] || v.modele})</span>
                    </td>
                    <td className="p-3">{nomAcheteur(v)}</td>
                    <td className="p-3 whitespace-nowrap">
                      {OPERATEURS[v.payment_method] || v.payment_method}
                      <span className="block text-xs text-slate-400">{v.payer_phone}</span>
                    </td>
                    <td className="p-3 text-right font-semibold whitespace-nowrap">{fcfa(v.montant)}</td>
                  </tr>
                ))}
                {donnees.ventes.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-slate-400">Aucune vente sur cette période.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {donnees.ventes.length >= 500 && (
            <p className="text-xs text-slate-400">Seules les 500 ventes les plus récentes de la période sont listées (les totaux, eux, sont complets).</p>
          )}
        </div>
      )}
    </div>
  );
}
