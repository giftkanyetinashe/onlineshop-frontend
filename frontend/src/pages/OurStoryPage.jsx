import React, { useState, useEffect } from 'react';
import axios from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './content.css';

function OurStoryPage() {
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const response = await axios.get('/content/our-story/');
        setStory(response.data);
      } catch (err) {
        setError('Failed to load our story. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStory();
  }, []);

  if (loading) return (
    <div className="story-loading-container">
      <div className="loading-pulse">
        <LoadingSpinner />
        <p className="loading-text">Crafting your experience</p>
      </div>
    </div>
  );
  
  if (error) return <p className="story-error-message">{error}</p>;
  if (!story) return null;

  return (
    <div className="story-page">
      {/* Animated background elements */}
      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
      
      <div className="story-hero-section">
        <div className="hero-content">
          <h1 className="hero-title" data-text={story.main_heading}>
            <span>{story.main_heading}</span>
          </h1>
          <div className="hero-scroll-indicator">
            <span>Scroll to explore</span>
            <div className="scroll-line"></div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="floating-card">
            <img src={story.founder_image} alt="Nuareskyn Founder" className="founder-visual" />
          </div>
        </div>
      </div>
      
      <div className="story-content-wrapper">
        <div className="content-main">
          <section className="story-section founder-story">
            <div className="section-header">
              <h2 className="section-title">{story.title}</h2>
              <div className="title-underline"></div>
            </div>
            <div className="text-content">
              <p>{story.content}</p>
            </div>
            <div className="visual-element">
              <div className="floating-stat">
                <span className="stat-number">2018</span>
                <span className="stat-label">Year of Foundation</span>
              </div>
            </div>
          </section>
          
          {story.mission_statement && (
            <section className="story-section mission-story">
              <div className="mission-card">
                <div className="card-border"></div>
                <div className="card-content">
                  <h3 className="mission-title">Our Ethos</h3>
                  <blockquote className="mission-statement">
                    <div className="quote-mark">"</div>
                    {story.mission_statement}
                  </blockquote>
                  <div className="mission-decoration">
                    <div className="decoration-line"></div>
                    <div className="symbol-icon">✦</div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export default OurStoryPage;