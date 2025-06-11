import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Chip,
    Stack
} from '@mui/material';
import PropTypes from 'prop-types';

const calcDays = (start, end) => {
    if (!start || !end) return '';
    const s = new Date(start);
    const e = new Date(end);
    return Math.max(1, Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1);
};

const LeaveRequestDetail = ({ open, onClose, request }) => {
    if (!request) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                Chi tiết đơn nghỉ phép
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2}>
                    <Box>
                        <Typography variant="subtitle2" color="text.secondary">Người gửi:</Typography>
                        <Typography variant="body1">{request.senderName}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="subtitle2" color="text.secondary">Ngày bắt đầu:</Typography>
                        <Typography variant="body1">
                            {request.startDate ? new Date(request.startDate).toLocaleDateString('vi-VN') : '—'}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="subtitle2" color="text.secondary">Ngày kết thúc:</Typography>
                        <Typography variant="body1">
                            {request.endDate ? new Date(request.endDate).toLocaleDateString('vi-VN') : '—'}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="subtitle2" color="text.secondary">Số ngày nghỉ:</Typography>
                        <Typography variant="body1">
                            {calcDays(request.startDate, request.endDate) || '—'}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="subtitle2" color="text.secondary">Lý do:</Typography>
                        <Typography variant="body1">{request.reason || '—'}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="subtitle2" color="text.secondary">Người duyệt:</Typography>
                        <Typography variant="body1">{request.acceptorName || '—'}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="subtitle2" color="text.secondary">Trạng thái:</Typography>
                        <Chip
                            label={
                                request.status?.toLowerCase() === 'approved'
                                    ? 'Đã duyệt'
                                    : request.status?.toLowerCase() === 'pending'
                                        ? 'Đang chờ'
                                        : request.status?.toLowerCase() === 'rejected'
                                            ? 'Từ chối'
                                            : request.status || '—'
                            }
                            color={
                                request.status?.toLowerCase() === 'approved'
                                    ? 'success'
                                    : request.status?.toLowerCase() === 'pending'
                                        ? 'warning'
                                        : request.status?.toLowerCase() === 'rejected'
                                            ? 'error'
                                            : 'default'
                            }
                            size="small"
                            sx={{ fontWeight: 'bold', fontSize: 13 }}
                        />
                    </Box>
                    {request.createdAt && (
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">Ngày tạo đơn:</Typography>
                            <Typography variant="body2">
                                {new Date(request.createdAt).toLocaleString('vi-VN')}
                            </Typography>
                        </Box>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button onClick={onClose} color="primary" variant="contained" size="large">
                    Đóng
                </Button>
            </DialogActions>
        </Dialog>
    );
};

LeaveRequestDetail.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    request: PropTypes.shape({
        senderName: PropTypes.string,
        startDate: PropTypes.string,
        endDate: PropTypes.string,
        reason: PropTypes.string,
        acceptorName: PropTypes.string,
        status: PropTypes.string,
        createdAt: PropTypes.string,
    }),
};

export default LeaveRequestDetail;