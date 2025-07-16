import { createTheme } from '@mui/material/styles';

// --- THE NEW NUARÉSKYN BRAND PALETTE ---
const paletteTokens = {
  sandstone: '#7b6c64',   // Rich, muted brown. The main action color.
  nomad: '#b3ac9e',       // Softer, greyer taupe. For borders and hover states.
  swissCoffee: '#dfdbd8', // The NEW default background. Soft, dull, and warm.
  tutara: '#222220',       // The primary text color. A soft, elegant black.
  black: '#000000',       // Pure black for maximum contrast where needed (e.g., logo).
  white: '#FFFFFF',       // For elements that need to pop, like modal backgrounds.
  
  // A custom soft red for errors that feels on-brand
  softError: '#f5e8e8',
  softErrorText: '#8b2c2c',
};

// --- Create and Export the New Theme ---
const theme = createTheme({
  palette: {
    primary: {
      main: paletteTokens.sandstone, // Sandstone is the primary action color.
    },
    secondary: {
      main: paletteTokens.tutara,   // Tutara is the secondary/dark accent.
    },
    background: {
      default: paletteTokens.swissCoffee, // The whole site will have this soft, muted background.
      paper: paletteTokens.white,         // Headers, cards, etc., will be white to sit on top.
    },
    text: {
      primary: paletteTokens.tutara,      // Main text is soft black for readability.
      secondary: paletteTokens.sandstone,   // Secondary text uses the primary color for cohesion.
    },
    error: {
      main: paletteTokens.softErrorText,
    },
    
    // Making custom colors available throughout the app
    sandstone: paletteTokens.sandstone,
    nomad: paletteTokens.nomad,
    swissCoffee: paletteTokens.swissCoffee,
    tutara: paletteTokens.tutara,
  },

  typography: {
    fontFamily: "'Circular Std', sans-serif",
    // Headings now use pure black for a slight pop against the soft black body text.
    h1: { fontFamily: "'Laginchy', serif", color: paletteTokens.black },
    h2: { fontFamily: "'Laginchy', serif", color: paletteTokens.black },
    h3: { fontFamily: "'Laginchy', serif", color: paletteTokens.black },
    h4: { fontFamily: "'Laginchy', serif", color: paletteTokens.black },
    h5: { fontFamily: "'Laginchy', serif", color: paletteTokens.black, fontWeight: 700 },
    h6: { fontFamily: "'Laginchy', serif", color: paletteTokens.black },
    button: {
      textTransform: 'uppercase',
      fontWeight: 500,
      letterSpacing: '1px',
    },
  },

  components: {
    // Buttons now follow the Sandstone -> Nomad transition
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          boxShadow: 'none',
          padding: '10px 24px',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          backgroundColor: paletteTokens.sandstone,
          color: paletteTokens.white,
          '&:hover': {
            backgroundColor: paletteTokens.nomad,
          },
        },
      },
    },
    // TextFields use the new muted borders
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '.MuiOutlinedInput-root': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: paletteTokens.nomad, // Softer default border
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: paletteTokens.sandstone, // Hover border
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: paletteTokens.sandstone,
              borderWidth: '1px',
            },
          },
          '.MuiInputLabel-root': {
            color: paletteTokens.nomad,
            '&.Mui-focused': {
              color: paletteTokens.sandstone,
            },
          },
        },
      },
    },
    // The main app bar/header now uses a white background with a Nomad border
    MuiAppBar: {
        styleOverrides: {
            root: {
                backgroundColor: paletteTokens.white,
                color: paletteTokens.tutara,
                borderBottom: `1px solid ${paletteTokens.nomad}`
            }
        }
    },
    // Alerts use the new soft error colors
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: '4px' },
        standardError: {
          backgroundColor: paletteTokens.softError,
          color: paletteTokens.softErrorText,
        }
      }
    },
    // Other components updated to use the new palette
    MuiDivider: {
        styleOverrides: {
            root: { borderColor: paletteTokens.nomad }
        }
    },
    MuiChip: {
        styleOverrides: {
            root: {
                // Ensure chips have the correct font
                fontFamily: "'Circular Std', sans-serif",
            }
        }
    }
  },
});

export default theme;