import { type Currency } from '../types/currency';

/**
 * Форматирует число с учетом типа валюты
 * @param amount - сумма для форматирования
 * @param currency - валюта (опционально)
 * @returns отформатированная строка
 */
export const formatAmount = (amount: string | number, currency?: Currency): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(num) || !amount) {
    // Для фиатных валют и платежек 2 знака, для криптовалют 6
    return currency?.category === 'fiat' || currency?.category === 'payment' ? '0.00' : '0.000000';
  }

  // Определяем количество знаков после запятой
  const decimals = currency?.category === 'fiat' || currency?.category === 'payment' ? 2 : 6;
  
  // Форматируем число с нужным количеством знаков
  const formatted = num.toFixed(decimals);
  
  // Добавляем разделители тысяч
  return addThousandsSeparator(formatted);
};

/**
 * Добавляет разделители тысяч к числу
 * @param value - строка с числом
 * @returns строка с разделителями тысяч
 */
export const addThousandsSeparator = (value: string): string => {
  // Разделяем на целую и дробную части
  const [integerPart, decimalPart] = value.split('.');
  
  // Добавляем пробелы как разделители тысяч для целой части
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  
  // Возвращаем с дробной частью, если она есть
  return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
};

/**
 * Форматирует курс обмена
 * @param rate - курс обмена
 * @param fromSymbol - символ исходной валюты
 * @param toSymbol - символ целевой валюты
 * @returns отформатированная строка курса
 */
export const formatExchangeRate = (rate: number, fromSymbol?: string, toSymbol?: string): string => {
  if (rate >= 1) {
    return `1 ${fromSymbol} = ${addThousandsSeparator(rate.toFixed(6))} ${toSymbol}`;
  } else {
    return `1 ${toSymbol} = ${addThousandsSeparator((1/rate).toFixed(6))} ${fromSymbol}`;
  }
};
