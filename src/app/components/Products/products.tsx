"use client"

import React, { useEffect, useState } from "react";
import { collection, getDocs, getDoc, addDoc, deleteDoc, doc, setDoc } from "firebase/firestore";
import { getStorage,uploadBytes, ref, getDownloadURL } from "firebase/storage";
import { CircularProgress } from "@mui/material";
import { db } from "../../../utils/firebaseClient";
import ProductsTable, { Product } from "./ProductsTable";
import ProductModal from "./ProductModal";
import FilterBar from "./filterBar";

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState<string>("");
  const [category, setCategory] = useState<string>("");

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "productss"));
      const productsData = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const product = doc.data();
          if (!Array.isArray(product.models)) {
            console.error(`Invalid data in document ${doc.id}:`, product);
            return [];
          }
          const imageUrlPromises = product.imageUrl
            ? getDownloadURL(ref(getStorage(), product.imageUrl))
            : Promise.resolve("");
          const imageUrl = await imageUrlPromises;

          return product.models.map((models: string, index: number) => ({
            id: `${doc.id}-${index}`,
            category: product.category || "Unknown Category",
            description: product.description?.[index] || "No Description",
            models,
            points: product.points?.[index] || 0,
            price: product.price?.[index] || 0,
            productid: product.productid?.[index] || 0,
            quantity: product.quantity?.[index] || 0,
            imageUrl,
          }));
        })
      );

      setProducts(productsData.flat());
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);
  
  const handleDelete = async (docId: string, modelToDelete: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete model: ${modelToDelete}?`);
    if (!confirmDelete) return;
  
    try {
      const productRef = doc(db, "productss", docId);
      const productSnapshot = await getDoc(productRef);
  
      if (productSnapshot.exists()) {
        const productData = productSnapshot.data() as Product;
  
        // Find the index of the model to delete
        const modelIndex = productData.models.indexOf(modelToDelete);
  
        if (modelIndex === -1) {
          console.error("Model not found in the document");
          return;
        }
  
        // Remove the corresponding index from all arrays
        const updatedData = {
          models: productData.models.filter((_: string, i: number) => i !== modelIndex),
          description: productData.description.filter((_: string, i: number) => i !== modelIndex),
          points: productData.points.filter((_: number, i: number) => i !== modelIndex),
          price: productData.price.filter((_: number, i: number) => i !== modelIndex),
          productid: productData.productid.filter((_: number, i: number) => i !== modelIndex),
          quantity: productData.quantity.filter((_: number, i: number) => i !== modelIndex),
        };
  
        // Update the Firestore document
        await setDoc(productRef, updatedData, { merge: true });
  
        // Refresh the list
        fetchProducts();
      } else {
        console.error("Document not found");
      }
    } catch (error) {
      console.error("Error deleting model:", error);
    }
  };
  
  
  
  const handleAddProduct = async (product: Product, file: File | null) => {
    try {
      let imageUrl = product.imageUrl;
  
      // Upload image if provided
      if (file) {
        const storageRef = ref(getStorage(), `products/${file.name}`);
        await uploadBytes(storageRef, file);
        imageUrl = await getDownloadURL(storageRef);
      }
  
      const productRef = collection(db, "productss");
      const querySnapshot = await getDocs(productRef);
  
      let existingDoc: QueryDocumentSnapshot | null = null;
  
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Product;
        if (data.category === product.category) {
          existingDoc = doc;
        }
      });
  
      if (existingDoc) {
        // If the document exists, update it by concatenating arrays
        const existingData = existingDoc.data() as Product;
  
        await setDoc(existingDoc.ref, {
          ...existingData,
          models: [...existingData.models, ...(product.models || [])],
          description: [...existingData.description, ...(product.description || [])],
          points: [...existingData.points, ...(product.points || [])],
          price: [...existingData.price, ...(product.price || [])],
          productid: [...existingData.productid, ...(product.productid || [])],
          quantity: [...existingData.quantity, ...(product.quantity || [])],
          imageUrl: imageUrl || existingData.imageUrl, // Keep existing image if no new image is uploaded
        });
      } else {
        // If the document doesn't exist, create a new one with arrays
        await addDoc(productRef, {
          category: product.category,
          description: product.description || [],
          models: product.models || [],
          points: product.points || [],
          price: product.price || [],
          productid: product.productid || [],
          quantity: product.quantity || [],
          imageUrl,
        });
      }
  
      fetchProducts(); // Refresh the list
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };
  const handleEdit = (product: Product) => {
    setCurrentProduct(product);
    setModalOpen(true); // Open the modal with current values
  };
  

  
  const filteredProducts = products.filter(
    (product) =>
      product.category.toLowerCase().includes(search.toLowerCase()) ||
      product.description.toLowerCase().includes(search.toLowerCase()) ||
      product.models.toLowerCase().includes(search.toLowerCase()) ||
      product.productid.toString().includes(search)
  );
  
  

  return (
    <div style={{ backgroundColor: "white", minHeight: "100vh", padding: "20px" }}>
      <h1>Products</h1>
      <FilterBar
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
      />
      <button onClick={() => setModalOpen(true)}>Add Product</button>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
          <CircularProgress />
        </div>
      ) : (
<ProductsTable
  products={filteredProducts}
  onEdit={(product) => setCurrentProduct(product)}
  onDelete={(docId, modelToDelete) => handleDelete(docId, modelToDelete)} // Match the expected arguments
/>



      )}

    <ProductModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={(data, file) => handleAddProduct(data, file)} // Reuse handleAddProduct for saving
        product={currentProduct} // Pass the current product
      />
    </div>
  );
};

export default ProductsPage;
