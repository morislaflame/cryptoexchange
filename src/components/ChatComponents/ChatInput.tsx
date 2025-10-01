import React, { useState, useRef, type KeyboardEvent } from 'react';
import { observer } from 'mobx-react-lite';

interface ChatInputProps {
    onSendMessage: (text: string) => void;
    disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = observer(({ onSendMessage, disabled = false }) => {
    const [message, setMessage] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSendMessage = () => {
        if (message.trim() && !disabled) {
            onSendMessage(message.trim());
            setMessage('');

            // Автофокус на textarea после отправки
            setTimeout(() => {
                textareaRef.current?.focus();
            }, 0);
        }
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);
    };

    return (
        <div className="px-4 py-4 border-t border-white/10 bg-black/20">
            <div className="flex items-end gap-2 bg-white/5 border border-white/10 rounded-2xl px-3 py-2 transition-all duration-300 focus-within:border-emerald-400/50 focus-within:bg-white/8">
                <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Напишите ваше сообщение..."
                    disabled={disabled}
                    className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/50 text-sm resize-none min-h-[20px] max-h-[120px] overflow-y-auto py-2"
                    rows={1}
                />
                <button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || disabled}
                    className="flex items-center justify-center w-9 h-9 bg-emerald-500 hover:bg-emerald-600 disabled:bg-white/20 disabled:text-white/50 rounded-full transition-all duration-200 flex-shrink-0"
                    title="Отправить сообщение"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
});

export default ChatInput;
