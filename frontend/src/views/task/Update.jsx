import { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Typography,
    CircularProgress,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
    Alert,
} from '@mui/material';
import { IconUpload } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import ApiService from '../../service/ApiService';
import PageContainer from 'src/components/container/PageContainer';
import { useUser } from 'src/contexts/UserContext'; // Thêm dòng này

const UpdateTaskPage = () => {
    const params = useParams();
    const navigate = useNavigate();
    const { user } = useUser(); // Lấy thông tin user hiện tại

    // Log all params to see what's available
    console.log('All params:', params);

    // Try to get the task ID from different possible parameter names
    const taskId = params.taskId || params.id;
    console.log('Using taskId:', taskId);

    const [task, setTask] = useState({
        title: '',
        description: '',
        file: null,
        startTime: '',
        endTime: '',
        status: '',
        assignedToId: '',
        assignedToName: '',
        senderId: '', // Thêm người cập nhật/giao nhiệm vụ (LEADER)
        senderName: '', // Thêm tên người cập nhật/giao nhiệm vụ (LEADER)
    });
    const [fileInfo, setFileInfo] = useState({ name: '', size: '' });
    const [employees, setEmployees] = useState([]);
    const [statusList, setStatusList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [open, setOpen] = useState(true);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [notify, setNotify] = useState({
        open: false,
        type: 'success', // 'success' | 'error'
        message: '',
    });
    const [pendingRedirect, setPendingRedirect] = useState(false);

    useEffect(() => {
        console.log('taskId from useParams:', taskId); // Log để kiểm tra taskId
        const fetchTaskAndEmployees = async () => {
            if (!taskId || isNaN(parseInt(taskId))) {
                setError(`ID nhiệm vụ không hợp lệ: ${taskId}. Vui lòng kiểm tra lại.`);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const [taskResponse, employeesResponse, statusResponse] = await Promise.all([
                    ApiService.getTask(taskId),
                    ApiService.getAllUsers(),
                    ApiService.getStatusTask(),
                ]);

                if (taskResponse) {
                    const formattedTask = {
                        ...taskResponse,
                        startTime: taskResponse.startTime
                            ? new Date(taskResponse.startTime).toISOString().slice(0, 16)
                            : '',
                        endTime: taskResponse.endTime
                            ? new Date(taskResponse.endTime).toISOString().slice(0, 16)
                            : '',
                    };
                    setTask(formattedTask);
                    if (taskResponse.urlFile) {
                        setFileInfo({
                            name: taskResponse.urlFile.split('/').pop() || 'Tài liệu hiện tại',
                            size: '',
                        });
                    }
                } else {
                    setError('Không tìm thấy nhiệm vụ với ID đã cung cấp.');
                }

                if (employeesResponse && Array.isArray(employeesResponse)) {
                    setEmployees(employeesResponse);
                } else {
                    setError('Không thể tải danh sách nhân viên.');
                }

                if (statusResponse && Array.isArray(statusResponse)) {
                    setStatusList(statusResponse);
                } else {
                    setError('Không thể tải danh sách trạng thái.');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                const message =
                    error?.response?.data?.message ||
                    error?.message ||
                    'Không thể tải dữ liệu. Vui lòng thử lại sau.';
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        fetchTaskAndEmployees();
    }, [taskId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTask((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('File không được vượt quá 5MB.');
                return;
            }
            setTask((prev) => ({ ...prev, file }));
            setFileInfo({
                name: file.name,
                size: `${(file.size / 1024).toFixed(2)} KB`,
            });
        }
        e.target.value = null;
    };

    const handleEmployeeSelect = (e) => {
        const selected = employees.find((emp) => emp.id === e.target.value);
        setTask((prev) => ({
            ...prev,
            assignedToId: e.target.value,
            assignedToName: selected?.fullName || '',
        }));
    };

    const validateForm = () => {
        if (!task.title) return 'Vui lòng nhập tiêu đề nhiệm vụ.';
        if (!task.assignedToId) return 'Vui lòng chọn người thực hiện.';
        if (!task.startTime) return 'Vui lòng chọn thời gian bắt đầu.';
        if (!task.endTime) return 'Vui lòng chọn thời gian kết thúc.';
        if (new Date(task.endTime) <= new Date(task.startTime)) {
            return 'Thời gian kết thúc phải sau thời gian bắt đầu.';
        }
        if (!task.status) return 'Vui lòng chọn trạng thái.';
        return null;
    };

    const handleUpdate = async () => {
        const validationError = validateForm();
        if (validationError) {
            setNotify({ open: true, type: 'error', message: validationError });
            return;
        }

        setIsSubmitting(true);
        try {
            // Lấy senderId và senderName từ sessionStorage hoặc context, fallback rỗng nếu không có
            const senderId = sessionStorage.getItem('userId') || user.userId || '';
            let senderName = sessionStorage.getItem('fullName');
            if (!senderName || senderName === 'undefined') senderName = user.fullName || '';

            // Lấy assignedToName từ danh sách employees nếu chưa có
            let assignedToName = task.assignedToName;
            if (!assignedToName) {
                const selected = employees.find(emp => emp.id === task.assignedToId);
                assignedToName = selected ? selected.fullName : '';
            }

            const formData = new FormData();
            formData.append('Title', task.title);
            formData.append('Description', task.description || '');
            if (task.file) {
                formData.append('File', task.file);
            }
            formData.append('StartTime', task.startTime);
            formData.append('EndTime', task.endTime);
            formData.append('Status', task.status);
            formData.append('AssignedToId', task.assignedToId);
            formData.append('AssignedToName', assignedToName);
            formData.append('SenderId', senderId);
            formData.append('SenderName', senderName);

            // Log dữ liệu gửi đi để kiểm tra
            console.log('Update Task - FormData:');
            for (let pair of formData.entries()) {
                console.log(pair[0] + ':', pair[1]);
            }

            await ApiService.updateTask(taskId, formData);
            setNotify({ open: true, type: 'success', message: 'Cập nhật nhiệm vụ thành công!' });
            setPendingRedirect(true); // Đánh dấu sẽ chuyển trang sau khi đóng thông báo
        } catch (error) {
            setNotify({
                open: true,
                type: 'error',
                message: error?.response?.data?.message ||
                    error?.message ||
                    'Không thể cập nhật nhiệm vụ. Vui lòng thử lại.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmUpdate = () => {
        setConfirmOpen(false);
        handleUpdate();
    };

    const handleCloseNotify = () => {
        setNotify(n => ({ ...n, open: false }));
        if (pendingRedirect) {
            setOpen(false);
            navigate('/manage/task');
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setOpen(false);
            navigate('/manage/task');
        }
    };


    return (
        <PageContainer title="Cập nhật nhiệm vụ" description="Giao diện cập nhật nhiệm vụ">
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Cập nhật nhiệm vụ</DialogTitle>
                <DialogContent>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress />
                        </Box>
                    ) : error ? (
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                            <Typography color="error" variant="body1">{error}</Typography>
                            <Button
                                variant="contained"
                                onClick={handleClose}
                                sx={{ mt: 2 }}
                            >
                                Trở lại
                            </Button>
                        </Box>
                    ) : (
                        <Box component="form" sx={{ mt: 2 }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Tiêu đề nhiệm vụ"
                                        name="title"
                                        value={task.title}
                                        onChange={handleChange}
                                        fullWidth
                                        required
                                        variant="outlined"
                                        disabled={isSubmitting}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        label="Mô tả chi tiết"
                                        name="description"
                                        value={task.description}
                                        onChange={handleChange}
                                        fullWidth
                                        multiline
                                        rows={4}
                                        variant="outlined"
                                        disabled={isSubmitting}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        label="Thời gian bắt đầu"
                                        name="startTime"
                                        type="datetime-local"
                                        value={task.startTime}
                                        onChange={handleChange}
                                        InputLabelProps={{ shrink: true }}
                                        fullWidth
                                        variant="outlined"
                                        disabled={isSubmitting}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        label="Thời gian kết thúc"
                                        name="endTime"
                                        type="datetime-local"
                                        value={task.endTime}
                                        onChange={handleChange}
                                        InputLabelProps={{ shrink: true }}
                                        fullWidth
                                        variant="outlined"
                                        inputProps={{ min: task.startTime }}
                                        disabled={isSubmitting}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth variant="outlined" disabled={isSubmitting}>
                                        <InputLabel>Trạng thái</InputLabel>
                                        <Select
                                            name="status"
                                            value={task.status}
                                            onChange={handleChange}
                                            label="Trạng thái"
                                        >
                                            {statusList.map((status) => (
                                                <MenuItem key={status.id} value={status.name}>
                                                    {status.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth variant="outlined" disabled={isSubmitting}>
                                        <InputLabel>Người thực hiện</InputLabel>
                                        <Select
                                            name="assignedToId"
                                            value={task.assignedToId}
                                            onChange={handleEmployeeSelect}
                                            label="Người thực hiện"
                                        >
                                            {employees.map((emp) => (
                                                <MenuItem key={emp.id} value={emp.id}>
                                                    {emp.fullName}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            startIcon={<IconUpload />}
                                            disabled={isSubmitting}
                                        >
                                            Tải lên tài liệu mới
                                            <input type="file" hidden onChange={handleFileChange} />
                                        </Button>
                                        {fileInfo.name && (
                                            <Typography variant="body2" color="textSecondary">
                                                {fileInfo.name} {fileInfo.size ? `(${fileInfo.size})` : ''}
                                            </Typography>
                                        )}
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button
                        variant="outlined"
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => setConfirmOpen(true)}
                        disabled={isSubmitting}
                        startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                    >
                        {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật nhiệm vụ'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal xác nhận cập nhật */}
            <Dialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
            >
                <DialogTitle>Xác nhận cập nhật</DialogTitle>
                <DialogContent>
                    <Typography>Bạn có chắc chắn muốn cập nhật nhiệm vụ này?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmOpen(false)} color="primary">
                        Hủy
                    </Button>
                    <Button onClick={handleConfirmUpdate} color="primary" variant="contained">
                        Xác nhận
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Thông báo thành công/thất bại */}
            <Snackbar open={notify.open} autoHideDuration={2500} onClose={handleCloseNotify}>
                <Alert severity={notify.type} onClose={handleCloseNotify}>
                    {notify.message}
                </Alert>
            </Snackbar>
        </PageContainer>
    );
};

export default UpdateTaskPage;