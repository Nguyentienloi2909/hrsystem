import { useEffect, useState, useMemo } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Chip,
    Snackbar,
    Alert,
    CircularProgress,
    Tooltip,
    TablePagination,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { IconArrowLeft } from '@tabler/icons-react';
import ApiService from '../../service/ApiService';
import PageContainer from '../../components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import LeaveRequestDetail from './LeaveRequestDetail';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const HRLeave = () => {
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [openDetail, setOpenDetail] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [confirmAction, setConfirmAction] = useState({ open: false, type: '', requestId: null });
    const navigate = useNavigate();

    const sessionUser = useMemo(() => JSON.parse(sessionStorage.getItem('userProfile')) || {}, []);
    const isAdmin = sessionUser.roleName === 'ADMIN';
    const isLeader = sessionUser.roleName === 'LEADER';

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                let data = [];
                if (isAdmin) {
                    data = await ApiService.getAllLeaveRequests();
                } else if (isLeader) {
                    const groupId = sessionUser.groupId;
                    if (groupId) {
                        const allLeaveRequests = await ApiService.getAllLeaveRequests();
                        const groupInfo = await ApiService.getGroup(groupId);
                        if (groupInfo && groupInfo.users && Array.isArray(groupInfo.users)) {
                            const groupMemberIds = groupInfo.users.map(user => user.id);
                            data = allLeaveRequests.filter(request =>
                                groupMemberIds.includes(request.senderId) &&
                                request.senderId !== sessionUser.id
                            );
                        }
                    }
                }
                setLeaveRequests(Array.isArray(data) ? data : []);
            } catch (err) {
                setError(`Không thể tải danh sách đơn nghỉ phép: ${err.response?.data?.message || err.message}`);
            } finally {
                setLoading(false);
            }
        };

        if (sessionUser.id) {
            fetchData();
        } else {
            setError('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
            setLoading(false);
        }
    }, [isAdmin, isLeader, sessionUser, sessionUser.id]);

    const handleApprove = async (id) => {
        setActionLoading(id);
        setError('');
        try {
            await ApiService.approveLeaveRequest(id);
            setSuccess('Duyệt đơn thành công!');
            setLeaveRequests((prev) =>
                prev.map((item) =>
                    item.id === id ? { ...item, status: 'Approved' } : item
                )
            );
        } catch (err) {
            setError(`Duyệt đơn thất bại: ${err.response?.data?.message || err.message}`);
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id) => {
        setActionLoading(id);
        setError('');
        try {
            await ApiService.cancelLeaveRequest(id);
            setSuccess('Từ chối đơn thành công!');
            setLeaveRequests((prev) =>
                prev.map((item) =>
                    item.id === id ? { ...item, status: 'Rejected' } : item
                )
            );
        } catch (err) {
            setError(`Từ chối đơn thất bại: ${err.response?.data?.message || err.message}`);
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusLabel = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved':
                return 'Đã duyệt';
            case 'pending':
                return 'Đang chờ';
            case 'rejected':
                return 'Từ chối';
            default:
                return status || 'Unknown';
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved':
                return 'success';
            case 'pending':
                return 'warning';
            case 'rejected':
                return 'error';
            default:
                return 'default';
        }
    };

    const calcDays = (start, end) => {
        if (!start || !end) return '';
        const s = new Date(start);
        const e = new Date(end);
        return Math.max(1, Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1);
    };

    const pagedRequests = leaveRequests.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <PageContainer title="Quản lý đơn nghỉ phép" description="Duyệt đơn nghỉ phép cho Leader/Admin">
            <DashboardCard>
                <Box sx={{ mb: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<IconArrowLeft />}
                        onClick={() => navigate(-1)}
                    >
                        Trở về
                    </Button>
                </Box>
                <Typography variant="h4" gutterBottom fontWeight="bold" align="center">
                    Danh sách đơn nghỉ phép
                </Typography>
                <Paper sx={{ p: 3, mt: 2 }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Người gửi</TableCell>
                                            <TableCell>Ngày bắt đầu</TableCell>
                                            <TableCell>Ngày kết thúc</TableCell>
                                            <TableCell>Lý do</TableCell>
                                            <TableCell>Người duyệt</TableCell>
                                            <TableCell>Số ngày nghỉ</TableCell>
                                            <TableCell>Trạng thái</TableCell>
                                            <TableCell align="center">Hành động</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {pagedRequests.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                                    Chưa có đơn nghỉ phép
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            pagedRequests.map((request) => (
                                                <TableRow
                                                    key={request.id}
                                                    hover
                                                    onClick={() => { setSelectedRequest(request); setOpenDetail(true); }}
                                                    sx={{ cursor: 'pointer' }}
                                                >
                                                    <TableCell>{request.senderName}</TableCell>
                                                    <TableCell>{request.startDate ? new Date(request.startDate).toLocaleDateString('vi-VN') : ''}</TableCell>
                                                    <TableCell>{request.endDate ? new Date(request.endDate).toLocaleDateString('vi-VN') : ''}</TableCell>
                                                    <TableCell>{request.reason}</TableCell>
                                                    <TableCell>{request.acceptorName || '—'}</TableCell>
                                                    <TableCell>{calcDays(request.startDate, request.endDate)}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={getStatusLabel(request.status)}
                                                            color={getStatusColor(request.status)}
                                                            size="small"
                                                            sx={{ fontWeight: 'bold', fontSize: 13 }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        {request.status?.toLowerCase() === 'pending' && (
                                                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                                                                <Tooltip title="Duyệt đơn">
                                                                    <span>
                                                                        <IconButton
                                                                            color="success"
                                                                            size="large"
                                                                            sx={{
                                                                                bgcolor: 'success.lighter',
                                                                                '&:hover': { bgcolor: 'success.light' },
                                                                                borderRadius: 2,
                                                                            }}
                                                                            disabled={actionLoading === request.id}
                                                                            onClick={e => {
                                                                                e.stopPropagation();
                                                                                setConfirmAction({ open: true, type: 'approve', requestId: request.id });
                                                                            }}
                                                                        >
                                                                            {actionLoading === request.id && confirmAction.type === 'approve' ? (
                                                                                <CircularProgress size={28} color="inherit" />
                                                                            ) : (
                                                                                <CheckCircleIcon sx={{ fontSize: 32 }} />
                                                                            )}
                                                                        </IconButton>
                                                                    </span>
                                                                </Tooltip>
                                                                <Tooltip title="Từ chối đơn">
                                                                    <span>
                                                                        <IconButton
                                                                            color="error"
                                                                            size="large"
                                                                            sx={{
                                                                                bgcolor: 'error.lighter',
                                                                                '&:hover': { bgcolor: 'error.light' },
                                                                                borderRadius: 2,
                                                                            }}
                                                                            disabled={actionLoading === request.id}
                                                                            onClick={e => {
                                                                                e.stopPropagation();
                                                                                setConfirmAction({ open: true, type: 'reject', requestId: request.id });
                                                                            }}
                                                                        >
                                                                            {actionLoading === request.id && confirmAction.type === 'reject' ? (
                                                                                <CircularProgress size={28} color="inherit" />
                                                                            ) : (
                                                                                <CancelIcon sx={{ fontSize: 32 }} />
                                                                            )}
                                                                        </IconButton>
                                                                    </span>
                                                                </Tooltip>
                                                            </Box>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination
                                component="div"
                                count={leaveRequests.length}
                                page={page}
                                onPageChange={handleChangePage}
                                rowsPerPage={rowsPerPage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                labelRowsPerPage="Số dòng mỗi trang"
                                rowsPerPageOptions={[5, 10, 20, 50]}
                            />
                        </>
                    )}
                </Paper>
                <Snackbar
                    open={!!success}
                    autoHideDuration={2500}
                    onClose={() => setSuccess('')}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert severity="success" sx={{ width: '100%' }}>
                        {success}
                    </Alert>
                </Snackbar>
                <Snackbar
                    open={!!error}
                    autoHideDuration={4000}
                    onClose={() => setError('')}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert severity="error" sx={{ width: '100%' }}>
                        {error}
                    </Alert>
                </Snackbar>
                <LeaveRequestDetail
                    open={openDetail}
                    onClose={() => setOpenDetail(false)}
                    request={selectedRequest}
                />
                <Dialog
                    open={confirmAction.open}
                    onClose={() => setConfirmAction({ open: false, type: '', requestId: null })}
                >
                    <DialogTitle>
                        Xác nhận {confirmAction.type === 'approve' ? 'duyệt' : 'từ chối'} đơn
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Bạn có chắc chắn muốn {confirmAction.type === 'approve' ? 'duyệt' : 'từ chối'} đơn nghỉ phép này không?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => setConfirmAction({ open: false, type: '', requestId: null })}
                            color="inherit"
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={async () => {
                                if (confirmAction.type === 'approve') {
                                    await handleApprove(confirmAction.requestId);
                                } else if (confirmAction.type === 'reject') {
                                    await handleReject(confirmAction.requestId);
                                }
                                setConfirmAction({ open: false, type: '', requestId: null });
                            }}
                            color={confirmAction.type === 'approve' ? 'success' : 'error'}
                            variant="contained"
                            autoFocus
                        >
                            Xác nhận
                        </Button>
                    </DialogActions>
                </Dialog>
            </DashboardCard>
        </PageContainer>
    );
};

export default HRLeave;