import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { useStore } from '@/store/StoreProvider';
import { type Exchange } from '@/http/exchangeAPI';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// import { format } from 'date-fns';
// import { ru } from 'date-fns/locale';

const ProfilePage = observer(() => {
  const { user, exchange } = useStore();
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  useEffect(() => {
    if (user.isAuth) {
      exchange.fetchUserExchanges();
    }
  }, [user.isAuth]);

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
    exchange.fetchUserExchanges(status);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'secondary';
      case 'CONFIRMED':
        return 'default';
      case 'PROCESSING':
        return 'outline';
      case 'COMPLETED':
        return 'default';
      case 'CANCELLED':
        return 'destructive';
      case 'FAILED':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Ожидает';
      case 'CONFIRMED':
        return 'Подтверждена';
      case 'PROCESSING':
        return 'В обработке';
      case 'COMPLETED':
        return 'Завершена';
      case 'CANCELLED':
        return 'Отменена';
      case 'FAILED':
        return 'Не удалась';
      default:
        return status;
    }
  };

  const handleCancelExchange = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите отменить эту заявку?')) {
      await exchange.cancelExchange(id);
      exchange.fetchUserExchanges(selectedStatus);
    }
  };

  if (!user.isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Необходима авторизация</h1>
          <p className="text-gray-300">Для просмотра профиля необходимо войти в систему</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Заголовок профиля */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Мой профиль</h1>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {user.user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-white text-lg">{user.user?.email}</p>
              <p className="text-gray-300 text-sm">
                {user.user?.role === 'ADMIN' ? 'Администратор' : 'Пользователь'}
              </p>
            </div>
          </div>
        </div>

        {/* Фильтры статусов */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Мои заявки</h2>
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={selectedStatus === '' ? 'default' : 'outline'}
              onClick={() => handleStatusFilter('')}
              className="text-sm"
            >
              Все
            </Button>
            <Button
              variant={selectedStatus === 'PENDING' ? 'default' : 'outline'}
              onClick={() => handleStatusFilter('PENDING')}
              className="text-sm"
            >
              Ожидают
            </Button>
            <Button
              variant={selectedStatus === 'CONFIRMED' ? 'default' : 'outline'}
              onClick={() => handleStatusFilter('CONFIRMED')}
              className="text-sm"
            >
              Подтверждены
            </Button>
            <Button
              variant={selectedStatus === 'PROCESSING' ? 'default' : 'outline'}
              onClick={() => handleStatusFilter('PROCESSING')}
              className="text-sm"
            >
              В обработке
            </Button>
            <Button
              variant={selectedStatus === 'COMPLETED' ? 'default' : 'outline'}
              onClick={() => handleStatusFilter('COMPLETED')}
              className="text-sm"
            >
              Завершены
            </Button>
            <Button
              variant={selectedStatus === 'CANCELLED' ? 'default' : 'outline'}
              onClick={() => handleStatusFilter('CANCELLED')}
              className="text-sm"
            >
              Отменены
            </Button>
          </div>
        </div>

        {/* Список заявок */}
        {exchange.loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : exchange.exchanges.length === 0 ? (
          <Card className="p-8 text-center">
            <h3 className="text-xl font-semibold text-white mb-2">Заявки не найдены</h3>
            <p className="text-gray-300">
              {selectedStatus ? 'Нет заявок с выбранным статусом' : 'У вас пока нет заявок на обмен'}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {exchange.exchanges.map((exchangeItem: Exchange) => (
              <Card key={exchangeItem.id} className="p-6 bg-white/5 backdrop-blur-sm border-white/10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Заявка #{exchangeItem.id}
                    </h3>
                    {/* <p className="text-gray-300 text-sm">
                      Создана: {format(new Date(exchangeItem.createdAt), 'dd.MM.yyyy HH:mm', { locale: ru })}
                    </p> */}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusBadgeVariant(exchangeItem.status)}>
                      {getStatusText(exchangeItem.status)}
                    </Badge>
                    {exchangeItem.status === 'PENDING' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancelExchange(exchangeItem.id)}
                      >
                        Отменить
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Отправка */}
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Отправляете</h4>
                    <div className="text-white font-semibold text-lg">
                      {exchangeItem.from.amount} {exchangeItem.from.currency.symbol}
                    </div>
                    {exchangeItem.from.bankName && (
                      <p className="text-gray-300 text-sm mt-1">
                        Банк: {exchangeItem.from.bankName}
                      </p>
                    )}
                    {exchangeItem.from.networkName && (
                      <p className="text-gray-300 text-sm">
                        Сеть: {exchangeItem.from.networkName}
                      </p>
                    )}
                  </div>

                  {/* Получение */}
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Получаете</h4>
                    <div className="text-white font-semibold text-lg">
                      {exchangeItem.to.amount} {exchangeItem.to.currency.symbol}
                    </div>
                    {exchangeItem.to.bankName && (
                      <p className="text-gray-300 text-sm mt-1">
                        Банк: {exchangeItem.to.bankName}
                      </p>
                    )}
                    {exchangeItem.to.networkName && (
                      <p className="text-gray-300 text-sm">
                        Сеть: {exchangeItem.to.networkName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Реквизиты */}
                {(exchangeItem.recipientAddress || exchangeItem.recipientCard || exchangeItem.recipientPaymentDetails) && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Реквизиты для получения</h4>
                    <div className="bg-white/5 rounded-lg p-3">
                      {exchangeItem.recipientAddress && (
                        <p className="text-white text-sm mb-1">
                          <span className="text-gray-300">Адрес:</span> {exchangeItem.recipientAddress}
                        </p>
                      )}
                      {exchangeItem.recipientCard && (
                        <p className="text-white text-sm mb-1">
                          <span className="text-gray-300">Карта/телефон:</span> {exchangeItem.recipientCard}
                        </p>
                      )}
                      {exchangeItem.recipientPaymentDetails && (
                        <p className="text-white text-sm">
                          <span className="text-gray-300">Детали:</span> {exchangeItem.recipientPaymentDetails}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Комиссия и курс */}
                <div className="flex justify-between items-center text-sm">
                  <div className="text-gray-300">
                    Комиссия: {exchangeItem.feeAmount} {exchangeItem.to.currency.symbol} ({exchangeItem.feePercent}%)
                  </div>
                  {exchangeItem.exchangeRate && (
                    <div className="text-gray-300">
                      Курс: {exchangeItem.exchangeRate}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {exchange.error && (
          <Card className="p-4 bg-red-500/10 border-red-500/20 mt-4">
            <p className="text-red-300">{exchange.error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exchange.clearError()}
              className="mt-2"
            >
              Закрыть
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
});

export default ProfilePage;
