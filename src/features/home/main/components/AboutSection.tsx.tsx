import { Timeline } from "@/shared/components/ui/acternity-ui/timeline";
import React from "react";

export function AboutSection() {
const data = [
  {
    title: "2024",
    content: (
      <div className="group">
        <h4 className="text-xl md:text-3xl font-bold text-white mb-4 group-hover:text-teal-400 transition-colors duration-500">
          Народження ідеї та прототип 💡
        </h4>
        <p className="mb-8 text-sm md:text-base font-normal text-slate-300/80 leading-relaxed max-w-2xl">
          Ми проаналізували сотні логістичних процесів і зрозуміли: ринку потрібна не просто база даних, 
          а інтелектуальна екосистема. Початок розробки ядра платформи та перших AI-алгоритмів для тендерів.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
              <img
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1470&auto=format&fit=crop"
              alt="Командний брейншторм"
              className="h-24 w-full object-cover md:h-44 lg:h-60 transform group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
              <img
              src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1470&auto=format&fit=crop"
              alt="Розробка коду"
              className="h-24 w-full object-cover md:h-44 lg:h-60 transform group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Еволюція",
    content: (
      <div>
        <h4 className="text-xl md:text-3xl font-bold text-teal-400 mb-4">
          Масштабування та Автоматизація 🚀
        </h4>
        <p className="mb-6 text-sm md:text-base font-normal text-slate-300/80 leading-relaxed">
          Додано модуль обліку транспорту та CRM для перевізників. 
          Логістика стала "паперово-вільною" завдяки Document Flow 2.0.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
          {["AI-Тендери", "Smart GPS", "E-Docs"].map((item, i) => (
              <div key={i} className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md text-center text-sm text-teal-100 font-medium">
                  {item}
              </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
           <img
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1470&auto=format&fit=crop"
            alt="Сучасний склад"
            className="h-24 w-full rounded-2xl object-cover border border-white/10 shadow-2xl md:h-44 lg:h-60"
          />
          <img
            src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=1475&auto=format&fit=crop"
            alt="Вантажівка на трасі"
            className="h-24 w-full rounded-2xl object-cover border border-white/10 shadow-2xl md:h-44 lg:h-60"
          />
        </div>
      </div>
    ),
  },
  {
    title: "2026",
    content: (
      <div>
        <h4 className="text-xl md:text-3xl font-bold text-indigo-400 mb-4">
          ICTender: Future Vision 🌍
        </h4>
        <p className="mb-8 text-sm md:text-base font-normal text-slate-300/80">
          Наша мета — стати стандартом для європейської логістики. 
          Предиктивна аналітика та автономне керування ланцюгами поставок.
        </p>
        <div className="relative p-1 rounded-3xl bg-gradient-to-br from-teal-500 via-indigo-500 to-teal-500 overflow-hidden">
           <img 
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1472&auto=format&fit=crop" 
            alt="Майбутнє технологій" 
            className="absolute inset-0 w-full h-full object-cover opacity-20"
           />
           <div className="relative bg-[#0b0f20]/90 rounded-[calc(1.5rem-1px)] p-8 z-10">
              <p className="text-white italic text-lg md:text-xl font-light leading-relaxed">
                "Ми будуємо не просто софт, а цифрову нервову систему вашого бізнесу."
              </p>
           </div>
        </div>
      </div>
    ),
  },
];

  return (
    <section 
        id="about" 
        className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-x-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-teal-900 py-32 px-6"
    >
      {/* Декоративні сяючі плями, як у HeroSection */}
      <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-teal-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="text-center md:text-left mb-16">
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
                Шлях <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-indigo-400">інновацій</span>
            </h2>
            <p className="text-slate-400 max-w-2xl text-lg md:text-xl">
                Ми перетворюємо складні логістичні ланцюги на прості та прозорі цифрові рішення, що працюють на ваш результат.
            </p>
        </div>
        
        {/* Обертаємо Timeline, щоб гарантувати темну стилістику всередині компонента */}
    
          <Timeline data={data} />
      
      </div>
    </section>
  );
}