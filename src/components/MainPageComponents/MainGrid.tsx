import MainCard from "./MainCard";

const MainGrid = () => {
    const cardData = [
        {
            title: 'Криптовалютная Торговля',
            description: 'Торгуйте Bitcoin, Ethereum и другими топовыми криптовалютами с низкими комиссиями',
            label: 'Торговля'
        },
        {
            title: 'Безопасность',
            description: 'Многоуровневая защита средств с холодным хранением и двухфакторной аутентификацией',
            label: 'Защита'
        },
        {
            title: 'Аналитика',
            description: 'Продвинутые графики, технические индикаторы и инструменты для анализа рынка',
            label: 'Анализ'
        }
    ];

    return (
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full'>
            {/* Первая карточка */}
            
            <div className='w-full'>
                <MainCard data={cardData[0]} />
            </div>
            
            {/* Вторая карточка */}
            <div className='w-full'>
                <MainCard data={cardData[1]} />
            </div>
            
            {/* Третья карточка - на средних экранах занимает полную ширину */}
            <div className='w-full md:col-span-2 xl:col-span-1'>
                <MainCard data={cardData[2]} />
            </div>
        </div>
    );
};

export default MainGrid;