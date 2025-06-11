import React from 'react';
import { Box, Typography, Avatar, Paper } from '@mui/material';

const BoxMessage = ({ message, isOwner }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: isOwner ? 'flex-end' : 'flex-start',
                mb: 2
            }}
        >
            {!isOwner && (
                <Avatar
                    sx={{ width: 32, height: 32, mr: 1 }}
                    alt={message.sender}
                    src={message.avatar}
                />
            )}
            <Paper
                sx={{
                    maxWidth: '70%',
                    p: 2,
                    backgroundColor: isOwner ? '#e3f2fd' : '#f5f5f5',
                    borderRadius: 2
                }}
            >
                {!isOwner && (
                    <Typography variant="caption" color="textSecondary">
                        {message.sender}
                    </Typography>
                )}
                <Typography variant="body1">{message.content}</Typography>
                <Typography variant="caption" color="textSecondary" display="block" textAlign="right">
                    {message.time}
                </Typography>
            </Paper>
            {isOwner && (
                <Avatar
                    sx={{ width: 32, height: 32, ml: 1 }}
                    alt="You"
                    src="/path-to-your-avatar.jpg"
                />
            )}
        </Box>
    );
};

export default BoxMessage;