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

const AddUserToGroup = ({ open, onClose, loggedInUserId, groupId, selectedGroup }) => {
    const theme = useTheme();
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [users, setUsers] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Lấy danh sách người dùng chưa có trong nhóm
    useEffect(() => {
        const fetchUsers = async () => {
            if (!groupId || !selectedGroup) return;
            try {
                const allUsers = await ApiService.getAllUsers();
                const groupMemberIds = selectedGroup.members.map(member => Number(member.userId || member.id));
                const filteredUsers = allUsers.filter(
                    user => Number(user.id) !== Number(loggedInUserId) && !groupMemberIds.includes(Number(user.id))
                );
                setUsers(filteredUsers);
            } catch (error) {
                console.error('Lỗi khi lấy danh sách người dùng:', error);
                setUsers([]);
            }
        };
        if (groupId && selectedGroup) fetchUsers();
    }, [groupId, loggedInUserId, selectedGroup]);

    // Xử lý thay đổi danh sách user được chọn
    const handleUserSelect = (event, newValue) => {
        setSelectedUsers(newValue.map(user => user.id));
    };

    // Thêm từng user vào nhóm bằng API mới
    const handleAddUsers = async () => {
        if (selectedUsers.length === 0) {
            setSnackbar({ open: true, message: 'Vui lòng chọn ít nhất một thành viên để thêm vào nhóm.', severity: 'warning' });
            return;
        }
        try {
            for (const userId of selectedUsers) {
                await ApiService.addUserToGroupChat(groupId, userId);
            }
            setSnackbar({ open: true, message: 'Thêm thành viên thành công!', severity: 'success' });
            onClose();
            // Có thể gọi callback để reload danh sách thay vì reload trang
        } catch (error) {
            console.error('Lỗi khi thêm thành viên:', error);
            setSnackbar({ open: true, message: 'Thêm thành viên thất bại. Vui lòng thử lại.', severity: 'error' });
        }
    };

    return (
        <>
            <Modal
                open={open}
                onClose={onClose}
                aria-labelledby="add-user-to-group-modal"
                aria-describedby="modal-to-add-users-to-group"
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
                    <Typography id="add-user-to-group-modal" variant="h6" component="h2" gutterBottom>
                        Thêm thành viên vào nhóm
                    </Typography>
                    <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                        Chọn thành viên:
                    </Typography>
                    <Autocomplete
                        multiple
                        options={users}
                        getOptionLabel={(option) => option.fullName || option.name || 'Unknown'}
                        value={users.filter(user => selectedUsers.includes(user.id))}
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
                                disabled={users.length === 0}
                            />
                        )}
                        sx={{ mb: 2 }}
                    />
                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button variant="outlined" onClick={onClose}>
                            Hủy
                        </Button>
                        <Button variant="contained" color="primary" onClick={handleAddUsers} disabled={users.length === 0}>
                            Thêm thành viên
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

AddUserToGroup.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    loggedInUserId: PropTypes.number.isRequired,
    groupId: PropTypes.number,
    selectedGroup: PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        members: PropTypes.arrayOf(
            PropTypes.shape({
                userId: PropTypes.number,
                id: PropTypes.number,
                fullName: PropTypes.string,
                avatar: PropTypes.string,
            })
        ),
    }),
};

AddUserToGroup.defaultProps = {
    groupId: null,
    selectedGroup: null,
};

export default AddUserToGroup;