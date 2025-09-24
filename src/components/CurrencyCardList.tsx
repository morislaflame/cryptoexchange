import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'motion/react';
import type { Currency } from '../types/currency';

interface CurrencyCardProps {
  currency: Currency;
  index: number;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}

const CurrencyCard: React.FC<CurrencyCardProps> = ({
  currency,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.5, once: false });

  return (
    <motion.div
      ref={ref}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="mb-3"
    >
      <div
        className={`
          group relative overflow-hidden rounded-lg transition-all duration-300 cursor-pointer backdrop-blur-sm
          ${isSelected 
            ? 'border-2 border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/20' 
            : isHovered
              ? 'border border-white/10 bg-white/10'
              : 'border border-white/10 bg-white/5'
          }
        `}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
      >
        {/* Анимированный фон при hover */}
        {/* <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent 
                        transform -translate-x-full group-hover:translate-x-full transition-transform duration-700" /> */}
        
        <div className="relative p-4 flex items-center gap-4">
          {/* Иконка валюты */}
          <div className={`
            flex items-center justify-center w-12 h-12 rounded-full text-lg font-bold transition-all duration-300
            ${isSelected 
              ? 'bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500/30' 
              : isHovered 
                ? 'bg-white/20 text-white/90'
                : 'bg-white/10 text-white/70'
            }
          `}>
            {currency.icon || currency.symbol.charAt(0)}
          </div>
          
          {/* Информация о валюте */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`
                font-semibold text-sm
                text-white
                transition-colors duration-300
              `}>
                {currency.symbol}
              </span>
            </div>
            <p className={`
              text-sm truncate
              text-white/70
              transition-colors duration-300
            `}>
              {currency.name}
            </p>
          </div>
          
          {/* Индикатор выбора */}
          {isSelected && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.01 }}
              className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

interface CurrencyCardListProps {
  currencies: Currency[];
  selectedCurrency?: Currency;
  onCurrencySelect: (currency: Currency, index: number) => void;
  maxHeight?: string;
  enableKeyboardNavigation?: boolean;
  className?: string;
}

const CurrencyCardList: React.FC<CurrencyCardListProps> = ({
  currencies,
  selectedCurrency,
  onCurrencySelect,
  maxHeight = 'max-h-80',
  enableKeyboardNavigation = true,
  className = ''
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number>(-1);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [keyboardNav, setKeyboardNav] = useState<boolean>(false);
  const listRef = useRef<HTMLDivElement>(null);

  // Найти индекс выбранной валюты
  useEffect(() => {
    if (selectedCurrency) {
      const index = currencies.findIndex(c => c.id === selectedCurrency.id);
      setSelectedIndex(index);
    } else {
      setSelectedIndex(-1);
    }
  }, [selectedCurrency, currencies]);

  // Обработка клавиатурной навигации
  useEffect(() => {
    if (!enableKeyboardNavigation) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
        e.preventDefault();
        setKeyboardNav(true);
        setHoveredIndex(prev => Math.min(prev + 1, currencies.length - 1));
      } else if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
        e.preventDefault();
        setKeyboardNav(true);
        setHoveredIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        if (hoveredIndex >= 0 && hoveredIndex < currencies.length) {
          e.preventDefault();
          onCurrencySelect(currencies[hoveredIndex], hoveredIndex);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hoveredIndex, currencies, onCurrencySelect, enableKeyboardNavigation]);

  // Автоскролл к выделенному элементу
  useEffect(() => {
    if (!keyboardNav || hoveredIndex < 0 || !listRef.current) return;

    const container = listRef.current;
    const hoveredItem = container.children[hoveredIndex] as HTMLElement;
    
    if (hoveredItem) {
      const containerRect = container.getBoundingClientRect();
      const itemRect = hoveredItem.getBoundingClientRect();
      
      if (itemRect.bottom > containerRect.bottom) {
        hoveredItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else if (itemRect.top < containerRect.top) {
        hoveredItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
    
    setKeyboardNav(false);
  }, [hoveredIndex, keyboardNav]);

  const handleCurrencyClick = (currency: Currency, index: number) => {
    // Если кликнули на уже выбранную валюту, сбрасываем выбор
    if (selectedIndex === index) {
      setSelectedIndex(-1);
      onCurrencySelect(currency, -1); // Передаем -1 как индикатор сброса
    } else {
      setSelectedIndex(index);
      onCurrencySelect(currency, index);
    }
  };

  const handleMouseEnter = (index: number) => {
    setHoveredIndex(index);
    setKeyboardNav(false);
  };

  const isSelected = (index: number) => {
    return selectedIndex === index;
  };

  const isHovered = (index: number) => {
    return hoveredIndex === index && selectedIndex !== index;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Градиенты сверху и снизу */}
      {/* <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-[#01140f] to-transparent pointer-events-none z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#01140f] to-transparent pointer-events-none z-10" />
       */}
      {/* Список валют */}
      <div
        ref={listRef}
        className={`
          ${maxHeight} overflow-y-auto
          scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 hide-scrollbar
        `}
      >
         {currencies.map((currency, index) => (
           <CurrencyCard
             key={currency.id}
             currency={currency}
             index={index}
             isSelected={isSelected(index)}
             isHovered={isHovered(index)}
             onClick={() => handleCurrencyClick(currency, index)}
             onMouseEnter={() => handleMouseEnter(index)}
           />
         ))}
        
        {currencies.length === 0 && (
          <div className="flex items-center justify-center py-12 text-white/50">
            <div className="text-center">
              <p>Валюты не найдены</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrencyCardList;
