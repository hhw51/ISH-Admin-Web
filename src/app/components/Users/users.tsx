"use client";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React, { useEffect, useState } from "react";
import { collection,setDoc, getDocs, doc, deleteDoc } from "firebase/firestore";
import { CircularProgress } from "@mui/material";
import { db } from "../../../utils/firebaseClient";
import UsersTable, { User,CartItem } from "./userTable";
import CartModal from "./CartModal"
import UserModal from "./userModal"
import FilterBar from "./filterBar"
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from "@mui/material";

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteUserDetails, setDeleteUserDetails] = useState<{ id: string; email: string } | null>(null);
  
  const openDeleteDialog = (id: string, email: string) => {
    setDeleteUserDetails({ id, email });
    setDeleteDialogOpen(true);
  };
  
  // Function to close the delete dialog
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeleteUserDetails(null);
  };
  

  const confirmDelete = async () => {
    if (!deleteUserDetails) return;
  
    const { id, email } = deleteUserDetails;
  
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
  
      toast.success("User deleted successfully!"); // Show success toast
      fetchUsers(); // Refresh the users list
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete the user. Please try again."); // Show error toast
    } finally {
      closeDeleteDialog();
    }
  };
  
  
  

  const handleViewCart = (cart: CartItem[]) => {
    if (cart.length === 0) {
      toast.warning("No items in the cart!", {
        position: "top-right",
        autoClose: 3000, // Time in milliseconds
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
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
          onEdit={(user) => setCurrentUser(user)}
          onDelete={(id, email) => openDeleteDialog(id, email)}
          onViewCart={(cart) => {
            setSelectedCart(cart);
            setCartModalOpen(true);
          }}
        />
      )}

      {/* Cart Modal */}
      <CartModal
        open={cartModalOpen}
        onClose={() => setCartModalOpen(false)}
        cart={selectedCart}
      />

      {/* User Modal */}
      <UserModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSubmit={(user) => {
          console.log("User submitted:", user);
          setEditModalOpen(false);
        }}
        user={currentUser || null}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this user: {deleteUserDetails?.email}?
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

export default UsersPage;

