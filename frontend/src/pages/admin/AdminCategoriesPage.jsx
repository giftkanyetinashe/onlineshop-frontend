import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import {
  Tree,
  Card,
  Row,
  Col,
  Button,
  Space,
  Input,
  Modal,
  message,
  Empty,
  Descriptions,
  Tag,
  Form,
  Switch,
  Select,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { createTheme, ThemeProvider } from '@mui/material';
import { CssBaseline } from '@mui/material';

// Custom Theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#7b6c64', // Sandstone
    },
    secondary: {
      main: '#b3ac9e', // Nomad
    },
    background: {
      default: '#f8f7f5', // Light neutral background
      paper: '#ffffff',
    },
    text: {
      primary: '#222220', // Tutara
      secondary: '#7b6c64', // Sandstone
    },
    divider: '#e0ddd8', // Light divider
  },
  typography: {
    fontFamily: '"Circular Std", sans-serif',
    h1: {
      fontFamily: '"Laginchy", serif',
      fontWeight: 'bold',
    },
    h2: {
      fontFamily: '"Laginchy", serif',
      fontWeight: 'bold',
    },
    h3: {
      fontFamily: '"Laginchy", serif',
    },
    h4: {
      fontFamily: '"Laginchy", serif',
    },
    h5: {
      fontFamily: '"Laginchy", serif',
    },
    h6: {
      fontFamily: '"Laginchy", serif',
    },
  },
  shape: {
    borderRadius: 8,
  },
});

const { TextArea } = Input;
const { Option } = Select;

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [form] = Form.useForm();

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/products/categories/?include_subcategories=true');
      setCategories(response.data.categories || response.data);
    } catch (error) {
      message.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const convertToTreeData = (data) =>
    data.map(cat => ({
      title: (
        <span style={{ 
          color: selectedCategory?.slug === cat.slug ? '#7b6c64' : '#222220',
          fontWeight: selectedCategory?.slug === cat.slug ? 600 : 400
        }}>
          {cat.name}
        </span>
      ),
      key: cat.slug,
      ...cat,
      children: cat.children ? convertToTreeData(cat.children) : [],
    }));

  const handleAddCategory = () => {
    setEditingCategory(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    form.setFieldsValue({
      ...category,
      parent: category.parent?.slug,
    });
    setModalOpen(true);
  };

  const handleDeleteCategory = (slug) => {
    Modal.confirm({
      title: 'Delete Category',
      content: 'Are you sure you want to delete this category and its subcategories?',
      okText: 'Delete',
      okButtonProps: { style: { backgroundColor: '#7b6c64', borderColor: '#7b6c64' } },
      cancelButtonProps: { style: { color: '#7b6c64', borderColor: '#7b6c64' } },
      onOk: async () => {
        try {
          await api.delete(`/products/categories/${slug}/`);
          message.success('Category deleted successfully');
          setSelectedCategory(null);
          fetchCategories();
        } catch (error) {
          message.error('Failed to delete category');
        }
      },
    });
  };

  const handleFormSubmit = async (values) => {
    const payload = {
      ...values,
      parent: values.parent || null, // Send slug string or null directly
    };

    try {
      if (editingCategory) {
        await api.put(`/products/categories/${editingCategory.slug}/`, payload);
        message.success('Category updated successfully');
      } else {
        await api.post('/products/categories/', payload);
        message.success('Category created successfully');
      }
      setModalOpen(false);
      fetchCategories();
    } catch (error) {
      message.error('Failed to save category');
    }
  };

  const renderCategoryOptions = (cats, level = 0) =>
    cats.map(cat => (
      <React.Fragment key={cat.id}>
        <Option value={cat.slug} style={{ paddingLeft: `${level * 16}px`, color: '#222220' }}>
          {cat.name}
        </Option>
        {cat.children?.length > 0 && renderCategoryOptions(cat.children, level + 1)}
      </React.Fragment>
    ));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ 
        padding: 24, 
        minHeight: '100vh',
        backgroundColor: '#f8f7f5',
      }}>
        <Row gutter={24}>
          <Col xs={24} md={8}>
            <Card 
              title={
                <Typography.Title 
                  level={5} 
                  style={{ 
                    fontFamily: '"Laginchy", serif',
                    color: '#222220',
                    margin: 0 
                  }}
                >
                  Category Hierarchy
                </Typography.Title>
              }
              loading={loading}
              style={{ 
                borderRadius: 8,
                border: '1px solid #e0ddd8',
                marginBottom: 24,
                height: '100%'
              }}
              bodyStyle={{ padding: '16px 8px' }}
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddCategory}
                block
                style={{ 
                  marginBottom: 16,
                  backgroundColor: '#7b6c64',
                  borderColor: '#7b6c64',
                  borderRadius: 4,
                }}
              >
                Add Root Category
              </Button>
              <Tree
                treeData={convertToTreeData(categories)}
                onSelect={(keys, { node }) => setSelectedCategory(node)}
                defaultExpandAll
                style={{ 
                  padding: '0 8px',
                  fontFamily: '"Circular Std", sans-serif',
                }}
              />
            </Card>
          </Col>
          <Col xs={24} md={16}>
            {selectedCategory ? (
              <Card 
                title={
                  <Typography.Title 
                    level={5} 
                    style={{ 
                      fontFamily: '"Laginchy", serif',
                      color: '#222220',
                      margin: 0 
                    }}
                  >
                    {selectedCategory.name}
                  </Typography.Title>
                }
                style={{ 
                  borderRadius: 8,
                  border: '1px solid #e0ddd8',
                }}
              >
                <Descriptions 
                  bordered 
                  column={1}
                  labelStyle={{ 
                    color: '#7b6c64',
                    width: '120px',
                    fontWeight: 500 
                  }}
                  contentStyle={{ color: '#222220' }}
                >
                  <Descriptions.Item label="Name">{selectedCategory.name}</Descriptions.Item>
                  <Descriptions.Item label="Slug">{selectedCategory.slug}</Descriptions.Item>
                  <Descriptions.Item label="Parent">
                    {selectedCategory.parent?.name || <span style={{ color: '#b3ac9e' }}>None</span>}
                  </Descriptions.Item>
                  <Descriptions.Item label="Description">
                    {selectedCategory.description || <span style={{ color: '#b3ac9e' }}>N/A</span>}
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Tag 
                      color={selectedCategory.is_active ? '#7b6c64' : '#b3ac9e'}
                      style={{ 
                        color: selectedCategory.is_active ? '#ffffff' : '#222220',
                        borderRadius: 4,
                      }}
                    >
                      {selectedCategory.is_active ? 'Active' : 'Inactive'}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
                <Space style={{ marginTop: 24 }}>
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => handleEditCategory(selectedCategory)}
                    style={{ 
                      color: '#7b6c64',
                      borderColor: '#7b6c64',
                      borderRadius: 4,
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteCategory(selectedCategory.slug)}
                    style={{ 
                      color: '#b3ac9e',
                      borderColor: '#b3ac9e',
                      borderRadius: 4,
                    }}
                  >
                    Delete
                  </Button>
                </Space>
              </Card>
            ) : (
              <Card 
                style={{ 
                  borderRadius: 8,
                  border: '1px solid #e0ddd8',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '300px'
                }}
              >
                <Empty 
                  description={
                    <span style={{ color: '#7b6c64' }}>
                      Select a category to view details
                    </span>
                  } 
                />
              </Card>
            )}
          </Col>
        </Row>

        <Modal
          title={
            <Typography.Title 
              level={5} 
              style={{ 
                fontFamily: '"Laginchy", serif',
                color: '#222220',
                margin: 0 
              }}
            >
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </Typography.Title>
          }
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          footer={null}
          destroyOnClose
          style={{ fontFamily: '"Circular Std", sans-serif' }}
          bodyStyle={{ padding: 24 }}
        >
          <Form 
            form={form} 
            layout="vertical" 
            onFinish={handleFormSubmit} 
            initialValues={{ is_active: true }}
          >
            <Form.Item
              name="name"
              label={<span style={{ color: '#7b6c64' }}>Category Name</span>}
              rules={[{ required: true, message: 'Please enter category name' }]}
            >
              <Input style={{ borderRadius: 4 }} />
            </Form.Item>

            <Form.Item 
              name="slug" 
              label={<span style={{ color: '#7b6c64' }}>Slug</span>}
            >
              <Input style={{ borderRadius: 4 }} />
            </Form.Item>

            <Form.Item 
              name="description" 
              label={<span style={{ color: '#7b6c64' }}>Description</span>}
            >
              <TextArea rows={3} style={{ borderRadius: 4 }} />
            </Form.Item>

            <Form.Item 
              name="parent" 
              label={<span style={{ color: '#7b6c64' }}>Parent Category</span>}
            >
              <Select 
                allowClear 
                placeholder="Select parent category"
                style={{ borderRadius: 4 }}
              >
                {renderCategoryOptions(categories)}
              </Select>
            </Form.Item>

            <Form.Item 
              name="is_active" 
              label={<span style={{ color: '#7b6c64' }}>Active Status</span>} 
              valuePropName="checked"
            >
              <Switch 
                style={{ backgroundColor: '#b3ac9e' }}
                checkedChildren="Active"
                unCheckedChildren="Inactive"
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit"
                style={{ 
                  backgroundColor: '#7b6c64',
                  borderColor: '#7b6c64',
                  borderRadius: 4,
                }}
              >
                {editingCategory ? 'Update Category' : 'Create Category'}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </ThemeProvider>
  );
};

export default AdminCategoriesPage;