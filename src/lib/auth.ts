import admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";

let app: admin.app.App | null = null;

export interface VerifiedUser {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  displayName: string | null;
}

export function getFirebaseAdmin() {
  if (app) return app;

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.warn("Firebase Admin credentials not configured. Authentication will be skipped.");
    return null;
  }

  app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, "\n"),
    }),
  });

  return app;
}

export async function verifyIdToken(token: string): Promise<VerifiedUser | null> {
  const firebaseApp = getFirebaseAdmin();
  if (!firebaseApp) return null;

  try {
    const auth = getAuth(firebaseApp);
    const decoded = await auth.verifyIdToken(token);
    return {
      uid: decoded.uid,
      email: decoded.email || null,
      emailVerified: decoded.email_verified || false,
      displayName: decoded.name || null,
    };
  } catch (error) {
    console.error("Failed to verify ID token:", error);
    return null;
  }
}

export function getBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;
  return parts[1];
}
