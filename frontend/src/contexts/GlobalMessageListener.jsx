import { useEffect } from 'react';
import { useSignalR } from './SignalRContext';
import { useUser } from './UserContext';
import { useMessageBadge } from './MessageBadgeContext';

const GlobalMessageListener = () => {
    const { chatConnection, connectionState } = useSignalR();
    const { user } = useUser();
    const { markUnread } = useMessageBadge();

    useEffect(() => {
        if (!chatConnection || connectionState !== 'Connected' || !user?.userId) return;

        // Tin nhắn riêng
        const handleReceiveMessage = (messageDto) => {
            if (messageDto.senderId !== user.userId) {
                markUnread('user', messageDto.senderId);
            }
        };

        // Tin nhắn nhóm
        const handleReceiveGroupMessage = (messageDto) => {
            if (messageDto.senderId !== user.userId) {
                markUnread('group', messageDto.groupChatId);
            }
        };

        chatConnection.on('ReceiveMessage', handleReceiveMessage);
        chatConnection.on('ReceiveGroupMessage', handleReceiveGroupMessage);

        return () => {
            chatConnection.off('ReceiveMessage', handleReceiveMessage);
            chatConnection.off('ReceiveGroupMessage', handleReceiveGroupMessage);
        };
    }, [chatConnection, connectionState, user?.userId, markUnread]);

    return null;
};

export default GlobalMessageListener;