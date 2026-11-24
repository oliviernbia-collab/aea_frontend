import { QRCodeSVG } from 'qrcode.react';
import { contacts, initiales, crossOriginPour, vCard } from './outils';

// Format carte de visite standard 85 x 55 mm, rendu a 4 px/mm puis capture en haute resolution.
export const CARTE_LARGEUR = 340;
export const CARTE_HAUTEUR = 220;
export const CARTE_MM = { largeur: 85, hauteur: 55 };

const POLICE = "'Poppins', 'Segoe UI', Arial, sans-serif";

export const MODELES_CARTE = [
  { id: 'or_noir', nom: 'Or & Noir', description: 'Doré et noir, très chic' },
  { id: 'rouge', nom: 'Rouge géométrique', description: 'Facettes rouges, blanc épuré' },
  { id: 'vague', nom: 'Vague bleue', description: 'Blanc et vagues bleues' },
  { id: 'neon', nom: 'Néon', description: 'Bleu nuit et anneau lumineux' },
  { id: 'emeraude', nom: 'Émeraude', description: 'Vert profond et filets dorés' },
  { id: 'minimal', nom: 'Minimaliste', description: 'Blanc, noir, épuré' },
  { id: 'violet', nom: 'Violet', description: 'Dégradé violet en diagonale' },
  { id: 'orange_noir', nom: 'Orange & Noir', description: 'Bandes obliques dynamiques' },
  { id: 'turquoise', nom: 'Turquoise', description: 'Cercles frais et lumineux' },
  { id: 'ivoire', nom: 'Ivoire', description: 'Crème et or, très raffiné' },
];

export const CARTE_EXEMPLE = {
  prenom: 'Koffi',
  nom: 'Yao',
  fonction: 'Développeur web',
  organisation: 'Studio Digital',
  slogan: 'Vos idées, en ligne',
  telephone: '+225 07 00 00 00 00',
  email: 'koffi.yao@email.com',
  site: 'www.studio-digital.ci',
  adresse: 'Abidjan, Côte d’Ivoire',
  photo: null, // logo
};

const nomComplet = (d) => [d.prenom, d.nom].filter(Boolean).join(' ');

// Carte personnelle : aucune entreprise/organisation, c'est la personne elle-meme qui sert de
// "marque" (nom au recto, initiales dans le cercle) et sa fonction remplace le slogan.
export const estPersonnelle = (d) => d.genre === 'personnelle';
const marque = (d) => (estPersonnelle(d) ? nomComplet(d) : d.organisation || nomComplet(d));
const accroche = (d) => (estPersonnelle(d) ? d.fonction : d.slogan);
const organisationVerso = (d) => (estPersonnelle(d) ? '' : d.organisation);

function Logo({ d, taille, couleur, fond = 'transparent', bordure }) {
  if (d.photo) {
    return (
      <img
        src={d.photo}
        alt=""
        crossOrigin={crossOriginPour(d.photo)}
        style={{ width: taille, height: taille, objectFit: 'cover', borderRadius: '50%', border: bordure, display: 'block' }}
      />
    );
  }
  return (
    <div style={{ width: taille, height: taille, borderRadius: '50%', border: bordure || `2px solid ${couleur}`, background: fond, color: couleur, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: `calc(${taille} * 0.38)`, letterSpacing: '0.02em' }}>
      {initiales(marque(d) || nomComplet(d))}
    </div>
  );
}

function Contacts({ d, couleurIcone, fondIcone, couleurTexte, taille = '0.78em', carre = false }) {
  return contacts(d).map((c) => (
    <div key={c.icone} style={{ display: 'flex', alignItems: 'center', gap: '0.6em', marginBottom: '0.38em', fontSize: taille, color: couleurTexte, wordBreak: 'break-all' }}>
      <span style={{ width: '1.7em', height: '1.7em', minWidth: '1.7em', borderRadius: carre ? '0.3em' : '50%', background: fondIcone, color: couleurIcone, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8em' }}>
        <i className={`fa-solid ${c.icone}`} />
      </span>
      <span style={{ lineHeight: 1.2 }}>{c.valeur}</span>
    </div>
  ));
}

const QR = ({ d, taille = 46, couleur = '#000', fond = '#fff' }) => (
  <div style={{ background: fond, padding: 3, borderRadius: 4, lineHeight: 0 }}>
    <QRCodeSVG value={vCard(d)} size={taille} fgColor={couleur} bgColor={fond} level="L" />
  </div>
);

const Centre = ({ children, style }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', ...style }}>
    {children}
  </div>
);

// ------------------------------------------------------------------ OR & NOIR
const OR = 'linear-gradient(135deg, #f6d77a 0%, #c9952f 45%, #8a5a14 100%)';
const orNoir = {
  recto: (d) => (
    <div style={{ position: 'absolute', inset: 0, background: OR }}>
      <Centre>
        <Logo d={d} taille="4.6em" couleur="#1a1a1a" />
        <div style={{ fontWeight: 700, fontSize: '1.5em', color: '#1a1a1a', marginTop: '0.3em' }}>{marque(d)}</div>
        {accroche(d) && <div style={{ fontSize: '0.8em', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#2b2b2b' }}>{accroche(d)}</div>}
      </Centre>
    </div>
  ),
  verso: (d) => (
    <div style={{ position: 'absolute', inset: 0, background: '#0d0d0d' }}>
      <svg viewBox="0 0 340 220" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="or" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f6d77a" /><stop offset="0.5" stopColor="#c9952f" /><stop offset="1" stopColor="#8a5a14" />
          </linearGradient>
        </defs>
        <path d="M0,0 L150,0 C185,40 150,90 115,120 C80,150 95,200 120,220 L0,220 Z" fill="url(#or)" />
        <path d="M150,0 C185,40 150,90 115,120 C80,150 95,200 120,220 L132,220 C105,195 92,152 128,122 C165,90 198,40 165,0 Z" fill="#2a2a2a" />
      </svg>
      <div style={{ position: 'absolute', left: '1.4em', top: '1.4em', width: '9em', textAlign: 'center' }}>
        <Logo d={d} taille="3.4em" couleur="#1a1a1a" bordure="2px solid #1a1a1a" />
        <div style={{ fontWeight: 700, fontSize: '0.95em', color: '#1a1a1a', marginTop: '0.2em' }}>{organisationVerso(d)}</div>
      </div>
      <div style={{ position: 'absolute', left: '1.6em', bottom: '1.2em' }}><QR d={d} taille={40} couleur="#1a1a1a" fond="#e9c46a" /></div>
      <div style={{ position: 'absolute', left: '17.5em', right: '1.2em', top: '1.8em' }}>
        <div style={{ fontWeight: 700, fontSize: '1.35em', color: '#fff', textTransform: 'uppercase', lineHeight: 1.1 }}>{nomComplet(d)}</div>
        {d.fonction && <div style={{ fontSize: '0.8em', color: '#e9c46a', marginTop: '0.2em' }}>{d.fonction}</div>}
        <div style={{ height: 1.5, background: OR, margin: '0.6em 0 0.9em', width: '85%' }} />
        <Contacts d={d} couleurIcone="#0d0d0d" fondIcone="#e9c46a" couleurTexte="#f5f5f5" carre />
      </div>
    </div>
  ),
};

// ------------------------------------------------------------------ ROUGE
const FACETTES = (
  <>
    <polygon points="0,0 90,0 40,70" fill="#b91c1c" /><polygon points="90,0 180,0 130,80" fill="#dc2626" />
    <polygon points="40,70 90,0 130,80" fill="#991b1b" /><polygon points="180,0 260,0 210,90" fill="#b91c1c" />
    <polygon points="130,80 180,0 210,90" fill="#7f1d1d" /><polygon points="260,0 340,0 340,70" fill="#dc2626" />
    <polygon points="210,90 260,0 340,70" fill="#991b1b" /><polygon points="0,0 40,70 0,140" fill="#991b1b" />
    <polygon points="40,70 130,80 80,160" fill="#dc2626" /><polygon points="130,80 210,90 170,170" fill="#b91c1c" />
    <polygon points="210,90 340,70 280,170" fill="#dc2626" /><polygon points="340,70 340,180 280,170" fill="#7f1d1d" />
    <polygon points="0,140 40,70 80,160" fill="#b91c1c" /><polygon points="80,160 130,80 170,170" fill="#991b1b" />
    <polygon points="170,170 210,90 280,170" fill="#7f1d1d" /><polygon points="0,140 80,160 0,220" fill="#dc2626" />
    <polygon points="80,160 170,170 120,220" fill="#b91c1c" /><polygon points="0,220 80,160 120,220" fill="#7f1d1d" />
    <polygon points="170,170 280,170 230,220" fill="#dc2626" /><polygon points="120,220 170,170 230,220" fill="#991b1b" />
    <polygon points="280,170 340,180 340,220" fill="#b91c1c" /><polygon points="230,220 280,170 340,220" fill="#991b1b" />
  </>
);
const rouge = {
  recto: (d) => (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg viewBox="0 0 340 220" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="none">
        {FACETTES}
        <polygon points="0,0 70,0 150,110 70,220 0,220" fill="#f8fafc" />
        <polygon points="88,0 112,0 192,110 112,220 88,220 168,110" fill="#f8fafc" />
      </svg>
      <div style={{ position: 'absolute', right: '1.2em', top: 0, bottom: 0, width: '13em', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <Logo d={d} taille="3.6em" couleur="#fff" bordure="2px solid #fff" />
        <div style={{ fontWeight: 700, color: '#fff', fontSize: '1.4em', textTransform: 'uppercase', marginTop: '0.3em', lineHeight: 1.1 }}>{marque(d)}</div>
        {accroche(d) && <div style={{ color: '#fecaca', fontSize: '0.75em' }}>{accroche(d)}</div>}
      </div>
    </div>
  ),
  verso: (d) => (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg viewBox="0 0 340 220" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="none">
        {FACETTES}
        <polygon points="0,0 160,0 230,110 160,220 0,220" fill="#f1f5f9" />
      </svg>
      <div style={{ position: 'absolute', left: '1.6em', top: '1.6em', width: '19em' }}>
        <div style={{ fontWeight: 700, fontSize: '1.55em', color: '#3f0d12', lineHeight: 1.1 }}>{nomComplet(d)}</div>
        {d.fonction && <div style={{ color: '#dc2626', fontSize: '0.9em', letterSpacing: '0.08em' }}>{d.fonction}</div>}
        <div style={{ marginTop: '0.9em' }}>
          <Contacts d={d} couleurIcone="#dc2626" fondIcone="transparent" couleurTexte="#3f0d12" />
        </div>
      </div>
      <div style={{ position: 'absolute', right: '1.3em', top: '1.4em', textAlign: 'center', color: '#fff', width: '7em' }}>
        <Logo d={d} taille="2.6em" couleur="#fff" bordure="2px solid #fff" />
        <div style={{ fontSize: '0.75em', fontWeight: 700, textTransform: 'uppercase', marginTop: '0.2em' }}>{organisationVerso(d)}</div>
      </div>
      <div style={{ position: 'absolute', right: '1.6em', bottom: '1.2em' }}><QR d={d} taille={42} /></div>
    </div>
  ),
};

// ------------------------------------------------------------------ VAGUE
const vague = {
  recto: (d) => (
    <div style={{ position: 'absolute', inset: 0, background: '#fff' }}>
      <svg viewBox="0 0 340 220" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="none">
        <path d="M0,170 C90,120 190,190 340,130 L340,220 L0,220 Z" fill="#1e40af" />
        <path d="M0,182 C100,140 200,205 340,150 L340,220 L0,220 Z" fill="#3b82f6" />
        <path d="M0,198 C110,165 220,215 340,175 L340,220 L0,220 Z" fill="#1e3a8a" />
        <path d="M0,170 C90,120 190,190 340,130" stroke="#fff" strokeWidth="3" fill="none" />
      </svg>
      <Centre style={{ bottom: '4em' }}>
        <Logo d={d} taille="3.8em" couleur="#1e40af" />
        <div style={{ fontWeight: 800, fontSize: '1.3em', color: '#1e3a8a', textTransform: 'uppercase', marginTop: '0.3em' }}>{marque(d)}</div>
        {accroche(d) && <div style={{ fontSize: '0.75em', color: '#64748b', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{accroche(d)}</div>}
      </Centre>
    </div>
  ),
  verso: (d) => (
    <div style={{ position: 'absolute', inset: 0, background: '#fff' }}>
      <svg viewBox="0 0 340 220" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="none">
        <path d="M200,0 C260,10 310,40 340,90 L340,0 Z" fill="#3b82f6" />
        <path d="M240,0 C290,15 325,45 340,70 L340,0 Z" fill="#1e3a8a" />
        <path d="M0,110 C25,150 40,190 90,220 L0,220 Z" fill="#3b82f6" />
        <path d="M0,140 C20,170 35,200 60,220 L0,220 Z" fill="#1e3a8a" />
      </svg>
      <div style={{ position: 'absolute', left: '2.6em', top: '1.8em', right: '6em' }}>
        <div style={{ fontWeight: 800, fontSize: '1.45em', color: '#1e3a8a', textTransform: 'uppercase', lineHeight: 1.1 }}>{nomComplet(d)}</div>
        {d.fonction && <div style={{ color: '#0ea5e9', fontSize: '0.85em', fontWeight: 700, textTransform: 'uppercase' }}>{d.fonction}</div>}
        <div style={{ marginTop: '1em' }}>
          <Contacts d={d} couleurIcone="#1e3a8a" fondIcone="transparent" couleurTexte="#1e293b" />
        </div>
      </div>
      <div style={{ position: 'absolute', right: '1.5em', bottom: '1.4em' }}><QR d={d} taille={42} couleur="#1e3a8a" /></div>
    </div>
  ),
};

// ------------------------------------------------------------------ NEON
const NUIT = 'radial-gradient(circle at 30% 60%, #1e1b6b 0%, #0b0a2e 70%)';
const anneau = (taille) => ({
  width: taille,
  height: taille,
  borderRadius: '50%',
  background: 'radial-gradient(circle, #1e3a8a 0%, #0b0a2e 75%)',
  boxShadow: '0 0 0 0.45em #38bdf8, 0 0 1.2em 0.5em rgba(56,189,248,0.55)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#e0f2fe',
});
const neon = {
  recto: (d) => (
    <div style={{ position: 'absolute', inset: 0, background: NUIT }}>
      <svg viewBox="0 0 340 220" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="none">
        <path d="M0,0 L340,0 L340,60 L240,60 C215,60 205,85 170,85 C135,85 125,60 100,60 L0,60 Z" fill="#cdeefe" />
      </svg>
      <Centre>
        <div style={anneau('6.5em')}>
          <Logo d={d} taille="3em" couleur="#e0f2fe" bordure="none" />
        </div>
        <div style={{ color: '#e0f2fe', fontWeight: 700, marginTop: '1em', fontSize: '1.05em', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{marque(d)}</div>
      </Centre>
    </div>
  ),
  verso: (d) => (
    <div style={{ position: 'absolute', inset: 0, background: NUIT }}>
      <svg viewBox="0 0 340 220" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="none">
        <path d="M0,0 L340,0 L340,30 C320,45 300,55 260,58 L150,58 C125,58 115,40 100,25 L0,25 Z" fill="#cdeefe" />
      </svg>
      <div style={{ position: 'absolute', left: '1.6em', top: '50%', transform: 'translateY(-45%)' }}>
        <div style={anneau('7em')}>
          <Logo d={d} taille="3.2em" couleur="#e0f2fe" bordure="none" />
        </div>
      </div>
      <div style={{ position: 'absolute', left: '13.2em', top: '0.6em', right: '1em' }}>
        <div style={{ fontWeight: 800, fontSize: '1.35em', color: '#0b0a2e' }}>{nomComplet(d)}</div>
        {d.fonction && <div style={{ fontSize: '0.75em', color: '#1e3a8a' }}>{d.fonction}</div>}
      </div>
      <div style={{ position: 'absolute', left: '13.2em', top: '7.4em', right: '1em' }}>
        <Contacts d={d} couleurIcone="#38bdf8" fondIcone="transparent" couleurTexte="#e0f2fe" />
      </div>
    </div>
  ),
};

// ------------------------------------------------------------------ EMERAUDE
const VERT = 'linear-gradient(140deg, #14532d 0%, #0b3b2a 55%, #062a1f 100%)';
const emeraude = {
  recto: (d) => (
    <div style={{ position: 'absolute', inset: 0, background: VERT }}>
      <svg viewBox="0 0 340 220" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="orE" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f6d77a" /><stop offset="1" stopColor="#b7832a" />
          </linearGradient>
        </defs>
        <path d="M0,95 C25,60 45,25 80,0" stroke="url(#orE)" strokeWidth="2" fill="none" />
        <path d="M340,130 C300,150 280,200 230,220 L340,220 Z" fill="url(#orE)" />
      </svg>
      <Centre>
        <Logo d={d} taille="3.8em" couleur="#e9c46a" />
        <div style={{ color: '#e9c46a', fontSize: '1.55em', letterSpacing: '0.25em', textTransform: 'uppercase', marginTop: '0.3em' }}>{marque(d)}</div>
        {accroche(d) && <div style={{ color: '#e9c46a', fontSize: '0.68em', letterSpacing: '0.2em', textTransform: 'uppercase' }}>— {accroche(d)} —</div>}
      </Centre>
    </div>
  ),
  verso: (d) => (
    <div style={{ position: 'absolute', inset: 0, background: '#0f0f0f' }}>
      <svg viewBox="0 0 340 220" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="vertE" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#14532d" /><stop offset="1" stopColor="#062a1f" />
          </linearGradient>
        </defs>
        <path d="M0,0 L130,0 C150,40 115,80 125,115 C135,150 165,185 140,220 L0,220 Z" fill="url(#vertE)" />
        <path d="M130,0 C150,40 115,80 125,115 C135,150 165,185 140,220" stroke="#e9c46a" strokeWidth="1.5" fill="none" />
        <line x1="240" y1="18" x2="320" y2="18" stroke="#e9c46a" strokeWidth="1.5" />
        <line x1="240" y1="202" x2="320" y2="202" stroke="#e9c46a" strokeWidth="1.5" />
      </svg>
      <div style={{ position: 'absolute', left: '1em', top: '1.4em', width: '9.5em', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Logo d={d} taille="3em" couleur="#e9c46a" />
        <div style={{ color: '#e9c46a', fontSize: '0.8em', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '0.2em' }}>{organisationVerso(d)}</div>
        <div style={{ marginTop: '0.6em' }}><QR d={d} taille={40} couleur="#0b3b2a" fond="#e9c46a" /></div>
      </div>
      <div style={{ position: 'absolute', left: '17em', right: '1em', top: '2.6em' }}>
        <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.3em', textTransform: 'uppercase', lineHeight: 1.1 }}>{nomComplet(d)}</div>
        {d.fonction && <div style={{ color: '#e9c46a', fontSize: '0.78em', textTransform: 'uppercase' }}>{d.fonction}</div>}
        <div style={{ height: 1.5, width: '2.5em', background: '#e9c46a', margin: '0.5em 0 0.8em' }} />
        <Contacts d={d} couleurIcone="#0f0f0f" fondIcone="#e9c46a" couleurTexte="#f5f5f5" />
      </div>
    </div>
  ),
};

// ------------------------------------------------------------------ MINIMALISTE
const minimal = {
  recto: (d) => (
    <div style={{ position: 'absolute', inset: 0, background: '#fff' }}>
      <Centre>
        <Logo d={d} taille="3.6em" couleur="#111" bordure="1.5px solid #111" />
        <div style={{ fontSize: '1.45em', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#111', marginTop: '0.6em' }}>{marque(d)}</div>
        <div style={{ width: '3em', height: 1, background: '#111', margin: '0.5em 0' }} />
        {accroche(d) && <div style={{ fontSize: '0.72em', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#555' }}>{accroche(d)}</div>}
      </Centre>
    </div>
  ),
  verso: (d) => (
    <div style={{ position: 'absolute', inset: 0, background: '#fff', padding: '1.8em 2em' }}>
      <div style={{ fontSize: '1.5em', fontWeight: 300, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#111' }}>
        {d.prenom} <span style={{ fontWeight: 700 }}>{d.nom}</span>
      </div>
      {d.fonction && <div style={{ fontSize: '0.75em', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#666', marginTop: '0.2em' }}>{d.fonction}</div>}
      <div style={{ width: '2.5em', height: 1, background: '#111', margin: '0.9em 0' }} />
      <Contacts d={d} couleurIcone="#111" fondIcone="transparent" couleurTexte="#222" />
      <div style={{ position: 'absolute', right: '1.6em', bottom: '1.4em' }}><QR d={d} taille={42} couleur="#111" /></div>
    </div>
  ),
};

// ------------------------------------------------------------------ VIOLET
const DEGRADE_VIOLET = 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 45%, #db2777 100%)';
const violet = {
  recto: (d) => (
    <div style={{ position: 'absolute', inset: 0, background: DEGRADE_VIOLET }}>
      <svg viewBox="0 0 340 220" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="none">
        <polygon points="0,0 120,0 0,110" fill="#fff" opacity="0.08" />
        <polygon points="340,220 200,220 340,90" fill="#fff" opacity="0.1" />
      </svg>
      <Centre>
        <Logo d={d} taille="3.8em" couleur="#fff" bordure="2px solid #fff" />
        <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.45em', marginTop: '0.4em' }}>{marque(d)}</div>
        {accroche(d) && <div style={{ color: '#f5d0fe', fontSize: '0.78em' }}>{accroche(d)}</div>}
      </Centre>
    </div>
  ),
  verso: (d) => (
    <div style={{ position: 'absolute', inset: 0, background: '#fff' }}>
      <svg viewBox="0 0 340 220" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="violetV" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7c3aed" /><stop offset="1" stopColor="#db2777" />
          </linearGradient>
        </defs>
        <polygon points="230,0 340,0 340,220 160,220" fill="url(#violetV)" />
      </svg>
      <div style={{ position: 'absolute', left: '1.8em', top: '1.8em', width: '17em' }}>
        <div style={{ fontWeight: 800, fontSize: '1.4em', color: '#4c1d95', lineHeight: 1.1 }}>{nomComplet(d)}</div>
        {d.fonction && <div style={{ color: '#db2777', fontSize: '0.82em', fontWeight: 600 }}>{d.fonction}</div>}
        <div style={{ marginTop: '1em' }}><Contacts d={d} couleurIcone="#fff" fondIcone="#7c3aed" couleurTexte="#1f2937" /></div>
      </div>
      <div style={{ position: 'absolute', right: '1.4em', top: '1.4em' }}><Logo d={d} taille="2.6em" couleur="#fff" bordure="2px solid #fff" /></div>
      <div style={{ position: 'absolute', right: '1.4em', bottom: '1.3em' }}><QR d={d} taille={42} couleur="#4c1d95" /></div>
    </div>
  ),
};

// ------------------------------------------------------------------ ORANGE & NOIR
const BANDES = (
  <>
    <polygon points="210,0 260,0 150,220 100,220" fill="#f97316" />
    <polygon points="270,0 290,0 180,220 160,220" fill="#fb923c" />
    <polygon points="300,0 340,0 340,30 230,220 190,220" fill="#f97316" />
  </>
);
const orangeNoir = {
  recto: (d) => (
    <div style={{ position: 'absolute', inset: 0, background: '#111' }}>
      <svg viewBox="0 0 340 220" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="none">{BANDES}</svg>
      <div style={{ position: 'absolute', left: '2em', top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '15em' }}>
        <Logo d={d} taille="3.4em" couleur="#f97316" bordure="2px solid #f97316" />
        <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.4em', textTransform: 'uppercase', marginTop: '0.5em', lineHeight: 1.1 }}>{marque(d)}</div>
        {accroche(d) && <div style={{ color: '#fdba74', fontSize: '0.78em' }}>{accroche(d)}</div>}
      </div>
    </div>
  ),
  verso: (d) => (
    <div style={{ position: 'absolute', inset: 0, background: '#fff' }}>
      <svg viewBox="0 0 340 220" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="none">
        <polygon points="0,0 340,0 340,52 0,52" fill="#111" />
        <polygon points="230,0 262,0 236,52 204,52" fill="#f97316" />
        <polygon points="270,0 284,0 258,52 244,52" fill="#fb923c" />
        <rect x="0" y="210" width="340" height="10" fill="#f97316" />
      </svg>
      <div style={{ position: 'absolute', left: '1.6em', top: '0.9em', color: '#fff' }}>
        <div style={{ fontWeight: 800, fontSize: '1.3em', textTransform: 'uppercase', lineHeight: 1.1 }}>{nomComplet(d)}</div>
        {d.fonction && <div style={{ color: '#fdba74', fontSize: '0.75em' }}>{d.fonction}</div>}
      </div>
      <div style={{ position: 'absolute', left: '1.6em', top: '7em', right: '7em' }}>
        <Contacts d={d} couleurIcone="#fff" fondIcone="#f97316" couleurTexte="#111" carre />
      </div>
      <div style={{ position: 'absolute', right: '1.4em', bottom: '1.6em' }}><QR d={d} taille={44} couleur="#111" /></div>
    </div>
  ),
};

// ------------------------------------------------------------------ TURQUOISE
const turquoise = {
  recto: (d) => (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, #0891b2, #0e7490)' }}>
      <div style={{ position: 'absolute', width: '14em', height: '14em', borderRadius: '50%', background: '#22d3ee', opacity: 0.35, left: '-4em', top: '-5em' }} />
      <div style={{ position: 'absolute', width: '10em', height: '10em', borderRadius: '50%', background: '#a5f3fc', opacity: 0.3, right: '-2.5em', bottom: '-3em' }} />
      <Centre>
        <Logo d={d} taille="4em" couleur="#0e7490" fond="#fff" bordure="none" />
        <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.4em', marginTop: '0.4em' }}>{marque(d)}</div>
        {accroche(d) && <div style={{ color: '#cffafe', fontSize: '0.78em' }}>{accroche(d)}</div>}
      </Centre>
    </div>
  ),
  verso: (d) => (
    <div style={{ position: 'absolute', inset: 0, background: '#f0fdfa' }}>
      <div style={{ position: 'absolute', width: '11em', height: '11em', borderRadius: '50%', background: 'linear-gradient(160deg, #0891b2, #0e7490)', right: '-3em', top: '-3.5em' }} />
      <div style={{ position: 'absolute', width: '5em', height: '5em', borderRadius: '50%', background: '#22d3ee', opacity: 0.5, right: '5.5em', top: '4.5em' }} />
      <div style={{ position: 'absolute', right: '1.3em', top: '1.2em' }}><Logo d={d} taille="2.8em" couleur="#0e7490" fond="#fff" bordure="none" /></div>
      <div style={{ position: 'absolute', left: '1.8em', top: '1.7em', right: '9em' }}>
        <div style={{ fontWeight: 800, fontSize: '1.4em', color: '#134e4a', lineHeight: 1.1 }}>{nomComplet(d)}</div>
        {d.fonction && <div style={{ color: '#0891b2', fontSize: '0.82em', fontWeight: 600 }}>{d.fonction}</div>}
      </div>
      <div style={{ position: 'absolute', left: '1.8em', top: '7.3em', right: '6.5em' }}>
        <Contacts d={d} couleurIcone="#fff" fondIcone="#0891b2" couleurTexte="#134e4a" />
      </div>
      <div style={{ position: 'absolute', right: '1.4em', bottom: '1.3em' }}><QR d={d} taille={42} couleur="#134e4a" /></div>
    </div>
  ),
};

// ------------------------------------------------------------------ IVOIRE
const SERIF = "Georgia, 'Times New Roman', serif";
const ivoire = {
  recto: (d) => (
    <div style={{ position: 'absolute', inset: 0, background: '#faf6ee' }}>
      <div style={{ position: 'absolute', inset: '0.9em', border: '1px solid #b7832a' }} />
      <div style={{ position: 'absolute', inset: '1.2em', border: '0.5px solid #d6b56b' }} />
      <Centre>
        <Logo d={d} taille="3.6em" couleur="#8a5a14" bordure="1.5px solid #b7832a" />
        <div style={{ fontFamily: SERIF, fontSize: '1.6em', color: '#3b2a12', marginTop: '0.45em', letterSpacing: '0.05em' }}>{marque(d)}</div>
        {accroche(d) && <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '0.85em', color: '#8a5a14' }}>{accroche(d)}</div>}
      </Centre>
    </div>
  ),
  verso: (d) => (
    <div style={{ position: 'absolute', inset: 0, background: '#faf6ee' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '0.7em', background: 'linear-gradient(180deg, #d6b56b, #8a5a14)' }} />
      <div style={{ position: 'absolute', left: '2.2em', top: '1.8em', right: '7em' }}>
        <div style={{ fontFamily: SERIF, fontSize: '1.65em', color: '#3b2a12', lineHeight: 1.1 }}>{nomComplet(d)}</div>
        {d.fonction && <div style={{ fontFamily: SERIF, fontStyle: 'italic', color: '#8a5a14', fontSize: '0.9em' }}>{d.fonction}</div>}
        <div style={{ width: '3em', height: 1, background: '#b7832a', margin: '0.8em 0' }} />
        <Contacts d={d} couleurIcone="#8a5a14" fondIcone="transparent" couleurTexte="#3b2a12" />
      </div>
      <div style={{ position: 'absolute', right: '1.5em', top: '1.5em' }}><Logo d={d} taille="2.6em" couleur="#8a5a14" bordure="1.5px solid #b7832a" /></div>
      <div style={{ position: 'absolute', right: '1.5em', bottom: '1.4em' }}><QR d={d} taille={42} couleur="#3b2a12" fond="#faf6ee" /></div>
    </div>
  ),
};

const RENDUS = { or_noir: orNoir, rouge, vague, neon, emeraude, minimal, violet, orange_noir: orangeNoir, turquoise, ivoire };

// Une face (recto ou verso) d'une carte de visite, a sa taille reelle.
export function FaceCarte({ modele, donnees, face, faceRef }) {
  const rendu = RENDUS[modele] || orNoir;
  return (
    <div
      ref={faceRef}
      style={{ width: CARTE_LARGEUR, height: CARTE_HAUTEUR, position: 'relative', overflow: 'hidden', fontFamily: POLICE, fontSize: 10, background: '#fff', textAlign: 'left' }}
    >
      {rendu[face](donnees)}
    </div>
  );
}
