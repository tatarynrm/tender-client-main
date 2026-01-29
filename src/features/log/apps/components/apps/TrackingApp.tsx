import React, { useState } from 'react';
import { Truck, MapPin, Clock, Package, Navigation, Phone, AlertCircle } from 'lucide-react';

const TrackingApp: React.FC = () => {
  const [selectedDelivery, setSelectedDelivery] = useState('D001');

  const deliveries = [
    {
      id: 'D001',
      client: 'ТОВ "Епіцентр"',
      driver: 'Іван Петренко',
      phone: '+380 67 123 4567',
      status: 'В дорозі',
      progress: 65,
      currentLocation: 'Бориспіль, Київська обл.',
      destination: 'Харків, вул. Сумська 25',
      estimatedArrival: '14:30',
      distance: '45 км',
      cargo: 'Будівельні матеріали',
      weight: '2.5 т',
      route: [
        { location: 'Київ (склад)', time: '08:00', status: 'completed' },
        { location: 'Бориспіль', time: '09:15', status: 'completed' },
        { location: 'Полтава', time: '11:30', status: 'current' },
        { location: 'Харків', time: '14:30', status: 'pending' }
      ]
    },
    {
      id: 'D002',
      client: 'Сільпо',
      driver: 'Марія Коваль',
      phone: '+380 95 987 6543',
      status: 'Доставлено',
      progress: 100,
      currentLocation: 'Одеса, вул. Дерибасівська 12',
      destination: 'Одеса, вул. Дерибасівська 12',
      estimatedArrival: '13:45',
      distance: '0 км',
      cargo: 'Продукти харчування',
      weight: '1.8 т',
      route: [
        { location: 'Київ (склад)', time: '06:00', status: 'completed' },
        { location: 'Умань', time: '08:30', status: 'completed' },
        { location: 'Миколаїв', time: '11:00', status: 'completed' },
        { location: 'Одеса', time: '13:45', status: 'completed' }
      ]
    },
    {
      id: 'D003',
      client: 'АТБ',
      driver: 'Олег Сидоров',
      phone: '+380 63 456 7890',
      status: 'Завантаження',
      progress: 15,
      currentLocation: 'Київ, склад №3',
      destination: 'Львів, вул. Городоцька 89',
      estimatedArrival: '18:00',
      distance: '540 км',
      cargo: 'Побутова техніка',
      weight: '3.2 т',
      route: [
        { location: 'Київ (склад)', time: '12:00', status: 'current' },
        { location: 'Житомир', time: '14:30', status: 'pending' },
        { location: 'Рівне', time: '16:00', status: 'pending' },
        { location: 'Львів', time: '18:00', status: 'pending' }
      ]
    }
  ];

  const currentDelivery = deliveries.find(d => d.id === selectedDelivery) || deliveries[0];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Доставлено':
        return 'bg-green-100 text-green-800';
      case 'В дорозі':
        return 'bg-blue-100 text-blue-800';
      case 'Завантаження':
        return 'bg-yellow-100 text-yellow-800';
      case 'Затримка':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRouteStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <div className="w-3 h-3 bg-green-500 rounded-full"></div>;
      case 'current':
        return <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>;
      case 'pending':
        return <div className="w-3 h-3 bg-gray-300 rounded-full"></div>;
      default:
        return <div className="w-3 h-3 bg-gray-300 rounded-full"></div>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Truck className="w-8 h-8 text-blue-600" />
        <h3 className="text-2xl font-bold text-gray-900">Відстеження доставок</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Delivery List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900">Активні доставки</h4>
          </div>
          <div className="divide-y divide-gray-200">
            {deliveries.map((delivery) => (
              <button
                key={delivery.id}
                onClick={() => setSelectedDelivery(delivery.id)}
                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                  selectedDelivery === delivery.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{delivery.id}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                    {delivery.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-1">{delivery.client}</div>
                <div className="text-sm text-gray-500">{delivery.driver}</div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" 
                      style={{ width: `${delivery.progress}%` }}
                    ></div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Delivery Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-xl font-semibold text-gray-900">{currentDelivery.id}</h4>
                <p className="text-gray-600">{currentDelivery.client}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentDelivery.status)}`}>
                {currentDelivery.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Поточне місцезнаходження</div>
                    <div className="font-medium text-gray-900">{currentDelivery.currentLocation}</div>
                  </div>
                </div>

                <div className="flex items-center">
                  <Navigation className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Пункт призначення</div>
                    <div className="font-medium text-gray-900">{currentDelivery.destination}</div>
                  </div>
                </div>

                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Очікуваний час прибуття</div>
                    <div className="font-medium text-gray-900">{currentDelivery.estimatedArrival}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <Truck className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Водій</div>
                    <div className="font-medium text-gray-900">{currentDelivery.driver}</div>
                  </div>
                </div>

                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Телефон</div>
                    <div className="font-medium text-gray-900">{currentDelivery.phone}</div>
                  </div>
                </div>

                <div className="flex items-center">
                  <Package className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Вантаж</div>
                    <div className="font-medium text-gray-900">{currentDelivery.cargo} ({currentDelivery.weight})</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Прогрес доставки</span>
                <span className="text-sm text-gray-500">{currentDelivery.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${currentDelivery.progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Route Timeline */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Маршрут доставки</h4>
            
            <div className="space-y-4">
              {currentDelivery.route.map((stop, index) => (
                <div key={index} className="flex items-center">
                  <div className="flex flex-col items-center mr-4">
                    {getRouteStatusIcon(stop.status)}
                    {index < currentDelivery.route.length - 1 && (
                      <div className={`w-0.5 h-8 mt-2 ${
                        stop.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className={`font-medium ${
                        stop.status === 'current' ? 'text-blue-600' : 
                        stop.status === 'completed' ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {stop.location}
                      </div>
                      <div className="text-sm text-gray-500">{stop.time}</div>
                    </div>
                    {stop.status === 'current' && (
                      <div className="text-sm text-blue-600 mt-1">Поточне місцезнаходження</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Швидкі дії</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Phone className="w-4 h-4 mr-2" />
                Зв'язатися з водієм
              </button>
              
              <button className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <MapPin className="w-4 h-4 mr-2" />
                Показати на карті
              </button>
              
              <button className="flex items-center justify-center px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                <AlertCircle className="w-4 h-4 mr-2" />
                Повідомити про проблему
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingApp;