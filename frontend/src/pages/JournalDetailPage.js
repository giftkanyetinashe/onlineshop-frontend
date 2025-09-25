import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './content2.css';

const JournalDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedEntries, setRelatedEntries] = useState([]);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const fetchEntryData = async () => {
      if (!slug) {
        setError('Invalid journal entry');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get(`content/journal/?slug=${slug}`);
        
        if (response.data && response.data.length > 0) {
          const entryData = response.data[0];
          
          if (!entryData.is_published || new Date(entryData.published_at) > new Date()) {
            navigate('/journal', { replace: true });
            return;
          }
          
          setEntry(entryData);
          
          try {
            await api.post(`content/journal/${entryData.slug}/increment_views/`);
          } catch (viewError) {
            console.warn('Could not increment view count:', viewError);
          }
          
          const allEntries = await api.get('content/journal/');
          const related = allEntries.data
            .filter(e => e.id !== entryData.id && e.is_published)
            .slice(0, 3);
          setRelatedEntries(related);
        } else {
          setError('Journal entry not found');
        }
      } catch (err) {
        setError('There was a problem loading this journal entry.');
        console.error('Journal detail fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEntryData();
  }, [slug, navigate]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: entry.title,
          text: entry.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  if (loading) {
    return (
      <div className="journal-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading our story...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="journal-detail-error">
        <div className="error-icon">✨</div>
        <h3>Story Not Found</h3>
        <p>{error}</p>
        <Link to="/journal" className="back-button">
          ← Back to Journal
        </Link>
      </div>
    );
  }

  if (!entry) {
    return null;
  }

  return (
    <div className="journal-detail-container">
      {/* Hero Section */}
      <section className="article-hero">
        <div className="hero-content">
          <div className="hero-text">
            <nav className="breadcrumb">
              <Link to="/journal">Journal</Link>
              <span className="breadcrumb-divider">/</span>
              <span>{entry.title}</span>
            </nav>
            
            <h1 className="article-title">{entry.title}</h1>
            
            <div className="article-meta">
              <div className="meta-row">
                <span className="author">By {entry.author_name}</span>
                <span className="divider">•</span>
                <time className="publish-date">
                  {new Date(entry.published_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              </div>
              <div className="meta-row">
                <span className="reading-time">{entry.reading_time} min read</span>
                <span className="divider">•</span>
                <span className="view-count">{entry.view_count} views</span>
              </div>
            </div>
          </div>

          {entry.featured_image && (
            <div className="hero-image">
              <img 
                src={entry.featured_image} 
                alt={entry.image_alt_text || entry.title}
                onLoad={handleImageLoad}
                style={{ opacity: imageLoaded ? 1 : 0, transition: 'opacity 0.3s ease' }}
              />
              {!imageLoaded && (
                <div style={{ 
                  height: '100%', 
                  background: 'var(--sandstone-200)', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--sandstone-600)'
                }}>
                  Loading image...
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Content Section */}
      <section className="article-content-section">
        <div className="content-wrapper">
          <div className="article-content">
            <div 
              className="content-html"
              dangerouslySetInnerHTML={{ __html: entry.content }}
            />
          </div>

          <footer className="article-footer">
            <div className="article-tags">
              <span>Luxury Beauty Journal</span>
            </div>
            
            <div className="article-actions">
              <button className="share-button" onClick={handleShare}>
                <span>Share Story</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                </svg>
              </button>
            </div>
          </footer>
        </div>
      </section>

      {/* Related Entries */}
      {relatedEntries.length > 0 && (
        <section className="related-entries">
          <div className="related-wrapper">
            <h3>Discover More Stories</h3>
            <div className="related-grid">
              {relatedEntries.map(relatedEntry => (
                <div key={relatedEntry.id} className="related-card">
                  {relatedEntry.featured_image && (
                    <div className="related-image">
                      <img 
                        src={relatedEntry.featured_image} 
                        alt={relatedEntry.image_alt_text || relatedEntry.title}
                      />
                    </div>
                  )}
                  <div className="related-content">
                    <h4>
                      <Link to={`/journal/${relatedEntry.slug}`}>
                        {relatedEntry.title}
                      </Link>
                    </h4>
                    <p>{relatedEntry.excerpt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Navigation */}
      <nav className="article-navigation">
        <Link to="/journal" className="back-to-journal">
          ← Explore More Journal Stories
        </Link>
      </nav>
    </div>
  );
};

export default JournalDetail;