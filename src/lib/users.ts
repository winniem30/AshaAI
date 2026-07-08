import { getDb } from "./db";
import type { VerifiedUser } from "./auth";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  createdAt: Date;
  lastLogin: Date;
}

export async function saveUserProfile(user: VerifiedUser): Promise<void> {
  try {
    const db = await getDb();
    const users = db.collection<UserProfile>("users");
    
    await users.updateOne(
      { uid: user.uid },
      {
        $set: {
          email: user.email,
          displayName: user.displayName,
          lastLogin: new Date(),
        },
        $setOnInsert: {
          uid: user.uid,
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );
  } catch (error) {
    console.error("Failed to save user profile:", error);
    throw error;
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const db = await getDb();
    const users = db.collection<UserProfile>("users");
    return await users.findOne({ uid });
  } catch (error) {
    console.error("Failed to get user profile:", error);
    return null;
  }
}
