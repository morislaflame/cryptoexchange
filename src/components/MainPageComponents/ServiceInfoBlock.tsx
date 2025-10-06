import { Link } from 'react-router-dom';
import { RULES_ROUTE, AML_ROUTE, FAQ_ROUTE } from '@/utils/consts';

const ServiceInfoBlock = () => {
  const cities = [
    'Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 
    'Нижний Новгород', 'Казань', 'Челябинск', 'Омск', 'Самара', 
    'Ростов-на-Дону', 'Уфа', 'Красноярск', 'Воронеж', 'Пермь', 
    'Волгоград', 'Краснодар'
  ];

  const serviceLinks = [
    { label: 'Правила обмена', href: RULES_ROUTE },
    { label: 'AML / CTF & KYC', href: AML_ROUTE },
    { label: 'FAQ', href: FAQ_ROUTE }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-12">
      <div className="bg-gradient-to-br from-emerald-900/20 to-emerald-800/20 rounded-2xl p-8 shadow-lg border border-emerald-700/50">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">
            О нашем сервисе
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Города */}
          <div>
            <h3 className="text-xl font-semibold mb-4">
              Наши офисы в городах России
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {cities.map((city, index) => (
                <div 
                  key={index}
                  className="bg-emerald-900/30 rounded-lg px-3 py-2 text-sm font-medium  border border-emerald-700/50"
                >
                  {city}
                </div>
              ))}
            </div>
          </div>

          {/* Ссылки на страницы */}
          <div>
            <h3 className="text-xl font-semibold mb-4">
              Полезная информация
            </h3>
            <div className="space-y-3">
              {serviceLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.href}
                  className="block bg-emerald-900/30 hover:bg-emerald-900/50 rounded-lg px-4 py-3 text-emerald-500 hover:text-emerald-100 transition-all duration-200 border border-emerald-700/50 hover:border-emerald-600/50 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{link.label}</span>
                    <svg 
                      className="w-4 h-4 text-emerald-500" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 5l7 7-7 7" 
                      />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Дополнительная информация */}
        <div className="mt-8 pt-6 border-t border-emerald-200/50 dark:border-emerald-700/50">
          <div className="text-center">
            <p className="text-emerald-600 dark:text-emerald-400 text-sm">
              Мы обеспечиваем безопасный и быстрый обмен криптовалют с 2019 года. 
              Наши офисы расположены в крупнейших городах России для вашего удобства.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceInfoBlock;
