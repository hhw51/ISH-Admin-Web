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

export interface Product {
  id: string;
  category: string;
  description: string;
  models: string;
  points: number;
  price: number;
  productid: number;
  quantity: number;
  imageUrl?: string;
}

interface ProductsTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

const ProductsTable: React.FC<ProductsTableProps> = ({ products, onEdit, onDelete }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Handle pagination page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const sortedProducts = [...products].sort((a, b) =>
    a.category.localeCompare(b.category)
  ); // Sort alphabetically by category
  const paginatedProducts = sortedProducts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Category</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Model</TableCell>
            <TableCell>Points</TableCell>
            <TableCell>Price(PKR)</TableCell>
            <TableCell>ProductID</TableCell>
            <TableCell>Quantity</TableCell>
            <TableCell>Image</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedProducts.map((product) => (
            <TableRow key={product.id}>
              <TableCell>{product.category}</TableCell>
              <TableCell>{product.description}</TableCell>
              <TableCell>{product.models}</TableCell>
              <TableCell>{product.points}</TableCell>
              <TableCell>{product.price}</TableCell>
              <TableCell>{product.productid}</TableCell>
              <TableCell>{product.quantity}</TableCell>
              <TableCell>
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.models}
                    style={{ width: "50px", height: "50px", objectFit: "cover" }}
                  />
                )}
              </TableCell>
              <TableCell>
                <Button onClick={() => onEdit(product)} color="primary">
                  Edit
                </Button>
                <Button
                onClick={() => onDelete(product.id.split("-")[0], product.models)}
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
        count={products.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </TableContainer>
  );
};

export default ProductsTable;
