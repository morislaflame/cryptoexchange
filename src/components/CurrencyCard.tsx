import React, { useState, useMemo } from 'react';
import { GoShieldCheck, GoArrowSwitch } from 'react-icons/go';
import AnimatedList from './AnimatedList';
import CustomInput from './CustomInput';
import CustomTabs, { type TabItem } from './CustomTabs';
import Divider from './Divider';
import { type Currency, mockCurrencies, categoryLabels } from '../types/currency';

interface CurrencyCardProps {
  title: string;
  onCurrencySelect?: (currency: Currency) => void;
  onAmountChange?: (amount: string) => void;
  selectedCurrency?: Currency;
  amount?: string;
}

type CategoryFilter = 'all' | 'fiat' | 'crypto' | 'payment';

const categoryIcons = {
  fiat: <GoShieldCheck className="w-4 h-4" />,
  crypto: <GoShieldCheck className="w-4 h-4" />,
  payment: <GoArrowSwitch className="w-4 h-4" />
};

const createTabItems = (): TabItem[] => [
  {
    value: 'all',
    label: 'Все',
  },
  {
    value: 'fiat',
    label: categoryLabels.fiat,
    icon: categoryIcons.fiat,
  },
  {
    value: 'crypto', 
    label: categoryLabels.crypto,
    icon: categoryIcons.crypto,
  },
  {
    value: 'payment',
    label: 'ПС',
    icon: categoryIcons.payment,
  },
];

const CurrencyCard: React.FC<CurrencyCardProps> = ({
  title,
  onCurrencySelect,
  onAmountChange,
  selectedCurrency,
  amount = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('all');

  const filteredCurrencies = useMemo(() => {
    let filtered = mockCurrencies;

    // Фильтрация по категории
    if (activeFilter !== 'all') {
      filtered = filtered.filter(currency => currency.category === activeFilter);
    }

    // Фильтрация по поиску
    if (searchTerm) {
      filtered = filtered.filter(currency =>
        currency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        currency.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [searchTerm, activeFilter]);

  const currencyListItems = filteredCurrencies.map(currency => 
    `${currency.symbol} - ${currency.name}`
  );

  const handleCurrencySelect = (_item: string, index: number) => {
    const selectedCurrency = filteredCurrencies[index];
    if (onCurrencySelect) {
      onCurrencySelect(selectedCurrency);
    }
    setSearchTerm(selectedCurrency.symbol);
  };

  return (
    <div className="w-full">
        <h2 className="text-center p-4 text-2xl font-bold">{title}</h2>
      <div className="space-y-4 p-4">
        {/* Инпут суммы */}
        <div className="space-y-2">
          <CustomInput
            variant="amount"
            type="number"
            placeholder="Введите сумму"
            value={amount}
            onChange={(value) => onAmountChange?.(value)}
            selectedCurrency={selectedCurrency}
          />
        </div>

        {/* Разделитель между суммой и остальным контентом */}
        <Divider 
          variant="gradient" 
          color="default" 
          size="small" 
          spacing="medium"
        />

        <div className="space-y-2">
          <CustomTabs
            items={createTabItems()}
            activeTab={activeFilter}
            onTabChange={(value) => setActiveFilter(value as CategoryFilter)}
            size="medium"
            variant="default"
            color="success"
            fullWidth={true}
          />
        </div>

        {/* Инпут валюты */}
        <div className="space-y-2">
          <CustomInput
            variant="search"
            type="text"
            placeholder="Введите название валюты"
            value={searchTerm}
            onChange={(value) => setSearchTerm(value)}
          />
        </div>

        {/* Табы фильтрации */}
        

        {/* Список валют */}
        <div className="space-y-2">
          <AnimatedList
            items={currencyListItems}
            onItemSelect={handleCurrencySelect}
            showGradients={true}
            enableArrowNavigation={true}
            className="currency-list"
            itemClassName="currency-item"
            displayScrollbar={true}
          />
        </div>
      </div>    
    </div>
  );
};

export default CurrencyCard;
