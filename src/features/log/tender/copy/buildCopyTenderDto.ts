import {
  tenderFormSchema,
  type TenderFormValues,
} from "../components/TenderSaveForm";

/**
 * Поля, які користувач перезаписує в майстрі «Копіювати тендер».
 * Решта береться з тендера-джерела як є.
 */
export interface CopyOverrides {
  date_load: Date;
  date_load2: Date | null;
  date_unload: Date | null;
  time_start: Date;
  time_end: Date;
  ids_valut: string;
  price_start?: number | null;
  price_step?: number | null;
  price_redemption?: number | null;
  price_client?: number | null;
}

const VALID_MEMBERS = ["ALL", "CARRIER", "MANAGER"] as const;

function pickMembers(src: any): "ALL" | "CARRIER" | "MANAGER" {
  const cand = [src?.ids_members_calc, src?.ids_members].find((v) =>
    (VALID_MEMBERS as readonly string[]).includes(v),
  );
  return (cand as "ALL" | "CARRIER" | "MANAGER") ?? "ALL";
}

const num = (v: any): number | undefined =>
  v === null || v === undefined || v === "" ? undefined : Number(v);

const pick = (override: any, fallback: any) =>
  override !== undefined && override !== null ? override : fallback;

/**
 * Збирає DTO для створення копії тендера.
 * Проганяє результат через ТУ САМУ zod-схему, що й справжня форма створення,
 * тож якщо чогось бракує (напр. замовника) — кидає помилку, а не пише биті дані.
 * id (тендера й елементів масивів) навмисно не переноситься → завжди create.
 */
export function buildCopyTenderDto(source: any, o: CopyOverrides) {
  const idsType = source?.ids_type;

  const routes = [...(source?.tender_route ?? [])]
    .sort((a: any, b: any) => (a.order_num || 0) - (b.order_num || 0))
    .map((r: any) => ({
      address: r.address || undefined,
      ids_point: r.ids_point,
      country: r.country || undefined,
      ids_country: r.ids_country != null ? String(r.ids_country) : "",
      city: r.city || undefined,
      order_num: r.order_num ?? 1,
      customs: Boolean(r.customs),
      lat: num(r.lat),
      lon: num(r.lon),
      ids_region: r.ids_region != null ? String(r.ids_region) : null,
      post_code: r.post_code ?? null,
      street: r.street ?? null,
      house: r.house ?? null,
    }));

  const pStart = pick(o.price_start, num(source?.price_start));
  const pStep = pick(o.price_step, num(source?.price_step));
  const pRed = pick(o.price_redemption, num(source?.price_redemption));
  const pClient = pick(o.price_client, num(source?.price_client));

  const candidate = {
    // id навмисно відсутній → create
    cargo: source?.cargo,
    notes: source?.notes ?? undefined,
    load_info: source?.load_info ?? undefined,
    company_name: source?.company_name ?? undefined,
    id_owner_company: num(source?.id_owner_company) ?? null,
    ids_type: idsType,
    ids_carrier_rating: source?.ids_carrier_rating,
    ids_members: pickMembers(source),
    without_vat: Boolean(source?.without_vat),
    car_count: num(source?.car_count) ?? 1,
    weight: num(source?.weight),
    volume: num(source?.volume),
    palet_count: num(source?.palet_count) ?? null,
    ref_temperature_from: num(source?.ref_temperature_from) ?? null,
    ref_temperature_to: num(source?.ref_temperature_to) ?? null,

    ids_valut: o.ids_valut || source?.ids_valut,
    price_start: pStart ?? undefined,
    price_step: idsType === "AUCTION" ? undefined : (pStep ?? undefined),
    price_redemption:
      idsType === "REDUCTION_WITH_REDEMPTION" ? (pRed ?? undefined) : undefined,
    price_client: pClient ?? null,
    cost_redemption: num(source?.cost_redemption),

    time_start: o.time_start,
    time_end: o.time_end,
    date_load: o.date_load,
    date_load2: o.date_load2,
    date_unload: o.date_unload,

    tender_route: routes,
    tender_trailer: (source?.tender_trailer ?? [])
      .filter((t: any) => t?.ids_trailer_type)
      .map((t: any) => ({ ids_trailer_type: String(t.ids_trailer_type) })),
    tender_load: (source?.tender_load ?? [])
      .filter((l: any) => l?.ids_load_type)
      .map((l: any) => ({ ids_load_type: String(l.ids_load_type) })),
    tender_permission: (source?.tender_permission ?? [])
      .filter((p: any) => p?.ids_permission_type)
      .map((p: any) => ({ ids_permission_type: String(p.ids_permission_type) })),
  };

  // Валідація тією самою схемою, що й справжнє створення тендера.
  const values = tenderFormSchema.parse(candidate) as TenderFormValues;

  // Ті самі sanitization-кроки, що й у submitTender форми:
  const dto: any = {
    ...values,
    weight: values.weight
      ? Number(Number(values.weight).toFixed(2))
      : values.weight,
    volume: values.volume
      ? Number(Number(values.volume).toFixed(2))
      : values.volume,
    price_start: values.price_start
      ? Number(Number(values.price_start).toFixed(2))
      : values.price_start,
    price_step: values.price_step
      ? Number(Number(values.price_step).toFixed(2))
      : values.price_step,
    price_redemption: values.price_redemption
      ? Number(Number(values.price_redemption).toFixed(2))
      : values.price_redemption,
    tender_route: values.tender_route.map((r, idx) => ({
      ...r,
      order_num: idx + 1,
      lat: r.lat ? Number(Number(r.lat).toFixed(6)) : r.lat,
      lon: r.lon ? Number(Number(r.lon).toFixed(6)) : r.lon,
    })),
    current_file_ids: [] as number[],
  };
  delete dto.id;

  return dto;
}
