// Импорт иконок банков
import sberIcon from './sber.png';
import tinkoffIcon from './tbank.png';
import vtbIcon from './vtb.png';
import alfaIcon from './alfa.png';
import raiffIcon from './raiff.png';
import gazpromIcon from './gazprom.png';
import rosbankIcon from './rosbank.png';
import mkbIcon from './mkb.png';
import otkritieIcon from './otkritie.png';
import ozonIcon from './ozon.png';
import psbIcon from './psb.png';
import sinaraIcon from './sinara.png';
import sovkomIcon from './sovkom.png';

// Импорт иконок платежных систем
import paypalIcon from './paypal.png';
import qiwiIcon from './qiwi.png';
import webmoneyIcon from './webmoney.png';
import yoomoneyIcon from './yoomoney.png';
import yandexIcon from './yandex.png';
import skrillIcon from './skrill.png';
import netellerIcon from './neteller.png';
import payeerIcon from './payeer.png';
import perfectmoneyIcon from './perfectmoney.png';
import advcashIcon from './advcash (1).png';

// Импорт иконок криптовалют
import btcIcon from './btc.png';
import ethIcon from './eth.png';
import usdtIcon from './usdt.png';
import bnbIcon from './bnb.png';
import adaIcon from './ada.png';
import solIcon from './sol.png';
import xrpIcon from './xrp.png';
import dotIcon from './dot.png';
import dogeIcon from './doge.png';
import avaxIcon from './avax.png';
import ltcIcon from './ltc.png';
import linkIcon from './link.png';
import bchIcon from './bch.png';
import xlmIcon from './xlm.png';
import xmrIcon from './xmr.png';
import tonIcon from './ton.png';
import trxIcon from './trx.png';
import usdcIcon from './usdc.png';
import usdeIcon from './usde.png';
import shibIcon from './shib.png';

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

