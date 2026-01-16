// import { Button } from "@/shared/components/ui/button";

// interface PaginationProps {
//   page: number;
//   pageCount: number;
//   onChange: (page: number) => void;
//   maxVisible?: number; // максимальна кількість видимих кнопок
// }

// export function Pagination({
//   page,
//   pageCount,
//   onChange,
//   maxVisible = 7, // за замовчуванням
// }: PaginationProps) {
//   if (pageCount <= 1) return null;

//   // обчислюємо діапазон сторінок для відображення
//   const getPageNumbers = () => {
//     const pages: (number | string)[] = [];
//     const half = Math.floor(maxVisible / 2);

//     let start = Math.max(1, page - half);
//     let end = Math.min(pageCount, page + half);

//     // коригуємо якщо на початку або в кінці
//     if (page <= half) end = Math.min(pageCount, maxVisible);
//     if (page + half > pageCount)
//       start = Math.max(1, pageCount - maxVisible + 1);

//     for (let i = start; i <= end; i++) {
//       pages.push(i);
//     }

//     // додаємо "..." якщо пропущені сторінки
//     if (start > 2) pages.unshift("...");
//     if (start > 1) pages.unshift(1);

//     if (end < pageCount - 1) pages.push("...");
//     if (end < pageCount) pages.push(pageCount);

//     return pages;
//   };

//   const pages = getPageNumbers();

//   return (
//     <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
//       <Button
//         variant="outline"
//         disabled={page === 1}
//         onClick={() => onChange(1)}
//       >
//         {"<<"}
//       </Button>
//       <Button
//         variant="outline"
//         disabled={page === 1}
//         onClick={() => onChange(page - 1)}
//       >
//         Назад
//       </Button>

//       {pages.map((p, index) =>
//         typeof p === "number" ? (
//           <Button
//             key={index}
//             variant={p === page ? "default" : "outline"}
//             onClick={() => onChange(p)}
//           >
//             {p}
//           </Button>
//         ) : (
//           <span key={index} className="px-2">
//             {p}
//           </span>
//         )
//       )}

//       <Button
//         variant="outline"
//         disabled={page === pageCount}
//         onClick={() => onChange(page + 1)}
//       >
//         Вперед
//       </Button>
//       <Button
//         variant="outline"
//         disabled={page === pageCount}
//         onClick={() => onChange(pageCount)}
//       >
//         {">>"}
//       </Button>
//     </div>
//   );
// }

"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/utils";

interface PaginationProps {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  maxVisible?: number;
}

export function Pagination({
  page,
  pageCount,
  onChange,
  maxVisible = 5, // трохи зменшив кількість для компактності
}: PaginationProps) {
  if (pageCount <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const half = Math.floor(maxVisible / 2);

    let start = Math.max(1, page - half);
    let end = Math.min(pageCount, page + half);

    if (page <= half) end = Math.min(pageCount, maxVisible);
    if (page + half > pageCount)
      start = Math.max(1, pageCount - maxVisible + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (start > 2) pages.unshift("...");
    if (start > 1) pages.unshift(1);
    if (end < pageCount - 1) pages.push("...");
    if (end < pageCount) pages.push(pageCount);

    return pages;
  };

  const pages = getPageNumbers();

  // Допоміжний компонент для однакових стрілок
  const NavButton = ({ children, onClick, disabled }: any) => (
    <Button
      variant="outline"
      size="icon"
      className="h-8 w-8 text-zinc-500 border-zinc-200"
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </Button>
  );

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      {/* Перша сторінка */}
      <NavButton onClick={() => onChange(1)} disabled={page === 1}>
        <ChevronsLeft size={14} />
      </NavButton>

      {/* Назад */}
      <NavButton onClick={() => onChange(page - 1)} disabled={page === 1}>
        <ChevronLeft size={14} />
      </NavButton>

      {/* Цифри */}
      <div className="flex items-center gap-1 mx-1">
        {pages.map((p, index) =>
          typeof p === "number" ? (
            <Button
              key={index}
              variant={p === page ? "default" : "outline"}
              className={cn(
                "h-8 w-8 text-xs font-semibold px-0 transition-all",
                p === page
                  ? "bg-orange-500 hover:bg-orange-600 border-orange-500 shadow-sm"
                  : "text-zinc-600 border-zinc-200 hover:bg-zinc-50"
              )}
              onClick={() => onChange(p)}
            >
              {p}
            </Button>
          ) : (
            <span
              key={index}
              className="w-6 text-center text-zinc-400 text-xs font-bold"
            >
              {p}
            </span>
          )
        )}
      </div>

      {/* Вперед */}
      <NavButton
        onClick={() => onChange(page + 1)}
        disabled={page === pageCount}
      >
        <ChevronRight size={14} />
      </NavButton>

      {/* Остання сторінка */}
      <NavButton
        onClick={() => onChange(pageCount)}
        disabled={page === pageCount}
      >
        <ChevronsRight size={14} />
      </NavButton>
    </div>
  );
}
