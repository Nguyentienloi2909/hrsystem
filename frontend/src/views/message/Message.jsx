import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Paper, Box, useTheme, Alert, Button, CircularProgress } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import UserList from './components/UserList';
import ChatHeader from './components/ChatHeader';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';
import ApiService from 'src/service/ApiService';
import { useSignalR } from 'src/contexts/SignalRContext';
import { useMessageBadge } from 'src/contexts/MessageBadgeContext';

const Message = () => {
    const { markUnread, markRead } = useMessageBadge();
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const theme = useTheme();
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [userMessages, setUserMessages] = useState({});
    const [groupMessages, setGroupMessages] = useState({});
    const [loggedInUserId, setLoggedInUserId] = useState(null);
    const [users, setUsers] = useState([]);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState('');
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    const messagesEndRef = useRef(null);
    const { chatConnection, connectionState } = useSignalR();
    const { userId, groupId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Lấy danh sách users và loggedInUserId
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setIsLoadingUsers(true);
                const userProfile = await ApiService.getUserProfile();
                setLoggedInUserId(userProfile.id);
                const allUsers = await ApiService.getAllUsers();
                const filteredUsers = allUsers.filter(u => u.id !== userProfile.id);
                setUsers(filteredUsers);
            } catch (error) {
                console.error('Failed to fetch users:', error);
                setError('Không thể tải danh sách người dùng');
            } finally {
                setIsLoadingUsers(false);
            }
        };
        fetchUsers();
    }, []);

    // Xử lý chọn user
    const handleSelectUser = useCallback((user) => {
        setSelectedUser(user);
        setSelectedGroup(null);
        markRead('user', user.id);
        setError('');
        navigate(`/messages/${user.id}`, { replace: true });
    }, [markRead, navigate]);

    // Xử lý chọn group
    const handleSelectGroup = useCallback((group) => {
        setSelectedGroup(group && !Array.isArray(group) ? group : null);
        setSelectedUser(null);
        if (group && group.id) {
            markRead('group', group.id);
            setError('');
            navigate(`/messages/group/${group.id}`, { replace: true });
        }
    }, [markRead, navigate]);

    // Tự động chọn user hoặc group từ URL hoặc state
    useEffect(() => {
        if (isLoadingUsers || users.length === 0) return;

        const state = location.state;
        if (state?.selectedUser) {
            const targetUser = users.find(user => user.id === state.selectedUser.id);
            if (targetUser) {
                handleSelectUser(targetUser);
                return;
            }
        } else if (state?.selectedGroup && typeof state.selectedGroup === 'object' && !Array.isArray(state.selectedGroup)) {
            setSelectedGroup(state.selectedGroup);
            setSelectedUser(null);
            markRead('group', state.selectedGroup.id);
            return;
        }

        if (userId) {
            const targetUserId = Number(userId);
            const targetUser = users.find(user => Number(user.id) === targetUserId);
            if (targetUser) {
                handleSelectUser(targetUser);
            } else {
                setError('Người dùng không tồn tại hoặc không có trong danh sách');
            }
        } else if (groupId) {
            const fetchGroup = async () => {
                try {
                    const groupList = await ApiService.getChatGroups();
                    const group = Array.isArray(groupList)
                        ? groupList.find(g => String(g.id) === String(groupId))
                        : null;
                    if (group) {
                        handleSelectGroup(group);
                    } else {
                        setError('Nhóm không tồn tại');
                    }
                } catch (error) {
                    console.error('Lỗi khi lấy thông tin nhóm:', error);
                    setError('Không thể tải thông tin nhóm');
                }
            };
            fetchGroup();
        }
    }, [userId, groupId, users, isLoadingUsers, location.state, handleSelectUser, handleSelectGroup, markRead]);

    const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedQuery(searchQuery), 300);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    const filteredUsers = useMemo(
        () =>
            users.filter((user) =>
                (user.fullName || user.name || '').toLowerCase().includes(debouncedQuery.toLowerCase())
            ),
        [users, debouncedQuery]
    );

    // Lắng nghe tin nhắn mới qua SignalR
    useEffect(() => {
        if (!chatConnection || connectionState !== 'Connected' || !loggedInUserId) return;

        const handleReceiveMessage = (messageDto) => {
            const userId = messageDto.senderId === loggedInUserId ? messageDto.receiverId : messageDto.senderId;
            if (!selectedUser || selectedUser.id !== userId) {
                markUnread('user', userId);
            }

            setUsers((prev) =>
                prev.map((u) =>
                    u.id === userId && userId !== selectedUser?.id
                        ? { ...u, hasNewMessage: true }
                        : u
                )
            );

            setUserMessages((prev) => {
                const userMsgList = prev[userId] || [];
                const filtered = userMsgList.filter(
                    (msg) =>
                        !(msg.isTemp && msg.content === messageDto.content && Math.abs(new Date(msg.sentAt) - new Date(messageDto.sentAt)) < 5000)
                );
                if (!filtered.some((msg) => msg.id === messageDto.id)) {
                    return {
                        ...prev,
                        [userId]: [...filtered, messageDto],
                    };
                }
                return prev;
            });
        };

        const handleReceiveGroupMessage = (messageDto) => {
            const groupId = messageDto.groupChatId;
            if (!selectedGroup || selectedGroup.id !== groupId) {
                markUnread('group', groupId);
            }
            setGroupMessages((prev) => {
                const groupMsgList = prev[groupId] || [];
                const filtered = groupMsgList.filter(
                    (msg) => !(msg.isTemp && msg.content === messageDto.content && msg.senderId === messageDto.senderId && msg.senderId === loggedInUserId)
                );
                if (!filtered.some((msg) => msg.id === messageDto.id)) {
                    return {
                        ...prev,
                        [groupId]: [...filtered, messageDto],
                    };
                }
                return prev;
            });
        };

        chatConnection.on('ReceiveMessage', handleReceiveMessage);
        chatConnection.on('ReceiveGroupMessage', handleReceiveGroupMessage);

        return () => {
            chatConnection.off('ReceiveMessage', handleReceiveMessage);
            chatConnection.off('ReceiveGroupMessage', handleReceiveGroupMessage);
        };
    }, [chatConnection, connectionState, loggedInUserId, selectedUser, selectedGroup, markUnread]);

    // Fetch messages khi chọn user/group
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                if (selectedUser?.id && !userMessages[selectedUser.id]) {
                    const data = await ApiService.handleRequest('get', `/Message/private/${selectedUser.id}`);
                    setUserMessages((prev) => ({
                        ...prev,
                        [selectedUser.id]: data || [],
                    }));
                } else if (selectedGroup?.id && !groupMessages[selectedGroup.id]) {
                    const data = await ApiService.handleRequest('get', `/Message/chatGroups/${selectedGroup.id}`);
                    setGroupMessages((prev) => ({
                        ...prev,
                        [selectedGroup.id]: data || [],
                    }));
                }
            } catch (error) {
                console.error('Failed to fetch messages:', error);
                setError('Không thể tải tin nhắn');
            }
        };
        fetchMessages();
    }, [selectedUser, selectedGroup, userMessages, groupMessages]);

    // Gửi tin nhắn
    const handleSendMessage = async (content) => {
        if (!loggedInUserId || connectionState !== 'Connected' || isSending) {
            return;
        }
        setIsSending(true);
        try {
            if (selectedUser?.id) {
                await chatConnection.invoke('SendPrivateMessage', loggedInUserId, selectedUser.id, content);
            } else if (selectedGroup?.id) {
                await chatConnection.invoke('SendGroupMessage', loggedInUserId, selectedGroup.id, content);
            }
        } catch (error) {
            console.error('Gửi tin nhắn thất bại:', error);
            setError('Gửi tin nhắn thất bại');
        } finally {
            setIsSending(false);
        }
    };

    const displayedMessages = useMemo(() => {
        if (selectedUser?.id) return userMessages[selectedUser.id] || [];
        if (selectedGroup?.id) return groupMessages[selectedGroup.id] || [];
        return [];
    }, [userMessages, groupMessages, selectedUser?.id, selectedGroup?.id]);

    return (
        <PageContainer title="Tin nhắn" description="Trò chuyện">
            {isLoadingUsers && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress aria-label="Đang tải danh sách người dùng" />
                </Box>
            )}
            {error && !isLoadingUsers && (
                <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                    onClose={() => setError('')}
                    action={
                        <Button
                            color="inherit"
                            size="small"
                            onClick={() => navigate('/messages')}
                        >
                            Quay lại
                        </Button>
                    }
                >
                    {error}
                </Alert>
            )}
            {!isLoadingUsers && !error && (
                <Paper
                    sx={{
                        height: 'calc(100vh - 100px)',
                        display: 'flex',
                        bgcolor: theme.palette.background.default,
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: theme.shadows[3],
                    }}
                >
                    <Box
                        sx={{
                            width: 320,
                            borderRight: `1px solid ${theme.palette.divider}`,
                            bgcolor: theme.palette.background.paper,
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <Box
                            sx={{
                                flex: 1,
                                overflowY: 'auto',
                                display: 'flex',
                                flexDirection: 'column',
                                '&::-webkit-scrollbar': {
                                    width: '6px',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    backgroundColor: theme.palette.divider,
                                    borderRadius: '6px',
                                },
                            }}
                        >
                            <UserList
                                users={filteredUsers}
                                selectedUser={selectedUser}
                                selectedGroup={selectedGroup && !Array.isArray(selectedGroup) ? selectedGroup : null}
                                onSelectUser={handleSelectUser}
                                onSelectGroup={handleSelectGroup}
                                searchQuery={searchQuery}
                                setSearchQuery={setSearchQuery}
                            />
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            bgcolor: theme.palette.background.default,
                        }}
                    >
                        <Box
                            sx={{
                                borderBottom: `1px solid ${theme.palette.divider}`,
                                bgcolor: theme.palette.background.paper,
                                height: '72px',
                                display: 'flex',
                                alignItems: 'center',
                                width: '100%',
                            }}
                        >
                            <ChatHeader selectedUser={selectedUser} selectedGroup={selectedGroup && !Array.isArray(selectedGroup) ? selectedGroup : null} />
                        </Box>
                        <Box
                            sx={{
                                flex: 1,
                                overflowY: 'auto',
                                display: 'flex',
                                flexDirection: 'column',
                                '&::-webkit-scrollbar': {
                                    width: '6px',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    backgroundColor: theme.palette.divider,
                                    borderRadius: '6px',
                                },
                            }}
                        >
                            <MessageList
                                messages={displayedMessages}
                                selectedUser={selectedUser}
                                selectedGroup={selectedGroup && !Array.isArray(selectedGroup) ? selectedGroup : null}
                            />
                            <div ref={messagesEndRef} />
                        </Box>
                        <Box
                            sx={{
                                borderTop: `1px solid ${theme.palette.divider}`,
                                bgcolor: theme.palette.background.paper,
                                display: 'flex',
                                width: '100%',
                                padding: 0,
                                minHeight: '72px',
                            }}
                        >
                            <MessageInput
                                onSendMessage={handleSendMessage}
                                disabled={!selectedUser && !selectedGroup || isSending || connectionState !== 'Connected'}
                                sx={{ width: '100%' }}
                            />
                        </Box>
                    </Box>
                </Paper>
            )}
        </PageContainer>
    );
};

export default Message;