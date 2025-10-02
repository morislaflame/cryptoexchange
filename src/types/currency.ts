export interface BankOption {
  id: string;
  name: string;
  icon?: string;
}

export interface NetworkOption {
  id: string;
  name: string;
  icon?: string;
}

export interface PaymentCurrencyOption {
  id: string;
  name: string;
  icon?: string;
}

export interface Currency {
  id: string;
  name: string;
  symbol: string;
  category: 'fiat' | 'crypto' | 'payment';
  icon?: React.ReactNode | string; // Может быть компонент React или путь к изображению
  banks?: BankOption[]; // Доступные банки для фиатных валют
  networks?: NetworkOption[]; // Доступные сети для криптовалют
  paymentCurrencies?: PaymentCurrencyOption[]; // Доступные валюты для платежных систем
}

export const mockCurrencies: Currency[] = [
  // Фиатные валюты
  { id: 'usd', name: 'Доллар США (Наличные)', symbol: 'USD', category: 'fiat', icon: '🇺🇸' },
  { id: 'eur', name: 'Евро (Наличные)', symbol: 'EUR', category: 'fiat', icon: '🇪🇺' },
  { 
    id: 'rub', 
    name: 'Российский рубль', 
    symbol: 'RUB', 
    category: 'fiat', 
    icon: '🇷🇺',
    banks: [
      { id: 'sberbank', name: 'Сбербанк', icon: '🟢' },
      { id: 'tinkoff', name: 'Тинькофф', icon: '🟡' },
      { id: 'vtb', name: 'ВТБ', icon: '🔵' },
      { id: 'alfabank', name: 'Альфа-Банк', icon: '🔴' },
      { id: 'raiffeisenbank', name: 'Райффайзенбанк', icon: '🟠' },
      { id: 'gazprombank', name: 'Газпромбанк', icon: '⚫' },
      { id: 'rosbank', name: 'Росбанк', icon: '🟣' },
    ]
  },
  
  // Криптовалюты  
  { 
    id: 'btc', 
    name: 'Bitcoin', 
    symbol: 'BTC', 
    category: 'crypto', 
    icon: '₿',
    networks: [
      { id: 'bitcoin', name: 'Bitcoin', icon: '₿' },
      { id: 'lightning', name: 'Lightning Network', icon: '⚡' },
    ]
  },
  { 
    id: 'bch', 
    name: 'Bitcoin Cash', 
    symbol: 'BCH', 
    category: 'crypto', 
    icon: '₿',
    networks: [
      { id: 'bch', name: 'Bitcoin Cash', icon: '₿' },
    ]
  },
  { 
    id: 'eth', 
    name: 'Ethereum', 
    symbol: 'ETH', 
    category: 'crypto', 
    icon: 'Ξ',
    networks: [
      { id: 'erc20', name: 'ERC20', icon: 'Ξ' },
      { id: 'arbitrum', name: 'Arbitrum', icon: '🔷' },
      { id: 'optimism', name: 'Optimism', icon: '🔴' },
    ]
  },
  { 
    id: 'usdt', 
    name: 'Tether', 
    symbol: 'USDT', 
    category: 'crypto', 
    icon: '₮',
    networks: [
      { id: 'trc20', name: 'TRC20', icon: '🟢' },
      { id: 'erc20', name: 'ERC20', icon: 'Ξ' },
      { id: 'bep20', name: 'BEP20', icon: '🟡' },
      { id: 'polygon', name: 'Polygon', icon: '🟣' },
    ]
  },
  { 
    id: 'bnb', 
    name: 'Binance Coin', 
    symbol: 'BNB', 
    category: 'crypto', 
    icon: '🔶',
    networks: [
      { id: 'bep20', name: 'BEP20 (BSC)', icon: '🟡' },
      { id: 'bep2', name: 'BEP2 (Binance Chain)', icon: '🟠' },
    ]
  },
  { 
    id: 'ada', 
    name: 'Cardano', 
    symbol: 'ADA', 
    category: 'crypto', 
    icon: '◈',
    networks: [
      { id: 'cardano', name: 'Cardano', icon: '◈' },
    ]
  },
  { 
    id: 'sol', 
    name: 'Solana', 
    symbol: 'SOL', 
    category: 'crypto', 
    icon: '◎',
    networks: [
      { id: 'solana', name: 'Solana', icon: '◎' },
    ]
  },
  { 
    id: 'xrp', 
    name: 'Ripple', 
    symbol: 'XRP', 
    category: 'crypto', 
    icon: '◉',
    networks: [
      { id: 'ripple', name: 'Ripple', icon: '◉' },
    ]
  },
  { 
    id: 'dot', 
    name: 'Polkadot', 
    symbol: 'DOT', 
    category: 'crypto', 
    icon: '●',
    networks: [
      { id: 'polkadot', name: 'Polkadot', icon: '●' },
    ]
  },
  { 
    id: 'link', 
    name: 'Chainlink', 
    symbol: 'LINK', 
    category: 'crypto', 
    icon: '🔗',
    networks: [
      { id: 'erc20', name: 'ERC20', icon: 'Ξ' },
      { id: 'bep20', name: 'BEP20', icon: '🟡' },
    ]
  },
  { 
    id: 'avax', 
    name: 'Avalanche', 
    symbol: 'AVAX', 
    category: 'crypto', 
    icon: '🔺',
    networks: [
      { id: 'avalanche-c', name: 'Avalanche C-Chain', icon: '🔺' },
      { id: 'avalanche-x', name: 'Avalanche X-Chain', icon: '🔻' },
    ]
  },
  { 
    id: 'ltc', 
    name: 'Litecoin', 
    symbol: 'LTC', 
    category: 'crypto', 
    icon: 'Ł',
    networks: [
      { id: 'litecoin', name: 'Litecoin', icon: 'Ł' },
    ]
  },
  { 
    id: 'doge', 
    name: 'Dogecoin', 
    symbol: 'DOGE', 
    category: 'crypto', 
    icon: '🐶',
    networks: [
      { id: 'dogecoin', name: 'Dogecoin', icon: '🐶' },
    ]
  },
  { 
    id: 'xlm', 
    name: 'Stellar', 
    symbol: 'XLM', 
    category: 'crypto', 
    icon: 'Ş',
    networks: [
      { id: 'stellar', name: 'Stellar', icon: 'Ş' },
    ]
  },
  { 
    id: 'xmr', 
    name: 'Monero', 
    symbol: 'XMR', 
    category: 'crypto', 
    icon: '⛏',
    networks: [
      { id: 'monero', name: 'Monero', icon: '⛏' },
    ]
  },
  { 
    id: 'ton', 
    name: 'TON', 
    symbol: 'TON', 
    category: 'crypto', 
    icon: '🔹',
    networks: [
      { id: 'ton', name: 'TON', icon: '🔹' },
    ]
  },
  
  // Платежные системы
  { 
    id: 'paypal', 
    name: 'PayPal', 
    symbol: 'PayPal', 
    category: 'payment', 
    icon: '💙',
    paymentCurrencies: [
      { id: 'usd', name: 'USD', icon: '🇺🇸' },
      { id: 'eur', name: 'EUR', icon: '🇪🇺' },
      { id: 'gbp', name: 'GBP', icon: '🇬🇧' },
      { id: 'rub', name: 'RUB', icon: '🇷🇺' },
    ]
  },
  { 
    id: 'skrill', 
    name: 'Skrill', 
    symbol: 'Skrill', 
    category: 'payment', 
    icon: '🟣',
    paymentCurrencies: [
      { id: 'usd', name: 'USD', icon: '🇺🇸' },
      { id: 'eur', name: 'EUR', icon: '🇪🇺' },
      { id: 'gbp', name: 'GBP', icon: '🇬🇧' },
    ]
  },
  { 
    id: 'neteller', 
    name: 'Neteller', 
    symbol: 'Neteller', 
    category: 'payment', 
    icon: '🟢',
    paymentCurrencies: [
      { id: 'usd', name: 'USD', icon: '🇺🇸' },
      { id: 'eur', name: 'EUR', icon: '🇪🇺' },
      { id: 'gbp', name: 'GBP', icon: '🇬🇧' },
    ]
  },
  { 
    id: 'webmoney', 
    name: 'WebMoney', 
    symbol: 'WMZ', 
    category: 'payment', 
    icon: '🟡',
    paymentCurrencies: [
      { id: 'wmz', name: 'WMZ (USD)', icon: '💵' },
      { id: 'wme', name: 'WME (EUR)', icon: '💶' },
      { id: 'wmr', name: 'WMR (RUB)', icon: '🇷🇺' },
    ]
  },
  { 
    id: 'perfectmoney', 
    name: 'Perfect Money', 
    symbol: 'PM', 
    category: 'payment', 
    icon: '🔴',
    paymentCurrencies: [
      { id: 'usd', name: 'USD', icon: '🇺🇸' },
      { id: 'eur', name: 'EUR', icon: '🇪🇺' },
    ]
  },
  { 
    id: 'yoomoney', 
    name: 'Yoomoney', 
    symbol: 'Yoomoney', 
    category: 'payment', 
    icon: '🟠',
    paymentCurrencies: [
      { id: 'rub', name: 'RUB', icon: '🇷🇺' },
    ]
  },
  { 
    id: 'payeer', 
    name: 'Payeer', 
    symbol: 'Payeer', 
    category: 'payment', 
    icon: '🟠',
    paymentCurrencies: [
      { id: 'usd', name: 'USD', icon: '🇺🇸' },
      { id: 'eur', name: 'EUR', icon: '🇪🇺' },
      { id: 'rub', name: 'RUB', icon: '🇷🇺' },
    ]
  },
  { 
    id: 'advcash', 
    name: 'AdvCash', 
    symbol: 'ADV', 
    category: 'payment', 
    icon: '⚪',
    paymentCurrencies: [
      { id: 'usd', name: 'USD', icon: '🇺🇸' },
      { id: 'eur', name: 'EUR', icon: '🇪🇺' },
      { id: 'rub', name: 'RUB', icon: '🇷🇺' },
      { id: 'uah', name: 'UAH', icon: '🇺🇦' },
    ]
  },
  { 
    id: 'qiwi', 
    name: 'QIWI', 
    symbol: 'QIWI', 
    category: 'payment', 
    icon: '🟤',
    paymentCurrencies: [
      { id: 'rub', name: 'RUB', icon: '🇷🇺' },
      { id: 'kzt', name: 'KZT', icon: '🇰🇿' },
    ]
  },
];

export const categoryLabels = {
  fiat: 'Фиат',
  crypto: 'Крипто',
  payment: 'Плат. система'
};
