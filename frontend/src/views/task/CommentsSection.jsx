import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, CircularProgress, Snackbar, Alert } from '@mui/material';
import Comment from './Comment';
import ApiService from 'src/service/ApiService';

const CommentsSection = ({ taskId }) => {
    const [comments, setComments] = useState([]);
    const [newContent, setNewContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const fetchComments = async () => {
        try {
            const fetchedComments = await ApiService.getComment(taskId);
            // Sắp xếp phản hồi theo thời gian (mới nhất trước)
            const sortReplies = (comment) => ({
                ...comment,
                replies: comment.replies
                    ? [...comment.replies].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    : []
            });
            const sortedComments = Array.isArray(fetchedComments) ? fetchedComments.map(sortReplies) : [];
            setComments(sortedComments);
        } catch (err) {
            // Nếu là 404 thì coi như không có comment, không phải lỗi nghiêm trọng
            if (err?.response?.status === 404) {
                setComments([]);
            } else {
                setError('Không thể tải bình luận. Vui lòng thử lại.');
            }
        }
    };

    useEffect(() => {
        fetchComments();
    }, [taskId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newContent.trim()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const profile = await ApiService.getUserProfile();
            const userId = parseInt(profile?.id);
            const taskIdAsNumber = parseInt(taskId);

            const commentData = {
                content: newContent,
                taskId: taskIdAsNumber,
                parentId: null,
                userId,
            };

            await ApiService.handleRequest('post', '/Comment', commentData);
            setNewContent('');
            await fetchComments();
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                'Không thể gửi bình luận. Vui lòng thử lại.';
            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseSnackbar = () => {
        setError(null);
    };

    return (
        <Box sx={{ mt: 4 }}>
            <form onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Viết bình luận..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 20, backgroundColor: '#f0f2f5' } }}
                    disabled={isSubmitting}
                />
                <Button
                    type="submit"
                    variant="contained"
                    size="small"
                    disabled={isSubmitting || !newContent.trim()}
                    startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
                    sx={{ borderRadius: 20, backgroundColor: '#1a73e8', '&:hover': { backgroundColor: '#1557b0' } }}
                >
                    {isSubmitting ? 'Đang gửi...' : 'Gửi'}
                </Button>
            </form>

            <Box sx={{ mt: 3 }}>
                {comments.length === 0 ? (
                    <Box sx={{ textAlign: 'center', color: 'text.secondary', py: 2 }}>
                        Chưa có tin nhắn
                    </Box>
                ) : (
                    comments.map((comment, index) => (
                        <Comment
                            key={comment.id || index}
                            taskId={taskId}
                            comment={comment}
                            onReply={fetchComments}
                            onUpdate={fetchComments}
                            onDelete={fetchComments}
                            depth={0}
                            parentCommentId={null}
                        />
                    ))
                )}
            </Box>

            <Snackbar open={!!error} autoHideDuration={5000} onClose={handleCloseSnackbar}>
                <Alert severity="error" onClose={handleCloseSnackbar}>
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default CommentsSection;