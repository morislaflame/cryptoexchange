import { makeAutoObservable, runInAction } from "mobx";
import {
  createExchange,
  getUserExchanges,
  getExchangeById,
  cancelExchange,
  getAllExchanges,
  updateExchangeStatus,
  type CreateExchangeData,
  type Exchange,
} from "@/http/exchangeAPI";

export default class ExchangeStore {
  _exchanges: Exchange[] = [];
  _currentExchange: Exchange | null = null;
  _loading = false;
  _error: string | null = null;
  _totalCount = 0;

  constructor() {
    makeAutoObservable(this);
  }

  setExchanges(exchanges: Exchange[]) {
    this._exchanges = exchanges;
  }

  setCurrentExchange(exchange: Exchange | null) {
    this._currentExchange = exchange;
  }

  setLoading(loading: boolean) {
    this._loading = loading;
  }

  setError(error: string | null) {
    this._error = error;
  }

  setTotalCount(count: number) {
    this._totalCount = count;
  }

  // Создание новой заявки
  async createExchange(exchangeData: CreateExchangeData): Promise<Exchange | null> {
    this.setLoading(true);
    this.setError(null);

    try {
      const exchange = await createExchange(exchangeData);
      
      runInAction(() => {
        // Добавляем новую заявку в начало списка
        this._exchanges = [exchange, ...this._exchanges];
        this._currentExchange = exchange;
        this.setLoading(false);
      });

      return exchange;
    } catch (error: unknown) {
      console.error("Error creating exchange:", error);
      
      runInAction(() => {
        this.setError((error as { response?: { data?: { message?: string } } }).response?.data?.message || "Ошибка при создании заявки");
        this.setLoading(false);
      });

      return null;
    }
  }

  // Получение заявок пользователя
  async fetchUserExchanges(status?: string, limit: number = 20, offset: number = 0) {
    this.setLoading(true);
    this.setError(null);

    try {
      const response = await getUserExchanges(status, limit, offset);
      
      runInAction(() => {
        this.setExchanges(response.rows);
        this.setTotalCount(response.count);
        this.setLoading(false);
      });
    } catch (error: unknown) {
      console.error("Error fetching user exchanges:", error);
      
      runInAction(() => {
        this.setError((error as { response?: { data?: { message?: string } } }).response?.data?.message || "Ошибка при получении заявок");
        this.setLoading(false);
      });
    }
  }

  // Получение одной заявки
  async fetchExchangeById(id: number) {
    this.setLoading(true);
    this.setError(null);

    try {
      const exchange = await getExchangeById(id);
      
      runInAction(() => {
        this.setCurrentExchange(exchange);
        this.setLoading(false);
      });
    } catch (error: unknown) {
      console.error("Error fetching exchange:", error);
      
      runInAction(() => {
        this.setError((error as { response?: { data?: { message?: string } } }).response?.data?.message || "Ошибка при получении заявки");
        this.setLoading(false);
      });
    }
  }

  // Отмена заявки
  async cancelExchange(id: number): Promise<boolean> {
    this.setLoading(true);
    this.setError(null);

    try {
      const updatedExchange = await cancelExchange(id);
      
      runInAction(() => {
        // Обновляем заявку в списке
        this._exchanges = this._exchanges.map((ex) =>
          ex.id === id ? updatedExchange : ex
        );
        
        // Обновляем текущую заявку, если это она
        if (this._currentExchange?.id === id) {
          this._currentExchange = updatedExchange;
        }
        
        this.setLoading(false);
      });

      return true;
    } catch (error: unknown) {
      console.error("Error cancelling exchange:", error);
      
      runInAction(() => {
        this.setError((error as { response?: { data?: { message?: string } } }).response?.data?.message || "Ошибка при отмене заявки");
        this.setLoading(false);
      });

      return false;
    }
  }

  // Получение всех заявок (админ)
  async fetchAllExchanges(
    status?: string,
    userId?: number,
    limit: number = 50,
    offset: number = 0
  ) {
    this.setLoading(true);
    this.setError(null);

    try {
      const response = await getAllExchanges(status, userId, limit, offset);
      
      runInAction(() => {
        this.setExchanges(response.rows);
        this.setTotalCount(response.count);
        this.setLoading(false);
      });
    } catch (error: unknown) {
      console.error("Error fetching all exchanges:", error);
      
      runInAction(() => {
        this.setError((error as { response?: { data?: { message?: string } } }).response?.data?.message || "Ошибка при получении заявок");
        this.setLoading(false);
      });
    }
  }

  // Обновление статуса заявки (админ)
  async updateExchangeStatus(id: number, status: string): Promise<boolean> {
    this.setLoading(true);
    this.setError(null);

    try {
      const updatedExchange = await updateExchangeStatus(id, status);
      
      runInAction(() => {
        // Обновляем заявку в списке
        this._exchanges = this._exchanges.map((ex) =>
          ex.id === id ? updatedExchange : ex
        );
        
        // Обновляем текущую заявку, если это она
        if (this._currentExchange?.id === id) {
          this._currentExchange = updatedExchange;
        }
        
        this.setLoading(false);
      });

      return true;
    } catch (error: unknown) {
      console.error("Error updating exchange status:", error);
      
      runInAction(() => {
        this.setError((error as { response?: { data?: { message?: string } } }).response?.data?.message || "Ошибка при обновлении статуса");
        this.setLoading(false);
      });

      return false;
    }
  }

  // Очистка ошибки
  clearError() {
    this.setError(null);
  }

  // Геттеры
  get exchanges() {
    return this._exchanges;
  }

  get currentExchange() {
    return this._currentExchange;
  }

  get loading() {
    return this._loading;
  }

  get error() {
    return this._error;
  }

  get totalCount() {
    return this._totalCount;
  }
}

