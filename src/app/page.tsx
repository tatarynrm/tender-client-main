// import { AboutSection } from "@/features/home/main/components/AboutSection.tsx";
// import CTASection from "@/features/home/main/components/CTASection";
// import FeaturesSection from "@/features/home/main/components/FeaturesSection";
// import HeroSection from "@/features/home/main/components/HeroSection";
// import LogisticsMapSection from "@/features/home/main/components/LogisticMapSectrion";
// import MainHeader from "@/features/home/main/components/MainHeader";
// import StatsSection from "@/features/home/main/components/StatsSection";
// import WorkflowSection from "@/features/home/main/components/WorkflowSection";

// import Footer from "@/shared/components/Footer/Footer";

// import { getProfile } from "@/shared/server/getProfile";

// import { Metadata } from "next";
// import React from "react";

// // Розширені дані з категоризацією
// const features = [
//   {
//     title: "AI-Диспетчер 🤖",
//     description:
//       "Автоматичний підбір оптимального транспорту на основі геолокації та типу вантажу.",
//     size: "large", // Для Bento Grid
//     image:
//       "https://images.unsplash.com/photo-1580674285054-bed31e145f59?q=80&w=1470&auto=format&fit=crop",
//     // Фото: Футуристичний склад з акцентом на технологічність
//   },
//   {
//     title: "Тендерна Арена 📑",
//     description: "Прозорі торги в реальному часі з системою анти-демпінгу.",
//     size: "small",
//     image:
//       "https://images.unsplash.com/photo-1554469384-e58fac16e23a?q=80&w=1374&auto=format&fit=crop",
//     // Фото: Сучасна архітектура офісу/бізнес-центру (символ прозорості та бізнесу)
//   },
//   {
//     title: "Цифровий Двійник Автопарку 🚛",
//     description:
//       "Повний контроль ТО, витрат палива та документів кожного авто.",
//     size: "small",
//     image:
//       "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=1470&auto=format&fit=crop",
//     // Фото: Ряд сучасних вантажівок у нічному/сутінковому освітленні
//   },
//   {
//     title: "Смарт-Аналітика 📊",
//     description:
//       "Прогнозування прибутковості рейсів за допомогою Machine Learning.",
//     size: "medium",
//     image:
//       "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1426&auto=format&fit=crop",
//     // Фото: Чиста цифрова аналітика та графіки на екрані
//   },
// ];

// export const metadata: Metadata = {
//   title: "ICTender — Екосистема Цифрової Логістики",
//   description:
//     "Єдина платформа для тендерів, управління автопарком та автоматизації перевезень.",
// };

// export default async function HomePage() {
//   const profile = await getProfile();

//   return (
//     <main className="relative min-h-screen bg-[#020617] text-white selection:bg-teal-500/30">
//       {/* ФОНОВІ ЕФЕКТИ
//           Використовуємо "blob" анімації для створення глибини
//       */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] animate-pulse" />
//         <div className="absolute top-[40%] -right-[5%] w-[30%] h-[30%] rounded-full bg-teal-500/10 blur-[120px] animate-bounce-slow" />
//       </div>

//       <MainHeader profile={profile ?? undefined} />

//       {/* HERO SECTION - Робимо акцент на масштабі */}
//       <HeroSection profile={profile ?? undefined} />

//       {/* STATS SECTION - Додає довіри */}
//       <StatsSection />

//       {/* FEATURES - Bento Grid Style */}
//       <section id="features" className="py-24 px-6">
//         <div className="max-w-7xl mx-auto">
//           <div className="mb-16 text-center">
//             <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
//               Все для логістики в одному вікні
//             </h2>
//             <p className="text-slate-400 max-w-2xl mx-auto">
//               Ми об'єднали складні процеси в інтуїтивно зрозумілий інтерфейс для
//               перевізників та замовників.
//             </p>
//           </div>
//           <FeaturesSection features={features} />
//         </div>
//       </section>

//       {/* WORKFLOW - Візуалізація процесу заявки */}
//       <WorkflowSection />

//       {/* MAP / GEOGRAPHY - Візуалізація покриття */}
//       <LogisticsMapSection />

//       {/* CTA SECTION */}
//       <div className="relative z-10 py-20">
//         <CTASection />
//       </div>

//       {/* ABOUT & FOOTER */}
//       <AboutSection />
//       <Footer />
//     </main>
//   );
// }
"use client";

import React from "react";
import { Metadata } from "next";
import {
  Rocket,
  ShieldCheck,
  Users,
  Zap,
  Globe,
  ArrowRight,
} from "lucide-react";
import MainHeader from "@/features/home/main/components/MainHeader";
import Footer from "@/shared/components/Footer/Footer";
import { useAuth } from "@/shared/providers/AuthCheckProvider";
import Link from "next/link";
import DonwloadDesktopAppButtons from "@/shared/components/Download/DownloadDesktopApps/DonwloadDesktopAppButtons";

export default function HomePage() {
  const { profile } = useAuth();

  return (
    <main className="relative min-h-screen bg-[#020617] text-white selection:bg-teal-500/30 overflow-hidden">
      {/* ФОНОВІ ЕФЕКТИ: Глибокий космос та туманності */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-teal-500/5 blur-[120px]" />
      </div>

      <MainHeader profile={profile ?? undefined} />

      {/* HERO SECTION: МАЙБУТНЄ ТУТ */}
      <section className="relative pt-8 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-bottom-4">
            <Rocket size={14} /> Нова ера ICTender
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500 leading-tight">
            Трансформація <br />
            <span className="text-white">Цифрової Логістики</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed mb-10">
            Ми будуємо не просто CRM, а інтелектуальну екосистему, яка об'єднає
            <span className="text-teal-400"> менеджерів</span>,
            {/* <span className="text-teal-400"> замовників</span> та */}
            <span className="text-teal-400"> перевізників</span> в єдиному
            цифровому просторі.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
              <Link
                href={profile ? "/dashboard" : "/auth/login"}
                className="px-10 py-4 bg-white text-[#020617] font-extrabold rounded-2xl hover:bg-teal-400 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-3 group shadow-xl shadow-white/5"
              >
                {profile ? "Перейти до кабінету" : "Увійти в систему"}
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform duration-300"
                />
              </Link>

              <div className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-slate-400 backdrop-blur-sm">
                <span className="text-teal-500 mr-2">●</span> ICTender v2.0
              </div>
            </div>
            <div className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-medium text-slate-300">
              Старт оновлення: 2026
            </div>
          </div>
        </div>
        <DonwloadDesktopAppButtons />
      </section>

      {/* ВІЗІЯ: ТРИ СТОВПИ ЕКОСИСТЕМИ */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between gap-8">
            {/* Для Менеджерів */}
            <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-teal-500/30 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-400 mb-6 group-hover:scale-110 transition-transform">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold mb-4">Для Менеджерів</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Повна автоматизація рутинних процесів, інтелектуальне управління
                замовленнями та CRM нового покоління для максимальної
                продуктивності.
              </p>
            </div>

            {/* Для Замовників */}
            {/* <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-indigo-500/30 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold mb-4">Для Замовників</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Прямий доступ до надійних перевізників, прозорі тендери в
                реальному часі та контроль вантажу на кожному етапі шляху.
              </p>
            </div> */}

            {/* Для Перевізників */}
            <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                <Globe size={24} />
              </div>
              <h3 className="text-xl font-bold mb-4">Для Перевізників</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Стабільний потік замовлень, зручний цифровий двійник автопарку
                та фінансовий контроль в одному мобільному вікні.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* СТРАТЕГІЧНИЙ МЕСЕДЖ */}
      <section className="py-20 px-6 border-t border-white/5 bg-gradient-to-b from-transparent to-teal-500/5">
        <div className="max-w-4xl mx-auto text-center">
          <Users className="mx-auto text-teal-500 mb-6" size={48} />
          <h2 className="text-3xl md:text-4xl font-bold mb-6 italic text-slate-200">
            "Ми об'єднуємо ринок логістики, роблячи його прозорим, швидким та
            доступним для кожного учасника."
          </h2>
          <p className="text-slate-500 uppercase tracking-widest text-xs font-bold">
            Команда розробки ICTender
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
