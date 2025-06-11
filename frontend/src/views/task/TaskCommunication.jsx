import { useState, useRef, useEffect } from 'react';
import {
    Box,
    Typography,
    Avatar,
    Divider,
    IconButton,
    TextField,
    Link,
    Button,
} from '@mui/material';
import { IconPaperclip, IconSend } from '@tabler/icons-react';
import PropTypes from 'prop-types';

const TaskCommunication = ({ comments: initialComments, currentUser = 'User' }) => {
    const [comments, setComments] = useState(initialComments || []);
    const [messages, setMessages] = useState({});
    const [selectedFiles, setSelectedFiles] = useState({});
    const [replyTo, setReplyTo] = useState(null);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [comments]);

    const handleSendMessage = (commentId = 'main') => {
        const message = messages[commentId] || '';
        const file = selectedFiles[commentId] || null;

        if (!message.trim() && !file) return;

        const newComment = {
            id: Date.now(),
            userName: currentUser,
            text: message,
            file: file ? URL.createObjectURL(file) : null,
        };

        if (commentId === 'main') {
            setComments((prev) => [...prev, newComment]);
        } else {
            setComments((prev) =>
                prev.map((comment) => {
                    if (comment.id === commentId) {
                        const replies = comment.replies ? [...comment.replies, newComment] : [newComment];
                        return { ...comment, replies };
                    }
                    return comment;
                })
            );
            setReplyTo(null);
        }

        setMessages((prev) => ({ ...prev, [commentId]: '' }));
        setSelectedFiles((prev) => ({ ...prev, [commentId]: null }));
    };

    const renderComment = (comment, isCurrentUser) => (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'start',
                maxWidth: '70%',
                bgcolor: isCurrentUser ? 'primary.light' : 'grey.200',
                p: 2,
                borderRadius: 2,
            }}
        >
            {!isCurrentUser && <Avatar sx={{ width: 32, height: 32, mr: 1 }} />}
            <Box>
                <Typography variant="subtitle2">{comment.userName}</Typography>
                <Typography variant="body2">{comment.text}</Typography>
                {comment.file && (
                    <Link href={comment.file} target="_blank" sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <IconPaperclip size={16} />
                        <Typography variant="caption" sx={{ ml: 1 }}>
                            {comment.file.split('/').pop()}
                        </Typography>
                    </Link>
                )}
            </Box>
            {isCurrentUser && <Avatar sx={{ width: 32, height: 32, ml: 1 }} />}
        </Box>
    );

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Trao đổi công việc
            </Typography>
            <Box sx={{ height: '300px', overflowY: 'auto', mb: 2 }}>
                {comments.map((comment) => (
                    <Box key={comment.id} sx={{ mb: 2 }}> {/* Use comment.id as the key */}
                        <Box sx={{ display: 'flex', justifyContent: comment.userName === currentUser ? 'flex-end' : 'flex-start' }}>
                            <Box>
                                {renderComment(comment, comment.userName === currentUser)}
                                <Button size="small" onClick={() => setReplyTo(comment.id)} sx={{ mt: 1, ml: 1 }}>
                                    Trả lời
                                </Button>
                            </Box>
                        </Box>

                        {comment.replies &&
                            comment.replies.map((reply) => (
                                <Box key={reply.id} sx={{ display: 'flex', justifyContent: reply.userName === currentUser ? 'flex-end' : 'flex-start', pl: 5, mt: 1 }}>
                                    {renderComment(reply, reply.userName === currentUser)}
                                </Box>
                            ))}

                        {replyTo === comment.id && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, pl: 5 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Nhập phản hồi..."
                                    value={messages[comment.id] || ''}
                                    onChange={(e) => setMessages((prev) => ({ ...prev, [comment.id]: e.target.value }))}
                                    sx={{ mr: 1 }}
                                />
                                <input
                                    type="file"
                                    id={`file-upload-${comment.id}`}
                                    style={{ display: 'none' }}
                                    onChange={(e) => setSelectedFiles((prev) => ({ ...prev, [comment.id]: e.target.files[0] }))}
                                />
                                <label htmlFor={`file-upload-${comment.id}`}>
                                    <IconButton component="span" color="primary">
                                        <IconPaperclip />
                                    </IconButton>
                                </label>
                                <IconButton color="primary" onClick={() => handleSendMessage(comment.id)}>
                                    <IconSend />
                                </IconButton>
                            </Box>
                        )}
                    </Box>
                ))}
                <div ref={bottomRef} />
            </Box>

            <Divider sx={{ my: 2 }} />

            {!replyTo && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Nhập bình luận..."
                        value={messages['main'] || ''}
                        onChange={(e) => setMessages((prev) => ({ ...prev, main: e.target.value }))}
                        sx={{ mr: 1 }}
                    />
                    <input
                        type="file"
                        id="file-upload-main"
                        style={{ display: 'none' }}
                        onChange={(e) => setSelectedFiles((prev) => ({ ...prev, main: e.target.files[0] }))}
                    />
                    <label htmlFor="file-upload-main">
                        <IconButton component="span" color="primary">
                            <IconPaperclip />
                        </IconButton>
                    </label>
                    <IconButton color="primary" onClick={() => handleSendMessage('main')}>
                        <IconSend />
                    </IconButton>
                </Box>
            )}
            {selectedFiles['main'] && (
                <Typography variant="caption" sx={{ mt: 1 }}>
                    File đính kèm: {selectedFiles['main'].name}
                </Typography>
            )}
        </Box>
    );
};
TaskCommunication.propTypes = {
    comments: PropTypes.array,
    currentUser: PropTypes.string
};

export default TaskCommunication;
