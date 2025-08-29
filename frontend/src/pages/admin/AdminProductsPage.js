import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Table, Form, Input, Button, Select, Modal, message, Tag, Space, InputNumber, Switch, Card, Row, Col, Typography, Tabs, Image, Statistic } from 'antd';
import { PlusOutlined, FolderOpenOutlined, MinusCircleOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Upload } from 'antd';

const { Option } = Select;
const { Title, Text } = Typography;

const AdminProductsPage = () => {
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [filters, setFilters] = useState({ search: '', category: 'all', status: 'all' });
  const [form] = Form.useForm();

  // --- Data Fetching ---
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/products/products/');
      const productsData = response.data.map(p => ({ ...p, key: p.id }));
      setAllProducts(productsData);
      setFilteredProducts(productsData);
    } catch (error) { message.error('Failed to fetch products'); }
    finally { setLoading(false); }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('/products/categories/?tree');
      setCategories(response.data.categories || response.data);
    } catch (error) { message.error('Failed to fetch categories'); }
  }, []);
  
  const fetchTags = useCallback(async () => {
    try {
      const response = await api.get('/products/tags/');
      setTags(response.data);
    } catch (error) { message.error('Failed to fetch tags'); }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchTags();
  }, [fetchProducts, fetchCategories, fetchTags]);
  
  // --- Filtering Logic ---
  useEffect(() => {
    let data = [...allProducts];
    if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        data = data.filter(p => p.name.toLowerCase().includes(searchTerm) || p.brand?.toLowerCase().includes(searchTerm));
    }
    if (filters.category !== 'all') {
        data = data.filter(p => p.category?.id === filters.category);
    }
    if (filters.status !== 'all') {
        data = data.filter(p => p.is_active === (filters.status === 'active'));
    }
    setFilteredProducts(data);
  }, [filters, allProducts]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  // --- Form Handlers ---
  const handleAddProduct = () => {
    form.resetFields();
    form.setFieldsValue({ is_active: true, is_featured: false });
    setModalOpen(true);
  };
  
  const handleFormSubmit = async (values) => {
    setLoading(true);
    
    // Prepare form data for potential file uploads
    const formData = new FormData();
    
    // Append all product fields except variants
    Object.entries(values).forEach(([key, value]) => {
      if (key !== 'variants' && value !== undefined) {
        if (key === 'tag_ids') {
          value.forEach(tagId => formData.append('tags', tagId));
        } else {
          formData.append(key, value);
        }
      }
    });
    
    // Handle variants
    if (values.variants) {
      values.variants.forEach((variant, index) => {
        Object.entries(variant).forEach(([vKey, vValue]) => {
          if (vKey === 'variant_image_upload' && vValue && vValue.length > 0) {
            formData.append(`variants[${index}].variant_image`, vValue[0].originFileObj);
          } else if (vKey !== 'variant_image_upload' && vValue !== undefined) {
            formData.append(`variants[${index}].${vKey}`, vValue);
          }
        });
      });
    }

    try {
      await api.post('/products/products/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      message.success('Product created successfully');
      setModalOpen(false);
      fetchProducts();
    } catch (error) {
      let errorDetail = 'An error occurred. Please check all fields.';
      if (error.response?.data) {
          const errors = error.response.data;
          const firstKey = Object.keys(errors)[0];
          if (Array.isArray(errors[firstKey])) {
              errorDetail = `${firstKey}: ${errors[firstKey][0]}`;
          } else {
              errorDetail = errors.detail || errorDetail;
          }
      }
      message.error(errorDetail);
    } finally {
      setLoading(false);
    }
  };

  const renderCategoryOptions = (cats, level = 0) =>
    cats.flatMap(cat => [
      <Option key={cat.id} value={cat.id} style={{ paddingLeft: `${level * 16}px` }}>{cat.name}</Option>,
      ...(cat.children?.length > 0 ? renderCategoryOptions(cat.children, level + 1) : [])
    ]);
  
  // --- Product Stats ---
  const stats = useMemo(() => ({
      total: allProducts.length,
      active: allProducts.filter(p => p.is_active).length,
      onSale: allProducts.filter(p => p.variants.some(v => v.discount_price && parseFloat(v.discount_price) > 0)).length,
  }), [allProducts]);

  // --- Table Columns ---
  const columns = [
    { title: 'Image', dataIndex: 'images', key: 'image', width: 80, render: (images) => {
        const primaryImage = images?.find(img => img.is_default) || images?.[0];
        return primaryImage ? <Image src={primaryImage.image} alt="Product" width={50} height={50} style={{objectFit: 'contain'}} /> : <div style={{ width: 50, height: 50, backgroundColor: '#f0f0f0' }} />;
      },
    },
    { title: 'Name', dataIndex: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
    { title: 'Brand', dataIndex: 'brand' },
    { title: 'Category', dataIndex: 'category', render: (cat) => cat?.name },
    { title: 'Price', dataIndex: 'variants', render: (variants) => {
        const defaultVariant = variants?.[0];
        if (!defaultVariant) return 'N/A';
        const hasDiscount = defaultVariant.discount_price && parseFloat(defaultVariant.discount_price) < parseFloat(defaultVariant.price);
        return hasDiscount ? (
            <Space direction="vertical" size={0}>
                <Text strong style={{color: '#cf1322'}}>${defaultVariant.discount_price}</Text>
                <Text delete type="secondary">${defaultVariant.price}</Text>
            </Space>
        ) : `$${defaultVariant.price}`;
    }},
    { title: 'Status', dataIndex: 'is_active', render: (isActive) => <Tag color={isActive ? 'green' : 'red'}>{isActive ? 'Active' : 'Inactive'}</Tag> },
    { title: 'Actions', key: 'actions', render: (_, record) => (
        <Button icon={<FolderOpenOutlined />} onClick={() => navigate(`/admin/products/${record.slug}`)}>Manage</Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#f0f2f5' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col><Title level={3}>Product Management</Title></Col>
          <Col><Button type="primary" icon={<PlusOutlined />} onClick={handleAddProduct}>Add New Product</Button></Col>
      </Row>
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16}>
            <Col><Statistic title="Total Products" value={stats.total} /></Col>
            <Col><Statistic title="Active Products" value={stats.active} /></Col>
            <Col><Statistic title="Products on Sale" value={stats.onSale} /></Col>
        </Row>
      </Card>
      <Card>
        <Space style={{ marginBottom: 16 }}>
            <Input.Search placeholder="Search by name or brand..." onSearch={(value) => handleFilterChange('search', value)} allowClear style={{width: 300}}/>
            <Select placeholder="Filter by Category" onChange={(value) => handleFilterChange('category', value)} style={{width: 200}} allowClear>
                <Option value="all">All Categories</Option>
                {renderCategoryOptions(categories)}
            </Select>
            <Select placeholder="Filter by Status" onChange={(value) => handleFilterChange('status', value)} style={{width: 150}} defaultValue="all">
                <Option value="all">All Statuses</Option>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
            </Select>
        </Space>
        <Table columns={columns} dataSource={filteredProducts} loading={loading} rowKey="id" />
      </Card>

      <Modal 
        title="Add New Product" 
        open={modalOpen} 
        onCancel={() => setModalOpen(false)} 
        footer={null} 
        width={1000} 
        destroyOnClose
        maskClosable={false}
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Tabs defaultActiveKey="1">
            <Tabs.TabPane tab="Core Info" key="1">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="name" label="Product Name" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="slug" label="Slug (URL)" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="brand" label="Brand">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="category_id" label="Category" rules={[{ required: true }]}>
                    <Select showSearch optionFilterProp="children">
                      {renderCategoryOptions(categories)}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="tagline" label="Tagline / Short Description">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
            </Tabs.TabPane>
            <Tabs.TabPane tab="Content" key="2">
              <Form.Item name="description" label="Full Description">
                <ReactQuill theme="snow" style={{ height: 200, marginBottom: 50 }} />
              </Form.Item>
              <Form.Item name="how_to_use" label="How to Use">
                <Input.TextArea rows={4} />
              </Form.Item>
              <Form.Item name="ingredients" label="Ingredients">
                <Input.TextArea rows={4} />
              </Form.Item>
            </Tabs.TabPane>
            <Tabs.TabPane tab="Cosmetics Details" key="3">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="skin_types" label="Skin Types (comma-separated)">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="skin_concerns" label="Skin Concerns (comma-separated)">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="finish" label="Finish (e.g., Matte, Dewy)">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="coverage" label="Coverage (e.g., Light, Full)">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
            </Tabs.TabPane>
            <Tabs.TabPane tab="Initial Variants" key="4">
              <Typography.Text type="secondary">
                Add at least one variant. The first variant's price will set the main display price.
              </Typography.Text>
              <Form.List 
                name="variants"
                rules={[
                  {
                    validator: async (_, variants) => {
                      if (!variants || variants.length < 1) {
                        return Promise.reject(new Error('At least one variant is required'));
                      }
                    },
                  },
                ]}
              >
                {(fields, { add, remove }) => (
                  <div style={{ marginTop: 16 }}>
                    {fields.map(({ key, name, ...restField }) => (
                      <Card size="small" key={key} style={{ marginBottom: 8 }} bodyStyle={{ padding: '12px' }}>
                        <Space align="baseline" wrap>
                          <Form.Item {...restField} name={[name, 'size']}>
                            <Input placeholder="Size (e.g., 30ml)" />
                          </Form.Item>
                          <Form.Item {...restField} name={[name, 'shade_name']}>
                            <Input placeholder="Shade Name" />
                          </Form.Item>
                          <Form.Item {...restField} name={[name, 'shade_hex_color']}>
                            <Input type="color" style={{ width: 60 }} />
                          </Form.Item>
                          <Form.Item 
                            {...restField} 
                            name={[name, 'sku']} 
                            rules={[{ required: true, message: 'SKU is required' }]}
                          >
                            <Input placeholder="SKU" />
                          </Form.Item>
                          <Form.Item 
                            {...restField} 
                            name={[name, 'price']} 
                            rules={[{ required: true, message: 'Price is required' }]}
                          >
                            <InputNumber prefix="$" placeholder="Price" min={0} />
                          </Form.Item>
                          <Form.Item {...restField} name={[name, 'discount_price']}>
                            <InputNumber prefix="$" placeholder="Discount Price" min={0} />
                          </Form.Item>
                          <Form.Item {...restField} name={[name, 'stock']} initialValue={0}>
                            <InputNumber placeholder="Stock" min={0} />
                          </Form.Item>
                          <Form.Item {...restField} name={[name, 'low_stock_threshold']} initialValue={10}>
                            <InputNumber placeholder="Low Stock Alert" min={0} />
                          </Form.Item>
                          <Form.Item {...restField} name={[name, 'upc']}>
                            <Input placeholder="UPC" />
                          </Form.Item>
                          <Form.Item {...restField} name={[name, 'weight_grams']}>
                            <InputNumber placeholder="Weight (g)" min={0} />
                          </Form.Item>
                          <Form.Item {...restField} name={[name, 'variant_image_upload']} label="Variant Image">
                            <Upload
                              listType="picture-card"
                              maxCount={1}
                              beforeUpload={() => false}
                              accept="image/*"
                            >
                              <div><PlusOutlined /><div>Upload</div></div>
                            </Upload>
                          </Form.Item>
                          <MinusCircleOutlined 
                            onClick={() => remove(name)} 
                            style={{ color: 'red', marginLeft: 8 }} 
                          />
                        </Space>
                      </Card>
                    ))}
                    <Form.Item>
                      <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                        Add Variant
                      </Button>
                    </Form.Item>
                  </div>
                )}
              </Form.List>
            </Tabs.TabPane>
            <Tabs.TabPane tab="Settings & SEO" key="5">
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item name="tag_ids" label="Tags">
                    <Select mode="multiple" allowClear placeholder="Select tags">
                      {tags.map(tag => <Option key={tag.id} value={tag.id}>{tag.name}</Option>)}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="is_active" label="Active" valuePropName="checked">
                    <Switch defaultChecked />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="is_featured" label="Featured" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="meta_title" label="SEO Meta Title">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="meta_description" label="SEO Meta Description">
                    <Input.TextArea />
                  </Form.Item>
                </Col>
              </Row>
            </Tabs.TabPane>
          </Tabs>
          <Form.Item style={{ marginTop: 24, textAlign: 'right' }}>
            <Button type="primary" htmlType="submit" loading={loading}>
              Create Product
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminProductsPage;