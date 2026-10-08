import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { QRCodeSVG } from 'qrcode.react';
import { useToast } from '../context/ToastContext';
import logoAEA from '../assets/AEA.jpg';

const LARGEUR = 340;
const HAUTEUR = 214; // ratio CR80 (85,6 x 54 mm)

// Theme visuel par role (couleur du badge) ; le statut 'honoraire' prend le pas sur le role.
function getTheme(role, statut) {
  if (statut === 'honoraire') {
    return { couleur: '#B8860B', couleurFonce: '#7c5a07', pills: [{ texte: "MEMBRE D'HONNEUR", bg: '#B8860B' }] };
  }
  const BUREAU = {
    president: { couleur: '#dc2626', couleurFonce: '#7f1d1d', label: 'PRESIDENT(E)' },
    secretaire_general: { couleur: '#16a34a', couleurFonce: '#14532d', label: 'SECRETAIRE GENERAL(E)' },
    tresorier: { couleur: '#2563eb', couleurFonce: '#1e3a8a', label: 'TRESORIER(ERE)' },
    resp_communication: { couleur: '#9333ea', couleurFonce: '#581c87', label: 'RESP. COMMUNICATION' },
    super_admin: { couleur: '#334155', couleurFonce: '#0f172a', label: 'SUPER ADMINISTRATEUR' },
  };
  if (BUREAU[role]) {
    const b = BUREAU[role];
    return { couleur: b.couleur, couleurFonce: b.couleurFonce, pills: [{ texte: b.label, bg: b.couleur }, { texte: 'BUREAU EXECUTIF', bg: '#64748b' }] };
  }
  return { couleur: '#dc2626', couleurFonce: '#7f1d1d', pills: [{ texte: 'CARTE DE MEMBRE', bg: '#dc2626' }, { texte: 'MEMBRE ACTIF', bg: '#d97706' }] };
}

function anneeAcademiqueParDefaut() {
  const maintenant = new Date();
  const debut = maintenant.getMonth() >= 8 ? maintenant.getFullYear() : maintenant.getFullYear() - 1;
  return `${debut} - ${debut + 1}`;
}

function declencherTelechargement(dataUrl, nomFichier) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = nomFichier;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

const ICONES_VALEURS = [
  { icone: 'fa-book-open', mot: 'EDUQUER' },
  { icone: 'fa-handshake', mot: 'UNIR' },
  { icone: 'fa-lightbulb', mot: 'INNOVER' },
  { icone: 'fa-people-group', mot: 'SERVIR' },
];

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
  const qrValue = `AEA|${user.numero_membre}|${prenomBadge} ${nomBadge}|${user.role}|${user.statut}`;

  const changerPhoto = (e) => {
    const fichier = e.target.files[0];
    if (!fichier) return;
    setPhotoSrc(URL.createObjectURL(fichier));
  };

  const telecharger = async () => {
    setTelechargement(true);
    try {
      const rectoUrl = await toPng(rectoRef.current, { pixelRatio: 3, cacheBust: true });
      declencherTelechargement(rectoUrl, `badge-aea-${user.numero_membre}-recto.png`);
      await new Promise((r) => setTimeout(r, 300));
      const versoUrl = await toPng(versoRef.current, { pixelRatio: 3, cacheBust: true });
      declencherTelechargement(versoUrl, `badge-aea-${user.numero_membre}-verso.png`);
      showToast('Badge telecharge (recto + verso).', 'succes');
    } catch (err) {
      showToast('Erreur lors de la generation du badge.', 'erreur');
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
        Modifiez l'affichage ci-dessous si besoin (le numero de membre ne peut pas etre change), puis telechargez votre badge.
      </p>

      <div className="grid gap-4 lg:grid-cols-[auto_1fr] items-start">
        <div className="flex flex-wrap gap-4 justify-center overflow-x-auto max-w-full">
          {/* RECTO */}
          <div
            ref={rectoRef}
            style={{ width: LARGEUR, height: HAUTEUR }}
            className="relative rounded-2xl overflow-hidden shadow-lg bg-white border border-slate-200"
          >
            <div className="flex items-center gap-2 px-3 pt-3">
              <img src={logoAEA} alt="AEA" crossOrigin="anonymous" className="w-9 h-9 rounded-full object-cover border-2" style={{ borderColor: theme.couleur }} />
              <div className="leading-tight">
                <p className="text-[8px] font-bold text-slate-900" style={{ letterSpacing: '0.4px' }}>ASSOCIATION DES ETUDIANTS</p>
                <p className="text-[8px] font-bold text-slate-900" style={{ letterSpacing: '0.4px' }}>D'ASSOUMOUKRO</p>
              </div>
            </div>
            <p className="text-center text-[6px] tracking-widest text-slate-400 mt-1">UNITE &bull; SOLIDARITE &bull; EXCELLENCE</p>
            <div className="h-[2px] mx-3 mt-1" style={{ background: theme.couleur }} />

            <div className="flex gap-2 px-3 mt-2">
              {photoSrc ? (
                <img src={photoSrc} alt="" crossOrigin="anonymous" className="w-16 h-20 object-cover rounded-lg border border-slate-200 shrink-0" />
              ) : (
                <div className="w-16 h-20 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-user text-2xl text-slate-300" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-1 mb-1">
                  {theme.pills.map((p) => (
                    <span key={p.texte} className="text-[6px] font-bold text-white px-1.5 py-0.5 rounded" style={{ background: p.bg }}>
                      {p.texte}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] font-bold text-slate-900 leading-tight uppercase truncate">{prenomBadge} {nomBadge}</p>
                <p className="text-[7px] text-slate-400 mt-1">N&deg; MEMBRE</p>
                <p className="text-[9px] font-semibold text-slate-700">{user.numero_membre}</p>
                <p className="text-[7px] text-slate-400 mt-1">ANNEE ACADEMIQUE</p>
                <p className="text-[8px] font-semibold" style={{ color: theme.couleur }}>{anneeAcademique}</p>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between px-3 pb-2">
              <div className="bg-white p-0.5 rounded">
                <QRCodeSVG value={qrValue} size={34} level="M" />
              </div>
              <p className="text-[6px] text-slate-400 text-right leading-tight">ASSOUMOUKRO<br />COTE D'IVOIRE</p>
            </div>
          </div>

          {/* VERSO */}
          <div
            ref={versoRef}
            style={{ width: LARGEUR, height: HAUTEUR, background: `linear-gradient(135deg, ${theme.couleur}, ${theme.couleurFonce})` }}
            className="relative rounded-2xl overflow-hidden shadow-lg p-3 text-white"
          >
            <div className="flex items-center gap-2 mb-2">
              <img src={logoAEA} alt="AEA" crossOrigin="anonymous" className="w-6 h-6 rounded-full object-cover border border-white/60" />
              <p className="font-bold text-[10px]">AEA</p>
            </div>
            <h3 className="font-bold text-[11px]">NOTRE MISSION</h3>
            <p className="text-[6.5px] leading-snug mt-1 opacity-90">
              Promouvoir l'union, la solidarite, l'excellence academique et le developpement integral des etudiants d'Assoumoukro.
            </p>
            <div className="grid grid-cols-4 gap-1 mt-2 text-center">
              {ICONES_VALEURS.map((v) => (
                <div key={v.mot}>
                  <i className={`fa-solid ${v.icone} text-[11px]`} />
                  <p className="text-[5px] font-semibold mt-0.5">{v.mot}</p>
                </div>
              ))}
            </div>
            <p className="text-[5px] opacity-80 mt-2 leading-snug text-center px-1">
              CETTE CARTE EST STRICTEMENT PERSONNELLE ET NON TRANSFERABLE. ELLE RESTE LA PROPRIETE DE L'AEA.
              EN CAS DE PERTE, CONTACTEZ LE BUREAU.
            </p>
            <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[5.5px] opacity-90">
              <span><i className="fa-brands fa-facebook-f mr-1" />AEA - ASSOUMOUKRO</span>
              <span><i className="fa-solid fa-envelope mr-1" />contact@aea-assoumoukro.org</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 w-full max-w-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-500">Nom (sur le badge)</label>
              <input value={nomBadge} onChange={(e) => setNomBadge(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-1.5 text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-500">Prenom (sur le badge)</label>
              <input value={prenomBadge} onChange={(e) => setPrenomBadge(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-1.5 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500">Annee academique</label>
            <input value={anneeAcademique} onChange={(e) => setAnneeAcademique(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-1.5 text-sm" />
          </div>
          <div>
            <label className="text-xs text-slate-500">Photo pour le badge</label>
            <input type="file" accept="image/*" onChange={changerPhoto} className="w-full text-sm" />
          </div>
          <div>
            <label className="text-xs text-slate-500">Numero de membre</label>
            <input disabled value={user.numero_membre} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-slate-400 px-3 py-1.5 text-sm cursor-not-allowed" />
          </div>
          <button
            onClick={telecharger}
            disabled={telechargement}
            className="w-full rounded-lg bg-blue-800 text-white py-2 text-sm font-semibold disabled:opacity-60"
          >
            {telechargement ? <i className="fa-solid fa-circle-notch fa-spin" /> : <><i className="fa-solid fa-download mr-1" /> Telecharger mon badge</>}
          </button>
        </div>
      </div>
    </div>
  );
}
