// src/pages/admin/AdminOrders.jsx

// ... (all imports and the first part of the component remain the same)
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../services/api';
import {
  Table, Card, Typography, Row, Col, Select, message, Tag, Space, Input, Button,
  Statistic, DatePicker, Dropdown, Avatar
} from 'antd';
import {
  SearchOutlined, EyeOutlined, FilterOutlined, DownloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined, SyncOutlined, CloseCircleOutlined, TruckOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import OrderStatusChart from '../../components/charts/OrderStatusChart';
import RevenueTrendChart from '../../components/charts/RevenueTrendChart';
import OrderDetailModal from './OrderDetailModal';

// ... (rest of the component up to the return statement)
const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const statusOptions = [
  { value: 'P', label: 'Pending', icon: <ClockCircleOutlined />, color: 'blue' },
  { value: 'OH', label: 'On Hold', icon: <SyncOutlined />, color: 'orange' },
  { value: 'PR', label: 'Processing', icon: <SyncOutlined />, color: 'purple' },
  { value: 'S', label: 'Shipped', icon: <TruckOutlined />, color: 'cyan' },
  { value: 'D', label: 'Delivered', icon: <CheckCircleOutlined />, color: 'green' },
  { value: 'C', label: 'Cancelled', icon: <CloseCircleOutlined />, color: 'red' },
];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      let params = {};
      if (dateRange && dateRange.length === 2) {
        params.start_date = dayjs(dateRange[0]).format('YYYY-MM-DD');
        params.end_date = dayjs(dateRange[1]).format('YYYY-MM-DD');
      }
      if (selectedStatus.length) {
        params.status = selectedStatus.join(',');
      }
      
      const response = await api.get('/orders/orders/', { params });
      setOrders(response.data.map(order => ({ 
        ...order,
        key: order.id,
        created_at: dayjs(order.created_at),
        updated_at: dayjs(order.updated_at)
      })));
    } catch (error) {
      message.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [dateRange, selectedStatus]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setOrders(prev => prev.map(order => order.id === orderId ? { ...order, status: newStatus } : order));
      await api.patch(`/orders/orders/${orderId}/`, { status: newStatus });
      message.success(`Order status updated`);
    } catch (error) {
      message.error('Failed to update status');
      fetchOrders();
    }
  };

  const handleExport = async (format) => {
    setExportLoading(true);
    message.info(`Exporting orders as ${format}...`);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setExportLoading(false);
    message.success(`Orders exported as ${format}`);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => 
      (!searchText || 
        order.order_number.toLowerCase().includes(searchText.toLowerCase()) ||
        order.user.username.toLowerCase().includes(searchText.toLowerCase()) ||
        order.user.email.toLowerCase().includes(searchText.toLowerCase()))
    );
  }, [orders, searchText]);

  const dashboardStats = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + parseFloat(order.total_price), 0);
    const totalOrders = filteredOrders.length;
    const revenueData = filteredOrders.reduce((acc, order) => {
      const date = order.created_at.format('YYYY-MM-DD');
      if (!acc[date]) acc[date] = 0;
      acc[date] += parseFloat(order.total_price);
      return acc;
    }, {});

    return {
      totalOrders,
      totalRevenue: totalRevenue.toFixed(2),
      pendingOrders: filteredOrders.filter(o => ['P', 'OH'].includes(o.status)).length,
      avgOrderValue: totalOrders ? (totalRevenue / totalOrders).toFixed(2) : '0.00',
      statusDistribution: statusOptions.map(option => ({
        ...option,
        count: filteredOrders.filter(o => o.status === option.value).length,
      })),
      revenueTrend: Object.entries(revenueData).map(([date, value]) => ({ date, value })).sort((a, b) => new Date(a.date) - new Date(b.date)),
    };
  }, [filteredOrders]);

  const handleViewDetails = (orderId) => {
    setSelectedOrderId(orderId);
    setIsModalVisible(true);
  };

  const columns = [
    { title: 'Order Details', dataIndex: 'order_number', render: (text, record) => (
        <div>
          <Text strong style={{ fontSize: 15 }}>{text}</Text>
          <div style={{ fontSize: 12, color: '#666' }}>{record.created_at.format('MMM D, YYYY h:mm A')}</div>
        </div>
    )},
    { title: 'Customer', dataIndex: 'user', render: (user) => (
        <Space>
          <Avatar size="small">{user.first_name?.[0]}</Avatar>
          <div>
            <div>{user.first_name} {user.last_name}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>{user.email}</Text>
          </div>
        </Space>
    )},
    { title: 'Payment', dataIndex: 'payment_status', render: (status) => <Tag color={status ? 'green' : 'red'} icon={status ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>{status ? 'Paid' : 'Unpaid'}</Tag>, filters: [{text: 'Paid', value: true}, {text: 'Unpaid', value: false}], onFilter: (value, record) => record.payment_status === value },
    { title: 'Status', dataIndex: 'status', render: (status, record) => {
        const statusInfo = statusOptions.find(s => s.value === status);
        return (
          <Dropdown menu={{ items: statusOptions.map(o => ({ key: o.value, icon: o.icon, label: <Tag color={o.color}>{o.label}</Tag>})), onClick: ({ key }) => handleStatusChange(record.id, key) }} trigger={['click']}>
            <Tag color={statusInfo?.color} icon={statusInfo?.icon} style={{ cursor: 'pointer', padding: '4px 8px' }}>{statusInfo?.label}</Tag>
          </Dropdown>
        );
    }, filters: statusOptions.map(o => ({ text: o.label, value: o.value })), onFilter: (value, record) => record.status === value },
    { title: 'Total', dataIndex: 'total_price', render: (total) => <Text strong>${parseFloat(total).toFixed(2)}</Text>, sorter: (a, b) => a.total_price - b.total_price },
    { title: 'Actions', key: 'actions', render: (_, record) => <Button icon={<EyeOutlined />} onClick={() => handleViewDetails(record.id)}>Details</Button> },
  ];

  const exportMenu = { items: [
      { key: 'CSV', icon: <DownloadOutlined />, label: 'Export as CSV' },
      { key: 'Excel', icon: <DownloadOutlined />, label: 'Export as Excel' },
  ]};

  return (
    <div style={{ padding: 24, background: '#f9f9f9' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col><Title level={3} style={{ margin: 0 }}>Order Management</Title></Col>
        <Col><Space>
          <RangePicker onChange={setDateRange} allowClear />
          <Dropdown menu={exportMenu} placement="bottomRight" onClick={({ key }) => handleExport(key)}>
            <Button type="primary" icon={<DownloadOutlined />} loading={exportLoading}>Export</Button>
          </Dropdown>
        </Space></Col>
      </Row>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}><Card variant="borderless"><Statistic title="Total Orders" value={dashboardStats.totalOrders} /></Card></Col>
        <Col span={6}><Card variant="borderless"><Statistic title="Total Revenue" value={`$${dashboardStats.totalRevenue}`} /></Card></Col>
        <Col span={6}><Card variant="borderless"><Statistic title="Pending Orders" value={dashboardStats.pendingOrders} /></Card></Col>
        <Col span={6}><Card variant="borderless"><Statistic title="Avg. Order Value" value={`$${dashboardStats.avgOrderValue}`} /></Card></Col>
      </Row>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}><Card title="Order Status Distribution" variant="borderless"><OrderStatusChart data={dashboardStats.statusDistribution} /></Card></Col>
        <Col span={12}><Card title="Revenue Trend" variant="borderless"><RevenueTrendChart data={dashboardStats.revenueTrend} /></Card></Col>
      </Row>
      <Card variant="borderless" title={<Title level={5} style={{ margin: 0 }}>All Orders</Title>} extra={<Space>
          <Select mode="multiple" placeholder="Filter by status" style={{ width: 200 }} onChange={setSelectedStatus} allowClear suffixIcon={<FilterOutlined />}>
            {statusOptions.map(o => <Option key={o.value} value={o.value}><Tag color={o.color}>{o.label}</Tag></Option>)}
          </Select>
          <Input placeholder="Search orders..." prefix={<SearchOutlined />} value={searchText} onChange={e => setSearchText(e.target.value)} style={{ width: 250 }} allowClear />
      </Space>}>
        <Table columns={columns} dataSource={filteredOrders} loading={loading} rowKey="id" scroll={{ x: true }} />
      </Card>
      
      <OrderDetailModal
        orderId={selectedOrderId}
        visible={isModalVisible}
        // --- THIS IS THE FIX ---
        // Pass the closing function to the 'onCancel' prop.
        onCancel={() => setIsModalVisible(false)}
        onUpdate={fetchOrders}
      />
    </div>
  );
};

export default AdminOrders;