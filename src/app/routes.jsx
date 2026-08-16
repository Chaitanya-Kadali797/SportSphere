import { Navigate } from "react-router-dom";

import ProtectedRoute from "../components/auth/ProtectedRoute";
import { ROLES } from "../utils/constants";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import HomeRedirect from "../pages/HomeRedirect";
import AdminDashboard from "../pages/admin/AdminDashboard";
import TournamentForm from "../pages/admin/TournamentForm";
import TournamentList from "../pages/admin/TournamentList";
import TournamentView from "../pages/admin/TournamentView";
import SportForm from "../pages/admin/SportForm";
import SportList from "../pages/admin/SportList";
import CoachDashboard from "../pages/coach/CoachDashboard";
import PlayerDashboard from "../pages/player/PlayerDashboard";
import TournamentBrowse from "../pages/player/TournamentBrowse";
import TournamentDetails from "../pages/player/TournamentDetails";
import MyTournaments from "../pages/player/MyTournaments";
import ProfilePage from "../pages/ProfilePage";

// Admin Management & Certificate System Imports
import AdminManagementPage from "../pages/admin/AdminManagementPage";
import VerifyCertificatePage from "../pages/VerifyCertificatePage";
import AdminCertificateList from "../pages/admin/AdminCertificateList";
import GenerateCertificatePage from "../pages/admin/GenerateCertificatePage";
import CertificateDetailPage from "../pages/CertificateDetailPage";
import MyCertificates from "../pages/player/MyCertificates";

export const routes = [
  {
    path: "/",
    element: <HomeRedirect />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  // Public Verification Portal (No login required)
  {
    path: "/verify-certificate",
    element: <VerifyCertificatePage />,
  },
  {
    path: "/verify-certificate/:id",
    element: <VerifyCertificatePage />,
  },
  {
    path: "/admin/dashboard",
    element: (
      <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/users",
    element: (
      <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
        <AdminManagementPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/coach/dashboard",
    element: (
      <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.COACH]}>
        <CoachDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/player/dashboard",
    element: (
      <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.PLAYER]}>
        <PlayerDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/tournaments",
    element: (
      <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.COACH, ROLES.PLAYER]}>
        <TournamentBrowse />
      </ProtectedRoute>
    ),
  },
  {
    path: "/tournaments/:id",
    element: (
      <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.COACH, ROLES.PLAYER]}>
        <TournamentDetails />
      </ProtectedRoute>
    ),
  },
  {
    path: "/my-tournaments",
    element: (
      <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.COACH, ROLES.PLAYER]}>
        <MyTournaments />
      </ProtectedRoute>
    ),
  },
  {
    path: "/my-certificates",
    element: (
      <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.COACH, ROLES.PLAYER]}>
        <MyCertificates />
      </ProtectedRoute>
    ),
  },
  {
    path: "/certificates/:id",
    element: (
      <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.COACH, ROLES.PLAYER]}>
        <CertificateDetailPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.COACH, ROLES.PLAYER]}>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/sports",
    element: (
      <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
        <SportList />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/sports/create",
    element: (
      <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
        <SportForm />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/sports/:id/edit",
    element: (
      <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
        <SportForm />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/tournaments",
    element: (
      <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
        <TournamentList />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/tournaments/create",
    element: (
      <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
        <TournamentForm />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/tournaments/:id/edit",
    element: (
      <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
        <TournamentForm />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/tournaments/:id",
    element: (
      <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
        <TournamentView />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/certificates",
    element: (
      <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
        <AdminCertificateList />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/certificates/create",
    element: (
      <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
        <GenerateCertificatePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
];
