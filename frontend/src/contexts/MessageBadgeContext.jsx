import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

const MessageBadgeContext = createContext();
export const MessageBadgeProvider = ({ children }) => {
    // { userId: true, groupId: true }
    const [unread, setUnread] = useState({});

    // Khi nhận tin nhắn mới
    const markUnread = useCallback((type, id) => {
        setUnread(prev => ({ ...prev, [`${type}_${id}`]: true }));
    }, []);

    // Khi user đọc (chọn) cuộc trò chuyện
    const markRead = useCallback((type, id) => {
        setUnread(prev => {
            const copy = { ...prev };
            delete copy[`${type}_${id}`];
            return copy;
        });
    }, []);

    // Có tin nhắn chưa đọc không?
    const hasNewMessage = useMemo(() => Object.keys(unread).length > 0, [unread]);

    return (
        <MessageBadgeContext.Provider value={{ unread, hasNewMessage, markUnread, markRead }}>
            {children}
        </MessageBadgeContext.Provider>
    );
};

MessageBadgeProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const useMessageBadge = () => useContext(MessageBadgeContext);