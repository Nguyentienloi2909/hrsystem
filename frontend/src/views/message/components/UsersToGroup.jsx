import React from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Modal,
    Typography,
    Avatar,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    useTheme,
    IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const UsersToGroup = ({ open, onClose, group }) => {
    const theme = useTheme();
    const members = group?.members || [];

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="users-to-group-modal"
            aria-describedby="modal-to-show-users-in-group"
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: theme.palette.background.paper,
                    borderRadius: 2,
                    boxShadow: 24,
                    p: 3,
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography id="users-to-group-modal" variant="h6" component="h2">
                        Danh sách thành viên nhóm
                    </Typography>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <List>
                    {members.length === 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
                            Nhóm chưa có thành viên nào.
                        </Typography>
                    )}
                    {members.map((user) => (
                        <ListItem key={user.id || user.userId}>
                            <ListItemAvatar>
                                <Avatar src={user.avatar}>
                                    {(user.fullName || user.name || '').charAt(0)}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={user.fullName || user.name}
                                secondary={user.email}
                            />
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Modal>
    );
};

UsersToGroup.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    group: PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        members: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.number,
                userId: PropTypes.number,
                fullName: PropTypes.string,
                name: PropTypes.string,
                avatar: PropTypes.string,
                email: PropTypes.string,
            })
        ),
    }),
};

UsersToGroup.defaultProps = {
    group: null,
};

export default UsersToGroup;