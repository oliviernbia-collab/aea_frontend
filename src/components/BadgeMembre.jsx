import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { useToast } from '../context/ToastContext';
import CarteRectoVerso, { anneeAcademiqueParDefaut, declencherTelechargement, getTheme } from './CarteRectoVerso';

export default function BadgeMembre({ user }) {
  const { showToast } = useToast();
  const rectoRef = useRef(null);
  const versoRef = useRef(null);
  const [nomBadge, setNomBadge] = useState(user.nom);
  const [prenomBadge, setPrenomBadge] = useState(user.prenom);
  const [anneeAcademique, setAnneeAcademique] = useState(anneeAcademiqueParDefaut());
  const [photoSrc, setPhotoSrc] = useState(user.photo || null);
  const [telechargement, setTelechargement] = useState(false);

  const theme = getTheme(user.role, user.statut);

  // Convertit en URL data: (base64) plutot qu'un blob: URL.createObjectURL : html-to-image clone
  // la carte dans un <foreignObject> SVG puis re-fetch chaque image pour l'intégrer, et un blob:
  // n'a pas toujours un "backing store" accessible depuis ce contexte clone (ERR_FILE_NOT_FOUND) -
  // une URL data: est auto-suffisante et evite completement le probleme.
  const changerPhoto = (e) => {
    const fichier = e.target.files[0];
    if (!fichier) return;
    const lecteur = new FileReader();
    lecteur.onload = () => setPhotoSrc(lecteur.result);
    lecteur.readAsDataURL(fichier);
  };

  const telecharger = async () => {
    setTelechargement(true);
    try {
      const rectoUrl = await toPng(rectoRef.current, { pixelRatio: 3, cacheBust: true });
      declencherTelechargement(rectoUrl, `badge-aea-${user.numero_membre}-recto.png`);
      await new Promise((r) => setTimeout(r, 300));
      const versoUrl = await toPng(versoRef.current, { pixelRatio: 3, cacheBust: true });
      declencherTelechargement(versoUrl, `badge-aea-${user.numero_membre}-verso.png`);
      showToast('Badge téléchargé (recto + verso).', 'succes');
    } catch (err) {
      showToast('Erreur lors de la génération du badge.', 'erreur');
    } finally {
      setTelechargement(false);
    }
  };

  return (
    <div className="rounded-xl bg-white dark:bg-slate-800 p-5 shadow">
      <h2 className="font-semibold text-slate-900 dark:text-white mb-1">
        <i className="fa-solid fa-id-card mr-2 text-blue-800 dark:text-blue-300" />
        Mon badge de membre
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        Modifiez l'affichage ci-dessous si besoin (le numéro de membre ne peut pas être changé), puis téléchargez votre badge.
      </p>

      <div className="grid gap-4 lg:grid-cols-[auto_1fr] items-start">
        <div className="flex flex-wrap gap-4 justify-center overflow-x-auto max-w-full">
          <CarteRectoVerso
            user={user}
            nom={nomBadge}
            prenom={prenomBadge}
            anneeAcademique={anneeAcademique}
            photoSrc={photoSrc}
            rectoRef={rectoRef}
            versoRef={versoRef}
          />
        </div>

        <div className="space-y-3 w-full max-w-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-500">Nom (sur le badge)</label>
              <input value={nomBadge} onChange={(e) => setNomBadge(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-1.5 text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-500">Prénom (sur le badge)</label>
              <input value={prenomBadge} onChange={(e) => setPrenomBadge(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-1.5 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500">Année académique</label>
            <input value={anneeAcademique} onChange={(e) => setAnneeAcademique(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-1.5 text-sm" />
          </div>
          <div>
            <label className="text-xs text-slate-500">Photo pour le badge</label>
            <input type="file" accept="image/*" onChange={changerPhoto} className="w-full text-sm" />
          </div>
          <div>
            <label className="text-xs text-slate-500">Numéro de membre</label>
            <input disabled value={user.numero_membre} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-slate-400 px-3 py-1.5 text-sm cursor-not-allowed" />
          </div>
          <button
            onClick={telecharger}
            disabled={telechargement}
            className="w-full rounded-lg text-white py-2 text-sm font-semibold disabled:opacity-60 transition"
            style={{ background: theme.couleur }}
          >
            {telechargement ? <i className="fa-solid fa-circle-notch fa-spin" /> : <><i className="fa-solid fa-download mr-1" /> Télécharger mon badge</>}
          </button>
        </div>
      </div>
    </div>
  );
}
