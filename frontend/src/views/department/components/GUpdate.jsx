import { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, TextField, Button, Typography, CircularProgress, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import ApiService from 'src/service/ApiService';

const GUpdate = ({ group, departmentId, onUpdated, onCancel }) => {
    const [name, setName] = useState(group?.groupName || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [openConfirm, setOpenConfirm] = useState(false);

    // Extract departmentName from group
    const departmentName = group?.departmentName;

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (!name.trim()) {
            setError('Tên nhóm không được để trống');
            return;
        }
        setOpenConfirm(true);
    };

    const handleConfirmUpdate = async () => {
        setOpenConfirm(false);
        setLoading(true);
        setError('');
        try {
            await ApiService.updateGroup(group.id, {
                departmentName: departmentName || group.departmentName,
                departmentId: departmentId || group.departmentId,
                groupName: name
            });
            if (onUpdated) onUpdated();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Cập nhật nhóm
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                    <TextField
                        label="Tên nhóm"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        fullWidth
                        required
                        disabled={loading}
                        sx={{ mb: 2 }}
                    />
                    {error && (
                        <Typography color="error" sx={{ mb: 2 }}>
                            {error}
                        </Typography>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button onClick={onCancel} color="inherit" sx={{ mr: 1 }} disabled={loading}>
                            Hủy
                        </Button>
                        <Button type="submit" variant="contained" color="primary" disabled={loading}>
                            {loading ? <CircularProgress size={24} /> : 'Cập nhật'}
                        </Button>
                    </Box>
                </Box>
            </CardContent>
            {/* Modal xác nhận */}
            <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
                <DialogTitle>Xác nhận cập nhật nhóm</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Bạn có chắc chắn muốn cập nhật nhóm với tên &quot;<b>{name}</b>&quot;?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenConfirm(false)} color="primary">
                        Hủy
                    </Button>
                    <Button onClick={handleConfirmUpdate} color="primary" variant="contained" disabled={loading}>
                        {loading ? <CircularProgress size={20} /> : 'Xác nhận'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
};
GUpdate.propTypes = {
    group: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        groupName: PropTypes.string,
        departmentName: PropTypes.string,
        departmentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    }).isRequired,
    departmentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onUpdated: PropTypes.func,
    onCancel: PropTypes.func
};

export default GUpdate;