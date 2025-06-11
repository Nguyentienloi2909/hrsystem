import React, { useState, useEffect } from 'react';
import { Box, Button, Stack, Tooltip, CircularProgress, Snackbar, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { IconHistory, IconChartBar, IconLogin, IconLogout } from '@tabler/icons-react';
import ApiService from '../../../service/ApiService';
import { format, parse, isAfter } from 'date-fns';

const CheckTools = ({ onSuccess, attendanceStatus }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [currentStatus, setCurrentStatus] = useState(null);
    const [error, setError] = useState(null);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const handleCheckIn = async () => {
        const currentTime = new Date();
        const checkInLimit = parse('09:00', 'HH:mm', currentTime);

        console.log('Current time:', currentTime.toLocaleTimeString());
        console.log('Check-in limit:', format(checkInLimit, 'HH:mm'));

        if (isAfter(currentTime, checkInLimit)) {
            setSnackbarMessage('Quá giờ check-in!');
            setSnackbarOpen(true);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            await ApiService.checkIn();

            if (onSuccess) {
                onSuccess();
            }

            const today = new Date();
            const month = today.getMonth() + 1;
            const year = today.getFullYear();
            const attendance = await ApiService.getTodayAttendance();
            setCurrentStatus(attendance);
        } catch (err) {
            console.error('Check-in error:', err);
            setError(err.message || 'Không thể check-in. Vui lòng thử lại sau.');
            setSnackbarMessage('Check-in thất bại!');
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckOut = async () => {
        try {
            setLoading(true);
            await ApiService.checkOut();

            const today = new Date();
            const month = today.getMonth() + 1;
            const year = today.getFullYear();
            const attendance = await ApiService.getAttendance(month, year);
            const todayStr = today.toISOString().split('T')[0];
            const todayAttendance = attendance.find(record =>
                record.workday.startsWith(todayStr)
            );
            setCurrentStatus(todayAttendance || null);

            if (onSuccess) onSuccess();
        } catch (err) {
            console.error('Check-out error:', err);
            setError(err.message);
            setSnackbarMessage('Check-out thất bại!');
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchAttendanceStatus = async () => {
            try {
                const today = new Date();
                const month = today.getMonth() + 1;
                const year = today.getFullYear();

                const attendance = await ApiService.getAttendance(month, year);
                const todayStr = today.toISOString().split('T')[0];
                const todayAttendance = attendance.find(record =>
                    record.workday.startsWith(todayStr)
                );

                setCurrentStatus(todayAttendance || null);
            } catch (err) {
                console.error('Error fetching attendance status:', err);
                setError(err.message);
            }
        };

        fetchAttendanceStatus();
    }, []);

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const tools = [
        {
            title: 'Lịch sử chấm công',
            icon: <IconHistory size={20} />,
            onClick: () => navigate('/history-checkwork'),
            color: 'primary',
            show: true
        },
        {
            title: 'Thống kê chấm công',
            icon: <IconChartBar size={20} />,
            onClick: () => navigate('/tkcheckwork'),
            color: 'secondary',
            show: true
        },
        {
            title: 'Check-in',
            icon: <IconLogin size={20} />,
            onClick: handleCheckIn,
            color: 'success',
            show: attendanceStatus ? attendanceStatus.canCheckIn : !currentStatus?.checkIn
        },
        {
            title: 'Check-out',
            icon: <IconLogout size={20} />,
            onClick: handleCheckOut,
            color: 'error',
            show: attendanceStatus ? attendanceStatus.canCheckOut : (currentStatus?.checkIn && !currentStatus?.checkOut)
        }
    ];

    return (
        <Box sx={{ p: 1 }}>
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                justifyContent="center"
            >
                {tools
                    .filter(tool => tool.show)
                    .map((tool, index) => (
                        <Tooltip key={index} title={tool.title} arrow>
                            <Button
                                variant="contained"
                                color={tool.color}
                                onClick={tool.onClick}
                                startIcon={tool.icon}
                                disabled={loading}
                                size="small"
                                sx={{
                                    minWidth: '150px',
                                    py: 1,
                                    fontSize: '0.875rem',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        transition: 'transform 0.2s'
                                    }
                                }}
                            >
                                {loading ? <CircularProgress size={20} /> : tool.title}
                            </Button>
                        </Tooltip>
                    ))}
            </Stack>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbarMessage === 'Quá giờ check-in!' ? 'warning' : 'error'} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default CheckTools;