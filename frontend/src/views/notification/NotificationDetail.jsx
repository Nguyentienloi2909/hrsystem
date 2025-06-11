import { useState, useEffect, useContext } from 'react';
import { Box, Typography, Divider, ButtonGroup, Button } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import { IconArrowLeft, IconEdit, IconTrash } from '@tabler/icons-react';
import { NotificationContext } from '../../contexts/NotificationContext';
import ApiService from 'src/service/ApiService';

const NotificationDetail = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { notification } = location.state || {};
    const { markAsRead, fetchNotifications } = useContext(NotificationContext); // Thêm fetchNotifications
    const [readTime, setReadTime] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userData = await ApiService.getUserProfile();
                setUser(userData);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();

        if (notification && !notification.isRead) {
            markAsRead(notification.id);
        }
        setReadTime(new Date());
    }, [notification, markAsRead]);

    if (!notification) {
        return (
            <Typography variant="h6" sx={{ textAlign: 'center', mt: 4 }}>
                Không có thông báo được chọn
            </Typography>
        );
    }

    const handleEdit = () => {
        navigate('/notification/edit', { state: { notification } });
    };

    const handleDelete = async () => {
        const confirmed = window.confirm('Bạn có muốn tiếp tục thao tác xóa thông báo này sao?');
        if (confirmed) {
            try {
                await ApiService.deleteNotification(notification.id);
                // Cập nhật lại danh sách thông báo ngay sau khi xóa
                if (fetchNotifications) await fetchNotifications();
                navigate('/home');
            } catch (error) {
                console.error('Có lỗi xảy ra khi xóa thông báo:', error);
            }
        }
    };

    return (
        <PageContainer title="Thông báo" description="Chi tiết thông báo">
            <Box sx={{
                mb: 3,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Button
                    variant="outlined"
                    startIcon={<IconArrowLeft />}
                    onClick={() => navigate(-1)}
                    sx={{ fontSize: '0.95rem', mr: 2 }}
                >
                    Trở lại
                </Button>
                {user?.roleName === 'ADMIN' && (
                    <ButtonGroup variant="contained">
                        <Button
                            color="primary"
                            startIcon={<IconEdit />}
                            onClick={handleEdit}
                            sx={{ fontSize: '0.95rem' }}
                        >
                            Sửa
                        </Button>
                        <Button
                            color="error"
                            startIcon={<IconTrash />}
                            onClick={handleDelete}
                            sx={{ fontSize: '0.95rem' }}
                        >
                            Xóa
                        </Button>
                    </ButtonGroup>
                )}
            </Box>
            <DashboardCard title="" sx={{ maxWidth: '800px', margin: 'auto', mt: 4, boxShadow: 3, borderRadius: 2 }}>
                <Box sx={{ p: 4 }}>
                    <Typography
                        variant="h4"
                        gutterBottom
                        sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}
                    >
                        Chi tiết thông báo
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Typography variant="h5" sx={{ textAlign: 'center' }} gutterBottom>
                        {notification.title || 'Tiêu đề thông báo'}
                    </Typography>
                    <Typography variant="h5" sx={{ textAlign: 'center' }} gutterBottom>
                        --------------------------------------------------
                    </Typography>
                    {/* Add margin to create space between title and description */}
                    <Box sx={{ height: 20 }} /> {/* Adjust height as needed */}
                    <Typography
                        variant="body1"
                        sx={{
                            whiteSpace: 'pre-wrap',
                            lineHeight: 1.8,
                            mb: 3,
                        }}
                    >
                        {notification.description || 'Nội dung thông báo'}
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        Thời gian gửi: {new Date(notification.sentAt).toLocaleString('vi-VN')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        Thời gian đọc: {readTime ? readTime.toLocaleString('vi-VN') : 'Đang tải...'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
                        Người đăng: {notification.senderName || 'Không xác định'}
                    </Typography>
                </Box>
            </DashboardCard>
        </PageContainer>
    );
};

export default NotificationDetail;