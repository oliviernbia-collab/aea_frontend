// Libelles d'affichage pour les valeurs d'enum techniques stockees en base (statut, fonds,
// action du journal...) : les cles ne doivent jamais etre modifiees (elles sont comparees
// telles quelles cote backend/API), seules les valeurs sont du texte affichable.

export const STATUT_MEMBRE_LABELS = {
  actif: 'Actif',
  inactif: 'Inactif',
  suspendu: 'Suspendu',
  honoraire: 'Honoraire',
  en_attente: 'En attente',
};

export const STATUT_COTISATION_LABELS = {
  paye: 'Payé',
  partiel: 'Partiel',
  non_paye: 'Non payé',
  non_du: 'Non dû',
};

export const STATUT_VALIDATION_LABELS = {
  valide: 'Validé',
  en_attente: 'En attente',
};

export const FONDS_LABELS = {
  fonctionnement: 'Fonctionnement',
  entraide: 'Entraide',
  evenements: 'Événements',
};

export const ACTION_LABELS = {
  creation: 'Création',
  modification: 'Modification',
  annulation: 'Annulation',
  validation: 'Validation',
};
