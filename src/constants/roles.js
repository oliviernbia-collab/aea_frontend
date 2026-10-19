// Postes du Bureau Executif National (BEN) -- mandat 2026-2028.
// Source unique des roles/postes, reutilisee par Administration, GestionPermissions,
// MonProfil, etc. pour eviter que les listes divergent entre les pages.

export const GROUPES_ROLES = [
  {
    label: 'Direction',
    roles: [
      { value: 'membre', label: 'Membre' },
      { value: 'super_admin', label: 'Super administrateur' },
      { value: 'president', label: 'Président(e)' },
      { value: 'vice_president', label: 'Vice-Président(e)' },
    ],
  },
  {
    label: 'Bureau Exécutif - Titulaires',
    roles: [
      { value: 'secretaire_general', label: 'Secrétaire Général(e)' },
      { value: 'tresorier', label: 'Secrétaire aux Finances' },
      { value: 'resp_communication', label: 'Secrétaire à la Communication' },
      { value: 'secretaire_organisation', label: "Secrétaire à l'Organisation" },
      { value: 'secretaire_academique', label: 'Secrétaire aux Affaires Académiques et Scolaires' },
      { value: 'secretaire_culturel', label: 'Secrétaire aux Affaires Culturelles et Sportives' },
      { value: 'commissaire_comptes', label: 'Commissaire aux Comptes' },
      { value: 'secretaire_ideologique', label: 'Secrétaire à la Formation Idéologique' },
      { value: 'secretaire_social', label: "Secrétaire aux Affaires Sociales et à l'Environnement" },
      { value: 'secretaire_insertion', label: "Secrétaire à l'Insertion Professionnelle et à l'Entrepreneuriat" },
    ],
  },
  {
    label: 'Bureau Exécutif - Adjoints',
    roles: [
      { value: 'sg_adjoint_1', label: 'Secrétaire Général Adjoint (1)' },
      { value: 'sg_adjoint_2', label: 'Secrétaire Général Adjoint (2)' },
      { value: 'sf_adjoint_1', label: 'Adjoint Secrétaire aux Finances (1)' },
      { value: 'sf_adjoint_2', label: 'Adjoint Secrétaire aux Finances (2)' },
      { value: 'com_adjoint_1', label: 'Adjoint Communication (1)' },
      { value: 'com_adjoint_2', label: 'Adjoint Communication (2)' },
      { value: 'so_adjoint_1', label: "Adjoint à l'Organisation (1)" },
      { value: 'so_adjoint_2', label: "Adjoint à l'Organisation (2)" },
      { value: 'saas_adjoint_1', label: 'Adjoint Affaires Académiques (1)' },
      { value: 'saas_adjoint_2', label: 'Adjoint Affaires Académiques (2)' },
      { value: 'sacs_adjoint_1', label: 'Adjoint Affaires Culturelles (1)' },
      { value: 'sacs_adjoint_2', label: 'Adjoint Affaires Culturelles (2)' },
      { value: 'cc_adjoint_1', label: 'Adjoint Commissaire aux Comptes' },
      { value: 'sfi_adjoint_1', label: 'Adjoint Formation Idéologique' },
      { value: 'sase_adjoint_1', label: 'Adjoint Affaires Sociales (1)' },
      { value: 'sase_adjoint_2', label: 'Adjoint Affaires Sociales (2)' },
      { value: 'sipe_adjoint_1', label: 'Adjoint Insertion Professionnelle (1)' },
      { value: 'sipe_adjoint_2', label: 'Adjoint Insertion Professionnelle (2)' },
    ],
  },
];

export const ROLE_LABELS = GROUPES_ROLES.reduce((acc, groupe) => {
  groupe.roles.forEach((r) => { acc[r.value] = r.label; });
  return acc;
}, {});
