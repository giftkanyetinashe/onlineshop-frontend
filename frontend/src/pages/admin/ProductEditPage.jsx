import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, message } from 'antd';
import ProductEditForm from '../components/ProductEditForm';
import productEditService from '../services/productEditService';

const ProductEditPage = () => {
  const { productSlug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [productSlug]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await productEditService.getProduct(productSlug);
      setProduct(data);
    } catch (error) {
      message.error('Failed to fetch product details');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = (updatedProduct) => {
    message.success('Product updated successfully');
    navigate(`/admin/products/${updatedProduct.slug}`);
  };

  const handleCancel = () => {
    navigate('/admin/products');
  };

  return (
    <Card loading={loading} title={`Edit Product: ${product?.name || ''}`}>
      {product && (
        <ProductEditForm
          product={product}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}
    </Card>
  );
};

export default ProductEditPage;
