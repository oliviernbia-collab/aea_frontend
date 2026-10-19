import { QRCodeSVG } from 'qrcode.react';
import logoAEA from '../assets/AEA.jpg';
import familleAEA from '../assets/famille.jpeg';

export const LARGEUR = 340;
export const HAUTEUR = 214; // ratio CR80 (85,6 x 54 mm)

// Theme visuel par role (couleur du badge) ; le statut 'honoraire' prend le pas sur le role.
export function getTheme(role, statut) {
  if (statut === 'honoraire') {
    return {
      couleur: '#B8860B',
      couleurFonce: '#7c5a07',
      pills: [{ texte: "MEMBRE D'HONNEUR", bg: '#B8860B' }],
    };
  }
  const BUREAU = {
    president: { couleur: '#dc2626', couleurFonce: '#7f1d1d', label: 'PRÉSIDENT(E)' },
    vice_president: { couleur: '#dc2626', couleurFonce: '#7f1d1d', label: 'VICE-PRÉSIDENT(E)' },
    secretaire_general: { couleur: '#16a34a', couleurFonce: '#14532d', label: 'SECRÉTAIRE GÉNÉRAL(E)' },
    tresorier: { couleur: '#2563eb', couleurFonce: '#1e3a8a', label: 'TRÉSORIER(ÈRE)' },
    resp_communication: { couleur: '#9333ea', couleurFonce: '#581c87', label: 'RESPONSABLE COMMUNICATION' },
    secretaire_organisation: { couleur: '#0d9488', couleurFonce: '#115e59', label: "SEC. À L'ORGANISATION" },
    secretaire_academique: { couleur: '#d97706', couleurFonce: '#92400e', label: 'SEC. AFFAIRES ACADÉMIQUES' },
    secretaire_culturel: { couleur: '#db2777', couleurFonce: '#9d174d', label: 'SEC. AFFAIRES CULTURELLES' },
    commissaire_comptes: { couleur: '#4f46e5', couleurFonce: '#312e81', label: 'COMMISSAIRE AUX COMPTES' },
    secretaire_ideologique: { couleur: '#0891b2', couleurFonce: '#155e75', label: 'SEC. FORMATION IDÉOLOGIQUE' },
    secretaire_social: { couleur: '#65a30d', couleurFonce: '#3f6212', label: 'SEC. AFFAIRES SOCIALES' },
    secretaire_insertion: { couleur: '#ea580c', couleurFonce: '#9a3412', label: 'SEC. INSERTION PROFESSIONNELLE' },
    super_admin: { couleur: '#334155', couleurFonce: '#0f172a', label: 'SUPER ADMINISTRATEUR' },
    sg_adjoint_1: { couleur: '#16a34a', couleurFonce: '#14532d', label: 'ADJOINT AU SG (1)' },
    sg_adjoint_2: { couleur: '#16a34a', couleurFonce: '#14532d', label: 'ADJOINT AU SG (2)' },
    sf_adjoint_1: { couleur: '#2563eb', couleurFonce: '#1e3a8a', label: 'ADJOINT SEC. FINANCES (1)' },
    sf_adjoint_2: { couleur: '#2563eb', couleurFonce: '#1e3a8a', label: 'ADJOINT SEC. FINANCES (2)' },
    com_adjoint_1: { couleur: '#9333ea', couleurFonce: '#581c87', label: 'ADJOINT COMMUNICATION (1)' },
    com_adjoint_2: { couleur: '#9333ea', couleurFonce: '#581c87', label: 'ADJOINT COMMUNICATION (2)' },
    so_adjoint_1: { couleur: '#0d9488', couleurFonce: '#115e59', label: 'ADJOINT ORGANISATION (1)' },
    so_adjoint_2: { couleur: '#0d9488', couleurFonce: '#115e59', label: 'ADJOINT ORGANISATION (2)' },
    saas_adjoint_1: { couleur: '#d97706', couleurFonce: '#92400e', label: 'ADJOINT AFF. ACADÉMIQUES (1)' },
    saas_adjoint_2: { couleur: '#d97706', couleurFonce: '#92400e', label: 'ADJOINT AFF. ACADÉMIQUES (2)' },
    sacs_adjoint_1: { couleur: '#db2777', couleurFonce: '#9d174d', label: 'ADJOINT AFF. CULTURELLES (1)' },
    sacs_adjoint_2: { couleur: '#db2777', couleurFonce: '#9d174d', label: 'ADJOINT AFF. CULTURELLES (2)' },
    cc_adjoint_1: { couleur: '#4f46e5', couleurFonce: '#312e81', label: 'ADJOINT COMMISSAIRE COMPTES' },
    sfi_adjoint_1: { couleur: '#0891b2', couleurFonce: '#155e75', label: 'ADJOINT FORMATION IDÉOLOGIQUE' },
    sase_adjoint_1: { couleur: '#65a30d', couleurFonce: '#3f6212', label: 'ADJOINT AFF. SOCIALES (1)' },
    sase_adjoint_2: { couleur: '#65a30d', couleurFonce: '#3f6212', label: 'ADJOINT AFF. SOCIALES (2)' },
    sipe_adjoint_1: { couleur: '#ea580c', couleurFonce: '#9a3412', label: 'ADJOINT INSERTION PRO. (1)' },
    sipe_adjoint_2: { couleur: '#ea580c', couleurFonce: '#9a3412', label: 'ADJOINT INSERTION PRO. (2)' },
  };
  if (BUREAU[role]) {
    const b = BUREAU[role];
    return {
      couleur: b.couleur,
      couleurFonce: b.couleurFonce,
      pills: [{ texte: b.label, bg: b.couleur }, { texte: 'BUREAU EXÉCUTIF', bg: '#1e293b' }],
    };
  }
  return {
    couleur: '#dc2626',
    couleurFonce: '#7f1d1d',
    pills: [
      { texte: 'CARTE DE MEMBRE', bg: '#dc2626' },
      { texte: statut === 'actif' ? 'MEMBRE ACTIF' : (statut || 'MEMBRE').toUpperCase(), bg: '#d97706' },
    ],
  };
}

export function anneeAcademiqueParDefaut() {
  const maintenant = new Date();
  const debut = maintenant.getMonth() >= 8 ? maintenant.getFullYear() : maintenant.getFullYear() - 1;
  return `${debut} - ${debut + 1}`;
}

export function declencherTelechargement(dataUrl, nomFichier) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = nomFichier;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

const ICONES_VALEURS = [
  { icone: 'fa-book-open', mot: 'ÉDUQUER' },
  { icone: 'fa-handshake', mot: 'UNIR' },
  { icone: 'fa-lightbulb', mot: 'INNOVER' },
  { icone: 'fa-people-group', mot: 'SERVIR' },
];

// Triangle sombre decoratif, present dans le coin superieur gauche de chaque face.
function CoinDecoratif() {
  return (
    <div
      className="absolute top-0 left-0 pointer-events-none"
      style={{
        width: 60,
        height: 60,
        background: 'linear-gradient(135deg, #1e293b 0%, #020617 100%)',
        clipPath: 'polygon(0 0, 100% 0, 0 100%)',
      }}
    />
  );
}

// Vague colorée decorative en bas de carte, teintee selon le theme du role.
function VagueDecorative({ couleur, couleurFonce }) {
  return (
    <svg
      className="absolute bottom-0 left-0 w-full pointer-events-none"
      style={{ height: 50 }}
      viewBox="0 0 340 50"
      preserveAspectRatio="none"
    >
      <path d="M0,22 C65,48 125,2 185,16 C245,30 300,6 340,20 L340,50 L0,50 Z" fill={couleurFonce} opacity="0.35" />
      <path d="M0,32 C70,52 135,12 205,26 C265,38 310,16 340,30 L340,50 L0,50 Z" fill={couleur} />
    </svg>
  );
}

// Signature stylisee (paraphe) rendue en SVG pour un rendu fiable a l'export PNG.
function Signature({ couleur = '#111827' }) {
  return (
    <svg width="58" height="16" viewBox="0 0 58 16" fill="none">
      <path
        d="M2,13 C7,3 10,15 15,7 C19,1 22,14 27,9 C31,5 34,14 39,9 C43,5 45,13 50,8 C53,5 54,10 56,7"
        stroke={couleur}
        strokeWidth="1.3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

// Rendu pur (sans etat) du recto et du verso de la carte de membre AEA.
// Reutilise par BadgeMembre (le membre personnalise sa propre carte) et par
// la page Cartes (le super admin genere en lot la carte de tous les membres).
export default function CarteRectoVerso({ user, nom, prenom, anneeAcademique, photoSrc, rectoRef, versoRef }) {
  const theme = getTheme(user.role, user.statut);
  const qrValue = 'https://aea-ci.site';
  // `crossOrigin="anonymous"` ne doit s'appliquer qu'aux photos chargees par le reseau (ex. Cloudinary) :
  // sur une photo tout juste choisie par l'utilisateur (URL blob: locale, via URL.createObjectURL),
  // cet attribut fait echouer le chargement de l'image dans certains navigateurs et casse la capture
  // html-to-image ("Erreur lors de la generation du badge") sans qu'aucune requete reseau ne soit en jeu.
  const photoEstLocale = photoSrc?.startsWith('blob:') || photoSrc?.startsWith('data:');

  return (
    <>
      {/* RECTO */}
      <div
        ref={rectoRef}
        style={{ width: LARGEUR, height: HAUTEUR, fontFamily: "'Segoe UI', Arial, sans-serif" }}
        className="relative rounded-[18px] overflow-hidden shadow-lg bg-white border border-slate-200"
      >
        <CoinDecoratif />
        <VagueDecorative couleur={theme.couleur} couleurFonce={theme.couleurFonce} />

        {/* Entete */}
        <div className="relative z-10 flex items-center gap-2 px-3 pt-3">
          <img
            src={logoAEA}
            alt="AEA"
            crossOrigin="anonymous"
            className="w-10 h-10 rounded-full object-cover border-2 shadow-sm shrink-0"
            style={{ borderColor: theme.couleur }}
          />
          <div className="leading-[1.1] min-w-0 flex-1">
            <p className="text-[6.5px] font-bold text-slate-900 tracking-wide">ASSOCIATION DES</p>
            <p className="text-[12px] font-extrabold leading-none" style={{ color: theme.couleur }}>ÉTUDIANTS</p>
            <p className="text-[8px] font-bold text-slate-900 tracking-wide">D'ASSOUMOUKRO</p>
          </div>
          <img
            src={familleAEA}
            alt="Famille AEA"
            crossOrigin="anonymous"
            className="w-10 h-10 rounded-full object-cover border-2 shadow-sm shrink-0"
            style={{ borderColor: theme.couleur }}
          />
        </div>
        <p className="relative z-10 text-center text-[5.5px] font-semibold tracking-[1.5px] text-slate-400 mt-1">
          UNITÉ &bull; SOLIDARITÉ &bull; EXCELLENCE
        </p>
        <div className="relative z-10 h-[1.5px] mx-3 mt-1 rounded-full" style={{ background: `linear-gradient(90deg, ${theme.couleur}, transparent)` }} />

        {/* Contenu */}
        <div className="relative z-10 flex gap-2 px-3 mt-2">
          {photoSrc ? (
            <img
              src={photoSrc}
              alt=""
              crossOrigin={photoEstLocale ? undefined : 'anonymous'}
              className="w-16 h-[72px] object-cover rounded-lg border-2 shrink-0 shadow-sm"
              style={{ borderColor: theme.couleur }}
            />
          ) : (
            <div
              className="w-16 h-[72px] rounded-lg border-2 bg-slate-100 flex items-center justify-center shrink-0"
              style={{ borderColor: theme.couleur }}
            >
              <i className="fa-solid fa-user text-2xl text-slate-300" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-1 mb-1">
              {theme.pills.map((p) => (
                <span
                  key={p.texte}
                  className="text-[5.5px] font-bold text-white px-1.5 py-[2px] rounded-full whitespace-nowrap"
                  style={{ background: p.bg }}
                >
                  {p.texte}
                </span>
              ))}
            </div>
            <p className="text-[10.5px] font-extrabold text-slate-900 leading-tight uppercase truncate">
              {prenom} {nom}
            </p>
            <p className="text-[6px] text-slate-400 mt-[3px] leading-none">N&deg; MEMBRE</p>
            <p className="text-[8px] font-bold text-slate-700 leading-tight">{user.numero_membre}</p>

            <div className="flex items-center gap-1 mt-[3px]">
              <i className="fa-solid fa-graduation-cap text-[7px]" style={{ color: theme.couleur }} />
              <p className="text-[5.5px] text-slate-400 leading-none">ANNÉE ACADÉMIQUE</p>
            </div>
            <p className="text-[7px] font-bold leading-tight" style={{ color: theme.couleur }}>{anneeAcademique}</p>

            <div className="flex items-center gap-1 mt-[3px]">
              <i className="fa-solid fa-location-dot text-[7px]" style={{ color: theme.couleur }} />
              <p className="text-[5.5px] text-slate-400 leading-none">ASSOUMOUKRO, CÔTE D'IVOIRE</p>
            </div>
          </div>
        </div>

        {/* Pied de carte : QR + signature, sur la vague coloree */}
        <div className="absolute bottom-0 left-0 right-0 z-10 flex items-end justify-between px-3 pb-2">
          <div className="bg-white p-[3px] rounded-md border" style={{ borderColor: theme.couleur }}>
            <QRCodeSVG
              value={qrValue}
              size={34}
              level="H"
              imageSettings={{ src: logoAEA, height: 10, width: 10, excavate: true }}
            />
          </div>
          <div className="flex flex-col items-end">
            <Signature couleur="#ffffff" />
            <p className="text-[5.5px] font-semibold text-white drop-shadow leading-none mt-[1px]">Le Président</p>
          </div>
        </div>
      </div>

      {/* VERSO */}
      <div
        ref={versoRef}
        style={{ width: LARGEUR, height: HAUTEUR, fontFamily: "'Segoe UI', Arial, sans-serif" }}
        className="relative rounded-[18px] overflow-hidden shadow-lg bg-white border border-slate-200 p-3"
      >
        <CoinDecoratif />
        <VagueDecorative couleur={theme.couleur} couleurFonce={theme.couleurFonce} />

        <div className="relative z-10 flex items-center gap-2">
          <img src={logoAEA} alt="AEA" crossOrigin="anonymous" className="w-7 h-7 rounded-full object-cover border-2" style={{ borderColor: theme.couleur }} />
          <p className="font-extrabold text-[11px] text-slate-900 flex-1">AEA</p>
          <img
            src={familleAEA}
            alt="Famille AEA"
            crossOrigin="anonymous"
            className="w-7 h-7 rounded-full object-cover border-2 shrink-0"
            style={{ borderColor: theme.couleur }}
          />
        </div>

        <h3 className="relative z-10 font-extrabold text-[11px] mt-2" style={{ color: theme.couleur }}>NOTRE MISSION</h3>
        <p className="relative z-10 text-[6.3px] leading-snug mt-[3px] text-slate-600 max-w-[240px]">
          Promouvoir l'union, la solidarité, l'excellence académique et le développement intégral des étudiants d'Assoumoukro.
        </p>

        <div className="relative z-10 grid grid-cols-4 gap-1 mt-2 text-center max-w-[220px]">
          {ICONES_VALEURS.map((v) => (
            <div key={v.mot} className="flex flex-col items-center">
              <div className="w-6 h-6 rounded-full border flex items-center justify-center mb-[2px]" style={{ borderColor: theme.couleur }}>
                <i className={`fa-solid ${v.icone} text-[8px]`} style={{ color: theme.couleur }} />
              </div>
              <p className="text-[5px] font-bold text-slate-700">{v.mot}</p>
            </div>
          ))}
        </div>

        <p className="relative z-10 text-[5px] text-slate-400 mt-2 leading-snug max-w-[250px]">
          CETTE CARTE EST STRICTEMENT PERSONNELLE ET NON TRANSFÉRABLE. ELLE RESTE LA PROPRIÉTÉ DE L'AEA.
          EN CAS DE PERTE, CONTACTEZ LE BUREAU.
        </p>

        <div className="absolute bottom-0 left-0 right-0 z-10 flex items-end justify-between px-3 pb-1">
          <div className="text-[5.5px] font-semibold text-white leading-tight drop-shadow">
            <p><i className="fa-brands fa-facebook-f mr-1" />AEA - ASSOUMOUKRO</p>
            <p className="mt-[1px]"><i className="fa-solid fa-envelope mr-1" />contact-aea@gmail.com</p>
          </div>
          <div className="flex flex-col items-end">
            <Signature couleur="#ffffff" />
            <p className="text-[5.5px] font-semibold text-white drop-shadow leading-none mt-[1px]">Le Président</p>
          </div>
        </div>
      </div>
    </>
  );
}
