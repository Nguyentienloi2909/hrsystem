import React, { useState, useEffect } from 'react';
import {
    Grid, Typography, Button, List, ListItem, ListItemText, Avatar,
    Box, CircularProgress, Card, Divider, Chip, Snackbar, Alert
} from '@mui/material';
import { IconEdit, IconLogout } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../service/ApiService';
import PageContainer from 'src/components/container/PageContainer';
import { useUser } from 'src/contexts/UserContext';

const Profile = () => {
    // Không lấy user từ context, chỉ dùng setContextUser để cập nhật lại context nếu cần
    const { setUser: setContextUser } = useUser();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '' });
    const navigate = useNavigate();

    // Log mỗi lần render
    console.log('Profile: user state at render:', user);

    useEffect(() => {
        // Luôn lấy dữ liệu mới nhất từ API
        const fetchUserProfile = async () => {
            try {
                setLoading(true);
                const userData = await ApiService.getUserProfile();
                console.log('Profile: userData from API:', userData);
                setUser(userData);
                // Nếu muốn đồng bộ lại context thì cập nhật, nhưng không dùng context để hiển thị
                if (setContextUser) {
                    setContextUser(prev => ({
                        ...prev,
                        ...userData,
                        userId: userData.id,
                        fullName: userData.fullName,
                        avatar: userData.avatar,
                        email: userData.email,
                        phoneNumber: userData.phoneNumber,
                        // ...thêm các trường khác nếu cần
                    }));
                }
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Lỗi khi tải hồ sơ');
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
        // eslint-disable-next-line
    }, []);

    const handleLogout = () => {
        ApiService.logout();
        setSnackbar({ open: true, message: 'Đăng xuất thành công!' });
        setTimeout(() => navigate('/home'), 1500);
    };

    const handleEditProfile = () => {
        navigate('/edit-profile');
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ open: false, message: '' });
    };

    const handleImageError = (e) => {
        e.target.src = 'https://www.gravatar.com/avatar/?d=identicon';
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.default' }}>
                <CircularProgress size={48} sx={{ color: 'primary.main' }} />
                <Typography variant="h6" sx={{ ml: 2, color: 'text.secondary' }}>Đang tải hồ sơ...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.default' }}>
                <Card sx={{ p: 4, borderRadius: 2, boxShadow: 3 }}>
                    <Typography variant="h6" color="error" sx={{ textAlign: 'center' }}>{error}</Typography>
                    <Button
                        variant="contained"
                        sx={{ mt: 2, bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
                        onClick={() => navigate(-1)}
                    >
                        Trở lại
                    </Button>
                </Card>
            </Box>
        );
    }

    if (!user) return null;

    return (
        <PageContainer title="Thông tin nhân viên" description="Trang chi tiết hồ sơ cá nhân">
            {/* Log dữ liệu user để kiểm tra */}
            {console.log('Profile: user state:', user)}
            <Box
                sx={{
                    minHeight: '100vh',
                    height: '100%',
                    width: '100%',
                    bgcolor: 'background.default',
                    py: 8,
                    px: 4,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <Grid container justifyContent="center">
                    <Grid item xs={12} md={10} lg={8}>
                        <Card sx={{ borderRadius: 3, boxShadow: 4, overflow: 'hidden', bgcolor: 'background.paper' }}>
                            <Box sx={{ bgcolor: 'primary.main', p: 6, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: { xs: 'column', sm: 'row' }, textAlign: { xs: 'center', sm: 'left' } }}>
                                    <Avatar
                                        src={user.avatar}
                                        onError={handleImageError}
                                        sx={{ width: 96, height: 96, border: 4, borderColor: 'white', boxShadow: 2, mb: { xs: 2, sm: 0 }, mr: { sm: 4 } }}
                                    />
                                    <Box>
                                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
                                            {user.fullName || '---'}
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: 'primary.light' }}>
                                            {user.roleName || '---'}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'primary.light', mt: 1 }}>
                                            Nhóm: {user.groupName || '---'}
                                        </Typography>
                                        <Chip
                                            label={user.status === 'Active' ? 'Đang hoạt động' : user.status || '---'}
                                            color={user.status === 'Active' ? 'success' : 'default'}
                                            size="small"
                                            sx={{ mt: 2 }}
                                        />
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', mt: { xs: 4, sm: 0 }, gap: 2 }}>
                                    <Button
                                        variant="contained"
                                        startIcon={<IconEdit />}
                                        sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
                                        onClick={handleEditProfile}
                                    >
                                        Sửa hồ sơ
                                    </Button>
                                    {/* <Button
                                        variant="outlined"
                                        startIcon={<IconLogout />}
                                        sx={{ borderColor: 'white', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
                                        onClick={handleLogout}
                                    >
                                        Đăng xuất
                                    </Button> */}
                                </Box>
                            </Box>

                            <Divider />

                            <Box sx={{ p: 6 }}>
                                <Grid container spacing={4}>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="h6" sx={{ fontWeight: 'medium', color: 'text.primary', mb: 4 }}>
                                            Thông tin cá nhân
                                        </Typography>
                                        <List dense>
                                            <InfoItem label="Ngày sinh" value={formatDate(user.birthDate)} />
                                            <InfoItem label="Giới tính" value={user.gender ? 'Nam' : 'Nữ'} />
                                            <InfoItem label="Số điện thoại" value={user.phoneNumber || '---'} />
                                            <InfoItem label="Email" value={user.email || '---'} />
                                            <InfoItem label="Địa chỉ" value={user.address || '---'} />
                                        </List>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="h6" sx={{ fontWeight: 'medium', color: 'text.primary', mb: 4 }}>
                                            Thông tin công việc
                                        </Typography>
                                        <List dense>
                                            <InfoItem label="Ngân hàng" value={`${user.bankName || '---'} - ${user.bankNumber || '---'}`} />
                                            <InfoItem label="Lương tháng" value={user.monthSalary ? `${user.monthSalary.toLocaleString('vi-VN')} VNĐ` : '---'} />
                                            <InfoItem label="Ngày bắt đầu" value={formatDate(user.startDate)} />
                                            <InfoItem label="Nhóm" value={user.groupName || '---'} />
                                            <InfoItem label="Trạng thái" value={user.status || '---'} />
                                        </List>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Card>
                    </Grid>
                </Grid>
            </Box>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </PageContainer>
    );
};

import PropTypes from 'prop-types';

const InfoItem = ({ label, value }) => (
    <ListItem sx={{ py: 2, '&:hover': { bgcolor: 'grey.100' }, borderRadius: 1, boxShadow: 1, mb: 2 }}>
        <ListItemText
            primary={label}
            secondary={value || '---'}
            primaryTypographyProps={{ sx: { fontWeight: 'bold', color: 'text.primary', fontSize: '1.1rem' } }}
            secondaryTypographyProps={{ sx: { color: 'text.secondary', fontSize: '1rem' } }}
        />
    </ListItem>
);

InfoItem.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string,
};

const formatDate = (dateStr) => {
    if (!dateStr) return '---';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
};

export default Profile;