import React, { useState, useEffect, useCallback } from 'react';
import {
    Grid, Typography, Button, IconButton, Collapse, Modal, Box, CircularProgress, Alert, Card, Snackbar
} from '@mui/material';
import {
    IconPlus, IconEdit, IconTrash, IconChevronDown, IconChevronRight, IconAlertTriangle
} from '@tabler/icons-react';
import MuiAlert from '@mui/material/Alert';
import Slide from '@mui/material/Slide';

import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import ApiService from '../../service/ApiService';

import DCreate from './components/DCreate';
import DUpdate from './components/DUpdate';
import GCreate from './components/GCreate';
import GUpdate from './components/GUpdate';

// ================== DepartmentCard ==================
import PropTypes from 'prop-types';

const DepartmentCard = React.memo(function DepartmentCard({ dept, expanded, onToggle, onEdit, onDelete, onAddGroup, children }) {
    return (
        <Card
            sx={{
                mb: 3,
                borderRadius: 2,
                boxShadow: 2,
                overflow: 'hidden',
                transition: 'transform 0.2s ease',
                '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' }
            }}
        >
            <Box
                sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    px: 2, py: 1.5, bgcolor: 'grey.100', borderBottom: '1px solid', borderColor: 'grey.200'
                }}
            >
                <Box display="flex" alignItems="center">
                    <IconButton onClick={() => onToggle(dept.id)} size="small">
                        {expanded ? <IconChevronDown /> : <IconChevronRight />}
                    </IconButton>
                    <Typography variant="subtitle1" sx={{ ml: 1, fontWeight: 600, color: 'primary.dark' }}>
                        {dept.departmentName}
                    </Typography>
                </Box>
                <Box>
                    <IconButton onClick={() => onEdit(dept)} size="small"><IconEdit /></IconButton>
                    <IconButton onClick={() => onDelete(dept)} size="small" color="error"><IconTrash /></IconButton>
                </Box>
            </Box>
            <Collapse in={expanded} timeout="auto">
                <Box sx={{ px: 2, py: 2, bgcolor: 'grey.50' }}>
                    {children}
                    <Box mt={2}>
                        <Button
                            variant="outlined"
                            startIcon={<IconPlus />}
                            size="small"
                            onClick={() => onAddGroup(dept)}
                        >
                            Thêm nhóm
                        </Button>
                    </Box>
                </Box>
            </Collapse>
        </Card>
    );
});

DepartmentCard.displayName = 'DepartmentCard';

DepartmentCard.propTypes = {
    dept: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        departmentName: PropTypes.string.isRequired,
        groups: PropTypes.array,
    }).isRequired,
    expanded: PropTypes.bool.isRequired,
    onToggle: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onAddGroup: PropTypes.func.isRequired,
    children: PropTypes.node,
};

// ================== GroupCard ==================
const GroupCard = React.memo(function GroupCard({ group, onEdit, onDelete }) {
    return (
        <Card
            sx={{
                p: 2, borderRadius: 2, height: '100%', backgroundColor: 'white',
                border: '1px solid', borderColor: 'grey.300', transition: 'all 0.2s ease', boxShadow: 0,
                '&:hover': { boxShadow: 2, transform: 'translateY(-2px)', borderColor: 'primary.light' }
            }}
        >
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
                    {group.groupName}
                </Typography>
                <Box>
                    <IconButton size="small" onClick={() => onEdit(group)}><IconEdit /></IconButton>
                    <IconButton size="small" onClick={() => onDelete(group)} color="error"><IconTrash /></IconButton>
                </Box>
            </Box>
            <Typography variant="body2" color="text.secondary" mt={1}>
                👥 {group.users?.length || 0} thành viên
            </Typography>
        </Card>
    );
});

GroupCard.displayName = 'GroupCard';

GroupCard.propTypes = {
    group: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        groupName: PropTypes.string.isRequired,
        users: PropTypes.array,
    }).isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

// ================== Main Component ==================
const Department = () => {
    const [departments, setDepartments] = useState([]);
    const [expandedDept, setExpandedDept] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const [selectedDept, setSelectedDept] = useState(null);
    const [selectedDeptForGroup, setSelectedDeptForGroup] = useState(null);

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = useCallback(async () => {
        try {
            setLoading(true);
            const response = await ApiService.getAllDepartments();
            setDepartments(response);
            setError(null);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleExpandDepartment = useCallback((deptId) => {
        setExpandedDept(prev => ({
            ...prev,
            [deptId]: !prev[deptId]
        }));
    }, []);

    const handleOpenCreateDeptModal = useCallback(() => {
        setSelectedDept(null);
        setSelectedDeptForGroup(null);
        setCreateModalOpen(true);
    }, []);

    const handleOpenCreateGroupModal = useCallback((dept) => {
        setSelectedDeptForGroup(dept);
        setSelectedDept(null);
        setCreateModalOpen(true);
    }, []);

    const handleOpenEditModal = useCallback((item) => {
        if (item.groupName && (!item.departmentId || !item.departmentName)) {
            const foundDept = departments.find(dept => dept.groups?.some(g => g.id === item.id));
            if (foundDept) {
                item = {
                    ...item,
                    departmentId: foundDept.id,
                    departmentName: foundDept.departmentName
                };
            }
        }
        setSelectedDept(item);
        setEditModalOpen(true);
    }, [departments]);

    const handleOpenDeleteModal = useCallback((item) => {
        if (item.groupName && (!item.departmentId || !item.departmentName)) {
            const foundDept = departments.find(dept => dept.groups?.some(g => g.id === item.id));
            if (foundDept) {
                item = {
                    ...item,
                    departmentId: foundDept.id,
                    departmentName: foundDept.departmentName
                };
            }
        }
        setSelectedDept(item);
        setDeleteModalOpen(true);
    }, [departments]);

    const handleCloseModal = useCallback(() => {
        setCreateModalOpen(false);
        setEditModalOpen(false);
        setDeleteModalOpen(false);
        setSelectedDept(null);
        setSelectedDeptForGroup(null);
    }, []);

    const handleDepartmentCreated = useCallback((isGroup = false) => {
        setSnackbar({
            open: true,
            message: isGroup ? 'Tạo mới nhóm thành công!' : 'Tạo mới phòng ban thành công!',
            severity: 'success'
        });
        handleCloseModal();
        fetchDepartments();
    }, [fetchDepartments, handleCloseModal]);

    const handleItemUpdated = useCallback((isGroup = false) => {
        setSnackbar({
            open: true,
            message: isGroup ? 'Cập nhật nhóm thành công!' : 'Cập nhật phòng ban thành công!',
            severity: 'success'
        });
        handleCloseModal();
        fetchDepartments();
    }, [fetchDepartments, handleCloseModal]);

    const handleDeleteDepartment = useCallback(async () => {
        try {
            if (selectedDept?.departmentName && selectedDept?.id) {
                await ApiService.deleteDepartment(selectedDept.id);
                setSnackbar({
                    open: true,
                    message: 'Xóa phòng ban thành công!',
                    severity: 'success'
                });
                await fetchDepartments();
                handleCloseModal();
            } else {
                setSnackbar({ open: true, message: 'Không xác định được phòng ban cần xóa!', severity: 'error' });
            }
        } catch (error) {
            setSnackbar({ open: true, message: 'Xóa phòng ban thất bại!', severity: 'error' });
        }
    }, [selectedDept, fetchDepartments, handleCloseModal]);

    const handleDeleteGroup = useCallback(async () => {
        try {
            if (selectedDept?.groupName && selectedDept?.id) {
                await ApiService.deleteGroup(selectedDept.id);
                setSnackbar({
                    open: true,
                    message: 'Xóa nhóm thành công!',
                    severity: 'success'
                });
                await fetchDepartments();
                handleCloseModal();
            } else {
                setSnackbar({ open: true, message: 'Không xác định được nhóm cần xóa!', severity: 'error' });
            }
        } catch (error) {
            setSnackbar({ open: true, message: 'Xóa nhóm thất bại!', severity: 'error' });
        }
    }, [selectedDept, fetchDepartments, handleCloseModal]);

    // Tổng số phòng ban và nhóm

    if (loading) return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
            <CircularProgress />
        </Box>
    );
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <PageContainer title="Quản lý phòng ban" description="Danh sách phòng ban và nhóm">
            {/* Snackbar ở đầu trang */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                TransitionComponent={Slide}
            >
                <MuiAlert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                    elevation={6}
                    variant="filled"
                >
                    {snackbar.message}
                </MuiAlert>
            </Snackbar>

            {/* Tổng số phòng ban và nhóm */}
            {/* <Typography variant="subtitle2" sx={{ mb: 2 }}>
                {departments.length} phòng ban, {totalGroups} nhóm
            </Typography> */}

            <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                    <DashboardCard
                        title="Danh sách phòng ban"
                        action={
                            <Button
                                variant="contained"
                                startIcon={<IconPlus />}
                                onClick={handleOpenCreateDeptModal}
                            >
                                Thêm phòng ban
                            </Button>
                        }
                    >
                        {departments.map(dept => (
                            <DepartmentCard
                                key={dept.id}
                                dept={dept}
                                expanded={!!expandedDept[dept.id]}
                                onToggle={handleExpandDepartment}
                                onEdit={handleOpenEditModal}
                                onDelete={handleOpenDeleteModal}
                                onAddGroup={handleOpenCreateGroupModal}
                            >
                                <Grid container spacing={2}>
                                    {dept.groups?.map(group => (
                                        <Grid item xs={12} md={6} lg={4} key={group.id}>
                                            <GroupCard
                                                group={group}
                                                onEdit={handleOpenEditModal}
                                                onDelete={handleOpenDeleteModal}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </DepartmentCard>
                        ))}
                    </DashboardCard>
                </Grid>
            </Grid>

            {/* Create Modal */}
            <Modal open={createModalOpen} onClose={handleCloseModal}>
                <Box sx={{ width: { xs: '95%', md: '50%' }, p: 4, bgcolor: 'background.paper', borderRadius: 2, mx: 'auto', mt: '10%' }}>
                    {selectedDeptForGroup ? (
                        <GCreate
                            departmentId={selectedDeptForGroup.id}
                            departmentName={selectedDeptForGroup.departmentName}
                            onCreated={() => handleDepartmentCreated(true)}
                            onCancel={handleCloseModal}
                        />
                    ) : (
                        <DCreate onCreated={() => handleDepartmentCreated(false)} onCancel={handleCloseModal} />
                    )}
                </Box>
            </Modal>

            {/* Edit Modal */}
            <Modal open={editModalOpen} onClose={handleCloseModal}>
                <Box sx={{ width: { xs: '95%', md: '50%' }, p: 4, bgcolor: 'background.paper', borderRadius: 2, mx: 'auto', mt: '10%' }}>
                    {/* Only render DUpdate if selectedDept is a valid department */}
                    {editModalOpen && selectedDept && selectedDept.departmentName && !selectedDept.groupName ? (
                        <DUpdate department={selectedDept} onUpdated={() => handleItemUpdated(false)} onCancel={handleCloseModal} />
                    ) : null}
                    {/* Only render GUpdate if selectedDept is a valid group */}
                    {editModalOpen && selectedDept && selectedDept.groupName ? (
                        <GUpdate
                            group={selectedDept}
                            departmentId={selectedDept?.departmentId}
                            onUpdated={() => handleItemUpdated(true)}
                            onCancel={handleCloseModal}
                        />
                    ) : null}
                </Box>
            </Modal>

            {/* Delete Modal */}
            <Modal open={deleteModalOpen} onClose={handleCloseModal}>
                <Box sx={{ width: { xs: '90%', md: '40%' }, p: 4, bgcolor: 'background.paper', borderRadius: 2, mx: 'auto', mt: '10%' }}>
                    {deleteModalOpen && selectedDept && (selectedDept.departmentName || selectedDept.groupName) ? (
                        <>
                            <Box display="flex" alignItems="center" mb={2}>
                                <IconAlertTriangle color="#f44336" style={{ marginRight: 8 }} />
                                <Typography variant="h6">
                                    Xác nhận xóa {selectedDept?.departmentName || selectedDept?.groupName}?
                                </Typography>
                            </Box>
                            <Box display="flex" justifyContent="flex-end" gap={2}>
                                <Button onClick={handleCloseModal} variant="outlined">Hủy</Button>
                                {selectedDept?.groupName
                                    ? <Button onClick={handleDeleteGroup} variant="contained" color="error">Xóa</Button>
                                    : <Button onClick={handleDeleteDepartment} variant="contained" color="error">Xóa</Button>
                                }
                            </Box>
                        </>
                    ) : null}
                </Box>
            </Modal>
        </PageContainer>
    );
};

export default Department;
