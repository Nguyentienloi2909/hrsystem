import React, { useState, useEffect } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    IconButton, Box, Typography, Chip, CircularProgress, Alert, TablePagination, Tooltip
} from '@mui/material';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import AttendanceMiniTools from './components/AttendanceMiniTools';
import ApiService from '../../service/ApiService';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CheckCircle, AccessTime, RemoveCircle, EventBusy } from '@mui/icons-material';

const statusIcon = (status) => {
    switch (status) {
        case 'Present': return <CheckCircle color="success" fontSize="small" />;
        case 'Late': return <AccessTime color="error" fontSize="small" />;
        case 'Pending': return <RemoveCircle color="disabled" fontSize="small" />;
        case 'Leave': return <EventBusy color="warning" fontSize="small" />;
        default: return null;
    }
};

const statusBg = (status) => {
    switch (status) {
        case 'Present': return '#e3fceb';
        case 'Late': return '#ffeaea';
        case 'Pending': return '#f5f5f5';
        case 'Leave': return '#fff8e1';
        default: return 'transparent';
    }
};

const statusText = (status) => {
    switch (status) {
        case 'Present': return 'Có mặt';
        case 'Late': return 'Đi muộn';
        case 'Pending': return 'Nghỉ';
        case 'Leave': return 'Nghỉ phép';
        default: return '';
    }
};

const dayOfWeekShort = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const MonthAttendance = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage] = useState(10);

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                setLoading(true);
                setError(null);
                console.log('Fetching attendance data for:', { month: currentMonth + 1, year: currentYear });

                // SỬ DỤNG API MỚI ĐỂ LẤY TOÀN BỘ LỊCH SỬ CHẤM CÔNG
                const response = await ApiService.getAllAttendance(currentMonth + 1, currentYear);
                console.log('API Response:', response);

                if (!Array.isArray(response)) {
                    throw new Error('Dữ liệu chấm công không hợp lệ');
                }

                // Group data by user
                const groupedData = response.reduce((acc, item) => {
                    if (!acc[item.userFullName]) {
                        acc[item.userFullName] = { userId: item.userId, days: {} };
                    }
                    const date = new Date(item.workday).getDate();
                    acc[item.userFullName].days[date] = item.status;
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
    }, [currentMonth, currentYear]);

    const handleMonthChange = (direction) => {
        console.log('Changing month:', direction);
        setCurrentMonth((prevMonth) => {
            let newMonth = direction === 'next' ? prevMonth + 1 : prevMonth - 1;
            if (newMonth < 0) {
                newMonth = 11;
                console.log('Year decreased, new year:', currentYear - 1);
                setCurrentYear((prevYear) => prevYear - 1);
            } else if (newMonth > 11) {
                newMonth = 0;
                console.log('Year increased, new year:', currentYear + 1);
                setCurrentYear((prevYear) => prevYear + 1);
            }
            console.log('New month:', newMonth + 1);
            return newMonth;
        });
        setPage(0);
    };

    const handleChangePage = (event, newPage) => {
        console.log('Changing page to:', newPage);
        setPage(newPage);
    };

    if (loading) {
        return (
            <PageContainer title="Lịch sử chấm công tháng" description="Lịch sử chấm công tháng">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                    <CircularProgress />
                </Box>
            </PageContainer>
        );
    }

    if (error) {
        return (
            <PageContainer title="Lịch sử chấm công tháng" description="Lịch sử chấm công tháng">
                <Box sx={{ p: 3 }}>
                    <Alert severity="error">{error}</Alert>
                </Box>
            </PageContainer>
        );
    }

    return (
        <PageContainer title="Lịch sử chấm công tháng" description="Lịch sử chấm công tháng">
            <DashboardCard title="Lịch sử chấm công tháng">
                <AttendanceMiniTools />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <IconButton onClick={() => handleMonthChange('prev')}>
                        <IconChevronLeft />
                    </IconButton>
                    <Typography variant="h6">
                        Tháng {currentMonth + 1} Năm {currentYear}
                    </Typography>
                    <IconButton onClick={() => handleMonthChange('next')}>
                        <IconChevronRight />
                    </IconButton>
                </Box>
                {/*
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 18, height: 18, bgcolor: '#e3fceb', borderRadius: 1, border: '1px solid #b2dfdb' }} />
                        <Typography variant="caption">Có mặt</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 18, height: 18, bgcolor: '#ffeaea', borderRadius: 1, border: '1px solid #ffcdd2' }} />
                        <Typography variant="caption">Đi muộn</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 18, height: 18, bgcolor: '#f5f5f5', borderRadius: 1, border: '1px solid #e0e0e0' }} />
                        <Typography variant="caption">Nghỉ</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 18, height: 18, bgcolor: '#fff8e1', borderRadius: 1, border: '1px solid #ffe082' }} />
                        <Typography variant="caption">Nghỉ phép</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 18, height: 18, bgcolor: '#f5f5f5', borderRadius: 1, border: '1px solid #e0e0e0' }} />
                        <Typography variant="caption" sx={{ color: '#bdbdbd' }}>Cuối tuần</Typography>
                    </Box>
                </Box>
                */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box
                            sx={{
                                width: 18,
                                height: 18,
                                bgcolor: '#e3fceb',
                                borderRadius: 1,
                                border: '1px solid #b2dfdb',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mr: 0.5,
                            }}
                        >
                            <CheckCircle color="success" fontSize="small" />
                        </Box>
                        <Typography variant="caption">Có mặt</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box
                            sx={{
                                width: 18,
                                height: 18,
                                bgcolor: '#ffeaea',
                                borderRadius: 1,
                                border: '1px solid #ffcdd2',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mr: 0.5,
                            }}
                        >
                            <AccessTime color="error" fontSize="small" />
                        </Box>
                        <Typography variant="caption">Đi muộn</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box
                            sx={{
                                width: 18,
                                height: 18,
                                bgcolor: '#f5f5f5',
                                borderRadius: 1,
                                border: '1px solid #e0e0e0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mr: 0.5,
                            }}
                        >
                            <RemoveCircle color="disabled" fontSize="small" />
                        </Box>
                        <Typography variant="caption">Nghỉ</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box
                            sx={{
                                width: 18,
                                height: 18,
                                bgcolor: '#fff8e1',
                                borderRadius: 1,
                                border: '1px solid #ffe082',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mr: 0.5,
                            }}
                        >
                            <EventBusy color="warning" fontSize="small" />
                        </Box>
                        <Typography variant="caption">Nghỉ phép</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box
                            sx={{
                                width: 18,
                                height: 18,
                                bgcolor: '#f5f5f5',
                                borderRadius: 1,
                                border: '1px solid #e0e0e0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mr: 0.5,
                            }}
                        >
                            <Typography variant="caption" sx={{ color: '#bdbdbd', fontSize: 14, fontWeight: 700 }}>-</Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: '#bdbdbd' }}>Cuối tuần</Typography>
                    </Box>
                </Box>
                <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3 }}>
                    <Table sx={{
                        minWidth: 650,
                        '& .MuiTableCell-root': {
                            border: '1px solid #e0e0e0',
                            padding: '6px',
                        },
                        '& .MuiTableHead-root .MuiTableRow-root': {
                            backgroundColor: '#e3f2fd'
                        }
                    }}>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, minWidth: 120, bgcolor: '#f5f5f5' }}>Nhân viên</TableCell>
                                {Array.from({ length: daysInMonth }, (_, i) => {
                                    const date = new Date(currentYear, currentMonth, i + 1);
                                    const day = date.getDay();
                                    return (
                                        <TableCell
                                            key={i}
                                            align="center"
                                            sx={{
                                                bgcolor: day === 0 ? '#f5f5f5' : undefined, // Chỉ CN mới tô xám
                                                color: day === 0 ? '#bdbdbd' : undefined,   // Chỉ CN mới mờ
                                                fontWeight: 600,
                                                fontSize: '0.95rem',
                                                minWidth: 36,
                                                p: 0.5,
                                            }}
                                        >
                                            {i + 1}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {attendanceData
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map(([user, data], idx) => (
                                    <TableRow
                                        key={user}
                                        sx={{
                                            bgcolor: idx % 2 === 0 ? '#fafbfc' : '#f5f7fa',
                                            '&:hover': { bgcolor: '#e3f2fd' }
                                        }}
                                    >
                                        <TableCell sx={{ fontWeight: 500 }}>{user}</TableCell>
                                        {Array.from({ length: daysInMonth }, (_, i) => {
                                            const status = data.days[i + 1];
                                            const date = new Date(currentYear, currentMonth, i + 1);
                                            const day = date.getDay();
                                            const isSunday = day === 0;
                                            return (
                                                <TableCell
                                                    key={i}
                                                    align="center"
                                                    sx={{
                                                        bgcolor: isSunday
                                                            ? '#f5f5f5'
                                                            : status
                                                                ? statusBg(status)
                                                                : undefined,
                                                        color: isSunday ? '#bdbdbd' : undefined,
                                                        borderRadius: 1,
                                                        p: 0.5,
                                                    }}
                                                >
                                                    {isSunday ? (
                                                        <span style={{ color: '#bdbdbd' }}>–</span>
                                                    ) : status ? (
                                                        <Tooltip title={statusText(status)}>
                                                            <span>{statusIcon(status)}</span>
                                                        </Tooltip>
                                                    ) : (
                                                        <span style={{ color: '#bbb' }}>–</span>
                                                    )}
                                                </TableCell>
                                            );
                                        })}
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

export default MonthAttendance;