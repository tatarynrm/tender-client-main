export const translateActivityPath = (path: string): string => {
  if (!path) return "Невідома сторінка";

  const pathMap: Record<string, string> = {
    "/": "Головна",
    "/dashboard": "Дашборд",
    "/admin": "Сторінка адміна",
    "/admin/": "Сторінка адміна",
    "/admin/users": "Користувачі",
    "/admin/email-broadcast": "Email Розсилка",
    "/admin/meeting": "Зустрічі",
    "/admin/companies": "Компанії",
    "/admin/tender/active": "Активні тендери",
    "/admin/tender/archive": "Архів тендерів",
    "/log/tender/active": "Логи: Активні тендери",
    "/log/tender/archive": "Логи: Архів тендерів",
    "/dashboard/tender/active": "Дашборд: Активні тендери",
    "/dashboard/tender/win": "Дашборд: Виграні тендери",
    "/dashboard/tender/closed": "Дашборд: Закриті тендери",
    "/dashboard/tender/plan": "Дашборд: Заплановані тендери",
  };

  // Exact match
  if (pathMap[path]) {
    return pathMap[path];
  }

  // Partial match for nested routes
  if (path.startsWith("/admin/users/")) return "Деталі користувача";
  if (path.startsWith("/admin/companies/")) return "Деталі компанії";
  if (path.startsWith("/tenders/")) return "Деталі тендеру";

  return path;
};

export const translateAction = (action: string): string => {
  if (!action) return "Інше";
  
  const actionMap: Record<string, string> = {
    "PAGE_VIEW": "Перегляд сторінки",
    "LOGIN": "Авторизація",
    "LOGOUT": "Вихід",
    "CREATE": "Створення",
    "UPDATE": "Оновлення",
    "DELETE": "Видалення",
    "DOWNLOAD": "Завантаження",
  };

  return actionMap[action] || action;
};
