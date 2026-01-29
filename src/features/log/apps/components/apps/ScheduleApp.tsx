import React, { useState } from 'react';
import { Clock, User, Truck, Calendar, Plus, Filter, CheckCircle, AlertCircle } from 'lucide-react';

const ScheduleApp: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('day'); // day, week, month
  const [filterType, setFilterType] = useState('all'); // all, drivers, vehicles, deliveries

  const scheduleItems = [
    {
      id: 1,
      title: 'Доставка в Епіцентр',
      type: 'delivery',
      time: '09:00 - 11:00',
      driver: 'Іван Петренко',
      vehicle: 'Mercedes Actros (AA1234BB)',
      status: 'scheduled',
      priority: 'high',
      location: 'Харків, вул. Сумська 25',
      date: '2024-01-15'
    },
    {
      id: 2,
      title: 'Технічне обслуговування',
      type: 'maintenance',
      time: '14:00 - 16:00',
      driver: null,
      vehicle: 'Volvo FH16 (BC5678CD)',
      status: 'in_progress',
      priority: 'medium',
      location: 'СТО "Автосервіс+"',
      date: '2024-01-15'
    },
    {
      id: 3,
      title: 'Зміна водія',
      type: 'shift',
      time: '18:00 - 06:00',
      driver: 'Марія Коваль',
      vehicle: 'MAN TGX (DE9012EF)',
      status: 'scheduled',
      priority: 'low',
      location: 'Київ - Одеса',
      date: '2024-01-15'
    },
    {
      id: 4,
      title: 'Завантаження товару',
      type: 'loading',
      time: '08:00 - 09:30',
      driver: 'Олег Сидоров',
      vehicle: 'DAF XF (GH3456IJ)',
      status: 'completed',
      priority: 'high',
      location: 'Склад №1, Київ',
      date: '2024-01-15'
    },
    {
      id: 5,
      title: 'Планова перевірка документів',
      type: 'inspection',
      time: '12:00 - 13:00',
      driver: 'Андрій Мельник',
      vehicle: 'Scania R450 (KL7890MN)',
      status: 'scheduled',
      priority: 'medium',
      location: 'Офіс, Київ',
      date: '2024-01-15'
    }
  ];

  const drivers = [
    { id: 1, name: 'Іван Петренко', status: 'active', shift: '08:00 - 20:00', phone: '+380 67 123 4567' },
    { id: 2, name: 'Марія Коваль', status: 'active', shift: '18:00 - 06:00', phone: '+380 95 987 6543' },
    { id: 3, name: 'Олег Сидоров', status: 'break', shift: '06:00 - 18:00', phone: '+380 63 456 7890' },
    { id: 4, name: 'Андрій Мельник', status: 'active', shift: '09:00 - 21:00', phone: '+380 50 234 5678' }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'delivery':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'shift':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'loading':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inspection':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'delivery':
        return 'Доставка';
      case 'maintenance':
        return 'ТО';
      case 'shift':
        return 'Зміна';
      case 'loading':
        return 'Завантаження';
      case 'inspection':
        return 'Перевірка';
      default:
        return 'Інше';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'in_progress':
        return 'text-blue-600';
      case 'scheduled':
        return 'text-gray-600';
      case 'delayed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'scheduled':
        return <Calendar className="w-4 h-4 text-gray-600" />;
      case 'delayed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-300';
    }
  };

  const getDriverStatus = (status: string) => {
    switch (status) {
      case 'active':
        return { color: 'bg-green-100 text-green-800', text: 'Активний' };
      case 'break':
        return { color: 'bg-yellow-100 text-yellow-800', text: 'Перерва' };
      case 'offline':
        return { color: 'bg-gray-100 text-gray-800', text: 'Офлайн' };
      default:
        return { color: 'bg-gray-100 text-gray-800', text: 'Невідомо' };
    }
  };

  const filteredItems = scheduleItems.filter(item => {
    if (filterType === 'all') return true;
    if (filterType === 'drivers' && item.driver) return true;
    if (filterType === 'vehicles' && item.vehicle) return true;
    if (filterType === 'deliveries' && item.type === 'delivery') return true;
    return false;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Clock className="w-8 h-8 text-orange-600" />
          <h3 className="text-2xl font-bold text-gray-900">Розклад роботи</h3>
        </div>
        <button className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Додати подію
        </button>
      </div>

      {/* Filters and View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">Всі події</option>
              <option value="drivers">Водії</option>
              <option value="vehicles">Транспорт</option>
              <option value="deliveries">Доставки</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('day')}
            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
              viewMode === 'day' ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            День
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
              viewMode === 'week' ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Тиждень
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
              viewMode === 'month' ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Місяць
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Schedule Timeline */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900">
              Розклад на {selectedDate.toLocaleDateString('uk-UA', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h4>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`border-l-4 ${getPriorityColor(item.priority)} bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusIcon(item.status)}
                        <h5 className="font-medium text-gray-900">{item.title}</h5>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getTypeColor(item.type)}`}>
                          {getTypeText(item.type)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          {item.time}
                        </div>
                        {item.driver && (
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            {item.driver}
                          </div>
                        )}
                        {item.vehicle && (
                          <div className="flex items-center">
                            <Truck className="w-4 h-4 mr-2" />
                            {item.vehicle}
                          </div>
                        )}
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {item.location}
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <button className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Drivers Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900">Статус водіїв</h4>
          </div>
          
          <div className="p-4 space-y-4">
            {drivers.map((driver) => {
              const status = getDriverStatus(driver.status);
              return (
                <div key={driver.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 text-sm">{driver.name}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                      {status.text}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>Зміна: {driver.shift}</div>
                    <div>{driver.phone}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Stats */}
          <div className="p-4 border-t border-gray-200">
            <h5 className="font-medium text-gray-900 mb-3">Статистика дня</h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Заплановано:</span>
                <span className="font-medium">{scheduleItems.filter(i => i.status === 'scheduled').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">В процесі:</span>
                <span className="font-medium">{scheduleItems.filter(i => i.status === 'in_progress').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Завершено:</span>
                <span className="font-medium">{scheduleItems.filter(i => i.status === 'completed').length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleApp;