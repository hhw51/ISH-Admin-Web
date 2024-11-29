"use client";

import React, { useState, useEffect } from "react";
import { TextField, Button, Typography, Box, InputAdornment, IconButton } from "@mui/material";
import { auth } from "../../utils/firebaseClient"; // Firebase import
import { signInWithEmailAndPassword } from "firebase/auth"; // Firebase auth import
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify"; // Toast notifications
import { FirebaseError } from "firebase/app"; // Import FirebaseError type
import "react-toastify/dist/ReactToastify.css"; // Default toast styles
import { getFirestore, doc, getDoc, where,getDocs,query,collection } from "firebase/firestore"; // Firestore imports
import { Visibility, VisibilityOff } from "@mui/icons-material"; // Eye icon imports for password toggle

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const db = getFirestore(); // Firestore instance

  useEffect(() => {
    const authToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("authToken="))
      ?.split("=")[1];

    if (authToken) {
      router.push("/"); // Redirect to home if authenticated
    }
  }, [router]);

  const validateEmail = (email: string): boolean => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return re.test(email);
  };

  const handleLogin = async () => {
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
  
    try {
      // Step 1: Check the account type from Firestore before attempting login
      const usersQuery = query(collection(db, "users"), where("email", "==", email));
      const querySnapshot = await getDocs(usersQuery);
  
      if (querySnapshot.empty) {
        toast.error("No user found with this email.");
        return;
      }
  
      // Get the user's account type from Firestore
      const userDoc = querySnapshot.docs[0];
      const accountType = userDoc.data()?.account_type; // Assuming account_type is in the document
  
      // Normalize account type (to lower case) and trim any leading/trailing spaces
      const normalizedAccountType = accountType;
  
      // Step 2: Validate the account type (admin or super dealer)
      if (normalizedAccountType !== "Admin" && normalizedAccountType !== "Super Dealer") {
        toast.error("Invalid Access - You don't have permission to access this page.");
        return; // Exit early if account type is invalid
      }
  
      // Step 3: Proceed with the login since account type is valid
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken(); // Get the ID token
  
      // Step 4: Optionally fetch the account_type again (as a safety measure)
      const userDocRef = doc(db, "users", userCredential.user.uid); // Fetch user document
      const userDocFromAuth = await getDoc(userDocRef);
      
      if (userDocFromAuth.exists()) {
        const userData = userDocFromAuth.data();
        const userAccountType = userData?.account_type;
  
        // Ensure the account type is still valid (in case there are changes)
        const normalizedUserAccountType = userAccountType?.toLowerCase().trim();
        if (normalizedUserAccountType !== "admin" && normalizedUserAccountType !== "super dealer") {
          toast.error("Invalid Access - You don't have permission to access this page.");
          return; // Exit early if account type is invalid after authentication
        }
  
        // Step 5: Set the token and redirect if account type is valid
        document.cookie = `authToken=${token}; path=/; SameSite=Strict; Secure;`;
        toast.success("Login successful!");
        router.push("/"); // Redirect to the home page or dashboard
      } else {
        toast.error("User data not found.");
      }
    } catch (err: unknown) {
      console.log("Login error:", err);
  
      if (err instanceof FirebaseError) {
        // Firebase-specific error handling
        console.log(`FirebaseError Code: ${err.code}, Message: ${err.message}`);
  
        switch (err.code) {
          case "auth/invalid-email":
            toast.error("Invalid email format!");
            break;
          case "auth/user-not-found":
            toast.error("No user found with this email!");
            break;
          case "auth/wrong-password":
            toast.error("Incorrect password!");
            break;
          default:
            toast.error(`Login failed: ${err.message}`);
            break;
        }
      } else {
        // General fallback error message
        toast.error("An unexpected error occurred.");
      }
    }
  };
  
  

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleLogin();
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword); // Toggle password visibility
  };

  const handleMouseDownPassword = (event: React.MouseEvent) => {
    event.preventDefault(); // Prevent default behavior when clicking on the eye icon
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      bgcolor="white"
    >
      <Typography variant="h4" gutterBottom style={{ color: "black" }}>
        Admin Login
      </Typography>
      <Box width="300px" mb={2}>
        <TextField
          fullWidth
          label="Email"
          variant="outlined"
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyPress} // Listen for Enter key
        />
        <TextField
          fullWidth
          label="Password"
          variant="outlined"
          type={showPassword ? "text" : "password"} // Toggle between 'text' and 'password'
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyPress} // Listen for Enter key
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />} {/* Eye icon */}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <Button variant="contained" color="primary" onClick={handleLogin}>
        Login
      </Button>

      {/* Display toast container */}
      <ToastContainer />
    </Box>
  );
};

export default LoginPage;
