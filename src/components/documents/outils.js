// Outils partages par les modeles de CV et de cartes de visite.

export const lignes = (texte) =>
  String(texte || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

// "Français : Courant" -> { langue: 'Français', niveau: 'Courant' }
export function decouperLangue(ligne) {
  const [langue, ...reste] = ligne.split(/\s*[:–-]\s*/);
  return { langue: langue.trim(), niveau: reste.join(' ').trim() };
}

// Niveau de langue textuel -> pourcentage, pour les modeles qui affichent des barres.
export function niveauEnPourcentage(niveau) {
  const n = (niveau || '').toLowerCase();
  if (/natif|maternelle|bilingue/.test(n)) return 100;
  if (/excellent|courant|c2|c1|très bon|tres bon|avanc/.test(n)) return 88;
  if (/interm|moyen|b2|b1|bon/.test(n)) return 65;
  if (/débutant|debutant|notion|a1|a2|scolaire/.test(n)) return 35;
  return 70;
}

export function contacts(d) {
  return [
    { icone: 'fa-phone', valeur: d.telephone },
    { icone: 'fa-envelope', valeur: d.email },
    { icone: 'fa-location-dot', valeur: d.adresse },
    { icone: 'fa-globe', valeur: d.site },
  ].filter((c) => String(c.valeur || '').trim());
}

export const experiencesRemplies = (d) =>
  (d.experiences || []).filter((e) => (e.poste || e.entreprise || e.details || '').trim());

export const formationsRemplies = (d) =>
  (d.formations || []).filter((f) => (f.diplome || f.etablissement || '').trim());

export function initiales(texte) {
  return String(texte || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((m) => m[0].toUpperCase())
    .join('');
}

// Image distante (Cloudinary) : crossOrigin requis pour que html-to-image puisse la capturer.
// Image locale (data:/blob:) : surtout pas, sinon le chargement echoue dans certains navigateurs.
export const crossOriginPour = (src) => (src && /^(data|blob):/.test(src) ? undefined : 'anonymous');

// Contenu du QR code des cartes de visite : une vCard, pour que le contact s'enregistre
// directement dans le telephone de la personne qui scanne la carte.
export function vCard(d) {
  const champs = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${d.nom || ''};${d.prenom || ''}`,
    `FN:${[d.prenom, d.nom].filter(Boolean).join(' ')}`,
    d.genre !== 'personnelle' && d.organisation && `ORG:${d.organisation}`,
    d.fonction && `TITLE:${d.fonction}`,
    d.telephone && `TEL:${d.telephone}`,
    d.email && `EMAIL:${d.email}`,
    d.site && `URL:${d.site}`,
    d.adresse && `ADR:;;${d.adresse}`,
    'END:VCARD',
  ];
  return champs.filter(Boolean).join('\n');
}
