import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
    CircularProgress,
    Typography,
    Box
} from '@mui/material';
import ApiService from '../../service/ApiService';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import EmployeeMiniTools from './components/EmployeeminiTools';
import EmployeeFilterToolbar from './components/EmployeeFilterToolbar';

const tableStyles = {
    minWidth: 650,
    '& .MuiTableCell-root': {
        border: '1px solid rgba(224, 224, 224, 1)',
        padding: '16px'
    },
    '& .MuiTableHead-root .MuiTableRow-root': {
        backgroundColor: '#e3f2fd'
    },
    '& .MuiTableBody-root .MuiTableRow-root': {
        '&:nth-of-type(odd)': {
            backgroundColor: '#fafafa'
        },
        '&:nth-of-type(even)': {
            backgroundColor: '#ffffff'
        },
        '&:hover': {
            backgroundColor: '#f5f5f5',
            cursor: 'pointer'
        }
    }
};

const tableHeaders = [
    { id: 'id', label: 'ID', align: 'center' },
    { id: 'fullName', label: 'Họ và tên', align: 'center' },
    { id: 'gender', label: 'Giới tính', align: 'center' },
    { id: 'roleName', label: 'Chức vụ', align: 'center' },
    { id: 'groupName', label: 'Phòng ban', align: 'center' },
    { id: 'phoneNumber', label: 'Số điện thoại', align: 'center' },
    { id: 'email', label: 'Email', align: 'center' }
];

const getGenderDisplay = (gender) => {
    if (gender === true) return 'Nam';
    if (gender === false) return 'Nữ';
    return 'N/A';
};

const Employees = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage] = useState(10);
    const [allEmployees, setAllEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({ name: '', role: '', department: '' });
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;
        const fetchEmployees = async () => {
            try {
                setLoading(true);
                const response = await ApiService.getAllUsers();
                if (isMounted) {
                    setAllEmployees(response);
                    setError(null);
                }
            } catch (error) {
                if (isMounted) {
                    setError(error.response?.data?.message || error.message || 'Failed to load employees');
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchEmployees();
        return () => { isMounted = false; };
    }, []);

    // useMemo để lọc employees hiệu quả
    const filteredEmployees = useMemo(() => {
        return allEmployees.filter(employee =>
            (filters.name === '' || (employee.fullName || '').toLowerCase().includes(filters.name.toLowerCase())) &&
            (filters.role === '' || (employee.roleName || '').toLowerCase() === filters.role.toLowerCase()) &&
            (filters.department === '' || String(employee.groupId || '') === filters.department)
        );
    }, [filters, allEmployees]);

    // Reset page về 0 khi filter thay đổi
    useEffect(() => {
        setPage(0);
    }, [filters]);

    const handleChangePage = useCallback((event, newPage) => {
        setPage(newPage);
    }, []);

    const handleEmployeeClick = useCallback((employeeId) => {
        navigate(`/manage/employee/info/${employeeId}`);
    }, [navigate]);

    if (loading) return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
            <CircularProgress />
        </Box>
    );
    if (error) return <Typography color="error" align="center" mt={4}>{error}</Typography>;

    return (
        <PageContainer title="Danh sách nhân viên" description="Quản lý danh sách nhân viên">
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <DashboardCard title="Quản lý nhân viên">
                        <EmployeeFilterToolbar onFilterChange={setFilters} />
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            {filteredEmployees.length} nhân viên được tìm thấy
                        </Typography>
                        <TableContainer component={Paper}>
                            <Table sx={tableStyles} aria-label="employee table">
                                <TableHead>
                                    <TableRow>
                                        {tableHeaders.map((header) => (
                                            <TableCell key={header.id} align={header.align}>
                                                {header.label}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredEmployees.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={tableHeaders.length} align="center">
                                                Không có bản ghi nào
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredEmployees
                                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                            .map((employee) => (
                                                <TableRow
                                                    key={employee.id}
                                                    onClick={() => handleEmployeeClick(employee.id)}
                                                >
                                                    <TableCell align="center">{employee.id}</TableCell>
                                                    <TableCell>{employee.fullName || '-----'}</TableCell>
                                                    <TableCell align="center">{getGenderDisplay(employee.gender) || '-----'}</TableCell>
                                                    <TableCell align="center">{employee.roleName || '-----'}</TableCell>
                                                    <TableCell align="center">{employee.groupName || '-----'}</TableCell>
                                                    <TableCell align="center">{employee.phoneNumber || '-----'}</TableCell>
                                                    <TableCell align="center">{employee.email || '-----'}</TableCell>
                                                </TableRow>
                                            ))
                                    )}
                                </TableBody>
                            </Table>
                            <TablePagination
                                component="div"
                                count={filteredEmployees.length}
                                page={page}
                                onPageChange={handleChangePage}
                                rowsPerPage={rowsPerPage}
                                rowsPerPageOptions={[10]}
                                labelDisplayedRows={({ from, to, count }) =>
                                    `${from}-${to} trên ${count}`
                                }
                            />
                        </TableContainer>
                    </DashboardCard>
                </Grid>
            </Grid>
        </PageContainer>
    );
};

export default Employees;
