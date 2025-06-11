import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Modal,
    Typography,
    TextField,
    Button,
    useTheme,
    Autocomplete,
    Checkbox,
    TextField as MuiTextField,
    Chip,
} from '@mui/material';
import ApiService from 'src/service/ApiService';

const CreateGroupChat = ({ open, onClose, loggedInUserId }) => {
    const theme = useTheme();
    const [groupName, setGroupName] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([loggedInUserId]); // Mặc định bao gồm userId đang đăng nhập
    const [users, setUsers] = useState([]);
    const [inputValue, setInputValue] = useState(''); // State để tìm kiếm

    // Lấy danh sách nhân viên từ API
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                console.log('Fetching users with loggedInUserId:', loggedInUserId);
                const data = await ApiService.getAllUsers(); // Giả định API này trả về danh sách user
                console.log('Raw data from API:', data);
                const filteredUsers = data.filter(user => user.id !== loggedInUserId);
                console.log('Filtered users:', filteredUsers);
                setUsers(filteredUsers); // Cập nhật danh sách user
            } catch (error) {
                console.error('Lỗi khi lấy danh sách người dùng:', error);
                // Fallback dữ liệu mẫu nếu API lỗi
                setUsers([
                    { id: 2, fullName: 'Trần Thị B', avatar: 'https://www.bootdey.com/img/Content/avatar/avatar2.png' },
                    { id: 3, fullName: 'Lê Văn C', avatar: 'https://www.bootdey.com/img/Content/avatar/avatar3.png' },
                ]);
            }
        };
        if (loggedInUserId) fetchUsers(); // Chỉ gọi API khi có loggedInUserId
    }, [loggedInUserId]);

    // Xử lý thay đổi danh sách user được chọn
    const handleUserSelect = (event, newValue) => {
        const userIds = newValue.map(user => user.id);
        // Đảm bảo loggedInUserId luôn có trong danh sách
        if (!userIds.includes(loggedInUserId)) {
            userIds.push(loggedInUserId);
        }
        setSelectedUsers([...new Set(userIds)]); // Đảm bảo không trùng lặp
        console.log('Selected user IDs:', userIds);
    };

    // Xử lý xóa user khỏi danh sách đã chọn
    const handleDeleteUser = (userIdToDelete) => {
        // Không cho phép xóa loggedInUserId
        if (userIdToDelete === loggedInUserId) {
            alert('Không thể xóa chính bạn khỏi nhóm!');
            return;
        }
        setSelectedUsers(prev => prev.filter(id => id !== userIdToDelete));
        console.log('Deleted user ID:', userIdToDelete);
    };

    // Xử lý tạo nhóm mới
    const handleCreateGroup = async () => {
        if (!groupName.trim() || selectedUsers.length < 2) {
            alert('Vui lòng nhập tên nhóm và chọn ít nhất một thành viên khác ngoài bạn.');
            return;
        }
        try {
            const groupData = {
                name: groupName,
                userIds: selectedUsers,
            };
            console.log('Sending group data:', groupData);
            await ApiService.createGroupChat(groupData); // Use createGroupChat method
            onClose(); // Đóng modal sau khi tạo thành công
            window.location.reload(); // Tải lại trang để cập nhật danh sách nhóm
        } catch (error) {
            console.error('Lỗi khi tạo nhóm:', error);
            alert('Tạo nhóm thất bại. Vui lòng thử lại.');
        }
    };

    // Lấy tên hiển thị của user đã chọn
    const getSelectedUserNames = () => {
        return selectedUsers.map(userId => {
            const user = users.find(u => u.id === userId) || { fullName: 'Bạn' };
            return user.fullName || 'Bạn';
        }).join(', ');
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="create-group-modal"
            aria-describedby="modal-to-create-new-group-chat"
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
                <Typography id="create-group-modal" variant="h6" component="h2" gutterBottom>
                    Tạo nhóm chat mới
                </Typography>

                {/* Input tên nhóm */}
                <TextField
                    fullWidth
                    label="Tên nhóm"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    margin="normal"
                    variant="outlined"
                    required
                />

                {/* Chọn thành viên bằng Autocomplete */}
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
                    onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
                    renderOption={(props, option, { selected }) => (
                        <li {...props}>
                            <Checkbox
                                checked={selected}
                                sx={{ mr: 1 }}
                            />
                            {option.fullName || option.name}
                        </li>
                    )}
                    renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                            <Chip
                                label={option.fullName || option.name || 'Unknown'}
                                {...getTagProps({ index })}
                                onDelete={option.id === loggedInUserId ? undefined : () => handleDeleteUser(option.id)}
                                sx={{ m: 0.5 }}
                            />
                        ))
                    }
                    renderInput={(params) => (
                        <MuiTextField
                            {...params}
                            variant="outlined"
                            label="Chọn người dùng"
                            placeholder="Tìm kiếm người dùng..."
                        />
                    )}
                    sx={{ mb: 2 }}
                    disabled={users.length === 0} // Vô hiệu hóa nếu danh sách rỗng
                />

                {/* Hiển thị danh sách thành viên đã chọn */}
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                    Danh sách thành viên:
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    {getSelectedUserNames() || 'Chưa chọn thành viên nào'}
                </Typography>

                {/* Nút xác nhận và hủy */}
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button variant="outlined" onClick={onClose}>
                        Hủy
                    </Button>
                    <Button variant="contained" color="primary" onClick={handleCreateGroup}>
                        Xác nhận tạo mới
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

CreateGroupChat.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    loggedInUserId: PropTypes.number.isRequired,
};

export default CreateGroupChat;