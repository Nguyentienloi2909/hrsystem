import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { Box, Typography, Avatar, Paper, useTheme } from '@mui/material';
import PropTypes from 'prop-types';
import ApiService from '../../../service/ApiService';
import ProfileImg from 'src/assets/images/profile/user-1.jpg'; // Avatar mặc định

const MessageList = ({ messages = [], selectedUser, selectedGroup }) => {
    const theme = useTheme();
    const [loggedInUserId, setLoggedInUserId] = useState(null);
    const [hoveredMessageId, setHoveredMessageId] = useState(null);
    const [userAvatars, setUserAvatars] = useState({}); // Lưu trữ avatar theo senderId
    const messagesEndRef = useRef(null);

    // Hàm xử lý avatar (dùng useCallback để tránh tạo lại)
    const getAvatarSrc = useCallback((avatar) => {
        if (avatar && typeof avatar === 'string' && avatar.trim()) {
            const trimmedAvatar = avatar.trim();
            return trimmedAvatar.startsWith('http')
                ? trimmedAvatar
                : `/Uploads/avatars/${trimmedAvatar}`;
        }
        return ProfileImg;
    }, []);

    // Chỉ fetch avatar cho senderId chưa có trong cache
    useEffect(() => {
        let isMounted = true;
        const fetchUserIdAndAvatars = async () => {
            try {
                const userProfile = await ApiService.getUserProfile();
                if (isMounted) setLoggedInUserId(userProfile.id);

                // Lấy các senderId chưa có avatar
                const senderIds = [...new Set(messages
                    .filter(msg => msg.senderId && msg.senderId !== userProfile.id)
                    .map(msg => msg.senderId)
                )].filter(id => !userAvatars[id]);

                if (senderIds.length > 0) {
                    const allUsers = await ApiService.getAllUsers();
                    const avatars = {};
                    senderIds.forEach((senderId) => {
                        const user = allUsers.find(u => u.id === senderId);
                        avatars[senderId] = user ? user.avatar || null : null;
                    });
                    if (isMounted) setUserAvatars(prev => ({ ...prev, ...avatars }));
                }
            } catch (error) {
                console.error('Failed to retrieve user profile or avatars:', error);
            }
        };

        if (messages.length > 0) {
            fetchUserIdAndAvatars();
        }
        return () => { isMounted = false; };
    }, [messages, userAvatars]);

    const isGroupChat = !!selectedGroup;

    // Gom nhóm tin nhắn theo ngày và người gửi
    const groupedMessages = useMemo(() => {
        const grouped = [];
        let currentGroup = [];
        let lastSenderId = null;
        let lastDate = null;

        if (Array.isArray(messages)) {
            messages.forEach((msg, index) => {
                if (!msg || !msg.sentAt) return;
                const msgDate = new Date(msg.sentAt).toLocaleDateString();
                const isSameSender = msg.senderId === lastSenderId;
                const isSameDate = lastDate === msgDate;

                if (!isSameDate && lastDate) {
                    grouped.push({ type: 'date', date: msgDate });
                }

                if (isSameSender) {
                    currentGroup.push(msg);
                } else {
                    if (currentGroup.length > 0) {
                        grouped.push({ type: 'messageGroup', messages: currentGroup });
                    }
                    currentGroup = [msg];
                }

                lastSenderId = msg.senderId;
                lastDate = msgDate;

                if (index === messages.length - 1 && currentGroup.length > 0) {
                    grouped.push({ type: 'messageGroup', messages: currentGroup });
                }
            });
        }

        return grouped;
    }, [messages]);

    // Tự động scroll xuống cuối khi có tin nhắn mới
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Lấy avatar cho trạng thái "seen"
    const getSeenAvatar = useCallback(() => {
        if (selectedUser) {
            return getAvatarSrc(selectedUser.avatar || userAvatars[selectedUser.id] || null);
        } else if (selectedGroup && selectedGroup.members?.length > 0) {
            const otherMember = selectedGroup.members.find(member => member.id !== loggedInUserId);
            return getAvatarSrc(otherMember?.avatar || userAvatars[otherMember?.id] || null);
        }
        return getAvatarSrc(userAvatars[loggedInUserId] || null);
    }, [selectedUser, selectedGroup, loggedInUserId, userAvatars, getAvatarSrc]);

    return (
        <Box
            sx={{
                flex: 1,
                overflowY: 'auto',
                p: 2,
                bgcolor: theme.palette.background.default,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
            }}
            role="log"
            aria-label="Chat messages"
        >
            {groupedMessages.length === 0 && (
                <Typography variant="body2" sx={{ textAlign: 'center', color: theme.palette.text.secondary }}>
                    Không có tin nhắn
                </Typography>
            )}
            {groupedMessages.map((group, groupIndex) => {
                if (group.type === 'date') {
                    return (
                        <Box
                            key={`date-${group.date}`}
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                my: 2,
                            }}
                        >
                            <Box sx={{ flexGrow: 1, height: '1px', bgcolor: theme.palette.divider }} />
                            <Typography variant="caption" sx={{ mx: 2, color: theme.palette.text.secondary }}>
                                {group.date}
                            </Typography>
                            <Box sx={{ flexGrow: 1, height: '1px', bgcolor: theme.palette.divider }} />
                        </Box>
                    );
                }

                const groupMessages = group.messages || [];
                if (groupMessages.length === 0) return null;

                const isSentByUser = groupMessages[0]?.senderId === loggedInUserId;
                const isLastGroup = groupIndex === groupedMessages.length - 1;

                return (
                    <Box
                        key={`group-${groupMessages[0]?.id || groupIndex}`}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: isSentByUser ? 'flex-end' : 'flex-start',
                            mb: 1,
                        }}
                    >
                        {isGroupChat && !isSentByUser && (
                            <Typography
                                variant="caption"
                                sx={{ color: theme.palette.text.secondary, mb: 0.5, ml: 6 }}
                            >
                                {groupMessages[0]?.senderName || 'Unknown'}
                            </Typography>
                        )}

                        {groupMessages.map((msg, msgIndex) => {
                            const isFirstMessage = msgIndex === 0;
                            const isLastMessage = msgIndex === groupMessages.length - 1;
                            const isHovered = hoveredMessageId === msg.id;
                            const isUser = msg.senderId === loggedInUserId;

                            const borderRadius = isUser
                                ? isFirstMessage && isLastMessage
                                    ? '18px'
                                    : isFirstMessage
                                        ? '18px 18px 4px 18px'
                                        : isLastMessage
                                            ? '18px 4px 18px 18px'
                                            : '18px 4px 4px 18px'
                                : isFirstMessage && isLastMessage
                                    ? '18px'
                                    : isFirstMessage
                                        ? '18px 18px 18px 4px'
                                        : isLastMessage
                                            ? '4px 18px 18px 18px'
                                            : '4px 18px 18px 4px';

                            return (
                                <Box
                                    key={msg.id}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: isUser ? 'flex-end' : 'flex-start',
                                        mb: isLastMessage ? 0 : 0.5,
                                        position: 'relative',
                                    }}
                                    onMouseEnter={() => setHoveredMessageId(msg.id)}
                                    onMouseLeave={() => setHoveredMessageId(null)}
                                >
                                    {!isUser && isFirstMessage && (
                                        <Avatar
                                            src={getAvatarSrc(userAvatars[msg.senderId])}
                                            alt={msg.senderName || 'Unknown'}
                                            sx={{ width: 32, height: 32, mr: 1, alignSelf: 'flex-end' }}
                                            onError={(e) => {
                                                e.target.src = ProfileImg;
                                            }}
                                        />
                                    )}

                                    <Box
                                        sx={{
                                            maxWidth: '70%',
                                            minWidth: '150px',
                                            minHeight: '40px',
                                            ml: !isUser && !isFirstMessage ? '40px' : 0,
                                        }}
                                    >
                                        <Paper
                                            sx={{
                                                p: 1.5,
                                                bgcolor: isUser ? '#0084FF' : '#E9ECEF',
                                                color: isUser ? '#fff' : theme.palette.text.primary,
                                                borderRadius,
                                                boxShadow: isHovered ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                                                transition: 'box-shadow 0.2s ease-in-out',
                                                wordWrap: 'break-word',
                                            }}
                                        >
                                            <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                                                {msg.content || 'No content'}
                                            </Typography>
                                        </Paper>
                                    </Box>

                                    {isHovered && (
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                position: 'absolute',
                                                bottom: '-16px',
                                                right: isUser ? 0 : 'auto',
                                                left: isUser ? 'auto' : 0,
                                                color: theme.palette.text.secondary,
                                            }}
                                        >
                                            {new Date(msg.sentAt).toLocaleTimeString()}
                                        </Typography>
                                    )}
                                </Box>
                            );
                        })}

                        {isLastGroup &&
                            groupMessages[groupMessages.length - 1]?.senderId === loggedInUserId && (
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
                                    <Avatar
                                        src={getSeenAvatar()}
                                        alt="Seen"
                                        sx={{ width: 16, height: 16 }}
                                        onError={(e) => {
                                            e.target.src = ProfileImg;
                                        }}
                                    />
                                </Box>
                            )}
                    </Box>
                );
            })}
            <div ref={messagesEndRef} />
        </Box>
    );
};
MessageList.propTypes = {
    messages: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            senderId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            senderName: PropTypes.string,
            sentAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
            content: PropTypes.string,
        })
    ),
    selectedUser: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        avatar: PropTypes.string,
        name: PropTypes.string,
    }),
    selectedGroup: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        members: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
                avatar: PropTypes.string,
                name: PropTypes.string,
            })
        ),
    }),
};

export default MessageList;