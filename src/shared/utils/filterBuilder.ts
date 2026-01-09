// shared/utils/filterBuilder.ts

export interface FilterItem {
  type: 'query';
  key: string;
  value: string;
}

/**
 * Динамічно будує масив фільтрів з об'єкта query.
 */
export function buildFiltersFromQuery(query: Record<string, any>): FilterItem[] {
  const filters: FilterItem[] = [];
  
  // Поля, які ми НЕ хочемо бачити в бейджах
  const excludedKeys = ['page', 'limit', 'sort'];

  Object.entries(query).forEach(([key, value]) => {
    // Пропускаємо порожні значення та технічні ключі
    if (!value || excludedKeys.includes(key)) return;

    if (typeof value === 'string') {
      const values = value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      values.forEach((v) => {
        filters.push({ type: 'query', key, value: v });
      });
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      filters.push({ type: 'query', key, value: String(value) });
    }
  });

  return filters;
}