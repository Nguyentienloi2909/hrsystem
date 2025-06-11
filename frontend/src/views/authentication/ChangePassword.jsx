import React, { useState } from 'react';
import {
    Box,
    Grid,
    Button,
    TextField,
    Typography,
    IconButton,
    InputAdornment,
    Alert,
    Stack,
    CircularProgress
} from '@mui/material';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from 'src/components/shared/DashboardCard';
import ApiService from 'src/service/ApiService';
import { useNavigate } from 'react-router-dom';

const ChangePassword = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleTogglePassword = (field) => {
        setShowPassword(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setErrors(prev => ({ ...prev, [name]: null, general: null }));
        setSuccess('');
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.currentPassword) newErrors.currentPassword = 'Vui lòng nhập mật khẩu cũ';
        if (!formData.newPassword) newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
        else if (formData.newPassword.length < 6) newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
        if (!formData.confirmPassword) newErrors.confirmPassword = 'Vui lòng nhập lại mật khẩu mới';
        else if (formData.newPassword !== formData.confirmPassword) newErrors.confirmPassword = 'Mật khẩu mới không khớp';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            await ApiService.changePassword({
                oldPassword: formData.currentPassword,
                newPassword: formData.newPassword,
                againNewPassword: formData.confirmPassword
            });
            setSuccess('Đổi mật khẩu thành công! Bạn sẽ được đăng xuất sau giây lát.');
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });

            setTimeout(() => {
                ApiService.logout();
                navigate('/auth/login');
            }, 2000);
        } catch (err) {
            setErrors({ general: err.response?.data?.message || 'Có lỗi xảy ra khi thay đổi mật khẩu' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageContainer title="Đổi mật khẩu" description="Thay đổi mật khẩu tài khoản">
            <Box sx={{ minHeight: '100vh', p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
                <Grid container justifyContent="center">
                    <Grid item xs={12} sm={10} md={6} lg={5}>
                        <DashboardCard sx={{
                            width: '100%',
                            maxWidth: '500px',
                            p: 4,
                            borderRadius: 2,
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                            background: '#ffffff'
                        }}>
                            <Box sx={{ mb: 4, textAlign: 'center' }}>
                                <Typography variant="h4" color="primary" fontWeight={700} sx={{ background: 'linear-gradient(90deg, #1976d2, #42a5f5)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
                                    Đổi mật khẩu
                                </Typography>
                            </Box>

                            {errors.general && <Alert severity="error" sx={{ mb: 3, borderRadius: 1 }}>{errors.general}</Alert>}
                            {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 1 }}>{success}</Alert>}

                            <form onSubmit={handleSubmit}>
                                <Stack spacing={4}>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        label="Mật khẩu cũ"
                                        name="currentPassword"
                                        type={showPassword.current ? 'text' : 'password'}
                                        value={formData.currentPassword}
                                        onChange={handleChange}
                                        error={!!errors.currentPassword}
                                        helperText={errors.currentPassword}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton size="small" onClick={() => handleTogglePassword('current')} sx={{ color: '#1976d2' }}>
                                                        {showPassword.current ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                                    />

                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        label="Mật khẩu mới"
                                        name="newPassword"
                                        type={showPassword.new ? 'text' : 'password'}
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        error={!!errors.newPassword}
                                        helperText={errors.newPassword}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton size="small" onClick={() => handleTogglePassword('new')} sx={{ color: '#1976d2' }}>
                                                        {showPassword.new ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                                    />

                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        label="Nhập lại mật khẩu mới"
                                        name="confirmPassword"
                                        type={showPassword.confirm ? 'text' : 'password'}
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        error={!!errors.confirmPassword}
                                        helperText={errors.confirmPassword}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton size="small" onClick={() => handleTogglePassword('confirm')} sx={{ color: '#1976d2' }}>
                                                        {showPassword.confirm ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                                    />

                                    <Button
                                        fullWidth
                                        type="submit"
                                        variant="contained"
                                        disabled={loading}
                                        sx={{
                                            py: 2,
                                            borderRadius: 1,
                                            background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
                                            '&:hover': {
                                                background: 'linear-gradient(90deg, #1565c0, #2196f3)',
                                            },
                                            textTransform: 'none',
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                            color: '#ffffff'
                                        }}
                                    >
                                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Xác nhận'}
                                    </Button>
                                </Stack>
                            </form>
                        </DashboardCard>
                    </Grid>
                </Grid>
            </Box>
        </PageContainer>
    );
};

export default ChangePassword;