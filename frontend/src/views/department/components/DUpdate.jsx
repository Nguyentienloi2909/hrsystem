import { useState } from 'react';
import { Box, TextField, Button, Typography, CircularProgress, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import ApiService from 'src/service/ApiService';
import PropTypes from 'prop-types';

const DUpdate = ({ department, onUpdated, onCancel }) => {
    const [name, setName] = useState(department?.departmentName || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [openConfirm, setOpenConfirm] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (!name.trim()) {
            setError('Tên phòng ban không được để trống');
            return;
        }
        setOpenConfirm(true);
    };

    const handleConfirmUpdate = async () => {
        setOpenConfirm(false);
        setLoading(true);
        setError('');
        try {
            const dataToSend = {
                departmentId: department.id,
                departmentName: name
            };
            await ApiService.updateDepartment(department.id, dataToSend);
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
                <Typography variant="h6" gutterBottom sx={{ color: 'black' }}>
                    Cập nhật phòng ban
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                    <TextField
                        label="Department Name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        fullWidth
                        required
                        disabled={loading}
                        sx={{ mb: 2, '& .MuiInputBase-input': { color: 'black' } }}
                        InputLabelProps={{ style: { color: 'black' } }}
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
                <DialogTitle>Xác nhận cập nhật phòng ban</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Bạn có chắc chắn muốn cập nhật phòng ban với tên &quot;<b>{name}</b>&quot;?
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
DUpdate.propTypes = {
    department: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        departmentName: PropTypes.string
    }).isRequired,
    onUpdated: PropTypes.func,
    onCancel: PropTypes.func
};

export default DUpdate;