import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/StoreProvider';
import { type ChatMessage as ChatMessageType } from '@/types/types';

interface ChatMessageProps {
    message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = observer(({ message }) => {
    const { user: userStore } = useStore();
    
    // Определяем, является ли сообщение от текущего пользователя
    const isUser = (() => {
        // Если пользователь авторизован - проверяем по userId
        if (userStore.isAuth && userStore.user?.id) {
            return message.userId === userStore.user.id;
        }
        
        // Если пользователь не авторизован (гость) - считаем гостевые сообщения своими
        if (!userStore.isAuth) {
            return message.senderType === 'GUEST';
        }
        
        // Fallback - по умолчанию не считаем сообщение своим
        return false;
    })();

    const formatTime = (timestamp: Date | string | undefined) => {
        if (!timestamp) return '';
        
        const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
        
        if (isNaN(date.getTime())) return '';
        
        return date.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
            <div className={`${isUser ? 'ml-auto' : ''} max-w-[70%]`}>
                <div className={`relative backdrop-blur-sm border rounded-2xl px-3 py-2 ${
                    isUser
                        ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-400/30'
                        : 'bg-white/5 border-white/10'
                }`}>
                    <p className="text-white text-sm leading-relaxed break-words mb-1">
                        {message.text}
                    </p>
                    <div className={`text-xs text-white/60 ${isUser ? 'text-right' : 'text-left'}`}>
                        {formatTime(message.createdAt)}
                    </div>
                </div>
            </div>
        </div>
    );
});

export default ChatMessage;
