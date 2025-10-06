import React, { useState, useRef } from 'react';
import { GoX } from 'react-icons/go';
import type { Currency } from '../../types/currency';
import './CustomInput.css';

interface BaseInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  type?: 'text' | 'number';
  readOnly?: boolean;
}

interface CurrencyAmountInputProps extends BaseInputProps {
  variant: 'amount';
  selectedCurrency?: Currency;
}

interface SearchInputProps extends BaseInputProps {
  variant: 'search';
}

type CustomInputProps = CurrencyAmountInputProps | SearchInputProps;

const CustomInput: React.FC<CustomInputProps> = (props) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { value, onChange, placeholder, className = '', type = 'text', readOnly = false } = props;

  const handleClear = () => {
    if (!readOnly) {
      onChange('');
      inputRef.current?.focus();
    }
  };

  const handleFocus = () => {
    if (!readOnly) {
      setIsFocused(true);
    }
  };
  
  const handleBlur = () => setIsFocused(false);

  const showClearButton = value.length > 0 && !readOnly;
  const showPlaceholder = !isFocused && value.length === 0;

  return (
    <div className={`custom-input-container ${className}`}>
      <div className="custom-input-wrapper">
        {/* Плейсхолдер слева */}
        {showPlaceholder && (
          <div className="custom-input-placeholder">
            {placeholder}
          </div>
        )}

        {/* Основной инпут */}
        <input
          ref={inputRef}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="custom-input-field"
          placeholder=""
          readOnly={readOnly}
        />

        {/* Контролы справа */}
        <div className="custom-input-controls">
          {/* Кнопка очистки */}
          {showClearButton && (
            <button
              type="button"
              onClick={handleClear}
              className="custom-input-clear"
              title="Очистить"
            >
              <GoX size={16} />
            </button>
          )}

          {/* Информация о валюте (только для amount варианта) */}
          {props.variant === 'amount' && props.selectedCurrency && (
            <div className="flex items-center gap-2 font-semibold justify-center">
              {props.selectedCurrency.icon && typeof props.selectedCurrency.icon === 'string' && (props.selectedCurrency.icon.includes('.png') || props.selectedCurrency.icon.includes('.jpg') || props.selectedCurrency.icon.includes('.svg')) ? (
                <img 
                  src={props.selectedCurrency.icon} 
                  alt={props.selectedCurrency.name}
                  className="w-6 h-6 object-contain"
                />
              ) : (
                <span className="text-lg">{props.selectedCurrency.icon}</span>
              )}
              {/* <span className="currency-symbol">
                {props.selectedCurrency.symbol}
              </span> */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomInput;
