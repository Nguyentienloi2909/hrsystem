import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    CircularProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Chart from 'react-apexcharts';
import PageContainer from '../../components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import { IconUsers, IconSwitchHorizontal, IconClock, IconArrowLeft, IconDownload } from '@tabler/icons-react';
import ApiService from '../../service/ApiService';

const StatisticEmployee = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [apiData, setApiData] = useState(null);
    const theme = useTheme();
    const navigate = useNavigate();

    // Fetch data from API
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await ApiService.getStatisticEmployee();
                console.log('API getStatisticEmployee result:', data);
                setApiData(data);
            } catch (err) {
                console.error("Failed to fetch employee statistics:", err);
                setError('Không thể tải dữ liệu thống kê nhân viên. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleExport = () => {
        console.log('Exporting employee statistics as CSV/PDF');
    };

    const handleBack = () => {
        navigate('/manage/statistics');
    };

    const pieChartOptions = {
        chart: {
            type: 'pie',
            toolbar: { show: true },
            animations: { enabled: true }
        },
        colors: [theme.palette.primary.main, theme.palette.secondary.main],
        labels: ['Nam', 'Nữ'],
        legend: { position: 'bottom' },
        tooltip: {
            theme: theme.palette.mode === 'dark' ? 'dark' : 'light'
        }
    };

    const barChartOptions = {
        chart: {
            type: 'bar',
            toolbar: { show: true },
            animations: { enabled: true }
        },
        colors: [theme.palette.primary.main],
        xaxis: {
            categories: ['Tỷ lệ nghỉ việc', 'Thâm niên trung bình'],
            title: { text: 'Chỉ số' }
        },
        yaxis: {
            title: { text: 'Giá trị (%) hoặc năm' }
        },
        tooltip: {
            theme: theme.palette.mode === 'dark' ? 'dark' : 'light'
        },
        plotOptions: {
            bar: { horizontal: false, columnWidth: '55%' }
        },
        dataLabels: {
            enabled: true,
            style: {
                colors: ['#000'] // Số màu đen
            }
        }
    };

    if (loading) {
        return (
            <PageContainer title="Thống kê nhân viên" description="Xem thống kê nhân viên">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                    <CircularProgress />
                </Box>
            </PageContainer>
        );
    }

    if (error) {
        return (
            <PageContainer title="Thống kê nhân viên" description="Xem thống kê nhân viên">
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', textAlign: 'center' }}>
                    <Typography variant="h6" color="error" gutterBottom>{error}</Typography>
                    <Button variant="contained" onClick={() => window.location.reload()}>Thử lại</Button>
                </Box>
            </PageContainer>
        );
    }

    return (
        <PageContainer title="Thống kê nhân viên" description="Xem thống kê nhân viên">
            <DashboardCard>
                <Box sx={{ p: 4 }}>
                    <Button
                        variant="outlined"
                        startIcon={<IconArrowLeft />}
                        onClick={handleBack}
                        sx={{
                            mb: 5,
                            fontSize: '0.95rem',
                            borderRadius: 1,
                            borderColor: '#1976d2',
                            color: '#1976d2',
                            '&:hover': {
                                backgroundColor: '#e3f2fd',
                                borderColor: '#1565c0'
                            }
                        }}
                    >
                        Trở lại
                    </Button>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a202c', mb: 1 }}>
                        Thống kê nhân viên
                    </Typography>
                    <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 4 }}>
                        Phân tích dữ liệu nhân viên theo các chỉ số nhân sự
                    </Typography>

                    <Button
                        variant="outlined"
                        startIcon={<IconDownload />}
                        onClick={handleExport}
                        sx={{ mb: 4 }}
                    >
                        Xuất dữ liệu
                    </Button>

                    {/* Summary Cards */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ backgroundColor: theme.palette.primary.main, color: '#fff' }}>
                                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <IconUsers size={32} />
                                    <Box>
                                        <Typography variant="h6">Tổng số nhân viên</Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 700 }}>{apiData?.totalEmployees ?? 'N/A'}</Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ backgroundColor: theme.palette.secondary.main, color: '#fff' }}>
                                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <IconSwitchHorizontal size={32} />
                                    <Box>
                                        <Typography variant="h6">Tỷ lệ nghỉ việc</Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 700 }}>{apiData?.resignationRate ?? 'N/A'}%</Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ backgroundColor: theme.palette.success.main, color: '#fff' }}>
                                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <IconClock size={32} />
                                    <Box>
                                        <Typography variant="h6">Thâm niên trung bình</Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 700 }}>{apiData?.averageSeniorityYears ?? 'N/A'} năm</Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ backgroundColor: theme.palette.warning.main, color: '#fff' }}>
                                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <IconUsers size={32} />
                                    <Box>
                                        <Typography variant="h6">Tỷ lệ giới tính</Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 700 }}>{apiData ? `${apiData.maleRate}% Nam / ${apiData.femaleRate}% Nữ` : 'N/A'}</Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Charts */}
                    <Card sx={{ mb: 4 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Tỷ lệ giới tính
                            </Typography>
                            <Chart
                                options={pieChartOptions}
                                series={[apiData?.maleRate ?? 0, apiData?.femaleRate ?? 0]}
                                type="pie"
                                height={350}
                            />
                        </CardContent>
                    </Card>

                    <Card sx={{ mb: 4 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Chỉ số nhân sự
                            </Typography>
                            <Chart
                                options={barChartOptions}
                                series={[{
                                    name: 'Chỉ số',
                                    data: [apiData?.resignationRate ?? 0, apiData?.averageSeniorityYears ?? 0]
                                }]}
                                type="bar"
                                height={350}
                            />
                        </CardContent>
                    </Card>
                </Box>
            </DashboardCard>
        </PageContainer>
    );
};

export default StatisticEmployee;

