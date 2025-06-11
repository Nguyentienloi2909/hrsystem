import React, { useState, useEffect, useMemo } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    IconButton, Box, Typography, Chip, CircularProgress, Alert, TablePagination
} from '@mui/material';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import AttendanceMiniTools from './components/AttendanceMiniTools';
import ApiService from '../../service/ApiService';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, addWeeks, subWeeks } from 'date-fns';
import { vi } from 'date-fns/locale';

const WeekAttendance = () => {
    const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage] = useState(10);

    const daysOfWeek = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

    // Use useMemo to memoize weekDays calculation
    const weekDays = useMemo(() => {
        return eachDayOfInterval({
            start: currentWeekStart,
            end: endOfWeek(currentWeekStart, { weekStartsOn: 1 })
        });
    }, [currentWeekStart]);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                setLoading(true);
                setError(null);
                const month = currentWeekStart.getMonth() + 1;
                const year = currentWeekStart.getFullYear();

                // SỬ DỤNG API LẤY TOÀN BỘ LỊCH SỬ CHẤM CÔNG
                const response = await ApiService.getAllAttendance(month, year);

                if (!Array.isArray(response)) {
                    throw new Error('Dữ liệu chấm công không hợp lệ');
                }

                // Group data by user
                const groupedData = response.reduce((acc, item) => {
                    if (!acc[item.userFullName]) {
                        acc[item.userFullName] = { userId: item.userId, days: {} };
                    }
                    const workday = new Date(item.workday);

                    // Chỉ lấy dữ liệu trong tuần hiện tại
                    const dayIndex = weekDays.findIndex(day =>
                        format(day, 'yyyy-MM-dd') === format(workday, 'yyyy-MM-dd')
                    );
                    if (dayIndex !== -1) {
                        acc[item.userFullName].days[dayIndex] = item.status;
                    }
                    return acc;
                }, {});

                setAttendanceData(Object.entries(groupedData));
            } catch (err) {
                setError(err.message || 'Không thể tải dữ liệu chấm công');
            } finally {
                setLoading(false);
            }
        };

        if (ApiService.isAdmin()) {
            fetchAttendance();
        } else {
            setError('Bạn không có quyền xem dữ liệu chấm công của tất cả nhân viên');
            setLoading(false);
        }
    }, [currentWeekStart]); // Remove weekDays from dependencies

    const handleWeekChange = (direction) => {
        console.log('Changing week:', direction);
        setCurrentWeekStart((prev) => {
            const newDate = direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1);
            console.log('New week start date:', format(newDate, 'yyyy-MM-dd'));
            return newDate;
        });
        setPage(0);
    };

    const handleChangePage = (event, newPage) => {
        console.log('Changing page to:', newPage);
        setPage(newPage);
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'Present': return 'Có mặt';
            case 'Late': return 'Đi muộn';
            case 'Pending': return 'Nghỉ';
            case 'Leave': return 'Nghỉ có phép';
            default: return 'N/A';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Present': return 'success';
            case 'Late': return 'error';
            case 'Pending': return 'default';
            case 'Leave': return 'warning';
            default: return 'default';
        }
    };

    if (loading) {
        return (
            <PageContainer title="Lịch sử chấm công tuần" description="Lịch sử chấm công tuần">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                    <CircularProgress />
                </Box>
            </PageContainer>
        );
    }

    if (error) {
        return (
            <PageContainer title="Lịch sử chấm công tuần" description="Lịch sử chấm công tuần">
                <Box sx={{ p: 3 }}>
                    <Alert severity="error">{error}</Alert>
                </Box>
            </PageContainer>
        );
    }

    return (
        <PageContainer title="Lịch sử chấm công tuần" description="Lịch sử chấm công tuần">
            <DashboardCard title="Lịch sử chấm công tuần">
                <AttendanceMiniTools />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <IconButton onClick={() => handleWeekChange('prev')}>
                        <IconChevronLeft />
                    </IconButton>
                    <Typography variant="h6">
                        Tuần từ {format(currentWeekStart, 'dd/MM/yyyy', { locale: vi })} đến {format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'dd/MM/yyyy', { locale: vi })}
                    </Typography>
                    <IconButton onClick={() => handleWeekChange('next')}>
                        <IconChevronRight />
                    </IconButton>
                </Box>
                <TableContainer component={Paper}>
                    <Table sx={{
                        minWidth: 650,
                        '& .MuiTableCell-root': {
                            border: '1px solid rgba(224, 224, 224, 1)',
                            padding: '8px'
                        },
                        '& .MuiTableHead-root': {
                            '& .MuiTableRow-root': {
                                backgroundColor: '#e3f2fd'
                            }
                        }
                    }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Nhân viên</TableCell>
                                {weekDays.map((day, index) => (
                                    <TableCell key={index} align="center">{daysOfWeek[index]}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {attendanceData
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map(([user, data]) => (
                                    <TableRow key={user}>
                                        <TableCell>{user}</TableCell>
                                        {weekDays.map((_, index) => (
                                            <TableCell key={index} align="center">
                                                {data.days[index] ? (
                                                    <Chip
                                                        label={getStatusLabel(data.days[index])}
                                                        color={getStatusColor(data.days[index])}
                                                        size="small"
                                                    />
                                                ) : (
                                                    '.'
                                                )}
                                            </TableCell>
                                        ))}
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
                        labelDisplayedRows={({ from, to, count }) => `${from}-${to} trên ${count}`}
                    />
                </TableContainer>
            </DashboardCard>
        </PageContainer>
    );
};

export default WeekAttendance;