import React, { useEffect, useState } from 'react';
import {
  Box, Button, Typography, Paper, IconButton, Card, CardContent, CardMedia, Switch,
  FormControlLabel, Alert, Modal, Backdrop, Fade, TextField, FormControl, InputLabel,
  Select, MenuItem, Grid, Stack, CircularProgress
} from '@mui/material';
import { Delete, DragIndicator, AddCircleOutline, Edit, Visibility, UploadFile } from '@mui/icons-material';
// --- THIS IS THE FIX ---
// Changed from 'react-beautiful-dnd' to the new, maintained package
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import api from '../../services/api';

// Reusable preview component that handles both remote URLs and local file objects
const BannerPreview = ({ banner }) => {
  if (!banner) return null;
  const mediaSrc = (banner.media_file instanceof File)
    ? URL.createObjectURL(banner.media_file)
    : banner.media_url;

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '50vh', overflow: 'hidden', bgcolor: 'grey.900' }}>
      {mediaSrc ? (
        <CardMedia
          component={banner.type === 'video' ? 'video' : 'img'}
          src={mediaSrc}
          autoPlay={banner.type === 'video'} muted loop
          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'white' }}>
          <Typography>No Media Preview</Typography>
        </Box>
      )}
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, p: 4, background: 'linear-gradient(to right, rgba(0,0,0,0.4), transparent)' }}>
        <Typography variant="h3" sx={{ color: 'white', fontFamily: "'Laginchy', serif" }}>{banner.overlay_text}</Typography>
        <Button variant="contained" color="primary" sx={{ mt: 2 }}>{banner.cta_text}</Button>
      </Box>
    </Box>
  );
};

const BannerManager = () => {
  // All the rest of your component code is perfectly fine and does not need to change.
  // The new library is designed to be a 1-to-1 replacement.
  const [banners, setBanners] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [previewBanner, setPreviewBanner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    type: 'image', alt: '', media_file: null, media_file_mobile: null,
    overlay_text: '', cta_text: '', cta_link: '', duration: 7000,
    loop_video: false, is_active: true,
  });
  const [filePreviews, setFilePreviews] = useState({ media_file: null, media_file_mobile: null });

  const fetchBanners = async () => {
    try {
      const response = await api.get('/orders/banner/');
      setBanners(response.data);
    } catch (err) {
      console.error('Failed to fetch banners:', err);
      setError('Could not load banners.');
    }
  };

  useEffect(() => { fetchBanners(); }, []);

  const resetForm = () => {
    setShowForm(false);
    setEditingBanner(null);
    setFilePreviews({ media_file: null, media_file_mobile: null });
    setForm({
      type: 'image', alt: '', media_file: null, media_file_mobile: null,
      overlay_text: '', cta_text: '', cta_link: '', duration: 7000,
      loop_video: false, is_active: true,
    });
  };

  const handleEditClick = (banner) => {
    setEditingBanner(banner);
    setForm({ ...banner, 
      media_file: banner.media_url ? banner.media_url : null,
      media_file_mobile: banner.media_url_mobile ? banner.media_url_mobile : null, });
      
    setFilePreviews({ media_file: banner.media_url, media_file_mobile: banner.media_url_mobile });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      setForm(prev => ({ ...prev, [name]: file }));
      setFilePreviews(prev => ({ ...prev, [name]: URL.createObjectURL(file) }));
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData();

    // Append media_file and media_file_mobile only if they are File objects
    Object.keys(form).forEach(key => {
      if ((key === 'media_file' || key === 'media_file_mobile')) {
        if (form[key] instanceof File) formData.append(key, form[key]);
      } else if (key !== 'media_url' && key !== 'media_url_mobile' && key !== 'id') {
        formData.append(key, form[key]);
      }else {
      // Prevent formData from keeping an old URL string
      formData.delete(key);
    }
    });

    try {
      if (editingBanner) {
        await api.patch(`/orders/banner/${editingBanner.id}/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/orders/banner/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      resetForm();
      fetchBanners();
    } catch (err) {
      console.error('Failed to save banner:', err);
      setError(err.response?.data?.detail || 'Failed to save banner.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        await api.delete(`/orders/banner/${id}/`);
        fetchBanners();
      } catch (err) {
        setError('Failed to delete banner.');
      }
    }
  };

  const handleUpdate = async (id, payload) => {
    try {
      await api.patch(`/orders/banner/${id}/`, payload);
      fetchBanners();
    } catch (err) {
      setError('An update failed. Please refresh.');
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(banners);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setBanners(items);
    items.forEach((banner, index) => {
      if (banner.order !== index) {
        handleUpdate(banner.id, { order: index });
      }
    });
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" gutterBottom>Manage Banner Content</Typography>
        <Button variant="contained" startIcon={<AddCircleOutline />} onClick={() => { showForm ? resetForm() : setShowForm(true); }}>
          {showForm && !editingBanner ? 'Cancel' : 'Add New Banner'}
        </Button>
      </Box>
      
      {showForm && (
        <Paper component="form" onSubmit={handleSubmit} sx={{ p: { xs: 2, md: 4 }, mb: 4 }}>
          <Typography variant="h6" gutterBottom>{editingBanner ? `Editing: ${editingBanner.alt}` : 'Create New Banner'}</Typography>
          <Grid container spacing={3} mt={1}>
            <Grid item xs={12} md={6}><TextField name="alt" label="Alt Text (Important for SEO)" value={form.alt || ''} onChange={handleFormChange} fullWidth required /></Grid>
            <Grid item xs={12} md={6}><TextField name="overlay_text" label="Overlay Text" value={form.overlay_text || ''} onChange={handleFormChange} fullWidth required /></Grid>
            <Grid item xs={12} md={6}><TextField name="cta_text" label="CTA Button Text" value={form.cta_text || ''} onChange={handleFormChange} fullWidth required /></Grid>
            <Grid item xs={12} md={6}><TextField name="cta_link" label="CTA Link (e.g., /products)" value={form.cta_link || ''} onChange={handleFormChange} fullWidth required /></Grid>
            <Grid item xs={12} md={6}><FormControl fullWidth><InputLabel>Type</InputLabel><Select name="type" value={form.type} onChange={handleFormChange} label="Type"><MenuItem value="image">Image</MenuItem><MenuItem value="video">Video</MenuItem></Select></FormControl></Grid>
            <Grid item xs={12} md={6}><TextField name="duration" label="Image Duration (ms)" type="number" value={form.duration} onChange={handleFormChange} fullWidth helperText="Only applies to images" /></Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>Desktop Media</Typography>
              {(editingBanner && !filePreviews.media_file) && editingBanner.media_url && <CardMedia component="img" image={editingBanner.media_url} sx={{ height: 100, mb: 1, width: 200, borderRadius: 1 }} />}
              {filePreviews.media_file && <CardMedia component="img" image={filePreviews.media_file} sx={{ height: 100, mb: 1, width: 200, borderRadius: 1 }} />}
              <Button variant="outlined" component="label" startIcon={<UploadFile />}>Upload Desktop File<input type="file" name="media_file" hidden onChange={handleFileChange} accept="image/*,video/*"/></Button>
              {form.media_file?.name && <Typography variant="caption" display="block" mt={1}>{form.media_file.name}</Typography>}
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>Mobile Media (Optional)</Typography>
              {(editingBanner && !filePreviews.media_file_mobile) && editingBanner.media_url_mobile && <CardMedia component="img" image={editingBanner.media_url_mobile} sx={{ height: 100, mb: 1, width: 100, borderRadius: 1 }} />}
              {filePreviews.media_file_mobile && <CardMedia component="img" image={filePreviews.media_file_mobile} sx={{ height: 100, mb: 1, width: 100, borderRadius: 1 }} />}
              <Button variant="outlined" component="label" startIcon={<UploadFile />}>Upload Mobile File<input type="file" name="media_file_mobile" hidden onChange={handleFileChange} accept="image/*,video/*"/></Button>
              {form.media_file_mobile?.name && <Typography variant="caption" display="block" mt={1}>{form.media_file_mobile.name}</Typography>}
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel control={<Switch checked={form.loop_video} onChange={handleFormChange} name="loop_video" />} label="Loop Video" />
              <FormControlLabel control={<Switch checked={form.is_active} onChange={handleFormChange} name="is_active" />} label="Is Active" />
            </Grid>
            
            <Grid item xs={12}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button onClick={resetForm} color="inherit">Cancel</Button>
                <Button type="submit" variant="contained" disabled={loading}>{loading ? <CircularProgress size={24} /> : (editingBanner ? 'Save Changes' : 'Create Banner')}</Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Typography variant="h5" gutterBottom>Existing Banners</Typography>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="banners">
          {(provided) => (
            <Box {...provided.droppableProps} ref={provided.innerRef}>
              {banners.map((banner, index) => (
                <Draggable key={banner.id} draggableId={String(banner.id)} index={index}>
                  {(provided) => (
                    <Card ref={provided.innerRef} {...provided.draggableProps} sx={{ mb: 2, display: 'flex' }}>
                      <Box {...provided.dragHandleProps} sx={{ display: 'flex', alignItems: 'center', p: 1.5, cursor: 'grab', bgcolor: 'grey.100' }}><DragIndicator /></Box>
                      <CardMedia component={banner.type === 'video' ? 'video' : 'img'} src={banner.media_url} autoPlay={banner.type === 'video'} muted loop sx={{ width: 150, height: 100, objectFit: 'cover' }}/>
                      <CardContent sx={{ flex: 1 }}><Typography variant="h6">{banner.alt}</Typography><Typography variant="body2" color="text.secondary">Order: {banner.order}</Typography></CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                        <FormControlLabel control={<Switch checked={banner.is_active} onChange={() => handleUpdate(banner.id, { is_active: !banner.is_active })} />} label={banner.is_active ? "Active" : "Inactive"}/>
                        <IconButton onClick={() => setPreviewBanner(banner)}><Visibility /></IconButton>
                        <IconButton color="primary" onClick={() => handleEditClick(banner)}><Edit /></IconButton>
                        <IconButton color="error" onClick={() => handleDelete(banner.id)}><Delete /></IconButton>
                      </Box>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>
      
      <Modal open={!!previewBanner} onClose={() => setPreviewBanner(null)} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500 }}>
        <Fade in={!!previewBanner}>
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90%', maxWidth: 1200, bgcolor: 'background.paper', boxShadow: 24, p: 0 }}>
            <BannerPreview banner={previewBanner} />
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default BannerManager;