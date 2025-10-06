import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/StoreProvider';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';

interface ChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSendMessage: (text: string) => void;
}

const ChatModal: React.FC<ChatModalProps> = observer(({ isOpen, onClose, onSendMessage }) => {
    const { chat, user } = useStore();
    const [error, setError] = useState('');

    // Создание чата поддержки при открытии
    useEffect(() => {
        if (isOpen && user.user && user.isAuth) {
            chat.createSupportChat().catch((err) => {
                console.error('Error creating support chat:', err);
                setError('Ошибка создания чата');
            });
        }
    }, [isOpen, user.user, user.isAuth, chat]);

    const handleSendMessageInternal = (text: string) => {
        onSendMessage(text);
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="bg-gradient-to-br from-black/90 to-gray-900/95 border-white/10 rounded-2xl p-0 max-w-md w-full max-h-[80vh] h-[600px] flex flex-col overflow-hidden backdrop-blur-xl shadow-2xl">
                <DialogHeader className="p-0">
                    <DialogTitle className="sr-only">Чат с администратором</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col h-full overflow-hidden">
                    <ChatHeader onClose={handleClose} />

                    {error && (
                        <div className="px-4 py-2 bg-red-500/20 text-red-200 text-sm">
                            {error}
                        </div>
                    )}

                    <ChatMessages messages={chat.messages} />

                    <ChatInput
                        onSendMessage={handleSendMessageInternal}
                        disabled={chat.loading}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
});

export default ChatModal;