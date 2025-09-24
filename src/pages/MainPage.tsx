import MagicBento from "@/components/MagicBento";
import MainGrid from "@/components/MainPageComponents/MainGrid";

const MainPage = () => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-4 px-8">
            <div className='w-full'>
                <MagicBento 
                    clickEffect={true}
                    enableMagnetism={true}
                    enableTilt={true}
                    enableSpotlight={true}
                    enableBorderGlow={true}
                    enableStars={true}
                    disableAnimations={false}
                    spotlightRadius={300}
                    particleCount={12}
                    glowColor="#0b9570fa"
                    
                />
            </div>  
            <MainGrid />
        </div>
    )
}

export default MainPage;