import { TextField, useTheme, InputAdornment } from '@mui/material';
import { IconSearch } from '@tabler/icons-react';

const SearchBox = ({ onSearch }) => {
    const theme = useTheme();

    return (
        <TextField
            fullWidth
            placeholder="Search messages..."
            variant="outlined"
            size="small"
            onChange={e => onSearch && onSearch(e.target.value)}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <IconSearch
                            size={20}
                            style={{
                                color: theme.palette.text.secondary
                            }}
                        />
                    </InputAdornment>
                ),
            }}
            sx={{
                height: 48,
                '& .MuiOutlinedInput-root': {
                    borderRadius: '20px',
                    bgcolor: theme.palette.background.paper,
                    height: 48,
                    '& fieldset': {
                        borderColor: theme.palette.divider,
                    },
                    '&:hover fieldset': {
                        borderColor: theme.palette.primary.main,
                    },
                }
            }}
        />
    );
};

export default SearchBox;
