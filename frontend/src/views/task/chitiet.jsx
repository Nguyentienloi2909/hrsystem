import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Typography, Chip, Link, Paper, Grid,
    TextField, Button, Avatar, IconButton, Stack, Divider, ButtonGroup,
    Card, CardContent, CardHeader, LinearProgress, Tooltip
} from '@mui/material';
import {
    IconArrowLeft, IconSend, IconEdit, IconTrash,
    IconCalendarEvent, IconUser, IconClock, IconFileDescription,
    IconPaperclip, IconMessageCircle2, IconFileText, IconDownload,
    IconExternalLink
} from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import ApiService from 'src/service/ApiService';
import CommentsSection from './CommentsSection'; // Import the new component

const API_BASE = "http://localhost:7247/api/Comment";

function formatDate(isoString) {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleString("vi-VN");
}

function Comment({ comment, onReply }) {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyContent, setReplyContent] = useState("");

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (!replyContent.trim()) return;

        await onReply(comment.id, replyContent);
        setReplyContent("");
        setShowReplyForm(false);
    };

    return (
        <Box sx={{ mb: 2, pl: comment.parentId ? 4 : 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar
                    src={comment.user.avatarUrl || "https://res.cloudinary.com/dpopoiskm/image/upload/v1745916572/avatars/user_28_avatar.jpg"}
                    sx={{ width: 40, height: 40, mr: 2 }}
                />
                <Box>
                    <Typography variant="subtitle2" fontWeight="bold">{comment.user.name}</Typography>
                    <Typography variant="caption" color="textSecondary">
                        {formatDate(comment.createdAt)}
                    </Typography>
                </Box>
            </Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
                {comment.content}
            </Typography>
            <Button
                size="small"
                variant="text"
                onClick={() => setShowReplyForm(!showReplyForm)}
            >
                Trả lời
            </Button>

            {showReplyForm && (
                <form onSubmit={handleReplySubmit} style={{ marginTop: '10px' }}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Viết phản hồi..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        sx={{ mb: 1 }}
                    />
                    <Button type="submit" variant="contained" size="small">
                        Gửi
                    </Button>
                </form>
            )}

            {comment.replies?.map((reply) => (
                <Comment key={reply.id} comment={reply} onReply={onReply} />
            ))}
        </Box>
    );
}

const Info = () => {
    const navigate = useNavigate();
    const params = useParams();
    const taskId = params.taskId || params.id; // Try both possible parameter names

    const [taskDetails, setTaskDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [comments, setComments] = useState([]);
    const [newContent, setNewContent] = useState("");
    // Remove unnecessary state and ref
    const [isDocxFile, setIsDocxFile] = useState(false);
    const [isDocxLoading, setIsDocxLoading] = useState(false);
    const docxContainerRef = useRef(null);

    // Function to determine file type
    const getFileType = (url) => {
        if (!url) return null;
        const extension = url.split('.').pop().toLowerCase();
        return extension;
    };

    // Ensure that the useEffect hook is used correctly and consistently
    useEffect(() => {
        const fetchTaskDetails = async () => {
            if (!taskId) {
                console.error("Task ID is undefined", new Error().stack);
                setError("Task ID is missing. Please go back and try again.");
                setLoading(false);
                return;
            }

            try {
                console.log('Fetching task details for task ID:', taskId);
                const data = await ApiService.getTask(taskId);
                console.log('Fetched task details:', data);
                setTaskDetails(data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch task details:", error);
                setError("Failed to load task details. Please try again later.");
                setLoading(false);
            }
        };

        const fetchComments = async () => {
            if (!taskId) return;

            try {
                console.log('Fetching comments for task ID:', taskId);
                const res = await fetch(`${API_BASE}/${taskId}`);
                if (!res.ok) {
                    throw new Error(`Error fetching comments: ${res.statusText}`);
                }
                const data = await res.json();
                console.log('Fetched comments:', data);
                setComments(data);
            } catch (error) {
                console.error("Failed to fetch comments:", error);
                setComments([]);
            }
        };

        fetchTaskDetails();
        fetchComments();
    }, [taskId]);

    const handleNewComment = async (e) => {
        e.preventDefault();
        if (!newContent.trim()) return;

        try {
            console.log('Posting new comment:', newContent);
            await fetch(API_BASE, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    taskId,
                    userId: 2,
                    content: newContent,
                }),
            });
            setNewContent("");

            // Fetch updated comments
            const res = await fetch(`${API_BASE}/${taskId}`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (error) {
            console.error("Failed to post comment:", error);
        }
    };

    const handleReply = async (parentId, replyContent) => {
        try {
            console.log('Posting reply to comment ID:', parentId, 'with content:', replyContent);
            await fetch(API_BASE, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    taskId,
                    userId: 2,
                    parentId,
                    content: replyContent,
                }),
            });

            // Fetch updated comments
            const res = await fetch(`${API_BASE}/${taskId}`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (error) {
            console.error("Failed to post reply:", error);
        }
    };

    // Function to render file attachment
    const renderAttachment = () => {
        if (!taskDetails?.urlFile) {
            return (
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        backgroundColor: '#f5f7fa',
                        borderRadius: 2,
                        textAlign: 'center'
                    }}
                >
                    <Typography variant="body2" color="text.secondary">
                        Không có tài liệu đính kèm
                    </Typography>
                </Paper>
            );
        }

        const fileType = getFileType(taskDetails.urlFile);
        const fileName = taskDetails.urlFile.split('/').pop();

        return (
            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Link
                        href={taskDetails.urlFile}
                        target="_blank"
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            textDecoration: 'none',
                            color: 'primary.main',
                            fontWeight: 'medium',
                            '&:hover': {
                                textDecoration: 'underline'
                            }
                        }}
                    >
                        <IconFileText size={20} style={{ marginRight: '8px' }} />
                        {fileName}
                    </Link>
                    <Box>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<IconDownload size={16} />}
                            href={taskDetails.urlFile}
                            download={fileName}
                            sx={{ borderRadius: '8px', mr: 1 }}
                        >
                            Tải xuống
                        </Button>

                        {fileType === 'docx' && (
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<IconExternalLink size={16} />}
                                component="a"
                                href={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(taskDetails.urlFile)}`}
                                target="_blank"
                                sx={{ borderRadius: '8px' }}
                            >
                                Xem trực tuyến
                            </Button>
                        )}
                    </Box>
                </Box>

                {fileType === 'docx' ? (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Xem trước tài liệu (Microsoft Office Online)
                        </Typography>
                        <Paper
                            elevation={1}
                            sx={{
                                borderRadius: 2,
                                overflow: 'hidden',
                                height: '400px', // Reduced height
                            }}
                        >
                            <iframe
                                src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(taskDetails.urlFile)}`}
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                title="Document Preview"
                            />
                        </Paper>
                    </Box>
                ) : (
                    ['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(fileType) && (
                        <Box
                            sx={{
                                mt: 1,
                                border: '1px solid #e0e0e0',
                                borderRadius: 2,
                                overflow: 'hidden'
                            }}
                        >
                            <img
                                src={taskDetails.urlFile}
                                alt="Tài liệu đính kèm"
                                style={{
                                    maxWidth: '100%',
                                    display: 'block'
                                }}
                            />
                        </Box>
                    )
                )}
            </Box>
        );
    };

    if (loading) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <LinearProgress sx={{ mb: 2 }} />
                <Typography variant="h6">Đang tải thông tin nhiệm vụ...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 4 }}>
                <Button
                    variant="outlined"
                    startIcon={<IconArrowLeft />}
                    onClick={() => navigate(-1)}
                    sx={{ fontSize: '0.95rem', mb: 2 }}
                >
                    Trở lại
                </Button>
                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
                    <Typography color="error" variant="h6">{error}</Typography>
                </Paper>
            </Box>
        );
    }

    // Determine status color
    const getStatusConfig = (status) => {
        const statusMap = {
            'Pending': { color: 'warning', label: 'Chờ xử lý' },
            'In Progress': { color: 'primary', label: 'Đang thực hiện' },
            'Completed': { color: 'success', label: 'Hoàn thành' },
            'Overdue': { color: 'error', label: 'Quá hạn' }
        };
        return statusMap[status] || { color: 'default', label: status || 'N/A' };
    };

    const statusConfig = getStatusConfig(taskDetails?.status);

    return (
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, backgroundColor: '#f8f9fa' }}>
            {/* Header with back button */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}
                aria-hidden={false} // Ensure the element is not hidden from assistive technologies
            >
                <Button
                    variant="outlined"
                    startIcon={<IconArrowLeft />}
                    onClick={() => navigate(-1)}
                    sx={{
                        fontSize: '0.95rem',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                >
                    Trở lại
                </Button>
                <Typography variant="h5" fontWeight="bold" color="primary">
                    Chi tiết nhiệm vụ
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* Task Details Card */}
                <Grid item xs={12}>
                    <Card
                        elevation={2}
                        sx={{
                            borderRadius: 3,
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                            }
                        }}
                    >
                        <Box
                            sx={{
                                height: '8px',
                                backgroundColor: `${statusConfig.color}.main`,
                                width: '100%'
                            }}
                        />
                        <CardContent sx={{ p: 4 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                                <Typography variant="h5" fontWeight="bold" gutterBottom>
                                    {taskDetails?.title || "N/A"}
                                </Typography>
                                <Chip
                                    label={statusConfig.label}
                                    color={statusConfig.color}
                                    sx={{
                                        fontWeight: 'bold',
                                        borderRadius: '8px',
                                        px: 1
                                    }}
                                />
                            </Box>

                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Stack spacing={2}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <IconUser size={20} style={{ marginRight: '8px', opacity: 0.7 }} />
                                            <Typography variant="body2" sx={{ mr: 1 }}>
                                                <strong>Người giao:</strong>
                                            </Typography>
                                            <Typography variant="body2">
                                                {taskDetails?.assignedByName || "N/A"}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <IconUser size={20} style={{ marginRight: '8px', opacity: 0.7 }} />
                                            <Typography variant="body2" sx={{ mr: 1 }}>
                                                <strong>Người nhận:</strong>
                                            </Typography>
                                            <Typography variant="body2">
                                                {taskDetails?.assignedToName || "N/A"}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Stack spacing={2}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <IconCalendarEvent size={20} style={{ marginRight: '8px', opacity: 0.7 }} />
                                            <Typography variant="body2" sx={{ mr: 1 }}>
                                                <strong>Ngày bắt đầu:</strong>
                                            </Typography>
                                            <Typography variant="body2">
                                                {formatDate(taskDetails?.startTime)}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <IconClock size={20} style={{ marginRight: '8px', opacity: 0.7 }} />
                                            <Typography variant="body2" sx={{ mr: 1 }}>
                                                <strong>Ngày kết thúc:</strong>
                                            </Typography>
                                            <Typography variant="body2">
                                                {formatDate(taskDetails?.endTime)}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 3 }} />

                            <Box sx={{ mb: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <IconFileDescription size={20} style={{ marginRight: '8px', opacity: 0.7 }} />
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        Mô tả
                                    </Typography>
                                </Box>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2,
                                        backgroundColor: '#f5f7fa',
                                        borderRadius: 2,
                                        minHeight: '80px'
                                    }}
                                >
                                    <Typography variant="body2">
                                        {taskDetails?.description || "Không có mô tả"}
                                    </Typography>
                                </Paper>
                            </Box>

                            <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <IconPaperclip size={20} style={{ marginRight: '8px', opacity: 0.7 }} />
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        Tài liệu đính kèm
                                    </Typography>
                                </Box>

                                {renderAttachment()}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Comments Section */}
                <Grid item xs={12}>
                    <CommentsSection
                        comments={comments}
                        onNewComment={handleNewComment}
                        onReply={handleReply}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default Info;