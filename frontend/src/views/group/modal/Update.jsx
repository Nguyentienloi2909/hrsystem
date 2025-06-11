import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import ApiService from 'src/service/ApiService';
import PropTypes from 'prop-types';

const UpdateGroupModal = ({ open, onClose, group, onUpdate }) => {
    const [groupName, setGroupName] = useState('');
    const [departmentName, setDepartmentName] = useState('');

    useEffect(() => {
        if (group) {
            console.log('Received group prop:', group); // Log when receiving group prop
            setGroupName(group.groupName || '');
            setDepartmentName(group.departmentName || '');
        }
    }, [group]);

    const handleSubmit = async () => {
        if (groupName.trim()) {
            try {
                const payload = {
                    departmentName: departmentName || group.departmentName,
                    departmentId: group.departmentId, // Use group.departmentId if you don't have a dropdown
                    groupName: groupName
                };
                console.log('Payload sent to updateGroup:', payload); // Log payload
                const response = await ApiService.updateGroup(group.id, payload);
                console.log('Response from updateGroup:', response); // Log response
                onUpdate(response);
            } catch (error) {
                console.error('Failed to update group:', error);
            }
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Cập nhật nhóm</DialogTitle>
            <DialogContent>
                <TextField
                    label="Tên nhóm"
                    value={groupName}
                    onChange={e => setGroupName(e.target.value)}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Phòng ban"
                    value={departmentName}
                    onChange={e => setDepartmentName(e.target.value)}
                    fullWidth
                    margin="normal"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Hủy</Button>
                <Button onClick={handleSubmit} variant="contained">Cập nhật</Button>
            </DialogActions>
        </Dialog>
    );
};
UpdateGroupModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    group: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        groupName: PropTypes.string,
        departmentName: PropTypes.string,
        departmentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    }),
    onUpdate: PropTypes.func.isRequired,
};

export default UpdateGroupModal;
