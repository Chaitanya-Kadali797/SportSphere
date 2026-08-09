import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

const tournamentsCollection = collection(db, "tournaments");

function safeGetTime(val) {
  if (!val) return 0;
  if (val instanceof Date) {
    const t = val.getTime();
    return isNaN(t) ? 0 : t;
  }
  if (typeof val === "number" && !isNaN(val)) return val;
  if (typeof val === "string") {
    const t = new Date(val).getTime();
    return isNaN(t) ? 0 : t;
  }
  return 0;
}

function normalizeDate(value) {
  try {
    if (!value) return null;
    if (value instanceof Date) {
      return isNaN(value.getTime()) ? null : value;
    }
    if (typeof value.toDate === "function") {
      try {
        const d = value.toDate();
        return d instanceof Date && !isNaN(d.getTime()) ? d : null;
      } catch (e) {
        // fallback
      }
    }
    if (typeof value.seconds === "number" && !isNaN(value.seconds)) {
      const d = new Date(value.seconds * 1000);
      return isNaN(d.getTime()) ? null : d;
    }
    if (typeof value === "string" || typeof value === "number") {
      const d = new Date(value);
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  } catch (err) {
    console.error("[normalizeDate] Error normalizing date:", value, err);
    return null;
  }
}

function normalizeTournament(snapshot) {
  try {
    const data = snapshot.data() || {};
    return {
      id: snapshot.id,
      ...data,
      name: data.name || "Untitled Tournament",
      sport: data.sport || "General Sport",
      type: data.type || "team",
      status: data.status || "Published",
      location: data.location || "Venue TBD",
      organizer: data.organizer || "SportsSphere",
      description: data.description || "",
      maxParticipants: Number(data.maxParticipants) || 100,
      startDate: normalizeDate(data.startDate),
      endDate: normalizeDate(data.endDate),
      registrationStartDate: normalizeDate(data.registrationStartDate),
      registrationEndDate: normalizeDate(data.registrationEndDate),
      createdAt: normalizeDate(data.createdAt),
      updatedAt: normalizeDate(data.updatedAt),
    };
  } catch (err) {
    console.error(`[normalizeTournament] Error normalizing snapshot ${snapshot.id}:`, err);
    return {
      id: snapshot.id,
      name: "Tournament",
      status: "Published",
    };
  }
}

export async function getTournaments() {
  try {
    console.log("[tournamentService] Querying getDocs(collection(db, 'tournaments'))...");
    const snapshot = await getDocs(tournamentsCollection);
    console.log(`[tournamentService] getDocs snapshot returned ${snapshot.size} documents directly from Firestore.`);

    if (snapshot.empty) {
      console.log("[tournamentService] Snapshot is empty (0 tournaments found in Firestore).");
      return [];
    }

    const tournaments = snapshot.docs
      .map((docSnap) => {
        try {
          const norm = normalizeTournament(docSnap);
          console.log(`[tournamentService] Doc ID: ${norm.id} | Status: "${norm.status}" | Name: "${norm.name}" | StartDate: ${norm.startDate}`);
          return norm;
        } catch (mErr) {
          console.error(`[tournamentService] Failed to map doc ${docSnap.id}:`, mErr);
          return null;
        }
      })
      .filter(Boolean);

    console.log(`[tournamentService] Successfully mapped ${tournaments.length} tournament documents.`);

    tournaments.sort((a, b) => {
      const timeA = safeGetTime(a.createdAt) || safeGetTime(a.startDate);
      const timeB = safeGetTime(b.createdAt) || safeGetTime(b.startDate);
      return timeB - timeA;
    });

    console.log(`[tournamentService] Final sorted tournaments array count: ${tournaments.length}`);
    return tournaments;
  } catch (error) {
    console.error("[tournamentService] getTournaments query failed with error:", error.code, error.message, error);
    return [];
  }
}

export async function getTournament(id) {
  try {
    console.log(`[tournamentService] Fetching getDoc for tournament ID: ${id}`);
    const docRef = doc(db, "tournaments", id);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      console.log(`[tournamentService] Tournament document ${id} does NOT exist in Firestore.`);
      return null;
    }

    const norm = normalizeTournament(snapshot);
    console.log(`[tournamentService] Loaded tournament ${id} successfully:`, norm);
    return norm;
  } catch (err) {
    console.error(`[tournamentService] getTournament error for ID ${id}:`, err.code, err.message, err);
    throw err;
  }
}

export async function createTournament(tournament) {
  try {
    const docRef = doc(tournamentsCollection);
    console.log("[tournamentService] Creating new tournament document with payload:", tournament);
    await setDoc(docRef, {
      ...tournament,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log(`[tournamentService] Successfully created tournament doc ID: ${docRef.id}`);
    return docRef.id;
  } catch (err) {
    console.error("[tournamentService] createTournament error:", err.code, err.message, err);
    throw err;
  }
}

export async function updateTournament(id, tournament) {
  try {
    console.log(`[tournamentService] Updating tournament ${id} with payload:`, tournament);
    const docRef = doc(db, "tournaments", id);
    await updateDoc(docRef, {
      ...tournament,
      updatedAt: serverTimestamp(),
    });
    console.log(`[tournamentService] Successfully updated tournament doc ${id}`);
  } catch (err) {
    console.error(`[tournamentService] updateTournament error for ${id}:`, err.code, err.message, err);
    throw err;
  }
}

export async function deleteTournament(id) {
  try {
    console.log(`[tournamentService] Deleting tournament doc ${id}`);
    const docRef = doc(db, "tournaments", id);
    await deleteDoc(docRef);
    console.log(`[tournamentService] Successfully deleted tournament doc ${id}`);
  } catch (err) {
    console.error(`[tournamentService] deleteTournament error for ${id}:`, err.code, err.message, err);
    throw err;
  }
}
