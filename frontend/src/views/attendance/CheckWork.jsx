import React, { useState, useEffect } from 'react';
import {
    Typography,
    Box,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button,
} from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import CheckTools from './components/CheckTools';

const CheckWork = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [openDialog, setOpenDialog] = useState(false);
    const [actionType, setActionType] = useState('');

    // Update current time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleCheckIn = () => {
        setActionType('Check-in');
        setOpenDialog(true);
    };

    const handleCheckOut = () => {
        setActionType('Check-out');
        setOpenDialog(true);
    };

    const handleConfirm = () => {
        setOpenDialog(false);
        console.log(`${actionType} confirmed`);
        // Implement check-in or check-out logic here
    };

    return (
        <PageContainer title="Chấm công" description="Quản lý chấm công nhân viên" sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <DashboardCard sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                {/* Tools Section */}
                <Box mb={2}>
                    <CheckTools onCheckIn={handleCheckIn} onCheckOut={handleCheckOut} />
                </Box>

                {/* Clock Section */}
                <Typography
                    variant="h2"
                    sx={{
                        fontFamily: 'monospace',
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        color: '#2c3e50',
                        letterSpacing: '0.1em',
                        textAlign: 'center'
                    }}
                >
                    {currentTime.toLocaleTimeString()}
                </Typography>

                {/* Confirmation Dialog */}
                <Dialog
                    open={openDialog}
                    onClose={() => setOpenDialog(false)}
                >
                    <DialogTitle>
                        Xác nhận {actionType}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Bạn có muốn thực hiện {actionType}?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDialog(false)}>
                            Hủy
                        </Button>
                        <Button onClick={handleConfirm} color="primary" variant="contained">
                            Ok
                        </Button>
                    </DialogActions>
                </Dialog>
            </DashboardCard>
        </PageContainer>
    );
};

export default CheckWork;