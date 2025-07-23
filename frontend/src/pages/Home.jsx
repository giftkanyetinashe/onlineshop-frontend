import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Grid, Typography, Box, Button, IconButton, Container, Stack, useTheme, useMediaQuery, Skeleton, CircularProgress } from '@mui/material';
import { ArrowBackIosNew as ArrowBackIcon, ArrowForwardIos as ArrowForwardIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import api from '../services/api';

// --- Helper Components (Correct and unchanged) ---

const ErrorState = ({ message, onRetry }) => (
  <Container sx={{ textAlign: 'center', py: 8 }}>
    <Typography variant="h6" color="error" gutterBottom>
      Oops! Something went wrong.
    </Typography>
    <Typography color="text.secondary" sx={{ mb: 3 }}>
      {message}
    </Typography>
    <Button variant="contained" color="primary" onClick={onRetry}>
      Try Again
    </Button>
  </Container>
);

const ProductCardSkeleton = () => (
  <Box>
    <Skeleton variant="rectangular" height={250} />
    <Skeleton variant="text" sx={{ mt: 1 }} />
    <Skeleton variant="text" width="60%" />
  </Box>
);

const FeaturedProductsSkeleton = () => (
    <Container sx={{ py: { xs: 4, md: 8 } }}>
      <Typography variant="h4" sx={{ fontFamily: "'Laginchy', serif", textAlign: 'center', mb: { xs: 4, md: 6 } }}>
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

// --- The World-Class Banner Component ---
const NuaréSkynBanner = ({ bannerContent }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const shouldAutoplay = !isHovered && !prefersReducedMotion;

  const handleNextSlide = useCallback(() => {
    if (bannerContent.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % bannerContent.length);
    }
  }, [bannerContent.length]);

  const handlePrevSlide = () => {
    if (bannerContent.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + bannerContent.length) % bannerContent.length);
    }
  };

  const currentContent = useMemo(() => bannerContent[currentIndex] || {}, [bannerContent, currentIndex]);
  
  useEffect(() => {
    if (currentContent?.type === 'image' && bannerContent.length > 1 && shouldAutoplay) {
      const timer = setTimeout(handleNextSlide, currentContent.duration || 5000);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, currentContent, bannerContent.length, handleNextSlide, shouldAutoplay]);

  const mediaUrl = isMobile && currentContent.media_url_mobile 
    ? currentContent.media_url_mobile 
    : currentContent.media_url;

  const overlayGradient = currentContent.overlay_dark 
    ? 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)'
    : 'linear-gradient(to right, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 50%, transparent 100%)';

  return (
    <Box 
      sx={{
        position: 'relative', width: '100%',
        // --- THIS IS THE FIX ---
        // Changed from full-screen to a more balanced height
        height: { xs: '70vh', md: 600 },
        overflow: 'hidden', bgcolor: 'background.default',
      }}
      onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}
    >
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: overlayGradient, zIndex: 1 }} />

      <AnimatePresence initial={false}>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: prefersReducedMotion ? 0 : 1.2 } }}
          exit={{ opacity: 0 }}
          style={{ width: '100%', height: '100%', position: 'absolute' }}
        >
          {currentContent.type === 'video' ? (
            <>
              {!isVideoLoaded && (
                <Box sx={{ position: 'absolute', width: '100%', height: '100%', bgcolor: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                  <CircularProgress color={currentContent.overlay_dark ? 'inherit' : 'primary'} />
                </Box>
              )}
              <video
                key={mediaUrl} autoPlay muted playsInline loop={currentContent.loop_video}
                onEnded={!currentContent.loop_video ? handleNextSlide : undefined}
                onLoadedData={() => setIsVideoLoaded(true)}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: currentContent.focal_point || 'center' }}
              >
                <source src={mediaUrl} type="video/mp4" /> Your browser does not support the video tag.
              </video>
            </>
          ) : (
            <Box component="img" src={mediaUrl} alt={currentContent.alt || 'Banner image'} sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: currentContent.focal_point || 'center' }} loading="eager" />
          )}
        </motion.div>
      </AnimatePresence>

      <Container sx={{ position: 'relative', height: '100%', zIndex: 2, display: 'flex', alignItems: 'center', px: { xs: 4, md: 6 } }}>
        <Box sx={{ maxWidth: { xs: '100%', md: '50%' }, color: currentContent.overlay_dark ? 'white' : 'text.primary', textShadow: currentContent.overlay_dark ? '0 2px 4px rgba(0,0,0,0.5)' : 'none', transform: 'translateY(-5%)' }}>
          <motion.div key={`${currentIndex}-text`} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0, transition: { delay: prefersReducedMotion ? 0 : 0.5, duration: prefersReducedMotion ? 0 : 0.8 }}}>
            {currentContent.overlay_text && (
              <Typography variant="h1" sx={{ fontFamily: "'Laginchy', serif", fontWeight: 400, mb: 3, fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem', lg: '5rem' }, lineHeight: 1.1, letterSpacing: '-0.03em' }}>
                {currentContent.overlay_text}
              </Typography>
            )}
            {currentContent.overlay_subtext && (
              <Typography variant="subtitle1" sx={{ mb: 4, fontSize: { xs: '1rem', md: '1.25rem' }, maxWidth: '80%' }}>
                {currentContent.overlay_subtext}
              </Typography>
            )}
            {currentContent.cta_text && (
              <Button variant="contained" color={currentContent.overlay_dark ? 'secondary' : 'primary'} size="large" href={currentContent.cta_link} sx={{ px: 4, py: 1.5, fontSize: '1.1rem', borderRadius: '4px', boxShadow: 3, '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' }, transition: 'all 0.3s ease' }}>
                {currentContent.cta_text}
              </Button>
            )}
          </motion.div>
        </Box>
      </Container>
      
      {bannerContent.length > 1 && (
        <>
          <Box sx={{ position: 'absolute', top: '50%', left: { xs: 10, md: 20 }, right: { xs: 10, md: 20 }, zIndex: 3, display: { xs: 'flex', md: isHovered ? 'flex' : 'none' }, justifyContent: 'space-between', transform: 'translateY(-50%)', opacity: isHovered ? 1 : 0.8, transition: 'opacity 0.3s ease' }}>
            <IconButton onClick={handlePrevSlide} sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)', p: 2, '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' } }}><ArrowBackIcon fontSize="large" /></IconButton>
            <IconButton onClick={handleNextSlide} sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)', p: 2, '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' } }}><ArrowForwardIcon fontSize="large" /></IconButton>
          </Box>
          <Box sx={{ position: 'absolute', bottom: { xs: 20, md: 40 }, left: '50%', transform: 'translateX(-50%)', zIndex: 2, display: 'flex', alignItems: 'center' }}>
            <Stack direction="row" spacing={2}>
              {bannerContent.map((_, index) => (
                <Box key={index} onClick={() => setCurrentIndex(index)} sx={{ width: 40, height: 4, bgcolor: 'rgba(255,255,255,0.3)', borderRadius: '2px', cursor: 'pointer', position: 'relative', overflow: 'hidden', '&:hover': { bgcolor: 'rgba(255,255,255,0.5)' } }}>
                  {index === currentIndex && (
                    <motion.div key={currentIndex} initial={{ scaleX: 0 }} animate={{ scaleX: shouldAutoplay ? 1 : 0, transition: { duration: (currentContent.duration || 5000) / 1000, ease: 'linear' } }} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'white', transformOrigin: 'left' }}/>
                  )}
                </Box>
              ))}
            </Stack>
          </Box>
        </>
      )}
    </Box>
  );
};

// --- The Main Home Component ---
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
        setBannerContent(bannerResponse.data);

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

  return (
    <Box>
      <NuaréSkynBanner bannerContent={bannerContent} />
      
      <Container sx={{ py: { xs: 4, md: 8 } }}>
        <Typography variant="h4" component="h2" sx={{ fontFamily: "'Laginchy', serif", textAlign: 'center', mb: { xs: 4, md: 6 } }}>
          Discover Our Essentials
        </Typography>
        
        <Grid container spacing={4}>
          {featuredProducts.length > 0 ? (
            featuredProducts.map(product => (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
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