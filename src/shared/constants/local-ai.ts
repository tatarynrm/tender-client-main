/**
 * Кому відкритий AI-помічник (/log/ai).
 *
 * Помічник поки в дослідній експлуатації: він бачить усю схему тендерної
 * платформи і сам пише SQL, а працює на хмарному Gemini — тому доступ
 * поіменний, а не за роллю.
 *
 * Це лише UI-гейт — ховає пункт меню й сторінку. Справжня перевірка живе на
 * бекенді (`LOCAL_AI_ALLOWED_EMAILS`, LocalAiAccessGuard): усі ендпоінти
 * /local-ai/* віддають 403 сторонньому користувачу навіть при прямому запиті.
 * Списки треба тримати однаковими.
 */
export const LOCAL_AI_ALLOWED_EMAILS = ["rt@ict.lviv.ua"];

export const canUseLocalAi = (email?: string | null): boolean =>
  Boolean(email && LOCAL_AI_ALLOWED_EMAILS.includes(email.trim().toLowerCase()));
