"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Database,
  Link2,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
} from "lucide-react";

import { Button, Input } from "@/shared/components/ui";
import { cn } from "@/shared/utils";
import {
  INorisCandidate,
  INorisCompany,
  norisService,
} from "./noris.service";

const PAGE_SIZE = 20;

const matchLabel: Record<INorisCandidate["match"], string> = {
  edrpou: "Збіг за ЄДРПОУ",
  name: "Збіг за назвою",
  manual: "Ручний пошук",
};

function CandidateRow({
  cand,
  onLink,
  isLinking,
}: {
  cand: INorisCandidate;
  onLink: () => void;
  isLinking: boolean;
}) {
  const taken = !!cand.linked_company;
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl border",
        cand.match === "edrpou"
          ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/30 dark:bg-emerald-500/10"
          : "border-border bg-background",
      )}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-sm">{cand.nur || "—"}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
            {matchLabel[cand.match]}
          </span>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>
            kod: <b className="text-foreground">{cand.kod}</b>
          </span>
          <span>ЄДРПОУ: {cand.zkpo || "—"}</span>
          {cand.nadr && (
            <span className="flex items-center gap-1">
              <MapPin size={11} />
              {String(cand.nadr).replace(/[\r\n]+/g, ", ").replace(/^,\s*/, "")}
            </span>
          )}
        </div>
        {taken && (
          <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <AlertTriangle size={12} />
            Уже прив'язано до «{cand.linked_company!.company_name}» (id{" "}
            {cand.linked_company!.id})
          </div>
        )}
      </div>
      <Button
        size="sm"
        onClick={onLink}
        disabled={taken || isLinking}
        className="shrink-0"
      >
        {isLinking ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Link2 className="w-4 h-4" />
        )}
        Встановити migrate_id
      </Button>
    </div>
  );
}

function CompanyBlock({
  company,
  onLink,
  linkingKey,
}: {
  company: INorisCompany;
  onLink: (companyId: number, kod: number) => void;
  linkingKey: string | null;
}) {
  const [query, setQuery] = useState("");
  const [manual, setManual] = useState<INorisCandidate[] | null>(null);
  const [searching, setSearching] = useState(false);

  const runManualSearch = async () => {
    const q = query.trim();
    const isNumeric = /^\d+$/.test(q);
    if (!q || (isNumeric ? q.length < 8 : q.length < 3)) {
      toast.error("Введіть назву (від 3 символів) або ЄДРПОУ (від 8 цифр)");
      return;
    }
    setSearching(true);
    try {
      const rows = await norisService.searchOracle(q);
      setManual(
        rows.map((r: any) => ({
          kod: Number(r.kod),
          nur: r.nur,
          zkpo: r.zkpo,
          fo: r.fo,
          nadr: r.nadr,
          match: "manual" as const,
          linked_company: null,
        })),
      );
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Помилка пошуку в Oracle");
    } finally {
      setSearching(false);
    }
  };

  const list = manual ?? company.candidates;

  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-3 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/admin/companies/edit/${company.id}`}
            className="flex items-center gap-2 font-bold hover:text-primary"
          >
            <Building2 size={16} className="shrink-0 text-muted-foreground" />
            {company.company_name || company.company_name_full || "Без назви"}
          </Link>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>id: {company.id}</span>
            <span>ЄДРПОУ: {company.edrpou || "—"}</span>
            {company.company_name_full &&
              company.company_name_full !== company.company_name && (
                <span>Повна: {company.company_name_full}</span>
              )}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runManualSearch()}
            placeholder="Інший пошук: назва або ЄДРПОУ"
            className="h-9 md:w-64"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={runManualSearch}
            disabled={searching}
          >
            {searching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </Button>
          {manual && (
            <Button size="sm" variant="ghost" onClick={() => setManual(null)}>
              Авто
            </Button>
          )}
        </div>
      </div>

      {company.error && !manual ? (
        <div className="text-xs text-red-500 flex items-center gap-1">
          <AlertTriangle size={12} /> Помилка пошуку в Oracle: {company.error}
        </div>
      ) : list.length === 0 ? (
        <div className="text-xs text-muted-foreground italic">
          {manual
            ? "Нічого не знайдено"
            : "Автоматично в Oracle не знайдено — спробуйте інший пошук"}
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((cand) => (
            <CandidateRow
              key={`${cand.match}-${cand.kod}`}
              cand={cand}
              isLinking={linkingKey === `${company.id}:${cand.kod}`}
              onLink={() => onLink(company.id, cand.kod)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function NorisLinkPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [linkingKey, setLinkingKey] = useState<string | null>(null);

  const { data, isLoading, isFetching, refetch, error } = useQuery({
    queryKey: ["admin-noris-unlinked", page],
    queryFn: () => norisService.getUnlinked(page, PAGE_SIZE),
    staleTime: 60_000,
  });

  const linkMutation = useMutation({
    mutationFn: ({ id, kod }: { id: number; kod: number }) =>
      norisService.link(id, kod),
    onMutate: ({ id, kod }) => setLinkingKey(`${id}:${kod}`),
    onSuccess: (_, { kod }) => {
      toast.success(`migrate_id ${kod} встановлено`);
      queryClient.invalidateQueries({ queryKey: ["admin-noris-unlinked"] });
      queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.message || "Не вдалося встановити migrate_id");
    },
    onSettled: () => setLinkingKey(null),
  });

  const total = data?.total ?? 0;
  const pageCount = data?.page_count ?? 1;

  return (
    <div className="min-h-screen bg-background text-foreground space-y-6 w-full px-4 py-6 mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Database className="w-6 h-6 text-primary" />
            NORIS: зв'язок компаній з Oracle
          </h2>
          <p className="text-sm text-muted-foreground">
            Компанії без <code>migrate_id</code>. Для кожної шукаємо в Oracle
            (реєстр <code>ur</code>) за ЄДРПОУ та назвою.{" "}
            <code>migrate_company</code> встановлюється як <b>ICT</b>.
          </p>
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {total} без migrate_id
          </span>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={cn("w-4 h-4", isFetching && "animate-spin")} />
          Оновити
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-sm">Шукаємо компанії в Oracle…</span>
        </div>
      ) : error ? (
        <div className="py-20 text-center text-red-500">
          {(error as any)?.response?.data?.message || "Не вдалося завантажити список"}
        </div>
      ) : !data?.rows.length ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card/30 rounded-2xl border-2 border-dashed border-border">
          <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-4" />
          <h3 className="text-lg font-medium">Усі компанії мають migrate_id</h3>
        </div>
      ) : (
        <div className="space-y-3">
          {data.rows.map((c) => (
            <CompanyBlock
              key={c.id}
              company={c}
              linkingKey={linkingKey}
              onLink={(id, kod) => linkMutation.mutate({ id, kod })}
            />
          ))}
        </div>
      )}

      {pageCount > 1 && (
        <div className="flex justify-between items-center bg-card border border-border rounded-xl px-6 py-3">
          <span className="text-xs text-muted-foreground">
            Сторінка {page} з {pageCount}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={page >= pageCount || isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
