# Сервис обменных курсов

## Описание

Сервис для получения актуальных курсов валют и криптовалют с использованием CoinGecko API.

## Возможности

- ✅ Получение реальных курсов криптовалют
- ✅ Конвертация крипто ↔ фиат
- ✅ Конвертация крипто ↔ крипто
- ✅ Конвертация фиат ↔ фиат
- ✅ Автоматический кэш (1 минута)
- ✅ Кросс-курсы для всех пар валют

## Использование

### Импорт

```typescript
import { 
  convertCurrencyReal, 
  getRealExchangeRate,
  getAllRatesForCurrency,
  clearExchangeRateCache,
  getLastUpdateTime 
} from '../types/exchangeRates';
```

### Конвертация валют

```typescript
// Асинхронная конвертация с реальными курсами
const result = await convertCurrencyReal(100, 'btc', 'usd');
console.log(result); // Например: 4300000
```

### Получение курса

```typescript
// Получить курс между двумя валютами
const rate = await getRealExchangeRate('eth', 'usd');
console.log(rate); // Например: 2500
```

### Получение всех курсов для валюты

```typescript
// Получить все доступные курсы для BTC
const rates = await getAllRatesForCurrency('btc');
console.log(rates); 
// { usd: 43000, eur: 36550, rub: 3225000, eth: 17.2, ... }
```

### Управление кэшем

```typescript
// Принудительно очистить кэш и обновить курсы
clearExchangeRateCache();

// Получить время последнего обновления
const lastUpdate = getLastUpdateTime();
console.log(lastUpdate); // Date object
```

## Как работает конвертация

### Комиссия сервиса

**Все конвертации включают комиссию сервиса 3%**

Например, при конвертации 100 USD в BTC:
- Курс: 100 USD = 0.002325 BTC (без комиссии)
- Комиссия 3%: 0.00006975 BTC
- **Итого к получению: 0.00225525 BTC**

Комиссия автоматически вычитается из конечной суммы и отображается в разделе "Итоги конвертации".

### Типы конвертации

1. **Криптовалюта ↔ Фиат**
   - Используется прямой курс из CoinGecko API
   - Пример: BTC → USD, ETH → EUR
   - Применяется комиссия 3%

2. **Криптовалюта ↔ Криптовалюта**
   - Вычисляется кросс-курс через USD
   - Пример: BTC → ETH = (BTC/USD) ÷ (ETH/USD)
   - Применяется комиссия 3%

3. **Фиат ↔ Фиат**
   - Вычисляется кросс-курс через BTC
   - Пример: USD → EUR = (BTC/EUR) ÷ (BTC/USD)
   - Применяется комиссия 3%

4. **Платежная система ↔ Любая валюта**
   - Используется выбранная валюта внутри платежной системы
   - Примеры:
     - PayPal (USD) → BTC
     - PayPal (EUR) → Сбербанк (RUB)
     - WebMoney (WMZ) → USDT (TRC20)
   - Применяется комиссия 3%

### Примеры использования

```typescript
// 1. Криптовалюта → Фиат
// Без комиссии: 1 BTC = 43,000 USD
// С комиссией 3%: получите 41,710 USD
await convertCurrencyReal(1, 'btc', 'usd'); 

// 2. Криптовалюта → Криптовалюта
// Без комиссии: 1 BTC = 17.2 ETH
// С комиссией 3%: получите 16.684 ETH
await convertCurrencyReal(1, 'btc', 'eth');

// 3. Фиат → Фиат
// Без комиссии: 100 USD = 85 EUR
// С комиссией 3%: получите 82.45 EUR
await convertCurrencyReal(100, 'usd', 'eur');

// 4. Платежная система (с выбранной валютой) → Криптовалюта
// В UI: выбираем PayPal → выбираем USD
// Без комиссии: 100 USD = 0.002325 BTC
// С комиссией 3%: получите 0.00225525 BTC
await convertCurrencyReal(100, 'usd', 'btc');

// 5. Платежная система → Платежная система
// В UI: PayPal (EUR) → Skrill (USD)
// Без комиссии: 100 EUR = 118 USD
// С комиссией 3%: получите 114.46 USD
await convertCurrencyReal(100, 'eur', 'usd');
```

### Расчет комиссии в коде

```typescript
// В MagicBento.tsx
const SERVICE_FEE_PERCENT = 3; // 3%

// При конвертации:
const convertedAmount = await convertCurrencyReal(amount, fromId, toId);

// Вычисляем комиссию
const fee = convertedAmount * (SERVICE_FEE_PERCENT / 100);
const amountAfterFee = convertedAmount - fee;

// Отображаем пользователю:
// - convertedAmount: сумма без комиссии
// - fee: размер комиссии
// - amountAfterFee: итоговая сумма к получению
```

## Поддерживаемые валюты

### Криптовалюты
- BTC (Bitcoin)
- ETH (Ethereum)
- USDT (Tether)
- BNB (Binance Coin)
- ADA (Cardano)
- SOL (Solana)
- XRP (Ripple)
- DOT (Polkadot)
- DOGE (Dogecoin)
- AVAX (Avalanche)
- LTC (Litecoin)
- LINK (Chainlink)
- BCH (Bitcoin Cash)
- XLM (Stellar)
- XMR (Monero)
- TON (The Open Network)

### Фиатные валюты
- USD (Доллар США)
- EUR (Евро)
- RUB (Российский рубль)
- GBP (Британский фунт)
- UAH (Украинская гривна)
- KZT (Казахстанский тенге)

## API Лимиты

CoinGecko Free API:
- 10-30 запросов в минуту
- Без API ключа
- Данные обновляются каждую минуту (кэш)

## Обработка ошибок

Сервис автоматически обрабатывает ошибки:
- Если API недоступен, возвращается `null`
- При ошибках используется кэшированные данные (если есть)
- В UI автоматически применяется фоллбэк на моковые данные

## Примеры в проекте

### В компоненте MagicBento

```typescript
// Автоматическая конвертация с реальными курсами
// Учитывает выбранную валюту в платежных системах
const fromCurrencyId = getCurrencyIdForConversion(
  fromData.currency, 
  fromData.paymentCurrency
);
const toCurrencyId = getCurrencyIdForConversion(
  toData.currency, 
  toData.paymentCurrency
);

const convertedAmount = await convertCurrencyReal(
  amount,
  fromCurrencyId,
  toCurrencyId
);
```

### Логика определения валюты для конвертации

```typescript
// Для платежных систем используется выбранная валюта внутри ПС
const getCurrencyIdForConversion = (
  currency: Currency | undefined,
  paymentCurrency?: PaymentCurrencyOption
): string | null => {
  if (!currency) return null;

  // Для платежных систем (PayPal, Skrill, и т.д.)
  if (currency.category === 'payment') {
    return paymentCurrency?.id || null; // USD, EUR, RUB и т.д.
  }

  // Для фиатных и криптовалют
  return currency.id; // btc, usd, rub и т.д.
};
```

### Компонент ExchangeRateInfo

Отображает:
- Время последнего обновления
- Кнопку ручного обновления
- Ссылку на CoinGecko

## Расширение

### Добавление новой криптовалюты

1. Добавьте маппинг в `CRYPTO_ID_MAP`:

```typescript
const CRYPTO_ID_MAP: Record<string, string> = {
  // ...
  newcoin: 'new-coin-coingecko-id',
};
```

2. Добавьте валюту в `currency.ts`

### Добавление новой фиатной валюты

1. Добавьте в `FIAT_CURRENCY_MAP`:

```typescript
const FIAT_CURRENCY_MAP: Record<string, string> = {
  // ...
  cny: 'cny',
};
```

2. Добавьте валюту в `currency.ts`

## Альтернативные API

Если нужны другие источники данных:

1. **CoinMarketCap** - требует API ключ, более точные данные
2. **Binance API** - только крипта, очень быстрый
3. **ExchangeRate-API** - для фиатных валют

## Troubleshooting

### Курсы не обновляются
- Проверьте консоль на ошибки API
- Проверьте лимиты запросов
- Попробуйте очистить кэш: `clearExchangeRateCache()`

### Некоторые пары не работают
- Убедитесь, что обе валюты есть в маппингах
- Проверьте правильность ID валют
- Некоторые пары могут быть недоступны напрямую (используются кросс-курсы)

### API возвращает ошибку 429
- Превышен лимит запросов
- Подождите минуту
- Увеличьте время кэширования в `exchangeRateService.ts`

## Производительность

- Кэш: 1 минута (настраивается)
- Один запрос получает курсы для всех валют
- Кросс-курсы вычисляются локально
- Минимальная нагрузка на API

