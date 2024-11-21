import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Button,
} from "@mui/material";

export interface User {
  id: string;
  account_type: string;
  address: string;
  cnic: string;
  email: string;
  full_name: string;
  phone: string;
  points: number;
  cart?: CartItem[]; // Add the cart property as optional
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

interface UsersTableProps {
  users: User[]; // Now includes the optional cart property
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
}

const UsersTable: React.FC<UsersTableProps> = ({ users, onEdit, onDelete }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [selectedCart, setSelectedCart] = useState<CartItem[]>([]);
  
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const viewCart = (cart: CartItem[] | undefined) => {
    if (!cart || cart.length === 0) {
      alert("No items in the cart!");
      return;
    }
    console.log("Cart items:", cart); // Debugging purpose
    // Replace this with your modal logic
    setSelectedCart(cart); // Pass cart to modal or state
    setCartModalOpen(true); // Open modal
  };
  

  const paginatedUsers = users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Full Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Address</TableCell>
            <TableCell>CNIC</TableCell>
            <TableCell>Points</TableCell>
            <TableCell>Account Type</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.full_name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.phone}</TableCell>
              <TableCell>{user.address}</TableCell>
              <TableCell>{user.cnic}</TableCell>
              <TableCell>{user.points}</TableCell>
              <TableCell>{user.account_type}</TableCell>
              <TableCell>
             <Button onClick={() => viewCart(user.cart)} color="primary">
                View Cart
              </Button>
              </TableCell>
              <TableCell>
                <Button onClick={() => onEdit(user)} color="primary">
                  Edit
                </Button>
                <Button onClick={() => onDelete(user.id)} color="secondary">
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={users.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </TableContainer>
  );
};

export default UsersTable;
