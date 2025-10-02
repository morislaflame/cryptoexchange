import { exchangeRateService } from '../services/exchangeRateService';

// Интерфейс для курса обмена
export interface ExchangeRate {
  from: string;  // ID валюты откуда
  to: string;    // ID валюты куда
  rate: number;  // Курс обмена
}

export const mockExchangeRates: ExchangeRate[] = [
  // USD как базовая валюта
  { from: 'usd', to: 'eur', rate: 0.85 },
  { from: 'usd', to: 'rub', rate: 75.0 },
  { from: 'usd', to: 'gbp', rate: 0.73 },
  { from: 'usd', to: 'jpy', rate: 110.0 },
  { from: 'usd', to: 'cad', rate: 1.25 },
  { from: 'usd', to: 'aud', rate: 1.35 },
  { from: 'usd', to: 'chf', rate: 0.92 },
  
  // Криптовалюты к USD
  { from: 'usd', to: 'btc', rate: 0.000023 }, // 1 USD = 0.000023 BTC
  { from: 'usd', to: 'eth', rate: 0.0004 },  // 1 USD = 0.0004 ETH
  { from: 'usd', to: 'usdt', rate: 1.0 },    // 1 USD = 1 USDT
  { from: 'usd', to: 'bnb', rate: 0.003 },   // 1 USD = 0.003 BNB
  { from: 'usd', to: 'ada', rate: 2.5 },     // 1 USD = 2.5 ADA
  { from: 'usd', to: 'sol', rate: 0.05 },    // 1 USD = 0.05 SOL
  { from: 'usd', to: 'xrp', rate: 1.8 },     // 1 USD = 1.8 XRP
  { from: 'usd', to: 'dot', rate: 0.15 },    // 1 USD = 0.15 DOT
  { from: 'usd', to: 'link', rate: 0.08 },  // 1 USD = 0.08 LINK
  { from: 'usd', to: 'avax', rate: 0.02 },   // 1 USD = 0.02 AVAX
  
  // Платежные системы к USD
  { from: 'usd', to: 'paypal', rate: 1.0 },     // 1 USD = 1 PayPal USD
  { from: 'usd', to: 'skrill', rate: 1.0 },     // 1 USD = 1 Skrill USD
  { from: 'usd', to: 'neteller', rate: 1.0 },  // 1 USD = 1 Neteller USD
  { from: 'usd', to: 'webmoney', rate: 1.0 }, // 1 USD = 1 WebMoney USD
  { from: 'usd', to: 'perfectmoney', rate: 1.0 }, // 1 USD = 1 Perfect Money USD
  { from: 'usd', to: 'payeer', rate: 1.0 },    // 1 USD = 1 Payeer USD
  { from: 'usd', to: 'advcash', rate: 1.0 },   // 1 USD = 1 AdvCash USD
  { from: 'usd', to: 'qiwi', rate: 75.0 },    // 1 USD = 75 QIWI RUB
  
  // Обратные курсы (автоматически вычисляются)
  { from: 'eur', to: 'usd', rate: 1.18 },
  { from: 'rub', to: 'usd', rate: 0.013 },
  { from: 'gbp', to: 'usd', rate: 1.37 },
  { from: 'jpy', to: 'usd', rate: 0.009 },
  { from: 'cad', to: 'usd', rate: 0.8 },
  { from: 'aud', to: 'usd', rate: 0.74 },
  { from: 'chf', to: 'usd', rate: 1.09 },
  
  // Криптовалюты обратно к USD
  { from: 'btc', to: 'usd', rate: 43000 },
  { from: 'eth', to: 'usd', rate: 2500 },
  { from: 'usdt', to: 'usd', rate: 1.0 },
  { from: 'bnb', to: 'usd', rate: 330 },
  { from: 'ada', to: 'usd', rate: 0.4 },
  { from: 'sol', to: 'usd', rate: 20 },
  { from: 'xrp', to: 'usd', rate: 0.56 },
  { from: 'dot', to: 'usd', rate: 6.67 },
  { from: 'link', to: 'usd', rate: 12.5 },
  { from: 'avax', to: 'usd', rate: 50 },
  
  // Платежные системы обратно к USD
  { from: 'paypal', to: 'usd', rate: 1.0 },
  { from: 'skrill', to: 'usd', rate: 1.0 },
  { from: 'neteller', to: 'usd', rate: 1.0 },
  { from: 'webmoney', to: 'usd', rate: 1.0 },
  { from: 'perfectmoney', to: 'usd', rate: 1.0 },
  { from: 'payeer', to: 'usd', rate: 1.0 },
  { from: 'advcash', to: 'usd', rate: 1.0 },
  { from: 'qiwi', to: 'usd', rate: 0.013 },
];

// Функция для получения курса обмена (синхронная, использует моки как фоллбэк)
export const getExchangeRate = (fromCurrencyId: string, toCurrencyId: string): number | null => {
  if (fromCurrencyId === toCurrencyId) {
    return 1.0; // Одинаковые валюты
  }
  
  const rate = mockExchangeRates.find(
    r => r.from === fromCurrencyId && r.to === toCurrencyId
  );
  
  return rate ? rate.rate : null;
};

// Функция для конвертации суммы (синхронная, использует моки)
export const convertCurrency = (
  amount: number, 
  fromCurrencyId: string, 
  toCurrencyId: string
): number | null => {
  if (fromCurrencyId === toCurrencyId) {
    return amount;
  }
  
  const rate = getExchangeRate(fromCurrencyId, toCurrencyId);
  return rate ? amount * rate : null;
};

// НОВЫЕ ФУНКЦИИ для работы с реальными курсами (асинхронные)

/**
 * Получить реальный курс обмена из API
 * @param fromCurrencyId ID исходной валюты
 * @param toCurrencyId ID целевой валюты
 * @returns Promise с курсом или null
 */
export const getRealExchangeRate = async (
  fromCurrencyId: string, 
  toCurrencyId: string
): Promise<number | null> => {
  return await exchangeRateService.getExchangeRate(fromCurrencyId, toCurrencyId);
};

/**
 * Конвертировать сумму с использованием реальных курсов
 * @param amount Сумма для конвертации
 * @param fromCurrencyId ID исходной валюты
 * @param toCurrencyId ID целевой валюты
 * @returns Promise с конвертированной суммой или null
 */
export const convertCurrencyReal = async (
  amount: number, 
  fromCurrencyId: string, 
  toCurrencyId: string
): Promise<number | null> => {
  return await exchangeRateService.convert(amount, fromCurrencyId, toCurrencyId);
};

/**
 * Получить все курсы для конкретной валюты
 * @param currencyId ID валюты
 * @returns Promise с объектом курсов или null
 */
export const getAllRatesForCurrency = async (
  currencyId: string
): Promise<Record<string, number> | null> => {
  return await exchangeRateService.getAllRatesFor(currencyId);
};

/**
 * Очистить кэш курсов (принудительное обновление)
 */
export const clearExchangeRateCache = (): void => {
  exchangeRateService.clearCache();
};

/**
 * Получить время последнего обновления курсов
 */
export const getLastUpdateTime = (): Date | null => {
  return exchangeRateService.getLastUpdateTime();
};
