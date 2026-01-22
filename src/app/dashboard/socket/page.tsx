"use client";
import { useState, useEffect } from "react";
import { useSockets } from "@/shared/providers/SocketProvider";
import { toast } from "sonner";

export default function SocketTestDebug() {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [receivedMessages, setReceivedMessages] = useState<any[]>([]);

  const users = Array.from({ length: 10 }, (_, i) => (i + 1).toString());

  const toggleUser = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id],
    );
  };

  const triggerSend = async () => {
    if (selectedUsers.length === 0) return alert("Оберіть юзерів!");

    await fetch(`${process.env.SERVER_URL}/test-socket/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userIds: selectedUsers.length === 1 ? selectedUsers[0] : selectedUsers,
        message: "Привіт від системи! 👋",
      }),
    });
  };

  return (
    <div className="p-6 border rounded-xl bg-card">
      <h2 className="text-xl font-bold mb-4">
        Тест розсилки (Namespace: /user)
      </h2>

      <div className="flex flex-wrap gap-2 mb-4">
        {users.map((id) => (
          <button
            key={id}
            onClick={() => toggleUser(id)}
            className={`px-4 py-2 rounded-lg border ${selectedUsers.includes(id) ? "bg-primary text-white" : "bg-secondary"}`}
          >
            Юзер {id}
          </button>
        ))}
      </div>

      <button
        onClick={triggerSend}
        className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700"
      >
        Відправити івент обраним ({selectedUsers.length})
      </button>

      <div className="mt-6">
        <h3 className="font-semibold">Лог повідомлень:</h3>
        <div className="h-40 overflow-y-auto border p-2 rounded mt-2 bg-black/5 text-xs">
          {receivedMessages.map((m, i) => (
            <div key={i} className="mb-1 border-b pb-1">
              [{new Date(m.timestamp).toLocaleTimeString()}] {m.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
