// src/views/task/task.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Card, Typography, Box, Chip, Tabs, Tab,
    Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, CircularProgress, Button, Dialog, DialogTitle, DialogContent, DialogActions,
    IconButton, Tooltip, TablePagination,
} from '@mui/material';
import {
    IconPlus, IconCheck, IconClockHour4, IconClock, IconAlertCircle,
    IconDownload, // Thêm IconDownload vì đã sử dụng trong cột Tài liệu
} from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import { useNavigate } from 'react-router-dom';
import AddTaskPage from './Add';
import ApiService from '../../service/ApiService';
import TaskActions from './TaskActions';
import { useUser } from 'src/contexts/UserContext';

const defaultStatusConfig = {
    pending: { label: 'Chờ xử lý', color: 'warning', icon: <IconClock size={16} /> },
    inprogress: { label: 'Đang thực hiện', color: 'primary', icon: <IconClockHour4 size={16} /> },
    late: { label: 'Muộn', color: 'error', icon: <IconAlertCircle size={16} /> },
    completed: { label: 'Hoàn thành', color: 'success', icon: <IconCheck size={16} /> },
    cancelled: { label: 'Đã hủy', color: 'default', icon: <IconAlertCircle size={16} /> },
};

const createStatusConfig = (statusList) => {
    const config = { ...defaultStatusConfig };
    statusList.forEach(status => {
        const key = status.name?.toLowerCase().replace(/\s+/g, '');
        if (key) {
            config[key] = {
                ...defaultStatusConfig[key],
                label: defaultStatusConfig[key]?.label || status.name,
                color: defaultStatusConfig[key]?.color || 'default',
                icon: defaultStatusConfig[key]?.icon || <IconClock size={16} />,
            };
        }
    });
    return config;
};

import PropTypes from 'prop-types';

const TaskStatusChip = React.memo(function TaskStatusChip({ status, statusConfig }) {
    const key = status?.toLowerCase().replace(/\s+/g, '');
    const config = (statusConfig && statusConfig[key]) || defaultStatusConfig[key] || {
        label: 'Không xác định',
        color: 'default',
        icon: <IconClock size={16} />,
    };
    return (
        <Chip
            icon={config.icon}
            label={config.label}
            color={config.color}
            size="small"
            sx={{ minWidth: 120 }}
        />
    );
});

TaskStatusChip.displayName = 'TaskStatusChip';

TaskStatusChip.propTypes = {
    status: PropTypes.string,
    statusConfig: PropTypes.object,
};

const Task = () => {
    const navigate = useNavigate();
    const { user } = useUser();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedTab, setSelectedTab] = useState(0);
    const [error, setError] = useState(null);
    const [openAddTaskDialog, setOpenAddTaskDialog] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null, taskId: null });
    const [confirmUpdateDialog, setConfirmUpdateDialog] = useState({ open: false, task: null });
    const [statusList, setStatusList] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [notify, setNotify] = useState({
        open: false,
        type: 'success', // 'success' | 'error'
        message: '',
    });

    // Memo hóa statusConfig
    const statusConfig = useMemo(() => createStatusConfig(statusList), [statusList]);

    const fetchStatusList = useCallback(async () => {
        try {
            const statuses = await ApiService.getStatusTask();
            console.log('Status List:', statuses);
            setStatusList(statuses);
        } catch (err) {
            setError('Không thể tải danh sách trạng thái.');
        }
    }, []);

    const fetchTasks = useCallback(async () => {
        if (!user.isAuthenticated || !user.userId) return;
        try {
            setLoading(true);
            setError(null);
            const role = sessionStorage.getItem('role') || user.role;
            let userTasks = [];
            if (role === 'LEADER') {
                userTasks = await ApiService.getTasksByLeader(user.userId);
            } else {
                userTasks = await ApiService.getTasksByUser(user.userId);
            }
            console.log('Fetched tasks:', userTasks);
            setTasks(userTasks || []);
        } catch (err) {
            setError('Không thể tải danh sách nhiệm vụ.');
        } finally {
            setLoading(false);
        }
    }, [user.isAuthenticated, user.userId, user.role]);

    useEffect(() => {
        if (user.isAuthenticated && user.userId) {
            fetchTasks();
            fetchStatusList();
        }
    }, [user.isAuthenticated, user.userId, fetchTasks, fetchStatusList]);

    const tabs = useMemo(() => [
        { label: "Tất cả", value: "all" },
        ...statusList.map(status => ({
            label: statusConfig[status.name?.toLowerCase().replace(/\s+/g, '')]?.label || status.name,
            value: status.name?.toLowerCase().replace(/\s+/g, ''),
        })),
    ], [statusList, statusConfig]);

    const filteredTasks = useMemo(() => {
        const currentStatus = tabs[selectedTab]?.value;
        if (!currentStatus || currentStatus === 'all') return tasks;
        const filtered = tasks.filter(task => task.status?.toLowerCase().replace(/\s+/g, '') === currentStatus);
        console.log('Filtered tasks:', filtered);
        return filtered;
    }, [tasks, tabs, selectedTab]);

    // Phân trang dữ liệu nhiệm vụ đã lọc
    const pagedTasks = useMemo(() => {
        const start = page * rowsPerPage;
        return filteredTasks.slice(start, start + rowsPerPage);
    }, [filteredTasks, page, rowsPerPage]);

    const viewTaskDetails = useCallback((taskId) => {
        console.log('View task details:', taskId);
        navigate(`/manage/task/${taskId}`);
    }, [navigate]);

    const handleDelete = useCallback((taskId, event) => {
        event.stopPropagation();
        setConfirmDialog({ open: true, action: 'delete', taskId });
    }, []);

    const handleEdit = useCallback((taskId, event) => {
        event.stopPropagation();
        navigate(`/manage/task/update/${taskId}`);
    }, [navigate]);

    // Hàm cập nhật trạng thái nhiệm vụ cho USER
    const handleUpdateStatus = useCallback((task) => {
        setConfirmUpdateDialog({ open: true, task });
    }, []);

    const showNotify = useCallback((type, message) => {
        setNotify({ open: true, type, message });
    }, []);

    // Các callback sử dụng showNotify phải nằm sau đây!
    const confirmAction = useCallback(async () => {
        const { action, taskId } = confirmDialog;
        if (action === 'delete') {
            try {
                await ApiService.deleteTask(taskId);
                setTasks(prevTasks => {
                    const updated = prevTasks.filter(task => task.id !== taskId);
                    console.log('Tasks after delete:', updated);
                    return updated;
                });
                showNotify('success', 'Xóa nhiệm vụ thành công!');
            } catch {
                showNotify('error', 'Không thể xóa nhiệm vụ. Vui lòng thử lại.');
            }
        }
        setConfirmDialog({ open: false, action: null, taskId: null });
    }, [confirmDialog, showNotify]);

    const handleAddTask = useCallback(async (newTask) => {
        try {
            if (!newTask.title || !newTask.description || !newTask.startTime || !newTask.endTime || !newTask.assignedToId) {
                showNotify('error', 'Vui lòng điền đầy đủ thông tin.');
                return;
            }
            // Lấy senderId và senderName từ sessionStorage hoặc context
            const senderId = sessionStorage.getItem('userId') || user.userId;
            const senderName = sessionStorage.getItem('fullName') || user.fullName;

            const formData = new FormData();
            formData.append('Title', newTask.title);
            formData.append('Description', newTask.description);
            formData.append('File', newTask.file);
            formData.append('StartTime', newTask.startTime);
            formData.append('EndTime', newTask.endTime);
            formData.append('AssignedToId', newTask.assignedToId);
            formData.append('AssignedToName', newTask.assignedToName || '');
            formData.append('SenderId', senderId);
            formData.append('SenderName', senderName);

            const createdTask = await ApiService.createTask(formData);
            setTasks(prev => [...prev, createdTask]);
            setOpenAddTaskDialog(false);
            showNotify('success', 'Thêm nhiệm vụ thành công!');
        } catch {
            showNotify('error', 'Không thể thêm nhiệm vụ. Vui lòng thử lại.');
        }
    }, [user, showNotify]);

    const handleConfirmUpdateStatus = useCallback(async () => {
        const task = confirmUpdateDialog.task;
        if (!task?.id) return;
        try {
            await ApiService.updateTaskStatus(task.id);
            fetchTasks();
            showNotify('success', 'Cập nhật trạng thái thành công!');
        } catch (error) {
            showNotify('error', 'Cập nhật trạng thái thất bại!');
            console.error('Update status error:', error);
        }
        setConfirmUpdateDialog({ open: false, task: null });
    }, [confirmUpdateDialog.task, fetchTasks, showNotify]);

    // Xử lý thay đổi trang
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    // Xử lý thay đổi số dòng/trang
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Reset về trang đầu khi filter thay đổi
    useEffect(() => {
        setPage(0);
    }, [filteredTasks]);

    return (
        <PageContainer title="Nhiệm vụ của tôi" description="Danh sách nhiệm vụ được giao">
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" fontWeight="bold">
                        Quản lý nhiệm vụ
                    </Typography>
                    {((sessionStorage.getItem('role') || user.role) === 'LEADER') && (
                        <Button
                            variant="contained"
                            startIcon={<IconPlus />}
                            onClick={() => setOpenAddTaskDialog(true)}
                        >
                            Thêm nhiệm vụ
                        </Button>
                    )}
                </Box>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    {filteredTasks.length} nhiệm vụ được tìm thấy
                </Typography>
                <Tabs
                    value={selectedTab}
                    onChange={(e, newValue) => setSelectedTab(newValue)}
                    sx={{
                        borderBottom: 1,
                        borderColor: 'divider',
                        '& .MuiTab-root': {
                            minWidth: 120,
                            fontWeight: 500,
                        },
                    }}
                >
                    {tabs.map((tab, index) => (
                        <Tab
                            key={tab.value}
                            label={tab.label}
                            id={`task-tab-${index}`}
                            aria-controls={`task-tabpanel-${index}`}
                        />
                    ))}
                </Tabs>
            </Box>

            <Card sx={{ borderRadius: 2 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Box sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
                        {error}
                    </Box>
                ) : !user.isAuthenticated ? (
                    <Box sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
                        Vui lòng đăng nhập để xem nhiệm vụ
                    </Box>
                ) : (
                    <>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Tiêu đề</TableCell>
                                        <TableCell>Người thực hiện</TableCell>
                                        <TableCell align="center">Tài liệu</TableCell>
                                        <TableCell align="center">Trạng thái</TableCell>
                                        <TableCell>Ngày bắt đầu</TableCell>
                                        <TableCell>Ngày kết thúc</TableCell>
                                        <TableCell align="center">Thao tác</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {pagedTasks.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center">
                                                Không có nhiệm vụ nào
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        pagedTasks.map((task) => (
                                            <TableRow
                                                key={task.id}
                                                hover
                                                onClick={() => viewTaskDetails(task.id)}
                                                sx={{ cursor: 'pointer' }}
                                            >
                                                <TableCell>
                                                    <Typography variant="subtitle2">{task.title}</Typography>
                                                </TableCell>
                                                <TableCell>{task.assignedToName}</TableCell>
                                                <TableCell align="center">
                                                    {task.urlFile ? (
                                                        <Tooltip title="Tải tài liệu">
                                                            <IconButton
                                                                size="small"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    window.open(task.urlFile, '_blank');
                                                                }}
                                                            >
                                                                <IconDownload size={18} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    ) : (
                                                        'Không có'
                                                    )}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <TaskStatusChip status={task.status} statusConfig={statusConfig} />
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(task.startTime).toLocaleDateString('vi-VN')}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(task.endTime).toLocaleDateString('vi-VN')}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <TaskActions
                                                        task={task}
                                                        onEdit={handleEdit}
                                                        onDelete={handleDelete}
                                                        onUpdateStatus={handleUpdateStatus}
                                                        role={user.role}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            component="div"
                            count={filteredTasks.length}
                            page={page}
                            onPageChange={handleChangePage}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            labelRowsPerPage="Số dòng mỗi trang"
                            rowsPerPageOptions={[5, 10, 20, 50]}
                        />
                    </>
                )}
            </Card>

            <Dialog
                open={confirmDialog.open}
                onClose={() => setConfirmDialog({ open: false, action: null, taskId: null })}
            >
                <DialogTitle>Xác nhận</DialogTitle>
                <DialogContent>
                    Bạn có chắc chắn muốn xóa nhiệm vụ này?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialog({ open: false, action: null, taskId: null })} color="primary">
                        Hủy
                    </Button>
                    <Button onClick={confirmAction} color="primary" variant="contained">
                        Xác nhận
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={confirmUpdateDialog.open}
                onClose={() => setConfirmUpdateDialog({ open: false, task: null })}
            >
                <DialogTitle>Xác nhận cập nhật trạng thái</DialogTitle>
                <DialogContent>
                    Bạn có chắc chắn muốn cập nhật trạng thái nhiệm vụ này?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmUpdateDialog({ open: false, task: null })} color="primary">
                        Hủy
                    </Button>
                    <Button onClick={handleConfirmUpdateStatus} color="primary" variant="contained">
                        Xác nhận
                    </Button>
                </DialogActions>
            </Dialog>

            <AddTaskPage
                open={openAddTaskDialog}
                onClose={() => setOpenAddTaskDialog(false)}
                onAdd={handleAddTask}
            />

            {/* Chỉ giữ lại modal notify */}
            <Dialog
                open={notify.open}
                onClose={() => setNotify(n => ({ ...n, open: false }))}
            >
                <DialogTitle>
                    {notify.type === 'success' ? 'Thông báo' : 'Lỗi'}
                </DialogTitle>
                <DialogContent>
                    <Typography color={notify.type === 'success' ? 'green' : 'error'}>
                        {notify.message}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setNotify(n => ({ ...n, open: false }))}
                        variant="contained"
                        color={notify.type === 'success' ? 'primary' : 'error'}
                    >
                        Đóng
                    </Button>
                </DialogActions>
            </Dialog>
        </PageContainer>
    );
};

export default Task;