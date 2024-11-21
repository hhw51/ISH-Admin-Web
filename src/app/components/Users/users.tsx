"use client";

import React, { useEffect, useState } from "react";
import { collection,setDoc, getDocs, doc, deleteDoc } from "firebase/firestore";
import { CircularProgress } from "@mui/material";
import { db } from "../../../../lib/firebaseConfig";
import UsersTable, { User,CartItem } from "../Users/userTable";
import CartModal from "../Users/CartModal"
import UserModal from "../Users/userModal"
import FilterBar from "../Users/filterBar"
const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [selectedCart, setSelectedCart] = useState<CartItem[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null); // State for the currently selected user
  const [editModalOpen, setEditModalOpen] = useState(false); // State to track if the edit modal is open or closed
  const [search, setSearch] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [modalOpen, setModalOpen] = useState<boolean>(false);
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

  

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;
  
    try {
      await deleteDoc(doc(db, "users", id)); // Remove user from Firestore
      fetchUsers(); // Refresh users list
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };
  

  const handleViewCart = (cart: CartItem[]) => {
    setSelectedCart(cart);
    setCartModalOpen(true);
  };
  const handleEdit = (user: User) => {
    setCurrentUser(user);
    setEditModalOpen(true);
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
        <UsersTable users={filteredUsers} onEdit={handleEdit} onDelete={handleDelete} />
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
