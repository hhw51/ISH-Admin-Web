"use server";
import { adminAuth } from "../../utils/firebaseAdmin";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("🎈 DELETE /api/deleteUser called");

  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const user = await adminAuth.getUserByEmail(email);

    // Delete the user from Firebase Authentication
    await adminAuth.deleteUser(user.uid);

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ error: "Failed to delete user" });
  }
}
