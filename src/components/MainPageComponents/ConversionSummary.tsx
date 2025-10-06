import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { CiRepeat } from 'react-icons/ci';
import Divider from '../ui/Divider';
import SuccessModal from '../ui/SuccessModal';
import { type Currency, type BankOption, type NetworkOption, type PaymentCurrencyOption } from '../../types/currency';
import { useStore } from '../../store/StoreProvider';
import { type CreateExchangeData } from '../../http/exchangeAPI';
import { validationService } from '../../services/validationService';
import { type ExchangeValidationData } from '../../types/validation';

interface ConversionSummaryProps {
  fromCurrency?: Currency;
  toCurrency?: Currency;
  fromAmount: string;
  toAmount: string;
  toAmountWithoutFee?: string; // Сумма без комиссии
  feeAmount?: string; // Сумма комиссии
  feePercent?: number; // Процент комиссии
  selectedBank?: BankOption; // Выбранный банк для рублей (получение)
  selectedNetwork?: NetworkOption; // Выбранная сеть для крипты (получение)
  selectedPaymentCurrency?: PaymentCurrencyOption; // Выбранная валюта для платежки (получение)
  fromSelectedBank?: BankOption; // Выбранный банк для отправки
  fromSelectedNetwork?: NetworkOption; // Выбранная сеть для отправки
  fromSelectedPaymentCurrency?: PaymentCurrencyOption; // Выбранная валюта для отправки
  onCreateOrder?: () => void;
}

const ConversionSummary: React.FC<ConversionSummaryProps> = observer(({
  fromCurrency,
  toCurrency,
  fromAmount,
  toAmount,
  toAmountWithoutFee,
  feeAmount,
  feePercent = 3,
  selectedBank,
  selectedNetwork,
  selectedPaymentCurrency,
  fromSelectedBank,
  fromSelectedNetwork,
  fromSelectedPaymentCurrency,
  onCreateOrder
}) => {
  const { exchange: exchangeStore, user: userStore, exchangeRates } = useStore();
  
  // Состояния для инпутов
  const [walletAddress, setWalletAddress] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [paymentDetails, setPaymentDetails] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  // Состояние для отслеживания попыток отправки формы
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  
  // Состояния для гостевых данных
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientTelegramUsername, setRecipientTelegramUsername] = useState('');
  
  // Состояние для модального окна успеха
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdExchange, setCreatedExchange] = useState<{ id: number; status: string } | null>(null);
  
  // Инициализируем поля данными пользователя, если они есть
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
  
  // Состояние для реального курса обмена
  const [realExchangeRate, setRealExchangeRate] = useState<number | null>(null);

  // Загружаем реальный курс обмена при изменении валют
  useEffect(() => {
    const loadRealExchangeRate = async () => {
      if (fromCurrency && toCurrency) {
        try {
          const rate = await exchangeRates.getExchangeRate(fromCurrency.id, toCurrency.id);
          setRealExchangeRate(rate);
        } catch (error) {
          console.error('Ошибка при загрузке курса обмена:', error);
          setRealExchangeRate(null);
        }
      } else {
        setRealExchangeRate(null);
      }
    };

    loadRealExchangeRate();
  }, [fromCurrency, toCurrency, exchangeRates]);

  // Используем реальный курс обмена, если он доступен
  const exchangeRate = realExchangeRate;

  const formatAmount = (amount: string, currency?: Currency) => {
    const num = parseFloat(amount);
    if (isNaN(num)) {
      // Для фиатных валют 2 знака, для остальных 6
      return currency?.category === 'fiat' ? '0.00' : '0.000000';
    }
    // Для фиатных валют 2 знака после запятой, для криптовалют и платежек 6
    return currency?.category === 'fiat' ? num.toFixed(2) : num.toFixed(6);
  };

  const formatRate = (rate: number) => {
    if (rate >= 1) {
      return `1 ${fromCurrency?.symbol} = ${rate.toFixed(6)} ${toCurrency?.symbol}`;
    } else {
      return `1 ${toCurrency?.symbol} = ${(1/rate).toFixed(6)} ${fromCurrency?.symbol}`;
    }
  };

  // Определяем какой инпут показывать
  const shouldShowCryptoInput = toCurrency?.category === 'crypto' && selectedNetwork;
  const shouldShowRubInput = toCurrency?.id === 'rub' && selectedBank && selectedBank.id !== 'cash';
  const shouldShowPaymentInput = toCurrency?.category === 'payment' && selectedPaymentCurrency;

  // Подготавливаем данные для валидации
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

  // Используем сервис валидации
  const validationResult = validationService.validateForm(validationData);
  const isFormValid = validationResult.isValid;

  // Обработчик создания заявки
  const handleCreateOrder = async () => {
    // Отмечаем, что пользователь попытался отправить форму
    setHasAttemptedSubmit(true);
    
    if (!isFormValid || !fromCurrency || !toCurrency) {
      return;
    }

    setIsCreating(true);

    try {
      const exchangeData: CreateExchangeData = {
        // Направления обмена
        from: {
          currency: {
            id: fromCurrency.id,
            symbol: fromCurrency.symbol,
            category: fromCurrency.category
          },
          amount: fromAmount,
          bankName: fromSelectedBank?.name,
          networkName: fromSelectedNetwork?.name,
          paymentCurrencyName: fromSelectedPaymentCurrency?.name
        },
        to: {
          currency: {
            id: toCurrency.id,
            symbol: toCurrency.symbol,
            category: toCurrency.category
          },
          amount: toAmount,
          bankName: selectedBank?.name,
          networkName: selectedNetwork?.name,
          paymentCurrencyName: selectedPaymentCurrency?.name
        },

        // Реквизиты для получения
        recipientAddress: walletAddress || undefined,
        recipientCard: cardNumber || undefined,
        recipientPaymentDetails: paymentDetails || undefined,

        // Курс обмена и комиссия
        exchangeRate: exchangeRate?.toString(),
        feeAmount: feeAmount,
        feePercent: feePercent,
        
        // Используем данные пользователя, если они есть, иначе поля формы
        recipientEmail: (userStore.user?.email || recipientEmail.trim()) || undefined,
        recipientTelegramUsername: (userStore.user?.username || recipientTelegramUsername.trim()) || undefined,
      };

      const createdExchange = await exchangeStore.createExchange(exchangeData);

      if (createdExchange) {
        // Успешно создана заявка - показываем модальное окно
        setCreatedExchange({
          id: createdExchange.id,
          status: createdExchange.status
        });
        setShowSuccessModal(true);
        
        // Очищаем инпуты
        setWalletAddress('');
        setCardNumber('');
        setPaymentDetails('');
        // Очищаем только если у пользователя нет этих данных
        if (!userStore.user?.email) {
          setRecipientEmail('');
        }
        if (!userStore.user?.username) {
          setRecipientTelegramUsername('');
        }
        
        // Сбрасываем состояние попытки отправки
        setHasAttemptedSubmit(false);
        
        // Вызываем колбэк, если он есть
        if (onCreateOrder) {
          onCreateOrder();
        }
      } else {
        // Ошибка при создании
        alert(exchangeStore.error || 'Ошибка при создании заявки');
      }
    } catch (error) {
      console.error('Error creating exchange order:', error);
      alert('Произошла ошибка при создании заявки');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="w-full p-5 rounded-2xl">
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text">
          Создание заявки
        </h3>
      </div>

      <div className="flex flex-col gap-5">
        {/* Блок обмена валют */}
        <div className="flex flex-col gap-4">
          {/* Отдаете */}
          <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-white/70">Ваша сумма:</p>
              <div className="text-white text-lg font-bold flex-grow">
                {formatAmount(fromAmount, fromCurrency)}
              </div>
              {fromCurrency && (
              <div className="flex items-center gap-2 font-semibold text-lg justify-center">
                {fromCurrency.icon && typeof fromCurrency.icon === 'string' && (fromCurrency.icon.includes('.png') || fromCurrency.icon.includes('.jpg') || fromCurrency.icon.includes('.svg')) ? (
                  <img 
                    src={fromCurrency.icon} 
                    alt={fromCurrency.name}
                    className="w-6 h-6 object-contain"
                  />
                ) : (
                  <span className="text-lg">{fromCurrency.icon}</span>
                )}
                    {/* <span className="currency-symbol" >
                      {fromCurrency.symbol}
                    </span> */}
              </div>
              )}
            </div>
          </div>

          {/* Разделитель с иконкой */}
          <Divider
            variant="gradient"
            color="primary"
            size="small"
            spacing="none"
            icon={<CiRepeat size={20} />}
          />

          {/* Блок с информацией о комиссии */}
          {toAmountWithoutFee && feeAmount && (
            <div className="flex flex-col gap-2 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
              {/* Сумма без комиссии */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/70">Сумма без комиссии:</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold">{formatAmount(toAmountWithoutFee, toCurrency)}</span>
                  {toCurrency && (
                    <span className=" font-semibold">{toCurrency.symbol}</span>
                  )}
                </div>
              </div>

              {/* Комиссия сервиса */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/70">Комиссия сервиса ({feePercent}%):</span>
                <div className="flex items-center gap-2">
                  <span className=" font-semibold">-{formatAmount(feeAmount, toCurrency)}</span>
                  {toCurrency && (
                    <span className=" font-semibold">{toCurrency.symbol}</span>
                  )}
                </div>
              </div>

              {/* Разделитель */}
              <div className="h-px bg-white/10 my-1"></div>

              {/* Итого к получению */}
              <div className="flex items-center justify-between">
                <span className="text-white font-semibold">Итого к получению:</span>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold text-lg">{formatAmount(toAmount, toCurrency)}</span>
                  {toCurrency && (
                    <span className="text-emerald-400 font-bold">{toCurrency.symbol}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Получаете (если нет информации о комиссии - показываем как раньше) */}
          {(!toAmountWithoutFee || !feeAmount) && (
            <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-white/70">К получению:</p>
                <div className="text-white text-lg font-bold flex-grow">
                  {formatAmount(toAmount, toCurrency)}
                </div>
                {toCurrency && (
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm px-2 py-1 border border-emerald-500/20 rounded-lg backdrop-blur-sm justify-center">
                    <span className="font-bold ">
                      {toCurrency.symbol}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Курс обмена */}
        {exchangeRate && (
          <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-center">
            <div className="flex flex-col gap-1">
              <span className="text-sm truncate
              text-white/70
              transition-colors duration-300">
                Курс обмена:
              </span>
              <span className="text-lg font-bold">
                {formatRate(exchangeRate)}
              </span>
            </div>
          </div>
        )}

        {/* Инпуты для получения */}
        {/* Инпут адреса кошелька для криптовалюты */}
        {shouldShowCryptoInput && (
          <div className="space-y-2">
            <label className="text-sm text-white/70 font-medium">Адрес кошелька</label>
            <div className="relative mt-2">
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder={`Введите адрес ${toCurrency?.symbol}`}
                className="w-full px-4 py-3 pr-32 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all duration-300"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {toCurrency?.icon && typeof toCurrency.icon === 'string' && (toCurrency.icon.includes('.png') || toCurrency.icon.includes('.jpg') || toCurrency.icon.includes('.svg')) ? (
                  <img 
                    src={toCurrency.icon} 
                    alt={toCurrency.name}
                    className="w-6 h-6 object-contain"
                  />
                ) : (
                  <span className="text-lg">{toCurrency?.icon}</span>
                )}
                <div className="flex flex-col items-end">
                  <span className="text-xs text-white/50">{selectedNetwork?.name}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Инпут карты/телефона для рублей */}
        {shouldShowRubInput && (
          <div >
            <label className="text-sm text-white/70 font-medium mb-2">Номер карты или телефона</label>
            <div className="relative mt-2">
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="Введите номер карты или телефона"
                className="w-full px-4 py-3 pr-20 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all duration-300"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {selectedBank?.icon && (
                  <img 
                    src={selectedBank.icon} 
                    alt={selectedBank.name}
                    className="w-6 h-6 object-contain"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Инпут реквизитов для платежных систем */}
        {shouldShowPaymentInput && (
          <div className="space-y-2">
            <label className="text-sm text-white/70 font-medium">Реквизиты для получения</label>
            <div className="relative mt-2">
              <input
                type="text"
                value={paymentDetails}
                onChange={(e) => setPaymentDetails(e.target.value)}
                placeholder={`Введите реквизиты ${toCurrency?.name}`}
                className="w-full px-4 py-3 pr-20 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all duration-300"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {toCurrency?.icon && typeof toCurrency.icon === 'string' && (toCurrency.icon.includes('.png') || toCurrency.icon.includes('.jpg') || toCurrency.icon.includes('.svg')) ? (
                  <img 
                    src={toCurrency.icon} 
                    alt={toCurrency.name}
                    className="w-6 h-6 object-contain"
                  />
                ) : (
                  <span className="text-2xl">{toCurrency?.icon}</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Поля контактных данных для гостевых пользователей или если у авторизованного пользователя нет данных */}
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
                      className={`w-full mt-1 px-3 py-2 bg-white/5 border rounded-lg text-white placeholder-white/30 focus:outline-none focus:bg-white/10 transition-all duration-300 ${
                        recipientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)
                          ? 'border-red-500/50 focus:border-red-500/50'
                          : 'border-white/10 focus:border-emerald-500/50'
                      }`}
                    />
                    {recipientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail) && (
                      <p className="text-xs text-red-400/80 mt-1">Некорректный формат email</p>
                    )}
                  </div>
                )}
                
                {/* Показываем поле Telegram только если у пользователя нет username */}
                {(!userStore.isAuth || !userStore.user?.username) && (
                  <div>
                    <label className="text-sm text-white/70 font-medium">Telegram юзернейм</label>
                    <input
                      type="text"
                      value={recipientTelegramUsername}
                      onChange={(e) => setRecipientTelegramUsername(e.target.value)}
                      placeholder="@username"
                      className={`w-full mt-1 px-3 py-2 bg-white/5 border rounded-lg text-white placeholder-white/30 focus:outline-none focus:bg-white/10 transition-all duration-300 ${
                        recipientTelegramUsername && !/^[a-zA-Z0-9_]{1,32}$/.test(recipientTelegramUsername.replace(/^@/, ''))
                          ? 'border-red-500/50 focus:border-red-500/50'
                          : 'border-white/10 focus:border-emerald-500/50'
                      }`}
                    />
                    {recipientTelegramUsername && !/^[a-zA-Z0-9_]{1,32}$/.test(recipientTelegramUsername.replace(/^@/, '')) && (
                      <p className="text-xs text-red-400/80 mt-1">Некорректный формат Telegram username</p>
                    )}
                  </div>
                )}
                
                <p className="text-xs text-white/50">
                  Укажите контакты для получения информации о заявке
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Кнопка создания заявки */}
        <div className="mt-2">
          <button
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-white/10 disabled:to-white/10 border-none rounded-xl text-white text-base font-semibold cursor-pointer transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 active:shadow-lg active:shadow-emerald-500/30 uppercase tracking-wider disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none disabled:text-white/40"
            onClick={handleCreateOrder}
            disabled={!isFormValid || isCreating}
          >
            {isCreating ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Создание...
              </>
            ) : (
              'Создать заявку'
            )}
          </button>
          {hasAttemptedSubmit && !validationResult.isValid && !userStore.isAuth && (
            <p className="text-xs text-red-400/80 text-center mt-2">
              {validationResult.errors.find(error => 
                error.includes('email') || error.includes('Telegram')
              ) || 'Заполните все обязательные поля'}
            </p>
          )}
        </div>
      </div>
      <p className="text-white/70 text-center flex items-center gap-2 mt-4 text-sm justify-center text-left">
          Для уточнения деталей обмена: 
          <a href={import.meta.env.VITE_SUPPORT_LINK} target="_blank" rel="noopener noreferrer" className="text-emerald-400">Написать в Telegram</a>
        </p>

      {/* Модальное окно успеха */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Заявка создана успешно!"
        message="Ваша заявка на обмен была успешно создана. Мы свяжемся с вами в ближайшее время для уточнения деталей."
        exchangeId={createdExchange?.id}
        status={createdExchange?.status}
        fromCurrency={fromCurrency?.symbol}
        toCurrency={toCurrency?.symbol}
        fromAmount={fromAmount}
        toAmount={toAmount}
      />
    </div>
  );
});

export default ConversionSummary;
