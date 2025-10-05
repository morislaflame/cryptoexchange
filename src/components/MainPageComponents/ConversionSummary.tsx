import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { CiRepeat } from 'react-icons/ci';
import Divider from '../ui/Divider';
import { type Currency, type BankOption, type NetworkOption, type PaymentCurrencyOption } from '../../types/currency';
import { getExchangeRate } from '../../types/exchangeRates';
import { useStore } from '../../store/StoreProvider';
import { type CreateExchangeData } from '../../http/exchangeAPI';

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
  const { exchange: exchangeStore, user: userStore } = useStore();
  
  // Состояния для инпутов
  const [walletAddress, setWalletAddress] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [paymentDetails, setPaymentDetails] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Вычисляем курс обмена
  const exchangeRate = fromCurrency && toCurrency 
    ? getExchangeRate(fromCurrency.id, toCurrency.id)
    : null;

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
  const shouldShowRubInput = toCurrency?.id === 'rub' && selectedBank;
  const shouldShowPaymentInput = toCurrency?.category === 'payment' && selectedPaymentCurrency;

  // Проверка выбранных опций для первой карточки (отправка)
  const isFromCurrencyValid = () => {
    if (!fromCurrency) return false;
    
    // Если у валюты есть банки и это RUB - должен быть выбран банк
    if (fromCurrency.id === 'rub' && fromCurrency.banks?.length) {
      return !!fromSelectedBank;
    }
    
    // Если у валюты есть сети (крипта) - должна быть выбрана сеть
    if (fromCurrency.category === 'crypto' && fromCurrency.networks?.length) {
      return !!fromSelectedNetwork;
    }
    
    // Если у валюты есть платежные валюты (платежка) - должна быть выбрана валюта
    if (fromCurrency.category === 'payment' && fromCurrency.paymentCurrencies?.length) {
      return !!fromSelectedPaymentCurrency;
    }
    
    return true;
  };

  // Проверка выбранных опций для второй карточки (получение)
  const isToCurrencyValid = () => {
    if (!toCurrency) return false;
    
    // Если у валюты есть банки и это RUB - должен быть выбран банк
    if (toCurrency.id === 'rub' && toCurrency.banks?.length) {
      return !!selectedBank;
    }
    
    // Если у валюты есть сети (крипта) - должна быть выбрана сеть
    if (toCurrency.category === 'crypto' && toCurrency.networks?.length) {
      return !!selectedNetwork;
    }
    
    // Если у валюты есть платежные валюты (платежка) - должна быть выбрана валюта
    if (toCurrency.category === 'payment' && toCurrency.paymentCurrencies?.length) {
      return !!selectedPaymentCurrency;
    }
    
    return true;
  };

  // Проверка заполненности инпутов для получения
  const isRecipientDataFilled = () => {
    if (shouldShowCryptoInput) return walletAddress.trim() !== '';
    if (shouldShowRubInput) return cardNumber.trim() !== '';
    if (shouldShowPaymentInput) return paymentDetails.trim() !== '';
    // Для USD и EUR дополнительные поля не нужны
    return true;
  };

  // Проверяем все обязательные поля
  const isFormValid = 
    fromCurrency && 
    toCurrency && 
    fromAmount && 
    toAmount && 
    isFromCurrencyValid() && 
    isToCurrencyValid() && 
    isRecipientDataFilled();

  // Обработчик создания заявки
  const handleCreateOrder = async () => {
    if (!isFormValid || !fromCurrency || !toCurrency || !userStore.isAuth) {
      return;
    }

    setIsCreating(true);

    try {
      const exchangeData: CreateExchangeData = {
        // Валюта отправки
        fromCurrencyId: fromCurrency.id,
        fromCurrencySymbol: fromCurrency.symbol,
        fromCurrencyCategory: fromCurrency.category,
        fromAmount: fromAmount,
        fromBankId: fromSelectedBank?.id,
        fromBankName: fromSelectedBank?.name,
        fromNetworkId: fromSelectedNetwork?.id,
        fromNetworkName: fromSelectedNetwork?.name,
        fromPaymentCurrencyId: fromSelectedPaymentCurrency?.id,
        fromPaymentCurrencyName: fromSelectedPaymentCurrency?.name,

        // Валюта получения
        toCurrencyId: toCurrency.id,
        toCurrencySymbol: toCurrency.symbol,
        toCurrencyCategory: toCurrency.category,
        toAmount: toAmount,
        toAmountWithoutFee: toAmountWithoutFee,
        toBankId: selectedBank?.id,
        toBankName: selectedBank?.name,
        toNetworkId: selectedNetwork?.id,
        toNetworkName: selectedNetwork?.name,
        toPaymentCurrencyId: selectedPaymentCurrency?.id,
        toPaymentCurrencyName: selectedPaymentCurrency?.name,

        // Реквизиты для получения
        recipientAddress: walletAddress || undefined,
        recipientCard: cardNumber || undefined,
        recipientPaymentDetails: paymentDetails || undefined,

        // Курс обмена и комиссия
        exchangeRate: exchangeRate?.toString(),
        feeAmount: feeAmount,
        feePercent: feePercent,
      };

      const createdExchange = await exchangeStore.createExchange(exchangeData);

      if (createdExchange) {
        // Успешно создана заявка
        alert(`Заявка #${createdExchange.id} успешно создана! Статус: ${createdExchange.status}`);
        
        // Очищаем инпуты
        setWalletAddress('');
        setCardNumber('');
        setPaymentDetails('');
        
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
          Итоги конвертации
        </h3>
      </div>

      <div className="flex flex-col gap-5">
        {/* Блок обмена валют */}
        <div className="flex flex-col gap-4">
          {/* Отдаете */}
          <div className="p-5 bg-white/5 border border-white/10 rounded-xl">
            <div className="flex items-center justify-between gap-4">
              <div className="text-white text-xl font-bold flex-grow">
                {formatAmount(fromAmount, fromCurrency)}
              </div>
              {fromCurrency && (
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm px-2 py-1 border border-emerald-500/20 rounded-lg backdrop-blur-sm justify-center">
                    <span className="font-bold">
                      {fromCurrency.symbol}
                    </span>
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
            <div className="p-5 bg-white/5 border border-white/10 rounded-xl">
              <div className="flex items-center justify-between gap-4">
                <div className="text-white text-xl font-bold flex-grow">
                  {formatAmount(toAmount, toCurrency)}
                </div>
                {toCurrency && (
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm px-2 py-1 border border-emerald-500/20 rounded-lg backdrop-blur-sm justify-center">
                    <span className="font-bold">
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

        {/* Кнопка создания заявки */}
        <div className="mt-2">
          <button
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-white/10 disabled:to-white/10 border-none rounded-xl text-white text-base font-semibold cursor-pointer transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 active:shadow-lg active:shadow-emerald-500/30 uppercase tracking-wider disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none disabled:text-white/40"
            onClick={handleCreateOrder}
            disabled={!isFormValid || isCreating || !userStore.isAuth}
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
          {!userStore.isAuth && (
            <p className="text-xs text-red-400/80 text-center mt-2">
              Необходимо авторизоваться для создания заявки
            </p>
          )}
        </div>
      </div>
    </div>
  );
});

export default ConversionSummary;
