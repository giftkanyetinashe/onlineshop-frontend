import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './content.css';

const Journal = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [featuredEntry, setFeaturedEntry] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchJournalData = async () => {
      try {
        const [entriesResponse, featuredResponse] = await Promise.all([
          api.get('content/journal/'),
          api.get('content/journal/featured/')
        ]);
        
        const publishedEntries = entriesResponse.data.filter(entry => 
          entry.is_published && new Date(entry.published_at) <= new Date()
        );
        
        setEntries(publishedEntries);
        setFeaturedEntry(featuredResponse.data[0] || publishedEntries[0]);
        setTimeout(() => setIsVisible(true), 100);
      } catch (err) {
        setError('Failed to load journal entries. Please try again later.');
        console.error('Journal fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJournalData();
  }, []);

  if (loading) {
    return (
      <div className="journal-loading fade-in">
        <div className="loading-spinner"></div>
        <p>Loading inspiring stories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="journal-error fade-in">
        <div className="error-icon">📖</div>
        <h3>Something went wrong</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={`journal-container ${isVisible ? 'fade-in' : ''}`}>
      {/* Hero Section */}
      <header className="journal-hero">
        <h1 className="journal-title slide-in">The Journal</h1>
        <p className="journal-subtitle slide-in">Stories, insights, and beauty moments worth sharing</p>
      </header>

      {/* Featured Entry */}
      {featuredEntry && (
        <section className="featured-entry">
          <div className="featured-content">
            <div className="featured-text">
              <span className="featured-badge">Featured Story</span>
              <h2 className="featured-title">{featuredEntry.title}</h2>
              <p className="featured-excerpt">{featuredEntry.excerpt}</p>
              <div className="entry-meta">
                <span className="author">By {featuredEntry.author_name}</span>
                <span className="divider">•</span>
                <span className="date">
                  {new Date(featuredEntry.published_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <span className="divider">•</span>
                <span className="reading-time">{featuredEntry.reading_time} min read</span>
              </div>
              <Link to={`/journal/${featuredEntry.slug}`} className="featured-read-more">
                Read Full Story →
              </Link>
            </div>
            {featuredEntry.featured_image && (
              <div className="featured-image">
                <img 
                  src={featuredEntry.featured_image} 
                  alt={featuredEntry.image_alt_text || featuredEntry.title}
                  loading="eager"
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Journal Grid */}
      <section className="journal-grid-section">
        <h3 className="grid-title">Latest Entries</h3>
        {entries.length > 0 ? (
          <div className="journal-grid">
            {entries.map((entry, index) => (
              <article key={entry.id} className="journal-card fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                {entry.featured_image && (
                  <div className="card-image">
                    <img 
                      src={entry.featured_image} 
                      alt={entry.image_alt_text || entry.title}
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="card-content">
                  <div className="card-meta">
                    <span className="card-date">
                      {new Date(entry.published_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    <span className="card-reading-time">{entry.reading_time} min read</span>
                  </div>
                  <h4 className="card-title">{entry.title}</h4>
                  <p className="card-excerpt">{entry.excerpt}</p>
                  <div className="card-footer">
                    <span className="card-author">By {entry.author_name}</span>
                    <Link to={`/journal/${entry.slug}`} className="card-link">
                      Read More →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="no-entries fade-in">
            <div className="no-entries-icon">✨</div>
            <h4>No entries yet</h4>
            <p>We're crafting beautiful stories and will share them with you soon.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Journal;