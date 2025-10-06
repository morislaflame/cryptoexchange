import { $authHost } from "./index";
import { type ChatMessage } from "@/types/types";

export interface Chat {
    id: number;
    title?: string;
    type: "DIRECT" | "SUPPORT";
    isActive: boolean;
    users: Array<{
        id: number;
        email?: string;
        role: string;
    }>;
    messages?: ChatMessage[];
}

export interface CreateChatResponse {
    id: number;
    title?: string;
    type: string;
    isActive: boolean;
    users: Array<{
        id: number;
        email?: string;
        role: string;
    }>;
    messages: ChatMessage[];
}

export const createSupportChat = async (): Promise<CreateChatResponse> => {
    const { data } = await $authHost.post('api/chat/support');
    return data;
};

export const getChats = async (): Promise<Chat[]> => {
    const { data } = await $authHost.get('api/chat');
    return data;
};

export const getChatById = async (chatId: number): Promise<Chat> => {
    const { data } = await $authHost.get(`api/chat/${chatId}`);
    return data;
};

export const markMessagesAsRead = async (chatId: number): Promise<void> => {
    await $authHost.post(`api/chat/${chatId}/mark-read`);
};

export const getUnreadCount = async (): Promise<{ unreadCount: number }> => {
    const { data } = await $authHost.get('api/chat/unread/count');
    return data;
};

// Админские методы
export const getActiveChatsAdmin = async (): Promise<Chat[]> => {
    const { data } = await $authHost.get('api/chat/admin/active');
    return data;
};

export const getChatMessagesAdmin = async (chatId: number, limit: number = 100): Promise<ChatMessage[]> => {
    const { data } = await $authHost.get(`api/chat/admin/${chatId}/messages`, {
        params: { limit }
    });
    return data;
};

export const getChatStatsAdmin = async (): Promise<{
    totalChats: number;
    activeChats: number;
    totalMessages: number;
    unreadMessages: number;
}> => {
    const { data } = await $authHost.get('api/chat/admin/stats');
    return data;
};

// Гостевые методы для неавторизованных пользователей
export const createGuestSupportChat = async (): Promise<CreateChatResponse> => {
    const { data } = await $authHost.post('api/chat/guest/support');
    return data;
};

export const getGuestChatById = async (chatId: number): Promise<Chat> => {
    const { data } = await $authHost.get(`api/chat/guest/${chatId}`);
    return data;
};