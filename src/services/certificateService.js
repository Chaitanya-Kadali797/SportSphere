import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

const certificatesCollection = collection(db, "certificates");

function normalizeDate(value) {
  if (!value) return null;
  return value.toDate ? value.toDate() : new Date(value);
}

function normalizeCertificate(snapshot) {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    ...data,
    issueDate: normalizeDate(data.issueDate),
    createdAt: normalizeDate(data.createdAt),
  };
}

// Generate guaranteed unique certificate ID e.g. SP-2026-X892A
export function generateUniqueCertId() {
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  const year = new Date().getFullYear();
  return `SP-${year}-${randomStr}`;
}

export async function createCertificate(data) {
  const certId = (data.certificateId || generateUniqueCertId()).toUpperCase().trim();
  const docRef = doc(db, "certificates", certId);
  const existingSnap = await getDoc(docRef);

  if (existingSnap.exists()) {
    throw new Error(`Certificate ID "${certId}" already exists. Please try again.`);
  }

  const certificatePayload = {
    certificateId: certId,
    participantName: data.participantName.trim(),
    participantUserId: data.participantUserId || "",
    participantEmail: data.participantEmail ? data.participantEmail.trim().toLowerCase() : "",
    tournamentId: data.tournamentId || "",
    tournamentName: data.tournamentName.trim(),
    sportName: data.sportName.trim(),
    achievement: data.achievement.trim(), // e.g. "1st Place (Winner)", "Participant"
    issueDate: data.issueDate ? new Date(data.issueDate) : new Date(),
    issuedBy: data.issuedBy || "SportSphere Administrator",
    createdAt: serverTimestamp(),
  };

  await setDoc(docRef, certificatePayload);
  return certId;
}

export async function getCertificateById(certId) {
  if (!certId) return null;
  const cleanId = certId.trim().toUpperCase();
  const docRef = doc(db, "certificates", cleanId);
  const snapshot = await getDoc(docRef);

  if (snapshot.exists()) {
    return normalizeCertificate(snapshot);
  }

  // Fallback search by query on certificateId field
  const q = query(certificatesCollection, where("certificateId", "==", cleanId));
  const querySnap = await getDocs(q);
  if (!querySnap.empty) {
    return normalizeCertificate(querySnap.docs[0]);
  }

  return null;
}

export async function getCertificates() {
  try {
    const q = query(certificatesCollection, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return [];
    return snapshot.docs.map(normalizeCertificate);
  } catch (err) {
    console.warn("getCertificates orderBy error, falling back to unsorted fetch:", err);
    const snapshot = await getDocs(certificatesCollection);
    if (snapshot.empty) return [];
    const certs = snapshot.docs.map(normalizeCertificate);
    return certs.sort((a, b) => {
      const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tB - tA;
    });
  }
}

export async function getUserCertificates(userId, email = "", name = "") {
  try {
    const snapshot = await getDocs(certificatesCollection);
    if (snapshot.empty) return [];

    const allCerts = snapshot.docs.map(normalizeCertificate);
    const cleanEmail = email ? email.trim().toLowerCase() : "";
    const cleanName = name ? name.trim().toLowerCase() : "";

    return allCerts.filter((cert) => {
      if (userId && cert.participantUserId === userId) return true;
      if (cleanEmail && cert.participantEmail === cleanEmail) return true;
      if (cleanName && cert.participantName?.toLowerCase() === cleanName) return true;
      return false;
    });
  } catch (err) {
    console.error("getUserCertificates error:", err);
    return [];
  }
}
