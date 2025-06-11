import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Avatar, Typography, Button, Divider, Box
} from '@mui/material';
import {
    IconPhone, IconMail, IconCalendar, IconGenderBigender, IconX
} from '@tabler/icons-react';
import PropTypes from 'prop-types';

const EmployeeInfoModal = ({ employee, open, onClose }) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            sx={{
                '& .MuiDialog-paper': {
                    borderRadius: 2,
                    p: 3
                }
            }}
        >
            <DialogTitle sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                pb: 2
            }}>
                <Typography variant="subtitle1" fontWeight="bold" component="span">
                    Thông tin thành viên
                </Typography>
                <Button
                    onClick={onClose}
                    color="inherit"
                    sx={{ minWidth: 0, p: 0.5 }}
                >
                    <IconX size={20} />
                </Button>
            </DialogTitle>

            <DialogContent dividers sx={{ py: 3 }}>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    mb: 3
                }}>
                    <Avatar
                        src={employee?.avatar}
                        alt={employee?.fullName}
                        sx={{
                            width: 100,
                            height: 100,
                            mb: 2,
                            border: '3px solid #1976d2'
                        }}
                    />
                    <Typography variant="h5" fontWeight="bold">
                        {employee?.fullName || '-----'}
                    </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: 'max-content 1fr',
                    gap: 2,
                    alignItems: 'center'
                }}>
                    {/* Số điện thoại */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconPhone size={24} color="#1976d2" />
                        <Typography variant="subtitle2" sx={{ ml: 1 }}>
                            Số điện thoại:
                        </Typography>
                    </Box>
                    <Typography>
                        {employee?.phoneNumber || '-----'}
                    </Typography>

                    {/* Email */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconMail size={24} color="#1976d2" />
                        <Typography variant="subtitle2" sx={{ ml: 1 }}>
                            Email:
                        </Typography>
                    </Box>
                    <Typography>
                        {employee?.email || '-----'}
                    </Typography>

                    {/* Ngày sinh */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconCalendar size={24} color="#1976d2" />
                        <Typography variant="subtitle2" sx={{ ml: 1 }}>
                            Ngày sinh:
                        </Typography>
                    </Box>
                    <Typography>
                        {employee?.birthDate ?
                            new Date(employee.birthDate).toLocaleDateString('vi-VN') : '-----'}
                    </Typography>

                    {/* Giới tính */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconGenderBigender size={24} color="#1976d2" />
                        <Typography variant="subtitle2" sx={{ ml: 1 }}>
                            Giới tính:
                        </Typography>
                    </Box>
                    <Typography>
                        {employee?.gender === true ? 'Nam' :
                            employee?.gender === false ? 'Nữ' : '-----'}
                    </Typography>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button
                    onClick={onClose}
                    variant="contained"
                    sx={{
                        borderRadius: 1,
                        textTransform: 'none',
                        px: 3
                    }}
                >
                    Đóng
                </Button>
            </DialogActions>
        </Dialog>
    );
};

EmployeeInfoModal.propTypes = {
    employee: PropTypes.shape({
        avatar: PropTypes.string,
        fullName: PropTypes.string,
        phoneNumber: PropTypes.string,
        email: PropTypes.string,
        birthDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
        gender: PropTypes.oneOfType([PropTypes.bool, PropTypes.string, PropTypes.number]),
    }),
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

// Cách sử dụng trong component chính
// const GroupMembers = () => {
//     const [selectedEmployee] = useState(null);
//     const [modalOpen, setModalOpen] = useState(false);

//     // Hàm này sẽ được gọi khi click "Xem thông tin" từ menu dropdown
//     // const handleViewInfo = (employee) => {
//     //     setSelectedEmployee(employee);
//     //     setModalOpen(true);
//     // };

//     return (
//         <>
//             {/* ... Phần code hiển thị danh sách thành viên ... */}

//             {/* Modal hiển thị thông tin */}
//             <EmployeeInfoModal
//                 employee={selectedEmployee}
//                 open={modalOpen}
//                 onClose={() => setModalOpen(false)}
//             />
//         </>
//     );
// };

export default EmployeeInfoModal;