"use client";
import React, { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import { useForm } from "react-hook-form";

export interface Product {
  category: string;
  description: string[];
  models: string[];
  points: number[];
  price: number[];
  productid: number[];
  quantity: number[];
  imageUrl: string;
}

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (product: Product, file: File | null) => Promise<void>;
  product?: Product | null;
}

const ProductModal: React.FC<ProductModalProps> = ({
  open,
  onClose,
  onSubmit,
  product, // Passed as null for add mode
}) => {
  const { register, handleSubmit, reset } = useForm<Product>({
    defaultValues: product || {
      category: "", // Default for add mode
      description: [""],
      models: [""],
      points: [0],
      price: [0],
      productid: [0],
      quantity: [0],
      imageUrl: "",
    },
  });

  const [file, setFile] = React.useState<File | null>(null);

  useEffect(() => {
    reset(product || {
      category: "", // Reset to defaults when adding
      description: [""],
      models: [""],
      points: [0],
      price: [0],
      productid: [0],
      quantity: [0],
      imageUrl: "",
    });
  }, [product, reset]);

  const handleFormSubmit = (data: Product) => {
    onSubmit(data, file);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{product ? "Edit Product" : "Add Product"}</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <TextField
            fullWidth
            label="Category"
            margin="normal"
            {...register("category", { required: "Category is required" })}
          />
          <TextField
            fullWidth
            label="Description"
            margin="normal"
            {...register("description.0", { required: "Description is required" })}
          />
          <TextField
            fullWidth
            label="Model"
            margin="normal"
            {...register("models.0", { required: "Model is required" })}
          />
          <TextField
            fullWidth
            label="Points"
            margin="normal"
            type="number"
            {...register("points.0", { required: "Points are required" })}
          />
          <TextField
            fullWidth
            label="Price"
            margin="normal"
            type="number"
            {...register("price.0", { required: "Price is required" })}
          />
          <TextField
            fullWidth
            label="Product ID"
            margin="normal"
            type="number"
            {...register("productid.0", { required: "Product ID is required" })}
          />
          <TextField
            fullWidth
            label="Quantity"
            margin="normal"
            type="number"
            {...register("quantity.0", { required: "Quantity is required" })}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            style={{ marginTop: "16px" }}
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" color="primary" onClick={handleSubmit(handleFormSubmit)}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductModal;
