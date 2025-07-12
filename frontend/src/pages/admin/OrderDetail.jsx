import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import api from '../../services/api';

const statusLabels = {
  P: 'Pending',
  PR: 'Processing',
  S: 'Shipped',
  D: 'Delivered',
  C: 'Cancelled',
};

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Utility function to safely convert price to number
  const toNumber = (value) => {
    const num = typeof value === 'number' ? value : parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/orders/orders/' + orderId + '/');
        setOrder(response.data);
      } catch (error) {
        console.error('Error fetching order details:', error);
        setError('Failed to load order details.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return <Typography>Loading order details...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!order) {
    return <Typography>Order not found.</Typography>;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Button variant="outlined" onClick={() => navigate('/admin/orders')} sx={{ mb: 2 }}>
        Back to Orders
      </Button>
      <Typography variant="h4" gutterBottom>
        Order #{order.order_number}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Customer: {order.user?.username || 'N/A'}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Date: {new Date(order.created_at).toLocaleString()}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Status: {statusLabels[order.status] || order.status}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Payment Status: {order.payment_status ? 'Paid' : 'Unpaid'}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Shipping Address: {order.shipping_address || 'N/A'}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Billing Address: {order.billing_address || 'N/A'}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Payment Method: {order.payment_method || 'N/A'}
      </Typography>
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Items
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {order.items && order.items.length > 0 ? (
              order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.product?.name || 'N/A'} -{' '}
                    {item.variant?.color || ''} {item.variant?.size || ''} {item.variant?.sku || ''}
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>
                    ${toNumber(item.price).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    ${(toNumber(item.price) * item.quantity).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4}>No items found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Total Price: ${toNumber(order.total_price).toFixed(2)}
      </Typography>
    </Container>
  );
};

export default OrderDetail;
