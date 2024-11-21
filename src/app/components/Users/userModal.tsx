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

export interface User {
  id: string; // Firestore document ID
  account_type: string;
  address: string;
  cnic: string;
  email: string;
  full_name: string;
  phone: string;
  points: number;
  cart?: CartItem[]; // Optional cart field
}

export interface CartItem {
  category: string;
  descriptions: string[];
  imageUrl: string;
  models: string[];
  points: number;
  prices: number[];
  productid: string;
  quantity: number;
}


export interface UserModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (user: User) => Promise<void>;
  user?: User | null; // Allow null or undefined values
}

const UserModal: React.FC<UserModalProps> = ({ open, onClose, onSubmit, user }) => {
  const { register, handleSubmit, reset } = useForm<User>({
    defaultValues: user || {
      account_type: "",
      address: "",
      cnic: "",
      email: "",
      full_name: "",
      phone: "",
      points: 0,
    },
  });

  useEffect(() => {
    if (user) {
      reset(user);
    } else {
      reset({
        account_type: "",
        address: "",
        cnic: "",
        email: "",
        full_name: "",
        phone: "",
        points: 0,
      });
    }
  }, [user, reset]);

  const handleFormSubmit = (data: User) => {
    onSubmit(data);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{user ? "Edit User" : "Add User"}</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <TextField
            fullWidth
            label="Full Name"
            margin="normal"
            {...register("full_name", { required: "Full Name is required" })}
          />
          <TextField
            fullWidth
            label="Email"
            margin="normal"
            {...register("email", { required: "Email is required" })}
          />
          <TextField
            fullWidth
            label="Phone"
            margin="normal"
            {...register("phone", { required: "Phone number is required" })}
          />
          <TextField
            fullWidth
            label="Address"
            margin="normal"
            {...register("address", { required: "Address is required" })}
          />
          <TextField
            fullWidth
            label="CNIC"
            margin="normal"
            {...register("cnic", { required: "CNIC is required" })}
          />
          <TextField
            fullWidth
            label="Points"
            margin="normal"
            type="number"
            {...register("points", { required: "Points are required" })}
          />
          <TextField
            fullWidth
            label="Account Type"
            margin="normal"
            {...register("account_type", { required: "Account Type is required" })}
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

export default UserModal;
