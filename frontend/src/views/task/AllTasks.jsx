import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Typography, Box, TextField, Chip, Stack, FormControl, InputLabel, Select, MenuItem,
    CircularProgress, Tooltip, IconButton
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import ApiService from '../../service/ApiService';
import { useNavigate } from 'react-router-dom';

const Tasks = () => {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        try {
            const data = await ApiService.getAllTasks();
            setTasks(data);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleEdit = useCallback((taskId) => {
        navigate(`/manage/task/update/${taskId}`);
    }, [navigate]);

    const handleDelete = useCallback(async (taskId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa nhiệm vụ này?')) {
            try {
                await ApiService.deleteTask(taskId);
                await fetchTasks();
            } catch (error) {
                alert('Không thể xóa nhiệm vụ. Vui lòng thử lại.');
            }
        }
    }, [fetchTasks]);

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'completed': return 'success';
            case 'in progress': return 'success';
            case 'pending': return 'warning';
            case 'late': return 'error';
            case 'cancelled': return 'default'; // Thêm dòng này cho "Đã hủy"
            default: return 'default';
        }
    };

    const filteredTasks = useMemo(() => tasks
        .filter(task =>
            task.title.toLowerCase().includes(searchText.toLowerCase()) ||
            task.description.toLowerCase().includes(searchText.toLowerCase())
        )
        .filter(task =>
            statusFilter === 'all' || task.status.toLowerCase() === statusFilter.toLowerCase()
        ), [tasks, searchText, statusFilter]);

    const columns = [
        {
            field: 'title',
            headerName: 'Tiêu đề',
            flex: 1,
            minWidth: 150,
            renderCell: (params) => (
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                    {params.value}
                </Typography>
            )
        },
        // Ẩn cột Mô tả
        // {
        //     field: 'description',
        //     headerName: 'Mô tả',
        //     flex: 1,
        //     minWidth: 200,
        //     renderCell: (params) => (
        //         <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        //             {params.value}
        //         </Typography>
        //     )
        // },
        // Ẩn cột Tài liệu
        // {
        //     field: 'urlFile',
        //     headerName: 'Tài liệu',
        //     width: 100,
        //     align: 'center',
        //     headerAlign: 'center',
        //     renderCell: (params) => (
        //         params.value ? (
        //             <Tooltip title="Tải xuống tài liệu">
        //                 <IconButton
        //                     size="small"
        //                     color="primary"
        //                     component="a"
        //                     href={params.value}
        //                     target="_blank"
        //                     rel="noopener noreferrer"
        //                 >
        //                     <IconDownload />
        //                 </IconButton>
        //             </Tooltip>
        //         ) : (
        //             <Typography variant="caption" color="text.secondary">N/A</Typography>
        //         )
        //     )
        // },
        {
            field: 'status',
            headerName: 'Trạng thái',
            width: 120,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Chip
                    size="small"
                    label={
                        params.value.toLowerCase() === 'cancelled'
                            ? 'Đã hủy'
                            : params.value
                    }
                    color={getStatusColor(params.value)}
                    sx={{ borderRadius: 1, fontWeight: 500 }}
                />
            )
        },
        {
            field: 'startTime',
            headerName: 'Ngày bắt đầu',
            width: 120,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Typography variant="body2">
                    {new Date(params.value).toLocaleDateString('vi-VN')}
                </Typography>
            )
        },
        {
            field: 'endTime',
            headerName: 'Ngày kết thúc',
            width: 120,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Typography variant="body2">
                    {new Date(params.value).toLocaleDateString('vi-VN')}
                </Typography>
            )
        },
        {
            field: 'assignedToName',
            headerName: 'Người nhận',
            width: 150,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                params.value ? (
                    <Chip
                        size="small"
                        label={params.value}
                        variant="outlined"
                        sx={{ borderRadius: 1 }}
                    />
                ) : (
                    <Typography variant="caption" color="text.secondary">N/A</Typography>
                )
            )
        },
        {
            field: 'actions',
            headerName: 'Thao tác',
            width: 120,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {/* Ẩn nút edit nếu là ADMIN */}
                    {!ApiService.isAdmin() && (
                        <Tooltip title="Chỉnh sửa">
                            <IconButton
                                size="small"
                                color="primary"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(params.row.id);
                                }}
                            >
                                <IconEdit />
                            </IconButton>
                        </Tooltip>
                    )}
                    <Tooltip title="Xóa">
                        <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(params.row.id);
                            }}
                        >
                            <IconTrash />
                        </IconButton>
                    </Tooltip>
                </Box>
            )
        }
    ];

    return (
        <PageContainer title="Quản lý công việc" description="Danh sách và quản lý công việc">
            <DashboardCard>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                        Danh sách công việc
                    </Typography>
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>
                        {filteredTasks.length} nhiệm vụ được tìm thấy
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={2} sx={{ flexGrow: 1 }}>
                            <TextField
                                label="Tìm kiếm tiêu đề/mô tả"
                                variant="outlined"
                                size="small"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                sx={{ width: { xs: '100%', sm: 300 } }}
                            />
                            <FormControl sx={{ width: { xs: '100%', sm: 200 } }} size="small">
                                <InputLabel>Trạng thái</InputLabel>
                                <Select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    label="Trạng thái"
                                >
                                    <MenuItem value="all">Tất cả</MenuItem>
                                    <MenuItem value="completed">Hoàn thành</MenuItem>
                                    <MenuItem value="in progress">Đang thực hiện</MenuItem>
                                    <MenuItem value="pending">Chờ xử lý</MenuItem>
                                    <MenuItem value="late">Trễ hạn</MenuItem>
                                    <MenuItem value="cancelled">Đã hủy</MenuItem> {/* Thêm dòng này */}
                                </Select>
                            </FormControl>
                        </Stack>
                    </Stack>
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : filteredTasks.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="body1" color="text.secondary">
                            Không tìm thấy công việc nào
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ height: 'auto', width: '100%' }}>
                        <DataGrid
                            rows={filteredTasks}
                            columns={columns}
                            pageSize={10}
                            rowsPerPageOptions={[10, 20, 50]}
                            autoHeight
                            disableSelectionOnClick
                            onRowClick={(params) => navigate(`/manage/task/${params.row.id}`)}
                            sx={{
                                '& .MuiDataGrid-root': {
                                    border: 'none'
                                },
                                '& .MuiDataGrid-cell': {
                                    borderColor: 'divider',
                                    cursor: 'pointer'
                                },
                                '& .MuiDataGrid-columnHeaders': {
                                    backgroundColor: 'background.default',
                                    borderColor: 'divider'
                                },
                                '& .MuiDataGrid-row:hover': {
                                    backgroundColor: 'action.hover'
                                }
                            }}
                        />
                    </Box>
                )}
            </DashboardCard>
        </PageContainer>
    );
};

export default Tasks;