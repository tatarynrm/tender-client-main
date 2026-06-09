"use client";

import React, { useState, useCallback } from "react";
import { Loader2, RefreshCcw, UserPlus } from "lucide-react";
import { UsersFilters } from "./UsersFilters";
import { UsersTable } from "./UsersTable";
import { PreRegisterFilters, useAdminPreRegisterUsers } from "../../hooks/useAdminPreRegisterUsers";
import { AppButton } from "@/shared/components/Buttons/AppButton";
import { cn } from "@/shared/utils";

const UsersPreRegister = () => {
  // 1. Стан для фільтрів
  const [filters, setFilters] = useState<PreRegisterFilters>(() => {
    let savedPerPage = 50;
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("adminPreRegPerPage");
      if (saved) savedPerPage = Number(saved);
    }
    return {
      search: "",
      country: "all",
      user_exist: "all",
      company_exist: "all",
      page: 1,
      per_page: savedPerPage,
    };
  });

  // 2. Отримуємо дані з хука
  const { 
    users, 
    countries, 
    isLoading, 
    refetch,
    pagination,
    registerUser,
    isRegistering
  } = useAdminPreRegisterUsers(filters);

  // 3. Хендлери оновлення (використовуємо useCallback для оптимізації)
  const updateFilter = useCallback((key: keyof PreRegisterFilters, val: any) => {
    if (key === "per_page") {
      localStorage.setItem("adminPreRegPerPage", String(val));
    }
    setFilters((prev) => ({ 
      ...prev, 
      [key]: val,
      page: key === "page" ? val : 1 // Скидаємо сторінку на 1 при зміні фільтрів
    }));
  }, []);

  const resetFilters = () => {
    let savedPerPage = 50;
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("adminPreRegPerPage");
      if (saved) savedPerPage = Number(saved);
    }
    setFilters({
      search: "",
      country: "all",
      user_exist: "all",
      company_exist: "all",
      page: 1,
      per_page: savedPerPage,
    });
  };

  return (
    <div className="p-6 h-screen flex flex-col gap-6 bg-slate-50/50 dark:bg-transparent">
      
      {/* HEADER СЕКЦІЯ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <UserPlus className="text-teal-600" size={24} />
            Попередня реєстрація
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Керування запитами на реєстрацію та верифікація нових користувачів
          </p>
        </div>

        <div className="flex items-center gap-2">
          <AppButton
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            leftIcon={<RefreshCcw size={16} className={cn(isLoading && "animate-spin")} />}
          >
            Оновити
          </AppButton>
          <AppButton
            variant="secondary"
            size="sm"
            onClick={resetFilters}
          >
            Скинути фільтри
          </AppButton>
        </div>
      </div>

      {/* ФІЛЬТРИ */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border shadow-sm transition-all">
        <UsersFilters
          search={filters.search || ""}
          setSearch={(val) => updateFilter("search", val)}
          country={filters.country || "all"}
          setCountry={(val) => updateFilter("country", val)}
          userExist={filters.user_exist || "all"}
          setUserExist={(val) => updateFilter("user_exist", val)}
          companyExist={filters.company_exist || "all"}
          setCompanyExist={(val) => updateFilter("company_exist", val)}
          countries={countries}
        />
      </div>

      {/* ТАБЛИЦЯ */}
      <div className="flex-1 bg-white dark:bg-slate-900 border rounded-2xl shadow-sm overflow-hidden relative flex flex-col">
        {/* Loader Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center z-50 animate-in fade-in duration-300">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="text-teal-600 animate-spin" size={40} />
              <span className="text-sm font-medium text-slate-600">Завантаження даних...</span>
            </div>
          </div>
        )}
        
        <div className="flex-1 overflow-auto custom-scrollbar">
          {users.length > 0 ? (
            <UsersTable 
              data={users} 
              onRegister={registerUser} 
              isRegistering={isRegistering} 
            />
          ) : (
            !isLoading && (
              <div className="h-full flex flex-col items-center justify-center text-center p-10">
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4">
                   <UserPlus size={48} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Нікого не знайдено</h3>
                <p className="text-slate-500 max-w-xs">
                  Спробуйте змінити параметри фільтрації або скинути їх.
                </p>
                <AppButton onClick={resetFilters} className="mt-2">
                  Скинути всі фільтри
                </AppButton>
              </div>
            )
          )}
        </div>

        {/* FOOTER / ПАГІНАЦІЯ */}
        {pagination && (
           <div className="px-6 py-4 border-t bg-slate-50/50 dark:bg-white/5 flex items-center justify-between">
              
              {/* Ліва частина: Всього та вибір кількості на сторінці */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-500 dark:text-zinc-400">
                  Всього: <span className="font-medium text-slate-900 dark:text-white">{pagination.total_records || pagination.total || 0}</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500 dark:text-zinc-400 hidden sm:inline">Показувати по:</span>
                  <select
                    className="border border-slate-200 dark:border-zinc-700 rounded-md text-sm bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 p-1 outline-none focus:border-teal-500 transition-colors cursor-pointer"
                    value={filters.per_page || 50}
                    onChange={(e) => updateFilter("per_page", Number(e.target.value))}
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              {/* Права частина: Кнопки пагінації */}
              <div className="flex items-center gap-4">
                 <span className="text-sm text-slate-500 dark:text-zinc-400 hidden sm:inline">
                   Сторінка {filters.page || 1} {pagination.total_pages ? `з ${pagination.total_pages}` : ''}
                 </span>
                 <div className="flex gap-2">
                   <AppButton 
                     size="sm" 
                     variant="outline" 
                     disabled={filters.page === 1}
                     onClick={() => updateFilter("page", (filters.page || 1) - 1)}
                   >
                     Назад
                   </AppButton>
                   <AppButton 
                     size="sm" 
                     variant="outline"
                     disabled={pagination.total_pages ? filters.page >= pagination.total_pages : users.length < (filters.per_page || 50)}
                     onClick={() => updateFilter("page", (filters.page || 1) + 1)}
                   >
                     Далі
                   </AppButton>
                 </div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default UsersPreRegister;