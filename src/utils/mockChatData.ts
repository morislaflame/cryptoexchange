import { type ChatMessage } from '@/types/types';

export const mockChatMessages: ChatMessage[] = [
    {
        id: 1,
        text: 'Здравствуйте! Чем могу помочь?',
        senderType: 'ADMIN',
        isRead: true,
        readAt: new Date(Date.now() - 1000 * 60 * 29).toISOString(),
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        chatId: 1,
        userId: 1,
        user: {
            id: 1,
            email: 'admin@mail.com',
            role: 'ADMIN'
        }
    },
    {
        id: 2,
        text: 'Мне нужна помощь с обменом валюты',
        senderType: 'USER',
        isRead: true,
        readAt: new Date(Date.now() - 1000 * 60 * 24).toISOString(),
        createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        chatId: 1,
        userId: 2,
        user: {
            id: 2,
            email: 'user@mail.com',
            role: 'USER'
        }
    },
    {
        id: 3,
        text: 'Конечно! Какой обмен вы хотите совершить?',
        senderType: 'ADMIN',
        isRead: true,
        readAt: new Date(Date.now() - 1000 * 60 * 19).toISOString(),
        createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
        chatId: 1,
        userId: 1,
        user: {
            id: 1,
            email: 'admin@mail.com',
            role: 'ADMIN'
        }
    },
    {
        id: 4,
        text: 'Хочу обменять USD на EUR',
        senderType: 'USER',
        isRead: false,
        readAt: null,
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        chatId: 1,
        userId: 2,
        user: {
            id: 2,
            email: 'user@mail.com',
            role: 'USER'
        }
    }
];
