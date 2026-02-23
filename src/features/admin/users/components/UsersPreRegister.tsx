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
  const [filters, setFilters] = useState<PreRegisterFilters>({
    search: "",
    country: "all",
    user_exist: "all",
    company_exist: "all",
    page: 1,
    per_page: 50,
  });

  // 2. Отримуємо дані з хука
  const { 
    users, 
    countries, 
    isLoading, 
    refetch,
    pagination 
  } = useAdminPreRegisterUsers(filters);

  // 3. Хендлери оновлення (використовуємо useCallback для оптимізації)
  const updateFilter = useCallback((key: keyof PreRegisterFilters, val: any) => {
    setFilters((prev) => ({ 
      ...prev, 
      [key]: val,
      page: key === "page" ? val : 1 // Скидаємо сторінку на 1 при зміні фільтрів
    }));
  }, []);

  const resetFilters = () => {
    setFilters({
      search: "",
      country: "all",
      user_exist: "all",
      company_exist: "all",
      page: 1,
      per_page: 50,
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
            <UsersTable data={users} />
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
      
              {/* Тут твій компонент пагінації */}
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
                   disabled={users.length < (filters.per_page || 50)}
                   onClick={() => updateFilter("page", (filters.page || 1) + 1)}
                 >
                   Далі
                 </AppButton>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default UsersPreRegister;