// src/contexts/SignalRContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { chatConnection as createChatConnection } from 'src/service/SignalR';
import { useUser } from './UserContext';
import PropTypes from 'prop-types';

const SignalRContext = createContext();

export const SignalRProvider = ({ children }) => {
    const { user } = useUser();
    const [connection, setConnection] = useState(null);
    const [connectionState, setConnectionState] = useState('Disconnected');

    useEffect(() => {
        if (!user.isAuthenticated) {
            setConnection(null);
            setConnectionState('Disconnected');
            return;
        }

        const newConnection = createChatConnection(); // Tạo instance mới
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
                    connection.accessTokenFactory = () => user.token || sessionStorage.getItem('authToken');
                    await connection.start();
                    if (isMounted) {
                        setConnectionState('Connected');
                        console.log('SignalR chat connection started');
                    }
                }
            } catch (error) {
                if (isMounted) {
                    setConnectionState('Disconnected');
                    console.error('SignalR chat connection error:', error);
                }
            }
        };

        startConnection();

        const handleStateChange = () => {
            if (isMounted) {
                setConnectionState(connection.state);
                if (connection.state === 'Connected') {
                    console.log('SignalR chat connection re-established');
                }
            }
        };

        connection.onreconnecting(() => setConnectionState('Reconnecting'));
        connection.onreconnected(() => setConnectionState('Connected'));
        connection.onclose(() => setConnectionState('Disconnected'));

        return () => {
            isMounted = false;
            connection.off('reconnecting', handleStateChange);
            connection.off('reconnected', handleStateChange);
            connection.off('close', handleStateChange);
            if (connection.state === 'Connected') {
                connection.stop();
            }
        };
    }, [connection, user.isAuthenticated, user.token]);

    return (
        <SignalRContext.Provider value={{ chatConnection: connection, connectionState }}>
            {children}
        </SignalRContext.Provider>
    );
};

SignalRProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const useSignalR = () => useContext(SignalRContext);