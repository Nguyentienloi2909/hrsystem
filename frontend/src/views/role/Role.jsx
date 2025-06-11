import React, { useState } from 'react';
import {
    Grid, Typography, Button, List, ListItem, IconButton,
    Divider, Box, TextField, Select, MenuItem, FormControl,
    InputLabel, Avatar
} from '@mui/material';
import {
    IconDeviceFloppy, IconChevronRight, IconChevronDown,
    IconBuilding, IconUsers, IconUserCircle, IconCaretRight,
    IconCaretDown
} from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';

const Role = () => {
    const [expanded, setExpanded] = useState({});
    const [selectedNode, setSelectedNode] = useState(null);

    const mockData = {
        departments: [
            {
                id: 'dept1',
                name: 'Phòng IT',
                groups: [
                    {
                        id: 'group1',
                        name: 'Nhóm Frontend',
                        employees: [
                            {
                                id: 'emp1',
                                name: 'Nguyễn Văn A',
                                email: 'nguyenvana@example.com',
                                role: 'admin'
                            },
                            {
                                id: 'emp2',
                                name: 'Trần Thị B',
                                email: 'tranthib@example.com',
                                role: 'leader'
                            }
                        ]
                    },
                    {
                        id: 'group2',
                        name: 'Nhóm Backend',
                        employees: [
                            {
                                id: 'emp3',
                                name: 'Lê Văn C',
                                email: 'levanc@example.com',
                                role: 'user'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'dept2',
                name: 'Phòng Marketing',
                groups: [
                    {
                        id: 'group3',
                        name: 'Nhóm Digital Marketing',
                        employees: [
                            {
                                id: 'emp4',
                                name: 'Phạm Thị D',
                                email: 'phamthid@example.com',
                                role: 'leader'
                            }
                        ]
                    }
                ]
            }
        ]
    };

    const roles = [
        { value: 'admin', label: 'Quản trị viên' },
        { value: 'leader', label: 'Trưởng nhóm' },
        { value: 'user', label: 'Nhân viên' }
    ];

    const toggleExpand = (id) => {
        setExpanded(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const renderTreeNode = (node, type) => {
        const isExpanded = expanded[node.id];
        const icon = type === 'department' ? <IconBuilding size={20} /> :
            type === 'group' ? <IconUsers size={20} /> :
                <IconUserCircle size={20} />;

        return (
            <Box key={node.id}>
                <ListItem
                    button
                    onClick={() => {
                        if (type === 'employee') {
                            setSelectedNode(node);
                        } else {
                            toggleExpand(node.id);
                        }
                    }}
                    sx={{
                        pl: type === 'department' ? 1 : type === 'group' ? 3 : 5,
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        '&:hover': {
                            bgcolor: 'rgba(0, 0, 0, 0.04)'
                        }
                    }}
                >
                    {type !== 'employee' && (
                        <IconButton size="small" onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(node.id);
                        }}>
                            {isExpanded ? <IconCaretDown size={16} /> : <IconCaretRight size={16} />}
                        </IconButton>
                    )}
                    {icon}
                    <Typography sx={{ ml: 1 }}>{node.name}</Typography>
                </ListItem>
                {type !== 'employee' && isExpanded && (
                    <Box>
                        {type === 'department' && node.groups.map(group =>
                            renderTreeNode(group, 'group')
                        )}
                        {type === 'group' && node.employees.map(emp =>
                            renderTreeNode(emp, 'employee')
                        )}
                    </Box>
                )}
            </Box>
        );
    };

    return (
        <PageContainer title="Phân quyền nhân viên" description="Quản lý phân quyền nhân viên">
            <Grid container spacing={3}>
                <Grid item xs={4}>
                    <DashboardCard title="Cấu trúc tổ chức">
                        <List>
                            {mockData.departments.map(dept =>
                                renderTreeNode(dept, 'department')
                            )}
                        </List>
                    </DashboardCard>
                </Grid>
                <Grid item xs={8}>
                    <DashboardCard title="Chi tiết phân quyền">
                        {selectedNode ? (
                            <Box sx={{ p: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <Avatar sx={{ width: 50, height: 50, mr: 2 }}>
                                        {selectedNode.name[0]}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h6">{selectedNode.name}</Typography>
                                        <Typography color="textSecondary">{selectedNode.email}</Typography>
                                    </Box>
                                </Box>
                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Vai trò</InputLabel>
                                    <Select
                                        value={selectedNode.role}
                                        label="Vai trò"
                                        onChange={(e) => {
                                            // Handle role change
                                        }}
                                    >
                                        {roles.map((role) => (
                                            <MenuItem key={role.value} value={role.value}>
                                                {role.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <Button
                                    variant="contained"
                                    startIcon={<IconDeviceFloppy />}
                                    onClick={() => {
                                        // Handle save
                                    }}
                                >
                                    Lưu thay đổi
                                </Button>
                            </Box>
                        ) : (
                            <Box sx={{ p: 3, textAlign: 'center' }}>
                                <Typography color="textSecondary">
                                    Chọn một nhân viên để xem và chỉnh sửa quyền
                                </Typography>
                            </Box>
                        )}
                    </DashboardCard>
                </Grid>
            </Grid>
        </PageContainer>
    );
};

export default Role;