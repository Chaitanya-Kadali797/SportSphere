import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";

import { db } from "../firebase/firebase";
import { getTournament } from "./tournamentService";
import { ROLES } from "../utils/constants";

export async function getUserProfile(uid) {
  try {
    const userRef = doc(db, "users", uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
      console.log(`[userService] getUserProfile: profile doc for ${uid} does not exist`);
      return null;
    }

    return {
      uid: snapshot.id,
      ...snapshot.data(),
    };
  } catch (err) {
    console.error(`[userService] getUserProfile error for ${uid}:`, err);
    throw err;
  }
}

export async function createOrUpdateUserProfile(uid, profile) {
  try {
    const userRef = doc(db, "users", uid);
    const updateData = {
      email: profile.email,
      displayName: profile.displayName || "",
      role: profile.role || "player",
      active: profile.active !== undefined ? profile.active : true,
      updatedAt: serverTimestamp(),
    };

    if (profile.phone !== undefined) {
      updateData.phone = profile.phone;
    }
    if (profile.emailVerified !== undefined) {
      updateData.emailVerified = profile.emailVerified;
    }

    if (!profile.createdAt) {
      updateData.createdAt = serverTimestamp();
    }

    await setDoc(userRef, updateData, { merge: true });
  } catch (err) {
    console.error(`[userService] createOrUpdateUserProfile error for ${uid}:`, err);
    throw err;
  }
}

export async function updateUserProfile(uid, updates) {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error(`[userService] updateUserProfile error for ${uid}:`, err);
    throw err;
  }
}

// ==========================================
// ADMIN ACCOUNT MANAGEMENT SERVICES
// ==========================================

export async function createAdminAuthAccount(email, password) {
  let secondaryApp;
  const appName = "SecondaryAdminCreatorApp";
  const existingApps = getApps();
  const foundApp = existingApps.find((a) => a.name === appName);

  if (foundApp) {
    secondaryApp = foundApp;
  } else {
    const primaryApp = existingApps[0];
    secondaryApp = initializeApp(primaryApp.options, appName);
  }

  const secondaryAuth = getAuth(secondaryApp);
  const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
  const newUid = userCredential.user.uid;

  await signOut(secondaryAuth);
  return newUid;
}

export async function getAdminAccounts() {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("role", "==", "admin"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return [];

    return snapshot.docs
      .map((docSnap) => ({
        uid: docSnap.id,
        ...docSnap.data(),
      }))
      .filter((userDoc) => userDoc.role === "admin");
  } catch (err) {
    console.error("[userService] getAdminAccounts error:", err);
    throw err;
  }
}

export async function getActiveAdminCount() {
  try {
    const admins = await getAdminAccounts();
    return admins.filter((a) => a.active !== false).length;
  } catch (err) {
    console.error("[userService] getActiveAdminCount error:", err);
    return 0;
  }
}

export async function createAdminAccount({ displayName, email, password, superAdminUid }) {
  const activeCount = await getActiveAdminCount();
  if (activeCount >= 3) {
    throw new Error("Maximum of 3 Admin accounts reached.");
  }

  const existingAdmins = await getAdminAccounts();
  const isDuplicate = existingAdmins.some(
    (a) => a.email && a.email.toLowerCase() === email.trim().toLowerCase()
  );
  if (isDuplicate) {
    throw new Error("An Admin account with this email address already exists.");
  }

  const newUid = await createAdminAuthAccount(email.trim(), password);

  const userRef = doc(db, "users", newUid);
  const newAdminProfile = {
    uid: newUid,
    displayName: displayName.trim(),
    email: email.trim().toLowerCase(),
    role: "admin",
    active: true,
    createdBy: superAdminUid || "superAdmin",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(userRef, newAdminProfile);
  return newAdminProfile;
}

export async function toggleAdminStatus(adminUid, activeStatus) {
  if (activeStatus === true) {
    const activeCount = await getActiveAdminCount();
    if (activeCount >= 3) {
      throw new Error("Maximum of 3 Admin accounts reached.");
    }
  }

  const userRef = doc(db, "users", adminUid);
  await updateDoc(userRef, {
    active: activeStatus,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteAdminAccount(adminUid) {
  const userRef = doc(db, "users", adminUid);
  await deleteDoc(userRef);
}

// ==========================================
// TOURNAMENT REGISTRATIONS SERVICES
// ==========================================

const tournamentRegistrationsCollection = collection(
  db,
  "tournamentRegistrations"
);

export async function registerForTournament(userId, tournamentId) {
  try {
    const registrationId = `${userId}_${tournamentId}`;
    const registrationRef = doc(
      db,
      "tournamentRegistrations",
      registrationId
    );

    await setDoc(registrationRef, {
      userId,
      tournamentId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error(`[userService] registerForTournament failed:`, err);
    throw err;
  }
}

export async function unregisterFromTournament(userId, tournamentId) {
  try {
    const registrationId = `${userId}_${tournamentId}`;
    const registrationRef = doc(
      db,
      "tournamentRegistrations",
      registrationId
    );

    await deleteDoc(registrationRef);
  } catch (err) {
    console.error(`[userService] unregisterFromTournament failed:`, err);
    throw err;
  }
}

export async function getUserRegistrations(userId) {
  try {
    const registrationsQuery = query(
      tournamentRegistrationsCollection,
      where("userId", "==", userId)
    );

    const snapshot = await getDocs(registrationsQuery);

    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map((registrationSnap) => ({
      id: registrationSnap.id,
      ...registrationSnap.data(),
    }));
  } catch (err) {
    console.error(`[userService] getUserRegistrations failed:`, err);
    throw err;
  }
}

export async function getRegisteredTournaments(userId) {
  try {
    const registrations = await getUserRegistrations(userId);

    if (registrations.length === 0) {
      return [];
    }

    const tournamentPromises = registrations.map((registration) =>
      getTournament(registration.tournamentId)
    );

    const tournaments = await Promise.all(tournamentPromises);
    return tournaments.filter((tournament) => Boolean(tournament));
  } catch (err) {
    console.error(`[userService] getRegisteredTournaments failed:`, err);
    throw err;
  }
}

export async function getTournamentRegistrationCount(tournamentId) {
  try {
    const registrationsQuery = query(
      tournamentRegistrationsCollection,
      where("tournamentId", "==", tournamentId)
    );

    const snapshot = await getDocs(registrationsQuery);
    return snapshot.size;
  } catch (err) {
    console.error(`[userService] getTournamentRegistrationCount failed:`, err);
    return 0;
  }
}

export async function getTournamentParticipants(tournamentId) {
  try {
    const registrationsQuery = query(
      tournamentRegistrationsCollection,
      where("tournamentId", "==", tournamentId)
    );

    const snapshot = await getDocs(registrationsQuery);
    if (snapshot.empty) return [];

    const userPromises = snapshot.docs.map(async (regSnap) => {
      const regData = regSnap.data();
      let userProfile = null;
      try {
        userProfile = await getUserProfile(regData.userId);
      } catch (uErr) {
        console.error(`[userService] Failed to fetch profile for user ${regData.userId}:`, uErr);
      }
      return {
        registrationId: regSnap.id,
        userId: regData.userId,
        registeredAt: regData.createdAt?.toDate ? regData.createdAt.toDate() : regData.createdAt,
        displayName: userProfile?.displayName || "Player",
        email: userProfile?.email || "—",
        organization: userProfile?.organization || "—",
        phone: userProfile?.phone || "—",
      };
    });

    return Promise.all(userPromises);
  } catch (err) {
    console.error(`[userService] getTournamentParticipants failed:`, err);
    return [];
  }
}