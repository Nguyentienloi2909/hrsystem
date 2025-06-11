import React, { useState, useEffect } from 'react';
import {
    Paper, Grid, Typography, Box, Card, CardContent, Divider,
    Button, Stack, FormControl, InputLabel, Select, MenuItem,
    CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useTheme,
    Tooltip
} from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import {
    IconPrinter, IconDownload, IconAward,
    IconAlertCircle
} from '@tabler/icons-react';
import ApiService from '../../service/ApiService';

const formatCurrency = value => (
    typeof value === 'number' && !isNaN(value)
        ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
        : 'N/A'
);

import PropTypes from 'prop-types';

const InfoItem = ({ icon, label, value, bold = true }) => (
    <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5}>
        <Box color="text.secondary">{React.cloneElement(icon, { size: 20 })}</Box>
        <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.2 }}>
                {label}:
            </Typography>
            <Typography variant="body1" fontWeight={bold ? 'medium' : 'normal'}>
                {value ?? 'N/A'}
            </Typography>
        </Box>
    </Stack>
);

InfoItem.propTypes = {
    icon: PropTypes.element.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.any,
    bold: PropTypes.bool
};

const parseNote = (note) => {
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
};

const Payroll = () => {
    const theme = useTheme();
    const [profile, setProfile] = useState(null);
    const [salary, setSalary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [month, setMonth] = useState(() => {
        const now = new Date();
        if (now.getMonth() === 0) {
            return 11; // Tháng 12 (0-based)
        }
        return now.getMonth() - 1;
    }); // 0-11
    const [year, setYear] = useState(() => {
        const now = new Date();
        if (now.getMonth() === 0) {
            return now.getFullYear() - 1;
        }
        return now.getFullYear();
    });
    const [noteData, setNoteData] = useState({ lateDays: 0, absentDays: 0, deductions: [] });
    const [attendanceSummary, setAttendanceSummary] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError('');
            try {
                const user = await ApiService.getUserProfile();
                setProfile(user);
                console.log('User profile:', user);

                const data = await ApiService.getSalaryById(user.id, month + 1, year);
                setSalary(data);
                console.log('Salary data:', data);

                const parsedNote = parseNote(data?.note);
                setNoteData(parsedNote);
                console.log('Parsed note data:', parsedNote);

                // Sửa lại hàm gọi API lấy tổng hợp chấm công: truyền user.id
                const attSummary = await ApiService.getAttendanceSummaryMonthly(user.id, month + 1, year);
                setAttendanceSummary(attSummary);
                console.log('Attendance summary:', attSummary);
            } catch (err) {
                setError(err.message || 'Không thể tải dữ liệu.');
                setSalary(null);
                setNoteData({ lateDays: 0, absentDays: [] });
                setAttendanceSummary(null);
                console.error('Error loading payroll data:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [month, year]);

    if (loading) {
        return (
            <PageContainer title="Đang tải...">
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                    <CircularProgress />
                    <Typography variant="h6" sx={{ ml: 2 }}>
                        Đang tải dữ liệu phiếu lương...
                    </Typography>
                </Box>
            </PageContainer>
        );
    }

    if (error) {
        return (
            <PageContainer title="Lỗi">
                <Alert severity="error" icon={<IconAlertCircle />}>{error}</Alert>
            </PageContainer>
        );
    }

    const { month: m, year: y, totalSalary, note, numberOfWorkingDays, monthSalary } = salary || {};
    const calculateGrossTotal = () => salary?.monthSalary || 0;
    const calculateDeductionsTotal = () => noteData.deductions.reduce((sum, item) => sum + item.amount, 0);
    const calculateNetTotal = () => salary?.totalSalary || 0;

    // Đặt số ngày công chuẩn
    const STANDARD_WORKING_DAYS = 26;

    // Số ngày làm thực tế = Số ngày có mặt + Số ngày trễ
    const validActualWorkingDays =
        (attendanceSummary?.totalPresentDays ?? 0) +
        (attendanceSummary?.totalLateDays ?? 0);

    // Lương thực nhận theo số công thực tế
    const actualSalary = monthSalary && validActualWorkingDays
        ? (monthSalary / STANDARD_WORKING_DAYS) * validActualWorkingDays
        : 0;

    // Tiền tăng ca
    const overtimeSalary = (attendanceSummary?.totalOvertimeHours ?? 0) * 50000;

    // Tổng khấu trừ
    const totalDeductions =
        (attendanceSummary?.totalAbsentDays ?? 0) * 100000 +
        (attendanceSummary?.totalLeaveDays ?? 0) * 100000 +
        (attendanceSummary?.totalLateDays ?? 0) * 100000;

    // Lương thực lãnh (NET)
    const netSalary = actualSalary + overtimeSalary - totalDeductions;

    // Lấy dữ liệu từ API
    const workingDays = attendanceSummary?.totalWorkingDays ?? 0;
    const presentDays = attendanceSummary?.totalPresentDays ?? 0;
    const lateDays = attendanceSummary?.totalLateDays ?? 0;
    const absentDays = attendanceSummary?.totalAbsentDays ?? 0;
    const overtimeHours = attendanceSummary?.totalOvertimeHours ?? 0;

    // Lương 1 ngày
    const salaryPerDay = monthSalary && workingDays ? monthSalary / workingDays : 0;
    // Tiền tăng ca 1 giờ = (monthSalary/totalWorkingDays)/9 * 150%
    const overtimePerHour = salaryPerDay / 9 * 1.5;

    // Lương theo công thực tế
    const salaryByAttendance = salaryPerDay * (presentDays + lateDays);
    // Tiền tăng ca
    const overtimeAmount = overtimeHours * overtimePerHour;

    // Tổng các khoản cộng
    const grossTotal = salaryByAttendance + overtimeAmount;

    // Tổng các khoản trừ (KHÔNG trừ ngày nghỉ phép)
    const deductions =
        (absentDays * 100000) +
        (lateDays * 100000);

    // Lương thực lãnh tính trên frontend
    const netSalaryFrontend = grossTotal - deductions;

    return (
        <PageContainer title={`Phiếu lương tháng ${m}/${y}`} description="Chi tiết lương hàng tháng">
            {/* Filters */}
            <Box mb={3} display="flex" justifyContent="space-between" flexWrap="wrap" gap={2}>
                <Typography variant="h4" fontWeight="bold">
                    Phiếu lương tháng {m}/{y}
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                    <FormControl size="small">
                        <InputLabel>Tháng</InputLabel>
                        <Select value={month} label="Tháng" onChange={e => setMonth(e.target.value)}>
                            {Array.from({ length: 12 }, (_, i) => (
                                <MenuItem key={i} value={i}>{i + 1}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl size="small">
                        <InputLabel>Năm</InputLabel>
                        <Select value={year} label="Năm" onChange={e => setYear(e.target.value)}>
                            {Array.from({ length: 10 }, (_, i) => year - 5 + i).map(yOpt => (
                                <MenuItem key={yOpt} value={yOpt}>{yOpt}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Stack>
            </Box>

            {/* Thông báo bảng lương rỗng */}
            {(!salary || Object.keys(salary).length === 0) && (
                <Alert severity="info" icon={<IconAlertCircle />} sx={{ mb: 3 }}>
                    Không tìm thấy bảng lương trong tháng này.
                </Alert>
            )}

            {/* Nếu không có lương thì không render bảng chi tiết */}
            {(!salary || Object.keys(salary).length === 0) ? null : (
                <>
                    <Box mb={3} display="flex" justifyContent="flex-end">
                        <Stack direction="row" spacing={1.5}>
                            <Tooltip title="Chức năng đang phát triển" arrow>
                                <span>
                                    <Button variant="outlined" startIcon={<IconPrinter size={18} />} disabled>
                                        In phiếu lương
                                    </Button>
                                </span>
                            </Tooltip>
                            <Tooltip title="Chức năng đang phát triển" arrow>
                                <span>
                                    <Button variant="outlined" startIcon={<IconDownload size={18} />} disabled>
                                        Tải xuống
                                    </Button>
                                </span>
                            </Tooltip>
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
                                        <Typography variant="body2">Kỳ lương: Tháng {m}/{y}</Typography>
                                        <Typography variant="body2">Mã phiếu: PL{String(m).padStart(2, '0')}{y}-{profile?.id}</Typography>
                                    </Box>
                                </Box>
                                <Divider sx={{ my: 2 }} />
                            </Grid>

                            {/* Employee Information */}
                            <Grid item xs={12} md={6}>
                                <Card sx={{ height: '100%', backgroundColor: theme.palette?.background?.default }}>
                                    <CardContent>
                                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                                            THÔNG TIN NHÂN VIÊN
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="text.secondary">Họ và tên:</Typography>
                                                <Typography variant="body1" fontWeight="medium">{profile?.fullName || 'N/A'}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="text.secondary">Phòng ban:</Typography>
                                                <Typography variant="body1">{profile?.groupName || 'N/A'}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="text.secondary">Chức vụ:</Typography>
                                                <Typography variant="body1">{profile?.roleName || 'N/A'}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="text.secondary">Số tài khoản ngân hàng:</Typography>
                                                <Typography variant="body1">{profile?.bankNumber || 'N/A'}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="text.secondary">Tên ngân hàng:</Typography>
                                                <Typography variant="body1">{profile?.bankName || 'N/A'}</Typography>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Working Information */}
                            <Grid item xs={12} md={6}>
                                <Card sx={{ height: '100%', backgroundColor: theme.palette?.background?.default }}>
                                    <CardContent>
                                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                                            THÔNG TIN CÔNG VIỆC
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="text.secondary">Số ngày làm:</Typography>
                                                <Typography variant="body1">{attendanceSummary?.totalWorkingDays ?? 0} ngày</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="text.secondary">Số ngày nghỉ phép:</Typography>
                                                <Typography variant="body1">{attendanceSummary?.totalLeaveDays ?? 0} ngày</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="text.secondary">Số ngày trễ:</Typography>
                                                <Typography variant="body1">{attendanceSummary?.totalLateDays ?? 0} ngày</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="text.secondary">Số ngày vắng:</Typography>
                                                <Typography variant="body1">{attendanceSummary?.totalAbsentDays ?? 0} ngày</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="text.secondary">Số ngày có mặt:</Typography>
                                                <Typography variant="body1">{attendanceSummary?.totalPresentDays ?? 0} ngày</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="text.secondary">Số giờ tăng ca:</Typography>
                                                <Typography variant="body1">{attendanceSummary?.totalOvertimeHours ?? 0} giờ</Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="body2" color="text.secondary">Trạng thái lương:</Typography>
                                                <Typography variant="body1">{note === 'Tiền lương đang được điều chỉnh' ? 'Điều chỉnh' : 'Ổn định'}</Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="body2" color="text.secondary">Ghi chú:</Typography>
                                                <Typography variant="body1">{note || 'Không có'}</Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="body2" color="text.secondary">Khoản khấu trừ:</Typography>
                                                <Typography variant="body1">{noteData.deductions.length > 0 ? formatCurrency(noteData.deductions[0].amount) : 'Không có'}</Typography>
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
                                            <TableRow sx={{ backgroundColor: theme.palette?.primary?.light + '20' }}>
                                                <TableCell width="60%"><Typography fontWeight="bold">Khoản mục</Typography></TableCell>
                                                <TableCell align="right"><Typography fontWeight="bold">Số tiền (VNĐ)</Typography></TableCell>
                                                <TableCell align="right"><Typography fontWeight="bold">Ghi chú</Typography></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {/* I. CÁC KHOẢN CỘNG */}
                                            <TableRow sx={{ backgroundColor: theme.palette?.background?.default }}>
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
                                            <TableRow sx={{ backgroundColor: theme.palette?.background?.default }}>
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
                                                        {formatCurrency(salary?.totalSalary)}
                                                    </Typography>
                                                </TableCell>
                                                {/* <TableCell align="right">Theo API</TableCell> */}
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>



                            {/* Attendance Summary - Tổng hợp chấm công */}
                            {/* {attendanceSummary && (
                                <Grid item xs={12}>
                                    <Box mt={2}>
                                        <Typography variant="subtitle1" fontWeight="bold">Tổng hợp chấm công tháng {month + 1}/{year}:</Typography>
                                        <Typography variant="body2">Tổng số ngày làm: {attendanceSummary.totalWorkingDays}</Typography>
                                        <Typography variant="body2">Tổng số ngày nghỉ phép: {attendanceSummary.totalLeaveDays}</Typography>
                                        <Typography variant="body2">Tổng số ngày trễ: {attendanceSummary.totalLateDays}</Typography>
                                        <Typography variant="body2">Tổng số ngày vắng: {attendanceSummary.totalAbsentDays}</Typography>
                                        <Typography variant="body2">Tổng số ngày có mặt: {attendanceSummary.totalPresentDays}</Typography>
                                        <Typography variant="body2">Tổng số giờ tăng ca: {attendanceSummary.totalOvertimeHours}</Typography>
                                    </Box>
                                </Grid>
                            )} */}
                        </Grid>
                        {/* Xác nhận tổng tiền thực lãnh nổi bật */}
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
                                            TỔNG TIỀN THỰC LÃNH
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold" color="primary">
                                            {formatCurrency(salary?.totalSalary)}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Paper>
                        </Box>
                    </Paper>
                </>
            )}
        </PageContainer>
    );
};

export default Payroll;
