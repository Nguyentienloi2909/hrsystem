import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Grid,
    TextField,
    Button,
    MenuItem,
    Typography,
    Card,
    CardContent,
    Avatar,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import ApiService from 'src/service/ApiService';
import { useUser } from 'src/contexts/UserContext';

const genders = [
    { label: 'Nam', value: 'true' },
    { label: 'Nữ', value: 'false' }
];

const EditProfile = () => {
    const navigate = useNavigate();
    const { setUser } = useUser();

    const [form, setForm] = useState({
        id: '',
        fullName: '',
        birthDate: '',
        email: '',
        address: '',
        gender: '',
        bankNumber: '',
        bankName: '',
        avatar: '',
        phoneNumber: '',
        status: '',
        roleId: '',
        groupId: '',
        startDate: '',
        monthSalary: ''
    });
    const [bankList, setBankList] = useState([]);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [openConfirm, setOpenConfirm] = useState(false);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setLoading(true);
                const userData = await ApiService.getUserProfile();
                if (!userData.id) {
                    setErrors({ general: 'Không tìm thấy ID người dùng. Vui lòng đăng nhập lại.' });
                    setLoading(false);
                    return;
                }
                const formattedData = {
                    id: userData.id || '',
                    fullName: userData.fullName || '',
                    birthDate: userData.birthDate ? userData.birthDate.substring(0, 10) : '',
                    email: userData.email || '',
                    address: userData.address || '',
                    gender: userData.gender !== undefined ? userData.gender.toString() : '',
                    bankNumber: userData.bankNumber || '',
                    bankName: userData.bankName || '',
                    avatar: userData.avatar || '',
                    phoneNumber: userData.phoneNumber || '',
                    status: userData.status || '',
                    roleId: userData.roleId || '',
                    groupId: userData.groupId || '',
                    startDate: userData.startDate || '',
                    monthSalary: userData.monthSalary || ''
                };
                setForm(formattedData);
                setAvatarPreview(userData.avatar || '');

                const banks = await ApiService.getBankList?.() || [];
                const hasUserBank = banks.some(bank => bank.name === userData.bankName);
                if (userData.bankName && !hasUserBank) {
                    setBankList([{ name: userData.bankName, code: userData.bankName }, ...banks]);
                } else {
                    setBankList(banks);
                }
            } catch (error) {
                setErrors({ general: error.response?.data?.message || 'Không thể tải hồ sơ người dùng' });
            } finally {
                setLoading(false);
            }
        };
        fetchUserProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
        setErrors(prev => ({ ...prev, [name]: null, general: null }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setErrors({ avatar: 'Vui lòng chọn một tệp ảnh hợp lệ' });
        }
    };

    const handleCancel = () => {
        navigate('/profile');
    };

    const validate = () => {
        const newErrors = {};
        if (!form.fullName) newErrors.fullName = 'Vui lòng nhập họ tên';
        if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Email không hợp lệ';
        if (!form.phoneNumber) newErrors.phoneNumber = 'Vui lòng nhập số điện thoại';
        if (!form.birthDate) newErrors.birthDate = 'Vui lòng chọn ngày sinh';
        if (!form.gender) newErrors.gender = 'Vui lòng chọn giới tính';
        if (!form.address) newErrors.address = 'Vui lòng nhập địa chỉ';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Khi nhấn nút lưu, chỉ mở modal xác nhận
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.id) {
            setErrors({ general: 'Không tìm thấy ID người dùng. Vui lòng đăng nhập lại.' });
            return;
        }
        if (!validate()) return;
        setOpenConfirm(true);
    };

    // Khi xác nhận cập nhật
    const handleConfirmUpdate = async () => {
        setSaving(true);
        setOpenConfirm(false);
        try {
            const formData = new FormData();
            formData.append('FullName', form.fullName || '');
            formData.append('PhoneNumber', form.phoneNumber || '');
            formData.append('Email', form.email || '');
            formData.append('Gender', form.gender || '');
            formData.append('Address', form.address || '');
            formData.append('BirthDate', form.birthDate || '');
            formData.append('BankNumber', form.bankNumber || '');
            formData.append('BankName', form.bankName || '');
            formData.append('groupId', form.groupId || '');
            if (avatarFile) {
                formData.append('FileImage', avatarFile); // Đúng tên trường backend yêu cầu
            }
            // Log kiểm tra dữ liệu gửi đi
            const logObj = {};
            for (let pair of formData.entries()) {
                logObj[pair[0]] = pair[1];
            }
            console.log('Dữ liệu gửi đi khi cập nhật:', logObj);

            await ApiService.updateUser(form.id, formData);
            localStorage.removeItem('userProfile');
            const newProfile = await ApiService.getUserProfile();
            setUser(prev => ({ ...prev, ...newProfile, userId: newProfile.id }));
            navigate('/profile');
        } catch (error) {
            console.error('Update profile error:', error, error?.response);
            setErrors({ general: error?.response?.data?.message || 'Không thể cập nhật hồ sơ' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '100vh' }}>
                <CircularProgress />
            </Grid>
        );
    }

    return (
        <PageContainer title="Sửa hồ sơ cá nhân" description="Cập nhật thông tin cá nhân">
            <Card>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                        <Typography variant="h5">Sửa hồ sơ cá nhân</Typography>
                        <Button color="error" variant="outlined" size="small" onClick={handleCancel}>
                            Hủy
                        </Button>
                    </Box>
                    {errors.general && (
                        <Typography color="error" sx={{ mb: 2 }}>{errors.general}</Typography>
                    )}
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sx={{ textAlign: 'center' }}>
                                <Box sx={{ mb: 2 }}>
                                    <Avatar
                                        src={avatarPreview}
                                        sx={{ width: 120, height: 120, margin: '0 auto', mb: 2 }}
                                    />
                                    <Button variant="contained" component="label" size="small">
                                        Đổi ảnh đại diện
                                        <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
                                    </Button>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Họ và tên"
                                    name="fullName"
                                    value={form.fullName}
                                    onChange={handleChange}
                                    error={!!errors.fullName}
                                    helperText={errors.fullName}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Ngày sinh"
                                    name="birthDate"
                                    type="date"
                                    value={form.birthDate}
                                    onChange={handleChange}
                                    InputLabelProps={{ shrink: true }}
                                    error={!!errors.birthDate}
                                    helperText={errors.birthDate}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    error={!!errors.email}
                                    helperText={errors.email}
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Số điện thoại"
                                    name="phoneNumber"
                                    value={form.phoneNumber}
                                    onChange={handleChange}
                                    error={!!errors.phoneNumber}
                                    helperText={errors.phoneNumber}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Địa chỉ"
                                    name="address"
                                    value={form.address}
                                    onChange={handleChange}
                                    error={!!errors.address}
                                    helperText={errors.address}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Giới tính"
                                    name="gender"
                                    value={form.gender}
                                    onChange={handleChange}
                                    error={!!errors.gender}
                                    helperText={errors.gender}
                                >
                                    <MenuItem value="">Chọn giới tính</MenuItem>
                                    {genders.map((g) => (
                                        <MenuItem key={g.value} value={g.value}>{g.label}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Số tài khoản"
                                    name="bankNumber"
                                    value={form.bankNumber}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Ngân hàng"
                                    name="bankName"
                                    value={form.bankName || ''}
                                    onChange={handleChange}
                                >
                                    <MenuItem value="">Chọn ngân hàng</MenuItem>
                                    {bankList.map((bank) => (
                                        <MenuItem key={bank.code || bank.name} value={bank.name}>
                                            {bank.name}
                                        </MenuItem>
                                    ))}
                                    {form.bankName && !bankList.some(bank => bank.name === form.bankName) && (
                                        <MenuItem value={form.bankName}>
                                            {form.bankName} (Ngân hàng không trong danh sách)
                                        </MenuItem>
                                    )}
                                </TextField>
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    size="large"
                                    disabled={saving}
                                >
                                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </CardContent>
            </Card>
            {/* Modal xác nhận cập nhật */}
            <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
                <DialogTitle>Xác nhận cập nhật</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Bạn có chắc chắn muốn cập nhật thông tin hồ sơ không?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenConfirm(false)} color="inherit">
                        Hủy
                    </Button>
                    <Button onClick={handleConfirmUpdate} color="primary" variant="contained" autoFocus>
                        Xác nhận
                    </Button>
                </DialogActions>
            </Dialog>
        </PageContainer>
    );
};

export default EditProfile;