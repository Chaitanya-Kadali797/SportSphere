import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase/firebase";
import { createOrUpdateUserProfile } from "./userService";

export async function signIn(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function signUp(email, password, displayName) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(credential.user, { displayName });
  }

  await createOrUpdateUserProfile(credential.user.uid, {
    email: credential.user.email,
    displayName: credential.user.displayName || displayName,
    role: "player",
  });

  return credential.user;
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
    default:
      return error?.message || "Something went wrong. Please try again.";
  }
}
