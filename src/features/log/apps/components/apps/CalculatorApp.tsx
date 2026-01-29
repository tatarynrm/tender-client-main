import React, { useState } from 'react';
import { Calculator, Truck, Package, DollarSign } from 'lucide-react';

const CalculatorApp: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Logistics calculation states
  const [distance, setDistance] = useState('');
  const [fuelPrice, setFuelPrice] = useState('');
  const [consumption, setConsumption] = useState('');
  const [weight, setWeight] = useState('');
  const [volume, setVolume] = useState('');

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string) => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return firstValue / secondValue;
      default:
        return secondValue;
    }
  };

  const performCalculation = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  // Logistics calculations
  const calculateFuelCost = () => {
    const dist = parseFloat(distance);
    const price = parseFloat(fuelPrice);
    const cons = parseFloat(consumption);
    
    if (dist && price && cons) {
      return ((dist / 100) * cons * price).toFixed(2);
    }
    return '0';
  };

  const calculateLoadCapacity = () => {
    const w = parseFloat(weight);
    const v = parseFloat(volume);
    
    if (w && v) {
      const density = w / v;
      return {
        density: density.toFixed(2),
        efficiency: ((w / 1000) * 100).toFixed(1) // Assuming 1000kg max capacity
      };
    }
    return { density: '0', efficiency: '0' };
  };

  const Button: React.FC<{ onClick: () => void; className?: string; children: React.ReactNode }> = ({ 
    onClick, 
    className = '', 
    children 
  }) => (
    <button
      onClick={onClick}
      className={`h-12 rounded-lg font-semibold transition-all duration-150 active:scale-95 ${className}`}
    >
      {children}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Calculator className="w-8 h-8 text-gray-700" />
        <h3 className="text-2xl font-bold text-gray-900">Логістичний калькулятор</h3>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('basic')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'basic' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Базовий
        </button>
        <button
          onClick={() => setActiveTab('logistics')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'logistics' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Логістика
        </button>
      </div>

      {activeTab === 'basic' ? (
        /* Basic Calculator */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-md mx-auto">
          {/* Display */}
          <div className="mb-4 p-4 bg-gray-900 rounded-lg">
            <div className="text-right text-white text-2xl font-mono overflow-hidden">
              {display}
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-4 gap-3">
            <Button
              onClick={clear}
              className="col-span-2 bg-gray-200 hover:bg-gray-300 text-gray-800"
            >
              Clear
            </Button>
            <Button
              onClick={() => inputOperation('÷')}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              ÷
            </Button>
            <Button
              onClick={() => inputOperation('×')}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              ×
            </Button>

            <Button
              onClick={() => inputNumber('7')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800"
            >
              7
            </Button>
            <Button
              onClick={() => inputNumber('8')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800"
            >
              8
            </Button>
            <Button
              onClick={() => inputNumber('9')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800"
            >
              9
            </Button>
            <Button
              onClick={() => inputOperation('-')}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              -
            </Button>

            <Button
              onClick={() => inputNumber('4')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800"
            >
              4
            </Button>
            <Button
              onClick={() => inputNumber('5')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800"
            >
              5
            </Button>
            <Button
              onClick={() => inputNumber('6')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800"
            >
              6
            </Button>
            <Button
              onClick={() => inputOperation('+')}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              +
            </Button>

            <Button
              onClick={() => inputNumber('1')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800"
            >
              1
            </Button>
            <Button
              onClick={() => inputNumber('2')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800"
            >
              2
            </Button>
            <Button
              onClick={() => inputNumber('3')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800"
            >
              3
            </Button>
            <Button
              onClick={performCalculation}
              className="row-span-2 bg-orange-500 hover:bg-orange-600 text-white"
            >
              =
            </Button>

            <Button
              onClick={() => inputNumber('0')}
              className="col-span-2 bg-gray-100 hover:bg-gray-200 text-gray-800"
            >
              0
            </Button>
            <Button
              onClick={() => inputNumber('.')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800"
            >
              .
            </Button>
          </div>
        </div>
      ) : (
        /* Logistics Calculator */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fuel Cost Calculator */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Truck className="w-6 h-6 text-blue-600 mr-2" />
              <h4 className="text-lg font-semibold text-gray-900">Розрахунок палива</h4>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Відстань (км)
                </label>
                <input
                  type="number"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ціна палива (грн/л)
                </label>
                <input
                  type="number"
                  value={fuelPrice}
                  onChange={(e) => setFuelPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Витрата (л/100км)
                </label>
                <input
                  type="number"
                  value={consumption}
                  onChange={(e) => setConsumption(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="25"
                />
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Вартість палива:</span>
                  <span className="text-lg font-bold text-green-600">{calculateFuelCost()} грн</span>
                </div>
              </div>
            </div>
          </div>

          {/* Load Capacity Calculator */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Package className="w-6 h-6 text-purple-600 mr-2" />
              <h4 className="text-lg font-semibold text-gray-900">Розрахунок вантажу</h4>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Вага (кг)
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Об'єм (м³)
                </label>
                <input
                  type="number"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="2.5"
                />
              </div>
              
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Щільність:</span>
                  <span className="text-lg font-bold text-purple-600">{calculateLoadCapacity().density} кг/м³</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Ефективність:</span>
                  <span className="text-lg font-bold text-purple-600">{calculateLoadCapacity().efficiency}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalculatorApp;