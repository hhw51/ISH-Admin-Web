import * as admin from "firebase-admin";

const adminConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(adminConfig),
  });
}
// * @param {string} token - The Firebase authentication token
// * @returns {Promise<admin.auth.DecodedIdToken>} - Returns decoded token if valid
// */
export const verifyIdToken = async (token: string) => {
 try {
   return await admin.auth().verifyIdToken(token);
 } catch (error) {
   console.error("Error verifying Firebase ID Token:", error);
   throw new Error("Unauthorized");
 }
};
export const adminAuth = admin.auth();
export const adminApp = admin.app();
