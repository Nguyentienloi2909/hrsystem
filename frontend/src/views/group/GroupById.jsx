import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Button, Typography, Card, CardContent, CardActions, Grid, CircularProgress, Alert,
    Avatar, Divider, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
    Menu, MenuItem
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { IconUserPlus, IconTrash, IconDotsVertical, IconInfoCircle, IconMessage } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import ApiService from 'src/service/ApiService';
import AddMemberModal from './modal/AddUser';
import Snackbar from '@mui/material/Snackbar';
import EmployeeInfoModal from './modal/UserInfo';
import PageContainer from '../../components/container/PageContainer';

// Styled components
const StyledContainer = styled(Box)(() => ({
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #e0f7fa 0%, #ffffff 100%)',
        opacity: 0.1,
        zIndex: -1,
    },
}));

const StyledHeader = styled(Box)(({ theme }) => ({
    background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
    borderRadius: theme.shape.borderRadius * 2,
    padding: theme.spacing(4),
    color: '#fff',
    textShadow: '1px 1px 3px rgba(0, 0, 0, 0.2)',
    transition: 'transform 0.3s ease',
    '&:hover': {
        transform: 'scale(1.02)',
    },
}));

const MemberCard = styled(Card)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius * 2,
    transition: 'all 0.3s ease',
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
        transform: 'translateY(-5px)',
        boxShadow: theme.shadows[8],
    },
}));

const GroupById = () => {
    const navigate = useNavigate();
    const [groupData, setGroupData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [groupId, setGroupId] = useState(null);
    const [openAddModal, setOpenAddModal] = useState(false);
    const [removingUserId, setRemovingUserId] = useState(null);
    const [removeError, setRemoveError] = useState('');
    const [removeSuccess, setRemoveSuccess] = useState('');
    const [confirmRemoveUserId, setConfirmRemoveUserId] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [isLeader, setIsLeader] = useState(false);
    const [employeeInfoOpen, setEmployeeInfoOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    // Lấy groupId từ API getUserProfile
    const fetchGroupId = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const userProfile = await ApiService.getUserProfile();
            if (!userProfile?.groupId) throw new Error('Bạn chưa gia nhập vào nhóm nào');
            setGroupId(userProfile.groupId);
            setIsLeader(userProfile.roleId === 2); // Giả sử roleId === 2 là Leader
        } catch (err) {
            if (err?.response?.status === 404) {
                setError('Bạn chưa gia nhập vào nhóm nào');
            } else {
                setError(err?.message === 'Không tìm thấy ID nhóm trong thông tin người dùng'
                    ? 'Bạn chưa gia nhập vào nhóm nào'
                    : (err?.message || 'Không thể lấy thông tin người dùng'));
            }
            setLoading(false);
        }
    }, []);

    // Lấy thông tin nhóm dựa trên groupId
    const fetchGroup = useCallback(async () => {
        if (!groupId) return;
        try {
            setLoading(true);
            setError('');
            const data = await ApiService.getGroup(groupId);
            if (!data?.id) throw new Error('Dữ liệu nhóm không hợp lệ');
            setGroupData(data);
        } catch (err) {
            if (err?.response?.status === 404) {
                setError('Bạn chưa gia nhập vào nhóm nào');
            } else {
                setError(err?.message === 'Dữ liệu nhóm không hợp lệ'
                    ? 'Bạn chưa gia nhập vào nhóm nào'
                    : (err?.message || 'Không thể tải thông tin nhóm'));
            }
        } finally {
            setLoading(false);
        }
    }, [groupId]);

    useEffect(() => { fetchGroupId(); }, [fetchGroupId]);
    useEffect(() => { fetchGroup(); }, [fetchGroup]);

    const handleAddMember = useCallback(updatedGroup => {
        setGroupData(updatedGroup);
    }, []);

    // Đổi handleRemoveMember: chỉ mở modal xác nhận
    const handleRemoveMember = useCallback((userId) => {
        setConfirmRemoveUserId(userId);
    }, []);

    // Hàm xác nhận xóa thực sự
    const handleConfirmRemove = useCallback(async () => {
        if (!confirmRemoveUserId) return;
        setRemoveError('');
        setRemoveSuccess('');
        setRemovingUserId(confirmRemoveUserId);
        try {
            await ApiService.removeUserFromGroup(groupData.id, confirmRemoveUserId);
            const updatedGroup = await ApiService.getGroup(groupData.id);
            setGroupData(updatedGroup);
            setRemoveSuccess('Xóa thành viên thành công!');
        } catch (err) {
            console.error('Lỗi khi xóa thành viên:', err);
            setRemoveError(
                err?.response?.data?.message ||
                err?.message ||
                'Không thể xóa thành viên. Bạn có thể không đủ quyền hoặc có lỗi hệ thống.'
            );
        } finally {
            setRemovingUserId(null);
            setConfirmRemoveUserId(null);
        }
    }, [confirmRemoveUserId, groupData]);

    // Mở/đóng dropdown
    const handleMenuOpen = (event, userId) => {
        setAnchorEl(event.currentTarget);
        setSelectedUserId(userId);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedUserId(null);
    };

    // Xử lý xem thông tin: mở modal
    const handleViewInfo = useCallback((userId) => {
        handleMenuClose(); // Đóng menu trước
        const user = groupData?.users?.find(u => u.id === userId);
        if (user) {
            setSelectedEmployee(user);
            setEmployeeInfoOpen(true);
        } else {
            console.error('Không tìm thấy thông tin thành viên với ID:', userId);
            setRemoveError('Không thể tải thông tin thành viên.');
        }
    }, [groupData]);

    // Xử lý nhắn tin
    const handleMessage = (userId) => {
        handleMenuClose();
        navigate(`/messages/${userId}`);
    };

    if (loading) {
        return (
            <PageContainer title="Quản lý nhóm" description="Chi tiết nhóm và thành viên">
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4, minHeight: '100vh', bgcolor: '#f5f5f5' }} aria-label="Đang tải dữ liệu">
                    <CircularProgress />
                </Box>
            </PageContainer>
        );
    }

    if (error) {
        return (
            <PageContainer title="Quản lý nhóm" description="Chi tiết nhóm và thành viên">
                <Box sx={{ p: 4, minHeight: '100vh', bgcolor: '#f5f5f5' }}>
                    <Alert severity="error" action={
                        <Button color="inherit" size="small" onClick={() => navigate(-1)}>
                            Quay lại
                        </Button>
                    }>
                        {error}
                    </Alert>
                </Box>
            </PageContainer>
        );
    }

    return (
        <PageContainer title="Quản lý nhóm" description="Chi tiết nhóm và thành viên">
            <StyledContainer sx={{ p: 4, maxWidth: 1200, mx: 'auto', borderRadius: 2, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}>
                {/* Header nhóm */}
                <StyledHeader sx={{ mb: 4 }}>
                    <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
                        {groupData.groupName}
                    </Typography>
                    <Typography variant="h5" color="inherit" gutterBottom>
                        {groupData.departmentName} | {groupData.users.length} thành viên
                    </Typography>
                    {isLeader && (
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<IconUserPlus size={20} />}
                            onClick={() => setOpenAddModal(true)}
                            sx={{
                                mt: 2,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 'medium',
                                background: 'linear-gradient(45deg, #2196f3, #21cbf3)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                                },
                            }}
                        >
                            Thêm thành viên
                        </Button>
                    )}
                </StyledHeader>

                <Divider sx={{ my: 4, borderColor: 'rgba(0, 0, 0, 0.12)' }} />

                {/* Danh sách thành viên */}
                <Typography variant="h4" gutterBottom fontWeight="bold" color="text.primary">
                    Danh sách thành viên
                </Typography>
                {removeError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {removeError}
                    </Alert>
                )}
                <Snackbar
                    open={!!removeSuccess}
                    autoHideDuration={3000}
                    onClose={() => setRemoveSuccess('')}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    message={removeSuccess}
                />
                <Grid container spacing={4}>
                    {groupData.users.map(user => (
                        <Grid item key={user.id} xs={12} sm={6} md={4}>
                            <MemberCard>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, position: 'relative' }}>
                                    <Avatar
                                        alt={user.fullName}
                                        src={user.avatar}
                                        sx={{ width: 60, height: 60, mr: 2, border: '2px solid #1976d2' }}
                                    />
                                    <CardContent sx={{ flexGrow: 1, p: 0, minWidth: 0 }}>
                                        <Typography
                                            variant="h6"
                                            fontWeight="bold"
                                            color="text.primary"
                                            sx={{
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                maxWidth: { xs: 120, sm: 160, md: 180 }
                                            }}
                                            title={user.fullName}
                                        >
                                            {user.fullName}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                maxWidth: { xs: 120, sm: 160, md: 180 }
                                            }}
                                            title={user.email}
                                        >
                                            {user.email}
                                        </Typography>
                                    </CardContent>
                                    <Box sx={{ position: 'absolute', top: 0, right: 0 }}>
                                        <IconButton
                                            aria-label="Tùy chọn"
                                            onClick={(event) => handleMenuOpen(event, user.id)}
                                            size="small"
                                        >
                                            <IconDotsVertical size={20} />
                                        </IconButton>
                                    </Box>
                                </Box>
                                <CardActions sx={{ justifyContent: 'flex-end', p: 0, minHeight: 36 }}>
                                    {/* Để trống hoặc thêm các action khác nếu cần */}
                                </CardActions>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl) && selectedUserId === user.id}
                                    onClose={handleMenuClose}
                                    PaperProps={{
                                        sx: {
                                            borderRadius: 2,
                                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                                            minWidth: 180,
                                        },
                                    }}
                                >
                                    <MenuItem onClick={() => handleViewInfo(user.id)}>
                                        <IconInfoCircle size={18} style={{ marginRight: 8 }} />
                                        Xem thông tin
                                    </MenuItem>
                                    <MenuItem onClick={() => handleMessage(user.id)}>
                                        <IconMessage size={18} style={{ marginRight: 8 }} />
                                        Nhắn tin
                                    </MenuItem>
                                    {isLeader && user.roleId !== 2 && (
                                        <MenuItem
                                            onClick={() => {
                                                handleRemoveMember(user.id);
                                                handleMenuClose();
                                            }}
                                            disabled={removingUserId === user.id}
                                            sx={{ color: '#f44336' }}
                                        >
                                            <IconTrash size={18} style={{ marginRight: 8 }} />
                                            {removingUserId === user.id ? 'Đang xóa...' : 'Xóa khỏi nhóm'}
                                        </MenuItem>
                                    )}
                                </Menu>
                            </MemberCard>
                        </Grid>
                    ))}
                </Grid>

                {/* Modal xác nhận xóa thành viên */}
                <Dialog
                    open={!!confirmRemoveUserId}
                    onClose={() => setConfirmRemoveUserId(null)}
                >
                    <DialogTitle>Xác nhận xóa thành viên</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Bạn có chắc chắn muốn xóa thành viên này khỏi nhóm?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setConfirmRemoveUserId(null)} color="primary">
                            Hủy
                        </Button>
                        <Button
                            onClick={handleConfirmRemove}
                            color="error"
                            variant="contained"
                            disabled={removingUserId === confirmRemoveUserId}
                        >
                            {removingUserId === confirmRemoveUserId ? 'Đang xóa...' : 'Xác nhận'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Modal Thêm thành viên */}
                <AddMemberModal
                    open={openAddModal}
                    onClose={() => setOpenAddModal(false)}
                    groupId={groupData?.id}
                    onAdd={handleAddMember}
                />

                {/* Modal hiển thị thông tin thành viên */}
                <EmployeeInfoModal
                    employee={selectedEmployee}
                    open={employeeInfoOpen}
                    onClose={() => {
                        setEmployeeInfoOpen(false);
                        setSelectedEmployee(null);
                    }}
                />
            </StyledContainer>
        </PageContainer>
    );
};

const MemoizedGroupById = React.memo(GroupById);
export default MemoizedGroupById;