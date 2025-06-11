import { Box, Tooltip, IconButton, Button } from '@mui/material';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import PropTypes from 'prop-types';

const TaskActions = ({ task, onEdit, onDelete, role, onUpdateStatus }) => {
    // Xác định trạng thái không cho phép cập nhật
    const status = task.status?.toLowerCase().replace(/\s+/g, '');
    const disableUpdate = status === 'completed' || status === 'cancelled' || status === 'late';

    let updateTooltip = "Cập nhật trạng thái nhiệm vụ";
    if (disableUpdate) {
        if (status === 'completed') updateTooltip = "Nhiệm vụ đã hoàn thành";
        else if (status === 'cancelled') updateTooltip = "Nhiệm vụ đã bị hủy";
        else if (status === 'late') updateTooltip = "Nhiệm vụ đã quá hạn";
    }

    return (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            {role === 'LEADER' && (
                <>
                    <Tooltip title="Chỉnh sửa">
                        <IconButton
                            size="small"
                            color="primary"
                            onClick={(e) => onEdit(task.id, e)}
                        >
                            <IconEdit size={18} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => onDelete(task.id, e)}
                        >
                            <IconTrash size={18} />
                        </IconButton>
                    </Tooltip>
                </>
            )}
            {role === 'USER' && (
                <Tooltip title={updateTooltip}>
                    <span>
                        <Button
                            size="small"
                            color="success"
                            variant="contained"
                            disabled={disableUpdate}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!disableUpdate && onUpdateStatus) onUpdateStatus(task);
                            }}
                        >
                            Cập nhật
                        </Button>
                    </span>
                </Tooltip>
            )}
        </Box>
    );
};
TaskActions.propTypes = {
    task: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        status: PropTypes.string,
    }).isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    role: PropTypes.string.isRequired,
    onUpdateStatus: PropTypes.func,
};

export default TaskActions;
