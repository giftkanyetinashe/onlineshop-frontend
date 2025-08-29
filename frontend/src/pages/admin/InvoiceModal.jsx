// src/components/InvoiceModal.jsx
import React from 'react';
import { Modal, Button, Typography, Divider, Row, Col, Descriptions,Tag } from 'antd';
import { PrinterOutlined, DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const InvoiceModal = ({ visible, onCancel, order }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      title={`Invoice #${order?.order_number}`}
      visible={visible}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="back" onClick={onCancel}>
          Close
        </Button>,
        <Button key="download" icon={<DownloadOutlined />}>
          Download PDF
        </Button>,
        <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={handlePrint}>
          Print
        </Button>,
      ]}
    >
      <div style={{ padding: 24 }} id="invoice-content">
        <Row justify="space-between" align="bottom">
          <Col>
            <Title level={3} style={{ marginBottom: 0 }}>Your Company</Title>
            <Text type="secondary">123 Beauty Street, Cosmetic City</Text>
          </Col>
          <Col>
            <Title level={4} style={{ marginBottom: 0 }}>
              Invoice #{order?.order_number}
            </Title>
            <Text type="secondary">
              Date: {dayjs().format('MMMM D, YYYY')}
            </Text>
          </Col>
        </Row>

        <Divider />

        <Row gutter={24} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <Text strong>Bill To:</Text>
            <div>
              <Text>{order?.user.first_name} {order?.user.last_name}</Text>
            </div>
            <div>
              <Text>{order?.billing_address}</Text>
            </div>
            <div>
              <Text>{order?.user.email}</Text>
            </div>
          </Col>
          <Col span={12}>
            <Text strong>Ship To:</Text>
            <div>
              <Text>{order?.user.first_name} {order?.user.last_name}</Text>
            </div>
            <div>
              <Text>{order?.shipping_address}</Text>
            </div>
          </Col>
        </Row>

        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Order Date">
            {dayjs(order?.created_at).format('MMMM D, YYYY')}
          </Descriptions.Item>
          <Descriptions.Item label="Payment Method">
            {order?.payment_method}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={order?.payment_status ? 'green' : 'red'}>
              {order?.payment_status ? 'Paid' : 'Unpaid'}
            </Tag>
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        {/* Invoice items table would go here */}

        <Divider />

        <Row justify="end">
          <Col span={8}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Subtotal">
                ${(order?.total_price - (order?.shipping_cost || 0) + (order?.discount_amount || 0)).toFixed(2)}
              </Descriptions.Item>
              {order?.discount_amount > 0 && (
                <Descriptions.Item label={`Discount (${order?.promo_code})`}>
                  -${order?.discount_amount.toFixed(2)}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Shipping">
                ${(order?.shipping_cost || 0).toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="Total">
                <Text strong>${order?.total_price.toFixed(2)}</Text>
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </div>
    </Modal>
  );
};

export default InvoiceModal;