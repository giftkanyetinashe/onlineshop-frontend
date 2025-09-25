import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/ourstory.css';

const OurStory = () => {
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const response = await api.get('content/our-story/active/');
        setStory(response.data);
        setTimeout(() => setIsVisible(true), 100);
      } catch (err) {
        console.error('Our Story fetch error:', err);
        setError('There was a problem loading our story. Please check back later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, []);

  if (loading) {
    return (
      <div className="our-story-loading fade-in">
        <div className="loading-spinner"></div>
        <p>Loading our story...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="our-story-error fade-in">
        <div className="error-icon">📖</div>
        <h3>Story Unavailable</h3>
        <p>{error}</p>
        <button 
          className="cta-button" 
          onClick={() => window.location.reload()}
          style={{marginTop: '2rem'}}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="our-story-empty fade-in">
        <div className="empty-icon">✨</div>
        <h2>Our Story is Being Written</h2>
        <p>We're crafting our story and will share it with you soon.</p>
      </div>
    );
  }

  return (
    <div className={`our-story-container ${isVisible ? 'fade-in' : ''}`}>
      <article className="our-story-article">
        {/* Hero Section */}
        <header className="story-hero">
          {story.featured_image && (
            <div className="story-hero-image">
              <img 
                src={story.featured_image} 
                alt={story.image_alt_text || story.title}
                loading="eager"
              />
            </div>
          )}
          <div className="story-hero-content">
            <h1 className="story-title slide-in">{story.title}</h1>
            {story.subtitle && (
              <h2 className="story-subtitle slide-in">{story.subtitle}</h2>
            )}
            <div className="story-meta slide-in">
              <span>Last updated: {new Date(story.updated_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
          </div>
        </header>

        {/* Content Section */}
        <div className="story-content">
          <div 
            className="story-html-content"
            dangerouslySetInnerHTML={{ __html: story.content }}
          />
        </div>

        {/* Call to Action */}
        <footer className="story-footer">
          <div className="story-cta">
            <h3>Continue Your Journey</h3>
            <p>Discover more about our philosophy, ingredients, and commitment to luxury beauty in our journal.</p>
            <a href="/journal" className="cta-button">
              Explore Our Journal
            </a>
          </div>
        </footer>
      </article>
    </div>
  );
};

export default OurStory;