import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './content.css';

function JournalListPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await axios.get('/content/journal/');
        setEntries(response.data);
      } catch (err) {
        setError('Failed to load journal entries.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEntries();
  }, []);

  if (loading) return (
    <div className="journal-loading-container">
      <LoadingSpinner />
      <p className="journal-loading-text">Curating your journal</p>
    </div>
  );
  
  if (error) return <p className="journal-error-message">{error}</p>;

  return (
    <div className="journal-container">
      <div className="journal-header">
        <h1 className="journal-title">The Journal</h1>
      </div>
      
      <div className="journal-grid">
        {entries.map((entry) => (
          <Link to={`/journal/${entry.slug}`} key={entry.slug} className="journal-card">
            <div className="card-image-container">
              <img src={entry.featured_image} alt={entry.title} className="card-image" />
              <div className="card-overlay"></div>
            </div>
            <div className="card-content">
              <h3 className="card-title">{entry.title}</h3>
              <p className="card-excerpt">{entry.excerpt}</p>
              <div className="card-footer">
                <span className="read-more">Read More</span>
                <div className="arrow-icon">→</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default JournalListPage;