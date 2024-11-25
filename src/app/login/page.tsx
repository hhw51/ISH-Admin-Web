"use client";

import React, { useState, useEffect } from "react";
import { TextField, Button, Typography, Box } from "@mui/material";
import { auth } from "../../utils/firebaseClient"; // Import Firebase
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const authToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("authToken="))
      ?.split("=")[1];

    if (authToken) {
      router.push("/"); // Redirect to home if authenticated
    }
  }, [router]);

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();

      // Set token in cookies
      document.cookie = `authToken=${token}; path=/; SameSite=Strict; Secure;`;

      router.push("/"); // Redirect to home after successful login
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid email or password");
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleLogin();
    }
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
          type="password"
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyPress} // Listen for Enter key
        />
      </Box>
      {error && <Typography color="error">{error}</Typography>}
      <Button variant="contained" color="primary" onClick={handleLogin}>
        Login
      </Button>
    </Box>
  );
};

export default LoginPage;
