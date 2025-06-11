import React, { useState } from 'react';
import {
    Box,
    Typography,
    Avatar,
    Button,
    TextField,
    IconButton,
    Snackbar,
    Alert,
    CircularProgress,
    Collapse,
} from '@mui/material';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import ApiService from 'src/service/ApiService';

const Comment = ({ taskId, comment, onReply, onUpdate, onDelete, depth = 0, parentCommentId = null }) => {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);
    const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
    const [error, setError] = useState(null);
    const [isExpanded, setIsExpanded] = useState(comment.replies?.length <= 2);

    const isOwnComment =
        ApiService.isAuthenticated() &&
        comment.userId === parseInt(localStorage.getItem('userId'));

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (!replyContent.trim()) return;

        setIsSubmittingReply(true);
        setError(null);

        try {
            const profile = await ApiService.getUserProfile();
            const userId = parseInt(profile?.id);

            const parentId = depth === 1 ? parentCommentId : comment.id;

            const commentData = {
                content: replyContent,
                taskId,
                parentId,
                userId,
            };

            console.log('Sending comment data:', commentData);
            const response = await ApiService.handleRequest('post', '/Comment', commentData);
            console.log('Response received:', response);

            setReplyContent('');
            setShowReplyForm(false);
            onReply();
        } catch (error) {
            console.error('Error sending comment:', error);
            const message =
                error?.response?.data?.message ||
                error?.message ||
                'Không thể gửi phản hồi. Vui lòng thử lại.';
            setError(message);
        } finally {
            setIsSubmittingReply(false);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!editContent.trim()) return;

        setIsSubmittingEdit(true);
        setError(null);

        try {
            await ApiService.updateComment(comment.id, { content: editContent });
            setIsEditing(false);
            onUpdate();
        } catch (error) {
            console.error('Lỗi khi cập nhật bình luận:', error);
            const message =
                error?.response?.data?.message ||
                error?.message ||
                'Không thể cập nhật bình luận. Vui lòng thử lại.';
            setError(message);
        } finally {
            setIsSubmittingEdit(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Bạn có chắc muốn xóa bình luận này?')) {
            setError(null);
            try {
                await ApiService.deleteComment(comment.id);
                onDelete();
            } catch (error) {
                console.error('Lỗi khi xóa bình luận:', error);
                setError('Không thể xóa bình luận. Vui lòng thử lại.');
            }
        }
    };

    const handleImageError = (e) => {
        e.target.src = 'https://www.gravatar.com/avatar/?d=identicon';
    };

    const handleCloseSnackbar = () => {
        setError(null);
    };

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const displayName = comment.user?.fullName || comment.fullName || 'Ẩn danh';
    const avatarSrc = comment.user?.avatar || 'https://www.gravatar.com/avatar/?d=identicon';

    if (depth >= 2) {
        return null;
    }

    return (
        <Box sx={{ mb: 2, pl: depth * 1.5, borderLeft: depth > 0 ? '2px solid #e7eaf3' : 'none', backgroundColor: depth > 0 ? '#f5f6f8' : 'transparent', borderRadius: depth > 0 ? 4 : 0, p: depth > 0 ? 1 : 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                <Avatar
                    src={avatarSrc}
                    onError={handleImageError}
                    sx={{ width: 32, height: 32, mr: 1.5, mt: 0.5 }}
                />
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2" fontWeight="bold" color="#1a73e8" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                        {displayName}
                    </Typography>
                    <Typography variant="caption" color="#606770" sx={{ display: 'block', mt: -0.5 }}>
                        {new Date(comment.createdAt).toLocaleString('vi-VN', { hour12: false })}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, color: '#1c1e21', wordBreak: 'break-word', backgroundColor: depth > 0 ? '#fff' : 'transparent', borderRadius: 2, p: depth > 0 ? 1 : 0 }}>
                        {isEditing ? (
                            <form onSubmit={handleEditSubmit} style={{ marginTop: '10px' }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    sx={{ mb: 1, '& .MuiOutlinedInput-root': { borderRadius: 20, backgroundColor: '#f0f2f5' } }}
                                    disabled={isSubmittingEdit}
                                />
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="small"
                                        sx={{ borderRadius: 20, backgroundColor: '#1a73e8', '&:hover': { backgroundColor: '#1557b0' }, color: '#fff' }}
                                        disabled={isSubmittingEdit || !editContent.trim()}
                                        startIcon={isSubmittingEdit ? <CircularProgress size={16} color="inherit" /> : null}
                                    >
                                        {isSubmittingEdit ? 'Đang lưu...' : 'Lưu'}
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => setIsEditing(false)}
                                        sx={{ borderRadius: 20, color: '#606770', borderColor: '#ced0d4', '&:hover': { borderColor: '#1a73e8', color: '#1a73e8' } }}
                                        disabled={isSubmittingEdit}
                                    >
                                        Hủy
                                    </Button>
                                </Box>
                            </form>
                        ) : (
                            comment.content
                        )}
                    </Typography>
                </Box>
                {isOwnComment && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <IconButton size="small" onClick={() => setIsEditing(true)} sx={{ color: '#606770', '&:hover': { color: '#1a73e8' } }}>
                            <IconEdit size={16} />
                        </IconButton>
                        <IconButton size="small" onClick={handleDelete} sx={{ color: '#606770', '&:hover': { color: '#e33' } }}>
                            <IconTrash size={16} />
                        </IconButton>
                    </Box>
                )}
            </Box>

            <Box sx={{ pl: 4.5, mt: -1 }}>
                {/* Nút "Trả lời" cho cả cấp 1 và cấp 2 */}
                <Button
                    size="small"
                    variant="text"
                    onClick={() => {
                        setShowReplyForm(true);
                        setReplyContent(depth === 1 ? `@${displayName} ` : '');
                    }}
                    disabled={isSubmittingReply}
                    sx={{ color: '#606770', textTransform: 'none', fontWeight: 500, '&:hover': { color: '#1a73e8', backgroundColor: 'transparent' } }}
                >
                    {showReplyForm ? 'Ẩn' : 'Trả lời'}
                </Button>

                {showReplyForm && (
                    <Box sx={{ mt: 1 }}>
                        <form onSubmit={handleReplySubmit}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Viết phản hồi..."
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                sx={{ mb: 1, '& .MuiOutlinedInput-root': { borderRadius: 20, backgroundColor: '#f0f2f5' } }}
                                disabled={isSubmittingReply}
                            />
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="small"
                                    disabled={isSubmittingReply || !replyContent.trim()}
                                    startIcon={isSubmittingReply ? <CircularProgress size={16} color="inherit" /> : null}
                                    sx={{ borderRadius: 20, backgroundColor: '#1a73e8', '&:hover': { backgroundColor: '#1557b0' }, color: '#fff' }}
                                >
                                    {isSubmittingReply ? 'Đang gửi...' : 'Gửi'}
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => setShowReplyForm(false)}
                                    sx={{ borderRadius: 20, color: '#606770', borderColor: '#ced0d4', '&:hover': { borderColor: '#1a73e8', color: '#1a73e8' } }}
                                    disabled={isSubmittingReply}
                                >
                                    Hủy
                                </Button>
                            </Box>
                        </form>
                    </Box>
                )}

                {/* Nút thu gọn/mở rộng */}
                {comment.replies?.length > 0 && (
                    <Button
                        size="small"
                        variant="text"
                        onClick={toggleExpand}
                        sx={{ color: '#606770', textTransform: 'none', fontWeight: 500, '&:hover': { color: '#1a73e8', backgroundColor: 'transparent' } }}
                    >
                        {isExpanded ? 'Ẩn phản hồi' : `Xem ${comment.replies.length} phản hồi`}
                    </Button>
                )}

                {/* Hiển thị replies với Collapse */}
                <Collapse in={isExpanded}>
                    {depth < 2 && comment.replies?.map((reply) => (
                        <Comment
                            key={reply.id}
                            taskId={taskId}
                            comment={reply}
                            onReply={onReply}
                            onUpdate={onUpdate}
                            onDelete={onDelete}
                            depth={depth + 1}
                            parentCommentId={comment.id}
                        />
                    ))}
                </Collapse>
            </Box>

            <Snackbar open={!!error} autoHideDuration={5000} onClose={handleCloseSnackbar}>
                <Alert severity="error" onClose={handleCloseSnackbar}>
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default React.memo(Comment);