// src/views/employee/EmployeeEdit.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    Snackbar,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from '@mui/material';
import PropTypes from 'prop-types';
import PageContainer from 'src/components/container/PageContainer';
import ApiService from 'src/service/ApiService';

// Định nghĩa các hàm tiện ích ngoài component để tránh tạo lại mỗi lần render
const formatNumber = (value) => value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';
const parseNumber = (value) => value.replace(/,/g, '');

// Component con cho thông tin cá nhân
const PersonalInfo = ({ form, errors, handleChange, genders }) => (
    <>
        <Typography variant="h6" sx={{ mb: 2 }}>
            Thông tin nhân viên
        </Typography>
        <Grid container justifyContent="center" sx={{ mb: 2 }}>
            <Grid item>
                <Avatar src={form.avatar} alt="Employee Avatar" sx={{ width: 200, height: 200, mb: 2 }} />
            </Grid>
        </Grid>
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
                    disabled
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
                    disabled
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
                    disabled
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    type="date"
                    fullWidth
                    label="Ngày sinh"
                    name="birthDate"
                    value={form.birthDate}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.birthDate}
                    helperText={errors.birthDate}
                    disabled
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
                    disabled
                >
                    <MenuItem value="">Chọn giới tính</MenuItem>
                    {genders.map((g) => (
                        <MenuItem key={g.value} value={g.value}>
                            {g.label}
                        </MenuItem>
                    ))}
                </TextField>
            </Grid>
        </Grid>
    </>
);

PersonalInfo.propTypes = {
    form: PropTypes.object.isRequired,
    errors: PropTypes.object.isRequired,
    handleChange: PropTypes.func.isRequired,
    genders: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string,
            value: PropTypes.string,
        })
    ).isRequired,
};

// Component con cho thông tin ngân hàng
const BankInfo = ({ form, errors, handleChange, banks }) => (
    <>
        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Thông tin ngân hàng
        </Typography>
        <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    label="Số tài khoản"
                    name="bankNumber"
                    value={form.bankNumber}
                    onChange={handleChange}
                    error={!!errors.bankNumber}
                    helperText={errors.bankNumber}
                    disabled
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    select
                    fullWidth
                    label="Ngân hàng"
                    name="bankName"
                    value={form.bankName}
                    onChange={handleChange}
                    error={!!errors.bankName}
                    helperText={errors.bankName}
                    disabled
                >
                    <MenuItem value="">Chọn ngân hàng</MenuItem>
                    {banks.length > 0 ? (
                        banks.map((bank) => (
                            <MenuItem key={bank.code} value={bank.name}>
                                {bank.name}
                            </MenuItem>
                        ))
                    ) : (
                        <MenuItem disabled>Không có ngân hàng</MenuItem>
                    )}
                </TextField>
            </Grid>
        </Grid>
    </>
);

BankInfo.propTypes = {
    form: PropTypes.object.isRequired,
    errors: PropTypes.object.isRequired,
    handleChange: PropTypes.func.isRequired,
    banks: PropTypes.arrayOf(
        PropTypes.shape({
            code: PropTypes.string,
            name: PropTypes.string,
        })
    ).isRequired,
};

// Component con cho thông tin công việc
const WorkInfo = ({ form, errors, handleChange, departments, roles }) => (
    <>
        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Thông tin công việc
        </Typography>
        <Grid container spacing={2}>
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
                    <MenuItem value="">Chọn phòng ban</MenuItem>
                    {departments.length > 0 ? (
                        departments.map((dept) => (
                            <MenuItem key={dept.groupId} value={dept.groupId}>
                                {dept.groupName}
                            </MenuItem>
                        ))
                    ) : (
                        <MenuItem disabled>Không có phòng ban</MenuItem>
                    )}
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
                    <MenuItem value="">Chọn chức vụ</MenuItem>
                    {roles.length > 0 ? (
                        roles.map((role) => (
                            <MenuItem key={role.id} value={role.id}>
                                {role.roleName}
                            </MenuItem>
                        ))
                    ) : (
                        <MenuItem disabled>Không có chức vụ</MenuItem>
                    )}
                </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    type="date"
                    label="Ngày bắt đầu"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.startDate}
                    helperText={errors.startDate}
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
                    helperText={errors.monthSalary || 'Nhập số tiền (VNĐ)'}
                    inputProps={{ inputMode: 'numeric' }}
                />
            </Grid>
        </Grid>
    </>
);

WorkInfo.propTypes = {
    form: PropTypes.object.isRequired,
    errors: PropTypes.object.isRequired,
    handleChange: PropTypes.func.isRequired,
    departments: PropTypes.arrayOf(
        PropTypes.shape({
            groupId: PropTypes.string,
            groupName: PropTypes.string,
        })
    ).isRequired,
    roles: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number,
            roleName: PropTypes.string,
        })
    ).isRequired,
};

// Custom hook để lấy dữ liệu
const useEmployeeData = (id) => {
    const [form, setForm] = useState({
        id: '',
        fullName: '',
        email: '',
        phoneNumber: '',
        avatar: '',
        address: '',
        gender: '',
        birthDate: '',
        bankNumber: '',
        bankName: '',
        status: 'Active',
        roleId: '',
        groupId: '',
        startDate: '',
        monthSalary: '',
    });
    const [departments, setDepartments] = useState([]);
    const [banks, setBanks] = useState([]);
    const [roles, setRoles] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            try {
                setLoading(true);
                const [deptData, bankList, roleList] = await Promise.all([
                    ApiService.getAllDepartments(),
                    ApiService.getBankList(),
                    ApiService.getAllRoles(),
                ]);

                const groupList = deptData.flatMap((dept) =>
                    (dept.groups || []).map((group) => ({
                        groupId: group.id.toString(),
                        groupName: `${group.groupName} (${dept.departmentName})`,
                    }))
                );
                setDepartments(groupList);
                setBanks(Array.isArray(bankList) ? bankList : []);
                setRoles(Array.isArray(roleList) ? roleList : []);

                if (id) {
                    const user = await ApiService.getUser(id);
                    if (!user.id) {
                        if (isMounted) setErrors({ general: 'Không tìm thấy nhân viên.' });
                        return;
                    }
                    const matchingBank = bankList.find(
                        (bank) => bank.code === user.bankName || bank.name === user.bankName
                    );

                    const initialData = {
                        id: user.id || '',
                        fullName: user.fullName || '',
                        email: user.email || '',
                        phoneNumber: user.phoneNumber || '',
                        avatar: user.avatar || '',
                        address: user.address || '',
                        gender: user.gender !== undefined ? user.gender.toString() : '',
                        birthDate: user.birthDate?.substring(0, 10) || '',
                        bankNumber: user.bankNumber || '',
                        bankName: matchingBank ? matchingBank.name : user.bankName || '',
                        status: user.status || 'Active',
                        roleId: user.roleId ? user.roleId.toString() : '',
                        groupId: user.groupId ? user.groupId.toString() : '',
                        startDate: user.startDate?.substring(0, 10) || '',
                        monthSalary: user.monthSalary ? formatNumber(user.monthSalary.toString()) : '',
                    };
                    if (isMounted) setForm(initialData);
                    // Sửa lỗi: Xóa thông báo lỗi nếu load thành công
                    if (isMounted) setErrors({});
                } else {
                    // Nếu không có id, không nên set lỗi này
                    if (isMounted) setErrors({});
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchData();
        return () => { isMounted = false; };
    }, [id]);

    return { form, setForm, departments, banks, roles, errors, setErrors, loading };
};

const EmployeeEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { form, setForm, departments, banks, roles, errors, setErrors, loading } =
        useEmployeeData(id);
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [openConfirm, setOpenConfirm] = useState(false);

    const genders = useMemo(() => [
        { label: 'Nam', value: 'true' },
        { label: 'Nữ', value: 'false' },
    ], []);

    const handleChange = useCallback(
        (e) => {
            const { name, value } = e.target;
            setErrors((prev) => ({ ...prev, [name]: '' }));
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
                const rawValue = parseNumber(value);
                if (/^\d*$/.test(rawValue)) {
                    setForm((prev) => ({
                        ...prev,
                        monthSalary: formatNumber(rawValue),
                    }));
                }
            } else {
                setForm((prev) => ({ ...prev, [name]: value }));
            }
        },
        [departments, roles, setForm, setErrors]
    );

    const validate = useCallback(() => {
        const newErrors = {};
        if (!form.groupId) newErrors.groupId = 'Vui lòng chọn phòng ban';
        if (!form.roleId) newErrors.roleId = 'Vui lòng chọn chức vụ';
        if (!form.startDate) newErrors.startDate = 'Vui lòng chọn ngày bắt đầu';
        if (!form.monthSalary) newErrors.monthSalary = 'Vui lòng nhập lương tháng';
        else {
            const salary = Number(parseNumber(form.monthSalary));
            if (isNaN(salary)) newErrors.monthSalary = 'Lương tháng phải là số';
            else if (salary <= 0) newErrors.monthSalary = 'Lương tháng phải là số dương';
            else if (salary > 1_000_000_000) newErrors.monthSalary = 'Lương tháng không được vượt quá 1 tỷ VNĐ';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [form, setErrors]);

    const handleSubmit = useCallback(
        async (e) => {
            if (e) e.preventDefault();
            if (!validate()) return;
            setSaving(true);
            try {
                const formData = new FormData();
                Object.entries({
                    ...form,
                    groupId: Number(form.groupId),
                    roleId: Number(form.roleId),
                    monthSalary: parseNumber(form.monthSalary),
                }).forEach(([key, value]) => {
                    if (key !== 'groupName' && key !== 'roleName' && key !== 'avatar') {
                        formData.append(key, value);
                    }
                });
                await ApiService.updateUser(id, formData);
                setSnackbar({ open: true, message: 'Cập nhật nhân viên thành công!', severity: 'success' });
                setTimeout(() => {
                    navigate('/manage/employee/list', {
                        state: { success: 'Cập nhật nhân viên thành công!' },
                    });
                }, 1200);
            } catch (error) {
                setErrors({
                    general: error.response?.data?.message || 'Lỗi khi cập nhật thông tin nhân viên.',
                });
                setSnackbar({ open: true, message: 'Lỗi khi cập nhật thông tin nhân viên.', severity: 'error' });
            } finally {
                setSaving(false);
            }
        },
        [form, id, navigate, validate, setErrors]
    );

    const handleCancel = useCallback(() => {
        if (window.confirm('Bạn có chắc muốn hủy? Các thay đổi sẽ không được lưu.')) {
            navigate(`/manage/employee/info/${id}`);
        }
    }, [id, navigate]);

    if (loading) {
        return (
            <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '100vh' }}>
                <CircularProgress />
            </Grid>
        );
    }

    return (
        <PageContainer title="Cập nhật thông tin nhân viên" description="Chỉnh sửa thông tin nhân viên">
            <Card>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                        <Typography variant="h5">Cập nhật thông tin nhân viên</Typography>
                    </Box>
                    {errors.general && (
                        <Typography color="error" sx={{ mb: 2 }}>
                            {errors.general}
                        </Typography>
                    )}
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
                        <PersonalInfo
                            form={form}
                            errors={errors}
                            handleChange={handleChange}
                            genders={genders}
                        />
                        <BankInfo form={form} errors={errors} handleChange={handleChange} banks={banks} />
                        <WorkInfo
                            form={form}
                            errors={errors}
                            handleChange={handleChange}
                            departments={departments}
                            roles={roles}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <Button
                                type="button"
                                variant="contained"
                                color="primary"
                                disabled={saving}
                                sx={{ mr: 2 }}
                                onClick={() => setOpenConfirm(true)}
                            >
                                {saving ? 'Đang cập nhật...' : 'Cập nhật'}
                            </Button>
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={handleCancel}
                                disabled={saving}
                            >
                                Hủy
                            </Button>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
            <Dialog
                open={openConfirm}
                onClose={() => setOpenConfirm(false)}
            >
                <DialogTitle>Xác nhận cập nhật</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Bạn có chắc chắn muốn cập nhật thông tin nhân viên này không?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenConfirm(false)} color="inherit">
                        Hủy
                    </Button>
                    <Button
                        onClick={async (e) => {
                            setOpenConfirm(false);
                            await handleSubmit(e);
                        }}
                        color="primary"
                        variant="contained"
                        autoFocus
                        disabled={saving}
                    >
                        Xác nhận
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={2000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </PageContainer>
    );
};

export default EmployeeEdit;