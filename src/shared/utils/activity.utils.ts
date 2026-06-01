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
    "/admin/system-control": "Системний контроль",
    "/admin/notifications": "Сповіщення",
    "/admin/settings": "Налаштування",
    "/admin/suggestions": "Відгуки і пропозиції",
    "/admin/telegram": "Telegram",
    "/admin/updates": "Оновлення",
    "/log/apps": "Логи: Додатки",
    "/log/documents": "Логи: Документи",
    "/log/load": "Логи: Завантаження",
    "/log/meeting": "Логи: Зустрічі",
    "/log/profile": "Логи: Профіль",
    "/log/settings": "Логи: Налаштування",
    "/log/tasks": "Логи: Завдання",
    "/log/tender": "Логи: Тендери",
    "/log/test": "Логи: Тести",
    "/log/updates": "Логи: Оновлення",
    "/dashboard/cabinet": "Дашборд: Кабінет",
    "/dashboard/chat": "Дашборд: Чат",
    "/dashboard/company": "Дашборд: Компанія",
    "/dashboard/personal": "Дашборд: Персональні дані",
    "/dashboard/personal/my-company": "Дашборд: Моя компанія",
    "/dashboard/profile": "Дашборд: Профіль",
    "/dashboard/socket": "Дашборд: Сокет",
    "/dashboard/updates": "Дашборд: Оновлення",
    "/dashboard/users": "Дашборд: Користувачі",
    "/login": "Авторизація",
    "/register": "Реєстрація",
    "/auth/login": "Авторизація",
    "/auth/register": "Реєстрація",
    "/auth/forgot-password": "Відновлення пароля",
    "/auth/reset-password": "Скидання пароля",
  };

  // Exact match
  if (pathMap[path]) {
    return pathMap[path];
  }

  // Partial match for nested routes
  if (path.startsWith("/admin/users/")) return "Деталі користувача";
  if (path.startsWith("/admin/companies/")) return "Деталі компанії";
  if (path.startsWith("/tenders/")) return "Деталі тендеру";
  if (path.startsWith("/admin/system-control/")) return "Системний контроль";
  if (path.startsWith("/admin/suggestions/")) return "Відгуки і пропозиції";
  if (path.startsWith("/admin/notifications/")) return "Сповіщення";
  if (path.startsWith("/admin/telegram/")) return "Telegram";
  if (path.startsWith("/admin/updates/")) return "Оновлення";
  
  if (path.startsWith("/log/apps/")) return "Логи: Додатки";
  if (path.startsWith("/log/documents/")) return "Логи: Документи";
  if (path.startsWith("/log/meeting/")) return "Логи: Зустрічі";
  if (path.startsWith("/log/profile/")) return "Логи: Профіль";
  if (path.startsWith("/log/settings/")) return "Логи: Налаштування";
  if (path.startsWith("/log/tasks/")) return "Логи: Завдання";
  if (path.startsWith("/log/test/")) return "Логи: Тести";
  if (path.startsWith("/log/updates/")) return "Логи: Оновлення";

  if (path.startsWith("/dashboard/cabinet/")) return "Дашборд: Кабінет";
  if (path.startsWith("/dashboard/chat/")) return "Дашборд: Чат";
  if (path.startsWith("/dashboard/company/")) return "Дашборд: Компанія";
  if (path.startsWith("/dashboard/personal/")) return "Дашборд: Персональні дані";
  if (path.startsWith("/dashboard/profile/")) return "Дашборд: Профіль";
  if (path.startsWith("/dashboard/socket/")) return "Дашборд: Сокет";
  if (path.startsWith("/dashboard/updates/")) return "Дашборд: Оновлення";
  if (path.startsWith("/dashboard/users/")) return "Дашборд: Користувачі";

  if (path.startsWith("/auth/login/")) return "Авторизація";
  if (path.startsWith("/auth/register/")) return "Реєстрація";
  if (path.startsWith("/auth/")) return "Авторизація / Реєстрація";

  if (path === "1") return "Системний контроль"; // fallback if path is 1 for system control

  return path;
};

export const translateAction = (action: string): string => {
  if (!action) return "Інше";
  
  const actionMap: Record<string, string> = {
    "PAGE_VIEW": "Перегляд сторінок",
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
