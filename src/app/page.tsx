"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/shared/providers/AuthCheckProvider";
import "./landing.css";

// Fonts will be handled by a <link> in Head for simplicity as requested to "make it the same as HTML"
// but we'll use standard Next.js Head for it.

export default function HomePage() {
  const { profile } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const connectorRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ── NAV SCROLL ──
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    // ── SCROLL REVEAL ──
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

    // ── BG ILLUSTRATIONS SCROLL ──
    const illoObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          requestAnimationFrame(() => {
            e.target.classList.add('visible');
          });
          illoObs.unobserve(e.target);
        }
      });
    }, { threshold: 0, rootMargin: '100px 0px 100px 0px' });
    document.querySelectorAll('.bg-illo').forEach(el => {
      illoObs.observe(el);
    });

    // ── COUNTER ANIMATION ──
    let counted = false;
    const statNums = document.querySelectorAll('.hstat-num') as NodeListOf<HTMLElement>;
    const targets = [68, 2130, 200, 600];
    const suffixes = ['', '', '+', '+'];

    function animateCounter(el: HTMLElement, target: number, duration: number, supHtml: string) {
      const start = performance.now();
      const update = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(ease * target);
        el.innerHTML = current.toLocaleString('uk') + supHtml;
        if (progress < 1) requestAnimationFrame(update);
      };
      requestAnimationFrame(update);
    }

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && !counted) {
          counted = true;
          statNums.forEach((el, i) => {
            const sup = el.querySelector('sup');
            const supHtml = sup ? `<sup>${sup.innerHTML}</sup>` : (suffixes[i] ? `<sup>${suffixes[i]}</sup>` : '');
            el.innerHTML = '0' + supHtml;
            setTimeout(() => animateCounter(el, targets[i], 1400 + i * 150, supHtml), i * 120);
          });
          counterObserver.disconnect();
        }
      });
    }, { threshold: 0.3 });

    const statsGrid = document.querySelector('.hero-stats-grid');
    if (statsGrid) counterObserver.observe(statsGrid);

    // ── FLOATING PARTICLES ──
    if (heroRef.current) {
      for (let i = 0; i < 18; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = Math.random() * 5 + 2;
        p.style.cssText = `
          width:${size}px; height:${size}px;
          left:${Math.random() * 100}%;
          bottom:${Math.random() * 30}%;
          animation-duration:${6 + Math.random() * 10}s;
          animation-delay:${Math.random() * 8}s;
          opacity:0;
        `;
        heroRef.current.appendChild(p);
      }
    }

    // ── STEP CONNECTOR DRAW ON SCROLL ──
    if (connectorRef.current) {
      const connectorObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            connectorRef.current?.classList.add('drawn');
            connectorObs.disconnect();
          }
        });
      }, { threshold: 0.5 });
      connectorObs.observe(connectorRef.current);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      revealObserver.disconnect();
      illoObs.disconnect();
      counterObserver.disconnect();
    };
  }, []);

  return (
    <div className="landing-body">
      {/* NAV */}
      <nav className={`landing-nav ${isScrolled ? 'scrolled' : ''}`}>
        <div className="nav-logo">IC<span>Tender</span></div>
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
              <Link href="/auth/register" className="btn-primary">Подати заявку</Link>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section className="hero" ref={heroRef}>
        <div className="hero-blob"></div>
        <div className="hero-blob2"></div>

        {/* Truck — fixed left background */}
        <div id="truck-wrap" style={{ position: 'fixed', left: '-6%', bottom: '2%', pointerEvents: 'none', zIndex: 1, opacity: 0.22, filter: 'blur(0.5px)' }}>
          <svg width="900" height="560" viewBox="0 0 680 420" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="faceH" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0d93e0" stopOpacity="0.07"/>
                <stop offset="100%" stopColor="#0d93e0" stopOpacity="0.03"/>
              </linearGradient>
              <linearGradient id="faceS" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0d93e0" stopOpacity="0.05"/>
                <stop offset="100%" stopColor="#0d93e0" stopOpacity="0.01"/>
              </linearGradient>
            </defs>

            {/* ═══ TRAILER ═══ */}
            <polygon points="60,100 340,100 380,68 100,68" fill="url(#faceH)" stroke="#0d93e0" strokeWidth="0.9"/>
            <polygon points="340,100 380,68 380,250 340,282" fill="url(#faceS)" stroke="#0d93e0" strokeWidth="0.9"/>
            <polygon points="60,100 340,100 340,282 60,282" fill="url(#faceH)" stroke="#0d93e0" strokeWidth="0.8"/>

            <line x1="130" y1="100" x2="130" y2="282" stroke="#0d93e0" strokeWidth="0.5" opacity=".5"/>
            <line x1="200" y1="100" x2="200" y2="282" stroke="#0d93e0" strokeWidth="0.5" opacity=".5"/>
            <line x1="270" y1="100" x2="270" y2="282" stroke="#0d93e0" strokeWidth="0.5" opacity=".5"/>
            <line x1="130" y1="100" x2="170" y2="68" stroke="#0d93e0" strokeWidth="0.5" opacity=".4"/>
            <line x1="200" y1="100" x2="240" y2="68" stroke="#0d93e0" strokeWidth="0.5" opacity=".4"/>
            <line x1="270" y1="100" x2="310" y2="68" stroke="#0d93e0" strokeWidth="0.5" opacity=".4"/>

            <line x1="60" y1="282" x2="340" y2="282" stroke="#0d93e0" strokeWidth="1"/>
            <line x1="340" y1="282" x2="380" y2="250" stroke="#0d93e0" strokeWidth="1"/>

            <ellipse cx="110" cy="300" rx="26" ry="10" stroke="#0d93e0" strokeWidth="1"/>
            <ellipse cx="110" cy="300" rx="16" ry="6" stroke="#0d93e0" strokeWidth="0.6" opacity=".5"/>
            <rect x="84" y="288" width="52" height="24" rx="0" fill="none" stroke="#0d93e0" strokeWidth="0.8" opacity=".3"/>
            <ellipse cx="200" cy="300" rx="26" ry="10" stroke="#0d93e0" strokeWidth="1"/>
            <ellipse cx="200" cy="300" rx="16" ry="6" stroke="#0d93e0" strokeWidth="0.6" opacity=".5"/>
            <rect x="174" y="288" width="52" height="24" rx="0" fill="none" stroke="#0d93e0" strokeWidth="0.8" opacity=".3"/>
            <line x1="84" y1="300" x2="226" y2="300" stroke="#0d93e0" strokeWidth="1.2" opacity=".6"/>

            {/* ═══ CABIN ═══ */}
            <polygon points="340,120 420,120 460,88 380,88" fill="url(#faceH)" stroke="#0d93e0" strokeWidth="0.9"/>
            <polygon points="420,120 460,88 460,240 420,272" fill="url(#faceS)" stroke="#0d93e0" strokeWidth="0.9"/>
            <polygon points="340,120 420,120 420,272 340,272" fill="url(#faceH)" stroke="#0d93e0" strokeWidth="0.9"/>

            <polygon points="424,92 456,92 456,168 424,168" fill="rgba(13,147,224,0.08)" stroke="#0d93e0" strokeWidth="0.8"/>
            <line x1="440" y1="92" x2="440" y2="168" stroke="#0d93e0" strokeWidth="0.5" opacity=".5"/>

            <polygon points="346,126 410,126 410,172 346,172" fill="rgba(13,147,224,0.06)" stroke="#0d93e0" strokeWidth="0.7"/>
            <line x1="378" y1="126" x2="378" y2="172" stroke="#0d93e0" strokeWidth="0.4" opacity=".4"/>

            <line x1="340" y1="185" x2="420" y2="185" stroke="#0d93e0" strokeWidth="0.7" opacity=".6"/>
            <line x1="380" y1="185" x2="380" y2="272" stroke="#0d93e0" strokeWidth="0.5" opacity=".4"/>
            <rect x="395" y="218" width="16" height="5" rx="2" stroke="#0d93e0" strokeWidth="0.8" fill="rgba(13,147,224,0.1)"/>

            <rect x="424" y="178" width="32" height="40" rx="2" stroke="#0d93e0" strokeWidth="0.7" opacity=".6"/>
            <line x1="424" y1="190" x2="456" y2="190" stroke="#0d93e0" strokeWidth="0.5" opacity=".4"/>
            <line x1="424" y1="202" x2="456" y2="202" stroke="#0d93e0" strokeWidth="0.5" opacity=".4"/>
            <line x1="424" y1="214" x2="456" y2="214" stroke="#0d93e0" strokeWidth="0.5" opacity=".4"/>
            <rect x="424" y="224" width="20" height="12" rx="3" stroke="#0d93e0" strokeWidth="0.8" fill="rgba(13,147,224,0.12)"/>
            <rect x="422" y="238" width="38" height="8" rx="2" stroke="#0d93e0" strokeWidth="0.8" opacity=".7"/>

            <rect x="412" y="56" width="7" height="36" rx="3.5" stroke="#0d93e0" strokeWidth="0.8"/>
            <ellipse cx="415" cy="56" rx="3.5" ry="2" stroke="#0d93e0" strokeWidth="0.7" opacity=".6"/>
            <circle cx="415" cy="48" r="2.5" stroke="#0d93e0" strokeWidth="0.6" opacity=".3"/>
            <circle cx="418" cy="40" r="3.5" stroke="#0d93e0" strokeWidth="0.5" opacity=".2"/>
            <circle cx="413" cy="31" r="4.5" stroke="#0d93e0" strokeWidth="0.5" opacity=".12"/>

            <ellipse cx="360" cy="288" rx="24" ry="9" stroke="#0d93e0" strokeWidth="1"/>
            <ellipse cx="360" cy="288" rx="14" ry="5" stroke="#0d93e0" strokeWidth="0.6" opacity=".5"/>
            <ellipse cx="430" cy="272" rx="24" ry="9" stroke="#0d93e0" strokeWidth="1"/>
            <ellipse cx="430" cy="272" rx="14" ry="5" stroke="#0d93e0" strokeWidth="0.6" opacity=".5"/>
            <line x1="336" y1="288" x2="454" y2="272" stroke="#0d93e0" strokeWidth="1.1" opacity=".5"/>

            <ellipse cx="260" cy="318" rx="220" ry="8" fill="rgba(13,147,224,0.06)"/>
            <line x1="20" y1="328" x2="620" y2="328" stroke="#0d93e0" strokeWidth="0.5" strokeDasharray="24 14" opacity=".2"/>

            <line x1="60" y1="355" x2="460" y2="355" stroke="#0d93e0" strokeWidth="0.5" opacity=".25" strokeDasharray="3 3"/>
            <line x1="60" y1="350" x2="60" y2="360" stroke="#0d93e0" strokeWidth="0.6" opacity=".3"/>
            <line x1="460" y1="350" x2="460" y2="360" stroke="#0d93e0" strokeWidth="0.6" opacity=".3"/>
          </svg>
        </div>

        {/* Globe — fixed right background, animated */}
        <div id="globe-wrap" style={{ position: 'fixed', right: '-5%', top: '50%', transform: 'translateY(-52%)', pointerEvents: 'none', zIndex: 1, opacity: 0.28 }}>
          <svg width="960" height="960" viewBox="0 0 620 620" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="310" cy="310" r="295" stroke="#0d93e0" strokeWidth="0.5" strokeDasharray="3 8" opacity=".35"/>
            <circle cx="310" cy="310" r="270" stroke="#0d93e0" strokeWidth="1.2" opacity=".9"/>

            <g className="grid-spin">
              <ellipse cx="310" cy="310" rx="80"  ry="270" stroke="#0d93e0" strokeWidth="0.6" opacity=".5"/>
              <ellipse cx="310" cy="310" rx="160" ry="270" stroke="#0d93e0" strokeWidth="0.6" opacity=".5"/>
              <ellipse cx="310" cy="310" rx="240" ry="270" stroke="#0d93e0" strokeWidth="0.5" opacity=".4"/>
              <line x1="310" y1="40" x2="310" y2="580" stroke="#0d93e0" strokeWidth="0.7" opacity=".5"/>
            </g>

            <g className="grid-spin2">
              <ellipse cx="310" cy="310" rx="270" ry="55"  stroke="#0d93e0" strokeWidth="0.6" opacity=".5"/>
              <ellipse cx="310" cy="310" rx="270" ry="125" stroke="#0d93e0" strokeWidth="0.6" opacity=".5"/>
              <ellipse cx="310" cy="310" rx="270" ry="200" stroke="#0d93e0" strokeWidth="0.6" opacity=".5"/>
              <ellipse cx="310" cy="310" rx="270" ry="256" stroke="#0d93e0" strokeWidth="0.4" opacity=".35"/>
              <line x1="40" y1="310" x2="580" y2="310" stroke="#0d93e0" strokeWidth="0.7" opacity=".5"/>
            </g>

            <path className="route-flow1" d="M370 210 Q410 255 420 310" stroke="#0d93e0" strokeWidth="1.8" strokeDasharray="6 4" fill="none"/>
            <path className="route-flow2" d="M230 280 Q290 260 370 210" stroke="#0d93e0" strokeWidth="1.8" strokeDasharray="6 4" fill="none"/>
            <path className="route-flow3" d="M200 370 Q275 380 350 390" stroke="#0d93e0" strokeWidth="1.6" strokeDasharray="5 5" fill="none"/>
            <path className="route-flow4" d="M350 390 Q370 425 380 460" stroke="#0d93e0" strokeWidth="1.4" strokeDasharray="5 5" fill="none"/>
            <path className="route-flow5" d="M420 310 Q435 385 380 460" stroke="#0d93e0" strokeWidth="1.4" strokeDasharray="5 5" fill="none"/>
            <path className="route-flow1" d="M270 200 Q320 205 370 210" stroke="#0d93e0" strokeWidth="1.2" strokeDasharray="4 6" fill="none"/>
            <path className="route-flow2" d="M160 310 Q195 340 200 370" stroke="#0d93e0" strokeWidth="1.2" strokeDasharray="4 6" fill="none"/>
            <path className="route-flow3" d="M450 250 Q435 280 420 310" stroke="#0d93e0" strokeWidth="1.2" strokeDasharray="4 6" fill="none"/>

            <circle className="ring1" cx="370" cy="210" fill="none" stroke="#0d93e0"/>
            <circle className="ring2" cx="200" cy="370" fill="none" stroke="#0d93e0"/>
            <circle className="ring3" cx="350" cy="390" fill="none" stroke="#0d93e0"/>

            <circle className="city-pulse1" cx="370" cy="210" fill="#0d93e0"/>
            <circle className="city-pulse2" cx="200" cy="370" fill="#0d93e0"/>
            <circle className="city-pulse3" cx="350" cy="390" fill="#0d93e0"/>

            <circle cx="230" cy="280" r="4" fill="#0d93e0" opacity=".8"/>
            <circle cx="420" cy="310" r="3.5" fill="#0d93e0" opacity=".8"/>
            <circle cx="270" cy="200" r="3" fill="#0d93e0" opacity=".7"/>
            <circle cx="450" cy="250" r="3" fill="#0d93e0" opacity=".7"/>
            <circle cx="160" cy="310" r="2.5" fill="#0d93e0" opacity=".6"/>
            <circle cx="380" cy="460" r="3.5" fill="#0d93e0" opacity=".8"/>
          </svg>
        </div>

        <div style={{ position: 'relative', zIndex: 10, maxWidth: '640px' }}>
          <div className="hero-eyebrow fade-up" style={{ justifyContent: 'flex-start' }}>
            <div className="hero-eyebrow-line"></div>
            <span className="hero-eyebrow-text">Тендери від <span style={{ color: 'var(--sky-600)', fontWeight: 600 }}>ICT</span> · Тільки для перевізників</span>
          </div>

          <h1 className="fade-up fade-up-delay-1" style={{ fontSize: 'clamp(36px,4.6vw,66px)', textAlign: 'left', margin: '0 0 22px' }}>
            Замовлення ICT —<br/>відкриті для<br/>ваших <em>ставок.</em>
          </h1>

          <p className="hero-sub fade-up fade-up-delay-2" style={{ margin: '0 0 32px', maxWidth: '480px' }}>
            <span style={{ color: 'var(--navy)', fontWeight: 600 }}>IC</span><span style={{ color: 'var(--accent)', fontWeight: 600 }}>Tender</span> — закрита платформа компанії ICT. Всі вантажні замовлення виставляються у відкритий тендер. Ви робите ставку — ми обираємо найкращу пропозицію.
          </p>

          <div className="hero-actions fade-up fade-up-delay-3">
            {profile ? (
                <Link href="/dashboard" className="btn-large">Перейти до кабінету</Link>
            ) : (
                <Link href="/auth/register" className="btn-large">Подати заявку на доступ</Link>
            )}
            <Link href="/auth/login" className="btn-outline">Переглянути активні тендери</Link>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 10, width: '100%', marginTop: '52px' }}>
          <div className="hero-stats-grid fade-up fade-up-delay-4">
            <div className="hstat">
              <div className="hstat-bar"></div>
              <div className="hstat-num">68</div>
              <div className="hstat-label">Активних тендерів</div>
              <div className="hstat-sub">замовлень ICT зараз</div>
            </div>
            <div className="hstat">
              <div className="hstat-bar"></div>
              <div className="hstat-num">2 130</div>
              <div className="hstat-label">Тендерів всього</div>
              <div className="hstat-sub">за весь час роботи</div>
            </div>
            <div className="hstat">
              <div className="hstat-bar"></div>
              <div className="hstat-num">200<sup>+</sup></div>
              <div className="hstat-label">Компаній-партнерів</div>
              <div className="hstat-sub">верифікованих перевізників</div>
            </div>
            <div className="hstat">
              <div className="hstat-bar"></div>
              <div className="hstat-num">600<sup>+</sup></div>
              <div className="hstat-label">Користувачів</div>
              <div className="hstat-sub">диспетчерів і менеджерів</div>
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
      <section className="features" id="features">
        <div className="bg-illo float" style={{ right: '-60px', bottom: '-40px' }}>
          <svg width="680" height="480" viewBox="0 0 500 360" fill="none" stroke="#0d93e0" strokeWidth="1">
            <polygon className="draw-path" points="50,180 250,60 450,180" strokeWidth="1.2" strokeDasharray="600"/>
            <rect className="draw-path" x="50" y="180" width="400" height="160" strokeDasharray="600"/>
            <line className="draw-path" x1="250" y1="60" x2="250" y2="340" strokeDasharray="600"/>
            <rect className="pop-in pop-in-d1" x="80" y="210" width="60" height="50" rx="2"/>
            <rect className="pop-in pop-in-d1" x="360" y="210" width="60" height="50" rx="2"/>
            <line className="pop-in pop-in-d1" x1="110" y1="210" x2="110" y2="260"/>
            <line className="pop-in pop-in-d1" x1="80" y1="235" x2="140" y2="235"/>
            <line className="pop-in pop-in-d1" x1="390" y1="210" x2="390" y2="260"/>
            <line className="pop-in pop-in-d1" x1="360" y1="235" x2="420" y2="235"/>
            <rect className="pop-in pop-in-d2" x="180" y="220" width="140" height="120" rx="2"/>
            <line className="pop-in pop-in-d2" x1="250" y1="220" x2="250" y2="340"/>
            <line className="pop-in pop-in-d2" x1="180" y1="280" x2="320" y2="280"/>
            <rect className="pop-in pop-in-d2" x="200" y="300" width="100" height="20"/>
            <rect className="pop-in pop-in-d3" x="90" y="290" width="50" height="30" rx="2"/>
            <rect className="pop-in pop-in-d3" x="105" y="260" width="6" height="32"/>
            <rect className="pop-in pop-in-d3" x="98" y="258" width="20" height="4"/>
            <circle className="pop-in pop-in-d3" cx="98" cy="324" r="8"/>
            <circle className="pop-in pop-in-d3" cx="132" cy="324" r="8"/>
            <rect className="pop-in pop-in-d3" x="360" y="288" width="36" height="28" rx="2"/>
            <rect className="pop-in pop-in-d3" x="366" y="262" width="28" height="28" rx="2"/>
            <rect className="pop-in pop-in-d3" x="370" y="240" width="22" height="24" rx="2"/>
            <line className="dash-flow" x1="20" y1="340" x2="480" y2="340" strokeDasharray="16 8" opacity=".4"/>
          </svg>
        </div>
        <div className="section-header reveal">
          <div className="tag"><span>Можливості платформи ·</span> <span style={{ whiteSpace: 'nowrap', textTransform: 'none' }}><span style={{ color: 'var(--navy)', fontWeight: 600 }}>IC</span><span style={{ color: 'var(--accent)', fontWeight: 500 }}>Tender</span></span></div>
          <h2 style={{ marginTop: '14px' }}>Все необхідне, щоб отримати<br/>замовлення — в <em>одному сервісі</em></h2>
        </div>
        <div className="features-layout">
          <div className="feature-card reveal" style={{ transitionDelay: '0.05s' }}>
            <div className="feature-icon" style={{ width: '72px', height: '72px', borderRadius: '18px', marginBottom: '24px' }}>
              <svg width="38" height="38" viewBox="0 0 30 30" fill="none" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="3" width="22" height="26" rx="3.5"/>
                <path d="M9 10h12M9 15h8M9 20h5"/>
                <circle cx="22" cy="22" r="5" fill="var(--sky-100)" stroke="var(--accent)" strokeWidth="1.6"/>
                <path d="M20.5 22l1 1 2-2"/>
              </svg>
            </div>
            <h3>Тендери на перевезення</h3>
            <p className="feature-desc">ICT публікує всі свої вантажні замовлення у відкритий тендер. Умови прозорі, можливості у всіх однакові — перемагає найкраща пропозиція.</p>
            <ul className="feature-list">
              <li>Актуальні замовлення ICT щодня</li>
              <li>Повна інформація про маршрут, вантаж і терміни</li>
              <li>Ставка в кілька кліків — без дзвінків і листів</li>
              <li>Автоматичне визначення переможця</li>
            </ul>
          </div>

          <div className="feature-card reveal" style={{ transitionDelay: '0.15s' }}>
            <div className="feature-icon" style={{ width: '72px', height: '72px', borderRadius: '18px', marginBottom: '24px' }}>
              <svg width="38" height="38" viewBox="0 0 30 30" fill="none" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="24" height="24" rx="4"/>
                <path d="M3 11h24"/>
                <path d="M10 3v8"/>
                <path d="M20 3v8"/>
                <rect x="7" y="16" width="5" height="4" rx="1" fill="var(--sky-200)" stroke="none"/>
                <rect x="13" y="14" width="5" height="6" rx="1" fill="var(--sky-300)" stroke="none" opacity=".7"/>
                <rect x="19" y="17" width="5" height="3" rx="1" fill="var(--sky-200)" stroke="none"/>
                <path d="M7 20h17" stroke="var(--accent)" strokeWidth="1.2" opacity=".4"/>
              </svg>
            </div>
            <h3>Особистий кабінет перевізника</h3>
            <p className="feature-desc">Вся ваша співпраця з ICT в одному місці: активні тендери, виконані рейси, аналітика ставок, графіки оплат та комплектність документів по кожному рейсу.</p>
            <ul className="feature-list">
              <li>Історія виграних тендерів і виконаних рейсів</li>
              <li>Графік оплат і статус розрахунків від ICT</li>
              <li>Комплектність документів по кожному замовленню</li>
              <li>Ваш рейтинг надійності та відгуки від ICT</li>
            </ul>
          </div>

          <div className="feature-card-large reveal" style={{ transitionDelay: '0.25s' }}>
            <div>
              <h3 style={{ fontFamily: '"Syne", sans-serif', fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '12px' }}>Аналітика для розумніших ставок</h3>
              <p className="feature-desc" style={{ marginBottom: '22px' }}>Розумійте, як ви виглядаєте на фоні інших перевізників ICT. Бачте динаміку ставок, свій win rate і де є найбільше шансів на перемогу.</p>
              <ul className="feature-list">
                <li>Ваша ставка vs конкуренти по кожному напрямку</li>
                <li>Кількість тендерів за обраний період</li>
                <li>Прогноз оптимальної ставки для перемоги</li>
                <li>Сезонна активність і завантаженість напрямків</li>
              </ul>
            </div>
            <div className="feature-metrics">
              <div className="metric-cell">
                <div className="metric-cell-val">−8<span className="acc">%</span></div>
                <div className="metric-cell-label">Ваша ставка нижче<br/>середньої конкурентів</div>
              </div>
              <div className="metric-cell">
                <div className="metric-cell-val">312<span className="acc" style={{ fontSize: '16px' }}> шт</span></div>
                <div className="metric-cell-label">Тендерів за квартал<br/>по вашому напрямку</div>
              </div>
              <div className="metric-cell">
                <div className="metric-cell-val">40<span className="acc">%</span></div>
                <div className="metric-cell-label">Ваш win rate<br/>за останній місяць</div>
              </div>
              <div className="metric-cell">
                <div className="metric-cell-val">↑14<span className="acc">%</span></div>
                <div className="metric-cell-label">Зростання к-ті тендерів<br/>у квітні</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="why" id="why">
        <div className="bg-illo sway" style={{ left: '-40px', top: '50%', transform: 'translateY(-50%)' }}>
          <svg width="560" height="560" viewBox="0 0 420 420" fill="none" stroke="#0d93e0" strokeWidth="1">
            <circle className="draw-path" cx="120" cy="90" r="30" strokeDasharray="600"/>
            <path className="draw-path" d="M60 200 Q60 150 120 150 Q180 150 180 200 L180 280 L60 280 Z" strokeDasharray="600"/>
            <line className="draw-path" x1="60" y1="210" x2="20" y2="270" strokeDasharray="600"/>
            <line className="draw-path" x1="180" y1="210" x2="220" y2="270" strokeDasharray="600"/>
            <line className="draw-path" x1="80" y1="280" x2="80" y2="360" strokeDasharray="600"/>
            <line className="draw-path" x1="160" y1="280" x2="160" y2="360" strokeDasharray="600"/>
            <circle className="draw-path" cx="300" cy="90" r="30" strokeDasharray="600"/>
            <path className="draw-path" d="M240 200 Q240 150 300 150 Q360 150 360 200 L360 280 L240 280 Z" strokeDasharray="600"/>
            <line className="draw-path" x1="240" y1="210" x2="200" y2="270" strokeDasharray="600"/>
            <line className="draw-path" x1="360" y1="210" x2="400" y2="270" strokeDasharray="600"/>
            <line className="draw-path" x1="260" y1="280" x2="260" y2="360" strokeDasharray="600"/>
            <line className="draw-path" x1="340" y1="280" x2="340" y2="360" strokeDasharray="600"/>
            <path className="pop-in pop-in-d2" d="M180 215 Q210 230 240 215" strokeWidth="2" strokeLinecap="round"/>
            <rect className="pop-in pop-in-d1" x="148" y="170" width="50" height="62" rx="3" strokeDasharray="3 2"/>
            <line className="pop-in pop-in-d1" x1="155" y1="185" x2="190" y2="185" strokeWidth="0.6"/>
            <line className="pop-in pop-in-d1" x1="155" y1="196" x2="185" y2="196" strokeWidth="0.6"/>
            <line className="pop-in pop-in-d1" x1="155" y1="207" x2="180" y2="207" strokeWidth="0.6"/>
            <text className="pop-in pop-in-d3" x="170" y="140" fontSize="18" fill="none" stroke="#0d93e0" strokeWidth="0.8">★★★</text>
          </svg>
        </div>
        <div className="section-header reveal">
          <div className="tag">Чому варто працювати з <span style={{ whiteSpace: 'nowrap', textTransform: 'none' }}><span style={{ color: 'var(--navy)', fontWeight: 600 }}>IC</span><span style={{ color: 'var(--accent)', fontWeight: 500 }}>Tender</span></span></div>
          <h2 style={{ marginTop: '16px' }}>Прозорий партнер —<br/><em>стабільна</em> співпраця</h2>
        </div>
        <div className="why-grid">
          <div className="why-card reveal" style={{ transitionDelay: '0.05s' }}>
            <div className="why-num">01</div>
            <div className="why-title">Стабільний потік замовлень</div>
            <p className="why-desc">ICT — діюча експедиторська компанія зі стабільним потоком замовлень. Ви отримуєте доступ до всього нашого портфелю маршрутів через одну платформу.</p>
          </div>
          <div className="why-card reveal" style={{ transitionDelay: '0.12s' }}>
            <div className="why-num">02</div>
            <div className="why-title">Рівні можливості для всіх</div>
            <p className="why-desc">Жодних "своїх" перевізників. Кожен тендер відкритий однаково для всіх — перемагає та пропозиція, яка найкраще відповідає умовам ICT.</p>
          </div>
          <div className="why-card reveal" style={{ transitionDelay: '0.19s' }}>
            <div className="why-num">03</div>
            <div className="why-title">Повна прозорість умов</div>
            <p className="why-desc">Кожен тендер містить вичерпну інформацію: маршрут, тип вантажу, терміни, вимоги до транспорту. Ніяких сюрпризів після перемоги.</p>
          </div>
          <div className="why-card reveal" style={{ transitionDelay: '0.26s' }}>
            <div className="why-num">04</div>
            <div className="why-title">Верифіковане середовище</div>
            <p className="why-desc">Доступ отримують лише перевірені перевізники. Ручна перевірка документів командою ICT — гарантія якісного та безпечного середовища для всіх учасників.</p>
          </div>
          <div className="why-card reveal" style={{ transitionDelay: '0.33s' }}>
            <div className="why-num">05</div>
            <div className="why-title">Захист даних і повна історія</div>
            <p className="why-desc">Ваші ставки, рейси та розрахунки зберігаються в захищеному середовищі. Кожна дія фіксується з часовою міткою — прозорість для вас і для ICT.</p>
          </div>
          <div className="why-card reveal" style={{ transitionDelay: '0.4s' }}>
            <div className="why-num">06</div>
            <div className="why-title">Репутація, яка відкриває двері</div>
            <p className="why-desc">Ваш рейтинг у ICTender — ваша візитка перед ICT. Висока вчасність і якість роботи підвищують пріоритет у нових тендерах і зміцнюють партнерство.</p>
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section className="steps" id="steps">
        <div className="bg-illo scalep" style={{ right: '-30px', top: '50%', transform: 'translateY(-50%)' }}>
          <svg width="520" height="580" viewBox="0 0 380 440" fill="none" stroke="#0d93e0" strokeWidth="1">
            <polygon className="draw-path" points="60,160 190,100 320,160 320,300 190,360 60,300" strokeWidth="1.2" strokeDasharray="600"/>
            <line className="draw-path" x1="190" y1="100" x2="190" y2="360" strokeDasharray="600"/>
            <line className="draw-path" x1="60" y1="160" x2="320" y2="160" strokeDasharray="600"/>
            <line className="pop-in pop-in-d1" x1="90" y1="165" x2="190" y2="220" strokeWidth="0.8" strokeDasharray="4 3"/>
            <line className="pop-in pop-in-d1" x1="290" y1="165" x2="190" y2="220" strokeWidth="0.8" strokeDasharray="4 3"/>
            <rect className="pop-in pop-in-d2" x="75" y="185" width="90" height="58" rx="3"/>
            <line className="pop-in pop-in-d2" x1="83" y1="198" x2="155" y2="198" strokeWidth="0.6"/>
            <line className="pop-in pop-in-d2" x1="83" y1="210" x2="148" y2="210" strokeWidth="0.6"/>
            <line className="pop-in pop-in-d2" x1="83" y1="222" x2="140" y2="222" strokeWidth="0.6"/>
            <polygon className="pop-in pop-in-d1" points="220,80 300,50 340,80 340,130 220,130" strokeWidth="0.8"/>
            <line className="pop-in pop-in-d1" x1="300" y1="50" x2="300" y2="130"/>
            <line className="pop-in pop-in-d1" x1="220" y1="80" x2="340" y2="80"/>
            <line className="pop-in pop-in-d2" x1="230" y1="90" x2="230" y2="120" strokeWidth="1.5"/>
            <line className="pop-in pop-in-d2" x1="236" y1="90" x2="236" y2="120" strokeWidth="0.6"/>
            <line className="pop-in pop-in-d2" x1="241" y1="90" x2="241" y2="120" strokeWidth="1.2"/>
            <line className="pop-in pop-in-d2" x1="246" y1="90" x2="246" y2="120" strokeWidth="0.7"/>
            <line className="pop-in pop-in-d2" x1="251" y1="90" x2="251" y2="120" strokeWidth="1.4"/>
            <circle className="pop-in pop-in-d3" cx="190" cy="40" r="16"/>
            <circle className="pop-in pop-in-d3" cx="190" cy="36" r="7" fill="rgba(13,147,224,0.12)"/>
            <line className="pop-in pop-in-d3" x1="190" y1="56" x2="190" y2="72" strokeWidth="1.2"/>
            <circle cx="50" cy="380" r="5" fill="rgba(13,147,224,0.2)"/>
            <circle cx="200" cy="390" r="5" fill="rgba(13,147,224,0.2)"/>
            <circle cx="310" cy="400" r="4"/>
            <path className="dash-flow" d="M50 380 Q120 360 200 390 Q270 415 310 400" strokeDasharray="5 4" strokeWidth="1"/>
          </svg>
        </div>
        <div className="section-header reveal">
          <div className="tag">Як почати</div>
          <h2 style={{ marginTop: '16px' }}>Від заявки до<br/>першої ставки — <em>4 кроки</em></h2>
        </div>
        <div className="steps-row">
          <div className="steps-connector" ref={connectorRef}></div>
          <div className="step-item">
            <div className="step-num-wrap"><div className="step-num">1</div></div>
            <div className="step-title">Подайте заявку</div>
            <p className="step-desc">Заповніть коротку форму з інформацією про вашу транспортну компанію і натисніть «Подати заявку».</p>
          </div>
          <div className="step-item">
            <div className="step-num-wrap"><div className="step-num">2</div></div>
            <div className="step-title">Перевірка ICT</div>
            <p className="step-desc">Менеджер ICT перевіряє вашу компанію і документи. Зазвичай це займає до одного робочого дня.</p>
          </div>
          <div className="step-item">
            <div className="step-num-wrap"><div className="step-num">3</div></div>
            <div className="step-title">Доступ підтверджено</div>
            <p className="step-desc">Отримуєте лист із підтвердженням і доступом до платформи. Ви стаєте верифікованим партнером ICT.</p>
          </div>
          <div className="step-item">
            <div className="step-num-wrap"><div className="step-num">4</div></div>
            <div className="step-title">Беріть участь у тендерах</div>
            <p className="step-desc">Переглядайте актуальні замовлення ICT, робіть ставки, виграйте рейси та відстежуйте свою статистику в кабінеті.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="bg-illo float" style={{ left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }}>
          <svg width="900" height="500" viewBox="0 0 700 380" fill="none" stroke="#0d93e0" strokeWidth="0.8">
            <path className="draw-path" d="M80,180 Q100,120 160,100 Q220,80 280,90 Q340,100 380,80 Q440,60 500,90 Q560,120 580,160 Q600,200 570,240 Q540,280 480,290 Q420,300 360,280 Q300,260 240,270 Q180,280 140,260 Q100,240 80,200 Z" strokeWidth="1" strokeDasharray="800"/>
            <path className="draw-path" d="M200,140 Q240,120 280,130 Q320,140 300,180 Q280,220 240,210 Q200,200 190,170 Z" strokeWidth="0.7" strokeDasharray="600" opacity=".6"/>
            <path className="draw-path" d="M380,110 Q420,100 460,120 Q500,140 490,180 Q480,220 440,215 Q400,210 385,175 Z" strokeWidth="0.7" strokeDasharray="600" opacity=".6"/>
            <circle className="pop-in" cx="210" cy="160" r="6" fill="rgba(13,147,224,0.15)"/>
            <circle className="pop-in pop-in-d1" cx="330" cy="150" r="5" fill="rgba(13,147,224,0.15)"/>
            <circle className="pop-in pop-in-d1" cx="450" cy="155" r="6" fill="rgba(13,147,224,0.15)"/>
            <circle className="pop-in pop-in-d2" cx="280" cy="220" r="4" fill="rgba(13,147,224,0.15)"/>
            <circle className="pop-in pop-in-d2" cx="400" cy="230" r="4" fill="rgba(13,147,224,0.15)"/>
            <circle className="pop-in pop-in-d3" cx="160" cy="200" r="4" fill="rgba(13,147,224,0.15)"/>
            <circle className="pop-in pop-in-d3" cx="520" cy="190" r="4" fill="rgba(13,147,224,0.15)"/>
            <circle className="pop-in" cx="210" cy="160" r="14" strokeWidth="0.6" opacity=".4"/>
            <circle className="pop-in pop-in-d1" cx="450" cy="155" r="14" strokeWidth="0.6" opacity=".4"/>
            <path className="dash-flow" d="M210 160 Q270 130 330 150" strokeDasharray="5 4" strokeWidth="1.2"/>
            <path className="dash-flow" d="M330 150 Q390 130 450 155" strokeDasharray="5 4" strokeWidth="1.2"/>
            <path className="dash-flow" d="M210 160 Q245 190 280 220" strokeDasharray="4 5" strokeWidth="1"/>
            <path className="dash-flow" d="M330 150 Q365 190 400 230" strokeDasharray="4 5" strokeWidth="1"/>
            <path className="dash-flow" d="M450 155 Q485 172 520 190" strokeDasharray="4 5" strokeWidth="1"/>
            <path className="dash-flow" d="M160 200 Q185 210 210 160" strokeDasharray="3 5" strokeWidth="0.8" opacity=".7"/>
          </svg>
        </div>
        <div className="tag" style={{ marginBottom: '22px' }}>Стати партнером ICT</div>
        <h2>Готові отримувати<br/><em>замовлення від ICT?</em></h2>
        <p>Подайте заявку сьогодні — і вже завтра ваша компанія зможе брати участь у тендерах.</p>
        <div className="cta-actions">
           {profile ? (
                <Link href="/dashboard" className="btn-large">Перейти до кабінету</Link>
            ) : (
                <Link href="/auth/register" className="btn-large">Подати заявку на доступ</Link>
            )}
            <Link href="/auth/login" className="btn-outline">Переглянути активні тендери</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer" id="contact">
        <div className="footer-grid">
          <div>
            <div className="footer-logo">IC<span>Tender</span></div>
            <p className="footer-tagline">Закрита тендерна платформа компанії ICT для верифікованих перевізників-партнерів.</p>
          </div>
          <div className="footer-col">
            <h4>Навігація</h4>
            <ul>
              <li><a href="#">Про нас</a></li>
              <li><a href="#">Послуги</a></li>
              <li><a href="#">Блог</a></li>
              <li><a href="#">Контакти</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Контакти</h4>
            <ul>
              <li><a href="tel:+380503703781">+380 50 370 37 81</a></li>
              <li><a href="mailto:info@ict.lviv.ua">info@ict.lviv.ua</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Адреса</h4>
            <ul>
              <li><a href="#">79026, м. Львів</a></li>
              <li><a href="#">вул. Володимира Великого, 29</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">© 2026 ICTender · Всі права захищені</div>
          <div className="footer-note">ICT Lviv</div>
        </div>
      </footer>
    </div>
  );
}
