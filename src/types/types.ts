export interface UserInfo {
    id: number;
    username: string;

    telegramId: number;
}

export interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'admin';
    timestamp: Date;
    isRead?: boolean;
    chatId?: number;
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
    messages?: ChatMessage[];
}