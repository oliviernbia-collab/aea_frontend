import { forwardRef, useLayoutEffect, useRef, useState } from 'react';
import {
  lignes,
  decouperLangue,
  niveauEnPourcentage,
  contacts,
  experiencesRemplies,
  formationsRemplies,
  crossOriginPour,
} from './outils';

// Format A4 a 96 dpi : le CV est toujours rendu a cette taille reelle, puis reduit a l'ecran
// (ApercuAdapte) ou capture tel quel pour le PDF.
export const CV_LARGEUR = 794;
export const CV_HAUTEUR = 1123;

const POLICE = "'Poppins', 'Segoe UI', Arial, sans-serif";

export const MODELES_CV = [
  { id: 'moderne', nom: 'Moderne', description: 'Colonne bleu nuit, frise chronologique' },
  { id: 'elegant', nom: 'Élégant', description: 'Clair et sobre, photo encadrée' },
  { id: 'dynamique', nom: 'Dynamique', description: 'Bandeaux bleus et barres de niveau' },
  { id: 'eclat', nom: 'Éclat', description: 'Bleu profond et touches orange' },
  { id: 'bandeau', nom: 'Bandeau', description: 'Grand en-tête, accents jaunes' },
  { id: 'minimal', nom: 'Minimaliste', description: 'Noir et blanc, sobre et classique' },
  { id: 'emeraude', nom: 'Émeraude', description: 'Colonne verte à droite' },
  { id: 'bordeaux', nom: 'Bordeaux', description: 'En-tête bordeaux, deux colonnes' },
  { id: 'etudiant', nom: 'Étudiant', description: 'Colonne arrondie, barres de niveau' },
  { id: 'corail', nom: 'Corail', description: 'Moderne, sections en blocs' },
];

export const CV_EXEMPLE = {
  prenom: 'Aya',
  nom: 'Kouassi',
  titre: 'Assistante comptable',
  photo: null,
  profil:
    "Diplômée en comptabilité, rigoureuse et organisée, je souhaite mettre mes compétences au service d'une entreprise dynamique et évoluer dans un environnement exigeant.",
  telephone: '+225 07 00 00 00 00',
  email: 'aya.kouassi@email.com',
  adresse: 'Abidjan, Côte d’Ivoire',
  site: '',
  experiences: [
    { periode: '2024 – 2025', poste: 'Stagiaire comptable', entreprise: 'Cabinet Expertise CI', details: 'Saisie des pièces comptables\nRapprochements bancaires\nPréparation des déclarations fiscales' },
    { periode: '2023', poste: 'Assistante administrative', entreprise: 'Société ABC', details: 'Accueil et orientation\nClassement et archivage' },
  ],
  formations: [
    { periode: '2022 – 2024', diplome: 'BTS Finance Comptabilité', etablissement: 'Institut Supérieur, Abidjan' },
    { periode: '2021', diplome: 'Baccalauréat série G2', etablissement: 'Lycée Moderne, Assoumoukro' },
  ],
  competences: 'Comptabilité générale\nMicrosoft Excel\nSage Saari\nGestion administrative',
  langues: 'Français : Courant\nAnglais : Intermédiaire',
  qualites: 'Rigueur\nSens de l’organisation\nEsprit d’équipe',
  interets: 'Lecture\nSport\nVoyages',
};

function Photo({ src, taille, bordure, rond = true, style }) {
  const commun = {
    width: taille,
    height: rond ? taille : taille * 1.2,
    borderRadius: rond ? '50%' : '0.8em',
    border: bordure,
    objectFit: 'cover',
    display: 'block',
    flexShrink: 0,
    ...style,
  };
  if (src) return <img src={src} alt="" crossOrigin={crossOriginPour(src)} style={commun} />;
  return (
    <div style={{ ...commun, background: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <i className="fa-solid fa-user" style={{ fontSize: '3.5em', color: '#f8fafc' }} />
    </div>
  );
}

const Puce = ({ children, couleur, style }) => (
  <div style={{ display: 'flex', gap: '0.55em', marginBottom: '0.3em', ...style }}>
    <span style={{ color: couleur, lineHeight: 1.45 }}>•</span>
    <span style={{ lineHeight: 1.45 }}>{children}</span>
  </div>
);

function ListePuces({ texte, couleur, style }) {
  return lignes(texte).map((l) => (
    <Puce key={l} couleur={couleur} style={style}>
      {l}
    </Puce>
  ));
}

function Paragraphe({ texte, style }) {
  if (!texte) return null;
  return <p style={{ margin: 0, lineHeight: 1.6, whiteSpace: 'pre-line', textAlign: 'justify', ...style }}>{texte}</p>;
}

// ---------------------------------------------------------------- 1. MODERNE
function Moderne({ d }) {
  const bleu = '#1e3a8a';
  const Titre = ({ icone, children }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.7em', margin: '1.4em 0 0.8em' }}>
      <span style={{ width: '2.2em', height: '2.2em', borderRadius: '50%', background: bleu, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95em' }}>
        <i className={`fa-solid ${icone}`} />
      </span>
      <span style={{ fontWeight: 700, color: bleu, fontSize: '1.15em', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{children}</span>
      <span style={{ flex: 1, height: 1, background: '#cbd5e1' }} />
    </div>
  );
  const TitreGauche = ({ children }) => (
    <div style={{ fontWeight: 700, fontSize: '1.05em', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.25)', paddingBottom: '0.35em', margin: '1.5em 0 0.7em' }}>
      {children}
    </div>
  );
  const Frise = ({ periode, titre, sousTitre, details }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '7.5em 1fr', gap: '1em', marginBottom: '0.9em' }}>
      <div style={{ color: bleu, fontWeight: 700, fontSize: '0.92em' }}>{periode}</div>
      <div style={{ borderLeft: '2px solid #cbd5e1', paddingLeft: '1em' }}>
        <div style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.95em' }}>{titre}</div>
        {sousTitre && <div style={{ color: '#475569', fontSize: '0.92em' }}>{sousTitre}</div>}
        {details && <div style={{ marginTop: '0.3em', fontSize: '0.92em' }}><ListePuces texte={details} couleur={bleu} /></div>}
      </div>
    </div>
  );
  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <aside style={{ width: '33%', background: '#1e293b', color: '#e2e8f0', padding: '2.6em 1.8em' }}>
        <Photo src={d.photo} taille="11.5em" bordure="0.35em solid #fff" style={{ margin: '0 auto' }} />
        {contacts(d).length > 0 && (
          <>
            <TitreGauche>Contact</TitreGauche>
            {contacts(d).map((c) => (
              <div key={c.icone} style={{ display: 'flex', gap: '0.8em', marginBottom: '0.55em', fontSize: '0.9em', wordBreak: 'break-word' }}>
                <i className={`fa-solid ${c.icone}`} style={{ width: '1em', marginTop: '0.25em' }} />
                <span>{c.valeur}</span>
              </div>
            ))}
          </>
        )}
        {d.competences && (<><TitreGauche>Compétences</TitreGauche><ListePuces texte={d.competences} couleur="#93c5fd" /></>)}
        {d.langues && (<><TitreGauche>Langues</TitreGauche><ListePuces texte={d.langues} couleur="#93c5fd" /></>)}
        {d.qualites && (<><TitreGauche>Qualités</TitreGauche><ListePuces texte={d.qualites} couleur="#93c5fd" /></>)}
        {d.interets && (<><TitreGauche>Centres d’intérêt</TitreGauche><ListePuces texte={d.interets} couleur="#93c5fd" /></>)}
      </aside>
      <main style={{ flex: 1, padding: '2.8em 2.4em' }}>
        <div style={{ fontSize: '2.7em', fontWeight: 800, lineHeight: 1.05, textTransform: 'uppercase', color: '#0f172a' }}>
          {d.prenom} <span style={{ color: bleu }}>{d.nom}</span>
        </div>
        {d.titre && <div style={{ fontSize: '1.25em', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#334155', marginTop: '0.3em' }}>{d.titre}</div>}
        <div style={{ width: '3.5em', height: 3, background: bleu, marginTop: '0.8em' }} />
        {d.profil && (<><Titre icone="fa-user">Profil</Titre><Paragraphe texte={d.profil} /></>)}
        {experiencesRemplies(d).length > 0 && (
          <>
            <Titre icone="fa-briefcase">Expérience professionnelle</Titre>
            {experiencesRemplies(d).map((e, i) => (
              <Frise key={i} periode={e.periode} titre={e.poste} sousTitre={e.entreprise} details={e.details} />
            ))}
          </>
        )}
        {formationsRemplies(d).length > 0 && (
          <>
            <Titre icone="fa-graduation-cap">Formation</Titre>
            {formationsRemplies(d).map((f, i) => (
              <Frise key={i} periode={f.periode} titre={f.diplome} sousTitre={f.etablissement} />
            ))}
          </>
        )}
      </main>
    </div>
  );
}

// ---------------------------------------------------------------- 2. ELEGANT
function Elegant({ d }) {
  const marine = '#1b2a4e';
  const Titre = ({ children }) => (
    <div style={{ fontWeight: 800, color: marine, fontSize: '1.45em', textTransform: 'uppercase', margin: '1.2em 0 0.6em' }}>{children}</div>
  );
  return (
    <div style={{ position: 'relative', height: '100%', background: 'linear-gradient(160deg, #f8fafc 0%, #eef2f7 100%)' }}>
      <svg viewBox="0 0 794 1123" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="none">
        <polygon points="420,0 794,0 794,46 600,46" fill={marine} />
        <polygon points="250,0 430,0 420,22 260,22" fill="#94a3b8" />
        <path d="M0,1050 C200,1010 420,1100 794,1040 L794,1123 L0,1123 Z" fill="#cbd5e1" />
        <path d="M0,1080 C260,1050 470,1123 794,1090 L794,1123 L0,1123 Z" fill={marine} />
      </svg>
      <div style={{ position: 'relative', display: 'flex', height: '100%', padding: '3em 2.6em 5em' }}>
        <aside style={{ width: '38%', paddingRight: '1.8em' }}>
          <Photo src={d.photo} taille="13em" bordure={`0.9em solid ${marine}`} style={{ margin: '0 auto' }} />
          {contacts(d).length > 0 && (
            <>
              <Titre>Contact</Titre>
              {contacts(d).map((c) => (
                <div key={c.icone} style={{ display: 'flex', alignItems: 'center', gap: '0.8em', marginBottom: '0.6em', fontSize: '0.92em', wordBreak: 'break-word' }}>
                  <span style={{ width: '2em', height: '2em', minWidth: '2em', borderRadius: '50%', background: marine, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85em' }}>
                    <i className={`fa-solid ${c.icone}`} />
                  </span>
                  {c.valeur}
                </div>
              ))}
            </>
          )}
          {formationsRemplies(d).length > 0 && (
            <>
              <Titre>Formation</Titre>
              {formationsRemplies(d).map((f, i) => (
                <div key={i} style={{ marginBottom: '0.8em' }}>
                  <div style={{ fontWeight: 700, color: marine }}>{f.diplome}</div>
                  <div style={{ fontWeight: 600, fontSize: '0.9em' }}>{f.etablissement}</div>
                  <div style={{ fontSize: '0.9em', color: '#475569' }}>{f.periode}</div>
                </div>
              ))}
            </>
          )}
          {d.competences && (<><Titre>Compétences</Titre><ListePuces texte={d.competences} couleur={marine} /></>)}
          {d.langues && (<><Titre>Langues</Titre><ListePuces texte={d.langues} couleur={marine} /></>)}
        </aside>
        <main style={{ flex: 1, borderLeft: '2px solid #94a3b8', paddingLeft: '1.8em', paddingTop: '6em' }}>
          <div style={{ fontSize: '2.9em', fontWeight: 800, color: marine, lineHeight: 1.05, textTransform: 'uppercase' }}>
            {d.prenom} {d.nom}
          </div>
          {d.titre && <div style={{ fontSize: '1.35em', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#334155', marginTop: '0.2em' }}>{d.titre}</div>}
          <div style={{ height: 3, background: '#94a3b8', marginTop: '0.9em', width: '75%' }} />
          {d.profil && (<><Titre>Profil</Titre><Paragraphe texte={d.profil} /></>)}
          {experiencesRemplies(d).length > 0 && (
            <>
              <Titre>Expérience</Titre>
              {experiencesRemplies(d).map((e, i) => (
                <div key={i} style={{ marginBottom: '1em' }}>
                  <div style={{ fontWeight: 700, color: marine, fontSize: '1.05em' }}>{e.entreprise || e.poste}</div>
                  {e.entreprise && e.poste && <div>{e.poste}</div>}
                  <div style={{ color: '#475569', fontSize: '0.92em' }}>{e.periode}</div>
                  <div style={{ marginTop: '0.3em', fontSize: '0.93em' }}><ListePuces texte={e.details} couleur={marine} /></div>
                </div>
              ))}
            </>
          )}
          {d.qualites && (<><Titre>Qualités</Titre><ListePuces texte={d.qualites} couleur={marine} /></>)}
          {d.interets && (<><Titre>Centres d’intérêt</Titre><div>{lignes(d.interets).join(' • ')}</div></>)}
        </main>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 3. DYNAMIQUE
function Dynamique({ d }) {
  const bleu = '#1d4ed8';
  const Ruban = ({ icone, children }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.7em', background: `linear-gradient(90deg, ${bleu}, #3b82f6)`, clipPath: 'polygon(0 0, 92% 0, 100% 100%, 0 100%)', padding: '0.5em 1em', margin: '1.6em -1.8em 0.9em 0', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#fff' }}>
      <i className={`fa-solid ${icone}`} /> {children}
    </div>
  );
  const Titre = ({ icone, children }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8em', margin: '1.5em 0 0.8em' }}>
      <span style={{ width: '2.4em', height: '2.4em', borderRadius: '50%', border: `2px solid ${bleu}`, color: bleu, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <i className={`fa-solid ${icone}`} />
      </span>
      <div style={{ flex: 1, borderBottom: `2px solid ${bleu}`, paddingBottom: '0.2em', fontWeight: 800, fontSize: '1.3em', color: '#0f172a', textTransform: 'uppercase' }}>{children}</div>
    </div>
  );
  const Etape = ({ periode, titre, sousTitre, details }) => (
    <div style={{ borderLeft: `2px solid #93c5fd`, marginLeft: '1.2em', paddingLeft: '1.4em', paddingBottom: '0.8em', position: 'relative' }}>
      <span style={{ position: 'absolute', left: '-0.45em', top: '0.35em', width: '0.8em', height: '0.8em', borderRadius: '50%', background: bleu }} />
      <div style={{ color: bleu, fontWeight: 700, fontSize: '0.92em' }}>{periode}</div>
      <div style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.95em' }}>{titre}</div>
      {sousTitre && <div style={{ color: '#475569', fontSize: '0.92em' }}>{sousTitre}</div>}
      {details && <div style={{ fontSize: '0.92em', marginTop: '0.2em' }}><ListePuces texte={details} couleur={bleu} /></div>}
    </div>
  );
  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <aside style={{ width: '36%', background: 'linear-gradient(180deg, #0b1a33, #0f2447)', color: '#e2e8f0', padding: '2.6em 1.8em', borderRight: `0.4em solid ${bleu}` }}>
        <Photo src={d.photo} taille="12em" bordure="0.45em solid #fff" style={{ margin: '0 auto', boxShadow: `0 0 0 0.35em ${bleu}` }} />
        {contacts(d).length > 0 && (
          <>
            <Ruban icone="fa-address-card">Contact</Ruban>
            {contacts(d).map((c) => (
              <div key={c.icone} style={{ display: 'flex', alignItems: 'center', gap: '0.8em', marginBottom: '0.6em', fontSize: '0.9em', wordBreak: 'break-word' }}>
                <span style={{ width: '2em', height: '2em', minWidth: '2em', borderRadius: '50%', border: '1px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8em' }}>
                  <i className={`fa-solid ${c.icone}`} />
                </span>
                {c.valeur}
              </div>
            ))}
          </>
        )}
        {d.langues && (
          <>
            <Ruban icone="fa-language">Langues</Ruban>
            {lignes(d.langues).map((l) => {
              const { langue, niveau } = decouperLangue(l);
              return (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '0.8em', marginBottom: '0.6em', fontSize: '0.9em' }}>
                  <span style={{ width: '42%', textTransform: 'uppercase' }}>{langue}</span>
                  <span style={{ flex: 1, height: '0.45em', background: '#fff' }}>
                    <span style={{ display: 'block', height: '100%', width: `${niveauEnPourcentage(niveau)}%`, background: '#38bdf8' }} />
                  </span>
                </div>
              );
            })}
          </>
        )}
        {d.competences && (<><Ruban icone="fa-lightbulb">Compétences</Ruban><ListePuces texte={d.competences} couleur="#38bdf8" /></>)}
        {d.interets && (<><Ruban icone="fa-star">Loisirs</Ruban><ListePuces texte={d.interets} couleur="#38bdf8" /></>)}
      </aside>
      <main style={{ flex: 1, padding: '3em 2.4em', position: 'relative' }}>
        <svg viewBox="0 0 200 120" style={{ position: 'absolute', right: 0, top: '6em', width: '11em' }}>
          <path d="M200,0 C170,70 90,95 0,110 C90,108 160,90 200,60 Z" fill={bleu} />
        </svg>
        <div style={{ fontSize: '2.8em', fontWeight: 800, lineHeight: 1.05, textTransform: 'uppercase', color: '#0f172a' }}>
          {d.prenom} <span style={{ color: bleu }}>{d.nom}</span>
        </div>
        {d.titre && <div style={{ fontSize: '1.2em', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#334155', marginTop: '0.4em' }}>{d.titre}</div>}
        <div style={{ width: '5em', height: 3, background: bleu, marginTop: '0.8em' }} />
        {d.profil && (<><Titre icone="fa-user">Profil</Titre><Paragraphe texte={d.profil} /></>)}
        {formationsRemplies(d).length > 0 && (
          <>
            <Titre icone="fa-graduation-cap">Formation</Titre>
            {formationsRemplies(d).map((f, i) => <Etape key={i} periode={f.periode} titre={f.diplome} sousTitre={f.etablissement} />)}
          </>
        )}
        {experiencesRemplies(d).length > 0 && (
          <>
            <Titre icone="fa-briefcase">Expérience</Titre>
            {experiencesRemplies(d).map((e, i) => <Etape key={i} periode={e.periode} titre={e.poste} sousTitre={e.entreprise} details={e.details} />)}
          </>
        )}
        {d.qualites && (
          <>
            <Titre icone="fa-trophy">Qualités</Titre>
            {lignes(d.qualites).map((q) => (
              <div key={q} style={{ display: 'flex', alignItems: 'center', gap: '0.6em', marginBottom: '0.35em' }}>
                <i className="fa-solid fa-circle-check" style={{ color: bleu }} /> {q}
              </div>
            ))}
          </>
        )}
      </main>
    </div>
  );
}

// ---------------------------------------------------------------- 4. ECLAT
function Eclat({ d }) {
  const marine = '#1a1f6b';
  const orange = '#f28c28';
  const Titre = ({ icone, children }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8em', margin: '1.3em 0 0.7em', borderBottom: `2px solid ${orange}`, paddingBottom: '0.35em' }}>
      <span style={{ width: '2.1em', height: '2.1em', borderRadius: '0.3em', background: orange, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <i className={`fa-solid ${icone}`} />
      </span>
      <span style={{ fontWeight: 800, fontSize: '1.3em', color: '#111827', textTransform: 'uppercase' }}>{children}</span>
    </div>
  );
  const TitreGauche = ({ children }) => (
    <div style={{ fontSize: '1.2em', textTransform: 'uppercase', margin: '1.4em 0 0.6em', fontWeight: 500 }}>{children}</div>
  );
  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <aside style={{ width: '35%', background: marine, color: '#fff', padding: '2.6em 1.7em' }}>
        <Photo src={d.photo} taille="12em" bordure={`0.55em solid ${orange}`} style={{ margin: '0 auto' }} />
        {contacts(d).length > 0 && (
          <>
            <TitreGauche>Contact</TitreGauche>
            {contacts(d).map((c) => (
              <div key={c.icone} style={{ display: 'flex', alignItems: 'center', gap: '0.8em', marginBottom: '0.6em', fontSize: '0.9em', wordBreak: 'break-word' }}>
                <span style={{ width: '1.8em', height: '1.8em', minWidth: '1.8em', borderRadius: '0.3em', background: orange, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85em' }}>
                  <i className={`fa-solid ${c.icone}`} />
                </span>
                {c.valeur}
              </div>
            ))}
            <div style={{ height: 2, background: orange, margin: '1em 0' }} />
          </>
        )}
        {d.competences && (<><TitreGauche>Compétences</TitreGauche><ListePuces texte={d.competences} couleur={orange} style={{ fontSize: '0.95em' }} /></>)}
        {d.langues && (<><TitreGauche>Langues</TitreGauche><ListePuces texte={d.langues} couleur={orange} style={{ fontSize: '0.95em' }} /></>)}
        {d.interets && (<><TitreGauche>Centres d’intérêt</TitreGauche><ListePuces texte={d.interets} couleur={orange} style={{ fontSize: '0.95em' }} /></>)}
      </aside>
      <main style={{ flex: 1, padding: '2.6em 2.2em' }}>
        <div style={{ fontSize: '2.7em', fontWeight: 800, lineHeight: 1.05, textTransform: 'uppercase', color: marine }}>
          {d.prenom} <span style={{ color: orange }}>{d.nom}</span>
        </div>
        {d.titre && <div style={{ fontSize: '1.15em', fontWeight: 700, color: orange, textTransform: 'uppercase', marginTop: '0.3em' }}>{d.titre}</div>}
        <div style={{ height: 2, background: orange, margin: '0.7em 0 0.9em' }} />
        <Paragraphe texte={d.profil} />
        {formationsRemplies(d).length > 0 && (
          <>
            <Titre icone="fa-graduation-cap">Formation</Titre>
            {formationsRemplies(d).map((f, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '8em 1fr', gap: '1em', marginBottom: '0.7em' }}>
                <div style={{ color: orange, fontWeight: 700 }}>{f.periode}</div>
                <div>
                  <div style={{ fontWeight: 700 }}>{f.diplome}</div>
                  <div style={{ fontSize: '0.92em', color: '#475569' }}>{f.etablissement}</div>
                </div>
              </div>
            ))}
          </>
        )}
        {experiencesRemplies(d).length > 0 && (
          <>
            <Titre icone="fa-briefcase">Expériences</Titre>
            {experiencesRemplies(d).map((e, i) => (
              <div key={i} style={{ marginBottom: '0.9em' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1em' }}>
                  <span style={{ fontWeight: 700 }}>{[e.poste, e.entreprise].filter(Boolean).join(' — ')}</span>
                  <span style={{ color: orange, fontWeight: 700, whiteSpace: 'nowrap', fontSize: '0.92em' }}>{e.periode}</span>
                </div>
                {lignes(e.details).map((l) => (
                  <div key={l} style={{ display: 'flex', gap: '0.6em', fontSize: '0.93em', marginTop: '0.25em' }}>
                    <i className="fa-solid fa-circle-check" style={{ color: orange, marginTop: '0.25em' }} /> {l}
                  </div>
                ))}
              </div>
            ))}
          </>
        )}
        {d.qualites && (
          <>
            <Titre icone="fa-user-check">Atouts</Titre>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '1.5em' }}>
              <ListePuces texte={d.qualites} couleur={orange} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

// ---------------------------------------------------------------- 5. BANDEAU
function Bandeau({ d }) {
  const nuit = '#16134a';
  const jaune = '#fbbf24';
  const Etiquette = ({ children, fond = jaune, texte = nuit }) => (
    <div style={{ display: 'inline-block', background: fond, color: texte, fontWeight: 800, textTransform: 'uppercase', padding: '0.25em 0.7em', borderRadius: '0.25em', margin: '1.4em 0 0.7em', fontSize: '1.02em' }}>
      {children}
    </div>
  );
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <header style={{ background: nuit, color: '#fff', height: '15em', position: 'relative', overflow: 'hidden', padding: '2.6em 2.8em' }}>
        <div style={{ position: 'absolute', right: '-3em', top: '-4em', width: '13em', height: '13em', borderRadius: '50%', background: jaune }} />
        <div style={{ position: 'absolute', right: '9em', top: '4.5em', width: '13em', height: '13em', borderRadius: '50%', background: jaune }} />
        <div style={{ position: 'absolute', right: '9.5em', top: '2.2em' }}>
          <Photo src={d.photo} taille="12em" bordure="0.3em solid #fff" />
        </div>
        <div style={{ position: 'relative', maxWidth: '55%' }}>
          <div style={{ fontSize: '3em', fontWeight: 800, lineHeight: 1, textTransform: 'uppercase' }}>{d.prenom}</div>
          <div style={{ fontSize: '3em', fontWeight: 800, lineHeight: 1, textTransform: 'uppercase' }}>{d.nom}</div>
          {d.titre && <div style={{ fontSize: '1.2em', marginTop: '0.6em', color: '#e0e7ff' }}>{d.titre}</div>}
        </div>
      </header>
      <div style={{ flex: 1, display: 'flex', gap: '2em', padding: '2.2em 2.4em 0' }}>
        <aside style={{ width: '36%', background: nuit, color: '#fff', borderRadius: '6em 6em 0 0', padding: '3em 1.8em 2em' }}>
          {formationsRemplies(d).length > 0 && (
            <>
              <Etiquette>Formation</Etiquette>
              {formationsRemplies(d).map((f, i) => (
                <div key={i} style={{ marginBottom: '0.8em', fontSize: '0.95em' }}>
                  <div style={{ fontWeight: 700 }}>{f.diplome}</div>
                  <div style={{ color: '#c7d2fe' }}>{f.etablissement}</div>
                  <div>{f.periode}</div>
                </div>
              ))}
            </>
          )}
          {d.competences && (<><Etiquette>Compétences</Etiquette><ListePuces texte={d.competences} couleur={jaune} /></>)}
          {d.langues && (<><Etiquette>Langues</Etiquette>{lignes(d.langues).map((l) => <div key={l}>{l}</div>)}</>)}
          {d.interets && (<><Etiquette>Loisirs</Etiquette>{lignes(d.interets).map((l) => <div key={l}>{l}</div>)}</>)}
        </aside>
        <main style={{ flex: 1 }}>
          {d.profil && (<><Etiquette fond={nuit} texte="#fff">Résumé professionnel</Etiquette><Paragraphe texte={d.profil} /></>)}
          {experiencesRemplies(d).length > 0 && (
            <>
              <Etiquette fond={nuit} texte="#fff">Expérience professionnelle</Etiquette>
              {experiencesRemplies(d).map((e, i) => (
                <div key={i} style={{ marginBottom: '1em' }}>
                  <div style={{ fontWeight: 800, textTransform: 'uppercase' }}>{[e.poste, e.entreprise].filter(Boolean).join(' — ')}</div>
                  {e.periode && <div style={{ fontWeight: 600, color: '#475569' }}>{e.periode}</div>}
                  {lignes(e.details).map((l) => <div key={l} style={{ fontSize: '0.95em' }}>- {l}</div>)}
                </div>
              ))}
            </>
          )}
          {d.qualites && (<><Etiquette fond={nuit} texte="#fff">Qualités</Etiquette><ListePuces texte={d.qualites} couleur={nuit} /></>)}
          {contacts(d).length > 0 && (
            <>
              <Etiquette fond={nuit} texte="#fff">Contacts</Etiquette>
              {contacts(d).map((c) => (
                <div key={c.icone} style={{ display: 'flex', gap: '0.7em', marginBottom: '0.3em', wordBreak: 'break-word' }}>
                  <i className={`fa-solid ${c.icone}`} style={{ color: nuit, marginTop: '0.25em' }} /> {c.valeur}
                </div>
              ))}
            </>
          )}
        </main>
      </div>
      <div style={{ height: '1.2em', background: nuit }} />
    </div>
  );
}

// ---------------------------------------------------------------- 6. MINIMALISTE
function Minimal({ d }) {
  const Titre = ({ children }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8em', margin: '1.5em 0 0.7em' }}>
      <span style={{ fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', fontSize: '0.95em', color: '#111827' }}>{children}</span>
      <span style={{ flex: 1, height: 1, background: '#111827' }} />
    </div>
  );
  return (
    <div style={{ padding: '3.2em 3.6em', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2em' }}>
        {d.photo && <Photo src={d.photo} taille="7.5em" bordure="1px solid #111827" />}
        <div style={{ flex: 1, textAlign: d.photo ? 'left' : 'center' }}>
          <div style={{ fontSize: '2.6em', fontWeight: 300, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#111827', lineHeight: 1.1 }}>
            {d.prenom} <span style={{ fontWeight: 700 }}>{d.nom}</span>
          </div>
          {d.titre && <div style={{ letterSpacing: '0.3em', textTransform: 'uppercase', color: '#6b7280', marginTop: '0.5em', fontSize: '0.95em' }}>{d.titre}</div>}
          {contacts(d).length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4em 1.4em', marginTop: '0.9em', fontSize: '0.88em', color: '#374151', justifyContent: d.photo ? 'flex-start' : 'center' }}>
              {contacts(d).map((c) => (
                <span key={c.icone}><i className={`fa-solid ${c.icone}`} style={{ marginRight: '0.4em' }} />{c.valeur}</span>
              ))}
            </div>
          )}
        </div>
      </div>
      {d.profil && (<><Titre>Profil</Titre><Paragraphe texte={d.profil} /></>)}
      {experiencesRemplies(d).length > 0 && (
        <>
          <Titre>Expérience</Titre>
          {experiencesRemplies(d).map((e, i) => (
            <div key={i} style={{ marginBottom: '0.9em' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1em' }}>
                <span style={{ fontWeight: 700 }}>{e.poste}{e.entreprise && <span style={{ fontWeight: 400, color: '#4b5563' }}> — {e.entreprise}</span>}</span>
                <span style={{ color: '#6b7280', whiteSpace: 'nowrap', fontSize: '0.92em' }}>{e.periode}</span>
              </div>
              <div style={{ fontSize: '0.93em', marginTop: '0.2em' }}><ListePuces texte={e.details} couleur="#111827" /></div>
            </div>
          ))}
        </>
      )}
      {formationsRemplies(d).length > 0 && (
        <>
          <Titre>Formation</Titre>
          {formationsRemplies(d).map((f, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '1em', marginBottom: '0.6em' }}>
              <span><strong>{f.diplome}</strong>{f.etablissement && <span style={{ color: '#4b5563' }}> — {f.etablissement}</span>}</span>
              <span style={{ color: '#6b7280', whiteSpace: 'nowrap', fontSize: '0.92em' }}>{f.periode}</span>
            </div>
          ))}
        </>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '2.5em' }}>
        {d.competences && <div><Titre>Compétences</Titre><ListePuces texte={d.competences} couleur="#111827" /></div>}
        {d.langues && <div><Titre>Langues</Titre><ListePuces texte={d.langues} couleur="#111827" /></div>}
        {d.qualites && <div><Titre>Qualités</Titre><ListePuces texte={d.qualites} couleur="#111827" /></div>}
        {d.interets && <div><Titre>Intérêts</Titre><ListePuces texte={d.interets} couleur="#111827" /></div>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 7. EMERAUDE
function Emeraude({ d }) {
  const vert = '#065f46';
  const Titre = ({ icone, children, clair }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6em', margin: '1.4em 0 0.7em', color: clair ? '#ecfdf5' : vert, fontWeight: 800, textTransform: 'uppercase', fontSize: '1.1em', letterSpacing: '0.05em' }}>
      <i className={`fa-solid ${icone}`} /> {children}
    </div>
  );
  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <main style={{ flex: 1, padding: '3em 2.4em' }}>
        <div style={{ borderLeft: `0.45em solid ${vert}`, paddingLeft: '1em' }}>
          <div style={{ fontSize: '2.7em', fontWeight: 800, lineHeight: 1.05, color: '#111827' }}>{d.prenom}</div>
          <div style={{ fontSize: '2.7em', fontWeight: 800, lineHeight: 1.05, color: vert, textTransform: 'uppercase' }}>{d.nom}</div>
          {d.titre && <div style={{ fontSize: '1.15em', color: '#374151', marginTop: '0.4em' }}>{d.titre}</div>}
        </div>
        {d.profil && (<><Titre icone="fa-user">Profil</Titre><Paragraphe texte={d.profil} /></>)}
        {experiencesRemplies(d).length > 0 && (
          <>
            <Titre icone="fa-briefcase">Expérience professionnelle</Titre>
            {experiencesRemplies(d).map((e, i) => (
              <div key={i} style={{ marginBottom: '1em', paddingLeft: '1em', borderLeft: '2px solid #a7f3d0' }}>
                <div style={{ fontSize: '0.9em', color: vert, fontWeight: 700 }}>{e.periode}</div>
                <div style={{ fontWeight: 700 }}>{e.poste}</div>
                {e.entreprise && <div style={{ color: '#4b5563', fontSize: '0.93em' }}>{e.entreprise}</div>}
                <div style={{ fontSize: '0.92em', marginTop: '0.2em' }}><ListePuces texte={e.details} couleur={vert} /></div>
              </div>
            ))}
          </>
        )}
        {formationsRemplies(d).length > 0 && (
          <>
            <Titre icone="fa-graduation-cap">Formation</Titre>
            {formationsRemplies(d).map((f, i) => (
              <div key={i} style={{ marginBottom: '0.8em', paddingLeft: '1em', borderLeft: '2px solid #a7f3d0' }}>
                <div style={{ fontSize: '0.9em', color: vert, fontWeight: 700 }}>{f.periode}</div>
                <div style={{ fontWeight: 700 }}>{f.diplome}</div>
                <div style={{ color: '#4b5563', fontSize: '0.93em' }}>{f.etablissement}</div>
              </div>
            ))}
          </>
        )}
      </main>
      <aside style={{ width: '34%', background: `linear-gradient(180deg, ${vert}, #064e3b)`, color: '#ecfdf5', padding: '3em 1.8em' }}>
        <Photo src={d.photo} taille="11.5em" bordure="0.4em solid #a7f3d0" style={{ margin: '0 auto' }} />
        {contacts(d).length > 0 && (
          <>
            <Titre icone="fa-address-book" clair>Contact</Titre>
            {contacts(d).map((c) => (
              <div key={c.icone} style={{ display: 'flex', gap: '0.7em', marginBottom: '0.5em', fontSize: '0.9em', wordBreak: 'break-word' }}>
                <i className={`fa-solid ${c.icone}`} style={{ color: '#6ee7b7', marginTop: '0.25em' }} /> {c.valeur}
              </div>
            ))}
          </>
        )}
        {d.competences && (<><Titre icone="fa-gears" clair>Compétences</Titre><ListePuces texte={d.competences} couleur="#6ee7b7" /></>)}
        {d.langues && (<><Titre icone="fa-language" clair>Langues</Titre><ListePuces texte={d.langues} couleur="#6ee7b7" /></>)}
        {d.qualites && (<><Titre icone="fa-star" clair>Qualités</Titre><ListePuces texte={d.qualites} couleur="#6ee7b7" /></>)}
        {d.interets && (<><Titre icone="fa-heart" clair>Intérêts</Titre><ListePuces texte={d.interets} couleur="#6ee7b7" /></>)}
      </aside>
    </div>
  );
}

// ---------------------------------------------------------------- 8. BORDEAUX
function Bordeaux({ d }) {
  const rouge = '#7f1d1d';
  const Titre = ({ children }) => (
    <div style={{ background: rouge, color: '#fff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.35em 0.9em', borderRadius: '0 2em 2em 0', margin: '1.4em 0 0.8em -2.4em', paddingLeft: '2.4em', width: 'fit-content', minWidth: '60%' }}>
      {children}
    </div>
  );
  const TitreGauche = ({ children }) => (
    <div style={{ fontWeight: 800, color: rouge, textTransform: 'uppercase', borderBottom: `2px solid ${rouge}`, paddingBottom: '0.25em', margin: '1.4em 0 0.6em' }}>{children}</div>
  );
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <header style={{ background: `linear-gradient(120deg, ${rouge}, #991b1b)`, color: '#fff', padding: '2.2em 2.6em', display: 'flex', alignItems: 'center', gap: '2em', borderBottomRightRadius: '5em' }}>
        <Photo src={d.photo} taille="9.5em" bordure="0.3em solid #fff" />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '2.5em', fontWeight: 800, textTransform: 'uppercase', lineHeight: 1.05 }}>{d.prenom} {d.nom}</div>
          {d.titre && <div style={{ fontSize: '1.15em', marginTop: '0.3em', color: '#fecaca' }}>{d.titre}</div>}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3em 1.2em', marginTop: '0.8em', fontSize: '0.85em' }}>
            {contacts(d).map((c) => (
              <span key={c.icone}><i className={`fa-solid ${c.icone}`} style={{ marginRight: '0.4em', color: '#fecaca' }} />{c.valeur}</span>
            ))}
          </div>
        </div>
      </header>
      <div style={{ flex: 1, display: 'flex', gap: '2.2em', padding: '0.6em 2.4em 2em' }}>
        <aside style={{ width: '32%' }}>
          {d.competences && (<><TitreGauche>Compétences</TitreGauche><ListePuces texte={d.competences} couleur={rouge} /></>)}
          {d.langues && (<><TitreGauche>Langues</TitreGauche><ListePuces texte={d.langues} couleur={rouge} /></>)}
          {d.qualites && (<><TitreGauche>Qualités</TitreGauche><ListePuces texte={d.qualites} couleur={rouge} /></>)}
          {d.interets && (<><TitreGauche>Centres d’intérêt</TitreGauche><ListePuces texte={d.interets} couleur={rouge} /></>)}
        </aside>
        <main style={{ flex: 1, paddingLeft: '2.4em', borderLeft: '1px solid #e5e7eb' }}>
          {d.profil && (<><Titre>Profil professionnel</Titre><Paragraphe texte={d.profil} /></>)}
          {formationsRemplies(d).length > 0 && (
            <>
              <Titre>Formation</Titre>
              {formationsRemplies(d).map((f, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '7.5em 1fr', gap: '0.8em', marginBottom: '0.7em' }}>
                  <span style={{ background: '#fee2e2', color: rouge, fontWeight: 700, fontSize: '0.85em', borderRadius: '0.3em', padding: '0.2em 0.5em', height: 'fit-content', textAlign: 'center' }}>{f.periode}</span>
                  <div><strong>{f.diplome}</strong><div style={{ color: '#4b5563', fontSize: '0.93em' }}>{f.etablissement}</div></div>
                </div>
              ))}
            </>
          )}
          {experiencesRemplies(d).length > 0 && (
            <>
              <Titre>Expériences</Titre>
              {experiencesRemplies(d).map((e, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '7.5em 1fr', gap: '0.8em', marginBottom: '0.9em' }}>
                  <span style={{ background: '#fee2e2', color: rouge, fontWeight: 700, fontSize: '0.85em', borderRadius: '0.3em', padding: '0.2em 0.5em', height: 'fit-content', textAlign: 'center' }}>{e.periode}</span>
                  <div>
                    <strong>{e.poste}</strong>{e.entreprise && <span style={{ color: '#4b5563' }}> — {e.entreprise}</span>}
                    {lignes(e.details).map((l) => <div key={l} style={{ fontSize: '0.93em' }}>- {l}</div>)}
                  </div>
                </div>
              ))}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- 9. ETUDIANT
function Etudiant({ d }) {
  const bleu = '#0c2d5e';
  const ciel = '#60a5fa';
  const TitreGauche = ({ icone, children }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6em', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: '0.3em', margin: '1.4em 0 0.7em' }}>
      <i className={`fa-solid ${icone}`} style={{ color: ciel }} /> {children}
    </div>
  );
  const Titre = ({ icone, children }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6em', fontWeight: 800, color: bleu, textTransform: 'uppercase', fontSize: '1.1em', margin: '1.4em 0 0.7em' }}>
      <i className={`fa-solid ${icone}`} /> {children}
    </div>
  );
  return (
    <div style={{ display: 'flex', height: '100%', padding: '1.8em', background: '#eef2f7' }}>
      <aside style={{ width: '34%', background: bleu, color: '#e2e8f0', borderRadius: '1.2em 0 0 1.2em', padding: '0 1.6em 2em', position: 'relative' }}>
        <div style={{ background: '#fff', margin: '0 -1.6em', padding: '1.6em 0 1.2em', borderBottomRightRadius: '6em', display: 'flex', justifyContent: 'center' }}>
          <Photo src={d.photo} taille="10em" bordure={`0.35em solid ${bleu}`} />
        </div>
        {contacts(d).length > 0 && (
          <>
            <TitreGauche icone="fa-address-card">Contact</TitreGauche>
            {contacts(d).map((c) => (
              <div key={c.icone} style={{ display: 'flex', gap: '0.7em', marginBottom: '0.5em', fontSize: '0.88em', wordBreak: 'break-word' }}>
                <i className={`fa-solid ${c.icone}`} style={{ marginTop: '0.25em', color: ciel }} /> {c.valeur}
              </div>
            ))}
          </>
        )}
        {d.langues && (
          <>
            <TitreGauche icone="fa-language">Langues</TitreGauche>
            {lignes(d.langues).map((l) => {
              const { langue, niveau } = decouperLangue(l);
              return (
                <div key={l} style={{ marginBottom: '0.55em', fontSize: '0.88em' }}>
                  <div>{langue}</div>
                  <div style={{ height: '0.4em', background: 'rgba(255,255,255,0.2)', borderRadius: 9, marginTop: '0.2em' }}>
                    <div style={{ height: '100%', width: `${niveauEnPourcentage(niveau)}%`, background: ciel, borderRadius: 9 }} />
                  </div>
                </div>
              );
            })}
          </>
        )}
        {d.competences && (<><TitreGauche icone="fa-lightbulb">Compétences</TitreGauche><ListePuces texte={d.competences} couleur={ciel} style={{ fontSize: '0.92em' }} /></>)}
        {d.interets && (<><TitreGauche icone="fa-heart">Centres d’intérêt</TitreGauche><ListePuces texte={d.interets} couleur={ciel} style={{ fontSize: '0.92em' }} /></>)}
      </aside>
      <main style={{ flex: 1, background: '#fff', borderRadius: '0 1.2em 1.2em 0', padding: '2.4em 2.2em' }}>
        <div style={{ fontSize: '2.6em', fontWeight: 800, color: bleu, textTransform: 'uppercase', lineHeight: 1.05 }}>{d.prenom} {d.nom}</div>
        {d.titre && <div style={{ color: '#2563eb', fontWeight: 600, fontSize: '1.1em', marginTop: '0.3em', textTransform: 'uppercase' }}>{d.titre}</div>}
        <Paragraphe texte={d.profil} style={{ marginTop: '0.8em' }} />
        {formationsRemplies(d).length > 0 && (
          <>
            <Titre icone="fa-graduation-cap">Formation</Titre>
            {formationsRemplies(d).map((f, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '1em', marginBottom: '0.6em' }}>
                <div><div style={{ fontWeight: 700, color: '#1e3a8a' }}>{f.diplome}</div><div style={{ color: '#2563eb', fontSize: '0.92em' }}>{f.etablissement}</div></div>
                <span style={{ whiteSpace: 'nowrap', fontWeight: 600, fontSize: '0.9em' }}>{f.periode}</span>
              </div>
            ))}
          </>
        )}
        {experiencesRemplies(d).length > 0 && (
          <>
            <Titre icone="fa-briefcase">Expériences</Titre>
            {experiencesRemplies(d).map((e, i) => (
              <div key={i} style={{ marginBottom: '0.9em' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1em' }}>
                  <span style={{ fontWeight: 700, color: '#1e3a8a' }}>{[e.poste, e.entreprise].filter(Boolean).join(' | ')}</span>
                  <span style={{ whiteSpace: 'nowrap', fontWeight: 600, fontSize: '0.9em' }}>{e.periode}</span>
                </div>
                <div style={{ fontSize: '0.92em', marginTop: '0.2em' }}><ListePuces texte={e.details} couleur="#2563eb" /></div>
              </div>
            ))}
          </>
        )}
        {d.qualites && (<><Titre icone="fa-star">Qualités</Titre><ListePuces texte={d.qualites} couleur="#2563eb" /></>)}
      </main>
    </div>
  );
}

// ---------------------------------------------------------------- 10. CORAIL
function Corail({ d }) {
  const corail = '#f25f4c';
  const sarcelle = '#0f766e';
  const Carte = ({ titre, icone, children }) => (
    <div style={{ background: '#fff', borderRadius: '0.8em', padding: '1em 1.2em', marginBottom: '1em', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6em', fontWeight: 800, color: sarcelle, textTransform: 'uppercase', marginBottom: '0.6em', fontSize: '1.02em' }}>
        <span style={{ width: '1.9em', height: '1.9em', borderRadius: '0.5em', background: corail, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85em' }}>
          <i className={`fa-solid ${icone}`} />
        </span>
        {titre}
      </div>
      {children}
    </div>
  );
  return (
    <div style={{ height: '100%', background: '#fdf2ef', padding: '2.4em 2.4em 0', position: 'relative' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '0.6em', background: corail }} />
      <header style={{ display: 'flex', alignItems: 'center', gap: '1.8em', marginBottom: '1.4em' }}>
        <Photo src={d.photo} taille="9em" rond={false} bordure={`0.3em solid ${corail}`} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '2.6em', fontWeight: 800, color: sarcelle, lineHeight: 1.05 }}>
            {d.prenom} <span style={{ color: corail }}>{d.nom}</span>
          </div>
          {d.titre && <div style={{ fontSize: '1.15em', fontWeight: 600, color: '#374151', marginTop: '0.3em' }}>{d.titre}</div>}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3em 1.2em', marginTop: '0.7em', fontSize: '0.85em', color: '#374151' }}>
            {contacts(d).map((c) => (
              <span key={c.icone}><i className={`fa-solid ${c.icone}`} style={{ marginRight: '0.4em', color: corail }} />{c.valeur}</span>
            ))}
          </div>
        </div>
      </header>
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1em', alignItems: 'start' }}>
        <div>
          {d.profil && <Carte titre="Profil" icone="fa-user"><Paragraphe texte={d.profil} /></Carte>}
          {experiencesRemplies(d).length > 0 && (
            <Carte titre="Expérience" icone="fa-briefcase">
              {experiencesRemplies(d).map((e, i) => (
                <div key={i} style={{ marginBottom: '0.8em' }}>
                  <div style={{ fontWeight: 700 }}>{e.poste}</div>
                  <div style={{ fontSize: '0.9em', color: corail, fontWeight: 600 }}>{[e.entreprise, e.periode].filter(Boolean).join(' • ')}</div>
                  <div style={{ fontSize: '0.92em', marginTop: '0.2em' }}><ListePuces texte={e.details} couleur={sarcelle} /></div>
                </div>
              ))}
            </Carte>
          )}
          {formationsRemplies(d).length > 0 && (
            <Carte titre="Formation" icone="fa-graduation-cap">
              {formationsRemplies(d).map((f, i) => (
                <div key={i} style={{ marginBottom: '0.6em' }}>
                  <div style={{ fontWeight: 700 }}>{f.diplome}</div>
                  <div style={{ fontSize: '0.9em', color: corail, fontWeight: 600 }}>{[f.etablissement, f.periode].filter(Boolean).join(' • ')}</div>
                </div>
              ))}
            </Carte>
          )}
        </div>
        <div>
          {d.competences && (
            <Carte titre="Compétences" icone="fa-screwdriver-wrench">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4em' }}>
                {lignes(d.competences).map((c) => (
                  <span key={c} style={{ background: '#ccfbf1', color: sarcelle, borderRadius: '1em', padding: '0.2em 0.7em', fontSize: '0.88em' }}>{c}</span>
                ))}
              </div>
            </Carte>
          )}
          {d.langues && <Carte titre="Langues" icone="fa-language"><ListePuces texte={d.langues} couleur={corail} /></Carte>}
          {d.qualites && <Carte titre="Qualités" icone="fa-star"><ListePuces texte={d.qualites} couleur={corail} /></Carte>}
          {d.interets && <Carte titre="Intérêts" icone="fa-heart"><ListePuces texte={d.interets} couleur={corail} /></Carte>}
        </div>
      </div>
    </div>
  );
}

const RENDUS = {
  moderne: Moderne,
  elegant: Elegant,
  dynamique: Dynamique,
  eclat: Eclat,
  bandeau: Bandeau,
  minimal: Minimal,
  emeraude: Emeraude,
  bordeaux: Bordeaux,
  etudiant: Etudiant,
  corail: Corail,
};

const TAILLE_BASE = 14.5;
const TAILLE_MIN = 9;

// CV complet au format A4 reel. Si le contenu deborde de la page, la taille du texte est
// reduite automatiquement (par pas de 0,5 px, jusqu'a 9 px) pour que tout tienne sur une page.
const DocumentCV = forwardRef(function DocumentCV({ modele, donnees }, ref) {
  const interne = useRef(null);
  const [taille, setTaille] = useState(TAILLE_BASE);
  const cle = JSON.stringify(donnees) + modele;
  const [cleMesuree, setCleMesuree] = useState(cle);

  // Contenu modifie : on repart de la taille de base puis on re-reduit si besoin.
  if (cle !== cleMesuree) {
    setCleMesuree(cle);
    setTaille(TAILLE_BASE);
  }

  useLayoutEffect(() => {
    const el = interne.current;
    if (el && el.scrollHeight > CV_HAUTEUR + 1 && taille > TAILLE_MIN) {
      setTaille((t) => Math.max(TAILLE_MIN, t - 0.5));
    }
  }, [taille, cle]);

  const Rendu = RENDUS[modele] || Moderne;
  return (
    <div
      ref={(el) => {
        interne.current = el;
        if (typeof ref === 'function') ref(el);
        else if (ref) ref.current = el;
      }}
      style={{ width: CV_LARGEUR, height: CV_HAUTEUR, overflow: 'hidden', position: 'relative', background: '#fff', color: '#1f2937', fontFamily: POLICE, fontSize: taille, boxSizing: 'border-box', textAlign: 'left' }}
    >
      <Rendu d={donnees} />
    </div>
  );
});

export default DocumentCV;
