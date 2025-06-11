import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    Snackbar,
    Alert,
} from '@mui/material';
import { IconSend, IconEye, IconArrowLeft, IconX } from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import ApiService from 'src/service/ApiService';

const AddNotification = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        senderName: ''
    });
    const [showPreview, setShowPreview] = useState(false);
    const [openConfirmSend, setOpenConfirmSend] = useState(false);
    const [openConfirmCancel, setOpenConfirmCancel] = useState(false);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const userProfile = await ApiService.getUserProfile();
                setFormData(prev => ({
                    ...prev,
                    senderName: userProfile.fullName
                }));
            } catch (error) {
                // Không cần alert, chỉ log
                console.error('Failed to fetch user profile:', error);
            }
        };
        fetchUserProfile();
    }, []);

    // Xử lý thay đổi dữ liệu trong form
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Xử lý khi submit form
    const handleSubmit = (e) => {
        e.preventDefault();
        setOpenConfirmSend(true); // Mở dialog xác nhận gửi
    };

    // Xử lý khi xác nhận gửi thông báo
    const handleConfirmSubmit = async () => {
        setOpenConfirmSend(false);
        setLoading(true);
        try {
            await ApiService.sendNotification(formData);
            setSnackbar({ open: true, message: 'Thông báo gửi thành công!', severity: 'success' });
            setTimeout(() => navigate('/home'), 1200);
        } catch (error) {
            setSnackbar({ open: true, message: 'Có lỗi xảy ra khi gửi thông báo', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // Xử lý khi nhấn nút Hủy
    const handleCancel = () => {
        if (formData.title || formData.description) {
            setOpenConfirmCancel(true); // Mở dialog xác nhận hủy nếu có dữ liệu
        } else {
            navigate(-1); // Trở lại nếu không có dữ liệu
        }
    };

    // Xác nhận hủy tạo mới
    const handleConfirmCancel = () => {
        setOpenConfirmCancel(false);
        navigate(-1);
    };

    return (
        <PageContainer title="Tạo thông báo" description="Tạo thông báo mới">
            {/* Overlay loading */}
            {loading && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        bgcolor: 'rgba(0,0,0,0.25)',
                        zIndex: 2000,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <CircularProgress size={48} color="primary" />
                </Box>
            )}

            {/* Snackbar thông báo */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* Dialog xác nhận gửi */}
            <Dialog open={openConfirmSend} onClose={() => setOpenConfirmSend(false)}>
                <DialogTitle>Xác nhận gửi thông báo</DialogTitle>
                <DialogContent>
                    <Typography>Bạn có chắc chắn muốn gửi thông báo này không?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenConfirmSend(false)} color="inherit">
                        Hủy
                    </Button>
                    <Button
                        onClick={handleConfirmSubmit}
                        color="primary"
                        variant="contained"
                        disabled={loading}
                        autoFocus
                    >
                        Xác nhận
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog xác nhận hủy */}
            <Dialog open={openConfirmCancel} onClose={() => setOpenConfirmCancel(false)}>
                <DialogTitle>Xác nhận hủy tạo thông báo</DialogTitle>
                <DialogContent>
                    <Typography>Bạn có chắc chắn muốn hủy tạo thông báo mới này không?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenConfirmCancel(false)} color="inherit">
                        Không
                    </Button>
                    <Button
                        onClick={handleConfirmCancel}
                        color="error"
                        variant="contained"
                        autoFocus
                    >
                        Hủy tạo mới
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
                    disabled={loading}
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
                                Tạo thông báo mới
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
                                            disabled={loading}
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
                                            disabled={loading}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Stack direction="row" spacing={2} justifyContent="flex-end">
                                            <Button
                                                variant="outlined"
                                                onClick={() => setShowPreview(!showPreview)}
                                                startIcon={<IconEye />}
                                                disabled={loading}
                                            >
                                                {showPreview ? 'Ẩn xem trước' : 'Xem trước'}
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="error"
                                                onClick={handleCancel}
                                                startIcon={<IconX />}
                                                disabled={loading}
                                            >
                                                Hủy
                                            </Button>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                startIcon={<IconSend />}
                                                disabled={loading}
                                            >
                                                Lưu và gửi
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
                                        Người gửi: {formData.senderName || 'Không xác định'}
                                    </Typography>
                                </Box>
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Thời gian gửi: {new Date().toLocaleString('vi-VN')}
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

export default AddNotification;