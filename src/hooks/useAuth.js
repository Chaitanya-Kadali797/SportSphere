import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

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

  return {
    role,
    isAdmin: role === "admin",
    isCoach: role === "coach",
    isPlayer: role === "player",
    displayName: typeof userProfile?.displayName === "string" ? userProfile.displayName : "",
  };

}
