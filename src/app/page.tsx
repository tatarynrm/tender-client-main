// import { AboutSection } from "@/features/home/main/components/AboutSection.tsx";
// import CTASection from "@/features/home/main/components/CTASection";
// import FeaturesSection from "@/features/home/main/components/FeaturesSection";
// import HeroSection from "@/features/home/main/components/HeroSection";
// import Footer from "@/shared/components/Footer/Footer";
// import Logo from "@/shared/components/Logo/Logo";
// import { getProfile } from "@/shared/server/getProfile";

// import { Metadata } from "next";
// import React from "react";

// const features = [
//   {
//     title: "Прозорі тендери 📑",
//     description:
//       "Усі тендери доступні онлайн. Беріть участь у чесних торгах і знаходьте найвигідніші умови співпраці.",
//     image:
//       "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?q=80&w=1470&auto=format&fit=crop",
//   },
//   {
//     title: "Особистий кабінет перевізника 🚛",
//     description:
//       "Керуйте автопарком, відстежуйте тендери, документи та замовлення в реальному часі.",
//     image:
//       "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1470&auto=format&fit=crop",
//   },
//   {
//     title: "Аналітика і звіти 📊",
//     description:
//       "Відстежуйте ваші ставки, виграші та прибутковість — приймайте стратегічні рішення.",
//     image:
//       "https://static.tildacdn.com/tild3531-6361-4862-b332-373230313339/frame_1.png",
//   },
//   {
//     title: "Документообіг онлайн 🗂️",
//     description:
//       "Всі контракти, рахунки та документи у вашому кабінеті. Швидко, зручно, безпечно.",
//     image:
//       "https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=1470&auto=format&fit=crop",
//   },
//   {
//     title: "Мультиплатформність 🌍",
//     description:
//       "Платформа адаптована для будь-якого пристрою — комп’ютера, планшета чи смартфона.",
//     image:
//       "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1470&auto=format&fit=crop",
//   },
//   {
//     title: "AI-Інтеграції 🤖",
//     description:
//       "Підказки, автоматичні пропозиції цін і аналіз конкурентів за допомогою AI.",
//     image:
//       "https://d3373sevsv1jc.cloudfront.net/uploads/communities_production/article_block/1899/DA16A3C90F5A47569303568433490D8F.jpg",
//   },
// ];

// export const metadata: Metadata = {
//   title: "Сучасний світ перевезень",
//   description: "Сучасна логістична платформа для логістичних компаній",
// };
// export default async function HomePage() {
//   const profile = await getProfile();

//   return (
//     <div className="relative min-h-screen flex flex-col items-center justify-center overflow-x-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-teal-900 scrollbar-thin overflow-y-auto">
//       {/* Логотип у верхньому лівому куті */}
//       <div className="flex w-full">
//         <Logo />
//       </div>

//       <HeroSection profile={profile ?? undefined} />
//       <FeaturesSection features={features} />
//       <CTASection />
//       <AboutSection />
//       <Footer />
//     </div>
//   );
// }

import { AboutSection } from "@/features/home/main/components/AboutSection.tsx";
import CTASection from "@/features/home/main/components/CTASection";
import FeaturesSection from "@/features/home/main/components/FeaturesSection";
import HeroSection from "@/features/home/main/components/HeroSection";
import LogisticsMapSection from "@/features/home/main/components/LogisticMapSectrion";
import MainHeader from "@/features/home/main/components/MainHeader";
import StatsSection from "@/features/home/main/components/StatsSection";
import WorkflowSection from "@/features/home/main/components/WorkflowSection";

import Footer from "@/shared/components/Footer/Footer";
import Logo from "@/shared/components/Logo/Logo";
import { getProfile } from "@/shared/server/getProfile";

import { Metadata } from "next";
import React from "react";

// Розширені дані з категоризацією
const features = [
  {
    title: "AI-Диспетчер 🤖",
    description:
      "Автоматичний підбір оптимального транспорту на основі геолокації та типу вантажу.",
    size: "large", // Для Bento Grid
    image:
      "https://images.unsplash.com/photo-1580674285054-bed31e145f59?q=80&w=1470&auto=format&fit=crop",
    // Фото: Футуристичний склад з акцентом на технологічність
  },
  {
    title: "Тендерна Арена 📑",
    description: "Прозорі торги в реальному часі з системою анти-демпінгу.",
    size: "small",
    image:
      "https://images.unsplash.com/photo-1554469384-e58fac16e23a?q=80&w=1374&auto=format&fit=crop",
    // Фото: Сучасна архітектура офісу/бізнес-центру (символ прозорості та бізнесу)
  },
  {
    title: "Цифровий Двійник Автопарку 🚛",
    description:
      "Повний контроль ТО, витрат палива та документів кожного авто.",
    size: "small",
    image:
      "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=1470&auto=format&fit=crop",
    // Фото: Ряд сучасних вантажівок у нічному/сутінковому освітленні
  },
  {
    title: "Смарт-Аналітика 📊",
    description:
      "Прогнозування прибутковості рейсів за допомогою Machine Learning.",
    size: "medium",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1426&auto=format&fit=crop",
    // Фото: Чиста цифрова аналітика та графіки на екрані
  },
];

export const metadata: Metadata = {
  title: "ICTender — Екосистема Цифрової Логістики",
  description:
    "Єдина платформа для тендерів, управління автопарком та автоматизації перевезень.",
};

export default async function HomePage() {
  const profile = await getProfile();

  return (
    <main className="relative min-h-screen bg-[#020617] text-white selection:bg-teal-500/30">
      {/* ФОНОВІ ЕФЕКТИ 
          Використовуємо "blob" анімації для створення глибини
      */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] animate-pulse" />
        <div className="absolute top-[40%] -right-[5%] w-[30%] h-[30%] rounded-full bg-teal-500/10 blur-[120px] animate-bounce-slow" />
      </div>

      <MainHeader profile={profile ?? undefined} />

      {/* HERO SECTION - Робимо акцент на масштабі */}
      <HeroSection profile={profile ?? undefined} />

      {/* STATS SECTION - Додає довіри */}
      <StatsSection />

      {/* FEATURES - Bento Grid Style */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Все для логістики в одному вікні
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Ми об'єднали складні процеси в інтуїтивно зрозумілий інтерфейс для
              перевізників та замовників.
            </p>
          </div>
          <FeaturesSection features={features} />
        </div>
      </section>

      {/* WORKFLOW - Візуалізація процесу заявки */}
      <WorkflowSection />

      {/* MAP / GEOGRAPHY - Візуалізація покриття */}
      <LogisticsMapSection />

      {/* CTA SECTION */}
      <div className="relative z-10 py-20">
        <CTASection />
      </div>

      {/* ABOUT & FOOTER */}
      <AboutSection />
      <Footer />
    </main>
  );
}
