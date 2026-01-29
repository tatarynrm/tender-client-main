'use client';

import React, { useState } from 'react';
import LogisticsModal from '../components/LogisticsModal';

const LogisticsModalExample: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Логістичний Центр Управління
        </h1>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
        >
          Відкрити Логістичний Центр
        </button>
        
        <div className="mt-8 text-gray-600 max-w-2xl mx-auto">
          <p className="mb-4">
            Повнофункціональний логістичний центр з Apple-стилем дизайну, 
            оптимізований для всіх пристроїв - від мобільних до великих моніторів.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 text-sm">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-blue-600 font-semibold">📊 Дашборд</div>
              <div>Аналітика та статистика</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-red-600 font-semibold">📅 Календар</div>
              <div>Планування подій</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-gray-700 font-semibold">🧮 Калькулятор</div>
              <div>Логістичні розрахунки</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-yellow-600 font-semibold">🌤️ Погода</div>
              <div>Прогноз для логістики</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-green-600 font-semibold">🚛 Відстеження</div>
              <div>Моніторинг доставок</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-purple-600 font-semibold">📦 Склад</div>
              <div>Управління товарами</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-indigo-600 font-semibold">🗺️ Маршрути</div>
              <div>Планування доставок</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-orange-600 font-semibold">⏰ Розклад</div>
              <div>Графік роботи</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-pink-600 font-semibold">👥 Команда</div>
              <div>Управління персоналом</div>
            </div>
          </div>
        </div>
      </div>

      <LogisticsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default LogisticsModalExample;