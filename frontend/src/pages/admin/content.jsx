import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import '../../styles/content.css';

const Content = () => {
  const [activeTab, setActiveTab] = useState('journal');
  const [ourStory, setOurStory] = useState({ 
    title: '', 
    subtitle: '', 
    content: '', 
    featured_image: null,
    image_alt_text: '',
    meta_description: '',
    seo_title: '',
    is_published: false
  });
  const [journalEntries, setJournalEntries] = useState([]);
  const [editingJournalEntry, setEditingJournalEntry] = useState(null);
  const [isEditingOurStory, setIsEditingOurStory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchContentData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showNotification = (message, type = 'success') => {
    const id = Date.now();
    const notification = { id, message, type };
    setNotifications(prev => [...prev, notification]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const fetchContentData = async () => {
    try {
      setLoading(true);
      const [ourStoryResponse, journalResponse] = await Promise.all([
        api.get('content/our-story/'),
        api.get('content/journal/')
      ]);
      
      if (ourStoryResponse.data && ourStoryResponse.data.length > 0) {
        setOurStory(ourStoryResponse.data[0]);
      }
      
      setJournalEntries(journalResponse.data);
    } catch (error) {
      console.error('Failed to fetch content data:', error);
      showNotification('Failed to load content data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImagePreview = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
  };

  // Our Story Handlers
  const handleOurStoryChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'featured_image' && files && files[0]) {
      handleImagePreview(files[0]);
      setOurStory(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else {
      setOurStory(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleOurStorySubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const formData = new FormData();
    Object.keys(ourStory).forEach(key => {
      if (ourStory[key] !== null && ourStory[key] !== undefined) {
        if (key === 'featured_image' && ourStory[key] instanceof File) {
          formData.append(key, ourStory[key]);
        } else {
          formData.append(key, ourStory[key]);
        }
      }
    });

    try {
      if (ourStory.id) {
        await api.patch(`content/our-story/${ourStory.id}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('content/our-story/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      showNotification('Our Story saved successfully!');
      setIsEditingOurStory(false);
      setPreviewImage(null);
      fetchContentData();
    } catch (error) {
      console.error('Failed to update Our Story:', error);
      showNotification('Error saving Our Story', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Journal Handlers
  const handleNewJournalClick = () => {
    setEditingJournalEntry({ 
      title: '', 
      slug: '', 
      excerpt: '', 
      content: '', 
      featured_image: null, 
      image_alt_text: '',
      meta_description: '',
      is_published: false,
      published_at: new Date().toISOString().slice(0, 16)
    });
    setPreviewImage(null);
  };

  const handleJournalFormChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (name === 'featured_image' && files && files[0]) {
      handleImagePreview(files[0]);
      setEditingJournalEntry(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else {
      setEditingJournalEntry(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 50);
  };

  const handleJournalSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    if (!editingJournalEntry.slug && editingJournalEntry.title) {
      setEditingJournalEntry(prev => ({
        ...prev,
        slug: generateSlug(prev.title)
      }));
    }

    const formData = new FormData();
    Object.keys(editingJournalEntry).forEach(key => {
      if (editingJournalEntry[key] !== null && editingJournalEntry[key] !== undefined) {
        if (key === 'featured_image' && editingJournalEntry[key] instanceof File) {
          formData.append(key, editingJournalEntry[key]);
        } else {
          formData.append(key, editingJournalEntry[key]);
        }
      }
    });

    try {
      if (editingJournalEntry.id) {
        await api.patch(`content/journal/${editingJournalEntry.id}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('content/journal/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      showNotification('Journal entry saved successfully!');
      setEditingJournalEntry(null);
      setPreviewImage(null);
      fetchContentData();
    } catch (error) {
      console.error('Failed to save journal entry:', error);
      showNotification('Error saving journal entry', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteJournal = async (id) => {
    if (window.confirm('Are you sure you want to delete this journal entry? This action cannot be undone.')) {
      try {
        await api.delete(`content/journal/${id}/`);
        showNotification('Journal entry deleted successfully');
        fetchContentData();
      } catch (error) {
        console.error('Failed to delete journal entry:', error);
        showNotification('Error deleting journal entry', 'error');
      }
    }
  };

  const handlePublishToggle = async (entry) => {
    try {
      const updatedEntry = { ...entry, is_published: !entry.is_published };
      await api.patch(`content/journal/${entry.id}/`, updatedEntry);
      showNotification(`Entry ${updatedEntry.is_published ? 'published' : 'unpublished'}`);
      fetchContentData();
    } catch (error) {
      console.error('Failed to update publication status:', error);
      showNotification('Error updating publication status', 'error');
    }
  };

  const filteredJournalEntries = journalEntries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' ? true :
                         statusFilter === 'published' ? entry.is_published :
                         statusFilter === 'draft' ? !entry.is_published : true;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading content manager...</p>
      </div>
    );
  }

  return (
    <div className="admin-content-manager">
      {/* Notifications */}
      <div className="notifications-container">
        {notifications.map(notification => (
          <div key={notification.id} className={`admin-notification admin-notification-${notification.type}`}>
            <div className="notification-content">
              <span className="notification-icon">
                {notification.type === 'success' ? '✓' : '⚠'}
              </span>
              <span>{notification.message}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="admin-header">
        <h1>Content Management</h1>
        <p>Manage your website content and journal entries</p>
      </header>

      {/* Navigation Tabs */}
      <nav className="admin-tabs">
        <button 
          className={`tab-button ${activeTab === 'journal' ? 'active' : ''}`}
          onClick={() => setActiveTab('journal')}
        >
          <span className="tab-icon">📝</span>
          Journal Entries
          <span className="tab-count">{journalEntries.length}</span>
        </button>
        <button 
          className={`tab-button ${activeTab === 'our-story' ? 'active' : ''}`}
          onClick={() => setActiveTab('our-story')}
        >
          <span className="tab-icon">📖</span>
          Our Story
        </button>
      </nav>

      {/* Journal Management */}
      {activeTab === 'journal' && (
        <section className="journal-admin">
          <div className="admin-section-header">
            <h2>Journal Management</h2>
            <div className="admin-actions">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <span className="search-icon">🔍</span>
              </div>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="status-filter"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
              <button 
                onClick={handleNewJournalClick}
                className="btn-primary"
                disabled={editingJournalEntry}
              >
                <span className="btn-icon">+</span>
                New Entry
              </button>
            </div>
          </div>

          {editingJournalEntry ? (
            <div className="editor-container">
              <div className="editor-header">
                <h3>{editingJournalEntry.id ? 'Edit Journal Entry' : 'Create New Journal Entry'}</h3>
                <button 
                  onClick={() => setEditingJournalEntry(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleJournalSubmit} className="editor-form">
                <div className="form-grid">
                  <div className="form-main">
                    <div className="form-group">
                      <label htmlFor="title">Title *</label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={editingJournalEntry.title}
                        onChange={handleJournalFormChange}
                        placeholder="Enter journal entry title"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="slug">Slug *</label>
                      <input
                        type="text"
                        id="slug"
                        name="slug"
                        value={editingJournalEntry.slug}
                        onChange={handleJournalFormChange}
                        placeholder="URL-friendly slug"
                        required
                      />
                      <button 
                        type="button"
                        onClick={() => setEditingJournalEntry(prev => ({
                          ...prev,
                          slug: generateSlug(prev.title)
                        }))}
                        className="generate-slug-btn"
                      >
                        Generate from title
                      </button>
                    </div>

                    <div className="form-group">
                      <label htmlFor="excerpt">Excerpt</label>
                      <textarea
                        id="excerpt"
                        name="excerpt"
                        value={editingJournalEntry.excerpt}
                        onChange={handleJournalFormChange}
                        placeholder="Brief description for previews"
                        rows="3"
                        maxLength="300"
                      />
                      <div className="char-count">
                        {editingJournalEntry.excerpt.length}/300
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="content">Content *</label>
                      <textarea
                        id="content"
                        name="content"
                        value={editingJournalEntry.content}
                        onChange={handleJournalFormChange}
                        placeholder="Write your journal entry content here..."
                        rows="12"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="meta_description">Meta Description</label>
                      <textarea
                        id="meta_description"
                        name="meta_description"
                        value={editingJournalEntry.meta_description}
                        onChange={handleJournalFormChange}
                        placeholder="SEO description (max 160 characters)"
                        rows="2"
                        maxLength="160"
                      />
                      <div className="char-count">
                        {editingJournalEntry.meta_description?.length || 0}/160
                      </div>
                    </div>
                  </div>

                  <div className="form-sidebar">
                    <div className="form-group">
                      <label>Featured Image</label>
                      <div className="image-upload-area">
                        {previewImage || editingJournalEntry.featured_image ? (
                          <div className="image-preview">
                            <img 
                              src={previewImage || editingJournalEntry.featured_image} 
                              alt="Preview" 
                            />
                            <button 
                              type="button"
                              onClick={() => {
                                setEditingJournalEntry(prev => ({ ...prev, featured_image: null }));
                                setPreviewImage(null);
                              }}
                              className="remove-image-btn"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <label htmlFor="featured_image" className="upload-placeholder">
                            <span className="upload-icon">📷</span>
                            <span>Click to upload image</span>
                            <input
                              type="file"
                              id="featured_image"
                              name="featured_image"
                              onChange={handleJournalFormChange}
                              accept="image/*"
                              hidden
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="image_alt_text">Image Alt Text</label>
                      <input
                        type="text"
                        id="image_alt_text"
                        name="image_alt_text"
                        value={editingJournalEntry.image_alt_text}
                        onChange={handleJournalFormChange}
                        placeholder="Description for accessibility"
                      />
                    </div>

                    <div className="publish-settings">
                      <h4>Publication Settings</h4>
                      
                      <div className="form-group checkbox-group">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            name="is_published"
                            checked={editingJournalEntry.is_published}
                            onChange={handleJournalFormChange}
                          />
                          <span className="checkmark"></span>
                          Publish this entry
                        </label>
                      </div>

                      <div className="form-group">
                        <label htmlFor="published_at">Publish Date & Time</label>
                        <input
                          type="datetime-local"
                          id="published_at"
                          name="published_at"
                          value={editingJournalEntry.published_at}
                          onChange={handleJournalFormChange}
                        />
                      </div>
                    </div>

                    <div className="form-actions">
                      <button 
                        type="submit" 
                        className="btn-primary save-btn"
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <div className="spinner-small"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <span className="btn-icon">💾</span>
                            Save Entry
                          </>
                        )}
                      </button>
                      
                      {editingJournalEntry.id && (
                        <button 
                          type="button"
                          onClick={() => handleDeleteJournal(editingJournalEntry.id)}
                          className="btn-danger"
                        >
                          Delete Entry
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            <div className="entries-list">
              {filteredJournalEntries.length > 0 ? (
                <div className="entries-grid">
                  {filteredJournalEntries.map(entry => (
                    <div key={entry.id} className="entry-card">
                      <div className="entry-image">
                        {entry.featured_image ? (
                          <img src={entry.featured_image} alt={entry.image_alt_text} />
                        ) : (
                          <div className="no-image">📝</div>
                        )}
                      </div>
                      
                      <div className="entry-content">
                        <h4 className="entry-title">{entry.title}</h4>
                        <p className="entry-excerpt">{entry.excerpt || 'No excerpt provided'}</p>
                        
                        <div className="entry-meta">
                          <span className={`status-badge ${entry.is_published ? 'published' : 'draft'}`}>
                            {entry.is_published ? 'Published' : 'Draft'}
                          </span>
                          <span className="entry-date">
                            {new Date(entry.published_at).toLocaleDateString()}
                          </span>
                          <span className="entry-views">{entry.view_count} views</span>
                        </div>
                      </div>
                      
                      <div className="entry-actions">
                        <button 
                          onClick={() => {
                            setEditingJournalEntry(entry);
                            setPreviewImage(entry.featured_image);
                          }}
                          className="btn-secondary"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handlePublishToggle(entry)}
                          className={`btn-${entry.is_published ? 'secondary' : 'primary'}`}
                        >
                          {entry.is_published ? 'Unpublish' : 'Publish'}
                        </button>
                        <button 
                          onClick={() => handleDeleteJournal(entry.id)}
                          className="btn-danger"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📝</div>
                  <h3>No journal entries found</h3>
                  <p>{searchTerm || statusFilter !== 'all' ? 'Try adjusting your search or filters' : 'Create your first journal entry to get started'}</p>
                  <button onClick={handleNewJournalClick} className="btn-primary">
                    Create New Entry
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Our Story Management */}
      {activeTab === 'our-story' && (
        <section className="our-story-admin">
          <div className="admin-section-header">
            <h2>Our Story</h2>
            <div className="admin-actions">
              {!isEditingOurStory && (
                <button 
                  onClick={() => setIsEditingOurStory(true)}
                  className="btn-primary"
                >
                  {ourStory.id ? 'Edit Our Story' : 'Create Our Story'}
                </button>
              )}
            </div>
          </div>

          {isEditingOurStory ? (
            <div className="editor-container">
              <div className="editor-header">
                <h3>{ourStory.id ? 'Edit Our Story' : 'Create Our Story'}</h3>
                <button 
                  onClick={() => {
                    setIsEditingOurStory(false);
                    setPreviewImage(null);
                    fetchContentData();
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleOurStorySubmit} className="editor-form">
                <div className="form-grid">
                  <div className="form-main">
                    <div className="form-group">
                      <label htmlFor="ourstory-title">Title *</label>
                      <input
                        type="text"
                        id="ourstory-title"
                        name="title"
                        value={ourStory.title}
                        onChange={handleOurStoryChange}
                        placeholder="Enter story title"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="ourstory-subtitle">Subtitle</label>
                      <input
                        type="text"
                        id="ourstory-subtitle"
                        name="subtitle"
                        value={ourStory.subtitle}
                        onChange={handleOurStoryChange}
                        placeholder="Enter story subtitle"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="ourstory-content">Content *</label>
                      <textarea
                        id="ourstory-content"
                        name="content"
                        value={ourStory.content}
                        onChange={handleOurStoryChange}
                        placeholder="Tell your story..."
                        rows="15"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="ourstory-meta_description">Meta Description</label>
                      <textarea
                        id="ourstory-meta_description"
                        name="meta_description"
                        value={ourStory.meta_description}
                        onChange={handleOurStoryChange}
                        placeholder="SEO description (max 160 characters)"
                        rows="2"
                        maxLength="160"
                      />
                      <div className="char-count">
                        {ourStory.meta_description?.length || 0}/160
                      </div>
                    </div>
                  </div>

                  <div className="form-sidebar">
                    <div className="form-group">
                      <label>Featured Image</label>
                      <div className="image-upload-area">
                        {previewImage || ourStory.featured_image ? (
                          <div className="image-preview">
                            <img 
                              src={previewImage || ourStory.featured_image} 
                              alt="Preview" 
                            />
                            <button 
                              type="button"
                              onClick={() => {
                                setOurStory(prev => ({ ...prev, featured_image: null }));
                                setPreviewImage(null);
                              }}
                              className="remove-image-btn"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <label htmlFor="ourstory-featured_image" className="upload-placeholder">
                            <span className="upload-icon">📷</span>
                            <span>Click to upload image</span>
                            <input
                              type="file"
                              id="ourstory-featured_image"
                              name="featured_image"
                              onChange={handleOurStoryChange}
                              accept="image/*"
                              hidden
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="ourstory-image_alt_text">Image Alt Text</label>
                      <input
                        type="text"
                        id="ourstory-image_alt_text"
                        name="image_alt_text"
                        value={ourStory.image_alt_text}
                        onChange={handleOurStoryChange}
                        placeholder="Description for accessibility"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="ourstory-seo_title">SEO Title</label>
                      <input
                        type="text"
                        id="ourstory-seo_title"
                        name="seo_title"
                        value={ourStory.seo_title}
                        onChange={handleOurStoryChange}
                        placeholder="SEO title (max 60 characters)"
                        maxLength="60"
                      />
                      <div className="char-count">
                        {ourStory.seo_title?.length || 0}/60
                      </div>
                    </div>

                    <div className="form-actions">
                      <button 
                        type="submit" 
                        className="btn-primary save-btn"
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <div className="spinner-small"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <span className="btn-icon">💾</span>
                            Save Story
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            <div className="content-preview">
              {ourStory.id ? (
                <div className="story-preview">
                  <div className="preview-header">
                    <h3>{ourStory.title}</h3>
                    <div className="preview-meta">
                      <span>Last updated: {new Date(ourStory.updated_at).toLocaleDateString()}</span>
                      <span className={`status-badge ${ourStory.is_published ? 'published' : 'draft'}`}>
                        {ourStory.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>
                  
                  {ourStory.featured_image && (
                    <div className="preview-image">
                      <img src={ourStory.featured_image} alt={ourStory.image_alt_text} />
                    </div>
                  )}
                  
                  <div className="preview-content">
                    <h4>Content Preview:</h4>
                    <div className="content-snippet">
                      {ourStory.content.substring(0, 200)}...
                    </div>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📖</div>
                  <h3>No Our Story content yet</h3>
                  <p>Create your Our Story page to share your brand's journey with visitors</p>
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default Content;