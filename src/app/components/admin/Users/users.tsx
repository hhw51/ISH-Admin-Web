"use client"
import React, { useState, useEffect } from "react";
import { Button, CircularProgress, Typography, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText } from "@mui/material";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { collection, setDoc, getDocs, doc, deleteDoc } from "firebase/firestore";
import { auth, db } from "../../../../utils/firebaseClient";
import UsersTable, { User, CartItem } from "./userTable";
import UserModal from "./userModal";
import CartModal from "./CartModal";
import FilterBar from "./filterBar";
import { updateEmail,createUserWithEmailAndPassword } from "firebase/auth";
// import { FirebaseError } from "firebase/app"; // Ensure this import is in place
import { getAuth, fetchSignInMethodsForEmail,updatePassword } from 'firebase/auth';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [category, setCategory] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [selectedCart, setSelectedCart] = useState<CartItem[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [search, setSearch] = useState<string>("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteUserDetails, setDeleteUserDetails] = useState<{ id: string; email: string } | null>(null);

  // Fetch users from Firestore
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersData: User[] = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const user = doc.data() as Omit<User, "id" | "cart">;
          const cartSnapshot = await getDocs(collection(db, `users/${doc.id}/cart`));
          const cartItems: CartItem[] = cartSnapshot.docs.map((cartDoc) => cartDoc.data() as CartItem);
          return {
            id: doc.id,
            ...user,
            cart: cartItems,
          };
        })
      );
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.log("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (updatedUser: User) => {
    if (!updatedUser.email || !updatedUser.password) {
      toast.error("Email and Password are required for new users.");
      return;
    }
  
    const isNewUser = !updatedUser.id; // If there's no user ID, it's a new user
  
    try {
      // Check if the user exists in Firebase Authentication
      const userExists = await checkUserExists(updatedUser.email);
  
      if (isNewUser && !userExists) {
        // Create new user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, updatedUser.email, updatedUser.password);
        const newUser = userCredential.user;
        console.log("New user added to Firebase Authentication:", newUser.uid);
  
        // Now save the user in Firestore, excluding the password field and adding status: "y"
        const { password, ...userWithoutPassword } = updatedUser; // Exclude password
        await setDoc(doc(db, "users", newUser.uid), { 
          ...userWithoutPassword,
          id: newUser.uid,  // Use Firebase UID as Firestore user ID
          status: "y", // Add the status field
        });
  
        toast.success("New user created successfully!");
      } else {
        // If the user already exists, just update Firestore (again, exclude the password)
        const { password, ...userWithoutPassword } = updatedUser; // Exclude password
        await setDoc(doc(db, "users", updatedUser.id), {
          ...userWithoutPassword,
          status: "y", // Add the status field
        });
        toast.success("User updated successfully!");
      }
  
      // Update Firebase Authentication if email or password has changed
      if (updatedUser.email !== currentUser?.email) {
        const user = auth.currentUser;
        if (user) {
          await updateEmail(user, updatedUser.email); // Update email in Firebase Auth
          console.log("Email updated successfully.");
        }
      }
  
      if (updatedUser.password !== currentUser?.password && updatedUser.password) {
        const user = auth.currentUser;
        if (user) {
          await updatePassword(user, updatedUser.password); // Update password in Firebase Auth
          console.log("Password updated successfully.");
        }
      }
  
      // Refresh users list after operation
      fetchUsers();
  
      // Close modal and reset user state
      setEditModalOpen(false);
      setCurrentUser(null);
    } catch (error) {
      console.log("Error editing user:", error);
      toast.error("Failed to update user. Please try again.");
    }
  };
  
  
  // Handle Delete User action
  const openDeleteDialog = (id: string, email: string) => {
    setDeleteUserDetails({ id, email });
    setDeleteDialogOpen(true);
  };
  
  const checkUserExists = async (email: string) => {
    const auth = getAuth();
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      return methods.length > 0; // Returns true if methods are found (user exists)
    } catch (error) {
      console.log("Error checking user existence:", error);
      return false;
    }
  };
  
  // Usage in your delete function
  const confirmDelete = async () => {
    if (!deleteUserDetails) return;
    const { id, email } = deleteUserDetails;
  
    try {
      const userExists = await checkUserExists(email); // Check if user exists in Firebase Auth
      if (userExists) {
        // If user exists in Firebase Auth, delete from both Firebase and Firestore
        await deleteDoc(doc(db, "users", id)); // Delete user from Firestore
        await fetch("/api/deleteUser", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        toast.success("User deleted from both Firebase and DB!");
      } else {
        // Handle case where user does not exist in Firebase Auth
        await deleteDoc(doc(db, "users", id)); // Delete user from Firestore
        toast.success("User deleted from DB!");
      }
  
      fetchUsers(); // Refresh user list
    } catch (error) {
      toast.error("Failed to delete the user. Please try again.");
      console.log("Error deleting user:", error);
    } finally {
      setDeleteDialogOpen(false); // Close delete dialog
    }
  };
  

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (search.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter((user) =>
        user.full_name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.phone.toLowerCase().includes(search.toLowerCase()) // You can filter more fields as needed
      );
      setFilteredUsers(filtered);
    }
  }, [search, users]);
  

  return (
    <div style={{ backgroundColor: "white", minHeight: "100vh", padding: "20px" }}>
      <Typography sx={{ fontSize: "1.25rem", fontWeight: "bold", color: "black" }}>Users</Typography>
      <FilterBar
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
      /><Button
      onClick={() => {
        setCurrentUser(null); // Reset currentUser for Add User
        setEditModalOpen(true);
      }}
      variant="contained"
      color="primary"
      style={{ marginBottom: "1rem" }}
    >
      Add User
    </Button>
    

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
          <CircularProgress />
        </div>
      ) : (
    <UsersTable
        users={filteredUsers}
        onEdit={(user) => {
          setCurrentUser(user);  // Set current user to edit
          setEditModalOpen(true); // Open edit modal
        }}
        onDelete={(id, email) => openDeleteDialog(id, email)}
        onViewCart={(cart) => {
          setSelectedCart(cart);
          setCartModalOpen(true);
        }}
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
        user={currentUser}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this user: {deleteUserDetails?.email}?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="secondary">
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
