import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Button,
  } from "@mui/material";
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
  
  interface CartModalProps {
    open: boolean;
    onClose: () => void;
    cart: CartItem[];
  }
  
  const CartModal: React.FC<CartModalProps> = ({ open, onClose, cart }) => (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Cart Items</DialogTitle>
      <DialogContent>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Category</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Model</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Quantity</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cart.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.descriptions.join(", ")}</TableCell>
                <TableCell>{item.models.join(", ")}</TableCell>
                <TableCell>{item.prices.join(", ")}</TableCell>
                <TableCell>{item.quantity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
  
  export default CartModal;
  