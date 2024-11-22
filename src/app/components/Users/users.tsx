"use client";

import React, { useEffect, useState } from "react";
import { collection,setDoc, getDocs, doc, deleteDoc } from "firebase/firestore";
import { CircularProgress } from "@mui/material";
import { db } from "../../../utils/firebaseClient";
import UsersTable, { User,CartItem } from "./userTable";
import CartModal from "./CartModal"
import UserModal from "./userModal"
import FilterBar from "./filterBar"
const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [selectedCart, setSelectedCart] = useState<CartItem[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null); // State for the currently selected user
  const [editModalOpen, setEditModalOpen] = useState(false); // State to track if the edit modal is open or closed
  const [search, setSearch] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]); // Filtered list of users

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersData: User[] = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const user = doc.data() as Omit<User, "id" | "cart">; // Map fields to User interface
          const cartSnapshot = await getDocs(collection(db, `users/${doc.id}/cart`));
          const cartItems: CartItem[] = cartSnapshot.docs.map((cartDoc) => cartDoc.data() as CartItem);
  
          return {
            id: doc.id,
            ...user,
            cart: cartItems, // Attach cart to user
          };
        })
      );
      setUsers(usersData);
      setFilteredUsers(usersData); // Initially, filtered users are the same as all users
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  

  const handleDelete = async (id: string, email: string) => {
    console.log("🥩💕", id);
    console.log("🔮🐂", email);
  
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;
  
    try {
      // Delete user from Firestore
      await deleteDoc(doc(db, "users", id));
  
      // Call the API route to delete the Firebase Auth user
      const response = await fetch("/api/deleteUser", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to delete user from Firebase Authentication");
      }
  
      fetchUsers(); // Refresh the users list
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };
  
  
  

  const handleViewCart = (cart: CartItem[]) => {
    if (cart.length === 0) {
      alert("No items in the cart!"); // Handle empty cart
      return;
    }
    setSelectedCart(cart); // Set the selected cart items
    setCartModalOpen(true); // Open the cart modal
  };
  
  
  
  const handleEditSubmit = async (updatedUser: User) => {
    try {
      await setDoc(doc(db, "users", currentUser?.id || ""), updatedUser);
      fetchUsers(); // Refresh users list
      setEditModalOpen(false);
      setCurrentUser(null); // Reset currentUser
    } catch (error) {
      console.error("Error editing user:", error);
    }
  };
  const handleEdit = (user: User) => {
    setCurrentUser(user); // Set the current user in the state
    setEditModalOpen(true); // Open the edit modal
  };
  

  useEffect(() => {
    fetchUsers();
  }, []);
  useEffect(() => {
    if (search.trim() === "") {
      setFilteredUsers(users); // Reset filtered users if search is empty
    } else {
      const filtered = users.filter((user) => {
        // Convert user object into an array of strings (values only)
        const userValues = Object.values(user)
          .map((value) => (typeof value === "string" ? value.toLowerCase() : String(value).toLowerCase()));
  
        // Check if any of the values includes the search term
        return userValues.some((value) => value.includes(search.toLowerCase()));
      });
  
      setFilteredUsers(filtered);
    }
  }, [search, users]);
  
  return (
    <div style={{ backgroundColor: "white", minHeight: "100vh", padding: "20px" }}>
      <h1>Users</h1>
      <FilterBar
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
      />
      <button onClick={() => setEditModalOpen(true)}>Add User</button>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
          <CircularProgress />
        </div>
      ) : (
        <UsersTable
          users={filteredUsers}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewCart={handleViewCart} // Pass the cart view handler
        />
)}
      <CartModal
        open={cartModalOpen}
        onClose={() => setCartModalOpen(false)}
        cart={selectedCart}
      />
      <UserModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        user={currentUser || null} // Safely pass null if no user is set
      />


    </div>
  );
};

export default UsersPage;
