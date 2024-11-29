import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  SelectChangeEvent,
  IconButton,
} from "@mui/material";
import { useForm } from "react-hook-form";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { toast } from "react-toastify";

export interface User {
  password: string;  // Add password field
  id: string;
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
  const { register, handleSubmit, reset, setValue, watch, formState: { errors }, trigger } = useForm<User>({
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

  const accountType = watch("account_type");
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

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
  const handlePasswordVisibilityToggle = () => {
    setShowPassword(!showPassword); // Toggle password visibility
  };

  const validatePassword = (password: string) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{6,}$/;
    return passwordRegex.test(password);
  };
  
  const handleFormSubmit = async (data: User) => {
    if (data.password && !validatePassword(data.password)) {
      toast.error("Password is invalid.");
      return;
    }
    try {
      console.log("Submitting user data:", data);
      await onSubmit(data); // Submit data
      toast.success("User submitted successfully!");
      onClose(); // Close modal after submission
    } catch (error) {
      console.log("Error submitting user:", error);
      toast.error("Failed to submit user. Please try again.");
    }
  };
  
  
<TextField
  fullWidth
  label="Password"
  type={showPassword ? "text" : "password"} // Show password if `showPassword` is true
  margin="normal"
  {...register("password", { 
    required: "Password is required", 
    validate: value => validatePassword(value) || "Password must be at least 6 characters, with 1 uppercase letter, 1 lowercase letter, and 1 special character." 
  })}
  error={!!errors.password}
  helperText={errors.password?.message}
  InputProps={{
    endAdornment: (
      <IconButton onClick={handlePasswordVisibilityToggle} edge="end">
        {showPassword ? <VisibilityOff /> : <Visibility />} {/* Toggle icon based on password visibility */}
      </IconButton>
    ),
  }}
/>

  const handleAccountTypeChange = (event: SelectChangeEvent<string>) => {
    setValue("account_type", event.target.value);
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
            <FormControl fullWidth margin="normal">
            <InputLabel id="account-type-label">Account Type</InputLabel>
            <Select
              labelId="account-type-label"
              value={accountType}
              onChange={handleAccountTypeChange}
            >
              <MenuItem value="Super Dealer">Super Dealer</MenuItem>
              <MenuItem value="Mechanics">Mechanics</MenuItem>
              <MenuItem value="Dealer">Distributor</MenuItem>
              <MenuItem value="Retailer">Retailer</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem> {/* Fixed redundant option */}
            </Select>
          </FormControl>
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
          {!user && (
            <>
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? "text" : "password"} // Show password if `showPassword` is true
                margin="normal"
                {...register("password", { 
                  required: "Password is required", 
                  validate: value => validatePassword(value) || "Password must be at least 6 characters, with 1 uppercase letter, 1 lowercase letter, and 1 special character." 
                })}
                error={!!errors.password}
                helperText={errors.password?.message}
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={handlePasswordVisibilityToggle} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />} {/* Toggle icon based on password visibility */}
                    </IconButton>
                  ),
                }}
              />
            </>
          )}



          <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="submit" color="primary">
              Submit
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserModal;
