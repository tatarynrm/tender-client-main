"use client";

import { useEffect, useState } from "react";
import { Info } from "lucide-react";

/**
 * Маленька іконка-підказка біля поля. При наведенні показує motion-анімацію:
 * по черзі «набирає» приклади зі списку (друкарська машинка), щоб користувач
 * бачив, що і як можна вводити (частково або повністю).
 */
export function FilterHint({
  examples,
  title = "Як вводити",
  note,
}: {
  examples: string[];
  title?: string;
  note?: string;
}) {
  const [open, setOpen] = useState(false);
  const [wordIdx, setWordIdx] = useState(0);
  const [len, setLen] = useState(0);

  useEffect(() => {
    if (!open) {
      setWordIdx(0);
      setLen(0);
      return;
    }
    const current = examples[wordIdx] ?? "";
    if (len < current.length) {
      const id = setTimeout(() => setLen((l) => l + 1), 200);
      return () => clearTimeout(id);
    }
    // Слово набране — пауза, тоді наступне (по колу).
    const id = setTimeout(() => {
      setWordIdx((i) => (i + 1) % examples.length);
      setLen(0);
    }, 1000);
    return () => clearTimeout(id);
  }, [open, len, wordIdx, examples]);

  const current = examples[wordIdx] ?? "";

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Info className="w-3.5 h-3.5 text-[#8BA6EB] hover:text-[#3B52B4] cursor-help transition-colors" />

      {open && (
        <div className="absolute left-1/2 top-full z-50 mt-2 w-56 -translate-x-1/2 rounded-xl border border-blue-100 bg-white p-3 shadow-xl">
          <div className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-blue-100 bg-white" />

          <div className="mb-1.5 text-[11px] font-semibold text-[#415A88]">{title}</div>

          {/* Motion graphic — набір прикладу */}
          <div className="flex h-8 items-center rounded-lg bg-[#F7F9FF] px-2.5 font-mono text-sm tracking-wide text-[#3B52B4]">
            <span>{current.slice(0, len)}</span>
            <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-[#3B52B4]" />
          </div>

          <div className="mt-2 text-[11px] leading-relaxed text-gray-500">
            {note ? (
              note
            ) : (
              <>
                Приклади:{" "}
                {examples.map((s, i) => (
                  <span key={s}>
                    <b className="text-[#3B52B4]">{s}</b>
                    {i < examples.length - 1 ? ", " : ""}
                  </span>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </span>
  );
}
