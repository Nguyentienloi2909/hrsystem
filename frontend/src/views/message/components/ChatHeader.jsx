import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Avatar, useTheme, Badge, IconButton, Tooltip, Menu, MenuItem } from '@mui/material';
import { IconMenu2 } from '@tabler/icons-react';
import ApiService from 'src/service/ApiService';
import CreateGroupChat from './CreateGroupChat';
import AddUserToGroup from './AddUserToGroup';
import DeleteUserInGroup from './DeleteUserInGroup';
import UsersToGroup from './UsersToGroup'; // import modal hiển thị user group

const ChatHeader = ({ selectedUser, selectedGroup }) => {
    const theme = useTheme();
    const [openCreateGroupModal, setOpenCreateGroupModal] = useState(false);
    const [openAddMemberModal, setOpenAddMemberModal] = useState(false);
    const [openRemoveMemberModal, setOpenRemoveMemberModal] = useState(false);
    const [openUsersModal, setOpenUsersModal] = useState(false); // state cho modal danh sách user
    const [loggedInUserId, setLoggedInUserId] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const openMenu = Boolean(anchorEl);

    // Lấy userId của người dùng hiện tại
    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const userProfile = await ApiService.getUserProfile();
                setLoggedInUserId(userProfile.id);
            } catch (error) {
                console.error('Lỗi khi lấy userId:', error);
            }
        };
        fetchUserId();
    }, []);

    // Xử lý mở/đóng menu
    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    // Xử lý tạo nhóm chat mới
    const handleCreateGroup = () => {
        setOpenCreateGroupModal(true);
        handleMenuClose();
    };

    // Xử lý thêm thành viên vào nhóm
    const handleAddMember = () => {
        if (!selectedGroup) {
            alert('Vui lòng chọn một nhóm trước khi thêm thành viên.');
            return;
        }
        setOpenAddMemberModal(true);
        handleMenuClose();
    };

    // Xử lý xóa thành viên khỏi nhóm
    const handleRemoveMember = () => {
        if (!selectedGroup) {
            alert('Vui lòng chọn một nhóm trước khi xóa thành viên.');
            return;
        }
        setOpenRemoveMemberModal(true);
        handleMenuClose();
    };

    // Thêm: Xử lý mở modal xem danh sách user
    const handleShowUsers = () => {
        if (!selectedGroup) {
            alert('Vui lòng chọn một nhóm để xem thành viên.');
            return;
        }
        setOpenUsersModal(true);
        handleMenuClose();
    };

    // Determine the display name and status based on the selection
    const displayName = selectedUser?.fullName || selectedGroup?.name || 'Chọn user hoặc nhóm';
    const displayStatus = selectedUser ? selectedUser.status || 'Offline' : selectedGroup ? 'Nhóm' : 'Offline';
    const avatarSrc = selectedUser?.avatar || selectedGroup?.avatar || 'https://as1.ftcdn.net/jpg/02/15/15/40/1000_F_215154008_oWtNLNPoeWjsrsPYhRPRxp4w0h0TOVg2.jpg';

    return (
        <Box
            sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                minHeight: 72,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                '&:hover': {
                    bgcolor: theme.palette.action.hover,
                },
                transition: 'background-color 0.3s ease',
            }}
        >
            {/* Phần avatar và thông tin */}
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                {/* Bỏ Badge để không hiện chấm đỏ/trạng thái */}
                <Avatar
                    alt={displayName}
                    src={avatarSrc}
                    sx={{
                        width: 48,
                        height: 48,
                        border: `2px solid ${theme.palette.divider}`,
                    }}
                />
                <Box sx={{ ml: 2, flexGrow: 1 }}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 600,
                            lineHeight: 1.2,
                            color: theme.palette.text.primary,
                        }}
                    >
                        {displayName}
                    </Typography>
                </Box>
            </Box>

            <Tooltip title="Tùy chọn" arrow>
                <span style={{ display: 'inline-block' }}>
                    <IconButton
                        color="primary"
                        onClick={handleMenuOpen}
                        sx={{
                            p: 1,
                            bgcolor: theme.palette.primary.light,
                            '&:hover': {
                                bgcolor: theme.palette.primary.main,
                                color: theme.palette.primary.contrastText,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                            },
                            '&:disabled': {
                                bgcolor: theme.palette.action.disabledBackground,
                                color: theme.palette.text.disabled,
                            },
                            borderRadius: '50%',
                            transition: 'all 0.3s ease',
                            mr: 0,
                        }}
                        disabled={!selectedGroup && !selectedUser}
                    >
                        <IconMenu2 size={24} />
                    </IconButton>
                </span>
            </Tooltip>

            {/* Menu tùy chọn */}
            <Menu
                anchorEl={anchorEl}
                open={openMenu}
                onClose={handleMenuClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                PaperProps={{
                    sx: {
                        mt: 1,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    },
                }}
            >
                {/* Chỉ hiển thị nếu KHÔNG chọn nhóm */}
                {!selectedGroup && (
                    <MenuItem onClick={handleCreateGroup}>
                        Thêm mới nhóm
                    </MenuItem>
                )}

                {/* Chỉ hiển thị nếu đang chọn nhóm */}
                {selectedGroup && [
                    <MenuItem key="add" onClick={handleAddMember}>
                        Thêm thành viên nhóm
                    </MenuItem>,
                    <MenuItem key="remove" onClick={handleRemoveMember}>
                        Xóa thành viên khỏi nhóm
                    </MenuItem>,
                    <MenuItem key="users" onClick={handleShowUsers}>
                        Xem danh sách thành viên
                    </MenuItem>
                ]}
            </Menu>


            {loggedInUserId && (
                <>
                    <CreateGroupChat
                        open={openCreateGroupModal}
                        onClose={() => setOpenCreateGroupModal(false)}
                        loggedInUserId={loggedInUserId}
                    />
                    <AddUserToGroup
                        open={openAddMemberModal}
                        onClose={() => setOpenAddMemberModal(false)}
                        loggedInUserId={loggedInUserId}
                        groupId={selectedGroup?.id}
                        selectedGroup={selectedGroup}
                    />
                    {selectedGroup && (
                        <DeleteUserInGroup
                            open={openRemoveMemberModal}
                            onClose={() => setOpenRemoveMemberModal(false)}
                            loggedInUserId={loggedInUserId}
                            groupId={selectedGroup.id}
                            selectedGroup={selectedGroup}
                        />
                    )}
                    {/* Modal hiển thị danh sách user */}
                    {selectedGroup && (
                        <UsersToGroup
                            open={openUsersModal}
                            onClose={() => setOpenUsersModal(false)}
                            group={selectedGroup}
                        />
                    )}
                </>
            )}
        </Box>
    );
};

ChatHeader.propTypes = {
    selectedUser: PropTypes.shape({
        name: PropTypes.string,
        fullName: PropTypes.string,
        status: PropTypes.string,
        avatar: PropTypes.string,
    }),
    selectedGroup: PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        avatar: PropTypes.string,
        members: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.number,
                fullName: PropTypes.string,
                avatar: PropTypes.string,
            })
        ),
    }),
};

export default ChatHeader;