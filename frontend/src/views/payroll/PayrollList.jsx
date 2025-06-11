import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box,
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Pagination,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Chip,
    IconButton,
    Paper,
    InputAdornment,
    Snackbar,
    Alert
} from '@mui/material';
import { IconSearch, IconEye, IconCheck, IconEdit, IconMail } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import ApiService from 'src/service/ApiService';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import { Modal } from '@mui/material';

const ITEMS_PER_PAGE = 10;

const PayrollList = () => {
    const navigate = useNavigate();
    const [payrolls, setPayrolls] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [monthFilter, setMonthFilter] = useState(new Date().getMonth() + 1);
    const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
    const [emailLoading, setEmailLoading] = useState(false);
    const [emailSuccess, setEmailSuccess] = useState('');
    const [emailError, setEmailError] = useState('');

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            try {
                setLoading(true);
                const [departmentsData, employeesData] = await Promise.all([
                    ApiService.getAllDepartments(),
                    ApiService.getAllUsers()
                ]);
                let payrollsData;
                if (monthFilter && yearFilter) {
                    payrollsData = await ApiService.getSalariesByMonth(yearFilter, monthFilter);
                } else if (yearFilter) {
                    payrollsData = await ApiService.getSalariesByYear(yearFilter);
                } else {
                    payrollsData = await ApiService.getSalariesByMonth(2025, 5);
                }
                if (isMounted) {
                    setDepartments(departmentsData);
                    setEmployees(employeesData);
                    setPayrolls(payrollsData);
                    setError('');
                }
            } catch (err) {
                if (isMounted) setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchData();
        return () => { isMounted = false; };
    }, [monthFilter, yearFilter]);

    const handleSearch = useCallback((e) => {
        setSearchTerm(e.target.value);
        setPage(1);
    }, []);

    const handleDepartmentFilter = useCallback((e) => {
        setDepartmentFilter(e.target.value);
        setPage(1);
    }, []);

    const handleMonthFilter = useCallback((e) => {
        setMonthFilter(e.target.value);
        setPage(1);
    }, []);

    const handleYearFilter = useCallback((e) => {
        setYearFilter(e.target.value);
        setPage(1);
    }, []);

    const handlePageChange = useCallback((event, value) => {
        setPage(value);
    }, []);

    const handleViewDetail = useCallback((userId, month, year) => {
        if (!userId || !month || !year) {
            console.error('Thiếu thông tin để xem chi tiết bảng lương:', { userId, month, year });
            return;
        }
        navigate(`/manage/payroll/detail/${userId}/${month}/${year}`);
    }, [navigate]);

    // Chuẩn bị map employeeId -> employee và groupId -> department để tra cứu nhanh
    const employeeMap = useMemo(() => {
        const map = new Map();
        employees.forEach(emp => map.set(emp.id, emp));
        return map;
    }, [employees]);

    const groupToDepartmentMap = useMemo(() => {
        const map = new Map();
        departments.forEach(dept => {
            dept.groups?.forEach(group => {
                map.set(group.id, dept);
            });
        });
        return map;
    }, [departments]);

    // Lọc payrolls hiệu quả
    const filteredPayrolls = useMemo(() => payrolls.filter((payroll) => {
        const employee = employeeMap.get(payroll.userId);
        const department = groupToDepartmentMap.get(employee?.groupId);
        const matchesName = payroll.userFullName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = departmentFilter === '' || department?.id === parseInt(departmentFilter);
        return matchesName && matchesDept;
    }), [payrolls, employeeMap, groupToDepartmentMap, searchTerm, departmentFilter]);

    const paginatedPayrolls = useMemo(() => {
        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        return filteredPayrolls.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredPayrolls, page]);

    const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

    if (loading) {
        return (
            <PageContainer>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 6 }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }}>Đang tải dữ liệu lương...</Typography>
                </Box>
            </PageContainer>
        );
    }

    if (error) {
        return (
            <PageContainer>
                <Box sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
                    <Typography variant="h6">{error}</Typography>
                </Box>
            </PageContainer>
        );
    }

    return (
        <PageContainer title="Payroll List" description="Manage employee payrolls">
            <DashboardCard>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" fontWeight="bold">Quản lý lương</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Modal open={emailLoading}>
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100vh',
                                bgcolor: 'rgba(255,255,255,0.7)'
                            }}>
                                <CircularProgress />
                                <Typography sx={{ mt: 2 }}>Đang gửi thông báo lương qua Email...</Typography>
                            </Box>
                        </Modal>
                        <button
                            style={{
                                background: '#1976d2',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 4,
                                padding: '8px 16px',
                                fontWeight: 'bold',
                                cursor: emailLoading ? 'not-allowed' : 'pointer',
                                opacity: emailLoading ? 0.7 : 1
                            }}
                            disabled={loading || emailLoading}
                            onClick={async () => {
                                setEmailLoading(true);
                                setEmailSuccess('');
                                setEmailError('');
                                try {
                                    await ApiService.sendGmailSalaryAll(monthFilter, yearFilter);
                                    setEmailSuccess('Đã gửi thông báo lương qua email cho tất cả nhân viên!');
                                } catch (err) {
                                    setEmailError('Gửi email thất bại. Vui lòng thử lại.');
                                } finally {
                                    setEmailLoading(false);
                                }
                            }}
                        >
                            <IconMail style={{ verticalAlign: 'middle', marginRight: 8 }} />
                            Gửi thông báo lương qua Email
                        </button>
                    </Box>
                </Box>

                {/* Filters */}
                <Paper elevation={1} sx={{ p: 2, mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <TextField
                        size="small"
                        placeholder="Tìm kiếm theo tên nhân viên..."
                        value={searchTerm}
                        onChange={handleSearch}
                        InputProps={{ startAdornment: <InputAdornment position="start"><IconSearch size={18} /></InputAdornment> }}
                        sx={{ flex: 1, minWidth: 200 }}
                    />
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Phòng ban</InputLabel>
                        <Select value={departmentFilter} onChange={handleDepartmentFilter} label="Phòng ban">
                            <MenuItem value="">Tất cả</MenuItem>
                            {departments.map((dept) => (
                                <MenuItem key={dept.id} value={dept.id}>{dept.departmentName}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 100 }}>
                        <InputLabel>Tháng</InputLabel>
                        <Select value={monthFilter} onChange={handleMonthFilter} label="Tháng">
                            <MenuItem value="">Tất cả</MenuItem>
                            {[...Array(12).keys()].map(i => (
                                <MenuItem key={i + 1} value={i + 1}>{i + 1}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 100 }}>
                        <InputLabel>Năm</InputLabel>
                        <Select value={yearFilter} onChange={handleYearFilter} label="Năm">
                            <MenuItem value="">Tất cả</MenuItem>
                            {[2024, 2025, 2026].map(year => (
                                <MenuItem key={year} value={year}>{year}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Paper>
                {/* Tổng số bảng lương */}
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Có {filteredPayrolls.length} bảng lương được tìm thấy
                </Typography>

                {/* Table */}
                <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Tên nhân viên</strong></TableCell>
                                <TableCell><strong>Phòng ban - Nhóm</strong></TableCell>
                                <TableCell><strong>Tháng</strong></TableCell>
                                <TableCell><strong>Năm</strong></TableCell>
                                <TableCell align="right"><strong>Lương cơ bản</strong></TableCell>
                                <TableCell align="right"><strong>Tổng lương</strong></TableCell>
                                <TableCell align="right"><strong>Số ngày làm</strong></TableCell>
                                <TableCell align="center"><strong>Trạng thái</strong></TableCell>
                                <TableCell align="center"><strong>Thao tác</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedPayrolls.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} align="center">Không có dữ liệu lương</TableCell>
                                </TableRow>
                            ) : (
                                paginatedPayrolls.map((payroll) => {
                                    const employee = employeeMap.get(payroll.userId);
                                    const department = groupToDepartmentMap.get(employee?.groupId);
                                    return (
                                        <TableRow key={payroll.id} hover>
                                            <TableCell>{payroll.userFullName}</TableCell>
                                            <TableCell>{department?.departmentName || 'N/A'} - {employee?.groupName || 'N/A'}</TableCell>
                                            <TableCell>{payroll.month}</TableCell>
                                            <TableCell>{payroll.year}</TableCell>
                                            <TableCell align="right">{formatCurrency(payroll.monthSalary ?? 0)}</TableCell>
                                            <TableCell align="right">{formatCurrency(payroll.totalSalary ?? 0)}</TableCell>
                                            <TableCell align="right">{payroll.numberOfWorkingDays ?? 'N/A'}</TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={payroll.note === 'Tiền lương đang được điều chỉnh' ? 'Điều chỉnh' : 'Đã duyệt'}
                                                    color={payroll.note === 'Tiền lương đang được điều chỉnh' ? 'warning' : 'success'}
                                                    size="small"
                                                    variant="outlined"
                                                    icon={payroll.note === 'Tiền lương đang được điều chỉnh' ? <IconEdit size={16} /> : <IconCheck size={16} />}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton onClick={() => handleViewDetail(payroll.userId, payroll.month, payroll.year)}>
                                                    <IconEye size={20} />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Pagination */}
                {Math.ceil(filteredPayrolls.length / ITEMS_PER_PAGE) > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                        <Pagination count={Math.ceil(filteredPayrolls.length / ITEMS_PER_PAGE)} page={page} onChange={handlePageChange} color="primary" />
                    </Box>
                )}

                {/* Notifications */}
                {emailSuccess && (
                    <Snackbar
                        open={!!emailSuccess}
                        autoHideDuration={3000}
                        onClose={() => setEmailSuccess('')}
                        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    >
                        <Alert severity="success" sx={{ width: '100%' }}>
                            {emailSuccess}
                        </Alert>
                    </Snackbar>
                )}
                {emailError && (
                    <Snackbar
                        open={!!emailError}
                        autoHideDuration={4000}
                        onClose={() => setEmailError('')}
                        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    >
                        <Alert severity="error" sx={{ width: '100%' }}>
                            {emailError}
                        </Alert>
                    </Snackbar>
                )}
            </DashboardCard>
        </PageContainer>
    );
};

export default PayrollList;