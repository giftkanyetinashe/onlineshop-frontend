// src/pages/admin/AdminProductDetail.jsx

import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Form, Input, Button, Select, Modal, message, Upload, Card, Row, Col,
  Table, Space, InputNumber, Switch, Image, Divider, Breadcrumb, Spin, Alert,
  Typography,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined,
  UploadOutlined, StarOutlined, StarFilled
} from '@ant-design/icons';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const { Option } = Select;
const { Title, Text } = Typography;

const AdminProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [currentVariant, setCurrentVariant] = useState(null);
  
  const [form] = Form.useForm();
  const [variantForm] = Form.useForm();

  const fetchProductData = useCallback(async () => {
    setLoading(true);
    try {
      const [productRes, categoriesRes, tagsRes, variantsRes] = await Promise.all([
        api.get(`/products/products/${slug}/`),
        api.get('/products/categories/?tree'),
        api.get('/products/tags/'),
        api.get(`/products/products/${slug}/variants/`),
      ]);
      const productData = productRes.data;
      setProduct(productData);
      setCategories(categoriesRes.data.categories || categoriesRes.data);
      setTags(tagsRes.data);
      setVariants(variantsRes.data.map(v => ({ ...v, key: v.id })));
      
      form.setFieldsValue({
        ...productData,
        category_id: productData.category?.id,
        tag_ids: productData.tags?.map(tag => tag.id),
        description: productData.description || '',
      });
    } catch (error) { message.error('Failed to fetch product data'); }
    finally { setLoading(false); }
  }, [slug, form]);

  useEffect(() => { fetchProductData(); }, [fetchProductData]);

  const handleDetailsSubmit = async (values) => {
    setSaving(true);
    try {
      const payload = { ...values, tag_ids: values.tag_ids || [] };
      const response = await api.put(`/products/products/${slug}/`, payload);
      message.success('Product details updated successfully');
      if (response.data.slug !== slug) {
        navigate(`/admin/products/${response.data.slug}`);
      } else {
        fetchProductData();
      }
    } catch (error) { message.error('Failed to update product details'); }
    finally { setSaving(false); }
  };
  
  // --- THIS IS THE FIX ---
  // A simplified and more robust function that always uses FormData
  const handleVariantSubmit = async (values) => {
    setSaving(true);
    try {
      const formData = new FormData();
      
      // Append all fields from the form. FormData handles conversion.
      Object.entries(values).forEach(([key, value]) => {
        if (key !== 'variant_image_upload' && value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      // Handle the image file specifically
      const imageUploadList = values.variant_image_upload;
      if (imageUploadList && imageUploadList.length > 0 && imageUploadList[0].originFileObj) {
        formData.append('variant_image', imageUploadList[0].originFileObj);
      } else if (!imageUploadList || imageUploadList.length === 0) {
        // If the user cleared the image, send an empty string to delete it.
        formData.append('variant_image', '');
      }
      // If the user didn't touch the uploader, we simply don't append the field,
      // and the backend will leave the image as is.

      const url = currentVariant
        ? `/products/products/${slug}/variants/${currentVariant.id}/`
        : `/products/products/${slug}/variants/`;
      const method = currentVariant ? 'patch' : 'post'; // PATCH is better for updates

      await api[method](url, formData, { headers: { 'Content-Type': 'multipart/form-data' } });

      message.success(`Variant ${currentVariant ? 'updated' : 'created'}!`);
      setVariantModalOpen(false);
      fetchProductData(); // Refetch all product data to stay in sync
    } catch (error) {
      const errorDetail = error.response?.data?.sku?.[0] || 'Failed to save variant. Check for unique SKU.';
      message.error(errorDetail);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async ({ file }) => {
    const formData = new FormData();
    formData.append('image', file);
    try {
      await api.post(`/products/products/${slug}/images/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      message.success('Image uploaded successfully');
      fetchProductData();
    } catch (error) { message.error('Image upload failed'); }
  };

  const handleImageDelete = (imageId) => {
    Modal.confirm({ title: 'Delete Image?', okText: 'Delete', okType: 'danger', async onOk() {
        try {
          await api.delete(`/products/products/${slug}/images/${imageId}/`);
          message.success('Image deleted');
          fetchProductData();
        } catch { message.error('Failed to delete image'); }
      }
    });
  };

  const handleSetDefaultImage = async (imageId) => {
    try {
      await api.patch(`/products/products/${slug}/images/${imageId}/set-default/`);
      message.success('Default image set');
      fetchProductData();
    } catch { message.error('Failed to set default image'); }
  };

  const showVariantEditModal = (variant) => {
    setCurrentVariant(variant);
    const imageList = variant.variant_image ? [{ uid: '-1', name: 'image.png', status: 'done', url: variant.variant_image }] : [];
    variantForm.setFieldsValue({ ...variant, variant_image_upload: imageList });
    setVariantModalOpen(true);
  };

  const showVariantAddModal = () => {
    setCurrentVariant(null);
    variantForm.resetFields();
    setVariantModalOpen(true);
  };

  const renderCategoryOptions = (cats, level = 0) => cats.map(cat => (
    <React.Fragment key={cat.id}>
      <Option value={cat.id} style={{ paddingLeft: `${level * 16}px` }}>{cat.name}</Option>
      {cat.children?.length > 0 && renderCategoryOptions(cat.children, level + 1)}
    </React.Fragment>
  ));
  
  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  if (!product) return <Alert message="Product not found." type="error" showIcon />;

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <Form form={form} layout="vertical" onFinish={handleDetailsSubmit}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Breadcrumb>
              <Breadcrumb.Item><Link to="/admin/products">Products</Link></Breadcrumb.Item>
              <Breadcrumb.Item>{product.name}</Breadcrumb.Item>
            </Breadcrumb>
            <Title level={3} style={{ marginTop: 8, marginBottom: 0 }}>{product.name}</Title>
          </Col>
          <Col><Space><Button onClick={() => navigate('/admin/products')}>Cancel</Button><Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>Save Changes</Button></Space></Col>
        </Row>
        <Row gutter={24}>
          <Col xs={24} lg={16}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Card title="Core Details"><Form.Item name="name" label="Product Name" rules={[{ required: true }]}><Input /></Form.Item><Form.Item name="slug" label="Slug (URL)" rules={[{ required: true }]}><Input /></Form.Item><Form.Item name="tagline" label="Tagline / Short Description"><Input /></Form.Item><Form.Item name="description" label="Full Description"><ReactQuill theme="snow" style={{ height: 250, marginBottom: 50 }} /></Form.Item></Card>
              <Card title="Product Images"><Upload listType="picture" customRequest={handleImageUpload} showUploadList={false}><Button icon={<UploadOutlined />}>Upload New Image</Button></Upload><Text type="secondary" style={{ marginTop: 8, display: 'block' }}>Click the star to set a default image.</Text><Row gutter={[16, 16]} style={{ marginTop: 16 }}>{product.images.map(img => (<Col key={img.id} xs={12} sm={8} md={6}><Card hoverable cover={<Image height={150} style={{ objectFit: 'contain' }} src={img.image} />} size="small" actions={[<Button key="default" type="text" shape="circle" icon={img.is_default ? <StarFilled style={{color: '#faad14'}} /> : <StarOutlined/>} onClick={() => handleSetDefaultImage(img.id)} />, <Button key="delete" type="text" danger shape="circle" icon={<DeleteOutlined />} onClick={() => handleImageDelete(img.id)} />]} /></Col>))}</Row></Card>
              <Card title="Product Variants" extra={<Button icon={<PlusOutlined />} onClick={showVariantAddModal}>Add Variant</Button>}><Table dataSource={variants} rowKey="id" pagination={false} size="small"><Table.Column title="Image" dataIndex="variant_image" render={(img) => img ? <Image src={img} width={50} height={50} style={{ objectFit: 'contain' }}/> : <div style={{width: 50, height: 50, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Text type="secondary">N/A</Text></div>} /><Table.Column title="SKU" dataIndex="sku" /><Table.Column title="Size" dataIndex="size" /><Table.Column title="Shade" dataIndex="shade_name" /><Table.Column title="Price" dataIndex="price" render={(text) => `$${text}`} /><Table.Column title="Stock" dataIndex="stock" /><Table.Column title="Actions" render={(_, record) => <Button icon={<EditOutlined />} onClick={() => showVariantEditModal(record)} />} /></Table></Card>
            </Space>
          </Col>
          <Col xs={24} lg={8}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Card title="Organization"><Form.Item name="is_active" valuePropName="checked"><Switch checkedChildren="Active" unCheckedChildren="Inactive" /></Form.Item><Divider/><Form.Item name="brand" label="Brand"><Input /></Form.Item><Form.Item name="category_id" label="Category" rules={[{ required: true }]}><Select showSearch optionFilterProp="children">{renderCategoryOptions(categories)}</Select></Form.Item><Form.Item name="tag_ids" label="Tags"><Select mode="multiple" allowClear placeholder="Select tags">{tags.map(tag => <Option key={tag.id} value={tag.id}>{tag.name}</Option>)}</Select></Form.Item><Form.Item name="is_featured" label="Featured Product" valuePropName="checked"><Switch /></Form.Item></Card>
              <Card title="Content"><Form.Item name="how_to_use" label="How to Use"><Input.TextArea rows={4} /></Form.Item><Form.Item name="ingredients" label="Ingredients"><Input.TextArea rows={4} /></Form.Item></Card>
              <Card title="Cosmetics Details"><Form.Item name="skin_types" label="Skin Types"><Input placeholder="e.g., Oily, Dry, Combination" /></Form.Item><Form.Item name="skin_concerns" label="Skin Concerns"><Input placeholder="e.g., Acne, Fine Lines" /></Form.Item><Form.Item name="finish" label="Finish"><Input placeholder="e.g., Matte, Dewy, Satin" /></Form.Item><Form.Item name="coverage" label="Coverage"><Input placeholder="e.g., Light, Medium, Full" /></Form.Item></Card>
              <Card title="SEO"><Form.Item name="meta_title" label="SEO Meta Title"><Input /></Form.Item><Form.Item name="meta_description" label="SEO Meta Description"><Input.TextArea rows={2} /></Form.Item></Card>
            </Space>
          </Col>
        </Row>
      </Form>
      <Modal title={currentVariant ? 'Edit Variant' : 'Add Variant'} open={variantModalOpen} onCancel={() => setVariantModalOpen(false)} footer={null} width={900} destroyOnClose>
        <Form form={variantForm} layout="vertical" onFinish={handleVariantSubmit}>
          <Title level={5}>Attributes</Title>
          <Row gutter={16}><Col span={8}><Form.Item name="size" label="Size (e.g., 30ml)"><Input /></Form.Item></Col><Col span={8}><Form.Item name="shade_name" label="Shade Name"><Input /></Form.Item></Col><Col span={8}><Form.Item name="shade_hex_color" label="Shade Hex Color"><Input type="color" style={{ width: '100%', height: '32px' }} /></Form.Item></Col></Row>
          <Divider>Pricing & Inventory</Divider>
          <Row gutter={16}><Col span={8}><Form.Item name="sku" label="SKU" rules={[{ required: true }]}><Input /></Form.Item></Col><Col span={8}><Form.Item name="upc" label="UPC (Barcode)"><Input /></Form.Item></Col><Col span={8}><Form.Item name="price" label="Price" rules={[{ required: true }]}><InputNumber prefix="$" style={{ width: '100%' }} /></Form.Item></Col><Col span={8}><Form.Item name="discount_price" label="Discount Price"><InputNumber prefix="$" style={{ width: '100%' }} /></Form.Item></Col><Col span={8}><Form.Item name="stock" label="Stock" initialValue={0} rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item></Col><Col span={8}><Form.Item name="low_stock_threshold" label="Low Stock Threshold" initialValue={10}><InputNumber style={{ width: '100%' }} /></Form.Item></Col></Row>
          <Divider>Shipping</Divider>
          <Row gutter={16}><Col span={8}><Form.Item name="weight_grams" label="Weight (grams)"><InputNumber style={{ width: '100%' }} /></Form.Item></Col></Row>
          <Divider>Variant Image</Divider>
          <Row gutter={24}><Col xs={24}><Form.Item name="variant_image_upload" label="Upload or Change Variant Image" valuePropName="fileList" getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList}><Upload listType="picture-card" maxCount={1} beforeUpload={() => false}><div><PlusOutlined /><div>Upload New</div></div></Upload></Form.Item></Col></Row>
          <Form.Item><Button type="primary" htmlType="submit" loading={saving}>{currentVariant ? 'Update Variant' : 'Create Variant'}</Button></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminProductDetail;