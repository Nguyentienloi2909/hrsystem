import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Typography, Chip, Link, Paper, Grid,
    Button, Stack, Divider, Card, CardContent, LinearProgress
} from '@mui/material';
import {
    IconArrowLeft, IconCalendarEvent, IconUser, IconClock, IconFileDescription,
    IconPaperclip, IconFileText, IconDownload, IconExternalLink
} from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import ApiService from 'src/service/ApiService';
import CommentsSection from './CommentsSection';

function formatDate(isoString) {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleString('vi-VN');
}

const Info = () => {
    const navigate = useNavigate();
    const params = useParams();
    const taskId = params.taskId || params.id;

    const [taskDetails, setTaskDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getFileType = (url) => {
        if (!url) return null;
        const extension = url.split('.').pop().toLowerCase();
        return extension;
    };

    useEffect(() => {
        const fetchTaskDetails = async () => {
            if (!taskId) {
                setError('Task ID is missing. Vui lòng quay lại và thử lại.');
                setLoading(false);
                return;
            }

            try {
                const data = await ApiService.getTask(taskId);
                setTaskDetails(data);
                setLoading(false);
            } catch (error) {
                // Không log ra console, chỉ hiển thị cho người dùng
                setError(
                    error?.response?.data?.message ||
                    'Không thể tải thông tin nhiệm vụ. Vui lòng thử lại sau.'
                );
                setLoading(false);
            }
        };

        fetchTaskDetails();
    }, [taskId]);

    const renderAttachment = () => {
        if (!taskDetails?.urlFile) {
            return (
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        backgroundColor: '#f5f7fa',
                        borderRadius: 2,
                        textAlign: 'center',
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
                                textDecoration: 'underline',
                            },
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
                                height: '400px',
                            }}
                        >
                            <iframe
                                src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(taskDetails.urlFile)}`}
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                title="Document Preview"
                                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
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
                                overflow: 'hidden',
                            }}
                        >
                            <img
                                src={taskDetails.urlFile}
                                alt="Tài liệu đính kèm"
                                style={{
                                    maxWidth: '100%',
                                    display: 'block',
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

    const getStatusConfig = (status) => {
        // Đồng bộ với statusConfig ở Task.jsx
        const statusMap = {
            pending: { color: 'warning', label: 'Chờ xử lý' },
            inprogress: { color: 'primary', label: 'Đang thực hiện' },
            late: { color: 'error', label: 'Muộn' },
            completed: { color: 'success', label: 'Hoàn thành' },
            cancelled: { color: 'default', label: 'Đã hủy' },
        };
        if (!status) return { color: 'default', label: 'N/A' };
        const key = status.toLowerCase().replace(/\s+/g, '');
        return statusMap[key] || { color: 'default', label: status };
    };

    const statusConfig = getStatusConfig(taskDetails?.status);

    return (
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, backgroundColor: '#f8f9fa' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
                <Button
                    variant="outlined"
                    startIcon={<IconArrowLeft />}
                    onClick={() => navigate(-1)}
                    sx={{
                        fontSize: '0.95rem',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    }}
                >
                    Trở lại
                </Button>
                <Typography variant="h5" fontWeight="bold" color="primary">
                    Chi tiết nhiệm vụ
                </Typography>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Card
                        elevation={2}
                        sx={{
                            borderRadius: 3,
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                            },
                        }}
                    >
                        <Box
                            sx={{
                                height: '20px',
                                backgroundColor: `${statusConfig.color}.main`,
                                width: '100%',
                            }}
                        />
                        <CardContent sx={{ p: 4 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                                <Typography variant="h5" fontWeight="bold" gutterBottom>
                                    {taskDetails?.title || 'N/A'}
                                </Typography>
                                <Chip
                                    label={statusConfig.label}
                                    color={statusConfig.color}
                                    sx={{
                                        fontWeight: 'bold',
                                        borderRadius: '8px',
                                        px: 1,
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
                                                {taskDetails?.senderName || 'N/A'}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <IconUser size={20} style={{ marginRight: '8px', opacity: 0.7 }} />
                                            <Typography variant="body2" sx={{ mr: 1 }}>
                                                <strong>Người nhận:</strong>
                                            </Typography>
                                            <Typography variant="body2">
                                                {taskDetails?.assignedToName || 'N/A'}
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
                                        minHeight: '80px',
                                    }}
                                >
                                    <Typography variant="body2">
                                        {taskDetails?.description || 'Không có mô tả'}
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

                <Grid item xs={12}>
                    <CommentsSection taskId={taskId} />
                </Grid>
            </Grid>
        </Box>
    );
};

export default Info;