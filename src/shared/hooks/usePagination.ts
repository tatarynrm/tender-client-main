import { useState } from "react";

interface UsePaginationOptions {
  initialPage?: number;
}

export function usePagination({ initialPage = 1 }: UsePaginationOptions = {}) {
  const [page, setPage] = useState(initialPage);

  const next = (pageCount: number) => {
    setPage((p) => Math.min(p + 1, pageCount));
  };

  const prev = () => {
    setPage((p) => Math.max(p - 1, 1));
  };

  const goTo = (page: number) => {
    setPage(page);
  };

  const reset = () => {
    setPage(1);
  };

  return {
    page,
    setPage,
    next,
    prev,
    goTo,
    reset,
  };
}
