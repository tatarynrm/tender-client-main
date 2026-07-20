"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProfile } from "@/shared/hooks/useProfile";
import { carrierStatisticService, ITransportationDetails } from "@/features/dashboard/main/services/carrier-statistic.service";
import Loader from "@/shared/components/Loaders/MainLoader";
import {
  ChevronLeft, MapPin, Map as MapIcon, User,
  Truck, Package, FileText, Download, DollarSign, Box,
  Check, Mail, Phone
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

export default function TransportationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { profile, isProfileLoading } = useProfile();

  const [data, setData] = useState<ITransportationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!profile?.company?.migrate_id || !params.id) return;

      try {
        const id = Number(params.id);
        const res = await carrierStatisticService.getCarrierTransportationOne(
          profile.company.migrate_id,
          id
        );

        if (res) {
          setData(res);
        } else {
          setError("Немає доступу до цієї заявки або її не знайдено");
        }
      } catch (err) {
        console.error("Failed to fetch details", err);
        setError("Помилка завантаження даних");
      } finally {
        setLoading(false);
      }
    };

    if (!isProfileLoading) {
      fetchDetails();
    }
  }, [profile, isProfileLoading, params.id]);

  if (isProfileLoading || loading) return <Loader />;

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-2xl font-bold text-[#303f5f] mb-2">Упс!</h2>
        <p className="text-[#7c8eb5] mb-6">{error || "Дані не знайдено"}</p>
        <button
          onClick={() => router.push('/dashboard/cabinet/transportations')}
          className="px-6 py-2 bg-[#5B79ED] text-white rounded-full font-medium hover:bg-blue-600 transition"
        >
          Повернутись до списку
        </button>
      </div>
    );
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\./g, ".");
  };

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" });
  };

  const loadPoint = data.route.find(p => p.code_punkt === 'ZAV');
  const unloadPoint = data.route.find(p => p.code_punkt === 'ROZV');

  const steps = [
    { label: "Заявка", active: true },
    { label: "Заявка", active: true },
    { label: "Завантаження", active: data.code_status_ruh === 'RUH' || data.code_status_ruh === 'ROZVK' || data.code_status_detail === 'CLOSED' },
    { label: "В дорозі", active: data.code_status_ruh === 'ROZVK' || data.code_status_detail === 'CLOSED' },
    { label: "Розвантаження", active: data.code_status_detail === 'CLOSED' },
    { label: "Доставлено", active: data.code_status_detail === 'CLOSED' },
    { label: "Оплачено", active: data.code_status_opl === 'OPL' },
  ];

  return (
    <div className="w-full pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-5 relative">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-transparent rounded-full border border-[#D9E2F2] text-[#8B9EC7] text-sm font-medium hover:bg-white transition z-10"
        >
          <ChevronLeft size={16} />
          Назад
        </button>

        <div className="absolute left-0 right-0 flex justify-center pointer-events-none hidden md:flex">
          <h1 className="text-xl font-extrabold text-[#51648B] uppercase tracking-wide flex items-center gap-2">
            {data.zav_town?.split(",")[0]} <span>→</span> {data.rozv_town?.split(",")[0]}
          </h1>
        </div>

        <div className="flex items-center gap-3 z-10 ml-auto">
          <span className="px-4 py-1.5 bg-[#E6F6ED] border border-[#B3E5C8] text-[#1D9954] rounded-full text-[11px] font-bold uppercase tracking-wider">
            {data.status_detail_name || data.status_name}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-[#D9E2F2] hover:bg-gray-50 transition outline-none">
                <div className="p-1 border border-[#D9E2F2] rounded-full">
                  <User size={12} className="text-[#8B9EC7]" />
                </div>
                <span className="text-[13px] font-medium text-[#51648B]">
                  {data.manager?.imja ? `${data.manager.imja} ${data.manager.prizv || ''}`.trim() : (typeof data.manager === 'string' && data.manager ? data.manager : (data.manager_name || "Менеджер ICT"))}
                </span>
                <ChevronLeft size={14} className="text-[#8B9EC7] -rotate-90 ml-1" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl border-[#D9E2F2] shadow-sm p-1 bg-white">
              <DropdownMenuItem
                className="flex items-center gap-3 py-2 px-3 rounded-lg cursor-pointer hover:bg-[#F4F7FB] focus:bg-[#F4F7FB] text-[#51648B]"
                onClick={() => { if (data.manager?.email) window.location.href = `mailto:${data.manager.email}`; }}
              >
                <Mail size={16} className="text-[#8B9EC7]" />
                <span className="text-xs font-medium">{data.manager?.email || "Немає email"}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-3 py-2 px-3 rounded-lg cursor-pointer hover:bg-[#F4F7FB] focus:bg-[#F4F7FB] text-[#51648B]"
                onClick={() => { if (data.manager?.phone) window.location.href = `tel:${data.manager.phone.replace(/[^0-9+]/g, '')}`; }}
              >
                <Phone size={16} className="text-[#8B9EC7]" />
                <span className="text-xs font-medium">{data.manager?.phone || "Немає телефону"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stepper */}
      {/* <div className="bg-white rounded-[20px] border border-[#D9E2F2] p-5 mb-5 overflow-hidden">
        <div className="flex items-center justify-between relative px-2">
   
          <div className="absolute left-8 right-8 top-3.5 h-[2px] bg-[#E5EDF6] -z-0"></div>

       
          <div
            className="absolute left-8 top-3.5 h-[2px] bg-[#5B79ED] -z-0 transition-all duration-500"
            style={{ width: `${(steps.filter(s => s.active).length - 1) / (steps.length - 1) * 100}%`, maxWidth: 'calc(100% - 4rem)' }}
          ></div>

          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2.5 z-10 bg-white px-2">
              {step.active ? (
                <div className="w-7 h-7 rounded-full bg-[#5B79ED] flex items-center justify-center">
                  <Check size={14} strokeWidth={3} className="text-white" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-white border-[2px] border-[#D9E2F2] flex items-center justify-center">
                </div>
              )}
              <span className={`text-[11px] font-semibold ${step.active ? 'text-[#5B79ED]' : 'text-[#A8B7D8]'}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div> */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-5">

          {/* ПУНКТИ МАРШРУТУ */}
          <div className="bg-white rounded-[20px] border border-[#D9E2F2] p-6">
            <div className="flex items-center gap-2 mb-6 text-[#51648B]">
              <MapPin size={18} />
              <h2 className="text-[13px] font-bold uppercase tracking-wider">ПУНКТИ МАРШРУТУ</h2>
            </div>

            {/* Load Point */}
            {loadPoint && (
              <div className="relative pl-5 pb-5 border-l border-[#D9E2F2] ml-2.5">
                <div className="absolute w-2.5 h-2.5 bg-[#2BD079] rounded-full -left-[5.5px] top-1.5"></div>
                <div className="flex justify-between items-center mb-4">
                  <span className="px-3 py-1 bg-[#E6F6ED] border border-[#B3E5C8] text-[#1D9954] rounded-full text-[10px] font-bold uppercase">Завантаження</span>
                  <div className="flex items-center gap-3">
                    <span className="text-base font-extrabold text-[#303f5f] uppercase tracking-wide">{loadPoint.town} {loadPoint.post || ''}</span>
                    <button className="flex items-center gap-1.5 px-3 py-1 bg-white border border-[#D9E2F2] text-[#51648B] rounded-full text-[10px] font-bold hover:bg-gray-50 transition">
                      Карта <MapIcon size={12} className="text-[#8B9EC7]" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-xs">
                  <div>
                    <div className="text-[#8B9EC7] font-medium text-[11px] mb-1">Юр. особа</div>
                    <div className="font-bold text-[#303f5f]">{loadPoint.ur_osoba || "-"}</div>
                  </div>
                  <div>
                    <div className="text-[#8B9EC7] font-medium text-[11px] mb-1">Країна</div>
                    <div className="font-bold text-[#303f5f]">{loadPoint.country || "-"}</div>
                  </div>
                  <div>
                    <div className="text-[#8B9EC7] font-medium text-[11px] mb-1">Місто / Індекс</div>
                    <div className="font-bold text-[#303f5f]">{loadPoint.town}{loadPoint.post ? `, ${loadPoint.post}` : ''}</div>
                  </div>
                  <div>
                    <div className="text-[#8B9EC7] font-medium text-[11px] mb-1">Вулиця / Буд.</div>
                    <div className="font-bold text-[#303f5f]">{loadPoint.adr || "-"}</div>
                  </div>
                  <div>
                    <div className="text-[#8B9EC7] font-medium text-[11px] mb-1">Дата</div>
                    <div className="font-bold text-[#303f5f]">{formatDate(loadPoint.date)}</div>
                  </div>
                  <div>
                    <div className="text-[#8B9EC7] font-medium text-[11px] mb-1">Час</div>
                    <div className="font-bold text-[#303f5f]">{formatTime(loadPoint.date)}</div>
                  </div>
                  <div>
                    <div className="text-[#8B9EC7] font-medium text-[11px] mb-1">Контактна особа</div>
                    <div className="font-bold text-[#303f5f]">{loadPoint.prim ? "Є" : "-"}</div>
                  </div>
                  <div>
                    <div className="text-[#8B9EC7] font-medium text-[11px] mb-1">Телефон</div>
                    <div className="font-bold text-[#303f5f]">{loadPoint.telefon || "-"}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-[#8B9EC7] font-medium text-[11px] mb-1 flex items-center gap-1">
                      <FileText size={12} /> Примітки
                    </div>
                    <div className="font-bold text-[#303f5f]">{loadPoint.prim || "Немає приміток"}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Unload Point */}
            {unloadPoint && (
              <div className="relative pl-5 pb-2 ml-2.5">
                <div className="absolute w-2.5 h-2.5 bg-white border-[2.5px] border-[#5B79ED] rounded-full -left-[5px] top-1.5"></div>
                <div className="flex justify-between items-center mb-4">
                  <span className="px-3 py-1 bg-white border border-[#5B79ED] text-[#5B79ED] rounded-full text-[10px] font-bold uppercase">Розвантаження</span>
                  <div className="flex items-center gap-3">
                    <span className="text-base font-extrabold text-[#303f5f] uppercase tracking-wide">{unloadPoint.town}</span>
                    <button className="flex items-center gap-1.5 px-3 py-1 bg-white border border-[#D9E2F2] text-[#51648B] rounded-full text-[10px] font-bold hover:bg-gray-50 transition">
                      Карта <MapIcon size={12} className="text-[#8B9EC7]" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-xs">
                  <div>
                    <div className="text-[#8B9EC7] font-medium text-[11px] mb-1">Юр. особа</div>
                    <div className="font-bold text-[#303f5f]">{unloadPoint.ur_osoba || "-"}</div>
                  </div>
                  <div>
                    <div className="text-[#8B9EC7] font-medium text-[11px] mb-1">Країна</div>
                    <div className="font-bold text-[#303f5f]">{unloadPoint.country || "-"}</div>
                  </div>
                  <div>
                    <div className="text-[#8B9EC7] font-medium text-[11px] mb-1">Місто / Індекс</div>
                    <div className="font-bold text-[#303f5f]">{unloadPoint.town}{unloadPoint.post ? `, ${unloadPoint.post}` : ''}</div>
                  </div>
                  <div>
                    <div className="text-[#8B9EC7] font-medium text-[11px] mb-1">Вулиця / Буд.</div>
                    <div className="font-bold text-[#303f5f]">{unloadPoint.adr || "-"}</div>
                  </div>
                  <div>
                    <div className="text-[#8B9EC7] font-medium text-[11px] mb-1">Дата</div>
                    <div className="font-bold text-[#303f5f]">{formatDate(unloadPoint.date)}</div>
                  </div>
                  <div>
                    <div className="text-[#8B9EC7] font-medium text-[11px] mb-1">Час</div>
                    <div className="font-bold text-[#303f5f]">{formatTime(unloadPoint.date)}</div>
                  </div>
                  <div>
                    <div className="text-[#8B9EC7] font-medium text-[11px] mb-1">Контактна особа</div>
                    <div className="font-bold text-[#303f5f]">-</div>
                  </div>
                  <div>
                    <div className="text-[#8B9EC7] font-medium text-[11px] mb-1">Телефон</div>
                    <div className="font-bold text-[#303f5f]">{unloadPoint.telefon || "-"}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-[#8B9EC7] font-medium text-[11px] mb-1 flex items-center gap-1">
                      <FileText size={12} /> Примітки
                    </div>
                    <div className="font-bold text-[#303f5f]">{unloadPoint.prim || "Приймання Пн-Пт 08:00-17:00"}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Route Summary */}
            <div className="mt-6 pt-3 border-t border-[#F0F4F8]">
              <div className="flex justify-between py-1.5 text-[11px]">
                <span className="text-[#8B9EC7] font-medium">Відстань</span>
                <span className="font-bold text-[#303f5f] text-xs">{data.km} км</span>
              </div>
              <div className="flex justify-between py-1.5 text-[11px]">
                <span className="text-[#8B9EC7] font-medium">Тип кузова</span>
                <span className="font-bold text-[#303f5f] text-xs">{data.pr_type || "Тент"}</span>
              </div>
              <div className="flex justify-between py-1.5 text-[11px]">
                <span className="text-[#8B9EC7] font-medium">Тендер</span>
                <span className="font-bold text-[#303f5f] text-xs">#{data.zay_num}</span>
              </div>
            </div>

            {/* Customs */}
            {(data as any).customs && (
              <div className="mt-4 p-5 bg-[#FFF9F2] rounded-2xl border border-[#FFE8CC]">
                <div className="flex justify-between items-center mb-4">
                  <span className="px-3 py-1 bg-white border border-[#FFD8A8] text-[#F59F00] rounded-full text-[10px] font-bold uppercase flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-[#F59F00] rounded-full"></div>
                    Митне Оформлення
                  </span>
                  <span className="px-3 py-1 bg-[#FFE8CC] text-[#D97706] rounded-full text-[10px] font-bold">В процесі</span>
                </div>
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="text-[#8B9EC7] font-medium text-[11px] mb-0.5">Митний перехід</div>
                    <div className="font-bold text-[#303f5f]">Корчова PL-UA</div>
                  </div>
                  <div>
                    <div className="text-[#8B9EC7] font-medium text-[11px] mb-0.5">Місце замитнення</div>
                    <div className="font-bold text-[#303f5f]">Korczowa, Митний термінал Польща</div>
                  </div>
                  <div>
                    <div className="text-[#8B9EC7] font-medium text-[11px] mb-0.5">Місце розмитнення</div>
                    <div className="font-bold text-[#303f5f]">Краківець, Митний пост «Краківець»</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ФІНАНСИ */}
          <div className="bg-white rounded-[20px] border border-[#D9E2F2] p-6">
            <div className="flex items-center gap-2 mb-4 text-[#51648B]">
              <DollarSign size={18} />
              <h2 className="text-[13px] font-bold uppercase tracking-wider">ФІНАНСИ</h2>
            </div>
            <div className="space-y-0 text-xs">
              <div className="flex justify-between py-2.5 border-b border-[#F0F4F8]">
                <span className="text-[#8B9EC7] font-medium">Ставка</span>
                <span className="font-bold text-[#303f5f] text-sm">{data.fraht} {data.valut}</span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-[#F0F4F8]">
                <span className="text-[#8B9EC7] font-medium">Статус оплати</span>
                <span className="px-2 py-0.5 bg-[#FFE8CC] text-[#D97706] rounded text-[10px] font-bold">
                  {data.status_opl || "Заплановано"}
                </span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-[#F0F4F8]">
                <span className="text-[#8B9EC7] font-medium">Дата виплати</span>
                <span className="font-bold text-[#303f5f]">{formatDate(data.opl_plan_date)}</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-[#8B9EC7] font-medium">Відстрочка оплати</span>
                <span className="font-bold text-[#303f5f]">14 днів</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-5">

          {/* ЕКІПАЖ */}
          <div className="bg-white rounded-[20px] border border-[#D9E2F2] p-6">
            <div className="flex items-center gap-2 mb-6 text-[#51648B]">
              <User size={18} />
              <h2 className="text-[13px] font-bold uppercase tracking-wider">ЕКІПАЖ</h2>
            </div>

            {/* Driver */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1 border border-[#D9E2F2] text-[#8B9EC7] rounded-full"><User size={12} /></div>
                <h3 className="text-[11px] font-bold uppercase text-[#51648B]">Водій</h3>
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-xs">
                <div>
                  <div className="text-[#8B9EC7] font-medium text-[11px] mb-1">ПІБ</div>
                  <div className="font-bold text-[#303f5f]">{data.driver}</div>
                </div>
                <div>
                  <div className="text-[#8B9EC7] font-medium text-[11px] mb-1">Телефон</div>
                  <div className="font-bold text-[#303f5f]">{data.driver_phone}</div>
                </div>
                <div>
                  <div className="text-[#8B9EC7] font-medium text-[11px] mb-1">Паспорт (серія/№)</div>
                  <div className="font-bold text-[#303f5f]">МН 456123</div>
                </div>
                <div>
                  <div className="text-[#8B9EC7] font-medium text-[11px] mb-1">Виданий</div>
                  <div className="font-bold text-[#303f5f]">Шевченківський РВ ЛМУ УМВС, 12.03.2015</div>
                </div>
              </div>
              <div className="mt-4">
                <button className="flex w-full items-center justify-between px-4 py-2.5 bg-[#F4F7FB] hover:bg-[#EAEFF7] transition rounded-xl text-[#51648B] text-[11px] font-medium">
                  <div className="flex items-center gap-2"><FileText size={14} className="text-[#8B9EC7]" /> Сканкопія паспорта</div>
                  <div className="flex items-center gap-1 text-[#8B9EC7]"><Download size={14} /> Завантажити</div>
                </button>
              </div>
            </div>

            <hr className="border-[#F0F4F8] mb-5" />

            {/* Car */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1 bg-[#FFF4E5] text-[#F59F00] rounded-full"><Truck size={12} /></div>
                <h3 className="text-[11px] font-bold uppercase text-[#51648B]">Автомобіль</h3>
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-xs">
                <div>
                  <div className="text-[#8B9EC7] font-medium text-[11px] mb-1">Держ. номер</div>
                  <div className="font-bold text-[#303f5f] text-sm uppercase">{data.am}</div>
                </div>
                <div>
                  <div className="text-[#8B9EC7] font-medium text-[11px] mb-1">Рік випуску</div>
                  <div className="font-bold text-[#303f5f]">2018</div>
                </div>
                <div className="col-span-2">
                  <div className="text-[#8B9EC7] font-medium text-[11px] mb-1">Марка/модель</div>
                  <div className="font-bold text-[#303f5f]">{data.am_mark}</div>
                </div>
              </div>
              <div className="mt-4">
                <button className="flex w-full items-center justify-between px-4 py-2.5 bg-[#F4F7FB] hover:bg-[#EAEFF7] transition rounded-xl text-[#51648B] text-[11px] font-medium">
                  <div className="flex items-center gap-2"><FileText size={14} className="text-[#8B9EC7]" /> Техпаспорт автомобіля</div>
                  <div className="flex items-center gap-1 text-[#8B9EC7]"><Download size={14} /> Завантажити</div>
                </button>
              </div>
            </div>

            <hr className="border-[#F0F4F8] mb-5" />

            {/* Trailer */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1 bg-[#E6F6ED] text-[#1D9954] rounded-full"><Package size={12} /></div>
                <h3 className="text-[11px] font-bold uppercase text-[#51648B]">Причіп</h3>
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-xs">
                <div>
                  <div className="text-[#8B9EC7] font-medium text-[11px] mb-1">Держ. номер</div>
                  <div className="font-bold text-[#303f5f] text-sm uppercase">{data.pr}</div>
                </div>
                <div>
                  <div className="text-[#8B9EC7] font-medium text-[11px] mb-1">Вантажопідйомність</div>
                  <div className="font-bold text-[#303f5f]">{data.vant_ton} т / {data.vant_objem} м³</div>
                </div>
                <div>
                  <div className="text-[#8B9EC7] font-medium text-[11px] mb-1">Тип</div>
                  <div className="font-bold text-[#303f5f]">{data.pr_type}</div>
                </div>
                <div>
                  <div className="text-[#8B9EC7] font-medium text-[11px] mb-1">Марка/модель</div>
                  <div className="font-bold text-[#303f5f]">{data.pr_mark}</div>
                </div>
              </div>
              <div className="mt-4">
                <button className="flex w-full items-center justify-between px-4 py-2.5 bg-[#F4F7FB] hover:bg-[#EAEFF7] transition rounded-xl text-[#51648B] text-[11px] font-medium">
                  <div className="flex items-center gap-2"><FileText size={14} className="text-[#8B9EC7]" /> Техпаспорт причепа</div>
                  <div className="flex items-center gap-1 text-[#8B9EC7]"><Download size={14} /> Завантажити</div>
                </button>
              </div>
            </div>
          </div>

          {/* ВАНТАЖ */}
          <div className="bg-white rounded-[20px] border border-[#D9E2F2] p-6">
            <div className="flex items-center gap-2 mb-6 text-[#51648B]">
              <Box size={18} />
              <h2 className="text-[13px] font-bold uppercase tracking-wider">ВАНТАЖ</h2>
            </div>
            <div className="grid grid-cols-2 gap-y-5 gap-x-4 text-xs">
              <div>
                <div className="text-[#8B9EC7] font-medium text-[11px] mb-1">Назва вантажу</div>
                <div className="font-bold text-[#303f5f]">{data.vant_name}</div>
              </div>
              <div>
                <div className="text-[#8B9EC7] font-medium text-[11px] mb-1">Об'єм</div>
                <div className="font-bold text-[#303f5f]">{data.vant_objem} м³</div>
              </div>
              <div>
                <div className="text-[#8B9EC7] font-medium text-[11px] mb-1">Вага брутто</div>
                <div className="font-bold text-[#303f5f]">{data.vant_ton} т</div>
              </div>
              <div>
                <div className="text-[#8B9EC7] font-medium text-[11px] mb-1">Упаковка</div>
                <div className="font-bold text-[#303f5f]">Картон на європалетах</div>
              </div>
              <div>
                <div className="text-[#8B9EC7] font-medium text-[11px] mb-1">К-сть палет</div>
                <div className="font-bold text-[#303f5f]">86 палет</div>
              </div>
              <div>
                <div className="text-[#8B9EC7] font-medium text-[11px] mb-1">Тип температурного режиму</div>
                <div className="font-bold text-[#303f5f]">Без температурного режиму</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
