import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Grid, Typography, Avatar, Divider, Box, Chip, Button, ButtonGroup, Dialog, DialogActions,
    DialogContent, DialogContentText, DialogTitle, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper
} from '@mui/material';
import ApiService from '../../service/ApiService';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import {
    IconPhone, IconMail, IconMapPin, IconArrowLeft, IconEdit, IconTrash, IconDeviceIpadDollar,
    IconCalendar, IconGenderBigender, IconBuildingBank, IconUsers, IconCalendarEvent
} from '@tabler/icons-react';

import PropTypes from 'prop-types';

const InfoItem = ({ icon, label, value }) => (
    <TableRow sx={{ '&:nth-of-type(odd)': { backgroundColor: '#fafafa' }, '&:nth-of-type(even)': { backgroundColor: '#ffffff' }, '&:hover': { backgroundColor: '#f5f5f5', cursor: 'default' } }}>
        <TableCell sx={{ border: '1px solid rgba(224, 224, 224, 1)', padding: '16px', width: '30%' }}>
            {React.cloneElement(icon, { size: 24, color: '#1976d2' })}
            <Typography variant="subtitle2" color="textSecondary" sx={{ ml: 2, display: 'inline', fontSize: '0.85rem' }}>
                {label}
            </Typography>
        </TableCell>
        <TableCell sx={{ border: '1px solid rgba(224, 224, 224, 1)', padding: '16px' }}>
            <Typography variant="body1" sx={{ fontWeight: 600, color: '#1a202c' }}>
                {value || 'N/A'}
            </Typography>
        </TableCell>
    </TableRow>
);

InfoItem.propTypes = {
    icon: PropTypes.element.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.node
    ])
};

const EmployeesInfo = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                setLoading(true);
                const response = await ApiService.getUser(id);
                setEmployee(response);
            } catch (error) {
                setError(error.response?.data?.message || error.message || 'Không thể tải thông tin nhân viên');
            } finally {
                setLoading(false);
            }
        };

        fetchEmployee();
    }, [id]);

    if (loading) {
        return (
            <PageContainer title="Thông tin nhân viên" description="Chi tiết thông tin nhân viên">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                    <Typography variant="h6" color="textSecondary">Đang tải...</Typography>
                </Box>
            </PageContainer>
        );
    }

    if (error) {
        return (
            <PageContainer title="Thông tin nhân viên" description="Chi tiết thông tin nhân viên">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                    <Typography variant="h6" color="error">Lỗi: {error}</Typography>
                </Box>
            </PageContainer>
        );
    }

    if (!employee) {
        return (
            <PageContainer title="Thông tin nhân viên" description="Chi tiết thông tin nhân viên">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                    <Typography variant="h6" color="textSecondary">Không tìm thấy nhân viên</Typography>
                </Box>
            </PageContainer>
        );
    }

    const handleEdit = () => {
        navigate(`/manage/employee/edit/${id}`);
    };

    const handleBack = () => {
        navigate('/manage/employee/list');
    };

    const handleDelete = async () => {
        try {
            await ApiService.deleteUser(id);
            setOpenDialog(false);
            navigate('/manage/employee/list');
        } catch (error) {
            setError(error.response?.data?.message || error.message || 'Không thể xóa nhân viên');
        }
    };

    const handleDeleteClick = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    return (
        <PageContainer title="Thông tin nhân viên" description="Chi tiết thông tin nhân viên">
            <Box sx={{
                minHeight: '100vh',
                width: '100%',
                m: 0,
                p: 0,
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#f5f7fa'
            }}>
                <DashboardCard sx={{
                    width: '100%',
                    minHeight: '100vh',
                    m: 0,
                    p: 4,
                    borderRadius: 0,
                    boxShadow: 'none',
                    background: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2 }}>
                        <Button
                            variant="outlined"
                            startIcon={<IconArrowLeft />}
                            onClick={handleBack}
                            sx={{
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
                        <ButtonGroup variant="contained" sx={{ boxShadow: 1 }}>
                            <Button
                                color="primary"
                                startIcon={<IconEdit />}
                                onClick={handleEdit}
                                sx={{
                                    fontSize: '0.95rem',
                                    background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
                                    '&:hover': {
                                        background: 'linear-gradient(90deg, #1565c0, #2196f3)'
                                    }
                                }}
                            >
                                Sửa
                            </Button>
                            <Button
                                color="error"
                                startIcon={<IconTrash />}
                                onClick={handleDeleteClick}
                                sx={{
                                    fontSize: '0.95rem',
                                    background: 'linear-gradient(90deg, #d32f2f, #f44336)',
                                    '&:hover': {
                                        background: 'linear-gradient(90deg, #c62828, #e53935)'
                                    }
                                }}
                            >
                                Xóa
                            </Button>
                        </ButtonGroup>
                    </Box>

                    <Grid container spacing={2} justifyContent="center">
                        <Grid item xs={12} sm={10} sx={{ textAlign: 'center', mb: 5, px: 2 }}>

                            <Avatar
                                src={employee.avatar || null}
                                alt={employee.fullName || 'Employee Avatar'}
                                sx={{ width: 200, height: 200, margin: '0 auto', mb: 2 }}
                            />
                            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#1a202c' }}>
                                {employee.fullName}
                            </Typography>
                            <Typography variant="subtitle1" color="textSecondary" gutterBottom sx={{ fontSize: '1.1rem' }}>
                                Chức vụ: {employee.roleName || '-----'}
                            </Typography>
                            <Chip
                                label={employee.status || 'Hoạt động'}
                                color="success"
                                size="medium"
                                sx={{
                                    borderRadius: 1,
                                    fontSize: '0.9rem',
                                    fontWeight: 500,
                                    backgroundColor: '#4caf50',
                                    color: '#ffffff',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                                }}
                            />
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 4, borderColor: '#e3f2fd' }} />

                    <TableContainer component={Paper} sx={{ flex: 1, overflowY: 'auto' }}>
                        <Table sx={{ minWidth: 650, '& .MuiTableHead-root .MuiTableRow-root': { backgroundColor: '#e3f2fd' } }} aria-label="employee info table">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ border: '1px solid rgba(224, 224, 224, 1)', padding: '16px', fontWeight: 600 }}>Thông tin</TableCell>
                                    <TableCell sx={{ border: '1px solid rgba(224, 224, 224, 1)', padding: '16px', fontWeight: 600 }}>Giá trị</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <InfoItem icon={<IconPhone />} label="Số điện thoại" value={employee?.phoneNumber || '-----'} />
                                <InfoItem icon={<IconMail />} label="Email" value={employee?.email || '-----'} />
                                <InfoItem icon={<IconCalendar />} label="Ngày sinh" value={employee?.birthDate ? new Date(employee.birthDate).toLocaleDateString('en-GB') : '-----'} />
                                <InfoItem icon={<IconCalendarEvent />} label="Ngày bắt đầu" value={employee?.startDate ? new Date(employee.startDate).toLocaleDateString('en-GB') : '-----'} />
                                <InfoItem icon={<IconDeviceIpadDollar />} label="Lương tháng" value={employee?.monthSalary ? `${employee.monthSalary.toLocaleString('vi-VN')} VND` : '-----'} />
                                <InfoItem icon={<IconGenderBigender />} label="Giới tính" value={employee?.gender === true ? 'Nam' : employee?.gender === false ? 'Nữ' : '-----'} />
                                <InfoItem icon={<IconMapPin />} label="Địa chỉ" value={employee?.address || '-----'} />
                                <InfoItem icon={<IconBuildingBank />} label="Ngân hàng" value={employee?.bankName || '-----'} />
                                <InfoItem icon={<IconDeviceIpadDollar />} label="Số tài khoản" value={employee?.bankNumber || '-----'} />
                                <InfoItem icon={<IconUsers />} label="Phòng ban" value={employee?.groupName || '-----'} />
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Dialog
                        open={openDialog}
                        onClose={handleCloseDialog}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                        sx={{ '& .MuiDialog-paper': { borderRadius: 2, p: 2 } }}
                    >
                        <DialogTitle id="alert-dialog-title" sx={{ fontWeight: 600 }}>
                            Xác nhận xóa nhân viên
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText id="alert-dialog-description">
                                Bạn có chắc chắn muốn xóa nhân viên này không? Hành động này không thể hoàn tác.
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseDialog} color="primary" sx={{ fontWeight: 500 }}>
                                Hủy
                            </Button>
                            <Button onClick={handleDelete} color="error" autoFocus sx={{ fontWeight: 500 }}>
                                Xóa
                            </Button>
                        </DialogActions>
                    </Dialog>
                </DashboardCard>
            </Box>
        </PageContainer>
    );
};

export default EmployeesInfo;