import React from 'react';
import {
    Box,
    Typography,
    Divider,
    TablePagination,
    Stack,
    List, // Add this import
    ListItem, // Add this import
    ListItemText // Add this import
} from '@mui/material';
import { IconAlertCircle } from '@tabler/icons-react';

const Notification = ({ announcements, page, rowsPerPage, handleChangePage, onNotificationClick, compact }) => {
    return (
        <>
            <List sx={{ p: 0 }}>
                {announcements.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((announcement) => (
                    <ListItem 
                        key={announcement.id}
                        button
                        onClick={() => onNotificationClick(announcement)}
                        sx={{
                            p: compact ? 1 : 2,
                            mb: compact ? 0.5 : 1,
                            bgcolor: announcement.isRead ? 'background.default' : 'background.paper'
                        }}
                    >
                        <ListItemText
                            primaryTypographyProps={{ component: 'div' }}
                            primary={
                                <Typography 
                                    variant={compact ? 'body2' : 'body1'}
                                    sx={{ fontWeight: 600 }}
                                >
                                    {announcement.title}
                                </Typography>
                            }
                            secondaryTypographyProps={{ component: 'div' }}
                            secondary={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Box
                                        component="span"
                                        sx={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            color: 'text.secondary'
                                        }}
                                    >
                                        {announcement.summary}
                                    </Box>
                                    <Typography 
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ ml: 2 }}
                                    >
                                        {announcement.date}
                                    </Typography>
                                </Box>
                            }
                        />
                    </ListItem>
                ))}
            </List>
            <TablePagination
                component="div"
                count={announcements.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[10]}
            />
        </>
    );
};

export default Notification;