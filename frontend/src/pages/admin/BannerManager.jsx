import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, Typography, Select, MenuItem, FormControl, InputLabel, Paper, IconButton } from '@mui/material';
import { Delete } from '@mui/icons-material';
import api from '../../services/api';

const BannerManager = () => {
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState({
    type: 'image',
    src: '',
    alt: '',
    duration: 5000,
    overlayText: '',
    ctaText: '',
    ctaLink: '',
    file: null
  });
  const [loading, setLoading] = useState(false);

  const fetchBanners = async () => {
    try {
      const response = await api.get('/orders/banner/');
      setBanners(response.data);
    } catch (error) {
      console.error('Failed to fetch banners:', error);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setForm(prev => ({ ...prev, file: e.target.files[0] }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('type', form.type);
      formData.append('alt', form.alt);
      formData.append('duration', form.duration);
      formData.append('overlayText', form.overlayText);
      formData.append('ctaText', form.ctaText);
      formData.append('ctaLink', form.ctaLink);
      if (form.file) {
        formData.append('file', form.file);
      } else if (form.src) {
        formData.append('src', form.src);
      }

      await api.post('/orders/banner/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setForm({
        type: 'image',
        src: '',
        alt: '',
        duration: 5000,
        overlayText: '',
        ctaText: '',
        ctaLink: '',
        file: null
      });
      fetchBanners();
    } catch (error) {
      console.error('Failed to add banner:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/orders/banner/${id}/`);
      fetchBanners();
    } catch (error) {
      console.error('Failed to delete banner:', error);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Manage Banner Content</Typography>
      <Paper sx={{ p: 3, mb: 4 }}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="type-label">Type</InputLabel>
          <Select
            labelId="type-label"
            name="type"
            value={form.type}
            label="Type"
            onChange={handleChange}
          >
            <MenuItem value="image">Image</MenuItem>
            <MenuItem value="video">Video</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Source URL"
          name="src"
          value={form.src}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
          disabled={form.file !== null}
        />
        <Button variant="contained" component="label" sx={{ mb: 2 }}>
          Choose File
          <input type="file" hidden onChange={handleFileChange} accept={form.type === 'image' ? 'image/*' : 'video/*'} />
        </Button>
        {form.file && <Typography variant="body2" sx={{ mb: 2 }}>{form.file.name}</Typography>}
        <TextField
          label="Alt Text"
          name="alt"
          value={form.alt}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Duration (ms)"
          name="duration"
          type="number"
          value={form.duration}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Overlay Text"
          name="overlayText"
          value={form.overlayText}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="CTA Text"
          name="ctaText"
          value={form.ctaText}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="CTA Link"
          name="ctaLink"
          value={form.ctaLink}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Saving...' : 'Add Banner'}
        </Button>
      </Paper>
      <Typography variant="h5" gutterBottom>Existing Banners</Typography>
      {banners.map(banner => (
        <Paper key={banner.id} sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography><strong>Type:</strong> {banner.type}</Typography>
            <Typography><strong>Alt:</strong> {banner.alt}</Typography>
            <Typography><strong>Overlay Text:</strong> {banner.overlayText}</Typography>
            <Typography><strong>CTA Text:</strong> {banner.ctaText}</Typography>
            <Typography><strong>CTA Link:</strong> {banner.ctaLink}</Typography>
          </Box>
          <IconButton color="error" onClick={() => handleDelete(banner.id)}>
            <Delete />
          </IconButton>
        </Paper>
      ))}
    </Box>
  );
};

export default BannerManager;
