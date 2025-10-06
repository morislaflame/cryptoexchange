import React, { useEffect, useState, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/StoreProvider';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import { io, Socket } from 'socket.io-client';
import { type ChatMessage } from '@/types/types';

interface GuestChatModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const GuestChatModal: React.FC<GuestChatModalProps> = observer(({ isOpen, onClose }) => {
    const { chat } = useStore();
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState('');
    const socketRef = useRef<Socket | null>(null);

    // Инициализация сокета для гостя
    useEffect(() => {
        if (!isOpen) {
            return;
        }

        // Создаем подключение к сокетам без аутентификации
        console.log('Initializing guest socket connection...');
        const socket = io('http://localhost:5003', {
            transports: ['websocket', 'polling'],
            timeout: 20000,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        socketRef.current = socket;

        // Обработчики событий сокета
        socket.on('connect', () => {
            console.log('✅ Guest connected to chat socket, ID:', socket.id);
            setIsConnected(true);
            setError('');
        });

        socket.on('disconnect', (reason) => {
            console.log('❌ Guest disconnected from chat socket, reason:', reason);
            setIsConnected(false);
        });

        socket.on('connect_error', (error) => {
            console.error('❌ Guest socket connection error:', error.message);
            setError(`Ошибка подключения: ${error.message}`);
        });

        socket.on('new_message', (message: ChatMessage) => {
            console.log('New message received:', message);
            chat.addMessage(message);
        });

        socket.on('messages_read', (data) => {
            console.log('Messages marked as read:', data);
        });

        socket.on('error', (error) => {
            console.error('Socket error:', error);
            setError(error.message || 'Ошибка сокетов');
        });

        socket.on('joined_chat', (data) => {
            console.log('Joined chat:', data);
        });

        socket.on('message_sent', (data) => {
            console.log('Message sent confirmation:', data);
        });

        // Очистка при размонтировании
        return () => {
            console.log('Cleaning up guest socket connection');
            socket.disconnect();
            socketRef.current = null;
            setIsConnected(false);
        };
    }, [isOpen, chat]);

    // Создание гостевого чата поддержки
    useEffect(() => {
        if (isOpen) {
            chat.createGuestSupportChat().catch((err) => {
                console.error('Error creating guest support chat:', err);
                setError('Ошибка создания гостевого чата');
            });
        }
    }, [isOpen, chat]);

    // Подключение к чату через сокеты
    useEffect(() => {
        if (chat.currentChat?.id && isConnected && socketRef.current) {
            console.log('Guest joining chat:', chat.currentChat.id);
            socketRef.current.emit('join_chat', chat.currentChat.id);
        }
    }, [chat.currentChat?.id, isConnected]);

    const handleSendMessage = (text: string) => {
        if (!chat.currentChat?.id) {
            console.error('No active chat');
            return;
        }

        if (!socketRef.current || !isConnected) {
            console.error('Socket not connected');
            setError('Нет подключения к серверу');
            return;
        }

        console.log('Sending guest message:', text);
        socketRef.current.emit('send_message', {
            chatId: chat.currentChat.id,
            text: text,
            isGuest: true, // Помечаем как сообщение от гостя
        });
    };

    const handleClose = () => {
        // Очищаем чат при закрытии
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
        setIsConnected(false);
        chat.clearChat(); // Очищаем состояние чата
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="bg-gradient-to-br from-black/90 to-gray-900/95 border-white/10 rounded-2xl p-0 max-w-md w-full max-h-[80vh] h-[600px] flex flex-col overflow-hidden backdrop-blur-xl shadow-2xl">
                <DialogHeader className="p-0">
                    <DialogTitle className="sr-only">Гостевой чат с администратором</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col h-full overflow-hidden">
                    <ChatHeader onClose={handleClose} isConnected={isConnected} />

                    {error && (
                        <div className="px-4 py-2 bg-red-500/20 text-red-200 text-sm">
                            {error}
                        </div>
                    )}

                    <ChatMessages messages={chat.messages} />

                    <ChatInput
                        onSendMessage={handleSendMessage}
                        disabled={!isConnected || chat.loading}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
});

export default GuestChatModal;
