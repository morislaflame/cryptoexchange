import { type Currency, type BankOption, type NetworkOption, type PaymentCurrencyOption } from './currency';

// Интерфейс для данных валидации заявки
export interface ExchangeValidationData {
  // Основные поля
  fromCurrency?: Currency;
  toCurrency?: Currency;
  fromAmount: string;
  toAmount: string;
  
  // Опции для отправки
  fromSelectedBank?: BankOption;
  fromSelectedNetwork?: NetworkOption;
  fromSelectedPaymentCurrency?: PaymentCurrencyOption;
  
  // Опции для получения
  selectedBank?: BankOption;
  selectedNetwork?: NetworkOption;
  selectedPaymentCurrency?: PaymentCurrencyOption;
  
  // Реквизиты для получения
  walletAddress?: string;
  cardNumber?: string;
  paymentDetails?: string;
  
  recipientEmail?: string;
  recipientTelegramUsername?: string;
  
  // Статус авторизации
  isAuth: boolean;
}

// Результат валидации
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Детальная валидация полей
export interface DetailedValidationResult {
  // Валидация валют
  fromCurrencyValid: boolean;
  toCurrencyValid: boolean;
  
  // Валидация сумм
  fromAmountValid: boolean;
  toAmountValid: boolean;
  
  // Валидация опций
  fromOptionsValid: boolean;
  toOptionsValid: boolean;
  
  // Валидация реквизитов
  recipientDataValid: boolean;
  
  // Валидация контактных данных
  contactDataValid: boolean;
  
  // Общая валидация
  overallValid: boolean;
  
  // Ошибки
  errors: {
    fromCurrency?: string;
    toCurrency?: string;
    fromAmount?: string;
    toAmount?: string;
    fromOptions?: string;
    toOptions?: string;
    recipientData?: string;
    contactData?: string;
  };
}
