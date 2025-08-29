import api from './api';

const productEditService = {
  // Get product details for editing
  getProduct: async (productSlug) => {
    const response = await api.get(`/products/products/${productSlug}/`);
    return response.data;
  },

  // Update product with variants and images
  updateProduct: async (productSlug, formData) => {
    const response = await api.patch(`/products/products/${productSlug}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Create new product with variants
  createProduct: async (formData) => {
    const response = await api.post('/products/products/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get categories for dropdown
  getCategories: async () => {
    const response = await api.get('/products/categories/?tree');
    return response.data.categories || response.data;
  },

  // Get tags for dropdown
  getTags: async () => {
    const response = await api.get('/products/tags/');
    return response.data;
  },
};

export default productEditService;
