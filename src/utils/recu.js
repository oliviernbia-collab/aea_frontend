import jsPDF from 'jspdf';
import logoAEA from '../assets/AEA.jpg';

const MOIS_LABELS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

const MODE_LABELS = {
  especes: 'Espèces',
  orange_money: 'Orange Money',
  mtn_momo: 'MTN MoMo',
  moov_money: 'Moov Money',
  wave: 'Wave',
};

// Le separateur de milliers par defaut de Intl.NumberFormat('fr-FR') est une espace fine
// insecable (U+202F), absente de la police Helvetica de base utilisee par jsPDF : elle s'y
// affichait comme un caractere errone (ex. "1/100" au lieu de "1 100"). On la remplace par une
// espace normale, propre a l'export PDF.
function formatFCFA(n) {
  return new Intl.NumberFormat('fr-FR').format(Math.round(Number(n) || 0)).replace(/[  ]/g, ' ') + ' FCFA';
}

function libellePeriode(entree) {
  if (!entree) return '';
  if (Number(entree.mois) === 0) return "Droit d'adhésion";
  return `${MOIS_LABELS[entree.mois - 1]} ${entree.annee}`;
}

function periodesCouvertes(paiement) {
  let couverts = paiement.mois_couverts;
  if (typeof couverts === 'string') {
    try { couverts = JSON.parse(couverts); } catch { couverts = []; }
  }
  if (!Array.isArray(couverts)) return [];
  return couverts.map(libellePeriode).filter(Boolean);
}

function chargerImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Genere et telecharge le recu PDF d'un paiement de cotisation (saisie manuelle ou paiement
// en ligne Jeko confirme). Construit directement avec l'API texte/vectorielle de jsPDF
// (pas de rasterisation html-to-image) pour un document net, leger et imprimable.
export async function genererRecuPDF(user, paiement) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const largeurPage = 210;
  const bleu = '#1e3a8a';
  const grisTexte = '#475569';
  const grisClair = '#94a3b8';

  // Bandeau d'entete
  doc.setFillColor(bleu);
  doc.rect(0, 0, largeurPage, 32, 'F');

  try {
    const logo = await chargerImage(logoAEA);
    doc.addImage(logo, 'JPEG', 14, 7, 18, 18, undefined, 'FAST');
  } catch {
    // logo indisponible (ex. hors-ligne) : le recu reste valide sans image
  }

  doc.setTextColor('#ffffff');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text("ASSOCIATION DES ÉTUDIANTS D'ASSOUMOUKRO", 38, 14);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Unité · Solidarité · Excellence', 38, 20);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('REÇU DE PAIEMENT', largeurPage - 14, 20, { align: 'right' });

  // Reference et date d'emission
  doc.setTextColor(grisTexte);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  let y = 44;
  doc.text(`Reçu N° : ${paiement.recu_numero || `AEA-${paiement.id}`}`, 14, y);
  doc.text(`Émis le ${new Date().toLocaleDateString('fr-FR')}`, largeurPage - 14, y, { align: 'right' });

  // Encadre membre
  y += 10;
  doc.setDrawColor('#e2e8f0');
  doc.roundedRect(14, y, largeurPage - 28, 24, 2, 2, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor('#0f172a');
  doc.setFontSize(11);
  doc.text(`${user.prenom} ${user.nom}`, 20, y + 9);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(grisTexte);
  doc.text(`N° membre : ${user.numero_membre}`, 20, y + 16);
  if (user.filiere) doc.text(`${user.filiere}${user.promotion ? ` · ${user.promotion}` : ''}`, 20, y + 21);

  // Detail du paiement
  y += 34;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor('#0f172a');
  doc.text('Détail du paiement', 14, y);
  y += 3;
  doc.setDrawColor('#e2e8f0');
  doc.line(14, y, largeurPage - 14, y);

  const lignes = [
    ['Montant payé', formatFCFA(paiement.montant)],
    ['Mode de paiement', MODE_LABELS[paiement.mode_paiement] || paiement.mode_paiement],
    ['Date du paiement', new Date(paiement.date_paiement).toLocaleDateString('fr-FR')],
    ['Période(s) couverte(s)', periodesCouvertes(paiement).join(', ') || '—'],
    ['Statut', paiement.statut_validation === 'valide' ? 'Validé' : 'En attente de validation'],
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  lignes.forEach(([label, valeur], i) => {
    const ligneY = y + 10 + i * 9;
    doc.setTextColor(grisTexte);
    doc.text(label, 14, ligneY);
    doc.setTextColor('#0f172a');
    doc.setFont('helvetica', 'bold');
    const texte = doc.splitTextToSize(String(valeur), 110);
    doc.text(texte, largeurPage - 14, ligneY, { align: 'right' });
    doc.setFont('helvetica', 'normal');
  });

  // Montant mis en avant
  const yMontant = y + 10 + lignes.length * 9 + 8;
  doc.setFillColor('#f1f5f9');
  doc.roundedRect(14, yMontant, largeurPage - 28, 16, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(bleu);
  doc.text('Montant total réglé', 20, yMontant + 10);
  doc.text(formatFCFA(paiement.montant), largeurPage - 20, yMontant + 10, { align: 'right' });

  // Pied de page
  const yPied = 270;
  doc.setDrawColor('#e2e8f0');
  doc.line(14, yPied, largeurPage - 14, yPied);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(grisClair);
  doc.text(
    "Ce reçu est généré électroniquement par la plateforme AEA et fait foi de paiement. Conservez-le pour vos archives.",
    14,
    yPied + 6,
    { maxWidth: largeurPage - 28 }
  );
  doc.text('AEA - Assoumoukro · contact-aea@gmail.com', 14, yPied + 11);

  doc.save(`recu-aea-${paiement.recu_numero || paiement.id}.pdf`);
}
