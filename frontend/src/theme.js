import { createTheme } from '@mui/material/styles';

// --- NuaréSkyn Refined Brand Tokens ---
const paletteTokens = {
  softTaupe: '#C3B5AB',
  darkTaupe: '#A19288',
  blush: '#EADAD4',
  alabaster: '#F9F6F2',
  mistyGrey: '#BDB4B0',
  tutara: '#222220',
  white: '#FFFFFF',
};

// --- Create and Export the Theme ---
const theme = createTheme({
  // 1. Revised Color Palette
  palette: {
    // Standard MUI keys
    primary: {
      main: paletteTokens.softTaupe,
    },
    secondary: {
      main: paletteTokens.tutara,
    },
    background: {
      default: paletteTokens.alabaster, // The creamish-white base
      paper: paletteTokens.white,       // For cards and modals
    },
    text: {
      primary: paletteTokens.tutara,    // Soft black for body copy
      secondary: paletteTokens.softTaupe, // For less important text
    },
    error: {
        main: '#8b2c2c', // Define a main error color for text
    },

    // --- FIX APPLIED HERE ---
    // Custom brand colors are now part of the theme's palette
    mistyGrey: paletteTokens.mistyGrey,
    blush: paletteTokens.blush,
    darkTaupe: paletteTokens.darkTaupe,
    // You can add the others if needed
  },

  // 2. Typography
  typography: {
    fontFamily: "'Circular Std', sans-serif",
    h1: { fontFamily: "'Laginchy', serif", color: paletteTokens.tutara },
    h2: { fontFamily: "'Laginchy', serif", color: paletteTokens.tutara },
    h3: { fontFamily: "'Laginchy', serif", color: paletteTokens.tutara },
    h4: { fontFamily: "'Laginchy', serif", color: paletteTokens.tutara },
    h5: { fontFamily: "'Laginchy', serif", color: paletteTokens.tutara, fontWeight: 700 },
    h6: { fontFamily: "'Laginchy', serif", color: paletteTokens.tutara },
    button: {
      textTransform: 'uppercase',
      fontWeight: 500,
      letterSpacing: '1px',
    },
    subtitle1: {
      fontSize: '1.1rem',
      color: paletteTokens.mistyGrey,
      fontWeight: 400,
    }
  },

  // 3. Component-Specific Overrides
  components: {
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
          backgroundColor: paletteTokens.softTaupe,
          color: paletteTokens.white,
          '&:hover': {
            backgroundColor: paletteTokens.darkTaupe,
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '.MuiOutlinedInput-root': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: paletteTokens.mistyGrey,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: paletteTokens.softTaupe,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: paletteTokens.softTaupe,
              borderWidth: '1px',
            },
          },
          '.MuiInputLabel-root': {
            color: paletteTokens.mistyGrey,
            '&.Mui-focused': {
              color: paletteTokens.softTaupe,
            },
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: paletteTokens.softTaupe,
          fontWeight: 500,
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline',
            color: paletteTokens.darkTaupe,
          },
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          border: `1px solid ${paletteTokens.blush}`,
          borderRadius: '8px',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${paletteTokens.blush}`,
          padding: '24px',
        },
        head: {
          fontFamily: "'Circular Std', sans-serif",
          fontWeight: 600,
          color: paletteTokens.tutara,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          border: `1px solid ${paletteTokens.mistyGrey}`,
          borderRadius: '4px',
          width: '32px',
          height: '32px',
          '&:hover': {
            backgroundColor: paletteTokens.blush,
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: paletteTokens.mistyGrey,
          '&.Mui-checked': {
            color: paletteTokens.softTaupe,
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
        },
        standardError: {
          backgroundColor: paletteTokens.blush,
          color: '#8b2c2c',
        }
      }
    }
  },
});

export default theme;