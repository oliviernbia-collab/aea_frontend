// Memoire locale (navigateur) des achats de CV / cartes de visite et des brouillons en cours.
// Pratique seulement : la source de verite reste le serveur (commande + jeton d'acces), et tout
// fonctionne meme si le stockage est indisponible (navigation privee, etc.).

const CLE_ACHATS = 'aea_achats_documents';
const cleBrouillon = (type) => `aea_brouillon_${type}`;

function lire(cle, defaut) {
  try {
    const brut = localStorage.getItem(cle);
    return brut ? JSON.parse(brut) : defaut;
  } catch {
    return defaut;
  }
}

function ecrire(cle, valeur) {
  try {
    localStorage.setItem(cle, JSON.stringify(valeur));
  } catch {
    // quota depasse ou stockage bloque : sans consequence
  }
}

export const listerAchats = () => lire(CLE_ACHATS, []);

export function memoriserAchat({ reference, token, type, statut }) {
  const achats = listerAchats().filter((a) => a.reference !== reference);
  achats.unshift({ reference, token, type, statut, date: new Date().toISOString() });
  ecrire(CLE_ACHATS, achats.slice(0, 30));
}

export const tokenAchat = (reference) => listerAchats().find((a) => a.reference === reference)?.token || null;

export const lireBrouillon = (type) => lire(cleBrouillon(type), null);

export function enregistrerBrouillon(type, brouillon) {
  ecrire(cleBrouillon(type), brouillon);
}

// Reduit une photo/un logo choisi avant de l'afficher et de l'envoyer : une photo de telephone
// (plusieurs Mo) alourdirait l'apercu, le brouillon local et l'envoi au serveur pour rien.
export function imageReduite(fichier, cote = 700) {
  return new Promise((resolve, reject) => {
    const lecteur = new FileReader();
    lecteur.onerror = () => reject(lecteur.error);
    lecteur.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const ratio = Math.min(1, cote / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.88));
      };
      img.src = lecteur.result;
    };
    lecteur.readAsDataURL(fichier);
  });
}
