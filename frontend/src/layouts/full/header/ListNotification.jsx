// src/layouts/header/ListNotification.jsx
import { useContext } from 'react';
import { Box, Typography, Menu, MenuItem, Divider, Button } from '@mui/material';
import { IconCheck } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { NotificationContext } from '../../../contexts/NotificationContext';
import { useUser } from 'src/contexts/UserContext'; // Thêm useUser
import PropTypes from 'prop-types';

const ListNotification = ({ anchorEl, open, onClose }) => {
    const navigate = useNavigate();
    const { notifications, markAsRead } = useContext(NotificationContext);
    const { user } = useUser(); // Lấy thông tin người dùng

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            markAsRead(notification.id);
        }
        navigate(`/notification/${notification.id}`, { state: { notification } });
        onClose();
    };

    return (
        <Menu
            anchorEl={anchorEl}
            id="notification-menu"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: { width: 320, maxHeight: 450 },
            }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        >
            <Box p={2}>
                <Typography variant="h6">Thông báo</Typography>
            </Box>
            <Divider />

            {!user.isAuthenticated ? (
                <MenuItem disabled>
                    <Typography variant="body2" color="text.secondary">
                        Vui lòng đăng nhập để xem thông báo
                    </Typography>
                </MenuItem>
            ) : notifications.length === 0 ? (
                <MenuItem disabled>
                    <Typography variant="body2" color="text.secondary">
                        Không có thông báo mới nào
                    </Typography>
                </MenuItem>
            ) : (
                notifications
                    .filter((notification) => !notification.role || notification.role === user.role) // Lọc theo vai trò
                    .sort((a, b) => a.isRead - b.isRead)
                    .slice(0, 3)
                    .map((notification) => (
                        <MenuItem
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            sx={{
                                py: 1.5,
                                px: 2,
                                backgroundColor: notification.isRead ? 'inherit' : 'action.hover',
                            }}
                        >
                            <Box sx={{ width: '100%' }}>
                                <Box
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="space-between"
                                >
                                    <Typography variant="subtitle2">{notification.title}</Typography>
                                    {!notification.isRead && (
                                        <Box
                                            sx={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: '50%',
                                                bgcolor: 'primary.main',
                                            }}
                                        />
                                    )}
                                </Box>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    {notification.time || new Date(notification.sentAt).toLocaleTimeString('vi-VN')}
                                </Typography>
                            </Box>
                        </MenuItem>
                    ))
            )}

            <Divider />
            <Box p={2} display="flex" justifyContent="center">
                <Button
                    size="small"
                    startIcon={<IconCheck size={18} />}
                    onClick={() => navigate('/home')}
                    disabled={!user.isAuthenticated}
                >
                    Tất cả thông báo
                </Button>
            </Box>
        </Menu>
    );
};
ListNotification.propTypes = {
    anchorEl: PropTypes.any,
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default ListNotification;