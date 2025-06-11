// src/layouts/header/ListMessage.jsx
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    Box,
    Menu,
    MenuItem,
    ListItemAvatar,
    Avatar,
    Typography,
    Button,
    Divider,
    CircularProgress,
    Badge,
} from '@mui/material';
import { IconChevronRight } from '@tabler/icons-react';
import ApiService from 'src/service/ApiService';
import { useSignalR } from 'src/contexts/SignalRContext';
import { useUser } from 'src/contexts/UserContext';
import { useMessageBadge } from 'src/contexts/MessageBadgeContext';
import Tooltip from '@mui/material/Tooltip';
import PropTypes from 'prop-types';

const ListMessage = ({ anchorEl, open, onClose }) => {
    const [groups, setGroups] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { chatConnection, connectionState } = useSignalR();
    const { user } = useUser();
    const { unread, markRead } = useMessageBadge();

    useEffect(() => {
        const fetchGroups = async () => {
            if (!open || !user.isAuthenticated || !user.userId) return;
            try {
                setLoading(true);
                setError(null);
                const data = await ApiService.getChatGroups();
                const enrichedGroups = await Promise.all(
                    data.map(async (group) => {
                        try {
                            const messages = await ApiService.getChatGroupById(group.id);
                            const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
                            return {
                                ...group,
                                lastMessage: lastMessage
                                    ? {
                                        id: lastMessage.id,
                                        content: lastMessage.content,
                                        sentAt: lastMessage.sentAt,
                                        senderName: lastMessage.senderName,
                                    }
                                    : null,
                                hasNewMessage: unread[`group_${group.id}`] || false,
                            };
                        } catch (err) {
                            console.error(`Lỗi khi lấy tin nhắn cho group ${group.id}:`, err);
                            return { ...group, lastMessage: null, hasNewMessage: false };
                        }
                    })
                );
                setGroups(enrichedGroups || []);
            } catch (err) {
                console.error('Lỗi khi lấy danh sách group:', err);
                setError('Không thể tải danh sách nhóm. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        fetchGroups();
    }, [open, user.isAuthenticated, user.userId, unread]);

    useEffect(() => {
        const fetchUsers = async () => {
            if (!open || !user.isAuthenticated || !user.userId) return;
            try {
                const allUsers = await ApiService.getAllUsers();
                setUsers(allUsers.filter(u => u.id !== user.userId));
            } catch (err) {
                setUsers([]);
            }
        };
        fetchUsers();
    }, [open, user.isAuthenticated, user.userId]);

    useEffect(() => {
        if (!chatConnection || connectionState !== 'Connected' || !user.userId) return;

        const handleReceiveGroupMessage = (messageDto) => {
            if (!messageDto || typeof messageDto !== 'object') return;
            const groupId = messageDto.groupChatId;
            setGroups((prev) => {
                const updatedGroups = prev.map((group) => {
                    if (group.id === groupId) {
                        const isRead = messageDto.senderId === user.userId || messageDto.isRead;
                        return {
                            ...group,
                            lastMessage: {
                                id: messageDto.id,
                                content: messageDto.content,
                                sentAt: messageDto.sentAt || new Date().toISOString(),
                                senderName: messageDto.senderName || 'Người gửi',
                            },
                            hasNewMessage: !isRead,
                        };
                    }
                    return group;
                });
                return updatedGroups.sort((a, b) => {
                    const timeA = a.lastMessage ? new Date(a.lastMessage.sentAt).getTime() : 0;
                    const timeB = b.lastMessage ? new Date(b.lastMessage.sentAt).getTime() : 0;
                    return timeB - timeA;
                });
            });
        };

        chatConnection.on('ReceiveGroupMessage', handleReceiveGroupMessage);

        return () => {
            chatConnection.off('ReceiveGroupMessage', handleReceiveGroupMessage);
        };
    }, [chatConnection, connectionState, user.userId]);

    const sortedGroups = useMemo(() => {
        return [...groups]
            .sort((a, b) => {
                const timeA = a.lastMessage ? new Date(a.lastMessage.sentAt).getTime() : 0;
                const timeB = b.lastMessage ? new Date(b.lastMessage.sentAt).getTime() : 0;
                return timeB - timeA;
            })
            .slice(0, 3);
    }, [groups]);

    const nameStyle = {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: 160,
    };

    return (
        <Menu
            id="msgs-menu"
            anchorEl={anchorEl}
            keepMounted
            open={open}
            onClose={onClose}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            sx={{
                '& .MuiMenu-paper': {
                    width: '340px',
                    maxHeight: 480,
                },
            }}
        >
            {loading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
                    <CircularProgress size={28} />
                    <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                        Đang tải nhóm chat...
                    </Typography>
                </Box>
            ) : error ? (
                <Box sx={{ p: 2 }}>
                    <Typography color="error">{error}</Typography>
                </Box>
            ) : !user.isAuthenticated ? (
                <Box sx={{ p: 2 }}>
                    <Typography>Vui lòng đăng nhập để xem nhóm chat.</Typography>
                </Box>
            ) : sortedGroups.length === 0 && users.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">Không có nhóm hoặc tin nhắn nào.</Typography>
                </Box>
            ) : (
                [
                    ...sortedGroups.map((group) => (
                        <MenuItem
                            key={`group-${group.id}`}
                            component={Link}
                            to={{
                                pathname: `/messages/group/${group.id}`,
                                state: { selectedGroup: group },
                            }}
                            onClick={() => {
                                markRead('group', group.id);
                                onClose();
                            }}
                            sx={{ py: 1.5, position: 'relative' }}
                        >
                            <ListItemAvatar>
                                <Avatar
                                    alt={group.name}
                                    src={
                                        group.icon && typeof group.icon === 'string' && group.icon.trim()
                                            ? group.icon
                                            : 'https://as1.ftcdn.net/jpg/02/15/15/40/1000_F_215154008_oWtNLNPoeWjsrsPYhRPRxp4w0h0TOVg2.jpg'
                                    }
                                />
                            </ListItemAvatar>
                            <Box sx={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
                                <Tooltip title={group.name || 'Nhóm không tên'} arrow>
                                    <Typography
                                        variant="subtitle2"
                                        sx={{
                                            ...nameStyle,
                                            fontWeight: group.hasNewMessage ? 'bold' : 'normal',
                                        }}
                                    >
                                        {group.name || 'Nhóm không tên'}
                                    </Typography>
                                </Tooltip>
                                {group.lastMessage && (
                                    <>
                                        <Tooltip title={group.lastMessage.content || ''} arrow>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    ...nameStyle,
                                                    color: group.hasNewMessage ? 'text.primary' : 'text.secondary',
                                                }}
                                            >
                                                {group.lastMessage.senderName}: {group.lastMessage.content || 'Không có nội dung'}
                                            </Typography>
                                        </Tooltip>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{ display: 'block' }}
                                        >
                                            {group.lastMessage.sentAt
                                                ? new Date(group.lastMessage.sentAt).toLocaleTimeString('vi-VN')
                                                : 'Vừa xong'}
                                        </Typography>
                                    </>
                                )}
                            </Box>
                            {group.hasNewMessage && (
                                <Badge
                                    color="error"
                                    variant="dot"
                                    sx={{
                                        position: 'absolute',
                                        right: 16,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                    }}
                                />
                            )}
                        </MenuItem>
                    )),
                    ...(users.length > 0
                        ? [
                            <Typography
                                key="private-title"
                                variant="subtitle2"
                                sx={{ px: 2, pt: 1, pb: 0.5, color: 'text.secondary' }}
                            >
                                Tin nhắn riêng
                            </Typography>,
                            ...users.slice(0, 3).map((u) => (
                                <MenuItem
                                    key={`user-${u.id}`}
                                    component={Link}
                                    to={{
                                        pathname: `/messages/${u.id}`,
                                        state: { selectedUser: u },
                                    }}
                                    onClick={() => {
                                        markRead('user', u.id);
                                        onClose();
                                    }}
                                    sx={{ py: 1.5, position: 'relative' }}
                                >
                                    <ListItemAvatar>
                                        <Avatar alt={u.fullName} src={u.avatar || '/default-avatar.jpg'} />
                                    </ListItemAvatar>
                                    <Box sx={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
                                        <Tooltip title={u.fullName} arrow>
                                            <Typography
                                                variant="subtitle2"
                                                sx={{
                                                    ...nameStyle,
                                                    fontWeight: unread[`user_${u.id}`] ? 'bold' : 'normal',
                                                }}
                                            >
                                                {u.fullName}
                                            </Typography>
                                        </Tooltip>
                                    </Box>
                                    {unread[`user_${u.id}`] && (
                                        <Badge
                                            color="error"
                                            variant="dot"
                                            sx={{
                                                position: 'absolute',
                                                right: 16,
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                            }}
                                        />
                                    )}
                                </MenuItem>
                            )),
                            <Divider key="private-divider" sx={{ my: 1 }} />,
                        ]
                        : [])
                ]
            )}
            <Box mt={1} py={1} px={2}>
                <Button
                    to="/messages"
                    variant="outlined"
                    color="primary"
                    component={Link}
                    fullWidth
                    endIcon={<IconChevronRight />}
                    disabled={!user.isAuthenticated}
                >
                    Xem tất cả nhóm chat
                </Button>
            </Box>
        </Menu>
    );
};

ListMessage.propTypes = {
    anchorEl: PropTypes.any,
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default ListMessage;