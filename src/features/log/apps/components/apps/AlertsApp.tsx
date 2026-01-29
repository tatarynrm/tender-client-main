import React, { useState } from 'react';
import { Bell, AlertTriangle, Info, CheckCircle, X, Filter, Clock, Truck, Package } from 'lucide-react';

const AlertsApp: React.FC = () => {
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const alerts = [
    {
      id: 1,
      title: 'Затримка доставки #D001',
      message: 'Доставка в Епіцентр затримується на 45 хвилин через дорожні роботи на трасі М03',
      type: 'warning',
      priority: 'high',
      category: 'delivery',
      timestamp: '2024-01-15 14:30',
      isRead: false,
      relatedId: 'D001',
      location: 'Київ - Харків',
      driver: 'Іван Петренко'
    },
    {
      id: 2,
      title: 'Критично низький рівень палива',
      message: 'Транспортний засіб Mercedes Actros (AA1234BB) має критично низький рівень палива (15%)',
      type: 'error',
      priority: 'high',
      category: 'vehicle',
      timestamp: '2024-01-15 14:15',
      isRead: false,
      relatedId: 'AA1234BB',
      location: 'Полтава',
      driver: 'Іван Петренко'
    },
    {
      id: 3,
      title: 'Успішна доставка #D002',
      message: 'Доставка в Сільпо успішно завершена. Клієнт підтвердив отримання товару',
      type: 'success',
      priority: 'low',
      category: 'delivery',
      timestamp: '2024-01-15 13:45',
      isRead: true,
      relatedId: 'D002',
      location: 'Одеса',
      driver: 'Марія Коваль'
    },
    {
      id: 4,
      title: 'Планове ТО транспорту',
      message: 'Volvo FH16 (BC5678CD) потребує планового технічного обслуговування через 500 км',
      type: 'info',
      priority: 'medium',
      category: 'maintenance',
      timestamp: '2024-01-15 12:00',
      isRead: false,
      relatedId: 'BC5678CD',
      location: 'Київ',
      driver: 'Марія Коваль'
    },
    {
      id: 5,
      title: 'Перевищення швидкості',
      message: 'Водій Олег Сидоров перевищив дозволену швидкість на ділянці Дніпро - Запоріжжя',
      type: 'warning',
      priority: 'medium',
      category: 'safety',
      timestamp: '2024-01-15 11:30',
      isRead: true,
      relatedId: 'DE9012EF',
      location: 'Дніпро - Запоріжжя',
      driver: 'Олег Сидоров'
    },
    {
      id: 6,
      title: 'Низький залишок товару',
      message: 'Товар "Джинси Levi\'s 501" (SKU003) закінчився на складі. Необхідне поповнення',
      type: 'warning',
      priority: 'medium',
      category: 'inventory',
      timestamp: '2024-01-15 10:15',
      isRead: false,
      relatedId: 'SKU003',
      location: 'Склад C-1-22',
      driver: null
    },
    {
      id: 7,
      title: 'Новий замовлення',
      message: 'Отримано нове замовлення від АТБ на суму 45,000 грн. Необхідне планування доставки',
      type: 'info',
      priority: 'medium',
      category: 'order',
      timestamp: '2024-01-15 09:45',
      isRead: true,
      relatedId: 'ORD789',
      location: 'Львів',
      driver: null
    },
    {
      id: 8,
      title: 'Погодні умови',
      message: 'Очікується сильний дощ у Західній Україні. Рекомендується обережність при перевезеннях',
      type: 'info',
      priority: 'low',
      category: 'weather',
      timestamp: '2024-01-15 08:00',
      isRead: true,
      relatedId: null,
      location: 'Західна Україна',
      driver: null
    }
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'border-l-red-500 bg-red-50';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'success':
        return 'border-l-green-500 bg-green-50';
      case 'info':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Високий';
      case 'medium':
        return 'Середній';
      case 'low':
        return 'Низький';
      default:
        return 'Невідомо';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'delivery':
        return <Truck className="w-4 h-4" />;
      case 'vehicle':
        return <Truck className="w-4 h-4" />;
      case 'inventory':
        return <Package className="w-4 h-4" />;
      case 'maintenance':
        return <Truck className="w-4 h-4" />;
      case 'safety':
        return <AlertTriangle className="w-4 h-4" />;
      case 'order':
        return <Package className="w-4 h-4" />;
      case 'weather':
        return <Info className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'delivery':
        return 'Доставка';
      case 'vehicle':
        return 'Транспорт';
      case 'inventory':
        return 'Склад';
      case 'maintenance':
        return 'ТО';
      case 'safety':
        return 'Безпека';
      case 'order':
        return 'Замовлення';
      case 'weather':
        return 'Погода';
      default:
        return 'Інше';
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesType = filterType === 'all' || alert.type === filterType;
    const matchesPriority = filterPriority === 'all' || alert.priority === filterPriority;
    return matchesType && matchesPriority;
  });

  const unreadCount = alerts.filter(alert => !alert.isRead).length;
  const highPriorityCount = alerts.filter(alert => alert.priority === 'high' && !alert.isRead).length;

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} хв тому`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} год тому`;
    } else {
      return date.toLocaleDateString('uk-UA');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Bell className="w-8 h-8 text-red-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Сповіщення</h3>
        </div>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
          Позначити всі як прочитані
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Всього сповіщень</p>
              <p className="text-2xl font-bold text-gray-900">{alerts.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Непрочитані</p>
              <p className="text-2xl font-bold text-orange-600">{unreadCount}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <Bell className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Високий пріоритет</p>
              <p className="text-2xl font-bold text-red-600">{highPriorityCount}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">Всі типи</option>
              <option value="error">Помилки</option>
              <option value="warning">Попередження</option>
              <option value="success">Успіх</option>
              <option value="info">Інформація</option>
            </select>
          </div>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="all">Всі пріоритети</option>
            <option value="high">Високий</option>
            <option value="medium">Середній</option>
            <option value="low">Низький</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="divide-y divide-gray-200">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-6 border-l-4 ${getAlertColor(alert.type)} ${
                !alert.isRead ? 'bg-opacity-100' : 'bg-opacity-50'
              } hover:bg-opacity-75 transition-colors`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    {getAlertIcon(alert.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className={`font-medium ${!alert.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                        {alert.title}
                      </h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(alert.priority)}`}>
                        {getPriorityText(alert.priority)}
                      </span>
                      <div className="flex items-center space-x-1 text-gray-500">
                        {getCategoryIcon(alert.category)}
                        <span className="text-xs">{getCategoryText(alert.category)}</span>
                      </div>
                    </div>
                    
                    <p className={`text-sm mb-3 ${!alert.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                      {alert.message}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTime(alert.timestamp)}
                      </div>
                      <div className="flex items-center">
                        <span>{alert.location}</span>
                      </div>
                      {alert.driver && (
                        <div className="flex items-center">
                          <span>Водій: {alert.driver}</span>
                        </div>
                      )}
                      {alert.relatedId && (
                        <div className="flex items-center">
                          <span>ID: {alert.relatedId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {!alert.isRead && (
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                  <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAlerts.length === 0 && (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Сповіщення не знайдено</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsApp;