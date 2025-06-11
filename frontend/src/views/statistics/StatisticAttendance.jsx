import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    CircularProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Chart from 'react-apexcharts';
import PageContainer from '../../components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import { IconDownload, IconArrowLeft } from '@tabler/icons-react';
import ApiService from '../../service/ApiService';

// Custom function to convert array to CSV string
const arrayToCSV = (data) => {
    return data
        .map((row) =>
            row
                .map((value) => {
                    const stringValue = String(value ?? '');
                    if (stringValue.includes(',') || stringValue.includes('"')) {
                        return `"${stringValue.replace(/"/g, '""')}"`;
                    }
                    return stringValue;
                })
                .join(',')
        )
        .join('\n');
};

const StatisticAttendance = () => {
    const [timeFilter, setTimeFilter] = useState('yearly');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const navigate = useNavigate();
    const theme = useTheme();
    const primary = theme.palette.primary.main;
    const secondary = theme.palette.secondary.main;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                let response;
                if (timeFilter === 'yearly') {
                    response = await ApiService.getTKAttendanceToYear(selectedYear);
                } else if (timeFilter === 'monthly') {
                    response = await ApiService.getTKAttendanceToMonth(selectedMonth, selectedYear);
                } else if (timeFilter === 'weekly') {
                    response = await ApiService.getTKAttendanceToWeek();
                } else {
                    throw new Error('Unsupported time filter');
                }

                console.log('API Response:', response); // Log dữ liệu trả về từ API

                // Giả lập dữ liệu monthlyData nếu API không cung cấp
                const monthlyData = response.monthlyData || Array.from({ length: 12 }, (_, i) => ({
                    month: i + 1,
                    presentCount: Math.floor((response.totalPresentDays || 0) / 12) + Math.floor(Math.random() * 5),
                    absentCount: Math.floor((response.totalAbsentDays || 0) / 12) + Math.floor(Math.random() * 5),
                    lateCount: Math.floor((response.totalLateDays || 0) / 12) + Math.floor(Math.random() * 5),
                    leaveCount: Math.floor((response.totalLeaveDays || 0) / 12) + Math.floor(Math.random() * 5),
                }));

                const formattedData = {
                    summary: {
                        totalPresentDays: response.totalPresentDays || 0,
                        totalAbsentDays: response.totalAbsentDays || 0,
                        totalLateDays: response.totalLateDays || 0,
                        totalLeaveDays: response.totalLeaveDays || 0,
                        totalOvertimeHours: response.totalOvertimeHours || 0,
                    },
                    lineData: {
                        categories: monthlyData.map((item) => `Tháng ${item.month}`),
                        series: [
                            {
                                name: 'Có mặt',
                                data: monthlyData.map((item) => item.presentCount),
                            },
                            {
                                name: 'Vắng',
                                data: monthlyData.map((item) => item.absentCount),
                            },
                            {
                                name: 'Đi muộn',
                                data: monthlyData.map((item) => item.lateCount),
                            },
                            {
                                name: 'Nghỉ phép',
                                data: monthlyData.map((item) => item.leaveCount),
                            },
                        ],
                    },
                    barData: {
                        categories: ['Có mặt', 'Vắng', 'Đi muộn', 'Nghỉ phép'],
                        series: [
                            {
                                name: 'Số ngày',
                                data: [
                                    response.totalPresentDays || 0,
                                    response.totalAbsentDays || 0,
                                    response.totalLateDays || 0,
                                    response.totalLeaveDays || 0,
                                ],
                            },
                        ],
                    },
                    pieData: [
                        { name: 'Có mặt', value: response.totalPresentDays || 0 },
                        { name: 'Vắng', value: response.totalAbsentDays || 0 },
                        { name: 'Đi muộn', value: response.totalLateDays || 0 },
                        { name: 'Nghỉ phép', value: response.totalLeaveDays || 0 },
                    ],
                };

                console.log('Formatted Data:', formattedData); // Log dữ liệu đã định dạng
                setData(formattedData);
            } catch (err) {
                console.error('Fetch Data Error:', err); // Log lỗi khi lấy dữ liệu
                setError(err.message || 'Không thể lấy dữ liệu');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [timeFilter, selectedMonth, selectedYear]);

    const handleTimeFilterChange = (event) => {
        setTimeFilter(event.target.value);
    };

    const handleExport = () => {
        if (!data) {
            console.log('No data to export'); // Log khi không có dữ liệu để xuất
            return;
        }

        const csvData = [
            ['Metric', 'Value'],
            ['Tổng ngày có mặt', data.summary?.totalPresentDays || '0'],
            ['Tổng ngày vắng', data.summary?.totalAbsentDays || '0'],
            ['Tổng ngày đi muộn', data.summary?.totalLateDays || '0'],
            ['Tổng ngày nghỉ phép', data.summary?.totalLeaveDays || '0'],
            ['Tổng giờ làm thêm', data.summary?.totalOvertimeHours || '0'],
        ];

        console.log('Export CSV Data:', csvData); // Log dữ liệu CSV trước khi xuất
        const csv = arrayToCSV(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'attendance_statistics.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleBack = () => {
        navigate('/manage/statistics');
    };

    const lineChartOptions = useMemo(() => {
        console.log('Line Chart Data:', data?.lineData); // Log dữ liệu biểu đồ đường
        return {
            chart: {
                type: 'line',
                toolbar: { show: true },
                animations: { enabled: true },
            },
            colors: [primary, secondary, theme.palette.warning.main, theme.palette.success.main],
            xaxis: {
                categories: data?.lineData?.categories || ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
                title: {
                    text: 'Thời gian',
                },
            },
            yaxis: {
                title: { text: 'Số ngày' },
                min: 0,
            },
            stroke: {
                curve: 'smooth', // Đường cong mượt mà
                width: 2,
            },
            dataLabels: {
                enabled: false, // Tắt nhãn dữ liệu để tránh chồng lấn
            },
            tooltip: {
                theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
            },
            legend: {
                position: 'top',
                horizontalAlign: 'center',
            },
        };
    }, [data, theme, primary, secondary]);

    const barChartOptions = useMemo(() => {
        console.log('Bar Chart Data:', data?.barData); // Log dữ liệu biểu đồ cột
        return {
            chart: {
                type: 'bar',
                toolbar: { show: true },
                animations: { enabled: true },
            },
            colors: [primary],
            xaxis: {
                categories: data?.barData?.categories || ['Có mặt', 'Vắng', 'Đi muộn', 'Nghỉ phép'],
                title: {
                    text: 'Trạng thái chấm công',
                },
            },
            yaxis: {
                title: { text: 'Số ngày' },
                min: 0,
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '55%',
                },
            },
            dataLabels: {
                enabled: false, // Tắt nhãn dữ liệu để tránh chồng lấn
            },
            tooltip: {
                theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
            },
            legend: {
                position: 'top',
                horizontalAlign: 'center',
            },
        };
    }, [data, theme, primary]);

    const pieChartOptions = useMemo(() => {
        console.log('Pie Chart Data:', data?.pieData); // Log dữ liệu biểu đồ tròn
        return {
            chart: {
                type: 'pie',
                toolbar: { show: true },
                animations: { enabled: true },
            },
            colors: [primary, secondary, theme.palette.warning.main, theme.palette.success.main],
            labels: data?.pieData?.map((item) => item.name) || ['Có mặt', 'Vắng', 'Đi muộn', 'Nghỉ phép'],
            legend: {
                position: 'bottom',
                horizontalAlign: 'center',
            },
            dataLabels: {
                enabled: true,
                formatter: (val, opts) => {
                    return `${opts.w.config.labels[opts.seriesIndex]}: ${val.toFixed(1)}%`;
                },
            },
            tooltip: {
                theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
            },
        };
    }, [data, theme, primary, secondary]);

    if (loading) {
        return (
            <PageContainer title="Thống kê chấm công" description="Xem thống kê chấm công nhân sự">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                    <CircularProgress />
                </Box>
            </PageContainer>
        );
    }

    if (error) {
        return (
            <PageContainer title="Thống kê chấm công" description="Xem thống kê chấm công nhân sự">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                    <Typography variant="h6" color="error">
                        {error}
                    </Typography>
                </Box>
            </PageContainer>
        );
    }

    return (
        <PageContainer title="Thống kê chấm công" description="Xem thống kê chấm công nhân sự">
            <DashboardCard>
                <Box sx={{ p: 3 }}>
                    <Button
                        variant="outlined"
                        startIcon={<IconArrowLeft aria-label="back icon" />}
                        onClick={handleBack}
                        sx={{
                            mb: 5,
                            fontSize: '0.95rem',
                            borderRadius: 1,
                            borderColor: '#1976d2',
                            color: '#1976d2',
                            '&:hover': {
                                backgroundColor: '#e3f2fd',
                                borderColor: '#1565c0',
                            },
                        }}
                        aria-label="Go back"
                    >
                        Trở lại
                    </Button>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a202c', mb: 1 }}>
                        Thống kê chấm công
                    </Typography>
                    <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 4 }}>
                        Phân tích dữ liệu chấm công theo trạng thái và thời gian
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
                        <FormControl sx={{ minWidth: 200 }}>
                            <InputLabel>Khoảng thời gian</InputLabel>
                            <Select value={timeFilter} onChange={handleTimeFilterChange} label="Khoảng thời gian">
                                <MenuItem value="monthly">Tháng</MenuItem>
                                {/* <MenuItem value="weekly">Hàng tuần</MenuItem> */}
                                <MenuItem value="yearly">Năm</MenuItem>
                            </Select>
                        </FormControl>
                        {timeFilter === 'monthly' && (
                            <>
                                <FormControl sx={{ minWidth: 120 }}>
                                    <InputLabel>Tháng</InputLabel>
                                    <Select
                                        value={selectedMonth}
                                        label="Tháng"
                                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                    >
                                        {[...Array(12)].map((_, i) => (
                                            <MenuItem key={i + 1} value={i + 1}>
                                                Tháng {i + 1}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <FormControl sx={{ minWidth: 120 }}>
                                    <InputLabel>Năm</InputLabel>
                                    <Select
                                        value={selectedYear}
                                        label="Năm"
                                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                                    >
                                        {Array.from({ length: 5 }, (_, i) => {
                                            const year = new Date().getFullYear() - i;
                                            return (
                                                <MenuItem key={year} value={year}>
                                                    {year}
                                                </MenuItem>
                                            );
                                        })}
                                    </Select>
                                </FormControl>
                            </>
                        )}
                        {/* Thêm thanh chọn năm khi xem thống kê năm */}
                        {timeFilter === 'yearly' && (
                            <FormControl sx={{ minWidth: 120 }}>
                                <InputLabel>Năm</InputLabel>
                                <Select
                                    value={selectedYear}
                                    label="Năm"
                                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                                >
                                    {Array.from({ length: 5 }, (_, i) => {
                                        const year = new Date().getFullYear() - i;
                                        return (
                                            <MenuItem key={year} value={year}>
                                                {year}
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                            </FormControl>
                        )}
                        <Button
                            variant="outlined"
                            startIcon={<IconDownload aria-label="download icon" />}
                            onClick={handleExport}
                            sx={{ ml: 'auto' }}
                            aria-label="Export data"
                        >
                            Xuất dữ liệu
                        </Button>
                    </Box>

                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6} md={2.4}>
                            <Card sx={{ backgroundColor: primary, color: '#fff' }}>
                                <CardContent>
                                    <Typography variant="h6">Tổng ngày có mặt</Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                        {data?.summary?.totalPresentDays || '0'}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2.4}>
                            <Card sx={{ backgroundColor: secondary, color: '#fff' }}>
                                <CardContent>
                                    <Typography variant="h6">Tổng ngày vắng</Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                        {data?.summary?.totalAbsentDays || '0'}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2.4}>
                            <Card sx={{ backgroundColor: theme.palette.warning.main, color: '#fff' }}>
                                <CardContent>
                                    <Typography variant="h6">Tổng ngày đi muộn</Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                        {data?.summary?.totalLateDays || '0'}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2.4}>
                            <Card sx={{ backgroundColor: theme.palette.success.main, color: '#fff' }}>
                                <CardContent>
                                    <Typography variant="h6">Tổng ngày nghỉ phép</Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                        {data?.summary?.totalLeaveDays || '0'}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2.4}>
                            <Card sx={{ backgroundColor: theme.palette.info.main, color: '#fff' }}>
                                <CardContent>
                                    <Typography variant="h6">Tổng giờ làm thêm</Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                        {data?.summary?.totalOvertimeHours || '0'} giờ
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Card sx={{ height: '450px' }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Phân bố chấm công theo trạng thái
                                    </Typography>
                                    {data?.pieData && data.pieData.length > 0 && data.pieData.some((item) => item.value > 0) ? (
                                        <Chart
                                            options={pieChartOptions}
                                            series={data.pieData.map((item) => item.value)}
                                            type="pie"
                                            height="400"
                                        />
                                    ) : (
                                        <Typography variant="body2" color="textSecondary">
                                            Không có dữ liệu để hiển thị phân bố chấm công
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Card sx={{ height: '450px' }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Số ngày chấm công theo trạng thái
                                    </Typography>
                                    {data?.barData?.series && data.barData.series.length > 0 ? (
                                        <Chart
                                            options={barChartOptions}
                                            series={data.barData.series}
                                            type="bar"
                                            height="350"
                                        />
                                    ) : (
                                        <Typography variant="body2" color="textSecondary">
                                            Không có dữ liệu để hiển thị số ngày chấm công
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12}>
                            <Card sx={{ height: '500px' }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Tổng quan chấm công
                                    </Typography>
                                    {data?.lineData?.series && data.lineData.series.length > 0 && data.lineData.series[0].data.length > 0 ? (
                                        <Chart
                                            options={lineChartOptions}
                                            series={data.lineData.series}
                                            type="line"
                                            height="350"
                                        />
                                    ) : (
                                        <Typography variant="body2" color="textSecondary">
                                            Không có dữ liệu để hiển thị tổng quan chấm công
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>
            </DashboardCard>
        </PageContainer>
    );
};

export default StatisticAttendance;
