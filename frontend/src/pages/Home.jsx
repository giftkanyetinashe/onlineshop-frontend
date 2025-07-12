import React, { useEffect, useState, useRef } from 'react';
import {
  Grid,
  Typography,
  Box,
  Skeleton,
  Button,
  IconButton,
  useTheme
} from '@mui/material';
import {
  ArrowBackIos,
  ArrowForwardIos,
  PlayArrow,
  Pause
} from '@mui/icons-material';
import ProductCard from '../components/ProductCard';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import HeroBanner from '../components/HeroBanner';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

const AutoRotatingBanner = ({ bannerContent }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef(null);
  const theme = useTheme();

  useEffect(() => {
    let interval;
    if (isPlaying && bannerContent.length > 0) {
      interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % bannerContent.length);
      }, bannerContent[currentIndex].duration);
    }
    return () => clearInterval(interval);
  }, [currentIndex, isPlaying, bannerContent]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % bannerContent.length);
    setIsPlaying(false);
    setTimeout(() => setIsPlaying(true), 100);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + bannerContent.length) % bannerContent.length);
    setIsPlaying(false);
    setTimeout(() => setIsPlaying(true), 100);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying && videoRef.current) {
      videoRef.current.play();
    } else if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  if (bannerContent.length === 0) {
    return null;
  }

  const currentContent = bannerContent[currentIndex];

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '70vh', overflow: 'hidden', mb: 6 }}>
      <AnimatePresence mode='wait'>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', height: '100%' }}
        >
          {currentContent.type === 'video' ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              loop={false}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onEnded={handleNext}
            >
              <source src={currentContent.src} type="video/mp4" />
            </video>
          ) : (
            <img
              src={currentContent.src}
              alt={currentContent.alt}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', color: 'white', backgroundColor: 'rgba(0,0,0,0.4)', p: 4 }}>
            <Typography variant="h2" component="h2" sx={{ fontWeight: 700, mb: 3, textShadow: '2px 2px 4px rgba(0,0,0,0.5)', [theme.breakpoints.down('md')]: { fontSize: '2.5rem' }, [theme.breakpoints.down('sm')]: { fontSize: '2rem' } }}>{currentContent.overlayText}</Typography>
            <Button variant="contained" color="secondary" size="large" href={currentContent.ctaLink} sx={{ px: 6, py: 2, fontSize: '1.1rem', fontWeight: 600 }}>{currentContent.ctaText}</Button>
          </Box>
        </motion.div>
      </AnimatePresence>
      <IconButton onClick={handlePrev} sx={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: 'white', backgroundColor: 'rgba(0,0,0,0.5)', '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' } }}><ArrowBackIos /></IconButton>
      <IconButton onClick={handleNext} sx={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', color: 'white', backgroundColor: 'rgba(0,0,0,0.5)', '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' } }}><ArrowForwardIos /></IconButton>
      <IconButton onClick={togglePlay} sx={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', color: 'white', backgroundColor: 'rgba(0,0,0,0.5)', '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' } }}>{isPlaying ? <Pause /> : <PlayArrow />}</IconButton>
      <Box sx={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 1 }}>
        {bannerContent.map((_, index) => (
          <Box key={index} onClick={() => { setCurrentIndex(index); setIsPlaying(true); }} sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: index === currentIndex ? theme.palette.secondary.main : 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'all 0.3s', '&:hover': { backgroundColor: theme.palette.secondary.light } }} />
        ))}
      </Box>
    </Box>
  );
};

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bannerContent, setBannerContent] = useState([]);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/products/products/featured/');
        setFeaturedProducts(response.data);
      } catch (err) {
        console.error('Error fetching featured products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedProducts();
  }, []);

  useEffect(() => {
    const fetchBannerContent = async () => {
      try {
        const response = await api.get('/orders/banner/');
        const transformedData = response.data.map((item) => ({
          src: item.type === 'image' ? item.media_file : item.src,
          type: item.type,
          alt: item.alt || '',
          overlayText: item.overlayText || '',
          ctaText: item.ctaText || '',
          ctaLink: item.ctaLink || '#',
          duration: item.duration || 5000
        }));

        setBannerContent(transformedData);
      } catch (err) {
        console.error('Error fetching banner content:', err);
      }
    };
    fetchBannerContent();
  }, []);


  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Skeleton variant="rectangular" width="80%" height="50vh" />
      </Box>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  if (featuredProducts.length === 0) {
    return <EmptyState message="No products found." />;
  }

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AutoRotatingBanner bannerContent={bannerContent} />
      <HeroBanner title="Discover Our Collection" subtitle="Premium quality for your everyday needs" ctaText="Shop Now" ctaLink="/products" />
      <Grid container spacing={4}>
        {featuredProducts.map(product => (
          <motion.div key={product.id} variants={{}}>
            <Grid item xs={12} sm={6} md={4}>
              <ProductCard product={product} />
            </Grid>
          </motion.div>
        ))}
      </Grid>
    </Box>
  );
};

export default Home;
