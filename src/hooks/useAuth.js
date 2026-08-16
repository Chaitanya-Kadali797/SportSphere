import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { ROLES } from "../utils/constants";

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }

  return context;
}

export function useAuth() {
  return useAuthContext();
}

export function useRole() {
  const { role, userProfile } = useAuthContext();

  const isSuperAdmin = role === ROLES.SUPER_ADMIN;
  const isAdmin = role === ROLES.ADMIN;
  const isAnyAdmin = isSuperAdmin || isAdmin;
  const isCoach = role === ROLES.COACH;
  const isPlayer = role === ROLES.PLAYER;

  return {
    role,
    isSuperAdmin,
    isAdmin,
    isAnyAdmin,
    isCoach,
    isPlayer,
    displayName: typeof userProfile?.displayName === "string" ? userProfile.displayName : "",
  };
}
