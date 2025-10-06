import React, { useState } from 'react';
import { motion } from 'motion/react';
import type { BankOption, NetworkOption, PaymentCurrencyOption } from '../../types/currency';

interface OptionCardProps {
  option: BankOption | NetworkOption | PaymentCurrencyOption;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}

const OptionCard: React.FC<OptionCardProps> = ({
  option,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter
}) => {
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="mb-2"
    >
      <div
        className={`
          group relative overflow-hidden rounded-lg transition-all duration-300 cursor-pointer backdrop-blur-sm
          ${isSelected 
            ? 'border border-emerald-500 bg-emerald-500/10' 
            : isHovered
              ? 'border border-white/10 bg-white/10'
              : 'border border-white/10 bg-black/30'
          }
        `}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
      >
        <div className="relative p-3 flex items-center gap-3">
          {/* Иконка */}
          <div className={`
            flex items-center justify-center w-10 h-10 rounded-full text-base font-bold transition-all duration-300 overflow-hidden
            ${isSelected 
              ? 'bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500/30' 
              : isHovered 
                ? 'bg-white/20 text-white/90'
                : 'bg-white/10 text-white/70'
            }
          `}>
            {option.icon ? (
              // Если иконка - это путь к файлу (содержит .png, .jpg и т.д.), показываем изображение
              typeof option.icon === 'string' && (option.icon.includes('.png') || option.icon.includes('.jpg') || option.icon.includes('.svg')) ? (
                <img 
                  src={option.icon} 
                  alt={option.name}
                  className="w-4 h-4 object-contain"
                />
              ) : (
                // Иначе - это эмодзи или текст
                option.icon
              )
            ) : (
              // Если иконки нет - первая буква названия
              option.name.charAt(0)
            )}
          </div>
          
          {/* Название */}
          <div className="flex-1 min-w-0">
            <span className={`
              font-semibold text-sm
              text-white
              transition-colors duration-300
            `}>
              {option.name}
            </span>
          </div>
          
          {/* Индикатор выбора */}
          {isSelected && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.01 }}
              className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

interface BankNetworkSelectorProps {
  type: 'bank' | 'network' | 'currency';
  options: BankOption[] | NetworkOption[] | PaymentCurrencyOption[];
  selectedOption?: BankOption | NetworkOption | PaymentCurrencyOption;
  onSelect: (option: BankOption | NetworkOption | PaymentCurrencyOption) => void;
}

const BankNetworkSelector: React.FC<BankNetworkSelectorProps> = ({
  type,
  options,
  selectedOption,
  onSelect
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number>(-1);

  const handleOptionClick = (option: BankOption | NetworkOption | PaymentCurrencyOption) => {
    onSelect(option);
  };

  const isSelected = (index: number) => {
    return selectedOption?.id === options[index]?.id;
  };

  const isHovered = (index: number) => {
    return hoveredIndex === index && !isSelected(index);
  };

  const title = type === 'bank' ? 'Выберите банк' : type === 'network' ? 'Выберите сеть' : 'Выберите валюту';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-3 mt-4"
    >
      <h3 className="text-sm font-semibold text-white/80 px-1">{title}</h3>
      <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 hide-scrollbar">
        {options.map((option, index) => (
          <OptionCard
            key={option.id}
            option={option}
            isSelected={isSelected(index)}
            isHovered={isHovered(index)}
            onClick={() => handleOptionClick(option)}
            onMouseEnter={() => setHoveredIndex(index)}
          />
        ))}
        
        {options.length === 0 && (
          <div className="flex items-center justify-center py-8 text-white/50">
            <div className="text-center">
              <p>Опции не найдены</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default BankNetworkSelector;

