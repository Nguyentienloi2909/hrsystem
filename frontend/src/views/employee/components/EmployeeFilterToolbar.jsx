import React, { useState, useEffect, useRef } from 'react';
import { TextField, Select, MenuItem, FormControl, InputLabel, Box, Stack, Button, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { IconUserPlus } from '@tabler/icons-react';
import ApiService from '../../../service/ApiService';

const EmployeeFilterToolbar = ({ onFilterChange }) => {
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [department, setDepartment] = useState('');
    const [roles, setRoles] = useState([]);
    const [departments, setDepartments] = useState([]);
    const navigate = useNavigate();
    const debounceTimer = useRef(null);

    useEffect(() => {
        const fetchRolesAndDepartments = async () => {
            try {
                const rolesData = await ApiService.getAllRoles();
                setRoles(rolesData || []);
                const departmentsData = await ApiService.getAllDepartments();
                const groupList = departmentsData.flatMap(dept =>
                    (dept.groups || []).map(group => ({
                        groupId: group.id.toString(),
                        groupName: `${group.groupName} (${dept.departmentName})`
                    }))
                );
                setDepartments(groupList);
            } catch (error) {
                console.error('Failed to fetch roles or departments', error);
            }
        };
        fetchRolesAndDepartments();
    }, []);

    // Debounce for name filter
    useEffect(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            onFilterChange({ name, role, department });
        }, 400);
        return () => clearTimeout(debounceTimer.current);
    }, [name, role, department]);

    const handleNameChange = (event) => {
        setName(event.target.value);
    };

    const handleRoleChange = (event) => {
        setRole(event.target.value);
    };

    const handleDepartmentChange = (event) => {
        setDepartment(event.target.value);
    };

    const handleClick = (path) => {
        if (path) {
            navigate(path);
        }
    };

    return (
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} mb={2} sx={{ backgroundColor: '#f5f5f5', borderRadius: '8px', padding: { xs: '12px', md: '16px' } }}>
            <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} flex={1} gap={2}>
                <TextField
                    label="Tìm kiếm theo tên"
                    variant="outlined"
                    value={name}
                    onChange={handleNameChange}
                    size="small"
                    sx={{ minWidth: 180, flex: 1 }}
                />
                <FormControl variant="outlined" size="small" sx={{ minWidth: 160, flex: 1 }}>
                    <InputLabel>Chức vụ</InputLabel>
                    <Select
                        value={role}
                        onChange={handleRoleChange}
                        label="Chức vụ"
                    >
                        <MenuItem value="">
                            <em>Tất cả</em>
                        </MenuItem>
                        {roles.map((role) => (
                            <MenuItem key={role.id} value={role.roleName}>
                                {role.roleName}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl variant="outlined" size="small" sx={{ minWidth: 180, flex: 1 }}>
                    <InputLabel>Phòng ban</InputLabel>
                    <Select
                        value={department}
                        onChange={handleDepartmentChange}
                        label="Phòng ban"
                    >
                        <MenuItem value="">
                            <em>Tất cả</em>
                        </MenuItem>
                        {departments.map((dept) => (
                            <MenuItem key={dept.groupId} value={dept.groupId}>
                                {dept.groupName}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
            <Stack direction="row" spacing={2} sx={{ ml: { md: 2 }, mt: { xs: 2, md: 0 }, minWidth: 180 }}>
                <Tooltip title="THÊM NHÂN VIÊN">
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<IconUserPlus />}
                        sx={{ minWidth: 'auto', whiteSpace: 'nowrap', backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#388e3c' } }}
                        onClick={() => handleClick('/manage/employee/create')}
                    >
                        THÊM NHÂN VIÊN
                    </Button>
                </Tooltip>
            </Stack>
        </Box>
    );
};

export default EmployeeFilterToolbar;