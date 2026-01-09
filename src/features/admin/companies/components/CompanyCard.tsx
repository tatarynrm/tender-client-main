"use client";

import { Company } from "@/app/admin/companies/page";
import { Button, Card } from "@/shared/components/ui";
import { cn } from "@/shared/utils";
import {
  Building2,
  MapPin,
  Fingerprint,
  MoreVertical,
  Truck,
  UserCircle,
  Briefcase,
  Star,
  GripVertical,
} from "lucide-react";

interface CompanyCardProps {
  company: Company;
}

export function CompanyCard({ company }: CompanyCardProps) {
  const getRatingStars = (rating: number | string | null | undefined) => {
    const r = Number(rating || 0);
    if (r === 2) return 5;
    if (r === 1) return 3;
    return 1;
  };

  const stars = getRatingStars(company.rating);

  return (
    <Card className="group relative flex items-center gap-4 rounded-xl border border-border bg-card p-3 transition-all  hover:shadow-md dark:hover:bg-accent/20">
      {/* 🔹 Статуси-індикатори */}
      <div className="flex flex-col gap-1.5 shrink-0 pl-1">
        {company.black_list ? (
          <div
            className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
            title="Blacklist"
          />
        ) : company.is_blocked ? (
          <div
            className="h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]"
            title="Blocked"
          />
        ) : (
          <div
            className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
            title="Active"
          />
        )}
      </div>

      {/* 🔹 Основна інформація */}
      <div className="grid flex-1 grid-cols-1 md:grid-cols-[1.5fr_1fr_1.5fr_1fr] items-center gap-4 overflow-hidden">
        {/* Компанія + Назва */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary transition-colors">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-foreground truncate tracking-tight">
              {company.company_name}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="flex shrink-0">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-2.5 w-2.5",
                      i < stars
                        ? "fill-amber-400 text-amber-400"
                        : "fill-muted/20 text-muted"
                    )}
                  />
                ))}
              </div>
              <span className="text-[10px] text-muted-foreground font-medium truncate uppercase tracking-tighter">
                ID: {company.id}
              </span>
            </div>
          </div>
        </div>

        {/* ЄДРПОУ */}
        <div className="hidden md:flex items-center gap-2">
          <Fingerprint className="h-3.5 w-3.5 text-muted-foreground/50" />
          <span className="text-xs font-mono font-medium text-foreground/80 tracking-wider">
            {company.edrpou}
          </span>
        </div>

        {/* Адреса */}
        <div className="hidden lg:flex items-center gap-2 text-muted-foreground min-w-0">
          <MapPin className="h-3.5 w-3.5 shrink-0 opacity-50" />
          <span className="text-xs truncate italic font-light tracking-tight group-hover:text-foreground/70 transition-colors">
            {company.address}
          </span>
        </div>

        {/* Ролі (Компактні баджі) */}
        <div className="flex items-center justify-end gap-1.5 pr-2">
          {company.is_carrier && (
            <div
              className="p-1.5 rounded-md bg-blue-500/10 text-blue-500 border border-blue-500/20"
              title="Перевізник"
            >
              <Truck className="h-3.5 w-3.5" />
            </div>
          )}
          {company.is_client && (
            <div
              className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
              title="Клієнт"
            >
              <UserCircle className="h-3.5 w-3.5" />
            </div>
          )}
          {company.is_expedition && (
            <div
              className="p-1.5 rounded-md bg-purple-500/10 text-purple-500 border border-purple-500/20"
              title="Експедиція"
            >
              <Briefcase className="h-3.5 w-3.5" />
            </div>
          )}
        </div>
      </div>

      {/* 🔹 Кнопка дій */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="h-4 w-4" />
      </Button>
    </Card>
  );
}
