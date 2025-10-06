import { makeAutoObservable, runInAction } from "mobx";
import { type ChatMessage, type Chat } from "@/types/types";
import { createSupportChat, getChats, getChatById, markMessagesAsRead, getUnreadCount, getActiveChatsAdmin, getChatMessagesAdmin, getChatStatsAdmin, createGuestSupportChat, getGuestChatById } from "@/http/chatAPI";

export default class ChatStore {
    _chats: Chat[] = [];
    _currentChat: Chat | null = null;
    _messages: ChatMessage[] = [];
    _unreadCount = 0;
    _loading = false;
    _error = '';
    _isGuest = false;
    _unreadChats: Set<number> = new Set(); // ID чатов с непрочитанными сообщениями

    constructor() {
        makeAutoObservable(this);
    }

    setChats(chats: Chat[]) {
        this._chats = chats;
    }

    setCurrentChat(chat: Chat | null) {
        this._currentChat = chat;
        if (chat?.messages) {
            this.setMessages(chat.messages);
        }
    }

    setMessages(messages: ChatMessage[]) {
        this._messages = messages;
    }

    addMessage(message: ChatMessage) {
        this._messages = [...this._messages, message];
        // Обновляем сообщения в текущем чате
        if (this._currentChat) {
            this._currentChat = {
                ...this._currentChat,
                messages: this._messages
            };
        }
    }

    // Добавление сообщения с отслеживанием непрочитанных (для админ-панели)
    addMessageWithUnreadTracking(message: ChatMessage, currentUserId?: number) {
        // Добавляем сообщение в общий список
        this.addMessage(message);
        
        // Если это сообщение не от текущего пользователя (включая гостевые сообщения), помечаем чат как непрочитанный
        if (currentUserId && (message.userId !== currentUserId || message.senderType === 'GUEST')) {
            this.addUnreadChat(message.chatId);
        }
    }

    setUnreadCount(count: number) {
        this._unreadCount = count;
    }

    setLoading(loading: boolean) {
        this._loading = loading;
    }

    setError(error: string) {
        this._error = error;
    }

    setIsGuest(isGuest: boolean) {
        this._isGuest = isGuest;
    }

    // Методы для управления непрочитанными чатами
    addUnreadChat(chatId: number) {
        this._unreadChats.add(chatId);
    }

    removeUnreadChat(chatId: number) {
        this._unreadChats.delete(chatId);
    }

    clearUnreadChats() {
        this._unreadChats.clear();
    }

    isChatUnread(chatId: number): boolean {
        return this._unreadChats.has(chatId);
    }

    // Создание или получение чата поддержки
    async createSupportChat() {
        try {
            this.setLoading(true);
            this.setError('');

            const chat = await createSupportChat();
            runInAction(() => {
                this.setCurrentChat(chat as Chat);
                this.setMessages(chat.messages || []);
            });

            return chat;
        } catch (error) {
            console.error('Error creating support chat:', error);
            this.setError('Ошибка создания чата поддержки');
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    // Создание или получение гостевого чата поддержки
    async createGuestSupportChat() {
        try {
            this.setLoading(true);
            this.setError('');
            this.setIsGuest(true);

            // Проверяем, есть ли сохраненный ID гостевого чата
            const savedGuestChatId = localStorage.getItem('guestChatId');
            
            if (savedGuestChatId) {
                try {
                    // Пытаемся получить существующий чат
                    const chat = await getGuestChatById(parseInt(savedGuestChatId));
                    runInAction(() => {
                        this.setCurrentChat(chat);
                        this.setMessages(chat.messages || []);
                    });
                    console.log('Restored guest chat from localStorage:', savedGuestChatId);
                    return chat;
                } catch (error) {
                    console.warn('Failed to restore guest chat, creating new one:', error);
                    // Если не удалось восстановить чат, удаляем сохраненный ID
                    localStorage.removeItem('guestChatId');
                }
            }

            // Создаем новый гостевой чат
            const chat = await createGuestSupportChat();
            
            // Сохраняем ID чата в localStorage
            localStorage.setItem('guestChatId', chat.id.toString());
            
            runInAction(() => {
                this.setCurrentChat(chat as Chat);
                this.setMessages(chat.messages || []);
            });

            console.log('Created new guest chat and saved to localStorage:', chat.id);
            return chat;
        } catch (error) {
            console.error('Error creating guest support chat:', error);
            this.setError('Ошибка создания гостевого чата поддержки');
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    // Получение списка чатов
    async fetchChats() {
        try {
            this.setLoading(true);
            this.setError('');

            const chats = await getChats();
            runInAction(() => {
                this.setChats(chats);
            });
        } catch (error) {
            console.error('Error fetching chats:', error);
            this.setError('Ошибка загрузки чатов');
        } finally {
            this.setLoading(false);
        }
    }

    // Получение конкретного чата
    async fetchChat(chatId: number) {
        try {
            this.setLoading(true);
            this.setError('');

            const chat = await getChatById(chatId);
            runInAction(() => {
                this.setCurrentChat(chat);
                this.setMessages(chat.messages || []);
            });
        } catch (error) {
            console.error('Error fetching chat:', error);
            this.setError('Ошибка загрузки чата');
        } finally {
            this.setLoading(false);
        }
    }

    // Получение гостевого чата
    async fetchGuestChat(chatId: number) {
        try {
            this.setLoading(true);
            this.setError('');
            this.setIsGuest(true);

            const chat = await getGuestChatById(chatId);
            runInAction(() => {
                this.setCurrentChat(chat);
                this.setMessages(chat.messages || []);
            });
        } catch (error) {
            console.error('Error fetching guest chat:', error);
            this.setError('Ошибка загрузки гостевого чата');
        } finally {
            this.setLoading(false);
        }
    }

    // Отметить сообщения как прочитанные через API
    async markMessagesRead(chatId: number) {
        try {
            await markMessagesAsRead(chatId);
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    }

    // Получение количества непрочитанных сообщений
    async fetchUnreadCount() {
        try {
            const { unreadCount } = await getUnreadCount();
            runInAction(() => {
                this.setUnreadCount(unreadCount);
            });
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    }

    // Очистка состояния при выходе
    clearChat() {
        runInAction(() => {
            this.setCurrentChat(null);
            this.setMessages([]);
            this.setIsGuest(false);
        });
    }

    // Очистка гостевого чата (удаляет из localStorage)
    clearGuestChat() {
        runInAction(() => {
            this.setCurrentChat(null);
            this.setMessages([]);
            this.setIsGuest(false);
        });
        localStorage.removeItem('guestChatId');
        console.log('Cleared guest chat from localStorage');
    }

    // Админские методы
    async fetchActiveChatsAdmin() {
        try {
            this.setLoading(true);
            this.setError('');

            const chats = await getActiveChatsAdmin();
            runInAction(() => {
                this.setChats(chats);
            });
        } catch (error) {
            console.error('Error fetching active chats:', error);
            this.setError('Ошибка загрузки активных чатов');
        } finally {
            this.setLoading(false);
        }
    }

    async fetchChatMessagesAdmin(chatId: number, limit: number = 100) {
        try {
            this.setLoading(true);
            this.setError('');

            const messages = await getChatMessagesAdmin(chatId, limit);
            runInAction(() => {
                this.setMessages(messages);
            });
        } catch (error) {
            console.error('Error fetching chat messages:', error);
            this.setError('Ошибка загрузки сообщений чата');
        } finally {
            this.setLoading(false);
        }
    }

    async fetchChatStatsAdmin() {
        try {
            const stats = await getChatStatsAdmin();
            return stats;
        } catch (error) {
            console.error('Error fetching chat stats:', error);
            this.setError('Ошибка загрузки статистики чатов');
            throw error;
        }
    }

    get chats() {
        return this._chats;
    }

    get currentChat() {
        return this._currentChat;
    }

    get messages() {
        return this._messages;
    }

    get unreadCount() {
        return this._unreadCount;
    }

    get loading() {
        return this._loading;
    }

    get error() {
        return this._error;
    }

    get isGuest() {
        return this._isGuest;
    }

    get unreadChats() {
        return Array.from(this._unreadChats);
    }
}
