import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Outlet, useOutlet } from 'react-router-dom'; // Import Outlet and useOutlet

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const { user } = useAuth();
  const outlet = useOutlet(); // Use useOutlet to render nested routes

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders/orders/');
        setOrders(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/`, { status: newStatus });
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  if (!user || !user.is_staff) {
    return (
      <Container>
        <Typography variant="h5" color="error">
          You don't have permission to access this page.
        </Typography>
      </Container>
    );
  }

  // Render nested routes if they exist
  if (outlet) {
    return outlet;
  }

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Manage Orders
          </Typography>
          
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Filter by Status"
            >
              <MenuItem value="all">All Orders</MenuItem>
              <MenuItem value="P">Pending</MenuItem>
              <MenuItem value="PR">Processing</MenuItem>
              <MenuItem value="S">Shipped</MenuItem>
              <MenuItem value="D">Delivered</MenuItem>
              <MenuItem value="C">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Order #</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Payment</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.order_number}</TableCell>
                      <TableCell>{order.user.username}</TableCell>
                      <TableCell>
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>${order.total_price}</TableCell>
                      <TableCell>
                        <FormControl fullWidth size="small">
                          <Select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          >
                            <MenuItem value="P">Pending</MenuItem>
                            <MenuItem value="PR">Processing</MenuItem>
                            <MenuItem value="S">Shipped</MenuItem>
                            <MenuItem value="D">Delivered</MenuItem>
                            <MenuItem value="C">Cancelled</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        {order.payment_status ? 'Paid' : 'Unpaid'}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outlined" 
                          size="small"
                          href={`/admin/orders/${order.id}`}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Outlet />
          </>
        )}
      </Box>
    </Container>
  );
};

export default AdminOrders;
