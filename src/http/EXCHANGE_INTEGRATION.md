# Exchange API Integration - Frontend

Документация по интеграции API заявок на обмен с фронтендом.

## Созданные файлы

### 1. `exchangeAPI.ts` - API клиент

Содержит все функции для работы с заявками на обмен:

```typescript
import { createExchange, getUserExchanges, getExchangeById, cancelExchange } from '@/http/exchangeAPI';

// Создание заявки
const exchange = await createExchange(exchangeData);

// Получение заявок пользователя
const exchanges = await getUserExchanges('PENDING', 20, 0);

// Получение одной заявки
const exchange = await getExchangeById(123);

// Отмена заявки
const cancelled = await cancelExchange(123);
```

**Типы данных:**
- `CreateExchangeData` - данные для создания заявки
- `Exchange` - интерфейс заявки
- `ExchangeListResponse` - список заявок с пагинацией

### 2. `ExchangeStore.ts` - MobX Store

Store для управления состоянием заявок:

```typescript
import { useStore } from '@/store/StoreProvider';

const { exchange } = useStore();

// Создание заявки
await exchange.createExchange(exchangeData);

// Получение заявок
await exchange.fetchUserExchanges('PENDING');

// Отмена заявки
await exchange.cancelExchange(123);

// Доступ к данным
const exchanges = exchange.exchanges;
const currentExchange = exchange.currentExchange;
const loading = exchange.loading;
const error = exchange.error;
```

**Методы Store:**
- `createExchange(data)` - создание заявки
- `fetchUserExchanges(status?, limit?, offset?)` - получение заявок пользователя
- `fetchExchangeById(id)` - получение одной заявки
- `cancelExchange(id)` - отмена заявки
- `fetchAllExchanges(...)` - получение всех заявок (админ)
- `updateExchangeStatus(id, status, notes?)` - обновление статуса (админ)

**Свойства Store:**
- `exchanges` - массив заявок
- `currentExchange` - текущая заявка
- `loading` - состояние загрузки
- `error` - ошибка (если есть)
- `totalCount` - общее количество заявок

### 3. Обновленный `StoreProvider.tsx`

Добавлен `ExchangeStore` в контекст приложения:

```typescript
export interface IStoreContext {
  user: UserStore;
  chat: ChatStore;
  exchange: ExchangeStore; // ← Новый store
}
```

### 4. Обновленный `ConversionSummary.tsx`

Интегрирован с `ExchangeStore` для создания заявок:

**Основные изменения:**
- Обернут в `observer` для реактивности MobX
- Добавлен обработчик `handleCreateOrder`
- Показывает состояние загрузки при создании
- Проверяет авторизацию пользователя
- Очищает инпуты после успешного создания

## Использование в компонентах

### Создание заявки

```typescript
import { useStore } from '@/store/StoreProvider';
import { observer } from 'mobx-react-lite';

const MyComponent = observer(() => {
  const { exchange } = useStore();
  
  const handleCreate = async () => {
    const exchangeData = {
      fromCurrencyId: 'btc',
      fromCurrencySymbol: 'BTC',
      fromCurrencyCategory: 'crypto',
      fromAmount: '0.5',
      fromNetworkId: 'bitcoin',
      fromNetworkName: 'Bitcoin',
      
      toCurrencyId: 'rub',
      toCurrencySymbol: 'RUB',
      toCurrencyCategory: 'fiat',
      toAmount: '2500000.00',
      toBankId: 'sberbank',
      toBankName: 'Сбербанк',
      
      recipientCard: '1234567890123456',
      exchangeRate: '5000000',
      feeAmount: '75000',
      feePercent: 3,
    };
    
    const result = await exchange.createExchange(exchangeData);
    
    if (result) {
      console.log('Заявка создана:', result);
    } else {
      console.error('Ошибка:', exchange.error);
    }
  };
  
  return (
    <button onClick={handleCreate} disabled={exchange.loading}>
      {exchange.loading ? 'Создание...' : 'Создать заявку'}
    </button>
  );
});
```

### Получение списка заявок

```typescript
import { useStore } from '@/store/StoreProvider';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';

const MyExchanges = observer(() => {
  const { exchange } = useStore();
  
  useEffect(() => {
    exchange.fetchUserExchanges();
  }, []);
  
  if (exchange.loading) {
    return <div>Загрузка...</div>;
  }
  
  if (exchange.error) {
    return <div>Ошибка: {exchange.error}</div>;
  }
  
  return (
    <div>
      <h2>Мои заявки ({exchange.totalCount})</h2>
      {exchange.exchanges.map((ex) => (
        <div key={ex.id}>
          <p>Заявка #{ex.id}</p>
          <p>Статус: {ex.status}</p>
          <p>{ex.fromAmount} {ex.fromCurrencySymbol} → {ex.toAmount} {ex.toCurrencySymbol}</p>
          
          {ex.status === 'PENDING' && (
            <button onClick={() => exchange.cancelExchange(ex.id)}>
              Отменить
            </button>
          )}
        </div>
      ))}
    </div>
  );
});
```

## Поток создания заявки

1. **Пользователь заполняет форму** в `MagicBento` компоненте
2. **Выбирает валюты**, банки/сети, вводит реквизиты
3. **Нажимает "Создать заявку"** в `ConversionSummary`
4. **Проверяется валидация** всех полей
5. **Отправляется запрос** через `exchangeStore.createExchange()`
6. **API создает заявку** и отправляет уведомление админу в Telegram
7. **Пользователь получает подтверждение** с номером заявки
8. **Форма очищается** для новой заявки

## Обработка ошибок

Все ошибки API перехватываются в Store и сохраняются в `exchange.error`:

```typescript
const { exchange } = useStore();

// Создание заявки
const result = await exchange.createExchange(data);

if (!result && exchange.error) {
  // Показать ошибку пользователю
  alert(exchange.error);
  
  // Очистить ошибку
  exchange.clearError();
}
```

## Статусы заявок

| Статус | Описание |
|--------|----------|
| `PENDING` | Ожидает обработки (новая заявка) |
| `CONFIRMED` | Подтверждена администратором |
| `PROCESSING` | В процессе обработки |
| `COMPLETED` | Завершена успешно |
| `CANCELLED` | Отменена |
| `FAILED` | Не удалась |

## Требования к авторизации

Для создания и просмотра заявок пользователь должен быть авторизован:

```typescript
const { user, exchange } = useStore();

if (!user.isAuth) {
  // Показать сообщение об авторизации
  return <div>Войдите для создания заявки</div>;
}

// Создание заявки доступно
```

## Примеры интеграции

### Кнопка с индикатором загрузки

```tsx
<button
  onClick={handleCreateOrder}
  disabled={!isFormValid || exchange.loading || !user.isAuth}
>
  {exchange.loading ? (
    <>
      <Spinner />
      Создание...
    </>
  ) : (
    'Создать заявку'
  )}
</button>
```

### Уведомление об успехе

```typescript
const result = await exchange.createExchange(data);

if (result) {
  toast.success(`Заявка #${result.id} создана!`);
  // или
  alert(`Заявка #${result.id} успешно создана! Статус: ${result.status}`);
}
```

## Связь с бэкендом

API endpoints (относительно базового URL):
- `POST /api/exchange/` - создание заявки
- `GET /api/exchange/my` - получение заявок пользователя
- `GET /api/exchange/:id` - получение одной заявки
- `PATCH /api/exchange/:id/cancel` - отмена заявки
- `GET /api/exchange/admin/all` - все заявки (админ)
- `PATCH /api/exchange/:id/status` - обновление статуса (админ)

Все запросы требуют авторизации через `Authorization: Bearer <token>` header.

