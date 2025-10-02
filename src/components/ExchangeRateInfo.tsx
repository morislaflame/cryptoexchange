import React, { useEffect, useState } from 'react';
import { getLastUpdateTime, clearExchangeRateCache } from '../types/exchangeRates';

interface ExchangeRateInfoProps {
  className?: string;
}

const ExchangeRateInfo: React.FC<ExchangeRateInfoProps> = ({ className = '' }) => {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      setLastUpdate(getLastUpdateTime());
    };

    updateTime();
    
    // Обновляем каждые 5 секунд
    const interval = setInterval(updateTime, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    clearExchangeRateCache();
    
    // Даем время на обновление
    setTimeout(() => {
      setLastUpdate(getLastUpdateTime());
      setIsRefreshing(false);
    }, 1000);
  };

  const formatTimeAgo = (date: Date | null): string => {
    if (!date) return 'Загрузка...';

    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds} сек. назад`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} мин. назад`;
    
    return date.toLocaleTimeString('ru-RU');
  };

  return (
    <div className={`flex items-center gap-2 text-xs text-white/60 ${className}`}>
      <div className="flex items-center gap-1">
        <svg 
          className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
          />
        </svg>
        <span>Курсы обновлены: {formatTimeAgo(lastUpdate)}</span>
      </div>
      
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Обновить курсы"
      >
        Обновить
      </button>
      
      
    </div>
  );
};

export default ExchangeRateInfo;

