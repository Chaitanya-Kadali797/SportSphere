import { createContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { createOrUpdateUserProfile, getUserProfile } from "../services/userService";
import { ROLES } from "../utils/constants";
import Loader from "../components/common/Loader";

function inferRoleFromEmail(email) {
  if (!email) return ROLES.PLAYER;
  const lowered = email.toLowerCase();
  if (lowered.includes("admin")) return ROLES.ADMIN;
  if (lowered.includes("coach")) return ROLES.COACH;
  if (lowered.includes("player")) return ROLES.PLAYER;
  return ROLES.PLAYER;
}

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const timeoutId = setTimeout(() => {
      if (isMounted && loading) {
        setLoading(false);
      }
    }, 2000);


    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      clearTimeout(timeoutId);

      if (!currentUser) {
        if (isMounted) {
          setUser(null);
          setUserProfile(null);
          setRole(null);
          setIsAuthenticated(false);
          setProfileError(null);
          setLoading(false);
        }
        return;
      }

      if (isMounted) setLoading(true);
      setUser(currentUser);
      setProfileError(null);

      try {
        let profile = await getUserProfile(currentUser.uid);
        const inferred = inferRoleFromEmail(currentUser.email);

        if (!profile || !profile.role) {
          const newProfile = {
            email: currentUser.email,
            displayName: currentUser.displayName || (inferred === ROLES.ADMIN ? "Administrator" : "Player"),
            role: profile?.role || inferred,
          };
          try {
            await createOrUpdateUserProfile(currentUser.uid, newProfile);
            profile = await getUserProfile(currentUser.uid);
          } catch (pErr) {
            console.error("Failed to persist user profile:", pErr);
          }
        }

        if (isMounted) {
          const finalRole = profile?.role || inferred;
          setUserProfile(profile || { uid: currentUser.uid, email: currentUser.email, role: finalRole });
          setRole(finalRole);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Auth profile load failed:", error);
        if (isMounted) {
          const fallbackRole = inferRoleFromEmail(currentUser.email);
          setUserProfile({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            role: fallbackRole,
          });
          setRole(fallbackRole);
          setIsAuthenticated(true);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  if (loading) {
    return <Loader message="Initializing SportSphere..." />;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        role,
        isAuthenticated,
        loading,
        profileError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}