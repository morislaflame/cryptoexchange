import React, { useLayoutEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { LOGIN_ROUTE, MAIN_ROUTE } from '@/utils/consts';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '@/store/StoreProvider';
import UserAvatar from './UserAvatar';
import { Button } from '../ui/button';

type CardNavLink = {
  label: string;
  href: string;
  ariaLabel: string;
};

export type CardNavItem = {
  label: string;
  bgColor: string;
  textColor: string;
  description: string;
  href: string;
  links: CardNavLink[];
};

export interface CardNavProps {
  logo: string;
  logoAlt?: string;
  items: CardNavItem[];
  className?: string;
  ease?: string;
  baseColor?: string;
  menuColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
}

const CardNav: React.FC<CardNavProps> = ({
  logo,
  logoAlt = 'Logo',
  items,
  className = '',
  ease = 'power3.out',
  baseColor = '#000',
  menuColor,
}) => {
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const navRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLAnchorElement[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const navigate = useNavigate();
  const { user } = useStore();

  const handleAuthClick = () => {
    if (user.isAuth) {
      user.logout();
    } else {
      navigate(LOGIN_ROUTE);
    }
  };

  const calculateHeight = useCallback(() => {
    const navEl = navRef.current;
    if (!navEl) return 260;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) {
      const contentEl = navEl.querySelector('[class*="absolute left-0 right-0 top-[60px]"]') as HTMLElement;
      if (contentEl) {
        const wasVisible = contentEl.style.visibility;
        const wasPointerEvents = contentEl.style.pointerEvents;
        const wasPosition = contentEl.style.position;
        const wasHeight = contentEl.style.height;
        const wasDisplay = contentEl.style.display;

        contentEl.style.visibility = 'visible';
        contentEl.style.pointerEvents = 'auto';
        contentEl.style.position = 'static';
        contentEl.style.height = 'auto';
        contentEl.style.display = 'flex';

        // Принудительный пересчет layout
        void contentEl.offsetHeight;

        const topBar = 60;
        const padding = 16;
        const contentHeight = contentEl.scrollHeight;

        contentEl.style.visibility = wasVisible;
        contentEl.style.pointerEvents = wasPointerEvents;
        contentEl.style.position = wasPosition;
        contentEl.style.height = wasHeight;
        contentEl.style.display = wasDisplay;

        return topBar + contentHeight + padding;
      }
    }
    return 260;
  }, []);

  const createTimeline = useCallback(() => {
    const navEl = navRef.current;
    if (!navEl) return null;

    gsap.set(navEl, { height: 60, overflow: 'hidden' });
    gsap.set(cardsRef.current, { y: 50, opacity: 0 });

    const tl = gsap.timeline({ paused: true });

    tl.to(navEl, {
      height: calculateHeight,
      duration: 0.4,
      ease
    });

    tl.to(cardsRef.current, { y: 0, opacity: 1, duration: 0.4, ease, stagger: 0.08 }, '-=0.1');

    return tl;
  }, [ease, calculateHeight]);

  useLayoutEffect(() => {
    const tl = createTimeline();
    tlRef.current = tl;

    return () => {
      tl?.kill();
      tlRef.current = null;
    };
  }, [createTimeline]);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!tlRef.current) return;

      if (isExpanded) {
        const newHeight = calculateHeight();
        gsap.set(navRef.current, { height: newHeight });

        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) {
          newTl.progress(1);
          tlRef.current = newTl;
        }
      } else {
        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) {
          tlRef.current = newTl;
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isExpanded, calculateHeight, createTimeline]);

  const toggleMenu = () => {
    const tl = tlRef.current;
    if (!tl) return;
    if (!isExpanded) {
      setIsHamburgerOpen(true);
      setIsExpanded(true);
      tl.play(0);
    } else {
      setIsHamburgerOpen(false);
      tl.eventCallback('onReverseComplete', () => setIsExpanded(false));
      tl.reverse();
    }
  };

  const setCardRef = (i: number) => (el: HTMLAnchorElement | null) => {
    if (el) cardsRef.current[i] = el;
  };

  const handleLinkClick = () => {
    if (isExpanded) {
      setIsHamburgerOpen(false);
      const tl = tlRef.current;
      if (tl) {
        tl.eventCallback('onReverseComplete', () => setIsExpanded(false));
        tl.reverse();
      }
    }
  };

  return (
    <div className={`w-full z-[99] box-border ${className}`}>
      <nav 
        ref={navRef} 
        className={`block h-[60px] p-0 border border-white/10 rounded-xl shadow-lg relative bg-transparent filter drop-shadow-[0_0_10px_rgba(0,0,0,0.1)] backdrop-blur-[10px] overflow-hidden will-change-[height] ${isExpanded ? 'open' : ''}`} 
        style={{ backgroundColor: baseColor }}
      >
        <div className="absolute top-0 left-0 right-0 h-[60px] flex items-center justify-between px-[1.1rem] z-[2] md:px-[1.1rem] px-4">
          <div className="flex items-center cursor-pointer" onClick={() => navigate(MAIN_ROUTE)}>
            <img src={logo} alt={logoAlt} className="h-7" />
          </div>
          

          {/* Ссылки с заголовками разделов - показываются только в свернутом состоянии */}
          {!isExpanded && (
            <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
              {items.map((item, idx) => (
                <Link 
                  key={`section-${idx}`}
                  to={item.href} 
                  className="text-base font-medium no-underline text-white transition-opacity duration-300 ease-in-out cursor-pointer hover:opacity-75"
                  style={{ color: menuColor || '#fff' }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
          <div className="flex items-center gap-4">
            {user.isAuth ? (
              <UserAvatar />
            ) : (
              <Button
                onClick={handleAuthClick}
                className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 hover:border-emerald-500/50 rounded-lg text-emerald-400 hover:text-emerald-300 transition-all duration-300 backdrop-blur-sm cursor-pointer text-sm"
              >
                Войти
              </Button>
            )}
          <div
            className={`h-full flex flex-col items-center justify-center cursor-pointer gap-1.5 hover:[&>div]:opacity-75 ${isHamburgerOpen ? 'open' : ''}`}
            onClick={toggleMenu}
            role="button"
            aria-label={isExpanded ? 'Close menu' : 'Open menu'}
            tabIndex={0}
            style={{ color: menuColor || '#000' }}
          >
            <div className={`w-[30px] h-0.5 bg-current transition-all duration-[250ms] ease-in-out origin-[50%_50%] ${isHamburgerOpen ? 'translate-y-1 rotate-45' : ''}`} />
            <div className={`w-[30px] h-0.5 bg-current transition-all duration-[250ms] ease-in-out origin-[50%_50%] ${isHamburgerOpen ? '-translate-y-1 -rotate-45' : ''}`} />
          </div>
          </div>
        </div>

        <div 
          className={`absolute left-0 right-0 top-[60px] bottom-0 p-2 flex items-end gap-3 z-[1] md:flex-row flex-col md:items-end items-stretch md:justify-start justify-start ${isExpanded ? 'visible pointer-events-auto' : 'invisible pointer-events-none'}`} 
          aria-hidden={!isExpanded}
        >
          {(items || []).slice(0, 5).map((item, idx) => (
            <Link
              key={`${item.label}-${idx}`}
              className="md:h-full md:flex-1 md:min-w-0 h-auto flex-1 flex-auto max-h-none min-h-[60px] rounded-[calc(0.75rem-0.2rem)] relative flex flex-col p-3 gap-2 select-none text-white bg-white/5 border border-white/10"
              ref={setCardRef(idx)}
              to={item.href}
              onClick={handleLinkClick}
              style={{ color: item.textColor }}
            >
              <div className="font-normal text-[22px] tracking-[-0.5px] md:text-[22px] text-lg">{item.label}</div>
              <div className="text-sm leading-[1.4] opacity-80 font-light md:text-sm text-[13px]">
                {item.description}
              </div>
            </Link>
          ))}
        </div>
        
      </nav>
    </div>
  );
};

export default CardNav;
