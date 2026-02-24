// components/DownloadButtons.tsx
import { Monitor, Apple } from "lucide-react";

export default function DownloadDesktopAppButtons() {
  return (
    <div className="flex flex-wrap gap-4 justify-center py-10">
      {/* Кнопка для Windows */}
      <a
        href={`${process.env.NEXT_PUBLIC_SERVER_URL}/download?platform=win`}
        className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all shadow-lg hover:scale-105"
      >
        <Monitor size={24} />
        <div className="text-left">
          <p className="text-xs opacity-70">Завантажити для</p>
          <p className="text-lg font-bold">Windows</p>
        </div>
      </a>

      {/* Кнопка для Mac (тепер у стилі Windows, але біла) */}
      <a
        href={`${process.env.NEXT_PUBLIC_SERVER_URL}/download?platform=mac`}
        className="flex items-center gap-3 px-8 py-4 bg-white text-slate-900 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all shadow-lg hover:scale-105"
      >
        <Apple size={24} />
        <div className="text-left">
          <p className="text-xs opacity-60">Завантажити для</p>
          <p className="text-lg font-bold">macOS</p>
        </div>
      </a>
    </div>
  );
}