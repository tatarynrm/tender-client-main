// import { Button } from "@/shared/components/ui/button";

// interface PaginationProps {
//   page: number;
//   pageCount: number;
//   onChange: (page: number) => void;
// }

// export function Pagination({ page, pageCount, onChange }: PaginationProps) {
//   if (pageCount <= 1) return null;
//   console.log(page, "PAGE BTN");

//   return (
//     <div className="flex items-center justify-center gap-2 mt-6">
//       <Button
//         variant="outline"
//         disabled={page === 1}
//         onClick={() => onChange(page - 1)}
//       >
//         Назад
//       </Button>

//       <span className="text-sm text-muted-foreground">
//         {page} / {pageCount}
//       </span>

//       <Button
//         variant="outline"
//         disabled={page === pageCount}
//         onClick={() => onChange(page + 1)}
//       >
//         Вперед
//       </Button>
//     </div>
//   );
// }
import { Button } from "@/shared/components/ui/button";

interface PaginationProps {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  maxVisible?: number; // максимальна кількість видимих кнопок
}

export function Pagination({
  page,
  pageCount,
  onChange,
  maxVisible = 7, // за замовчуванням
}: PaginationProps) {
  if (pageCount <= 1) return null;

  // обчислюємо діапазон сторінок для відображення
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const half = Math.floor(maxVisible / 2);

    let start = Math.max(1, page - half);
    let end = Math.min(pageCount, page + half);

    // коригуємо якщо на початку або в кінці
    if (page <= half) end = Math.min(pageCount, maxVisible);
    if (page + half > pageCount)
      start = Math.max(1, pageCount - maxVisible + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // додаємо "..." якщо пропущені сторінки
    if (start > 2) pages.unshift("...");
    if (start > 1) pages.unshift(1);

    if (end < pageCount - 1) pages.push("...");
    if (end < pageCount) pages.push(pageCount);

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
      <Button
        variant="outline"
        disabled={page === 1}
        onClick={() => onChange(1)}
      >
        {"<<"}
      </Button>
      <Button
        variant="outline"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        Назад
      </Button>

      {pages.map((p, index) =>
        typeof p === "number" ? (
          <Button
            key={index}
            variant={p === page ? "default" : "outline"}
            onClick={() => onChange(p)}
          >
            {p}
          </Button>
        ) : (
          <span key={index} className="px-2">
            {p}
          </span>
        )
      )}

      <Button
        variant="outline"
        disabled={page === pageCount}
        onClick={() => onChange(page + 1)}
      >
        Вперед
      </Button>
      <Button
        variant="outline"
        disabled={page === pageCount}
        onClick={() => onChange(pageCount)}
      >
        {">>"}
      </Button>
    </div>
  );
}
