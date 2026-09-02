"use client";

import { useMemo, useState } from "react";
import {
  Loader2,
  Filter,
  Printer,
  ChevronDown,
  ChevronRight,
  Building2,
  LogIn,
  ShieldCheck,
  Briefcase,
  Users,
  Calendar,
} from "lucide-react";
import { usePartnersActivity } from "../hooks/usePartnersActivity";
import {
  IPartnerCompanyActivity,
  IPartnerUserActivity,
} from "../types/partners-activity.types";

type DateFilter =
  | "today"
  | "this_week"
  | "this_month"
  | "all_time"
  | "custom";

const FILTER_LABELS: Record<DateFilter, string> = {
  today: "Сьогодні",
  this_week: "Цей тиждень",
  this_month: "Цей місяць",
  all_time: "За весь час",
  custom: "Довільний період",
};

const fullName = (u: {
  surname: string | null;
  name: string | null;
  last_name: string | null;
}) =>
  [u.surname, u.name, u.last_name].filter(Boolean).join(" ").trim() ||
  "Без імені";

const companyKey = (c: IPartnerCompanyActivity) =>
  c.company_id != null ? String(c.company_id) : "none";

const fmtDateTime = (v: string | null) => {
  if (!v) return "—";
  const d = new Date(v);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const fmtDate = (v: string | null) => {
  if (!v) return null;
  const d = new Date(v);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

function getDateParams(
  dateFilter: DateFilter,
  customStartDate: string,
  customEndDate: string,
): { startDate?: string; endDate?: string } {
  const now = new Date();
  let startDate: string | undefined;
  let endDate: string | undefined;

  if (dateFilter === "today") {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    startDate = today.toISOString();
  } else if (dateFilter === "this_week") {
    const startOfWeek = new Date(now);
    startOfWeek.setDate(
      now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1),
    );
    startOfWeek.setHours(0, 0, 0, 0);
    startDate = startOfWeek.toISOString();
  } else if (dateFilter === "this_month") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  } else if (dateFilter === "custom") {
    startDate = customStartDate
      ? new Date(customStartDate).toISOString()
      : undefined;
    if (customEndDate) {
      const end = new Date(customEndDate);
      end.setHours(23, 59, 59, 999);
      endDate = end.toISOString();
    }
  }
  return { startDate, endDate };
}

function RoleBadges({ user }: { user: IPartnerUserActivity }) {
  return (
    <span className="inline-flex flex-wrap gap-1">
      {user.is_admin && (
        <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-1.5 py-0.5 text-[11px] font-medium text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
          <ShieldCheck size={11} /> Адмін
        </span>
      )}
      {user.is_manager && (
        <span className="inline-flex items-center gap-1 rounded-md bg-violet-50 px-1.5 py-0.5 text-[11px] font-medium text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
          <Briefcase size={11} /> Менеджер
        </span>
      )}
    </span>
  );
}

export function PartnersActivityReport() {
  const [dateFilter, setDateFilter] = useState<DateFilter>("this_month");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [onlyActive, setOnlyActive] = useState(true);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const params = useMemo(
    () => getDateParams(dateFilter, customStartDate, customEndDate),
    [dateFilter, customStartDate, customEndDate],
  );

  const { data, isPending, isFetching, isError } = usePartnersActivity(params);

  const companies = useMemo(() => {
    const list = data?.companies ?? [];
    if (!onlyActive) return list;
    return list
      .map((c) => ({
        ...c,
        users: c.users.filter((u) => u.login_count > 0),
      }))
      .filter((c) => c.users.length > 0);
  }, [data, onlyActive]);

  const toggle = (key: string) =>
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));

  const expandAll = () => setCollapsed({});
  const collapseAll = () =>
    setCollapsed(
      Object.fromEntries(companies.map((c) => [companyKey(c), true])),
    );

  const handlePrint = () => {
    expandAll();
    setTimeout(() => window.print(), 150);
  };

  const totals = data?.totals;
  const periodLabel = (() => {
    if (dateFilter !== "custom") return FILTER_LABELS[dateFilter];
    const s = fmtDate(params.startDate ?? null);
    const e = fmtDate(params.endDate ?? null);
    if (s && e) return `${s} — ${e}`;
    if (s) return `з ${s}`;
    if (e) return `до ${e}`;
    return "Довільний період";
  })();

  return (
    <div className="pa-report p-6">
      {/* Заголовок */}
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          <Users className="text-blue-500" size={28} />
          Активність партнерів
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Зовнішній онлайн: входи компаній-партнерів (адміністратори та
          менеджери, поза ICT) за обраний період.
        </p>
        <p className="pa-print-only hidden text-sm text-zinc-600">
          Період звіту: <b>{periodLabel}</b>
        </p>
      </div>

      {/* Панель фільтрів (не друкується) */}
      <div className="pa-no-print mb-6 flex flex-col gap-4 rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
            <Filter size={18} />
            <span className="font-medium">Період:</span>
            {isFetching && (
              <Loader2 className="ml-1 h-4 w-4 animate-spin text-blue-500" />
            )}
          </div>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as DateFilter)}
            className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-zinc-700 dark:bg-zinc-800"
          >
            {(Object.keys(FILTER_LABELS) as DateFilter[]).map((k) => (
              <option key={k} value={k}>
                {FILTER_LABELS[k]}
              </option>
            ))}
          </select>

          {dateFilter === "custom" && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-zinc-700 dark:bg-zinc-800"
              />
              <span className="text-zinc-400">—</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>
          )}

          <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={onlyActive}
              onChange={(e) => setOnlyActive(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
            />
            Лише ті, хто заходив
          </label>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-white/5"
          >
            Розгорнути всі
          </button>
          <button
            onClick={collapseAll}
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-white/5"
          >
            Згорнути всі
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <Printer size={16} /> Друк
          </button>
        </div>
      </div>

      {/* Підсумки */}
      {totals && (
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <SummaryCard
            icon={<Calendar size={18} />}
            label="Період"
            value={periodLabel}
            tone="slate"
          />
          <SummaryCard
            icon={<Building2 size={18} />}
            label="Компаній заходило"
            value={String(totals.active_companies_count)}
            tone="blue"
          />
          <SummaryCard
            icon={<Users size={18} />}
            label="Користувачів заходило"
            value={String(totals.active_users_count)}
            tone="emerald"
          />
          <SummaryCard
            icon={<LogIn size={18} />}
            label="Всього входів"
            value={String(totals.total_logins)}
            tone="violet"
          />
        </div>
      )}

      {/* Стан завантаження / помилки */}
      {isPending ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="animate-spin text-zinc-400" size={32} />
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-dashed border-red-200 p-8 text-center text-red-500 dark:border-red-500/30">
          Не вдалося завантажити звіт. Спробуйте оновити сторінку.
        </div>
      ) : companies.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 p-8 text-center text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          За обраний період входів партнерів не зафіксовано.
        </div>
      ) : (
        <div className="space-y-3">
          {companies.map((company) => {
            const key = companyKey(company);
            const isOpen = !collapsed[key];
            return (
              <div
                key={key}
                className="pa-card overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50"
              >
                <button
                  onClick={() => toggle(key)}
                  className="flex w-full items-center justify-between gap-3 p-4 text-left transition hover:bg-zinc-50 dark:hover:bg-white/5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="pa-no-print text-zinc-400">
                      {isOpen ? (
                        <ChevronDown size={18} />
                      ) : (
                        <ChevronRight size={18} />
                      )}
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-zinc-900 dark:text-white">
                        {company.company_name ||
                          company.company_name_full ||
                          "Без компанії"}
                      </h3>
                      <p className="truncate text-xs text-zinc-400">
                        {company.edrpou
                          ? `ЄДРПОУ ${company.edrpou} · `
                          : ""}
                        {company.active_users_count} із {company.users_count}{" "}
                        користувачів заходило
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-sm font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                    <LogIn size={14} />
                    {company.total_logins}
                  </div>
                </button>

                {isOpen && (
                  <div className="overflow-x-auto border-t border-zinc-100 dark:border-zinc-800">
                    <table className="w-full min-w-[720px] table-fixed text-sm">
                      <colgroup>
                        <col style={{ width: "30%" }} />
                        <col style={{ width: "20%" }} />
                        <col style={{ width: "10%" }} />
                        <col style={{ width: "20%" }} />
                        <col style={{ width: "20%" }} />
                      </colgroup>
                      <thead>
                        <tr className="text-left text-xs uppercase tracking-wide text-zinc-400">
                          <th className="px-4 py-2 font-medium">Користувач</th>
                          <th className="px-4 py-2 font-medium">Роль</th>
                          <th className="px-4 py-2 text-center font-medium">
                            Входів
                          </th>
                          <th className="px-4 py-2 font-medium">Перший вхід</th>
                          <th className="px-4 py-2 font-medium">
                            Останній вхід
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {company.users.map((u) => (
                          <tr
                            key={u.id_usr}
                            className="border-t border-zinc-50 dark:border-zinc-800/50 align-top"
                          >
                            <td className="px-4 py-2.5">
                              <div className="font-medium text-zinc-800 dark:text-zinc-100 break-words">
                                {fullName(u)}
                              </div>
                              <div className="text-xs text-zinc-400 break-words">
                                {[u.position, u.email]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </div>
                            </td>
                            <td className="px-4 py-2.5">
                              <RoleBadges user={u} />
                            </td>
                            <td className="px-4 py-2.5 text-center font-semibold text-zinc-700 dark:text-zinc-200">
                              {u.login_count}
                            </td>
                            <td className="px-4 py-2.5 whitespace-nowrap text-zinc-500 dark:text-zinc-400">
                              {fmtDateTime(u.first_login)}
                            </td>
                            <td className="px-4 py-2.5 whitespace-nowrap text-zinc-500 dark:text-zinc-400">
                              {fmtDateTime(u.last_login)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Стилі друку */}
      <style>{`
        @media print {
          aside, header { display: none !important; }
          .pa-no-print { display: none !important; }
          .pa-print-only { display: block !important; }
          .pa-report { padding: 0 !important; }
          .pa-card {
            break-inside: avoid;
            box-shadow: none !important;
            border-color: #d4d4d8 !important;
          }
          body { background: #fff !important; }
        }
      `}</style>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "slate" | "blue" | "emerald" | "violet";
}) {
  const tones: Record<string, string> = {
    slate:
      "bg-slate-50 text-slate-600 dark:bg-slate-500/10 dark:text-slate-300",
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    emerald:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    violet:
      "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
  };
  return (
    <div className="pa-card flex items-center gap-3 rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className={`rounded-xl p-2.5 ${tones[tone]}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-zinc-500">{label}</p>
        <p className="truncate text-lg font-bold text-zinc-900 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  );
}
