import React from "react";

interface OnlineStatusProps {
  isOnline: boolean;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const OnlineStatus: React.FC<OnlineStatusProps> = ({
  isOnline,
  size = "md",
  showText = false,
}) => {
  // Розміри кружечка
  const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`relative flex ${sizeClasses[size]}`}>
        {/* Анімація пульсації (тільки коли онлайн) */}
        {isOnline && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        )}

        {/* Основний статичний кружечок */}
        <span
          className={`relative inline-flex rounded-full ${sizeClasses[size]} ${
            isOnline ? "bg-green-500" : "bg-red-400"
          }`}
        ></span>
      </div>

      {/* Опціональний текст */}
      {showText && (
        <span
          className={`text-sm font-medium ${
            isOnline ? "text-green-600" : "red-gray-500"
          }`}
        >
          {isOnline ? "Online" : "Offline"}
        </span>
      )}
    </div>
  );
};

export default OnlineStatus;
