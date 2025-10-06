import { $authHost, $host } from "./index";

export interface CurrencyInfo {
  id: string;
  symbol: string;
  category: 'fiat' | 'crypto' | 'payment';
}

export interface ExchangeDirection {
  currency: CurrencyInfo;
  amount: string;
  bankName?: string;
  networkName?: string;
  paymentCurrencyName?: string;
}

export interface CreateExchangeData {
  // Направления обмена
  from: ExchangeDirection;
  to: ExchangeDirection;
  
  // Реквизиты для получения
  recipientAddress?: string;
  recipientCard?: string;
  recipientPaymentDetails?: string;
  
  // Курс обмена и комиссия
  exchangeRate?: string;
  feeAmount?: string;
  feePercent?: number;
  
  // Контактные данные для гостевых заявок
  recipientEmail?: string;
  recipientTelegramUsername?: string;
}

export interface Exchange {
  id: number;
  userId: number;
  
  // Направления обмена
  from: ExchangeDirection;
  to: ExchangeDirection;
  
  // Реквизиты для получения
  recipientAddress?: string;
  recipientCard?: string;
  recipientPaymentDetails?: string;
  
  // Курс обмена и комиссия
  exchangeRate?: string;
  feeAmount?: string;
  feePercent: number;
  
  // Статус и примечания
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
  
  // Гостевые данные
  recipientEmail?: string;
  recipientTelegramUsername?: string;
  
  // Временные метки
  confirmedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExchangeListResponse {
  count: number;
  rows: Exchange[];
}

// Создание новой заявки (поддерживает гостевые заявки)
export const createExchange = async (exchangeData: CreateExchangeData): Promise<Exchange> => {
  const { data } = await $host.post('api/exchange/', exchangeData);
  return data;
};

// Получение всех заявок пользователя
export const getUserExchanges = async (
  status?: string,
  limit: number = 20,
  offset: number = 0
): Promise<ExchangeListResponse> => {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  params.append('limit', limit.toString());
  params.append('offset', offset.toString());
  
  const { data } = await $authHost.get(`api/exchange/my?${params.toString()}`);
  return data;
};

// Получение одной заявки по ID
export const getExchangeById = async (id: number): Promise<Exchange> => {
  const { data } = await $authHost.get(`api/exchange/${id}`);
  return data;
};

// Отмена заявки
export const cancelExchange = async (id: number): Promise<Exchange> => {
  const { data } = await $authHost.patch(`api/exchange/${id}/cancel`);
  return data;
};

// Получение всех заявок (только для админа)
export const getAllExchanges = async (
  status?: string,
  userId?: number,
  limit: number = 50,
  offset: number = 0
): Promise<ExchangeListResponse> => {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (userId) params.append('userId', userId.toString());
  params.append('limit', limit.toString());
  params.append('offset', offset.toString());
  
  const { data } = await $authHost.get(`api/exchange/admin/all?${params.toString()}`);
  return data;
};

// Обновление статуса заявки (только для админа)
export const updateExchangeStatus = async (
  id: number,
  status: string,
): Promise<Exchange> => {
  const { data } = await $authHost.patch(`api/exchange/${id}/status`, { status });
  return data;
};

