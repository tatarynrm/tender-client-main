import React, { useState } from 'react';
import { MapPin, Route, Clock, Fuel, Plus, Navigation, Truck, AlertCircle } from 'lucide-react';

const RoutesApp: React.FC = () => {
  const [selectedRoute, setSelectedRoute] = useState('route1');

  const routes = [
    {
      id: 'route1',
      name: 'Київ - Харків - Дніпро',
      driver: 'Іван Петренко',
      vehicle: 'Mercedes Actros (AA1234BB)',
      status: 'active',
      progress: 45,
      totalDistance: 520,
      remainingDistance: 286,
      estimatedTime: '6г 30хв',
      fuelConsumption: 130,
      stops: [
        { city: 'Київ', address: 'вул. Промислова 15', time: '08:00', status: 'completed', type: 'pickup' },
        { city: 'Полтава', address: 'вул. Соборності 45', time: '11:30', status: 'current', type: 'delivery' },
        { city: 'Харків', address: 'вул. Сумська 25', time: '14:30', status: 'pending', type: 'delivery' },
        { city: 'Дніпро', address: 'просп. Яворницького 12', time: '18:00', status: 'pending', type: 'delivery' }
      ]
    },
    {
      id: 'route2',
      name: 'Львів - Тернопіль - Івано-Франківськ',
      driver: 'Марія Коваль',
      vehicle: 'Volvo FH16 (BC5678CD)',
      status: 'planned',
      progress: 0,
      totalDistance: 280,
      remainingDistance: 280,
      estimatedTime: '4г 15хв',
      fuelConsumption: 70,
      stops: [
        { city: 'Львів', address: 'вул. Городоцька 89', time: '09:00', status: 'pending', type: 'pickup' },
        { city: 'Тернопіль', address: 'вул. Руська 15', time: '11:45', status: 'pending', type: 'delivery' },
        { city: 'Івано-Франківськ', address: 'вул. Незалежності 34', time: '13:15', status: 'pending', type: 'delivery' }
      ]
    },
    {
      id: 'route3',
      name: 'Одеса - Миколаїв - Херсон',
      driver: 'Олег Сидоров',
      vehicle: 'MAN TGX (DE9012EF)',
      status: 'completed',
      progress: 100,
      totalDistance: 195,
      remainingDistance: 0,
      estimatedTime: '0г 0хв',
      fuelConsumption: 48,
      stops: [
        { city: 'Одеса', address: 'вул. Дерибасівська 12', time: '07:00', status: 'completed', type: 'pickup' },
        { city: 'Миколаїв', address: 'вул. Соборна 28', time: '09:30', status: 'completed', type: 'delivery' },
        { city: 'Херсон', address: 'просп. Ушакова 47', time: '11:45', status: 'completed', type: 'delivery' }
      ]
    }
  ];

  const currentRoute = routes.find(r => r.id === selectedRoute) || routes[0];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'planned':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'delayed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Активний';
      case 'planned':
        return 'Запланований';
      case 'completed':
        return 'Завершений';
      case 'delayed':
        return 'Затримка';
      default:
        return 'Невідомо';
    }
  };

  const getStopStatusIcon = (status: string) => {
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

  const getStopTypeIcon = (type: string) => {
    return type === 'pickup' ? 
      <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
      </div> :
      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      </div>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Route className="w-8 h-8 text-indigo-600" />
          <h3 className="text-2xl font-bold text-gray-900">Планування маршрутів</h3>
        </div>
        <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Новий маршрут
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Routes List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900">Маршрути</h4>
          </div>
          <div className="divide-y divide-gray-200">
            {routes.map((route) => (
              <button
                key={route.id}
                onClick={() => setSelectedRoute(route.id)}
                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                  selectedRoute === route.id ? 'bg-indigo-50 border-r-2 border-indigo-500' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 text-sm">{route.name}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(route.status)}`}>
                    {getStatusText(route.status)}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-1">{route.driver}</div>
                <div className="text-xs text-gray-500 mb-2">{route.vehicle}</div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{route.totalDistance} км</span>
                  <span>{route.estimatedTime}</span>
                </div>
                {route.status === 'active' && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300" 
                        style={{ width: `${route.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Route Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Route Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-xl font-semibold text-gray-900">{currentRoute.name}</h4>
                <p className="text-gray-600">{currentRoute.driver} • {currentRoute.vehicle}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentRoute.status)}`}>
                {getStatusText(currentRoute.status)}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <MapPin className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <div className="text-sm text-gray-500">Загальна відстань</div>
                <div className="text-lg font-semibold text-gray-900">{currentRoute.totalDistance} км</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Clock className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <div className="text-sm text-gray-500">Час в дорозі</div>
                <div className="text-lg font-semibold text-gray-900">{currentRoute.estimatedTime}</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Fuel className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <div className="text-sm text-gray-500">Витрата палива</div>
                <div className="text-lg font-semibold text-gray-900">{currentRoute.fuelConsumption} л</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Navigation className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <div className="text-sm text-gray-500">Залишилось</div>
                <div className="text-lg font-semibold text-gray-900">{currentRoute.remainingDistance} км</div>
              </div>
            </div>

            {currentRoute.status === 'active' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Прогрес маршруту</span>
                  <span className="text-sm text-gray-500">{currentRoute.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${currentRoute.progress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Route Stops */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Зупинки маршруту</h4>
            
            <div className="space-y-4">
              {currentRoute.stops.map((stop, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex flex-col items-center">
                    {getStopStatusIcon(stop.status)}
                    {index < currentRoute.stops.length - 1 && (
                      <div className={`w-0.5 h-12 mt-2 ${
                        stop.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        {getStopTypeIcon(stop.type)}
                        <div className={`font-medium ${
                          stop.status === 'current' ? 'text-blue-600' : 
                          stop.status === 'completed' ? 'text-green-600' : 'text-gray-900'
                        }`}>
                          {stop.city}
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          stop.type === 'pickup' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {stop.type === 'pickup' ? 'Забір' : 'Доставка'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">{stop.time}</div>
                    </div>
                    <div className="text-sm text-gray-600">{stop.address}</div>
                    {stop.status === 'current' && (
                      <div className="text-sm text-blue-600 mt-1 font-medium">Поточна зупинка</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Route Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Дії з маршрутом</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                <Navigation className="w-4 h-4 mr-2" />
                Показати на карті
              </button>
              
              <button className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Truck className="w-4 h-4 mr-2" />
                Оптимізувати маршрут
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

export default RoutesApp;