"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Select,
  MenuItem,
  CircularProgress,
  Typography
} from "@mui/material";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../../../../utils/firebaseClient";

interface Order {
  id: string; // Firestore document ID
  userId: string;
  name: string;
  account_type: string;
  categories: string[];
  models: string[];
  points: number[];
  prices: number[];
  quantities: number[];
  timestamp: string;
  status: string;
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/fetchOrders");
        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }
        const data: Order[] = await response.json();
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchOrders();
  }, []);
  

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const orderRef = doc(db, "history", orderId);
      await updateDoc(orderRef, { status: newStatus });
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing":
        return "yellow";
      case "shipping":
        return "blue";
      case "delivered":
        return "green";
      default:
        return "grey";
    }
  };

  return (
    <div style={{ backgroundColor: "white", minHeight: "100vh", padding: "20px" }}>
<Typography sx={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'black' }}>
    Orders
</Typography>
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
          <CircularProgress />
        </div>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order Name</TableCell>
                <TableCell>Account Type</TableCell>
                <TableCell>Categories</TableCell>
                <TableCell>Models</TableCell>
                <TableCell>Total Price</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.name}</TableCell>
                    <TableCell>{order.account_type}</TableCell>
                    <TableCell>{order.categories.join(", ")}</TableCell>
                    <TableCell>{order.models.join(", ")}</TableCell>
                    <TableCell>
                      {order.prices.reduce(
                        (total, price, index) => total + price * order.quantities[index],
                        0
                      )}
                    </TableCell>
                    <TableCell>
                    <Select
  value={order.status}
  onChange={(e) => handleStatusChange(order.id, e.target.value)}
  sx={{
    backgroundColor: order.status ? getStatusColor(order.status) : "transparent",
    color: "black", // Keep the text color consistent
    padding: "0.5rem",
    borderRadius: "4px",
    minWidth: "10ch",
    height: "2rem",
    fontSize: "0.875rem",
  }}
>
  <MenuItem
    value="processing"
    sx={{
      backgroundColor: "yellow",
      "&:hover": { backgroundColor: "yellow" }, // Keep the same color on hover
    }}
  >
    Processing
  </MenuItem>
  <MenuItem
    value="shipping"
    sx={{
      backgroundColor: "blue",
      "&:hover": { backgroundColor: "blue" }, // Keep the same color on hover
    }}
  >
    Shipping
  </MenuItem>
  <MenuItem
    value="delivered"
    sx={{
      backgroundColor: "green",
      "&:hover": { backgroundColor: "green" }, // Keep the same color on hover
    }}
  >
    Delivered
  </MenuItem>
</Select>


                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={orders.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      )}
    </div>
  );
};

export default OrdersPage;