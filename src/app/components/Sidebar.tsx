"use client";

import React, { useState } from "react";
import { Box, List, ListItem, ListItemText, Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from "@mui/material";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "../../utils/firebaseClient"; // Adjust the path

const Sidebar: React.FC = () => {
    const pathname = usePathname();
    const router = useRouter();

    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

    const handleLogout = async () => {
        try {
          await auth.signOut();
          document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;"; // Clear cookie
          router.push("/login"); // Redirect to login
        } catch (error) {
          console.error("Error during logout:", error);
        }
      };
      
    
    

    const handleOpenLogoutDialog = () => {
        setLogoutDialogOpen(true); // Open the logout confirmation dialog
    };

    const handleCloseLogoutDialog = () => {
        setLogoutDialogOpen(false); // Close the dialog without logging out
    };

    return (
        <Box
            sx={{
                width: 250,
                bgcolor: "#2c3e50",
                color: "white",
                height: "100vh",
                position: "sticky",
                top: 0,
                padding: 2,
                display: "flex",
                flexDirection: "column",
            }}
        >
            <Typography variant="h6" sx={{ marginBottom: 2 }}>
                Dashboard
            </Typography>
            <List>
                <ListItem
                    component={Link}
                    href="/"
                    sx={{
                        color: pathname === "/" ? "lightblue" : "white",
                        marginBottom: 1,
                    }}
                >
                    <ListItemText primary="Home" />
                </ListItem>
                <ListItem
                    component={Link}
                    href="/products"
                    sx={{
                        color: pathname === "/products" ? "lightblue" : "white",
                        marginBottom: 1,
                    }}
                >
                    <ListItemText primary="Products" />
                </ListItem>
                <ListItem
                    component={Link}
                    href="/pproducts"
                    sx={{
                        color: pathname === "/pproducts" ? "lightblue" : "white",
                        marginBottom: 1,
                    }}
                >
                    <ListItemText primary="Popular Products" />
                </ListItem>
                <ListItem
                    component={Link}
                    href="/users"
                    sx={{
                        color: pathname === "/users" ? "lightblue" : "white",
                        marginBottom: 1,
                    }}
                >
                    <ListItemText primary="Users" />
                </ListItem>
                <ListItem
                    component={Link}
                    href="/approval"
                    sx={{
                        color: pathname === "/approval" ? "lightblue" : "white",
                        marginBottom: 1,
                    }}
                >
                    <ListItemText primary="Pending for Approval" />
                </ListItem>
                <ListItem
                    component={Link}
                    href="/Orders"
                    sx={{
                        color: pathname === "/Orders" ? "lightblue" : "white",
                        marginBottom: 1,
                    }}
                >
                    <ListItemText primary="Orders" />
                </ListItem>
                <ListItem
                    component="button" // Render as a button
                    onClick={handleOpenLogoutDialog} // Open the logout confirmation dialog
                    sx={{
                        color: "white",
                        marginBottom: 1,
                        textAlign: "left",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                    }}
                >
                    <ListItemText primary="Logout" />
                </ListItem>
            </List>

            {/* Logout Confirmation Dialog */}
            <Dialog
                open={logoutDialogOpen}
                onClose={handleCloseLogoutDialog}
                aria-labelledby="logout-dialog-title"
                aria-describedby="logout-dialog-description"
            >
                <DialogTitle id="logout-dialog-title">Logout Confirmation</DialogTitle>
                <DialogContent>
                    <DialogContentText id="logout-dialog-description">
                        Are you sure you want to logout?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseLogoutDialog} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleLogout} color="primary">
                        Logout
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Sidebar;
