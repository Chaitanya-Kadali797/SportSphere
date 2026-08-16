import { createContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { createOrUpdateUserProfile, getUserProfile } from "../services/userService";
import { ROLES } from "../utils/constants";
import Loader from "../components/common/Loader";

function determineUserRole(profile) {
  if (!profile) return ROLES.PLAYER;

  // Primary Super Admin check: explicit superAdmin role OR root admin doc without createdBy field
  if (
    profile.role === ROLES.SUPER_ADMIN ||
    profile.role === "superAdmin" ||
    (profile.role === "admin" && !profile.createdBy)
  ) {
    return ROLES.SUPER_ADMIN;
  }

  if (profile.role === ROLES.ADMIN || profile.role === "admin") {
    return ROLES.ADMIN;
  }

  if (profile.role === ROLES.COACH || profile.role === "coach") {
    return ROLES.COACH;
  }

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
    }, 2500);

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
        const finalRole = determineUserRole(profile);

        // Update profile in Firestore if role needs to be persisted as superAdmin or initialized
        if (!profile || profile.role !== finalRole) {
          const updatedProfile = {
            ...profile,
            email: currentUser.email,
            displayName: profile?.displayName || currentUser.displayName || (finalRole === ROLES.SUPER_ADMIN ? "Super Admin" : finalRole === ROLES.ADMIN ? "Admin" : "Player"),
            role: finalRole,
            active: profile?.active !== undefined ? profile.active : true,
          };
          try {
            await createOrUpdateUserProfile(currentUser.uid, updatedProfile);
            profile = await getUserProfile(currentUser.uid);
          } catch (pErr) {
            console.error("Failed to persist user profile:", pErr);
          }
        }

        // Check if regular Admin account is deactivated
        if (profile?.role === ROLES.ADMIN && profile?.active === false) {
          if (isMounted) {
            setUserProfile(profile);
            setRole(ROLES.ADMIN);
            setIsAuthenticated(false);
            setProfileError("Your Admin account has been deactivated. Please contact the Super Admin.");
            setLoading(false);
          }
          return;
        }

        if (isMounted) {
          const effectiveRole = profile?.role || finalRole;
          setUserProfile(profile || { uid: currentUser.uid, email: currentUser.email, role: effectiveRole, active: true });
          setRole(effectiveRole);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Auth profile load failed:", error);
        if (isMounted) {
          setUserProfile({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            role: ROLES.PLAYER,
            active: true,
          });
          setRole(ROLES.PLAYER);
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

  const isSuperAdmin = role === ROLES.SUPER_ADMIN;
  const isAdmin = role === ROLES.ADMIN;
  const isAnyAdmin = isSuperAdmin || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        role,
        isSuperAdmin,
        isAdmin,
        isAnyAdmin,
        isAuthenticated,
        loading,
        profileError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}