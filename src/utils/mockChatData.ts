import { ChatMessage } from '@/types/types';

export const mockChatMessages: ChatMessage[] = [
    {
        id: '1',
        text: 'Здравствуйте! Чем могу помочь?',
        sender: 'admin',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 минут назад
        isRead: true
    },
    {
        id: '2',
        text: 'Мне нужна помощь с обменом валюты',
        sender: 'user',
        timestamp: new Date(Date.now() - 1000 * 60 * 25), // 25 минут назад
        isRead: true
    },
    {
        id: '3',
        text: 'Конечно! Какой обмен вы хотите совершить?',
        sender: 'admin',
        timestamp: new Date(Date.now() - 1000 * 60 * 20), // 20 минут назад
        isRead: true
    },
    {
        id: '4',
        text: 'Хочу обменять USD на EUR',
        sender: 'user',
        timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 минут назад
        isRead: false
    }
];
