// features/admin/SystemControlPanel.tsx
'use client'
import { useState } from "react";
import { toast } from "sonner";
import { adminSystemService } from "../services/admin.system.service";

export const SystemControlPanel = () => {
  const [targetId, setTargetId] = useState("");

const triggerCommand = async (type: any, payload = {}) => {
  // Створюємо унікальний ID для toast, щоб оновлювати його (loading -> success)
  const toastId = toast.loading(`Надсилання команди ${type}...`);

  try {
    await adminSystemService.sendCommand({
      type,
      payload,
      userId: targetId || undefined,
    });

    toast.success(`Команду ${type} успішно виконано`, { id: toastId });
  } catch (error: any) {
    console.error("System Command Error:", error);
    
    // Витягуємо повідомлення про помилку з відповіді сервера, якщо воно є
    const errorMessage = error.response?.data?.message || "Помилка сервера";
    
    toast.error(`Не вдалося надіслати: ${errorMessage}`, { id: toastId });
  }
};

  return (
    <div className="p-4 border-2 border-red-200 rounded-xl bg-red-50/50 dark:bg-red-950/10">
      <h2 className="text-red-600 font-bold mb-4">SYSTEM EMERGENCY CONTROL</h2>
      
      <div className="flex flex-col gap-4">
        <input 
          placeholder="User ID (залиште порожнім для всіх)"
          className="p-2 border rounded dark:bg-slate-800"
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => triggerCommand('FORCE_RELOAD')}
            className="bg-zinc-800 text-white px-3 py-2 rounded hover:bg-black"
          >
            Reload Clients
          </button>
          
          <button 
            onClick={() => triggerCommand('FORCE_LOGOUT')}
            className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700"
          >
            Logout Users
          </button>

          <button 
            onClick={() => triggerCommand('SHOW_NOTIFICATION', { message: 'Планові роботи через 5 хвилин!' })}
            className="bg-blue-600 text-white px-3 py-2 rounded col-span-2"
          >
            Broadcast Notification
          </button>
        </div>
      </div>
    </div>
  );
};