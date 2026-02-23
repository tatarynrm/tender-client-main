"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation"; 

import { telegramService } from "@/shared/services/telegram.service";
import { IUserProfile } from "@/shared/types/user.types";
import { TelegramSettingsCard } from "@/shared/components/profile/TelegramSettingsCard";

type TabType = "profile" | "company" | "notifications" | "security";

const TABS = [
  { id: "profile", label: "Особисті дані", icon: UserIcon },
  { id: "company", label: "Дані компанії", icon: BuildingIcon },
  { id: "notifications", label: "Сповіщення", icon: BellIcon },
  { id: "security", label: "Безпека", icon: ShieldIcon },
];

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [user, setUser] = useState<IUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const currentTabFromUrl = searchParams.get("tab") as TabType;
  
  const isValidTab = TABS.some((t) => t.id === currentTabFromUrl);
  const activeTab: TabType = isValidTab ? currentTabFromUrl : "profile";

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const profileData = await telegramService.findProfile();
      setUser(profileData);
    } catch (error) {
      console.error("Не вдалося завантажити профіль", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleTabChange = (tabId: TabType) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("tab", tabId);
    router.push(`?${newParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Трохи зменшив max-w, бо без сайдбару контент на всю ширину виглядає розтягнутим */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Заголовок сторінки */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Налаштування</h1>
          <p className="mt-2 text-sm text-gray-600">
            Керуйте своїм акаунтом, компанією та налаштуваннями інтеграцій.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          
          {/* Таби (Верхня панель навігації) */}
          <div className="w-full border-b border-gray-200 pb-4">
            {/* flex-wrap дозволяє табам красиво переноситися, якщо екран замалий */}
            <nav className="flex flex-wrap gap-2">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id as TabType)}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                      isActive
                        ? "bg-white text-blue-600 shadow-sm border border-gray-200"
                        : "text-gray-600 border border-transparent hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${isActive ? "text-blue-500" : "text-gray-400"}`}
                    />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Основний контент */}
          <main className="w-full">
            {isLoading && !user ? (
              <div className="space-y-6 animate-pulse">
                <div className="h-40 bg-gray-200 rounded-2xl w-full"></div>
                <div className="h-64 bg-gray-200 rounded-2xl w-full"></div>
              </div>
            ) : user ? (
              <div className="space-y-6">
                
                {activeTab === "profile" && (
                  <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-300">
                    <div className="px-6 py-5 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Профіль користувача</h3>
                      <p className="mt-1 text-sm text-gray-500">Ваша особиста інформація та контакти.</p>
                    </div>
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase">Ім'я та Прізвище</label>
                        <div className="mt-1 text-sm font-medium text-gray-900">
                          {user.person?.name} {user.person?.surname}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase">Email</label>
                        <div className="mt-1 text-sm font-medium text-gray-900">{user.email}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase">Статус акаунта</label>
                        <div className="mt-1">
                          {user.verified ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Верифікований
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Очікує підтвердження
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "company" && (
                  <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-300">
                    <div className="px-6 py-5 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Компанія</h3>
                      <p className="mt-1 text-sm text-gray-500">Реквізити компанії, яку ви представляєте.</p>
                    </div>
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase">Назва компанії</label>
                        <div className="mt-1 text-sm font-medium text-gray-900">{user.company?.company_name}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase">ЄДРПОУ</label>
                        <div className="mt-1 text-sm font-medium text-gray-900">{user.company?.edrpou}</div>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-500 uppercase">Вебсайт</label>
                        <div className="mt-1 text-sm text-blue-600 hover:underline">
                          <a href={user.company?.web_site} target="_blank" rel="noreferrer">
                            {user.company?.web_site || "Не вказано"}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "notifications" && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <TelegramSettingsCard
                      user={user}
                      onProfileUpdate={fetchUserProfile}
                    />
                  </div>
                )}

                {activeTab === "security" && (
                  <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 text-center animate-in fade-in duration-300">
                    <ShieldIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">Зміна пароля</h3>
                    <p className="text-sm text-gray-500 mt-1 mb-4">Налаштування безпеки та двофакторної автентифікації.</p>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                      Змінити пароль
                    </button>
                  </div>
                )}

              </div>
            ) : (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm">
                Помилка завантаження даних користувача. Спробуйте оновити сторінку.
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

// ... Ваші іконки залишаються такими ж ...
function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  );
}

function BuildingIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
    </svg>
  );
}

function BellIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
    </svg>
  );
}

function ShieldIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  );
}