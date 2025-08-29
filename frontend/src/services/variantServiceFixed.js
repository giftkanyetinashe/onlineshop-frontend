import api from './api';

const VARIANT_BASE_URL = '/api/products';

export const variantService = {
  // Get all variants for a product
  getVariants: async (productSlug) => {
    const response = await api.get(`${VARIANT_BASE_URL}/${productSlug}/variants/`);
    return response.data;
  },

  // Get single variant
  getVariant: async (productSlug, variantId) => {
    const response = await api.get(`${VARIANT_BASE_URL}/${productSlug}/variants/${variantId}/`);
    return response.data;
  },

  // Create new variant with proper file handling
  createVariant: async (productSlug, variantData) => {
    const formData = new FormData();
    
    // Handle file upload properly
    Object.entries(variantData).forEach(([key, value]) => {
      if (key === 'variant_image' && value instanceof File) {
        formData.append(key, value);
      } else if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });
    
    const response = await api.post(`${VARIANT_BASE_URL}/${productSlug}/variants/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update variant with proper file handling
  updateVariant: async (productSlug, variantId, variantData) => {
    const formData = new FormData();
    
    // Handle file upload properly
    Object.entries(variantData).forEach(([key, value]) => {
      if (key === 'variant_image' && value instanceof File) {
        formData.append(key, value);
      } else if (key === 'variant_image' && value === null) {
        // Explicitly send null for clearing image
        formData.append(key, '');
      } else if (value !== null && value !== undefined && value !== '') {
        formData.append(key, value);
      }
    });
    
    const response = await api.patch(`${VARIANT_BASE_URL}/${productSlug}/variants/${variantId}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete variant
  deleteVariant: async (productSlug, variantId) => {
    const response = await api.delete(`${VARIANT_BASE_URL}/${productSlug}/variants/${variantId}/`);
    return response.data;
  }
};

export default variantService;
