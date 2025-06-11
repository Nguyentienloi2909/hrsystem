import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Stack, Button, Tooltip } from '@mui/material';
import {
    IconCalendarTime,
    IconCalendarStats,
    IconClockCheck,
    IconClockPause,
    IconClockEdit
} from '@tabler/icons-react';

const AttendanceMiniTools = ({ onSuccess }) => {
    const navigate = useNavigate();
    const tools = [
        { icon: IconClockCheck, label: 'Hôm nay', color: 'success', path: '/manage/attendance' },
        { icon: IconClockPause, label: 'Tuần', color: 'warning', path: '/manage/attendance/week' },
        { icon: IconClockEdit, label: 'Tháng', color: 'error', path: '/manage/attendance/month' }
    ];

    const handleClick = (path) => {
        if (path) {
            navigate(path);
            if (onSuccess) onSuccess();
        }
    };

    return (
        <Stack direction="row" spacing={2} sx={{ mb: 3, overflowX: 'auto', pb: 1 }}>
            {tools.map((tool, index) => (
                <Tooltip key={index} title={tool.label}>
                    <Button
                        variant="contained"
                        color={tool.color}
                        startIcon={<tool.icon />}
                        sx={{ minWidth: 'auto', whiteSpace: 'nowrap' }}
                        onClick={() => handleClick(tool.path)}
                    >
                        {tool.label}
                    </Button>
                </Tooltip>
            ))}
            <Tooltip title="Duyệt đơn nghỉ phép">
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<IconCalendarStats />}
                    sx={{ minWidth: 'auto', whiteSpace: 'nowrap' }}
                    onClick={() => navigate('/manage/attendance/hrleave')}
                >
                    Duyệt đơn nghỉ phép
                </Button>
            </Tooltip>
        </Stack>
    );
};

export default AttendanceMiniTools;