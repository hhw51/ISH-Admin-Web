"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  // TextField,
  Button,
} from "@mui/material";
import { toast } from "react-toastify";
import React, { useEffect, useState } from "react";
import { collection, getDocs, getDoc, addDoc,
  // QueryDocumentSnapshot,
   doc, 
  setDoc } from "firebase/firestore";
import { getStorage,uploadBytes, ref, getDownloadURL } from "firebase/storage";
import { CircularProgress,Typography } from "@mui/material";
import { db,auth  } from "../../../../utils/firebaseClient";
import ProductsTable, { Product } from "./ProductsTable";
import ProductModal from "./ProductModal";
import FilterBar from "./filterBar";

const ProductsPage: React.FC = () => {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteModelDetails, setDeleteModelDetails] = useState<{ docId: string; modelToDelete: string } | null>(null);
  
  const openDeleteDialog = (docId: string, modelToDelete: string) => {
    setDeleteModelDetails({ docId, modelToDelete });
    setDeleteDialogOpen(true);
  };

const closeDeleteDialog = () => {
  setDeleteDialogOpen(false);
  setDeleteModelDetails(null);
};
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "popular_products"));
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
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/login"); // Redirect to login if not authenticated
      }
    });

    return () => unsubscribe();
  }, [router]);
  useEffect(() => {
    fetchProducts();
  }, []);
  const handleAddClick = () => {
    setCurrentProduct(null); // Clear product for add mode
    setModalOpen(true);
  };

  // Open the modal for editing a product
  const handleEditClick = (product: Product) => {
    setCurrentProduct(product); // Set product for edit mode
    setModalOpen(true);
  };
  const confirmDelete = async () => {
    if (!deleteModelDetails) return;
  
    const { docId, modelToDelete } = deleteModelDetails;
  
    try {
      const productRef = doc(db, "popular_products", docId);
      const productSnapshot = await getDoc(productRef);
  
      if (productSnapshot.exists()) {
        const productData = productSnapshot.data() as Product;
  
        // Find the index of the model to delete
        const modelIndex = productData.models.indexOf(modelToDelete);
  
        if (modelIndex === -1) {
          toast.error("Model not found in the document!");
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
  
        // Show success toaPopupopst
        toast.success(`Model "${modelToDelete}" deleted successfully!`);
  
        // Refresh the list
        fetchProducts();
      } else {
        toast.error("Document not found!");
      }
    } catch (error) {
      console.error("Error deleting model:", error);
      toast.error("An error occurred while deleting the model. Please try again.");
    } finally {
      closeDeleteDialog(); // Close dialog after operation
    }
  }
  const handleEdit = (product: Product) => {
    setCurrentProduct(product); // Set the current product to edit
    setModalOpen(true); // Open the modal
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
  
      // Fetch the document with the highest `productid`
      const productRef = collection(db, "popular_products");
      const querySnapshot = await getDocs(productRef);
      let maxProductId = 0;
  
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Product;
        const currentProductId = Math.max(...(data.productid || [0])); // Safely handle missing `productid`
        if (currentProductId > maxProductId) {
          maxProductId = currentProductId;
        }
      });
  
      const newProductId = maxProductId + 1; // Auto-incremented ID
  
      // Create a new product object with the new productid
      const newProduct = {
        category: product.category,
        description: product.description || [],
        models: product.models || [],
        points: product.points || [],
        price: product.price || [],
        productid: [newProductId], // Set the auto-incremented ID
        quantity: product.quantity || [],
        imageUrl,
      };
  
      // Add new product to Firestore
      await addDoc(productRef, newProduct);
  
      // Refresh product list
      fetchProducts();
  
      toast.success("Product added successfully!");
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product. Please try again.");
    }
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
<Typography sx={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'black' }}>
Popular Products
</Typography>   <FilterBar
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
      />
    <Button
      variant="contained"
      color="primary"
      onClick={handleAddClick}
      style={{ marginBottom: "1rem" }}
    >
      Add Product
    </Button>
        <ProductModal
      open={modalOpen} // Control the modal visibility
      onClose={() => setModalOpen(false)} // Close the modal
      onSubmit={handleAddProduct} // Submit the data
      product={currentProduct} // Pass the product being edited (or null for adding)
    ></ProductModal>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
            <CircularProgress />
          </div>
        ) : (
          <ProductsTable
            products={filteredProducts}  
            onEdit={handleEditClick}
            onDelete={(docId, modelToDelete) => openDeleteDialog(docId, modelToDelete)}
          />
        )}
          


  
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Delete Model</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete model: {deleteModelDetails?.modelToDelete}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
  
};

export default ProductsPage;
