// 🆓 ABONNEMENT GRATUIT
const abonnementGratuit = {
  nom: "Abonnement Gratuit",
  type: "Free / Basic",
  description:
    "Offre d’essai permettant de découvrir la plateforme GED IMMO avec des fonctionnalités limitées.",

  limites: {
    documentsConsultables: "Accès limité aux documents et projets",
    exportCSVouPDF: false,
    documentsParLocataire: 1,
    projetsMax: 3,
    tailleMaxFichierMo: 5,
    historiqueVersions: false,
    tracabilite: false,
    compteLocataire: false,
    archivageAutorise: false,
    accesArchives: false,
    signaturesElectroniquesAutorisees: 1,
    utilisateursMax: 1,
    rolesPermissionsAvancees: false,
    suppressionAutomatiqueJours: 180,
  },

  features: {
    consultationDocuments: true,
    creationProjet: true,
    televersementDocuments: true,
    rechercheBasique: true,
    rechercheAvancee: false,
    signatureElectronique: true,
    gestionRolesPermissions: false,
    accesTracabilite: false,
    accesArchives: false,
    exportCSV: false,
    exportPDF: false,
  },

  support: {
    type: "Email uniquement",
    delaiReponseHeures: 72,
    assistanceTempsReel: false,
  },

  securite: {
    chiffrementStandard: true,
    controleAccesAvance: false,
    sauvegardeAutomatique: false,
  },

  conditions: {
    publiciteIncluse: true,
    upgradeDisponible: true,
    renouvellementAutomatique: false,
  },
};

// 💼 ABONNEMENT STANDARD
const abonnementStandard = {
  nom: "Abonnement Standard",
  type: "Pro / Standard",
  description:
    "Idéal pour les petites agences ou propriétaires souhaitant gérer plusieurs projets immobiliers avec des fonctions avancées de GED.",

  limites: {
    documentsConsultables: "Illimité (dans la limite du stockage)",
    exportCSVouPDF: true,
    documentsParLocataire: 10,
    projetsMax: 10,
    tailleMaxFichierMo: 25,
    historiqueVersions: true,
    tracabilite: true,
    compteLocataire: true, // chaque locataire peut avoir un accès lecture
    archivageAutorise: true,
    accesArchives: true,
    signaturesElectroniquesAutorisees: 10,
    utilisateursMax: 5,
    rolesPermissionsAvancees: true,
    suppressionAutomatiqueJours: 365, // fichiers conservés plus longtemps
  },

  features: {
    consultationDocuments: true,
    creationProjet: true,
    televersementDocuments: true,
    rechercheBasique: true,
    rechercheAvancee: true,
    signatureElectronique: true,
    gestionRolesPermissions: true,
    accesTracabilite: true,
    accesArchives: true,
    exportCSV: true,
    exportPDF: true,
  },

  support: {
    type: "Email + Chat",
    delaiReponseHeures: 24,
    assistanceTempsReel: true,
  },

  securite: {
    chiffrementStandard: true,
    controleAccesAvance: true,
    sauvegardeAutomatique: true,
  },

  conditions: {
    publiciteIncluse: false,
    upgradeDisponible: true,
    renouvellementAutomatique: true,
  },
};

// 🏢 ABONNEMENT PREMIUM
const abonnementPremium = {
  nom: "Abonnement Premium",
  type: "Entreprise / Premium",
  description:
    "Offre complète pour les entreprises et gestionnaires immobiliers ayant besoin de puissance, de stockage et de collaboration illimitée.",

  limites: {
    documentsConsultables: "Illimité",
    exportCSVouPDF: true,
    documentsParLocataire: "Illimité",
    projetsMax: "Illimité",
    tailleMaxFichierMo: 100,
    historiqueVersions: true,
    tracabilite: true,
    compteLocataire: true,
    archivageAutorise: true,
    accesArchives: true,
    signaturesElectroniquesAutorisees: "Illimité",
    utilisateursMax: "Illimité",
    rolesPermissionsAvancees: true,
    suppressionAutomatiqueJours: null, // pas de suppression automatique
  },

  features: {
    consultationDocuments: true,
    creationProjet: true,
    televersementDocuments: true,
    rechercheBasique: true,
    rechercheAvancee: true,
    signatureElectronique: true,
    gestionRolesPermissions: true,
    accesTracabilite: true,
    accesArchives: true,
    exportCSV: true,
    exportPDF: true,
    collaborationTempsReel: true,
    notificationsAutomatiques: true,
    tableauDeBordAnalytique: true,
  },

  support: {
    type: "Email + Chat + Assistance dédiée",
    delaiReponseHeures: 4,
    assistanceTempsReel: true,
  },

  securite: {
    chiffrementStandard: true,
    controleAccesAvance: true,
    sauvegardeAutomatique: true,
    sauvegardeCloudRedondante: true,
    auditSecuriteRegulier: true,
  },

  conditions: {
    publiciteIncluse: false,
    upgradeDisponible: false,
    renouvellementAutomatique: true,
    contratPersonnalisable: true,
  },
};