// src/contexts/NotificationContext.jsx
import { createContext, useState, useEffect, useCallback } from 'react';
import ApiService from 'src/service/ApiService';
import { notificationConnection as createNotificationConnection } from '../service/SignalR';
import { useUser } from './UserContext';
import PropTypes from 'prop-types';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { user } = useUser();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [connection, setConnection] = useState(null);

    const sortNotifications = useCallback(
        (arr) =>
            [...arr].sort(
                (a, b) =>
                    new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt)
            ),
        []
    );

    const fetchNotifications = useCallback(async () => {
        if (!user.isAuthenticated) return;
        try {
            setLoading(true);
            const data = await ApiService.getStatusNotification();
            setNotifications(sortNotifications(data || []));
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [user.isAuthenticated, sortNotifications]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    useEffect(() => {
        if (!user.isAuthenticated) {
            setConnection(null);
            return;
        }

        const newConnection = createNotificationConnection();
        setConnection(newConnection);

        return () => {
            if (newConnection && newConnection.state === 'Connected') {
                newConnection.stop();
            }
        };
    }, [user.isAuthenticated]);

    useEffect(() => {
        if (!connection || !user.isAuthenticated) return;

        let isMounted = true;

        const startConnection = async () => {
            try {
                if (connection.state === 'Disconnected') {
                    await connection.start();
                    if (isMounted) {
                        console.log('SignalR notification connection started');
                    }
                }
                const handler = (notification) => {
                    if (!notification.role || notification.role === user.role) {
                        setNotifications((prev) => sortNotifications([notification, ...prev]));
                    }
                };
                connection.on('ReceiveNotification', handler);

                return () => {
                    if (isMounted) {
                        connection.off('ReceiveNotification');
                        if (connection.state === 'Connected') {
                            connection.stop();
                        }
                    }
                };
            } catch (error) {
                if (isMounted) {
                    console.error('SignalR notification connection error:', error);
                }
            }
        };

        startConnection();

        return () => {
            isMounted = false;
        };
    }, [connection, user.isAuthenticated, user.role, sortNotifications]);

    const markAsRead = useCallback(async (notificationId) => {
        try {
            await ApiService.updateStatusNotification(notificationId);
            setNotifications((prev) =>
                sortNotifications(
                    prev.map((n) =>
                        n.id === notificationId ? { ...n, isRead: true } : n
                    )
                )
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }, [sortNotifications]);

    const markAllAsRead = useCallback(async () => {
        try {
            const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);
            if (unreadIds.length === 0) return;
            await Promise.all(unreadIds.map((id) => ApiService.updateStatusNotification(id)));
            setNotifications((prev) =>
                sortNotifications(prev.map((n) => ({ ...n, isRead: true })))
            );
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    }, [notifications, sortNotifications]);

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                loading,
                fetchNotifications,
                markAsRead,
                markAllAsRead,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

NotificationProvider.propTypes = {
    children: PropTypes.node.isRequired,
};