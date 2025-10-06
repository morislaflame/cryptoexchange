import { useState, useEffect, useContext, useRef } from 'react';
import MagicBento from "@/components/ui/MagicBento";
import ChatModal from "@/components/ChatComponents/ChatModal";
import GuestChatModal from "@/components/ChatComponents/GuestChatModal";
import ServiceInfoBlock from "@/components/MainPageComponents/ServiceInfoBlock";
import { Button } from "@/components/ui/button";
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { io, Socket } from 'socket.io-client';
import { type ChatMessage } from '@/types/types';
// import MainGrid from "@/components/MainPageComponents/MainGrid";

const MainPage = () => {
    const { user, chat } = useContext(Context) as IStoreContext;
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        user.fetchMyInfo();
    }, [user]);

    // Подключение к сокетам
    useEffect(() => {
        if (!user.isAuth) {
            // Для гостей подключаемся без аутентификации
            console.log('Initializing guest socket connection...');
            const socket = io('http://localhost:5003', {
                transports: ['websocket', 'polling'],
                timeout: 20000,
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionAttempts: 5,
            });

            socketRef.current = socket;

            socket.on('connect', () => {
                console.log('✅ Guest connected to chat socket, ID:', socket.id);
                setIsConnected(true);
            });

            socket.on('disconnect', (reason) => {
                console.log('❌ Guest disconnected from chat socket, reason:', reason);
                setIsConnected(false);
            });

            socket.on('new_message', (message: ChatMessage) => {
                console.log('New message received:', message);
                chat.addMessage(message);
                
                // Если сообщение не от гостя и чат закрыт - показываем индикатор
                if (message.senderType !== 'GUEST' && !isChatOpen) {
                    setHasUnreadMessages(true);
                }
            });

            return () => {
                console.log('Cleaning up guest socket connection');
                socket.disconnect();
                socketRef.current = null;
                setIsConnected(false);
            };
        } else if (user.isAuth && user.user) {
            // Для авторизованных пользователей
            const token = localStorage.getItem('token');
            if (!token) return;

            console.log('Initializing authenticated socket connection...');
            const socket = io('http://localhost:5003', {
                transports: ['websocket', 'polling'],
                timeout: 20000,
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionAttempts: 5,
            });

            socketRef.current = socket;

            socket.on('connect', () => {
                console.log('✅ Connected to chat socket, ID:', socket.id);
                setIsConnected(true);
                socket.emit('authenticate', { userId: user.user!.id, token });
            });

            socket.on('disconnect', (reason) => {
                console.log('❌ Disconnected from chat socket, reason:', reason);
                setIsConnected(false);
            });

            socket.on('new_message', (message: ChatMessage) => {
                console.log('New message received:', message);
                chat.addMessage(message);
                
                // Если сообщение не от текущего пользователя и чат закрыт - показываем индикатор
                if (message.userId !== user.user!.id && !isChatOpen) {
                    setHasUnreadMessages(true);
                }
            });

            return () => {
                console.log('Cleaning up authenticated socket connection');
                socket.disconnect();
                socketRef.current = null;
                setIsConnected(false);
            };
        }
    }, [user.isAuth, user.user, chat, isChatOpen]);

    // Подключение к чату при открытии
    useEffect(() => {
        if (chat.currentChat?.id && isConnected && socketRef.current) {
            console.log('Joining chat:', chat.currentChat.id);
            socketRef.current.emit('join_chat', chat.currentChat.id);
        }
    }, [chat.currentChat?.id, isConnected]);

    // Обработка открытия чата
    const handleChatOpen = () => {
        setIsChatOpen(true);
        setHasUnreadMessages(false); // Сбрасываем индикатор при открытии
        
        // Если есть текущий чат, подключаемся к нему
        if (chat.currentChat?.id && socketRef.current) {
            socketRef.current.emit('join_chat', chat.currentChat.id);
        }
    };

    // Обработка закрытия чата
    const handleChatClose = () => {
        setIsChatOpen(false);
        // Отключаемся от чата
        if (chat.currentChat?.id && socketRef.current) {
            socketRef.current.emit('leave_chat', chat.currentChat.id);
        }
    };

    // Обработка отправки сообщений
    const handleSendMessage = (text: string) => {
        if (!chat.currentChat?.id) {
            console.error('No active chat');
            return;
        }

        if (!socketRef.current) {
            console.error('Socket not connected');
            return;
        }

        console.log('Sending message:', text);
        socketRef.current.emit('send_message', {
            chatId: chat.currentChat.id,
            text: text,
            isGuest: !user.isAuth, // Помечаем как гостевое сообщение для неавторизованных
        });
    };

    return (
        <>
            <div className="w-full min-h-screen flex flex-col">
                <div className="flex-1 flex items-center justify-center gap-4 lg:px-8 px-4">
                    <div className='w-full'>
                        <MagicBento
                            clickEffect={true}
                            enableMagnetism={false}
                            enableSpotlight={false}
                            enableBorderGlow={true}
                            enableStars={false}
                            disableAnimations={false}
                            spotlightRadius={300}
                            // particleCount={12}
                            glowColor="#10b981"

                        />
                    </div>
                    {/* <MainGrid /> */}
                </div>
                
                {/* Блок информации о сервисе */}
                <ServiceInfoBlock />
            </div>

            {/* Кнопка чата */}
            <div className="fixed bottom-6 right-6 z-50">
                <Button
                    onClick={handleChatOpen}
                    className="h-14 w-14 rounded-full bg-emerald-600 hover:bg-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200 relative"
                    size="icon"
                    title={user.isAuth ? "Чат поддержки" : "Гостевой чат поддержки"}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                            fill="currentColor"
                        />
                    </svg>
                    
                    {/* Индикатор непрочитанных сообщений */}
                    {hasUnreadMessages && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        </div>
                    )}
                </Button>
                
                {/* Индикатор гостя */}
                {/* {!user.isAuth && (
                    <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                        Гость
                    </div>
                )} */}
            </div>

            {/* Модалка чата - для авторизованных пользователей */}
            {user.isAuth && (
                <ChatModal
                    isOpen={isChatOpen}
                    onClose={handleChatClose}
                    onSendMessage={handleSendMessage}
                />
            )}

            {/* Модалка гостевого чата - для неавторизованных пользователей */}
            {!user.isAuth && (
                <GuestChatModal
                    isOpen={isChatOpen}
                    onClose={handleChatClose}
                    onSendMessage={handleSendMessage}
                />
            )}
        </>
    )
}

export default MainPage;