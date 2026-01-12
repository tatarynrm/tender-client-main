"use client";

import React from "react";

const TenderLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center py-10  space-y-4 min-h-screen">
      <div className="relative w-24 h-24">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-orange-500 w-full h-full animate-draw-tender"
        >
          {/* Контур фури */}
          <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
          <path d="M15 18H9" />
          <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-2.235-2.98A1 1 0 0 0 18.765 9H14" />
          <circle cx="7" cy="18" r="2" />
          <circle cx="17" cy="18" r="2" />
        </svg>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 animate-pulse">
          Пошук активних тендерів
        </span>
        <div className="flex gap-1 mt-2">
          <div className="w-1 h-1 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-1 h-1 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-1 h-1 bg-orange-500 rounded-full animate-bounce"></div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes drawTender {
          0% {
            stroke-dasharray: 100;
            stroke-dashoffset: 100;
            opacity: 0;
          }
          50% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
          100% {
            stroke-dasharray: 100;
            stroke-dashoffset: -100;
            opacity: 0;
          }
        }
        .animate-draw-tender {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: drawTender 2.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default TenderLoader;
