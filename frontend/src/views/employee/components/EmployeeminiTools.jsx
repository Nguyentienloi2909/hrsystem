import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Stack, Button, Tooltip } from '@mui/material';
import {
    IconUsers,
    IconUserPlus,
    IconBuildingCommunity,
    IconClipboardList,
    IconCertificate,
    IconFileDescription
} from '@tabler/icons-react';

const EmployeeMiniTools = () => {
    const navigate = useNavigate();

    const tools = [
        // { icon: IconUsers, label: 'DANH SÁCH NHÂN VIÊN', color: 'primary', path: '/manage/employee/list' },
        // { icon: IconBuildingCommunity, label: 'PHÒNG BAN', color: 'warning' },
        // { icon: IconClipboardList, label: 'Chức vụ', color: 'success' },
        // { icon: IconCertificate, label: 'Hợp đồng', color: 'warning' },
        // { icon: IconFileDescription, label: 'Đánh giá', color: 'error' },
        { icon: IconUserPlus, label: 'THÊM NHÂN VIÊN', color: 'success', path: '/manage/employee/create' }
    ];

    const handleClick = (path) => {
        if (path) {
            navigate(path);
        }
    };

    return (
        <Stack
            direction="row"
            spacing={2}
            sx={{
                mb: 3,
                overflowX: 'auto',
                pb: 1
            }}
        >
            {tools.map((tool, index) => (
                <Tooltip key={index} title={tool.label}>
                    <Button
                        variant="contained"
                        color={tool.color}
                        startIcon={<tool.icon />}
                        sx={{
                            minWidth: 'auto',
                            whiteSpace: 'nowrap'
                        }}
                        onClick={() => handleClick(tool.path)}
                    >
                        {tool.label}
                    </Button>
                </Tooltip>
            ))}
        </Stack>
    );
};

export default EmployeeMiniTools;