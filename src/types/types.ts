export interface UserInfo {
    id: number;
    username: string;
    email?: string;
    role: 'USER' | 'ADMIN';
    telegramId: number;
}

export interface ChatMessage {
    id: number;
    text: string;
    senderType: 'USER' | 'ADMIN';
    isRead: boolean;
    readAt: string | null;
    createdAt: string;
    updatedAt: string;
    chatId: number;
    userId: number;
    user?: {
        id: number;
        email?: string;
        role: string;
    };
}

export interface ChatState {
    messages: ChatMessage[];
    isOpen: boolean;
}

export interface Chat {
    id: number;
    title?: string;
    type: "DIRECT" | "SUPPORT";
    isActive: boolean;
    users?: Array<{
        id: number;
        email?: string;
        role: string;
    }>;
    chatUsers?: Array<{
        id: number;
        email?: string;
        role: string;
    }>;
    messages?: ChatMessage[];
}