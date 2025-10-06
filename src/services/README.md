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

---

# Сервис валидации

## Описание

Сервис для валидации полей форм заявок на обмен с поддержкой различных типов валют и пользователей.

## Возможности

- ✅ Валидация форм заявок на обмен
- ✅ Поддержка разных типов валют (фиат, крипта, платежки)
- ✅ Валидация контактных данных для гостевых пользователей
- ✅ Детальная валидация с разбивкой по полям
- ✅ Понятные сообщения об ошибках на русском языке

## Использование

### Импорт

```typescript
import { validationService } from './validationService';
import { type ExchangeValidationData } from '../types/validation';
```

### Простая валидация

```typescript
// Подготовка данных для валидации
const validationData: ExchangeValidationData = {
  fromCurrency: selectedFromCurrency,
  toCurrency: selectedToCurrency,
  fromAmount: '100',
  toAmount: '95',
  fromSelectedBank: selectedBank,
  selectedNetwork: selectedNetwork,
  walletAddress: '0x123...',
  recipientEmail: 'user@example.com',
  isAuth: userStore.isAuth
};

// Валидация формы
const result = validationService.validateForm(validationData);

if (result.isValid) {
  console.log('Форма валидна');
} else {
  console.log('Ошибки:', result.errors);
  // ['Не выбран банк для отправки рублей', 'Не указан адрес кошелька']
}
```

### Детальная валидация

```typescript
// Детальная валидация с разбивкой по полям
const detailedResult = validationService.validateFormDetailed(validationData);

console.log('Валюты валидны:', detailedResult.fromCurrencyValid && detailedResult.toCurrencyValid);
console.log('Суммы валидны:', detailedResult.fromAmountValid && detailedResult.toAmountValid);
console.log('Реквизиты валидны:', detailedResult.recipientDataValid);
console.log('Контактные данные валидны:', detailedResult.contactDataValid);
console.log('Общая валидность:', detailedResult.overallValid);

// Конкретные ошибки
if (detailedResult.errors.fromCurrency) {
  console.log('Ошибка валюты отправки:', detailedResult.errors.fromCurrency);
}
if (detailedResult.errors.recipientData) {
  console.log('Ошибка реквизитов:', detailedResult.errors.recipientData);
}
```

### Валидация отдельных полей

```typescript
// Валидация только контактных данных
const contactResult = validationService.validateContactDataOnly(
  'user@example.com',
  '@username'
);

// Валидация только реквизитов
const recipientResult = validationService.validateRecipientDataOnly(
  toCurrency,
  selectedNetwork,
  selectedBank,
  selectedPaymentCurrency,
  walletAddress,
  cardNumber,
  paymentDetails
);
```

## Типы валидации

### Валюты

- **Фиатные валюты (RUB)**: требует выбора банка
- **Криптовалюты**: требует выбора сети
- **Платежные системы**: требует выбора валюты внутри системы

### Суммы

- Должны быть положительными числами
- Поддерживается формат с десятичными знаками

### Реквизиты для получения

- **Криптовалюты**: адрес кошелька
- **Рубли (банковские переводы)**: номер карты или телефона
- **Рубли (наличные)**: реквизиты не требуются
- **Платежные системы**: реквизиты для получения

### Контактные данные

- **Для гостевых пользователей**: обязательны email или Telegram username
- **Для авторизованных пользователей**: 
  - Если у пользователя есть email и username в профиле - поля скрыты
  - Если отсутствует email - показывается поле для ввода email
  - Если отсутствует username - показывается поле для ввода Telegram username
  - Если отсутствуют оба - показываются оба поля
- **Email**: валидный формат email
- **Telegram**: username без @ (1-32 символа, буквы, цифры, _)
- Хотя бы один способ связи должен быть указан

## Сообщения об ошибках

Сервис возвращает понятные сообщения на русском языке:

- "Не выбрана валюта отправки"
- "Не выбран банк для отправки рублей"
- "Не выбрана сеть для отправки криптовалюты"
- "Не указан адрес кошелька"
- "Не указан номер карты или телефона"
- "Некорректный формат email"
- "Некорректный формат Telegram username"
- "Необходимо указать email или Telegram username"

## Интеграция с компонентами

### В ConversionSummary

```typescript
// Автозаполнение полей данными пользователя
useEffect(() => {
  if (userStore.isAuth && userStore.user) {
    if (userStore.user.email) {
      setRecipientEmail(userStore.user.email);
    }
    if (userStore.user.username) {
      setRecipientTelegramUsername(userStore.user.username);
    }
  }
}, [userStore.isAuth, userStore.user]);

// Подготовка данных для валидации с учетом данных пользователя
const validationData: ExchangeValidationData = {
  fromCurrency,
  toCurrency,
  fromAmount,
  toAmount,
  fromSelectedBank,
  fromSelectedNetwork,
  fromSelectedPaymentCurrency,
  selectedBank,
  selectedNetwork,
  selectedPaymentCurrency,
  walletAddress,
  cardNumber,
  paymentDetails,
  // Используем данные пользователя, если они есть, иначе поля формы
  recipientEmail: userStore.user?.email || recipientEmail,
  recipientTelegramUsername: userStore.user?.username || recipientTelegramUsername,
  isAuth: userStore.isAuth
};

// Валидация
const validationResult = validationService.validateForm(validationData);
const isFormValid = validationResult.isValid;

// Условное отображение полей контактных данных
{(!userStore.isAuth || !userStore.user?.email || !userStore.user?.username) && (
  <div className="space-y-4">
    <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
      <h4 className="text-sm font-semibold text-emerald-400 mb-3">Контактные данные</h4>
      <div className="space-y-3">
        {/* Показываем поле email только если у пользователя нет email */}
        {(!userStore.isAuth || !userStore.user?.email) && (
          <div>
            <label className="text-sm text-white/70 font-medium">Email</label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full mt-1 px-3 py-2 bg-white/5 border rounded-lg text-white placeholder-white/30 focus:outline-none focus:bg-white/10 transition-all duration-300"
            />
          </div>
        )}
        
        {/* Показываем поле Telegram только если у пользователя нет username */}
        {(!userStore.isAuth || !userStore.user?.username) && (
          <div>
            <label className="text-sm text-white/70 font-medium">Telegram username</label>
            <input
              type="text"
              value={recipientTelegramUsername}
              onChange={(e) => setRecipientTelegramUsername(e.target.value)}
              placeholder="@username"
              className="w-full mt-1 px-3 py-2 bg-white/5 border rounded-lg text-white placeholder-white/30 focus:outline-none focus:bg-white/10 transition-all duration-300"
            />
          </div>
        )}
      </div>
    </div>
  </div>
)}

// Отображение ошибок
{!validationResult.isValid && (!userStore.isAuth || !userStore.user?.email || !userStore.user?.username) && (
  <p className="text-xs text-red-400/80 text-center mt-2">
    {validationResult.errors.find(error => 
      error.includes('email') || error.includes('Telegram')
    ) || 'Заполните все обязательные поля'}
  </p>
)}
```

### Автозаполнение полей

Компонент автоматически заполняет поля контактных данных из профиля пользователя:

1. **При загрузке компонента**: если пользователь авторизован, поля заполняются данными из `userStore.user`
2. **Условное отображение**: поля показываются только если у пользователя нет соответствующих данных
3. **Валидация**: учитывает как данные пользователя, так и введенные в форму значения
4. **Отправка данных**: использует данные пользователя в приоритете над полями формы

## Структура данных

### ExchangeValidationData

```typescript
interface ExchangeValidationData {
  // Основные поля
  fromCurrency?: Currency;
  toCurrency?: Currency;
  fromAmount: string;
  toAmount: string;
  
  // Опции для отправки
  fromSelectedBank?: BankOption;
  fromSelectedNetwork?: NetworkOption;
  fromSelectedPaymentCurrency?: PaymentCurrencyOption;
  
  // Опции для получения
  selectedBank?: BankOption;
  selectedNetwork?: NetworkOption;
  selectedPaymentCurrency?: PaymentCurrencyOption;
  
  // Реквизиты для получения
  walletAddress?: string;
  cardNumber?: string;
  paymentDetails?: string;
  
  // Контактные данные для гостей
  recipientEmail?: string;
  recipientTelegramUsername?: string;
  
  // Статус авторизации
  isAuth: boolean;
}
```

### ValidationResult

```typescript
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
```

### DetailedValidationResult

```typescript
interface DetailedValidationResult {
  // Валидация валют
  fromCurrencyValid: boolean;
  toCurrencyValid: boolean;
  
  // Валидация сумм
  fromAmountValid: boolean;
  toAmountValid: boolean;
  
  // Валидация опций
  fromOptionsValid: boolean;
  toOptionsValid: boolean;
  
  // Валидация реквизитов
  recipientDataValid: boolean;
  
  // Валидация контактных данных
  contactDataValid: boolean;
  
  // Общая валидация
  overallValid: boolean;
  
  // Ошибки
  errors: {
    fromCurrency?: string;
    toCurrency?: string;
    fromAmount?: string;
    toAmount?: string;
    fromOptions?: string;
    toOptions?: string;
    recipientData?: string;
    contactData?: string;
  };
}
```

## Производительность

- Легковесная валидация с минимальными накладными расходами
- Эффективные регулярные выражения для email и username
- Кэширование результатов валидации где это уместно
- Оптимизировано для валидации в реальном времени

## Расширение

### Добавление новых правил валидации

1. Добавьте новый метод в `ValidationService`
2. Обновите интерфейсы типов
3. Интегрируйте в компоненты

### Кастомные валидаторы

```typescript
// Пример кастомного валидатора
private validateCustomField(value: string): { valid: boolean; error?: string } {
  if (!value || value.trim() === '') {
    return { valid: false, error: 'Поле обязательно для заполнения' };
  }
  
  if (value.length < 3) {
    return { valid: false, error: 'Минимум 3 символа' };
  }
  
  return { valid: true };
}
```

## Тестирование

Сервис включает тесты для:
- Валидации различных типов валют
- Проверки контактных данных
- Обработки ошибок
- Производительности

## Troubleshooting

### Валидация не работает
- Проверьте правильность типов данных
- Убедитесь, что все обязательные поля переданы
- Проверьте консоль на ошибки TypeScript

### Неправильные сообщения об ошибках
- Проверьте логику валидации в соответствующих методах
- Убедитесь, что регулярные выражения корректны
- Проверьте порядок проверок в валидации

