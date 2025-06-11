import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';
import ApiService from 'src/service/ApiService';

const AddMemberModal = ({ open, onClose, groupId, onAdd }) => {
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [groupUsers, setGroupUsers] = useState([]);

    useEffect(() => {
        if (open && groupId) {
            // Lấy tất cả user và user đã thuộc nhóm
            Promise.all([
                ApiService.getAllUsers(),
                ApiService.getGroup(groupId)
            ])
                .then(([allUsers, group]) => {
                    setGroupUsers(group.users || []);
                    // Lọc user chưa thuộc nhóm
                    const groupUserIds = (group.users || []).map(u => u.id);
                    const availableUsers = allUsers.filter(u => !groupUserIds.includes(u.id));
                    setUsers(availableUsers);
                })
                .catch(() => setUsers([]));
        }
    }, [open, groupId]);

    const handleAdd = async () => {
        if (selectedUserId) {
            try {
                // Gọi API thêm thành viên vào nhóm
                await ApiService.addUserToGroup(groupId, selectedUserId);

                // Lấy lại thông tin nhóm mới nhất
                const updatedGroup = await ApiService.getGroup(groupId);
                onAdd(updatedGroup);
                setSelectedUserId('');
            } catch (error) {
                console.error('Failed to add member:', error);
            }
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Thêm thành viên vào nhóm</DialogTitle>
            <DialogContent>
                {users.length === 0 ? (
                    <Typography>Không còn thành viên nào để thêm.</Typography>
                ) : (
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Chọn thành viên</InputLabel>
                        <Select
                            value={selectedUserId}
                            label="Chọn thành viên"
                            onChange={e => setSelectedUserId(e.target.value)}
                        >
                            {users.map(user => (
                                <MenuItem key={user.id} value={user.id}>
                                    {user.fullName} ({user.email})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Hủy</Button>
                <Button
                    onClick={handleAdd}
                    variant="contained"
                    disabled={!selectedUserId}
                >
                    Thêm
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddMemberModal;