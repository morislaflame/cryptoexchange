import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/StoreProvider';
import { type Exchange } from '@/http/exchangeAPI';
import { type CurrencyInfo } from '@/http/exchangeAPI';

const AdminExchangesPage: React.FC = observer(() => {
    const { user, exchange } = useStore();
    const [selectedExchange, setSelectedExchange] = useState<Exchange | null>(null);
    const [userIdFilter, setUserIdFilter] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(0);
    const [limit] = useState(20);

    // Загрузка заявок при монтировании компонента
    useEffect(() => {
        if (user.user?.role === 'ADMIN') {
            exchange.fetchAllExchanges(undefined, userIdFilter ? parseInt(userIdFilter) : undefined, limit, currentPage * limit);
        }
    }, [user.user, userIdFilter, currentPage, limit, exchange]);

    const handleStatusChange = async (exchangeId: number, newStatus: string) => {
        const success = await exchange.updateExchangeStatus(exchangeId, newStatus);
        if (success) {
            // Обновляем список заявок
            exchange.fetchAllExchanges(undefined, userIdFilter ? parseInt(userIdFilter) : undefined, limit, currentPage * limit);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'text-yellow-500 bg-yellow-500/20';
            case 'CONFIRMED': return 'text-blue-500 bg-blue-500/20';
            case 'PROCESSING': return 'text-purple-500 bg-purple-500/20';
            case 'COMPLETED': return 'text-green-500 bg-green-500/20';
            case 'CANCELLED': return 'text-red-500 bg-red-500/20';
            case 'FAILED': return 'text-gray-500 bg-gray-500/20';
            default: return 'text-gray-500 bg-gray-500/20';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'PENDING': return 'Ожидает';
            case 'CONFIRMED': return 'Подтверждена';
            case 'PROCESSING': return 'В обработке';
            case 'COMPLETED': return 'Завершена';
            case 'CANCELLED': return 'Отменена';
            case 'FAILED': return 'Не удалась';
            default: return status;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('ru-RU');
    };

    const formatAmount = (amount: string, currency: CurrencyInfo, paymentCurrencyName?: string) => {
        // Если есть платежная валюта, используем её название
        const symbol = paymentCurrencyName || currency.symbol;
        const formattedAmount = parseFloat(amount).toLocaleString('ru-RU');
        return `${formattedAmount} ${symbol}`;
    };

    if (user.user?.role !== 'ADMIN') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-emerald-950 flex items-center justify-center">
                <div className="text-white text-xl">Доступ запрещен</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-white mb-6">Управление заявками</h1>
                
                <div className="flex gap-4 h-[calc(100vh-200px)]">
                    {/* Sidebar с фильтрами и списком заявок */}
                    <div className="w-1/3 bg-white/5 border border-white/10 rounded-2xl p-4 overflow-y-auto backdrop-blur-sm">
                        <h2 className="text-xl font-semibold text-white mb-4">Заявки</h2>
                        
                        {/* Фильтры */}
                        <div className="space-y-4 mb-6">
                            {/* <div>
                                <label className="block text-sm text-white/70 mb-2">Статус</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                                >
                                    <option value="">Все статусы</option>
                                    <option value="PENDING">Ожидает</option>
                                    <option value="CONFIRMED">Подтверждена</option>
                                    <option value="PROCESSING">В обработке</option>
                                    <option value="COMPLETED">Завершена</option>
                                    <option value="CANCELLED">Отменена</option>
                                    <option value="FAILED">Не удалась</option>
                                </select>
                            </div> */}
                            
                            <div>
                                <label className="block text-sm text-white/70 mb-2">ID пользователя</label>
                                <input
                                    type="number"
                                    value={userIdFilter}
                                    onChange={(e) => setUserIdFilter(e.target.value)}
                                    placeholder="Введите ID пользователя"
                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-emerald-400"
                                />
                            </div>
                        </div>

                        {/* Список заявок */}
                        {exchange.loading ? (
                            <div className="text-white/60 text-center py-4">Загрузка...</div>
                        ) : exchange.exchanges.length === 0 ? (
                            <div className="text-white/60 text-center py-4">Нет заявок</div>
                        ) : (
                            <div className="space-y-2">
                                {exchange.exchanges.map((exchangeItem) => (
                                    <div
                                        key={exchangeItem.id}
                                        onClick={() => setSelectedExchange(exchangeItem)}
                                        className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                                            selectedExchange?.id === exchangeItem.id
                                                ? 'bg-emerald-500/20 border-emerald-400/50'
                                                : 'bg-white/5 hover:bg-white/10 border-white/10'
                                        } border`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-medium text-white">
                                                Заявка #{exchangeItem.id}
                                            </span>
                                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(exchangeItem.status)}`}>
                                                {getStatusText(exchangeItem.status)}
                                            </span>
                                        </div>
                                        
                                        <div className="text-sm text-white/70 mb-1">
                                            {formatAmount(exchangeItem.from.amount, exchangeItem.from.currency, exchangeItem.from.paymentCurrencyName)} → {formatAmount(exchangeItem.to.amount, exchangeItem.to.currency, exchangeItem.to.paymentCurrencyName)}
                                        </div>
                                        
                                        <div className="text-xs text-white/50">
                                            {formatDate(exchangeItem.createdAt)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Пагинация */}
                        {exchange.totalCount > limit && (
                            <div className="mt-4 flex justify-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                                    disabled={currentPage === 0}
                                    className="px-3 py-1 bg-white/10 border border-white/20 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Назад
                                </button>
                                <span className="px-3 py-1 text-white/70">
                                    {currentPage + 1} из {Math.ceil(exchange.totalCount / limit)}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={(currentPage + 1) * limit >= exchange.totalCount}
                                    className="px-3 py-1 bg-white/10 border border-white/20 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Вперед
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Детальная информация о заявке */}
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm ios-scroll hide-scrollbar overflow-y-auto">
                        {selectedExchange ? (
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <h3 className="text-2xl font-semibold text-white">
                                        Заявка #{selectedExchange.id}
                                    </h3>
                                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(selectedExchange.status)}`}>
                                        {getStatusText(selectedExchange.status)}
                                    </span>
                                </div>

                                {/* Информация о пользователе */}
                                <div className="mb-6">
                                    <h4 className="text-lg font-semibold text-white mb-3">Информация о пользователе</h4>
                                    <div className="bg-white/5 rounded-lg p-4">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-white/70">ID пользователя:</span>
                                                <span className="text-white ml-2">{selectedExchange.userId || 'Гость'}</span>
                                            </div>
                                            {selectedExchange.recipientEmail && (
                                                <div>
                                                    <span className="text-white/70">Email:</span>
                                                    <span className="text-white ml-2">{selectedExchange.recipientEmail}</span>
                                                </div>
                                            )}
                                            {selectedExchange.recipientTelegramUsername && (
                                                <div>
                                                    <span className="text-white/70">Telegram:</span>
                                                    <span className="text-white ml-2">{selectedExchange.recipientTelegramUsername}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Направления обмена */}
                                <div className="mb-6">
                                    <h4 className="text-lg font-semibold text-white mb-3">Направления обмена</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/5 rounded-lg p-4">
                                            <h5 className="text-white font-medium mb-2">Отдает</h5>
                                            <div className="text-2xl font-bold text-emerald-400 mb-2">
                                                {formatAmount(selectedExchange.from.amount, selectedExchange.from.currency, selectedExchange.from.paymentCurrencyName)}
                                            </div>
                                            {selectedExchange.from.bankName && (
                                                <div className="text-sm text-white/70">Банк: {selectedExchange.from.bankName}</div>
                                            )}
                                            {selectedExchange.from.networkName && (
                                                <div className="text-sm text-white/70">Сеть: {selectedExchange.from.networkName}</div>
                                            )}
                                            {selectedExchange.from.paymentCurrencyName && (
                                                <div className="text-sm text-white/70">Платежная валюта: {selectedExchange.from.paymentCurrencyName}</div>
                                            )}
                                        </div>
                                        
                                        <div className="bg-white/5 rounded-lg p-4">
                                            <h5 className="text-white font-medium mb-2">Получает</h5>
                                            <div className="text-2xl font-bold text-blue-400 mb-2">
                                                {formatAmount(selectedExchange.to.amount, selectedExchange.to.currency, selectedExchange.to.paymentCurrencyName)}
                                            </div>
                                            {selectedExchange.to.bankName && (
                                                <div className="text-sm text-white/70">Банк: {selectedExchange.to.bankName}</div>
                                            )}
                                            {selectedExchange.to.networkName && (
                                                <div className="text-sm text-white/70">Сеть: {selectedExchange.to.networkName}</div>
                                            )}
                                            {selectedExchange.to.paymentCurrencyName && (
                                                <div className="text-sm text-white/70">Платежная валюта: {selectedExchange.to.paymentCurrencyName}</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Реквизиты */}
                                {(selectedExchange.recipientAddress || selectedExchange.recipientCard || selectedExchange.recipientPaymentDetails) && (
                                    <div className="mb-6">
                                        <h4 className="text-lg font-semibold text-white mb-3">Реквизиты для получения</h4>
                                        <div className="bg-white/5 rounded-lg p-4 space-y-2">
                                            {selectedExchange.recipientAddress && (
                                                <div>
                                                    <span className="text-white/70">Адрес кошелька:</span>
                                                    <div className="text-white font-mono text-sm break-all">{selectedExchange.recipientAddress}</div>
                                                </div>
                                            )}
                                            {selectedExchange.recipientCard && (
                                                <div>
                                                    <span className="text-white/70">Карта/телефон:</span>
                                                    <div className="text-white font-mono text-sm">{selectedExchange.recipientCard}</div>
                                                </div>
                                            )}
                                            {selectedExchange.recipientPaymentDetails && (
                                                <div>
                                                    <span className="text-white/70">Дополнительные реквизиты:</span>
                                                    <div className="text-white font-mono text-sm break-all">{selectedExchange.recipientPaymentDetails}</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Курс и комиссия */}
                                <div className="mb-6">
                                    <h4 className="text-lg font-semibold text-white mb-3">Курс и комиссия</h4>
                                    <div className="bg-white/5 rounded-lg p-4">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-white/70">Курс обмена:</span>
                                                <span className="text-white ml-2">{selectedExchange.exchangeRate || 'N/A'}</span>
                                            </div>
                                            <div>
                                                <span className="text-white/70">Комиссия:</span>
                                                <span className="text-white ml-2">
                                                    {selectedExchange.feeAmount} {selectedExchange.to.currency.symbol} ({selectedExchange.feePercent}%)
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Временные метки */}
                                <div className="mb-6">
                                    <h4 className="text-lg font-semibold text-white mb-3">Временные метки</h4>
                                    <div className="bg-white/5 rounded-lg p-4">
                                        <div className="space-y-2 text-sm">
                                            <div>
                                                <span className="text-white/70">Создана:</span>
                                                <span className="text-white ml-2">{formatDate(selectedExchange.createdAt)}</span>
                                            </div>
                                            {selectedExchange.confirmedAt && (
                                                <div>
                                                    <span className="text-white/70">Подтверждена:</span>
                                                    <span className="text-white ml-2">{formatDate(selectedExchange.confirmedAt)}</span>
                                                </div>
                                            )}
                                            {selectedExchange.completedAt && (
                                                <div>
                                                    <span className="text-white/70">Завершена:</span>
                                                    <span className="text-white ml-2">{formatDate(selectedExchange.completedAt)}</span>
                                                </div>
                                            )}
                                            {selectedExchange.cancelledAt && (
                                                <div>
                                                    <span className="text-white/70">Отменена:</span>
                                                    <span className="text-white ml-2">{formatDate(selectedExchange.cancelledAt)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Управление статусом */}
                                <div className="mb-6">
                                    <h4 className="text-lg font-semibold text-white mb-3">Управление статусом</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedExchange.status === 'PENDING' && (
                                            <>
                                                <button
                                                    onClick={() => handleStatusChange(selectedExchange.id, 'CONFIRMED')}
                                                    className="px-4 py-2 bg-blue-500/20 border border-blue-400/50 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-colors"
                                                >
                                                    Подтвердить
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(selectedExchange.id, 'CANCELLED')}
                                                    className="px-4 py-2 bg-red-500/20 border border-red-400/50 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors"
                                                >
                                                    Отменить
                                                </button>
                                            </>
                                        )}
                                        {selectedExchange.status === 'CONFIRMED' && (
                                            <>
                                                <button
                                                    onClick={() => handleStatusChange(selectedExchange.id, 'PROCESSING')}
                                                    className="px-4 py-2 bg-purple-500/20 border border-purple-400/50 rounded-lg text-purple-400 hover:bg-purple-500/30 transition-colors"
                                                >
                                                    В обработку
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(selectedExchange.id, 'CANCELLED')}
                                                    className="px-4 py-2 bg-red-500/20 border border-red-400/50 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors"
                                                >
                                                    Отменить
                                                </button>
                                            </>
                                        )}
                                        {selectedExchange.status === 'PROCESSING' && (
                                            <>
                                                <button
                                                    onClick={() => handleStatusChange(selectedExchange.id, 'COMPLETED')}
                                                    className="px-4 py-2 bg-green-500/20 border border-green-400/50 rounded-lg text-green-400 hover:bg-green-500/30 transition-colors"
                                                >
                                                    Завершить
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(selectedExchange.id, 'FAILED')}
                                                    className="px-4 py-2 bg-gray-500/20 border border-gray-400/50 rounded-lg text-gray-400 hover:bg-gray-500/30 transition-colors"
                                                >
                                                    Не удалась
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center text-white/50">
                                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-lg">Выберите заявку для просмотра деталей</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

export default AdminExchangesPage;
