export interface Currency {
  id: string;
  name: string;
  symbol: string;
  category: 'fiat' | 'crypto' | 'payment';
  icon?: React.ReactNode | string; // Может быть компонент React или путь к изображению
}

export const mockCurrencies: Currency[] = [
  // Фиатные валюты
  { id: 'usd', name: 'Доллар США', symbol: 'USD', category: 'fiat', icon: '🇺🇸' },
  { id: 'eur', name: 'Евро', symbol: 'EUR', category: 'fiat', icon: '🇪🇺' },
  { id: 'rub', name: 'Российский рубль', symbol: 'RUB', category: 'fiat', icon: '🇷🇺' },
  { id: 'gbp', name: 'Британский фунт', symbol: 'GBP', category: 'fiat', icon: '🇬🇧' },
  { id: 'jpy', name: 'Японская йена', symbol: 'JPY', category: 'fiat', icon: '🇯🇵' },
  { id: 'cad', name: 'Канадский доллар', symbol: 'CAD', category: 'fiat', icon: '🇨🇦' },
  { id: 'aud', name: 'Австралийский доллар', symbol: 'AUD', category: 'fiat', icon: '🇦🇺' },
  { id: 'chf', name: 'Швейцарский франк', symbol: 'CHF', category: 'fiat', icon: '🇨🇭' },
  
  // Криптовалюты  
  { id: 'btc', name: 'Bitcoin', symbol: 'BTC', category: 'crypto', icon: '₿' },
  { id: 'eth', name: 'Ethereum', symbol: 'ETH', category: 'crypto', icon: 'Ξ' },
  { id: 'usdt', name: 'Tether', symbol: 'USDT', category: 'crypto', icon: '₮' },
  { id: 'bnb', name: 'Binance Coin', symbol: 'BNB', category: 'crypto', icon: '🔶' },
  { id: 'ada', name: 'Cardano', symbol: 'ADA', category: 'crypto', icon: '◈' },
  { id: 'sol', name: 'Solana', symbol: 'SOL', category: 'crypto', icon: '◎' },
  { id: 'xrp', name: 'Ripple', symbol: 'XRP', category: 'crypto', icon: '◉' },
  { id: 'dot', name: 'Polkadot', symbol: 'DOT', category: 'crypto', icon: '●' },
  { id: 'link', name: 'Chainlink', symbol: 'LINK', category: 'crypto', icon: '🔗' },
  { id: 'avax', name: 'Avalanche', symbol: 'AVAX', category: 'crypto', icon: '🔺' },
  
  // Платежные системы
  { id: 'paypal', name: 'PayPal', symbol: 'PayPal', category: 'payment', icon: '💙' },
  { id: 'skrill', name: 'Skrill', symbol: 'Skrill', category: 'payment', icon: '🟣' },
  { id: 'neteller', name: 'Neteller', symbol: 'Neteller', category: 'payment', icon: '🟢' },
  { id: 'webmoney', name: 'WebMoney', symbol: 'WMZ', category: 'payment', icon: '🟡' },
  { id: 'perfectmoney', name: 'Perfect Money', symbol: 'PM', category: 'payment', icon: '🔴' },
  { id: 'payeer', name: 'Payeer', symbol: 'Payeer', category: 'payment', icon: '🟠' },
  { id: 'advcash', name: 'AdvCash', symbol: 'ADV', category: 'payment', icon: '⚪' },
  { id: 'qiwi', name: 'QIWI', symbol: 'QIWI', category: 'payment', icon: '🟤' },
];

export const categoryLabels = {
  fiat: 'Фиат',
  crypto: 'Крипто',
  payment: 'Плат. система'
};
