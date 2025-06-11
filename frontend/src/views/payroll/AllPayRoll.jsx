import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
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
    InputAdornment
} from '@mui/material';
import { IconPlus, IconEdit, IconTrash, IconSearch, IconCheck } from '@tabler/icons-react';
import ApiService from 'src/service/ApiService';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';

const ITEMS_PER_PAGE = 10;

const PayrollManagement = () => {
    const [payrolls, setPayrolls] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [monthFilter, setMonthFilter] = useState(''); // Thêm state cho tháng
    const [yearFilter, setYearFilter] = useState(''); // Thêm state cho năm
    const [openDialog, setOpenDialog] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [selectedPayrollId, setSelectedPayrollId] = useState(null);
    const [newPayroll, setNewPayroll] = useState({ userId: '', month: '', year: '', monthSalary: '', totalSalary: '', note: '' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const departmentsData = await ApiService.getAllDepartments();
                const employeesData = await ApiService.getAllUsers();
                // Fetch payrolls based on selected month and year
                let payrollsData;
                if (monthFilter && yearFilter) {
                    payrollsData = await ApiService.getSalariesByMonth(yearFilter, monthFilter);
                } else if (yearFilter) {
                    payrollsData = await ApiService.getSalariesByYear(yearFilter);
                } else {
                    payrollsData = await ApiService.getSalariesByQuarter(2025, 2); // Default logic if no month/year selected
                }

                console.log('Fetched departments:', departmentsData);
                console.log('Fetched employees:', employeesData);
                console.log('Fetched payrolls:', payrollsData);

                setDepartments(departmentsData);
                setEmployees(employeesData);
                setPayrolls(payrollsData);
            } catch (err) {
                setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [monthFilter, yearFilter]); // Update when month or year changes

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setPage(1);
    };

    const handleDepartmentFilter = (e) => {
        setDepartmentFilter(e.target.value);
        setPage(1);
    };

    const handleMonthFilter = (e) => {
        setMonthFilter(e.target.value);
        setPage(1);
    };

    const handleYearFilter = (e) => {
        setYearFilter(e.target.value);
        setPage(1);
    };

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setNewPayroll({ userId: '', month: '', year: '', monthSalary: '', totalSalary: '', note: '' });
    };

    const handleAddPayroll = async () => {
        if (!newPayroll.userId || !newPayroll.month || !newPayroll.year || !newPayroll.monthSalary || !newPayroll.totalSalary) {
            alert('Vui lòng điền đầy đủ thông tin.');
            return;
        }
        try {
            console.log('Adding new payroll:', newPayroll);
            await ApiService.createPayroll(newPayroll);
            const refreshed = monthFilter && yearFilter
                ? await ApiService.getSalariesByMonth(newPayroll.year, newPayroll.month)
                : await ApiService.getSalariesByQuarter(2025, 2);
            console.log('Refreshed payrolls:', refreshed);
            setPayrolls(refreshed);
            handleCloseDialog();
            alert('Thêm thông tin lương thành công!');
        } catch (err) {
            alert('Không thể thêm thông tin lương. Vui lòng thử lại.');
        }
    };

    const handleEditPayroll = (payrollId) => {
        window.location.href = `/manage/payroll/edit/${payrollId}`;
    };

    const handleOpenConfirmDialog = (payrollId) => {
        setSelectedPayrollId(payrollId);
        setConfirmDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            console.log('Deleting payroll ID:', selectedPayrollId);
            await ApiService.deletePayroll(selectedPayrollId);
            const refreshed = monthFilter && yearFilter
                ? await ApiService.getSalariesByMonth(yearFilter, monthFilter)
                : await ApiService.getSalariesByQuarter(2025, 2);
            console.log('Refreshed payrolls after deletion:', refreshed);
            setPayrolls(refreshed);
            alert('Xóa thông tin lương thành công!');
        } catch (err) {
            alert('Không thể xóa thông tin lương. Vui lòng thử lại.');
        } finally {
            setConfirmDialogOpen(false);
            setSelectedPayrollId(null);
        }
    };

    const filteredPayrolls = useMemo(() => payrolls.filter((payroll) => {
        const employee = employees.find(emp => emp.id === payroll.userId);
        const department = departments.find(dept => dept.groups.some(group => group.id === employee?.groupId));
        const matchesName = payroll.userFullName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = departmentFilter === '' || department?.id === parseInt(departmentFilter);
        return matchesName && matchesDept;
    }), [payrolls, employees, departments, searchTerm, departmentFilter]);

    const paginatedPayrolls = useMemo(() => {
        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        return filteredPayrolls.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredPayrolls, page]);

    const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

    if (loading) {
        return (
            <PageContainer>
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
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
        <PageContainer>
            <DashboardCard>
                {/* Header */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 3, gap: 2 }}>
                    <Typography variant="h5" fontWeight="bold">Quản lý lương</Typography>
                    <Button variant="contained" startIcon={<IconPlus />} onClick={handleOpenDialog} color="primary">Thêm lương</Button>
                </Box>

                {/* Filters */}
                <Paper elevation={1} sx={{ p: 2, mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <TextField
                        size="small"
                        placeholder="Tìm kiếm theo tên nhân viên..."
                        value={searchTerm}
                        onChange={handleSearch}
                        InputProps={{ startAdornment: (<InputAdornment position="start"><IconSearch size={18} /></InputAdornment>) }}
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

                {/* Table */}
                <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Tên nhân viên</strong></TableCell>
                                <TableCell><strong>Phòng ban - Nhóm</strong></TableCell>
                                <TableCell align="right"><strong>Lương cơ bản</strong></TableCell>
                                <TableCell align="right"><strong>Tổng lương</strong></TableCell>
                                <TableCell align="center"><strong>Trạng thái</strong></TableCell>
                                <TableCell align="center"><strong>Thao tác</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedPayrolls.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">Không có dữ liệu lương</TableCell>
                                </TableRow>
                            ) : (
                                paginatedPayrolls.map((payroll) => {
                                    const employee = employees.find(emp => emp.id === payroll.userId);
                                    const department = departments.find(dept => dept.groups.some(group => group.id === employee?.groupId));
                                    return (
                                        <TableRow key={payroll.id} hover>
                                            <TableCell>{payroll.userFullName}</TableCell>
                                            <TableCell>{department?.departmentName || 'N/A'} - {employee?.groupName || 'N/A'}</TableCell>
                                            <TableCell align="right">{formatCurrency(payroll.monthSalary ?? 0)}</TableCell>
                                            <TableCell align="right">{formatCurrency(payroll.totalSalary ?? 0)}</TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={payroll.note === 'Tiền lương đang được điều chỉnh' ? 'Điều chỉnh' : 'Ổn định'}
                                                    color={payroll.note === 'Tiền lương đang được điều chỉnh' ? 'warning' : 'success'}
                                                    size="small"
                                                    variant="outlined"
                                                    icon={payroll.note === 'Tiền lương đang được điều chỉnh' ? <IconEdit size={16} /> : <IconCheck size={16} />}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton onClick={() => handleEditPayroll(payroll.id)}><IconEdit size={20} /></IconButton>
                                                <IconButton onClick={() => handleOpenConfirmDialog(payroll.id)}><IconTrash size={20} /></IconButton>
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

                {/* Add Dialog */}
                <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
                    <DialogTitle>Thêm thông tin lương</DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                            <FormControl fullWidth>
                                <InputLabel>Nhân viên</InputLabel>
                                <Select
                                    value={newPayroll.userId}
                                    onChange={(e) => setNewPayroll({ ...newPayroll, userId: e.target.value })}
                                    label="Nhân viên"
                                >
                                    {employees.map((emp) => (
                                        <MenuItem key={emp.id} value={emp.id}>{emp.fullName}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <TextField
                                label="Tháng"
                                type="number"
                                fullWidth
                                value={newPayroll.month}
                                onChange={(e) => setNewPayroll({ ...newPayroll, month: e.target.value })}
                            />
                            <TextField
                                label="Năm"
                                type="number"
                                fullWidth
                                value={newPayroll.year}
                                onChange={(e) => setNewPayroll({ ...newPayroll, year: e.target.value })}
                            />
                            <TextField
                                label="Lương cơ bản (VNĐ)"
                                type="number"
                                fullWidth
                                value={newPayroll.monthSalary}
                                onChange={(e) => setNewPayroll({ ...newPayroll, monthSalary: e.target.value })}
                            />
                            <TextField
                                label="Tổng lương (VNĐ)"
                                type="number"
                                fullWidth
                                value={newPayroll.totalSalary}
                                onChange={(e) => setNewPayroll({ ...newPayroll, totalSalary: e.target.value })}
                            />
                            <TextField
                                label="Ghi chú"
                                fullWidth
                                value={newPayroll.note}
                                onChange={(e) => setNewPayroll({ ...newPayroll, note: e.target.value })}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Hủy</Button>
                        <Button onClick={handleAddPayroll} variant="contained">Thêm</Button>
                    </DialogActions>
                </Dialog>

                {/* Confirm Delete Dialog */}
                <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
                    <DialogTitle>Xác nhận xóa</DialogTitle>
                    <DialogContent>
                        <Typography>Bạn có chắc chắn muốn xóa thông tin lương này?</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setConfirmDialogOpen(false)}>Hủy</Button>
                        <Button onClick={handleConfirmDelete} color="error">Xóa</Button>
                    </DialogActions>
                </Dialog>
            </DashboardCard>
        </PageContainer>
    );
};

export default PayrollManagement;