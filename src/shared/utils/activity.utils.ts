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
    "/log/tender/closed": "Логи: Закриті тендери",
    "/log/tender/agreement": "Логи: Договори",
    "/log/tender/plan": "Логи: Заплановані тендери",
    "/log/tender/draft": "Логи: Чернетки",
    "/log/tender/analyze": "Логи: Аналіз",
    "/log": "Головна (Логи)",
    "/log/load/active": "Логи: Активні заявки",
    "/log/load/archive": "Логи: Архів заявок",
    "/log/files": "Логи: Документи",
    "/log/map": "Логи: Карта",
    "/admin/analytics": "Аналітика",
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
    "LOGIN": "Вхід",
    "LOGOUT": "Вихід",
    "CREATE": "Створення",
    "UPDATE": "Оновлення",
    "DELETE": "Видалення",
    "DOWNLOAD": "Завантаження",
    "CHANGE_PASSWORD": "Зміна пароля",
    "BUTTON_CLICK": "Натискання кнопки",
    "BID": "Ставка",
    "FILE_DOWNLOAD": "Завантаження файлу",
    "ADDED_COMMENT": "Коментар",
    "PLACED_BID": "Ставка",
    "PLACED_BID_BUYOUT": "Викуп",
    "PLACED_BID_CUSTOM": "Своя ціна",
    "PLACED_BID_STEP": "Крок"
  };

  return actionMap[action] || action;
};
