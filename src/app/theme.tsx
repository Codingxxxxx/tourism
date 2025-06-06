'use client';
import { createTheme, responsiveFontSizes } from '@mui/material/styles';

let theme = createTheme({
  typography: {
    fontFamily: 'var(--font-roboto)',
  },
});

theme = responsiveFontSizes(theme);

export default theme;
