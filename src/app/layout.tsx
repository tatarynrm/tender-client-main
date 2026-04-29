import { Inter } from "next/font/google";
import "../shared/styles/globals.css";
import { MainProvider } from "@/shared/providers";
import NextTopLoader from "nextjs-toploader";
import { getProfile } from "@/shared/server/getProfile";
import { redirect } from "next/navigation";
import { Metadata, Viewport } from "next";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

// Окремий експорт для налаштувань в'юпорту
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Це вимкне зум при кліку на інпут
  // Також можна додати тему для панелі браузера
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};
export const metadata: Metadata = {
  title: {
    absolute: "ІСТендер платформа",
    template: "%s | ІСТендер",
  },
  description: "Сучасна логістика.Тендерна платформа",

  icons: {
    icon: [
      {
        url: "/icons/favicon.ico",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icons/favicon.ico",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png" }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getProfile();

  return (
    <html lang="uk" suppressHydrationWarning className="scrollbar-thin">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Plus+Jakarta+Sans:wght@400;500;600&family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,400;0,500;1,400&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500;1,600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased scrollbar-thin `}
      >
        <NextTopLoader
          showSpinner={false} // вимикаємо спінер
          crawl={true} // смужка буде плавно рухатись при завантаженні
          crawlSpeed={200} // швидкість "просування" смужки
          showAtBottom={false} // зверху сторінки
          color="#14b8a6" // сучасний колір (teal/акцент)
          height={3} // тонка смужка, не відволікає
          initialPosition={0.08} // початкова позиція на 8%
          easing="ease" // плавна анімація
          speed={300} // швидкість анімації завершення
          shadow="0 0 8px #14b8a6,0 0 4px #14b8a6" // легка тінь для видимості
          zIndex={2000} // поверх всіх елементів
          showForHashAnchor={true} // якщо переходиш на хеш-лінк, теж показує
        />

        <MainProvider profile={profile ?? null}>{children}</MainProvider>
      </body>
    </html>
  );
}
