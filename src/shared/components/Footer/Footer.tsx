"use client";

import React from "react";
import Link from "next/link";
import Logo from "@/shared/components/Logo/Logo";
import { Facebook, Instagram, Linkedin, Mail, Phone } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="relative w-full border-t border-white/10 bg-[#020617] py-12 overflow-hidden">
      {/* М'яке світіння на фоні */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-teal-500/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Колонка 1: Лого та опис */}
          <div className="col-span-1 md:col-span-1 flex flex-col items-start gap-4">
            <Logo width={120} height={40} />
            <p className="text-slate-400 text-sm leading-relaxed mt-2">
              Перша інтелектуальна екосистема для логістики в Україні. Автоматизуємо тендери, облік та управління автопарком.
            </p>
            <div className="flex gap-4 mt-2">
              <Link href="#" className="text-slate-400 hover:text-teal-400 transition-colors">
                <Linkedin size={20} />
              </Link>
              <Link href="#" className="text-slate-400 hover:text-teal-400 transition-colors">
                <Facebook size={20} />
              </Link>
              <Link href="#" className="text-slate-400 hover:text-teal-400 transition-colors">
                <Instagram size={20} />
              </Link>
            </div>
          </div>

          {/* Колонка 2: Платформа */}
          <div>
            <h4 className="text-white font-bold mb-6 italic">Платформа</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              {/* <li><Link href="#features" className="hover:text-white transition-colors">Тендери</Link></li> */}
              <li><Link href="#features" className="hover:text-white transition-colors">Облік транспорту</Link></li>
              <li><Link href="#features" className="hover:text-white transition-colors">AI-аналітика</Link></li>
              <li><Link href="#features" className="hover:text-white transition-colors">Документообіг</Link></li>
            </ul>
          </div>

          {/* Колонка 3: Компанія */}
          {/* <div>
            <h4 className="text-white font-bold mb-6 italic">Компанія</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><Link href="#about" className="hover:text-white transition-colors">Про нас</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Тарифи</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Умови використання</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Конфіденційність</Link></li>
            </ul>
          </div> */}

          {/* Колонка 4: Контакти */}
          <div>
            <h4 className="text-white font-bold mb-6 italic">Зв’язок</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-teal-400" />
                <span>support@istender.com</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-teal-400" />
                <span>+380 50 123 45 67</span>
              </li>
              <li className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs text-slate-500 italic">Служба підтримки працює 24/7 для всіх активних перевізників.</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Нижня частина */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-xs">
            © {new Date().getFullYear()} ISTender. Всі права захищені. 
            <span className="ml-2 text-slate-700">| Розроблено для майбутнього логістики.</span>
          </p>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">System Status: Online</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;