"use client";

import { Button, Card } from "@/shared/components/ui";
import { cn } from "@/shared/utils";
import {
  Building2,
  MapPin,
  Fingerprint,
  Truck,
  UserCircle,
  Briefcase,
  Star,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Ban,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ICompany } from "../../types/company.types";
import { useMemo, useState } from "react";
import { CompanyActivityTimeline } from "./CompanyActivityTimeline";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Activity } from "lucide-react";

interface CompanyCardProps {
  company: ICompany;
}

export function CompanyCard({ company }: CompanyCardProps) {
  const router = useRouter();
  const [isActivityLogOpen, setIsActivityLogOpen] = useState(false);

  const stars = useMemo(() => {
    const r = Number(company.rating || 0);
    if (r === 3) return 3;
    if (r === 2) return 2;
    if (r === 1) return 1;
    return 0
  }, [company.rating]);

  const statusConfig = {
    blacklisted: {
      color: "bg-red-500",
      text: "text-red-500",
      label: "Blacklist",
      icon: <ShieldAlert className="h-3 w-3" />,
    },
    blocked: {
      color: "bg-orange-500",
      text: "text-orange-500",
      label: "Blocked",
      icon: <Ban className="h-3 w-3" />,
    },
    active: {
      color: "bg-emerald-500",
      text: "text-emerald-500",
      label: "Active",
      icon: <ShieldCheck className="h-3 w-3" />,
    },
  };

  const status = company.black_list
    ? statusConfig.blacklisted
    : company.is_blocked
      ? statusConfig.blocked
      : statusConfig.active;

  return (
    <>
    <Card
      onClick={() => router.push(`/admin/companies/edit/${company.id}`)}
      className="group relative flex items-stretch rounded-xl border border-border bg-card transition-all hover:ring-1 hover:ring-primary/30 hover:shadow-lg cursor-pointer active:scale-[0.98] overflow-hidden"
    >
      {/* 🔹 Кольоровий статус (лінія) */}
      <div className={cn("w-1.5 shrink-0", status.color)} />

      <div className="flex flex-1 flex-col md:grid md:grid-cols-[1.2fr_180px_1.2fr_160px] md:items-center p-4 gap-y-4 md:gap-0">
        {/* 🔹 1. КОМПАНІЯ (Назва + Рейтинг) */}
        <div className="flex items-center gap-4 min-w-0 md:pr-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted group-hover:bg-primary/10 transition-colors">
            <Building2 className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
          </div>
          <div className="flex flex-col min-w-0">
            <h4 className="text-[15px] font-bold text-foreground leading-snug truncate group-hover:text-primary transition-colors">
              {company.company_name}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex bg-amber-400/10 px-1.5 py-0.5 rounded shrink-0">
                {[...Array(3)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-2.5 w-2.5",
                      i < stars
                        ? "fill-amber-400 text-amber-400"
                        : "fill-transparent text-muted-foreground/20",
                    )}
                  />
                ))}
              </div>
              <span className="text-[10px] font-mono text-muted-foreground bg-muted/50 px-1 rounded">
                ID:{company.id}
              </span>
            </div>
          </div>
        </div>

        {/* 🔹 2. ІДЕНТИФІКАЦІЯ (ЄДРПОУ + Бадж) */}
        <div className="flex flex-row md:flex-col items-center md:items-start justify-between md:justify-center px-0 md:px-6 md:border-l border-border/40 gap-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Fingerprint className="h-3.5 w-3.5 opacity-70" />
            <span className="text-[13px] font-bold font-mono tracking-tight text-foreground">
              {company.edrpou}
            </span>
          </div>
          <div
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-tight bg-background",
              status.text,
              "border-current",
            )}
          >
            {status.icon} {status.label}
          </div>
        </div>

        {/* 🔹 3. ЛОКАЦІЯ (Адреса) */}
        <div className="flex items-start gap-2 px-0 md:px-6 md:border-l border-border/40 min-w-0 overflow-hidden">
          <MapPin className="h-4 w-4 shrink-0 text-muted-foreground/30 mt-0.5" />
          <span className="text-[12px] leading-[1.4] text-muted-foreground/80 line-clamp-2 italic font-medium">
            {company.address || "Адреса не вказана"}
          </span>
        </div>

        {/* 🔹 4. РОЛІ ТА ДІЯ */}
        <div className="flex items-center justify-between md:justify-end gap-4 pl-0 md:pl-6 md:border-l border-border/40 mt-2 md:mt-0">
          <div className="flex -space-x-1.5">
            {company.is_carrier && (
              <RoleBadge
                icon={<Truck size={14} />}
                color="bg-blue-600"
                title="Перевізник"
              />
            )}
            {company.is_client && (
              <RoleBadge
                icon={<UserCircle size={14} />}
                color="bg-emerald-600"
                title="Клієнт"
              />
            )}
            {company.is_expedition && (
              <RoleBadge
                icon={<Briefcase size={14} />}
                color="bg-purple-600"
                title="Експедиція"
              />
            )}
          </div>

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground hover:bg-primary hover:text-white transition-all shadow-sm z-10"
               onClick={(e) => {
                 e.stopPropagation();
                 setIsActivityLogOpen(true);
               }}>
            <Activity size={16} />
          </div>

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
            <ExternalLink size={16} />
          </div>
        </div>
      </div>
    </Card>

    {/* Activity Log Modal */}
    <Dialog open={isActivityLogOpen} onOpenChange={setIsActivityLogOpen}>
      <DialogContent 
        width="max-w-[100vw]" 
        className="flex flex-col !max-w-[100vw] w-screen !h-[100dvh] !max-h-[100dvh] !rounded-none border-none p-0 gap-0 overflow-hidden [&>div.custom-scrollbar]:flex [&>div.custom-scrollbar]:flex-col [&>div.custom-scrollbar]:h-full [&>div.custom-scrollbar]:p-0"
      >
        <div className="flex flex-col h-full w-full">
          <DialogHeader className="p-4 sm:p-6 shrink-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <Activity size={24} className="text-emerald-500" />
              Активність компанії ({company.company_name})
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 sm:px-12 bg-zinc-50 dark:bg-zinc-950">
            <div className="max-w-7xl mx-auto w-full">
              {isActivityLogOpen && <CompanyActivityTimeline companyId={company.id} />}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}

// Допоміжний компонент баджа ролі для чистоти коду
function RoleBadge({
  icon,
  color,
  title,
}: {
  icon: React.ReactNode;
  color: string;
  title: string;
}) {
  return (
    <div
      title={title}
      className={cn(
        "h-8 w-8 rounded-full border-2 border-card flex items-center justify-center text-white shadow-sm ring-1 ring-black/5 transition-transform hover:scale-110 hover:z-10",
        color,
      )}
    >
      {icon}
    </div>
  );
}
