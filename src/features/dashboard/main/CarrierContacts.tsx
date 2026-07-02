"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Search, Phone, Mail, Send } from "lucide-react";
import { useProfile } from "@/shared/hooks/useProfile";
import { carrierStatisticService } from "./services/carrier-statistic.service";
import Loader from "@/shared/components/Loaders/MainLoader";

export interface IContact {
  kod_os: number;
  imja: string;
  prizv: string;
  phone: string | null;
  email: string | null;
  department?: string;
}

export interface IContactGroup {
  name: string;
  code: string;
  list: IContact[];
}

const ActionDropdown = ({ 
  icon: Icon, 
  value, 
  type 
}: { 
  icon: any, 
  value: string, 
  type: 'phone' | 'email' | 'telegram'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleAction = () => {
    if (type === 'phone') {
      window.location.href = `tel:${value.replace(/[^0-9+]/g, '')}`;
    } else if (type === 'email') {
      window.location.href = `mailto:${value}`;
    } else {
      window.open(`https://t.me/${value.replace('@', '')}`, '_blank');
    }
    setIsOpen(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setIsOpen(false);
  };

  return (

    <div className="relative flex items-center gap-2 w-full xl:w-auto xl:flex-1 xl:min-w-[180px]" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:bg-slate-50 p-1.5 rounded-xl transition-colors w-full text-left border border-slate-100 xl:border-none"
      >
        <div className="w-7 h-7 xl:w-8 xl:h-8 rounded-lg bg-[#3B52B4] flex items-center justify-center flex-shrink-0">
          <Icon className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-white" />
        </div>
        <span className="text-xs xl:text-sm font-bold text-[#3B52B4] truncate">{value}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full xl:w-48 bg-white border border-slate-200 shadow-lg rounded-xl z-20 py-1 overflow-hidden">
          <button 
            onClick={handleAction}
            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {type === 'phone' ? 'Зателефонувати' : type === 'email' ? 'Написати' : 'Відкрити'}
          </button>
          <button 
            onClick={handleCopy}
            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Скопіювати
          </button>
        </div>
      )}
    </div>
  );
};

export const CarrierContacts = () => {
  const { profile, isProfileLoading } = useProfile();
  const [data, setData] = useState<IContactGroup[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Всі");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (profile?.company?.migrate_id) {
        try {
          const contactsData = await carrierStatisticService.getCarrierContacts(
            profile.company.migrate_id
          );
          if (contactsData?.contact_list && Array.isArray(contactsData.contact_list)) {
            setData(contactsData.contact_list);
          } else if (Array.isArray(contactsData)) {
            setData(contactsData);
          }
        } catch (error) {
          console.error("Failed to fetch contacts data", error);
        } finally {
          setLoading(false);
        }
      } else if (!isProfileLoading) {
        setLoading(false);
      }
    };
    fetchData();
  }, [profile, isProfileLoading]);

  // Збираємо список унікальних вкладок
  const tabs = useMemo(() => {
    if (!data) return ["Всі"];
    return ["Всі", ...data.map((group) => group.name)];
  }, [data]);

  // Фільтрація даних на основі пошуку та активної вкладки
  const filteredData = useMemo(() => {
    if (!data) return [];
    
    const query = searchQuery.toLowerCase().trim();
    
    return data.map((group) => {
      // Спочатку перевіряємо чи підходить група під вкладку
      if (activeTab !== "Всі" && group.name !== activeTab) {
        return null;
      }
      
      // Потім фільтруємо контакти в групі за пошуком
      const filteredList = group.list.filter((contact) => {
        if (!query) return true;
        const fullName = `${contact.imja} ${contact.prizv}`.toLowerCase();
        const role = group.name.toLowerCase();
        const department = contact.department?.toLowerCase() || "";
        return fullName.includes(query) || role.includes(query) || department.includes(query);
      });

      if (filteredList.length === 0) return null;
      
      return { ...group, list: filteredList };
    }).filter(Boolean) as IContactGroup[];
  }, [data, activeTab, searchQuery]);

  if (isProfileLoading || loading) return <Loader />;
  if (!data) return <div className="text-center p-4 text-slate-500 text-sm">Немає контактів для відображення</div>;

  return (
    <div className="flex flex-col gap-4 mt-2 w-full pb-8">
      {/* Search Bar */}
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-[#8BA6EB]" />
        </div>
        <input
          type="text"
          placeholder="Пошук (ім'я, роль)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#E5EDFB] border border-[#C7D2FE] text-[#3B52B4] placeholder-[#8BA6EB] rounded-full py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-[#3B52B4]/30 transition-all font-medium text-sm sm:text-base"
        />
      </div>

      {/* Tabs */}
      <div className="flex bg-[#E5EDFB] border border-[#C7D2FE] rounded-full p-1 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-colors whitespace-nowrap ${
              activeTab === tab
                ? "bg-white text-[#3B52B4] shadow-sm"
                : "text-[#8BA6EB] hover:text-[#3B52B4]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Contacts List */}
      <div className="flex flex-col gap-6 xl:gap-8 mt-2">
        {filteredData.length > 0 ? (
          filteredData.map((group, groupIdx) => {
            // Групуємо контакти по відділах
            const contactsByDept = group.list.reduce((acc, contact) => {
              const dept = contact.department || group.name;
              if (!acc[dept]) acc[dept] = [];
              acc[dept].push(contact);
              return acc;
            }, {} as Record<string, IContact[]>);
            
            // Сортуємо відділи по алфавіту
            const sortedDepts = Object.keys(contactsByDept).sort((a, b) => a.localeCompare(b));

            return (
              <div key={groupIdx} className="flex flex-col gap-5 xl:gap-6">
                {/* Показуємо назву загальної групи, якщо у вкладці "Всі" і група розбита на багато відділів */}
                {activeTab === "Всі" && sortedDepts.length > 1 && (
                  <h2 className="text-base font-extrabold text-slate-700 px-2 sm:px-4 border-b border-slate-200 pb-2">
                    {group.name}
                  </h2>
                )}

                {sortedDepts.map((dept, deptIdx) => {
                  // Сортуємо контакти всередині відділу по прізвищу та імені
                  const contacts = contactsByDept[dept].sort((a, b) => {
                    const nameA = `${a.prizv} ${a.imja}`.trim();
                    const nameB = `${b.prizv} ${b.imja}`.trim();
                    return nameA.localeCompare(nameB);
                  });

                  return (
                    <div key={`${groupIdx}-${deptIdx}`} className="flex flex-col gap-2 xl:gap-3">
                      {/* Department Header */}
                      <div className="flex items-center gap-2 xl:gap-3 px-2 sm:px-4 mt-1">
                        <h3 className="text-sm font-bold text-[#3B52B4]">
                          {dept}
                        </h3>
                        <span className="text-[10px] sm:text-xs bg-[#E5EDFB] text-[#3B52B4] py-0.5 px-2 rounded-full font-bold">
                          {contacts.length}
                        </span>
                      </div>

                      {/* Contacts in Department */}
                      <div className="flex flex-col gap-2 xl:gap-3">
                        {contacts.map((contact, contactIdx) => {
                          const initials = `${contact.imja?.[0] || ""}${contact.prizv?.[0] || ""}`.toUpperCase();
                          const fullName = `${contact.imja || ""} ${contact.prizv || ""}`.trim();
                          
                          return (
                            <div
                              key={contactIdx}
                              className="bg-white border border-[#C7D2FE] rounded-2xl xl:rounded-full p-3 xl:p-2 xl:pr-6 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3 xl:gap-4 shadow-sm hover:shadow-md transition-shadow"
                            >
                              {/* Avatar and Name */}
                              <div className="flex items-center gap-3 w-full xl:w-auto xl:min-w-[280px]">
                                <div className="w-10 h-10 xl:w-12 xl:h-12 rounded-full border border-[#C7D2FE] flex items-center justify-center bg-white text-[#8BA6EB] font-bold text-xs xl:text-sm flex-shrink-0">
                                  {initials}
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                  <span className="font-bold text-[#3B52B4] text-sm truncate">{fullName}</span>
                                  <span className="text-[10px] sm:text-xs text-[#8BA6EB] truncate">{dept}</span>
                                </div>
                              </div>

                              <div className="flex flex-col sm:flex-row xl:flex-nowrap w-full xl:w-auto gap-2 xl:gap-4 flex-1">
                                {/* Phone */}
                                {contact.phone ? (
                                  <ActionDropdown icon={Phone} value={contact.phone} type="phone" />
                                ) : (
                                  <div className="flex items-center gap-2 w-full xl:w-auto xl:flex-1 xl:min-w-[180px] p-1.5 opacity-60 cursor-not-allowed">
                                    <div className="w-7 h-7 xl:w-8 xl:h-8 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
                                      <Phone className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-slate-400" />
                                    </div>
                                    <span className="text-xs xl:text-sm font-medium text-slate-400 italic">Телефон відсутній</span>
                                  </div>
                                )}

                                {/* Email */}
                                {contact.email ? (
                                  <ActionDropdown icon={Mail} value={contact.email} type="email" />
                                ) : (
                                  <div className="flex items-center gap-2 w-full xl:w-auto xl:flex-1 xl:min-w-[180px] p-1.5 opacity-60 cursor-not-allowed">
                                    <div className="w-7 h-7 xl:w-8 xl:h-8 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
                                      <Mail className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-slate-400" />
                                    </div>
                                    <span className="text-xs xl:text-sm font-medium text-slate-400 italic">Е-мейл відсутній</span>
                                  </div>
                                )}

                                {/* Telegram */}
                                <ActionDropdown icon={Send} value="@ict_team" type="telegram" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })
        ) : (
          <div className="text-sm text-slate-500 px-4">Нічого не знайдено</div>
        )}
      </div>
    </div>
  );
};
