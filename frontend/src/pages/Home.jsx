import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Grid,
  Typography,
  Box,
  Button,
  IconButton,
  Container,
  Stack,
  // =================================================================
  // FIX: Import the necessary hooks for responsiveness
  // =================================================================
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ArrowBackIosNew as ArrowBackIcon,
  ArrowForwardIos as ArrowForwardIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// Import our components
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import ErrorState from '../components/ErrorState';
import api from '../services/api';

// ===============================================
// 1. The Banner Component, now fully responsive
// ===============================================
const NuaréSkynBanner = ({ bannerContent }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef(null);
  // Hooks for detecting screen size
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleNextSlide = useCallback(() => {
    if (bannerContent.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % bannerContent.length);
    }
  }, [bannerContent.length]);

  const handlePrevSlide = useCallback(() => {
    if (bannerContent.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + bannerContent.length) % bannerContent.length);
    }
  }, [bannerContent.length]);

  useEffect(() => {
    if (!isPlaying || bannerContent.length <= 1) return;
    const currentSlide = bannerContent[currentIndex];
    let intervalId = null;
    if (currentSlide.type === 'image') {
      intervalId = setInterval(handleNextSlide, currentSlide.duration || 7000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [currentIndex, isPlaying, bannerContent, handleNextSlide]);

  const togglePlay = () => {
    const newIsPlaying = !isPlaying;
    setIsPlaying(newIsPlaying);
    if (videoRef.current && bannerContent[currentIndex]?.type === 'video') {
      if (newIsPlaying) videoRef.current.play();
      else videoRef.current.pause();
    }
  };

  const currentContent = bannerContent[currentIndex];
  if (!currentContent) return null;

  return (
    <Box sx={{ 
      position: 'relative', 
      width: '100%', 
      // =================================================================
      // FIX 1: Adaptive Banner Height
      // =================================================================
      height: { xs: '65vh', md: '80vh' }, 
      overflow: 'hidden', 
      backgroundColor: 'background.default' 
    }}>
      <AnimatePresence initial={false}>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          style={{ width: '100%', height: '100%', position: 'absolute' }}
        >
          {currentContent.type === 'video' ? (
            <video
              ref={videoRef} key={currentContent.src} autoPlay muted loop={false} onEnded={handleNextSlide}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            >
              <source src={currentContent.src} type="video/mp4" />
            </video>
          ) : (
            <Box component="img" src={currentContent.src} alt={currentContent.alt} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
        </motion.div>
      </AnimatePresence>

      <Box 
        sx={{ 
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
          display: 'flex', flexDirection: 'column', justifyContent: 'center', 
          alignItems: { xs: 'center', md: 'flex-start' },
          textAlign: { xs: 'center', md: 'left' },
          p: { xs: 3, sm: 5, md: 10 }
        }}
      >
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }}>
          <Typography 
            variant="h2" component="h1" 
            sx={{ 
              fontFamily: "'Laginchy', serif", color: 'text.primary', fontWeight: 400,
              maxWidth: '600px', mb: 3, fontSize: { xs: '2.2rem', sm: '3rem', md: '4rem' }
            }}
          >
            {currentContent.overlayText}
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            // =================================================================
            // FIX 3: Adaptive Button Size
            // =================================================================
            size={isMobile ? 'medium' : 'large'} 
            href={currentContent.ctaLink}
          >
            {currentContent.ctaText}
          </Button>
        </motion.div>
      </Box>

      <Stack 
        direction="row" 
        spacing={1} 
        sx={{ 
          position: 'absolute', 
          bottom: 20, 
          alignItems: 'center',
          // =================================================================
          // FIX 2: Adaptive Control Positioning
          // =================================================================
          right: { xs: 'auto', md: 30 },
          left: { xs: '50%', md: 'auto' },
          transform: { xs: 'translateX(-50%)', md: 'none' },
        }}
      >
        <IconButton onClick={handlePrevSlide} sx={{ border: 1, borderColor: 'divider', backdropFilter: 'blur(4px)', backgroundColor: 'rgba(255,255,255,0.1)' }}><ArrowBackIcon /></IconButton>
        <IconButton onClick={handleNextSlide} sx={{ border: 1, borderColor: 'divider', backdropFilter: 'blur(4px)', backgroundColor: 'rgba(255,255,255,0.1)' }}><ArrowForwardIcon /></IconButton>
        <IconButton onClick={togglePlay} sx={{ border: 1, borderColor: 'divider', backdropFilter: 'blur(4px)', backgroundColor: 'rgba(255,255,255,0.1)' }} >{isPlaying ? <PauseIcon /> : <PlayIcon />}</IconButton>
      </Stack>
    </Box>
  );
};


// The rest of the Home component (Skeleton, Data Fetching, Grid) remains unchanged
// as it is already responsive.
const FeaturedProductsSkeleton = () => (
    <Container sx={{ py: 6 }}>
      <Typography variant="h4" sx={{ fontFamily: "'Laginchy', serif", textAlign: 'center', mb: 4 }}>
        Discover Our Essentials
      </Typography>
      <Grid container spacing={4}>
        {[...Array(3)].map((_, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <ProductCardSkeleton />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
  
const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bannerContent, setBannerContent] = useState([]);

  useEffect(() => {
    const fetchHomepageData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [productsResponse, bannerResponse] = await Promise.all([
          api.get('/products/products/featured/'),
          api.get('/orders/banner/')
        ]);
        
        setFeaturedProducts(productsResponse.data);

        const transformedBanners = bannerResponse.data.map((item) => ({
          src: item.type === 'video' ? item.src : item.media_file,
          type: item.type,
          alt: item.alt_text || 'NuaréSkyn Banner',
          overlayText: item.overlay_text || 'Effortless Radiance, Inside and Out.',
          ctaText: item.cta_text || 'Shop The Collection',
          ctaLink: item.cta_link || '/products',
          duration: item.duration || 7000 
        }));
        setBannerContent(transformedBanners);

      } catch (err) {
        console.error('Error fetching homepage data:', err);
        setError('Failed to load the page. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchHomepageData();
  }, []);

  if (loading) {
    return <FeaturedProductsSkeleton />;
  }
  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  const gridVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };
  const productVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <Box>
      <NuaréSkynBanner bannerContent={bannerContent} />
      
      <Container sx={{ py: { xs: 4, md: 8 } }}>
        <Typography variant="h4" component="h2" sx={{ fontFamily: "'Laginchy', serif", textAlign: 'center', mb: { xs: 4, md: 6 } }}>
          Discover Our Essentials
        </Typography>
        
        <Grid container spacing={4} component={motion.div} variants={gridVariants} initial="hidden" animate="visible">
          {featuredProducts.length > 0 ? (
            featuredProducts.map(product => (
              <Grid item xs={12} sm={6} md={4} key={product.id} component={motion.div} variants={productVariants}>
                <ProductCard product={product} />
              </Grid>
            ))
          ) : (
            <Typography sx={{ width: '100%', textAlign: 'center', py: 5 }}>
              Our featured collection is being prepared. Please check back soon.
            </Typography>
          )}
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;