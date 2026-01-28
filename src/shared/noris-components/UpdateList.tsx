"use client";

import { useState } from 'react';
import Image from 'next/image';

// Імітація бази даних
const UPDATES_DATA = [
  {
    id: 1,
    title: "Карточка завантажень!",
    description: "Ми повністю оновили інтерфейс користувача, зробивши його зручнішим для мобільних пристроїв.",
    image: "/public/learn/cargo-28-01-2026.png", // шлях до фото в public
  },

];

export default function UpdatesList() {
  const [showUpdates, setShowUpdates] = useState(false);

  return (
    <div className="p-4 flex flex-col items-center">
      {/* Кнопка перемикання */}
      <button
        onClick={() => setShowUpdates(!showUpdates)}
        className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
      >
        {showUpdates ? "Приховати оновлення" : "Показати всі нововведення"}
      </button>

      {/* Список оновлень */}
      {showUpdates && (
        <div className="mt-8 grid gap-6 grid-cols-1 md:grid-cols-2 max-w-4xl">
          {UPDATES_DATA.map((item) => (
            <div 
              key={item.id} 
              className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white"
            >
              <div className="relative h-48 w-full">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}