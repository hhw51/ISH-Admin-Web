import { NextApiRequest, NextApiResponse } from "next";
import { collection, getDocs, query, limit, startAfter, orderBy } from "firebase/firestore";
import { db } from "../../utils/firebaseClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { page, rowsPerPage, lastVisible } = req.query;

    const rows = Number(rowsPerPage) || 10;
    let productQuery = query(collection(db, "productss"), orderBy("category"), limit(rows));

    if (lastVisible) {
      const lastDoc = JSON.parse(lastVisible as string);
      productQuery = query(productQuery, startAfter(lastDoc), limit(rows));
    }

    const querySnapshot = await getDocs(productQuery);
    const products = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        category: data.category || "Unknown Category",
        description: Array.isArray(data.description) ? data.description.join(", ") : data.description,
        models: Array.isArray(data.models) ? data.models.join(", ") : data.models,
        points: Array.isArray(data.points) ? data.points.join(", ") : data.points,
        price: Array.isArray(data.price) ? data.price : [data.price],
        productid: Array.isArray(data.productid) ? data.productid : [data.productid],
        quantity: Array.isArray(data.quantity) ? data.quantity : [data.quantity],
        imageUrl: data.imageUrl || "",
      };
    });

    const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

    res.status(200).json({
      products,
      lastVisible: lastDoc ? lastDoc.data() : null,
      total: querySnapshot.size, // Optional: Adjust total if needed
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
}
