import React, { useEffect, useState, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/StoreProvider';
import { type Chat, type ChatMessage } from '@/types/types';
import { io, Socket } from 'socket.io-client';
import ChatMessages from '@/components/ChatComponents/ChatMessages';
import ChatInput from '@/components/ChatComponents/ChatInput';

const AdminChatsPage: React.FC = observer(() => {
    const { user, chat } = useStore();
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    // Загрузка списка чатов
    useEffect(() => {
        if (user.user?.role === 'ADMIN') {
            chat.fetchActiveChatsAdmin();
        }
    }, [user.user, chat]);

    // Инициализация сокета
    useEffect(() => {
        if (!user.user || user.user.role !== 'ADMIN') return;

        const token = localStorage.getItem('token');
        if (!token) return;

        const socket = io('http://localhost:5003', {
            transports: ['websocket', 'polling'],
            timeout: 20000,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('✅ Admin connected to socket');
            setIsConnected(true);
            socket.emit('authenticate', { userId: user.user!.id, token });
        });

        socket.on('disconnect', () => {
            console.log('❌ Admin disconnected from socket');
            setIsConnected(false);
        });

        socket.on('authenticated', (data) => {
            console.log('Admin authenticated:', data);
        });

        socket.on('new_message', (message: ChatMessage) => {
            console.log('New message received:', message);
            // Добавляем сообщение в store
            chat.addMessage(message);
        });

        socket.on('chat_messages', (data: { chatId: number, messages: ChatMessage[] }) => {
            console.log('Chat messages received:', data);
            // Обновляем сообщения в store, если это текущий выбранный чат
            if (selectedChat && data.chatId === selectedChat.id) {
                chat.setMessages(data.messages);
            }
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [user.user, selectedChat, chat]);

    // Подключение к выбранному чату
    useEffect(() => {
        if (selectedChat && isConnected && socketRef.current) {
            socketRef.current.emit('join_chat', selectedChat.id);
            // Загружаем полную историю сообщений чата
            chat.fetchChatMessagesAdmin(selectedChat.id);
        }
    }, [selectedChat, isConnected, chat]);

    const handleSelectChat = (chatItem: Chat) => {
        setSelectedChat(chatItem);
        chat.setMessages([]); // Очищаем предыдущие сообщения
    };

    const handleSendMessage = (text: string) => {
        if (!selectedChat || !socketRef.current || !isConnected) {
            console.error('Cannot send message: no chat selected or not connected');
            return;
        }

        socketRef.current.emit('send_message', {
            chatId: selectedChat.id,
            text: text,
        });
    };

    if (user.user?.role !== 'ADMIN') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-emerald-950 flex items-center justify-center">
                <div className="text-white text-xl">Доступ запрещен</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-white mb-6">Панель управления чатами</h1>
                
                <div className="flex gap-4 h-[calc(100vh-200px)]">
                    {/* Sidebar со списком чатов */}
                    <div className="w-1/3 bg-white/5 border border-white/10 rounded-2xl p-4 overflow-y-auto backdrop-blur-sm">
                        <h2 className="text-xl font-semibold text-white mb-4">Активные чаты</h2>
                        
                        {chat.loading ? (
                            <div className="text-white/60 text-center py-4">Загрузка...</div>
                        ) : chat.chats.length === 0 ? (
                            <div className="text-white/60 text-center py-4">Нет активных чатов</div>
                        ) : (
                            <div className="space-y-2 overflow-hidden overflow-y-auto hide-scrollbar ios-scroll">
                                {chat.chats.map((chatItem) => {
                                    const userInChat = chatItem.chatUsers?.find(u => u.role === 'USER');
                                    const lastMessage = chatItem.messages?.[0];
                                    
                                    return (
                                        <div
                                            key={chatItem.id}
                                            onClick={() => handleSelectChat(chatItem)}
                                            className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                                                selectedChat?.id === chatItem.id
                                                    ? 'bg-emerald-500/20 border-emerald-400/50'
                                                    : 'bg-white/5 hover:bg-white/10 border-white/10'
                                            } border`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-medium text-white">
                                                    {chatItem.title || `Чат #${chatItem.id}`}
                                                </span>
                                                <span className="text-xs text-white/50">
                                                    {chatItem.type}
                                                </span>
                                            </div>
                                            {userInChat && (
                                                <div className="text-sm text-white/70 mb-1">
                                                    {userInChat.email}
                                                </div>
                                            )}
                                            {lastMessage && (
                                                <div className="text-xs text-white/50 truncate">
                                                    {lastMessage.text}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Область чата */}
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm flex flex-col">
                        {selectedChat ? (
                            <>
                                {/* Заголовок чата */}
                                <div className="px-6 py-4 border-b border-white/10 bg-black/20">
                                    <h3 className="text-xl font-semibold text-white">
                                        {selectedChat.title || `Чат #${selectedChat.id}`}
                                    </h3>
                                    <div className="flex gap-4 mt-2">
                                        {selectedChat.chatUsers?.map((user) => (
                                            <span key={user.id} className="text-sm text-white/70">
                                                {user.email} ({user.role})
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                                        <span className="text-xs text-white/50">
                                            {isConnected ? 'Подключено' : 'Отключено'}
                                        </span>
                                    </div>
                                </div>

                                <ChatMessages messages={chat.messages} />

                                {/* Поле ввода */}
                                <ChatInput
                                    onSendMessage={handleSendMessage}
                                    disabled={!isConnected}
                                />
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center text-white/50">
                                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    <p className="text-lg">Выберите чат для начала общения</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

export default AdminChatsPage;

