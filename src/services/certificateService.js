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
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  if (typeof value.toDate === "function") {
    try {
      const d = value.toDate();
      return isNaN(d.getTime()) ? null : d;
    } catch (e) {
      // fallback
    }
  }
  if (typeof value.seconds === "number") {
    const d = new Date(value.seconds * 1000);
    return isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function normalizeCertificate(snapshot) {
  const data = snapshot.data() || {};
  return {
    id: snapshot.id,
    ...data,
    certificateId: data.certificateId || snapshot.id,
    userId: data.userId || data.participantUserId || "",
    participantUserId: data.participantUserId || data.userId || "",
    participantName: data.participantName || "Participant",
    participantEmail: data.participantEmail || "",
    tournamentId: data.tournamentId || "",
    tournamentName: data.tournamentName || "Tournament",
    sport: data.sport || data.sportName || "General Sport",
    sportName: data.sportName || data.sport || "General Sport",
    achievement: data.achievement || "Participant",
    tournamentDate: normalizeDate(data.tournamentDate || data.issueDate),
    issuedAt: normalizeDate(data.issuedAt || data.issueDate || data.createdAt),
    issueDate: normalizeDate(data.issueDate || data.issuedAt || data.createdAt),
    issuedBy: data.issuedBy || "SportSphere Administrator",
    createdAt: normalizeDate(data.createdAt),
  };
}

// Generate unique certificate ID e.g. SP-2026-X892A
export function generateUniqueCertId() {
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  const year = new Date().getFullYear();
  return `SP-${year}-${randomStr}`;
}

// Check if a certificate already exists for a participant in a specific tournament to avoid duplicates
export async function checkExistingCertificate(tournamentId, userId = "", participantEmail = "", participantName = "") {
  if (!tournamentId) return null;

  try {
    const snapshot = await getDocs(certificatesCollection);
    if (snapshot.empty) return null;

    const allCerts = snapshot.docs.map(normalizeCertificate);
    const cleanEmail = participantEmail ? participantEmail.trim().toLowerCase() : "";
    const cleanName = participantName ? participantName.trim().toLowerCase() : "";

    const found = allCerts.find((cert) => {
      if (cert.tournamentId !== tournamentId) return false;
      if (userId && (cert.userId === userId || cert.participantUserId === userId)) return true;
      if (cleanEmail && cert.participantEmail?.toLowerCase() === cleanEmail) return true;
      if (cleanName && cert.participantName?.toLowerCase() === cleanName) return true;
      return false;
    });

    return found || null;
  } catch (err) {
    console.error("checkExistingCertificate error:", err);
    return null;
  }
}

export async function createCertificate(data, allowDuplicate = false) {
  const certId = (data.certificateId || generateUniqueCertId()).toUpperCase().trim();
  const docRef = doc(db, "certificates", certId);
  const existingSnap = await getDoc(docRef);

  if (existingSnap.exists()) {
    throw new Error(`Certificate ID "${certId}" already exists. Please regenerate ID.`);
  }

  // Duplicate check unless explicitly acknowledged
  if (!allowDuplicate && data.tournamentId) {
    const existingCert = await checkExistingCertificate(
      data.tournamentId,
      data.userId || data.participantUserId,
      data.participantEmail,
      data.participantName
    );

    if (existingCert) {
      const err = new Error(
        `A certificate (${existingCert.certificateId}) has already been issued to ${existingCert.participantName} for this tournament.`
      );
      err.existingCert = existingCert;
      throw err;
    }
  }

  const userId = data.userId || data.participantUserId || "";

  const certificatePayload = {
    certificateId: certId,
    userId: userId,
    participantUserId: userId,
    participantName: data.participantName.trim(),
    participantEmail: data.participantEmail ? data.participantEmail.trim().toLowerCase() : "",
    tournamentId: data.tournamentId || "",
    tournamentName: data.tournamentName.trim(),
    sport: data.sport || data.sportName || "General Sport",
    sportName: data.sportName || data.sport || "General Sport",
    achievement: data.achievement.trim(), // Winner, Runner-up, 3rd Place, Participant
    tournamentDate: data.tournamentDate ? new Date(data.tournamentDate) : (data.issueDate ? new Date(data.issueDate) : new Date()),
    issuedAt: data.issuedAt ? new Date(data.issuedAt) : (data.issueDate ? new Date(data.issueDate) : new Date()),
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
    const snapshot = await getDocs(certificatesCollection);
    if (snapshot.empty) return [];
    const certs = snapshot.docs.map(normalizeCertificate);
    return certs.sort((a, b) => {
      const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tB - tA;
    });
  } catch (err) {
    console.error("getCertificates error:", err);
    return [];
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
      if (userId && (cert.userId === userId || cert.participantUserId === userId)) return true;
      if (cleanEmail && cert.participantEmail?.toLowerCase() === cleanEmail) return true;
      if (cleanName && cert.participantName?.toLowerCase() === cleanName) return true;
      return false;
    });
  } catch (err) {
    console.error("getUserCertificates error:", err);
    return [];
  }
}
