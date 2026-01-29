import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Wind, Thermometer, Droplets, Eye, Gauge } from 'lucide-react';

const WeatherApp: React.FC = () => {
  const [currentWeather, setCurrentWeather] = useState({
    temperature: 22,
    condition: 'Хмарно',
    humidity: 65,
    windSpeed: 12,
    visibility: 10,
    pressure: 1013,
    feelsLike: 24,
    uvIndex: 3
  });

  const [forecast, setForecast] = useState([
    { day: 'Сьогодні', high: 25, low: 18, condition: 'Хмарно', icon: 'cloud' },
    { day: 'Завтра', high: 28, low: 20, condition: 'Сонячно', icon: 'sun' },
    { day: 'Післязавтра', high: 23, low: 16, condition: 'Дощ', icon: 'rain' },
    { day: 'Четвер', high: 26, low: 19, condition: 'Частково хмарно', icon: 'cloud' },
    { day: 'П\'ятниця', high: 29, low: 22, condition: 'Сонячно', icon: 'sun' },
  ]);

  const [logisticsImpact, setLogisticsImpact] = useState({
    deliveryRisk: 'Низький',
    roadConditions: 'Хороші',
    recommendation: 'Оптимальні умови для доставки',
    delayProbability: 15
  });

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sun':
        return <Sun className="w-8 h-8 text-yellow-500" />;
      case 'cloud':
        return <Cloud className="w-8 h-8 text-gray-500" />;
      case 'rain':
        return <CloudRain className="w-8 h-8 text-blue-500" />;
      default:
        return <Cloud className="w-8 h-8 text-gray-500" />;
    }
  };

  const getImpactColor = (risk: string) => {
    switch (risk) {
      case 'Низький':
        return 'text-green-600 bg-green-100';
      case 'Середній':
        return 'text-yellow-600 bg-yellow-100';
      case 'Високий':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Sun className="w-8 h-8 text-yellow-500" />
        <h3 className="text-2xl font-bold text-gray-900">Погода для логістики</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Weather */}
        <div className="lg:col-span-2 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-lg font-medium opacity-90">Київ, Україна</h4>
              <p className="text-sm opacity-75">Зараз</p>
            </div>
            <Cloud className="w-12 h-12 opacity-80" />
          </div>

          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-5xl font-light mb-2">{currentWeather.temperature}°</div>
              <div className="text-lg opacity-90">{currentWeather.condition}</div>
              <div className="text-sm opacity-75">Відчувається як {currentWeather.feelsLike}°</div>
            </div>
          </div>

          {/* Weather Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <div className="flex items-center mb-2">
                <Wind className="w-4 h-4 mr-2" />
                <span className="text-sm">Вітер</span>
              </div>
              <div className="text-lg font-semibold">{currentWeather.windSpeed} км/г</div>
            </div>

            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <div className="flex items-center mb-2">
                <Droplets className="w-4 h-4 mr-2" />
                <span className="text-sm">Вологість</span>
              </div>
              <div className="text-lg font-semibold">{currentWeather.humidity}%</div>
            </div>

            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <div className="flex items-center mb-2">
                <Eye className="w-4 h-4 mr-2" />
                <span className="text-sm">Видимість</span>
              </div>
              <div className="text-lg font-semibold">{currentWeather.visibility} км</div>
            </div>

            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <div className="flex items-center mb-2">
                <Gauge className="w-4 h-4 mr-2" />
                <span className="text-sm">Тиск</span>
              </div>
              <div className="text-lg font-semibold">{currentWeather.pressure} мб</div>
            </div>
          </div>
        </div>

        {/* Logistics Impact */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Вплив на логістику</h4>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Ризик доставки</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(logisticsImpact.deliveryRisk)}`}>
                  {logisticsImpact.deliveryRisk}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Стан доріг</span>
                <span className="text-sm text-gray-900">{logisticsImpact.roadConditions}</span>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Ймовірність затримки</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${logisticsImpact.delayProbability}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">{logisticsImpact.delayProbability}%</div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="text-sm font-medium text-gray-700 mb-2">Рекомендація</div>
              <div className="text-sm text-gray-900 bg-green-50 p-3 rounded-lg">
                {logisticsImpact.recommendation}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Day Forecast */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Прогноз на 5 днів</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {forecast.map((day, index) => (
            <div key={index} className="text-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-sm font-medium text-gray-700 mb-2">{day.day}</div>
              <div className="flex justify-center mb-3">
                {getWeatherIcon(day.icon)}
              </div>
              <div className="text-sm text-gray-600 mb-2">{day.condition}</div>
              <div className="flex justify-center space-x-2">
                <span className="font-semibold text-gray-900">{day.high}°</span>
                <span className="text-gray-500">{day.low}°</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weather Alerts for Logistics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Попередження для логістики</h4>
        
        <div className="space-y-3">
          <div className="flex items-start p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <div>
              <div className="text-sm font-medium text-yellow-800">Сильний вітер завтра</div>
              <div className="text-sm text-yellow-700">Очікується вітер до 25 км/г. Рекомендується обережність при перевезенні високих вантажів.</div>
            </div>
          </div>

          <div className="flex items-start p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <div>
              <div className="text-sm font-medium text-blue-800">Дощ у четвер</div>
              <div className="text-sm text-blue-700">Можливі затримки через погіршення видимості та мокрі дороги.</div>
            </div>
          </div>

          <div className="flex items-start p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <div>
              <div className="text-sm font-medium text-green-800">Сприятливі умови</div>
              <div className="text-sm text-green-700">П'ятниця буде ідеальним днем для довгих маршрутів та термінових доставок.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherApp;