import { useState, useEffect, useCallback } from 'react';
import {
    Paper,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Box,
    Card,
    CardContent,
    Divider,
    Button,
    Stack,
    useTheme,
    CircularProgress,
    Tooltip,
    Snackbar,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material';
import { IconDownload, IconArrowBack, IconAward, IconMail } from '@tabler/icons-react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiService from 'src/service/ApiService';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';

const PayrollDetail = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { userId, month, year } = useParams();
    const [payroll, setPayroll] = useState(null);
    const [employee, setEmployee] = useState(null);
    const [noteData, setNoteData] = useState({ lateDays: 0, absentDays: 0, deductions: [] });
    const [departments, setDepartments] = useState([]);
    const [attendanceSummary, setAttendanceSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [mailLoading, setMailLoading] = useState(false);
    const [mailSuccess, setMailSuccess] = useState('');
    const [mailError, setMailError] = useState('');
    const [openConfirmMail, setOpenConfirmMail] = useState(false);

    // Parse note string to extract late/absent/deductions
    const parseNote = useCallback((note) => {
        if (!note) return { lateDays: 0, absentDays: 0, deductions: [] };
        const regex = /(Trễ): (\d+), (Vắng): (\d+), (Số tiền trừ): ([\d,]+)/;
        const match = note.match(regex);
        if (match) {
            const lateDays = parseInt(match[2]);
            const absentDays = parseInt(match[4]);
            const deductionAmount = parseInt(match[6].replace(/,/g, ''));
            return {
                lateDays,
                absentDays,
                deductions: [{ title: 'Khấu trừ (Trễ/Vắng)', amount: deductionAmount }]
            };
        }
        return { lateDays: 0, absentDays: 0, deductions: [] };
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                if (!userId || !month || !year || isNaN(month) || isNaN(year)) {
                    throw new Error('Thông tin đầu vào không hợp lệ');
                }

                const [payrollData, employeeData, departmentData, attendanceData] = await Promise.all([
                    ApiService.getSalaryById(userId, month, year),
                    ApiService.getUser(userId),
                    ApiService.getAllDepartments(),
                    ApiService.getAttendanceSummaryMonthly(userId, month, year)
                ]);
                console.log('payrollData:', payrollData);
                console.log('employeeData:', employeeData);
                console.log('departmentData:', departmentData);
                console.log('attendanceData:', attendanceData);

                setPayroll(payrollData);
                setEmployee(employeeData);
                setDepartments(departmentData);
                setAttendanceSummary(attendanceData);
                setNoteData(parseNote(payrollData.note));
            } catch (err) {
                setError(err.message || 'Không thể tải dữ liệu lương. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [userId, month, year, parseNote]);

    const formatCurrency = (value) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

    // Lấy dữ liệu tổng kết chấm công
    const workingDays = attendanceSummary?.totalWorkingDays ?? 0;
    const presentDays = attendanceSummary?.totalPresentDays ?? 0;
    const lateDays = attendanceSummary?.totalLateDays ?? 0;
    const absentDays = attendanceSummary?.totalAbsentDays ?? 0;
    const overtimeHours = attendanceSummary?.totalOvertimeHours ?? 0;
    const leaveDays = attendanceSummary?.totalLeaveDays ?? 0;
    const monthSalary = payroll?.monthSalary ?? 0;

    // Lương 1 ngày
    const salaryPerDay = monthSalary && workingDays ? monthSalary / workingDays : 0;

    // Lương theo số công thực tế (chỉ tính ngày có mặt và ngày trễ)
    const salaryByAttendance = salaryPerDay * (presentDays + lateDays);
    // Tiền tăng ca 1 giờ = (lương/ngày)/9 * 150%
    const overtimePerHour = salaryPerDay / 9 * 1.5;
    const overtimeAmount = overtimeHours * overtimePerHour;
    // Tổng các khoản cộng
    const grossTotal = salaryByAttendance + overtimeAmount;
    // Tổng các khoản trừ (chỉ trừ ngày vắng và ngày trễ, KHÔNG trừ ngày nghỉ phép)
    const deductions = (absentDays * 100000) + (lateDays * 100000);
    // Lương thực lãnh
    const netTotal = grossTotal - deductions;

    const calculateGrossTotal = () => payroll?.monthSalary || 0;
    const calculateDeductionsTotal = () => noteData.deductions.reduce((sum, item) => sum + item.amount, 0);
    const calculateNetTotal = () => payroll?.totalSalary || 0;

    const getDepartmentNameByGroupId = (groupId) => {
        for (const department of departments) {
            const group = department.groups?.find(group => group.id === groupId);
            if (group) return department.departmentName;
        }
        return 'Không có thông tin';
    };

    if (loading) {
        return (
            <PageContainer>
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                </Box>
            </PageContainer>
        );
    }

    if (error || !payroll || !employee) {
        return (
            <PageContainer>
                <Box sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
                    <Typography variant="h6">{error || 'Không tìm thấy dữ liệu lương'}</Typography>
                </Box>
            </PageContainer>
        );
    }

    return (
        <PageContainer title="Payroll Detail" description="Employee payroll details">
            <DashboardCard>
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h4" fontWeight="bold">
                        Phiếu lương tháng {payroll.month}/{payroll.year}
                    </Typography>
                    <Stack direction="row" spacing={2}>
                        <Tooltip title="Chức năng đang được phát triển" arrow>
                            <span>
                                <Button
                                    variant="outlined"
                                    startIcon={<IconDownload />}
                                    disabled={false}
                                // onClick={() => alert('Chức năng đang được phát triển')}
                                >
                                    Tải xuống
                                </Button>
                            </span>
                        </Tooltip>
                        <Button
                            variant="contained"
                            startIcon={<IconMail />}
                            disabled={loading || mailLoading}
                            onClick={() => setOpenConfirmMail(true)}
                            sx={{
                                backgroundColor: '#1976d2',
                                color: '#fff',
                                '&:hover': { backgroundColor: '#1565c0' },
                                textTransform: 'none',
                                fontWeight: 'bold',
                                padding: '8px 16px',
                                borderRadius: 4,
                            }}
                        >
                            {mailLoading ? <CircularProgress size={22} color="inherit" /> : 'Gửi Email'}
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<IconArrowBack />}
                            onClick={() => navigate('/manage/payroll/list')}
                        >
                            Quay lại
                        </Button>
                    </Stack>
                </Box>

                <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                    <Grid container spacing={3}>
                        {/* Header with company info */}
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Box>
                                    <Typography variant="h5" fontWeight="bold">CÔNG TY TNHH LD TECHNOLOGY</Typography>
                                    <Typography variant="body2">Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM</Typography>
                                    <Typography variant="body2">Điện thoại: (028) 1234 5678</Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="h6" fontWeight="bold" color="primary">PHIẾU LƯONG</Typography>
                                    <Typography variant="body2">Kỳ lương: Tháng {payroll.month}/{payroll.year}</Typography>
                                    <Typography variant="body2">Mã phiếu: PL{payroll.month.toString().padStart(2, '0')}{payroll.year}-{employee.id}</Typography>
                                </Box>
                            </Box>
                            <Divider sx={{ my: 2 }} />
                        </Grid>

                        {/* Employee Information */}
                        <Grid item xs={12} md={6}>
                            <Card sx={{ height: '100%', backgroundColor: theme.palette.background.default }}>
                                <CardContent>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                                        THÔNG TIN NHÂN VIÊN
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Họ và tên:</Typography>
                                            <Typography variant="body1" fontWeight="medium">{employee.fullName || 'N/A'}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Phòng ban:</Typography>
                                            <Typography variant="body1">
                                                {getDepartmentNameByGroupId(employee.groupId)}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Nhóm:</Typography>
                                            <Typography variant="body1">{employee.groupName || 'N/A'}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Số tài khoản ngân hàng:</Typography>
                                            <Typography variant="body1">{employee.bankNumber || 'N/A'}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Tên ngân hàng:</Typography>
                                            <Typography variant="body1">{employee.bankName || 'N/A'}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Số điện thoại:</Typography>
                                            <Typography variant="body1">{employee.phoneNumber || 'N/A'}</Typography>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Working Information */}
                        <Grid item xs={12} md={6}>
                            <Card sx={{ height: '100%', backgroundColor: theme.palette.background.default }}>
                                <CardContent>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                                        THÔNG TIN CÔNG VIỆC
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Số ngày làm:</Typography>
                                            <Typography variant="body1">{payroll.numberOfWorkingDays || 'N/A'} ngày</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Trạng thái lương:</Typography>
                                            <Typography variant="body1">
                                                {payroll.note === 'Tiền lương đang được điều chỉnh' ? 'Điều chỉnh' : 'Ổn định'}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Số ngày trễ:</Typography>
                                            <Typography variant="body1">{noteData.lateDays} ngày</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Số ngày vắng:</Typography>
                                            <Typography variant="body1">{noteData.absentDays} ngày</Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="body2" color="text.secondary">Ghi chú:</Typography>
                                            <Typography variant="body1">{payroll.note || 'Không có'}</Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="body2" color="text.secondary">Khoản khấu trừ:</Typography>
                                            <Typography variant="body1">
                                                {noteData.deductions.length > 0 ? formatCurrency(noteData.deductions[0].amount) : 'Không có'}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Salary Details */}
                        <Grid item xs={12}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                                CHI TIẾT LƯƠNG
                            </Typography>
                            <TableContainer>
                                <Table sx={{ minWidth: 650 }}>
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: theme.palette.primary.light + '20' }}>
                                            <TableCell width="60%"><Typography fontWeight="bold">Khoản mục</Typography></TableCell>
                                            <TableCell align="right"><Typography fontWeight="bold">Số tiền (VNĐ)</Typography></TableCell>
                                            <TableCell align="right"><Typography fontWeight="bold">Ghi chú</Typography></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {/* I. CÁC KHOẢN CỘNG */}
                                        <TableRow sx={{ backgroundColor: theme.palette.background.default }}>
                                            <TableCell colSpan={3}>
                                                <Typography fontWeight="bold">I. CÁC KHOẢN CỘNG</Typography>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>1. Lương cơ bản</TableCell>
                                            <TableCell align="right">{formatCurrency(monthSalary)}</TableCell>
                                            <TableCell align="right">Theo hợp đồng</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>2. Lương theo số công thực tế</TableCell>
                                            <TableCell align="right">{formatCurrency(salaryByAttendance)}</TableCell>
                                            <TableCell align="right">{presentDays + lateDays} ngày</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>3. Tiền tăng ca</TableCell>
                                            <TableCell align="right">{formatCurrency(overtimeAmount)}</TableCell>
                                            <TableCell align="right">{overtimeHours} giờ</TableCell>
                                        </TableRow>
                                        <TableRow sx={{ backgroundColor: theme.palette.success.light + '20' }}>
                                            <TableCell><b>TỔNG CỘNG</b></TableCell>
                                            <TableCell align="right"><b>{formatCurrency(grossTotal)}</b></TableCell>
                                            <TableCell align="right"></TableCell>
                                        </TableRow>

                                        {/* II. CÁC KHOẢN TRỪ */}
                                        <TableRow sx={{ backgroundColor: theme.palette.background.default }}>
                                            <TableCell colSpan={3}>
                                                <Typography fontWeight="bold">II. CÁC KHOẢN TRỪ</Typography>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>1. Trừ ngày vắng</TableCell>
                                            <TableCell align="right">-{formatCurrency(absentDays * 100000)}</TableCell>
                                            <TableCell align="right">{absentDays} ngày</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>2. Trừ ngày trễ</TableCell>
                                            <TableCell align="right">-{formatCurrency(lateDays * 100000)}</TableCell>
                                            <TableCell align="right">{lateDays} ngày</TableCell>
                                        </TableRow>
                                        <TableRow sx={{ backgroundColor: theme.palette.error.light + '20' }}>
                                            <TableCell><b>TỔNG TRỪ</b></TableCell>
                                            <TableCell align="right"><b>-{formatCurrency(deductions)}</b></TableCell>
                                            <TableCell align="right"></TableCell>
                                        </TableRow>

                                        {/* III. LƯƠNG THỰC LÃNH */}
                                        <TableRow sx={{ backgroundColor: theme.palette.primary.light + '30' }}>
                                            <TableCell>
                                                <Typography variant="h6" fontWeight="bold">III. LƯƠNG THỰC LÃNH</Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography variant="h6" fontWeight="bold" color="primary.main">
                                                    {formatCurrency(netTotal)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right"></TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>


                    </Grid>
                    {/* Confirm Total Salary Box */}
                    <Box mt={4} mb={2} display="flex" justifyContent="center">
                        <Paper
                            elevation={4}
                            sx={{
                                p: 3,
                                borderRadius: 2,
                                maxWidth: 400,
                                width: "100%",
                                textAlign: "center",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}
                        >
                            <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" width="100%">
                                <IconAward size={32} color={theme.palette.success.main} />
                                <Box width="100%">
                                    <Typography variant="h6" fontWeight="bold" color="success.main" sx={{ mb: 1 }}>
                                        XÁC NHẬN: TỔNG TIỀN THỰC LÃNH
                                    </Typography>
                                    <Typography variant="h4" fontWeight="bold" color="primary">
                                        {formatCurrency(calculateNetTotal())}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    </Box>
                </Paper>

                <Snackbar
                    open={!!mailSuccess}
                    autoHideDuration={3000}
                    onClose={() => setMailSuccess('')}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert severity="success" sx={{ width: '100%' }}>
                        {mailSuccess}
                    </Alert>
                </Snackbar>
                <Snackbar
                    open={!!mailError}
                    autoHideDuration={4000}
                    onClose={() => setMailError('')}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert severity="error" sx={{ width: '100%' }}>
                        {mailError}
                    </Alert>
                </Snackbar>

                <Dialog
                    open={openConfirmMail}
                    onClose={() => setOpenConfirmMail(false)}
                >
                    <DialogTitle>Xác nhận gửi email</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Bạn có chắc chắn muốn gửi phiếu lương này qua email cho nhân viên?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenConfirmMail(false)} color="inherit">
                            Hủy
                        </Button>
                        <Button
                            onClick={async () => {
                                setOpenConfirmMail(false);
                                try {
                                    setMailLoading(true);
                                    setMailSuccess('');
                                    setMailError('');
                                    await ApiService.sendGmailSalaryByUser(userId, month, year);
                                    setMailSuccess('Gửi thông báo lương qua email thành công!');
                                } catch (err) {
                                    setMailError('Gửi thông báo thất bại. Vui lòng thử lại.');
                                } finally {
                                    setMailLoading(false);
                                }
                            }}
                            color="primary"
                            variant="contained"
                            autoFocus
                            disabled={mailLoading}
                        >
                            Xác nhận
                        </Button>
                    </DialogActions>
                </Dialog>
            </DashboardCard>
        </PageContainer>
    );
};

export default PayrollDetail;