import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Form,
  Input,
  Button,
  Select,
  Modal,
  message,
  Upload,
  Card,
  Row,
  Col,
  Tag,
  Space,
  InputNumber,
  Switch,
  Image,
  Tabs,
  Table,
  Breadcrumb
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  PlusOutlined,
  ArrowLeftOutlined,
  SaveOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { Option} = Select;

const AdminProductDetail = () => {
  const { slug } = useParams();
  const { authState } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  //const [variantForm] = Form.useForm();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [variants, setVariants] = useState([]);
  const [variantModalVisible, setVariantModalVisible] = useState(false);
  const [currentVariant, setCurrentVariant] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  const findCategoryInTree = React.useCallback((categories, targetSlugOrId) => {
    for (const category of categories) {
      // Check current category
      if (category.slug === targetSlugOrId || category.id === targetSlugOrId) {
        return category;
      }
  
      // Check children recursively
      if (category.children && category.children.length > 0) {
        const foundInChildren = findCategoryInTree(category.children, targetSlugOrId);
        if (foundInChildren) return foundInChildren;
      }
    }
    return null;
  }, []);

// Helper function to flatten nested categories
  const flattenCategories = React.useCallback((categories) => {
    let result = [];
    
    categories.forEach(category => {
      // Add the parent category
      result.push(category);
      
      // Recursively add children
      if (category.children && category.children.length > 0) {
        result = [...result, ...flattenCategories(category.children)];
      }
    });
    
    return result;
  }, []);

  const renderCategoryOptions = (categories, level = 0) => {
    return categories.map(category => (
      <React.Fragment key={category.id}>
        {/* Current category */}
        <Option
          value={category.slug}
          style={{
            paddingLeft: `${16 + (level * 16)}px`,
            fontWeight: level === 0 ? 'bold' : 'normal'
          }}
        >
          {category.name}
        </Option>

        {/* Recursively render children */}
        {category.children && category.children.length > 0 && (
          renderCategoryOptions(category.children, level + 1)
        )}
      </React.Fragment>
    ));
  };

  // 1. First: fetch data and set state (NO form.setFieldsValue here)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productRes, categoriesRes, variantsRes] = await Promise.all([
          api.get(`/products/products/${slug}/`, {
            headers: { Authorization: `Bearer ${authState.access_token}` }
          }),
          api.get('/products/categories/?include_subcategories=true', {
            headers: { Authorization: `Bearer ${authState.access_token}` }
          }),
          api.get(`/products/products/${slug}/variants/`, {
            headers: { Authorization: `Bearer ${authState.access_token}` }
          })
        ]);
        console.log('Fetched categories:', categoriesRes.data); // Debug log
        setProduct(productRes.data);
        setCategories(categoriesRes.data.categories || categoriesRes.data);
        setVariants(variantsRes.data);
      } catch (error) {
        message.error('Failed to fetch product data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, authState.access_token]);


  // 2. Second: AFTER product is available and form is mounted, set form fields
  useEffect(() => {
    if (product && categories.length > 0) {
      const selectedCategory = findCategoryInTree(
        categories,
        product.category?.slug || product.category?.id || product.category
      );

      form.setFieldsValue({
        ...product,
        category: selectedCategory?.slug || product.category?.slug || product.category
      });
    }
  }, [product, categories, form, findCategoryInTree]);

  // Handle product form submission
  const handleSubmit = async (values) => {
    try {
      setSaving(true);

      // Find the selected category in the full tree
      const selectedCategory = findCategoryInTree(categories, values.category);

      if (!selectedCategory) {
        throw new Error(`Selected category not found. Value was: ${values.category}`);
      }

      // Prepare the data to send
      const dataToSend = {
        ...values,
        discount_price: values.discount_price || null,
        brand: values.brand || '',
        is_featured: values.is_featured || false,
        is_active: values.is_active !== false,
        category_id: selectedCategory.id, // Send category ID to the API
      };

      console.log('Submitting:', dataToSend); // Debug log

      await api.put(`/products/products/${slug}/`, dataToSend, {
        headers: { Authorization: `Bearer ${authState.access_token}` }
      });

      message.success('Product updated successfully');

      // Refresh product data
      const res = await api.get(`/products/products/${slug}/`, {
        headers: { Authorization: `Bearer ${authState.access_token}` }
      });
      setProduct(res.data);

    } catch (error) {
      console.error('Update error:', error.response?.data || error.message || error);
      message.error(
        error.response?.data?.message || 
        error.message || 
        'Failed to update product'
      );
    } finally {
      setSaving(false);
    }
  };
  // Handle variant form submission
  const handleVariantSubmit = async (values) => {
    try {
      setSaving(true);
      const formData = new FormData();
      
      Object.entries(values).forEach(([key, value]) => {
        if (key !== 'variant_image' && value !== undefined) {
          formData.append(key, value);
        }
      });
  
      if (values.variant_image && values.variant_image[0]?.originFileObj) {
        formData.append('variant_image', values.variant_image[0].originFileObj);
      }
  
      if (currentVariant) {
        await api.put(`/products/products/${slug}/variants/${currentVariant.id}/`, formData, {
          headers: {
            Authorization: `Bearer ${authState.access_token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        message.success('Variant updated successfully');
      } else {
        formData.append('product', product.id);
        await api.post(`/products/products/${slug}/variants/`, formData, {
          headers: {
            Authorization: `Bearer ${authState.access_token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        message.success('Variant created successfully');
      }
  
      // Refresh variants
      const res = await api.get(`/products/products/${slug}/variants/`, {
        headers: { Authorization: `Bearer ${authState.access_token}` }
      });
      setVariants(res.data);
      setVariantModalVisible(false);
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to save variant');
    } finally {
      setSaving(false);
    }
  };

  // Delete a variant
  const deleteVariant = async (id) => {
    Modal.confirm({
      title: 'Delete Variant',
      content: 'Are you sure you want to delete this variant?',
      onOk: async () => {
        try {
          await api.delete(`/products/variants/${id}/`, {
            headers: { Authorization: `Bearer ${authState.access_token}` }
          });
          message.success('Variant deleted successfully');
          const res = await api.get(`/products/products/${slug}/variants/`, {
            headers: { Authorization: `Bearer ${authState.access_token}` }
          });
          setVariants(res.data);
        } catch (error) {
          message.error('Failed to delete variant');
        }
      }
    });
  };

  // Image handling functions
  const handleImageUpload = async (file) => {
    try {
      setImageUploading(true);
      const formData = new FormData();
      formData.append('image', file);
      formData.append('product', product.id);
      
      await api.post(`/products/products/${slug}/images/`, formData, {
        headers: {
          Authorization: `Bearer ${authState.access_token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      message.success('Image uploaded successfully');
      refreshProductData();
    } catch (error) {
      message.error('Failed to upload image');
    } finally {
      setImageUploading(false);
    }
  };

  const setDefaultImage = async (imageId) => {
    try {
      await api.patch(`/products/products/${slug}/images/${imageId}/`, { is_default: true }, {
        headers: { Authorization: `Bearer ${authState.access_token}` }
      });
      message.success('Default image updated');
      refreshProductData();
    } catch (error) {
      message.error('Failed to set default image');
    }
  };

  const handleReplaceImage = async (imageId, file) => {
    try {
      setImageUploading(true);
      await api.delete(`/products/products/${slug}/images/${imageId}/`, {
        headers: { Authorization: `Bearer ${authState.access_token}` }
      });
      
      const formData = new FormData();
      formData.append('image', file);
      formData.append('product', product.id);
      
      await api.post(`/products/products/${slug}/images/`, formData, {
        headers: {
          Authorization: `Bearer ${authState.access_token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      message.success('Image replaced successfully');
      refreshProductData();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to replace image');
    } finally {
      setImageUploading(false);
    }
  };

  const deleteImage = async (imageId) => {
    Modal.confirm({
      title: 'Delete Image',
      content: 'Are you sure you want to delete this image?',
      onOk: async () => {
        try {
          await api.delete(`/products/products/${slug}/images/${imageId}/`, {
            headers: { Authorization: `Bearer ${authState.access_token}` }
          });
          message.success('Image deleted successfully');
          refreshProductData();
        } catch (error) {
          message.error('Failed to delete image');
        }
      }
    });
  };

  const refreshProductData = async () => {
    const res = await api.get(`/products/products/${slug}/`, {
      headers: { Authorization: `Bearer ${authState.access_token}` }
    });
    setProduct(res.data);
  };

  // Variant columns for table
  const variantColumns = [
    {
      title: 'Color',
      dataIndex: 'color',
      key: 'color',
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      render: (size) => {
        switch (size) {
          case 'XS': return 'Extra Small';
          case 'S': return 'Small';
          case 'M': return 'Medium';
          case 'L': return 'Large';
          case 'XL': return 'Extra Large';
          case 'XXL': return 'Extra Extra Large';
          default: return size;
        }
      },
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
    },
    {
      title: 'Image',
      dataIndex: 'variant_image',
      key: 'variant_image',
      render: (image) => image ? (
        <Image
          src={image}
          width={50}
          height={50}
          style={{ objectFit: 'cover' }}
          preview={false}
        />
      ) : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setCurrentVariant(record);
              setVariantModalVisible(true);
            }}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => deleteVariant(record.id)}
          />
        </Space>
      ),
    },
  ];

  if (loading && !product) {
    return <div>Loading...</div>;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className="admin-product-detail">
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          {
            title: (
              <button
                onClick={() => navigate('/admin/products')}
                style={{ background: 'none', border: 'none', color: '#1890ff', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
              >
                Products
              </button>
            ),
          },
          {
            title: product.name,
          },
        ]}
      />

      <Button 
        type="text" 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/admin/products')}
        style={{ marginBottom: 16 }}
      >
        Back to Products
      </Button>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'details',
            label: 'Details',
            children: (
              <Card
                title="Product Information"
                loading={loading}
                extra={
                  <Space>
                    <Tag color={product.is_active ? 'green' : 'red'}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </Tag>
                    {product.is_featured && <Tag color="gold">Featured</Tag>}
                  </Space>
                }
              >
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
                  initialValues={{
                    ...product,
                    category: product.category?.slug || product.category
                  }}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="name"
                        label="Product Name"
                        rules={[{ required: true, message: 'Please enter product name' }]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="slug"
                        label="Slug"
                        rules={[{ required: true, message: 'Please enter slug' }]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item
                    name="description"
                    label="Description"
                    rules={[{ required: true, message: 'Please enter description' }]}
                  >
                    <TextArea rows={4} />
                  </Form.Item>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item
                        name="category"
                        label="Category"
                        rules={[{ required: true, message: 'Please select category' }]}
                      >
                        <Select
                          showSearch
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            option.children.toLowerCase().includes(input.toLowerCase())
                          }
                          loading={categories.length === 0}
                          dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                        >
                          {renderCategoryOptions(categories)}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="gender"
                        label="Gender"
                        rules={[{ required: true }]}
                      >
                        <Select>
                          <Option value="M">Male</Option>
                          <Option value="F">Female</Option>
                          <Option value="U">Unisex</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="brand"
                        label="Brand"
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="price"
                        label="Price"
                        rules={[{ required: true, message: 'Please enter price' }]}
                      >
                        <InputNumber
                          style={{ width: '100%' }}
                          min={0}
                          step={0.01}
                          formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="discount_price"
                        label="Discount Price"
                      >
                        <InputNumber
                          style={{ width: '100%' }}
                          min={0}
                          step={0.01}
                          formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="is_featured"
                        label="Featured"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="is_active"
                        label="Active"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={saving}
                      icon={<SaveOutlined />}
                    >
                      Save Changes
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            ),
          },
          {
            key: 'images',
            label: 'Images',
            children: (
              <Card
                title="Product Images"
                loading={loading}
                extra={
                  <Upload
                    name="image"
                    accept="image/*"
                    showUploadList={false}
                    beforeUpload={(file) => {
                      handleImageUpload(file);
                      return false;
                    }}
                    disabled={imageUploading}
                  >
                    <Button 
                      type="primary" 
                      icon={<UploadOutlined />}
                      loading={imageUploading}
                    >
                      Upload Image
                    </Button>
                  </Upload>
                }
              >
                <Row gutter={[16, 16]}>
                  {product.images?.map((image) => (
                    <Col key={image.id} xs={24} sm={12} md={8} lg={6}>
                      <Card
                        cover={
                          <Image
                            src={image.image}
                            height={200}
                            style={{ objectFit: 'contain' }}
                          />
                        }
                        actions={[
                          <Switch
                            key="default"
                            checked={image.is_default}
                            onChange={() => setDefaultImage(image.id)}
                            checkedChildren="Default"
                            unCheckedChildren="Set Default"
                          />,
                          <Button
                            key="replace"
                            icon={<EditOutlined />}
                            onClick={() => {
                              const fileInput = document.createElement('input');
                              fileInput.type = 'file';
                              fileInput.accept = 'image/*';
                              fileInput.onchange = async (e) => {
                                const file = e.target.files[0];
                                if (file) await handleReplaceImage(image.id, file);
                              };
                              fileInput.click();
                            }}
                          />,
                          <Button
                            key="delete"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => deleteImage(image.id)}
                          />
                        ]}
                      >
                        <Card.Meta
                          title={image.is_default ? 'Default Image' : 'Product Image'}
                          description={`Uploaded: ${new Date(image.created_at).toLocaleDateString()}`}
                        />
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card>
            ),
          },
          {
            key: 'variants',
            label: 'Variants',
            children: (
              <Card
                title="Product Variants"
                loading={loading}
                extra={
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setCurrentVariant(null);
                      setVariantModalVisible(true);
                    }}
                  >
                    Add Variant
                  </Button>
                }
              >
                <Table
                  columns={variantColumns}
                  dataSource={variants}
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            ),
          },
        ]}
      />

      {/* Variant Modal */}
      <Modal
        title={currentVariant ? 'Edit Variant' : 'Add Variant'}
        open={variantModalVisible}
        onCancel={() => setVariantModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form
        
          layout="vertical"
          onFinish={handleVariantSubmit}
          initialValues={currentVariant || {}}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="color"
                label="Color"
                rules={[{ required: true, message: 'Please enter color' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="size"
                label="Size"
                rules={[{ required: true, message: 'Please select size' }]}
              >
                <Select>
                  <Option value="XS">Extra Small</Option>
                  <Option value="S">Small</Option>
                  <Option value="M">Medium</Option>
                  <Option value="L">Large</Option>
                  <Option value="XL">Extra Large</Option>
                  <Option value="XXL">Extra Extra Large</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="sku"
                label="SKU"
                rules={[{ required: true, message: 'Please enter SKU' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="stock"
                label="Stock"
                rules={[{ required: true, message: 'Please enter stock quantity' }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="variant_image"
            label="Variant Image"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) return e;
              return e?.fileList || [];
            }}
          >
            <Upload
              name="variant_image"
              listType="picture-card"
              beforeUpload={() => false} // prevent auto-upload
              maxCount={1}
              onChange={({ fileList }) => {
                // Update preview manually if needed
              }}
            >
              {form.getFieldValue('variant_image')?.length ? (
                <img
                  src={
                    form.getFieldValue('variant_image')[0]?.url ||
                    URL.createObjectURL(form.getFieldValue('variant_image')[0]?.originFileObj)
                  }
                  alt="variant"
                  style={{ width: '100%' }}
                />
              ) : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={saving}
              icon={<SaveOutlined />}
            >
              Save
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminProductDetail;