import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Button,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Link as MuiLink,
  Chip,
  Alert,
  Container,
  createTheme,
  ThemeProvider,
  CssBaseline
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  MonetizationOnOutlined,
  ShoppingCartOutlined,
  PeopleAltOutlined,
  AddCircleOutline,
  ArrowForward,
  LocalShipping,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

// --- Custom Theme ---
const theme = createTheme({
  palette: {
    primary: {
      main: '#7b6c64', // Sandstone
    },
    secondary: {
      main: '#b3ac9e', // Nomad
    },
    background: {
      default: '#dfdbd8', // Swiss Coffee
      paper: '#ffffff',
    },
    text: {
      primary: '#222220', // Tutara
      secondary: '#7b6c64', // Sandstone
    },
    divider: '#b3ac9e', // Nomad
  },
  typography: {
    fontFamily: '"Circular Std", sans-serif',
    h1: { fontFamily: '"Laginchy", serif', fontWeight: 'bold' },
    h2: { fontFamily: '"Laginchy", serif', fontWeight: 'bold' },
    h3: { fontFamily: '"Laginchy", serif' },
    h4: { fontFamily: '"Laginchy", serif' },
    h5: { fontFamily: '"Laginchy", serif' },
    h6: { fontFamily: '"Laginchy", serif' },
    button: { textTransform: 'none', fontWeight: 500 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '8px 16px',
        },
      },
    },
  },
});

// --- Reusable Components ---
const StatCard = ({ title, value, icon, color, subtext, trend }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3, display: 'flex', alignItems: 'center', borderRadius: 3,
      border: '1px solid', borderColor: 'divider', height: '100%',
      backgroundColor: 'background.paper', transition: 'transform 0.2s',
      '&:hover': { transform: 'translateY(-4px)' },
    }}
  >
    <Avatar sx={{ bgcolor: color, color: 'background.paper', width: 56, height: 56, mr: 3 }}>
      {icon}
    </Avatar>
    <Box>
      <Typography variant="body2" color="text.secondary" fontWeight={500}>{title}</Typography>
      <Typography variant="h5" component="p" fontWeight="bold" sx={{ mt: 0.5 }}>{value}</Typography>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
        {subtext && <Typography variant="caption" color="text.secondary">{subtext}</Typography>}
        {trend && <Chip label={trend} size="small" sx={{ backgroundColor: trend.includes('+') ? 'rgba(0,150,0,0.1)' : 'rgba(150,0,0,0.1)', color: trend.includes('+') ? 'rgba(0,100,0,0.8)' : 'rgba(100,0,0,0.8)', fontWeight: 600, borderRadius: 1 }} />}
      </Stack>
    </Box>
  </Paper>
);

const ChartCard = ({ title, children, action }) => (
  <Paper
    elevation={0}
    sx={{ p: 3, height: '100%', borderRadius: 3, border: '1px solid', borderColor: 'divider', backgroundColor: 'background.paper' }}
  >
    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
      <Typography variant="h6" fontWeight={600}>{title}</Typography>
      {action}
    </Stack>
    {children}
  </Paper>
);

const ListCard = ({ title, children, action, icon }) => (
  <Paper
    elevation={0}
    sx={{ p: 3, height: '100%', borderRadius: 3, border: '1px solid', borderColor: 'divider', backgroundColor: 'background.paper' }}
  >
    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
      <Stack direction="row" alignItems="center" spacing={1}>
        {icon && icon}
        <Typography variant="h6" fontWeight={600}>{title}</Typography>
      </Stack>
      {action}
    </Stack>
    <List disablePadding sx={{ '& .MuiListItem-root': { px: 0 } }}>{children}</List>
  </Paper>
);

// --- Main Dashboard ---
const AdminDashboard = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !user?.is_staff) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        const response = await api.get('/orders/admin/dashboard-summary/');
        setData(response.data); // Using live data from the API
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Could not load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authLoading, isAuthenticated, user, navigate]);

  if (authLoading || loading) return <LoadingSpinner fullHeight />;
  if (error) return (
      <Container maxWidth="xl" sx={{ height: '100vh', display: 'flex', alignItems: 'center' }}>
        <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>
      </Container>
    );
  if (!data) return null;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', p: { xs: 2, md: 4 } }}>
        <Container maxWidth="xl" disableGutters>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            mb={4}
            spacing={2}
          >
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                Welcome back, {user?.first_name || 'Admin'}
              </Typography>
              <Typography color="text.secondary">
                Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </Typography>
            </Box>
            <Stack direction="row" spacing={2} sx={{ mt: { xs: 2, sm: 0 } }}>
              <Button
                component={RouterLink}
                to="/admin/products/new"
                variant="contained"
                startIcon={<AddCircleOutline />}
                sx={{ backgroundColor: 'primary.main', '&:hover': { backgroundColor: 'primary.main', opacity: 0.9 } }}
              >
                Add Product
              </Button>
              <Button 
                component={RouterLink} 
                to="/" 
                variant="outlined"
                endIcon={<ArrowForward />}
                sx={{ borderColor: 'text.secondary', color: 'text.primary', '&:hover': { borderColor: 'text.primary' } }}
              >
                View Store
              </Button>
            </Stack>
          </Stack>

          <Box sx={{ mb: 4, p: 1, borderRadius: 2, backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" spacing={1} overflow="auto" py={1} px={0.5}>
              {[
                { label: 'Dashboard', path: '/admin/dashboard' },
                { label: 'Products', path: '/admin/products' },
                { label: 'Orders', path: '/admin/orders' },
                { label: 'Customers', path: '/admin/customers' },
                { label: 'Categories', path: '/admin/categories' },
                { label: 'Banners', path: '/admin/banner' },
                { label: 'Reports', path: '/admin/reports' },
                { label: 'Content', path: '/admin/content' },
                {/* { label: 'Settings', path: '/admin/settings' }, */}
              ].map((item) => (
                <Button key={item.path} component={RouterLink} to={item.path} variant="text" sx={{ color: 'text.primary', fontWeight: 500, '&.active': { color: 'primary.main' } }}>
                  {item.label}
                </Button>
              ))}
            </Stack>
          </Box>

          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard title="Today's Revenue" value={`$${data.sales_today}`} icon={<MonetizationOnOutlined />} color="primary.main" subtext="vs yesterday" trend="+12%" />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard title="Monthly Revenue" value={`$${data.sales_this_month}`} icon={<MonetizationOnOutlined />} color="secondary.main" subtext="vs last month" trend="+24%" />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard title="Avg. Order Value" value={`$${data.avg_order_value}`} icon={<ShoppingCartOutlined />} color="text.secondary" subtext="vs last month" trend="+8%" />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard title="New Customers" value={data.new_customers_this_week} icon={<PeopleAltOutlined />} color="text.primary" subtext="this week" trend="+15%" />
            </Grid>
          </Grid>

          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} lg={8}>
              <ChartCard title="Revenue Overview" action={<Button size="small" endIcon={<ArrowForward />} sx={{ color: 'text.primary' }}>View Report</Button>}>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={data.sales_over_time} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                    <XAxis dataKey="date" stroke={theme.palette.text.secondary} tickMargin={10} tick={{ fontSize: 12 }} minTickGap={5} interval="preserveStartEnd" />
                    <YAxis stroke={theme.palette.text.secondary} tickFormatter={(value) => `$${value}`} tickMargin={10} tick={{ fontSize: 12 }} width={60} />
                    <Tooltip contentStyle={{ backgroundColor: 'background.paper', border: `1px solid ${theme.palette.divider}`, borderRadius: 8, color: 'text.primary' }} formatter={(value) => [`$${value}`, 'Revenue']} />
                    <Line type="monotone" dataKey="sales" name="Revenue" stroke={theme.palette.primary.main} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8, strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </Grid>
            <Grid item xs={12} lg={4}>
              <ChartCard title="Top Products" action={<Button size="small" endIcon={<ArrowForward />} sx={{ color: 'text.primary' }}>View All</Button>}>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={data.top_selling_products} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} horizontal={true} vertical={false} />
                    <XAxis type="number" stroke={theme.palette.text.secondary} tickFormatter={(val) => val} tickMargin={10} />
                    <YAxis type="category" dataKey="variant__product__name" width={100} tick={{ fontSize: 12 }} stroke={theme.palette.text.secondary} interval={0} tickMargin={10} />
                    <Tooltip contentStyle={{ backgroundColor: 'background.paper', border: `1px solid ${theme.palette.divider}`, borderRadius: 8, color: 'text.primary' }} formatter={(value) => [value, 'Units Sold']} />
                    <Bar dataKey="total_sold" name="Units Sold" fill={theme.palette.primary.main} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={4}>
              <ListCard title="Order Status" icon={<LocalShipping fontSize="small" color="primary" />} action={<Button component={RouterLink} to="/admin/orders" size="small" endIcon={<ArrowForward />} sx={{ color: 'text.primary' }}>Manage</Button>}>
                <ListItem><ListItemText primary="Pending Fulfillment" primaryTypographyProps={{ fontWeight: 500 }} /><Chip label={data.orders_pending} sx={{ backgroundColor: 'rgba(123, 108, 100, 0.1)', color: 'text.primary', fontWeight: 600, borderRadius: 1 }} /></ListItem>
                <Divider component="li" sx={{ my: 1 }} />
                <ListItem><ListItemText primary="Shipped" primaryTypographyProps={{ fontWeight: 500 }} /><Chip label={data.orders_shipped} sx={{ backgroundColor: 'rgba(179, 172, 158, 0.1)', color: 'text.primary', fontWeight: 600, borderRadius: 1 }} /></ListItem>
                <Divider component="li" sx={{ my: 1 }} />
                <ListItem><ListItemText primary="Delivered Today" primaryTypographyProps={{ fontWeight: 500 }} /><Chip label={data.orders_delivered_today} sx={{ backgroundColor: 'rgba(0, 150, 0, 0.1)', color: 'rgba(0, 100, 0, 0.8)', fontWeight: 600, borderRadius: 1 }} /></ListItem>
              </ListCard>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <ListCard title="Recent Orders" icon={<CheckCircle fontSize="small" color="primary" />} action={<Button component={RouterLink} to="/admin/orders" size="small" endIcon={<ArrowForward />} sx={{ color: 'text.primary' }}>View All</Button>}>
                {data.recent_orders.map((order) => (
                  <Box key={order.id}>
                    <ListItem secondaryAction={<Chip label={order.status} size="small" sx={{ backgroundColor: order.status === 'Delivered' ? 'rgba(0,150,0,0.1)' : order.status === 'Shipped' ? 'rgba(179,172,158,0.1)' : 'rgba(123,108,100,0.1)', color: 'text.primary', fontWeight: 600, borderRadius: 1 }} />}>
                      <ListItemText primary={`Order #${order.id}`} secondary={`${order.customer_name} • $${order.total}`} primaryTypographyProps={{ fontWeight: 500 }} secondaryTypographyProps={{ variant: 'body2' }} />
                    </ListItem>
                    <Divider component="li" sx={{ my: 1 }} />
                  </Box>
                ))}
              </ListCard>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <ListCard title="Inventory Alerts" icon={<Warning fontSize="small" color="primary" />} action={<Button component={RouterLink} to="/admin/products" size="small" endIcon={<ArrowForward />} sx={{ color: 'text.primary' }}>Manage</Button>}>
                <ListItem><ListItemText primary="Out of Stock Items" primaryTypographyProps={{ fontWeight: 500 }} /><Chip label={data.out_of_stock_count} sx={{ backgroundColor: 'rgba(150,0,0,0.1)', color: 'rgba(100,0,0,0.8)', fontWeight: 600, borderRadius: 1 }} /></ListItem>
                <Divider component="li" sx={{ my: 1 }} />
                {data.low_stock_items.map((item) => (
                  <Box key={item.id}>
                    <ListItem secondaryAction={<MuiLink component={RouterLink} to={`/admin/products/${item.id}/edit`} color="primary" fontWeight={500}>Restock</MuiLink>}>
                      <ListItemText primary={item.name} secondary={`Only ${item.stock} left in stock`} primaryTypographyProps={{ fontWeight: 500 }} secondaryTypographyProps={{ variant: 'body2', color: item.stock < 5 ? 'error.main' : 'text.secondary' }} />
                    </ListItem>
                    <Divider component="li" sx={{ my: 1 }} />
                  </Box>
                ))}
              </ListCard>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default AdminDashboard;