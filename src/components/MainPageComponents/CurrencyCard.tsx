import React, { useMemo } from 'react';
import { GoShieldCheck, GoArrowSwitch } from 'react-icons/go';
import CustomInput from '../ui/CustomInput';
import CustomTabs, { type TabItem } from '../ui/CustomTabs';
import Divider from '../ui/Divider';
import CurrencyCardList from './CurrencyCardList';
import BankNetworkSelector from './BankNetworkSelector';
import { type Currency, type BankOption, type NetworkOption, type PaymentCurrencyOption, mockCurrencies, categoryLabels } from '../../types/currency';
import './CurrencyCard.css';

interface CurrencyCardProps {
  title: string;
  onCurrencySelect?: (currency: Currency | undefined) => void;
  onAmountChange?: (amount: string) => void;
  onSearchChange?: (searchTerm: string) => void;
  onFilterChange?: (activeFilter: 'all' | 'fiat' | 'crypto' | 'payment') => void;
  onBankSelect?: (bank: BankOption) => void;
  onNetworkSelect?: (network: NetworkOption) => void;
  onPaymentCurrencySelect?: (currency: PaymentCurrencyOption) => void;
  selectedCurrency?: Currency;
  selectedBank?: BankOption;
  selectedNetwork?: NetworkOption;
  selectedPaymentCurrency?: PaymentCurrencyOption;
  amount?: string;
  searchTerm?: string;
  activeFilter?: 'all' | 'fiat' | 'crypto' | 'payment';
  readOnly?: boolean; // Режим только для чтения
  displayOnly?: boolean; // Только отображение без инпута
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
  onSearchChange,
  onFilterChange,
  onBankSelect,
  onNetworkSelect,
  onPaymentCurrencySelect,
  selectedCurrency,
  selectedBank,
  selectedNetwork,
  selectedPaymentCurrency,
  amount = '',
  searchTerm = '',
  activeFilter = 'all',
  readOnly = false,
  displayOnly = false
}) => {

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

  const handleCurrencySelect = (currency: Currency, index: number) => {
    if (index === -1) {
      // Сброс выбора
      if (onCurrencySelect) {
        onCurrencySelect(undefined);
      }
      if (onSearchChange) {
        onSearchChange(''); // Очищаем поисковый термин
      }
    } else {
      // Обычный выбор
      if (onCurrencySelect) {
        onCurrencySelect(currency);
      }
      if (onSearchChange) {
        onSearchChange(currency.symbol);
      }
    }
  };

  return (
    <div className="w-full">
        <h2 className="text-center p-4 text-2xl font-bold">{title}</h2>
      <div className="space-y-4 p-4">
        {/* Инпут суммы или отображение */}
        <div className="space-y-2">
          {displayOnly ? (
            <div className="custom-amount-display">
              <div className="amount-display-wrapper">
                <div className="amount-display-content">
                  <span className="amount-display-value">
                    {amount || '0.000000'}
                  </span>
                  {selectedCurrency && (
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm px-2 py-1 border border-emerald-500/20 rounded-lg backdrop-blur-sm justify-center">
                      <span className="currency-symbol">
                        {selectedCurrency.symbol}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <CustomInput
              variant="amount"
              type="number"
              placeholder="Введите сумму"
              value={amount}
              onChange={(value) => {
                if (!readOnly && onAmountChange) {
                  onAmountChange(value);
                }
              }}
              selectedCurrency={selectedCurrency}
              readOnly={readOnly}
            />
          )}
        </div>

        {/* Разделитель между суммой и остальным контентом */}
        <Divider 
          variant="gradient" 
          color="primary" 
          size="small" 
          spacing="medium"
        />

        <div className="space-y-2">
            <CustomTabs
              items={createTabItems()}
              activeTab={activeFilter}
              onTabChange={(value) => {
                const newFilter = value as CategoryFilter;
                if (onFilterChange) {
                  onFilterChange(newFilter);
                }
              }}
              size="medium"
              variant="default"
              color="success"
              fullWidth={true}
            />
        </div>

        {/* Инпут валюты */}
        <div className="space-y-4 mb-4">
          <CustomInput
            variant="search"
            type="text"
            placeholder="Введите название валюты"
            value={searchTerm}
            onChange={(value) => {
              if (onSearchChange) {
                onSearchChange(value);
              }
            }}
          />
        </div>

        {/* Список валют */}
        <div className="space-y-2">
          <CurrencyCardList
            currencies={filteredCurrencies}
            selectedCurrency={selectedCurrency}
            onCurrencySelect={handleCurrencySelect}
            enableKeyboardNavigation={true}
            className="rounded-lg"
          />
        </div>

        {/* Селектор банка/сети */}
        {selectedCurrency?.banks && selectedCurrency.banks.length > 0 && (
          <>
            <BankNetworkSelector
              type="bank"
              options={selectedCurrency.banks}
              selectedOption={selectedBank}
              onSelect={(option) => {
                if (onBankSelect) {
                  onBankSelect(option as BankOption);
                }
              }}
            />
            {!selectedBank && (
              <div className="mt-2 p-2 rounded-lg bg-gray-500/10 border border-gray-500/20">
                <p className="text-xs text-gray-400/80 text-center">
                  Выберите банк для продолжения
                </p>
              </div>
            )}
          </>
        )}

        {selectedCurrency?.networks && selectedCurrency.networks.length > 0 && (
          <>
            <BankNetworkSelector
              type="network"
              options={selectedCurrency.networks}
              selectedOption={selectedNetwork}
              onSelect={(option) => {
                if (onNetworkSelect) {
                  onNetworkSelect(option as NetworkOption);
                }
              }}
            />
            {!selectedNetwork && (
              <div className="mt-2 p-2 rounded-lg bg-gray-500/10 border border-gray-500/20">
                <p className="text-xs text-gray-400/80 text-center">
                  Выберите сеть для продолжения
                </p>
              </div>
            )}
          </>
        )}

        {selectedCurrency?.paymentCurrencies && selectedCurrency.paymentCurrencies.length > 0 && (
          <>
            <BankNetworkSelector
              type="currency"
              options={selectedCurrency.paymentCurrencies}
              selectedOption={selectedPaymentCurrency}
              onSelect={(option) => {
                if (onPaymentCurrencySelect) {
                  onPaymentCurrencySelect(option as PaymentCurrencyOption);
                }
              }}
            />
            {!selectedPaymentCurrency && (
              <div className="mt-2 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-xs text-blue-400/80 text-center">
                  Выберите валюту для расчета курса
                </p>
              </div>
            )}
          </>
        )}
      </div>    
    </div>
  );
};

export default CurrencyCard;
