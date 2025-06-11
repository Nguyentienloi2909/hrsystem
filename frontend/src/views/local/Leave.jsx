import { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    Grid,
    Typography,
    FormControlLabel,
    Checkbox,
    Paper,
    Snackbar,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from '@mui/material';
import PageContainer from '../../components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import { useNavigate } from 'react-router-dom';
import { IconArrowLeft } from '@tabler/icons-react';
import ApiService from '../../service/ApiService';

const Leave = () => {
    const navigate = useNavigate();

    // Lấy dữ liệu userProfile từ sessionStorage (do UserContext đã lưu userProfile)
    const sessionUser = JSON.parse(sessionStorage.getItem('userProfile')) || {};
    const [formData, setFormData] = useState({
        fullName: sessionUser.fullName || '',
        group: sessionUser.groupName || '',
        startDate: '',
        endDate: '',
        reason: '',
        commitment: false
    });

    useEffect(() => {
        setFormData((prev) => ({
            ...prev,
            fullName: sessionUser.fullName || '',
            group: sessionUser.groupName || ''
        }));
    }, [sessionUser.fullName, sessionUser.groupName]);

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [openConfirm, setOpenConfirm] = useState(false);

    // Lấy ngày hiện tại ở định dạng yyyy-mm-dd
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Khi nhấn nút gửi, chỉ mở modal xác nhận
    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        // Kiểm tra ngày trước khi mở modal
        if (formData.startDate < todayStr) {
            setError('Ngày bắt đầu nghỉ không được nhỏ hơn ngày hiện tại.');
            return;
        }
        if (formData.endDate < todayStr) {
            setError('Ngày kết thúc nghỉ không được nhỏ hơn ngày hiện tại.');
            return;
        }
        if (formData.endDate < formData.startDate) {
            setError('Ngày kết thúc nghỉ không được nhỏ hơn ngày bắt đầu nghỉ.');
            return;
        }
        setOpenConfirm(true);
    };

    // Khi xác nhận gửi đơn
    const handleConfirmSend = async () => {
        setOpenConfirm(false);
        setLoading(true);
        setError('');
        try {
            const payload = {
                startDate: formData.startDate,
                endDate: formData.endDate,
                reason: formData.reason
            };
            await ApiService.createLeaveRequest(payload);
            setSuccess(true);
            setTimeout(() => {
                navigate('/nleave');
            }, 1200);
            setFormData({
                fullName: sessionUser.fullName || '',
                group: sessionUser.groupName || '',
                startDate: '',
                endDate: '',
                reason: '',
                commitment: false
            });
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                err?.message ||
                'Gửi đơn nghỉ phép thất bại!'
            );
        } finally {
            setLoading(false);
        }
    };

    // Khi đóng snackbar thông báo thành công hoặc thất bại
    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSuccess(false);
        setError('');
    };

    return (
        <PageContainer title="Đơn xin nghỉ phép" description="Tạo đơn xin nghỉ phép">
            <DashboardCard>
                <Paper elevation={0} sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                        <Button
                            startIcon={<IconArrowLeft />}
                            onClick={() => navigate('/nleave')}
                            sx={{ mr: 2 }}
                        >
                            Trở về
                        </Button>
                    </Box>
                    <Box sx={{ textAlign: 'center', alignItems: 'center', mb: 4 }}>
                        <Typography variant="h5">
                            Đơn xin nghỉ phép
                        </Typography>
                    </Box>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Họ và tên"
                                    value={formData.fullName}
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Nhóm"
                                    value={formData.group}
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label="Ngày bắt đầu nghỉ"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    InputLabelProps={{ shrink: true }}
                                    required
                                    inputProps={{ min: todayStr }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label="Ngày kết thúc nghỉ"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    InputLabelProps={{ shrink: true }}
                                    required
                                    inputProps={{ min: formData.startDate || todayStr }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    label="Lý do nghỉ phép"
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={formData.commitment}
                                            onChange={(e) => setFormData({ ...formData, commitment: e.target.checked })}
                                            color="primary"
                                        />
                                    }
                                    label="Tôi cam kết những thông tin trên là đúng sự thật"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        onClick={() => setFormData({
                                            fullName: sessionUser.fullName || '',
                                            group: sessionUser.groupName || '',
                                            startDate: '',
                                            endDate: '',
                                            reason: '',
                                            commitment: false
                                        })}
                                    >
                                        Làm mới
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        type="submit"
                                        disabled={!formData.commitment || loading}
                                    >
                                        {loading ? 'Đang gửi...' : 'Gửi đơn'}
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                    {/* Dialog xác nhận gửi đơn */}
                    <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
                        <DialogTitle>Xác nhận gửi đơn</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                Bạn có chắc chắn muốn gửi đơn xin nghỉ phép này không?
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpenConfirm(false)} color="inherit">
                                Hủy
                            </Button>
                            <Button onClick={handleConfirmSend} color="primary" variant="contained" autoFocus>
                                Xác nhận
                            </Button>
                        </DialogActions>
                    </Dialog>
                    <Snackbar
                        open={!!success}
                        autoHideDuration={3000}
                        onClose={handleCloseSnackbar}
                        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    >
                        <Alert severity="success" sx={{ width: '100%' }}>
                            Gửi đơn nghỉ phép thành công!
                        </Alert>
                    </Snackbar>
                    <Snackbar
                        open={!!error}
                        autoHideDuration={4000}
                        onClose={handleCloseSnackbar}
                        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    >
                        <Alert severity="error" sx={{ width: '100%' }}>
                            {error}
                        </Alert>
                    </Snackbar>
                </Paper>
            </DashboardCard>
        </PageContainer>
    );
};

export default Leave;