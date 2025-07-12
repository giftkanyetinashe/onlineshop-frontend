import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

import {
  Table,
  Form,
  Input,
  Button,
  Select,
  Modal,
  message,
  Upload,
  Tree,
  Card,
  Row,
  Col,
  Divider,
  Tag,
  Space,
  InputNumber,
  Switch,
  Breadcrumb,
  Descriptions,
  Image,
  Tabs,
  Empty,
  Collapse
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
  FolderOpenOutlined,
  SearchOutlined,
} from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

const AdminProducts = () => {
  const { authState } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openProductModal, setOpenProductModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [currentVariant, setCurrentVariant] = useState(null);
  // Removed unused imageModalOpen state
  const [setImageModalOpen] = useState(false);
  const [setCurrentImages] = useState([]);
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [selectedCategoryKeys, setSelectedCategoryKeys] = useState([]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const [activeTab, setActiveTab] = useState('products');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [setSearchValue] = useState('');

  const [form] = Form.useForm();
  const [categoryForm] = Form.useForm();
  const [variantForm] = Form.useForm();

  // Recursive function to find category in nested categories
  const findCategoryInTree = useCallback((categories, targetSlugOrId) => {
    for (const category of categories) {
      if (category.slug === targetSlugOrId || category.id === targetSlugOrId) {
        return category;
      }
      if (category.children && category.children.length > 0) {
        const found = findCategoryInTree(category.children, targetSlugOrId);
        if (found) return found;
      }
    }
    return null;
  }, []);

  // Recursive function to render category options with indentation for Select dropdown
  const renderCategoryOptions = (categories, level = 0) => {
    return categories.map(category => (
      <React.Fragment key={category.id}>
        <Option
          value={category.slug}
          style={{ paddingLeft: `${16 + level * 16}px`, fontWeight: level === 0 ? 'bold' : 'normal' }}
        >
          {category.name}
        </Option>
        {category.children && category.children.length > 0 && renderCategoryOptions(category.children, level + 1)}
      </React.Fragment>
    ));
  };

  // Convert nested categories to treeData format for Tree component
  const convertToTreeData = (categories) => {
    return categories.map(category => ({
      title: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>
            {category.name}{' '}
            <Tag color="blue" style={{ fontWeight: 'bold', fontSize: '0.85em', marginLeft: 8 }}>
              {category.total_product_count || 0} products
            </Tag>
          </span>
          <Space>
            {category.is_featured && <Tag color="gold">Featured</Tag>}
            <Tag>Level {category.level}</Tag>
          </Space>
        </div>
      ),
      key: category.slug,
      children: category.children && category.children.length > 0 ? convertToTreeData(category.children) : undefined,
    }));
  };

  // Fetch categories with nested subcategories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('/products/categories/?include_subcategories=true', {
        headers: { Authorization: `Bearer ${authState.access_token}` },
      });
      const cats = response.data.categories || response.data;
      setCategories(cats);

      // Set tree data and expanded keys
      const parentKeys = [];
      const findParentKeys = (categories) => {
        categories.forEach(cat => {
          if (cat.children && cat.children.length > 0) {
            parentKeys.push(cat.slug);
            findParentKeys(cat.children);
          }
        });
      };
      findParentKeys(cats);
      
      setExpandedKeys(parentKeys);
      setSelectedCategoryKeys([]);
      setCurrentCategory(null);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      message.error('Failed to fetch categories');
    }
  }, [authState.access_token]);

  // Fetch products with pagination and filters
  const fetchProducts = useCallback(async (paginationParams = {}, params = {}) => {
    setLoading(true);
    try {
      const response = await api.get('/products/products/', {
        params: { ...params },
        headers: { Authorization: `Bearer ${authState.access_token}` },
      });
      const formattedProducts = response.data.map(product => ({
        ...product,
        price: parseFloat(product.price),
        discount_price: product.discount_price ? parseFloat(product.discount_price) : null,
        key: product.id,
      }));
      setProducts(formattedProducts);
      setPagination(prev => ({
        ...prev,
        current: paginationParams.current || 1,
        pageSize: paginationParams.pageSize || 10,
        total: response.data.length,
      }));
    } catch (error) {
      console.error('Failed to fetch products:', error);
      message.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [authState.access_token]);

  // Fetch variants for a product
  const fetchVariants = useCallback(async (productSlug) => {
    setLoading(true);
    try {
      const response = await api.get(`/products/products/${productSlug}/variants/`, {
        headers: { Authorization: `Bearer ${authState.access_token}` },
      });
      // Fix: Ensure each variant has a price property, fallback to product price if missing
      const variantsWithPrice = response.data.map(variant => ({
        ...variant,
        price: variant.price !== undefined ? parseFloat(variant.price) : currentProduct?.price || 0,
      }));
      setVariants(variantsWithPrice);
    } catch (error) {
      console.error('Failed to fetch variants:', error);
      message.error('Failed to fetch variants');
    } finally {
      setLoading(false);
    }
  }, [authState.access_token, currentProduct]);

  // Handle tree select in Categories tab
  const handleTreeSelect = (selectedKeys) => {
    if (selectedKeys.length > 0) {
      setSelectedCategoryKeys(selectedKeys);
      const selectedCat = findCategoryInTree(categories, selectedKeys[0]);
      setCurrentCategory(selectedCat || null);
    } else {
      setSelectedCategoryKeys([]);
      setCurrentCategory(null);
    }
  };

  // Handle product form submit
  const handleProductSubmit = async (values) => {
    try {
      setLoading(true);
      const selectedCategory = findCategoryInTree(categories, values.category);
      if (!selectedCategory) throw new Error('Selected category not found');
      const dataToSend = {
        ...values,
        category_id: selectedCategory.id,
        discount_price: values.discount_price || null,
        brand: values.brand || '',
        is_featured: values.is_featured || false,
        is_active: values.is_active !== false,
      };
      if (currentProduct) {
        await api.put(`/products/products/${currentProduct.slug}/`, dataToSend, {
          headers: { Authorization: `Bearer ${authState.access_token}` },
        });
        message.success('Product updated successfully');
      } else {
        await api.post('/products/products/', dataToSend, {
          headers: { Authorization: `Bearer ${authState.access_token}` },
        });
        message.success('Product created successfully');
      }
      setOpenProductModal(false);
      fetchProducts({ current: pagination.current, pageSize: pagination.pageSize });
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  // Handle category form submit
  const handleCategorySubmit = async (values) => {
    try {
      setLoading(true);
      // Prepare form data for file upload
      const formData = new FormData();
      for (const key in values) {
        if (key === 'image') {
          if (values[key] && values[key].file) {
            formData.append(key, values[key].file.originFileObj);
          }
          // else do not append image if not a new file
        } else {
          formData.append(key, values[key]);
        }
      }
      if (currentCategory) {
        await api.put(`/products/categories/${currentCategory.slug}/`, formData, {
          headers: { 
            Authorization: `Bearer ${authState.access_token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        message.success('Category updated successfully');
      } else {
        await api.post('/products/categories/', formData, {
          headers: { 
            Authorization: `Bearer ${authState.access_token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        message.success('Category created successfully');
      }
      setCategoryModalOpen(false);
      fetchCategories();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  // Handle variant form submit
  const handleVariantSubmit = async (values) => {
    try {
      setLoading(true);
      // Prepare form data for file upload
      const formData = new FormData();
      for (const key in values) {
        if (key === 'variant_image') {
          if (values[key] && values[key].file) {
            formData.append(key, values[key].file.originFileObj);
          }
          // else do not append variant_image if not a new file
        } else {
          formData.append(key, values[key]);
        }
      }
      if (currentVariant) {
        await api.put(`/products/products/${currentProduct.slug}/variants/${currentVariant.id}/`, formData, {
          headers: { 
            Authorization: `Bearer ${authState.access_token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        message.success('Variant updated successfully');
      } else {
        await api.post(`/products/products/${currentProduct.slug}/variants/`, formData, {
          headers: { 
            Authorization: `Bearer ${authState.access_token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        message.success('Variant created successfully');
      }
      setVariantModalOpen(false);
      fetchVariants(currentProduct.slug);
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to save variant');
    } finally {
      setLoading(false);
    }
  };

  // Delete category
  // Removed unused deleteCategory function to resolve the compile error

  // Delete variant
  const deleteVariant = async (id) => {
    try {
      await api.delete(`/products/variants/${id}/`, {
        headers: { Authorization: `Bearer ${authState.access_token}` },
      });
      message.success('Variant deleted successfully');
      fetchVariants(currentProduct.slug);
    } catch {
      message.error('Failed to delete variant');
    }
  };

  // Show variant edit modal
  const showVariantEditModal = (variant) => {
    setCurrentVariant(variant);
    variantForm.setFieldsValue(variant);
    setVariantModalOpen(true);
  };

  // Show variant add modal
  const showVariantAddModal = () => {
    setCurrentVariant(null);
    variantForm.resetFields();
    setVariantModalOpen(true);
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  // Product columns for table
  const productColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      render: (text, record) => (
        <button
          onClick={() => navigate(`/admin/products/${record.slug}`)}
          style={{ background: 'none', border: 'none', padding: 0, margin: 0, color: '#1890ff', textDecoration: 'underline', cursor: 'pointer' }}
        >
          {text}
        </button>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => category?.name || 'N/A',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      sorter: (a, b) => a.price - b.price,
      render: (price) => `$${price.toFixed(2)}`,
    },
    {
      title: 'Discount Price',
      dataIndex: 'discount_price',
      key: 'discount_price',
      render: (price) => price ? `$${price.toFixed(2)}` : '-',
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
      filters: [
        { text: 'Male', value: 'M' },
        { text: 'Female', value: 'F' },
        { text: 'Unisex', value: 'U' },
      ],
      render: (gender) => {
        switch (gender) {
          case 'M': return 'Male';
          case 'F': return 'Female';
          default: return 'Unisex';
        }
      },
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
    },
    {
      title: 'Featured',
      dataIndex: 'is_featured',
      key: 'is_featured',
      render: (isFeatured) => (
        <Tag color={isFeatured ? 'gold' : 'default'}>
          {isFeatured ? 'Yes' : 'No'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EyeOutlined />}
            onClick={() => navigate(`/products/${record.slug}`)}
          />
          <Button
            icon={<FolderOpenOutlined />}
            onClick={() => {
              setCurrentProduct(record);
              fetchVariants(record.slug);
              setActiveTab('variants');
            }}
          />
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setCurrentProduct(record);
              form.setFieldsValue({
                ...record,
                category: record.category?.slug || record.category,
              });
              setOpenProductModal(true);
            }}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => {
              Modal.confirm({
                title: 'Delete Product',
                content: `Are you sure you want to delete "${record.name}"?`,
                onOk: async () => {
                  try {
                    await api.delete(`/products/products/${record.slug}/`, {
                      headers: { Authorization: `Bearer ${authState.access_token}` },
                    });
                    message.success('Product deleted successfully');
                    fetchProducts({ current: pagination.current, pageSize: pagination.pageSize });
                  } catch {
                    message.error('Failed to delete product');
                  }
                },
              });
            }}
          />
        </Space>
      ),
    },
  ];

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
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `$${price.toFixed(2)}`,
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
            onClick={() => showVariantEditModal(record)}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => {
              Modal.confirm({
                title: 'Delete Variant',
                content: 'Are you sure you want to delete this variant?',
                onOk: () => deleteVariant(record.id),
              });
            }}
          />
        </Space>
      ),
    },
  ];

  // CategoryDetails component
  const CategoryDetails = ({ category, categories, onEdit, onDelete, onViewProducts }) => (
    <Card
      title={category.name}
      extra={
        <Space>
          <Button icon={<EditOutlined />} onClick={onEdit} />
          <Button 
            icon={<DeleteOutlined />} 
            danger 
            onClick={onDelete} 
            disabled={(category.total_product_count || 0) > 0 || (category.children && category.children.length > 0)}
            title={(category.total_product_count || 0) > 0 || (category.children && category.children.length > 0) ? 'Cannot delete category with products or subcategories' : ''}
          />
        </Space>
      }
    >
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Description">{category.description || 'No description'}</Descriptions.Item>
        <Descriptions.Item label="Parent Category">
          {category.parent ? (
            <a
              href="#!"
              onClick={e => {
                e.preventDefault();
                const parent = findCategoryInTree(categories, category.parent);
                if (parent) {
                  setSelectedCategoryKeys([parent.slug]);
                  setCurrentCategory(parent);
                }
              }}
            >
              {findCategoryInTree(categories, category.parent)?.name}
            </a>
          ) : (
            'None'
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Display Order">{category.display_order}</Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={category.is_active ? 'green' : 'red'}>
            {category.is_active ? 'Active' : 'Inactive'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Featured">
          <Tag color={category.is_featured ? 'gold' : 'default'}>
            {category.is_featured ? 'Yes' : 'No'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Image">
          {category.image ? (
            <Image src={category.image} width={150} style={{ maxHeight: 150, objectFit: 'contain' }} />
          ) : (
            'No image'
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Breadcrumbs">
          {category.breadcrumbs?.length > 0 ? (
            <Breadcrumb>
              {category.breadcrumbs.map((crumb, index) => (
                <Breadcrumb.Item key={index}>
                  <a
                    href="#!"
                    onClick={e => {
                      e.preventDefault();
                      const cat = findCategoryInTree(categories, crumb.slug);
                      if (cat) {
                        setSelectedCategoryKeys([cat.slug]);
                        setCurrentCategory(cat);
                      }
                    }}
                  >
                    {crumb.name}
                  </a>
                </Breadcrumb.Item>
              ))}
            </Breadcrumb>
          ) : (
            'None'
          )}
        </Descriptions.Item>
        {category.children && category.children.length > 0 && (
          <Descriptions.Item label="Subcategories">
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {category.children.map(child => (
                <Tag 
                  key={child.slug} 
                  style={{ marginBottom: '5px', cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedCategoryKeys([child.slug]);
                    setCurrentCategory(child);
                  }}
                >
                  {child.name}
                </Tag>
              ))}
            </div>
          </Descriptions.Item>
        )}
      </Descriptions>
      <Divider />
      <Button type="primary" onClick={onViewProducts}>
        View Products in this Category
      </Button>
    </Card>
  );

  // Tabs items configuration
  const tabItems = [
    {
      key: 'products',
      label: 'Products',
      children: (
        <Table
          columns={productColumns}
          dataSource={products}
          rowKey="slug"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          onChange={(pagination, filters, sorter) => {
            const params = {
              ...filters,
              ordering: sorter.field ? (sorter.order === 'descend' ? '-' : '') + sorter.field : undefined,
            };
            fetchProducts(pagination, params);
          }}
          scroll={{ x: true }}
        />
      ),
    },
    {
      key: 'categories',
      label: 'Categories',
      children: (
        <Row gutter={16}>
          <Col span={8}>
            <Card
              title="Category Hierarchy"
              extra={
                <Space>
                  <Input
                    placeholder="Search categories"
                    prefix={<SearchOutlined />}
                    onChange={e => setSearchValue(e.target.value)}
                    style={{ width: 200 }}
                  />
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setCurrentCategory(null);
                      categoryForm.resetFields();
                      setCategoryModalOpen(true);
                    }}
                  >
                    Add Category
                  </Button>
                </Space>
              }
            >
              <Tree
                showLine={{ showLeafIcon: false }}
                expandedKeys={expandedKeys}
                onExpand={keys => {
                  setExpandedKeys(keys);
                  setAutoExpandParent(false);
                }}
                autoExpandParent={autoExpandParent}
                treeData={convertToTreeData(categories)}
                selectedKeys={selectedCategoryKeys}
                onSelect={handleTreeSelect}
                titleRender={node => node.title}
                style={{ padding: '8px 0' }}
              />
            </Card>
          </Col>
          <Col span={16}>
            {currentCategory ? (
              <CategoryDetails
                category={currentCategory}
                categories={categories}
                onEdit={() => {
                  categoryForm.setFieldsValue({
                    ...currentCategory,
                    parent: currentCategory.parent || undefined,
                  });
                  setCategoryModalOpen(true);
                }}
                onDelete={() => {
                  Modal.confirm({
                    title: 'Delete Category',
                    content: `Are you sure you want to delete "${currentCategory.name}"? This action cannot be undone.`,
                    onOk: async () => {
                      try {
                        await api.delete(`/products/categories/${currentCategory.slug}/`, {
                          headers: { Authorization: `Bearer ${authState.access_token}` },
                        });
                        message.success('Category deleted successfully');
                        fetchCategories();
                        setCurrentCategory(null);
                        setSelectedCategoryKeys([]);
                      } catch (error) {
                        console.error('Failed to delete category:', error);
                        message.error(
                          error.response?.data?.message ||
                          'Failed to delete category. Ensure it has no products or subcategories.'
                        );
                      }
                    },
                  });
                }}
                onViewProducts={() => {
                  navigate(`/admin/products?category=${currentCategory.slug}`);
                  setActiveTab('products');
                }}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Select a category to view details"
              />
            )}
          </Col>
        </Row>
      ),
    },
    {
      key: 'variants',
      label: 'Variants',
      children: currentProduct ? (
        <div>
          <Breadcrumb>
            <Breadcrumb.Item>
              <a 
                href="#!" 
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentProduct(null);
                }}
              >
                All Products
              </a>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{currentProduct.name}</Breadcrumb.Item>
          </Breadcrumb>
          <Divider />
          <Descriptions bordered column={2} style={{ marginBottom: 24 }}>
            <Descriptions.Item label="Product Name">{currentProduct.name}</Descriptions.Item>
            <Descriptions.Item label="Category">{currentProduct.category?.name}</Descriptions.Item>
            <Descriptions.Item label="Price">${currentProduct.price.toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="Discount Price">
              {currentProduct.discount_price ? `$${currentProduct.discount_price.toFixed(2)}` : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={currentProduct.is_active ? 'green' : 'red'}>
                {currentProduct.is_active ? 'Active' : 'Inactive'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Featured">
              <Tag color={currentProduct.is_featured ? 'gold' : 'default'}>
                {currentProduct.is_featured ? 'Yes' : 'No'}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
          <Collapse defaultActiveKey={['1']} style={{ marginBottom: 24 }}>
            <Panel header="Product Images" key="1">
              <Row gutter={[16, 16]}>
                {currentProduct.images?.map((image) => (
                  <Col key={image.id} span={6}>
          <Card
            cover={
              <Image
                src={image.image}
                height={150}
                style={{ objectFit: 'cover' }}
              />
            }
            actions={[
              <EditOutlined key="edit" onClick={() => {
                setCurrentImages([image]);
                setImageModalOpen(true);
              }} />,
              <DeleteOutlined key="delete" onClick={() => {
                Modal.confirm({
                  title: 'Delete Image',
                  content: 'Are you sure you want to delete this image?',
                  onOk: async () => {
                    try {
                      await api.delete(`/products/images/${image.id}/`, {
                        headers: { Authorization: `Bearer ${authState.access_token}` },
                      });
                      message.success('Image deleted successfully');
                      fetchProducts({ current: pagination.current, pageSize: pagination.pageSize });
                      // Refresh current product images if viewing variants tab
                      if (currentProduct) {
                        fetchVariants(currentProduct.slug);
                      }
                    } catch {
                      message.error('Failed to delete image');
                    }
                  },
                });
              }} />,
              <Switch
                key="default"
                checked={image.is_default}
                checkedChildren="Default"
                unCheckedChildren="Not Default"
                onChange={async (checked) => {
                  try {
                    await api.put(`/products/images/${image.id}/set_default/`, {}, {
                      headers: { Authorization: `Bearer ${authState.access_token}` },
                    });
                    message.success('Default image updated');
                    fetchProducts({ current: pagination.current, pageSize: pagination.pageSize });
                    if (currentProduct) {
                      fetchVariants(currentProduct.slug);
                    }
                  } catch {
                    message.error('Failed to update default image');
                  }
                }}
              />,
            ]}
          />
                  </Col>
                ))}
                <Col span={6}>
                  <Upload
                    name="image"
                    action="/api/upload/"
                    listType="picture-card"
                    showUploadList={false}
                  >
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  </Upload>
                </Col>
              </Row>
            </Panel>
          </Collapse>
          <div style={{ marginBottom: 16 }}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={showVariantAddModal}
            >
              Add Variant
            </Button>
          </div>
          <Table
            columns={variantColumns}
            dataSource={variants}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
            }}
          />
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>
                Select a product to view its variants
              </span>
            }
          />
          <Button
            type="primary"
            onClick={() => setActiveTab('products')}
            style={{ marginTop: 16 }}
          >
            Browse Products
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-products-container">
      <Tabs 
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key);
          if (key !== 'variants') {
            setCurrentProduct(null);
          }
        }}
        items={tabItems}
      />

      {/* Product Modal */}
      <Modal
        title={currentProduct ? 'Edit Product' : 'Add Product'}
        open={openProductModal}
        onCancel={() => setOpenProductModal(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleProductSubmit}
          initialValues={{
            is_active: true,
            is_featured: false,
            gender: 'U',
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
              <Form.Item name="brand" label="Brand">
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
              <Form.Item name="discount_price" label="Discount Price">
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
              <Form.Item name="is_featured" label="Featured" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="is_active" label="Active" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {currentProduct ? 'Update' : 'Create'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Category Modal */}
      <Modal
        title={currentCategory ? 'Edit Category' : 'Add Category'}
        open={categoryModalOpen}
        onCancel={() => setCategoryModalOpen(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form
          form={categoryForm}
          layout="vertical"
          onFinish={handleCategorySubmit}
          initialValues={{
            is_featured: false,
            display_order: 0,
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Category Name"
                rules={[{ required: true, message: 'Please enter category name' }]}
              >
              <Input
                onChange={(e) => {
                  const value = e.target.value;
                  const slug = value
                    .toLowerCase()
                    .trim()
                    .replace(/[\s\W-]+/g, '-');
                  // Always update slug field as user types
                  categoryForm.setFieldsValue({ slug });
                }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="slug"
              label="Slug"
            >
              <Input />
            </Form.Item>
          </Col>
          </Row>
          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={4} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="parent"
                label="Parent Category"
              >
                <Select
                  showSearch
                  allowClear
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {renderCategoryOptions(categories)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="display_order"
                label="Display Order"
              >
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="image"
            label="Category Image"
          >
            <Upload
              name="image"
              listType="picture-card"
              showUploadList={false}
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            </Upload>
          </Form.Item>
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
                initialValue={true}
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          <Collapse>
            <Panel header="SEO Settings" key="1">
              <Form.Item
                name="meta_title"
                label="Meta Title"
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="meta_description"
                label="Meta Description"
              >
                <TextArea rows={4} />
              </Form.Item>
            </Panel>
          </Collapse>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {currentCategory ? 'Update' : 'Create'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Variant Modal */}
      <Modal
        title={currentVariant ? 'Edit Variant' : 'Add Variant'}
        open={variantModalOpen}
        onCancel={() => setVariantModalOpen(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form
          form={variantForm}
          layout="vertical"
          onFinish={handleVariantSubmit}
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
          >
            <Upload
              name="variant_image"
              listType="picture-card"
              showUploadList={false}
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {currentVariant ? 'Update' : 'Create'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminProducts;
