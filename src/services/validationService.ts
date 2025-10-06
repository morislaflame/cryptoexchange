import { 
  type ExchangeValidationData, 
  type ValidationResult, 
  type DetailedValidationResult 
} from '../types/validation';
import { type Currency, type NetworkOption, type BankOption, type PaymentCurrencyOption } from '../types/currency';

/**
 * Сервис валидации полей для заявок на обмен
 */
class ValidationService {
  /**
   * Проверяет валидность email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Проверяет валидность Telegram username
   */
  private isValidTelegramUsername(username: string): boolean {
    const cleanUsername = username.replace(/^@/, '');
    const telegramRegex = /^[a-zA-Z0-9_]{1,32}$/;
    return telegramRegex.test(cleanUsername);
  }

  /**
   * Проверяет валидность суммы
   */
  private isValidAmount(amount: string): boolean {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0;
  }

  /**
   * Проверяет валидность валюты отправки
   */
  private validateFromCurrency(data: ExchangeValidationData): { valid: boolean; error?: string } {
    if (!data.fromCurrency) {
      return { valid: false, error: 'Не выбрана валюта отправки' };
    }

    // Если у валюты есть банки и это RUB - должен быть выбран банк
    if (data.fromCurrency.id === 'rub' && data.fromCurrency.banks?.length) {
      if (!data.fromSelectedBank) {
        return { valid: false, error: 'Не выбран банк для отправки рублей' };
      }
    }
    
    // Если у валюты есть сети (крипта) - должна быть выбрана сеть
    if (data.fromCurrency.category === 'crypto' && data.fromCurrency.networks?.length) {
      if (!data.fromSelectedNetwork) {
        return { valid: false, error: 'Не выбрана сеть для отправки криптовалюты' };
      }
    }
    
    // Если у валюты есть платежные валюты (платежка) - должна быть выбрана валюта
    if (data.fromCurrency.category === 'payment' && data.fromCurrency.paymentCurrencies?.length) {
      if (!data.fromSelectedPaymentCurrency) {
        return { valid: false, error: 'Не выбрана платежная валюта для отправки' };
      }
    }

    return { valid: true };
  }

  /**
   * Проверяет валидность валюты получения
   */
  private validateToCurrency(data: ExchangeValidationData): { valid: boolean; error?: string } {
    if (!data.toCurrency) {
      return { valid: false, error: 'Не выбрана валюта получения' };
    }

    // Если у валюты есть банки и это RUB - должен быть выбран банк
    if (data.toCurrency.id === 'rub' && data.toCurrency.banks?.length) {
      if (!data.selectedBank) {
        return { valid: false, error: 'Не выбран банк для получения рублей' };
      }
    }
    
    // Если у валюты есть сети (крипта) - должна быть выбрана сеть
    if (data.toCurrency.category === 'crypto' && data.toCurrency.networks?.length) {
      if (!data.selectedNetwork) {
        return { valid: false, error: 'Не выбрана сеть для получения криптовалюты' };
      }
    }
    
    // Если у валюты есть платежные валюты (платежка) - должна быть выбрана валюта
    if (data.toCurrency.category === 'payment' && data.toCurrency.paymentCurrencies?.length) {
      if (!data.selectedPaymentCurrency) {
        return { valid: false, error: 'Не выбрана платежная валюта для получения' };
      }
    }

    return { valid: true };
  }

  /**
   * Проверяет валидность сумм
   */
  private validateAmounts(data: ExchangeValidationData): { 
    fromAmountValid: boolean; 
    toAmountValid: boolean; 
    errors: { fromAmount?: string; toAmount?: string } 
  } {
    const errors: { fromAmount?: string; toAmount?: string } = {};

    const fromAmountValid = this.isValidAmount(data.fromAmount);
    if (!fromAmountValid) {
      errors.fromAmount = 'Некорректная сумма отправки';
    }

    const toAmountValid = this.isValidAmount(data.toAmount);
    if (!toAmountValid) {
      errors.toAmount = 'Некорректная сумма получения';
    }

    return { fromAmountValid, toAmountValid, errors };
  }

  /**
   * Проверяет валидность реквизитов для получения
   */
  private validateRecipientData(data: ExchangeValidationData): { valid: boolean; error?: string } {
    if (!data.toCurrency) {
      return { valid: true }; // Если валюта не выбрана, пропускаем
    }

    // Определяем какой инпут должен быть заполнен
    const shouldShowCryptoInput = data.toCurrency.category === 'crypto' && data.selectedNetwork;
    const shouldShowRubInput = data.toCurrency.id === 'rub' && data.selectedBank && data.selectedBank.id !== 'cash';
    const shouldShowPaymentInput = data.toCurrency.category === 'payment' && data.selectedPaymentCurrency;

    if (shouldShowCryptoInput) {
      if (!data.walletAddress || data.walletAddress.trim() === '') {
        return { valid: false, error: 'Не указан адрес кошелька' };
      }
    }

    if (shouldShowRubInput) {
      if (!data.cardNumber || data.cardNumber.trim() === '') {
        return { valid: false, error: 'Не указан номер карты или телефона' };
      }
    }

    if (shouldShowPaymentInput) {
      if (!data.paymentDetails || data.paymentDetails.trim() === '') {
        return { valid: false, error: 'Не указаны реквизиты для получения' };
      }
    }

    return { valid: true };
  }

  /**
   * Проверяет валидность контактных данных для гостевых пользователей
   */
  private validateContactData(data: ExchangeValidationData): { valid: boolean; error?: string } {
    if (data.isAuth) {
      return { valid: true }; // Для авторизованных пользователей не нужно
    }
    
    const email = data.recipientEmail?.trim() || '';
    const telegram = data.recipientTelegramUsername?.trim() || '';
    
    // Telegram username обязателен
    if (!telegram) {
      return { valid: false, error: 'Необходимо указать Telegram username' };
    }
    
    // Валидация формата Telegram username
    if (!this.isValidTelegramUsername(telegram)) {
      return { valid: false, error: 'Некорректный формат Telegram username' };
    }
    
    // Валидация email если указан (опционально)
    if (email && !this.isValidEmail(email)) {
      return { valid: false, error: 'Некорректный формат email' };
    }
    
    return { valid: true };
  }

  /**
   * Простая валидация формы
   */
  validateForm(data: ExchangeValidationData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Проверка основных полей
    if (!data.fromCurrency) {
      errors.push('Не выбрана валюта отправки');
    }
    if (!data.toCurrency) {
      errors.push('Не выбрана валюта получения');
    }
    if (!data.fromAmount || !this.isValidAmount(data.fromAmount)) {
      errors.push('Некорректная сумма отправки');
    }
    if (!data.toAmount || !this.isValidAmount(data.toAmount)) {
      errors.push('Некорректная сумма получения');
    }

    // Проверка валют
    const fromCurrencyValidation = this.validateFromCurrency(data);
    if (!fromCurrencyValidation.valid) {
      errors.push(fromCurrencyValidation.error!);
    }

    const toCurrencyValidation = this.validateToCurrency(data);
    if (!toCurrencyValidation.valid) {
      errors.push(toCurrencyValidation.error!);
    }

    // Проверка реквизитов
    const recipientValidation = this.validateRecipientData(data);
    if (!recipientValidation.valid) {
      errors.push(recipientValidation.error!);
    }

    // Проверка контактных данных
    const contactValidation = this.validateContactData(data);
    if (!contactValidation.valid) {
      errors.push(contactValidation.error!);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Детальная валидация формы с разбивкой по полям
   */
  validateFormDetailed(data: ExchangeValidationData): DetailedValidationResult {
    const fromCurrencyValidation = this.validateFromCurrency(data);
    const toCurrencyValidation = this.validateToCurrency(data);
    const amountsValidation = this.validateAmounts(data);
    const recipientValidation = this.validateRecipientData(data);
    const contactValidation = this.validateContactData(data);

    const fromOptionsValid = fromCurrencyValidation.valid;
    const toOptionsValid = toCurrencyValidation.valid;
    const recipientDataValid = recipientValidation.valid;
    const contactDataValid = contactValidation.valid;

    const overallValid = 
      fromCurrencyValidation.valid &&
      toCurrencyValidation.valid &&
      amountsValidation.fromAmountValid &&
      amountsValidation.toAmountValid &&
      fromOptionsValid &&
      toOptionsValid &&
      recipientDataValid &&
      contactDataValid;

    return {
      fromCurrencyValid: fromCurrencyValidation.valid,
      toCurrencyValid: toCurrencyValidation.valid,
      fromAmountValid: amountsValidation.fromAmountValid,
      toAmountValid: amountsValidation.toAmountValid,
      fromOptionsValid,
      toOptionsValid,
      recipientDataValid,
      contactDataValid,
      overallValid,
      errors: {
        fromCurrency: fromCurrencyValidation.error,
        toCurrency: toCurrencyValidation.error,
        fromAmount: amountsValidation.errors.fromAmount,
        toAmount: amountsValidation.errors.toAmount,
        fromOptions: fromCurrencyValidation.error,
        toOptions: toCurrencyValidation.error,
        recipientData: recipientValidation.error,
        contactData: contactValidation.error,
      }
    };
  }

  /**
   * Проверяет только контактные данные (для гостевых пользователей)
   */
  validateContactDataOnly(email?: string, telegram?: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const emailTrimmed = email?.trim() || '';
    const telegramTrimmed = telegram?.trim() || '';

    // Telegram username обязателен
    if (!telegramTrimmed) {
      errors.push('Необходимо указать Telegram username');
    } else if (!this.isValidTelegramUsername(telegramTrimmed)) {
      errors.push('Некорректный формат Telegram username');
    }

    // Email опционален, но если указан - проверяем формат
    if (emailTrimmed && !this.isValidEmail(emailTrimmed)) {
      errors.push('Некорректный формат email');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Проверяет только реквизиты для получения
   */
  validateRecipientDataOnly(
    toCurrency: Currency,
    selectedNetwork?: NetworkOption,
    selectedBank?: BankOption,
    selectedPaymentCurrency?: PaymentCurrencyOption,
    walletAddress?: string,
    cardNumber?: string,
    paymentDetails?: string
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!toCurrency) {
      return { isValid: true, errors, warnings };
    }

    const shouldShowCryptoInput = toCurrency.category === 'crypto' && selectedNetwork;
    const shouldShowRubInput = toCurrency.id === 'rub' && selectedBank && selectedBank.id !== 'cash';
    const shouldShowPaymentInput = toCurrency.category === 'payment' && selectedPaymentCurrency;

    if (shouldShowCryptoInput) {
      if (!walletAddress || walletAddress.trim() === '') {
        errors.push('Не указан адрес кошелька');
      }
    }

    if (shouldShowRubInput) {
      if (!cardNumber || cardNumber.trim() === '') {
        errors.push('Не указан номер карты или телефона');
      }
    }

    if (shouldShowPaymentInput) {
      if (!paymentDetails || paymentDetails.trim() === '') {
        errors.push('Не указаны реквизиты для получения');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

// Экспортируем singleton экземпляр
export const validationService = new ValidationService();
export default validationService;
