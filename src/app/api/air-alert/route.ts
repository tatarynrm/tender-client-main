import { NextResponse } from "next/server";

/**
 * Проксі стану повітряних тривог по областях.
 * Джерело безкоштовне й безключове: vadimklimenko statuses.json (стан усіх областей).
 * У нього немає CORS, тому ходимо з сервера й віддаємо на той самий origin.
 * Дані НЕ зберігаються в БД — лише короткий кеш у пам'яті процесу.
 */

const SOURCE = "https://vadimklimenko.com/map/statuses.json";
const TTL_MS = 20_000;

interface AlertPayload {
  updatedAt: number;
  /** назва області → true, якщо активна тривога */
  regions: Record<string, boolean>;
}

let cache: { at: number; data: AlertPayload } | null = null;

export async function GET() {
  if (cache && Date.now() - cache.at < TTL_MS) {
    return NextResponse.json(cache.data, {
      headers: { "x-cache": "HIT" },
    });
  }

  try {
    const res = await fetch(SOURCE, {
      cache: "no-store",
      headers: { "User-Agent": "ICTender-AirAlert/1.0" },
    });
    if (!res.ok) throw new Error(`source ${res.status}`);

    const raw = (await res.json()) as {
      states?: Record<string, { enabled?: boolean }>;
    };

    const regions: Record<string, boolean> = {};
    for (const [name, st] of Object.entries(raw.states ?? {})) {
      regions[name] = Boolean(st?.enabled);
    }

    const data: AlertPayload = { updatedAt: Date.now(), regions };
    cache = { at: Date.now(), data };

    return NextResponse.json(data, { headers: { "x-cache": "MISS" } });
  } catch (e) {
    // Якщо джерело недоступне — віддаємо останній відомий стан, а не падаємо
    if (cache) {
      return NextResponse.json(cache.data, {
        headers: { "x-cache": "STALE" },
      });
    }
    return NextResponse.json(
      { updatedAt: Date.now(), regions: {}, error: "source_unavailable" },
      { status: 503 },
    );
  }
}
