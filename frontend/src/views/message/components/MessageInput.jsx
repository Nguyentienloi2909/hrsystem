import React, { useState } from 'react';
import {
    Box,
    TextField,
    IconButton,
    useTheme,
    Tooltip,
    Fade
} from '@mui/material';
import {
    IconSend,
} from '@tabler/icons-react';

const MessageInput = ({ onSendMessage, disabled, sx }) => {
    const [message, setMessage] = useState('');
    const theme = useTheme();

    const handleSend = () => {
        if (message.trim()) {
            if (onSendMessage) {
                onSendMessage(message.trim());
            }
            setMessage('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.background.paper,
            width: '100%',
            minHeight: 72,
            ...sx
        }}>
            <TextField
                fullWidth
                placeholder="Type a message..."
                variant="outlined"
                size="small"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                multiline
                maxRows={4}
                disabled={disabled}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '24px',
                        bgcolor: theme.palette.background.default,
                        '&.Mui-focused': {
                            boxShadow: `0 0 0 2px ${theme.palette.primary.light}40`
                        },
                        '& fieldset': {
                            borderColor: theme.palette.divider,
                        },
                        '&:hover fieldset': {
                            borderColor: theme.palette.primary.light,
                        },
                    },
                    '& .MuiOutlinedInput-input': {
                        py: 1.5,
                        px: 2
                    }
                }}
            />
            <Box sx={{ display: 'flex', gap: 0.5 }}>
                <IconButton
                    color="primary"
                    onClick={handleSend}
                    disabled={!message.trim() || disabled}
                    sx={{
                        bgcolor: message.trim() ? theme.palette.primary.main : theme.palette.action.hover,
                        color: message.trim() ? theme.palette.primary.contrastText : theme.palette.text.primary,
                        borderRadius: '50%',
                        width: 40,
                        height: 40,
                        '&:hover': {
                            bgcolor: message.trim() ? theme.palette.primary.dark : theme.palette.action.selected,
                        },
                        transition: 'all 0.2s ease-in-out',
                        '&:disabled': {
                            bgcolor: theme.palette.action.disabledBackground,
                            color: theme.palette.text.disabled
                        }
                    }}
                >
                    <IconSend size={20} />
                </IconButton>
            </Box>
        </Box>
    );
};

export default MessageInput;