import React, { PropsWithChildren, ReactNode } from "react";
import Link from "next/link";

interface LegalLayoutProps {
  title: string;
  subtitle: string;
  effectiveDate: string;
  other: { href: string; label: string };
}

/**
 * Публічний каркас юридичних сторінок (/terms, /privacy). Поза гейтами
 * dashboard/log/admin — доступний без авторизації.
 */
export const LegalLayout = ({
  title,
  subtitle,
  effectiveDate,
  other,
  children,
}: PropsWithChildren<LegalLayoutProps>) => {
  return (
    <div className="min-h-screen bg-[#f7f9ff] text-slate-800">
      {/* Верхня панель */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <Link href="/" className="font-bold tracking-tight text-[#0a2540]">
            IC<span className="text-[#4256D5]">Tender</span>
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-[#4256D5] hover:underline"
          >
            На головну
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 pb-24 pt-12">
        {/* Заголовок */}
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#4256D5]">
          Юридична інформація
        </p>
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-[#0a2540] md:text-4xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-500">
          {subtitle}
        </p>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500">
          Чинна редакція: {effectiveDate}
        </div>

        {/* Тіло документа */}
        <article className="mt-12 space-y-10">{children}</article>

        {/* Низ: перехресні посилання */}
        <div className="mt-16 rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">
            Див. також{" "}
            <Link
              href={other.href}
              className="font-semibold text-[#4256D5] hover:underline"
            >
              {other.label}
            </Link>
            . Питання щодо документів —{" "}
            <a
              href="mailto:tender.support@ict.lviv.ua"
              className="font-semibold text-[#4256D5] hover:underline"
            >
              tender.support@ict.lviv.ua
            </a>
            .
          </p>
        </div>
      </main>
    </div>
  );
};

/** Секція документа з номером і заголовком. */
export const LSection = ({
  id,
  n,
  title,
  children,
}: PropsWithChildren<{ id?: string; n: string; title: string }>) => (
  <section id={id} className="scroll-mt-24">
    <h2 className="mb-3 flex items-baseline gap-3 text-xl font-bold tracking-tight text-[#0a2540] md:text-[22px]">
      <span className="font-mono text-sm text-[#4256D5]">{n}</span>
      <span>{title}</span>
    </h2>
    <div className="space-y-3 text-[15px] leading-relaxed text-slate-600">
      {children}
    </div>
  </section>
);

/** Марковений список у стилі документа. */
export const LList = ({ items }: { items: ReactNode[] }) => (
  <ul className="list-disc space-y-1.5 pl-5 marker:text-[#4256D5]">
    {items.map((item, idx) => (
      <li key={idx}>{item}</li>
    ))}
  </ul>
);
