import { NextApiRequest, NextApiResponse } from "next";
import { collection, getDocs } from "firebase/firestore";
// import { db } from "../../../utils/firebaseClient";
import { db } from "../../utils/firebaseClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const querySnapshot = await getDocs(collection(db, "history"));
    const orders = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
