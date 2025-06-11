
import React, { useContext } from 'react';
import { Box, Typography, TablePagination, Stack, List, ListItem, ListItemText, Skeleton } from '@mui/material';
import { NotificationContext } from '../../contexts/NotificationContext';

const Notification = ({ page, rowsPerPage, handleChangePage, onNotificationClick, compact }) => {
    const { notifications, loading, markAsRead } = useContext(NotificationContext);

    if (loading) {
        return (
            <Stack spacing={1} sx={{ p: 2 }}>
                {[...Array(rowsPerPage)].map((_, i) => (
                    <Skeleton key={i} variant="rectangular" height={60} />
                ))}
            </Stack>
        );
    }

    if (notifications.length === 0) {
        return (
            <Typography color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                Không có thông báo nào.
            </Typography>
        );
    }

    return (
        <Box sx={{ maxWidth: '100%', overflow: 'hidden' }}>
            <List sx={{ p: 0, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
                {notifications
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((announcement) => (
                        <ListItem
                            key={announcement.id}
                            button
                            onClick={() => {
                                onNotificationClick(announcement);
                                if (!announcement.isRead) markAsRead(announcement.id);
                            }}
                            sx={{
                                p: compact ? 1.5 : 2,
                                mb: 0.5,
                                bgcolor: announcement.isRead ? 'background.default' : 'background.paper',
                                borderRadius: 1,
                                mx: 1,
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    bgcolor: 'action.hover',
                                    transform: 'translateY(-2px)',
                                    boxShadow: 2,
                                },
                                '&:focus': {
                                    outline: `2px solid`,
                                    outlineColor: 'primary.main',
                                },
                            }}
                        >
                            <ListItemText
                                primaryTypographyProps={{ component: 'div' }}
                                primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography
                                            variant={compact ? 'subtitle2' : 'h6'}
                                            sx={{
                                                fontWeight: announcement.isRead ? 500 : 600,
                                                color: announcement.isRead ? 'text.secondary' : 'text.primary',
                                            }}
                                        >
                                            {announcement.title}
                                        </Typography>
                                        {!announcement.isRead && (
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: 'error.main',
                                                    bgcolor: 'error.light',
                                                    px: 0.75,
                                                    borderRadius: 1,
                                                    fontWeight: 600,
                                                }}
                                            >
                                                Mới
                                            </Typography>
                                        )}
                                    </Box>
                                }
                                secondaryTypographyProps={{ component: 'div' }}
                                secondary={
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            mt: 0.5,
                                        }}
                                    >
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: 'text.secondary',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: compact ? 'nowrap' : 'normal',
                                                maxWidth: compact ? '70%' : '80%',
                                            }}
                                        >
                                            {announcement.description}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: 'text.disabled',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {new Date(announcement.sentAt).toLocaleDateString('vi-VN', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                            })}
                                        </Typography>
                                    </Box>
                                }
                            />
                        </ListItem>
                    ))}
            </List>
            <TablePagination
                component="div"
                count={notifications.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[10]}
                sx={{
                    '.MuiTablePagination-toolbar': {
                        py: 1,
                        bgcolor: 'background.paper',
                        borderRadius: '0 0 8px 8px',
                    },
                    '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                        color: 'text.secondary',
                    },
                }}
            />
        </Box>
    );
};

export default Notification;
