// Импорт иконок банков
import sberIcon from '../assets/sber.png';
import tinkoffIcon from '../assets/tbank.png';
import vtbIcon from '../assets/vtb.png';
import alfaIcon from '../assets/alfa.png';
import raiffIcon from '../assets/raiff.png';
import gazpromIcon from '../assets/gazprom.png';
import rosbankIcon from '../assets/rosbank.png';
import mkbIcon from '../assets/mkb.png';
import otkritieIcon from '../assets/otkritie.png';
import ozonIcon from '../assets/ozon.png';
import psbIcon from '../assets/psb.png';
import sinaraIcon from '../assets/sinara.png';
import sovkomIcon from '../assets/sovkom.png';

// Импорт иконок платежных систем
import paypalIcon from '../assets/paypal.png';
import qiwiIcon from '../assets/qiwi.png';
import webmoneyIcon from '../assets/webmoney.png';
import yoomoneyIcon from '../assets/yoomoney.png';
import yandexIcon from '../assets/yandex.png';
import skrillIcon from '../assets/skrill.png';
import netellerIcon from '../assets/neteller.png';
import payeerIcon from '../assets/payeer.png';
import perfectmoneyIcon from '../assets/perfectmoney.png';
import advcashIcon from '../assets/advcash (1).png';

// Импорт иконок криптовалют
import btcIcon from '../assets/btc.png';
import ethIcon from '../assets/eth.png';
import usdtIcon from '../assets/usdt.png';
import bnbIcon from '../assets/bnb.png';
import adaIcon from '../assets/ada.png';
import solIcon from '../assets/sol.png';
import xrpIcon from '../assets/xrp.png';
import dotIcon from '../assets/dot.png';
import dogeIcon from '../assets/doge.png';
import avaxIcon from '../assets/avax.png';
import ltcIcon from '../assets/ltc.png';
import linkIcon from '../assets/link.png';
import bchIcon from '../assets/bch.png';
import xlmIcon from '../assets/xlm.png';
import xmrIcon from '../assets/xmr.png';
import tonIcon from '../assets/ton.png';
import trxIcon from '../assets/trx.png';
import usdcIcon from '../assets/usdc.png';
import usdeIcon from '../assets/usde.png';
import shibIcon from '../assets/shib.png';

// Экспорт иконок банков
export const bankIcons = {
  sberbank: sberIcon,
  tinkoff: tinkoffIcon,
  vtb: vtbIcon,
  alfabank: alfaIcon,
  raiffeisenbank: raiffIcon,
  gazprombank: gazpromIcon,
  rosbank: rosbankIcon,
  mkb: mkbIcon,
  otkritie: otkritieIcon,
  ozonbank: ozonIcon,
  psb: psbIcon,
  sinara: sinaraIcon,
  sovkombank: sovkomIcon,
};

// Экспорт иконок платежных систем
export const paymentIcons = {
  paypal: paypalIcon,
  qiwi: qiwiIcon,
  webmoney: webmoneyIcon,
  yoomoney: yoomoneyIcon,
  yandexpay: yandexIcon,
  skrill: skrillIcon,
  neteller: netellerIcon,
  payeer: payeerIcon,
  perfectmoney: perfectmoneyIcon,
  advcash: advcashIcon,
};

// Экспорт иконок криптовалют
export const cryptoIcons = {
  btc: btcIcon,
  eth: ethIcon,
  usdt: usdtIcon,
  bnb: bnbIcon,
  ada: adaIcon,
  sol: solIcon,
  xrp: xrpIcon,
  dot: dotIcon,
  doge: dogeIcon,
  avax: avaxIcon,
  ltc: ltcIcon,
  link: linkIcon,
  bch: bchIcon,
  xlm: xlmIcon,
  xmr: xmrIcon,
  ton: tonIcon,
  trx: trxIcon,
  usdc: usdcIcon,
  usde: usdeIcon,
  shib: shibIcon,
};

// Универсальная функция для получения иконки
export const getBankIcon = (bankId: string): string | undefined => {
  return bankIcons[bankId as keyof typeof bankIcons];
};

export const getPaymentIcon = (paymentId: string): string | undefined => {
  return paymentIcons[paymentId as keyof typeof paymentIcons];
};

export const getCryptoIcon = (cryptoId: string): string | undefined => {
  return cryptoIcons[cryptoId as keyof typeof cryptoIcons];
};

