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
import Image from "next/image"; // Import Image from next/image

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
  onDelete: (id: string, models: string) => void;
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
              {/* Display text content first */}
              <TableCell>{product.category}</TableCell>
              <TableCell>{product.description}</TableCell>
              <TableCell>{product.models}</TableCell>
              <TableCell>{product.points}</TableCell>
              <TableCell>{product.price}</TableCell>
              <TableCell>{product.productid}</TableCell>
              <TableCell>{product.quantity}</TableCell>
              
              {/* Images load lazily to avoid blocking text render */}
              <TableCell>
                <div style={{ height: "50px", width: "50px" }}>
                  {product.imageUrl && (
                    <Image
                      src={product.imageUrl} // Firebase Storage image URL
                      alt={product.models}
                      width={50}
                      height={50}
                      style={{ objectFit: "cover" }}
                      loading="lazy" // Lazy load the image
                      placeholder="blur" // Optional: use placeholder for blur-up effect
                      blurDataURL="data:image/svg+xml;base64,..." // Optional: Provide a small base64 image as a placeholder
                    />
                  )}
                </div>
              </TableCell>
              
              {/* Actions: Edit and Delete */}
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
      
      {/* Pagination */}
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
