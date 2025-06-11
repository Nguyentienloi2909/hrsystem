import React, { useState, useEffect } from 'react';
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
import PageContainer from '../../components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import {
    IconArrowLeft,
    IconDownload,
    IconCurrencyDollar,
    IconTrendingUp,
    IconTrendingDown,
    IconUsers,
} from '@tabler/icons-react';
import ApiService from '../../service/ApiService';
import Chart from 'react-apexcharts';

const StatisticPayroll = () => {
    const now = new Date();
    // Tính tháng và năm lùi 1 tháng so với hiện tại
    let defaultMonth = now.getMonth(); // getMonth() trả về 0-11, nên tháng hiện tại là getMonth()+1
    let defaultYear = now.getFullYear();
    if (defaultMonth === 0) { // Nếu là tháng 1 thì lùi về tháng 12 năm trước
        defaultMonth = 12;
        defaultYear = defaultYear - 1;
    }
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [timeFilter, setTimeFilter] = useState('yearly');
    const [month, setMonth] = useState(defaultMonth); // mặc định là tháng trước
    const [year, setYear] = useState(defaultYear);   // mặc định là năm đúng với tháng trước
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [apiData, setApiData] = useState(null);
    const theme = useTheme();
    const navigate = useNavigate();

    const currencyFormat = (num) =>
        num?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

    useEffect(() => {
        setLoading(true);
        setError(null);
        setApiData(null);
        console.log('Gọi API getStatisticSalary với:', { month, year });
        ApiService.getStatisticSalary(month, year)
            .then((data) => {
                console.log('Kết quả trả về từ API:', data);
                setApiData(data);
            })
            .catch((err) => {
                console.log('Lỗi API:', err);
                if (err?.response?.status === 404) {
                    setError('Không có dữ liệu cho tháng/năm này.');
                } else {
                    setError('Không thể tải dữ liệu thống kê lương.');
                }
            })
            .finally(() => setLoading(false));
    }, [categoryFilter, timeFilter, month, year]);

    const handleCategoryFilterChange = (e) => {
        setCategoryFilter(e.target.value);
    };

    const handleTimeFilterChange = (e) => {
        setTimeFilter(e.target.value);
    };

    const handleMonthChange = (e) => {
        const value = Number(e.target.value);
        console.log('Thay đổi tháng:', value);
        setMonth(value);
    };

    const handleYearChange = (e) => {
        const value = Number(e.target.value);
        console.log('Thay đổi năm:', value);
        setYear(value);
    };

    const handleExport = () => {
        console.log('Exporting payroll statistics...');
    };

    const handleBack = () => {
        navigate('/manage/statistics');
    };

    // Tạo danh sách năm (5 năm gần đây)
    const yearOptions = [];
    for (let y = now.getFullYear(); y >= now.getFullYear() - 4; y--) {
        yearOptions.push(y);
    }

    // Tạo danh sách tháng
    const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

    // Bar chart options và series cho dữ liệu 1 tháng
    const barChartOptions = {
        chart: { type: 'bar' },
        xaxis: {
            categories: ['Tổng quỹ lương', 'Lương trung bình', 'Lương cao nhất', 'Lương thấp nhất'],
        },
        yaxis: {
            labels: { formatter: val => `${(val / 1_000_000).toFixed(1)}tr` },
            title: { text: 'VNĐ' }
        },
        tooltip: {
            y: { formatter: val => val.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) }
        },
        dataLabels: {
            enabled: true,
            formatter: val => val.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
            offsetY: -25, // Di chuyển nhãn dữ liệu lên trên cột
            style: {
                fontSize: '14px',
                colors: ['#222']
            },
            position: 'top', // Hiển thị trên đầu cột
        },
        plotOptions: {
            bar: {
                dataLabels: {
                    position: 'top', // Hiển thị trên đầu cột
                },
            },
        },
    };
    const barChartSeries = [{
        name: `Tháng ${apiData?.month}/${apiData?.year}`,
        data: [
            apiData?.totalSalary ?? 0,
            apiData?.averageSalary ?? 0,
            apiData?.maxSalary ?? 0,
            apiData?.minSalary ?? 0
        ]
    }];

    if (loading) {
        return (
            <PageContainer title="Thống kê bảng lương" description="Đang tải dữ liệu...">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
                    <CircularProgress />
                </Box>
            </PageContainer>
        );
    }

    return (
        <PageContainer title="Thống kê bảng lương" description="Phân tích lương theo danh mục và thời gian">
            <DashboardCard>
                <Box sx={{ p: 4 }}>
                    <Button
                        variant="outlined"
                        startIcon={<IconArrowLeft />}
                        onClick={handleBack}
                        sx={{
                            mb: 4,
                            fontSize: '0.95rem',
                            borderColor: '#1976d2',
                            color: '#1976d2',
                            '&:hover': {
                                backgroundColor: '#e3f2fd',
                                borderColor: '#1565c0',
                            },
                        }}
                    >
                        Trở lại
                    </Button>

                    <Typography variant="h4" fontWeight={700} mb={1}>
                        Thống kê bảng lương
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" mb={4}>
                        Phân tích chi tiết về quỹ lương, lương trung bình và theo phòng ban
                    </Typography>

                    {/* Filters */}
                    <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
                        <FormControl sx={{ minWidth: 120 }}>
                            <InputLabel>Tháng</InputLabel>
                            <Select value={month} onChange={handleMonthChange} label="Tháng">
                                {monthOptions.map((m) => (
                                    <MenuItem key={m} value={m}>{m}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl sx={{ minWidth: 120 }}>
                            <InputLabel>Năm</InputLabel>
                            <Select value={year} onChange={handleYearChange} label="Năm">
                                {yearOptions.map((y) => (
                                    <MenuItem key={y} value={y}>{y}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Button variant="outlined" startIcon={<IconDownload />} onClick={handleExport}>
                            Xuất dữ liệu
                        </Button>
                    </Box>

                    {/* Nội dung: Nếu có lỗi thì hiển thị lỗi, không thì hiển thị card thống kê và biểu đồ */}
                    {error ? (
                        <Box sx={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography color="error" variant="h6">{error}</Typography>
                        </Box>
                    ) : (
                        <>
                            <Grid container spacing={3} sx={{ mb: 4 }}>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Card sx={{ backgroundColor: theme.palette.primary.main, color: '#fff' }}>
                                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <IconCurrencyDollar size={32} />
                                            <Box>
                                                <Typography>Tổng quỹ lương</Typography>
                                                <Typography variant="h5" fontWeight={700}>
                                                    {apiData ? currencyFormat(apiData.totalSalary) : 'N/A'}
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Card sx={{ backgroundColor: theme.palette.secondary.main, color: '#fff' }}>
                                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <IconUsers size={32} />
                                            <Box>
                                                <Typography>Lương trung bình</Typography>
                                                <Typography variant="h5" fontWeight={700}>
                                                    {apiData ? currencyFormat(apiData.averageSalary) : 'N/A'}
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Card sx={{ backgroundColor: theme.palette.success.main, color: '#fff' }}>
                                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <IconTrendingUp size={32} />
                                            <Box>
                                                <Typography>Lương cao nhất</Typography>
                                                <Typography variant="h5" fontWeight={700}>
                                                    {apiData ? currencyFormat(apiData.maxSalary) : 'N/A'}
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Card sx={{ backgroundColor: theme.palette.error.main, color: '#fff' }}>
                                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <IconTrendingDown size={32} />
                                            <Box>
                                                <Typography>Lương thấp nhất</Typography>
                                                <Typography variant="h5" fontWeight={700}>
                                                    {apiData ? currencyFormat(apiData.minSalary) : 'N/A'}
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                            {/* Bar Chart so sánh các chỉ số lương */}
                            <Card sx={{ mb: 4 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        So sánh các chỉ số lương tháng {apiData?.month}/{apiData?.year}
                                    </Typography>
                                    <Chart
                                        options={barChartOptions}
                                        series={barChartSeries}
                                        type="bar"
                                        height={350}
                                    />
                                </CardContent>
                            </Card>
                        </>
                    )}
                </Box>
            </DashboardCard>
        </PageContainer>
    );
};

export default StatisticPayroll;
