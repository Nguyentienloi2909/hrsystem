import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import ApiService from 'src/service/ApiService';

const CreateGroupModal = ({ open, onClose, onCreate }) => {
    const [groupName, setGroupName] = useState('');
    const [departmentId, setDepartmentId] = useState('');
    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        if (open) {
            ApiService.getAllDepartments()
                .then(data => setDepartments(data))
                .catch(() => setDepartments([]));
        }
    }, [open]);

    const handleSubmit = () => {
        if (groupName.trim() && departmentId) {
            onCreate({
                departmentId: departmentId,
                groupName: groupName
            });
            setGroupName('');
            setDepartmentId('');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Thêm nhóm mới</DialogTitle>
            <DialogContent>
                <FormControl fullWidth margin="normal">
                    <InputLabel>Phòng ban</InputLabel>
                    <Select
                        value={departmentId}
                        label="Phòng ban"
                        onChange={e => setDepartmentId(e.target.value)}
                    >
                        {departments.map(dept => (
                            <MenuItem key={dept.id} value={dept.id}>
                                {dept.departmentName}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <TextField
                    label="Tên nhóm"
                    value={groupName}
                    onChange={e => setGroupName(e.target.value)}
                    fullWidth
                    margin="normal"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Hủy</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={!groupName.trim() || !departmentId}>Thêm</Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateGroupModal;