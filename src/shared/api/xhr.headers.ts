/**
 * Заголовок для змінювальних запитів до ендпоінтів під XhrOnlyGuard на бекенді
 * (документи, навчання). HTML-форма зі стороннього сайту його надіслати не може,
 * тому це захист від CSRF при кукі сесії SameSite=None.
 * Глобально на axios-інстанс не ставимо: кожен GET отримав би зайвий CORS-preflight.
 */
export const XHR_HEADERS = { "X-Requested-With": "XMLHttpRequest" } as const;
