import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import useLiveRefresh from '../hooks/useLiveRefresh';
import { MODELES_CV } from './documents/ModelesCV';
import { MODELES_CARTE } from './documents/ModelesCarteVisite';

const fcfa = (n) => `${Number(n || 0).toLocaleString('fr-FR')} FCFA`;
const NOMS_MODELES = Object.fromEntries([...MODELES_CV, ...MODELES_CARTE].map((m) => [m.id, m.nom]));
const OPERATEURS = { wave: 'Wave', orange: 'Orange Money', mtn: 'MTN MoMo', moov: 'Moov Money' };

function Tuile({ titre, valeur, detail, icone, couleur }) {
  return (
    <div className="rounded-xl bg-white dark:bg-slate-800 p-4 shadow">
      <p className="text-xs text-slate-500 dark:text-slate-400">
        <i className={`fa-solid ${icone} mr-1 ${couleur}`} /> {titre}
      </p>
      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{valeur}</p>
      {detail && <p className="text-xs text-slate-400">{detail}</p>}
    </div>
  );
}

// Recettes des CV / cartes de visite vendus sur la page d'accueil. Reserve au super admin :
// ces ventes ne figurent pas dans la caisse de l'association, visible par tous les membres.
export default function VentesDocuments() {
  const [donnees, setDonnees] = useState(null);
  const [erreur, setErreur] = useState('');

  const charger = useCallback(async () => {
    try {
      const { data } = await api.get('/documents/ventes');
      setDonnees(data);
      setErreur('');
    } catch (err) {
      setErreur(err.response?.data?.message || 'Impossible de charger les ventes.');
    }
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  useLiveRefresh('documents:ventes', charger);

  if (erreur) return <p className="text-sm text-red-600">{erreur}</p>;
  if (!donnees) return <p className="text-sm text-slate-400">Chargement...</p>;

  const { resume } = donnees;
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        <i className="fa-solid fa-lock mr-1" />
        Visible uniquement par le super administrateur. Ces recettes ne sont pas comptées dans la caisse de l’association.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Tuile titre="Total des ventes" valeur={fcfa(donnees.total)} detail={`dont ${fcfa(donnees.total_mois)} ce mois-ci`} icone="fa-sack-dollar" couleur="text-emerald-600" />
        <Tuile titre="CV vendus" valeur={resume.cv.nombre} detail={fcfa(resume.cv.total)} icone="fa-file-lines" couleur="text-blue-700" />
        <Tuile titre="Cartes de visite vendues" valeur={resume.carte_visite.nombre} detail={fcfa(resume.carte_visite.total)} icone="fa-address-card" couleur="text-amber-600" />
        <Tuile titre="Ce mois-ci" valeur={fcfa(donnees.total_mois)} detail={`CV ${fcfa(resume.cv.total_mois)} • Cartes ${fcfa(resume.carte_visite.total_mois)}`} icone="fa-calendar" couleur="text-slate-500" />
      </div>

      <div className="rounded-xl bg-white dark:bg-slate-800 shadow overflow-x-auto">
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
                <td className="p-3 whitespace-nowrap">{new Date(v.paye_le).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</td>
                <td className="p-3 whitespace-nowrap">
                  {v.type === 'cv' ? 'CV' : 'Carte de visite'} <span className="text-xs text-slate-400">({NOMS_MODELES[v.modele] || v.modele})</span>
                </td>
                <td className="p-3">{[v.prenom, v.nom].filter((x) => x && x !== 'null').join(' ') || '—'}</td>
                <td className="p-3 whitespace-nowrap">
                  {OPERATEURS[v.payment_method] || v.payment_method}
                  <span className="block text-xs text-slate-400">{v.payer_phone}</span>
                </td>
                <td className="p-3 text-right font-semibold whitespace-nowrap">{fcfa(v.montant)}</td>
              </tr>
            ))}
            {donnees.ventes.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-slate-400">Aucune vente pour le moment.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
