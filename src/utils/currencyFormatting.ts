import { type Currency, type PaymentCurrencyOption } from '../types/currency';

/**
 * Получить правильный символ валюты для отображения
 * @param currency - основная валюта
 * @param paymentCurrency - выбранная валюта внутри платежной системы (опционально)
 * @returns символ валюты для отображения
 */
export const getDisplayCurrencySymbol = (
  currency?: Currency, 
  paymentCurrency?: PaymentCurrencyOption
): string => {
  if (!currency) return '';
  
  // Для платежных систем показываем название выбранной валюты внутри ПС
  if (currency.category === 'payment' && paymentCurrency) {
    return paymentCurrency.name;
  }
  
  // Для остальных валют показываем их символ
  return currency.symbol;
};

/**
 * Получить правильную валюту для форматирования чисел
 * @param currency - основная валюта
 * @param paymentCurrency - выбранная валюта внутри платежной системы (опционально)
 * @returns валюта для форматирования
 */
export const getDisplayCurrency = (
  currency?: Currency, 
  paymentCurrency?: PaymentCurrencyOption
): Currency | undefined => {
  if (!currency) return undefined;
  
  // Для платежных систем используем выбранную валюту внутри ПС для форматирования
  if (currency.category === 'payment' && paymentCurrency) {
    return {
      id: paymentCurrency.id,
      symbol: paymentCurrency.name, // Используем name как symbol
      name: paymentCurrency.name,
      category: 'fiat', // Платежные валюты форматируем как фиатные
      icon: paymentCurrency.icon
    } as Currency;
  }
  
  // Для остальных валют используем их как есть
  return currency;
};

/**
 * Получить правильный символ валюты для отображения в профиле
 * @param currency - валюта из API
 * @param paymentCurrencyName - название валюты внутри платежной системы (опционально)
 * @returns символ валюты для отображения
 */
export const getProfileCurrencySymbol = (currency: Currency, paymentCurrencyName?: string): string => {
  if (!currency) return '';
  
  // Для платежных систем используем paymentCurrencyName, если оно есть
  if (currency.category === 'payment' && paymentCurrencyName) {
    return paymentCurrencyName;
  }
  
  // Если это объект с полем symbol, используем его
  if (currency.symbol) {
    return currency.symbol;
  }
  
  // Если это строка, возвращаем как есть
  if (typeof currency === 'string') {
    return currency;
  }
  
  return '';
};

/**
 * Получить правильную валюту для форматирования в профиле
 * @param currency - валюта из API
 * @param paymentCurrencyName - название валюты внутри платежной системы (опционально)
 * @returns валюта для форматирования
 */
export const getProfileCurrency = (currency: Currency, paymentCurrencyName?: string): Currency | undefined => {
  if (!currency) return undefined;
  
  // Для платежных систем используем paymentCurrencyName для создания Currency
  if (currency.category === 'payment' && paymentCurrencyName) {
    return {
      id: paymentCurrencyName.toLowerCase(),
      symbol: paymentCurrencyName,
      name: paymentCurrencyName,
      category: 'fiat', // Платежные валюты форматируем как фиатные
      icon: paymentCurrencyName
    } as Currency;
  }
  
  // Если это объект с полями валюты, создаем Currency
  if (currency.symbol && currency.category) {
    return {
      id: currency.id || currency.symbol.toLowerCase(),
      symbol: currency.symbol,
      name: currency.name || currency.symbol,
      category: currency.category,
      icon: currency.icon
    } as Currency;
  }
  
  // Если это строка, создаем базовую валюту
  if (typeof currency === 'string') {
    return {
      id: currency,
      symbol: currency,
      name: currency,
      category: 'fiat', // По умолчанию считаем фиатной
      icon: currency
    } as Currency;
  }
  
  return undefined;
};
