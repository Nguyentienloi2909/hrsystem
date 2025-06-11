import React, { useState, useEffect, useContext } from 'react';
import { Grid, CardContent, Typography, Button, Box } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import Notification from '../notification/Notification';
import ApiService from 'src/service/ApiService';
import { useNavigate } from 'react-router-dom';
import { NotificationContext } from '../../contexts/NotificationContext';

const HomePage = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(0);
    const [rowsPerPage] = useState(10);
    const [userRole, setUserRole] = useState('');
    const { notifications } = useContext(NotificationContext);

    useEffect(() => {
        // Lấy role từ sessionStorage thay vì localStorage
        const role = sessionStorage.getItem('role') || 'USER';
        setUserRole(role);

        // Log sessionStorage data for debugging
        console.log('sessionStorage data:', sessionStorage);
        console.log('User role from sessionStorage:', sessionStorage.getItem('role'));
    }, []);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleNotificationClick = (notification) => {
        navigate(`/notification/${notification.id}`, { state: { notification } });
    };

    const handleAddNotification = () => {
        navigate('/notification/add');
        console.log('Add Notification button clicked');
    };

    return (
        <PageContainer title="Trang chủ" description="Trang chủ">
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                {userRole === 'ADMIN' && (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleAddNotification}
                        sx={{
                            fontSize: '0.95rem',
                            transition: 'transform 0.2s, background-color 0.2s',
                            '&:hover': {
                                backgroundColor: 'primary.dark',
                                transform: 'scale(1.05)',
                            },
                            '&:active': {
                                transform: 'scale(0.95)',
                            },
                        }}
                    >
                        Thêm thông báo
                    </Button>
                )}
            </Box>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <DashboardCard title="Thông báo">
                        <CardContent sx={{ p: 1 }}>
                            <Notification
                                page={page}
                                rowsPerPage={rowsPerPage}
                                handleChangePage={handleChangePage}
                                onNotificationClick={handleNotificationClick}
                                compact
                            />
                        </CardContent>
                    </DashboardCard>
                </Grid>
            </Grid>
        </PageContainer>
    );
};

export default HomePage;