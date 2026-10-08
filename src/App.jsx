import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import AccueilPublic from './pages/AccueilPublic';
import Connexion from './pages/Connexion';
import Inscription from './pages/Inscription';
import MotDePasseOublie from './pages/MotDePasseOublie';
import AccueilMembre from './pages/AccueilMembre';
import Caisse from './pages/Caisse';
import Cotisations from './pages/Cotisations';
import MaFicheCotisation from './pages/MaFicheCotisation';
import Actualites from './pages/Actualites';
import ActualiteDetail from './pages/ActualiteDetail';
import Messagerie from './pages/Messagerie';
import Annuaire from './pages/Annuaire';
import SaisieFinanciere from './pages/SaisieFinanciere';
import Administration from './pages/Administration';
import MonProfil from './pages/MonProfil';
import JournalActivite from './pages/JournalActivite';
import GestionPermissions from './pages/GestionPermissions';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-blue-900">
        <i className="fa-solid fa-circle-notch fa-spin text-3xl text-white" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<AccueilPublic />} />
      <Route path="/connexion" element={user ? <Navigate to="/accueil" replace /> : <Connexion />} />
      <Route path="/inscription" element={user ? <Navigate to="/accueil" replace /> : <Inscription />} />
      <Route path="/mot-de-passe-oublie" element={user ? <Navigate to="/accueil" replace /> : <MotDePasseOublie />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/accueil" element={<AccueilMembre />} />
        <Route path="/caisse" element={<Caisse />} />
        <Route path="/cotisations" element={<Cotisations />} />
        <Route path="/cotisations/ma-fiche" element={<MaFicheCotisation />} />
        <Route path="/actualites" element={<Actualites />} />
        <Route path="/actualites/:id" element={<ActualiteDetail />} />
        <Route path="/messagerie" element={<Messagerie />} />
        <Route path="/annuaire" element={<Annuaire />} />
        <Route path="/mon-profil" element={<MonProfil />} />
        <Route
          path="/saisie-financiere"
          element={
            <ProtectedRoute permission="saisie_financiere.acceder">
              <SaisieFinanciere />
            </ProtectedRoute>
          }
        />
        <Route
          path="/administration"
          element={
            <ProtectedRoute permission="administration.acceder">
              <Administration />
            </ProtectedRoute>
          }
        />
        <Route
          path="/journal-activite"
          element={
            <ProtectedRoute permission="journal.consulter">
              <JournalActivite />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gestion-permissions"
          element={
            <ProtectedRoute permission="permissions.gerer">
              <GestionPermissions />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={user ? <Navigate to="/accueil" replace /> : <Navigate to="/" replace />} />
    </Routes>
  );
}
