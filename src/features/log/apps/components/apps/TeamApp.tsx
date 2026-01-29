import React, { useState } from 'react';
import { Users, Phone, Mail, MapPin, Clock, Star, Plus, Search, Filter } from 'lucide-react';

const TeamApp: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedMember, setSelectedMember] = useState(null);

  const teamMembers = [
    {
      id: 1,
      name: 'Іван Петренко',
      role: 'driver',
      avatar: null,
      phone: '+380 67 123 4567',
      email: 'ivan.petrenko@company.com',
      status: 'active',
      location: 'Харків, вул. Сумська 25',
      experience: '5 років',
      rating: 4.8,
      completedDeliveries: 1247,
      vehicle: 'Mercedes Actros (AA1234BB)',
      shift: '08:00 - 20:00',
      specializations: ['Міжміські перевезення', 'Великогабаритні вантажі'],
      lastActivity: '5 хв тому'
    },
    {
      id: 2,
      name: 'Марія Коваль',
      role: 'driver',
      avatar: null,
      phone: '+380 95 987 6543',
      email: 'maria.koval@company.com',
      status: 'on_route',
      location: 'Київ - Одеса (в дорозі)',
      experience: '3 роки',
      rating: 4.9,
      completedDeliveries: 892,
      vehicle: 'Volvo FH16 (BC5678CD)',
      shift: '18:00 - 06:00',
      specializations: ['Нічні рейси', 'Швидкі доставки'],
      lastActivity: '12 хв тому'
    },
    {
      id: 3,
      name: 'Олег Сидоров',
      role: 'driver',
      avatar: null,
      phone: '+380 63 456 7890',
      email: 'oleg.sidorov@company.com',
      status: 'break',
      location: 'Дніпро, склад №3',
      experience: '7 років',
      rating: 4.7,
      completedDeliveries: 1856,
      vehicle: 'MAN TGX (DE9012EF)',
      shift: '06:00 - 18:00',
      specializations: ['Небезпечні вантажі', 'Рефрижератори'],
      lastActivity: '1 год тому'
    },
    {
      id: 4,
      name: 'Анна Мельник',
      role: 'dispatcher',
      avatar: null,
      phone: '+380 50 234 5678',
      email: 'anna.melnyk@company.com',
      status: 'active',
      location: 'Офіс, Київ',
      experience: '4 роки',
      rating: 4.9,
      completedTasks: 2341,
      department: 'Диспетчерська служба',
      shift: '09:00 - 21:00',
      specializations: ['Планування маршрутів', 'Координація доставок'],
      lastActivity: '2 хв тому'
    },
    {
      id: 5,
      name: 'Петро Іваненко',
      role: 'manager',
      avatar: null,
      phone: '+380 44 567 8901',
      email: 'petro.ivanenko@company.com',
      status: 'active',
      location: 'Офіс, Київ',
      experience: '8 років',
      rating: 4.8,
      completedProjects: 156,
      department: 'Логістичний відділ',
      shift: '08:00 - 17:00',
      specializations: ['Управління проектами', 'Оптимізація процесів'],
      lastActivity: 'Зараз онлайн'
    },
    {
      id: 6,
      name: 'Світлана Коваленко',
      role: 'warehouse',
      avatar: null,
      phone: '+380 67 890 1234',
      email: 'svitlana.kovalenko@company.com',
      status: 'active',
      location: 'Склад №1, Київ',
      experience: '2 роки',
      rating: 4.6,
      completedOperations: 3421,
      department: 'Складське господарство',
      shift: '07:00 - 16:00',
      specializations: ['Інвентаризація', 'Контроль якості'],
      lastActivity: '15 хв тому'
    }
  ];

  const roles = [
    { id: 'all', name: 'Всі співробітники', count: teamMembers.length },
    { id: 'driver', name: 'Водії', count: teamMembers.filter(m => m.role === 'driver').length },
    { id: 'dispatcher', name: 'Диспетчери', count: teamMembers.filter(m => m.role === 'dispatcher').length },
    { id: 'manager', name: 'Менеджери', count: teamMembers.filter(m => m.role === 'manager').length },
    { id: 'warehouse', name: 'Складські', count: teamMembers.filter(m => m.role === 'warehouse').length }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'on_route':
        return 'bg-blue-100 text-blue-800';
      case 'break':
        return 'bg-yellow-100 text-yellow-800';
      case 'offline':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Активний';
      case 'on_route':
        return 'В дорозі';
      case 'break':
        return 'Перерва';
      case 'offline':
        return 'Офлайн';
      default:
        return 'Невідомо';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'driver':
        return 'Водій';
      case 'dispatcher':
        return 'Диспетчер';
      case 'manager':
        return 'Менеджер';
      case 'warehouse':
        return 'Складський';
      default:
        return 'Співробітник';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'driver':
        return '🚛';
      case 'dispatcher':
        return '📋';
      case 'manager':
        return '👔';
      case 'warehouse':
        return '📦';
      default:
        return '👤';
    }
  };

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || member.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Users className="w-8 h-8 text-pink-600" />
          <h3 className="text-2xl font-bold text-gray-900">Команда</h3>
        </div>
        <button className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Додати співробітника
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Пошук співробітників..."
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              {roles.map(role => (
                <option key={role.id} value={role.id}>
                  {role.name} ({role.count})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <div key={member.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                <span className="text-pink-600 font-semibold text-lg">
                  {getInitials(member.name)}
                </span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{member.name}</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {getRoleIcon(member.role)} {getRoleText(member.role)}
                  </span>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(member.status)}`}>
                {getStatusText(member.status)}
              </span>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                {member.phone}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-2" />
                {member.email}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                {member.location}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                {member.shift}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-semibold text-gray-900">
                  {member.role === 'driver' ? member.completedDeliveries :
                   member.role === 'dispatcher' ? member.completedTasks :
                   member.role === 'manager' ? member.completedProjects :
                   member.completedOperations}
                </div>
                <div className="text-xs text-gray-500">
                  {member.role === 'driver' ? 'Доставок' :
                   member.role === 'dispatcher' ? 'Завдань' :
                   member.role === 'manager' ? 'Проектів' :
                   'Операцій'}
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-lg font-semibold text-gray-900">{member.rating}</span>
                </div>
                <div className="text-xs text-gray-500">Рейтинг</div>
              </div>
            </div>

            {/* Specializations */}
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Спеціалізації:</div>
              <div className="flex flex-wrap gap-1">
                {member.specializations.map((spec, index) => (
                  <span key={index} className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full">
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Vehicle Info (for drivers) */}
            {member.role === 'driver' && member.vehicle && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-900">Транспорт:</div>
                <div className="text-sm text-blue-700">{member.vehicle}</div>
              </div>
            )}

            {/* Department Info (for non-drivers) */}
            {member.role !== 'driver' && member.department && (
              <div className="mb-4 p-3 bg-green-50 rounded-lg">
                <div className="text-sm font-medium text-green-900">Відділ:</div>
                <div className="text-sm text-green-700">{member.department}</div>
              </div>
            )}

            {/* Last Activity */}
            <div className="text-xs text-gray-500 mb-4">
              Остання активність: {member.lastActivity}
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <button className="flex-1 px-3 py-2 bg-pink-600 text-white text-sm rounded-lg hover:bg-pink-700 transition-colors">
                <Phone className="w-4 h-4 inline mr-1" />
                Зателефонувати
              </button>
              <button className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors">
                <Mail className="w-4 h-4 inline mr-1" />
                Написати
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Співробітники не знайдені</p>
        </div>
      )}
    </div>
  );
};

export default TeamApp;