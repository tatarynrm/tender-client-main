'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, Calculator, CloudSun, Truck, Package, MapPin, Clock, BarChart3, Users, Bell, Settings } from 'lucide-react';
import {
  DashboardApp,
  CalendarApp,
  CalculatorApp,
  WeatherApp,
  TrackingApp,
  InventoryApp,
  RoutesApp,
  ScheduleApp,
  TeamApp,
  AlertsApp,
  SettingsApp
} from './apps';

interface LogisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LogisticsModal: React.FC<LogisticsModalProps> = ({ isOpen, onClose }) => {
  const [activeApp, setActiveApp] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const menuItems = [
    { id: 'dashboard', name: 'Дашборд', icon: BarChart3, color: 'bg-blue-500' },
    { id: 'calendar', name: 'Календар', icon: Calendar, color: 'bg-red-500' },
    { id: 'calculator', name: 'Калькулятор', icon: Calculator, color: 'bg-gray-700' },
    { id: 'weather', name: 'Погода', icon: CloudSun, color: 'bg-yellow-500' },
    { id: 'tracking', name: 'Відстеження', icon: Truck, color: 'bg-green-500' },
    { id: 'inventory', name: 'Склад', icon: Package, color: 'bg-purple-500' },
    { id: 'routes', name: 'Маршрути', icon: MapPin, color: 'bg-indigo-500' },
    { id: 'schedule', name: 'Розклад', icon: Clock, color: 'bg-orange-500' },
    { id: 'team', name: 'Команда', icon: Users, color: 'bg-pink-500' },
    { id: 'alerts', name: 'Сповіщення', icon: Bell, color: 'bg-red-600' },
    { id: 'settings', name: 'Налаштування', icon: Settings, color: 'bg-gray-600' },
  ];

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="relative w-full h-full max-w-7xl max-h-screen bg-white rounded-none md:rounded-2xl md:m-4 md:h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Логістичний Центр</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="flex h-full">
          {/* Sidebar */}
          <div className={`${isMobile ? 'w-20' : 'w-64'} bg-gray-100 border-r border-gray-200 overflow-y-auto`}>
            <div className="p-4">
              <div className={`grid ${isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-3 gap-3'}`}>
                {menuItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveApp(item.id)}
                      className={`${item.color} ${isMobile ? 'w-12 h-12' : 'w-16 h-16'} rounded-xl flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 ${
                        activeApp === item.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                      }`}
                    >
                      <IconComponent className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-white`} />
                    </button>
                  );
                })}
              </div>
              
              {!isMobile && (
                <div className="mt-6 space-y-2">
                  {menuItems.map((item) => (
                    <button
                      key={`text-${item.id}`}
                      onClick={() => setActiveApp(item.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeApp === item.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {activeApp === 'dashboard' && <DashboardApp />}
              {activeApp === 'calendar' && <CalendarApp />}
              {activeApp === 'calculator' && <CalculatorApp />}
              {activeApp === 'weather' && <WeatherApp />}
              {activeApp === 'tracking' && <TrackingApp />}
              {activeApp === 'inventory' && <InventoryApp />}
              {activeApp === 'routes' && <RoutesApp />}
              {activeApp === 'schedule' && <ScheduleApp />}
              {activeApp === 'team' && <TeamApp />}
              {activeApp === 'alerts' && <AlertsApp />}
              {activeApp === 'settings' && <SettingsApp />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogisticsModal;