import React, { useState, useContext } from 'react';
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Switch,
    FormControlLabel,
    TextField,
    Button,
    Divider,
    Box,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import { IconDeviceFloppy } from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import { ThemeContext } from '../../contexts/ThemeContext'; // Import ThemeContext

const Settings = () => {
    const [settings, setSettings] = useState({
        workStartTime: '08:00',
        workEndTime: '17:00',
        lunchBreakStart: '12:00',
        lunchBreakEnd: '13:00',
        allowLateMinutes: 15,
        overtimeRate: 1.5,
        emailNotifications: true,
        language: 'vi',
        autoCheckout: false
    });

    const { themeMode, toggleTheme } = useContext(ThemeContext); // Use ThemeContext

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = () => {
        console.log('Settings saved:', settings);
        // Add API call here
    };

    return (
        <PageContainer title="Cài đặt hệ thống" description="Thiết lập cấu hình hệ thống">
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <DashboardCard title="Cài đặt thời gian làm việc">
                        <CardContent>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Giờ bắt đầu"
                                        type="time"
                                        name="workStartTime"
                                        value={settings.workStartTime}
                                        onChange={handleChange}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Giờ kết thúc"
                                        type="time"
                                        name="workEndTime"
                                        value={settings.workEndTime}
                                        onChange={handleChange}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Giờ nghỉ trưa (bắt đầu)"
                                        type="time"
                                        name="lunchBreakStart"
                                        value={settings.lunchBreakStart}
                                        onChange={handleChange}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Giờ nghỉ trưa (kết thúc)"
                                        type="time"
                                        name="lunchBreakEnd"
                                        value={settings.lunchBreakEnd}
                                        onChange={handleChange}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </DashboardCard>
                </Grid>

                <Grid item xs={12} md={6}>
                    <DashboardCard title="Cài đặt chung">
                        <CardContent>
                            <TextField
                                fullWidth
                                label="Thời gian cho phép đi muộn (phút)"
                                type="number"
                                name="allowLateMinutes"
                                value={settings.allowLateMinutes}
                                onChange={handleChange}
                                sx={{ mb: 3 }}
                            />
                            <TextField
                                fullWidth
                                label="Hệ số tăng ca"
                                type="number"
                                name="overtimeRate"
                                value={settings.overtimeRate}
                                onChange={handleChange}
                                sx={{ mb: 3 }}
                            />
                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <InputLabel>Ngôn ngữ</InputLabel>
                                <Select
                                    name="language"
                                    value={settings.language}
                                    label="Ngôn ngữ"
                                    onChange={handleChange}
                                >
                                    <MenuItem value="vi">Tiếng Việt</MenuItem>
                                    <MenuItem value="en">English</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={themeMode === 'dark'}
                                        onChange={toggleTheme}
                                        name="themeToggle"
                                    />
                                }
                                label="Chế độ tối"
                            />
                        </CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            <Button
                                variant="contained"
                                startIcon={<IconDeviceFloppy />}
                                onClick={handleSave}
                                size="large"
                            >
                                Lưu cài đặt
                            </Button>
                        </Box>
                    </DashboardCard>
                </Grid>

                {/* <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button
                            variant="contained"
                            startIcon={<IconDeviceFloppy />}
                            onClick={handleSave}
                            size="large"
                        >
                            Lưu cài đặt
                        </Button>
                    </Box>
                </Grid> */}
            </Grid>
        </PageContainer>
    );
};

export default Settings;