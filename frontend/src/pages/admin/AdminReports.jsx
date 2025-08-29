// src/pages/admin/AdminReports.jsx

import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import {
  Card, Typography, Row, Col, Statistic, message, Spin, DatePicker
} from 'antd';
import { DollarCircleOutlined, UsergroupAddOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import RevenueTrendChart from '../../components/charts/RevenueTrendChart';
import TopProductsChart from '../../components/charts/TopProductsChart';
import SalesByCategoryChart from '../../components/charts/SalesByCategoryChart';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const AdminReports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'day'), dayjs()]);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateRange && dateRange.length === 2) {
        params.start_date = dateRange[0].format('YYYY-MM-DD');
        params.end_date = dateRange[1].format('YYYY-MM-DD');
      }

      const response = await api.get('/reports/dashboard/', { params });
      setReportData(response.data);
    } catch (error) {
      message.error('Failed to fetch report data.');
      setReportData(null); // Ensure it's null on failure
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const datePickerRanges = {
    'Last 7 Days': [dayjs().subtract(7, 'day'), dayjs()],
    'Last 30 Days': [dayjs().subtract(30, 'day'), dayjs()],
    'This Month': [dayjs().startOf('month'), dayjs().endOf('month')],
    'Last Month': [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')],
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!reportData) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Text type="danger">Could not load report data.</Text>
      </div>
    );
  }

  const { kpis, sales_over_time, top_products, sales_by_category } = reportData;

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={3} style={{ margin: 0 }}>Reports Dashboard</Title>
          <Text type="secondary">Overview of your store's performance</Text>
        </Col>
        <Col>
          <RangePicker value={dateRange} onChange={setDateRange} ranges={datePickerRanges} />
        </Col>
      </Row>

      {/* --- KPI Cards --- */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Total Revenue"
              value={kpis.total_revenue}
              precision={2}
              valueStyle={{ color: '#3f8600' }}
              prefix={<DollarCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Total Sales"
              value={kpis.total_sales}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="New Customers"
              value={kpis.new_customers}
              valueStyle={{ color: '#722ed1' }}
              prefix={<UsergroupAddOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Average Order Value"
              value={kpis.average_order_value}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* --- Main Charts --- */}
      <Card title="Sales Over Time" bordered={false} style={{ marginBottom: 24 }}>
        <RevenueTrendChart data={sales_over_time} />
      </Card>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card title="Top Selling Products by Revenue" bordered={false}>
            <TopProductsChart data={top_products} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Sales by Category" bordered={false}>
            <SalesByCategoryChart data={sales_by_category} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminReports;
