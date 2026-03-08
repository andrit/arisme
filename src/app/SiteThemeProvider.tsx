'use client'; // This is a client component

import * as React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
  // You can customize your theme here
  palette: {
    primary: {
      main: '#1976d2',
    },
  },
});


export default function SiteThemeProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>)  {
  return (
    <ThemeProvider theme={theme}>
      {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}