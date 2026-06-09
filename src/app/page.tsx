"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/shared/providers/AuthCheckProvider";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Nav shadow scroll trigger
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Scroll reveal effects
    const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          revealObserver.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => revealObserver.observe(el));

    // Dynamic stats counter
    let counted = false;
    const statNums = document.querySelectorAll('.hstat-num') as NodeListOf<HTMLElement>;
    const targets = [68, 2130, 200, 600];

    function animateCounter(el: HTMLElement, target: number, duration: number) {
      const start = performance.now();
      const update = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(ease * target);

        if (target === 2130) {
          el.innerHTML = current.toLocaleString('uk');
        } else {
          el.innerHTML = current.toString();
        }

        if (progress < 1) requestAnimationFrame(update);
      };
      requestAnimationFrame(update);
    }

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && !counted) {
          counted = true;
          statNums.forEach((el, i) => {
            el.innerHTML = '0';
            setTimeout(() => animateCounter(el, targets[i], 1600 + i * 100), i * 100);
          });
          counterObserver.disconnect();
        }
      });
    }, { threshold: 0.2 });

    const statsGrid = document.querySelector('.hero-stats-grid');
    if (statsGrid) counterObserver.observe(statsGrid);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      revealObserver.disconnect();
      counterObserver.disconnect();
    };
  }, []);

  return (
    <div className="landing-body">
      {/* NAV */}
      <nav className={`landing-nav ${isScrolled ? 'scrolled' : ''}`}>
        <div className="nav-logo cursor-pointer" onClick={() => router.push("/")}>
          <img src="/images/logo/logo.png" alt="ICTender Logo" style={{ height: "100px", width: "auto", display: "block" }} />
        </div>

        <ul className="nav-links">
          <li><a href="#features">Можливості</a></li>
          <li><a href="#why">Чому ми</a></li>
          <li><a href="#steps">Як почати</a></li>
          <li><a href="#contact">Контакти</a></li>
        </ul>

        <div className="nav-actions">
          {profile ? (
            <Link href="/dashboard" className="btn-primary">Кабінет</Link>
          ) : (
            <>
              <Link href="/auth/login" className="btn-ghost">Увійти</Link>
              <Link href="/auth/register" className="btn-primary">Зареєструватися</Link>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section className="hero relative min-h-screen flex flex-col justify-center items-center px-4 sm:px-12 lg:px-[80px] py-[100px] sm:py-[140px] z-10">
        <div className="relative z-10 w-full  px-4 flex flex-col items-center lg:items-start text-center lg:text-left">
          {/* Eyebrow with horizontal line all the way to the right */}
          <div className="hero-eyebrow flex items-center gap-3 mb-6 w-full justify-center lg:justify-start fade-up">
            <span className="hero-eyebrow-text font-sans font-bold text-[22px] tracking-[-0.02em] text-[#3d6080] whitespace-nowrap">
              Тендери від ICT — Тільки для перевізників
            </span>

          </div>

          <div className="hero-content-left w-full max-w-[680px] flex flex-col items-center lg:items-start text-center lg:text-left">
            <h1 className="flex flex-col gap-2 mb-6 leading-[1.1] items-center lg:items-start text-center lg:text-left fade-up fade-up-delay-1">
              <span className="block font-sans font-bold text-[36px] sm:text-[56px] lg:text-[70px] text-[#0a2540] tracking-[-0.04em]">
                Замовлення ICT
              </span>
              <span className="block font-sans font-semibold text-[22px] sm:text-[36px] lg:text-[48px] text-[#0a2540] tracking-[-0.02em]">
                відкриті для ваших ставок.
              </span>
            </h1>

            <p className="font-sans font-normal text-[16px] sm:text-[18px] lg:text-[22px] leading-[1.5] text-black max-w-[820px] mb-[38px] text-center lg:text-left fade-up fade-up-delay-2">
              ICTender — закрита платформа компанії ICT. Всі вантажні замовлення виставляються у відкритий тендер. Ви робите ставку — ми обираємо найкращу пропозицію.
            </p>

            <div className="hero-actions flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4 w-full sm:w-auto fade-up fade-up-delay-3">
              {profile ? (
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto text-center bg-[#4256D5] hover:bg-[#3143b5] text-white font-sans font-bold px-8 py-4 rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Перейти до кабінету
                </Link>
              ) : (
                <Link
                  href="/auth/register"
                  className="w-full sm:w-auto text-center bg-[#4256D5] hover:bg-[#3143b5] text-white font-sans font-bold px-8 py-4 rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Подати заявку на доступ
                </Link>
              )}
              <Link
                href="/auth/login"
                className="w-full sm:w-auto text-center bg-white border-2 border-[#4256D5]/20 hover:border-[#4256D5] text-[#4256D5] font-sans font-bold px-8 py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Переглянути активні тендери
              </Link>
            </div>
          </div>
        </div>

        <div className="hero-stats-wrapper  mt-16 px-4 z-10 relative fade-up fade-up-delay-4">
          <div className="hero-stats-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 bg-white border border-slate-100 rounded-[24px] md:rounded-[32px] shadow-sm overflow-hidden w-full">
            {/* Stat 1 */}
            <div className="p-6 md:p-10 border-b sm:border-b lg:border-b-0 sm:border-r border-slate-100 hover:bg-blue-50/10 transition-colors text-left flex flex-col justify-between">
              <div>
                <div className="font-inter font-extrabold text-[36px] md:text-[48px] lg:text-[56px] text-[#0a2540] leading-none mb-2">68</div>
                <div className=" font-sans font-bold text-[14px] md:text-[15px] text-[#0a2540]">Активних тендерів</div>
                <div className=" font-sans font-normal text-[12px] md:text-[12.5px] text-[#3d6080] ">замовлень ICT зараз</div>
              </div>
            </div>

            {/* Stat 2 */}
            <div className=" p-6 md:p-10 border-b sm:border-b lg:border-b-0 lg:border-r border-slate-100 hover:bg-blue-50/10 transition-colors text-left flex flex-col justify-between">
              <div>
                <div className=" font-inter font-extrabold text-[36px] md:text-[48px] lg:text-[56px] text-[#0a2540] leading-none mb-2">2 130</div>
                <div className=" font-sans font-bold text-[14px] md:text-[15px] text-[#0a2540] mt-3">Тендерів всього</div>
                <div className=" font-sans font-normal text-[12px] md:text-[12.5px] text-[#3d6080] mt-1">за весь час роботи</div>
              </div>
            </div>

            {/* Stat 3 */}
            <div className=" p-6 md:p-10 border-b sm:border-b-0 sm:border-r border-slate-100 hover:bg-blue-50/10 transition-colors text-left flex flex-col justify-between">
              <div>
                <div className=" font-inter font-extrabold text-[36px] md:text-[48px] lg:text-[56px] text-[#0a2540] leading-none mb-2">200</div>
                <div className=" font-sans font-semibold text-[20px] md:text-[15px] text-[#0a2540] mt-3">Компаній - партнерів</div>
                <div className=" font-sans font-normal text-[12px] md:text-[12.5px] text-[#3d6080] mt-1">верифікованих перевізників</div>
              </div>
            </div>

            {/* Stat 4 */}
            <div className="hstat p-6 md:p-10 hover:bg-blue-50/10 transition-colors text-left flex flex-col justify-between">
              <div>
                <div className=" font-sans font-extrabold text-[36px] md:text-[48px] lg:text-[56px] text-[#0a2540] leading-none mb-2">600</div>
                <div className=" font-sans font-bold text-[14px] md:text-[15px] text-[#0a2540] mt-3">Користувачів</div>
                <div className=" font-sans font-normal text-[12px] md:text-[12.5px] text-[#3d6080] mt-1">диспетчерів і менеджерів</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee-wrap">
        <div className="marquee-track">
          <span className="marquee-item"><span className="marquee-dot"></span>Замовлення від ICT</span>
          <span className="marquee-item"><span className="marquee-dot"></span>Верифіковані перевізники</span>
          <span className="marquee-item"><span className="marquee-dot"></span>Прозорі умови тендеру</span>
          <span className="marquee-item"><span className="marquee-dot"></span>Аналітика ваших ставок</span>
          <span className="marquee-item"><span className="marquee-dot"></span>Підтримка менеджерів ICT</span>
          <span className="marquee-item"><span className="marquee-dot"></span>Захищені дані</span>
          <span className="marquee-item"><span className="marquee-dot"></span>Швидка реєстрація</span>
          <span className="marquee-item"><span className="marquee-dot"></span>Чесна конкуренція</span>

          <span className="marquee-item"><span className="marquee-dot"></span>Замовлення від ICT</span>
          <span className="marquee-item"><span className="marquee-dot"></span>Верифіковані перевізники</span>
          <span className="marquee-item"><span className="marquee-dot"></span>Прозорі умови тендеру</span>
          <span className="marquee-item"><span className="marquee-dot"></span>Аналітика ваших ставок</span>
          <span className="marquee-item"><span className="marquee-dot"></span>Підтримка менеджерів ICT</span>
          <span className="marquee-item"><span className="marquee-dot"></span>Захищені дані</span>
          <span className="marquee-item"><span className="marquee-dot"></span>Швидка реєстрація</span>
          <span className="marquee-item"><span className="marquee-dot"></span>Чесна конкуренція</span>
        </div>
      </div>

      {/* FEATURES */}
      <section className="py-[96px] md:px-[52px] px-6 bg-[#e0eafb]" id="features">
        <div className="reveal mb-12">
          <div className="flex items-center gap-4 w-full mb-6">
            <span className="font-sans font-medium text-[13px] tracking-[0.06em] text-slate-400 uppercase whitespace-nowrap">
              Тендери від ICT · Тільки для перевізників
            </span>
            <div className="h-[1px] bg-[#4256D5]/30 flex-grow"></div>
          </div>
          <h2 className="font-sans font-bold text-[36px] md:text-[44px] text-[#0a2540] leading-[1.2] tracking-[-0.03em] mt-3">
            Все необхідне, щоб отримати<br />
            Замовлення — в одному сервісі
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
          {/* CARD 1 */}
          <div className="bg-white border border-slate-100 rounded-[32px] p-8 md:p-10 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow reveal">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 flex items-center justify-center bg-blue-50 rounded-xl text-blue-600 flex-shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="15" rx="2" />
                    <path d="M16 2v2M8 2v2M3 10h18" />
                  </svg>
                </div>
                <h3 className="font-sans font-bold text-[22px] text-[#0a2540] tracking-[-0.02em]">
                  Тендери на перевезення
                </h3>
              </div>
              <p className="font-sans font-normal text-[15px] text-[#3d6080] leading-[1.6] mb-6">
                ICT публікує всі свої вантажні замовлення у відкритий тендер. Умови прозорі, можливості у всіх однакові — перемагає найкраща пропозиція.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 font-sans font-normal text-[14px] text-[#3d6080] leading-[1.5]">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></span>
                  <span>Актуальні замовлення ICT щодня</span>
                </li>
                <li className="flex items-start gap-3 font-sans font-normal text-[14px] text-[#3d6080] leading-[1.5]">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></span>
                  <span>Повна інформація про маршрут, вантаж і терміни</span>
                </li>
                <li className="flex items-start gap-3 font-sans font-normal text-[14px] text-[#3d6080] leading-[1.5]">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></span>
                  <span>Ставка в кілька кліків — без дзвінків і листів</span>
                </li>
                <li className="flex items-start gap-3 font-sans font-normal text-[14px] text-[#3d6080] leading-[1.5]">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></span>
                  <span>Автоматичне визначення переможця</span>
                </li>
              </ul>
            </div>
          </div>

          {/* CARD 2 */}
          <div className="bg-white border border-slate-100 rounded-[32px] p-8 md:p-10 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow reveal">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 flex items-center justify-center bg-blue-50 rounded-xl text-blue-600 flex-shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <h3 className="font-sans font-bold text-[22px] text-[#0a2540] tracking-[-0.02em]">
                  Особистий кабінет перевізника
                </h3>
              </div>
              <p className="font-sans font-normal text-[15px] text-[#3d6080] leading-[1.6] mb-6">
                Вся ваша співпраця з ICT в одному місці: активні тендери, виконані рейси, аналітика ставок, графіки оплат та комплектність документів по кожному рейсу.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 font-sans font-normal text-[14px] text-[#3d6080] leading-[1.5]">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></span>
                  <span>Історія виграних тендерів і виконаних рейсів</span>
                </li>
                <li className="flex items-start gap-3 font-sans font-normal text-[14px] text-[#3d6080] leading-[1.5]">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></span>
                  <span>Графік оплат і статус розрахунків від ICT</span>
                </li>
                <li className="flex items-start gap-3 font-sans font-normal text-[14px] text-[#3d6080] leading-[1.5]">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></span>
                  <span>Комплектність документів по кожному замовленню</span>
                </li>
                <li className="flex items-start gap-3 font-sans font-normal text-[14px] text-[#3d6080] leading-[1.5]">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></span>
                  <span>Ваш рейтинг надійності та відгуки від ICT</span>
                </li>
              </ul>
            </div>
          </div>

          {/* CARD 3 */}
          <div className="lg:col-span-2 bg-white border border-slate-100 rounded-[32px] p-8 md:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center hover:shadow-md transition-shadow reveal">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 flex items-center justify-center bg-blue-50 rounded-xl text-blue-600 flex-shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                </div>
                <h3 className="font-sans font-bold text-[22px] text-[#0a2540] tracking-[-0.02em]">
                  Аналітика для розумніших ставок
                </h3>
              </div>
              <p className="font-sans font-normal text-[15px] text-[#3d6080] leading-[1.6] mb-6">
                Розумійте, як ви виглядаєте на фоні інших перевізників ICT. Бачте динаміку ставок, свій win rate і де є найбільше шансів на перемогу.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 font-sans font-normal text-[14px] text-[#3d6080] leading-[1.5]">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></span>
                  <span>Ваша ставка vs конкуренти по кожному напрямку</span>
                </li>
                <li className="flex items-start gap-3 font-sans font-normal text-[14px] text-[#3d6080] leading-[1.5]">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></span>
                  <span>Кількість тендерів за обраний період</span>
                </li>
                <li className="flex items-start gap-3 font-sans font-normal text-[14px] text-[#3d6080] leading-[1.5]">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></span>
                  <span>Прогноз оптимальної ставки для перемоги</span>
                </li>
                <li className="flex items-start gap-3 font-sans font-normal text-[14px] text-[#3d6080] leading-[1.5]">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></span>
                  <span>Сезонна активність і завантаженість напрямків</span>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-5 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#F2F6FE] border border-slate-200 border-b-[4px] border-b-[#4256D5] rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:scale-[1.02] transition-transform">
                  <div className="font-sans font-extrabold text-[30px] text-[#0a2540] leading-none mb-1.5">
                    −8%
                  </div>
                  <div className="font-sans font-medium text-[12.5px] text-[#3d6080] leading-[1.4]">
                    Ваша ставка нижче середньої конкурентів
                  </div>
                </div>

                <div className="bg-[#F2F6FE] border border-slate-200 border-b-[4px] border-b-[#4256D5] rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:scale-[1.02] transition-transform">
                  <div className="font-sans font-extrabold text-[30px] text-[#0a2540] leading-none mb-1.5">
                    312 шт
                  </div>
                  <div className="font-sans font-medium text-[12.5px] text-[#3d6080] leading-[1.4]">
                    Тендерів за квартал по вашому напрямку
                  </div>
                </div>

                <div className="bg-[#F2F6FE] border border-slate-200 border-b-[4px] border-b-[#4256D5] rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:scale-[1.02] transition-transform">
                  <div className="font-sans font-extrabold text-[30px] text-[#0a2540] leading-none mb-1.5">
                    40%
                  </div>
                  <div className="font-sans font-medium text-[12.5px] text-[#3d6080] leading-[1.4]">
                    Ваш win rate за останній місяць
                  </div>
                </div>

                <div className="bg-[#F2F6FE] border border-slate-200 border-b-[4px] border-b-[#4256D5] rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:scale-[1.02] transition-transform">
                  <div className="font-sans font-extrabold text-[30px] text-[#0a2540] leading-none mb-1.5">
                    14%
                  </div>
                  <div className="font-sans font-medium text-[12.5px] text-[#3d6080] leading-[1.4]">
                    Зростання к-ті тендерів у квітні
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="why" id="why">
        <div className="reveal mb-12">
          <div className="flex items-center gap-4 w-full mb-6">
            <span className="font-sans font-medium text-[13px] tracking-[0.06em] text-slate-400 uppercase whitespace-nowrap">
              Чому варто працювати з ICT
            </span>
            <div className="h-[1px] bg-[#4256D5]/30 flex-grow"></div>
          </div>
          <h2 className="font-sans font-bold text-[36px] md:text-[44px] text-[#0a2540] leading-[1.2] tracking-[-0.03em] mt-3">
            Прозорий партнер —<br />стабільна співпраця
          </h2>
        </div>

        <div className="why-grid">
          <div className="why-card reveal">
            <div className="why-num">01</div>
            <div className="why-title">Стабільний потік замовлень</div>
            <p className="why-desc">ICT — діюча експедиторська компанія зі стабільним потоком замовлень. Ви отримуєте доступ до всього нашого портфелю маршрутів через одну платформу.</p>
          </div>
          <div className="why-card reveal">
            <div className="why-num">02</div>
            <div className="why-title">Рівні можливості для всіх</div>
            <p className="why-desc">Жодних "своїх" перевізників. Кожен тендер відкритий однаково для всіх — перемагає та пропозиція, яка найкраще відповідає умовам ICT.</p>
          </div>
          <div className="why-card reveal">
            <div className="why-num">03</div>
            <div className="why-title">Повна прозорість умов</div>
            <p className="why-desc">Кожен тендер містить вичерпну інформацію: маршрут, тип вантажу, терміни, вимоги до транспорту. Нічого не приховується після перемоги.</p>
          </div>
          <div className="why-card reveal">
            <div className="why-num">04</div>
            <div className="why-title">Верифіковане середовище</div>
            <p className="why-desc">Доступ отримують лише перевірені перевізники. Ручна перевірка документів командою ICT — гарантія якісного та безпечного середовища для всіх учасників.</p>
          </div>
          <div className="why-card reveal">
            <div className="why-num">05</div>
            <div className="why-title">Захист даних і повна історія</div>
            <p className="why-desc">Ваші ставки, рейси та розрахунки зберігаються в захищеному середовищі. Кожна дія фіксується з часовою міткою — прозорість для вас і для ICT.</p>
          </div>
          <div className="why-card reveal">
            <div className="why-num">06</div>
            <div className="why-title">Репутація, яка відкриває двері</div>
            <p className="why-desc">Ваш рейтинг у ICTender — ваша візитка перед ICT. Висока вчасність і якість роботи підвищують пріоритет у нових тендерах і зміцнюють партнерство.</p>
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section className="py-[96px] md:px-[52px] px-6 bg-[#e0eafb]" id="steps">
        <div className="reveal mb-12">
          <div className="flex items-center gap-4 w-full mb-6">
            <span className="font-sans font-medium text-[13px] tracking-[0.06em] text-slate-400 uppercase whitespace-nowrap">
              Як почати?
            </span>
            <div className="h-[1px] bg-[#4256D5]/30 flex-grow"></div>
          </div>
          <h2 className="font-sans font-bold text-[40px] md:text-[40px] text-[#0a2540] leading-[1.2] tracking-[-0.03em] mt-3">
            Від заявки до<br />першої ставки — <span className="text-[#4256D5]">4 кроки</span>
          </h2>
        </div>

        <div className="bg-white border border-slate-100 rounded-[32px] p-8 md:p-12 shadow-sm relative z-10 reveal">
          {/* Connecting Line */}
          <div className="absolute top-[68px] left-[10%] right-[10%] h-[1.5px] bg-[#4256D5]/20 z-0 hidden md:block w-[calc(100%-35%)]"></div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
            {/* Step 1 */}
            <div className="flex flex-col items-start text-left">
              <div className="w-14 h-14 bg-white border-2 border-[#4256D5] rounded-full flex items-center justify-center mb-6 transition-transform hover:scale-110 duration-200">
                <span className="font-sans font-extrabold text-[20px] text-[#4256D5]">1</span>
              </div>
              <h3 className="font-sans font-bold text-[18px] text-[#0a2540] mb-2">Подайте заявку</h3>
              <p className="font-sans font-normal text-[13px] text-[#3d6080] leading-[1.6]">
                Заповніть коротку форму з інформацією про вашу транспортну компанію і натисніть «Подати заявку».
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-start text-left">
              <div className="w-14 h-14 bg-white border-2 border-[#4256D5] rounded-full flex items-center justify-center  mb-6 transition-transform hover:scale-110 duration-200">
                <span className="font-sans font-extrabold text-[20px] text-[#4256D5]">2</span>
              </div>
              <h3 className="font-sans font-bold text-[18px] text-[#0a2540] mb-2">Перевірка ICT</h3>
              <p className="font-sans font-normal text-[13px] text-[#3d6080] leading-[1.6]">
                Менеджер ICT перевіряє вашу компанію і документи. Зазвичай це займає до одного робочого дня.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-start text-left">
              <div className="w-14 h-14 bg-white border-2 border-[#4256D5] rounded-full flex items-center justify-center mb-6 transition-transform hover:scale-110 duration-200">
                <span className="font-sans font-extrabold text-[20px] text-[#4256D5]">3</span>
              </div>
              <h3 className="font-sans font-bold text-[18px] text-[#0a2540] mb-2">Доступ підтверджено</h3>
              <p className="font-sans font-normal text-[13px] text-[#3d6080] leading-[1.6]">
                Отримуєте лист із підтвердженням і доступом до платформи. Ви стаєте верифікованим партнером ICT.
              </p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-start text-left">
              <div className="w-14 h-14 bg-white border-2 border-[#4256D5] rounded-full flex items-center justify-center mb-6 transition-transform hover:scale-110 duration-200">
                <span className="font-sans font-extrabold text-[20px] text-[#4256D5]">4</span>
              </div>
              <h3 className="font-sans font-bold text-[18px] text-[#0a2540] mb-2">Беріть участь у тендерах</h3>
              <p className="font-sans font-normal text-[13px] text-[#3d6080] leading-[1.6]">
                Переглядайте актуальні замовлення ICT, робіть ставки, виграйте рейси та відстежуйте свою статистику в кабінеті.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-[96px] md:px-[52px] px-6 bg-[#e0eafb] text-center relative z-10 reveal" id="cta">
        <div className="flex items-center justify-center gap-4 w-full mb-8">
          <div className="h-[1px] bg-[#4256D5]/30 flex-grow"></div>
          <span className="font-sans font-semibold text-[13px] tracking-[0.06em] text-[#3d6080] uppercase whitespace-nowrap">
            Стати партнером ICT
          </span>
          <div className="h-[1px] bg-[#4256D5]/30 flex-grow"></div>
        </div>

        <h2 className="font-sans font-extrabold text-[36px] md:text-[48px] text-[#0a2540] leading-[1.2] tracking-[-0.03em] mb-4">
          Готові отримувати<br />замовлення від ICT?
        </h2>
        <p className="font-sans font-normal text-[16px] md:text-[20px] text-[#3d6080] leading-[1.5] max-w-[800px] mx-auto mb-8">
          Подайте заявку сьогодні — і вже завтра ваша компанія зможе брати участь у тендерах.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          {profile ? (
            <Link
              href="/dashboard"
              className="w-full sm:w-auto text-center bg-[#4256D5] hover:bg-[#3143b5] text-white font-sans font-bold px-8 py-4 rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Перейти до кабінету
            </Link>
          ) : (
            <Link
              href="/auth/register"
              className="w-full sm:w-auto text-center bg-[#4256D5] hover:bg-[#3143b5] text-white font-sans font-bold px-8 py-4 rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Подати заявку на доступ
            </Link>
          )}
          <Link
            href="/auth/login"
            className="w-full sm:w-auto text-center bg-white border-2 border-[#4256D5]/20 hover:border-[#4256D5] text-[#4256D5] font-sans font-bold px-8 py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Переглянути активні тендери
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer" id="contact">
        <div className="footer-grid">
          <div>
            <div className="footer-logo">
              <img src="/images/logo/logo-white.png" alt="ICTender Logo" style={{ height: "100px", width: "auto", display: "block" }} />
            </div>
            <p className="footer-tagline">Закрита тендерна платформа компанії ICT для верифікованих перевізників-партнерів.</p>
          </div>

          <div className="footer-col">
            <h4>Навігація</h4>
            <ul>
              <li><a href="#features">Можливості</a></li>
              <li><a href="#why">Чому ми</a></li>
              <li><a href="#steps">Як почати</a></li>
              <li><a href="#contact">Контакти</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Контакти</h4>
            <ul>
              <li><a href="tel:+380504308661">(050) 430-86-61</a></li>
              <li><a href="tel:+380503348200">(050) 334-82-00</a></li>
              <li><a href="tel:+380503703778">(050) 370-37-78</a></li>
              <li><a href="tel:+380504304623">(050) 430-46-23</a></li>
              <li className="mt-2"><a href="mailto:tender.support@ict.lviv.ua">tender.support@ict.lviv.ua</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Локація</h4>
            <ul>
              <li className="text-white">79026, м. Львів</li>
              <li className="text-white">вул. Володимира Великого, 29</li>
            </ul>
          </div>
        </div>


      </footer>
      <style dangerouslySetInnerHTML={{ __html: landingStyles }} />
    </div>
  );
}

const landingStyles = `
:root {
  --sky-50: #f0f7ff;
  --sky-100: #e0f0ff;
  --sky-200: #bae0fd;
  --sky-300: #7cc8fb;
  --sky-400: #38aef5;
  --sky-500: #0d93e0;
  --sky-600: #0275b8;
  --navy: #0a2540;
  --navy2: #143357;

  --bg: #e0eafb;
  --bg2: #e0eafb;
  --bg3: #e0eafb;
  --surface: #ffffff;

  --border: rgba(13, 147, 224, 0.12);
  --border2: rgba(13, 147, 224, 0.22);
  --border3: rgba(10, 37, 64, 0.08);

  --accent: #0d93e0;
  --accent2: #38aef5;
  --accent-light: rgba(13, 147, 224, 0.10);

  --text: #0a2540;
  --text2: #3d6080;
  --text3: #7da4bf;

  --green: #0d9e7a;
  --amber: #e09c0d;
}

.landing-body {
  /* background: linear-gradient(180deg, #f8fcff 0%, #edf5fd 30%, #e2effb 60%, #d4e8f8 100%); */
  background: #4256D5;
  background-attachment: fixed;
  color: var(--text);
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 16px;
  line-height: 1.6;
  overflow-x: hidden;
  width: 100%;
}

/* ── UTILS ── */
.mono {
  font-family: 'JetBrains Mono', monospace;
}

.serif {
  font-family: 'Lora', serif;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text2);
  background: none;
  border: none;
  padding: 0;
}

.tag::before {
  content: '';
  width: 36px;
  height: 1px;
  background: var(--border2);
  flex-shrink: 0;
}

/* ── NAV ── */
.landing-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 52px;
  height: 64px;
  background: rgba(247, 251, 255, 0.88);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border3);
  box-shadow: 0 1px 0 rgba(13, 147, 224, 0.07);
}

.nav-logo {
  font-family: 'Lora', serif;
  font-size: 21px;
  font-weight: 600;
  color: var(--navy);
  letter-spacing: -0.02em;
}

.nav-logo span {
  color: var(--accent);
}

.nav-links {
  display: flex;
  gap: 28px;
  list-style: none;
}

.nav-links a {
  font-size: 14px;
  font-weight: 500;
  color: var(--text2);
  text-decoration: none;
  transition: color 0.2s;
}

.nav-links a:hover {
  color: var(--text);
}

.nav-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.btn-ghost {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: var(--text2);
  background: none;
  border: 2px solid #4256D5;
  color: #4256D5;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  transition: color 0.2s, background 0.2s;
}

.btn-ghost:hover {
  color: var(--text);
  background: var(--bg3);
}

.btn-primary {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background: #4256D5;
  border: none;
  cursor: pointer;
  padding: 9px 20px;
  border-radius: 8px;
  
}

.btn-primary:hover {
  background: var(--sky-600);
  transform: translateY(-1px);
  box-shadow: 0 4px 18px rgba(13, 147, 224, 0.38);
}

/* ── HERO ── */
.hero {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 100px 52px 72px;
  position: relative;
}

.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;

  background-size: 44px 44px;
  
}

.hero-blob {
  position: absolute;
  right: -60px;
  top: 60px;
  pointer-events: none;
  width: 560px;
  height: 560px;
  border-radius: 50%;
  background: radial-gradient(ellipse at 40% 40%, rgba(186, 224, 253, 0.5) 0%, rgba(224, 241, 253, 0.25) 50%, transparent 75%);
}

.hero-blob2 {
  position: absolute;
  left: -100px;
  bottom: 0;
  pointer-events: none;
  width: 360px;
  height: 360px;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(186, 224, 253, 0.25) 0%, transparent 70%);
}

.hero-eyebrow {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  justify-content: center;
}

.hero-eyebrow-line {
  flex: 1;
  max-width: 48px;
  height: 1px;
  background: var(--border2);
}

.hero-eyebrow-text {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text2);
}

.landing-body h1 {
  font-family: 'Lora', serif;
  font-size: clamp(36px, 4.8vw, 68px);
  font-weight: 500;
  line-height: 1.1;
  letter-spacing: -0.025em;
  margin-bottom: 22px;
  color: var(--navy);
}

.landing-body h1 em {
  font-style: italic;
  color: var(--accent);
}

.hero-sub {
  font-size: 16px;
  color: var(--text2);
  max-width: 500px;
  line-height: 1.75;
  margin-bottom: 36px;
}

.hero-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.btn-large {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background: var(--accent);
  border: none;
  cursor: pointer;
  padding: 13px 28px;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(13, 147, 224, 0.28);
  transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
}

.btn-large:hover {
  background: var(--sky-600);
  transform: translateY(-2px);
  box-shadow: 0 6px 28px rgba(13, 147, 224, 0.4);
}

.btn-outline {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: var(--text2);
  background: var(--surface);
  border: 1.5px solid var(--border2);
  cursor: pointer;
  padding: 13px 28px;
  border-radius: 10px;
  transition: border-color 0.2s, color 0.2s, background 0.2s;
}

.btn-outline:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-light);
}

/* ── HERO STATS ── */
.hero-stats-grid {
  margin-top: 52px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--border2);
  background: var(--surface);
  box-shadow: 0 4px 24px rgba(13, 37, 64, 0.06);
  width: 100%;
  max-width: 100%;
}

.hstat {
  padding: 28px 24px;
  position: relative;
  border-right: 1px solid var(--border3);
  transition: background 0.2s;
}

.hstat:last-child {
  border-right: none;
}

.hstat:hover {
  background: var(--sky-50);
}

.hstat-num {
  font-family: 'Lora', serif;
  font-size: 42px;
  font-weight: 600;
  line-height: 1;
  color: var(--navy);
  letter-spacing: -0.02em;
}

.hstat-num sup {
  font-size: 20px;
  color: var(--accent);
  vertical-align: super;
  line-height: 0;
  font-weight: 500;
}

.hstat-label {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  margin-top: 8px;
  line-height: 1.4;
}

.hstat-sub {
  font-size: 12px;
  color: var(--text3);
  margin-top: 3px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 400;
  letter-spacing: 0;
}

.hstat-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--accent), var(--sky-200));
  opacity: 0;
  transition: opacity 0.25s;
}

.hstat:hover .hstat-bar {
  opacity: 1;
}

/* ── SECTION ── */
.landing-body section {
  padding: 96px 52px;
}

.landing-body h2 {
  font-family: 'Lora', serif;
  font-size: clamp(30px, 3.6vw, 48px);
  font-weight: 500;
  line-height: 1.14;
  letter-spacing: -0.025em;
  color: var(--navy);
}

.landing-body h2 em {
  font-style: italic;
  color: var(--accent);
}

.section-header {
  margin-bottom: 52px;
}

.section-header .tag {
  margin-bottom: 16px;
}

/* ── FEATURES ── */
.features {
  background: var(--bg);
}

.features-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.feature-card {
  padding: 32px;
  border-radius: 16px;
  background: var(--surface);
  border: 1px solid var(--border3);
  box-shadow: 0 2px 12px rgba(13, 37, 64, 0.04);
  transition: transform 0.25s, box-shadow 0.25s;
  position: relative;
  overflow: hidden;
}

.feature-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--accent), var(--sky-200));
  opacity: 0;
  transition: opacity 0.3s;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 32px rgba(13, 147, 224, 0.11);
}

.feature-card:hover::after {
  opacity: 1;
}

.feature-number {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--text3);
  margin-bottom: 18px;
  letter-spacing: 0.12em;
}

.feature-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #ddf0ff, #c0e4fd);
  border: 1px solid var(--border2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 22px;
}

.landing-body h3 {
  font-family: 'Syne', sans-serif;
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 10px;
  line-height: 1.2;
  color: var(--navy);
  letter-spacing: -0.02em;
}

.feature-desc {
  font-size: 14px;
  color: var(--text2);
  line-height: 1.72;
  margin-bottom: 20px;
}

.feature-list {
  list-style: none;
}

.feature-list li {
  font-size: 13px;
  color: var(--text2);
  padding: 7px 0;
  border-bottom: 1px solid var(--border3);
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.feature-list li:last-child {
  border-bottom: none;
}

.feature-list li::before {
  content: '→';
  color: var(--accent);
  font-size: 12px;
  flex-shrink: 0;
  margin-top: 1px;
}

.feature-card-large {
  grid-column: span 2;
  padding: 40px;
  background: linear-gradient(135deg, var(--sky-50) 0%, var(--surface) 100%);
  border: 1px solid var(--border2);
  border-radius: 16px;
  box-shadow: 0 2px 20px rgba(13, 147, 224, 0.07);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: center;
}

.feature-metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.metric-cell {
  padding: 20px 18px;
  border-radius: 12px;
  background: var(--surface);
  border: 1px solid var(--border3);
  box-shadow: 0 1px 6px rgba(13, 37, 64, 0.04);
  position: relative;
  overflow: hidden;
}

.metric-cell::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--accent), var(--sky-200));
}

.metric-cell-val {
  font-family: 'Lora', serif;
  font-size: 38px;
  font-weight: 600;
  line-height: 1;
  color: var(--navy);
  letter-spacing: -0.02em;
}

.metric-cell-val .acc {
  color: var(--accent);
  font-size: 22px;
  font-weight: 500;
}

.metric-cell-label {
  font-size: 12px;
  color: var(--text2);
  margin-top: 8px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  line-height: 1.45;
  font-weight: 500;
}


/* ── MARQUEE ── */
.marquee-wrap {
  border-top: 1px solid var(--border3);
  border-bottom: 1px solid var(--border3);
  padding: 13px 0;
  overflow: hidden;
  background: var(--surface);
}

.marquee-track {
  display: flex;
  animation: marquee 30s linear infinite;
  white-space: nowrap;
}

.marquee-item {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--text3);
  padding: 0 28px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.marquee-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--sky-300);
  flex-shrink: 0;
}

@keyframes marquee {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(-50%);
  }
}

.why {
  background: var(--bg2);
}

.why-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 0;
}

.why-card {
  padding: 30px;
  border-radius: 14px;
  background: var(--surface);
  border: 1px solid var(--border3);
  box-shadow: 0 1px 12px rgba(13, 37, 64, 0.04);
  transition: transform 0.2s, box-shadow 0.2s;
}

.why-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 28px rgba(13, 147, 224, 0.1);
}

.why-num {
  font-family: 'Inter', serif;
  font-size: 50px;
  font-weight: 700;
  color:#A5BDE9;
  line-height: 1;
  letter-spacing: -0.04em;
  margin-bottom: 12px;
}

.why-title {
  font-family: 'Inter', serif;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--navy);
}

.why-desc {
  font-size: 14px;
  color: var(--text2);
  line-height: 1.7;
}

/* ── SECURITY ── */
.security {
  background: var(--bg);
}

.security-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 72px;
  align-items: center;
  margin-top: 56px;
}

.security-list {
  list-style: none;
}

.security-list li {
  padding: 20px 0;
  border-bottom: 1px solid var(--border3);
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.security-list li:last-child {
  border-bottom: none;
}

.security-icon {
  width: 38px;
  height: 38px;
  background: var(--sky-100);
  border: 1px solid var(--border2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 17px;
}

.security-item-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--navy);
}

.security-item-desc {
  font-size: 13px;
  color: var(--text2);
  line-height: 1.65;
}

.security-visual {
  background: var(--surface);
  border: 1px solid var(--border2);
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 4px 24px rgba(13, 147, 224, 0.09);
}

.sec-vis-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text3);
  margin-bottom: 18px;
}

.security-badge {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 16px;
  margin-bottom: 8px;
  background: var(--bg);
  border: 1px solid var(--border3);
  border-radius: 10px;
  font-size: 13px;
}

.badge-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.badge-dot.green {
  background: var(--green);
  box-shadow: 0 0 8px rgba(13, 158, 122, 0.5);
}

.badge-dot.blue {
  background: var(--accent);
  box-shadow: 0 0 8px rgba(13, 147, 224, 0.5);
}

.badge-label {
  color: var(--text2);
}

.badge-val {
  margin-left: auto;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--navy);
  font-weight: 500;
}

.uptime-block {
  margin-top: 22px;
  padding-top: 20px;
  border-top: 1px solid var(--border3);
}

.uptime-label {
  font-size: 12px;
  color: var(--text3);
  font-family: 'JetBrains Mono', monospace;
}

.uptime-val {
  font-family: 'Lora', serif;
  font-size: 30px;
  font-weight: 500;
  color: var(--navy);
  margin-top: 4px;
  letter-spacing: -0.03em;
}

.uptime-val span {
  font-size: 18px;
  color: var(--accent);
}

/* ── STEPS ── */
.steps {
  background: var(--bg2);
}

.steps-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  margin-top: 56px;
  position: relative;
}

.steps-connector {
  position: absolute;
  top: 27px;
  left: calc(0% + 47px);
  right: calc(25% - 47px);
  height: 1.5px;
  background: linear-gradient(90deg, var(--sky-300), var(--sky-200));
  z-index: 0;
}

.step-item {
  padding: 0 20px;
  position: relative;
  z-index: 1;
}

.step-num-wrap {
  width: 54px;
  height: 54px;
  background: var(--surface);
  border: 2px solid var(--accent);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 22px;
  box-shadow: 0 0 0 6px var(--sky-100);
}

.step-num {
  font-family: 'Lora', serif;
  font-size: 20px;
  font-weight: 500;
  color: var(--accent);
}

.step-title {
  font-family: 'Lora', serif;
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--navy);
}

.step-desc {
  font-size: 13px;
  color: var(--text2);
  line-height: 1.7;
}

/* ── CTA ── */
.cta-section {
  padding: 96px 52px;
  text-align: center;
 
  border-top: 1px solid var(--border3);
  position: relative;
  overflow: hidden;
}

.cta-section::before {
  content: '';
  position: absolute;
  top: -200px;
  left: 50%;
  transform: translateX(-50%);
  width: 700px;
  height: 500px;
  pointer-events: none;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(186, 224, 253, 0.5) 0%, transparent 70%);
}

.cta-section h2 {
  margin-bottom: 16px;
  position: relative;
}

.cta-section p {
  font-size: 17px;
  color: var(--text2);
  margin-bottom: 38px;
  position: relative;
}

.cta-actions {
  display: flex;
  gap: 14px;
  justify-content: center;
  position: relative;
}

/* ── FOOTER ── */
.landing-footer {
  padding: 60px 52px 36px;
  /* background: var(--navy); */
  background: #2E2F4A !important;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  width: 100%;
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 48px;
  margin-bottom: 44px;
}

.footer-logo {
  font-family: 'Lora', serif;
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 12px;
}

.footer-logo span {
  color: var(--sky-300);
}

.footer-tagline {
  font-size: 14px;
  color: white;
  line-height: 1.7;
  max-width: 240px;
}

.footer-col h4 {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.3);
  margin-bottom: 16px;
}

.footer-col ul {
  list-style: none;
}

.footer-col ul li {
  margin-bottom: 9px;
}

.footer-col ul li a {
  font-size: 14px;
  color: white;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-col ul li a:hover {
  color: #fff;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 28px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.footer-copy {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.25);
  font-family: 'JetBrains Mono', monospace;
}

.footer-note {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.25);
}

/* ── ANIMATIONS ── */
.fade-up {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeUp 0.7s ease forwards;
}

.fade-up-delay-1 {
  animation-delay: 0.1s;
}

.fade-up-delay-2 {
  animation-delay: 0.22s;
}

.fade-up-delay-3 {
  animation-delay: 0.36s;
}

.fade-up-delay-4 {
  animation-delay: 0.52s;
}

@keyframes fadeUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ── SCROLL REVEAL ── */
.reveal {
  opacity: 0;
  transform: translateY(36px);
  transition: opacity 0.65s ease, transform 0.65s ease;
}

.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

.reveal-left {
  opacity: 0;
  transform: translateX(-32px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.reveal-left.visible {
  opacity: 1;
  transform: translateX(0);
}

.reveal-right {
  opacity: 0;
  transform: translateX(32px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.reveal-right.visible {
  opacity: 1;
  transform: translateX(0);
}

/* ── FEATURE CARD HOVER ── */
.feature-card {
  padding: 32px;
  border-radius: 16px;
  background: var(--surface);
  border: 1px solid var(--border3);
  box-shadow: 0 2px 12px rgba(13, 37, 64, 0.04);
  transition: transform 0.3s cubic-bezier(.34, 1.56, .64, 1), box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;
}

.feature-card:hover {
  transform: translateY(-8px) scale(1.01);
  box-shadow: 0 20px 48px rgba(13, 147, 224, 0.15);
}

.feature-card:hover::after {
  opacity: 1;
}

.feature-card:hover .feature-icon {
  transform: scale(1.12) rotate(-4deg);
}

.feature-icon {
  transition: transform 0.35s cubic-bezier(.34, 1.56, .64, 1);
}

/* ── WHY CARD HOVER ── */
.why-card {
  padding: 30px;
  border-radius: 14px;
  background: var(--surface);
  border: 1px solid var(--border3);
  box-shadow: 0 1px 12px rgba(13, 37, 64, 0.04);
  transition: transform 0.3s cubic-bezier(.34, 1.56, .64, 1), box-shadow 0.3s ease, border-color 0.3s;
}

.why-card:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow: 0 16px 40px rgba(13, 147, 224, 0.12);
  border-color: var(--border2);
}

.why-card:hover .why-num {
  color: var(--sky-300);
  transition: color 0.3s;
}

/* ── STEP HOVER ── */
.step-num-wrap {
  transition: transform 0.3s cubic-bezier(.34, 1.56, .64, 1), box-shadow 0.3s;
}

.step-item:hover .step-num-wrap {
  transform: scale(1.15);
  box-shadow: 0 0 0 8px rgba(13, 147, 224, 0.12);
}

/* ── HSTAT HOVER ── */
.hstat {
  transition: background 0.25s, transform 0.25s cubic-bezier(.34, 1.56, .64, 1);
}

.hstat:hover {
  background: var(--sky-50);
  transform: translateY(-4px);
}

/* ── GLOBE PULSE ── */
@keyframes globePulse {

  0%,
  100% {
    opacity: 0.18;
  }

  50% {
    opacity: 0.26;
  }
}

.globe-wrap {
  animation: globePulse 4s ease-in-out infinite;
}

/* ── METRIC CELL HOVER ── */
.metric-cell {
  transition: transform 0.3s cubic-bezier(.34, 1.56, .64, 1), box-shadow 0.3s;
}

.metric-cell:hover {
  transform: translateY(-4px) scale(1.03);
  box-shadow: 0 8px 24px rgba(13, 147, 224, 0.13);
}

/* ── BTN PULSE ── */
@keyframes btnPulse {

  0%,
  100% {
    box-shadow: 0 4px 20px rgba(13, 147, 224, 0.28);
  }

  50% {
    box-shadow: 0 4px 36px rgba(13, 147, 224, 0.52);
  }
}

.btn-large {
  animation: btnPulse 2.5s ease-in-out infinite;
}

.btn-large:hover {
  animation: none;
}

/* ── FLOATING PARTICLES ── */
.particle {
  position: absolute;
  border-radius: 50%;
  background: var(--accent);
  pointer-events: none;
  animation: floatUp linear infinite;
  opacity: 0;
}

@keyframes floatUp {
  0% {
    transform: translateY(0) scale(1);
    opacity: 0;
  }

  15% {
    opacity: 0.18;
  }

  85% {
    opacity: 0.08;
  }

  100% {
    transform: translateY(-320px) scale(0.4);
    opacity: 0;
  }
}

/* ── NAV SCROLL EFFECT ── */
.landing-nav.scrolled {
  box-shadow: 0 4px 32px rgba(13, 37, 64, 0.10);
  background: rgba(247, 251, 255, 0.97);
}

/* ── MARQUEE HOVER PAUSE ── */
.marquee-wrap:hover .marquee-track {
  animation-play-state: paused;
}

/* ── WHY-NUM GLOW ── */
.why-card:hover .why-num {
  text-shadow: 0 0 32px rgba(13, 147, 224, 0.25);
}

/* ── STEP CONNECTOR DRAW ── */
.steps-connector {
  transform-origin: left center;
  animation: none;
}

.steps-connector.drawn {
  animation: drawLine 1s ease forwards;
}

@keyframes drawLine {
  from {
    clip-path: inset(0 100% 0 0);
  }

  to {
    clip-path: inset(0 0% 0 0);
  }
}

/* ── GLOBE ANIMATIONS ── */
@keyframes globeSpin {
  from {
    transform: rotate(0deg);
    transform-origin: 310px 310px;
  }

  to {
    transform: rotate(360deg);
    transform-origin: 310px 310px;
  }
}

@keyframes globeSpinSlow {
  from {
    transform: rotate(0deg);
    transform-origin: 310px 310px;
  }

  to {
    transform: rotate(-360deg);
    transform-origin: 310px 310px;
  }
}

@keyframes routeDash {
  to {
    stroke-dashoffset: -28;
  }
}

@keyframes routeDash2 {
  to {
    stroke-dashoffset: -20;
  }
}

@keyframes cityPulse {

  0%,
  100% {
    r: 5.5;
    opacity: 1;
  }

  50% {
    r: 8;
    opacity: 0.6;
  }
}

@keyframes ringExpand {
  0% {
    r: 6;
    opacity: 0.7;
    stroke-width: 1.2;
  }

  100% {
    r: 22;
    opacity: 0;
    stroke-width: 0.3;
  }
}

@keyframes globeFloat {

  0%,
  100% {
    transform: translateY(-52%) scale(1);
  }

  50% {
    transform: translateY(-54%) scale(1.02);
  }
}

@keyframes dashMove {
  to {
    stroke-dashoffset: -24;
  }
}

#globe-wrap {
  animation: globeFloat 6s ease-in-out infinite;
}

.grid-spin {
  animation: globeSpin 28s linear infinite;
  transform-origin: 310px 310px;
  transform-box: fill-box;
}

.grid-spin2 {
  animation: globeSpinSlow 38s linear infinite;
  transform-origin: 310px 310px;
  transform-box: fill-box;
}

.route-flow1 {
  animation: routeDash 2s linear infinite;
}

.route-flow2 {
  animation: routeDash2 2.6s linear infinite;
}

.route-flow3 {
  animation: routeDash 3.2s linear infinite 0.5s;
}

.route-flow4 {
  animation: routeDash2 2.4s linear infinite 1s;
}

.route-flow5 {
  animation: routeDash 3.8s linear infinite 0.3s;
}

.city-pulse1 {
  animation: cityPulse 2.2s ease-in-out infinite;
  transform-origin: center;
  transform-box: fill-box;
}

.city-pulse2 {
  animation: cityPulse 3s ease-in-out infinite 0.7s;
  transform-origin: center;
  transform-box: fill-box;
}

.city-pulse3 {
  animation: cityPulse 2.6s ease-in-out infinite 1.4s;
  transform-origin: center;
  transform-box: fill-box;
}

.ring1 {
  animation: ringExpand 2s ease-out infinite;
  transform-origin: center;
  transform-box: fill-box;
}

.ring2 {
  animation: ringExpand 2s ease-out infinite 0.7s;
  transform-origin: center;
  transform-box: fill-box;
}

.ring3 {
  animation: ringExpand 2s ease-out infinite 1.4s;
  transform-origin: center;
  transform-box: fill-box;
}

/* ── CTA SHIMMER ── */
@keyframes shimmerSlide {
  0% {
    background-position: -200% center;
  }

  100% {
    background-position: 200% center;
  }
}

.cta-section h2 {
  background: linear-gradient(90deg, var(--navy) 40%, var(--accent) 50%, var(--navy) 60%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmerSlide 4s linear infinite;
}

.cta-section h2 em {
  -webkit-text-fill-color: transparent;
}

/* ── HSTAT NUMBER SCALE IN ── */
@keyframes scaleIn {
  from {
    transform: scale(0.7);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

.hstat-num {
  animation: scaleIn 0.6s cubic-bezier(.34, 1.56, .64, 1) both;
}

.hstat:nth-child(1) .hstat-num {
  animation-delay: 0.6s;
}

.hstat:nth-child(2) .hstat-num {
  animation-delay: 0.75s;
}

.hstat:nth-child(3) .hstat-num {
  animation-delay: 0.9s;
}

.hstat:nth-child(4) .hstat-num {
  animation-delay: 1.05s;
}

/* ── FEATURE LIST ITEM HOVER ── */
.feature-list li {
  transition: color 0.2s, padding-left 0.25s;
}

.feature-list li:hover {
  color: var(--navy);
  padding-left: 6px;
}

/* ── NAV LINK UNDERLINE ── */
.nav-links a {
  position: relative;
}

.nav-links a::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 1.5px;
  background: var(--accent);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.25s ease;
}

.nav-links a:hover::after {
  transform: scaleX(1);
}

/* ── SECTION TAG HOVER ── */
.tag {
  transition: color 0.2s;
}

.tag:hover {
  color: var(--navy);
}

/* ── SCROLL BG ILLUSTRATIONS ── */
.bg-illo {
  position: absolute;
  pointer-events: none;
  z-index: 0;
  opacity: 0;
  transition: opacity 1.4s ease;
  will-change: opacity;
}

.bg-illo.visible {
  opacity: 0.32;
}

.landing-body section {
  position: relative;
  z-index: 1;
}

.features::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--bg);
  z-index: -1;
  pointer-events: none;
}

.why::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--bg2);
  z-index: -1;
  pointer-events: none;
}

.steps::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--bg2);
  z-index: -1;
  pointer-events: none;
}

.cta-section {
  position: relative;
  z-index: 1;
}

.landing-footer {
  position: relative;
  z-index: 1;
}

/* ==========================================================================
   RESPONSIVE (MEDIA QUERIES)
   ========================================================================== */

/* ── TABLET (max 1024px) ── */
@media (max-width: 1024px) {
  .landing-nav {
    padding: 0 32px;
  }

  .hero {
    padding: 100px 32px 60px;
  }

  .features-layout {
    grid-template-columns: 1fr;
  }

  .feature-card-large {
    grid-column: span 1;
    flex-direction: column;
    gap: 24px;
  }

  .why-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .steps-row {
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    padding: 20px 5% 40px;
    margin: 0 -5%;
    gap: 24px;
    justify-content: flex-start;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    /* Firefox */
  }

  .steps-row::-webkit-scrollbar {
    display: none;
  }

  /* Chrome/Safari */
  .step-item {
    flex: 0 0 280px;
    width: 280px;
    min-width: 280px;
  }

  .steps-connector {
    display: none;
  }

  #globe-wrap {
    transform: scale(0.8) translateY(-52%);
    right: -15%;
  }
}

/* ── MOBILE LARGE (max 768px) ── */
@media (max-width: 768px) {
  .nav-links {
    display: none;
  }

  /* Hide for now, can be mobile menu later */

  .hero-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .why-grid {
    grid-template-columns: 1fr;
  }

  .step-item {
    width: 100%;
  }

  .cta-section {
    padding: 60px 20px;
  }

  .cta-section h2 {
    font-size: 32px;
  }

  .landing-footer {
    padding: 40px 20px;
  }

  .footer-grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  #globe-wrap {
    opacity: 0.12;
    transform: scale(0.6) translateY(-52%);
    right: -25%;
  }

  #truck-wrap {
    display: none;
  }
}

/* ── MOBILE SMALL (max 480px) ── */
@media (max-width: 480px) {
  .landing-nav {
    padding: 0 16px;
    height: 60px;
  }

  .nav-logo {
    font-size: 18px;
  }

  .hero {
    padding: 80px 20px 40px;
  }



  .hero-actions {
    flex-direction: column;
    width: 100%;
  }

  .hero-actions .btn-large,
  .hero-actions .btn-outline {
    width: 100%;
    text-align: center;
  }

  .hero-stats-grid {
    grid-template-columns: 1fr;
  }

  .hstat {
    padding: 20px;
    border-right: none;
    border-bottom: 1px solid var(--border3);
  }

  .hstat:last-child {
    border-bottom: none;
  }

  .section-header {
    margin-bottom: 32px;
  }

  .feature-card {
    padding: 20px;
  }

  .feature-metrics {
    grid-template-columns: 1fr;
  }

  .step-item {
    flex: 0 0 260px;
    width: 260px;
    min-width: 260px;
  }
}

/* ── CONTINUOUS ANIMATIONS — use separate wrapper so opacity not overridden ── */
@keyframes illoFloat {

  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }

  30% {
    transform: translateY(-14px) rotate(0.4deg);
  }

  70% {
    transform: translateY(-6px) rotate(-0.3deg);
  }
}

@keyframes illoSway {

  0%,
  100% {
    transform: translateY(0px) rotate(0deg) scale(1);
  }

  25% {
    transform: translateY(-10px) rotate(0.6deg) scale(1.01);
  }

  75% {
    transform: translateY(6px) rotate(-0.5deg) scale(0.99);
  }
}

@keyframes illoScale {

  0%,
  100% {
    transform: scale(1) rotate(0deg);
  }

  40% {
    transform: scale(1.04) rotate(0.3deg);
  }

  80% {
    transform: scale(0.97) rotate(-0.2deg);
  }
}

@keyframes strokeDraw {
  from {
    stroke-dashoffset: 600;
    opacity: 0;
  }

  10% {
    opacity: 1;
  }

  to {
    stroke-dashoffset: 0;
    opacity: 1;
  }
}

@keyframes dashFlow {
  to {
    stroke-dashoffset: -32;
  }
}

@keyframes fadeInPop {
  0% {
    opacity: 0;
    transform: scale(0.75) translateY(8px);
  }

  65% {
    transform: scale(1.06) translateY(-2px);
  }

  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.bg-illo.visible {
  opacity: 0.32;
}

.bg-illo.visible.float {
  animation: illoFloat 7s ease-in-out infinite;
}

.bg-illo.visible.sway {
  animation: illoSway 8s ease-in-out infinite;
}

.bg-illo.visible.scalep {
  animation: illoScale 6s ease-in-out infinite;
}

/* SVG children animate after parent becomes visible */
.bg-illo.visible .draw-path {
  stroke-dasharray: 600;
  stroke-dashoffset: 600;
  animation: strokeDraw 2.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.bg-illo.visible .dash-flow {
  animation: dashFlow 1.8s linear infinite;
}

.bg-illo.visible .pop-in {
  animation: fadeInPop 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.bg-illo.visible .pop-in-d1 {
  animation-delay: 0.4s;
  opacity: 0;
}

.bg-illo.visible .pop-in-d2 {
  animation-delay: 0.75s;
  opacity: 0;
}

.bg-illo.visible .pop-in-d3 {
  animation-delay: 1.1s;
  opacity: 0;
}

/* ── SCOPED LANDING PAGE OVERRIDES (PRESERVES OTHER PAGES) ── */

.landing-body,
.landing-body h1,
.landing-body h2,
.landing-body h3,
.landing-body h4,
.landing-body .nav-logo,
.landing-body .nav-logo span,
.landing-body .footer-logo,
.landing-body .btn-large,
.landing-body .btn-outline,
.landing-body .btn-ghost,
.landing-body .btn-primary,
.landing-body .nav-links a {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
}

.landing-body {
  background-color: #e0eafb !important;
}

.landing-body .hero {
  position: relative;
  background: url('/images/main-page/hero-image.jpg') no-repeat center center / cover !important;
  min-height: 100vh !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  align-items: center !important;
  padding: 140px 80px 60px !important;
}

.landing-body .hero::before {
  content: '' !important;
  position: absolute !important;
  inset: 0 !important;
 
  pointer-events: none !important;
  mask-image: none !important;
}

.landing-body .hero-blob,
.landing-body .hero-blob2,
.landing-body #truck-wrap,
.landing-body #globe-wrap {
  display: none !important;
}

.landing-body .hero-content-left {
  position: relative !important;
  z-index: 2 !important;
  max-width: 680px !important;
  width: 100% !important;
  text-align: left !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: flex-start !important;
  margin-left: 0 !important;
  margin-right: auto !important;
}

.landing-body .hero-eyebrow {
  margin-bottom: 24px !important;
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
  justify-content: flex-start !important;
  width: 100% !important;
  margin-left: 0 !important;
  margin-right: auto !important;
}

.landing-body .hero-eyebrow-line {
  width: 32px !important;
  height: 2px !important;
  background: var(--text3) !important;
}

.landing-body .hero-eyebrow-text {
  font-size: 13.5px !important;
  font-weight: 700 !important;
  letter-spacing: 0.02em !important;
  color: var(--text2) !important;
  text-transform: none !important;
}

.landing-body h1 em {
  font-style: normal !important;
  color: var(--navy) !important;
}

.landing-body .hero-actions {
  display: flex !important;
  gap: 16px !important;
  align-items: center !important;
  margin-bottom: 64px !important;
  justify-content: flex-start !important;
}

.landing-body .btn-large {
  font-size: 15px !important;
  font-weight: 700 !important;
  padding: 14px 28px !important;
  border-radius: 12px !important;
  box-shadow: 0 4px 18px rgba(37, 99, 235, 0.2) !important;
  background: var(--accent) !important;
  animation: none !important;
}

.landing-body .btn-large:hover {
  background: #1d4ed8 !important;
}

.landing-body .btn-outline {
  font-size: 15px !important;
  font-weight: 700 !important;
  color: var(--accent) !important;
  border: 2px solid rgba(37, 99, 235, 0.2) !important;
  padding: 12px 28px !important;
  border-radius: 12px !important;
  background: #fff !important;
}

.landing-body .btn-outline:hover {
  border-color: var(--accent) !important;
  background: var(--accent-light) !important;
}

/* ── SC SCOPED STATS Centered & Enlarged ── */
.landing-body .hero-stats-wrapper {
  position: relative !important;
  z-index: 2 !important;
  width: 100% !important;
  margin: 64px auto 0 !important;
}

.landing-body .hero-stats-grid {
  display: grid !important;
  grid-template-columns: repeat(4, 1fr) !important;
  background: var(--surface) !important;
  border: 1px solid rgba(15, 23, 42, 0.08) !important;
  border-radius: 24px !important;
  box-shadow: 0 16px 48px rgba(15, 23, 42, 0.04) !important;
  width: 100% !important;
  overflow: hidden !important;
}

.landing-body .hstat {
  padding: 40px 48px !important;
  text-align: left !important;
  border-right: 1px solid rgba(15, 23, 42, 0.08) !important;
  border-top: none !important;
  transition: background 0.2s ease !important;
  transform: none !important;
}

.landing-body .hstat::after,
.landing-body .hstat-bar {
  display: none !important;
}

.landing-body .hstat:last-child {
  border-right: none !important;
}

.landing-body .hstat:hover {
  background: rgba(37, 99, 235, 0.02) !important;
  transform: none !important;
}

.landing-body .hstat-num {
  font-size: 56px !important;
  font-weight: 800 !important;
  color: var(--navy) !important;
  letter-spacing: -0.04em !important;
  line-height: 1.05 !important;
  animation: none !important;
}

.landing-body .hstat-num sup {
  display: none !important;
}

.landing-body .hstat-label {
  font-size: 15px !important;
  font-weight: 700 !important;
  color: var(--text) !important;
  margin-top: 12px !important;
}

.landing-body .hstat-sub {
  font-size: 12.5px !important;
  color: var(--text3) !important;
  margin-top: 5px !important;
}

.landing-body h2 {
  font-weight: 800 !important;
  font-size: clamp(32px, 4vw, 44px) !important;
  line-height: 1.2 !important;
  letter-spacing: -0.03em !important;
  color: var(--navy) !important;
  font-style: normal !important;
}

.landing-body h2 em {
  font-style: normal !important;
  color: var(--accent) !important;
}

.landing-body h3 {
  font-size: 22px !important;
  font-weight: 800 !important;
  color: var(--navy) !important;
  letter-spacing: -0.03em !important;
}

.landing-body .feature-icon-box {
  width: 56px !important;
  height: 56px !important;
  background: var(--accent-light) !important;
  border-radius: 12px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  margin-bottom: 24px !important;
}

.landing-body .feature-card {
  padding: 40px !important;
  border-radius: 20px !important;
}

.landing-body .feature-card-large {
  padding: 48px !important;
  border-radius: 20px !important;
}

.landing-body .metric-cell {
  border: 2px solid rgba(37, 99, 235, 0.12) !important;
}

.landing-body .metric-cell::before {
  display: none !important;
}

.landing-body .why-card {
  padding: 36px 30px !important;
  border-radius: 18px !important;
}

.landing-body .why-num {
  font-size: 36px !important;
  font-weight: 800 !important;
  color: var(--accent) !important;
  opacity: 0.15 !important;
  line-height: 1 !important;
  margin-bottom: 16px !important;
  text-shadow: none !important;
}

.landing-body .why-card:hover .why-num {
  opacity: 0.3 !important;
  color: var(--accent) !important;
  text-shadow: none !important;
}

.landing-body .steps-connector {
  top: 28px !important;
  background: rgba(37, 99, 235, 0.12) !important;
}

.landing-body .step-num-wrap {
  width: 56px !important;
  height: 56px !important;
  border: 2px solid var(--accent) !important;
  box-shadow: 0 0 0 6px var(--accent-light) !important;
}

.landing-body .step-num {
  font-size: 20px !important;
  font-weight: 800 !important;
  color: var(--accent) !important;
}

.landing-body .cta-section {
  background: #e0eafb !important;
}

.landing-body .cta-section h2 {
  font-size: clamp(32px, 4vw, 44px) !important;
  font-weight: 800 !important;
  letter-spacing: -0.03em !important;
  color: var(--navy) !important;
  background: none !important;
  -webkit-background-clip: unset !important;
  -webkit-text-fill-color: unset !important;
  animation: none !important;
}

@media (max-width: 1024px) {
  .landing-body .hero {
    align-items: center !important;
    text-align: center !important;
  }

  .landing-body .hero-content-left {
    text-align: center !important;
    align-items: center !important;
    margin: 0 auto !important;
  }

  .landing-body .hero-eyebrow {
    justify-content: center !important;
    margin: 0 auto !important;
  }

  .landing-body .hero-stats-grid {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 0 !important;
  }

  .landing-body .hstat {
    border-right: none !important;
    border-bottom: 1px solid rgba(15, 23, 42, 0.06) !important;
  }

  .landing-body .hstat:last-child {
    border-bottom: none !important;
  }
}

@media (max-width: 480px) {
  .landing-body .hstat {
    border-right: none !important;
    border-bottom: 1px solid rgba(15, 23, 42, 0.06) !important;
  }

  .landing-body .hstat:last-child {
    border-bottom: none !important;
  }
}

.landing-body .landing-footer {
  background: #2E2F4A !important;
}
`;
