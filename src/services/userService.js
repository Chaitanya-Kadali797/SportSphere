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

import { db } from "../firebase/firebase";
import { getTournament } from "./tournamentService";

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
    await setDoc(
      userRef,
      {
        email: profile.email,
        displayName: profile.displayName || "",
        role: profile.role || "player",
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
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

const tournamentRegistrationsCollection = collection(
  db,
  "tournamentRegistrations"
);

export async function registerForTournament(userId, tournamentId) {
  try {
    console.log(`[userService] registerForTournament: userId=${userId}, tournamentId=${tournamentId}`);
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
    console.log(`[userService] Successfully registered ${userId} for ${tournamentId}`);
  } catch (err) {
    console.error(`[userService] registerForTournament failed for userId=${userId}, tournamentId=${tournamentId}:`, err);
    throw err;
  }
}

export async function unregisterFromTournament(userId, tournamentId) {
  try {
    console.log(`[userService] unregisterFromTournament: userId=${userId}, tournamentId=${tournamentId}`);
    const registrationId = `${userId}_${tournamentId}`;
    const registrationRef = doc(
      db,
      "tournamentRegistrations",
      registrationId
    );

    await deleteDoc(registrationRef);
    console.log(`[userService] Successfully unregistered ${userId} from ${tournamentId}`);
  } catch (err) {
    console.error(`[userService] unregisterFromTournament failed for userId=${userId}, tournamentId=${tournamentId}:`, err);
    throw err;
  }
}

export async function getUserRegistrations(userId) {
  try {
    console.log(`[userService] getUserRegistrations for userId=${userId}`);
    const registrationsQuery = query(
      tournamentRegistrationsCollection,
      where("userId", "==", userId)
    );

    const snapshot = await getDocs(registrationsQuery);
    console.log(`[userService] getUserRegistrations snapshot size: ${snapshot.size}`);

    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map((registrationSnap) => ({
      id: registrationSnap.id,
      ...registrationSnap.data(),
    }));
  } catch (err) {
    console.error(`[userService] getUserRegistrations failed for userId=${userId}:`, err);
    throw err;
  }
}

export async function getRegisteredTournaments(userId) {
  try {
    console.log(`[userService] getRegisteredTournaments for userId=${userId}`);
    const registrations = await getUserRegistrations(userId);

    if (registrations.length === 0) {
      console.log(`[userService] No registrations found for userId=${userId}`);
      return [];
    }

    const tournamentPromises = registrations.map((registration) =>
      getTournament(registration.tournamentId)
    );

    const tournaments = await Promise.all(tournamentPromises);
    const validTournaments = tournaments.filter((tournament) => Boolean(tournament));
    console.log(`[userService] getRegisteredTournaments returning ${validTournaments.length} tournaments`);
    return validTournaments;
  } catch (err) {
    console.error(`[userService] getRegisteredTournaments failed for userId=${userId}:`, err);
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
    console.error(`[userService] getTournamentRegistrationCount failed for tournamentId=${tournamentId}:`, err);
    return 0;
  }
}

export async function getTournamentParticipants(tournamentId) {
  try {
    console.log(`[userService] getTournamentParticipants for tournamentId=${tournamentId}`);
    const registrationsQuery = query(
      tournamentRegistrationsCollection,
      where("tournamentId", "==", tournamentId)
    );

    const snapshot = await getDocs(registrationsQuery);
    console.log(`[userService] getTournamentParticipants count: ${snapshot.size}`);
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
    console.error(`[userService] getTournamentParticipants failed for tournamentId=${tournamentId}:`, err);
    return [];
  }
}