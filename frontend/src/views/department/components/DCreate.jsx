import { useState } from 'react';
import { Box, TextField, Button, Typography, CircularProgress, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import ApiService from 'src/service/ApiService';
import PropTypes from 'prop-types';

const DCreate = ({ onCreated, onCancel }) => {
    const [name, setName] = useState('');
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

    const handleConfirmCreate = async () => {
        setOpenConfirm(false);
        setLoading(true);
        setError('');
        try {
            await ApiService.createDepartment({ departmentName: name });
            if (onCreated) onCreated();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Create failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Tạo mới phòng ban
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                    <TextField
                        label="Tên phòng ban"
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
                            {loading ? <CircularProgress size={24} /> : 'Tạo mới'}
                        </Button>
                    </Box>
                </Box>
            </CardContent>
            {/* Modal xác nhận */}
            <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
                <DialogTitle>Xác nhận tạo mới phòng ban</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Bạn có chắc chắn muốn tạo mới phòng ban với tên &quot;<b>{name}</b>&quot;?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenConfirm(false)} color="primary">
                        Hủy
                    </Button>
                    <Button onClick={handleConfirmCreate} color="primary" variant="contained" disabled={loading}>
                        {loading ? <CircularProgress size={20} /> : 'Xác nhận'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
};
DCreate.propTypes = {
    onCreated: PropTypes.func,
    onCancel: PropTypes.func.isRequired,
};

export default DCreate;
