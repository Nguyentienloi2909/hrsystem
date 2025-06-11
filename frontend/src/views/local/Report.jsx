import React, { useState } from 'react';
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Box,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import Chart from '../../components/charts/Chart';

const Report = () => {
    const [timeRange, setTimeRange] = useState('month');

    const handleTimeRangeChange = (event) => {
        setTimeRange(event.target.value);
    };

    return (
        <PageContainer title="Báo cáo thống kê" description="Thống kê chấm công nhân viên">
            <Box sx={{ mb: 3 }}>
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Thời gian</InputLabel>
                    <Select
                        value={timeRange}
                        label="Thời gian"
                        onChange={handleTimeRangeChange}
                    >
                        <MenuItem value="week">Tuần này</MenuItem>
                        <MenuItem value="month">Tháng này</MenuItem>
                        <MenuItem value="quarter">Quý này</MenuItem>
                        <MenuItem value="year">Năm nay</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <Grid container spacing={3}>
                {/* Summary Cards */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: '#e3f2fd' }}>
                        <CardContent>
                            <Typography color="textSecondary" variant="h6">
                                Tổng nhân viên
                            </Typography>
                            <Typography variant="h4">150</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: '#e8f5e9' }}>
                        <CardContent>
                            <Typography color="textSecondary" variant="h6">
                                Đi làm đúng giờ
                            </Typography>
                            <Typography variant="h4">135</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: '#fff3e0' }}>
                        <CardContent>
                            <Typography color="textSecondary" variant="h6">
                                Đi muộn
                            </Typography>
                            <Typography variant="h4">10</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: '#ffebee' }}>
                        <CardContent>
                            <Typography color="textSecondary" variant="h6">
                                Vắng mặt
                            </Typography>
                            <Typography variant="h4">5</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Detailed Reports */}
                <Grid item xs={12} md={8}>
                    <DashboardCard title="Biểu đồ chấm công">
                        <Box sx={{ height: 400, p: 2 }}>
                            <Chart timeRange={timeRange} />
                        </Box>
                    </DashboardCard>
                </Grid>

                <Grid item xs={12} md={4}>
                    <DashboardCard title="Thống kê chi tiết">
                        <Box sx={{ p: 2 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Tỷ lệ đi làm đúng giờ: 90%
                            </Typography>
                            <Typography variant="subtitle1" gutterBottom>
                                Tỷ lệ đi muộn: 6.67%
                            </Typography>
                            <Typography variant="subtitle1" gutterBottom>
                                Tỷ lệ vắng mặt: 3.33%
                            </Typography>
                            <Typography variant="subtitle1" gutterBottom>
                                Số giờ tăng ca: 120h
                            </Typography>
                        </Box>
                    </DashboardCard>
                </Grid>
            </Grid>
        </PageContainer>
    );
};

export default Report;