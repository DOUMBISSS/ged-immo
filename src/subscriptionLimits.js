export const SUBSCRIPTION_LIMITS = {
  gratuit: {
    maxProjects: 3,
    maxUsers: 1,
    maxFileSizeMB: 5,
    maxSignatures: 1,
    exportAllowed: true,
    archives: true,
    duplicateHomes: false,
    uploadDocument:1, // 🚫 duplication interdite
  },
  standard: {
    maxProjects: 10,
    maxUsers: 5,
    maxFileSizeMB: 25,
    maxSignatures: 2,
    exportAllowed: false,
    archives: true, // ❌ pas d’archives
    duplicateHomes: true,
    uploadDocument:3,
    sendEmail:true
     // ✅ duplication autorisée
  },
  premium: {
    maxProjects: 15,
    maxUsers: 10,
    maxFileSizeMB: 10,
    maxSignatures: 5,
    exportAllowed: true,
    archives: true,
    duplicateHomes: true,
      uploadDocument:3,
      sendEmail:true
  },
};