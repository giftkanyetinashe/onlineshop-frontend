// src/pages/admin/AdminOrderDetail.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Card, Typography, Row, Col, Select, message, Tag, Space,
  Button, Spin, Alert, Descriptions, Divider, Avatar
} from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, ClockCircleOutlined, SyncOutlined, CloseCircleOutlined, TruckOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const statusOptions = [
    { value: 'P', label: 'Pending', icon: <ClockCircleOutlined />, color: 'blue' },
    { value: 'OH', label: 'On Hold', icon: <SyncOutlined spin />, color: 'orange' },
    { value: 'PR', label: 'Processing', icon: <SyncOutlined />, color: 'purple' },
    { value: 'S', label: 'Shipped', icon: <TruckOutlined />, color: 'cyan' },
    { value: 'D', label: 'Delivered', icon: <CheckCircleOutlined />, color: 'green' },
    { value: 'C', label: 'Cancelled', icon: <CloseCircleOutlined />, color: 'red' },
];

const AdminOrderDetail = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/orders/orders/${orderId}/`);
      setOrder(response.data);
    } catch (error) { message.error('Failed to fetch order details'); }
    finally { setLoading(false); }
  }, [orderId]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);
  
  const handleStatusChange = async (newStatus) => {
    try {
        const response = await api.patch(`/orders/orders/${orderId}/`, { status: newStatus });
        setOrder(response.data);
        message.success('Order status updated!');
    } catch {
        message.error('Failed to update status');
    }
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  if (!order) return <Alert message="Order not found." type="error" showIcon />;

  //const statusInfo = statusOptions.find(s => s.value === order.status);

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space>
            <Link to="/admin/orders"><Button icon={<ArrowLeftOutlined />} /></Link>
            <div>
                <Title level={4} style={{ margin: 0 }}>Order {order.order_number}</Title>
                <Text type="secondary">Placed on {dayjs(order.created_at).format('MMMM D, YYYY h:mm A')}</Text>
            </div>
          </Space>
        </Col>
        <Col>
          <Space>
            <Text>Status:</Text>
            <Select value={order.status} onChange={handleStatusChange} style={{ width: 150 }}>
              {statusOptions.map(opt => <Option key={opt.value} value={opt.value}>{opt.label}</Option>)}
            </Select>
          </Space>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col xs={24} lg={16}>
          <Card title="Order Items" style={{ marginBottom: 24 }}>
            <Space direction="vertical" style={{ width: '100%' }} split={<Divider/>}>
                {order.items.map(item => (
                    <Row key={item.id} align="middle" gutter={16}>
                        <Col span={4}><Avatar shape="square" size={64} src={item.variant?.variant_image || item.variant?.product?.images?.[0]?.image} /></Col>
                        <Col span={12}>
                            <Text strong>{item.variant?.product?.name || 'Product Name Unavailable'}</Text><br/>
                            <Text type="secondary">{item.variant?.shade_name || ''} - {item.variant?.size || ''}</Text>
                        </Col>
                        <Col span={4} style={{ textAlign: 'right' }}><Text type="secondary">{item.quantity} x ${item.price}</Text></Col>
                        <Col span={4} style={{ textAlign: 'right' }}><Text strong>${(item.quantity * item.price).toFixed(2)}</Text></Col>
                    </Row>
                ))}
            </Space>
            <Divider/>
            <Descriptions column={1} layout="horizontal" styles={{ content: { textAlign: 'right' } }}>
                <Descriptions.Item label="Subtotal">${(Number(order.total_price || 0) - Number(order.shipping_cost || 0) + Number(order.discount_amount || 0)).toFixed(2)}</Descriptions.Item>
                {order.discount_amount > 0 && <Descriptions.Item label={`Discount (${order.promo_code})`}>-${Number(order.discount_amount || 0).toFixed(2)}</Descriptions.Item>}
                <Descriptions.Item label="Shipping">${Number(order.shipping_cost || 0).toFixed(2)}</Descriptions.Item>
                <Descriptions.Item label={<Text strong>Total</Text>}><Text strong>${Number(order.total_price || 0).toFixed(2)}</Text></Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Customer Details" style={{ marginBottom: 24 }}>
            <Space>
                <Avatar size="large">{order.user.first_name?.[0]}{order.user.last_name?.[0]}</Avatar>
                <div>
                    <Text strong>{order.user.first_name} {order.user.last_name}</Text><br/>
                    <Text type="secondary">{order.user.email}</Text>
                </div>
            </Space>
            <Divider/>
            <Descriptions column={1}>
                <Descriptions.Item label="Shipping Address">{order.shipping_address}</Descriptions.Item>
                <Descriptions.Item label="Billing Address">{order.billing_address}</Descriptions.Item>
            </Descriptions>
          </Card>
          <Card title="Payment Information">
            <Tag color={order.payment_status ? 'green' : 'red'}>{order.payment_status ? 'Paid' : 'Unpaid'}</Tag>
            <Text style={{ marginLeft: 8 }}>via {order.payment_method}</Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminOrderDetail;