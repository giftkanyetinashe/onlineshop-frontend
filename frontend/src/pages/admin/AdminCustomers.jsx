// src/pages/admin/AdminCustomers.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../services/api';
import {
  Table, Card, Typography, Row, Col, Statistic, message, Tag, Space, Input, Button, Modal, Form, Switch
} from 'antd';
import { UserOutlined, SearchOutlined, EditOutlined, ArrowUpOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const AdminCustomers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/auth/admin/users/');
      setUsers(response.data.map(user => ({ ...user, key: user.id })));
    } catch (error) {
      // The 403 error will be caught here
      message.error('Failed to fetch customers. You may not have permission.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEditClick = (user) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setIsModalVisible(true);
  };

  const handleFormSubmit = async (values) => {
    try {
      await api.patch(`/auth/admin/users/${editingUser.id}/`, values);
      message.success('Customer updated successfully');
      setIsModalVisible(false);
      fetchUsers();
    } catch (error) {
      message.error('Failed to update customer');
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchText) return users;
    return users.filter(user =>
      user.username.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase()) ||
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [users, searchText]);

  const dashboardStats = useMemo(() => {
    const newUsers = users.filter(u => dayjs().diff(dayjs(u.date_joined), 'day') <= 30).length;
    return {
      totalUsers: users.length,
      newUsers,
      totalAdmins: users.filter(u => u.is_staff).length,
    };
  }, [users]);
  
  const columns = [
    { 
        title: 'Customer', 
        dataIndex: 'first_name', 
        render: (_, record) => (
            <Space>
                <div>
                    <Text strong>{record.first_name} {record.last_name}</Text><br/>
                    <Text type="secondary">{record.email}</Text>
                </div>
            </Space>
        ),
        sorter: (a, b) => `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)
    },
    { title: 'Joined On', dataIndex: 'date_joined', render: (date) => dayjs(date).format('MMM D, YYYY'), sorter: (a, b) => dayjs(a.date_joined).unix() - dayjs(b.date_joined).unix() },
    { title: 'Orders', dataIndex: 'order_count', align: 'center', sorter: (a, b) => a.order_count - b.order_count },
    { title: 'Total Spent', dataIndex: 'total_spent', render: (total) => `$${parseFloat(total).toFixed(2)}`, align: 'right', sorter: (a, b) => a.total_spent - b.total_spent },
    { 
        title: 'Role', 
        dataIndex: 'is_staff', 
        render: (isStaff) => <Tag color={isStaff ? 'purple' : 'default'}>{isStaff ? 'Admin' : 'Customer'}</Tag>,
        filters: [{text: 'Admin', value: true}, {text: 'Customer', value: false}],
        onFilter: (value, record) => record.is_staff === value,
    },
    { 
        title: 'Status', 
        dataIndex: 'is_active', 
        render: (isActive) => <Tag color={isActive ? 'green' : 'red'}>{isActive ? 'Active' : 'Inactive'}</Tag>,
        filters: [{text: 'Active', value: true}, {text: 'Inactive', value: false}],
        onFilter: (value, record) => record.is_active === value,
    },
    { title: 'Actions', key: 'actions', render: (_, record) => <Button icon={<EditOutlined />} onClick={() => handleEditClick(record)}>Edit</Button> },
  ];

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <Title level={3} style={{ marginBottom: 24 }}>Customer Management</Title>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        {/* --- FIX 3: Replaced 'bordered={false}' with 'variant="borderless"' --- */}
        <Col span={8}><Card variant="borderless"><Statistic title="Total Customers" value={dashboardStats.totalUsers} prefix={<UserOutlined />} /></Card></Col>
        <Col span={8}><Card variant="borderless"><Statistic title="New Customers (Last 30 Days)" value={dashboardStats.newUsers} prefix={<ArrowUpOutlined style={{ color: '#52c41a' }} />} /></Card></Col>
        <Col span={8}><Card variant="borderless"><Statistic title="Admin Accounts" value={dashboardStats.totalAdmins} /></Card></Col>
      </Row>

      <Card variant="borderless">
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col><Title level={5} style={{ margin: 0 }}>All Customers</Title></Col>
          <Col><Input placeholder="Search by name, username, or email..." prefix={<SearchOutlined />} value={searchText} onChange={e => setSearchText(e.target.value)} style={{ width: 300 }} allowClear /></Col>
        </Row>
        <Table columns={columns} dataSource={filteredUsers} loading={loading} rowKey="id" />
      </Card>
      
      <Modal title="Edit Customer" open={isModalVisible} onCancel={() => setIsModalVisible(false)} footer={null} destroyOnClose>
        {/* --- FIX 2: Connected the form instance to the Form component --- */}
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="first_name" label="First Name"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="last_name" label="Last Name"><Input /></Form.Item></Col>
          </Row>
          <Form.Item name="email" label="Email"><Input readOnly disabled /></Form.Item>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="is_staff" label="Admin Role" valuePropName="checked"><Switch checkedChildren="Admin" unCheckedChildren="Customer" /></Form.Item></Col>
            <Col span={12}><Form.Item name="is_active" label="Account Status" valuePropName="checked"><Switch checkedChildren="Active" unCheckedChildren="Inactive" /></Form.Item></Col>
          </Row>
          <Form.Item>
            <Button type="primary" htmlType="submit">Save Changes</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminCustomers;