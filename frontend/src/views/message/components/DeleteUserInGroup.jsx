import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Modal,
    Typography,
    Button,
    useTheme,
    Autocomplete,
    Checkbox,
    TextField,
    Chip,
    Snackbar,
    Alert,
} from '@mui/material';
import ApiService from 'src/service/ApiService';

const DeleteUserInGroup = ({ open, onClose, loggedInUserId, groupId, selectedGroup }) => {
    const theme = useTheme();
    const [selectedUsers, setSelectedUsers] = useState([]); // mảng object user
    const [users, setUsers] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Lấy danh sách thành viên trong nhóm (trừ chính mình)
    useEffect(() => {
        const fetchGroupMembers = async () => {
            if (!groupId) return;
            try {
                const groupData = await ApiService.getChatGroupById(groupId);
                const groupMembers = groupData?.members?.filter(member => member.id !== loggedInUserId) || [];
                setUsers(groupMembers);
            } catch (error) {
                console.error('Lỗi khi lấy danh sách thành viên nhóm:', error);
                setUsers(selectedGroup?.members?.filter(member => member.id !== loggedInUserId) || []);
            }
        };
        if (groupId) fetchGroupMembers();
    }, [groupId, loggedInUserId, selectedGroup]);

    // Xử lý thay đổi danh sách user được chọn
    const handleUserSelect = (event, newValue) => {
        setSelectedUsers(newValue); // newValue là mảng object user
    };

    // Xử lý xóa từng user khỏi nhóm và cập nhật lại danh sách users/selectedUsers
    const handleRemoveUsers = async () => {
        if (selectedUsers.length === 0) {
            setSnackbar({ open: true, message: 'Vui lòng chọn ít nhất một thành viên để xóa khỏi nhóm.', severity: 'warning' });
            return;
        }
        let successCount = 0;
        let failCount = 0;
        let failedNames = [];
        let updatedUsers = [...users];
        let updatedSelectedUsers = [...selectedUsers];

        for (const user of selectedUsers) {
            // Lấy id đúng thuộc tính
            const uid = user.id || user.userId;
            console.log('Xóa user:', { groupId, userId: uid, userObj: user });
            if (!groupId || !uid) {
                failCount++;
                failedNames.push(user.fullName || user.name || uid || 'Không xác định');
                continue;
            }
            try {
                await ApiService.deleteUserFromGroupChat(Number(groupId), Number(uid));
                updatedUsers = updatedUsers.filter(u => (u.id || u.userId) !== uid);
                updatedSelectedUsers = updatedSelectedUsers.filter(u => (u.id || u.userId) !== uid);
                successCount++;
            } catch (error) {
                failCount++;
                failedNames.push(user.fullName || user.name || uid);
                console.error('Lỗi khi xóa thành viên:', error, { groupId, userId: uid, userObj: user });
            }
        }
        setUsers(updatedUsers);
        setSelectedUsers(updatedSelectedUsers);

        if (successCount > 0) {
            setSnackbar({ open: true, message: `Đã xóa ${successCount} thành viên khỏi nhóm.`, severity: 'success' });
        }
        if (failCount > 0) {
            setSnackbar({ open: true, message: `Không thể xóa: ${failedNames.join(', ')}`, severity: 'error' });
        }
        // Đóng modal nếu đã xóa hết hoặc không còn user để chọn
        if (updatedUsers.length === 0 || updatedSelectedUsers.length === 0) {
            setTimeout(() => {
                setSnackbar({ ...snackbar, open: false });
                onClose();
            }, 1200);
        }
    };

    return (
        <>
            <Modal
                open={open}
                onClose={onClose}
                aria-labelledby="delete-user-in-group-modal"
                aria-describedby="modal-to-delete-users-from-group"
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 400,
                        bgcolor: theme.palette.background.paper,
                        borderRadius: 2,
                        boxShadow: 24,
                        p: 4,
                    }}
                >
                    <Typography id="delete-user-in-group-modal" variant="h6" component="h2" gutterBottom>
                        Xóa thành viên khỏi nhóm
                    </Typography>
                    <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                        Chọn thành viên để xóa:
                    </Typography>
                    <Autocomplete
                        multiple
                        options={users}
                        getOptionLabel={(option) => option.fullName || option.name || 'Unknown'}
                        value={selectedUsers}
                        onChange={handleUserSelect}
                        inputValue={inputValue}
                        onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
                        renderOption={(props, option, { selected }) => (
                            <li {...props}>
                                <Checkbox checked={selected} sx={{ mr: 1 }} />
                                {option.fullName || option.name}
                            </li>
                        )}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip
                                    label={option.fullName || option.name || 'Unknown'}
                                    {...getTagProps({ index })}
                                    sx={{ m: 0.5 }}
                                />
                            ))
                        }
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                variant="outlined"
                                label="Chọn người dùng"
                                placeholder="Tìm kiếm người dùng..."
                            />
                        )}
                        sx={{ mb: 2 }}
                        disabled={users.length === 0}
                    />
                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button variant="outlined" onClick={onClose}>
                            Hủy
                        </Button>
                        <Button variant="contained" color="error" onClick={handleRemoveUsers} disabled={users.length === 0}>
                            Xóa thành viên
                        </Button>
                    </Box>
                </Box>
            </Modal>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

DeleteUserInGroup.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    loggedInUserId: PropTypes.number.isRequired,
    groupId: PropTypes.number,
    selectedGroup: PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        members: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.number,
                fullName: PropTypes.string,
                avatar: PropTypes.string,
            })
        ),
    }),
};

DeleteUserInGroup.defaultProps = {
    groupId: null,
    selectedGroup: null,
};

export default DeleteUserInGroup;