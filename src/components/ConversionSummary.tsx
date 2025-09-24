import React from 'react';
import { CiRepeat } from 'react-icons/ci';
import Divider from './Divider';
import { type Currency } from '../types/currency';
import { getExchangeRate } from '../types/exchangeRates';

interface ConversionSummaryProps {
  fromCurrency?: Currency;
  toCurrency?: Currency;
  fromAmount: string;
  toAmount: string;
  onCreateOrder?: () => void;
}

const ConversionSummary: React.FC<ConversionSummaryProps> = ({
  fromCurrency,
  toCurrency,
  fromAmount,
  toAmount,
  onCreateOrder
}) => {
  // Вычисляем курс обмена
  const exchangeRate = fromCurrency && toCurrency 
    ? getExchangeRate(fromCurrency.id, toCurrency.id)
    : null;

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return '0.000000';
    return num.toFixed(6);
  };

  const formatRate = (rate: number) => {
    if (rate >= 1) {
      return `1 ${fromCurrency?.symbol} = ${rate.toFixed(6)} ${toCurrency?.symbol}`;
    } else {
      return `1 ${toCurrency?.symbol} = ${(1/rate).toFixed(6)} ${fromCurrency?.symbol}`;
    }
  };

  return (
    <div className="w-full p-5 rounded-2xl border border-white/10 backdrop-blur-lg shadow-2xl">
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
                {formatAmount(fromAmount)}
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

          {/* Получаете */}
          <div className="p-5 bg-white/5 border border-white/10 rounded-xl">
            <div className="flex items-center justify-between gap-4">
              <div className="text-white text-xl font-bold flex-grow">
                {formatAmount(toAmount)}
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

        {/* Кнопка создания заявки */}
        <div className="mt-2">
          <button
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-white/10 disabled:to-white/10 border-none rounded-xl text-white text-base font-semibold cursor-pointer transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 active:shadow-lg active:shadow-emerald-500/30 uppercase tracking-wider disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none disabled:text-white/40"
            onClick={onCreateOrder}
            disabled={!fromCurrency || !toCurrency || !fromAmount || !toAmount}
          >
            Создать заявку
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversionSummary;
