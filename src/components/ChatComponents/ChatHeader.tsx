import React from 'react';

interface ChatHeaderProps {
    onClose?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = () => {
    return (
        <div className="px-4 py-4 border-b border-white/10 bg-black/30 backdrop-blur-md">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 relative">
                        <span className="text-white font-semibold text-sm uppercase">А</span>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black/50"></div>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <h3 className="text-white text-base font-semibold">Поддержка</h3>
                        <span className={`text-xs font-medium text-emerald-400`}>
                            Онлайн
                        </span>
                    </div>
                </div>
                {/* {onClose && (
                    <button
                        onClick={onClose}
                        className="flex items-center justify-center w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full text-white/70 hover:text-white/90 transition-all duration-200"
                        title="Закрыть чат"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M18 6L6 18M6 6L18 18"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                )} */}
            </div>
        </div>
    );
};

export default ChatHeader;
