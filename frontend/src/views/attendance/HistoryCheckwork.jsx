import { useState, useEffect, useCallback } from 'react';
import {
    Typography,
    IconButton,
    Box,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button,
    CircularProgress,
    Alert,
    Chip,
    Snackbar
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import PageContainer from '../../components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import { format, addMonths, subMonths, isAfter, parse } from 'date-fns';
import { vi } from 'date-fns/locale';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import CheckTools from './components/CheckTools';
import ApiService from '../../service/ApiService';

const HistoryCheckwork = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [pageSize, setPageSize] = useState(10);
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [checkInLoading, setCheckInLoading] = useState(false);

    const fetchAttendanceData = useCallback(async () => {
        try {
            setLoading(true);
            const month = format(currentDate, 'M');
            const year = format(currentDate, 'yyyy');
            const response = await ApiService.getAttendance(month, year);
            console.log('User role from sessionStorage:', sessionStorage.getItem('role'));

            if (!Array.isArray(response)) {
                throw new Error('Invalid response format');
            }

            const today = new Date();
            const formattedData = response
                .map((item, index) => {
                    const workday = new Date(item.workday);
                    return {
                        id: item.id || index,
                        date: isNaN(workday.getTime()) ? '--/--/----' : format(workday, 'dd/MM/yyyy'),
                        checkIn: item.checkIn ? format(new Date(item.checkIn), 'HH:mm') : '--:--',
                        checkOut: item.checkOut ? format(new Date(item.checkOut), 'HH:mm') : '--:--',
                        status: transformStatus(item.status),
                        note: item.note || '--',
                        workHours: calculateWorkHours(item.checkIn, item.checkOut),
                        workdayObj: workday // giữ lại object ngày để lọc
                    };
                })
                // Lọc chỉ lấy các ngày <= hôm nay
                .filter(item => {
                    if (isNaN(item.workdayObj.getTime())) return false;
                    // So sánh chỉ theo ngày, bỏ qua giờ phút
                    return item.workdayObj <= new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
                });

            setAttendanceData(formattedData);
            setError(null);
        } catch (err) {
            setAttendanceData([]);
        } finally {
            setLoading(false);
        }
    }, [currentDate]);

    useEffect(() => {
        fetchAttendanceData();
    }, [fetchAttendanceData]);

    const handleMonthChange = (direction) => {
        setCurrentDate(prevDate => direction === 'next' ? addMonths(prevDate, 1) : subMonths(prevDate, 1));
    };

    const calculateWorkHours = (checkIn, checkOut) => {
        if (!checkIn || !checkOut) return '--:--';
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) return '--:--';

        const diff = end - start;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}:${minutes.toString().padStart(2, '0')}`;
    };

    const transformStatus = (status) => {
        const statusMap = {
            'Pending': 'pending',
            'Present': 'onTime',
            'Late': 'late',
            'Early': 'early'
        };
        return statusMap[status] || 'pending';
    };

    const getTodayAttendanceStatus = () => {
        const today = format(new Date(), 'dd/MM/yyyy');
        const todayRecord = attendanceData.find(record => record.date === today);
        return todayRecord
            ? { canCheckIn: todayRecord.checkIn === '--:--', canCheckOut: todayRecord.checkIn !== '--:--' && todayRecord.checkOut === '--:--' }
            : { canCheckIn: true, canCheckOut: false };
    };

    const handleCheckIn = async () => {
        setCheckInLoading(true);
        try {
            await ApiService.checkIn();
            setSnackbarMessage('Check-in thành công!');
            fetchAttendanceData();
        } catch (error) {
            setSnackbarMessage('Check-in thất bại!');
            // Xóa console.error để không hiển thị chi tiết lỗi trong console
        } finally {
            setCheckInLoading(false);
            setSnackbarOpen(true);
        }
    };

    const handleConfirmCheckIn = () => {
        setOpenConfirmDialog(true);
    };

    const handleConfirmCheckInAction = () => {
        const currentTime = new Date();
        const checkInLimit = parse('09:00', 'HH:mm', currentTime);

        console.log('Current time:', currentTime.toLocaleTimeString());
        console.log('Check-in limit:', format(checkInLimit, 'HH:mm'));

        if (isAfter(currentTime, checkInLimit)) {
            setSnackbarMessage('Quá giờ check-in!');
            setSnackbarOpen(true);
            setOpenConfirmDialog(false);
            return;
        }

        handleCheckIn();
        setOpenConfirmDialog(false);
    };

    const handleCloseConfirmDialog = () => {
        setOpenConfirmDialog(false);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const columns = [
        { field: 'date', headerName: 'Ngày', width: 130, headerAlign: 'center', align: 'center' },
        { field: 'checkIn', headerName: 'Giờ vào', width: 130, headerAlign: 'center', align: 'center', cellClassName: (params) => params.value === '--:--' ? 'missing-time' : '' },
        { field: 'checkOut', headerName: 'Giờ ra', width: 130, headerAlign: 'center', align: 'center', cellClassName: (params) => params.value === '--:--' ? 'missing-time' : '' },
        {
            field: 'status',
            headerName: 'Trạng thái',
            width: 130,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Chip
                    label={params.value === 'onTime' ? 'Có mặt' : params.value === 'late' ? 'Đi muộn' : params.value === 'early' ? 'Về sớm' : 'Chưa chấm công'}
                    color={params.value === 'onTime' ? 'success' : params.value === 'late' ? 'error' : params.value === 'early' ? 'warning' : 'default'}
                    size="small"
                    sx={{ minWidth: 90, fontSize: '0.75rem' }}
                />
            )
        },
        { field: 'note', headerName: 'Ghi chú', width: 200, headerAlign: 'center', align: 'left' },
        { field: 'workHours', headerName: 'Số giờ làm', width: 130, headerAlign: 'center', align: 'center', cellClassName: (params) => params.value === '--:--' ? 'missing-time' : '' }
    ];

    return (
        <PageContainer title="Lịch sử chấm công" description="Xem lịch sử chấm công">
            <DashboardCard>
                <Box mb={2}>
                    <CheckTools
                        onSuccess={fetchAttendanceData}
                        attendanceStatus={getTodayAttendanceStatus()}
                        onCheckIn={handleConfirmCheckIn}
                        checkInLoading={checkInLoading}
                    />
                </Box>

                <Dialog open={openConfirmDialog} onClose={handleCloseConfirmDialog}>
                    <DialogTitle>Xác nhận Check-in</DialogTitle>
                    <DialogContent>
                        <DialogContentText>Bạn có chắc chắn muốn check-in?</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseConfirmDialog} color="primary">Hủy</Button>
                        <Button onClick={handleConfirmCheckInAction} color="primary" variant="contained" disabled={checkInLoading}>
                            {checkInLoading ? <CircularProgress size={24} /> : 'Xác nhận'}
                        </Button>
                    </DialogActions>
                </Dialog>

                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={6000}
                    onClose={handleSnackbarClose}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert onClose={handleSnackbarClose} severity={snackbarMessage === 'Quá giờ check-in!' ? 'warning' : 'success'} sx={{ width: '100%' }}>
                        {snackbarMessage}
                    </Alert>
                </Snackbar>

                <Box sx={{ backgroundColor: 'background.paper', borderRadius: 2, p: 3, boxShadow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>Lịch sử chấm công</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'background.default', borderRadius: 2, p: 1 }}>
                            <IconButton onClick={() => handleMonthChange('prev')} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                                <IconChevronLeft />
                            </IconButton>
                            <Typography variant="h6" sx={{ mx: 2, minWidth: 200, textAlign: 'center', fontWeight: 500 }}>
                                {format(currentDate, 'MM/yyyy', { locale: vi })}
                            </Typography>
                            <IconButton onClick={() => handleMonthChange('next')} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                                <IconChevronRight />
                            </IconButton>
                        </Box>
                    </Box>

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            {attendanceData.length === 0 && (
                                <Box sx={{ mb: 2 }}>
                                    <Alert severity="error" sx={{ width: '100%', boxShadow: 1 }}>
                                        {error || `Không tìm thấy dữ liệu chấm công trong tháng ${format(currentDate, 'MM/yyyy', { locale: vi })}`}
                                    </Alert>
                                </Box>
                            )}
                            <DataGrid
                                rows={attendanceData}
                                columns={columns}
                                pageSize={pageSize}
                                onPageSizeChange={setPageSize}
                                rowsPerPageOptions={[5, 10, 20]}
                                autoHeight
                                disableSelectionOnClick
                                initialState={{ sorting: { sortModel: [{ field: 'date', sort: 'desc' }] } }}
                                sx={{
                                    border: '1px solid rgba(224, 224, 224, 1)',
                                    '& .MuiDataGrid-root': { border: 'none' },
                                    '& .MuiDataGrid-cell': { borderColor: 'divider' },
                                    '& .MuiDataGrid-columnHeaders': { backgroundColor: 'background.default', borderColor: 'divider' },
                                    '& .MuiDataGrid-cell:focus': { outline: 'none' },
                                    '& .missing-time': { color: 'text.disabled' },
                                    '& .MuiDataGrid-row:hover': { backgroundColor: 'action.hover' }
                                }}
                            />
                        </>
                    )}
                </Box>
            </DashboardCard>
        </PageContainer>
    );
};

export default HistoryCheckwork;


//
// import { useState, useEffect, useCallback } from 'react';
// import {
//     Typography,
//     IconButton,
//     Box,
//     Dialog,
//     DialogActions,
//     DialogContent,
//     DialogContentText,
//     DialogTitle,
//     Button,
//     CircularProgress,
//     Alert,
//     Chip,
//     Snackbar,
//     Stack,
//     Tooltip
// } from '@mui/material';
// import { DataGrid } from '@mui/x-data-grid';
// import PageContainer from '../../components/container/PageContainer';
// import DashboardCard from '../../components/shared/DashboardCard';
// import { format, addMonths, subMonths, isAfter, parse } from 'date-fns';
// import { vi } from 'date-fns/locale';
// import { IconChevronLeft, IconChevronRight, IconCheck, IconAlertCircle, IconClockOff, IconClock, IconInfoCircle } from '@tabler/icons-react';
// import CheckTools from './components/CheckTools';
// import ApiService from '../../service/ApiService';

// const statusConfig = {
//     onTime: {
//         color: '#e8f5e9',
//         hoverColor: '#c8e6c9',
//         icon: <IconCheck color="#4CAF50" size={18} />,
//         text: 'Có mặt',
//         tooltip: 'Nhân viên chấm công đúng giờ'
//     },
//     late: {
//         color: '#ffebee',
//         hoverColor: '#ffcdd2',
//         icon: <IconAlertCircle color="#F44336" size={18} />,
//         text: 'Đi muộn',
//         tooltip: 'Nhân viên chấm công trễ giờ'
//     },
//     early: {
//         color: '#fffde7',
//         hoverColor: '#ffe082',
//         icon: <IconClockOff color="#FFC107" size={18} />,
//         text: 'Về sớm',
//         tooltip: 'Nhân viên kết thúc sớm hơn quy định'
//     },
//     pending: {
//         color: '#f5f5f5',
//         hoverColor: '#eeeeee',
//         icon: <IconClock color="#9E9E9E" size={18} />,
//         text: 'Chưa chấm',
//         tooltip: 'Chưa có dữ liệu chấm công'
//     }
// };

// const HistoryCheckwork = () => {
//     const [currentDate, setCurrentDate] = useState(new Date());
//     const [pageSize, setPageSize] = useState(10);
//     const [attendanceData, setAttendanceData] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
//     const [snackbarMessage, setSnackbarMessage] = useState('');
//     const [snackbarOpen, setSnackbarOpen] = useState(false);
//     const [checkInLoading, setCheckInLoading] = useState(false);

//     const fetchAttendanceData = useCallback(async () => {
//         try {
//             setLoading(true);
//             const month = format(currentDate, 'M');
//             const year = format(currentDate, 'yyyy');
//             const response = await ApiService.getAttendance(month, year);
//             console.log('User role from sessionStorage:', sessionStorage.getItem('role'));

//             if (!Array.isArray(response)) {
//                 throw new Error('Invalid response format');
//             }

//             const today = new Date();
//             const formattedData = response
//                 .map((item, index) => {
//                     const workday = new Date(item.workday);
//                     return {
//                         id: item.id || index,
//                         date: isNaN(workday.getTime()) ? '--/--/----' : format(workday, 'dd/MM/yyyy'),
//                         checkIn: item.checkIn ? format(new Date(item.checkIn), 'HH:mm') : '--:--',
//                         checkOut: item.checkOut ? format(new Date(item.checkOut), 'HH:mm') : '--:--',
//                         status: transformStatus(item.status),
//                         note: item.note || '--',
//                         workHours: calculateWorkHours(item.checkIn, item.checkOut),
//                         workdayObj: workday // giữ lại object ngày để lọc
//                     };
//                 })
//                 // Lọc chỉ lấy các ngày <= hôm nay
//                 .filter(item => {
//                     if (isNaN(item.workdayObj.getTime())) return false;
//                     // So sánh chỉ theo ngày, bỏ qua giờ phút
//                     return item.workdayObj <= new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
//                 });

//             setAttendanceData(formattedData);
//             setError(null);
//         } catch (err) {
//             setAttendanceData([]);
//         } finally {
//             setLoading(false);
//         }
//     }, [currentDate]);

//     useEffect(() => {
//         fetchAttendanceData();
//     }, [fetchAttendanceData]);

//     const handleMonthChange = (direction) => {
//         setCurrentDate(prevDate => direction === 'next' ? addMonths(prevDate, 1) : subMonths(prevDate, 1));
//     };

//     const calculateWorkHours = (checkIn, checkOut) => {
//         if (!checkIn || !checkOut) return '--:--';
//         const start = new Date(checkIn);
//         const end = new Date(checkOut);
//         if (isNaN(start.getTime()) || isNaN(end.getTime())) return '--:--';

//         const diff = end - start;
//         const hours = Math.floor(diff / (1000 * 60 * 60));
//         const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
//         return `${hours}:${minutes.toString().padStart(2, '0')}`;
//     };

//     const transformStatus = (status) => {
//         const statusMap = {
//             'Pending': 'pending',
//             'Present': 'onTime',
//             'Late': 'late',
//             'Early': 'early'
//         };
//         return statusMap[status] || 'pending';
//     };

//     const getTodayAttendanceStatus = () => {
//         const today = format(new Date(), 'dd/MM/yyyy');
//         const todayRecord = attendanceData.find(record => record.date === today);
//         return todayRecord
//             ? { canCheckIn: todayRecord.checkIn === '--:--', canCheckOut: todayRecord.checkIn !== '--:--' && todayRecord.checkOut === '--:--' }
//             : { canCheckIn: true, canCheckOut: false };
//     };

//     const handleCheckIn = async () => {
//         setCheckInLoading(true);
//         try {
//             await ApiService.checkIn();
//             setSnackbarMessage('Check-in thành công!');
//             fetchAttendanceData();
//         } catch (error) {
//             setSnackbarMessage('Check-in thất bại!');
//             // Xóa console.error để không hiển thị chi tiết lỗi trong console
//         } finally {
//             setCheckInLoading(false);
//             setSnackbarOpen(true);
//         }
//     };

//     const handleConfirmCheckIn = () => {
//         setOpenConfirmDialog(true);
//     };

//     const handleConfirmCheckInAction = () => {
//         const currentTime = new Date();
//         const checkInLimit = parse('09:00', 'HH:mm', currentTime);

//         console.log('Current time:', currentTime.toLocaleTimeString());
//         console.log('Check-in limit:', format(checkInLimit, 'HH:mm'));

//         if (isAfter(currentTime, checkInLimit)) {
//             setSnackbarMessage('Quá giờ check-in!');
//             setSnackbarOpen(true);
//             setOpenConfirmDialog(false);
//             return;
//         }

//         handleCheckIn();
//         setOpenConfirmDialog(false);
//     };

//     const handleCloseConfirmDialog = () => {
//         setOpenConfirmDialog(false);
//     };

//     const handleSnackbarClose = () => {
//         setSnackbarOpen(false);
//     };


//     const columns = [
//         { field: 'date', headerName: 'Ngày', width: 130, headerAlign: 'center', align: 'center' },
//         { field: 'checkIn', headerName: 'Giờ vào', width: 130, headerAlign: 'center', align: 'center', cellClassName: (params) => params.value === '--:--' ? 'missing-time' : '' },
//         { field: 'checkOut', headerName: 'Giờ ra', width: 130, headerAlign: 'center', align: 'center', cellClassName: (params) => params.value === '--:--' ? 'missing-time' : '' },
//         { field: 'note', headerName: 'Ghi chú', width: 200, headerAlign: 'center', align: 'left' },
//         { field: 'workHours', headerName: 'Số giờ làm', width: 130, headerAlign: 'center', align: 'center', cellClassName: (params) => params.value === '--:--' ? 'missing-time' : '' },
//         {
//             field: 'statusIcon',
//             headerName: '',
//             width: 60,
//             align: 'center',
//             headerAlign: 'center',
//             sortable: false,
//             filterable: false,
//             disableColumnMenu: true,
//             renderCell: (params) => {
//                 const config = statusConfig[params.row.status] || statusConfig.pending;
//                 return (
//                     <Tooltip title={config.tooltip}>
//                         <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
//                             {config.icon}
//                         </Box>
//                     </Tooltip>
//                 );
//             }
//         }
//     ];

//     return (
//         <PageContainer title="Lịch sử chấm công" description="Xem lịch sử chấm công">
//             <DashboardCard>
//                 {/* Bảng giải thích màu và icon */}
//                 <Box sx={{
//                     mb: 2,
//                     p: 2,
//                     backgroundColor: 'background.paper',
//                     borderRadius: 2,
//                     boxShadow: 1,
//                     display: 'flex',
//                     flexWrap: 'wrap',
//                     gap: 2
//                 }}>
//                     <Typography variant="subtitle1" sx={{ width: '100%', display: 'flex', alignItems: 'center' }}>
//                         <IconInfoCircle style={{ marginRight: 8 }} />
//                         Chú thích trạng thái:
//                     </Typography>
//                     {Object.entries(statusConfig).map(([key, config]) => (
//                         <Chip
//                             key={key}
//                             label={
//                                 <Stack direction="row" alignItems="center" spacing={1}>
//                                     {config.icon}
//                                     <span>{config.text}</span>
//                                 </Stack>
//                             }
//                             size="small"
//                             sx={{
//                                 backgroundColor: config.color,
//                                 color: 'text.primary',
//                                 fontWeight: 500,
//                                 fontSize: '1rem',
//                                 px: 1.5,
//                                 py: 0.5,
//                                 '& .MuiChip-icon': { ml: 0.5 }
//                             }}
//                         />
//                     ))}
//                 </Box>

//                 <Box mb={2}>
//                     <CheckTools
//                         onSuccess={fetchAttendanceData}
//                         attendanceStatus={getTodayAttendanceStatus()}
//                         onCheckIn={handleConfirmCheckIn}
//                         checkInLoading={checkInLoading}
//                     />
//                 </Box>

//                 <Dialog open={openConfirmDialog} onClose={handleCloseConfirmDialog}>
//                     <DialogTitle>Xác nhận Check-in</DialogTitle>
//                     <DialogContent>
//                         <DialogContentText>Bạn có chắc chắn muốn check-in?</DialogContentText>
//                     </DialogContent>
//                     <DialogActions>
//                         <Button onClick={handleCloseConfirmDialog} color="primary">Hủy</Button>
//                         <Button onClick={handleConfirmCheckInAction} color="primary" variant="contained" disabled={checkInLoading}>
//                             {checkInLoading ? <CircularProgress size={24} /> : 'Xác nhận'}
//                         </Button>
//                     </DialogActions>
//                 </Dialog>

//                 <Snackbar
//                     open={snackbarOpen}
//                     autoHideDuration={6000}
//                     onClose={handleSnackbarClose}
//                     anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
//                 >
//                     <Alert onClose={handleSnackbarClose} severity={snackbarMessage === 'Quá giờ check-in!' ? 'warning' : 'success'} sx={{ width: '100%' }}>
//                         {snackbarMessage}
//                     </Alert>
//                 </Snackbar>

//                 <Box sx={{ backgroundColor: 'background.paper', borderRadius: 2, p: 3, boxShadow: 1 }}>
//                     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
//                         <Typography variant="h5" sx={{ fontWeight: 600 }}>Lịch sử chấm công</Typography>
//                         <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'background.default', borderRadius: 2, p: 1 }}>
//                             <IconButton onClick={() => handleMonthChange('prev')} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
//                                 <IconChevronLeft />
//                             </IconButton>
//                             <Typography variant="h6" sx={{ mx: 2, minWidth: 200, textAlign: 'center', fontWeight: 500 }}>
//                                 {format(currentDate, 'MM/yyyy', { locale: vi })}
//                             </Typography>
//                             <IconButton onClick={() => handleMonthChange('next')} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
//                                 <IconChevronRight />
//                             </IconButton>
//                         </Box>
//                     </Box>

//                     {loading ? (
//                         <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
//                             <CircularProgress />
//                         </Box>
//                     ) : (
//                         <>
//                             {attendanceData.length === 0 && (
//                                 <Box sx={{ mb: 2 }}>
//                                     <Alert severity="error" sx={{ width: '100%', boxShadow: 1 }}>
//                                         {error || `Không tìm thấy dữ liệu chấm công trong tháng ${format(currentDate, 'MM/yyyy', { locale: vi })}`}
//                                     </Alert>
//                                 </Box>
//                             )}
//                             <DataGrid
//                                 rows={attendanceData}
//                                 columns={columns}
//                                 pageSize={pageSize}
//                                 onPageSizeChange={setPageSize}
//                                 rowsPerPageOptions={[5, 10, 20]}
//                                 autoHeight
//                                 disableSelectionOnClick
//                                 initialState={{ sorting: { sortModel: [{ field: 'date', sort: 'desc' }] } }}
//                                 getRowClassName={(params) => `status-${params.row.status}`}
//                                 sx={{
//                                     border: '1px solid rgba(224, 224, 224, 1)',
//                                     '& .MuiDataGrid-root': { border: 'none' },
//                                     '& .MuiDataGrid-cell': { borderColor: 'divider' },
//                                     '& .MuiDataGrid-columnHeaders': { backgroundColor: 'background.default', borderColor: 'divider' },
//                                     '& .MuiDataGrid-cell:focus': { outline: 'none' },
//                                     '& .missing-time': { color: 'text.disabled' },
//                                     '& .MuiDataGrid-row.status-onTime': { backgroundColor: statusConfig.onTime.color },
//                                     '& .MuiDataGrid-row.status-late': { backgroundColor: statusConfig.late.color },
//                                     '& .MuiDataGrid-row.status-early': { backgroundColor: statusConfig.early.color },
//                                     '& .MuiDataGrid-row.status-pending': { backgroundColor: statusConfig.pending.color },
//                                     '& .MuiDataGrid-row:hover': { backgroundColor: 'action.hover' }
//                                 }}
//                             />
//                         </>
//                     )}
//                 </Box>
//             </DashboardCard>
//         </PageContainer>
//     );
// };

// export default HistoryCheckwork;