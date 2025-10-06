import { $authHost, $host } from "./index";

export interface CreateExchangeData {
  // Валюта отправки
  fromCurrencyId: string;
  fromCurrencySymbol: string;
  fromCurrencyCategory: 'fiat' | 'crypto' | 'payment';
  fromAmount: string;
  fromBankId?: string;
  fromBankName?: string;
  fromNetworkId?: string;
  fromNetworkName?: string;
  fromPaymentCurrencyId?: string;
  fromPaymentCurrencyName?: string;
  
  // Валюта получения
  toCurrencyId: string;
  toCurrencySymbol: string;
  toCurrencyCategory: 'fiat' | 'crypto' | 'payment';
  toAmount: string;
  toAmountWithoutFee?: string;
  toBankId?: string;
  toBankName?: string;
  toNetworkId?: string;
  toNetworkName?: string;
  toPaymentCurrencyId?: string;
  toPaymentCurrencyName?: string;
  
  // Реквизиты для получения
  recipientAddress?: string;
  recipientCard?: string;
  recipientPaymentDetails?: string;
  
  // Курс обмена и комиссия
  exchangeRate?: string;
  feeAmount?: string;
  feePercent?: number;
  
  // Примечания клиента
  clientNotes?: string;
  
  // Контактные данные для гостевых заявок
  guestEmail?: string;
  guestTelegramUsername?: string;
}

export interface Exchange {
  id: number;
  userId: number;
  
  fromCurrencyId: string;
  fromCurrencySymbol: string;
  fromCurrencyCategory: 'fiat' | 'crypto' | 'payment';
  fromAmount: string;
  fromBankId?: string;
  fromBankName?: string;
  fromNetworkId?: string;
  fromNetworkName?: string;
  fromPaymentCurrencyId?: string;
  fromPaymentCurrencyName?: string;
  
  toCurrencyId: string;
  toCurrencySymbol: string;
  toCurrencyCategory: 'fiat' | 'crypto' | 'payment';
  toAmount: string;
  toAmountWithoutFee?: string;
  toBankId?: string;
  toBankName?: string;
  toNetworkId?: string;
  toNetworkName?: string;
  toPaymentCurrencyId?: string;
  toPaymentCurrencyName?: string;
  
  recipientAddress?: string;
  recipientCard?: string;
  recipientPaymentDetails?: string;
  
  exchangeRate?: string;
  feeAmount?: string;
  feePercent: number;
  
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
  
  notes?: string;
  clientNotes?: string;
  
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
  notes?: string
): Promise<Exchange> => {
  const { data } = await $authHost.patch(`api/exchange/${id}/status`, { status, notes });
  return data;
};

