import React, { useEffect, useRef } from 'react';
import { type ChatMessage as ChatMessageType } from '@/types/types';
import ChatMessage from './ChatMessage';

interface ChatMessagesProps {
    messages: ChatMessageType[];
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="flex-1 overflow-hidden overflow-y-auto hide-scrollbar ios-scroll">
            <div className="flex-1 px-4 py-2">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full min-h-[200px]">
                        <p className="text-white/50 text-sm text-center">Начните разговор с администратором</p>
                    </div>
                ) : (
                    <>
                        {messages.map((message) => (
                            <ChatMessage key={message.id} message={message} />
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>
        </div>
    );
};

export default ChatMessages;
