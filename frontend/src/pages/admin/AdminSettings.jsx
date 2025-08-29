// src/pages/admin/AdminSettings.jsx

import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
// --- THIS IS THE FIX (Part 1) ---
// We add 'Tabs' and 'Divider' and remove 'Select' and 'Modal'.
import {
  Card, Form, Input, Button, message,
  Row, Col, Typography, Upload, Spin, Switch, InputNumber,
  Tabs, Divider
} from 'antd';
import { UploadOutlined, SaveOutlined } from '@ant-design/icons';

const { Title } = Typography;

const AdminSettings = () => {
  // --- THIS IS THE FIX (Part 2) ---
  // The unused 'settings' state variable is removed.
  // We only need the form instance to manage the data.
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  
  const [logoFileList, setLogoFileList] = useState([]);
  const [faviconFileList, setFaviconFileList] = useState([]);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/settings/');
      // We don't need to store the settings in a separate state,
      // the Ant Design form instance will manage the data for us.
      form.setFieldsValue(response.data);
      
      if (response.data.logo) {
        setLogoFileList([{ uid: '-1', name: 'logo.png', status: 'done', url: response.data.logo }]);
      } else {
        setLogoFileList([]);
      }
      if (response.data.favicon) {
        setFaviconFileList([{ uid: '-1', name: 'favicon.ico', status: 'done', url: response.data.favicon }]);
      } else {
        setFaviconFileList([]);
      }
    } catch (error) { message.error('Failed to fetch settings'); }
    finally { setLoading(false); }
  }, [form]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleFormSubmit = async (values) => {
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        // Ensure boolean values are sent correctly
        if (typeof value === 'boolean') {
            formData.append(key, value);
        } else if (value !== null && value !== undefined) {
            formData.append(key, value);
        }
      });
      
      if (logoFileList.length > 0 && logoFileList[0].originFileObj) {
        formData.append('logo', logoFileList[0].originFileObj);
      } else if (logoFileList.length === 0) {
        formData.append('logo', '');
      }
      if (faviconFileList.length > 0 && faviconFileList[0].originFileObj) {
        formData.append('favicon', faviconFileList[0].originFileObj);
      } else if (faviconFileList.length === 0) {
        formData.append('favicon', '');
      }

      await api.put('/settings/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      message.success('Settings updated successfully!');
      fetchSettings();
    } catch (error) { message.error('Failed to update settings'); }
    finally { setSaving(false); }
  };
  
  if (loading) return <div style={{ textAlign: 'center', padding: '100px 0' }}><Spin size="large" /></div>;

  return (
    <div style={{ padding: 24, background: '#f0f2f5' }}>
      <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col><Title level={3} style={{ margin: 0 }}>System Settings</Title></Col>
          <Col><Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>Save All Settings</Button></Col>
        </Row>

        <Tabs defaultActiveKey="1" type="card" items={[
          { key: '1', label: 'Store Details', children: (
            <Card>
              <Row gutter={24}>
                <Col span={12}><Form.Item name="store_name" label="Store Name"><Input /></Form.Item></Col>
                <Col span={12}><Form.Item name="contact_email" label="Contact Email"><Input /></Form.Item></Col>
                <Col span={12}><Form.Item name="contact_phone" label="Contact Phone"><Input /></Form.Item></Col>
                <Col span={24}><Form.Item name="address" label="Store Address"><Input.TextArea rows={3} /></Form.Item></Col>
              </Row>
            </Card>
          )},
          { key: '2', label: 'Branding & SEO', children: (
            <Card>
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item name="logo_upload" label="Store Logo">
                    <Upload listType="picture" fileList={logoFileList} onChange={({ fileList }) => setLogoFileList(fileList)} beforeUpload={() => false} maxCount={1}>
                      <Button icon={<UploadOutlined />}>Upload Logo</Button>
                    </Upload>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="favicon_upload" label="Store Favicon">
                    <Upload listType="picture" fileList={faviconFileList} onChange={({ fileList }) => setFaviconFileList(fileList)} beforeUpload={() => false} maxCount={1}>
                      <Button icon={<UploadOutlined />}>Upload Favicon</Button>
                    </Upload>
                  </Form.Item>
                </Col>
                <Col span={24}><Form.Item name="global_meta_title" label="Global SEO Title"><Input /></Form.Item></Col>
                <Col span={24}><Form.Item name="global_meta_description" label="Global SEO Description"><Input.TextArea rows={2} /></Form.Item></Col>
              </Row>
            </Card>
          )},
          { key: '3', label: 'Payments', children: (
            <Card>
              <Title level={5}>PayPal</Title>
              <Row gutter={24} align="middle">
                <Col span={12}><Form.Item name="paypal_enabled" label="Enable PayPal" valuePropName="checked"><Switch /></Form.Item></Col>
                <Col span={12}><Form.Item name="paypal_sandbox_mode" label="PayPal Sandbox Mode" valuePropName="checked"><Switch /></Form.Item></Col>
                <Col span={12}><Form.Item name="paypal_client_id" label="PayPal Client ID"><Input.Password /></Form.Item></Col>
                <Col span={12}><Form.Item name="paypal_client_secret" label="PayPal Client Secret"><Input.Password /></Form.Item></Col>
              </Row>
              <Divider/>
              <Title level={5}>Direct Bank Transfer</Title>
              <Row gutter={24}>
                <Col span={24}><Form.Item name="direct_transfer_enabled" label="Enable Direct Transfer" valuePropName="checked"><Switch /></Form.Item></Col>
                <Col span={24}><Form.Item name="direct_transfer_instructions" label="Instructions & Bank Details"><Input.TextArea rows={6} /></Form.Item></Col>
              </Row>
            </Card>
          )},
          { key: '4', label: 'Shipping & Operations', children: (
            <Card>
              <Row gutter={24}>
                <Col span={12}><Form.Item name="base_shipping_rate" label="Base Shipping Rate"><InputNumber prefix="$" style={{ width: '100%' }} /></Form.Item></Col>
                <Col span={12}><Form.Item name="free_shipping_threshold" label="Free Shipping Threshold"><InputNumber prefix="$" style={{ width: '100%' }} /></Form.Item></Col>
                <Col span={24}><Divider/></Col>
                <Col span={24}><Form.Item name="maintenance_mode" label="Enable Maintenance Mode" valuePropName="checked"><Switch /></Form.Item></Col>
                <Col span={24}><Form.Item name="maintenance_mode_message" label="Maintenance Mode Message"><Input.TextArea rows={3} /></Form.Item></Col>
              </Row>
            </Card>
          )},
        ]} />
      </Form>
    </div>
  );
};

export default AdminSettings;