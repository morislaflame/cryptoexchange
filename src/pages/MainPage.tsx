import { useState, useEffect, useContext } from 'react';
import MagicBento from "@/components/ui/MagicBento";
import ChatModal from "@/components/ChatComponents/ChatModal";
import GuestChatModal from "@/components/ChatComponents/GuestChatModal";
import ServiceInfoBlock from "@/components/MainPageComponents/ServiceInfoBlock";
import { Button } from "@/components/ui/button";
import { Context, type IStoreContext } from '@/store/StoreProvider';
// import MainGrid from "@/components/MainPageComponents/MainGrid";

const MainPage = () => {
    const { user } = useContext(Context) as IStoreContext;
    const [isChatOpen, setIsChatOpen] = useState(false);

    useEffect(() => {
        user.fetchMyInfo();
    }, []);

    return (
        <>
            <div className="w-full min-h-screen flex flex-col">
                <div className="flex-1 flex items-center justify-center gap-4 lg:px-8 px-4">
                    <div className='w-full'>
                        <MagicBento
                            clickEffect={true}
                            enableMagnetism={false}
                            enableSpotlight={false}
                            enableBorderGlow={true}
                            enableStars={false}
                            disableAnimations={false}
                            spotlightRadius={300}
                            // particleCount={12}
                            glowColor="#10b981"

                        />
                    </div>
                    {/* <MainGrid /> */}
                </div>
                
                {/* Блок информации о сервисе */}
                <ServiceInfoBlock />
            </div>

            {/* Кнопка чата */}
            <div className="fixed bottom-6 right-6 z-50">
                <Button
                    onClick={() => setIsChatOpen(true)}
                    className="h-14 w-14 rounded-full bg-emerald-600 hover:bg-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200"
                    size="icon"
                    title={user.isAuth ? "Чат поддержки" : "Гостевой чат поддержки"}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                            fill="currentColor"
                        />
                    </svg>
                </Button>
            </div>

            {/* Модалка чата - для авторизованных пользователей */}
            {user.isAuth && (
                <ChatModal
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                />
            )}

            {/* Модалка гостевого чата - для неавторизованных пользователей */}
            {!user.isAuth && (
                <GuestChatModal
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                />
            )}
        </>
    )
}

export default MainPage;