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

  // Create new variant
  createVariant: async (productSlug, variantData) => {
    const response = await api.post(`${VARIANT_BASE_URL}/${productSlug}/variants/`, variantData);
    return response.data;
  },

  // Update variant
  updateVariant: async (productSlug, variantId, variantData) => {
    const response = await api.patch(`${VARIANT_BASE_URL}/${productSlug}/variants/${variantId}/`, variantData);
    return response.data;
  },

  // Delete variant
  deleteVariant: async (productSlug, variantId) => {
    const response = await api.delete(`${VARIANT_BASE_URL}/${productSlug}/variants/${variantId}/`);
    return response.data;
  }
};

export default variantService;
