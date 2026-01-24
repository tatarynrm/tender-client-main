"use client";

import React, { useEffect, useState } from "react";
import api from "@/shared/api/instance.api";

interface Manager {
  id: number;
  name?: string;
  fio?: string;
}

interface ManagerSelectProps {
  value: number | null;
  onChange: (value: number | null) => void;
  className?: string;
  showAllOption?: boolean;
}

export const ManagerSelect = ({
  value,
  onChange,
  className,
  showAllOption = true,
}: ManagerSelectProps) => {
  const [users, setUsers] = useState<Manager[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get("/crm/users/managers");
        if (data && data.length > 0) {
          setUsers(data);
        } else {
          throw new Error();
        }
      } catch (e) {
        // Фейковий список, якщо бекенд не відповів
        const fakeUsers = Array.from({ length: 20 }, (_, i) => ({
          id: i + 1,
          name: `Менеджер ${i + 1}`,
        }));
        setUsers(fakeUsers);
      }
    };
    fetchUsers();
  }, []);

  return (
    <select
      value={value ?? ""}
      onChange={(e) => {
        const val = e.target.value;
        onChange(val === "" ? null : Number(val));
      }}
      className={className}
    >
      {showAllOption && <option value="">Всі менеджери</option>}
      {users.map((user) => (
        <option key={user.id} value={user.id}>
          {user.name || user.fio}
        </option>
      ))}
    </select>
  );
};