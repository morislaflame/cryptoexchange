import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { GoCheckCircle } from 'react-icons/go';
import { addThousandsSeparator } from '@/utils/formatNumbers';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  exchangeId?: number;
  status?: string;
  fromCurrency?: string;
  toCurrency?: string;
  fromAmount?: string;
  toAmount?: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  exchangeId,
  // status,
  fromCurrency,
  toCurrency,
  fromAmount,
  toAmount
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-gray-900 to-emerald-900 border border-emerald-500/20 rounded-2xl">
        <DialogHeader className="text-center">
          {/* Success icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center">
              <GoCheckCircle size={32} className="text-emerald-400" />
            </div>
          </div>

          <DialogTitle className="text-xl font-bold text-white mb-2 text-center">
            {title}
          </DialogTitle>
        </DialogHeader>

        {/* Message */}
        <p className="text-white/70 mb-4 text-center">
          {message}
        </p>

        {/* Exchange details */}
        {exchangeId && (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4 mb-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/70">Номер заявки:</span>
              <span className="text-sm font-semibold text-emerald-400">#{exchangeId}</span>
            </div>
            {/* {status && (
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-white/70">Статус:</span>
                <span className="text-sm font-semibold text-emerald-400 capitalize">
                  {status.toLowerCase()}
                </span>
              </div>
            )} */}
            
            {/* Exchange details */}
            {fromCurrency && toCurrency && fromAmount && toAmount && (
              <div className="mt-3 pt-3 border-t border-emerald-500/20">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/70">Обмен:</span>
                  <span className="text-sm font-semibold text-white">
                    {addThousandsSeparator(fromAmount)} {fromCurrency} → {addThousandsSeparator(toAmount)} {toCurrency}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        <p className="text-white/70 mb-2 text-center flex flex-col items-center gap-2">
          Для ускорения процесса обмена, пожалуйста, свяжитесь с нами через Telegram.
          <a href={import.meta.env.VITE_SUPPORT_LINK} target="_blank" rel="noopener noreferrer" className="text-emerald-400">Написать в Telegram</a>
        </p>

        {/* Action button */}
        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0"
        >
          Понятно
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessModal;
