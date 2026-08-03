/**
 * Типи для імпортів, які обробляє збирач, а не TypeScript.
 *
 * Next оголошує лише `*.module.css` (CSS Modules) — див.
 * node_modules/next/types/global.d.ts. Для звичайного глобального стилю
 * (`import "@/shared/styles/globals.css"`) декларації немає, і суворіші
 * версії TS дають "Cannot find module or type declarations for
 * side-effect import".
 *
 * Конкретніший шаблон виграє, тому типізація CSS Modules від Next
 * лишається чинною: `styles.foo` і далі типізований, а не any.
 *
 * Файл писати сюди, а не в next-env.d.ts — той перегенеровується.
 */

declare module '*.css';
declare module '*.scss';
