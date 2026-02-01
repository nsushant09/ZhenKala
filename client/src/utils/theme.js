// Theme configuration based on Thangka Figma design
export const theme = {
  colors: {
    // Primary Colors - Based on Figma design
    primary: '#2C1810',
    primaryVariant: '#442819',
    onPrimary: '#FFFFFF',
    
    // Secondary Colors
    secondary: '#8B4513',
    secondaryVariant: '#A0522D',
    onSecondary: '#FFFFFF',
    
    // Surface & Background
    surface: '#FFFFFF',
    background: '#FAF9F8',
    onSurface: '#1C1B1F',
    onBackground: '#1C1B1F',
    
    // Error
    error: '#BA1A1A',
    onError: '#FFFFFF',
    
    // Additional Colors
    gold: '#D4AF37',
    bronze: '#8B6914',
    
    // Grays
    gray100: '#F5F5F5',
    gray200: '#EEEEEE',
    gray300: '#E0E0E0',
    gray400: '#BDBDBD',
    gray500: '#9E9E9E',
    gray600: '#757575',
    gray700: '#616161',
    gray800: '#424242',
    gray900: '#212121',
  },
  
  fonts: {
    // Based on Figma fonts
    primary: "'Outfit', sans-serif",
    secondary: "'TW Kalam', cursive",
    
    // Font Sizes
    sizes: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
      '5xl': '48px',
      '6xl': '60px',
    },
    
    weights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
    '4xl': '96px',
  },
  
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  
  transitions: {
    fast: '150ms ease-in-out',
    normal: '300ms ease-in-out',
    slow: '500ms ease-in-out',
  },
  
  breakpoints: {
    mobile: '640px',
    tablet: '768px',
    laptop: '1024px',
    desktop: '1280px',
    wide: '1536px',
  },
};

export default theme;
