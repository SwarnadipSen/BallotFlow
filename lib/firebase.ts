/**
 * Firebase client-side configuration.
 * These are public credentials — safe to expose in the browser.
 */

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import {
  getFirestore,
  type Firestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { logger } from "@/lib/logger";

// ─── Firebase Config ──────────────────────────────────────────────────────────

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// ─── Singleton Initialization ─────────────────────────────────────────────────

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

/**
 * Returns Firebase app instance (singleton pattern).
 * Prevents re-initialization in Next.js hot reloads.
 */
export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}

export function getFirebaseDb(): Firestore {
  if (!db) {
    db = getFirestore(getFirebaseApp());
  }
  return db;
}

export const googleProvider = new GoogleAuthProvider();

// ─── Chat Session Helpers ─────────────────────────────────────────────────────

export interface StoredMessage {
  role: "user" | "model";
  text: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  userId: string | null;
  createdAt: Date;
  messages: StoredMessage[];
}

/**
 * Creates a new chat session in Firestore.
 * Stores anonymously if user is not signed in.
 */
export async function createChatSession(
  userId: string | null
): Promise<string> {
  try {
    const firestore = getFirebaseDb();
    const docRef = await addDoc(collection(firestore, "sessions"), {
      userId: userId ?? "anonymous",
      createdAt: serverTimestamp(),
      messages: [],
    });
    return docRef.id;
  } catch (error) {
    logger.error("Failed to create chat session", {
      error: error instanceof Error ? error.message : String(error),
    });
    // Return a local fallback ID — don't break the app
    return `local_${Date.now()}`;
  }
}

/**
 * Appends a message to an existing chat session.
 */
export async function appendMessage(
  sessionId: string,
  message: { role: "user" | "model"; text: string }
): Promise<void> {
  if (sessionId.startsWith("local_")) return; // Skip for local fallback sessions

  try {
    const firestore = getFirebaseDb();
    const sessionRef = doc(firestore, "sessions", sessionId);
    await updateDoc(sessionRef, {
      messages: arrayUnion({
        ...message,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    logger.error("Failed to append message", {
      sessionId,
      error: error instanceof Error ? error.message : String(error),
    });
    // Non-fatal — chat continues even if storage fails
  }
}

/**
 * Fetches recent chat sessions for a user.
 */
export async function getUserSessions(
  userId: string
): Promise<ChatSession[]> {
  try {
    const firestore = getFirebaseDb();
    const q = query(
      collection(firestore, "sessions"),
      orderBy("createdAt", "desc"),
      limit(10)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs
      .filter((d) => d.data().userId === userId)
      .map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ChatSession, "id">),
      }));
  } catch (error) {
    logger.error("Failed to fetch sessions", {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}
