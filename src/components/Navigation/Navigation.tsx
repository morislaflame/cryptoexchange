import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/StoreProvider';
import CardNav from './CardNav';
import logo from '@/assets/logo.png';
import { ADMIN_CHATS_ROUTE, ADMIN_EXCHANGES_ROUTE, RULES_ROUTE, AML_ROUTE, FAQ_ROUTE } from '@/utils/consts';

const Navigation = observer(() => {
  const { user } = useStore();

  const baseItems = [
    {
      label: "Правила обмена",
      bgColor: "#0D0716",
      textColor: "#fff",
      description: "Узнайте правила обмена валют и правила безопасности",
      href: RULES_ROUTE,
      links: [
        { label: "Правила обмена", href: RULES_ROUTE, ariaLabel: "About Rules" }
      ]
    },
    {
      label: "AML / CTF & KYC", 
      bgColor: "#170D27",
      textColor: "#fff",
      description: "Политика AML / CTF & KYC направлена на противодействие использование сервиса в незаконных целях, а так же на обеспечение безопасности пользователей при получении цифровых активов",
      href: AML_ROUTE,
      links: [
        { label: "AML", href: AML_ROUTE, ariaLabel: "AML" },
      ]
    },
    {
      label: "FAQ",
      bgColor: "#271E37", 
      textColor: "#fff",
      description: "Часто задаваемые вопросы",
      href: FAQ_ROUTE,
      links: [
        { label: "FAQ", href: FAQ_ROUTE, ariaLabel: "FAQ" },
      ]
    }
  ];

  // Добавляем пункты для админа, если пользователь - админ
  const adminItems = user.isAuth && user.user?.role === 'ADMIN' ? [
    {
      label: "Управление чатами",
      bgColor: "#2d1a3d",
      textColor: "#fff",
      description: "Панель управления чатами поддержки",
      href: ADMIN_CHATS_ROUTE,
      links: [
        { label: "Чаты", href: ADMIN_CHATS_ROUTE, ariaLabel: "Admin Chats" }
      ]
    },
    {
      label: "Управление заявками",
      bgColor: "#1a2d3d",
      textColor: "#fff",
      description: "Панель управления заявками на обмен",
      href: ADMIN_EXCHANGES_ROUTE,
      links: [
        { label: "Заявки", href: ADMIN_EXCHANGES_ROUTE, ariaLabel: "Admin Exchanges" }
      ]
    }
  ] : [];

  const items = [...baseItems, ...adminItems];

  return (
    <CardNav
      logo={logo}
      logoAlt="Company Logo"
      items={items}
      baseColor="#02291e"
      menuColor="#fff"
      ease="power3.out"
      className="z-10"
    />
  );
});

export default Navigation;