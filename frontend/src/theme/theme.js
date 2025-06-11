import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    components: {
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    '&::-webkit-scrollbar': {
                        width: '7px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: '#eff2f7',
                        borderRadius: '15px',
                    },
                    '&:hover::-webkit-scrollbar-thumb': {
                        backgroundColor: '#d4d9e2',
                    },
                },
            },
        },
    },
});

export default theme;