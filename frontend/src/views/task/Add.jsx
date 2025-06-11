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
    Snackbar,
    Alert,
} from '@mui/material';
import { IconUpload } from '@tabler/icons-react';
import ApiService from '../../service/ApiService';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useUser } from 'src/contexts/UserContext';
import PropTypes from 'prop-types';

const AddTaskPage = ({ open = false, onClose, onAdd }) => {
    const { user } = useUser(); // Lấy thông tin người gửi (LEADER)

    const getCurrentDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    };

    const initialTaskState = {
        title: '',
        description: '',
        file: null,
        startTime: getCurrentDateTime(),
        endTime: '',
        status: 'Pending',
        assignedToId: '',
        assignedToName: '',
    };

    const [newTask, setNewTask] = useState(initialTaskState);
    const [fileInfo, setFileInfo] = useState({ name: '', size: '' });
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false); // Thêm trạng thái loading cho submit
    const [successOpen, setSuccessOpen] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await ApiService.getAllUsers();
            if (response && Array.isArray(response)) {
                setEmployees(response);
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
            alert('Không thể tải danh sách nhân viên');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewTask(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert('File không được vượt quá 5MB');
                return;
            }
            // Kiểm tra định dạng file (chỉ cho phép .doc hoặc .docx)
            const fileExtension = file.name.split('.').pop().toLowerCase();
            if (fileExtension !== 'doc' && fileExtension !== 'docx') {
                alert('Chỉ cho phép upload file Word (.doc hoặc .docx)');
                e.target.value = null; // Xóa file khỏi input
                return;
            }
            setNewTask(prev => ({ ...prev, file }));
            setFileInfo({
                name: file.name,
                size: `${(file.size / 1024).toFixed(2)} KB`,
            });
        }
        e.target.value = null;
    };

    const handleEmployeeSelect = (e) => {
        const selected = employees.find(emp => emp.id === e.target.value);
        setNewTask(prev => ({
            ...prev,
            assignedToId: e.target.value,
            assignedToName: selected?.fullName || '',
        }));
    };

    const validateForm = () => {
        if (!newTask.title) return 'Vui lòng nhập tiêu đề nhiệm vụ';
        if (!newTask.assignedToId) return 'Vui lòng chọn người thực hiện';
        if (!newTask.startTime) return 'Vui lòng chọn thời gian bắt đầu';
        if (!newTask.endTime) return 'Vui lòng chọn thời gian kết thúc';
        if (new Date(newTask.endTime) <= new Date(newTask.startTime)) {
            return 'Thời gian kết thúc phải sau thời gian bắt đầu';
        }
        return null;
    };

    const handleAdd = async () => {
        const error = validateForm();
        if (error) {
            alert(error);
            return;
        }

        setIsSubmitting(true);
        try {
            await onAdd({
                ...newTask,
                senderId: user.userId,
                senderName: user.fullName,
            });
            setNewTask(initialTaskState);
            setFileInfo({ name: '', size: '' });
            setSuccessOpen(true); // Hiện thông báo thành công
            setTimeout(() => {
                setSuccessOpen(false);
                onClose();
            }, 1500); // Đóng modal sau 1.5s
        } catch (error) {
            console.error('Error adding task:', error);
            alert('Không thể thêm nhiệm vụ');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Dialog
                open={Boolean(open)}
                onClose={isSubmitting ? null : onClose}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Giao nhiệm vụ mới
                </DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ mt: 2 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    label="Tiêu đề nhiệm vụ"
                                    name="title"
                                    value={newTask.title}
                                    onChange={handleChange}
                                    fullWidth
                                    required
                                    variant="outlined"
                                    disabled={isSubmitting} // Vô hiệu hóa khi đang submit
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    label="Mô tả chi tiết"
                                    name="description"
                                    value={newTask.description}
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
                                    value={newTask.startTime}
                                    onChange={handleChange}
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                    variant="outlined"
                                    inputProps={{
                                        min: getCurrentDateTime()
                                    }}
                                    disabled={isSubmitting}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Thời gian kết thúc"
                                    name="endTime"
                                    type="datetime-local"
                                    value={newTask.endTime}
                                    onChange={handleChange}
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                    variant="outlined"
                                    inputProps={{
                                        min: newTask.startTime
                                    }}
                                    disabled={isSubmitting}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth variant="outlined">
                                    <InputLabel>Người thực hiện</InputLabel>
                                    <Select
                                        name="assignedToId"
                                        value={newTask.assignedToId}
                                        onChange={handleEmployeeSelect}
                                        label="Người thực hiện"
                                        disabled={loading || isSubmitting}
                                    >
                                        {loading ? (
                                            <MenuItem disabled>
                                                <CircularProgress size={20} sx={{ mr: 1 }} /> Đang tải...
                                            </MenuItem>
                                        ) : employees.map((emp) => (
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
                                        Tải lên tài liệu
                                        <input type="file" hidden onChange={handleFileChange} />
                                    </Button>
                                    {fileInfo.name && (
                                        <Typography variant="body2" color="textSecondary">
                                            {fileInfo.name} ({fileInfo.size})
                                        </Typography>
                                    )}
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button
                        variant="outlined"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleAdd}
                        disabled={isSubmitting}
                        startIcon={isSubmitting ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
                    >
                        {isSubmitting ? 'Đang giao...' : 'Giao nhiệm vụ'}
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar
                open={successOpen}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                autoHideDuration={1500}
                onClose={() => setSuccessOpen(false)}
            >
                <Alert severity="success" sx={{ width: '100%' }}>
                    Thêm nhiệm vụ thành công!
                </Alert>
            </Snackbar>
        </>
    );
};
AddTaskPage.defaultProps = {
    open: false,
    onClose: () => { },
    onAdd: () => { },
};

AddTaskPage.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    onAdd: PropTypes.func,
};

export default AddTaskPage;