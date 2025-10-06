import React, { useRef, useEffect, useCallback, useState } from 'react';
import { gsap } from 'gsap';
import { CiRepeat } from 'react-icons/ci';
import CurrencyCard from '../MainPageComponents/CurrencyCard';
import ConversionSummary from '../MainPageComponents/ConversionSummary';
import ExchangeRateInfo from '../ExchangeRateInfo';
import type { Currency, BankOption, NetworkOption, PaymentCurrencyOption } from '../../types/currency';
import { convertCurrency } from '../../types/exchangeRates';
import { useStore } from '../../store/StoreProvider';
import './MagicBento.css';

export interface BentoCardProps {
  color?: string;
  title?: string;
  description?: string;
  label?: string;
  textAutoHide?: boolean;
  disableAnimations?: boolean;
}

export interface BentoProps {
  textAutoHide?: boolean;
  enableStars?: boolean;
  enableSpotlight?: boolean;
  enableBorderGlow?: boolean;
  disableAnimations?: boolean;
  spotlightRadius?: number;
  particleCount?: number;
  enableTilt?: boolean;
  glowColor?: string;
  clickEffect?: boolean;
  enableMagnetism?: boolean;
}

const DEFAULT_PARTICLE_COUNT = 12;
const DEFAULT_SPOTLIGHT_RADIUS = 300;
const DEFAULT_GLOW_COLOR = '132, 0, 255';
const MOBILE_BREAKPOINT = 768;

const cardData: BentoCardProps[] = [
  {
    color: '#060010',
    title: 'Меняю',
    description: 'Продвинутые инструменты для трейдинга с низкими комиссиями и высокой ликвидностью',
    label: 'Отдаете'
  },
  {
    color: '#060010',
    title: 'На',
    description: 'Многоуровневая защита активов с холодным хранением и страхованием средств',
    label: 'Получаете'
  },
  {
    color: '#060010',
    title: 'Сумма',
    description: 'Расширенные графики, технические индикаторы и алгоритмические торговые сигналы',
    label: 'Обмен'
  }
];

const createParticleElement = (x: number, y: number, color: string = DEFAULT_GLOW_COLOR): HTMLDivElement => {
  const el = document.createElement('div');
  el.className = 'particle';
  el.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(${color}, 1);
    box-shadow: 0 0 6px rgba(${color}, 0.6);
    pointer-events: none;
    z-index: 100;
    left: ${x}px;
    top: ${y}px;
  `;
  return el;
};

const calculateSpotlightValues = (radius: number) => ({
  proximity: radius * 0.5,
  fadeDistance: radius * 0.75
});

const updateCardGlowProperties = (card: HTMLElement, mouseX: number, mouseY: number, glow: number, radius: number) => {
  const rect = card.getBoundingClientRect();
  const relativeX = ((mouseX - rect.left) / rect.width) * 100;
  const relativeY = ((mouseY - rect.top) / rect.height) * 100;

  card.style.setProperty('--glow-x', `${relativeX}%`);
  card.style.setProperty('--glow-y', `${relativeY}%`);
  card.style.setProperty('--glow-intensity', glow.toString());
  card.style.setProperty('--glow-radius', `${radius}px`);
};

const ParticleCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  disableAnimations?: boolean;
  style?: React.CSSProperties;
  particleCount?: number;
  glowColor?: string;
  enableTilt?: boolean;
  clickEffect?: boolean;
  enableMagnetism?: boolean;
}> = ({
  children,
  className = '',
  disableAnimations = false,
  style,
  particleCount = DEFAULT_PARTICLE_COUNT,
  glowColor = DEFAULT_GLOW_COLOR,
  enableTilt = true,
  clickEffect = false,
  enableMagnetism = false
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement[]>([]);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const isHoveredRef = useRef(false);
  const memoizedParticles = useRef<HTMLDivElement[]>([]);
  const particlesInitialized = useRef(false);
  const magnetismAnimationRef = useRef<gsap.core.Tween | null>(null);

  const initializeParticles = useCallback(() => {
    if (particlesInitialized.current || !cardRef.current) return;

    const { width, height } = cardRef.current.getBoundingClientRect();
    memoizedParticles.current = Array.from({ length: particleCount }, () =>
      createParticleElement(Math.random() * width, Math.random() * height, glowColor)
    );
    particlesInitialized.current = true;
  }, [particleCount, glowColor]);

  const clearAllParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    magnetismAnimationRef.current?.kill();

    particlesRef.current.forEach(particle => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'back.in(1.7)',
        onComplete: () => {
          particle.parentNode?.removeChild(particle);
        }
      });
    });
    particlesRef.current = [];
  }, []);

  const animateParticles = useCallback(() => {
    if (!cardRef.current || !isHoveredRef.current) return;

    if (!particlesInitialized.current) {
      initializeParticles();
    }

    memoizedParticles.current.forEach((particle, index) => {
      const timeoutId = setTimeout(() => {
        if (!isHoveredRef.current || !cardRef.current) return;

        const clone = particle.cloneNode(true) as HTMLDivElement;
        cardRef.current.appendChild(clone);
        particlesRef.current.push(clone);

        gsap.fromTo(clone, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' });

        gsap.to(clone, {
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100,
          rotation: Math.random() * 360,
          duration: 2 + Math.random() * 2,
          ease: 'none',
          repeat: -1,
          yoyo: true
        });

        gsap.to(clone, {
          opacity: 0.3,
          duration: 1.5,
          ease: 'power2.inOut',
          repeat: -1,
          yoyo: true
        });
      }, index * 100);

      timeoutsRef.current.push(timeoutId);
    });
  }, [initializeParticles]);

  useEffect(() => {
    if (disableAnimations || !cardRef.current) return;

    const element = cardRef.current;

    const handleMouseEnter = () => {
      isHoveredRef.current = true;
      animateParticles();

      if (enableTilt) {
        gsap.to(element, {
          rotateX: 5,
          rotateY: 5,
          duration: 0.3,
          ease: 'power2.out',
          transformPerspective: 1000
        });
      }
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
      clearAllParticles();

      if (enableTilt) {
        gsap.to(element, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      }

      if (enableMagnetism) {
        gsap.to(element, {
          x: 0,
          y: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!enableTilt && !enableMagnetism) return;

      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      if (enableTilt) {
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        gsap.to(element, {
          rotateX,
          rotateY,
          duration: 0.1,
          ease: 'power2.out',
          transformPerspective: 1000
        });
      }

      if (enableMagnetism) {
        const magnetX = (x - centerX) * 0.01;
        const magnetY = (y - centerY) * 0.01;

        magnetismAnimationRef.current = gsap.to(element, {
          x: magnetX,
          y: magnetY,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (!clickEffect) return;

      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const maxDistance = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height)
      );

      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position: absolute;
        width: ${maxDistance * 2}px;
        height: ${maxDistance * 2}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);
        left: ${x - maxDistance}px;
        top: ${y - maxDistance}px;
        pointer-events: none;
        z-index: 1000;
      `;

      element.appendChild(ripple);

      gsap.fromTo(
        ripple,
        {
          scale: 0,
          opacity: 1
        },
        {
          scale: 1,
          opacity: 0,
          duration: 0.8,
          ease: 'power2.out',
          onComplete: () => ripple.remove()
        }
      );
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('click', handleClick);

    return () => {
      isHoveredRef.current = false;
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('click', handleClick);
      clearAllParticles();
    };
  }, [animateParticles, clearAllParticles, disableAnimations, enableTilt, enableMagnetism, clickEffect, glowColor]);

  return (
    <div
      ref={cardRef}
      className={`${className} particle-container`}
      style={{ ...style, position: 'relative', overflow: 'hidden' }}
    >
      {children}
    </div>
  );
};

const GlobalSpotlight: React.FC<{
  gridRef: React.RefObject<HTMLDivElement | null>;
  disableAnimations?: boolean;
  enabled?: boolean;
  spotlightRadius?: number;
  glowColor?: string;
}> = ({
  gridRef,
  disableAnimations = false,
  enabled = true,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  glowColor = DEFAULT_GLOW_COLOR
}) => {
  const spotlightRef = useRef<HTMLDivElement | null>(null);
  const isInsideSection = useRef(false);

  useEffect(() => {
    if (disableAnimations || !gridRef?.current || !enabled) return;

    const spotlight = document.createElement('div');
    spotlight.className = 'global-spotlight';
    spotlight.style.cssText = `
      position: fixed;
      width: 800px;
      height: 800px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle,
        rgba(${glowColor}, 0.15) 0%,
        rgba(${glowColor}, 0.08) 15%,
        rgba(${glowColor}, 0.04) 25%,
        rgba(${glowColor}, 0.02) 40%,
        rgba(${glowColor}, 0.01) 65%,
        transparent 70%
      );
      z-index: 200;
      opacity: 0;
      transform: translate(-50%, -50%);
      mix-blend-mode: screen;
    `;
    document.body.appendChild(spotlight);
    spotlightRef.current = spotlight;

    const handleMouseMove = (e: MouseEvent) => {
      if (!spotlightRef.current || !gridRef.current) return;

      const section = gridRef.current.closest('.bento-section');
      const rect = section?.getBoundingClientRect();
      const mouseInside =
        rect && e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;

      isInsideSection.current = mouseInside || false;
      const cards = gridRef.current.querySelectorAll('.card');

      if (!mouseInside) {
        gsap.to(spotlightRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
        cards.forEach(card => {
          (card as HTMLElement).style.setProperty('--glow-intensity', '0');
        });
        return;
      }

      const { proximity, fadeDistance } = calculateSpotlightValues(spotlightRadius);
      let minDistance = Infinity;

      cards.forEach(card => {
        const cardElement = card as HTMLElement;
        const cardRect = cardElement.getBoundingClientRect();
        const centerX = cardRect.left + cardRect.width / 2;
        const centerY = cardRect.top + cardRect.height / 2;
        const distance =
          Math.hypot(e.clientX - centerX, e.clientY - centerY) - Math.max(cardRect.width, cardRect.height) / 2;
        const effectiveDistance = Math.max(0, distance);

        minDistance = Math.min(minDistance, effectiveDistance);

        let glowIntensity = 0;
        if (effectiveDistance <= proximity) {
          glowIntensity = 1;
        } else if (effectiveDistance <= fadeDistance) {
          glowIntensity = (fadeDistance - effectiveDistance) / (fadeDistance - proximity);
        }

        updateCardGlowProperties(cardElement, e.clientX, e.clientY, glowIntensity, spotlightRadius);
      });

      gsap.to(spotlightRef.current, {
        left: e.clientX,
        top: e.clientY,
        duration: 0.1,
        ease: 'power2.out'
      });

      const targetOpacity =
        minDistance <= proximity
          ? 0.8
          : minDistance <= fadeDistance
            ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.8
            : 0;

      gsap.to(spotlightRef.current, {
        opacity: targetOpacity,
        duration: targetOpacity > 0 ? 0.2 : 0.5,
        ease: 'power2.out'
      });
    };

    const handleMouseLeave = () => {
      isInsideSection.current = false;
      gridRef.current?.querySelectorAll('.card').forEach(card => {
        (card as HTMLElement).style.setProperty('--glow-intensity', '0');
      });
      if (spotlightRef.current) {
        gsap.to(spotlightRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      spotlightRef.current?.parentNode?.removeChild(spotlightRef.current);
    };
  }, [gridRef, disableAnimations, enabled, spotlightRadius, glowColor]);

  return null;
};

const BentoCardGrid: React.FC<{
  children: React.ReactNode;
  gridRef?: React.RefObject<HTMLDivElement | null>;
}> = ({ children, gridRef }) => (
  <div className="card-grid bento-section gap-2" ref={gridRef}>
    {children}
  </div>
);

const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

const MagicBento: React.FC<BentoProps> = ({
  textAutoHide = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  disableAnimations = false,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  particleCount = DEFAULT_PARTICLE_COUNT,
  enableTilt = false,
  glowColor = DEFAULT_GLOW_COLOR,
  clickEffect = true,
  enableMagnetism = true
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const isMobile = useMobileDetection();
  const shouldDisableAnimations = disableAnimations || isMobile;
  const { exchangeRates } = useStore();

  // Константы
  const SERVICE_FEE_PERCENT = 3; // Комиссия сервиса 3%

  // Расширенное состояние для обеих карточек
  interface CardState {
    amount: string;
    currency?: Currency;
    searchTerm: string;
    activeFilter: 'all' | 'fiat' | 'crypto' | 'payment';
    bank?: BankOption;
    network?: NetworkOption;
    paymentCurrency?: PaymentCurrencyOption;
  }

  const [fromData, setFromData] = useState<CardState>({ 
    amount: '', 
    searchTerm: '', 
    activeFilter: 'all' 
  });
  const [toData, setToData] = useState<CardState>({ 
    amount: '', 
    searchTerm: '', 
    activeFilter: 'all' 
  });

  // Дополнительное состояние для отображения комиссии
  const [toAmountWithoutFee, setToAmountWithoutFee] = useState<string>('');
  const [feeAmount, setFeeAmount] = useState<string>('');

  // Обработчики для первой карточки (fromData)
  const handleFromAmountChange = (amount: string) => {
    setFromData(prev => ({ ...prev, amount }));
  };

  const handleFromCurrencySelect = (currency: Currency | undefined) => {
    setFromData(prev => ({ ...prev, currency }));
  };

  const handleFromSearchChange = (searchTerm: string) => {
    setFromData(prev => ({ ...prev, searchTerm }));
  };

  const handleFromFilterChange = (activeFilter: 'all' | 'fiat' | 'crypto' | 'payment') => {
    setFromData(prev => ({ ...prev, activeFilter }));
  };

  const handleFromBankSelect = (bank: BankOption) => {
    setFromData(prev => ({ ...prev, bank }));
  };

  const handleFromNetworkSelect = (network: NetworkOption) => {
    setFromData(prev => ({ ...prev, network }));
  };

  const handleFromPaymentCurrencySelect = (paymentCurrency: PaymentCurrencyOption) => {
    setFromData(prev => ({ ...prev, paymentCurrency }));
  };

  // Обработчики для второй карточки (toData) - только для отображения
  const handleToAmountChange = () => {
    // Не позволяем изменять сумму во второй карточке - она вычисляется автоматически
    // setToData(prev => ({ ...prev, amount }));
  };

  const handleToCurrencySelect = (currency: Currency | undefined) => {
    setToData(prev => ({ ...prev, currency }));
  };

  const handleToSearchChange = (searchTerm: string) => {
    setToData(prev => ({ ...prev, searchTerm }));
  };

  const handleToFilterChange = (activeFilter: 'all' | 'fiat' | 'crypto' | 'payment') => {
    setToData(prev => ({ ...prev, activeFilter }));
  };

  const handleToBankSelect = (bank: BankOption) => {
    setToData(prev => ({ ...prev, bank }));
  };

  const handleToNetworkSelect = (network: NetworkOption) => {
    setToData(prev => ({ ...prev, network }));
  };

  const handleToPaymentCurrencySelect = (paymentCurrency: PaymentCurrencyOption) => {
    setToData(prev => ({ ...prev, paymentCurrency }));
  };

  const handleSwapCurrencies = () => {
    const tempData = { ...fromData };
    setFromData({ ...toData });
    setToData({ ...tempData });
  };

  /**
   * Получить ID валюты для конвертации
   * Для платежных систем используется ID выбранной валюты внутри ПС
   */
  const getCurrencyIdForConversion = (
    currency: Currency | undefined,
    paymentCurrency?: PaymentCurrencyOption
  ): string | null => {
    if (!currency) return null;

    // Для платежных систем используем выбранную валюту внутри ПС
    if (currency.category === 'payment') {
      return paymentCurrency?.id || null;
    }

    // Для остальных (фиат, крипто) используем ID валюты напрямую
    return currency.id;
  };

  const handleCreateOrder = () => {
    // Здесь будет логика создания заявки
    console.log('Создание заявки:', {
      from: {
        currency: fromData.currency,
        amount: fromData.amount,
        bankName: fromData.bank?.name,
        networkName: fromData.network?.name,
        paymentCurrencyName: fromData.paymentCurrency?.name
      },
      to: {
        currency: toData.currency,
        amount: toData.amount,
        bankName: toData.bank?.name,
        networkName: toData.network?.name,
        paymentCurrencyName: toData.paymentCurrency?.name
      }
    });
  };

  // Автоматическая конвертация при изменении суммы или валюты в первой карточке
  useEffect(() => {
    let isActive = true; // Флаг для предотвращения race conditions

    const performConversion = async () => {
      if (fromData.amount && fromData.currency && toData.currency) {
        // Получаем ID валют для конвертации с учетом платежных систем
        const fromCurrencyId = getCurrencyIdForConversion(fromData.currency, fromData.paymentCurrency);
        const toCurrencyId = getCurrencyIdForConversion(toData.currency, toData.paymentCurrency);

        // Если для платежной системы не выбрана валюта, не выполняем конвертацию
        if (!fromCurrencyId || !toCurrencyId) {
          if (isActive) {
            setToData(prev => ({ ...prev, amount: '' }));
          }
          return;
        }

        const amount = parseFloat(fromData.amount);
        if (!isNaN(amount) && amount > 0) {
          try {
            // Пытаемся получить реальный курс через стор
            const convertedAmount = await exchangeRates.convertCurrency(
              amount,
              fromCurrencyId,
              toCurrencyId
            );
            
            // Проверяем, что компонент еще активен
            if (isActive && convertedAmount !== null) {
              // Вычисляем комиссию
              const fee = convertedAmount * (SERVICE_FEE_PERCENT / 100);
              const amountAfterFee = convertedAmount - fee;

              setToAmountWithoutFee(convertedAmount.toFixed(6));
              setFeeAmount(fee.toFixed(6));
              setToData(prev => ({
                ...prev,
                amount: amountAfterFee.toFixed(6) // Сумма с учетом комиссии
              }));
            } else if (isActive) {
              // Если реальный курс недоступен, используем моки как фоллбэк
              const mockConvertedAmount = convertCurrency(
                amount,
                fromCurrencyId,
                toCurrencyId
              );
              
              if (mockConvertedAmount !== null) {
                // Вычисляем комиссию
                const fee = mockConvertedAmount * (SERVICE_FEE_PERCENT / 100);
                const amountAfterFee = mockConvertedAmount - fee;

                setToAmountWithoutFee(mockConvertedAmount.toFixed(6));
                setFeeAmount(fee.toFixed(6));
                setToData(prev => ({
                  ...prev,
                  amount: amountAfterFee.toFixed(6)
                }));
              }
            }
          } catch (error) {
            console.error('Ошибка конвертации:', error);
            
            // При ошибке используем моки
            if (isActive) {
              const mockConvertedAmount = convertCurrency(
                amount,
                fromCurrencyId,
                toCurrencyId
              );
              
              if (mockConvertedAmount !== null) {
                // Вычисляем комиссию
                const fee = mockConvertedAmount * (SERVICE_FEE_PERCENT / 100);
                const amountAfterFee = mockConvertedAmount - fee;

                setToAmountWithoutFee(mockConvertedAmount.toFixed(6));
                setFeeAmount(fee.toFixed(6));
                setToData(prev => ({
                  ...prev,
                  amount: amountAfterFee.toFixed(6)
                }));
              }
            }
          }
        }
      } else if (!fromData.amount || !fromData.currency || !toData.currency) {
        // Очищаем сумму во второй карточке, если нет данных для конвертации
        if (isActive) {
          setToData(prev => ({ ...prev, amount: '' }));
          setToAmountWithoutFee('');
          setFeeAmount('');
        }
      }
    };

    performConversion();

    // Cleanup function для предотвращения обновления state после unmount
    return () => {
      isActive = false;
    };
  }, [
    fromData.amount, 
    fromData.currency, 
    fromData.paymentCurrency, 
    toData.currency, 
    toData.paymentCurrency,
    exchangeRates
  ]);

  // Сброс банка/сети/валюты платежной системы при смене валюты в первой карточке
  useEffect(() => {
    setFromData(prev => ({
      ...prev,
      bank: prev.currency?.banks?.length ? undefined : prev.bank,
      network: prev.currency?.networks?.length ? undefined : prev.network,
      paymentCurrency: prev.currency?.paymentCurrencies?.length ? undefined : prev.paymentCurrency
    }));
  }, [fromData.currency?.id]);

  // Сброс банка/сети/валюты платежной системы при смене валюты во второй карточке
  useEffect(() => {
    setToData(prev => ({
      ...prev,
      bank: prev.currency?.banks?.length ? undefined : prev.bank,
      network: prev.currency?.networks?.length ? undefined : prev.network,
      paymentCurrency: prev.currency?.paymentCurrencies?.length ? undefined : prev.paymentCurrency
    }));
  }, [toData.currency?.id]);


  return (
    <>
      {enableSpotlight && (
        <GlobalSpotlight
          gridRef={gridRef}
          disableAnimations={shouldDisableAnimations}
          enabled={enableSpotlight}
          spotlightRadius={spotlightRadius}
          glowColor={glowColor}
        />
      )}

      <div className="bento-section-wrapper">
        {/* Контейнер для первых двух карточек с кнопкой свапа */}
        <div className="exchange-cards-container">
          <BentoCardGrid gridRef={gridRef}>
            {/* Первая карточка - Отдаете */}
            <ParticleCard
              key="from-card"
              className={`card currency-exchange-card bg-emerald-950/50 backdrop-blur-sm border border-default-800 ${textAutoHide ? 'card--text-autohide' : ''} ${enableBorderGlow ? 'card--border-glow' : ''}`}
              style={{
                backgroundColor: cardData[0]?.color,
                '--glow-color': glowColor
              } as React.CSSProperties}
              disableAnimations={true}
              particleCount={particleCount}
              glowColor={glowColor}
              enableTilt={enableTilt}
              clickEffect={clickEffect}
              enableMagnetism={enableMagnetism}
            >
              <CurrencyCard
                title="Отдаете"
                onAmountChange={handleFromAmountChange}
                onCurrencySelect={handleFromCurrencySelect}
                onSearchChange={handleFromSearchChange}
                onFilterChange={handleFromFilterChange}
                onBankSelect={handleFromBankSelect}
                onNetworkSelect={handleFromNetworkSelect}
                onPaymentCurrencySelect={handleFromPaymentCurrencySelect}
                amount={fromData.amount}
                selectedCurrency={fromData.currency}
                selectedBank={fromData.bank}
                selectedNetwork={fromData.network}
                selectedPaymentCurrency={fromData.paymentCurrency}
                searchTerm={fromData.searchTerm}
                activeFilter={fromData.activeFilter}
                readOnly={false}
                displayOnly={false}
              />
            </ParticleCard>

            {/* Кнопка свапа между карточками */}
            <div className="swap-icon-container">
              <button 
                className="swap-icon-button"
                onClick={handleSwapCurrencies}
                title="Поменять валюты местами"
              >
                <CiRepeat size={24} />
              </button>
            </div>

            {/* Вторая карточка - Получаете */}
            <ParticleCard
              key="to-card"
              className={`card currency-exchange-card ${textAutoHide ? 'card--text-autohide' : ''} ${enableBorderGlow ? 'card--border-glow' : ''}`}
              style={{
                backgroundColor: cardData[1]?.color,
                '--glow-color': glowColor
              } as React.CSSProperties}
              disableAnimations={true}
              particleCount={particleCount}
              glowColor={glowColor}
              enableTilt={enableTilt}
              clickEffect={clickEffect}
              enableMagnetism={enableMagnetism}
            >
              <CurrencyCard
                title="Получаете"
                onAmountChange={handleToAmountChange}
                onCurrencySelect={handleToCurrencySelect}
                onSearchChange={handleToSearchChange}
                onFilterChange={handleToFilterChange}
                onBankSelect={handleToBankSelect}
                onNetworkSelect={handleToNetworkSelect}
                onPaymentCurrencySelect={handleToPaymentCurrencySelect}
                amount={toData.amount}
                selectedCurrency={toData.currency}
                selectedBank={toData.bank}
                selectedNetwork={toData.network}
                selectedPaymentCurrency={toData.paymentCurrency}
                searchTerm={toData.searchTerm}
                activeFilter={toData.activeFilter}
                readOnly={false}
                displayOnly={true}
              />
            </ParticleCard>
          </BentoCardGrid>
        </div>

        {/* Третья карточка - Итоги конвертации */}
        <div className="summary-card-container">
          <ParticleCard
            key="summary-card"
            className={`card currency-exchange-card ${textAutoHide ? 'card--text-autohide' : ''} ${enableBorderGlow ? 'card--border-glow' : ''}`}
            style={{
              backgroundColor: cardData[2]?.color,
              '--glow-color': glowColor
            } as React.CSSProperties}
            disableAnimations={true}
            particleCount={particleCount}
            glowColor={glowColor}
            enableTilt={enableTilt}
            clickEffect={clickEffect}
            enableMagnetism={enableMagnetism}
          >
            <ConversionSummary
              fromCurrency={fromData.currency}
              toCurrency={toData.currency}
              fromAmount={fromData.amount}
              toAmount={toData.amount}
              toAmountWithoutFee={toAmountWithoutFee}
              feeAmount={feeAmount}
              feePercent={SERVICE_FEE_PERCENT}
              selectedBank={toData.bank}
              selectedNetwork={toData.network}
              selectedPaymentCurrency={toData.paymentCurrency}
              fromSelectedBank={fromData.bank}
              fromSelectedNetwork={fromData.network}
              fromSelectedPaymentCurrency={fromData.paymentCurrency}
              onCreateOrder={handleCreateOrder}
            />
          </ParticleCard>
        </div>

        {/* Информация об обновлении курсов */}
        <div className="mt-4 flex justify-center">
          <ExchangeRateInfo />
        </div>
      </div>
    </>
  );
};

export default MagicBento;
