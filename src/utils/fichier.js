// Convertit un File en data URI base64 ("data:<mimetype>;base64,...") pour l'envoyer en JSON :
// le WAF de l'hebergeur (LWS) bloque toute requete POST en multipart/form-data, meme sans fichier.
export function fichierEnDataUri(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
