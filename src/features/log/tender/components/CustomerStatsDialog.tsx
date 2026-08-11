"use client";

import { useEffect, useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { Pagination } from "@/shared/components/Pagination/Pagination";
import {
  tenderManagerService,
  ICustomerStats,
  ICustomerTrip,
  ICustomerTenderDetail,
  IOracleCompanyInfo,
} from "../../services/tender.manager.service";
import {
  Building2,
  TrendingUp,
  Truck,
  Calendar,
  User,
  X,
  UserCog,
  Phone,
  Gavel,
  Info,
  MapPin,
  FileText,
  ShieldAlert,
  BadgeCheck,
  Mail,
} from "lucide-react";

interface CustomerStatsDialogProps {
  companyName: string | null;
  onClose: () => void;
}

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const formatDateTime = (dateStr?: string | null) => {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

export const CustomerStatsDialog = ({
  companyName,
  onClose,
}: CustomerStatsDialogProps) => {
  const open = Boolean(companyName);

  const [stats, setStats] = useState<ICustomerStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const [tenders, setTenders] = useState<ICustomerTenderDetail[]>([]);
  const [tendersPage, setTendersPage] = useState(1);
  const [tendersPageCount, setTendersPageCount] = useState(1);
  const [loadingTenders, setLoadingTenders] = useState(false);

  const [trips, setTrips] = useState<ICustomerTrip[]>([]);
  const [tripsPage, setTripsPage] = useState(1);
  const [tripsPageCount, setTripsPageCount] = useState(1);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [tripsLoaded, setTripsLoaded] = useState(false);

  const [companyInfo, setCompanyInfo] = useState<IOracleCompanyInfo | null>(null);
  const [loadingCompanyInfo, setLoadingCompanyInfo] = useState(false);
  const [companyInfoLoaded, setCompanyInfoLoaded] = useState(false);

  const loadTenders = async (companyId: number, page: number) => {
    setLoadingTenders(true);
    try {
      const res = await tenderManagerService.getCustomerTenderDetails(
        companyId,
        page,
        10
      );
      setTenders(res.rows);
      setTendersPageCount(res.pageCount);
      setTendersPage(res.page);
    } catch {
      setTenders([]);
    } finally {
      setLoadingTenders(false);
    }
  };

  useEffect(() => {
    if (!open || !companyName) return;
    setStats(null);
    setTenders([]);
    setTendersPage(1);
    setTrips([]);
    setTripsLoaded(false);
    setTripsPage(1);
    setCompanyInfo(null);
    setCompanyInfoLoaded(false);
    setLoadingStats(true);
    tenderManagerService
      .getCustomerStats(companyName)
      .then((res) => {
        setStats(res);
        if (res.id) loadTenders(res.id, 1);
      })
      .catch(() =>
        setStats({
          id: null,
          migrate_id: null,
          company_name_full: null,
          edrpou: null,
          address: null,
          is_blocked: null,
          black_list: null,
          created_at: null,
          tender_count: 0,
        })
      )
      .finally(() => setLoadingStats(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, companyName]);

  // Блокуємо скрол фону, поки картка відкрита на весь екран
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const loadTrips = async (page: number) => {
    if (!stats?.migrate_id) return;
    setLoadingTrips(true);
    try {
      const res = await tenderManagerService.getCustomerTrips(
        stats.migrate_id,
        page,
        10
      );
      setTrips(res.rows);
      setTripsPageCount(res.pageCount);
      setTripsPage(res.page);
      setTripsLoaded(true);
    } catch {
      setTrips([]);
      setTripsLoaded(true);
    } finally {
      setLoadingTrips(false);
    }
  };

  const loadCompanyInfo = async () => {
    if (!stats?.migrate_id) return;
    setLoadingCompanyInfo(true);
    try {
      const res = await tenderManagerService.getCustomerCompanyInfo(
        stats.migrate_id
      );
      setCompanyInfo(res);
      setCompanyInfoLoaded(true);
    } catch {
      setCompanyInfo(null);
      setCompanyInfoLoaded(true);
    } finally {
      setLoadingCompanyInfo(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4 lg:p-10 transition-opacity duration-300">
      <div className="relative w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-[960px] bg-white dark:bg-zinc-950 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] rounded-none sm:rounded-[32px] flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 sm:h-[70px] shrink-0 border-b border-zinc-100 dark:border-white/5 bg-white dark:bg-zinc-950 flex items-center justify-between px-4 sm:px-8 gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Building2 className="w-5 h-5 text-[#3B52B4] dark:text-blue-400 shrink-0" />
            <h1 className="text-sm sm:text-base font-black uppercase text-zinc-900 dark:text-white tracking-wide leading-none truncate">
              {companyName}
            </h1>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-all active:scale-90 shrink-0"
          >
            <X size={20} className="text-zinc-500" />
          </button>
        </header>

        {/* Tabs — flex-1 так, щоб TabsContent сам скролився, а хедер/тablist лишались на місці */}
        <Tabs
          defaultValue="stats"
          onValueChange={(tab) => {
            if (tab === "trips" && !tripsLoaded) loadTrips(1);
            if (tab === "info" && !companyInfoLoaded) loadCompanyInfo();
          }}
          className="flex-1 min-h-0 flex flex-col gap-0"
        >
          <TabsList className="w-full h-auto shrink-0 rounded-none border-b border-zinc-100 dark:border-white/5 bg-white dark:bg-zinc-950 p-0 justify-start">
            <TabsTrigger
              value="stats"
              className="flex-1 sm:flex-none sm:min-w-[220px] rounded-none border-b-2 border-transparent data-[state=active]:border-[#3B52B4] data-[state=active]:bg-transparent dark:data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 text-xs sm:text-sm font-bold"
            >
              Статистика тендерів
            </TabsTrigger>
            <TabsTrigger
              value="trips"
              className="flex-1 sm:flex-none sm:min-w-[220px] rounded-none border-b-2 border-transparent data-[state=active]:border-[#3B52B4] data-[state=active]:bg-transparent dark:data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 text-xs sm:text-sm font-bold"
            >
              Виконані рейси
            </TabsTrigger>
            <TabsTrigger
              value="info"
              className="flex-1 sm:flex-none sm:min-w-[220px] rounded-none border-b-2 border-transparent data-[state=active]:border-[#3B52B4] data-[state=active]:bg-transparent dark:data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 text-xs sm:text-sm font-bold"
            >
              Про замовника
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Postgres — тендери замовника: хто провів, хто давав ставки */}
          <TabsContent
            value="stats"
            className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8"
          >
            {loadingStats ? (
              <div className="h-28 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-2xl" />
            ) : (
              <div className="flex flex-col items-center justify-center gap-1 pb-6 sm:pb-8">
                <TrendingUp className="w-7 h-7 text-[#3B52B4] dark:text-blue-400" />
                <span className="text-3xl sm:text-4xl font-black text-[#3B52B4] dark:text-blue-400">
                  {stats?.tender_count ?? 0}
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 text-center">
                  тендерів проведено з цим замовником
                </span>
              </div>
            )}

            {loadingTenders ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-24 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-2xl"
                  />
                ))}
              </div>
            ) : tenders.length === 0 ? (
              !loadingStats && (
                <div className="py-8 text-center text-sm text-slate-400">
                  Тендерів не знайдено
                </div>
              )
            ) : (
              <>
                <div className="flex flex-col gap-3">
                  {tenders.map((tender) => (
                    <div
                      key={tender.id}
                      className="border border-slate-100 dark:border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col gap-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-[#8BA6EB] uppercase">
                          Тендер № {tender.id} від {formatDate(tender.created_at)}
                        </span>
                        {tender.ids_status && (
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                            {tender.ids_status}
                          </span>
                        )}
                      </div>

                      {tender.cargo && (
                        <div className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">
                          {tender.cargo}
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                        <UserCog size={12} />
                        Провів: {tender.author_name || "—"}
                      </div>

                      {/* Ставки перевізників */}
                      <div className="mt-1 border-t border-slate-100 dark:border-slate-800 pt-2 flex flex-col gap-1.5">
                        <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <Gavel size={12} /> Ставки ({tender.bids.length})
                        </span>
                        {tender.bids.length === 0 ? (
                          <span className="text-[11px] text-slate-400">
                            Ставок ще не було
                          </span>
                        ) : (
                          <div className="flex flex-col gap-1">
                            {tender.bids.map((bid) => (
                              <div
                                key={bid.id}
                                className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 text-[12px] bg-slate-50 dark:bg-white/[0.03] rounded-lg px-2.5 py-1.5"
                              >
                                <span className="font-bold text-slate-700 dark:text-slate-200 truncate">
                                  {bid.carrier_name || "—"}
                                  {bid.bidder_name && (
                                    <span className="font-medium text-slate-400">
                                      {" "}
                                      ({bid.bidder_name})
                                    </span>
                                  )}
                                </span>
                                <span className="flex items-center gap-2 shrink-0">
                                  <span className="font-black text-[#3B52B4] dark:text-blue-400">
                                    {bid.price_proposed
                                      ? Math.round(
                                          bid.price_proposed
                                        ).toLocaleString("uk-UA")
                                      : 0}
                                  </span>
                                  <span className="text-slate-400 text-[10px]">
                                    {formatDateTime(bid.time_add)}
                                  </span>
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <Pagination
                  page={tendersPage}
                  pageCount={tendersPageCount}
                  onChange={(page) => stats?.id && loadTenders(stats.id, page)}
                />
              </>
            )}
          </TabsContent>

          {/* Tab 2: Oracle — виконані рейси з цим замовником, від нових до старих */}
          <TabsContent
            value="trips"
            className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8"
          >
            {!loadingStats && !stats?.migrate_id ? (
              <div className="py-8 text-center text-sm text-slate-400">
                Немає звʼязку з Oracle для цього замовника
              </div>
            ) : loadingTrips ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-28 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-2xl"
                  />
                ))}
              </div>
            ) : trips.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">
                Рейсів не знайдено
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {trips.map((trip, idx) => (
                    <div
                      key={trip.NUM ?? idx}
                      className="border border-slate-100 dark:border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-[#8BA6EB] uppercase">
                          № {trip.NUM || "—"}
                        </span>
                        <span className="text-sm font-black text-[#3B52B4] dark:text-blue-400 whitespace-nowrap">
                          Замовник: {trip.ZAMSUMA
                            ? Math.round(trip.ZAMSUMA).toLocaleString("uk-UA")
                            : 0}{" "}
                          {trip.VALUTZ_NAME || ""}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">
                        {trip.PUNKTZ || "—"} ➔ {trip.PUNKTR || "—"}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-semibold text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(trip.DATZAV)} → {formatDate(trip.DATROZV)}
                        </span>
                        {trip.VOD1 && (
                          <span className="flex items-center gap-1">
                            <User size={12} /> {trip.VOD1}
                          </span>
                        )}
                        {trip.AM && (
                          <span className="flex items-center gap-1">
                            <Truck size={12} /> {trip.AM}
                          </span>
                        )}
                      </div>

                      {/* Перевізник і скільки йому сплачено */}
                      {(trip.CARRIER_NAME || trip.PERSUMA) && (
                        <div className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-white/[0.03] rounded-lg px-2.5 py-1.5">
                          <span className="flex items-center gap-1.5 text-[12px] font-bold text-slate-700 dark:text-slate-200 truncate">
                            <Truck size={12} className="text-slate-400 shrink-0" />
                            {trip.CARRIER_NAME || "Перевізник не вказаний"}
                          </span>
                          {trip.PERSUMA != null && (
                            <span className="text-[12px] font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap shrink-0">
                              Сплачено: {Math.round(trip.PERSUMA).toLocaleString("uk-UA")}{" "}
                              {trip.VALUTP_NAME || ""}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Наші менеджери + зовнішні контакти сторін */}
                      {(trip.MEN_ZAV ||
                        trip.MEN_ROZV ||
                        trip.KONTAKT_ZAM ||
                        trip.KONTAKT_PER) && (
                        <div className="mt-1 border-t border-slate-100 dark:border-slate-800 pt-1.5 flex flex-col gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          {(trip.MEN_ZAV || trip.MEN_ROZV) && (
                            <span className="flex items-center gap-1.5">
                              <UserCog
                                size={12}
                                className="text-[#3B52B4] dark:text-blue-400 shrink-0"
                              />
                              Наш менеджер:{" "}
                              {trip.MEN_ZAV && trip.MEN_ROZV && trip.MEN_ZAV !== trip.MEN_ROZV
                                ? `${trip.MEN_ZAV} (завант.) / ${trip.MEN_ROZV} (розванта.)`
                                : trip.MEN_ZAV || trip.MEN_ROZV}
                            </span>
                          )}
                          {trip.KONTAKT_ZAM && (
                            <span className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                              <span className="flex items-center gap-1.5">
                                <UserCog size={12} className="text-emerald-500 shrink-0" />
                                Контакт замовника: {trip.KONTAKT_ZAM}
                              </span>
                              {trip.KONTAKT_ZAM_TEL && (
                                <span className="flex items-center gap-1">
                                  <Phone size={11} className="text-emerald-500 shrink-0" />
                                  {trip.KONTAKT_ZAM_TEL}
                                </span>
                              )}
                              {trip.KONTAKT_ZAM_EMAIL && (
                                <span className="flex items-center gap-1">
                                  <Mail size={11} className="text-emerald-500 shrink-0" />
                                  {trip.KONTAKT_ZAM_EMAIL}
                                </span>
                              )}
                            </span>
                          )}
                          {trip.KONTAKT_PER && (
                            <span className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                              <span className="flex items-center gap-1.5">
                                <UserCog size={12} className="text-orange-500 shrink-0" />
                                Контакт перевізника: {trip.KONTAKT_PER}
                              </span>
                              {trip.KONTAKT_PER_TEL && (
                                <span className="flex items-center gap-1">
                                  <Phone size={11} className="text-orange-500 shrink-0" />
                                  {trip.KONTAKT_PER_TEL}
                                </span>
                              )}
                              {trip.KONTAKT_PER_EMAIL && (
                                <span className="flex items-center gap-1">
                                  <Mail size={11} className="text-orange-500 shrink-0" />
                                  {trip.KONTAKT_PER_EMAIL}
                                </span>
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <Pagination
                  page={tripsPage}
                  pageCount={tripsPageCount}
                  onChange={loadTrips}
                />
              </>
            )}
          </TabsContent>

          {/* Tab 3: Postgres (реквізити з нашої бази) + Oracle p_tender.GetCompany (адреси, договори) */}
          <TabsContent
            value="info"
            className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8"
          >
            {(stats?.is_blocked || stats?.black_list) && (
              <div className="mb-4 flex items-center gap-2 bg-rose-50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-xs font-bold rounded-2xl px-3 py-2.5">
                <ShieldAlert size={16} className="shrink-0" />
                {stats?.black_list
                  ? "Компанія у чорному списку"
                  : "Компанія заблокована"}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="border border-slate-100 dark:border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col gap-1.5">
                <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <BadgeCheck size={12} /> Реквізити
                </span>
                <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  {stats?.company_name_full || companyName}
                </div>
                <div className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">
                  ЄДРПОУ: {stats?.edrpou || companyInfo?.edrpou || "—"}
                </div>
                {companyInfo?.company_form && (
                  <div className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">
                    Форма: {companyInfo.company_form}
                  </div>
                )}
                {companyInfo?.pdv_status && (
                  <div className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">
                    ПДВ: {companyInfo.pdv_status}
                  </div>
                )}
                <div className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">
                  Клієнт з нами з: {formatDate(stats?.created_at)}
                </div>
              </div>

              <div className="border border-slate-100 dark:border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col gap-1.5">
                <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <MapPin size={12} /> Адреси
                </span>
                <div className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">
                  Юридична: {companyInfo?.address_legal || stats?.address || "—"}
                </div>
                <div className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">
                  Фактична: {companyInfo?.address_fysical || "—"}
                </div>
              </div>
            </div>

            <div className="mt-3 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col gap-2">
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <FileText size={12} /> Договори
                {companyInfo?.contracts ? ` (${companyInfo.contracts.length})` : ""}
              </span>

              {loadingCompanyInfo ? (
                <div className="space-y-1.5">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-8 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-lg"
                    />
                  ))}
                </div>
              ) : !companyInfo?.contracts || companyInfo.contracts.length === 0 ? (
                <span className="text-[11px] text-slate-400">
                  {companyInfoLoaded
                    ? "Договорів не знайдено"
                    : "Немає звʼязку з Oracle для цього замовника"}
                </span>
              ) : (
                <div className="flex flex-col gap-1 max-h-[240px] overflow-y-auto custom-scrollbar pr-1">
                  {companyInfo.contracts.map((c, i) => (
                    <div
                      key={i}
                      className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 text-[12px] bg-slate-50 dark:bg-white/[0.03] rounded-lg px-2.5 py-1.5"
                    >
                      <span className="font-bold text-slate-700 dark:text-slate-200 truncate">
                        № {c.number || "—"}
                        {c.firma && (
                          <span className="font-medium text-slate-400"> ({c.firma})</span>
                        )}
                      </span>
                      <span className="flex items-center gap-2 shrink-0 text-slate-400">
                        <span>{formatDate(c.date)}</span>
                        {c.termin && <span>до {formatDate(c.termin)}</span>}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!loadingCompanyInfo && companyInfoLoaded && !companyInfo && (
              <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
                <Info size={12} className="shrink-0" />
                Не вдалося отримати дані з Oracle для цього замовника
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
