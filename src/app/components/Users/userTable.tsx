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
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: string, email: string) => void; // Update this line
  onViewCart: (cart: CartItem[]) => void;
}


const UsersTable: React.FC<UsersTableProps> = ({ users, onEdit, onDelete, onViewCart }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
        <Button
          onClick={() => onViewCart(user.cart || [])}
          color="primary"
        >
          View Cart
        </Button>
      </TableCell>
      <TableCell>
        <Button onClick={() => onEdit(user)} color="primary">
          Edit
        </Button>
        <Button
          onClick={() => onDelete(user.id, user.email)} // Pass both id and email
          color="secondary"
        >
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
