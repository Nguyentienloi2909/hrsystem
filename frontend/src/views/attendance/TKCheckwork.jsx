import React, { useState, useEffect } from 'react';
import {
    Box, Typography, IconButton, Grid, Card, CardContent,
    Dialog, DialogActions, DialogContent, DialogContentText,
    DialogTitle, Button, CircularProgress, Alert,
} from '@mui/material';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    Legend, PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';
import PageContainer from '../../components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import CheckTools from './components/CheckTools';
import ApiService from '../../service/ApiService';
import { useUser } from '../../contexts/UserContext';

const COLORS = ['#4caf50', '#f44336', '#ff9800', '#2196f3'];

const isWeekday = (date) => {
    const day = getDay(date);
    return day !== 0 && day !== 6; // Monday–Friday
};

const getTotalWeekdays = (date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const days = eachDayOfInterval({ start, end });
    return days.filter(day => isWeekday(day)).length;
};

const TKCheckwork = () => {
    const { user } = useUser();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [monthlyStats, setMonthlyStats] = useState(null);
    const [pieData, setPieData] = useState([]);
    const [barData, setBarData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [actionType, setActionType] = useState('');
    const [showLoading, setShowLoading] = useState(false);

    useEffect(() => {
        let timer;
        if (loading) {
            setShowLoading(true);
        } else {
            timer = setTimeout(() => setShowLoading(false), 1000); // đảm bảo loading hiển thị ít nhất 0.2s
        }
        return () => clearTimeout(timer);
    }, [loading]);

    useEffect(() => {
        const fetchAttendanceData = async () => {
            // Kiểm tra trạng thái đăng nhập và userId
            if (!user.isAuthenticated || !user.userId) {
                setError('Vui lòng đăng nhập để xem dữ liệu chấm công.');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            const month = currentDate.getMonth() + 1; // 1-based
            const year = currentDate.getFullYear();

            try {
                // Gọi các API với userId từ UserContext
                const [rawAttendance, monthlyResponse, weeklyResponse] = await Promise.all([
                    ApiService.getAttendance(month, year),
                    ApiService.getAttendanceSummaryMonthly(user.userId, month, year),
                    ApiService.getTKAttendanceToWeekByUserId(user.userId, month, year),
                ]);

                console.log('rawAttendance:', rawAttendance);
                console.log('monthlyResponse:', monthlyResponse);
                console.log('weeklyResponse:', weeklyResponse);

                const processedStats = processAttendanceData(rawAttendance, monthlyResponse);
                setMonthlyStats(processedStats);

                setPieData([
                    { name: 'Đúng giờ', value: processedStats.onTimeDays },
                    { name: 'Đi muộn', value: processedStats.lateDays },
                    { name: 'Có phép', value: processedStats.earlyLeaveDays },
                    { name: 'Vắng', value: processedStats.absentDays },
                ]);

                const newBarData = weeklyResponse.map(week => ({
                    name: `Tuần ${week.weekNumber}`,
                    onTime: Math.max(0, (week.totalPresentDays || 0) - (week.totalLateDays || 0)),
                    late: week.totalLateDays || 0,
                    early: week.totalLeaveDays || 0, // Sửa early thành totalLeaveDays
                    absent: week.totalAbsentDays || 0,
                }));
                setBarData(newBarData);
            } catch (err) {
                let errMsg = '';
                if (typeof err === 'string') {
                    errMsg = err;
                } else if (err && err.message) {
                    errMsg = err.message;
                } else {
                    errMsg = JSON.stringify(err);
                }
                setError(errMsg);
            } finally {
                setLoading(false);
            }
        };

        fetchAttendanceData();
    }, [currentDate, user.isAuthenticated, user.userId]);

    const processAttendanceData = (rawAttendance, monthlyResponse) => {
        const totalDays = getTotalWeekdays(currentDate);
        let workDays = 0;
        let lateDays = 0;
        let earlyLeaveDays = 0;
        let absentDays = 0;

        // Process raw attendance records
        rawAttendance.forEach(record => {
            if (record.status === 'Present') {
                workDays++;
            } else if (record.status === 'Late') {
                workDays++;
                lateDays++;
            } else if (record.status === 'Pending') {
                absentDays++;
            }
        });

        // Validate and merge with monthly response
        workDays = Math.max(workDays, monthlyResponse.totalPresentDays || 0);
        lateDays = Math.min(lateDays, workDays, monthlyResponse.totalLateDays || 0);
        earlyLeaveDays = monthlyResponse.totalLeaveDays || 0;
        absentDays = Math.max(absentDays, monthlyResponse.totalAbsentDays || 0);

        const onTimeDays = Math.max(0, workDays - lateDays);
        const workHours = workDays * 8;

        return {
            totalDays,
            workDays,
            lateDays,
            earlyLeaveDays,
            absentDays,
            onTimeDays,
            workHours,
        };
    };

    const handleMonthChange = (direction) => {
        setCurrentDate(direction === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
    };

    const handleCheckIn = () => {
        setActionType('Check-in');
        setOpenDialog(true);
    };

    const handleCheckOut = () => {
        setActionType('Check-out');
        setOpenDialog(true);
    };

    const handleConfirm = async () => {
        setOpenDialog(false);
        try {
            if (actionType === 'Check-in') {
                await ApiService.checkIn();
            } else {
                await ApiService.checkOut();
            }
        } catch (err) {
            setError(`Lỗi khi thực hiện ${actionType}: ${err.message}`);
        }
    };

    if (!user.isAuthenticated || !user.userId) {
        return (
            <PageContainer title="Thống kê chấm công" description="Xem thống kê chấm công">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', p: 3 }}>
                    <Alert severity="warning">Vui lòng đăng nhập để xem dữ liệu chấm công.</Alert>
                </Box>
            </PageContainer>
        );
    }

    if (showLoading) {
        return (
            <PageContainer title="Thống kê chấm công" description="Xem thống kê chấm công">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
                    <CircularProgress size={60} />
                    <Typography variant="h6" ml={2}>Đang tải dữ liệu...</Typography>
                </Box>
            </PageContainer>
        );
    }

    // Không return khi có error, chỉ hiển thị Alert phía trên giao diện
    const errStr = typeof error === 'string' ? error : JSON.stringify(error);
    const isNoData = errStr.toLowerCase().includes('not found') || errStr.toLowerCase().includes('không có') || errStr.toLowerCase().includes('404');

    return (
        <PageContainer title="Thống kê chấm công" description="Xem thống kê chấm công">
            <DashboardCard>
                <Box mb={3}>
                    <CheckTools onCheckIn={handleCheckIn} onCheckOut={handleCheckOut} />
                </Box>

                <Box sx={{ p: 4, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                    {/* Thanh tiêu đề và chuyển tháng */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h5" sx={{ color: '#2c3e50' }}>
                            Thống kê chấm công tháng
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <IconButton onClick={() => handleMonthChange('prev')} aria-label="Tháng trước">
                                <IconChevronLeft />
                            </IconButton>
                            <Typography variant="h6" sx={{ minWidth: 200, textAlign: 'center', fontWeight: 500 }}>
                                {format(currentDate, 'MMMM yyyy', { locale: vi })}
                            </Typography>
                            <IconButton onClick={() => handleMonthChange('next')} aria-label="Tháng sau">
                                <IconChevronRight />
                            </IconButton>
                        </Box>
                    </Box>

                    {/* Hiển thị alert lỗi nếu có */}
                    {error && (
                        <Box
                            mb={2}
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                minHeight: 180,
                                textAlign: 'center'
                            }}
                        >
                            <Alert severity={isNoData ? "info" : "error"}>
                                {isNoData ? "Chưa có dữ liệu chấm công cho tháng này." : errStr}
                            </Alert>
                        </Box>
                    )}

                    {/* Chỉ hiển thị biểu đồ/thống kê khi không có lỗi */}
                    {!error && monthlyStats && (
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Card elevation={3}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>Tổng quan</Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                            <Typography>Tổng ngày làm việc: {monthlyStats.workDays}/{monthlyStats.totalDays}</Typography>
                                            <Typography color="success.main">Đúng giờ: {monthlyStats.onTimeDays} ngày</Typography>
                                            <Typography color="error.main">Đi muộn: {monthlyStats.lateDays} ngày</Typography>
                                            <Typography color="warning.main">Có phép: {monthlyStats.earlyLeaveDays} ngày</Typography>
                                            <Typography color="info.main">Vắng: {monthlyStats.absentDays} ngày</Typography>
                                            <Typography>Tổng giờ làm: {monthlyStats.workHours} giờ</Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Card elevation={3}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>Tỷ lệ chấm công</Typography>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <PieChart>
                                                <Pie
                                                    data={pieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={100}
                                                    fill="#8884d8"
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    label={({ name, value }) => `${name}: ${value}`}
                                                >
                                                    {pieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(value, name) => [`${value} ngày`, name]} />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12}>
                                <Card elevation={3}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>Thống kê theo tuần</Typography>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis label={{ value: 'Số ngày', angle: -90, position: 'insideLeft' }} />
                                                <Tooltip formatter={(value, name) => [`${value} ngày`, name]} />
                                                <Legend />
                                                <Bar dataKey="onTime" name="Đúng giờ" fill="#4caf50" />
                                                <Bar dataKey="late" name="Đi muộn" fill="#f44336" />
                                                <Bar dataKey="early" name="Có phép" fill="#ff9800" />
                                                <Bar dataKey="absent" name="Vắng" fill="#2196f3" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    )}
                </Box>
            </DashboardCard>
        </PageContainer>
    );
};

export default TKCheckwork;