import { createTheme } from '@mui/material/styles';

// --- NuaréSkyn Refined Brand Tokens ---
const palette = {
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
    primary: {
      main: palette.softTaupe,
    },
    secondary: {
      main: palette.tutara,
    },
    background: {
      default: palette.alabaster, // The creamish-white base
      paper: palette.white,       // For cards and modals to pop against the base
    },
    text: {
      primary: palette.tutara,    // Soft black for body copy
      secondary: palette.softTaupe, // For less important text
    },
  },

  // 2. Typography (Remains an excellent fit)
  typography: {
    fontFamily: "'Circular Std', sans-serif",
    h1: { fontFamily: "'Laginchy', serif", color: palette.tutara },
    h2: { fontFamily: "'Laginchy', serif", color: palette.tutara },
    h3: { fontFamily: "'Laginchy', serif", color: palette.tutara },
    h4: { fontFamily: "'Laginchy', serif", color: palette.tutara },
    h5: { fontFamily: "'Laginchy', serif", color: palette.tutara, fontWeight: 700 },
    h6: { fontFamily: "'Laginchy', serif", color: palette.tutara },
    button: {
      textTransform: 'uppercase',
      fontWeight: 500,
      letterSpacing: '1px',
    },
    // Adding the tagline style
    subtitle1: { // Could be used for taglines
        fontSize: '1.1rem',
        color: palette.mistyGrey,
        fontWeight: 400,
    }
  },

  // 3. Component-Specific Overrides
  components: {
    // MuiButton: Matte finish, elegant hover
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
          backgroundColor: palette.softTaupe,
          color: palette.white,
          '&:hover': {
            backgroundColor: palette.darkTaupe, // The new refined hover state
          },
        },
      },
    },

    // MuiTextField: Softer borders, blush/taupe focus states
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '.MuiOutlinedInput-root': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: palette.mistyGrey, // Softer default border
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: palette.softTaupe, // Hover border
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: palette.softTaupe,
              borderWidth: '1px',
            },
          },
          '.MuiInputLabel-root': {
            color: palette.mistyGrey,
            '&.Mui-focused': {
              color: palette.softTaupe, // Label color on focus
            },
          },
        },
      },
    },

    // MuiLink: Style links with the new palette
    MuiLink: {
      styleOverrides: {
        root: {
          color: palette.softTaupe,
          fontWeight: 500,
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline',
            color: palette.darkTaupe,
          },
        },
      },
    },

    // In src/theme.js, inside the 'components' object

    // ... MuiButton, MuiTextField, etc.

    // MuiTableContainer: Remove the default shadow for a flat, modern look
    MuiTableContainer: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          border: `1px solid ${palette.blush}`, // Use blush or mistyGrey for a soft border
          borderRadius: '8px',
        },
      },
    },

    // MuiTableCell: Create more space and use on-brand colors
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${palette.blush}`, // Soft blush divider
          padding: '24px', // Increase padding for a more spacious, luxurious feel
        },
        head: {
          fontFamily: "'Circular Std', sans-serif",
          fontWeight: 600,
          color: palette.tutara,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        },
      },
    },

    // MuiIconButton: Style the quantity and delete buttons
    MuiIconButton: {
      styleOverrides: {
        root: {
          // Styling for the quantity buttons
          border: `1px solid ${palette.mistyGrey}`,
          borderRadius: '4px',
          width: '32px',
          height: '32px',
          '&:hover': {
            backgroundColor: palette.blush,
          },
        },
      },
    },



    // MuiCheckbox: Ensure checkboxes use the brand's primary color
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: palette.mistyGrey, // The color of the unchecked box
          '&.Mui-checked': {
            color: palette.softTaupe, // The on-brand color for the checkmark
          },
        },
      },
    },
    
    // MuiAlert: A muted, on-brand error state
    MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: '4px',
          },
          standardError: {
            backgroundColor: palette.blush, // Use the blush accent for a soft error
            color: '#8b2c2c', // A dark red for text to ensure contrast
          }
        }
      }
  },
});

export default theme;