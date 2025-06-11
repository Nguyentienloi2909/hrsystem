import { useEffect, useState } from 'react';
import {
    Grid,
    Paper,
    Typography,
    Box,
    Card,
    CardContent,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Tooltip,
} from '@mui/material';
import PageContainer from '../../components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import { Button } from '@mui/material';
import { IconPlus, IconClipboardCheck } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../service/ApiService';
import LeaveRequestDetail from '../attendance/LeaveRequestDetail'; // Đường dẫn tùy cấu trúc dự án

const NLeave = () => {
    const navigate = useNavigate();
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    // Thống kê động
    // const [totalDays, setTotalDays] = useState(0);
    const [pendingCount, setPendingCount] = useState(0);
    const [approvedCount, setApprovedCount] = useState(0);
    const [rejectedCount, setRejectedCount] = useState(0);
    const [totalRequests, setTotalRequests] = useState(0);

    // Phân trang
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    // Get user from session storage
    const sessionUser = JSON.parse(sessionStorage.getItem('userProfile')) || {};
    const isLeader = sessionUser.roleName === 'LEADER';

    const [selectedRequest, setSelectedRequest] = useState(null);
    const [openDetail, setOpenDetail] = useState(false);

    useEffect(() => {
        const fetchLeaves = async () => {
            try {
                const userId = sessionUser.id;
                if (userId) {
                    const data = await ApiService.getLeaveRequestsByUser(userId);
                    const userRequests = (data || []).filter(r => r.senderId === userId);
                    setLeaveRequests(userRequests);
                    setTotalRequests(userRequests.length);

                    let pending = 0;
                    let approved = 0;
                    let rejected = 0;
                    userRequests.forEach(r => {
                        if (r.status?.toLowerCase() === 'pending') {
                            pending++;
                        }
                        if (r.status?.toLowerCase() === 'approved') {
                            approved++;
                        }
                        if (r.status?.toLowerCase() === 'rejected') {
                            rejected++;
                        }
                    });
                    setPendingCount(pending);
                    setApprovedCount(approved);
                    setRejectedCount(rejected);
                }
            } catch (err) {
                setLeaveRequests([]);
                setTotalRequests(0);
                // setTotalDays(0);
                setPendingCount(0);
                setApprovedCount(0);
                setRejectedCount(0);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaves();
        // eslint-disable-next-line
    }, [sessionUser.id]);

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

    // Xử lý phân trang
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Lấy dữ liệu trang hiện tại
    const pagedRequests = leaveRequests.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <PageContainer title="Thống kê nghỉ phép" description="Theo dõi đơn xin nghỉ phép">
            <DashboardCard>
                {/* Header Section */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5">Thống kê nghỉ phép</Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        {isLeader && (
                            <Button
                                variant="outlined"
                                color="primary"
                                startIcon={<IconClipboardCheck />}
                                onClick={() => navigate('/manage/attendance/hrleave')}
                            >
                                Duyệt nghỉ phép
                            </Button>
                        )}
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<IconPlus />}
                            onClick={() => navigate('/leave')}
                        >
                            Tạo đơn xin nghỉ phép
                        </Button>
                    </Box>
                </Box>

                <Grid container spacing={3}>
                    {/* Summary Section */}
                    <Grid item xs={12}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={3}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>Tổng số đơn</Typography>
                                        <Typography variant="h3" color="info.main">{totalRequests}</Typography>
                                        <Typography variant="body2" color="textSecondary">Tất cả đơn xin nghỉ phép</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>Đơn đang chờ duyệt</Typography>
                                        <Typography variant="h3" color="warning.main">{pendingCount}</Typography>
                                        <Typography variant="body2" color="textSecondary">Đơn xin phép</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>Đơn đã duyệt</Typography>
                                        <Typography variant="h3" color="success.main">{approvedCount}</Typography>
                                        <Typography variant="body2" color="textSecondary">Đơn xin phép</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>Đơn bị hủy</Typography>
                                        <Typography variant="h3" color="error.main">{rejectedCount}</Typography>
                                        <Typography variant="body2" color="textSecondary">Đơn xin phép</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Table Section */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>Đơn xin nghỉ phép gần đây</Typography>
                            {loading ? (
                                <Typography>Đang tải dữ liệu...</Typography>
                            ) : (
                                <>
                                    <TableContainer>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Ngày bắt đầu</TableCell>
                                                    <TableCell>Ngày kết thúc</TableCell>
                                                    <TableCell>Lý do</TableCell>
                                                    <TableCell>Người duyệt</TableCell>
                                                    <TableCell>Số ngày nghỉ</TableCell>
                                                    <TableCell>Trạng thái</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {pagedRequests.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                                            Chưa có đơn nghỉ phép
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    pagedRequests.map((request) => {
                                                        // Tính số ngày nghỉ (bao gồm cả ngày bắt đầu và kết thúc)
                                                        let days = '';
                                                        if (request.startDate && request.endDate) {
                                                            const start = new Date(request.startDate);
                                                            const end = new Date(request.endDate);
                                                            days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);
                                                        }
                                                        return (
                                                            <TableRow
                                                                key={request.id}
                                                                hover
                                                                sx={{ cursor: 'pointer' }}
                                                                onClick={() => {
                                                                    setSelectedRequest(request);
                                                                    setOpenDetail(true);
                                                                }}
                                                            >
                                                                <TableCell>
                                                                    {request.startDate ? new Date(request.startDate).toLocaleDateString('vi-VN') : ''}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {request.endDate ? new Date(request.endDate).toLocaleDateString('vi-VN') : ''}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Tooltip title={request.reason || ''}>
                                                                        <span>
                                                                            {request.reason && request.reason.length > 40
                                                                                ? request.reason.slice(0, 40) + '...'
                                                                                : request.reason}
                                                                        </span>
                                                                    </Tooltip>
                                                                </TableCell>
                                                                <TableCell>{request.acceptorName || '—'}</TableCell>
                                                                <TableCell>{days}</TableCell>
                                                                <TableCell>
                                                                    <Chip
                                                                        label={getStatusLabel(request.status)}
                                                                        color={getStatusColor(request.status)}
                                                                        size="small"
                                                                    />
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })
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
                                        rowsPerPageOptions={[5, 10, 20]}
                                    />
                                </>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </DashboardCard>
            <LeaveRequestDetail
                open={openDetail}
                onClose={() => setOpenDetail(false)}
                request={selectedRequest}
            />
        </PageContainer>
    );
};

export default NLeave;