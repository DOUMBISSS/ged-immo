// App.js
import './App.css';
import { Routes, Route } from 'react-router-dom';
import React, { useEffect, useState } from "react";
import PermissionModal from "./Pages/PermissionModal";
import { toast } from "react-toastify";

// Contexts
import { UserProvider, useUserContext } from './contexts/UserContext';
import { LocataireProvider } from "./contexts/LocataireContext";
import { UserMagasinProvider } from "./contexts/UserMagasinContext";
import { Toaster } from 'react-hot-toast';

// Pages principales
import Home from './Pages/Home';
import Accueil from './Pages/Accueil';
import User from './Pages/User';
import Profil from './Pages/Profil';
import Update from './Pages/Locataires/Update';
import DetailUser from './Pages/DetailUser';
import DetailHome from './Pages/DetailHome';
import Receipt from './Pages/Receipt';
import PaiementDetail from './Pages/PaiementDetail';
import Statistiques from './Pages/Statistiques';
import Inscription from './Pages/Inscription';
import Project from './Pages/Project';
import DetailProject from './Pages/DetailProject';
import HomeLocataire from './Pages/Locataires/HomeLocataire';
import DetailLocataire from './Pages/Locataires/DetailLocataire';
import ResetPassword from './Pages/Locataires/ResetPassword';
import Archives from './Pages/Archives';
import UploadDocument from './Pages/UploadDocument';
import DetailArchivedUser from './Pages/Locataires/DetailArchivedUser';
import DetailArchivedHome from './Pages/Locataires/DetailArchivedHome';
import NotFoundPage from './Pages/NotFoundPage';
import ConfirmEmail from './Pages/Email/ConfirmEmail';
import ReceiptPage from './Pages/Receipt/ReceiptPage';
import ResetPasswords from './Pages/Email/ResetPasswords';
import Notifications from './Pages/Notifications';
import ArchivesDetail from './Pages/Locataires/ArchivesDetail';
import Administrator from './Pages/Admin/Administrator';
import Comptabilite from './Pages/Comptabilité/Comptabilite';
import ReceiptLocataire from './Pages/Locataires/ReceiptLocataire';
import { authorize } from './middlewares/authorize';

// Magasin pages
import LoginMagasin from './Pages/Magasin/LoginMagasin';
import HomeMagasin from './Pages/Magasin/HomeMagasin';
import RegisterMagasin from './Pages/Magasin/RegisterMagasin';
import DashMagasin from './Pages/Magasin/DashMagasin';
import DetailMagasin from './Pages/Magasin/DetailMagasin';
import ProfilOwner from './Pages/Magasin/ProfilOwner';
import ReceiptMagasin from './Pages/Magasin/ReceiptMagasin';
import ListeMagasin from './Pages/Magasin/ListeMagasin';
import DetailProjectMagasin from './Pages/Magasin/DetailProjectMagasin';
import Tracabilite from './Pages/Tracabilite';

import { GedProvider } from './contexts/GedContext';
import DetailAdminGed from './Pages/Plateforme/DetailAdminGed';

// Middleware
import ProtectedRoute from './middlewares/ProtectedRoute';
import LoginGED from './Pages/Plateforme/LoginGED';
import RegisterGED from './Pages/Plateforme/RegisterGED';
import AdminsGED from './Pages/Plateforme/AdminsGED';
import DetailEntrepot from './Pages/Entrepot/DetailEntrepot';
import DetailBureau from './Pages/Bureau/DetailBureau';
import GedNotifications from './Pages/Plateforme/GedNotifications';

// ✅ Wrapper pour accéder à UserContext
function AppRoutes({ setShowPermissionModal, setPermissionMessage }) {
  const { user } = useUserContext();
  const currentAdminId = user?.adminId || user?._id || null;

  // useEffect(() => {
  //   // 🔒 Interception globale des erreurs fetch
  //   const originalFetch = window.fetch;
  //   window.fetch = async (...args) => {
  //     try {
  //       const response = await originalFetch(...args);

  //       // Si erreur 401 ou 403 -> affiche la modale
  //       if (response.status === 401 || response.status === 403) {
  //         let errorText = "";
  //         try {
  //           const data = await response.clone().json();
  //           errorText = data.message || "Accès refusé";
  //         } catch {
  //           errorText = "Accès refusé";
  //         }

  //         setPermissionMessage(errorText);
  //         setShowPermissionModal(true);
  //       }

  //       return response;
  //     } catch (err) {
  //       toast.error("Erreur de connexion au serveur");
  //       throw err;
  //     }
  //   };
  // }, [setPermissionMessage, setShowPermissionModal]);

  return (
    <>
      <Routes>

        <Route path="/login/ged/admin" element={<LoginGED />} />
        <Route path="/ged/register" element={<RegisterGED />} />
        <Route path="/ged/admin/:id" element={<DetailAdminGed />} />
            <Route path="/ged/admins" element={<AdminsGED />} />
                <Route path="/ged/notifications/fr/" element={<GedNotifications />} />
        {/* --- ROUTES PUBLIQUES --- */}
        <Route path="/" element={<Home />} />
        <Route path="/confirm/:token" element={<ConfirmEmail />} />
        <Route path="/reset/:token" element={<ResetPasswords />} />
        <Route path="/receiptPage/:token" element={<ReceiptPage />} />
        <Route path="/new__inscription" element={<Inscription />} />

        {/* --- CONNEXION PROPRIÉTAIRE MAGASIN --- */}
        <Route path="/login-magasin" element={<LoginMagasin />} />
        <Route path="/home-magasin" element={<HomeMagasin />} />
        <Route path="/register__proprio" element={<RegisterMagasin />} />
        <Route path="/My__dash" element={<DashMagasin />} />
       
        <Route path="/Mon/profil" element={<ProfilOwner />} />
        {/* <Route path="/Mon__recu/fr/:id" element={<ReceiptMagasin />} /> */}
        {/* <Route path="/detailProject/fr/:id" element={<DetailProjectMagasin />} /> */}
        <Route path="/liste/fr/" element={<ListeMagasin />} />
        <Route path="/detailEntrepot/:id" element={<DetailEntrepot />} />
         <Route path="/DetailMagasin/:id" element={<DetailMagasin />} />
          <Route path="/detailBureau/:id" element={<DetailBureau />} />

        {/* --- LOCATAIRES --- */}
        <Route path="/Mon__compte" element={<HomeLocataire />} />
        <Route path="/account/fr/:id" element={<DetailLocataire />} />
        <Route path="/Mon__recu/fr/:rentId" element={<ReceiptLocataire />} />

        {/* --- ROUTES PROTÉGÉES --- */}
        <Route path="/Accueil" element={<ProtectedRoute authRequired={true}><Accueil /></ProtectedRoute>} />
        <Route path="/DetailMagasin/:id" element={<ProtectedRoute authRequired={true}><DetailMagasin /></ProtectedRoute>} />
        <Route path="/Actions" element={<ProtectedRoute authRequired={true}><Tracabilite /></ProtectedRoute>} />
        <Route path="/mon-profil" element={<ProtectedRoute authRequired={true}><Profil /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute authRequired={true} allowedRoles={['user','admin']} adminId={currentAdminId}><User /></ProtectedRoute>} />
        <Route path="/update/:id" element={<ProtectedRoute authRequired={true}><Update /></ProtectedRoute>} />
        <Route path="/detailUser/:id" element={<ProtectedRoute authRequired={true}><DetailUser /></ProtectedRoute>} />
        <Route path="/detailHome/:id" element={<ProtectedRoute authRequired={true}><DetailHome /></ProtectedRoute>} />
        <Route path="/receipt/:rentId" element={<ProtectedRoute authRequired={true}><Receipt /></ProtectedRoute>} />
        <Route path="/paiementDetail/:id" element={<ProtectedRoute authRequired={true}><PaiementDetail /></ProtectedRoute>} />
        <Route path="/statistiques" element={<ProtectedRoute authRequired={true}><Statistiques /></ProtectedRoute>} />
        <Route path="/Mes__projet/fr/" element={<ProtectedRoute authRequired={true}><Project /></ProtectedRoute>} />
        <Route path="/detail_projet/fr/:id" element={<ProtectedRoute authRequired={true}><DetailProject /></ProtectedRoute>} />
        <Route path="/reset-password/:id" element={<ProtectedRoute authRequired={true}><ResetPassword /></ProtectedRoute>} />
        <Route path="/Mes__archives" element={<ProtectedRoute authRequired={true}><Archives /></ProtectedRoute>} />
        <Route path="/detailArchivedUser/:id" element={<ProtectedRoute authRequired={true}><DetailArchivedUser /></ProtectedRoute>} />
        <Route path="/detailArchivedHome/:id" element={<ProtectedRoute authRequired={true}><DetailArchivedHome /></ProtectedRoute>} />
        <Route path="/Notifications" element={<ProtectedRoute authRequired={true}><Notifications /></ProtectedRoute>} />
        <Route path="/archivedetail/:id" element={<ProtectedRoute authRequired={true}><ArchivesDetail /></ProtectedRoute>} />
        <Route path="/administrator" element={<ProtectedRoute authRequired={true} roles={["admin"]}><Administrator /></ProtectedRoute>} />
        <Route path="/Ma__comptabilite" element={<ProtectedRoute authRequired={true}><Comptabilite /></ProtectedRoute>} />

        {/* --- PAGE 404 --- */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
}

export default function App() {
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [permissionMessage, setPermissionMessage] = useState("");

  return (
    <UserProvider>
     <GedProvider>
       <LocataireProvider>
        <UserMagasinProvider>
          <AppRoutes
            setShowPermissionModal={setShowPermissionModal}
            setPermissionMessage={setPermissionMessage}
          />

          {/* 🔒 Modale globale affichée si une permission est refusée */}
          <PermissionModal
            visible={showPermissionModal}
            message={permissionMessage}
            onClose={() => setShowPermissionModal(false)}
          />
         
        </UserMagasinProvider>
      </LocataireProvider>
     </GedProvider>
    </UserProvider>
  );
}