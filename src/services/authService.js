import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "../firebase/firebase";
import { createOrUpdateUserProfile } from "./userService";
import { ROLES } from "../utils/constants";
import { validatePlayerName } from "../utils/nameModeration";

export async function signIn(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  return credential.user;
}

export async function signUp(email, password, displayName) {
  // 1. Validate Player Name using moderation rules
  const nameCheck = validatePlayerName(displayName);
  if (!nameCheck.valid) {
    const err = new Error(nameCheck.error);
    err.code = "auth/invalid-player-name";
    throw err;
  }

  // 2. Create Firebase Auth account
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  const user = credential.user;

  // 3. Update Auth display name
  if (displayName?.trim()) {
    await updateProfile(user, { displayName: displayName.trim() });
  }

  // 4. Send Firebase Auth Email Verification
  try {
    await sendEmailVerification(user);
  } catch (emailErr) {
    console.error("[authService] Failed to send verification email:", emailErr);
  }

  // 5. Store initial Player profile in Firestore
  await createOrUpdateUserProfile(user.uid, {
    email: user.email ? user.email.toLowerCase() : email.trim().toLowerCase(),
    displayName: displayName ? displayName.trim() : "Player",
    role: ROLES.PLAYER,
    emailVerified: user.emailVerified || false,
    active: true,
  });

  return user;
}

export async function resendVerificationEmail(currentUser) {
  const targetUser = currentUser || auth.currentUser;
  if (!targetUser) {
    throw new Error("No authenticated user session found.");
  }
  await sendEmailVerification(targetUser);
}

export async function checkAndUpdateEmailVerification(currentUser) {
  const targetUser = currentUser || auth.currentUser;
  if (!targetUser) return false;

  await targetUser.reload();
  const reloadedUser = auth.currentUser;
  const isVerified = Boolean(reloadedUser?.emailVerified);

  if (isVerified) {
    try {
      await createOrUpdateUserProfile(reloadedUser.uid, {
        emailVerified: true,
      });
    } catch (err) {
      console.error("[authService] Failed to update emailVerified in profile:", err);
    }
  }

  return isVerified;
}

export async function signOut() {
  await firebaseSignOut(auth);
}

export function getAuthErrorMessage(error) {
  const code = error?.code || "";

  switch (code) {
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/user-disabled":
      return "This account has been disabled. Contact your administrator.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later.";
    case "auth/email-already-in-use":
      return "This email is already registered. Please log in instead.";
    case "auth/invalid-player-name":
      return error?.message || "Please choose an appropriate player name.";
    default:
      return error?.message || "Something went wrong. Please try again.";
  }
}
