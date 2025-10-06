# Guest Exchange Feature - Гостевые заявки на обмен

Документация по функционалу создания заявок на обмен без авторизации.

## 🎯 Описание

Пользователи теперь могут создавать заявки на обмен без предварительной регистрации, просто указав свои контактные данные (email или Telegram username) в форме.

## 🔧 Изменения в бэкенде

### 1. Модель Exchange (models.js)

Добавлены поля для гостевых данных:

```javascript
// Гостевые данные (для неавторизованных пользователей)
guestEmail: { type: DataTypes.STRING, allowNull: true },
guestTelegramUsername: { type: DataTypes.STRING, allowNull: true },
```

### 2. Контроллер (exchangeController.js)

**Обновленная логика создания заявки:**

```javascript
// Проверяем авторизацию пользователя или гостевые данные
const userId = req.user?.id;

if (!userId) {
  // Если пользователь не авторизован, проверяем гостевые данные
  if (!guestEmail && !guestTelegramUsername) {
    return next(ApiError.badRequest("Необходимо указать email или Telegram username"));
  }
  
  // Валидация email
  if (guestEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestEmail)) {
      return next(ApiError.badRequest("Некорректный формат email"));
    }
  }
  
  // Валидация Telegram username
  if (guestTelegramUsername) {
    const telegramRegex = /^@?[a-zA-Z0-9_]{5,32}$/;
    if (!telegramRegex.test(guestTelegramUsername)) {
      return next(ApiError.badRequest("Некорректный формат Telegram username"));
    }
    guestTelegramUsername = guestTelegramUsername.replace(/^@/, '');
  }
}
```

**Создание заявки с гостевыми данными:**

```javascript
const exchange = await Exchange.create({
  userId: userId || null, // null для гостевых заявок
  
  // ... остальные поля заявки ...
  
  // Гостевые данные (если есть)
  guestEmail,
  guestTelegramUsername,
}, { transaction });
```

**Обновленное уведомление админу:**

```javascript
let userInfo;
if (userId) {
  const user = await User.findByPk(userId);
  userInfo = user?.email || user?.username || `ID: ${userId}`;
} else {
  // Для гостевых заявок
  const guestInfo = [];
  if (exchange.guestEmail) guestInfo.push(`📧 ${exchange.guestEmail}`);
  if (exchange.guestTelegramUsername) guestInfo.push(`📱 @${exchange.guestTelegramUsername}`);
  userInfo = guestInfo.join(' | ') || 'Гость';
}
```

### 3. Роутер (exchangeRouter.js)

Убрано требование авторизации для создания заявок:

```javascript
// Создание новой заявки (поддерживает гостевые заявки)
router.post(
  "/",
  userLimiter, // Только rate limiting
  exchangeController.create
);
```

## 🎨 Изменения во фронтенде

### 1. API клиент (exchangeAPI.ts)

**Обновленный интерфейс:**

```typescript
export interface CreateExchangeData {
  // ... существующие поля ...
  
  // Контактные данные для гостевых заявок
  guestEmail?: string;
  guestTelegramUsername?: string;
}
```

**Функция создания заявки:**

```typescript
// Создание новой заявки (поддерживает гостевые заявки)
export const createExchange = async (exchangeData: CreateExchangeData): Promise<Exchange> => {
  const { data } = await $host.post('api/exchange/', exchangeData); // Используем $host вместо $authHost
  return data;
};
```

### 2. Компонент ConversionSummary.tsx

**Новые состояния:**

```typescript
// Состояния для гостевых данных
const [guestEmail, setGuestEmail] = useState('');
const [guestTelegramUsername, setGuestTelegramUsername] = useState('');
```

**Обновленная валидация:**

```typescript
// Проверка контактных данных для гостевых пользователей
const isGuestContactDataFilled = () => {
  if (userStore.isAuth) return true; // Для авторизованных пользователей не нужно
  return guestEmail.trim() !== '' || guestTelegramUsername.trim() !== '';
};

// Проверяем все обязательные поля
const isFormValid = 
  fromCurrency && 
  toCurrency && 
  fromAmount && 
  toAmount && 
  isFromCurrencyValid() && 
  isToCurrencyValid() && 
  isRecipientDataFilled() &&
  isGuestContactDataFilled(); // Добавлена проверка гостевых данных
```

**Поля контактных данных в UI:**

```tsx
{/* Поля контактных данных для гостевых пользователей */}
{!userStore.isAuth && (
  <div className="space-y-4">
    <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
      <h4 className="text-sm font-semibold text-blue-400 mb-3">Контактные данные</h4>
      <div className="space-y-3">
        <div>
          <label className="text-sm text-white/70 font-medium">Email (необязательно)</label>
          <input
            type="email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all duration-300"
          />
        </div>
        <div>
          <label className="text-sm text-white/70 font-medium">Telegram username (необязательно)</label>
          <input
            type="text"
            value={guestTelegramUsername}
            onChange={(e) => setGuestTelegramUsername(e.target.value)}
            placeholder="@username или username"
            className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all duration-300"
          />
        </div>
        <p className="text-xs text-white/50">
          Укажите хотя бы один способ связи для уведомлений о статусе заявки
        </p>
      </div>
    </div>
  </div>
)}
```

**Обновленный обработчик создания:**

```typescript
const handleCreateOrder = async () => {
  if (!isFormValid || !fromCurrency || !toCurrency) {
    return; // Убрана проверка userStore.isAuth
  }

  // ... создание данных заявки ...

  const exchangeData: CreateExchangeData = {
    // ... существующие поля ...
    
    // Контактные данные для гостевых заявок
    guestEmail: guestEmail.trim() || undefined,
    guestTelegramUsername: guestTelegramUsername.trim() || undefined,
  };

  const createdExchange = await exchangeStore.createExchange(exchangeData);
  
  if (createdExchange) {
    // Очищаем все поля включая гостевые
    setWalletAddress('');
    setCardNumber('');
    setPaymentDetails('');
    setGuestEmail('');
    setGuestTelegramUsername('');
  }
};
```

## 📱 Пользовательский интерфейс

### Для авторизованных пользователей:
- Форма работает как раньше
- Поля контактных данных не отображаются
- Используются данные из профиля

### Для гостевых пользователей:
- Отображается блок "Контактные данные"
- Поля Email и Telegram username (хотя бы одно обязательно)
- Валидация форматов email и Telegram username
- Подсказка о необходимости указать контакты

## 🔔 Уведомления в Telegram

### Для авторизованных пользователей:
```
🔔 Новая заявка на обмен #1

👤 Пользователь: user@example.com
```

### Для гостевых пользователей:
```
🔔 Новая заявка на обмен #1

👤 Пользователь: 📧 guest@example.com | 📱 @username
```

## ✅ Валидация

### Email:
- Формат: `user@domain.com`
- Регулярное выражение: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

### Telegram Username:
- Формат: `@username` или `username`
- Длина: 1-32 символа
- Символы: буквы, цифры, подчеркивания
- Регулярное выражение: `/^[a-zA-Z0-9_]{1,32}$/` (после удаления @)
- Автоматическое удаление `@` в начале

## 🚀 Поток создания гостевой заявки

1. **Пользователь заходит на сайт** (без авторизации)
2. **Заполняет форму обмена** (валюты, суммы, реквизиты)
3. **Указывает контактные данные** (email или Telegram)
4. **Нажимает "Создать заявку"**
5. **Проходит валидация** всех полей включая контакты
6. **Отправляется запрос** на сервер без токена авторизации
7. **Сервер создает заявку** с гостевыми данными
8. **Админ получает уведомление** с контактными данными
9. **Пользователь получает подтверждение** с номером заявки

## 🔒 Безопасность

- **Rate limiting** для предотвращения спама
- **Валидация данных** на фронтенде и бэкенде
- **Проверка форматов** email и Telegram username
- **Транзакции БД** для целостности данных
- **Логирование** всех операций

## 📊 Преимущества

✅ **Упрощенный процесс** - не нужно регистрироваться  
✅ **Быстрое создание заявок** - минимум полей  
✅ **Гибкость** - можно указать email или Telegram  
✅ **Уведомления** - админ получает контакты для связи  
✅ **Обратная совместимость** - авторизованные пользователи работают как раньше  

## 🎯 Результат

Теперь любой посетитель сайта может создать заявку на обмен, просто указав свои контактные данные. Это значительно упрощает процесс и увеличивает конверсию! 🚀
