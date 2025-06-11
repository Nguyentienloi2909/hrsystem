import React, { useState, useEffect } from 'react';
import {
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination
} from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import AttendanceMiniTools from './components/AttendanceMiniTools'; // Ensure this import is present
import ApiService from '../../service/ApiService';

const Attendance = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage] = useState(10);
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                setLoading(true);
                const response = await ApiService.getTodayAttendance();
                setAttendanceData(response);
            } catch (error) {
                setError(error.response?.data?.message || error.message || 'Failed to load attendance data');
            } finally {
                setLoading(false);
            }
        };

        fetchAttendance();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    return (
        <PageContainer title="Quản lý chấm công" description="Quản lý chấm công nhân viên">
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <DashboardCard title="Bảng chấm công">
                        <AttendanceMiniTools /> {/* Add the tool here */}
                        <TableContainer component={Paper}>
                            <Table
                                sx={{
                                    minWidth: 650,
                                    '& .MuiTableCell-root': {
                                        border: '1px solid rgba(224, 224, 224, 1)',
                                        padding: '16px'
                                    },
                                    '& .MuiTableHead-root': {
                                        '& .MuiTableRow-root': {
                                            backgroundColor: '#e3f2fd'
                                        }
                                    },
                                    '& .MuiTableBody-root': {
                                        '& .MuiTableRow-root': {
                                            '&:nth-of-type(odd)': {
                                                backgroundColor: '#fafafa'
                                            },
                                            '&:nth-of-type(even)': {
                                                backgroundColor: '#ffffff'
                                            },
                                            '&:hover': {
                                                backgroundColor: '#f5f5f5'
                                            }
                                        }
                                    }
                                }}
                            >
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Mã NV</TableCell>
                                        <TableCell>Họ và tên</TableCell>
                                        <TableCell>Ngày</TableCell>
                                        <TableCell>Giờ vào</TableCell>
                                        <TableCell>Giờ ra</TableCell>
                                        <TableCell>Trạng thái</TableCell>
                                        <TableCell>Tăng ca (giờ)</TableCell>
                                        <TableCell>Ghi chú</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {attendanceData
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((row) => (
                                            <TableRow key={row.id}>
                                                <TableCell>{row.userId}</TableCell>
                                                <TableCell>{row.userFullName}</TableCell>
                                                <TableCell>
                                                    {row.workday ? new Date(row.workday).toLocaleDateString() : 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    {row.checkIn ? new Date(row.checkIn).toLocaleTimeString() : 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    {row.checkOut ? new Date(row.checkOut).toLocaleTimeString() : 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    {
                                                        row.status === 'Pending' ? 'Chưa có mặt' :
                                                            row.status === 'Present' ? 'Có mặt' :
                                                                row.status === 'Absent' ? 'Nghỉ' :
                                                                    row.status === 'Leave' ? 'Nghỉ có phép' : 'N/A'}
                                                </TableCell>
                                                <TableCell>{row.overtime}</TableCell>
                                                <TableCell>{row.note}</TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                            <TablePagination
                                component="div"
                                count={attendanceData.length}
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

export default Attendance;