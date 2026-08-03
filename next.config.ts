import type { NextConfig } from "next";

// Маркер деплою. Цей файл виконується і під час `next build`, і під час
// `next start`, тому в pm2-логах буде два рядки: один зі збірки, другий
// зі старту. Змінюй DEPLOY_MARK, щоб відрізнити нову викатку від старої.
const DEPLOY_MARK = "deploy-check-1";
console.log(
  `FRONT [${DEPLOY_MARK}] ${process.env.NODE_ENV} — ${new Date().toISOString()}`,
);

const nextConfig: NextConfig = {
  /* config options here */

  // env: {
  //   SEREVER_URL: process.env.SERVER_URL,
  //   GOOGLE_RECAPTCHA_SITE_KEY: process.env.GOOGLE_RECAPTCHA_SITE_KEY,
  // },
  env: {
    SERVER_URL: process.env.SERVER_URL, // ✅ SERVER_URL
    GOOGLE_RECAPTCHA_SITE_KEY: process.env.GOOGLE_RECAPTCHA_SITE_KEY,
  },
  images: {
    remotePatterns: [
      // { protocol: "https", hostname: "nh3.googleusercontent.com" },
    ],
  },
  reactStrictMode: false,
  experimental: {
    externalDir: true, // Дозволяє імпорт файлів поза папкою проекту
  },
};

export default nextConfig;
