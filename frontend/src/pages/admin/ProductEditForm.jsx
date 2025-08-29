import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Upload, Row, Col, Card, message, Space, InputNumber, Switch } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import api from '../../services/api';

const { Option } = Select;

const ProductEditForm = ({ product, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [fileList] = useState([]);
  const [variantFileLists, setVariantFileLists] = useState({});

  useEffect(() => {
    fetchCategories();
    fetchTags();
    if (product) {
      initializeForm();
    }
  }, [product]);

  const initializeForm = () => {
    form.setFieldsValue({
      name: product.name,
      slug: product.slug,
      brand: product.brand,
      tagline: product.tagline,
      description: product.description,
      ingredients: product.ingredients,
      how_to_use: product.how_to_use,
      skin_types: product.skin_types,
      skin_concerns: product.skin_concerns,
      finish: product.finish,
      coverage: product.coverage,
      category_id: product.category?.id,
      tag_ids: product.tags?.map(tag => tag.id) || [],
      is_active: product.is_active,
      is_featured: product.is_featured,
      meta_title: product.meta_title,
      meta_description: product.meta_description,
    });

    // Initialize variant forms
    if (product.variants) {
      form.setFieldsValue({
        variants: product.variants.map(variant => ({
          id: variant.id,
          size: variant.size,
          shade_name: variant.shade_name,
          shade_hex_color: variant.shade_hex_color,
          sku: variant.sku,
          upc: variant.upc,
          price: variant.price,
          discount_price: variant.discount_price,
          stock: variant.stock,
          low_stock_threshold: variant.low_stock_threshold,
          weight_grams: variant.weight_grams,
        }))
      });
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/products/categories/?tree');
      setCategories(response.data.categories || response.data);
    } catch (error) {
      message.error('Failed to fetch categories');
    }
  };

  const fetchTags = async () => {
    try {
      const response = await api.get('/products/tags/');
      setTags(response.data);
    } catch (error) {
      message.error('Failed to fetch tags');
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    
    try {
      const formData = new FormData();
      
      // Append basic product data
      Object.entries(values).forEach(([key, value]) => {
        if (key !== 'variants' && key !== 'variants_data' && value !== undefined) {
          if (key === 'category_id') {
            formData.append('category', value);
          } else if (key === 'tag_ids') {
            value.forEach(tagId => formData.append('tags', tagId));
          } else {
            formData.append(key, value);
          }
        }
      });

      // Handle main product image
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('main_image', fileList[0].originFileObj);
      }

      // Handle variants with proper file upload
      if (values.variants) {
        values.variants.forEach((variant, index) => {
          Object.entries(variant).forEach(([key, value]) => {
            if (key === 'variant_image' && value && typeof value !== 'string') {
              // This is a file upload
              formData.append(`variants[${index}].${key}`, value);
            } else if (key !== 'variant_image' && value !== undefined) {
              formData.append(`variants[${index}].${key}`, value);
            }
          });
        });
      }

      const response = await api.patch(`/products/products/${product.slug}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      message.success('Product updated successfully');
      onSuccess(response.data);
    } catch (error) {
      console.error('Update error:', error);
      message.error(error.response?.data?.detail || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  const handleVariantImageChange = (variantIndex, file) => {
    const newVariantFileLists = { ...variantFileLists };
    newVariantFileLists[variantIndex] = file;
    setVariantFileLists(newVariantFileLists);
  };

  const renderVariantForm = (variant, index) => (
    <Card key={index} title={`Variant ${index + 1}`} size="small">
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name={['variants', index, 'size']} label="Size">
            <Input placeholder="e.g., 30ml" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name={['variants', index, 'shade_name']} label="Shade Name">
            <Input placeholder="e.g., Warm Ivory" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name={['variants', index, 'shade_hex_color']} label="Shade Color">
            <Input type="color" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name={['variants', index, 'sku']} label="SKU" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
            <Form.Item name={['variants', index, 'price']} label="Price" rules={[{ required: true }]}>
              <InputNumber prefix="$" style={{ width: '100%' }} />
            </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name={['variants', index, 'discount_price']} label="Discount Price">
            <InputNumber prefix="$" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name={['variants', index, 'stock']} label="Stock" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name={['variants', index, 'variant_image']} label="Variant Image">
            <Upload
              accept="image/*"
              maxCount={1}
              beforeUpload={() => false}
              onChange={({ file }) => handleVariantImageChange(index, file)}
            >
              <Button icon={<UploadOutlined />}>Upload Image</Button>
            </Upload>
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  return (
    <div>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={24}>
          <Col span={16}>
            <Card title="Basic Information">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="name" label="Product Name" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="brand" label="Brand">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="description" label="Description">
                    <ReactQuill theme="snow" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card title="Variants" style={{ marginTop: 16 }}>
              <Form.List name="variants">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map((field, index) => renderVariantForm(field, index))}
                    <Form.Item>
                      <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                        Add Variant
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </Card>
          </Col>

          <Col span={8}>
            <Card title="Settings">
              <Form.Item name="category_id" label="Category" rules={[{ required: true }]}>
                <Select showSearch>
                  {categories.map(cat => (
                    <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="tag_ids" label="Tags">
                <Select mode="multiple">
                  {tags.map(tag => (
                    <Option key={tag.id} value={tag.id}>{tag.name}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="is_active" label="Active" valuePropName="checked">
                <Switch />
              </Form.Item>

              <Form.Item name="is_featured" label="Featured" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Card>
          </Col>
        </Row>

        <Form.Item style={{ marginTop: 24, textAlign: 'right' }}>
          <Space>
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Update Product
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ProductEditForm;
