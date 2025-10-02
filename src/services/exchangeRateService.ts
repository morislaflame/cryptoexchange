/**
 * Сервис для получения актуальных курсов валют через CoinGecko API
 */

// Маппинг наших ID валют на ID CoinGecko
const CRYPTO_ID_MAP: Record<string, string> = {
  btc: 'bitcoin',
  eth: 'ethereum',
  usdt: 'tether',
  bnb: 'binancecoin',
  ada: 'cardano',
  sol: 'solana',
  xrp: 'ripple',
  dot: 'polkadot',
  doge: 'dogecoin',
  avax: 'avalanche-2',
  ltc: 'litecoin',
  link: 'chainlink',
  bch: 'bitcoin-cash',
  xlm: 'stellar',
  xmr: 'monero',
  ton: 'the-open-network',
};

// Маппинг фиатных валют на ID CoinGecko
const FIAT_CURRENCY_MAP: Record<string, string> = {
  usd: 'usd',
  eur: 'eur',
  rub: 'rub',
  gbp: 'gbp',
  uah: 'uah',
  kzt: 'kzt',
};

interface CoinGeckoSimplePriceResponse {
  [coinId: string]: {
    [currency: string]: number;
  };
}

interface ExchangeRates {
  [fromCurrency: string]: {
    [toCurrency: string]: number;
  };
}

class ExchangeRateService {
  private baseUrl = 'https://api.coingecko.com/api/v3';
  private cache: ExchangeRates = {};
  private lastUpdate: number = 0;
  private cacheDuration = 60000; // 1 минута кэш

  /**
   * Получить курсы всех криптовалют в фиатных валютах
   */
  private async fetchCryptoRates(): Promise<void> {
    try {
      const cryptoIds = Object.values(CRYPTO_ID_MAP).join(',');
      const vsCurrencies = Object.values(FIAT_CURRENCY_MAP).join(',');
      
      const response = await fetch(
        `${this.baseUrl}/simple/price?ids=${cryptoIds}&vs_currencies=${vsCurrencies}`
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data: CoinGeckoSimplePriceResponse = await response.json();

      // Преобразуем данные в наш формат
      for (const [ourCryptoId, coinGeckoId] of Object.entries(CRYPTO_ID_MAP)) {
        if (data[coinGeckoId]) {
          if (!this.cache[ourCryptoId]) {
            this.cache[ourCryptoId] = {};
          }

          for (const [ourFiatId, coinGeckoFiatId] of Object.entries(FIAT_CURRENCY_MAP)) {
            if (data[coinGeckoId][coinGeckoFiatId]) {
              this.cache[ourCryptoId][ourFiatId] = data[coinGeckoId][coinGeckoFiatId];
            }
          }
        }
      }

      // Добавляем обратные курсы (фиат -> крипто)
      for (const [cryptoId, rates] of Object.entries(this.cache)) {
        for (const [fiatId, rate] of Object.entries(rates)) {
          if (!this.cache[fiatId]) {
            this.cache[fiatId] = {};
          }
          this.cache[fiatId][cryptoId] = 1 / rate;
        }
      }

      // Добавляем крипто-крипто курсы через USD
      this.calculateCryptoCrossRates();

      // Добавляем фиат-фиат курсы через USD
      this.calculateFiatCrossRates();

      this.lastUpdate = Date.now();
    } catch (error) {
      console.error('Ошибка при получении курсов:', error);
      throw error;
    }
  }

  /**
   * Вычислить кросс-курсы между криптовалютами через USD
   */
  private calculateCryptoCrossRates(): void {
    const cryptoIds = Object.keys(CRYPTO_ID_MAP);

    for (const crypto1 of cryptoIds) {
      if (!this.cache[crypto1] || !this.cache[crypto1].usd) continue;

      for (const crypto2 of cryptoIds) {
        if (crypto1 === crypto2) {
          this.cache[crypto1][crypto2] = 1;
          continue;
        }

        if (!this.cache[crypto2] || !this.cache[crypto2].usd) continue;

        // Курс crypto1 -> crypto2 через USD
        const rate = this.cache[crypto1].usd / this.cache[crypto2].usd;
        this.cache[crypto1][crypto2] = rate;
      }
    }
  }

  /**
   * Вычислить кросс-курсы между фиатными валютами через USD
   */
  private calculateFiatCrossRates(): void {
    const fiatIds = Object.keys(FIAT_CURRENCY_MAP);

    // Для фиатных валют берем курсы через крипту (например, BTC)
    const baseCrypto = 'btc';
    if (!this.cache[baseCrypto]) return;

    for (const fiat1 of fiatIds) {
      if (!this.cache[baseCrypto][fiat1]) continue;
      
      if (!this.cache[fiat1]) {
        this.cache[fiat1] = {};
      }

      for (const fiat2 of fiatIds) {
        if (fiat1 === fiat2) {
          this.cache[fiat1][fiat2] = 1;
          continue;
        }

        if (!this.cache[baseCrypto][fiat2]) continue;

        // Курс fiat1 -> fiat2
        const rate = this.cache[baseCrypto][fiat2] / this.cache[baseCrypto][fiat1];
        this.cache[fiat1][fiat2] = rate;
      }
    }
  }

  /**
   * Проверить, нужно ли обновить кэш
   */
  private needsUpdate(): boolean {
    return Date.now() - this.lastUpdate > this.cacheDuration;
  }

  /**
   * Получить курс конвертации между двумя валютами
   * @param from ID исходной валюты
   * @param to ID целевой валюты
   * @returns Курс конвертации или null если курс недоступен
   */
  async getExchangeRate(from: string, to: string): Promise<number | null> {
    // Обновляем кэш если нужно
    if (this.needsUpdate() || Object.keys(this.cache).length === 0) {
      try {
        await this.fetchCryptoRates();
      } catch (error) {
        console.error('Не удалось обновить курсы:', error);
        // Если есть старые данные в кэше, используем их
        if (Object.keys(this.cache).length === 0) {
          return null;
        }
      }
    }

    // Одинаковые валюты
    if (from === to) {
      return 1;
    }

    // Ищем прямой курс
    if (this.cache[from] && this.cache[from][to]) {
      return this.cache[from][to];
    }

    // Пытаемся найти обратный курс
    if (this.cache[to] && this.cache[to][from]) {
      return 1 / this.cache[to][from];
    }

    // Если ничего не нашли
    console.warn(`Курс ${from} -> ${to} не найден`);
    return null;
  }

  /**
   * Конвертировать сумму из одной валюты в другую
   * @param amount Сумма для конвертации
   * @param from ID исходной валюты
   * @param to ID целевой валюты
   * @returns Конвертированная сумма или null если курс недоступен
   */
  async convert(amount: number, from: string, to: string): Promise<number | null> {
    const rate = await this.getExchangeRate(from, to);
    if (rate === null) {
      return null;
    }
    return amount * rate;
  }

  /**
   * Получить все курсы для валюты
   * @param currencyId ID валюты
   * @returns Объект с курсами или null
   */
  async getAllRatesFor(currencyId: string): Promise<Record<string, number> | null> {
    if (this.needsUpdate() || Object.keys(this.cache).length === 0) {
      try {
        await this.fetchCryptoRates();
      } catch (error) {
        console.error('Не удалось обновить курсы:', error);
        return null;
      }
    }

    return this.cache[currencyId] || null;
  }

  /**
   * Очистить кэш (полезно для принудительного обновления)
   */
  clearCache(): void {
    this.cache = {};
    this.lastUpdate = 0;
  }

  /**
   * Получить время последнего обновления
   */
  getLastUpdateTime(): Date | null {
    if (this.lastUpdate === 0) {
      return null;
    }
    return new Date(this.lastUpdate);
  }
}

// Экспортируем единственный экземпляр (синглтон)
export const exchangeRateService = new ExchangeRateService();

// Экспортируем класс для тестирования
export default ExchangeRateService;

