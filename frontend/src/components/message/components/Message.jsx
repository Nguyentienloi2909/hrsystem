import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    Paper,
    TextField,
    IconButton,
    Typography,
    Stack,
    Divider
} from '@mui/material';
import {
    IconSend,
    IconPaperclip,
    IconMoodSmile
} from '@tabler/icons-react';
import BoxMessage from './boxmessage';

const Message = () => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([
        {
            id: 1,
            content: 'Xin chào, tôi cần hỗ trợ về vấn đề chấm công',
            sender: 'Nguyễn Văn A',
            time: '09:30',
            avatar: '/path-to-avatar1.jpg',
            isOwner: false
        },
        {
            id: 2,
            content: 'Vâng, tôi có thể giúp gì cho bạn?',
            sender: 'Admin',
            time: '09:31',
            avatar: '/path-to-avatar2.jpg',
            isOwner: true
        },
    ]);

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (message.trim()) {
            const newMessage = {
                id: messages.length + 1,
                content: message,
                sender: 'You',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isOwner: true
            };
            setMessages([...messages, newMessage]);
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
        <Paper sx={{ height: '80vh', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6">Tin nhắn</Typography>
            </Box>

            <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                {messages.map((msg) => (
                    <BoxMessage key={msg.id} message={msg} isOwner={msg.isOwner} />
                ))}
                <div ref={messagesEndRef} />
            </Box>

            <Divider />

            <Stack
                direction="row"
                spacing={1}
                sx={{ p: 2, alignItems: 'center' }}
            >
                <IconButton color="primary">
                    <IconPaperclip />
                </IconButton>
                <IconButton color="primary">
                    <IconMoodSmile />
                </IconButton>
                <TextField
                    fullWidth
                    multiline
                    maxRows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Nhập tin nhắn..."
                    variant="outlined"
                    size="small"
                />
                <IconButton
                    color="primary"
                    onClick={handleSend}
                    disabled={!message.trim()}
                >
                    <IconSend />
                </IconButton>
            </Stack>
        </Paper>
    );
};

export default Message;