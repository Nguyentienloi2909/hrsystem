import { createTheme } from "@mui/material/styles";
import typography from "./Typography";
import { shadows } from "./Shadows";

const baselightTheme = createTheme({
  direction: 'ltr',
  palette: {
    primary: {
      main: '#5D87FF',
      light: '#ECF2FF',
      dark: '#4570EA',
    },
    secondary: {
      main: '#49BEFF',
      light: '#E8F7FF',
      dark: '#23afdb',
    },
    success: {
      main: '#13DEB9',
      light: '#E6FFFA',
      dark: '#02b3a9',
      contrastText: '#ffffff',
    },
    info: {
      main: '#539BFF',
      light: '#EBF3FE',
      dark: '#1682d4',
      contrastText: '#ffffff',
    },
    error: {
      main: '#FA896B',
      light: '#FDEDE8',
      dark: '#f3704d',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#FFAE1F',
      light: '#FEF5E5',
      dark: '#ae8e59',
      contrastText: '#ffffff',
    },
    purple: {
      A50: '#EBF3FE',
      A100: '#6610f2',
      A200: '#557fb9',
    },
    grey: {
      100: '#F2F6FA',
      200: '#EAEFF4',
      300: '#DFE5EF',
      400: '#7C8FAC',
      500: '#5A6A85',
      600: '#2A3547',
    },
    text: {
      primary: '#2A3547',
      secondary: '#5A6A85',
    },
    action: {
      disabledBackground: 'rgba(73,82,88,0.12)',
      hoverOpacity: 0.02,
      hover: '#f6f9fc',
    },
    divider: '#e5eaef',
  },
  typography,
  shadows
});

const basedarkTheme = createTheme({
  direction: 'ltr',
  palette: {
    mode: 'dark',
    primary: {
      main: '#7C9EFF',
      light: '#9DB5FF',
      dark: '#5D87FF',
    },
    secondary: {
      main: '#69CAFF',
      light: '#8CD5FF',
      dark: '#49BEFF',
    },
    success: {
      main: '#4DEBB0',
      light: '#7AEFCA',
      dark: '#13DEB9',
    },
    info: {
      main: '#74AEFF',
      light: '#99C5FF',
      dark: '#539BFF',
    },
    error: {
      main: '#FF9E85',
      light: '#FFB8A7',
      dark: '#FA896B',
    },
    warning: {
      main: '#FFBE4D',
      light: '#FFD07F',
      dark: '#FFAE1F',
    },
    purple: {
      A50: '#484B61',
      A100: '#8242f4',
      A200: '#7599CC',
    },
    grey: {
      50: '#212121',
      100: '#424242',
      200: '#616161',
      300: '#757575',
      400: '#9E9E9E',
      500: '#BDBDBD',
      600: '#E0E0E0',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#BDBDBD',
      disabled: '#757575',
    },
    action: {
      active: '#FFFFFF',
      hover: 'rgba(255, 255, 255, 0.08)',
      selected: 'rgba(255, 255, 255, 0.16)',
      disabled: 'rgba(255, 255, 255, 0.3)',
      disabledBackground: 'rgba(255, 255, 255, 0.12)',
      focus: 'rgba(255, 255, 255, 0.12)',
    },
    background: {
      default: '#121212',
      dark: '#0A0A0A',
      paper: '#1E1E1E',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(255, 255, 255, 0.12)',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(odd)': {
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
          },
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08) !important',
          },
        },
      },
    },
  },
  typography,
  shadows
});
export { baselightTheme, basedarkTheme };
