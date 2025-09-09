import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './content.css';

function JournalDetailPage() {
  const { slug } = useParams();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const response = await axios.get(`/content/journal/${slug}/`);
        setEntry(response.data);
      } catch (err) {
        setError('Could not find this journal entry.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEntry();
  }, [slug]);

  if (loading) return (
    <div className="journal-detail-loading">
      <LoadingSpinner />
      <p className="journal-detail-loading-text">Loading entry</p>
    </div>
  );
  
  if (error) return <p className="journal-detail-error">{error}</p>;
  if (!entry) return null;

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <article className="journal-detail-container">
      <header className="journal-detail-header">
        <img src={entry.featured_image} alt={entry.title} className="journal-detail-image" />
        <div className="journal-detail-overlay">
          <h1 className="journal-detail-title">{entry.title}</h1>
          <p className="journal-detail-meta">
            By {entry.author_name} on {formatDate(entry.published_at)}
          </p>
        </div>
      </header>
      <div
        className="journal-detail-content"
        dangerouslySetInnerHTML={{ __html: entry.content }}
      />
    </article>
  );
}

export default JournalDetailPage;