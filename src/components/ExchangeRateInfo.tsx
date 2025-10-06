import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../store/StoreProvider';

interface ExchangeRateInfoProps {
  className?: string;
}

const ExchangeRateInfo: React.FC<ExchangeRateInfoProps> = observer(({ className = '' }) => {
  const { exchangeRates } = useStore();

  useEffect(() => {
    // Загружаем курсы при монтировании компонента
    if (exchangeRates.needsUpdate) {
      exchangeRates.fetchExchangeRates();
    }
    
    // Обновляем каждые 5 секунд
    const interval = setInterval(() => {
      if (exchangeRates.needsUpdate) {
        exchangeRates.fetchExchangeRates();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [exchangeRates]);

  const handleRefresh = async () => {
    await exchangeRates.refreshExchangeRates();
  };

  return (
    <div className={`flex items-center gap-2 text-xs text-white/60 ${className}`}>
      <div className="flex items-center gap-1">
        <svg 
          className={`w-3 h-3 ${exchangeRates.isRefreshing ? 'animate-spin' : ''}`} 
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
        <span>Курсы обновлены: {exchangeRates.lastUpdateFormatted}</span>
      </div>
      
      <button
        onClick={handleRefresh}
        disabled={exchangeRates.isRefreshing}
        className="text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Обновить курсы"
      >
        Обновить
      </button>
    </div>
  );
});

export default ExchangeRateInfo;