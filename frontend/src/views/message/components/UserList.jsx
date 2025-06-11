import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
    List, ListItem, ListItemAvatar, Avatar, ListItemText,
    useTheme, Badge, Box, Tabs, Tab, Paper
} from '@mui/material';
import { IconUser, IconUsers } from '@tabler/icons-react';
import ApiService from 'src/service/ApiService';
import SearchBox from './SearchBox';
import { useMessageBadge } from 'src/contexts/MessageBadgeContext';

// Tối ưu: Tách item thành component con, dùng React.memo
const UserListItem = React.memo(({ user, selected, onClick, unread }) => {
    const theme = useTheme();
    return (
        <ListItem
            key={user.id}
            button
            selected={selected}
            onClick={() => onClick(user)}
            sx={{
                '&:hover': { bgcolor: theme.palette.action.hover },
                '&.Mui-selected': { bgcolor: theme.palette.action.selected },
            }}
            secondaryAction={unread && <Badge color="error" variant="dot" />}
        >
            <ListItemAvatar>
                <Badge
                    variant={unread ? 'dot' : undefined}
                    color="error"
                    overlap="circular"
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    <Avatar
                        alt={user.name}
                        src={user.avatar || 'path/to/default/avatar.jpg'}
                    />
                </Badge>
            </ListItemAvatar>
            <ListItemText
                primaryTypographyProps={{
                    component: 'div',
                    variant: 'subtitle1',
                    sx: { fontWeight: 600 },
                }}
                primary={user.fullName}
                secondaryTypographyProps={{ component: 'div' }}
                secondary={
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                        }}
                    >
                        <Box
                            component="span"
                            sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                color: theme.palette.text.secondary,
                            }}
                        >
                            {user.lastMessage}
                        </Box>
                    </Box>
                }
            />
        </ListItem>
    );
});

UserListItem.displayName = 'UserListItem';

UserListItem.propTypes = {
    user: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        name: PropTypes.string,
        avatar: PropTypes.string,
        fullName: PropTypes.string,
        lastMessage: PropTypes.string,
    }).isRequired,
    selected: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
    unread: PropTypes.bool,
};

const GroupListItem = React.memo(({ group, selected, onClick, unread }) => {
    const theme = useTheme();
    return (
        <ListItem
            key={group.id}
            button
            selected={selected}
            onClick={() => onClick(group)}
            sx={{
                '&:hover': { bgcolor: theme.palette.action.hover },
                '&.Mui-selected': { bgcolor: theme.palette.action.selected },
            }}
            secondaryAction={unread && <Badge color="error" variant="dot" />}
        >
            <ListItemAvatar>
                <Badge
                    variant={unread ? 'dot' : undefined}
                    color="error"
                    overlap="circular"
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    <Avatar
                        alt={group.name}
                        src={
                            group.icon && typeof group.icon === 'string' && group.icon.trim()
                                ? group.icon
                                : 'https://as1.ftcdn.net/jpg/02/15/15/40/1000_F_215154008_oWtNLNPoeWjsrsPYhRPRxp4w0h0TOVg2.jpg'
                        }
                    />
                </Badge>
            </ListItemAvatar>
            <ListItemText
                primaryTypographyProps={{
                    component: 'div',
                    variant: 'subtitle1',
                    sx: { fontWeight: 600 },
                }}
                primary={group.name}
                secondaryTypographyProps={{ component: 'div' }}
                secondary={
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                        }}
                    >
                        <Box
                            component="span"
                            sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                color: theme.palette.text.secondary,
                            }}
                        >
                            {group.lastMessage}
                        </Box>
                        <Box
                            component="span"
                            sx={{ color: theme.palette.text.secondary, ml: 1, fontSize: 12 }}
                        >
                            ({group.members.length} members)
                        </Box>
                    </Box>
                }
            />
        </ListItem>
    );
});

GroupListItem.displayName = 'GroupListItem';

GroupListItem.propTypes = {
    group: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        name: PropTypes.string, // Added name prop validation
        icon: PropTypes.string,
        lastMessage: PropTypes.string,
        members: PropTypes.array,
    }).isRequired,
    selected: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
    unread: PropTypes.bool,
};

const UserList = ({
    selectedUser,
    selectedGroup,
    onSelectUser,
    onSelectGroup = () => { },
}) => {
    const theme = useTheme();
    const { unread } = useMessageBadge();
    const [tabValue, setTabValue] = useState(0);
    const [groups, setGroups] = useState([]);
    const [userList, setUserList] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const userProfile = await ApiService.getUserProfile();
                const loggedInUserId = userProfile.id;
                const allUsers = await ApiService.getAllUsers();
                const filteredUsers = allUsers.filter(user => user.id !== loggedInUserId);
                setUserList(filteredUsers);
            } catch (error) {
                console.error('Failed to fetch users:', error);
            }
        };

        const fetchGroups = async () => {
            try {
                const data = await ApiService.getChatGroups();
                setGroups(data || []);
            } catch (error) {
                console.error('Failed to fetch user groups:', error);
            }
        };

        fetchUsers();
        fetchGroups();
    }, []);

    // Tối ưu: chỉ dùng userList và groups
    const filteredItems = useMemo(() => {
        const query = searchQuery.toLowerCase();
        if (tabValue === 0) {
            return userList.filter((user) =>
                (user.fullName || user.name || '').toLowerCase().includes(query)
            );
        } else {
            return groups.filter((group) =>
                (group.name || '').toLowerCase().includes(query)
            );
        }
    }, [tabValue, userList, groups, searchQuery]);

    return (
        <Paper elevation={2} sx={{ width: '100%', bgcolor: theme.palette.background.paper }}>
            <Box sx={{ p: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <SearchBox onSearch={setSearchQuery} />
            </Box>
            <Tabs
                value={tabValue}
                onChange={(_, newValue) => {
                    setTabValue(newValue);
                    setSearchQuery('');
                }}
                centered
                sx={{ mb: 2 }}
            >
                <Tab label="Private" icon={<IconUser size={18} />} iconPosition="start" />
                <Tab label="Groups" icon={<IconUsers size={18} />} iconPosition="start" />
            </Tabs>
            {tabValue === 0 && (
                <List sx={{ p: 0 }}>
                    {filteredItems.map((user) => (
                        <UserListItem
                            key={user.id}
                            user={user}
                            selected={selectedUser?.id === user.id}
                            onClick={onSelectUser}
                            unread={!!unread[`user_${user.id}`]}
                        />
                    ))}
                </List>
            )}
            {tabValue === 1 && (
                <List sx={{ p: 0 }}>
                    {filteredItems.map((group) => (
                        <GroupListItem
                            key={group.id}
                            group={group}
                            selected={selectedGroup?.id === group.id}
                            onClick={onSelectGroup}
                            unread={!!unread[`group_${group.id}`]}
                        />
                    ))}
                </List>
            )}
        </Paper>
    );
};

UserList.propTypes = {
    selectedUser: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        name: PropTypes.string,
        avatar: PropTypes.string,
        fullName: PropTypes.string,
        lastMessage: PropTypes.string,
    }),
    selectedGroup: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        name: PropTypes.string,
        icon: PropTypes.string,
        lastMessage: PropTypes.string,
        members: PropTypes.array,
    }),
    onSelectUser: PropTypes.func,
    onSelectGroup: PropTypes.func,
};
export default UserList;