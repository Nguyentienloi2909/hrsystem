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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import ApiService from 'src/service/ApiService';

// Utility to format number with thousand separators
const formatNumber = (value) => {
    if (!value) return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Utility to parse formatted number back to raw number
const parseNumber = (value) => {
    return value.replace(/,/g, '');
};

const EmployeeCreate = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        fullName: '',
        email: '',
        roleId: '',
        roleName: '',
        groupId: '',
        groupName: '',
        monthSalary: '',
        startDay: new Date().toISOString().split('T')[0],
        gender: '' // Add gender to form state
    });

    const [errors, setErrors] = useState({});
    const [departments, setDepartments] = useState([]);
    const [roles, setRoles] = useState([]);
    const [openConfirm, setOpenConfirm] = useState(false);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const data = await ApiService.getAllDepartments();
                const groupList = data.flatMap((dept) =>
                    (dept.groups || []).map((group) => ({
                        groupId: group.id.toString(),
                        groupName: `${group.groupName} (${dept.departmentName})`,
                    }))
                );
                setDepartments(groupList);
            } catch (err) {
                console.error('Error loading departments', err);
            }
        };

        const fetchRoles = async () => {
            try {
                const roleList = await ApiService.getAllRoles();
                setRoles(roleList || []);
            } catch (err) {
                console.error('Error loading roles', err);
            }
        };

        fetchDepartments();
        fetchRoles();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'groupId') {
            const selected = departments.find((d) => d.groupId === value);
            setForm((prev) => ({
                ...prev,
                groupId: value,
                groupName: selected?.groupName || '',
            }));
        } else if (name === 'roleId') {
            const selected = roles.find((r) => r.id.toString() === value);
            setForm((prev) => ({
                ...prev,
                roleId: value,
                roleName: selected?.roleName || '',
            }));
        } else if (name === 'monthSalary') {
            // Allow only digits and format the input
            const rawValue = parseNumber(value);
            if (/^\d*$/.test(rawValue)) {
                setForm((prev) => ({
                    ...prev,
                    monthSalary: formatNumber(rawValue),
                }));
            }
        } else {
            setForm((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!form.fullName) newErrors.fullName = 'Vui lòng nhập họ tên';
        if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Email không hợp lệ';
        if (!form.groupId) newErrors.groupId = 'Vui lòng chọn phòng ban';
        if (!form.roleId) newErrors.roleId = 'Vui lòng chọn chức vụ';
        if (!form.startDay) newErrors.startDay = 'Vui lòng chọn ngày bắt đầu';
        if (!form.monthSalary) newErrors.monthSalary = 'Vui lòng nhập lương tháng';
        else if (isNaN(parseNumber(form.monthSalary))) newErrors.monthSalary = 'Lương tháng phải là số';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        setOpenConfirm(true);
    };

    const handleConfirmCreate = async () => {
        setOpenConfirm(false);
        try {
            setLoading(true);

            const formData = new FormData();
            formData.append('fullName', form.fullName);
            formData.append('email', form.email);
            formData.append('groupId', Number(form.groupId));
            formData.append('groupName', form.groupName);
            formData.append('roleId', Number(form.roleId));
            formData.append('roleName', form.roleName);
            formData.append('startDay', form.startDay);
            formData.append('monthSalary', parseNumber(form.monthSalary)); // Send raw number

            // Default fields
            formData.append('phoneNumber', '');
            formData.append('address', '');
            formData.append('gender', form.gender);
            formData.append('birthDate', '');
            formData.append('bankName', '');
            formData.append('bankNumber', '');
            formData.append('status', 'Active');

            await ApiService.createUser(formData);
            navigate('/manage/employee/list');
        } catch (err) {
            console.error('Lỗi khi tạo nhân viên:', err);
            alert('Tạo nhân viên thất bại!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageContainer title="Thêm nhân viên mới" description="Tạo hồ sơ nhân viên mới">
            <Card>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                        <Typography variant="h5">Thêm nhân viên</Typography>
                        <Button variant="outlined" onClick={() => navigate('/manage/employee/list')}>
                            Hủy
                        </Button>
                    </Box>
                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <Grid container spacing={2}>
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
                                    label="Email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    error={!!errors.email}
                                    helperText={errors.email}
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
                                    <MenuItem value="true">Nam</MenuItem>
                                    <MenuItem value="false">Nữ</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Phòng ban"
                                    name="groupId"
                                    value={form.groupId}
                                    onChange={handleChange}
                                    error={!!errors.groupId}
                                    helperText={errors.groupId}
                                >
                                    {departments.map((dept) => (
                                        <MenuItem key={dept.groupId} value={dept.groupId}>
                                            {dept.groupName}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Chức vụ"
                                    name="roleId"
                                    value={form.roleId}
                                    onChange={handleChange}
                                    error={!!errors.roleId}
                                    helperText={errors.roleId}
                                >
                                    {roles.map((role) => (
                                        <MenuItem key={role.id} value={role.id}>
                                            {role.roleName}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Ngày bắt đầu"
                                    name="startDay"
                                    type="date"
                                    value={form.startDay}
                                    onChange={handleChange}
                                    InputLabelProps={{ shrink: true }}
                                    error={!!errors.startDay}
                                    helperText={errors.startDay}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Lương tháng (VNĐ)"
                                    name="monthSalary"
                                    value={form.monthSalary}
                                    onChange={handleChange}
                                    error={!!errors.monthSalary}
                                    helperText={errors.monthSalary}
                                    inputProps={{ inputMode: 'numeric' }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                    <Button type="submit" variant="contained" disabled={loading}>
                                        {loading ? 'Đang xử lý...' : 'Thêm mới'}
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </CardContent>
            </Card>
            {/* Modal xác nhận */}
            <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
                <DialogTitle>Xác nhận tạo mới nhân viên</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Bạn có chắc chắn muốn tạo mới nhân viên với thông tin này?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenConfirm(false)} color="primary">
                        Hủy
                    </Button>
                    <Button onClick={handleConfirmCreate} color="primary" variant="contained" disabled={loading}>
                        {loading ? 'Đang xử lý...' : 'Xác nhận'}
                    </Button>
                </DialogActions>
            </Dialog>
        </PageContainer>
    );
};

export default EmployeeCreate;