import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    TextField,
    Button,
    Grid,
    Typography,
    Divider,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
} from '@mui/material';
import { IconSend, IconEye, IconArrowLeft, IconX } from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from 'src/components/shared/DashboardCard';
import ApiService from 'src/service/ApiService';

const EditNotification = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { notification } = location.state || {};

    const [formData, setFormData] = useState({
        title: '',
        description: '',
    });
    const [showPreview, setShowPreview] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    // Khởi tạo formData từ notification khi component mount
    useEffect(() => {
        if (notification) {
            setFormData({
                title: notification.title || '',
                description: notification.description || '',
            });
        }
    }, [notification]);

    // Xử lý thay đổi dữ liệu trong form
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Xử lý khi submit form
    const handleSubmit = (e) => {
        e.preventDefault();
        setOpenConfirm(true); // Mở dialog xác nhận
    };

    // Xử lý khi xác nhận lưu thông báo
    const handleConfirmSubmit = async () => {
        setOpenConfirm(false);
        setLoading(true);
        try {
            const updatedNotification = {
                id: notification.id,
                title: formData.title,
                description: formData.description,
            };
            const response = await ApiService.updateNotification(updatedNotification); // Giả định API cập nhật
            console.log('Notification updated:', response);
            alert('Thông báo đã được cập nhật thành công!');
            navigate(`/home`, { state: { notification: response } });
        } catch (error) {
            console.error('Error updating notification:', error);
            alert('Có lỗi xảy ra khi cập nhật thông báo');
        } finally {
            setLoading(false);
        }
    };

    // Xử lý khi nhấn nút Hủy
    const handleCancel = () => {
        navigate(-1); // Trở lại trang trước (NotificationDetail)
    };

    // Xử lý khi xác nhận hủy
    const handleConfirmCancel = () => {
        setOpenConfirm(false);
        navigate(-1);
    };

    if (!notification) {
        return (
            <Typography variant="h6" sx={{ textAlign: 'center', mt: 4 }}>
                Không có thông báo được chọn để chỉnh sửa
            </Typography>
        );
    }

    return (
        <PageContainer title="Chỉnh sửa thông báo" description="Chỉnh sửa thông báo hiện có">
            {/* Hiển thị CircularProgress khi đang loading */}
            {loading && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 1000,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <CircularProgress />
                </Box>
            )}

            {/* Dialog xác nhận */}
            <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
                <DialogTitle>Xác nhận cập nhật thông báo</DialogTitle>
                <DialogContent>
                    <Typography>Bạn có chắc chắn muốn lưu các thay đổi cho thông báo này không?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenConfirm(false)} color="error">
                        Hủy
                    </Button>
                    <Button onClick={handleConfirmSubmit} color="primary">
                        Xác nhận
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Nút Trở lại */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                <Button
                    variant="outlined"
                    startIcon={<IconArrowLeft />}
                    onClick={handleCancel}
                    sx={{ fontSize: '0.95rem' }}
                >
                    Trở lại
                </Button>
            </Box>

            {/* Form và Preview */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={showPreview ? 8 : 12}>
                    <DashboardCard title="" sx={{ mt: 4, boxShadow: 3, borderRadius: 2 }}>
                        <Box sx={{ p: 4 }}>
                            <Typography
                                variant="h4"
                                gutterBottom
                                sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}
                            >
                                Chỉnh sửa thông báo
                            </Typography>
                            <Divider sx={{ mb: 3 }} />

                            <Box component="form" onSubmit={handleSubmit}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Tiêu đề thông báo"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Nội dung thông báo"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            multiline
                                            rows={6}
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Stack direction="row" spacing={2} justifyContent="flex-end">
                                            <Button
                                                variant="outlined"
                                                onClick={() => setShowPreview(!showPreview)}
                                                startIcon={<IconEye />}
                                            >
                                                {showPreview ? 'Ẩn xem trước' : 'Xem trước'}
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="error"
                                                onClick={handleCancel}
                                                startIcon={<IconX />}
                                            >
                                                Hủy
                                            </Button>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                startIcon={<IconSend />}
                                            >
                                                Lưu thay đổi
                                            </Button>
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Box>
                    </DashboardCard>
                </Grid>

                {/* Phần xem trước */}
                {showPreview && (
                    <Grid item xs={12} md={4}>
                        <DashboardCard title="" sx={{ mt: 4, boxShadow: 3, borderRadius: 2 }}>
                            <Box sx={{ p: 4 }}>
                                <Typography
                                    variant="h4"
                                    gutterBottom
                                    sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}
                                >
                                    Xem trước thông báo
                                </Typography>
                                <Divider sx={{ mb: 3 }} />
                                <Typography variant="h5" gutterBottom>
                                    {formData.title || 'Tiêu đề thông báo'}
                                </Typography>
                                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                    {formData.description || 'Nội dung thông báo'}
                                </Typography>
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Thời gian cập nhật: {new Date().toLocaleString('vi-VN')}
                                    </Typography>
                                </Box>
                            </Box>
                        </DashboardCard>
                    </Grid>
                )}
            </Grid>
        </PageContainer>
    );
};

export default EditNotification;