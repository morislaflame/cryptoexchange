import { makeAutoObservable, runInAction } from "mobx";
import { type ChatMessage, type Chat } from "@/types/types";
import { createSupportChat, getChats, getChatById, markMessagesAsRead, getUnreadCount } from "@/http/chatAPI";

export default class ChatStore {
    _chats: Chat[] = [];
    _currentChat: Chat | null = null;
    _messages: ChatMessage[] = [];
    _unreadCount = 0;
    _loading = false;
    _error = '';

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

    setUnreadCount(count: number) {
        this._unreadCount = count;
    }

    setLoading(loading: boolean) {
        this._loading = loading;
    }

    setError(error: string) {
        this._error = error;
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
        });
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
}
