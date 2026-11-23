import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import Logo from '../components/Logo';
import DocumentCV from '../components/documents/ModelesCV';
import { FaceCarte } from '../components/documents/ModelesCarteVisite';
import { Apercu } from './DocumentEditeur';
import { memoriserAchat, tokenAchat } from '../utils/achatsDocuments';
import { telechargerCartePdf, telechargerCvPdf } from '../utils/exportDocument';

const DELAI_POLLING_MS = 4000;
const DUREE_MAX_POLLING_MS = 5 * 60 * 1000;

const nomFichier = (commande, suffixe = '') => {
  const nom = [commande.donnees?.prenom, commande.donnees?.nom].filter(Boolean).join('-').toLowerCase().replace(/[^a-z0-9-]+/gi, '') || 'document';
  return `${commande.type === 'cv' ? 'cv' : 'carte-visite'}-${nom}${suffixe}.pdf`;
};

// Page de retour apres paiement : attend la confirmation de l'operateur, puis propose le PDF.
export default function CommandeDocument() {
  const { reference } = useParams();
  const [params] = useSearchParams();
  const { showToast } = useToast();
  const token = params.get('token') || tokenAchat(reference);
  const [commande, setCommande] = useState(null);
  const [erreur, setErreur] = useState('');
  const [attenteDepassee, setAttenteDepassee] = useState(false);
  const [telechargement, setTelechargement] = useState(null);
  const debut = useRef(Date.now());
  const cvRef = useRef(null);
  const rectoRef = useRef(null);
  const versoRef = useRef(null);

  const charger = useCallback(async () => {
    if (!token) {
      setErreur("Lien incomplet : le code d'accès à cette commande est manquant.");
      return null;
    }
    try {
      const { data } = await api.get(`/documents/commandes/${encodeURIComponent(reference)}`, { params: { token } });
      setCommande(data);
      memoriserAchat({ reference, token, type: data.type, statut: data.statut });
      return data;
    } catch (err) {
      setErreur(err.response?.data?.message || 'Impossible de retrouver cette commande.');
      return null;
    }
  }, [reference, token]);

  useEffect(() => {
    let annule = false;
    let minuteur;
    const boucle = async () => {
      const data = await charger();
      if (annule || !data || data.statut !== 'pending') return;
      if (Date.now() - debut.current > DUREE_MAX_POLLING_MS) {
        setAttenteDepassee(true);
        return;
      }
      minuteur = setTimeout(boucle, DELAI_POLLING_MS);
    };
    boucle();
    return () => {
      annule = true;
      clearTimeout(minuteur);
    };
  }, [charger]);

  const telecharger = async (planche = false) => {
    setTelechargement(planche ? 'planche' : 'pdf');
    try {
      if (commande.type === 'cv') {
        await telechargerCvPdf(cvRef.current, nomFichier(commande));
      } else {
        await telechargerCartePdf(rectoRef.current, versoRef.current, nomFichier(commande, planche ? '-planche-a4' : ''), { planche });
      }
      showToast('PDF téléchargé.', 'succes');
    } catch {
      showToast('Erreur lors de la génération du PDF. Réessayez.', 'erreur');
    } finally {
      setTelechargement(null);
    }
  };

  const relancer = () => {
    debut.current = Date.now();
    setAttenteDepassee(false);
    charger();
  };

  const lienEditeur = commande?.type === 'carte_visite' ? '/documents/carte-visite' : '/documents/cv';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <header className="bg-blue-900 text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4">
          <Logo />
          <Link to="/" className="rounded-lg border border-white/40 px-3 py-1.5 text-sm hover:bg-white/10">
            <i className="fa-solid fa-arrow-left mr-1" /> Accueil
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {erreur && (
          <div className="rounded-xl bg-white dark:bg-slate-800 p-6 shadow text-center space-y-3">
            <i className="fa-solid fa-triangle-exclamation text-3xl text-amber-500" />
            <p>{erreur}</p>
            <Link to="/" className="inline-block text-blue-800 dark:text-blue-300 hover:underline">Retour à l’accueil</Link>
          </div>
        )}

        {!erreur && !commande && (
          <div className="flex justify-center py-16">
            <i className="fa-solid fa-circle-notch fa-spin text-3xl text-blue-800 dark:text-blue-300" />
          </div>
        )}

        {commande?.statut === 'pending' && (
          <div className="rounded-xl bg-white dark:bg-slate-800 p-6 shadow text-center space-y-3 max-w-lg mx-auto">
            {attenteDepassee ? (
              <>
                <i className="fa-solid fa-hourglass-half text-3xl text-amber-500" />
                <p className="font-semibold">Paiement toujours en attente</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Si vous avez validé le paiement sur votre téléphone, il peut falloir encore quelques instants. Vous pourrez aussi
                  revenir plus tard sur cette page (lien enregistré sur cet appareil).
                </p>
                <button onClick={relancer} className="rounded-lg bg-blue-800 text-white px-4 py-2 text-sm">
                  <i className="fa-solid fa-rotate mr-1" /> Vérifier à nouveau
                </button>
              </>
            ) : (
              <>
                <i className="fa-solid fa-circle-notch fa-spin text-3xl text-blue-800 dark:text-blue-300" />
                <p className="font-semibold">Confirmation du paiement en cours…</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Validez le paiement de {Number(commande.montant)} FCFA sur votre téléphone si ce n’est pas déjà fait. Cette page se met à
                  jour automatiquement.
                </p>
              </>
            )}
          </div>
        )}

        {commande?.statut === 'error' && (
          <div className="rounded-xl bg-white dark:bg-slate-800 p-6 shadow text-center space-y-3 max-w-lg mx-auto">
            <i className="fa-solid fa-circle-xmark text-3xl text-red-600" />
            <p className="font-semibold">Le paiement n’a pas abouti</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Aucun montant n’a été débité pour ce document. Votre saisie est conservée : vous pouvez réessayer.
            </p>
            <Link to={lienEditeur} className="inline-block rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2 text-sm">
              Réessayer le paiement
            </Link>
          </div>
        )}

        {commande?.statut === 'success' && commande.donnees && (
          <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,320px)] items-start">
            <div>
              <Apercu type={commande.type} modele={commande.modele} donnees={commande.donnees} largeurMax={commande.type === 'cv' ? 560 : 480} />
            </div>
            <div className="rounded-xl bg-white dark:bg-slate-800 p-5 shadow space-y-3 md:sticky md:top-4">
              <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                <i className="fa-solid fa-circle-check mr-1" /> Paiement confirmé, merci !
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Téléchargez votre {commande.type === 'cv' ? 'CV' : 'carte de visite'} autant de fois que nécessaire. Ce lien reste enregistré
                sur cet appareil (rubrique « Vos achats »).
              </p>
              <button onClick={() => telecharger(false)} disabled={!!telechargement} className="w-full rounded-lg bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2.5 disabled:opacity-60">
                {telechargement === 'pdf' ? <i className="fa-solid fa-circle-notch fa-spin" /> : <><i className="fa-solid fa-file-pdf mr-1" /> Télécharger en PDF</>}
              </button>
              {commande.type === 'carte_visite' && (
                <button onClick={() => telecharger(true)} disabled={!!telechargement} className="w-full rounded-lg border border-blue-800 text-blue-800 dark:text-blue-300 dark:border-blue-300 py-2.5 text-sm disabled:opacity-60">
                  {telechargement === 'planche' ? <i className="fa-solid fa-circle-notch fa-spin" /> : <><i className="fa-solid fa-print mr-1" /> Planche A4 de 10 cartes (impression)</>}
                </button>
              )}
              <p className="text-[11px] text-slate-400">Référence : {commande.reference}</p>
            </div>

            {/* Exemplaire a taille reelle, hors ecran, servant uniquement a la capture du PDF. */}
            <div style={{ position: 'fixed', top: 0, left: -10000, pointerEvents: 'none' }} aria-hidden="true">
              {commande.type === 'cv' ? (
                <DocumentCV ref={cvRef} modele={commande.modele} donnees={commande.donnees} />
              ) : (
                <>
                  <FaceCarte faceRef={rectoRef} modele={commande.modele} donnees={commande.donnees} face="recto" />
                  <FaceCarte faceRef={versoRef} modele={commande.modele} donnees={commande.donnees} face="verso" />
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
