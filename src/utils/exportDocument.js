import { toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';

// Attend que les images (photo, logo) et les polices soient pretes : capturer trop tot donne
// un document incomplet (meme probleme deja corrige pour l'export des cartes de membre).
async function attendreRessources(noeuds) {
  const images = noeuds.flatMap((n) => [...n.querySelectorAll('img')]);
  await Promise.all(
    images.map(async (img) => {
      if (!img.complete) {
        await new Promise((resolve) => {
          img.addEventListener('load', resolve, { once: true });
          img.addEventListener('error', resolve, { once: true });
          setTimeout(resolve, 8000);
        });
      }
      try {
        await img.decode();
      } catch {
        // image en erreur : on capture le reste
      }
    })
  );
  if (document.fonts?.ready) await document.fonts.ready;
}

// Premiere capture "a blanc" : html-to-image omet parfois des images/polices au premier passage.
async function capturer(noeud, fonction, options) {
  await fonction(noeud, options);
  return fonction(noeud, options);
}

export async function telechargerCvPdf(noeud, nomFichier) {
  await attendreRessources([noeud]);
  const image = await capturer(noeud, toJpeg, { pixelRatio: 2.5, quality: 0.95, cacheBust: true, backgroundColor: '#ffffff' });
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  pdf.addImage(image, 'JPEG', 0, 0, 210, 297);
  pdf.save(nomFichier);
}

// Carte de visite : un PDF au format exact de la carte (page 1 recto, page 2 verso), ou une
// planche A4 de 10 cartes prete a imprimer (page 1 : rectos, page 2 : versos, pour l'impression recto-verso).
export async function telechargerCartePdf(recto, verso, nomFichier, { planche = false, largeurMm = 85, hauteurMm = 55 } = {}) {
  await attendreRessources([recto, verso]);
  // JPEG plutot que PNG : meme rendu a l'impression, mais un PDF ~20x plus leger (PNG : ~7 Mo).
  const options = { pixelRatio: 4, quality: 0.95, cacheBust: true, backgroundColor: '#ffffff' };
  const imgRecto = await capturer(recto, toJpeg, options);
  const imgVerso = await capturer(verso, toJpeg, options);

  if (!planche) {
    const format = [largeurMm, hauteurMm];
    const pdf = new jsPDF({ unit: 'mm', format, orientation: 'landscape' });
    pdf.addImage(imgRecto, 'JPEG', 0, 0, largeurMm, hauteurMm);
    pdf.addPage(format, 'landscape');
    pdf.addImage(imgVerso, 'JPEG', 0, 0, largeurMm, hauteurMm);
    pdf.save(nomFichier);
    return;
  }

  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const colonnes = 2;
  const rangees = 5;
  const margeX = (210 - colonnes * largeurMm) / 2;
  const margeY = (297 - rangees * hauteurMm) / 2;
  const placer = (image) => {
    for (let r = 0; r < rangees; r++) {
      for (let c = 0; c < colonnes; c++) {
        const x = margeX + c * largeurMm;
        const y = margeY + r * hauteurMm;
        pdf.addImage(image, 'JPEG', x, y, largeurMm, hauteurMm);
        // traits de coupe tres fins
        pdf.setDrawColor(200);
        pdf.setLineWidth(0.1);
        pdf.rect(x, y, largeurMm, hauteurMm);
      }
    }
  };
  placer(imgRecto);
  pdf.addPage('a4', 'portrait');
  placer(imgVerso);
  pdf.save(nomFichier);
}
