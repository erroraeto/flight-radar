import { createTheme } from '@mui/material';

declare module '@mui/material/styles' {
  interface Palette {
    shadow: {
      default: string;
    };
    popup: {
      fromColor: string;
      toColor: string;
    };
  }
  interface PaletteOptions {
    shadow?: {
      default?: string;
    };
    popup?: {
      fromColor?: string;
      toColor?: string;
    };
  }
}

export const getAppTheme = (mode: 'light' | 'dark') =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#007cff',
      },
      background: {
        default: mode === 'dark' ? '#00000059' : '#FFFFFF59',
        paper: mode === 'dark' ? 'rgba(0,0,0,.7)' : 'rgba(255,255,255,.7)',
      },
      shadow: {
        default: mode === 'dark' ? '#ffffff96' : '#00000038',
      },
      popup: {
        fromColor: mode === 'dark' ? '#000' : '#fff',
        toColor: mode === 'dark' ? '#0000004C' : '#FFFFFF4C',
      },
    },

    components: {
      MuiLink: {
        styleOverrides: {
          root: ({ theme }) => ({
            color: theme.palette.primary.main,
            textDecorationColor: theme.palette.primary.main,
            '&:hover': {
              textDecorationColor: theme.palette.primary.dark,
            },
          }),
        },
      },
    },
  });
