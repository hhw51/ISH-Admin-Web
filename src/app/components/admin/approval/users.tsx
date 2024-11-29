"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, setDoc, doc } from "firebase/firestore";
import { CircularProgress, Typography, Dialog, DialogActions, DialogContent, DialogTitle, Button } from "@mui/material";
import { db } from "../../../../utils/firebaseClient";
import UsersTable, { User } from "./userTable"; // Updated UsersTable without cart
import FilterBar from "../Users/filterBar";

const ApprovalPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null); // For approval confirmation
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  // Fetch only users with status === 'n'
  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const pendingUsers: User[] = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as User))
        .filter((user) => user.status === "n"); // Filter pending users
      setUsers(pendingUsers);
      setFilteredUsers(pendingUsers); // Initially, filtered users are the same as all users
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  // Filter users based on search input
  useEffect(() => {
    if (search.trim() === "") {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(
        users.filter((user) =>
          Object.values(user)
            .map((value) => (typeof value === "string" ? value.toLowerCase() : String(value).toLowerCase()))
            .some((value) => value.includes(search.toLowerCase()))
        )
      );
    }
  }, [search, users]);

  // Open confirmation dialog
  const handleApproveClick = (user: User) => {
    setCurrentUser(user);
    setDialogOpen(true);
  };

  // Approve user (update status to 'y')
  const handleApproveConfirm = async () => {
    if (currentUser) {
      try {
        await setDoc(doc(db, "users", currentUser.id), { ...currentUser, status: "y" });
        fetchPendingUsers(); // Refresh users list
      } catch (error) {
        console.error("Error approving user:", error);
      } finally {
        setDialogOpen(false);
        setCurrentUser(null);
      }
    }
  };

  return (
    <div style={{ backgroundColor: "white", minHeight: "100vh", padding: "20px" }}>
<Typography sx={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'black' }}>
  Pending Approvals
</Typography>

      <FilterBar search={search} setSearch={setSearch} category="" setCategory={() => {}} />

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
          <CircularProgress />
        </div>
      ) : (
        <UsersTable users={filteredUsers} onApprove={handleApproveClick} />
      )}

      {/* Approval Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Confirm Approval</DialogTitle>
        <DialogContent>Are you sure you want to approve this user?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleApproveConfirm} color="primary">
            Approve
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ApprovalPage;
