import MagicBento from "@/components/MagicBento";
import MainGrid from "@/components/MainPageComponents/MainGrid";

const MainPage = () => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-4 lg:px-8 px-4">
            <div className='w-full'>
                <MagicBento 
                    clickEffect={true}
                    enableMagnetism={true}
                    enableSpotlight={true}
                    enableBorderGlow={true}
                    enableStars={false}
                    disableAnimations={false}
                    spotlightRadius={300}
                    // particleCount={12}
                    glowColor="#10b981"
                    
                />
            </div>  
            <MainGrid />
        </div>
    )
}

export default MainPage;