import { makeAutoObservable, runInAction } from "mobx";
import { exchangeRateService } from "@/services/exchangeRateService";

export interface ExchangeRates {
  [fromCurrency: string]: {
    [toCurrency: string]: number;
  };
}

export default class ExchangeRatesStore {
  _rates: ExchangeRates = {};
  _lastUpdate: Date | null = null;
  _loading = false;
  _error: string | null = null;
  _isRefreshing = false;

  constructor() {
    makeAutoObservable(this);
  }

  setRates(rates: ExchangeRates) {
    this._rates = rates;
  }

  setLastUpdate(date: Date | null) {
    this._lastUpdate = date;
  }

  setLoading(loading: boolean) {
    this._loading = loading;
  }

  setError(error: string | null) {
    this._error = error;
  }

  setIsRefreshing(refreshing: boolean) {
    this._isRefreshing = refreshing;
  }

  // Загрузка курсов валют
  async fetchExchangeRates(): Promise<boolean> {
    this.setLoading(true);
    this.setError(null);

    try {
      // Очищаем кэш сервиса для принудительного обновления
      exchangeRateService.clearCache();
      
      // Загружаем курсы через сервис
      // Используем популярную пару для инициализации загрузки
      await exchangeRateService.getExchangeRate('btc', 'usd');
      
      runInAction(() => {
        // Получаем время последнего обновления
        this.setLastUpdate(exchangeRateService.getLastUpdateTime());
        this.setLoading(false);
      });

      return true;
    } catch (error: any) {
      console.error("Error fetching exchange rates:", error);
      
      runInAction(() => {
        this.setError(error.message || "Ошибка при загрузке курсов валют");
        this.setLoading(false);
      });

      return false;
    }
  }

  // Принудительное обновление курсов
  async refreshExchangeRates(): Promise<boolean> {
    this.setIsRefreshing(true);
    this.setError(null);

    try {
      // Очищаем кэш сервиса
      exchangeRateService.clearCache();
      
      // Загружаем новые курсы
      await exchangeRateService.getExchangeRate('btc', 'usd');
      
      runInAction(() => {
        this.setLastUpdate(exchangeRateService.getLastUpdateTime());
        this.setIsRefreshing(false);
      });

      return true;
    } catch (error: any) {
      console.error("Error refreshing exchange rates:", error);
      
      runInAction(() => {
        this.setError(error.message || "Ошибка при обновлении курсов");
        this.setIsRefreshing(false);
      });

      return false;
    }
  }

  // Получение курса обмена между двумя валютами
  async getExchangeRate(from: string, to: string): Promise<number | null> {
    try {
      return await exchangeRateService.getExchangeRate(from, to);
    } catch (error) {
      console.error("Error getting exchange rate:", error);
      return null;
    }
  }

  // Конвертация суммы
  async convertCurrency(amount: number, from: string, to: string): Promise<number | null> {
    try {
      return await exchangeRateService.convert(amount, from, to);
    } catch (error) {
      console.error("Error converting currency:", error);
      return null;
    }
  }

  // Получение всех курсов для валюты
  async getAllRatesFor(currencyId: string): Promise<Record<string, number> | null> {
    try {
      return await exchangeRateService.getAllRatesFor(currencyId);
    } catch (error) {
      console.error("Error getting all rates for currency:", error);
      return null;
    }
  }

  // Очистка ошибки
  clearError() {
    this.setError(null);
  }

  // Очистка кэша
  clearCache() {
    exchangeRateService.clearCache();
    this.setLastUpdate(null);
  }

  // Геттеры
  get rates() {
    return this._rates;
  }

  get lastUpdate() {
    return this._lastUpdate;
  }

  get loading() {
    return this._loading;
  }

  get error() {
    return this._error;
  }

  get isRefreshing() {
    return this._isRefreshing;
  }

  // Проверка, нужно ли обновление (курсы старше 1 минуты)
  get needsUpdate(): boolean {
    if (!this._lastUpdate) return true;
    return Date.now() - this._lastUpdate.getTime() > 60000; // 1 минута
  }

  // Форматирование времени последнего обновления
  get lastUpdateFormatted(): string {
    if (!this._lastUpdate) return 'Загрузка...';

    const seconds = Math.floor((Date.now() - this._lastUpdate.getTime()) / 1000);

    if (seconds < 60) return `${seconds} сек. назад`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} мин. назад`;
    
    return this._lastUpdate.toLocaleTimeString('ru-RU');
  }
}
