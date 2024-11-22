"use client";

import React from "react";
import { Box, List, ListItem, ListItemText, Typography } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Sidebar: React.FC = () => {
    const pathname = usePathname();

    return (
        <Box
            sx={{
                width: 250,
                bgcolor: "#2c3e50",
                color: "white",
                height: "100vh",
                position: "sticky",
                top: 0, // Ensures it stays at the top when scrolling
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
            </List>
        </Box>
    );
};

export default Sidebar;
