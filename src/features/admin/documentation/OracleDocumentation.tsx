"use client";
import { useMemo, useState } from "react";
import { useOracleDocs } from "../hooks/useOracleDocs";
import type {
  OraclePlsqlDoc,
  OracleTableDoc,
} from "../services/admin.oracle-docs.service";

type Tab = "tables" | "plsql" | "views" | "indexes" | "history";

const TABS: { key: Tab; label: string }[] = [
  { key: "tables", label: "Таблиці" },
  { key: "plsql", label: "Функції та процедури" },
  { key: "views", label: "В'ю" },
  { key: "indexes", label: "Індекси" },
  { key: "history", label: "Історія змін" },
];

export const OracleDocumentation = () => {
  const { docs, isLoading, error, status, refresh, isRefreshing } =
    useOracleDocs();
  const [tab, setTab] = useState<Tab>("tables");
  const [search, setSearch] = useState("");
  const [openTable, setOpenTable] = useState<string | null>(null);

  const q = search.trim().toUpperCase();

  const filteredTables = useMemo(() => {
    if (!docs) return [];
    if (!q) return docs.tables;
    return docs.tables.filter(
      (t) =>
        t.name.includes(q) ||
        (t.comment || "").toUpperCase().includes(q) ||
        t.columns.some(
          (c) =>
            c.name.includes(q) || (c.comment || "").toUpperCase().includes(q),
        ),
    );
  }, [docs, q]);

  const filteredPlsql = useMemo(() => {
    if (!docs) return [];
    if (!q) return docs.plsql;
    return docs.plsql.filter((o) => o.name.includes(q));
  }, [docs, q]);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Завантаження документації схеми Oracle...
      </div>
    );
  }

  if (error || !docs) {
    const message =
      error?.response?.data?.message ||
      "Снапшот схеми ще не згенеровано. Натисніть «Оновити зараз» або дочекайтеся планової перевірки о 20:00.";
    return (
      <div className="p-6">
        <div className="p-4 border rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-200">
          {message}
        </div>
        <button
          onClick={() => refresh()}
          disabled={isRefreshing}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isRefreshing ? "Оновлення..." : "Оновити зараз"}
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Документація БД Oracle (ICTDAT)</h1>
          <p className="text-sm text-muted-foreground">
            Згенеровано: {new Date(docs.generatedAt).toLocaleString("uk-UA")}
            {status?.lastCheckAt && (
              <>
                {" · "}остання перевірка:{" "}
                {new Date(status.lastCheckAt).toLocaleString("uk-UA")} (
                {status.lastTrigger})
              </>
            )}
          </p>
        </div>
        <button
          onClick={() => refresh()}
          disabled={isRefreshing}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isRefreshing ? "Оновлення..." : "Оновити зараз"}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatCard label="Таблиці" value={docs.tables.length} />
        <StatCard label="PL/SQL-об'єкти" value={docs.plsql.length} />
        <StatCard label="В'ю" value={docs.views.length} />
        <StatCard label="Індекси" value={docs.indexes.length} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded text-sm ${
              tab === t.key
                ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900"
                : "border hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            {t.label}
          </button>
        ))}
        {(tab === "tables" || tab === "plsql") && (
          <input
            placeholder="Пошук по назві, колонці, коментарю..."
            className="ml-auto p-2 border rounded w-full sm:w-80 dark:bg-slate-800"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        )}
      </div>

      {tab === "tables" && (
        <div className="flex flex-col gap-2">
          {filteredTables.map((t) => (
            <TableCard
              key={t.name}
              table={t}
              open={openTable === t.name}
              onToggle={() =>
                setOpenTable(openTable === t.name ? null : t.name)
              }
            />
          ))}
          {filteredTables.length === 0 && <Empty />}
        </div>
      )}

      {tab === "plsql" && (
        <div className="flex flex-col gap-2">
          {filteredPlsql.map((o) => (
            <PlsqlCard key={`${o.type}:${o.name}`} obj={o} />
          ))}
          {filteredPlsql.length === 0 && <Empty />}
        </div>
      )}

      {tab === "views" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {docs.views.map((v) => (
            <div key={v.name} className="p-2 border rounded font-mono text-sm">
              {v.name}
            </div>
          ))}
          {docs.views.length === 0 && <Empty />}
        </div>
      )}

      {tab === "indexes" && (
        <div className="overflow-x-auto border rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b bg-zinc-50 dark:bg-zinc-900">
                <th className="p-2">Індекс</th>
                <th className="p-2">Таблиця</th>
                <th className="p-2">Унікальний</th>
              </tr>
            </thead>
            <tbody>
              {docs.indexes.map((i) => (
                <tr key={i.name} className="border-b last:border-0">
                  <td className="p-2 font-mono">{i.name}</td>
                  <td className="p-2 font-mono">{i.table}</td>
                  <td className="p-2">{i.unique ? "так" : "ні"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "history" && (
        <div className="flex flex-col gap-3">
          {docs.history.map((h, idx) => (
            <div key={idx} className="p-3 border rounded-xl">
              <div className="text-sm font-semibold mb-1">
                {new Date(h.at).toLocaleString("uk-UA")}{" "}
                <span className="text-muted-foreground font-normal">
                  ({h.trigger})
                </span>
              </div>
              <ul className="list-disc list-inside text-sm space-y-0.5">
                {h.changes.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          ))}
          {docs.history.length === 0 && <Empty />}
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value }: { label: string; value: number }) => (
  <div className="p-3 border rounded-xl">
    <div className="text-2xl font-bold">{value}</div>
    <div className="text-sm text-muted-foreground">{label}</div>
  </div>
);

const Empty = () => (
  <div className="p-6 text-center text-muted-foreground">Нічого не знайдено</div>
);

const TableCard = ({
  table,
  open,
  onToggle,
}: {
  table: OracleTableDoc;
  open: boolean;
  onToggle: () => void;
}) => (
  <div className="border rounded-xl">
    <button
      onClick={onToggle}
      className="w-full text-left p-3 flex items-center justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl"
    >
      <div>
        <span className="font-mono font-semibold">{table.name}</span>
        {table.comment && (
          <span className="ml-2 text-sm text-muted-foreground">
            {table.comment}
          </span>
        )}
      </div>
      <span className="text-sm text-muted-foreground shrink-0">
        {table.columns.length} кол. {open ? "▾" : "▸"}
      </span>
    </button>
    {open && (
      <div className="p-3 pt-0 flex flex-col gap-3">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="p-1.5">Колонка</th>
                <th className="p-1.5">Тип</th>
                <th className="p-1.5">Null</th>
                <th className="p-1.5">Коментар</th>
              </tr>
            </thead>
            <tbody>
              {table.columns.map((c) => (
                <tr key={c.name} className="border-b last:border-0">
                  <td className="p-1.5 font-mono">{c.name}</td>
                  <td className="p-1.5">{c.dataType}</td>
                  <td className="p-1.5">{c.nullable ? "так" : "ні"}</td>
                  <td className="p-1.5 text-muted-foreground">
                    {c.comment || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {table.foreignKeys.length > 0 && (
          <div className="text-sm">
            <div className="font-semibold mb-1">Посилається на:</div>
            <ul className="list-disc list-inside space-y-0.5">
              {table.foreignKeys.map((fk) => (
                <li key={fk.constraintName} className="font-mono">
                  {fk.columns} → {fk.parentTable} ({fk.parentColumns})
                </li>
              ))}
            </ul>
          </div>
        )}
        {table.referencedBy.length > 0 && (
          <div className="text-sm">
            <span className="font-semibold">На неї посилаються: </span>
            <span className="font-mono">{table.referencedBy.join(", ")}</span>
          </div>
        )}
      </div>
    )}
  </div>
);

const PlsqlCard = ({ obj }: { obj: OraclePlsqlDoc }) => (
  <div className="p-3 border rounded-xl">
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">
        {obj.type}
      </span>
      <span className="font-mono font-semibold">{obj.name}</span>
      {obj.status !== "VALID" && (
        <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
          {obj.status}
        </span>
      )}
      <span className="ml-auto text-xs text-muted-foreground">
        DDL: {obj.lastDdlTime}
      </span>
    </div>
    {obj.arguments.length > 0 && (
      <div className="mt-1.5 text-sm text-muted-foreground font-mono">
        {obj.arguments
          .filter((a) => a.name)
          .slice(0, 12)
          .map((a) => `${a.name} ${a.inOut} ${a.dataType ?? ""}`.trim())
          .join(", ")}
        {obj.arguments.filter((a) => a.name).length > 12 && " …"}
      </div>
    )}
  </div>
);
