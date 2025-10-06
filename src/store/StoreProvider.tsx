import { createContext, useState, useEffect, useContext, type ReactNode } from "react";
import LoadingIndicator from "../components/ui/LoadingIndicator";
import UserStore from "@/store/UserStore";
import ChatStore from "@/store/ChatStore";
import ExchangeStore from "@/store/ExchangeStore";
import ExchangeRatesStore from "@/store/ExchangeRatesStore";
// Определяем интерфейс для нашего контекста
export interface IStoreContext {
  user: UserStore;
  chat: ChatStore;
  exchange: ExchangeStore;
  exchangeRates: ExchangeRatesStore;
}

let storeInstance: IStoreContext | null = null;

// Функция для получения экземпляра хранилища
export function getStore(): IStoreContext {
  if (!storeInstance) {
    throw new Error("Store not initialized");
  }
  return storeInstance;
}

// Хук для использования сторов в компонентах
export function useStore(): IStoreContext {
  const context = useContext(Context);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}

// Создаем контекст с начальным значением null, но указываем правильный тип
export const Context = createContext<IStoreContext | null>(null);

// Добавляем типы для пропсов
interface StoreProviderProps {
  children: ReactNode;
}

const StoreProvider = ({ children }: StoreProviderProps) => {
  const [stores, setStores] = useState<{
    user: UserStore;
    chat: ChatStore;
    exchange: ExchangeStore;
    exchangeRates: ExchangeRatesStore;
  } | null>(null);

  useEffect(() => {
    const loadStores = async () => {
      const [
        { default: UserStore },
        { default: ChatStore },
        { default: ExchangeStore },
        { default: ExchangeRatesStore },
      ] = await Promise.all([
        import("@/store/UserStore"),
        import("@/store/ChatStore"),
        import("@/store/ExchangeStore"),
        import("@/store/ExchangeRatesStore"),
      ]);

      setStores({
        user: new UserStore(),
        chat: new ChatStore(),
        exchange: new ExchangeStore(),
        exchangeRates: new ExchangeRatesStore(),
      });
    };

    loadStores();
  }, []);

  if (!stores) {
    return <LoadingIndicator />; // Use custom loading indicator
  }

  // Сохраняем экземпляр хранилища для доступа из других модулей
  storeInstance = stores;

  return <Context.Provider value={stores}>{children}</Context.Provider>;
};

export default StoreProvider;
