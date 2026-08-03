import { NextResponse } from "next/server";
import { getProfile } from "./getProfile";

/**
 * Гард для route handlers адмінки. Повертає NextResponse з помилкою,
 * якщо доступу немає, або null — якщо все гаразд.
 *
 * Сторінку /admin гейтить layout, але сам API-роут інакше був би відкритий.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const profile = await getProfile();

  if (!profile) {
    return NextResponse.json({ error: "Неавторизовано" }, { status: 401 });
  }

  if (!profile.role?.is_admin) {
    return NextResponse.json({ error: "Немає доступу" }, { status: 403 });
  }

  return null;
}
