import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  limit,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { DEFAULT_SPORTS } from "../utils/constants";

const sportsCollection = collection(db, "sports");
const tournamentsCollection = collection(db, "tournaments");

function normalizeDate(value) {
  if (!value) return null;
  return value.toDate ? value.toDate() : new Date(value);
}

function normalizeSport(snapshot) {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    ...data,
    createdAt: normalizeDate(data.createdAt),
    updatedAt: normalizeDate(data.updatedAt),
  };
}

export async function getSports(options = {}) {
  try {
    const sportQuery = query(sportsCollection, orderBy("name", "asc"));
    const snapshot = await getDocs(sportQuery);

    if (snapshot.empty) return [];
    const sports = snapshot.docs.map(normalizeSport);
    return options.onlyActive ? sports.filter((sport) => sport.active) : sports;
  } catch (error) {
    console.error("getSports query with orderBy failed, attempting fallback query:", error);
    try {
      const snapshot = await getDocs(sportsCollection);
      if (snapshot.empty) return [];
      const sports = snapshot.docs.map(normalizeSport);
      return options.onlyActive ? sports.filter((sport) => sport.active) : sports;
    } catch (fallbackErr) {
      console.error("getSports fallback query failed:", fallbackErr);
      return [];
    }
  }
}


export async function getSport(id) {
  const docRef = doc(db, "sports", id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) {
    return null;
  }
  return normalizeSport(snapshot);
}

export async function seedSports() {
  const promises = DEFAULT_SPORTS.map(async (sport) => {
    const sportRef = doc(db, "sports", sport.id);
    const snapshot = await getDoc(sportRef);
    if (!snapshot.exists()) {
      await setDoc(sportRef, {
        name: sport.name,
        type: sport.type,
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  });
  await Promise.all(promises);
}

export async function createSport(sport) {
  const docRef = doc(sportsCollection);
  await setDoc(docRef, {
    name: sport.name,
    type: sport.type || "team",
    active: typeof sport.active === "boolean" ? sport.active : true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateSport(id, sport) {
  const docRef = doc(db, "sports", id);
  await updateDoc(docRef, {
    name: sport.name,
    type: sport.type || "team",
    active: typeof sport.active === "boolean" ? sport.active : true,
    updatedAt: serverTimestamp(),
  });
}

export async function toggleSportStatus(id, active) {
  const docRef = doc(db, "sports", id);
  await updateDoc(docRef, {
    active,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteSport(id) {
  const docRef = doc(db, "sports", id);
  await deleteDoc(docRef);
}

export async function isSportSafeToDelete(id, sportName) {
  const queryById = query(tournamentsCollection, where("sportId", "==", id), limit(1));
  const snapshotById = await getDocs(queryById);
  if (!snapshotById.empty) {
    return false;
  }

  if (sportName) {
    const queryByName = query(tournamentsCollection, where("sport", "==", sportName), limit(1));
    const snapshotByName = await getDocs(queryByName);
    if (!snapshotByName.empty) {
      return false;
    }
  }

  return true;
}
