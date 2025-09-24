import CardNav from './CardNav'
import logo from '@/assets/logo.png';

const Navigation = () => {
  const items = [
    {
      label: "About",
      bgColor: "#0D0716",
      textColor: "#fff",
      description: "Узнайте больше о нашей компании и возможностях карьерного роста",
      href: "/about",
      links: [
        { label: "Company", href: "/company", ariaLabel: "About Company" },
        { label: "Careers", href: "/careers", ariaLabel: "About Careers" }
      ]
    },
    {
      label: "Projects", 
      bgColor: "#170D27",
      textColor: "#fff",
      description: "Изучите наши проекты и кейсы успешных решений",
      href: "/projects",
      links: [
        { label: "Featured", href: "/featured", ariaLabel: "Featured Projects" },
        { label: "Case Studies", href: "/case-studies", ariaLabel: "Project Case Studies" }
      ]
    },
    {
      label: "Contact",
      bgColor: "#271E37", 
      textColor: "#fff",
      description: "Свяжитесь с нами любым удобным способом",
      href: "/contact",
      links: [
        { label: "Email", href: "mailto:contact@example.com", ariaLabel: "Email us" },
        { label: "Twitter", href: "https://twitter.com", ariaLabel: "Twitter" },
        { label: "LinkedIn", href: "https://linkedin.com", ariaLabel: "LinkedIn" }
      ]
    }
  ];

  return (
    <CardNav
      logo={logo}
      logoAlt="Company Logo"
      items={items}
      baseColor="#01130e"
      menuColor="#fff"
      ease="power3.out"
    />
  );
};

export default Navigation;